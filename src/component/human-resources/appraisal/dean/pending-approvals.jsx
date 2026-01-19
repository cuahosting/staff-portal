import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { formatDateAndTime } from "../../../../resources/constants";

function DeanPendingApprovals(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [pendingAppraisals, setPendingAppraisals] = useState([]);
    const staffId = props.loginData.StaffID;

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        const { success, data } = await api.get(`staff/hr/appraisal/dean/pending-appraisals/${staffId}`);
        if (success) {
            setPendingAppraisals(data.data || []);
        }
        setIsLoading(false);
    };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Pending Dean Approvals" items={["Human Resources", "Appraisal", "Dean Approvals"]} />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body">
                        {pendingAppraisals.length === 0 ? (
                            <div className="alert alert-info text-center">
                                <i className="fa fa-info-circle me-2"></i>
                                No appraisals pending your review at this time.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>S/N</th>
                                            <th>Staff ID</th>
                                            <th>Staff Name</th>
                                            <th>Department</th>
                                            <th>Submission Type</th>
                                            <th>Submitted On</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingAppraisals.map((appraisal, index) => (
                                            <tr key={appraisal.EntryID}>
                                                <td>{index + 1}</td>
                                                <td><code>{appraisal.StaffID}</code></td>
                                                <td className="fw-semibold">{appraisal.StaffName}</td>
                                                <td>{appraisal.DepartmentName || 'N/A'}</td>
                                                <td>
                                                    <span className={`badge ${appraisal.SubmissionType === 'Academic' ? 'bg-success' :
                                                        appraisal.SubmissionType === 'Non-Academic' ? 'bg-warning' : 'bg-info'
                                                        }`}>
                                                        {appraisal.SubmissionType}
                                                    </span>
                                                </td>
                                                <td>{formatDateAndTime(appraisal.InsertedDate, 'datetime')}</td>
                                                <td className="text-center">
                                                    <Link
                                                        to={`/human-resources/appraisal/dean/review/${appraisal.EntryID}`}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        <i className="fa fa-eye me-1"></i>Review
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(DeanPendingApprovals);
