import React, { useEffect, useState, useCallback, useMemo } from "react";
import { connect } from "react-redux";
import { api } from "../../../resources/api";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import Modal from "../../common/modal/modal";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { shortCode } from "../../../resources/constants";
import SearchSelect from "../../common/select/SearchSelect";

function InternshipManager(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [semesterList, setSemesterList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [currentRecordSemester, setCurrentRecordSemester] = useState([]);
    const [semester, setSemester] = useState({ code: "", desc: "" });
    const [studentsDatatable, setStudentsDatatable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Student ID", field: "StudentID" }, { label: "Student Name", field: "StudentName" }, { label: "Company Name", field: "CompanyName" }, { label: "Company Address", field: "CompanyAddress" }, { label: "Acceptance", field: "AcceptanceDocument" }, { label: "Status", field: "Status" }, { label: "Action", field: "action" }], rows: [] });
    const [updateStudentInternship, setUpdateStudentInternship] = useState({ EntryID: "", StudentID: "", StaffID: "", CompanyName: "", CompanyAddress: "", AcceptanceDocument: "", SupervisorName: "", SupervisorPhoneNumber: "", SemesterCode: "", Status: "" });

    const semesterOptions = useMemo(() => { return semesterList.map(s => ({ value: s.SemesterCode, label: s.Description })); }, [semesterList]);
    const staffOptions = useMemo(() => { return staffList.map(item => ({ value: item.StaffID, label: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StaffID})` })); }, [staffList]);
    const statusOptions = [{ value: "0", label: "Applied" }, { value: "1", label: "Approve" }, { value: "2", label: "Rejected" }, { value: "3", label: "Accepted" }];

    const onEdit = (e) => { setUpdateStudentInternship({ ...updateStudentInternship, [e.target.id]: e.target.value }); };

    const onInternshipApproval = async () => {
        for (let key in updateStudentInternship) { if (updateStudentInternship.hasOwnProperty(key) && key !== "SupervisorName" && key !== "SupervisorPhoneNumber" && key !== "Status") { if (updateStudentInternship[key] === "") { await showAlert("EMPTY FIELD", `Please enter ${key}`, "error"); return false; } } }
        if (updateStudentInternship.StaffID !== "" && updateStudentInternship.StaffID !== "undefined") {
            const record = [{ StudentID: updateStudentInternship.StudentID, StaffID: updateStudentInternship.StaffID, CompanyName: updateStudentInternship.CompanyName, CompanyAddress: updateStudentInternship.CompanyAddress, SupervisorName: updateStudentInternship.StaffID, SupervisorPhoneNumber: updateStudentInternship.SupervisorPhoneNumber, SemesterCode: updateStudentInternship.SemesterCode, Status: updateStudentInternship.Status }];
            const sendData = { records: record };
            toast.info("Submitting. Please wait...");
            const { success } = await api.patch("staff/users/internship-manager/update/supervisor/info", sendData);
            if (success) { toast.success("Record updated successfully"); getAllRecords(); document.getElementById("closeModal").click(); }
            else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
        }
    };

    const getSemesters = useCallback(async () => {
        const { success, data } = await api.get("registration/registration-report/semester-list/");
        if (success && data) { setSemesterList(data); }
        setIsLoading(false);
    }, []);

    const getStaffMemo = useCallback(async () => {
        const { success, data } = await api.get("staff/hr/staff-management/staff/list");
        if (success && data) { setStaffList(data); }
        setIsLoading(false);
    }, []);

    useEffect(() => { getSemesters(); getStaffMemo(); }, [getSemesters, getStaffMemo]);

    const handleChange = async (e) => {
        setIsLoading(true);
        setSemester({ ...semester, [e.target.id]: e.target.value });
        const semesterCode = e.target.value;
        if (semesterCode !== "") {
            const { success, data: result } = await api.get(`staff/users/internship-manager/student/list/${semesterCode}`);
            if (success && result?.length > 0) {
                let rows = [];
                result.forEach((item, index) => {
                    rows.push({ sn: index + 1, StudentID: item.StudentID, CompanyName: item.CompanyName, CompanyAddress: item.CompanyAddress, CompanyState: item.CompanyState, AcceptanceDocument: (<>{item.AcceptanceDocument ? (<a className="btn btn-sm btn-danger" target="_blank" rel="noreferrer" href={`${serverLink}public/uploads/${shortCode}/student_uploads/internship_uploads/${item.AcceptanceDocument}`}><i className="fa fa-file-pdf" /></a>) : (<p>No Attachment</p>)}</>), SupervisorName: item.SupervisorName, SupervisorPhoneNumber: item.SupervisorPhoneNumber, SemesterCode: item.SemesterCode, Status: (<>{item.Status === 0 && (<span className="badge badge-info">Applied</span>)}{item.Status === 1 && (<span className="badge badge-light-info">Approved</span>)}{item.Status === 2 && (<span className="badge badge-danger">Rejected</span>)}{item.Status === 3 && (<span className="badge badge-success">Accepted</span>)}</>), action: (<button className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => { setUpdateStudentInternship({ StudentID: item.StudentID, CompanyName: item.CompanyName, CompanyAddress: item.CompanyAddress, CompanyState: item.CompanyState, AcceptanceDocument: item.AcceptanceDocument, SupervisorName: item.SupervisorName, SupervisorPhoneNumber: item.SupervisorPhoneNumber, SemesterCode: item.SemesterCode, Status: item.Status }); setCurrentRecordSemester(item.SemesterCode); }}><i className="fa fa-pen" /></button>) });
                });
                setStudentsDatatable({ ...studentsDatatable, columns: studentsDatatable.columns, rows: rows });
            } else { setStudentsDatatable({ ...studentsDatatable, columns: studentsDatatable.columns, rows: [] }); }
        }
        setIsLoading(false);
    };

    const getAllRecords = async () => {
        if (currentRecordSemester !== "") {
            const { success, data: result } = await api.get(`staff/users/internship-manager/student/list/${currentRecordSemester}`);
            if (success && result?.length > 0) {
                let rows = [];
                result.forEach((item, index) => {
                    rows.push({ sn: index + 1, StudentID: item.StudentID, CompanyName: item.CompanyName, CompanyAddress: item.CompanyAddress, CompanyState: item.CompanyState, AcceptanceDocument: (<>{item.AcceptanceDocument ? (<a className="btn btn-sm btn-danger" target="_blank" rel="noreferrer" href={`${serverLink}public/uploads/${shortCode}/student_uploads/internship_uploads/${item.AcceptanceDocument}`}><i className="fa fa-file-pdf" /></a>) : (<p>{"No Attachment"}</p>)}</>), SupervisorName: item.SupervisorName, SupervisorPhoneNumber: item.SupervisorPhoneNumber, SemesterCode: item.SemesterCode, Status: (<>{item.Status === 0 && (<span className="badge badge-info">Applied</span>)}{item.Status === 1 && (<span className="badge badge-light-info">Approved</span>)}{item.Status === 2 && (<span className="badge badge-danger">Rejected</span>)}{item.Status === 3 && (<span className="badge badge-success">Accepted</span>)}</>), action: (<button className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setUpdateStudentInternship({ StudentID: item.StudentID, CompanyName: item.CompanyName, CompanyAddress: item.CompanyAddress, CompanyState: item.CompanyState, AcceptanceDocument: item.AcceptanceDocument, SupervisorName: item.SupervisorName, SupervisorPhoneNumber: item.SupervisorPhoneNumber, SemesterCode: item.SemesterCode, Status: item.Status })}><i className="fa fa-pen" /></button>) });
                });
                setStudentsDatatable({ ...studentsDatatable, columns: studentsDatatable.columns, rows: rows });
            } else { setStudentsDatatable({ ...studentsDatatable, columns: studentsDatatable.columns, rows: [] }); }
        }
    };

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Internship Approval"} items={["Users", "Internship Approval"]} />
            <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-body p-0"><div className="col-md-12 fv-row pt-10"><label className="required fs-6 fw-bold mb-2">Select Semester</label><SearchSelect id="code" value={semesterOptions.find(opt => opt.value === semester.code) || null} options={semesterOptions} onChange={(selected) => handleChange({ target: { id: 'code', value: selected?.value || '' } })} placeholder="Select option" isClearable={false} /></div><br />{studentsDatatable.rows.length > 0 ? (<AGTable data={studentsDatatable} />) : (<div className="alert alert-info col-md-12">Kindly select semester to view students internship for approval or the selected semester has no students.</div>)}<Modal title={"Approve Student Internship"}><div className="col-lg-12 col-md-12"><div className="form-group"><label htmlFor="StaffID">StaffID</label><SearchSelect id="StaffID" value={staffOptions.find(opt => opt.value === updateStudentInternship.StaffID) || null} options={staffOptions} onChange={(selected) => onEdit({ target: { id: 'StaffID', value: selected?.value || '' } })} placeholder="Select Option" isClearable={false} /></div></div><div className="col-lg-12 col-md-12 pt-5"><div className="form-group"><label htmlFor="SupervisorPhoneNumber">Supervisor PhoneNumber</label><input type="text" id="SupervisorPhoneNumber" className="form-control" placeholder="Supervisor Phone Number" value={updateStudentInternship.SupervisorPhoneNumber} onChange={onEdit} /></div></div><div className="col-lg-12 col-md-12"><div className="form-group pt-3"><label htmlFor="Status">Decision</label><SearchSelect id="Status" value={statusOptions.find(opt => opt.value === String(updateStudentInternship.Status)) || null} options={statusOptions} onChange={(selected) => onEdit({ target: { id: 'Status', value: selected?.value || '' } })} placeholder="Select Option" isClearable={false} /></div></div><div className="form-group pt-5"><button onClick={onInternshipApproval} className="btn btn-primary w-100">Submit</button></div></Modal></div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(InternshipManager);
