import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/ReportTable";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import SearchSelect from "../../common/select/SearchSelect";

const CarryOverNotRegistered = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [dept, setDept] = useState({ deptCode: "", courseCode: "" });
  const [deptList, setDeptList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [canSeeReport, setCanSeeReport] = useState(false);
  const columns = ["S/N", "StudentID", "Student Name", "Student Level", "Student Semester", "Failed Modules"];

  const deptOptions = useMemo(() => {
    return deptList.map(d => ({ value: d.DepartmentCode, label: d.DepartmentName }));
  }, [deptList]);

  const courseOptions = useMemo(() => {
    return courseList.map(c => ({ value: c.CourseCode, label: c.CourseName }));
  }, [courseList]);

  useEffect(() => {
    const getDepts = async () => {
      const { success, data } = await api.get("registration/registration-report/department-list/");
      if (success && data) setDeptList(data);
      setIsLoading(false);
    };
    getDepts();
  }, []);

  const handleChange = async (e) => {
    setDept({ ...dept, [e.target.id]: e.target.value });

    if (e.target.id === 'deptCode') {
      setIsLoading(true);
      const { success, data } = await api.get(`registration/registration-report/course-list-by-dept/${e.target.value}`);
      if (success && data) setCourseList(data);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const { success, data: result } = await api.post("registration/registration-report/carry-over-not-registered/", { course: dept.courseCode, dept: dept.deptCode });
    if (success && result?.length > 0) {
      const rows = result.map((item, index) => [
        index + 1, item.StudentID, item.StudentName, item.StudentLevel, item.StudentSemester
      ]);
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else if (success) {
      toast.error("There are no student in this department");
    }
    setIsLoading(false);
  };

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Carry Over Not Registered"} items={["Registration", "Registration Report", "Carry Over Not Registered"]} />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-2">
            <div className="col-md-12">
              <div className="row">
                <form onSubmit={handleSubmit}>
                  <div className="row fv-row">
                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">Select Department</label>
                      <SearchSelect id="deptCode" value={deptOptions.find(opt => opt.value === dept.deptCode) || null} options={deptOptions} onChange={(selected) => handleChange({ target: { id: 'deptCode', value: selected?.value || '' } })} placeholder="Select option" isClearable={false} />
                    </div>
                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">Select Select Course</label>
                      <SearchSelect id="courseCode" value={courseOptions.find(opt => opt.value === dept.courseCode) || null} options={courseOptions} onChange={(selected) => handleChange({ target: { id: 'courseCode', value: selected?.value || '' } })} placeholder="Select option" isClearable={false} />
                    </div>
                    <div className="col-md-4">
                      <div className="row "><button type="submit" className="btn btn-primary mt-8">Submit</button></div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {canSeeReport ? (
              <div className="row">
                <div className="col-md-12 mt-5">
                  <ReportTable title={` Carry Over Not Registered`} columns={columns} data={data} height={tableHeight} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return { loginData: state.LoginDetails };
};

export default connect(mapStateToProps, null)(CarryOverNotRegistered);
