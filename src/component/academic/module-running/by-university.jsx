import axios from "axios";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import AGReportTable from "../../common/table/AGReportTable";
import Select from "react-select";

const ByUniversity = (props) => {
  
  const token = props.login[0].token;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

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
    setIsLoading(true);
    const getCourse = async () => {
      await axios
        .get(`${serverLink}academics/module-running/course-list/`, token)
        .then((response) => {
          let rows = []
          if (response.data.length > 0) {
            response.data.map((row) => {
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
  }, []);

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    await axios
      .get(`${serverLink}academics/module-running/by-university/${course.code}`, token)
      .then((res) => {
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
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
          toast.error("There are no modules running for this course.");
          setCanSeeReport(false);
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
        title={"Module Running By University"}
        items={["Academics", "Module Running", "Module Running By University"]}
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
                      title={`Module Running By University`}
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
export default connect(mapStateToProps, null)(ByUniversity);
