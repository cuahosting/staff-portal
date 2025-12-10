import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/ReportTable";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";

const CarryOverNotRegistered = (props) => {
  const token = props.loginData[0].token;

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [dept, setDept] = useState({
    deptCode: "",
    courseCode: "",
  });
  const [deptList, setDeptList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [canSeeReport, setCanSeeReport] = useState(false);
  const columns = [
    "S/N",
    "StudentID",
    "Student Name",
    "Student Level",
    "Student Semester",
    "Failed Modules",
  ];

  useEffect(() => {
    const getDepts = async () => {
      axios
        .get(`${serverLink}registration/registration-report/department-list/`, token)
        .then((response) => {
          setDeptList(response.data);
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getDepts();
  }, []);
  const handleChange = (e) => {
    setDept({
      ...dept,
      [e.target.id]: e.target.value,
    });

    const getCourse = async () => {
      setIsLoading(true);
      axios
        .get(
          `${serverLink}registration/registration-report/course-list-by-dept/${e.target.value}`, token)
        .then((response) => {
          setCourseList(response.data);
          setIsLoading(false);
        })
        .catch((ex) => {
          toast.error("NETWORK ERROR");
        });
      setIsLoading(false);
    };
    getCourse();
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    await axios
      .post(
        `${serverLink}registration/registration-report/carry-over-not-registered/`, {course: dept.courseCode, dept: dept.deptCode}, token)
      .then((res) => {
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.StudentID,
              item.StudentName,
              item.StudentLevel,
              item.StudentSemester,
            ]);
          });
          setTableHeight(result.length > 100 ? "1000px" : "600px");
          setData(rows);
          setCanSeeReport(true);
        } else {
          toast.error("There are no student in this department");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("NETWORK ERROR");
      });
  };

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Carry Over Not Registered"}
        items={[
          "Registration",
          "Registration Report",
          "Carry Over Not Registered",
        ]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-2">
            <div className="col-md-12">
              <div className="row">
                <form onSubmit={handleSubmit}>
                  <div className="row fv-row">
                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select Department
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select Semester"
                        id="deptCode"
                        onChange={handleChange}
                        value={dept.deptCode}
                        required
                      >
                        <option value="">Select option</option>
                        {deptList.map((d, i) => (
                          <option key={i} value={d.DepartmentCode}>
                            {d.DepartmentName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select Select Course
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select Semester"
                        id="courseCode"
                        onChange={handleChange}
                        value={dept.courseCode}
                        required
                      >
                        <option value="">Select option</option>
                        {courseList.map((c, i) => (
                          <option key={i} value={c.CourseCode}>
                            {c.CourseName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <div className="row ">
                        <button type="submit" className="btn btn-primary mt-8">
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {canSeeReport ? (
              <div className="row">
                <div className="col-md-12 mt-5">
                  {
                    <ReportTable
                      title={` Carry Over Not Registered`}
                      columns={columns}
                      data={data}
                      height={tableHeight}
                    />
                  }
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
  return {
      loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(CarryOverNotRegistered);
