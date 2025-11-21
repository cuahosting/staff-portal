import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { connect } from "react-redux";
import PageHeader from "../../common/pageheader/pageheader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import AGTable from "../../common/table/AGTable";

function SubmissionReport(props) {
  const token = props.login[0].token;

  const [allSemester, setAllSemester] = useState([]);
  const [semester, setSemester] = useState({
    schoolSemester: "",
  });
  const [showData, setShowData] = useState(false);
  const [errors, setErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [datatable, setDatatable] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Course Name",
        field: "course",
      },
      {
        label: "Submission Status",
        field: "status",
      },
    ],
    rows: [],
  });

  useEffect(() => {
    const getSchoolSemester = async () => {
      axios
        .get(`${serverLink}staff/timetable/timetable/semester`, token)
        .then((response) => {
          setAllSemester(response.data);
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getSchoolSemester();
  }, []);

  const handleChange = (e) => {
    setSemester({
      ...semester,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await axios
      .get(
        `${serverLink}staff/academics/timetable-planner/submission-report/${semester.schoolSemester}`, token)
      .then((response) => {
        if (response.data.length > 0) {
          setShowData(true);
          setErrors(null);
          let rows = [];
          response.data.map((course, index) => {
            rows.push({
              sn: index + 1,
              course: course.CourseName,
              status: course.Status.toString() === "1" ? "Submitted by HOD" : course.Status.toString() === "2"? "Approved by Dean" : "Not submitted",
            });
          });
          setDatatable({
            ...datatable,
            columns: datatable.columns,
            rows: rows,
          });
        } else {
          setErrors("Report not available for this semester yet");
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

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Submission Report"}
        items={["Academics", "Timetable Planner", "Submission Report"]}
      />
      <div className="flex-column-fluid">
        <div className="card card-no-border">
          <div className="card-header border-0 pt-6">
            <div className="card-title" />
            <div className="card-toolbar"></div>
          </div>
          <div className="card-body p-0">
            <div className="col-md-12">
              <div className="row">
                <form onSubmit={handleSubmit}>
                  <div className="row fv-row">
                    <div className="col-md-8 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select School Semester
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select school semester"
                        id="schoolSemester"
                        value={semester.schoolSemester}
                        required
                        onChange={handleChange}
                      >
                        <option value="">Select option</option>
                        {allSemester.map((semester, index) => (
                          <option key={index} value={semester.SemesterCode}>
                            {semester.SemesterName}
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
            {showData ? (
              <div className="col-12 mt-9">
                <div className="card-body p-0">
                  <div className="row">
                    <div className="col-md-12">
                      <h2>All Modules </h2>
                      <AGTable data={datatable} />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {errors && (
              <div className="alert alert-danger d-flex align-items-center mt-5 p-5">
                <div className="d-flex flex-column">
                  <span>{errors}</span>
                </div>
              </div>
            )}
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

export default connect(mapStateToProps, null)(SubmissionReport);
