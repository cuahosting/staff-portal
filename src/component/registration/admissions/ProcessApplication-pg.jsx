import React, { useEffect, useRef, useState } from "react";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { useNavigate, useParams } from "react-router";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import AGTable from "../../common/table/AGTable";
import { formatDateAndTime, projectAddress, projectEmail, projectHREmail, projectLogo, projectName, projectPhone, projectURL, projectViceChancellor, sendEmail, shortCode } from "../../../resources/constants";
import { serverLink } from "../../../resources/url";
import { saveAs } from "file-saver";
import SearchSelect from "../../common/select/SearchSelect";
import { useReactToPrint } from "react-to-print";
import CosmopolitanAdmissionLetter from "./admission-letter/cu_admission/cu_admission_pg";

function ProcessApplicationPG(props) {
  const SEND_EMAILS = false;
  const [isLoading, setIsLoading] = useState(true);
  const [appInfo, setAppInfo] = useState([]);
  const { applicant } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState(false);
  const [semester, setSemester] = useState([]);
  const [courses, setCourses] = useState([]);
  const [approved, setApproved] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showAdmissionLetter, setShowAdmissionLetter] = useState(false);
  const componentRef = useRef();
  const [tuitionPerSemester, setTuitionPerSemester] = useState(0);

  const [qualificationTable, setQualificationTable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Awarding Institution", field: "AwardingInstitution" }, { label: "Qualification Name", field: "QualificationName" }, { label: "Qualification Title", field: "QualificationTitle" }, { label: "Grade Obtained", field: "GradeObtained" }, { label: "Date Awarded", field: "DateAwarded" }], rows: [] });
  const [employmentTable, setEmploymentTable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Employer", field: "Employer" }, { label: "Employer Address", field: "EmployerAddress" }, { label: "Designation", field: "Designation" }, { label: "Start Date", field: "StartDate" }, { label: "End Date", field: "EndDate" }], rows: [] });
  const [documentsTable, setDocumentsTable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Document Name", field: "DocumentType" }, { label: "Action", field: "action" }], rows: [] });
  const [paymentTable, setPaymentTable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Description", field: "Description" }, { label: "Amount", field: "AmountPaid" }, { label: "Reference", field: "PaymentReference" }, { label: "Payment Document", field: "PaymentDocument" }, { label: "Date Paid", field: "DatePaid" }, { label: "Action", field: "action" }], rows: [] });

  const decisionStaff = props.login;
  if (applicant === "") { navigate("/registration/admissions"); }
  const app_type = window.location.href.split('/')[3].split('-')[2] === "pg" ? "postgraduate" : "";
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const [decision, setDecision] = useState({ applicant_id: applicant, rejectReason: "", action: "", decisionStaff: decisionStaff[0].FirstName + " " + decisionStaff[0].MiddleName + " " + decisionStaff[0].Surname, decisionDate: date, appliedDate: "", type: "", level: "", semester: "" });

  useEffect(() => {
    const getSemesters = async () => {
      const { success, data } = await api.get("registration/admissions/semester");
      if (success) setSemester(data || []);
    };
    getSemesters();
  }, []);

  useEffect(() => {
    const getCourses = async () => {
      const { success, data } = await api.get("registration/admissions/courses");
      if (success && Array.isArray(data)) {
        const merged = data.flat();
        const distinctCourses = Array.from(new Map(merged.map(item => [item.CourseCode, item])).values());
        setCourses(distinctCourses);
      }
    };
    getCourses();
  }, []);

  const getApplicantData = async () => {
    const { success: paySuccess, data: payData } = await api.get(`registration/admissions/payment/list/${applicant}/${app_type}`);
    if (paySuccess && payData) {
      setPaymentHistory(payData);
      if (payData.length > 0) {
        const rows = payData.map((j, index) => {
          const disabled = j.Status.toString() !== "2";
          const visible = j.Description.toLocaleLowerCase().includes('tuition') === true ? "block" : "none";
          return { sn: index + 1, Description: j.Description, AmountPaid: j.AmountPaid, PaymentReference: j.PaymentReference, PaymentDocument: (<a className="btn btn-sm btn-primary" target="_blank" href={`${serverLink}public/uploads/${shortCode}/application/document/${j.FilePath}`}>View Document</a>), DatePaid: formatDateAndTime(j.InsertedDate, "date"), action: (<button disabled={disabled} style={{ display: `${visible}` }} className="btn btn-sm btn-primary" onClick={allowEnrolment}>Allow Enrolment</button>) };
        });
        setPaymentTable({ ...paymentTable, rows: rows });
      }
    }

    const { success: appSuccess, data: appData } = await api.get(`registration/admissions/pg/information/${applicant}`);
    if (appSuccess && appData) {
      setAppInfo(appData);
      if (appData.qualification?.length > 0) {
        const rows = appData.qualification.map((q, index) => ({ sn: index + 1, AwardingInstitution: q.AwardingInstitution, QualificationName: q.QualificationName, QualificationTitle: q.QualificationTitle, GradeObtained: q.GradeObtained, DateAwarded: formatDateAndTime(q.DateAwarded, "date") }));
        setQualificationTable({ ...qualificationTable, rows: rows });
      }
      if (appData.employment?.length > 0) {
        const rows = appData.employment.map((e, index) => ({ sn: index + 1, Employer: e.Employer, EmployerAddress: e.EmployerAddress, Designation: e.Designation, StartDate: formatDateAndTime(e.StartDate, "date"), EndDate: e.EndDate ? formatDateAndTime(e.EndDate, "date") : "Present" }));
        setEmploymentTable({ ...employmentTable, rows: rows });
      }
      if (appData.documents?.length > 0) {
        const rows = appData.documents.map((doc, index) => ({ sn: index + 1, DocumentType: doc.DocumentType, action: (<a href={`${serverLink}public/uploads/${shortCode}/application/document/${doc.FileName}`} target="_blank" className="btn btn-primary">View</a>) }));
        setDocumentsTable({ ...documentsTable, rows: rows });
      }
      if (appData.course?.length > 0) {
        setDecision(prev => ({ ...prev, courseCode: appData.course[0].CourseCode }));
        const initialTuition = Number(
          appData.course[0].TuitionFee ||
          appData.course[0].TuitionAmount ||
          appData.course[0].Amount ||
          0
        );
        setTuitionPerSemester(initialTuition);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => { getApplicantData(); }, []);

  const fetchTuitionFee = async (nextDecision) => {
    const payload = {
      CourseCode: nextDecision.courseCode,
      AdmissionLevel: nextDecision.level,
      AdmissionSemester: nextDecision.semester,
      AdmissionSchoolSemester: nextDecision.admissionSemester
    };

    if (!payload.CourseCode || !payload.AdmissionLevel || !payload.AdmissionSemester || !payload.AdmissionSchoolSemester) {
      return;
    }

    const { success, data } = await api.post("registration/admissions/tuition-fee", payload);
    if (success && Array.isArray(data) && data.length > 0) {
      setTuitionPerSemester(Number(data[0]?.TuitionAmount || 0));
    }
  };

  const handleChange = (e) => {
    const target = e.target;
    if (target.id === "action") {
      target.value === "2" ? setApproved(true) : setApproved(false);
      target.value === "3" ? setReason(true) : setReason(false);
    }
    const nextDecision = { ...decision, [e.target.id]: e.target.value };
    setDecision(nextDecision);
    if (["level", "semester"].includes(target.id)) {
      fetchTuitionFee(nextDecision);
    }
  };

  const handleSelectChange = (id, val) => {
    const nextDecision = { ...decision, [id]: val?.value || "" };
    setDecision(nextDecision);
    if (["admissionSemester", "courseCode"].includes(id)) {
      fetchTuitionFee(nextDecision);
    }
  };

  const getAdmissionLetter = async () => {
    const sendData = { applicantInfo: appInfo.applicant_data, applicantCourse: appInfo.course, decison: decision, school: { logo: projectLogo, name: projectName, address: projectAddress, email: projectEmail, phone: projectPhone, shortCode: shortCode, viceChancellor: projectViceChancellor } };
    const { success, data } = await api.post("registration/admissions/create-pg-admission-letter-pdf", sendData);
    if (success && data?.message === "success") {
      const { success: fetchSuccess, data: pdfData } = await api.get(`registration/admissions/fetch-pg-admission-pdf/${data.filename}`, null, { responseType: 'blob' });
      if (fetchSuccess) { const pdfBlob = new Blob([pdfData], { type: 'application/pdf' }); saveAs(pdfBlob, `${decision.applicant_id}.pdf`); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (decision.action.trim() === "") { showAlert("EMPTY FIELD", "Please select a decision", "error"); return false; }

    if (applicant !== "") {
      // Find the name of the selected course for the admission letter
      const selectedCourse = courses.find(c => c.CourseCode === decision.courseCode);

      const payload = {
        decision: decision,
        admission_data: {
          applicantion_id: applicant, // Backend expects this specific key (typo included)
          type: decision.type,
          level: decision.level,
          admissionSemester: decision.admissionSemester,
          semester: decision.semester,
          courseCode: decision.courseCode,
          CourseName: selectedCourse ? selectedCourse.CourseName : "",
          cons: "As specified in the university handbook", // Default admission condition
          decisionStaff: decision.decisionStaff
        }
      };

      const { success, data } = await api.put("registration/admissions/admission-status", payload);
      if (success && data?.message === "success") {
        if (SEND_EMAILS) {
          sendEmail(appInfo.applicant_data[0].EmailAddress, "Congratulations your admission has been Approved", "Admission Approved", `${appInfo.applicant_data[0].FirstName} ${appInfo.applicant_data[0].MiddleName} ${appInfo.applicant_data[0].Surname}`, "Admission", `${projectName}`);
        }
        toast.success("Successfully Approve application");
        setTimeout(() => { navigate("/registration/admissions"); }, 1000);
      }
    } else { navigate("/registration/admissions"); }
  };

  const admissionLetterData = {
    applicantInfo: appInfo.applicant_data,
    applicantCourse: appInfo.course,
    decison: decision,
    decisionDetails: [],
    school: { logo: projectLogo, name: projectName, address: projectAddress, email: projectEmail, phone: projectPhone, shortCode: shortCode, viceChancellor: projectViceChancellor },
    applicationFee: 50000,
    tuitionPerSemester
  };

  const handleAdmissionPrint = useReactToPrint({ content: () => componentRef.current });
  const printAdmission = () => {
    setShowAdmissionLetter(true);
    setTimeout(() => {
      handleAdmissionPrint();
      setShowAdmissionLetter(false);
    }, 100);
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
        <h3>Personal Information</h3><hr />
        <table className="table">
          <tbody>
            <tr><td className="fw-bolder">Name</td><th>{`${appInfo.applicant_data[0].FirstName} ${appInfo.applicant_data[0].MiddleName || ""} ${appInfo.applicant_data[0].Surname}`}</th></tr>
            <tr><td className="fw-bolder">Email Address</td><th>{appInfo.applicant_data[0].EmailAddress}</th></tr>
            <tr><td className="fw-bolder">Phone Number</td><th>{appInfo.applicant_data[0].PhoneNumber}</th></tr>
            <tr><td className="fw-bolder">Date of Birth</td><th>{formatDateAndTime(appInfo.applicant_data[0].DateOfBirth, "date")}</th></tr>
            <tr><td className="fw-bolder">Gender</td><th>{appInfo.applicant_data[0].Gender}</th></tr>
            <tr><td className="fw-bolder">Nationality</td><th>{appInfo.applicant_data[0].Nationality}</th></tr>
            <tr><td className="fw-bolder">State of Origin</td><th>{appInfo.applicant_data[0].StateOfOrigin}</th></tr>
            <tr><td className="fw-bolder">LGA</td><th>{appInfo.applicant_data[0].LGA}</th></tr>
            <tr><td className="fw-bolder">Religion</td><th>{appInfo.applicant_data[0].Religion}</th></tr>
            <tr><td className="fw-bolder">Occupation</td><th>{appInfo.applicant_data[0].Occupation ? appInfo.applicant_data[0].Occupation : "Nil"}</th></tr>
            <tr><td className="fw-bolder">Address</td><th>{appInfo.applicant_data[0].Address}</th></tr>
          </tbody>
        </table><hr />
        <h3>Qualifications</h3><hr />
        <><AGTable data={qualificationTable} /><hr /><h3>Employment History </h3><hr /><AGTable data={employmentTable} /><hr /><h3>Supporting Documents</h3><hr /><AGTable data={documentsTable} /><><h3>Payment History</h3>{paymentHistory.length > 0 ? <AGTable data={paymentTable} /> : <div className="alert alert-warning"><h3>No Payment made</h3></div>}<hr /></></><hr />
        <h3>Course Applied</h3><hr /><h6>{appInfo.course[0].CourseName}</h6><hr />
        <h3>Admission Decision</h3>
        <div className="row mt-5">
          <form onSubmit={handleSubmit}>
            <div className="col-lg-12 fv-row"><label className="required fs-6 fw-bold mb-2">Decision</label><select className="form-select" data-placeholder="Select a Decision" id="action" value={decision.action} required onChange={handleChange}><option value="">Select option</option><option value="2">Approve</option><option value="3">Reject</option></select></div>
            {approved ? (<><div className="row mt-5"><div className="col-md-6 fv-row"><label className="required fs-6 fw-bold mb-2">Decision Type</label><select className="form-select" data-placeholder="Select a Decision type" id="type" value={decision.type} required onChange={handleChange}><option value="">Select option</option><option value="Conditional">Admission</option></select></div><div className="col-md-6 fv-row"><label className="required fs-6 fw-bold mb-2">Decision Semester</label><select className="form-select" data-placeholder="Select a Decision" id="semester" value={decision.semester} required onChange={handleChange}><option value="">Select option</option><option value="First Semester">First Semester</option><option value="Second Semester">Second Semester</option></select></div></div><div className="row mt-5">
              <div className="col-md-6 fv-row"><label className="required fs-6 fw-bold mb-2">Decision Level</label><select className="form-select" data-placeholder="Select a Decision" id="level" value={decision.level} required onChange={handleChange}><option value="">Select option</option><option value="500">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option></select></div>
              <div className="col-md-6 fv-row">
                <SearchSelect
                  label="Admission Semester"
                  id="admissionSemester"
                  value={semester.find(s => s.SemesterCode === decision.admissionSemester) ? { value: decision.admissionSemester, label: semester.find(s => s.SemesterCode === decision.admissionSemester).SemesterName } : null}
                  options={semester.map(s => ({ value: s.SemesterCode, label: s.SemesterName }))}
                  onChange={(val) => handleSelectChange('admissionSemester', val)}
                  required
                />
              </div>
              <div className="col-md-12 fv-row mt-5">
                <SearchSelect
                  label="Admitted Course"
                  id="courseCode"
                  value={courses.find(c => c.CourseCode === decision.courseCode) ? { value: decision.courseCode, label: courses.find(c => c.CourseCode === decision.courseCode).CourseName } : null}
                  options={courses.map(c => ({ value: c.CourseCode, label: c.CourseName }))}
                  onChange={(val) => handleSelectChange('courseCode', val)}
                  required
                />
              </div></div></>) : null}
            {reason ? (<div className="d-flex flex-column mb-8"><label className="fs-6 fw-bold mb-2">Reason</label><textarea className="form-control form-control-solid" rows="3" placeholder="Reason for rejection" onChange={handleChange} id="rejectReason" required></textarea></div>) : null}
            <div className="d-flex flex-column mb-8 mt-8 gap-2">
              <button type="submit" className="btn btn-primary mt-2">Submit</button>
              <button
                type="button"
                className="btn btn-outline-primary"
                disabled={!approved || !decision.admissionSemester || !decision.courseCode}
                onClick={printAdmission}
              >
                Print Admission Letter
              </button>
            </div>
          </form>
        </div>
      </div>
      {showAdmissionLetter && shortCode === "CU" && <CosmopolitanAdmissionLetter componentRef={componentRef} data={admissionLetterData} />}
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(ProcessApplicationPG);
