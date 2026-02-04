import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";

function ViewHodScore(props) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [appraisalId, setAppraisalId] = useState(null);
    const [scores, setScores] = useState([]);
    const [agreement, setAgreement] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        agreeStatus: "Agree",
        comment: ""
    });
    const staffId = props.loginData.StaffID;

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);

        // First get the active appraisal for this staff
        const detailsRes = await api.get(`staff/hr/appraisal/staff/basic-details/${staffId}`);
        if (detailsRes.success && detailsRes.data.data) {
            const aid = detailsRes.data.data.EntryID;
            setAppraisalId(aid);

            // Get HOD scores
            const scoresRes = await api.get(`staff/hr/appraisal/staff/hod-score/${aid}`);
            if (scoresRes.success) {
                setScores(scoresRes.data.scores || []);
                setAgreement(scoresRes.data.agreement);
                if (scoresRes.data.agreement) {
                    setFormData({
                        agreeStatus: scoresRes.data.agreement.AgreeStatus || "Agree",
                        comment: scoresRes.data.agreement.Comment || ""
                    });
                }
            }
        }
        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!window.confirm(`Are you sure you want to ${formData.agreeStatus.toLowerCase()} with the HOD evaluation?`)) {
            return;
        }

        setSubmitting(true);
        const { success, data } = await api.post("staff/hr/appraisal/staff/agreement", {
            appraisalId,
            staffId,
            ...formData
        });

        if (success && data.message === 'success') {
            toast.success("Your response has been submitted");
            navigate("/human-resources/appraisal/my-appraisal");
        } else {
            toast.error("Failed to submit response");
        }
        setSubmitting(false);
    };

    const calculateTotal = () => {
        return scores.filter(s => !s.IsComment).reduce((sum, s) => sum + parseInt(s.Value || 0), 0);
    };

    const calculateMax = () => {
        return scores.filter(s => !s.IsComment).reduce((sum, s) => sum + (s.MaxScore || 0), 0);
    };

    const totalScore = calculateTotal();
    const maxScore = calculateMax();
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="View HOD Evaluation" items={["Appraisal", "HOD Score"]} />
            <div className="flex-column-fluid">
                {scores.length === 0 ? (
                    <div className="alert alert-warning">
                        <i className="fa fa-exclamation-triangle me-2"></i>
                        No HOD evaluation available yet. Your appraisal is still pending evaluation.
                    </div>
                ) : (
                    <>
                        {/* Score Summary */}
                        <div className="row mb-4">
                            <div className="col-md-4">
                                <div className={`card h-100 border-${percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'danger'}`}>
                                    <div className="card-body text-center">
                                        <h6 className="text-muted mb-2">Your Score</h6>
                                        <h1 className={`display-3 text-${percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'danger'}`}>
                                            {percentage}%
                                        </h1>
                                        <p className="mb-0">{totalScore} / {maxScore} points</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="card h-100">
                                    <div className="card-header"><h6 className="mb-0">Score Breakdown</h6></div>
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-sm table-bordered mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Criteria</th>
                                                        <th className="text-center">Score</th>
                                                        <th className="text-center">Max</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {scores.map((score, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                {score.ItemName}
                                                                {score.IsComment && <span className="badge bg-secondary ms-2">Comment</span>}
                                                            </td>
                                                            <td className="text-center">
                                                                {score.IsComment ? (
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
                            </div>
                        </div>

                        {/* Agreement Form */}
                        <div className="card">
                            <div className="card-header bg-dark text-white">
                                <h5 className="mb-0"><i className="fa fa-handshake me-2"></i>Your Response to HOD Evaluation</h5>
                            </div>
                            <div className="card-body">
                                {agreement && agreement.AgreeStatus ? (
                                    <div className="alert alert-info">
                                        <i className="fa fa-check-circle me-2"></i>
                                        You have already responded to this evaluation with:
                                        <strong className="ms-2">{agreement.AgreeStatus}</strong>
                                        {agreement.Comment && <p className="mb-0 mt-2">{agreement.Comment}</p>}
                                    </div>
                                ) : (
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">Agreement Status <span className="text-danger">*</span></label>
                                            <select
                                                className="form-select"
                                                name="agreeStatus"
                                                value={formData.agreeStatus}
                                                onChange={handleInputChange}
                                            >
                                                <option value="Agree">I Agree with the evaluation</option>
                                                <option value="Disagree">I Disagree with the evaluation</option>
                                                <option value="Partially Agree">I Partially Agree</option>
                                            </select>
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-bold">Comment (Optional)</label>
                                            <textarea
                                                className="form-control"
                                                name="comment"
                                                rows="4"
                                                value={formData.comment}
                                                onChange={handleInputChange}
                                                placeholder="Enter any comments or observations about the evaluation..."
                                            ></textarea>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="card-footer d-flex justify-content-between">
                                <button className="btn btn-secondary" onClick={() => navigate("/human-resources/appraisal/my-appraisal")}>
                                    <i className="fa fa-arrow-left me-2"></i>Back
                                </button>
                                {(!agreement || !agreement.AgreeStatus) && (
                                    <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
                                        {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa fa-check me-2"></i>}
                                        Submit Response
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(ViewHodScore);
