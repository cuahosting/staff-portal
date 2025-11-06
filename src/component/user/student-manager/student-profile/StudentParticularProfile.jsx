import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { serverLink } from "../../../../resources/url";
import Modal from "../../../common/modal/modal";
import ReportTable from "../../../common/table/report_table";
import { formatDateAndTime } from "../../../../resources/constants";
import { CommentsDisabledOutlined } from "@mui/icons-material";

import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";

function StudentParticularProfile(props) {
  const token = props.loginData.token;

  const [isLoading, setIsLoading] = useState(false);
  const [studentInformation, setStudentInformation] = useState([]);
  const { id } = useParams();
  const getStudentDetails = async () => {
    await axios
      .get(`${serverLink}staff/users/student-manager/get-this-student/${id}`, token)
      .then((res) => {
        setStudentInformation(res.data.data);
      })
      .catch((error) => {
        console.log("NETWORK ERROR", error);
      });
  };

  useEffect(() => {
    getStudentDetails();
  }, []);
  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Student Profile"}
        items={["Users", "Student Manager", "Student Particular Profile"]}
      />

      <div className="d-flex flex-wrap flex-sm-nowrap mb-3">
        <div className="me-7 mb-4">
          <div className="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">
            <img src={"https://via.placeholder.com/150"} alt="Staff" />
            <div className="position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border border-4 border-white h-20px w-20px"></div>
          </div>
        </div>

        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
            <div className="d-flex flex-column">
              <div className="d-flex align-items-center mb-2">
                <Link
                  to="#"
                  className="text-gray-900 text-hover-primary fs-2 fw-bolder me-1"
                >
                  {studentInformation[0]?.FirstName}{" "}
                  {studentInformation[0]?.MiddleName}{" "}
                  {studentInformation[0]?.Surname}{" "}
                </Link>
                {studentInformation[0]?.IsActive === 1 ? (
                  <>
                    <Link
                      to="#"
                      className="btn btn-sm btn-success fw-bolder ms-2 fs-8 py-1 px-3"
                    >
                      Active
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="#"
                      className="btn btn-sm btn-danger fw-bolder ms-2 fs-8 py-1 px-3"
                    >
                      Inactive
                    </Link>
                  </>
                )}
              </div>

              <div className="d-flex flex-wrap fw-bold fs-6 mb-4 pe-2">
                <Link
                  to="#"
                  className="d-flex align-items-center text-gray-400 text-hover-primary me-5 mb-2"
                >
                  <span className="svg-icon svg-icon-4 me-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        opacity="0.3"
                        d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12ZM12 7C10.3 7 9 8.3 9 10C9 11.7 10.3 13 12 13C13.7 13 15 11.7 15 10C15 8.3 13.7 7 12 7Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M12 22C14.6 22 17 21 18.7 19.4C17.9 16.9 15.2 15 12 15C8.8 15 6.09999 16.9 5.29999 19.4C6.99999 21 9.4 22 12 22Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </span>
                  {studentInformation[0]?.Gender}
                </Link>
                <Link
                  to="#"
                  className="d-flex align-items-center text-gray-400 text-hover-primary mb-2"
                >
                  {studentInformation[0]?.EmailAddress}
                </Link>
              </div>
              <div>
                <p>Admission Year : {studentInformation[0]?.YearOfAdmission}</p>
              </div>
            </div>
          </div>
          {/* <div className="d-flex flex-wrap flex-stack">
            <div className="d-flex flex-column flex-grow-1 pe-8">
              <div className="d-flex flex-wrap">
                <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="fs-2 fw-bolder counted">
                      {"staffInformation.staff[0].Hits"}
                    </div>
                  </div>
                  <div className="fw-bold fs-6 text-gray-400">Profile Hit</div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-0">
            <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-8">
              <li className="nav-item">
                <Link
                  className="nav-link text-active-primary pb-4 active"
                  data-bs-toggle="tab"
                  to="#biography"
                >
                  Biography
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link text-active-primary pb-4"
                  data-kt-countup-tabs="true"
                  data-bs-toggle="tab"
                  to="#guardian"
                >
                  Guardian Details
                </Link>
              </li>
            </ul>
            <div className="tab-content w-100" id="myTabContent">
              <div
                className="tab-pane fade active show"
                id="biography"
                role="tabpanel"
              >
                <div className="row">
                  <div className="card-body p-9">
                    <div className="row mb-7">
                      <label className="col-lg-4 fw-bold text-muted">
                        Full Name
                      </label>
                      <div className="col-lg-8">
                        <span className="fw-bolder fs-6 text-gray-800">
                          {studentInformation[0]?.FirstName}{" "}
                          {studentInformation[0]?.MiddleName}{" "}
                          {studentInformation[0]?.Surname}{" "}
                        </span>
                      </div>
                    </div>
                    <div className="row mb-7">
                      <label className="col-lg-4 fw-bold text-muted">
                        Department
                      </label>
                      <div className="col-lg-8 fv-row">
                        <span className="fw-bold text-gray-800 fs-6">
                          {studentInformation[0]?.CourseCode}
                        </span>
                      </div>
                    </div>
                    <div className="row mb-7">
                      <label className="col-lg-4 fw-bold text-muted">
                        Contact Phone
                        <i
                          className="fas fa-exclamation-circle ms-1 fs-7"
                          data-bs-toggle="tooltip"
                          title=""
                          data-bs-original-title="Phone number must be active"
                          aria-label="Phone number must be active"
                        ></i>
                      </label>
                      <div className="col-lg-8 d-flex align-items-center">
                        <span className="fw-bolder fs-6 text-gray-800 me-2">
                          {studentInformation[0]?.PhoneNumber}
                        </span>
                        {/*<span className="badge badge-success">*/}
                        {/*  Verified*/}
                        {/*</span>*/}
                      </div>
                    </div>
                    <div className="row mb-7">
                      <label className="col-lg-4 fw-bold text-muted">
                        Nataionality
                        <i
                          className="fas fa-exclamation-circle ms-1 fs-7"
                          data-bs-toggle="tooltip"
                          title=""
                          data-bs-original-title="Country of origination"
                          aria-label="Country of origination"
                        ></i>
                      </label>
                      <div className="col-lg-8">
                        <span className="fw-bolder fs-6 text-gray-800">
                          {studentInformation[0]?.Nationality}
                        </span>
                      </div>
                    </div>
                    <div className="row mb-7">
                      <label className="col-lg-4 fw-bold text-muted">
                        State
                      </label>
                      <div className="col-lg-8">
                        <span className="fw-bolder fs-6 text-gray-800">
                          {studentInformation[0]?.StateOfOrigin}
                        </span>
                      </div>
                    </div>
                    <div className="row mb-10">
                      <label className="col-lg-4 fw-bold text-muted">LGA</label>
                      <div className="col-lg-8">
                        <span className="fw-bold fs-6 text-gray-800">
                          {studentInformation[0]?.Lga}
                        </span>
                      </div>
                    </div>
                    <div className="row mb-10">
                      <label className="col-lg-4 fw-bold text-muted">
                        Student Semester
                      </label>
                      <div className="col-lg-8">
                        <span className="fw-bold fs-6 text-gray-800">
                          {studentInformation[0]?.StudentSemester}
                        </span>
                      </div>
                    </div>
                    <div className="row mb-10">
                      <label className="col-lg-4 fw-bold text-muted">
                        Student Level
                      </label>
                      <div className="col-lg-8">
                        <span className="fw-bold fs-6 text-gray-800">
                          {studentInformation[0]?.StudentLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="guardian" role="tabpanel">
                <div className="row mb-10">
                  <label className="col-lg-4 fw-bold text-muted">
                    Guardian Name
                  </label>
                  <div className="col-lg-8">
                    <span className="fw-bold fs-6 text-gray-800">
                      {studentInformation[0]?.ParentName}
                    </span>
                  </div>
                </div>
                <div className="row mb-10">
                  <label className="col-lg-4 fw-bold text-muted">
                    Guardian Contact
                  </label>
                  <div className="col-lg-8">
                    <span className="fw-bold fs-6 text-gray-800">
                      {studentInformation[0]?.ParentPhoneNumber}
                    </span>
                  </div>
                </div>

                <div className="row mb-10">
                  <label className="col-lg-4 fw-bold text-muted">
                    Guardian Address
                  </label>
                  <div className="col-lg-8">
                    <span className="fw-bold fs-6 text-gray-800">
                      {studentInformation[0]?.ParentAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails[0],
  };
};

export default connect(mapStateToProps, null)(StudentParticularProfile);
