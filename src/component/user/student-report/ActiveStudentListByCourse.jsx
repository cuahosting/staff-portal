import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { connect } from "react-redux";
import ReportTable from "../../common/table/report_table";
import PageHeader from "../../common/pageheader/pageheader";
import Select2 from "react-select2-wrapper";
import "react-select2-wrapper/css/select2.css";

const ActiveStudentListByCourse = (props) => {
  const token = props.login[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [courseCode, setCourseCode] = useState({
    courseCode: "",
  });
  const [tableHeight, setTableHeight] = useState("600px");
  const [canSeeReport, setCanSeeReport] = useState(false);
  const columns = [
    "S/N",
    "StudentID",
    "Student Name",
    "Level",
    "Semester",
    "EmailAddress",
    "Phone Number",
  ];
  const staffID = props.login[0].StaffID;

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleChange = async (e) => {
    setCourseCode({
      ...courseCode,
      [e.target.id]: e.target.value,
    });
    setIsLoading(true);
    e.preventDefault();
    await axios
      .get(
        `${serverLink}student/student-report/active-student-list-by-course/${e.target.value}`, token
      )
      .then((res) => {
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.StudentID,
              item.StudentName,
              item.Level,
              capitalize(item.Semester),
              item.EmailAddress,
              item.PhoneNumber,
            ]);
          });
          setTableHeight(result.length > 100 ? "1000px" : "600px");
          setData(rows);
          setCanSeeReport(true);
        } else {
          toast.error("There are no student for this course.");
          setCanSeeReport(false);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("NETWORK ERROR");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const getCourseByStaff = async () => {
      axios
        .get(`${serverLink}student/student-report/course/list/`, token)
        // .get(`${serverLink}staff/academics/timetable/modules-by-staff/${staffID}`, token)
        .then((response) => {
          let rows = [];
          response.data.length > 0 &&
            response.data.map((row) => {
              rows.push({ text: row.CourseName, id: row.CourseCode });
            });
          setCourseList(rows);
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getCourseByStaff();
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Active Student List By Course"}
        items={["Users", "Student Report", "Active Student List By Course"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-2">
            <div className="col-md-12">
              <div className="row">
                <form>
                  <div className="row fv-row">
                    <div className="col-md-12 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select Course
                      </label>
                      <Select2
                        id="courseCode"
                        data={courseList}
                        value={courseCode.courseCode}
                        onSelect={handleChange}
                        options={{
                          placeholder: "Search Course Code",
                        }}
                      />
                      {/* <select
                        className="form-select"
                        data-placeholder="Select Module"
                        id="courseCode"
                        onChange={handleChange}
                        value={courseCode.courseCode}
                        required
                      >
                        <option value="">Select option</option>
                        {courseList.map((c, i) => (
                          <option key={i} value={c.CourseCode}>
                            {c.CourseName}
                          </option>
                        ))}
                      </select> */}
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
                      title={`Active Student List By Course`}
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
    login: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(ActiveStudentListByCourse);
