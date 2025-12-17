import React, { useEffect, useState, useMemo } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import Modal from "../../../common/modal/modal";
import ReportTable from "../../../common/table/ReportTable";
import { formatDateAndTime } from "../../../../resources/constants";
import SearchSelect from "../../../common/select/SearchSelect";
import { useForm } from "react-hook-form";

function ProgressionStep(props) {
  const [courses, setCourses] = useState([]);
  const [progressionSteps, setProgressionSteps] = useState([]);
  const [createItem, setCreateItem] = useState({ entry_id: "", code: "", step: "", level: "", semester: "", inserted_by: props.loginData.StaffID });
  const { register, handleSubmit, setValue, watch } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const watchedCourse = watch("coursecode", "");
  const watchedLevel = watch("level", "");
  const watchedSemester = watch("semester", "");
  const watchedStep = watch("step", "");

  const courseOptions = useMemo(() => courses.map(item => ({ value: item.CourseCode, label: item.CourseName })), [courses]);
  const levelOptions = [{ value: "100", label: "100" }, { value: "200", label: "200" }, { value: "300", label: "300" }, { value: "400", label: "400" }, { value: "500", label: "500" }, { value: "600", label: "600" }, { value: "700", label: "700" }, { value: "800", label: "800" }, { value: "900", label: "900" }, { value: "Internship", label: "Internship" }];
  const semesterOptions = [{ value: "First", label: "First" }, { value: "Second", label: "Second" }, { value: "Internship", label: "Internship" }];
  const stepOptions = [{ value: "1", label: "Step 1" }, { value: "2", label: "Step 2" }, { value: "3", label: "Step 3" }, { value: "4", label: "Step 4" }, { value: "5", label: "Step 5" }, { value: "6", label: "Step 6" }, { value: "7", label: "Step 7" }, { value: "8", label: "Step 8" }, { value: "9", label: "Step 9" }, { value: "10", label: "Step 10" }];
  const columns = ["S/N", "Course", "Level", "Semester", "Step", "Added By", "Added Date", "Action"];

  const getProgressionSteps = async () => {
    const { success, data } = await api.get("staff/registration/progressions/progression-step");
    if (success && data?.message === "success" && data.data?.length > 0) {
      const rows = data.data.map((item, index) => [
        index + 1, item.CourseName, item.CourseLevel, item.CourseSemester, item.Step, item.InsertedBy, formatDateAndTime(item.InsertedDate, "date_and_time"),
        <button type="button" className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => { setCreateItem({ entry_id: item.EntryID, inserted_by: props.loginData.StaffID }); setValue("coursecode", item.CourseCode); setValue("level", item.CourseLevel); setValue("semester", item.CourseSemester); setValue("step", item.Step); }}><i className={"fa fa-pen"} /></button>
      ]);
      setProgressionSteps(rows);
    }
  };

  const clearItems = () => { setCreateItem({ entry_id: "", code: "", step: "", level: "", semester: "", inserted_by: props.loginData.StaffID }); setValue("coursecode", ""); setValue("level", ""); setValue("semester", ""); setValue("step", ""); };

  const addProgression = async (data) => {
    if (data.coursecode === "") { toast.error("Please select a Course"); return false; }
    if (data.level === "") { toast.error("Please select a Level"); return false; }
    if (data.semester === "") { toast.error("Please select a Semester"); return false; }
    if (data.step === "") { toast.error("Please select a Step"); return false; }

    const dataTo = { entry_id: createItem.entry_id || "", code: data.coursecode, step: data.step, level: data.level, semester: data.semester, inserted_by: props.loginData.StaffID };
    if (createItem.entry_id === "") {
      const { success, data: result } = await api.post("staff/registration/progressions/progression-step", dataTo);
      if (success && result?.message === "success") { toast.success("Progression Step Added Successfully"); document.getElementById("closeModal").click(); getProgressionSteps(); }
      else if (success) { toast.error(result?.message || "Error occurred"); }
    } else {
      const { success, data: result } = await api.patch("staff/registration/progressions/progression-step", dataTo);
      if (success && result?.message === "success") { toast.success("Progression Settings Updated Successfully"); document.getElementById("closeModal").click(); getProgressionSteps(); }
      else if (success) { toast.error("An error has occurred. Please try again!"); }
    }
  };

  const getListOfCourses = async () => {
    const { success, data } = await api.get("staff/academics/course/list");
    if (success && data) setCourses(data);
  };

  useEffect(() => { getListOfCourses(); getProgressionSteps(); }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Progression Settings"} items={["Registraion", "Progressions", "Progression Steps"]} />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-header border-0 pt-6"><div className="card-title" /><div className="card-toolbar"><div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base"><button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => clearItems()}>Add Progression Settings</button></div></div></div>
          <div className="card-body p-0"><ReportTable columns={columns} data={progressionSteps} /></div>
        </div>
        <Modal title={"Progression Settings Form"}>
          <form onSubmit={handleSubmit(addProgression)} noValidate>
            <div className="form-group"><label htmlFor="grade_type">Course/Program</label><SearchSelect id="coursecode" value={courseOptions.find(opt => opt.value === watchedCourse) || null} options={courseOptions} onChange={(selected) => setValue("coursecode", selected?.value || "")} placeholder="Select Course/Program" isClearable={false} /></div>
            <div className="form-group"><label htmlFor="level">Level</label><SearchSelect id="level" value={levelOptions.find(opt => opt.value === watchedLevel) || null} options={levelOptions} onChange={(selected) => setValue("level", selected?.value || "")} placeholder="Select Level" isClearable={false} /></div>
            <div className="form-group"><label htmlFor="semester">Semester</label><SearchSelect id="semester" value={semesterOptions.find(opt => opt.value === watchedSemester) || null} options={semesterOptions} onChange={(selected) => setValue("semester", selected?.value || "")} placeholder="Select Semester" isClearable={false} /></div>
            <div className="form-group"><label htmlFor="step">Step</label><SearchSelect id="step" value={stepOptions.find(opt => opt.value === watchedStep) || null} options={stepOptions} onChange={(selected) => setValue("step", selected?.value || "")} placeholder="Select Step" isClearable={false} /></div>
            <div className="form-group pt-2"><button className="btn btn-primary w-100">Save</button></div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(ProgressionStep);
