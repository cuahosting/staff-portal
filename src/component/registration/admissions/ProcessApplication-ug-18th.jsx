import React, { useEffect, useState } from "react";
import { api } from "../../../resources/api";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { useNavigate, useParams } from "react-router";
import { showAlert, showConfirm } from "../../common/sweetalert/sweetalert";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import AGTable from "../../common/table/AGTable";
import { AdmissionSuccessfulEmailTemplate, admissionEmail, sendEmail, projectName, formatDateAndTime, projectHREmail, shortCode, projectAddress, projectURL, projectLogo, projectEmail, projectPhone, projectViceChancellor } from "../../../resources/constants";
import { saveAs } from "file-saver";

function ProcessApplication(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [appInfo, setAppInfo] = useState([]);
  const { applicant } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState(false);
  const [approved, setApproved] = useState(false);
  const [showConditional, setShowCondional] = useState(false);
  const [conditional, setConditional] = useState(false);
  const [semester, setSemester] = useState([]);
  const [courses, setCourses] = useState([]);
  const decisionStaff = props.login;
  if (applicant === "") { navigate("/registration/admissions"); }
  const app_type = window.location.href.split('/')[3].split('-')[2] === "ug" ? "undergraduate" : "";
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [documentsTable, setDocumentsTable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Document Name", field: "DocumentType" }, { label: "Action", field: "action" }], rows: [] });
  const [paymentTable, setPaymentTable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Description", field: "Description" }, { label: "Amount", field: "AmountPaid" }, { label: "Reference", field: "PaymentReference" }, { label: "Payment Document", field: "PaymentDocument" }, { label: "Date Paid", field: "DatePaid" }, { label: "Action", field: "action" }], rows: [] });
  const [decision, setDecision] = useState({ applicant_id: applicant, rejectReason: "", action: "", decisionStaff: decisionStaff[0].FirstName + " " + decisionStaff[0].MiddleName + " " + decisionStaff[0].Surname, decisionDate: date, appliedDate: "", type: "", level: "", semester: "", admissionSemester: props.currentSemester, courseCode: "", CourseName: "", con1: "", con2: "", con3: "", con4: "", con5: "" });

  useEffect(() => {
    const getSemesters = async () => { const { success, data } = await api.get("registration/admissions/semester"); if (success) setSemester(data || []); };
    getSemesters();
  }, []);

  useEffect(() => {
    const getCourses = async () => { const { success, data } = await api.get("registration/admissions/courses"); if (success) setCourses(data || []); };
    getCourses();
  }, []);

  const getApplicantData = async () => {
    const { success: paySuccess, data: payData } = await api.get(`registration/admissions/payment/list/${applicant}/${app_type}`);
    if (paySuccess && payData) {
      setPaymentHistory(payData);
      if (payData.length > 0) {
        const rows = payData.map((j, index) => {
          const disabled = j.Status.toString() !== "2";
          const visible = j.Description.toLocaleLowerCase().includes('tuition') ? "block" : "none";
          return { sn: index + 1, Description: j.Description, AmountPaid: j.AmountPaid, PaymentReference: j.PaymentReference, PaymentDocument: (<a className="btn btn-sm btn-primary" target="_blank" href={`${serverLink}public/uploads/${shortCode}/application/document/${j.FilePath}`}>View Document</a>), DatePaid: formatDateAndTime(j.InsertedDate, "date"), action: (<button disabled={disabled} style={{ display: `${visible}` }} className="btn btn-sm btn-primary" onClick={allowEnrolment}>Allow Enrolment</button>) };
        });
        setPaymentTable({ ...paymentTable, rows: rows });
      }
    }

    const { success: appSuccess, data: appData } = await api.get(`registration/admissions/ug/information/${applicant}`);
    if (appSuccess && appData) {
      setDecision({ ...decision, courseCode: appData.course[0].CourseCode, CourseName: appData.course[0].CourseName });
      setAppInfo(appData);
      if (appData.documents?.length > 0) {
        const rows = appData.documents.map((doc, index) => ({ sn: index + 1, DocumentType: doc.DocumentType, action: (<a href={`${serverLink}public/uploads/${shortCode}/application/document/${doc.FileName}`} target="_blank" className="btn btn-primary">View</a>) }));
        setDocumentsTable({ ...documentsTable, rows: rows });
      }
    }
    setIsLoading(false);
  };

  useEffect(() => { getApplicantData(); }, []);

  const handleChange = (e) => {
    const target = e.target;
    setDecision({ ...decision, [e.target.id]: e.target.value });
    if (target.id === "action") {
      if (target.value === "2") { setConditional(true); setReason(false); setApproved(false); setShowCondional(false); }
      if (target.value === "3") { setReason(true); setShowCondional(false); setApproved(false); setConditional(false); }
    }
    if (e.target.id === "courseCode") { setDecision({ ...decision, [e.target.id]: e.target.value, CourseName: courses.filter(x => x.CourseCode === e.target.value)[0].CourseName }); }
    if (target.id === "type") {
      if (target.value === "Conditional") { setShowCondional(true); setReason(false); setApproved(false); }
      if (target.value === "Direct Entry") { setApproved(true); setShowCondional(false); setReason(false); }
    }
  };

  const getAdmissionLetter = async () => {
    const sendData = { applicantInfo: appInfo.applicant_data, applicantCourse: appInfo.course, decison: decision, school: { logo: projectLogo, name: projectName, address: projectAddress, email: projectEmail, phone: projectPhone, shortCode: shortCode, viceChancellor: projectViceChancellor } };
    const { success, data } = await api.post("registration/admissions/create-ug-admission-letter-pdf", sendData);
    if (success && data?.message === "success") {
      const { success: fetchSuccess, data: pdfData } = await api.get(`registration/admissions/fetch-ug-admission-pdf/${data.filename}`, null, { responseType: 'blob' });
      if (fetchSuccess) { const pdfBlob = new Blob([pdfData], { type: 'application/pdf' }); saveAs(pdfBlob, `${decision.applicant_id}.pdf`); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const values = [];
    for (var key in decision) { if (decision.hasOwnProperty(key) && key.includes("con")) { values.push(decision[key]); } }
    const checked = values.map((val) => `<li>${val}</li>`);
    if (decision.action.trim() === "") { showAlert("EMPTY FIELD", "Please select a decision", "error"); return false; }

    showConfirm("CONFIRM", `Are you sure you want ${decision.action === "2" ? "Approve?" : "Deny?"}`, "warning").then(async (isConfirm) => {
      if (isConfirm) {
        if (applicant !== "") {
          const { success, data } = await api.put("registration/admissions/admission-status", decision);
          if (success) {
            if (decision.action === "2" && decision.type === "Direct Entry") {
              if (shortCode !== "OUB") { getAdmissionLetter(); }
              admissionEmail(appInfo.applicant_data[0].EmailAddress, `${shortCode}/APP/${applicant}`, `${projectName.split('|')[0]} Admission`, "Admission", `${appInfo.applicant_data[0].FirstName} ${appInfo.applicant_data[0].MiddleName !== "" ? appInfo.applicant_data[0].MiddleName : ""} ${appInfo.applicant_data[0].Surname}`, AdmissionSuccessfulEmailTemplate(), `Admissions Office, ${projectName.split('|')[0]}`);
            } else if (decision.action === "2" && decision.type === "Conditional") {
              if (shortCode !== "OUB") { getAdmissionLetter(); }
              admissionEmail(appInfo.applicant_data[0].EmailAddress, "", `${projectName.split('|')[0]} Admission`, "Letter of Provisional Admission", `${appInfo.applicant_data[0].FirstName} ${appInfo.applicant_data[0].Middlename > 0 ? appInfo.applicant_data[0].Middlename : ""} ${appInfo.applicant_data[0].Surname}`, `<br />We are happy to inform you that you have been given provisional admission into ${projectName.split('|')[0]}.<br/>Provisional admission means that While you have met some of the requirements for admission into ${shortCode}, you have not met all the requirements for the admission into ${shortCode}.<br/>Of the listed items below, the checked-marked one(s) is/are the requirement(s) for you to be fully admitted into ${shortCode}.<ol>${checked}</ol><br/>You have one month period of time within which to provide ${shortCode} with the above indicated item(s), failing which, your admission into ${shortCode} may be postpone to another semester, academic year or rescinded altogether.<br/>We look forward to you completing your admission requirements and joining OUB for your educational pursuits.<br />Kindly login to your <a href="https://www.oliviauniversity.edu.bi/admission/application/login">application portal</a> to download your admission letter.<br/>Best wishes!<br />&nbsp;<br/>Registrar,<br/>${projectName.split('|')[0]}<br/>${projectAddress}`, `Admissions Office ${shortCode}`);
            }
            if (data?.message === "success") { toast.success("Successfully Approve application"); }
          }
        }
      }
    });
  };

  const allowEnrolment = async () => {
    toast.info('please wait...');
    const email = { email: appInfo.applicant_data[0].EmailAddress, subject: `${projectName.split('|')[0]} Admission`, title: 'Enrolment', name: appInfo.applicant_data[0].FirstName.charAt(0).toUpperCase() + appInfo.applicant_data[0].FirstName.slice(1), body: `Your admission at ${shortCode} have been confirmed, click the <a href="${projectURL}/admission/enrolment">link<a/> to fill the enrolment form. <br/><br/>For inquiries, contact ${projectHREmail}`, signature: '' };
    const { success, data } = await api.patch(`registration/admissions/allow-enrolment/${applicant}`, {});
    if (success && data?.message === "success") { toast.success('Applicant allowed to enrol.'); toast.success('Notification email sent to applicant'); sendEmail(email.email, email.subject, email.title, email.name, email.body, email.signature); }
    else if (success) { toast.error('try again...'); }
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <div className="col-md-12">
        <div className="d-flex justify-content-end">{appInfo.course[0].AdmissionLetter !== "0" && <a target={"_blank"} href={`${serverLink}public/uploads/${shortCode}/admission-letters/${appInfo.course[0].AdmissionLetter}.pdf`} className="btn btn-sm btn-primary">Print Admission Letter</a>}</div>
        <h3>Personal Information</h3>
        <table className="table"><tbody><tr><td className="fw-bolder">Name</td><th>{`${appInfo.applicant_data[0].FirstName} ${appInfo.applicant_data[0] > 0 ? appInfo.applicant_data[0].Middlename : ""} ${appInfo.applicant_data[0].Surname}`}</th></tr><tr><td className="fw-bolder">Email Address</td><th>{appInfo.applicant_data[0].EmailAddress}</th></tr><tr><td className="fw-bolder">Phone Number</td><th>{appInfo.applicant_data[0].PhoneNumber}</th></tr><tr><td className="fw-bolder">Date of Birth</td><th>{formatDateAndTime(appInfo.applicant_data[0].DateOfBirth, "date")}</th></tr><tr><td className="fw-bolder">Gender</td><th>{appInfo.applicant_data[0].Gender}</th></tr><tr><td className="fw-bolder">Nationality</td><th>{appInfo.applicant_data[0].Nationality}</th></tr><tr><td className="fw-bolder">State of Origin</td><th>{appInfo.applicant_data[0].StateOfOrigin}</th></tr><tr><td className="fw-bolder">LGA</td><th>{appInfo.applicant_data[0].LGA}</th></tr><tr><td className="fw-bolder">Religion</td><th>{appInfo.applicant_data[0].Religion}</th></tr><tr><td className="fw-bolder">Occupation</td><th>{appInfo.applicant_data[0].Occupation ? appInfo.applicant_data[0].Occupation : "Nil"}</th></tr><tr><td className="fw-bolder">Address</td><th>{appInfo.applicant_data[0].Address}</th></tr></tbody></table><hr />
        <h3>O'level Information</h3>
        <table className="table table-row-dashed"><thead><tr><th className="fw-bolder">Exam Type</th><th className="fw-bolder">Exam Center</th><th className="fw-bolder">Exam Number</th><th className="fw-bolder">Exam Year</th></tr></thead><tbody>{appInfo.olevel_sitting.map((sit, index) => (<tr key={index}><td>{sit.ExamsType}</td><td>{sit.ExamsCenter}</td><td>{sit.ExamsNumber}</td><td>{sit.ExaminationYear}</td></tr>))}{appInfo.oLevel.map((olevel, index) => (<tr key={index}><td>{olevel.ExamsSubject}</td><th>{olevel.Score}</th></tr>))}</tbody></table><hr />
        {!projectName.toLocaleLowerCase().includes('olivia') && (<><h3>Jamb Information</h3><table className="table table-row-dashed"><thead><tr><th className="fw-bolder">Subjects</th><th className="fw-bolder">Score</th><th className="fw-bolder">Matric Number</th><th className="fw-bolder">Exam Year</th></tr></thead><tbody>{appInfo.jamb.map((j, index) => (<tr key={index}><td>{j.SubjectName}</td><td>{j.SubjectScore}</td><td>{j.MatricNumber}</td><td>{j.ExaminationYear}</td></tr>))}</tbody></table><hr /></>)}
        <h3>Guardian Information</h3>
        <table className="table table-row-dashed">{appInfo.guardian.length > 0 ? (<tbody><tr><td className="fw-bolder">Guardian Name</td><td>{`${appInfo.guardian[0].FirstName} ${appInfo.guardian[0].Middlename > 0 ? appInfo.guardian[0].Middlename : ""} ${appInfo.guardian[0].Surname}`}</td><td className="fw-bolder">Email Address</td><td>{appInfo.guardian[0].PhoneNumber}</td></tr><tr><td className="fw-bolder">Phone Number</td><td>{appInfo.guardian[0].EmailAddress}</td><td className="fw-bolder">Gender</td><td>{appInfo.guardian[0].Gender}</td></tr><tr><td className="fw-bolder">Address</td><td>{appInfo.guardian[0].Address}</td></tr></tbody>) : (<tbody><tr><td>No Guardian Information</td></tr></tbody>)}</table><hr />
        <h3>Supporting Documents</h3><AGTable data={documentsTable} /><hr />
        <><h3>Payment History</h3>{paymentHistory.length > 0 ? <AGTable data={paymentTable} /> : <div className="alert alert-warning"><h3>No Payment made</h3></div>}<hr /></>
        <h3>Course Applied</h3><h6>{appInfo.course[0].CourseName}</h6><hr />
        <h3>Admission Decision</h3>
        <div className="col-md-12"><div className="row">
          <form onSubmit={handleSubmit}>
            <div className="col-md-12 fv-row"><label className="required fs-6 fw-bold mb-2">Decision</label><select className="form-select" data-control="select2" data-placeholder="Select a Decision" id="action" required onChange={handleChange}><option value="">Select option</option><option value="2">Approve</option><option value="3">Reject</option></select></div>
            {conditional && (<div className="col-md-12 fv-row"><div className="col-md-12 fv-row"><label className="required fs-6 fw-bold mb-2">Decision Type</label><select className="form-select" data-placeholder="Select a Decision type" data-control="select2" id="type" required onChange={handleChange}><option value="">Select option</option><option value="Conditional">Conditional</option><option value="Direct Entry">Direct Entry</option><option value="Transfer">Transfer</option><option value="Foundation">Foundation</option><option value="Remedials">Remedials</option></select></div></div>)}
            {showConditional && (<><div className="col-md-12 fv-row"><div className="row mt-5"><div className="col-md-3 fv-row"><div className="form-check form-check-custom form-check-solid"><input className="form-check-input" type="checkbox" value="High School Transcript" id="con1" onChange={handleChange} /><label className="form-check-label" htmlFor="con1">High School Transcript</label></div></div><div className="col-md-3 fv-row"><div className="form-check form-check-custom form-check-solid"><input className="form-check-input" type="checkbox" value="High School Diploma" id="con2" onChange={handleChange} /><label className="form-check-label" htmlFor="con2">College Transcript</label></div></div><div className="col-md-3 fv-row"><div className="form-check form-check-custom form-check-solid"><input className="form-check-input" type="checkbox" value="College Transcript" id="con3" onChange={handleChange} /><label className="form-check-label" htmlFor="con3">College Transcript</label></div></div><div className="col-md-3 fv-row"><div className="form-check form-check-custom form-check-solid"><input className="form-check-input" type="checkbox" value="College Degree" id="con4" onChange={handleChange} /><label className="form-check-label" htmlFor="con4">College Degree</label></div></div></div></div><div className="col-md-12"><div className="row mt-5"><div className="col-md-3 fv-row"><div className="form-check form-check-custom form-check-solid"><input className="form-check-input" type="checkbox" value="Letter(s) of recommendation" id="con5" onChange={handleChange} /><label className="form-check-label" htmlFor="con5">Letter(s) of recommendation</label></div></div></div></div></>)}
            {approved && (<><div className="row mt-5"><div className="col-md-12 fv-row"><label className="required fs-6 fw-bold mb-2">Decision Level</label><select className="form-select" data-placeholder="Select a Decision level" data-control="select2" id="level" required onChange={handleChange}><option value="">Select option</option><option value="100">100</option><option value="200">200</option><option value="300">300</option><option value="400">400</option><option value="500">500</option><option value="600">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option></select></div></div><div className="row mt-5"><div className="col-md-6 fv-row"><label className="required fs-6 fw-bold mb-2">Decision Semester</label><select className="form-select" data-placeholder="Select a Decision semester" data-control="select2" id="semester" required onChange={handleChange}><option value="">Select option</option><option value="First Semester">First Semester</option><option value="Second Semester">Second Semester</option></select></div><div className="col-md-6 fv-row"><label className="required fs-6 fw-bold mb-2">Admission Semester</label><select className="form-select" data-placeholder="Select admission semester" id="admissionSemester" required onChange={handleChange}><option value="">Select option</option>{semester.map((sem, index) => (<option key={index} value={sem.SemesterCode}>{sem.SemesterName}</option>))}</select></div><div className="col-md-12 fv-row"><label className="required fs-6 fw-bold mb-2">Course</label><select className="form-select" data-control="select2" data-placeholder="Select a Course" id="courseCode" value={decision.courseCode} required onChange={handleChange}><option value="">Select option</option>{courses.map((course, index) => (<option key={index} value={course.CourseCode}>{course.CourseName}</option>))}</select></div></div></>)}
            {reason && (<div className="d-flex flex-column mb-8"><label className="fs-6 fw-bold mb-2">Reason</label><textarea className="form-control form-control-solid" rows="3" placeholder="Reason for rejection" onChange={handleChange} id="rejectReason" required></textarea></div>)}
            <div className="d-flex flex-column mb-8 mt-8"><button type="submit" className="btn btn-primary mt-4">Submit</button></div>
          </form>
        </div></div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails, currentSemester: state.currentSemester }; };
export default connect(mapStateToProps, null)(ProcessApplication);
