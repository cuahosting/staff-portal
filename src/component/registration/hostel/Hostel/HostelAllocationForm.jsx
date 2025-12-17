import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import Modal from "../../../common/modal/modal";
import ReportTable from "../../../common/table/ReportTable";
import { formatDateAndTime } from "../../../../resources/constants";
import { CommentsDisabledOutlined, RestaurantRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import SearchSelect from "../../../common/select/SearchSelect";

function HostelAllocationForm(props) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue } = useForm();
  const [readyToShow, setreadyToShow] = useState(false);
  const [entry_id, setentry_id] = useState("");
  const [StudentName, setStudentName] = useState("");
  const [id, setId] = useState("");
  const [floor, setFloor] = useState("");
  const [bedAndRoom, setBedandRoom] = useState({ bedID: "", roomID: "" });
  const [semester, setSemester] = useState("");
  const [hostelId, setHostelID] = useState("");
  const [readyToShow2, setreadyToShow2] = useState(false);
  const [hostelFloorList, setHostelFloorList] = useState([]);
  const [bedList, setbedList] = useState([]);
  const [studentSelectList, setStudentSelectList] = useState([]);
  const [gender, setgender] = useState("");
  let navigate = useNavigate();

  const getBedOnChange = async (e) => {
    setreadyToShow2(false);
    let val = e.target.value;
    let roomID = val.split("?")[0];
    let floor = val.split("?")[1];
    let hostelId = val.split("?")[2];
    setFloor(floor);
    setHostelID(hostelId);
    const { success, data } = await api.get(`staff/registration/hostels/hostel-bed/${roomID}/${floor}`);
    if (success && data?.data?.length > 0) { setbedList(data.data); setreadyToShow2(true); }
  };

  const getStudentList = async () => {
    const { success, data: result } = await api.get("student/student-report/student-list-active2");
    if (success && result?.length > 0) {
      const rows = result.map((item) => ({ value: `${item.StudentID}?${item.Gender}?${item.StudentName}`, label: `${item.StudentName} (${item.StudentID})` }));
      setStudentSelectList(rows);
    }
  };

  const getHostelFor = async (e) => {
    setreadyToShow(false);
    let val = e.target.value;
    setId(val.split("?")[0]);
    setStudentName(val.split("?")[2]);
    let gender = val.split("?")[1];
    const { success, data } = await api.get(`staff/registration/hostels/hostel-rooms/${gender}`);
    if (success && data?.data?.length > 0) { setHostelFloorList(data.data); setreadyToShow(true); setgender(gender); setId(val.split("?")[0]); }
  };

  const clearItems = () => { setreadyToShow(false); setreadyToShow2(false); setValue("student", ""); setValue("floor", ""); setValue("bed", ""); setValue("semester", ""); };

  const allocateBed = async (e) => {
    e.preventDefault();
    if (entry_id === "") {
      const dataTo = { studentId: id, semester: semester, hostelid: hostelId, bedid: bedAndRoom.bedID, roomid: bedAndRoom.roomID, insertedBy: props.loginData.StaffID };
      const { success, data } = await api.post("staff/registration/hostels/allocate-bed", dataTo);
      if (success && data?.message === "success") { toast.success("Bed Allocated Successfully"); navigate(-1); }
      else if (success) { toast.error("An error has occurred. Please try again!"); }
    }
  };

  useEffect(() => { getStudentList(); }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Hostel Allocation Form"} items={["Registraion", "Hostel", "Hostel Allocation Form"]} />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-header border-0 pt-6"><div className="card-title" /><div className="card-toolbar"><div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base"></div></div></div>
          <div className="card-body p-0">
            <div>
              <div className="form-gdroup">
                <label htmlFor="hostelFor">Select Student</label><br /><h3>{StudentName} {id}</h3>
                <SearchSelect id="StudentID" label="Select Student" value={studentSelectList.find(s => s.value === id + "?" + gender + "?" + StudentName) || null} options={studentSelectList} onChange={(selected) => { getHostelFor({ target: { value: selected?.value || '' }, preventDefault: () => { } }); }} placeholder="Search Student" />
              </div>
              {readyToShow && (
                <div className="form-group pt-5">
                  <SearchSelect id="hostelFor" label={`Hostel for ${gender} students`} value={hostelFloorList.map(h => ({ value: `${h.EntryID}?${h.FloorName}?${h.HostelID}`, label: `${h.HostelName} (${h.FloorName} Floor)` })).find(h => h.value.includes(hostelId))} options={hostelFloorList.map((item) => ({ value: `${item.EntryID}?${item.FloorName}?${item.HostelID}`, label: `${item.HostelName} (${item.FloorName} Floor) ` }))} onChange={(selected) => getBedOnChange({ target: { value: selected?.value || '' } })} placeholder="Select Hostel" required />
                </div>
              )}
              {readyToShow2 && (
                <div className="form-group pt-5">
                  <SearchSelect id="bedSelection" label="Select Bed" value={bedList.map(b => ({ value: `${b.EntryID}?${b.RoomID}?${b.RoomNo}?${b.BedNo}`, label: b.RoomBed })).find(b => b.value.includes(bedAndRoom.bedID))} options={bedList.map((item) => ({ value: `${item.EntryID}?${item.RoomID}?${item.RoomNo}?${item.BedNo}`, label: `${item.RoomBed}` }))} onChange={(selected) => { if (selected) { setBedandRoom({ bedID: selected.value.split("?")[0], roomID: selected.value.split("?")[1] }); } }} placeholder="Select Bed" required />
                </div>
              )}
              <div className="form-group pt-5"><button onClick={allocateBed} className="btn btn-primary w-100">Allocate</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(HostelAllocationForm);
