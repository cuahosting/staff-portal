import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { connect } from "react-redux";
import PageHeader from "../../common/pageheader/pageheader";
import { showAlert, showConfirm } from "../../common/sweetalert/sweetalert";
import AGTable from "../../common/table/AGTable";
import SearchSelect from "../../common/select/SearchSelect";

function DeanApproval(props) {
  const [moduleData, setModuleData] = useState({ moduleCode: "", insertedBy: props.login[0].StaffID, insertedOn: new Date().toISOString().slice(0, 19).replace("T", " ") });
  const [courseList, setCourseList] = useState([]);
  const [allSemester, setAllSemester] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [allModulesByCourse, setAllModulesByCourse] = useState([]);
  const [courseCode, setCourseCode] = useState({ courseCode: "", courseCode2: "", schoolSemester: "", schoolSemester2: "" });
  const [moduleList, setModuleList] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [errors, setErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [datatable, setDatatable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Action", field: "Action" }, { label: "Module Code", field: "code" }, { label: "Module Name", field: "module" }, { label: "Level", field: "level" }, { label: "Semester", field: "semester" }, { label: "School Semester", field: "schoolSemester" }, { label: "Staff Name", field: "staffName" }, { label: "Module Type", field: "moduleType" }, { label: "Status", field: "Status" }], rows: [] });

  useEffect(() => {
    const fetchData = async () => {
      const [courseRes, semRes] = await Promise.all([
        api.get(`staff/academics/timetable-planner-2/dean-course-list/${props.login[0].StaffID}`),
        api.get("staff/timetable/timetable/semester")
      ]);
      if (courseRes.success && courseRes.data?.length > 0) { let rows = []; courseRes.data.forEach((row) => { rows.push({ value: row.CourseCode, label: row.CourseName }); }); setCourseOptions(rows); setCourseList(courseRes.data); }
      if (semRes.success && semRes.data?.length > 0) { let rows = []; semRes.data.forEach((row) => { rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode }); }); setAllSemester(semRes.data); setSemesterOptions(rows); }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e) => { setCourseCode({ ...courseCode, [e.target.id]: e.target.value }); };
  const onCourseChange = (e) => { if (!e) return; setCourseCode({ ...courseCode, courseCode: e.value, courseCode2: e }); };
  const onSemesterChange = (e) => { if (!e) return; setCourseCode({ ...courseCode, schoolSemester: e.value, schoolSemester2: e }); };

  const handleSubmit = async (e = '') => {
    if (e !== '') { e.preventDefault(); }
    setIsLoading(true);
    const { success, data } = await api.post("staff/academics/timetable-planner/final-submission-list", { course: courseCode.courseCode, semester: courseCode.schoolSemester });
    if (success && data?.length > 0) {
      setErrors(null); setModuleList(data); setAllModulesByCourse(data);
      let rows = [];
      data.forEach((module, index) => { const l1 = module.Lecturers.split(" ,")[0] === "No Name" ? "--" : module.Lecturers.split(" ,")[0]; const l2 = module.Lecturers.split(" ,")[1] === "No Name" ? "--" : module.Lecturers.split(" ,")[1]; const l3 = module.Lecturers.split(" ,")[2] === "No Name" ? "--" : module.Lecturers.split(" ,")[2]; rows.push({ sn: index + 1, Action: <button className="btn btn-link p-0 text-primary" style={{ fontSize: '22px' }} title="Edit" onClick={() => { onApproveSingle(module); }}><i className="fa fa-arrow-right" /></button>, code: module.ModuleCode, module: module.ModuleName, level: module.ModuleLevel, semester: module.ModuleSemester, schoolSemester: module.SchoolSemester, staffName: l1 + " ," + l2 + " ," + l3, moduleType: module.ModuleType, Status: module.Status === 0 ? <span className="badge badge-secondary">Not Approved</span> : module.Status === 1 ? <span className="badge badge-info">Approved by HOD</span> : <span className="badge badge-success">Approved by Dean</span> }); });
      setDatatable({ ...datatable, rows: rows });
    } else { setErrors("Modules have not been assign to this course yet"); setDatatable({ ...datatable, rows: [] }); }
    setIsLoading(false);
  };

  const handleFinalSubmission = async () => {
    showConfirm("warning", "Are you sure you want to approve courses", "warning").then(async (isConfirmed) => {
      if (isConfirmed) { const { success, data } = await api.patch("staff/academics/timetable-planner/approve-module-submission-by-dean/", allModulesByCourse); if (success && data?.message === "success") { handleSubmit(); toast.success("Successfully done final approval"); } else { toast.error("Unable to do final approval"); } }
    });
  };

  const onApproveSingle = (_module) => {
    showConfirm("Warning", "Are you sure you want to submit course for approval?", "warning").then(async (isconfirmed) => {
      if (isconfirmed) { const { success, data } = await api.patch("staff/academics/timetable-planner/approve-single-module-submission-by-dean/", _module); if (success && data?.message === "success") { handleSubmit(); toast.success("Successfully done final approval"); } else { toast.error("Unable to do final approval"); } }
    });
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Dean Approval"} items={["Academics", "Timetable Planner", "Dean Approval"]} />
      <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-header border-0 pt-6"><div className="card-title" /><div className="card-toolbar"><div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base"></div></div></div><div className="card-body p-0"><div className="col-md-12"><div className="row"><form onSubmit={handleSubmit}><div className="row fv-row"><div className="col-md-4 fv-row mb-6 enhanced-form-group"><SearchSelect id="courseCode" label="Select Programme/Course" value={courseCode.courseCode2} onChange={onCourseChange} options={courseOptions} placeholder="Select a programme/Course" required /></div><div className="col-md-4 fv-row mb-6 enhanced-form-group"><SearchSelect id="schoolSemester" label="Select School Semester" value={courseCode.schoolSemester2} onChange={onSemesterChange} options={semesterOptions} placeholder="select Semester" required /></div><div className="col-md-4"><div className="row"><button type="submit" className="btn btn-primary mt-8">View Modules</button></div></div></div></form></div></div>{moduleList.length > 0 && (<div className="col-12 mt-9"><div className="card-body p-0"><div className="row"><div className="col-md-12"><h2>All Modules</h2><AGTable data={datatable} /><div className="d-flex justify-content-end mt-5" data-kt-customer-table-toolbar="base"><button className="btn btn-primary" onClick={() => handleFinalSubmission()}>Final Approval by Dean</button></div></div></div></div></div>)}{errors && (<div className="alert alert-danger d-flex align-items-center mt-5 p-5"><div className="d-flex flex-column"><span>{errors}</span></div></div>)}</div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(DeanApproval);
