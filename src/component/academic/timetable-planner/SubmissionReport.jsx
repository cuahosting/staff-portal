import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { connect } from "react-redux";
import PageHeader from "../../common/pageheader/pageheader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import AGTable from "../../common/table/AGTable";
import SearchSelect from "../../common/select/SearchSelect";

function SubmissionReport(props) {
  const [allSemester, setAllSemester] = useState([]);
  const [semester, setSemester] = useState({ schoolSemester: "" });
  const [showData, setShowData] = useState(false);
  const [errors, setErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [datatable, setDatatable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Course Name", field: "course" }, { label: "Submission Status", field: "status" }], rows: [] });

  useEffect(() => {
    const fetchData = async () => {
      const { success, data } = await api.get("staff/timetable/timetable/semester");
      if (success) { setAllSemester(data || []); }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e) => { setSemester({ ...semester, [e.target.id]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { success, data } = await api.get(`staff/academics/timetable-planner/submission-report/${semester.schoolSemester}`);
    if (success && data?.length > 0) {
      setShowData(true); setErrors(null);
      let rows = [];
      data.forEach((course, index) => { rows.push({ sn: index + 1, course: course.CourseName, status: course.Status.toString() === "1" ? "Submitted by HOD" : course.Status.toString() === "2" ? "Approved by Dean" : "Not submitted" }); });
      setDatatable({ ...datatable, rows: rows });
    } else { setErrors("Report not available for this semester yet"); setDatatable({ ...datatable, rows: [] }); }
    setIsLoading(false);
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Submission Report"} items={["Academics", "Timetable Planner", "Submission Report"]} />
      <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-header border-0 pt-6"><div className="card-title" /><div className="card-toolbar"></div></div><div className="card-body p-0"><div className="col-md-12"><div className="row"><form onSubmit={handleSubmit}><div className="row fv-row"><div className="col-md-8"><SearchSelect id="schoolSemester" label="Select School Semester" value={allSemester.map(s => ({ value: s.SemesterCode, label: s.SemesterName })).find(s => s.value === semester.schoolSemester) || null} options={allSemester.map(s => ({ value: s.SemesterCode, label: s.SemesterName }))} onChange={(selected) => handleChange({ target: { id: 'schoolSemester', value: selected?.value || '' } })} placeholder="Select school semester" required /></div><div className="col-md-4"><div className="row"><button type="submit" className="btn btn-primary mt-8">Submit</button></div></div></div></form></div></div>{showData && (<div className="col-12 mt-9"><div className="card-body p-0"><div className="row"><div className="col-md-12"><h2>All Modules</h2><AGTable data={datatable} /></div></div></div></div>)}{errors && (<div className="alert alert-danger d-flex align-items-center mt-5 p-5"><div className="d-flex flex-column"><span>{errors}</span></div></div>)}</div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(SubmissionReport);
