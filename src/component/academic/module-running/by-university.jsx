import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import AGReportTable from "../../common/table/AGReportTable";
import SearchSelect from "../../common/select/SearchSelect";

const ByUniversity = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [course, setCourse] = useState({ code: "", code2: "" });
  const [tableHeight, setTableHeight] = useState("600px");
  const [canSeeReport, setCanSeeReport] = useState(false);

  const columns = ["S/N", "Faculty Name", "Department Name", "ModuleCode", "Module Name", "Course Code", "Course Name", "Course Level", "Course Semester", "CreditLoad", "Module Type"];

  const onCourseChange = (e) => { setCourse({ ...course, code: e.value, code2: e }); };

  useEffect(() => {
    setIsLoading(true);
    const getCourse = async () => {
      const { success, data } = await api.get("academics/module-running/course-list/");
      if (success && data?.length > 0) {
        let rows = [];
        data.forEach((row) => { rows.push({ value: row.CourseCode, label: row.CourseName }); });
        setCourseOptions(rows);
        setCourseList(data);
      }
      setIsLoading(false);
    };
    getCourse();
  }, []);

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const { success, data: result } = await api.get(`academics/module-running/by-university/${course.code}`);
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item, index) => { rows.push([index + 1, item.FacultyName, item.DepartmentName, item.ModuleCode, item.ModuleName, item.CourseCode, item.CourseName, item.CourseLevel, item.CourseSemester, item.CreditLoad, item.ModuleType]); });
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else { toast.error("There are no modules running for this course."); setCanSeeReport(false); }
    setIsLoading(false);
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Module Running By University"} items={["Academics", "Module Running", "Module Running By University"]} />
      <div className="flex-column-fluid">
        <div className="card card-no-border">
          <div className="card-body p-0">
            <div className="col-md-12"><div className="row"><form onSubmit={handleSubmit}><div className="row fv-row"><div className="col-md-9 fv-row"><label className="required fs-6 fw-bold mb-2">Select Course</label><SearchSelect name="code" value={course.code2} onChange={onCourseChange} options={courseOptions} placeholder="select Course" /></div><div className="col-md-3"><div className="row"><button type="submit" className="btn btn-primary mt-8">Submit</button></div></div></div></form></div></div>
            {canSeeReport && (<div className="row"><div className="col-md-12 mt-5"><AGReportTable title={`Module Running By University`} columns={columns} data={data} height={tableHeight} /></div></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(ByUniversity);
