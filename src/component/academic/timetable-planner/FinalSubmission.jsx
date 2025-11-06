import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { connect } from "react-redux";
import PageHeader from "../../common/pageheader/pageheader";
import { showAlert, showConfirm } from "../../common/sweetalert/sweetalert";
import Table from "../../common/table/table";
import Select from "react-select";

function FinalSubmission(props) {
  const token = props.login[0].token;
  const [courseList, setCourseList] = useState([]);
  const [allModulesByCourse, setAllModulesByCourse] = useState([]);
  const [allSemester, setAllSemester] = useState([]);
  const [staffList, setStaffList] = useState([])
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [courseCode, setCourseCode] = useState({
    courseCode: "",
    courseCode2: "",
    schoolSemester: "",
    schoolSemester2: "",
  });
  const [moduleList, setModuleList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [datatable, setDatatable] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Module Code",
        field: "code",
      },
      {
        label: "Module Name",
        field: "module",
      },
      {
        label: "Level",
        field: "level",
      },
      {
        label: "Semester",
        field: "semester",
      },
      {
        label: "School Semester",
        field: "schoolSemester",
      },
      {
        label: "Staff Name",
        field: "staffName",
      },
      {
        label: "Module Type",
        field: "moduleType",
      },
      {
        label: "Status",
        field: "Status"
      },
      {
        label: "Action",
        field: "Action"
      }
    ],
    rows: [],
  });
  const [moduledata, setModuleData] = useState([])

  useEffect(() => {
    const getAllModulesByCourse = async () => {
      // axios.get(`${serverLink}staff/academics/timetable-planner-2/course-list/${props.login[0].StaffID}`, token)
      //   .then((response) => {
      //     setCourseList(response.data);
      //   })
      //   .catch((ex) => {
      //     console.error(ex);
      //   });

      axios.get(`${serverLink}staff/academics/timetable-planner-2/hod-course-list/${props.login[0]?.StaffID}`, token)
        .then((response) => {
          let rows = []
          if (response.data.length > 0) {
            response.data.map((row) => {
              rows.push({ value: row.CourseCode, label: row.CourseName })
            });
            setCourseOptions(rows)
            setCourseList(response.data);
          }
        })
        .catch((ex) => {
          console.error(ex);
        });

      axios.get(`${serverLink}staff/academics/timetable-planner/staff/list`, token)
        .then((response) => {
          let rows = [];
          response.data.length > 0 &&
            response.data.map((row) => {
              rows.push({ text: row.FirstName + " " + row.MiddleName + "" + row.Surname, id: row.StaffID });
            });
          setStaffList(rows)
        })
        .catch((ex) => {
          console.error(ex);
        });
      setIsLoading(false);
    };
    getAllModulesByCourse();
  }, []);

  useEffect(() => {
    const getSchoolSemester = async () => {
      axios
        .get(`${serverLink}staff/timetable/timetable/semester`, token)
        .then((response) => {
          let rows = []
          if (response.data.length > 0) {
            response.data.map((row) => {
              rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode })
            });
            setAllSemester(response.data);
            setSemesterOptions(rows)
          }
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getSchoolSemester();
  }, []);

  const handleChange = (e) => {
    setCourseCode({
      ...courseCode,
      [e.target.id]: e.target.value,
    });
  };


  const onCourseChange = (e) => {
    setCourseCode({
      ...courseCode,
      courseCode: e.value,
      courseCode2: e,
    })
  }

  const onSemesterChange = (e) => {
    setCourseCode({
      ...courseCode,
      schoolSemester: e.value,
      schoolSemester2: e,
    })
  }


  const handleSubmit = async (e = '') => {
    if (e !== '') {
      e.preventDefault();
    }
    setIsLoading(true);
    await axios
      .post(
        `${serverLink}staff/academics/timetable-planner/final-submission-list/`,
        {
          course: courseCode.courseCode,
          semester: courseCode.schoolSemester,
        },
        token
      )
      .then((response) => {
        if (response.data.length > 0) {
          setModuleList(response.data);
          setAllModulesByCourse(response.data);
          let rows = [];
          response.data.map((module, index) => {
            const l1 = module.Lecturers.split(" ,")[0] === "No Name" ? "--" : module.Lecturers.split(" ,")[0];
            const l2 = module.Lecturers.split(" ,")[1] === "No Name" ? "--" : module.Lecturers.split(" ,")[1];
            const l3 = module.Lecturers.split(" ,")[2] === "No Name" ? "--" : module.Lecturers.split(" ,")[2];
            rows.push({
              sn: index + 1,
              code: module.ModuleCode,
              module: module.ModuleName,
              level: module.ModuleLevel,
              semester: module.ModuleSemester,
              schoolSemester: module.SchoolSemester,
              staffName: l1 + " ," + l2 + " ," + l3,
              moduleType: module.ModuleType,
              Status: module.Status === 0 ? <span className="badge badge-secondary">Not Submitted</span>
                : module.Status === 1 ? <span className="badge badge-success">Submitted by HOD</span>
                  : <span className="badge badge-success">Approved by Dean</span>,
              Action: <button className="btn btn-sm btn-primary" onClick={() => {onApproveSingle(module)}}>
                <i className="fa fa-arrow-right" />
              </button>
            });
          });
          setDatatable({
            ...datatable,
            columns: datatable.columns,
            rows: rows,
          });
        } else {
          toast.error("No modules for this semester");
          setDatatable({
            ...datatable,
            columns: datatable.columns,
            rows: [],
          });
          setIsLoading(false);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        showAlert(
          "NETWORK ERROR",
          "Please check your connection and try again!",
          "error"
        );
      });
  };
  const handleFinalSubmission = async () => {
    if (moduleList[0]?.Status.toString() === "2") {
      showAlert("Error", "Modules have already been approved by the dean", "error");
      return false;
    }
    showConfirm("Warning", "Are you sure you want to submit courses for approval?", "warning")
      .then(async (isconfirmed) => {
        if (isconfirmed) {
          await axios.patch(
            `${serverLink}staff/academics/timetable-planner/approve-module-by-hod/`,
            allModulesByCourse, token
          )
            .then((response) => {
              if (response.data.message === "success") {
                handleSubmit();
                toast.success("Successfully done final submission");
              } else {
                toast.error("Unable to do final submission");
              }
            })
            .catch((ex) => {
              console.error(ex);
            });
        }
      })
  };

  const onApproveSingle= (_module) => {
    showConfirm("Warning", "Are you sure you want to submit course for approval?", "warning")
      .then(async (isconfirmed) => {
        if (isconfirmed) {
          await axios.patch(`${serverLink}staff/academics/timetable-planner/approve-single-module-by-hod/`, _module, token)
            .then((response) => {
              if (response.data.message === "success") {
                handleSubmit();
                toast.success("Successfully done final submission");
              } else {
                toast.error("Unable to do final submission");
              }
            })
            .catch((ex) => {
              console.error(ex);
            });
        }
      })
  }

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"HOD Submission"}
        items={["Academics", "Timetable Planner", "HOD Submission"]}
      />
      <div className="flex-column-fluid">
        <div className="card pt-5">
          <div className="card-body pt-0">
            <div className="col-md-12">
              <div className="row">
                <form onSubmit={handleSubmit}>
                  <div className="row fv-row">
                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select Programme/Course
                      </label>
                      <Select
                        name="courseCode"
                        value={courseCode.courseCode2}
                        onChange={onCourseChange}
                        options={courseOptions}
                        placeholder="Select a programme/Course"
                      />
                      {/*<select*/}
                      {/*  className="form-select"*/}
                      {/*  data-placeholder="Select a programme"*/}
                      {/*  id="courseCode"*/}
                      {/*  value={courseCode.courseCode}*/}
                      {/*  required*/}
                      {/*  onChange={handleChange}*/}
                      {/*>*/}
                      {/*  <option value="">Select option</option>*/}
                      {/*  {courseList.map((course, index) => (*/}
                      {/*    <option key={index} value={course.CourseCode}>*/}
                      {/*      {course.CourseName}*/}
                      {/*    </option>*/}
                      {/*  ))}*/}
                      {/*</select>*/}
                    </div>
                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select School Semester
                      </label>
                      <Select
                        name="schoolSemester"
                        value={courseCode.schoolSemester2}
                        onChange={onSemesterChange}
                        options={semesterOptions}
                        placeholder="select Semester"
                      />
                      {/*<select*/}
                      {/*  className="form-select"*/}
                      {/*  data-placeholder="Select school semester"*/}
                      {/*  id="schoolSemester"*/}
                      {/*  value={courseCode.schoolSemester}*/}
                      {/*  required*/}
                      {/*  onChange={handleChange}*/}
                      {/*>*/}
                      {/*  <option value="">Select option</option>*/}
                      {/*  {allSemester.map((semester, index) => (*/}
                      {/*    <option key={index} value={semester.SemesterCode}>*/}
                      {/*      {semester.SemesterName}*/}
                      {/*    </option>*/}
                      {/*  ))}*/}
                      {/*</select>*/}
                    </div>
                    <div className="col-md-4">
                      <div className="row ">
                        <button type="submit" className="btn btn-primary mt-8">
                          View Modules
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {moduleList.length > 0 ? (
              <div className="col-12 mt-9">
                <div className="card-body pt-0">
                  <div className="row">
                    <div className="col-md-12">
                      <h2>All Modules </h2>
                      <Table data={datatable} />
                      <div
                        className="d-flex justify-content-end mt-5"
                        data-kt-customer-table-toolbar="base"
                      >
                        <button
                          className="btn btn-primary"
                          onClick={() => handleFinalSubmission()}
                        >
                          Final Submission
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    login: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(FinalSubmission);
