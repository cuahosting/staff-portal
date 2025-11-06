import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { useNavigate, useParams } from "react-router";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import
  {
    formatDateAndTime,
    projectAddress,
    projectEmail,
    projectHREmail,
    projectLogo,
    projectName,
    projectPhone,
    projectURL,
    projectViceChancellor,
    sendEmail,
    shortCode
  } from "../../../resources/constants";
import { saveAs } from "file-saver";

function ProcessApplicationPG(props)
{
  const token = props.login[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const [appInfo, setAppInfo] = useState([]);
  const { applicant } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState(false);
  const [semester, setSemester] = useState([]);
  const [courses, setCourses] = useState([]);
  const [approved, setApproved] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const decisionStaff = props.login;
  if (applicant === "")
  {
    navigate("/registration/admissions");
  }
  const app_type = window.location.href.split('/')[3].split('-')[2] === "pg" ? "postgraduate" : "";
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const [decision, setDecision] = useState({
    applicant_id: applicant,
    rejectReason: "",
    action: "",
    decisionStaff:
      decisionStaff[0].FirstName +
      " " +
      decisionStaff[0].MiddleName +
      " " +
      decisionStaff[0].Surname,
    decisionDate: date,
    appliedDate: "",
    type: "",
    level: "",
    semester: "",
  });

  useEffect(() =>
  {
    const getSemesters = async () =>
    {
      await axios
        .get(`${serverLink}registration/admissions/semester`, token)
        .then((response) =>
        {
          setSemester(response.data);
        });
    };
    getSemesters();
  }, []);

  useEffect(() =>
  {
    const getCourses = async () =>
    {
      axios
        .get(`${serverLink}registration/admissions/courses`, token)
        .then((response) =>
        {
          setCourses(response.data);
        })
        .catch((ex) =>
        {
          console.error(ex);
        });
    };
    getCourses();
  }, []);

  const getApplicantData = async () =>
  {
    await axios
      .get(`${serverLink}registration/admissions/payment/list/${applicant}/${app_type}`, token)
      .then((response) =>
      {
        setPaymentHistory(response.data)
      });

    await axios
      .get(`${serverLink}registration/admissions/pg/information/${applicant}`, token)
      .then((response) =>
      {
        setAppInfo(response.data);
      });
    setIsLoading(false);
  };
  useEffect(() =>
  {
    getApplicantData();
  }, []);

  const handleChange = (e) =>
  {
    const target = e.target;
    if (target.id === "action")
    {
      target.value === "2" ? setApproved(true) : setApproved(false);
      target.value === "3" ? setReason(true) : setReason(false);
    }

    setDecision({
      ...decision,
      [e.target.id]: e.target.value,
    });
  };

  const getAdmissionLetter = async () =>
  {
    const sendData = {
      applicantInfo: appInfo.applicant_data,
      applicantCourse: appInfo.course,
      decison: decision,
      school: {
        logo: projectLogo,
        name: projectName,
        address: projectAddress,
        email: projectEmail,
        phone: projectPhone,
        shortCode: shortCode,
        viceChancellor: projectViceChancellor
      }
    }
    await axios.post(`${serverLink}registration/admissions/create-pg-admission-letter-pdf`, sendData)
      .then(async (result) =>
      {
        if (result.data.message === "success")
        {
          await axios.get(`${serverLink}registration/admissions/fetch-pg-admission-pdf/${result.data.filename}`, { responseType: 'blob' })
            .then((res) =>
            {
              const pdfBlob = new Blob([res.data], { type: 'application/pdf' });
              saveAs(pdfBlob, `${decision.applicant_id}.pdf`)
            })
        }
      })
  }

  const handleSubmit = async (e) =>
  {
    e.preventDefault();
    if (decision.action.trim() === "")
    {
      showAlert("EMPTY FIELD", "Please select a decision", "error");
      return false;
    }

    if (applicant !== "")
    {
      await axios
        .put(`${serverLink}registration/admissions/admission-status`, decision, token)
        .then((result) =>
        {
          if (result.data.message === "success")
          {
            sendEmail(
              appInfo.applicant_data[0].EmailAddress,
              "Congratulations your admission has been Approved",
              "Admission Approved",
              `${appInfo.applicant_data[0].FirstName} ${appInfo.applicant_data[0].MiddleName} ${appInfo.applicant_data[0].Surname}`,
              "Admission",
              `${projectName}`
            );
            toast.success("Successfully Approve application");
            setTimeout(() =>
            {
              navigate("/registration/admissions");
            }, 1000);
          }
        })
        .catch((error) =>
        {
          showAlert(
            "NETWORK ERROR",
            "Please check your connection and try again!",
            "error"
          );
        });
    } else
    {
      navigate("/registration/admissions");
    }
  };

  const allowEnrolment = async () =>
  {
    toast.info('please wait...')
    const email = {
      email: appInfo.applicant_data[0].EmailAddress,
      subject: `${projectName.split('|')[0]} Admission`,
      title: 'Enrolment',
      name: appInfo.applicant_data[0].FirstName.charAt(0).toUpperCase() + appInfo.applicant_data[0].FirstName.slice(1),
      body: `Your admission at ${shortCode} have been confirmed, click the <a href="${projectURL}/admission/enrolment">link<a/> to fill the enrolment form. 
      <br/><br/>For inquiries, contact ${projectHREmail}`,
      signature: ''
    }
    await axios.patch(`${serverLink}registration/admissions/allow-enrolment/${applicant}`, token)
      .then((response) =>
      {
        if (response.data.message === "success")
        {
          toast.success('Applicant allowed to enrol.');
          toast.success('Notification email sent to applicant');
          sendEmail(email.email, email.subject, email.title, email.name, email.body, email.signature)
        }
        else
        {
          toast.error('try again...')
        }
      }).catch((e) =>
      {
        toast.error('Netwrok error...')
        console.log('NETWORK ERROR')
      })
  }
  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <div className="col-md-12">
        <h3>Personal Information</h3>
        <hr />
        <table className="table">
          <tbody>
            <tr>
              <td className="fw-bolder">Name</td>
              <th>
                {`${appInfo.applicant_data[0].FirstName} ${appInfo.applicant_data[0] > 0
                  ? appInfo.applicant_data[0].Middlename
                  : ""
                  } ${appInfo.applicant_data[0].Surname}`}
              </th>
            </tr>
            <tr>
              <td className="fw-bolder">Email Address</td>
              <th>{appInfo.applicant_data[0].EmailAddress}</th>
            </tr>
            <tr>
              <td className="fw-bolder">Phone Number</td>
              <th>{appInfo.applicant_data[0].PhoneNumber}</th>
            </tr>
            <tr>
              <td className="fw-bolder">Date of Birth</td>
              <th>{formatDateAndTime(appInfo.applicant_data[0].DateOfBirth, "date")}</th>
            </tr>
            <tr>
              <td className="fw-bolder">Gender</td>
              <th>{appInfo.applicant_data[0].Gender}</th>
            </tr>
            <tr>
              <td className="fw-bolder">Nationality</td>
              <th>{appInfo.applicant_data[0].Nationality}</th>
            </tr>
            <tr>
              <td className="fw-bolder">State of Origin</td>
              <th>{appInfo.applicant_data[0].StateOfOrigin}</th>
            </tr>
            <tr>
              <td className="fw-bolder">LGA</td>
              <th>{appInfo.applicant_data[0].LGA}</th>
            </tr>
            <tr>
              <td className="fw-bolder">Religion</td>
              <th>{appInfo.applicant_data[0].Religion}</th>
            </tr>
            <tr>
              <td className="fw-bolder">Occupation</td>
              <th>
                {appInfo.applicant_data[0].Occupation
                  ? appInfo.applicant_data[0].Occupation
                  : "Nil"}
              </th>
            </tr>
            <tr>
              <td className="fw-bolder">Address</td>
              <th>{appInfo.applicant_data[0].Address}</th>
            </tr>
          </tbody>
        </table>
        <hr />
        <h3>Qualifications</h3>
        <hr />
        {
          <>
            <table className="table table-row-dashed">
              <thead>
                <tr>
                  <th className="fw-bolder">Awarding Institution</th>
                  <th className="fw-bolder">Qualification Name</th>
                  <th className="fw-bolder">Qualification Title</th>
                  <th className="fw-bolder">Grade Obtained</th>
                  <th className="fw-bolder">Date Awarded</th>
                </tr>
              </thead>
              <tbody>
                {appInfo.qualification.map((q, index) => (
                  <tr key={index}>
                    <td>{q.AwardingInstitution}</td>
                    <td>{q.QualificationName}</td>
                    <td>{q.QualificationTitle}</td>
                    <td>{q.GradeObtained}</td>
                    <td>{formatDateAndTime(q.DateAwarded, "date")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr />
            <h3>Employment History </h3>
            <hr />
            <table className="table table-row-dashed">
              <thead>
                <tr>
                  <th className="fw-bolder">Employer</th>
                  <th className="fw-bolder">Employer Address</th>
                  <th className="fw-bolder">Designation</th>
                  <th className="fw-bolder">Start Date</th>
                  <th className="fw-bolder">End Date</th>
                </tr>
              </thead>
              <tbody>
                {appInfo.employment.map((e, index) => (
                  <tr key={index}>
                    <td>{e.Employer}</td>
                    <td>{e.EmployerAddress}</td>
                    <td>{e.Designation}</td>
                    <td>{formatDateAndTime(e.StartDate, "date")}</td>
                    <td>{e.EndDate ? formatDateAndTime(e.EndDate, "date") : "Present"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr />
            <h3>Supporting Documents</h3>
            <hr />
            <table className="table table-row-dashed">
              <thead>
                <tr>
                  <th className="fw-bolder">Document Name</th>
                  <th className="fw-bolder">Action</th>
                </tr>
              </thead>
              <tbody>
                {appInfo.documents.map((doc, index) => (
                  <tr key={index}>
                    <td>{doc.DocumentType}</td>
                    <td>
                      <a
                        href={`${serverLink}public/uploads/${shortCode}/application/document/${doc.FileName}`}
                        target="_blank"
                        className="btn btn-primary"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <>
              <h3>Payment History</h3>
              <table className="table table-row-dashed">
                <thead>
                  <tr>
                    <th className="fw-bolder">Description</th>
                    <th className="fw-bolder">Amount</th>
                    <th className="fw-bolder">Reference</th>
                    <th className="fw-bolder">Payment Document</th>
                    <th className="fw-bolder">Date Paid</th>
                    <th className="fw-bolder">Action</th>
                  </tr>
                </thead>
                <tbody>

                  {
                    paymentHistory.length > 0 ?
                      <>
                        {
                          paymentHistory.map((j, index) =>
                          {
                            const disabled = j.Status.toString() !== "2";
                            const visible = j.Description.toLocaleLowerCase().includes('tuition') === true ? "block" : "none"
                            return (
                              <tr key={index}>
                                <td>{j.Description}</td>
                                <td>{j.AmountPaid}</td>
                                <td>{j.PaymentReference}</td>
                                <td><a className="btn btn-sm btn-primary" target="_blank" href={`${serverLink}public/uploads/${shortCode}/application/document/${j.FilePath}`}>View Document</a></td>
                                <td>{formatDateAndTime(j.InsertedDate, "date")}</td>
                                <td>
                                  <button disabled={disabled} style={{ display: `${visible}` }} className="btn btn-sm btn-primary"
                                    onClick={allowEnrolment}>
                                    Allow Enrolment
                                  </button></td>
                              </tr>
                            )
                          })
                        }
                      </>
                      :
                      <>
                        <tr>
                          <td><h3>No Payment made</h3></td>
                        </tr>
                      </>
                  }

                </tbody>
              </table>
              <hr />
            </>
          </>
        }
        <hr />
        <h3>Course Applied</h3>
        <hr />
        <h6>{appInfo.course[0].CourseName}</h6>
        <hr />
        <h3>Admission Decision</h3>
        {/* <div className="col-lg-12"> */}
        <div className="row mt-5">
          <form onSubmit={handleSubmit}>
            <div className="col-lg-12 fv-row">
              <label className="required fs-6 fw-bold mb-2">Decision</label>
              <select
                className="form-select"
                data-placeholder="Select a Decision"
                id="action"
                required
                onChange={handleChange}
              >
                <option value="">Select option</option>
                <option value="2">Approve</option>
                <option value="3">Reject</option>
              </select>
            </div>

            {approved ? (
              <>
                <div className="row mt-5">
                  <div className="col-md-6 fv-row">
                    <label className="required fs-6 fw-bold mb-2">
                      Decision Type
                    </label>
                    <select
                      className="form-select"
                      data-placeholder="Select a Decision type"
                      id="type"
                      required
                      onChange={handleChange}
                    >
                      <option value="">Select option</option>
                      <option value="Conditional">Admission</option>
                    </select>
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="required fs-6 fw-bold mb-2">
                      Decision Semester
                    </label>
                    <select
                      className="form-select"
                      data-placeholder="Select a Decision"
                      id="semester"
                      required
                      onChange={handleChange}
                    >
                      <option value="">Select option</option>
                      <option value="First Semester">First Semester</option>
                      <option value="Second Semester">Second Semester</option>
                    </select>
                  </div>
                </div>

                <div className="row mt-5">
                  <div className="col-md-6 fv-row">
                    <label className="required fs-6 fw-bold mb-2">
                      Decision Level
                    </label>
                    <select
                      className="form-select"
                      data-placeholder="Select a Decision"
                      id="level"
                      required
                      onChange={handleChange}
                    >
                      <option value="">Select option</option>
                      <option value="500">600</option>
                      <option value="700">700</option>
                      <option value="800">800</option>
                      <option value="900">900</option>
                    </select>
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="required fs-6 fw-bold mb-2">
                      Admission Semester
                    </label>
                    <select
                      className="form-select"
                      data-placeholder="Select admission semester"
                      id="admissionSemester"
                      required
                      onChange={handleChange}
                    >
                      <option value="">Select option</option>
                      {semester.map((sem, index) => (
                        <option key={index} value={sem.SemesterCode}>
                          {sem.SemesterName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-12 fv-row">
                    <label className="required fs-6 fw-bold mb-2">Course</label>
                    <select
                      className="form-select"
                      data-control="select2"
                      data-placeholder="Select a Course"
                      id="courseCode"
                      value={appInfo.course[0].CourseCode}
                      required
                      onChange={handleChange}
                    >
                      <option value="">Select option</option>
                      {courses.map((course, index) => (
                        <option key={index} value={course.CourseCode}>
                          {course.CourseName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : null}
            {reason ? (
              <div className="d-flex flex-column mb-8">
                <label className="fs-6 fw-bold mb-2">Reason</label>
                <textarea
                  className="form-control form-control-solid"
                  rows="3"
                  placeholder="Reason for rejection"
                  onChange={handleChange}
                  id="rejectReason"
                  required
                ></textarea>
              </div>
            ) : null}

            <div className="d-flex flex-column mb-8 mt-8">
              <button type="submit" className="btn btn-primary mt-4">
                Submit
              </button>
            </div>
          </form>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}
const mapStateToProps = (state) =>
{
  return {
    login: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(ProcessApplicationPG);
