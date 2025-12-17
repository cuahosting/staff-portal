import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux/es/exports";
import SearchSelect from "../../common/select/SearchSelect";
import AGReportTable from "../../common/table/AGReportTable";

function LecturerAssignment(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [staff, setStaff] = useState({ StaffId: "", StaffName: "" });
  const [modules, setModules] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [selectedModule, setSelectedModule] = useState({ EntryID: "", ModuleCode: "", ModuleName: "", ModuleLevel: "", ModuleSemester: "", ModuleType: "", SchoolSemester: "", MainLecturer: "", AlternateLecturer: "", AlternateLecturer2: "", _Semester: "", _Semester2: "" });
  const columns = ["ModuleCode", "Action", "ModuleName", "ModuleLevel", "ModuleSemester", "ModuleType", "SchoolSemester", "MainLecturer", "AlternateLecturer", "AlternateLecturer2"];
  const [data, setData] = useState([]);
  const [semesterList, setSemesterList] = useState([]);

  const geSemesters = async () => {
    const { success, data } = await api.get("staff/timetable/timetable/semester");
    if (success && data?.length > 0) { let rows = []; data.forEach((row) => { rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode }); }); setSemesterList(data); setSemesterOptions(rows); }
    setIsLoading(false);
  };

  const getData = async (e) => {
    toast.info('please wait...');
    const [staffRes, modRes] = await Promise.all([
      api.get("staff/academics/timetable-planner/staff/list"),
      api.get(`staff/academics/timetable-planner/module-assignment/officer-modules/${props.LoginDetails[0].StaffID}/${e}`)
    ]);
    if (staffRes.success && staffRes.data?.length > 0) { let rows_ = []; staffRes.data.forEach((row) => { rows_.push({ value: row.StaffID, label: row.FirstName + " " + row.MiddleName + "" + row.Surname }); }); setStaffList(rows_); setStaff(rows_); }
    if (modRes.success && modRes.data?.length > 0) {
      let rows = [];
      modRes.data.forEach((item) => { rows.push([item.ModuleCode, <button className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#lecturer" onClick={() => { setSelectedModule({ ...selectedModule, EntryID: item.EntryID, ModuleCode: item.ModuleCode, ModuleName: item.ModuleName, ModuleLevel: item.ModuleLevel, ModuleSemester: item.ModuleSemester, ModuleType: item.ModuleType, SchoolSemester: item.SchoolSemester, MainLecturer: { value: item.MainLecturer, label: item.MainLecturerName }, AlternateLecturer: { value: item.AlternateLecturer, label: item.AlternateLecturerName }, AlternateLecturer2: { value: item.AlternateLecturer2, label: item.AlternateLecturer2Name }, action: "update" }); }}><i style={{ fontSize: '15px', color: "blue" }} className="fa fa-pen color-blue" /></button>, item.ModuleName, item.ModuleLevel, item.ModuleSemester, item.ModuleType, item.SchoolSemester, item.MainLecturerName, item.AlternateLecturerName, item.AlternateLecturer2Name]); });
      setData(rows); setModules(rows);
    } else { toast.error('no record'); setData([]); }
    setIsLoading(false);
  };

  useEffect(() => { geSemesters(); }, []);

  const onSemesterChange = async (e) => { if (e.value !== "") { getData(e.value); setSelectedModule({ ...selectedModule, _Semester: e.value, _Semester2: e }); } else { setSelectedModule({ ...selectedModule, _Semester: "", _Semester2: "" }); setData([]); } };

  const handleAssignStaff = async (e) => {
    e.preventDefault();
    const senData = { EntryID: selectedModule.EntryID, ModuleCode: selectedModule.ModuleCode, ModuleName: selectedModule.ModuleName, ModuleLevel: selectedModule.ModuleLevel, ModuleSemester: selectedModule.ModuleSemester, ModuleType: selectedModule.ModuleType, SchoolSemester: selectedModule.SchoolSemester, MainLecturer: selectedModule.MainLecturer.value, AlternateLecturer: selectedModule.AlternateLecturer.value, AlternateLecturer2: selectedModule.AlternateLecturer2.value };
    const { success, data } = await api.patch("staff/academics/timetable-planner/module-assignment/assign-lecturers", senData);
    if (success && data?.message === "success") { getData(selectedModule.SchoolSemester); toast.success("Staff added to the module successfully"); document.getElementById("closeModal").click(); } else { toast.error("try again..."); }
  };

  const onMainLecturerChange = (e) => { setSelectedModule({ ...selectedModule, MainLecturer: e }); };
  const onAltLecturer1Change = (e) => { setSelectedModule({ ...selectedModule, AlternateLecturer: e }); };
  const onAltLecturer2Change = (e) => { setSelectedModule({ ...selectedModule, AlternateLecturer2: e }); };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Lecturer Assignment"} items={["Academics", "Timetable Planner", "Lecturer Assignment"]} />
      <div className="flex-column-fluid">
        <div className="col-md-12">{semesterList.length > 0 && <div className="fv-row mb-6 enhanced-form-group"><label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="_Semester">Select Semester</label><SearchSelect id="_Semester" value={selectedModule._Semester2} onChange={onSemesterChange} options={semesterOptions} placeholder="select Semester" /></div>}</div>
        {data.length > 0 && <AGReportTable columns={columns} data={data} title={"Modules to Lecturer Assignment"} />}
        <Modal title={selectedModule.ModuleCode} id={"lecturer"} close={"lecturer"}><div className="col-md-12"><form onSubmit={handleAssignStaff}><div className="row"><div className="col-md-12"><label className="fs-6 fw-bold mb-2">{selectedModule.ModuleCode}: {selectedModule.ModuleName}</label><br /><label className="fs-6 fw-bold mb-2">{selectedModule.SchoolSemester}</label><br /><label className="fs-6 fw-bold mb-2">{selectedModule.ModuleSemester} Semester</label><br /><label className="fs-6 fw-bold mb-2">{selectedModule.ModuleType}</label></div>{staffList.length > 0 && <><div className="col-md-12"><SearchSelect id="MainLecturer" label="Main Lecturer" value={selectedModule.MainLecturer} onChange={onMainLecturerChange} options={staff} placeholder="Select Main Lecturer" required /></div><div className="col-md-12"><SearchSelect id="AlternateLecturer" label="Supporting Lecturer 1" value={selectedModule.AlternateLecturer} onChange={onAltLecturer1Change} options={staff} placeholder="Select Supporting Lecturer" required /></div><div className="col-md-12"><SearchSelect id="AlternateLecturer2" label="Supporting Lecturer 2" value={selectedModule.AlternateLecturer2} onChange={onAltLecturer2Change} options={staff} placeholder="Select Supporting Lecturer" required /></div></>}<div className="col-md-3"><div className="row"><button type="submit" className="btn btn-primary mt-8">Submit</button></div></div></div></form></div></Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails }; };
export default connect(mapStateToProps, null)(LecturerAssignment);
