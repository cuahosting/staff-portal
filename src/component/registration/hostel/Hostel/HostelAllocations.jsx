import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import Modal from "../../../common/modal/modal";
import { Link } from 'react-router-dom';
import ReportTable from "../../../common/table/ReportTable";
import { formatDateAndTime } from "../../../../resources/constants";
import { CommentsDisabledOutlined, ConnectingAirportsOutlined } from "@mui/icons-material";
import SearchSelect from "../../../common/select/SearchSelect";
import { useForm } from "react-hook-form";

function HostelAllocations(props) {
  const { register, handleSubmit, setValue, watch } = useForm();
  const { register: register2, handleSubmit: handleSubmit2, setValue: setValue2, watch: watch2 } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [readyToShow, setreadyToShow] = useState(false);
  const [readyToShow2, setreadyToShow2] = useState(false);
  const [readyToShow3, setreadyToShow3] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [studentSelectList, setStudentSelectList] = useState([]);
  const [hostelFloorList, setHostelFloorList] = useState([]);
  const [hostelFloorList2, setHostelFloorList2] = useState([]);
  const [bedList, setbedList] = useState([]);
  const [entryIdForRelocation, setEntryIdForRelocation] = useState([]);
  const [bedList2, setbedList2] = useState([]);
  const [gender, setgender] = useState("");
  const [hostelAllocationLists, sethostelAllocationLists] = useState([]);
  const [hostelAllocationTracker, sethostelAllocationTracker] = useState([]);
  const [entry_id, setentry_id] = useState("");
  const columns = ["ID", "Name", "Phone", "Hostel Name", "Hostel For", "Floor", "Room", "Applied On", "Status", "Action"];
  const columns2 = ["Action", "Action By", "Action Date"];
  const [semester, setSemester] = useState({ code: "", desc: "" });

  const handleChange = async (e) => { setSemester({ ...semester, [e.target.id]: e.target.value }); getRoomAllocations(e.target.value); };

  const getStudentList2 = async () => {
    const { success, data: result } = await api.get("staff/student-manager/student/active");
    if (success && result?.length > 0) {
      const rows = result.map(item => ({ value: `${item.StudentID}?${item.Gender}?${item.FirstName} ${item.MiddleName} ${item.Surname}`, label: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})` }));
      setStudentSelectList(rows);
    }
  };

  const TakeDecision = async (decision, allocationId) => {
    const dataTo = { status: decision, id: allocationId, insertedBy: props.loginData.StaffID };
    const { success, data } = await api.post("staff/registration/hostels/allocation-decision", dataTo);
    if (success && data?.message === "success") { toast.success("Application was " + decision); getRoomAllocations(); }
    else if (success) { toast.error("An error has occurred. Please try again!"); }
  };

  const getSemesters = async () => {
    const { success, data } = await api.get("registration/registration-report/semester-list/");
    if (success && data) setSemesterList(data);
  };

  const getAllocationTracker = async (id) => {
    const { success, data } = await api.get(`staff/registration/hostels/allocation-tracker/${id}`);
    if (success && data?.message === "success" && data.data?.length > 0) {
      const rows = data.data.map((item, index) => [item.Action, item.StaffName, item.InsertedDate]);
      sethostelAllocationTracker(rows);
    }
  };

  const getRoomAllocations = async (sem) => {
    const { success, data } = await api.get(`staff/registration/hostels/hostel-allocations/${sem}`);
    if (success && data?.message === "success" && data.data?.length > 0) {
      const rows = data.data.map((item, index) => {
        let status;
        if (item.Status === "Approve") status = <span className="badge badge-success">Approved</span>;
        else if (item.Status === "Reject") status = <span className="badge badge-danger">Rejected</span>;
        else if (item.Status === "Relocated") status = <span className="badge badge-success">Relocated</span>;
        else status = <span className="badge badge-primary">Applied</span>;
        return [item.StudentID, item.StudentName, item.PhoneNumber, item.HostelName, item.Gender, item.FloorName, item.RoomBed, formatDateAndTime(item.InsertedDate, "date_and_time"), status,
        <>
          <button type="button" id="ApproveBtn" data-toggle="tooltip" data-placement="right" title="Approve" onClick={() => { if (item.Status !== "Approve") TakeDecision("Approve", item.EntryID); }} className="btn btn-sm btn-success "><i className={"fa fa-check"} /></button>
          <button type="button" data-toggle="tooltip" data-placement="right" title="Relocate" data-bs-toggle="modal" data-bs-target="#RelocateStudentForm" onClick={() => { setreadyToShow3(false); setValue2("relocationStudentName", item.StudentName); setValue2("relocationStudentID", item.StudentID); setValue2("relocationRoomBed", item.RoomBed); setValue2("floor2", ""); setEntryIdForRelocation(item.EntryID); getHostelFor2(item.Gender); }} className="btn btn-sm btn-warning "><i className={"fa fa-car"} /></button>
          <button style={{ marginLeft: "2px" }} type="button" id="RejectBtn" data-toggle="tooltip" onClick={() => { if (item.Status !== "Reject") TakeDecision("Reject", item.EntryID); }} data-placement="right" title="Reject" className="btn btn-sm btn-danger "><i className={"fa fa-times"} /></button>
          <button style={{ marginLeft: "2px" }} type="button" data-bs-toggle="modal" data-bs-target="#allocationTrackerForm" data-toggle="tooltip" onClick={() => getAllocationTracker(item.EntryID)} data-placement="right" title="View Progress" className="btn btn-sm btn-primary "><i className={"fa fa-eye"} /></button>
        </>];
      });
      sethostelAllocationLists(rows);
    } else { sethostelAllocationLists([]); }
  };

  const clearItems = () => { setreadyToShow(false); setreadyToShow2(false); setValue("student", ""); setValue("floor", ""); setValue("bed", ""); setValue("semester", ""); };

  const allocateBed = async (data) => {
    if (data.student === "") { toast.error("Please select Student"); return false; }
    if (data.floor === "") { toast.error("Please Select Floor"); return false; }
    if (data.bed === "") { toast.error("Please Select Bed"); return false; }
    if (data.semester === "") { toast.error("Please select Semester"); return false; }
    if (entry_id === "") {
      const dataTo = { studentId: data.student.split("?")[0], semester: data.semester, hostelid: data.floor.split("?")[2], bedid: data.bed.split("?")[0], roomid: data.bed.split("?")[1], insertedBy: props.loginData.StaffID };
      const { success, data: result } = await api.post("staff/registration/hostels/allocate-bed", dataTo);
      if (success && result?.message === "success") { toast.success("Bed Allocated Successfully"); document.getElementById("closeModal").click(); clearItems(); getRoomAllocations(); }
      else if (success) { toast.error("An error has occurred. Please try again!"); }
    }
  };

  const relocateStudent = async (data) => {
    if (data.floor2 === "") { toast.error("Please Specify Hostel"); return false; }
    let val = data.roombed2; let val2 = data.floor2;
    let roomNum = val.split("?")[1]; let bedNum = val.split("?")[0]; let hostelID = val2.split("?")[2];
    if (data.roombed2.split("?")[2] + "==>" + data.roombed2.split("?")[3] === data.relocationRoomBed) { toast.error("Please Specify Different Room and/or Bed"); return false; }
    const dataTo = { roomNum: roomNum, id: entryIdForRelocation, hostelID: hostelID, bedNum: bedNum, insertedBy: props.loginData.StaffID };
    const { success, data: result } = await api.post("staff/registration/hostels/relocation", dataTo);
    if (success && result?.message === "success") { toast.success("Student was Relocated"); document.getElementById("RelocateStudentForm").click(); getRoomAllocations(); }
    else if (success) { toast.error("An error has occurred. Please try again!"); }
  };

  const getHostelFor = async (e) => {
    setreadyToShow(false); let val = e.target.value; let gender = val.split("?")[1];
    const { success, data } = await api.get(`staff/registration/hostels/hostel-rooms/${gender}`);
    if (success && data?.data?.length > 0) { setHostelFloorList(data.data); setreadyToShow(true); setgender(gender); }
  };

  const getHostelFor2 = async (gender) => {
    const { success, data } = await api.get(`staff/registration/hostels/hostel-rooms/${gender}`);
    if (success && data?.data?.length > 0) { setHostelFloorList2(data.data); setgender(gender); }
  };

  const getBedOnChange = async (e) => {
    setreadyToShow2(false); let val = e.target.value; let roomID = val.split("?")[0]; let floor = val.split("?")[1];
    const { success, data } = await api.get(`staff/registration/hostels/hostel-bed/${roomID}/${floor}`);
    if (success && data?.data?.length > 0) { setbedList(data.data); setreadyToShow2(true); }
  };

  const getBedOnChange2 = async (e) => {
    setreadyToShow3(false); setValue2("roombed2", ""); let val = e.target.value; let roomID = val.split("?")[0]; let floor = val.split("?")[1];
    const { success, data } = await api.get(`staff/registration/hostels/hostel-bed/${roomID}/${floor}`);
    if (success && data?.data?.length > 0) { setbedList2(data.data); setreadyToShow3(true); }
  };

  useEffect(() => { getSemesters(); getStudentList2(); }, []);

  return isLoading ? (<Loader />) : (
    <>
      <div className="modal fade" id="allocationTrackerForm" tabIndex="-1" aria-labelledby="bedForm" aria-hidden="true">
        <div className="modal-dialog"><div className="modal-content"><div className="modal-header"><h5 className="modal-title" id="bedForm"></h5><button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div className="modal-body"><ReportTable height={"200px"} columns={columns2} data={hostelAllocationTracker} /></div></div></div>
      </div>
      <div className="modal fade" id="RelocateStudentForm" tabIndex="-1" aria-labelledby="bedForm" aria-hidden="true">
        <div className="modal-dialog modal-xl"><div className="modal-content"><div className="modal-header"><h5 className="modal-title" id="bedForm">Relocation Form</h5><button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
          <div className="modal-body">
            <form onSubmit={handleSubmit2(relocateStudent)} noValidate>
              <div className="form-group">
                <div className="row g-3">
                  <div className="col-sm-6"><label htmlFor="hostelId">Student ID.</label><input id="hostelFor" disabled {...register2("relocationStudentID")} className="form-control" /></div>
                  <div className="col-sm-4"><label htmlFor="hostelId">Student Name.</label><input id="hostelFor" disabled {...register2("relocationStudentName")} className="form-control" /></div>
                  <div className="col-sm-2"><label htmlFor="hostelId">Room/Bed</label><input id="hostelFor" disabled {...register2("relocationRoomBed")} className="form-control" /></div>
                </div>
                <div className="form-group pt-5">
                  <label htmlFor="hostelFor">Hostel for {`${gender}`} students</label>
                  <SearchSelect id="floor2" label={`Hostel for ${gender} students`} value={hostelFloorList2.map((item) => ({ value: `${item.EntryID}?${item.FloorName}?${item.HostelID}`, label: `${item.HostelName} (${item.FloorName} Floor) ` })).find(op => op.value === watch2("floor2")) || null} options={hostelFloorList2.map((item) => ({ value: `${item.EntryID}?${item.FloorName}?${item.HostelID}`, label: `${item.HostelName} (${item.FloorName} Floor) ` }))} onChange={(selected) => { setValue2("floor2", selected?.value); getBedOnChange2({ target: { value: selected?.value || '' } }); }} placeholder="Select Hostel" required />
                </div>
                {readyToShow3 && (<div className="form-group pt-5"><label htmlFor="hostelFor">Select Bed</label><SearchSelect id="roombed2" label="Select Bed" value={bedList2.map((item) => ({ value: `${item.EntryID}?${item.RoomID}?${item.RoomNo}?${item.BedNo}`, label: `${item.RoomBed}` })).find(op => op.value === watch2("roombed2")) || null} options={bedList2.map((item) => ({ value: `${item.EntryID}?${item.RoomID}?${item.RoomNo}?${item.BedNo}`, label: `${item.RoomBed}` }))} onChange={(selected) => setValue2("roombed2", selected?.value)} placeholder="Select Bed" required /></div>)}
              </div>
              <div className="form-group pt-5"><button className="btn btn-primary w-100">Relocate Student</button></div>
            </form>
          </div>
        </div></div>
      </div>
      <div className="d-flex flex-column flex-row-fluid">
        <PageHeader title={"Hostel Allocations"} items={["Registraion", "Hostel", "Hostel Allocations"]} />
        <div className="flex-column-fluid">
          <div className="card">
            <div className="col-md-12 fv-row pt-10">
              <label className="required fs-6 fw-bold mb-2">Select Semester</label>
              <SearchSelect id="code" label="Select Semester" value={semesterList.map((s) => ({ value: s.SemesterCode, label: s.Description })).find(op => op.value === semester.code) || null} options={semesterList.map((s) => ({ value: s.SemesterCode, label: s.Description }))} onChange={(selected) => handleChange({ target: { id: 'code', value: selected?.value || '' } })} placeholder="Select Semester" required />
            </div>
            <div className="card-header border-0 pt-6"><div className="card-title" /><div className="card-toolbar"><div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base"><Link to="/registration/hostel/hostel-allocation-form"><button type="button" className="btn btn-primary">Allocate Hostel</button></Link></div></div></div>
            <div className="card-body p-0"><h3>Hostel Applications</h3><ReportTable columns={columns} data={hostelAllocationLists} /></div>
          </div>
          <Modal title={"Hostel Allocation Form"}>
            <form onSubmit={handleSubmit(allocateBed)} noValidate>
              <div className="form-group"><label htmlFor="hostelFor">Select Student</label><SearchSelect id="StudentID" label="Select Student" value={studentSelectList.find(s => s.value === watch("student")) || null} options={studentSelectList} onChange={(selected) => { setValue("student", selected?.value); getHostelFor({ target: { value: selected?.value || '' } }); }} placeholder="Search Student" /></div>
              {readyToShow && (<div className="form-group"><label htmlFor="hostelFor">Hostel Floor for {`${gender}`} students</label><SearchSelect id="floor" label={`Hostel Floor for ${gender} students`} value={hostelFloorList.map((item) => ({ value: `${item.EntryID}?${item.FloorName}?${item.HostelID}`, label: `${item.FloorName}` })).find(op => op.value === watch("floor")) || null} options={hostelFloorList.map((item) => ({ value: `${item.EntryID}?${item.FloorName}?${item.HostelID}`, label: `${item.FloorName}` }))} onChange={(selected) => { setValue("floor", selected?.value); getBedOnChange({ target: { value: selected?.value || '' } }); }} placeholder="Select Floor" required /></div>)}
              {readyToShow2 && (<><div className="form-group"><label htmlFor="hostelFor">Select Bed</label><SearchSelect id="bed" label="Select Bed" value={bedList.map((item) => ({ value: `${item.EntryID}?${item.RoomID}?${item.RoomNo}?${item.BedNo}`, label: `${item.RoomBed}` })).find(op => op.value === watch("bed")) || null} options={bedList.map((item) => ({ value: `${item.EntryID}?${item.RoomID}?${item.RoomNo}?${item.BedNo}`, label: `${item.RoomBed}` }))} onChange={(selected) => setValue("bed", selected?.value)} placeholder="Select Bed" required /></div><div className="form-group"><label htmlFor="hostelFor">Semester</label><SearchSelect id="semester" label="Semester" value={[{ value: "First", label: "First Semester" }, { value: "Second", label: "Second Semester" }].find(op => op.value === watch("semester")) || null} options={[{ value: "First", label: "First Semester" }, { value: "Second", label: "Second Semester" }]} onChange={(selected) => setValue("semester", selected?.value)} placeholder="Select Semester" required /></div></>)}
              <div className="form-group pt-2"><button className="btn btn-primary w-100">Allocate</button></div>
            </form>
          </Modal>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(HostelAllocations);
