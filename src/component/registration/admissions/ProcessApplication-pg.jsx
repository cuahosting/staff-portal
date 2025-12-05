import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { useNavigate, useParams } from "react-router";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import AGTable from "../../common/table/AGTable";
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

  // Datatable states for AG Grid
  const [qualificationTable, setQualificationTable] = useState({
    columns: [
      { label: "S/N", field: "sn" },
      { label: "Awarding Institution", field: "AwardingInstitution" },
      { label: "Qualification Name", field: "QualificationName" },
      { label: "Qualification Title", field: "QualificationTitle" },
      { label: "Grade Obtained", field: "GradeObtained" },
      { label: "Date Awarded", field: "DateAwarded" },
    ],
    rows: [],
  });

  const [employmentTable, setEmploymentTable] = useState({
    columns: [
      { label: "S/N", field: "sn" },
      { label: "Employer", field: "Employer" },
      { label: "Employer Address", field: "EmployerAddress" },
      { label: "Designation", field: "Designation" },
      { label: "Start Date", field: "StartDate" },
      { label: "End Date", field: "EndDate" },
    ],
    rows: [],
  });

  const [documentsTable, setDocumentsTable] = useState({
    columns: [
      { label: "S/N", field: "sn" },
      { label: "Document Name", field: "DocumentType" },
      { label: "Action", field: "action" },
    ],
    rows: [],
  });

  const [paymentTable, setPaymentTable] = useState({
    columns: [
      { label: "S/N", field: "sn" },
      { label: "Description", field: "Description" },
      { label: "Amount", field: "AmountPaid" },
      { label: "Reference", field: "PaymentReference" },
      { label: "Payment Document", field: "PaymentDocument" },
      { label: "Date Paid", field: "DatePaid" },
      { label: "Action", field: "action" },
    ],
    rows: [],
  });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getApplicantData = async () =>
  {
    await axios
      .get(`${serverLink}registration/admissions/payment/list/${applicant}/${app_type}`, token)
      .then((response) =>
      {
        setPaymentHistory(response.data);

        // Populate payment table
        if (response.data.length > 0) {
          let rows = [];
          response.data.forEach((j, index) => {
            const disabled = j.Status.toString() !== "2";
            const visible = j.Description.toLocaleLowerCase().includes('tuition') === true ? "block" : "none";
            rows.push({
              sn: index + 1,
              Description: j.Description,
              AmountPaid: j.AmountPaid,
              PaymentReference: j.PaymentReference,
              PaymentDocument: (
                <a className="btn btn-sm btn-primary" target="_blank" href={`${serverLink}public/uploads/${shortCode}/application/document/${j.FilePath}`}>View Document</a>
              ),
              DatePaid: formatDateAndTime(j.InsertedDate, "date"),
              action: (
                <button disabled={disabled} style={{ display: `${visible}` }} className="btn btn-sm btn-primary"
                  onClick={allowEnrolment}>
                  Allow Enrolment
                </button>
              ),
            });
          });
          setPaymentTable({
            ...paymentTable,
            rows: rows,
          });
        }
      });

    await axios
      .get(`${serverLink}registration/admissions/pg/information/${applicant}`, token)
      .then((response) =>
      {
        setAppInfo(response.data);

        // Populate qualification table
        if (response.data.qualification && response.data.qualification.length > 0) {
          let rows = [];
          response.data.qualification.forEach((q, index) => {
            rows.push({
              sn: index + 1,
              AwardingInstitution: q.AwardingInstitution,
              QualificationName: q.QualificationName,
              QualificationTitle: q.QualificationTitle,
              GradeObtained: q.GradeObtained,
              DateAwarded: formatDateAndTime(q.DateAwarded, "date"),
            });
          });
          setQualificationTable({
            ...qualificationTable,
            rows: rows,
          });
        }

        // Populate employment table
        if (response.data.employment && response.data.employment.length > 0) {
          let rows = [];
          response.data.employment.forEach((e, index) => {
            rows.push({
              sn: index + 1,
              Employer: e.Employer,
              EmployerAddress: e.EmployerAddress,
              Designation: e.Designation,
              StartDate: formatDateAndTime(e.StartDate, "date"),
              EndDate: e.EndDate ? formatDateAndTime(e.EndDate, "date") : "Present",
            });
          });
          setEmploymentTable({
            ...employmentTable,
            rows: rows,
          });
        }

        // Populate documents table
        if (response.data.documents && response.data.documents.length > 0) {
          let rows = [];
          response.data.documents.forEach((doc, index) => {
            rows.push({
              sn: index + 1,
              DocumentType: doc.DocumentType,
              action: (
                <a
                  href={`${serverLink}public/uploads/${shortCode}/application/document/${doc.FileName}`}
                  target="_blank"
                  className="btn btn-primary"
                >
                  View
                </a>
              ),
            });
          });
          setDocumentsTable({
            ...documentsTable,
            rows: rows,
          });
        }
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
            <AGTable data={qualificationTable} />
            <hr />
            <h3>Employment History </h3>
            <hr />
            <AGTable data={employmentTable} />
            <hr />
            <h3>Supporting Documents</h3>
            <hr />
            <AGTable data={documentsTable} />

            <>
              <h3>Payment History</h3>
              {
                paymentHistory.length > 0 ?
                  <AGTable data={paymentTable} />
                  :
                  <div className="alert alert-warning">
                    <h3>No Payment made</h3>
                  </div>
              }
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
