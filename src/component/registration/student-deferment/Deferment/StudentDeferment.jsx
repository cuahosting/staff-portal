import React, { useEffect, useRef, useState, useMemo } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { formatDateAndTime, projectLogo } from "../../../../resources/constants";
import { useReactToPrint } from "react-to-print";
import { projectName, projectEmail, projectPhone } from "../../../../resources/url";
import AGTable from "../../../common/table/AGTable";
import { fontSize } from "@mui/system";
import SearchSelect from "../../../common/select/SearchSelect";

function StudentDeferment(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isApproved, setisApproved] = useState(false);
  const [defermentData, setDefermentData] = useState([]);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const componentRef = useRef();
  const [datatable, setDatatable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Student ID", field: "studentId" }, { label: "Student Name", field: "studentName" }, { label: "Reason", field: "reason" }, { label: "Semesters Off", field: "semestersOff" }, { label: "Guardian Name", field: "guardianName" }, { label: "Guardian Contact", field: "guardianContact" }, { label: "Applied On", field: "appliedOn" }, { label: "Status", field: "status" }, { label: "Action", field: "action" }], rows: [] });
  const [semester, setSemester] = useState({ code: "", desc: "" });

  const semesterOptions = useMemo(() => semesterList.map(s => ({ value: s.SemesterCode, label: s.Description })), [semesterList]);

  const print = useReactToPrint({ content: () => componentRef.current });

  const getSemesters = async () => {
    const { success, data } = await api.get("registration/registration-report/semester-list/");
    if (success && data) { setSemesterList(data); setIsLoading(false); }
  };

  const approveDefermentRequest = async (id) => {
    const dataTo = { InsertedBy: props.loginData.StaffID, id: id };
    const { success, data } = await api.post("staff/users/student-manager/approve-student-deferment", dataTo);
    if (success && data?.message === "success") { toast.success("Deferment Approved Successfully"); }
    else if (success) { toast.error(data?.message || "Error occurred"); }
  };

  useEffect(() => { getSemesters(); }, []);

  const handleChange = async (e) => {
    setSemester({ ...semester, [e.target.id]: e.target.value });
    const semesterCode = e.target.value;
    if (semesterCode !== "") {
      const { success, data } = await api.get(`staff/users/student-manager/student-deferment/${semesterCode}`);
      if (success && data?.message === "success" && data.data?.length > 0) {
        const rows = data.data.map((item, index) => {
          let status;
          if (item.Status === 0) status = <span className="badge badge-primary">Pending</span>;
          else if (item.Status === 1) status = <span className="badge badge-success">Approved</span>;
          else if (item.Status === 2) status = <span className="badge badge-default">Completed</span>;
          else status = <span className="badge badge-danger">Rejected</span>;
          return {
            sn: index + 1, studentId: item.StudentID, studentName: item.Name, reason: item.Reason, semestersOff: item.NumberOfSemesters, guardianName: item.ParentName, guardianContact: item.ParentPhoneNumber, appliedOn: formatDateAndTime(item.InsertedOn, "date_and_time"), status: status,
            action: (<><button type="button" className="btn btn-sm btn-primary" onClick={() => { setCanSeeReport(true); setTimeout(() => { print(); setCanSeeReport(false); }, 10); setSelectedStudent(item.StudentID); }}><i className="fa fa-print" /></button><button style={{ marginLeft: "5px", visibility: item.Status === 1 || item.Status === 3 ? "hidden" : "visible" }} type="button" onClick={() => { approveDefermentRequest(item.StudentID); }} className="btn btn-sm btn-success"><i className="fa fa-check" /></button></>)
          };
        });
        setDefermentData(data.data);
        setDatatable({ ...datatable, rows: rows });
      }
    }
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Student Deferment"} items={["Registration", "Student Deferment", "Deferment"]} />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body p-0">
            <div className="col-md-12 fv-row pt-10">
              <label className="required fs-6 fw-bold mb-2">Select Semester</label>
              <SearchSelect id="code" value={semesterOptions.find(opt => opt.value === semester.code) || null} options={semesterOptions} onChange={(selected) => handleChange({ target: { id: 'code', value: selected?.value || '' } })} placeholder="Select option" isClearable={false} />
            </div>
            <br /><AGTable data={datatable} />
          </div>
        </div>
        {canSeeReport === true && (
          <div className="table-responsive">
            <table className="table table-striped">
              <div style={{ textSize: "100%" }} className="row p-5" ref={componentRef}>
                <div className="pt-3">
                  <div className="header" style={{ fontSize: "20px", backgroundColor: "#e0e0e0", color: "black" }}>
                    <div style={{ textAlign: "center", padding: "12px", color: "black" }}>
                      <h5 style={{ textAlign: "center", color: "black" }}><img alt="Logo" src={projectLogo} style={{ height: "70px", alignText: "center" }} /><br /><p style={{ fontSize: "20px" }}>{projectName}</p></h5>
                      <p style={{ textAlign: "center", color: "black", marginButton: "50px", lineHeight: "1.6" }}>Semester Deferment Form {""} <br />Generated on: {new Date().toLocaleString().replace(",", "")}</p>
                    </div>
                  </div>
                  <div className="pt-2"><div className="" style={{ backgroundColor: "#e0e0e0", color: "black", height: "40px" }}><h6 className="pt-2 p-lg-2" style={{ fontSize: "20px", color: "black" }}>Student Information</h6></div>
                    <div className="row pt-2" style={{ fontSize: "30px" }}><div className="col-lg-9 col-sm-9"><table className="table"><tbody><tr><th scope="row">Student ID:</th>{defermentData.length > 0 && defermentData.filter((i) => i.StudentID === selectedStudent).map((r) => r.StudentID)}</tr><tr><th scope="row">Student Name:</th>{defermentData.length > 0 && defermentData.filter((i) => i.StudentID === selectedStudent).map((r) => r.Name)}</tr><tr><th scope="row">Phone Number:</th>{defermentData.length > 0 && defermentData.filter((i) => i.StudentID === selectedStudent).map((r) => r.PhoneNumber)}</tr><tr><th scope="row">Email</th>{defermentData.length > 0 && defermentData.filter((i) => i.StudentID === selectedStudent).map((r) => r.EmailAddress)}</tr><tr><th scope="row">Program:</th>{defermentData.length > 0 && defermentData.filter((i) => i.StudentID === selectedStudent).map((r) => r.CourseCode)}</tr></tbody></table></div></div>
                  </div>
                  <div className="pt-2"><div className="" style={{ backgroundColor: "#e0e0e0", color: "black", height: "40px" }}><h6 className="pt-2 p-lg-2" style={{ fontSize: "20px", color: "black" }}>Semester Information</h6></div><div className="row pt-2" style={{ fontSize: "30px" }}><div className="col-lg-9 col-sm-9"><p>Current Semester <span style={{ marginLeft: "120px" }}>{defermentData.length > 0 && defermentData.filter((i) => i.StudentID === selectedStudent).map((r) => r.CurrentSemester)}</span></p><p>Semesters Deferred <span style={{ marginLeft: "100px" }}>{defermentData.length > 0 && defermentData.filter((i) => i.StudentID === selectedStudent).map((r) => r.NumberOfSemesters)}</span></p><p>Resumption Semester <span style={{ marginLeft: "65px" }}>{defermentData.length > 0 && defermentData.filter((i) => i.StudentID === selectedStudent).map((r) => r.ReturnSemester)}</span></p><p>Deferment Reason <span style={{ marginLeft: "110px" }}>{defermentData.length > 0 && defermentData.filter((i) => i.StudentID === selectedStudent).map((r) => r.Reason)}</span></p></div></div></div>
                  <div className="pt-2"><div className="" style={{ backgroundColor: "#e0e0e0", color: "black", height: "40px" }}><h6 className="pt-2 p-lg-2" style={{ fontSize: "20px", color: "black" }}>Sponsor Information</h6></div><div className="row pt-2" style={{ fontSize: "30px" }}><div className="col-lg-9 col-sm-9"><p>Parent/Sponsor Name <span style={{ marginLeft: "50px" }}>{defermentData.length > 0 && defermentData.filter((i) => i.StudentID === selectedStudent).map((r) => r.ParentName)}</span></p><p>Parent/Sponsor Email <span style={{ marginLeft: "70px" }}>{defermentData.length > 0 && defermentData.filter((i) => i.StudentID === selectedStudent).map((r) => r.ParentPhoneNumber)}</span></p></div></div></div>
                  <div className="pt-2"><div className="" style={{ backgroundColor: "#e0e0e0", color: "black", height: "40px" }}><h6 className="pt-2 p-lg-2" style={{ fontSize: "20px", color: "black" }}>For Official Use Only</h6></div><div className="row pt-2" style={{ fontSize: "30px" }}><div className="col-lg-9 col-sm-9"><p>Approval Status <span style={{ marginLeft: "136px" }}>Approved</span></p></div></div></div>
                  <div className="pt-2" style={{ fontSize: "20px" }}><div className="pt-2"><div className="" style={{ backgroundColor: "#e0e0e0", color: "black", height: "40px" }}><h6 className="pt-5 p-lg-2" style={{ fontSize: "20px", color: "black" }}>REGISTRAR'S REMARK (IF ANY)</h6></div></div><p className="w-auto pt-5">__________________________________________________________________________________________________________________________________________</p><p className="w-auto pt-5">__________________________________________________________________________________________________________________________________________</p><p className="w-auto pt-5">SIGN:_____________________________________________________________________________________________________<br /><br /><br /><br />DATE:_______/_______/________</p><p style={{ textAlign: "center" }}>Any alteration renders this document invalid<br /> <span style={{ borderTop: "1px solid black" }}>Phone:{projectPhone} | Email:{projectEmail} | Website:</span></p></div>
                </div>
              </div>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(StudentDeferment);
