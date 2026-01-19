import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";

function VcFinalReview(props) {
    const { appraisalId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [appraisalData, setAppraisalData] = useState(null);
    const [comments, setComments] = useState("");
    const vcStaffId = props.loginData.StaffID;

    useEffect(() => { loadData(); }, [appraisalId]);

    const loadData = async () => {
        setIsLoading(true);
        const { success, data } = await api.get(`staff/hr/appraisal/vc/view/${appraisalId}`);
        if (success) {
            setAppraisalData(data);
            if (data.vcSubmission) {
                setComments(data.vcSubmission.Comments || "");
            }
        }
        setIsLoading(false);
    };

    const handleSubmit = async () => {
        if (!comments.trim()) {
            toast.warning("Please enter your comments");
            return;
        }

        if (!window.confirm("Are you sure you want to complete this appraisal review?")) return;

        setSubmitting(true);
        const { success, data } = await api.post("staff/hr/appraisal/vc/submit", {
            appraisalId,
            staffId: appraisalData?.basicDetails?.StaffID,
            comments,
            insertedBy: vcStaffId
        });

        if (success && data.message === 'success') {
            toast.success("Appraisal completed successfully!");
            navigate("/human-resources/appraisal/vc/pending");
        } else {
            toast.error("Failed to complete appraisal");
        }
        setSubmitting(false);
    };

    const calculateScore = () => {
        const scores = appraisalData?.hodScores || [];
        const scored = scores.filter(s => s.ScoreType !== 'comment');
        const total = scored.reduce((sum, s) => sum + parseInt(s.Value || 0), 0);
        const max = scored.reduce((sum, s) => sum + (s.MaxScore || 0), 0);
        return { total, max, percentage: max > 0 ? Math.round((total / max) * 100) : 0 };
    };

    const scoreData = calculateScore();

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="VC Final Review" items={["Appraisal", "VC", "Final Review"]} />
            <div className="flex-column-fluid">
                {/* Staff Summary with Score */}
                <div className="row mb-4">
                    <div className="col-md-8">
                        <div className="card h-100">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0"><i className="fa fa-user me-2"></i>Staff Information</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-4">
                                        <small className="text-muted">Staff ID</small>
                                        <p className="fw-bold mb-2">{appraisalData?.basicDetails?.StaffID}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted">Name</small>
                                        <p className="fw-bold mb-2">{appraisalData?.basicDetails?.StaffName}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted">Position</small>
                                        <p className="fw-bold mb-2">{appraisalData?.basicDetails?.CurrentPosition || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted">Department</small>
                                        <p className="fw-bold mb-0">{appraisalData?.basicDetails?.DepartmentCode || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted">Submission Type</small>
                                        <p className="fw-bold mb-0">
                                            <span className="badge bg-success">{appraisalData?.basicDetails?.SubmissionType}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 bg-light">
                            <div className="card-body text-center d-flex flex-column justify-content-center">
                                <h6 className="text-muted mb-2">Overall Score</h6>
                                <h1 className={`display-4 mb-2 ${scoreData.percentage >= 70 ? 'text-success' :
                                    scoreData.percentage >= 50 ? 'text-warning' : 'text-danger'
                                    }`}>
                                    {scoreData.percentage}%
                                </h1>
                                <p className="text-muted mb-0">{scoreData.total} / {scoreData.max} points</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complete Workflow Summary */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0"><i className="fa fa-history me-2"></i>Appraisal Workflow Summary</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-4">
                            {/* HOD Evaluation */}
                            <div className="col-md-3">
                                <div className="card h-100 border-info">
                                    <div className="card-header bg-info text-white py-2">
                                        <h6 className="mb-0"><i className="fa fa-user-tie me-2"></i>HOD Evaluation</h6>
                                    </div>
                                    <div className="card-body">
                                        <p className="text-center mb-0">
                                            <span className="badge bg-primary fs-5">{scoreData.total}/{scoreData.max}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Staff Agreement */}
                            <div className="col-md-3">
                                <div className="card h-100 border-secondary">
                                    <div className="card-header bg-secondary text-white py-2">
                                        <h6 className="mb-0"><i className="fa fa-handshake me-2"></i>Staff Response</h6>
                                    </div>
                                    <div className="card-body">
                                        {appraisalData?.staffAgreement ? (
                                            <>
                                                <span className={`badge ${appraisalData.staffAgreement.AgreeStatus === 'Agree' ? 'bg-success' : 'bg-warning'
                                                    }`}>
                                                    {appraisalData.staffAgreement.AgreeStatus}
                                                </span>
                                                <p className="small mt-2 mb-0">{appraisalData.staffAgreement.Comment || 'No comment'}</p>
                                            </>
                                        ) : <p className="text-muted mb-0">Pending</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Dean */}
                            <div className="col-md-3">
                                <div className="card h-100 border-success">
                                    <div className="card-header bg-success text-white py-2">
                                        <h6 className="mb-0"><i className="fa fa-university me-2"></i>Dean</h6>
                                    </div>
                                    <div className="card-body">
                                        {appraisalData?.deanSubmission ? (
                                            <>
                                                <span className={`badge ${appraisalData.deanSubmission.AgreeStatus === 'Agree' ? 'bg-success' : 'bg-warning'
                                                    }`}>
                                                    {appraisalData.deanSubmission.AgreeStatus}
                                                </span>
                                                <p className="small mt-2 mb-0">{appraisalData.deanSubmission.Recommendation}</p>
                                            </>
                                        ) : <p className="text-muted mb-0">Pending</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Registrar */}
                            <div className="col-md-3">
                                <div className="card h-100 border-warning">
                                    <div className="card-header bg-warning text-dark py-2">
                                        <h6 className="mb-0"><i className="fa fa-file-signature me-2"></i>Registrar</h6>
                                    </div>
                                    <div className="card-body">
                                        {appraisalData?.registrarSubmission ? (
                                            <>
                                                <span className={`badge ${appraisalData.registrarSubmission.AgreeStatus === 'Agree' ? 'bg-success' : 'bg-warning'
                                                    }`}>
                                                    {appraisalData.registrarSubmission.AgreeStatus}
                                                </span>
                                                <p className="small mt-2 mb-0">{appraisalData.registrarSubmission.Recommendation}</p>
                                            </>
                                        ) : <p className="text-muted mb-0">Pending</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HOD Score Details */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h6 className="mb-0"><i className="fa fa-list me-2"></i>Detailed HOD Scores</h6>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-sm table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th>Criteria</th>
                                        <th className="text-center">Score</th>
                                        <th className="text-center">Max</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appraisalData?.hodScores?.map((score, index) => (
                                        <tr key={index}>
                                            <td>{score.ItemName}</td>
                                            <td className="text-center">
                                                {score.ScoreType === 'comment' ? (
                                                    <em className="text-muted small">{score.Value}</em>
                                                ) : (
                                                    <span className="badge bg-primary">{score.Value}</span>
                                                )}
                                            </td>
                                            <td className="text-center">{score.MaxScore || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* VC Comments Form */}
                <div className="card">
                    <div className="card-header bg-dark text-white">
                        <h5 className="mb-0"><i className="fa fa-pen me-2"></i>Vice Chancellor's Comments</h5>
                    </div>
                    <div className="card-body">
                        <textarea
                            className="form-control"
                            rows="5"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Enter your final comments and decision on this appraisal..."
                        ></textarea>
                    </div>
                    <div className="card-footer d-flex justify-content-between">
                        <button className="btn btn-secondary" onClick={() => navigate("/human-resources/appraisal/vc/pending")}>
                            <i className="fa fa-arrow-left me-2"></i>Back
                        </button>
                        <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa fa-check-circle me-2"></i>}
                            Complete Appraisal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(VcFinalReview);
