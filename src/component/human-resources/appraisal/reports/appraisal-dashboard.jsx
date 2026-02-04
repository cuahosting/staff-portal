import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { formatDateAndTime } from "../../../../resources/constants";

function AppraisalDashboard(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState(null);

    const statusLabels = {
        0: { label: "Draft", color: "secondary" },
        1: { label: "Submitted", color: "primary" },
        2: { label: "HOD Evaluated", color: "info" },
        3: { label: "Pending Dean", color: "warning" },
        4: { label: "Pending Registrar", color: "warning" },
        5: { label: "Pending VC", color: "warning" },
        6: { label: "Completed", color: "success" }
    };

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        const { success, data } = await api.get("staff/hr/appraisal/reports/summary");
        if (success) {
            setSummary(data);
        }
        setIsLoading(false);
    };

    const getStatusCount = (status) => {
        return summary?.statusCounts?.find(s => s.AppStatus === status)?.count || 0;
    };

    const getTotalAppraisals = () => {
        return summary?.statusCounts?.reduce((sum, s) => sum + (s.count || 0), 0) || 0;
    };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Appraisal Dashboard" items={["Human Resources", "Appraisal", "Dashboard"]} />
            <div className="flex-column-fluid">
                {/* Active Period Info */}
                {summary?.activePeriod ? (
                    <div className="alert alert-success mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <i className="fa fa-calendar-check me-2"></i>
                                <strong>Active Appraisal Period:</strong>{" "}
                                {formatDateAndTime(summary.activePeriod.ReportFrom, 'date')} - {formatDateAndTime(summary.activePeriod.ReportTo, 'date')}
                            </div>
                            <span className="badge bg-light text-dark fs-6">
                                Total Submissions: {getTotalAppraisals()}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="alert alert-warning mb-4">
                        <i className="fa fa-exclamation-triangle me-2"></i>
                        No active appraisal period configured.
                    </div>
                )}

                {/* Status Cards */}
                <div className="row g-4 mb-4">
                    {Object.entries(statusLabels).map(([status, info]) => (
                        <div className="col-md-3" key={status}>
                            <div className={`card border-${info.color} h-100`}>
                                <div className="card-body text-center">
                                    <h1 className={`display-4 text-${info.color}`}>
                                        {getStatusCount(parseInt(status))}
                                    </h1>
                                    <p className="text-muted mb-0">{info.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress Overview */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="progress" style={{ height: '40px' }}>
                            {Object.entries(statusLabels).map(([status, info]) => {
                                const count = getStatusCount(parseInt(status));
                                const total = getTotalAppraisals();
                                const percentage = total > 0 ? (count / total) * 100 : 0;
                                return percentage > 0 ? (
                                    <div
                                        key={status}
                                        className={`progress-bar bg-${info.color}`}
                                        style={{ width: `${percentage}%` }}
                                        title={`${info.label}: ${count}`}
                                    >
                                        {percentage > 10 && `${info.label} (${count})`}
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>

                {/* Department Breakdown */}
                {summary?.departmentCounts?.length > 0 && (
                    <div className="card">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>S/N</th>
                                            <th>Department</th>
                                            <th className="text-center">Submissions</th>
                                            <th>Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.departmentCounts.map((dept, index) => {
                                            const total = getTotalAppraisals();
                                            const percentage = total > 0 ? (dept.count / total) * 100 : 0;
                                            return (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-semibold">{dept.DepartmentName || 'Unknown'}</td>
                                                    <td className="text-center">
                                                        <span className="badge bg-primary">{dept.count}</span>
                                                    </td>
                                                    <td>
                                                        <div className="progress" style={{ height: '20px' }}>
                                                            <div
                                                                className="progress-bar bg-info"
                                                                style={{ width: `${percentage}%` }}
                                                            >
                                                                {percentage.toFixed(1)}%
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(AppraisalDashboard);
