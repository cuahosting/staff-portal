import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";

function DeanApproval(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [pendingModerations, setPendingModerations] = useState([]);
    const [processing, setProcessing] = useState(null);

    useEffect(() => { loadPending(); }, []);

    const loadPending = async () => {
        setIsLoading(true);
        const { success, data } = await api.post("staff/assessment/moderation/pending", { approvalLevel: 'DEAN' });
        if (success) setPendingModerations(data.pending || []);
        setIsLoading(false);
    };

    const approveModeration = async (mod) => {
        setProcessing(mod.ModuleCode);
        const { success, data } = await api.post("staff/assessment/moderation/approve", {
            moduleCode: mod.ModuleCode,
            semester: mod.SemesterCode,
            moderationType: 'DEPARTMENTAL',
            approvedBy: props.loginData.StaffID
        });

        if (success && data.message === 'success') {
            toast.success(`Approved moderation for ${mod.ModuleCode}. ${data.approved} students updated.`);
            loadPending();
        } else { toast.error(data.error || "Failed to approve"); }
        setProcessing(null);
    };

    const rejectModeration = async (mod) => {
        const rejectionReason = prompt("Enter reason for rejection:");
        if (!rejectionReason) return;

        setProcessing(mod.ModuleCode);
        const { success, data } = await api.post("staff/assessment/moderation/reject", {
            moduleCode: mod.ModuleCode,
            semester: mod.SemesterCode,
            moderationType: 'DEPARTMENTAL',
            rejectedBy: props.loginData.StaffID,
            rejectionReason
        });

        if (success && data.message === 'success') {
            toast.success(`Moderation rejected for ${mod.ModuleCode}`);
            loadPending();
        } else { toast.error(data.error || "Failed to reject"); }
        setProcessing(null);
    };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Dean Approval" items={["Assessment", "Moderation", "Dean Approval"]} />
            <div className="flex-column-fluid">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0"><i className="fa fa-user-tie me-2"></i>Pending Departmental Moderations</h5>
                    <span className="badge bg-primary fs-6">{pendingModerations.length} Pending</span>
                </div>

                {pendingModerations.length === 0 ? (
                    <div className="alert alert-success text-center">
                        <i className="fa fa-check-circle me-2"></i>No pending moderations for Dean approval
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th>Module</th>
                                    <th>Semester</th>
                                    <th>Students</th>
                                    <th>Score Change</th>
                                    <th>Reason</th>
                                    <th>Submitted By</th>
                                    <th>Date</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingModerations.map((mod, index) => (
                                    <tr key={index}>
                                        <td><span className="badge bg-secondary">{mod.ModuleCode}</span></td>
                                        <td>{mod.SemesterCode}</td>
                                        <td><span className="badge bg-info">{mod.StudentCount}</span></td>
                                        <td>
                                            <span className="text-muted">{mod.MinOriginal}-{mod.MaxOriginal}</span>
                                            <i className="fa fa-arrow-right mx-2 text-success"></i>
                                            <span className="text-success fw-bold">{mod.MinModerated}-{mod.MaxModerated}</span>
                                        </td>
                                        <td><small>{mod.ModerationReason}</small></td>
                                        <td>{mod.ModeratedBy}</td>
                                        <td><small>{new Date(mod.ModeratedDate).toLocaleString()}</small></td>
                                        <td className="text-center">
                                            <button className="btn btn-success btn-sm me-1" onClick={() => approveModeration(mod)} disabled={processing === mod.ModuleCode}>
                                                {processing === mod.ModuleCode ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fa fa-check me-1"></i>Approve</>}
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => rejectModeration(mod)} disabled={processing === mod.ModuleCode}>
                                                <i className="fa fa-times me-1"></i>Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(DeanApproval);
