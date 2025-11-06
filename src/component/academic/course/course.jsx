import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import CourseForm from "./courseform";
import swal from "sweetalert";
function Course(props) {
  const token = props.loginData[0].token
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState("off");
  const [departmentList, setDepartmentList] = useState([]);
  const [datatable, setDatatable] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Course Name",
        field: "CourseName",
      },
      {
        label: "Code",
        field: "CourseCode",
      },
      {
        label: "Duration",
        field: "Duration",
      },
      {
        label: "Degree",
        field: "DegreeInView",
      },
      {
        label: "Tuition",
        field: "TuitionFee",
      },
      {
        label: "Department",
        field: "DepartmentCode",
      },
      {
        label: "IsAwardDegree",
        field: "IsAwardDegree",
      },
      {
        label: "Action",
        field: "action",
      },
    ],
    rows: [],
  });

  const [createCourse, setCreateCourse] = useState({
    CourseName: "",
    CourseCode: "",
    Duration: "",
    DurationType: "",
    DegreeInView: "",
    TuitionFee: "",
    CourseClass: "",
    DepartmentCode: "",
    IsAwardDegree: 1,
    IsGens: "",
    ApplicationType: "",
    EntryID: "",
    InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}`,
  });
  const initializeUpdateCourseCode = {old_course_code: '', new_course_code: ''}
  const [updateCourseCode, setUpdateCourseCode] = useState(initializeUpdateCourseCode);

  const getDepartments = async () => {
    await axios
      .get(`${serverLink}staff/academics/department/list`, token)
      .then((result) => {
        if (result.data.length > 0) {
          setDepartmentList(result.data);
        }
      })
      .catch((err) => {
        console.log("NETWORK ERROR");
      });
  };

  const getCourse = async () => {
    await axios
      .get(`${serverLink}staff/academics/course/list`, token)
      .then((result) => {
        if (result.data.length > 0) {
          let rows = [];
          result.data.map((course, index) => {
            rows.push({
              sn: index + 1,
              CourseName: course.CourseName ?? "N/A",
              CourseCode: course.CourseCode ?? "N/A",
              Duration: course.Duration + " " + course.DurationType,
              DegreeInView: course.DegreeInView ?? "N/A",
              TuitionFee: course.TuitionFee ?? "N/A",
              CourseClass: course.CourseClass ?? "N/A",
              DepartmentCode: course.DepartmentCode ?? "N/A",
              IsAwardDegree: course.IsAwardDegree === 1 ? "Yes" : "No" ?? "N/A",
              IsGens: course.IsGens === "1" ? "Yes" : "No" ?? "N/A",
              ApplicationType: course.ApplicationType ?? "N/A",
              action: (
                <button
                  className="btn btn-sm btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_general"
                  onClick={() =>
                    setCreateCourse({
                      CourseName: course.CourseName,
                      CourseCode: course.CourseCode,
                      Duration: course.Duration,
                      DurationType: course.DurationType,
                      DegreeInView: course.DegreeInView,
                      TuitionFee: course.TuitionFee,
                      CourseClass: course.CourseClass,
                      DepartmentCode: course.DepartmentCode,
                      IsAwardDegree: course.IsAwardDegree,
                      IsGens: course.IsGens,
                      ApplicationType: course.ApplicationType,
                      EntryID: course.EntryID,
                      InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}`,
                    })
                  }
                >
                  <i className="fa fa-pen" />
                </button>
              ),
            });
          });

          setDatatable({
            ...datatable,
            columns: datatable.columns,
            rows: rows,
          });
        }

        setIsLoading(false);
      })
      .catch((err) => {
        console.log("NETWORK ERROR");
      });
  };

  const onEdit = (e) => {
    setCreateCourse({
      ...createCourse,
      [e.target.id]: e.target.value,
    });
  };

  const onSubmit = async () => {
    if (createCourse.CourseName.trim() === "") {
      showAlert("EMPTY FIELD", "Please enter the course name", "error");
      return false;
    }
    if (createCourse.CourseCode.trim() === "") {
      showAlert("EMPTY FIELD", "Please enter the course code", "error");
      return false;
    }
    if (createCourse.Duration.trim() === "") {
      showAlert("EMPTY FIELD", "Please enter the course duration", "error");
      return false;
    }
    if (createCourse.DurationType.trim() === "") {
      showAlert(
        "EMPTY FIELD",
        "Please select the course duration type",
        "error"
      );
      return false;
    }
    if (createCourse.DegreeInView.trim() === "") {
      showAlert("EMPTY FIELD", "Please enter the degree in view", "error");
      return false;
    }
    if (createCourse.TuitionFee === "") {
      showAlert("EMPTY FIELD", "Please enter the course tuition", "error");
      return false;
    }
    if (createCourse.CourseClass.trim() === "") {
      showAlert("EMPTY FIELD", "Please enter the course class", "error");
      return false;
    }
    if (createCourse.DepartmentCode.trim() === "") {
      showAlert("EMPTY FIELD", "Please select the department code", "error");
      return false;
    }
    if (createCourse.IsGens.trim() === "") {
      showAlert("EMPTY FIELD", "Please select the IsGens option", "error");
      return false;
    }
    if (createCourse.ApplicationType.trim() === "") {
      showAlert("EMPTY FIELD", "Please select the application type", "error");
      return false;
    }

    if (createCourse.EntryID === "") {
      setIsFormLoading("on");
      await axios
        .post(`${serverLink}staff/academics/course/add`, createCourse, token)
        .then((result) => {
          if (result.data.message === "success") {
            toast.success("Course Added Successfully");
            setIsFormLoading("off");
            getCourse();
            document.getElementById("closeModal").click();
            setCreateCourse({
              ...createCourse,
              CourseName: "",
              CourseCode: "",
              Duration: "",
              DurationType: "",
              DegreeInView: "",
              TuitionFee: "",
              CourseClass: "",
              DepartmentCode: "",
              IsGens: "",
              ApplicationType: "",
              EntryID: "",
            });
          } else if (result.data.message === "exist") {
            showAlert("COURSE EXIST", "Course already exist!", "error");
          } else {
            showAlert(
              "ERROR",
              "Something went wrong. Please try again!",
              "error"
            );
          }
        })
        .catch((error) => {
          showAlert(
            "NETWORK ERROR",
            "Please check your connection and try again!",
            "error"
          );
        });
    } else {
      setIsFormLoading("on");
      await axios
        .patch(`${serverLink}staff/academics/course/update`, createCourse, token)
        .then((result) => {
          if (result.data.message === "success") {
            toast.success("Course Updated Successfully");
            setIsFormLoading("off");
            getCourse();
            document.getElementById("closeModal").click();
            setCreateCourse({
              ...createCourse,
              CourseName: "",
              CourseCode: "",
              Duration: "",
              DurationType: "",
              DegreeInView: "",
              TuitionFee: "",
              CourseClass: "",
              DepartmentCode: "",
              IsGens: "",
              ApplicationType: "",
              EntryID: "",
            });
          } else {
            showAlert(
              "ERROR",
              "Something went wrong. Please try again!",
              "error"
            );
          }
        })
        .catch((error) => {
          showAlert(
            "NETWORK ERROR",
            "Please check your connection and try again!",
            "error"
          );
        });
    }
  };
  async function deleteCourse(courseCode_ln) {
    await axios
      .post(`${serverLink}staff/academics/department/deleteCourse`, {
        courseCode: courseCode_ln,
      }, token)
      .then((res) => {
        if (res.data.message === "success") {
          toast.success("Deleted Successfully");
        } else {
          toast.error(res.data.whatToShow);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  }

  const handleSubmitCourseCodeUpdate = async () => {
    if (updateCourseCode.old_course_code.trim() === '') {
      toast.error("Please Enter the Old Course Code");
      return false
    }
    if (updateCourseCode.new_course_code.trim() === '') {
      toast.error("Please Enter the New Course Code");
      return false
    }
    toast.info("Processing... Please wait!");

    await axios.patch(`${serverLink}staff/academics/course/update-course-code`, updateCourseCode, token)
        .then(res => {
          if (res.data.message === 'success') {
            toast.success("Course Code Updated Successfully");
            document.getElementById("closeModal").click();
            getCourse();
          } else {
            toast.error(res.data.message)
          }
        })
        .catch(e => {
          console.log(e)
          toast.error("Network/Server Error. Please refresh your browser and try again!")
        })

  }

  useEffect(() => {
    getDepartments();
  }, []);

  useEffect(() => {
    axios
      .get(`${serverLink}staff/academics/course/list`, token)
      .then((result) => {
        if (result.data.length > 0) {
          let rows = [];
          result.data.map((course, index) => {
            rows.push({
              sn: index + 1,
              CourseName: course.CourseName ?? "N/A",
              CourseCode: course.CourseCode ?? "N/A",
              Duration: course.Duration + " " + course.DurationType,
              DegreeInView: course.DegreeInView ?? "N/A",
              TuitionFee: course.TuitionFee ?? "N/A",
              CourseClass: course.CourseClass ?? "N/A",
              DepartmentCode: course.DepartmentCode ?? "N/A",
              IsGens: course.IsGens === 1 ? "Yes" : "No" ?? "N/A",
              IsAwardDegree: course.IsAwardDegree === 1 ? "Yes" : "No" ?? "N/A",
              ApplicationType: course.ApplicationType ?? "N/A",
              action: (
                <>
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#kt_modal_general"
                    onClick={() =>
                      setCreateCourse({
                        CourseName: course.CourseName,
                        CourseCode: course.CourseCode,
                        Duration: course.Duration,
                        DurationType: course.DurationType,
                        DegreeInView: course.DegreeInView,
                        TuitionFee: course.TuitionFee,
                        CourseClass: course.CourseClass,
                        DepartmentCode: course.DepartmentCode,
                        IsAwardDegree: course.IsAwardDegree,
                        IsGens: course.IsGens,
                        ApplicationType: course.ApplicationType,
                        EntryID: course.EntryID,
                        InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}`,
                      })
                    }
                  >
                    <i className="fa fa-pen" />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      swal({
                        title: "Are you sure?",
                        text: "Once deleted, you will not be able to recover it!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                      }).then((willDelete) => {
                        if (willDelete) {
                          deleteCourse(course.CourseCode);
                        }
                      });
                    }}
                  >
                    <i className="fa fa-trash" />
                  </button>
                </>
              ),
            });
          });

          setDatatable({
            ...datatable,
            columns: datatable.columns,
            rows: rows,
          });
        }

        setIsLoading(false);
      })
      .catch((err) => {
        console.log("NETWORK ERROR");
      });
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Manage Course"} items={["Academics", "Course"]} />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-header border-0 pt-6">
            <div className="card-title" />
            <div className="card-toolbar">
              <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                <button type="button" className="btn btn-primary" style={{marginRight: "5px"}} data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setCreateCourse({...createCourse, CourseName: "", CourseCode: "", Duration: "", DurationType: "", DegreeInView: "", TuitionFee: "", CourseClass: "", DepartmentCode: "", IsAwardDegree: 1, IsGens: "", ApplicationType: "", EntryID: "",})}>Add Course</button>
                <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general_course_code" onClick={() => {setUpdateCourseCode(initializeUpdateCourseCode)}}>Update Course Code</button>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <Table data={datatable} />
          </div>
        </div>
        <Modal title={"Manage Course"}>
          <CourseForm
            data={createCourse}
            departmentList={departmentList}
            isFormLoading={isFormLoading}
            onEdit={onEdit}
            onSubmit={onSubmit}
          />
        </Modal>

        <Modal title={"UPDATE COURSE CODE"} id={"kt_modal_general_course_code"}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="form-group">
                <label htmlFor="old_course_code"> Enter Old Course Code</label>
                <input type="text" className="form-control" id="old_course_code"
                       value={updateCourseCode.old_course_code} onChange={(e) => {
                  setUpdateCourseCode({
                    ...updateCourseCode,
                    old_course_code: e.target.value
                  })
                }}/>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="form-group">
                <label htmlFor="new_module_code"> Enter New Course Code</label>
                <input type="text" className="form-control" id="new_module_code"
                       value={updateCourseCode.new_course_code} onChange={(e) => {
                  setUpdateCourseCode({
                    ...updateCourseCode,
                    new_course_code: e.target.value
                  })
                }}/>
              </div>
            </div>
            <button className="btn btn-primary w-100"
                    onClick={handleSubmitCourseCodeUpdate}>Submit
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(Course);
