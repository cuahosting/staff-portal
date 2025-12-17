import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";

function NumberOfStudentsPerProgram(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [allSemester, setAllSemester] = useState([]);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [semester, setSemester] = useState({ code: "" });
  const columns = ["S/N", "Course/Program", "Student Level", "Student Semester", "Number of students"];

  useEffect(() => {
    const fetchData = async () => {
      const { success, data } = await api.get("staff/timetable/timetable/semester");
      if (success) { setAllSemester(data || []); }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = async (e) => {
    setSemester({ ...semester, [e.target.id]: e.target.value });
    const { success, data: result } = await api.get(`student/student-report/students-per-program/${e.target.value}`);
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item, index) => { rows.push([index + 1, item.CourseName, item.StudentLevel, item.StudentSemester, item.NumberOfStudents]); });
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else { toast.error("There is no report for this program"); setCanSeeReport(false); }
    setIsLoading(false);
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Number of Students Per Program"} items={["Users", "Student Report", "Number of Students Per Program"]} />
      <div className="flex-column-fluid"><div className="card"><div className="card-body pt-2"><div className="col-md-12"><div className="row"><form><div className="row fv-row"><div className="col-md-12 fv-row"><label className="required fs-6 fw-bold mb-2">Select School Semester</label><SearchSelect id="code" label="Select School Semester" value={allSemester.map(s => ({ value: s.SemesterCode, label: s.SemesterName })).find(s => s.value === semester.code) || null} options={allSemester.map(s => ({ value: s.SemesterCode, label: s.SemesterName }))} onChange={(selected) => handleChange({ target: { id: 'code', value: selected?.value || '' }, preventDefault: () => { } })} placeholder="Select school semester" required /></div></div></form></div></div>{canSeeReport && (<div className="row"><div className="col-md-12 mt-5"><ReportTable title={`Number of Students Per Program`} columns={columns} data={data} height={tableHeight} /></div></div>)}</div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(NumberOfStudentsPerProgram);
