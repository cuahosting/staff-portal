import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { connect } from "react-redux";
import ReportTable from "../../common/table/ReportTable";
import PageHeader from "../../common/pageheader/pageheader";
import SearchSelect from "../../common/select/SearchSelect";

const ActiveStudentListByCourse = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [courseCode, setCourseCode] = useState({ courseCode: "" });
  const [tableHeight, setTableHeight] = useState("600px");
  const [canSeeReport, setCanSeeReport] = useState(false);
  const columns = ["S/N", "StudentID", "Student Name", "Level", "Semester", "EmailAddress", "Phone Number"];
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleChange = async (e) => {
    setCourseCode({ ...courseCode, [e.target.id]: e.target.value });
    setIsLoading(true);
    const { success, data: result } = await api.get(`student/student-report/active-student-list-by-course/${e.target.value}`);
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item, index) => { rows.push([index + 1, item.StudentID, item.StudentName, item.Level, capitalize(item.Semester), item.EmailAddress, item.PhoneNumber]); });
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else { toast.error("There are no student for this course."); setCanSeeReport(false); }
    setIsLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { success, data } = await api.get("student/student-report/course/list/");
      if (success && data?.length > 0) {
        let rows = [];
        data.forEach((row) => { rows.push({ value: row.CourseCode, label: row.CourseName }); });
        setCourseList(rows);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Active Student List By Course"} items={["Users", "Student Report", "Active Student List By Course"]} />
      <div className="flex-column-fluid"><div className="card"><div className="card-body pt-2"><div className="col-md-12"><div className="row"><form><div className="row fv-row"><div className="col-md-12 fv-row"><SearchSelect id="courseCode" label="Select Course" value={courseList.find(c => c.value === courseCode.courseCode) || null} options={courseList} onChange={(selected) => { handleChange({ target: { id: 'courseCode', value: selected?.value || '' }, preventDefault: () => { } }); }} placeholder="Search Course Code" required /></div></div></form></div></div>{canSeeReport && (<div className="row"><div className="col-md-12 mt-5"><ReportTable title={`Active Student List By Course`} columns={columns} data={data} height={tableHeight} /></div></div>)}</div></div></div>
    </div>
  );
};

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(ActiveStudentListByCourse);
