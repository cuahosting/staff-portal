import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";

function RegistrarReviewAppraisal(props) {
    const { appraisalId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [appraisalData, setAppraisalData] = useState(null);
    const [formData, setFormData] = useState({
        agreeStatus: "Agree",
        comment: "",
        recommendation: ""
    });
    const registrarStaffId = props.loginData.StaffID;

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
        const { success, data } = await api.post("staff/hr/appraisal/registrar/submit", {
            appraisalId,
            staffId: appraisalData?.basicDetails?.StaffID,
            agreeStatus: formData.agreeStatus,
            comment: formData.comment,
            recommendation: formData.recommendation,
            insertedBy: registrarStaffId
        });

        if (success && data.message === 'success') {
            toast.success("Review submitted successfully!");
            navigate("/human-resources/appraisal/registrar/pending");
        } else {
            toast.error("Failed to submit review");
        }
        setSubmitting(false);
    };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Registrar Review" items={["Appraisal", "Registrar", "Review"]} />
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
                                <span className="badge bg-success">{appraisalData?.basicDetails?.SubmissionType}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Previous Reviews */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-header bg-info text-white">
                                <h6 className="mb-0"><i className="fa fa-user-tie me-2"></i>HOD Evaluation Summary</h6>
                            </div>
                            <div className="card-body">
                                {appraisalData?.hodScores?.length > 0 ? (
                                    <div className="text-center">
                                        <h2 className="text-primary">
                                            {appraisalData.hodScores.filter(s => s.ScoreType !== 'comment')
                                                .reduce((sum, s) => sum + parseInt(s.Value || 0), 0)}
                                            <small className="text-muted">
                                                / {appraisalData.hodScores.filter(s => s.ScoreType !== 'comment')
                                                    .reduce((sum, s) => sum + (s.MaxScore || 0), 0)}
                                            </small>
                                        </h2>
                                        <p className="text-muted">Total Score</p>
                                    </div>
                                ) : <p className="text-muted">No scores available</p>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-header bg-success text-white">
                                <h6 className="mb-0"><i className="fa fa-university me-2"></i>Dean's Recommendation</h6>
                            </div>
                            <div className="card-body">
                                {appraisalData?.deanSubmission ? (
                                    <>
                                        <p className="mb-2">
                                            <strong>Status:</strong>{" "}
                                            <span className={`badge ${appraisalData.deanSubmission.AgreeStatus === 'Agree' ? 'bg-success' : 'bg-warning'
                                                }`}>
                                                {appraisalData.deanSubmission.AgreeStatus}
                                            </span>
                                        </p>
                                        <p className="mb-0">{appraisalData.deanSubmission.Recommendation}</p>
                                    </>
                                ) : <p className="text-muted">No recommendation yet</p>}
                            </div>
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

                {/* Registrar Review Form */}
                <div className="card">
                    <div className="card-header bg-dark text-white">
                        <h5 className="mb-0"><i className="fa fa-pen me-2"></i>Registrar's Assessment</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Agreement Status</label>
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
                                <label className="form-label fw-bold">Comment</label>
                                <textarea
                                    className="form-control"
                                    name="comment"
                                    rows="3"
                                    value={formData.comment}
                                    onChange={handleInputChange}
                                    placeholder="Enter any comments..."
                                ></textarea>
                            </div>
                            <div className="col-md-12">
                                <label className="form-label fw-bold">Recommendation <span className="text-danger">*</span></label>
                                <textarea
                                    className="form-control"
                                    name="recommendation"
                                    rows="4"
                                    value={formData.recommendation}
                                    onChange={handleInputChange}
                                    placeholder="Enter your recommendation..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer d-flex justify-content-between">
                        <button className="btn btn-secondary" onClick={() => navigate("/human-resources/appraisal/registrar/pending")}>
                            <i className="fa fa-arrow-left me-2"></i>Back
                        </button>
                        <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa fa-check me-2"></i>}
                            Submit Assessment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(RegistrarReviewAppraisal);
