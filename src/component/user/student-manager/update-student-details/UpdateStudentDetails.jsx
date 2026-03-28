import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { encryptData, formatDateAndTime } from "../../../../resources/constants";
import SearchSelect from "../../../common/select/SearchSelect";
import { useForm } from "react-hook-form";

const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Suspended", label: "Suspended" },
    { value: "Expelled", label: "Expelled" },
    { value: "Rusticated", label: "Rusticated" },
    { value: "Deferred", label: "Deferred" },
    { value: "Deceased", label: "Deceased" },
    { value: "Withdrawn", label: "Withdrawn" },
    { value: "Graduated", label: "Graduated" },
];

function UpdateStudentDetails(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckedEmail, setIsCheckedEmail] = useState(false);
    const [isCheckedStatus, setIsCheckedStatus] = useState(false);
    const [isCheckedPassword, setIsCheckedPassword] = useState(false);
    const { register, handleSubmit, setValue } = useForm();
    const [studentSelectList, setStudentSelectList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState({ StudentID: "", FirstName: "", EmailAddress: "" });
    const [studentList, setStudentList] = useState([]);
    const [statusHistory, setStatusHistory] = useState([]);
    const [reason, setReason] = useState("");

    const staffName = `${props.loginData.FirstName} ${props.loginData.MiddleName || ""} ${props.loginData.Surname}`.trim();

    const handleCheckedStatus = () => { setIsCheckedStatus(!isCheckedStatus); setValue("status", ""); setReason(""); };
    const handleCheckedEmail = () => { setIsCheckedEmail(!isCheckedEmail); setValue("Email", ""); setValue("Email2", ""); };
    const handleCheckedPass = () => { setIsCheckedPassword(!isCheckedPassword); setValue("Password", ""); };

    const updateStudentDetail = async (data) => {
        if (selectedStudent.StudentID === "") { toast.error("Please specify student ID"); return; }
        if (!isCheckedEmail && !isCheckedStatus && !isCheckedPassword) { toast.error("Please Specify Action"); return; }
        if (isCheckedStatus && data.status === "") { toast.error("Please specify Student Status"); return; }
        if (isCheckedStatus && reason.trim() === "") { toast.error("Please enter a reason for the status change"); return; }
        if (isCheckedPassword && data.Password === "") { toast.error("Please specify new password"); return; }
        if (isCheckedEmail) { if (data.Email === "") { toast.error("Please specify New School Email"); return; } if (data.Email2 === "") { toast.error("Please specify New Private Email"); return; } }
        const dataTo = { ...data, Password: encryptData(data.Password), id: selectedStudent.StudentID };
        if (isCheckedEmail) { updateEmail(dataTo); }
        if (isCheckedPassword) { updatePassword(dataTo); }
        if (isCheckedStatus) { updateStatus(dataTo); }
    };

    async function updateEmail(data) {
        const { success } = await api.patch("staff/users/student-manager/update-student-email", data);
        if (success) { toast.success("Email Updated"); } else { toast.error("An error has occurred. Please try again!"); }
    }

    async function updatePassword(data) {
        const { success } = await api.patch("staff/users/student-manager/update-student-password", data);
        if (success) { toast.success("Password Updated"); } else { toast.error("An error has occurred. Please try again!"); }
    }

    async function updateStatus(data) {
        const { success } = await api.patch("staff/users/student-manager/update-student-status", {
            ...data,
            reason,
            changedBy: staffName,
        });
        if (success) {
            toast.success("Status Updated");
            setReason("");
            fetchStatusHistory(selectedStudent.StudentID);
        } else {
            toast.error("An error has occurred. Please try again!");
        }
    }

    const getStudentDetails = async () => {
        // Fetch ALL students (not just active) so staff can reactivate suspended/expelled students
        const { success, data: result } = await api.get("staff/users/student-manager/update/get-all-student");
        if (success && result?.length > 0) {
            let rows = [];
            result.forEach((item) => {
                const statusLabel = item.Status && item.Status !== 'active' && item.Status !== 'Active' ? ` [${item.Status}]` : '';
                rows.push({ value: item.StudentID, label: `${item.FirstName} ${item.MiddleName || ''} ${item.Surname} (${item.StudentID})${statusLabel}` });
            });
            setStudentSelectList(rows);
            setStudentList(result);
        }
    };

    const handleChange = (e) => {
        const filter_student = studentList.filter((i) => i.StudentID === e.value);
        if (filter_student.length > 0) {
            setSelectedStudent({ ...selectedStudent, StudentID: filter_student[0].StudentID });
            fetchStatusHistory(filter_student[0].StudentID);
        }
    };

    const fetchStatusHistory = async (studentId) => {
        const { success, data } = await api.get(`staff/users/student-manager/student-status-history/${studentId}`);
        if (success) { setStatusHistory(data || []); }
    };

    useEffect(() => { getStudentDetails(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Update Student Details"} items={["Users", "Student Manager", "Update Student Details"]} />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body">
                        <form onSubmit={handleSubmit(updateStudentDetail)}>
                            <div className="form-group mb-4">
                                <label className="fw-bold mb-2">Student ID</label>
                                <SearchSelect
                                    value={studentSelectList.find(op => op.value === selectedStudent.StudentID) || null}
                                    onChange={handleChange}
                                    options={studentSelectList}
                                    placeholder="Search Student (ID or Name)"
                                />
                            </div>

                            <div className="d-flex gap-4 pt-3 mb-4">
                                <div className="form-check">
                                    <input type="checkbox" checked={isCheckedEmail} onChange={handleCheckedEmail} className="form-check-input" id="checkEmail" />
                                    <label className="form-check-label" htmlFor="checkEmail">Update Email</label>
                                </div>
                                <div className="form-check">
                                    <input type="checkbox" checked={isCheckedStatus} onChange={handleCheckedStatus} className="form-check-input" id="checkStatus" />
                                    <label className="form-check-label" htmlFor="checkStatus">Update Status</label>
                                </div>
                                <div className="form-check">
                                    <input type="checkbox" checked={isCheckedPassword} onChange={handleCheckedPass} className="form-check-input" id="checkPassword" />
                                    <label className="form-check-label" htmlFor="checkPassword">Update Password</label>
                                </div>
                            </div>

                            {isCheckedEmail && (
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <label className="fw-bold mb-1">School Email</label>
                                        <input type="text" {...register("Email")} className="form-control" placeholder="School Email" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="fw-bold mb-1">Private Email</label>
                                        <input type="text" {...register("Email2")} className="form-control" placeholder="Private Email" />
                                    </div>
                                </div>
                            )}

                            {isCheckedStatus && (
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <label className="fw-bold mb-1">Status</label>
                                        <SearchSelect
                                            onChange={(selected) => setValue("status", selected?.value || "")}
                                            options={statusOptions}
                                            placeholder="Select Status"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="fw-bold mb-1">Reason for Change <span className="text-danger">*</span></label>
                                        <textarea
                                            className="form-control"
                                            rows={2}
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="Explain why the status is being changed..."
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {isCheckedPassword && (
                                <div className="form-group mb-4">
                                    <label className="fw-bold mb-1">New Password</label>
                                    <input type="text" {...register("Password")} className="form-control" placeholder="New Password" />
                                </div>
                            )}

                            <button className="btn btn-primary w-100 mt-2">Update</button>
                        </form>
                    </div>
                </div>

                {/* Status History */}
                {selectedStudent.StudentID && statusHistory.length > 0 && (
                    <div className="card card-no-border mt-4">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Status Change History — {selectedStudent.StudentID}</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Previous Status</th>
                                            <th>New Status</th>
                                            <th>Reason</th>
                                            <th>Changed By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {statusHistory.map((h, i) => (
                                            <tr key={i}>
                                                <td>{formatDateAndTime(h.ChangedDate, 'date_and_time')}</td>
                                                <td><span className="badge bg-secondary">{h.PreviousStatus}</span></td>
                                                <td><span className={`badge ${h.NewStatus === 'Active' ? 'bg-success' : h.NewStatus === 'Suspended' ? 'bg-warning' : h.NewStatus === 'Expelled' ? 'bg-danger' : 'bg-info'}`}>{h.NewStatus}</span></td>
                                                <td>{h.Reason || '—'}</td>
                                                <td>{h.ChangedBy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(UpdateStudentDetails);
