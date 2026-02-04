import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { formatDateAndTime } from "../../../../resources/constants";

function MyAppraisal(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [activePeriod, setActivePeriod] = useState(null);
    const [appraisalData, setAppraisalData] = useState(null);
    const [staffInfo, setStaffInfo] = useState(null);
    const [settingId, setSettingId] = useState(null);
    const [sectionCounts, setSectionCounts] = useState({});
    const staffId = props.loginData.StaffID;

    const statusLabels = {
        0: { label: "Draft", color: "secondary", icon: "fa-edit" },
        1: { label: "Submitted", color: "primary", icon: "fa-paper-plane" },
        2: { label: "HOD Evaluated", color: "info", icon: "fa-user-tie" },
        3: { label: "Pending Dean", color: "warning", icon: "fa-clock" },
        4: { label: "Pending Registrar", color: "warning", icon: "fa-clock" },
        5: { label: "Pending VC", color: "warning", icon: "fa-clock" },
        6: { label: "Completed", color: "success", icon: "fa-check-circle" }
    };

    const sections = [
        { name: "Basic Details", path: "basic-details", icon: "fa-user", required: true, key: "basicDetails" },
        { name: "Academic Positions", path: "academic-positions", icon: "fa-graduation-cap", required: false, key: "academicPositions" },
        { name: "Administrative Responsibilities", path: "admin-responsibilities", icon: "fa-briefcase", required: false, key: "adminResponsibilities" },
        { name: "Professional Memberships", path: "memberships", icon: "fa-id-card", required: false, key: "memberships" },
        { name: "Training & Development", path: "trainings", icon: "fa-certificate", required: false, key: "trainings" },
        { name: "Community Service", path: "community-service", icon: "fa-hands-helping", required: false, key: "communityService" },
        { name: "Other Contributions", path: "contributions", icon: "fa-star", required: false, key: "contributions" },
        { name: "Duty Schedule", path: "duty-schedule", icon: "fa-tasks", required: false, key: "dutySchedule" }
    ];

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);

        // Get active period
        const periodRes = await api.get("staff/hr/appraisal/settings/active");
        if (periodRes.success && periodRes.data.data) {
            setActivePeriod(periodRes.data.data);
        }

        // Get staff basic details
        const detailsRes = await api.get(`staff/hr/appraisal/staff/basic-details/${staffId}`);
        if (detailsRes.success) {
            setAppraisalData(detailsRes.data.data);
            setStaffInfo(detailsRes.data.staffInfo);
            setSettingId(detailsRes.data.settingId);
            setSectionCounts(detailsRes.data.counts || {});
        }

        setIsLoading(false);
    };

    const handleFinalSubmit = async () => {
        if (!appraisalData?.EntryID) {
            toast.warning("Please complete the Basic Details section first");
            return;
        }

        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to make changes after submission!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, submit it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { success, data } = await api.post(`staff/hr/appraisal/staff/submit/${appraisalData.EntryID}`);
                if (success && data.message === 'success') {
                    Swal.fire(
                        'Submitted!',
                        'Your appraisal has been submitted.',
                        'success'
                    );
                    loadData();
                } else {
                    toast.error("Submission failed");
                }
            }
        });
    };

    const currentStatus = appraisalData?.AppStatus ?? -1;
    const statusInfo = statusLabels[currentStatus] || { label: "Not Started", color: "light", icon: "fa-hourglass-start" };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="My Appraisal" items={["Human Resources", "Appraisal", "My Appraisal"]} />
            <div className="flex-column-fluid">
                {/* Active Period Info */}
                {activePeriod ? (
                    <div className="alert alert-success mb-4">
                        <i className="fa fa-calendar-check me-2"></i>
                        <strong>Active Appraisal Period:</strong> {formatDateAndTime(activePeriod.ReportFrom, 'date')} - {formatDateAndTime(activePeriod.ReportTo, 'date')}
                    </div>
                ) : (
                    <div className="alert alert-warning mb-4">
                        <i className="fa fa-exclamation-triangle me-2"></i>
                        No active appraisal period. Please contact your administrator.
                    </div>
                )}

                {activePeriod && (
                    <>
                        {/* Status Card */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <div className="card bg-light">
                                    <div className="card-body">
                                        <h6 className="fw-bold mb-3"><i className="fa fa-user me-2"></i>Staff Information</h6>
                                        <div className="row">
                                            <div className="col-6">
                                                <small className="text-muted">Staff ID</small>
                                                <p className="mb-1 fw-semibold">{staffInfo?.StaffID}</p>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted">Name</small>
                                                <p className="mb-1 fw-semibold">{staffInfo?.FullName}</p>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted">Department</small>
                                                <p className="mb-0 fw-semibold">{staffInfo?.DepartmentName || 'N/A'}</p>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted">Designation</small>
                                                <p className="mb-0 fw-semibold">{staffInfo?.Designation || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className={`card border-${statusInfo.color}`}>
                                    <div className="card-body text-center">
                                        <h6 className="fw-bold mb-3"><i className="fa fa-chart-line me-2"></i>Appraisal Status</h6>
                                        <div className={`display-6 text-${statusInfo.color} mb-2`}>
                                            <i className={`fa ${statusInfo.icon}`}></i>
                                        </div>
                                        <span className={`badge bg-${statusInfo.color} fs-6`}>{statusInfo.label}</span>

                                        {currentStatus === 2 && (
                                            <div className="mt-3">
                                                <Link to="/human-resources/appraisal/view-hod-score" className="btn btn-info">
                                                    <i className="fa fa-eye me-2"></i>View HOD Score
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sections Grid */}
                        {currentStatus < 1 && (
                            <>
                                <h5 className="mb-3"><i className="fa fa-list me-2"></i>Appraisal Sections</h5>
                                <div className="row g-3 mb-4">
                                    {sections.map((section, index) => {
                                        let statusColor = "secondary"; // Default

                                        if (section.required) {
                                            // Basic Details (Required)
                                            statusColor = appraisalData?.EntryID ? "success" : "danger";
                                        } else {
                                            // Optional Sections
                                            const count = sectionCounts[section.key] || 0;
                                            statusColor = count > 0 ? "success" : "warning";
                                        }

                                        return (
                                            <div className="col-md-3" key={index}>
                                                <Link
                                                    to={`/human-resources/appraisal/${section.path}${appraisalData?.EntryID ? `/${appraisalData.EntryID}` : ''}`}
                                                    className={`card h-100 text-decoration-none hover-shadow border-${statusColor}`}
                                                    style={{ transition: 'all 0.2s', borderWidth: '1px' }}
                                                >
                                                    <div className="card-body text-center position-relative">
                                                        <div className={`position-absolute top-0 end-0 m-2`}>
                                                            <i className={`fa fa-circle text-${statusColor}`}></i>
                                                        </div>
                                                        <div className={`display-6 text-${statusColor} mb-2`}>
                                                            <i className={`fa ${section.icon}`}></i>
                                                        </div>
                                                        <h6 className="mb-1 text-dark">{section.name}</h6>
                                                    </div>
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Submit Button */}
                                {appraisalData?.EntryID && currentStatus === 0 && (
                                    <div className="text-center">
                                        <button
                                            className="btn btn-success btn-lg px-5"
                                            onClick={handleFinalSubmit}
                                        >
                                            <i className="fa fa-paper-plane me-2"></i>Submit Appraisal
                                        </button>
                                        <p className="text-muted mt-2">
                                            <i className="fa fa-info-circle me-1"></i>
                                            Once submitted, you cannot make further changes
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Already Submitted Message */}
                        {currentStatus >= 1 && (
                            <div className="card border-success">
                                <div className="card-body text-center py-5">
                                    <i className="fa fa-check-circle text-success display-1 mb-3"></i>
                                    <h4>Your appraisal has been submitted</h4>
                                    <p className="text-muted">
                                        {currentStatus === 1 && "Waiting for HOD evaluation"}
                                        {currentStatus === 2 && "HOD has evaluated your appraisal. Please review and respond."}
                                        {currentStatus === 3 && "Waiting for Dean review"}
                                        {currentStatus === 4 && "Waiting for Registrar review"}
                                        {currentStatus === 5 && "Waiting for VC final review"}
                                        {currentStatus === 6 && "Your appraisal cycle is complete"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(MyAppraisal);
