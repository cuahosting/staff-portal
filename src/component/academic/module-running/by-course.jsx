import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import AGReportTable from "../../common/table/AGReportTable";
import Select from "react-select";

const ByCourse = (props) => {
  const token = props.login[0].token;
  const staffId = props.login[0].StaffID;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [courseList, setCourseList] = useState([]);
  const [course, setCourse] = useState({
    code: "",
    code2: "",
  });
  const [tableHeight, setTableHeight] = useState("600px");
  const [canSeeReport, setCanSeeReport] = useState(false);

  const columns = [
    "S/N",
    "Faculty Name",
    "Department Name",
    "ModuleCode",
    "Module Name",
    "Course Code",
    "Course Name",
    "Course Level",
    "Course Semester",
    "CreditLoad",
    "Module Type",
  ];

  // eslint-disable-next-line no-unused-vars
  const handleChange = (e) => {
    setCourse({
      ...course,
      [e.target.id]: e.target.value,
    });
  };

  const onCourseChange = (e) => {
    setCourse({
      ...course,
      code: e.value,
      code2: e,
    })
  }

  useEffect(() => {
    const getCourse = async () => {
      await axios
        .get(`${serverLink}academics/module-running/course-list/${staffId}`, token)
        .then((response) => {
          let rows = []
          if (response.data.length > 0) {
            response.data.forEach((row) => {
              rows.push({ value: row.CourseCode, label: row.CourseName })
            });
            setCourseOptions(rows)
            setCourseList(response.data);
          }
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    await axios
      .get(`${serverLink}academics/module-running/by-course/${course.code}`, token)
      .then((res) => {
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.forEach((item, index) => {
            rows.push([
              index + 1,
              item.FacultyName,
              item.DepartmentName,
              item.ModuleCode,
              item.ModuleName,
              item.CourseCode,
              item.CourseName,
              item.CourseLevel,
              item.CourseSemester,
              item.CreditLoad,
              item.ModuleType,
            ]);
          });
          setTableHeight(result.length > 100 ? "1000px" : "600px");
          setData(rows);
          setCanSeeReport(true);
        } else {
          toast.error("There are no modules for this course.");
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
        title={"Module Running By Course"}
        items={["Academics", "Module Running", "Module Running By Course"]}
      />
      <div className="flex-column-fluid">
        <div className="card card-no-border">
          <div className="card-body p-0">
            <div className="col-md-12">
              <div className="row">
                <form onSubmit={handleSubmit}>
                  <div className="row fv-row">
                    <div className="col-md-9 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select Course
                      </label>
                      <Select
                          name="code"
                          value={course.code2}
                          onChange={onCourseChange}
                          options={courseOptions}
                          placeholder="select Course"
                      />
                    </div>
                    <div className="col-md-3">
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
                    <AGReportTable
                      title={`Module Running By Course`}
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
export default connect(mapStateToProps, null)(ByCourse);
