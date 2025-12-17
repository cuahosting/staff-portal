import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import DataTable from "../../common/table/DataTable";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import CourseForm from "./courseform";
import swal from "sweetalert";

function Course(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState("off");
  const [departmentList, setDepartmentList] = useState([]);
  const [datatable, setDatatable] = useState({
    columns: [
      { label: "S/N", field: "sn" },
      { label: "Course Name", field: "CourseName" },
      { label: "Code", field: "CourseCode" },
      { label: "Duration", field: "Duration" },
      { label: "Degree", field: "DegreeInView" },
      { label: "Tuition", field: "TuitionFee" },
      { label: "Department", field: "DepartmentCode" },
      { label: "IsAwardDegree", field: "IsAwardDegree" },
      { label: "Action", field: "action" },
    ],
    rows: [],
  });

  const [createCourse, setCreateCourse] = useState({
    CourseName: "", CourseCode: "", Duration: "", DurationType: "", DegreeInView: "", TuitionFee: "", CourseClass: "", DepartmentCode: "", IsAwardDegree: 1, IsGens: "", ApplicationType: "", EntryID: "",
    InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}`,
  });
  const initializeUpdateCourseCode = { old_course_code: '', new_course_code: '' };
  const [updateCourseCode, setUpdateCourseCode] = useState(initializeUpdateCourseCode);

  const getDepartments = async () => {
    const { success, data } = await api.get("staff/academics/department/list");
    if (success && data?.length > 0) { setDepartmentList(data); }
  };

  const buildRows = (data) => {
    return data.map((course, index) => ({
      sn: index + 1,
      CourseName: course.CourseName ?? "N/A",
      CourseCode: course.CourseCode ?? "N/A",
      Duration: course.Duration + " " + course.DurationType,
      DegreeInView: course.DegreeInView ?? "N/A",
      TuitionFee: course.TuitionFee ?? "N/A",
      CourseClass: course.CourseClass ?? "N/A",
      DepartmentCode: course.DepartmentCode ?? "N/A",
      IsAwardDegree: course.IsAwardDegree === 1 ? "Yes" : "No",
      IsGens: course.IsGens === "1" ? "Yes" : "No",
      ApplicationType: course.ApplicationType ?? "N/A",
      action: (
        <>
          <button className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }} title="Edit" data-bs-toggle="modal" data-bs-target="#kt_modal_general"
            onClick={() => setCreateCourse({ CourseName: course.CourseName, CourseCode: course.CourseCode, Duration: course.Duration, DurationType: course.DurationType, DegreeInView: course.DegreeInView, TuitionFee: course.TuitionFee, CourseClass: course.CourseClass, DepartmentCode: course.DepartmentCode, IsAwardDegree: course.IsAwardDegree, IsGens: course.IsGens, ApplicationType: course.ApplicationType, EntryID: course.EntryID, InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}` })}>
            <i style={{ fontSize: '15px', color: "blue" }} className="fa fa-pen color-blue" />
          </button>
          <button className="btn btn-link p-0 text-danger" title="Delete"
            onClick={() => { swal({ title: "Are you sure?", text: "Once deleted, you will not be able to recover it!", icon: "warning", buttons: true, dangerMode: true }).then((willDelete) => { if (willDelete) { deleteCourse(course.CourseCode); } }); }}>
            <i style={{ fontSize: '15px', color: "red" }} className="fa fa-trash" />
          </button>
        </>
      ),
    }));
  };

  const getCourse = async () => {
    const { success, data } = await api.get("staff/academics/course/list");
    if (success && data?.length > 0) { setDatatable({ ...datatable, rows: buildRows(data) }); }
    setIsLoading(false);
  };

  const onEdit = (e) => { setCreateCourse({ ...createCourse, [e.target.id]: e.target.value }); };

  const onStepValidation = (stepIndex) => {
    if (stepIndex === 0) {
      if (createCourse.CourseName.trim() === "") { showAlert("EMPTY FIELD", "Please enter the course name", "error"); return false; }
      if (createCourse.CourseCode.trim() === "") { showAlert("EMPTY FIELD", "Please enter the course code", "error"); return false; }
      if (createCourse.DepartmentCode.trim() === "") { showAlert("EMPTY FIELD", "Please select the department code", "error"); return false; }
      return true;
    }
    if (stepIndex === 1) {
      if (createCourse.Duration.trim() === "") { showAlert("EMPTY FIELD", "Please enter the course duration", "error"); return false; }
      if (createCourse.DurationType.trim() === "") { showAlert("EMPTY FIELD", "Please select the course duration type", "error"); return false; }
      if (createCourse.DegreeInView.trim() === "") { showAlert("EMPTY FIELD", "Please enter the degree in view", "error"); return false; }
      if (createCourse.ApplicationType.trim() === "") { showAlert("EMPTY FIELD", "Please select the application type", "error"); return false; }
      return true;
    }
    if (stepIndex === 2) {
      if (createCourse.TuitionFee === "") { showAlert("EMPTY FIELD", "Please enter the course tuition", "error"); return false; }
      if (createCourse.CourseClass.trim() === "") { showAlert("EMPTY FIELD", "Please enter the course class", "error"); return false; }
      if (createCourse.IsGens.trim() === "") { showAlert("EMPTY FIELD", "Please select the IsGens option", "error"); return false; }
      return true;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!onStepValidation(0) || !onStepValidation(1) || !onStepValidation(2)) { return; }

    if (createCourse.EntryID === "") {
      setIsFormLoading("on");
      const { success, data } = await api.post("staff/academics/course/add", createCourse);
      if (success) {
        if (data?.message === "success") { toast.success("Course Added Successfully"); getCourse(); document.getElementById("closeModal").click(); setCreateCourse({ ...createCourse, CourseName: "", CourseCode: "", Duration: "", DurationType: "", DegreeInView: "", TuitionFee: "", CourseClass: "", DepartmentCode: "", IsGens: "", ApplicationType: "", EntryID: "" }); }
        else if (data?.message === "exist") { showAlert("COURSE EXIST", "Course already exist!", "error"); }
        else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
      }
      setIsFormLoading("off");
    } else {
      setIsFormLoading("on");
      const { success, data } = await api.patch("staff/academics/course/update", createCourse);
      if (success) {
        if (data?.message === "success") { toast.success("Course Updated Successfully"); getCourse(); document.getElementById("closeModal").click(); setCreateCourse({ ...createCourse, CourseName: "", CourseCode: "", Duration: "", DurationType: "", DegreeInView: "", TuitionFee: "", CourseClass: "", DepartmentCode: "", IsGens: "", ApplicationType: "", EntryID: "" }); }
        else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
      }
      setIsFormLoading("off");
    }
  };

  async function deleteCourse(courseCode_ln) {
    const { success, data } = await api.post("staff/academics/department/deleteCourse", { courseCode: courseCode_ln });
    if (success) {
      if (data?.message === "success") { toast.success("Deleted Successfully"); getCourse(); }
      else { toast.error(data?.whatToShow || "Error deleting course"); }
    }
  }

  const handleSubmitCourseCodeUpdate = async () => {
    if (updateCourseCode.old_course_code.trim() === '') { toast.error("Please Enter the Old Course Code"); return false; }
    if (updateCourseCode.new_course_code.trim() === '') { toast.error("Please Enter the New Course Code"); return false; }
    toast.info("Processing... Please wait!");
    const { success, data } = await api.patch("staff/academics/course/update-course-code", updateCourseCode);
    if (success) {
      if (data?.message === 'success') { toast.success("Course Code Updated Successfully"); document.getElementById("closeModal").click(); getCourse(); }
      else { toast.error(data?.message || "Error updating course code"); }
    }
  };

  useEffect(() => { getDepartments(); getCourse(); }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Manage Course"} items={["Academics", "Course"]}
        buttons={<><button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setCreateCourse({ ...createCourse, CourseName: "", CourseCode: "", Duration: "", DurationType: "", DegreeInView: "", TuitionFee: "", CourseClass: "", DepartmentCode: "", IsAwardDegree: 1, IsGens: "", ApplicationType: "", EntryID: "" })}>Add Course</button><button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general_course_code" onClick={() => { setUpdateCourseCode(initializeUpdateCourseCode) }}>Update Course Code</button></>} />
      <div className="flex-column-fluid">
        <div className="card card-no-border"><div className="card-body p-0"><DataTable data={datatable} /></div></div>
        <Modal title={"Manage Course"}><CourseForm data={createCourse} departmentList={departmentList} isFormLoading={isFormLoading} onEdit={onEdit} onSubmit={onSubmit} /></Modal>
        <Modal title={"UPDATE COURSE CODE"} id={"kt_modal_general_course_code"}>
          <div className="row">
            <div className="col-md-6"><div className="fv-row mb-6 enhanced-form-group"><label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="old_course_code">Enter Old Course Code</label><div className="enhanced-input-wrapper"><input type="text" className="form-control form-control-lg form-control-solid enhanced-input" id="old_course_code" value={updateCourseCode.old_course_code} onChange={(e) => { setUpdateCourseCode({ ...updateCourseCode, old_course_code: e.target.value }) }} autoComplete="off" /></div></div></div>
            <div className="col-md-6"><div className="fv-row mb-6 enhanced-form-group"><label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="new_module_code">Enter New Course Code</label><div className="enhanced-input-wrapper"><input type="text" className="form-control form-control-lg form-control-solid enhanced-input" id="new_module_code" value={updateCourseCode.new_course_code} onChange={(e) => { setUpdateCourseCode({ ...updateCourseCode, new_course_code: e.target.value }) }} autoComplete="off" /></div></div></div>
            <button className="btn btn-primary w-100" onClick={handleSubmitCourseCodeUpdate}>Submit</button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(Course);
