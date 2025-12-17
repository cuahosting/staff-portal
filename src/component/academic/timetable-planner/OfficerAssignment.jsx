import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { showAlert, showConfirm } from "../../common/sweetalert/sweetalert";
import { connect } from "react-redux";
import AGTable from "../../common/table/AGTable";
import SearchSelect from "../../common/select/SearchSelect";

function OfficerAssignment(props) {
  const [staffList, setStaffList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [item, setItem] = useState({ StaffID: "", StaffName: "", CourseCode: "" });
  const [data, setData] = useState({ staffID: "", courseCode: "", insertedBy: props.login[0].StaffID });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [officerData, setOfficerData] = useState([]);
  const [datatable, setDatatable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "", field: "action" }, { label: "StaffID", field: "staffID" }, { label: "Staff Name", field: "staffName" }, { label: "Course Code", field: "courseCode" }, { label: "Course Name", field: "courseName" }], rows: [] });

  useEffect(() => {
    const fetchData = async () => {
      const [staffRes, courseRes] = await Promise.all([
        api.get("staff/academics/timetable-planner/staff/list"),
        api.get("staff/academics/timetable-planner/course/list")
      ]);
      if (staffRes.success && staffRes.data?.length > 0) { let rows = []; staffRes.data.forEach((row) => { rows.push({ value: row.StaffID, label: row.FirstName + " " + row.MiddleName + " " + row.Surname }); }); setStaffList(rows); }
      if (courseRes.success && courseRes.data?.length > 0) { let rows = []; courseRes.data.forEach((row) => { rows.push({ value: row.CourseCode, label: row.CourseName }); }); setCourseList(rows); }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const getOfficers = async () => {
    const { success, data: res } = await api.get("staff/academics/timetable-planner/officer/list");
    if (success && res?.length > 0) {
      setOfficerData(res);
      let rows = [];
      res.forEach((course, index) => { rows.push({ sn: index + 1, action: (<button onClick={() => handleDelete(course.EntryID)} className="btn btn-link p-0 text-danger" title="Delete"><i style={{ fontSize: '15px', color: "red" }} className="fa fa-trash" /></button>), staffID: course.StaffID, staffName: course.StaffName, courseCode: course.CourseCode, courseName: course.CourseName }); });
      setDatatable({ ...datatable, rows: rows });
    } else { setDatatable({ ...datatable, rows: [] }); }
    setIsLoading(false);
  };

  useEffect(() => { getOfficers(); }, []);

  const handleChange = (e) => { setData({ ...data, [e.target.id]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success, data: res } = await api.post("staff/academics/timetable-planner/officer-assignment/", data);
    if (success && res?.message === "success") { getOfficers(); toast.success("Course Assign successfully"); } else { toast.warn("This course has already been assigned to this staff"); }
  };

  const handleDelete = async (EntryID) => {
    showConfirm("warning", "Are you sure?", "warning").then(async (confirm) => {
      if (confirm) {
        const { success, data: res } = await api.delete(`staff/academics/timetable-planner/officer-assignment/${EntryID}`);
        if (success && res?.message === "success") { getOfficers(); toast.error("Deleted successfully"); } else { toast.warn("Staff already deleted"); }
        setIsLoading(false);
      }
    });
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Officer Assignment"} items={["Academics", "Timetable Planner", "Officer Assignment"]} />
      <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-header border-0 pt-6"><div className="card-title" /><div className="card-toolbar"><div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base"></div></div></div><div className="card-body p-0"><div className="col-md-12"><div className="row"><form onSubmit={handleSubmit}><div className="row fv-row"><div className="col-md-4"><SearchSelect id="courseCode" label="Select Programme/Course" value={courseList.find(c => c.value === data.courseCode) || null} options={courseList} onChange={(selected) => { handleChange({ target: { id: 'courseCode', value: selected?.value || '' }, preventDefault: () => { } }); }} placeholder="Search Course" required /></div><div className="col-md-4"><SearchSelect id="staffID" label="Select Staff" value={staffList.find(s => s.value === data.staffID) || null} options={staffList} onChange={(selected) => { handleChange({ target: { id: 'staffID', value: selected?.value || '' }, preventDefault: () => { } }); }} placeholder="Search staff" required /></div><div className="col-md-4"><div className="row"><button type="submit" className="btn btn-primary mt-8">Assign</button></div></div></div></form></div></div>{officerData.length > 0 && (<div className="col-12 mt-9"><div className="card-body p-0"><div className="row"><div className="col-md-12"><h2>Staff Assigned to Course</h2><AGTable data={datatable} /></div></div></div></div>)}</div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(OfficerAssignment);
