import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { formatDateAndTime } from "../../../../resources/constants";

function PendingEvaluations(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [pendingStaff, setPendingStaff] = useState([]);
    const staffId = props.loginData.StaffID;

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        const { success, data } = await api.get(`staff/hr/appraisal/hod/pending-staff/${staffId}`);
        if (success) {
            setPendingStaff(data.data || []);
        }
        setIsLoading(false);
    };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Pending Staff Evaluations" items={["Human Resources", "Appraisal", "HOD Evaluations"]} />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body">
                        {pendingStaff.length === 0 ? (
                            <div className="alert alert-info text-center">
                                <i className="fa fa-info-circle me-2"></i>
                                No staff pending evaluation at this time.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>S/N</th>
                                            <th>Staff ID</th>
                                            <th>Staff Name</th>
                                            <th>Designation</th>
                                            <th>Submission Type</th>
                                            <th>Submitted On</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingStaff.map((staff, index) => (
                                            <tr key={staff.EntryID}>
                                                <td>{index + 1}</td>
                                                <td><code>{staff.StaffID}</code></td>
                                                <td className="fw-semibold">{staff.StaffName}</td>
                                                <td>{staff.Designation || 'N/A'}</td>
                                                <td>
                                                    <span className={`badge ${staff.SubmissionType === 'Academic' ? 'bg-success' :
                                                        staff.SubmissionType === 'Non-Academic' ? 'bg-warning' : 'bg-info'
                                                        }`}>
                                                        {staff.SubmissionType}
                                                    </span>
                                                </td>
                                                <td>{formatDateAndTime(staff.InsertedDate, 'datetime')}</td>
                                                <td className="text-center">
                                                    <Link
                                                        to={`/human-resources/appraisal/hod/evaluate/${staff.EntryID}`}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        <i className="fa fa-edit me-1"></i>Evaluate
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
export default connect(mapStateToProps, null)(PendingEvaluations);
