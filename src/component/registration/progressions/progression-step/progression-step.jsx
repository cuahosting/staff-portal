import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { serverLink } from "../../../../resources/url";
import Modal from "../../../common/modal/modal";
import ReportTable from "../../../common/table/ReportTable";
import { formatDateAndTime } from "../../../../resources/constants";

import { useForm } from "react-hook-form";

function ProgressionStep(props) {
  const token = props.loginData.token;

  const [courses, setCourses] = useState([]);
  const [progressionSteps, setProgressionSteps] = useState([]);
  const [createItem, setCreateItem] = useState({
    entry_id: "",
    code: "",
    step: "",
    level: "",
    semester: "",
    inserted_by: props.loginData.StaffID,
  });
  const { register, handleSubmit, setValue } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const columns = [
    "S/N",
    "Course",
    "Level",
    "Semester",
    "Step",
    "Added By",
    "Added Date",
    "Action",
  ];

  const getProgressionSteps = async () => {
    await axios
      .get(`${serverLink}staff/registration/progressions/progression-step`, token)
      .then((res) => {
        const data = res.data;
        let rows = [];
        if (data.message === "success") {
          data.data.length > 0 &&
            data.data.map((item, index) => {
              rows.push([
                index + 1,
                item.CourseName,
                item.CourseLevel,
                item.CourseSemester,
                item.Step,
                item.InsertedBy,
                formatDateAndTime(item.InsertedDate, "date_and_time"),
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_general"
                  onClick={() => {
                    setCreateItem({
                      entry_id: item.EntryID,
                      inserted_by: props.loginData.StaffID,
                    });
                    setValue("coursecode", item.CourseCode);
                    setValue("level", item.CourseLevel);
                    setValue("semester", item.CourseSemester);
                    setValue("step", item.Step);
                  }}
                >
                  <i className={"fa fa-pen"} />
                </button>,
              ]);
            });
        }
        setProgressionSteps(rows);
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  };

  const clearItems = () => {
    setCreateItem({
      entry_id: "",
      code: "",
      step: "",
      level: "",
      semester: "",
      inserted_by: props.loginData.StaffID,
    });
    setValue("coursecode", "");
    setValue("level", "");
    setValue("semester", "");
    setValue("step", "");
  };

  const addProgression = async (data) => {
    if (data.coursecode === "") {
      toast.error("Please select a Course");
      return false;
    }
    if (data.level === "") {
      toast.error("Please select a Level");
      return false;
    }
    if (data.semester === "") {
      toast.error("Please select a Semester");
      return false;
    }
    if (data.step === "") {
      toast.error("Please select a Step");
      return false;
    }
    if (createItem.entry_id === "") {
      setCreateItem({
        entry_id: "",
        code: data.coursecode,
        step: data.step,
        level: data.level,
        semester: data.semester,
        inserted_by: props.loginData.StaffID,
      });
      await axios
        .post(
          `${serverLink}staff/registration/progressions/progression-step`,
          createItem, token
        )
        .then((res) => {
          if (res.data.message === "success") {
            toast.success("Progression Step Added Successfully");
            document.getElementById("closeModal").click();
            getProgressionSteps();
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("NETWORK ERROR. Please try again!");
        });
    } else {
      //update
      let dataTo = {
        entry_id: createItem.entry_id,
        code: data.coursecode,
        step: data.step,
        level: data.level,
        semester: data.semester,
        inserted_by: props.loginData.StaffID,
      };
      await axios
        .patch(
          `${serverLink}staff/registration/progressions/progression-step`,
          dataTo, token
        )
        .then((res) => {
          if (res.data.message === "success") {
            toast.success("Progression Settings Updated Successfully");
            document.getElementById("closeModal").click();
            getProgressionSteps();
          } else {
            toast.error("An error has occurred. Please try again!");
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("NETWORK ERROR. Please try again!");
        });
    }
  };
  const getListOfCourses = async () => {
    await axios
      .get(`${serverLink}staff/academics/course/list`, token)
      .then((res) => {
        setCourses(res.data);
      })
      .catch();
  };

  useEffect(() => {
    getListOfCourses();
    getProgressionSteps();
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Progression Settings"}
        items={["Registraion", "Progressions", "Progression Steps"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-header border-0 pt-6">
            <div className="card-title" />
            <div className="card-toolbar">
              <div
                className="d-flex justify-content-end"
                data-kt-customer-table-toolbar="base"
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_general"
                  onClick={() => clearItems()}
                >
                  Add Progression Settings
                </button>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <ReportTable columns={columns} data={progressionSteps} />
          </div>
        </div>

        <Modal title={"Progression Settings Form"}>
          <form onSubmit={handleSubmit(addProgression)} noValidate>
            <div className="form-group">
              <label htmlFor="grade_type">Course/Program</label>
              <select
                {...register("coursecode")}
                id="coursecode"
                required
                className="form-control"
              >
                <option value="">Select Course/Program</option>
                {courses.map((item) => (
                  <option key={item.CourseCode} value={item.CourseCode}>
                    {item.CourseName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="level">Level</label>
              <select
                id="level"
                {...register("level")}
                required
                className="form-control"
              >
                <option value="">Select Level</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
                <option value="800">800</option>
                <option value="900">900</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="semester">Semester</label>
              <select
                id="semester"
                {...register("semester")}
                required
                className="form-control"
              >
                <option value="">Select Semester</option>
                <option value="First">First</option>
                <option value="Second">Second</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="step">Step</label>
              <select
                {...register("step")}
                id="step"
                required
                className="form-control"
              >
                <option value="">Select Step</option>
                <option value="1">Step 1</option>
                <option value="2">Step 2</option>
                <option value="3">Step 3</option>
                <option value="4">Step 4</option>
                <option value="5">Step 5</option>
                <option value="6">Step 6</option>
                <option value="7">Step 7</option>
                <option value="8">Step 8</option>
                <option value="9">Step 9</option>
                <option value="10">Step 10</option>
              </select>
            </div>
            <div className="form-group pt-2">
              <button className="btn btn-primary w-100">Save</button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails[0],
  };
};

export default connect(mapStateToProps, null)(ProgressionStep);
