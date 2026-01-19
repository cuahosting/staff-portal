import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";

function DeanReviewAppraisal(props) {
    const { appraisalId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [appraisalData, setAppraisalData] = useState(null);
    const [formData, setFormData] = useState({
        agreeStatus: "Agree",
        recommendation: ""
    });
    const deanStaffId = props.loginData.StaffID;

    useEffect(() => { loadData(); }, [appraisalId]);

    const loadData = async () => {
        setIsLoading(true);
        const { success, data } = await api.get(`staff/hr/appraisal/vc/view/${appraisalId}`);
        if (success) {
            setAppraisalData(data);
        }
        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.recommendation.trim()) {
            toast.warning("Please enter your recommendation");
            return;
        }

        if (!window.confirm("Are you sure you want to submit your review?")) return;

        setSubmitting(true);
        const { success, data } = await api.post("staff/hr/appraisal/dean/submit", {
            appraisalId,
            staffId: appraisalData?.basicDetails?.StaffID,
            agreeStatus: formData.agreeStatus,
            recommendation: formData.recommendation,
            insertedBy: deanStaffId
        });

        if (success && data.message === 'success') {
            toast.success("Review submitted successfully!");
            navigate("/human-resources/appraisal/dean/pending");
        } else {
            toast.error("Failed to submit review");
        }
        setSubmitting(false);
    };

    const calculateTotalScore = (scores) => {
        return scores?.filter(s => s.ScoreType !== 'comment')
            .reduce((sum, s) => sum + parseInt(s.Value || 0), 0) || 0;
    };

    const calculateMaxScore = (scores) => {
        return scores?.filter(s => s.ScoreType !== 'comment')
            .reduce((sum, s) => sum + (s.MaxScore || 0), 0) || 0;
    };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Dean Review" items={["Appraisal", "Dean", "Review"]} />
            <div className="flex-column-fluid">
                {/* Staff Summary */}
                <div className="card mb-4">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0"><i className="fa fa-user me-2"></i>Staff Information</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-3">
                                <small className="text-muted">Staff ID</small>
                                <p className="fw-bold mb-0">{appraisalData?.basicDetails?.StaffID}</p>
                            </div>
                            <div className="col-md-3">
                                <small className="text-muted">Name</small>
                                <p className="fw-bold mb-0">{appraisalData?.basicDetails?.StaffName}</p>
                            </div>
                            <div className="col-md-3">
                                <small className="text-muted">Position</small>
                                <p className="fw-bold mb-0">{appraisalData?.basicDetails?.CurrentPosition || 'N/A'}</p>
                            </div>
                            <div className="col-md-3">
                                <small className="text-muted">Submission Type</small>
                                <p className="fw-bold mb-0">
                                    <span className="badge bg-success">{appraisalData?.basicDetails?.SubmissionType}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HOD Scores */}
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0"><i className="fa fa-star me-2"></i>HOD Evaluation Scores</h6>
                        <span className="badge bg-success fs-6">
                            Total: {calculateTotalScore(appraisalData?.hodScores)} / {calculateMaxScore(appraisalData?.hodScores)}
                        </span>
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
                                                    <em className="text-muted">{score.Value}</em>
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

                {/* Staff Agreement */}
                {appraisalData?.staffAgreement && (
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="mb-0"><i className="fa fa-handshake me-2"></i>Staff Response to HOD Evaluation</h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    <small className="text-muted">Agreement Status</small>
                                    <p className="fw-bold mb-0">
                                        <span className={`badge ${appraisalData.staffAgreement.AgreeStatus === 'Agree' ? 'bg-success' : 'bg-danger'
                                            }`}>
                                            {appraisalData.staffAgreement.AgreeStatus}
                                        </span>
                                    </p>
                                </div>
                                <div className="col-md-9">
                                    <small className="text-muted">Comment</small>
                                    <p className="mb-0">{appraisalData.staffAgreement.Comment || 'No comment'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dean Recommendation Form */}
                <div className="card">
                    <div className="card-header bg-dark text-white">
                        <h5 className="mb-0"><i className="fa fa-pen me-2"></i>Dean's Recommendation</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Agreement with HOD Evaluation</label>
                                <select
                                    className="form-select"
                                    name="agreeStatus"
                                    value={formData.agreeStatus}
                                    onChange={handleInputChange}
                                >
                                    <option value="Agree">Agree</option>
                                    <option value="Disagree">Disagree</option>
                                    <option value="Partially Agree">Partially Agree</option>
                                </select>
                            </div>
                            <div className="col-md-12">
                                <label className="form-label fw-bold">Recommendation <span className="text-danger">*</span></label>
                                <textarea
                                    className="form-control"
                                    name="recommendation"
                                    rows="4"
                                    value={formData.recommendation}
                                    onChange={handleInputChange}
                                    placeholder="Enter your recommendation for this staff member..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer d-flex justify-content-between">
                        <button className="btn btn-secondary" onClick={() => navigate("/human-resources/appraisal/dean/pending")}>
                            <i className="fa fa-arrow-left me-2"></i>Back
                        </button>
                        <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa fa-check me-2"></i>}
                            Submit Recommendation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(DeanReviewAppraisal);
