import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";

function EvaluateStaff(props) {
    const { appraisalId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [appraisalData, setAppraisalData] = useState(null);
    const [scoreSettings, setScoreSettings] = useState([]);
    const [scores, setScores] = useState({});
    const hodStaffId = props.loginData.StaffID;

    useEffect(() => { loadData(); }, [appraisalId]);

    const loadData = async () => {
        setIsLoading(true);
        const { success, data } = await api.get(`staff/hr/appraisal/hod/staff-appraisal/${appraisalId}`);

        if (success) {
            setAppraisalData(data);
            setScoreSettings(data.scoreSettings || []);

            // Pre-fill existing scores
            const existingScores = {};
            (data.existingScores || []).forEach(score => {
                existingScores[score.HodScoreSettingsID] = score.ScoreType === 'comment' ? score.Value : parseInt(score.Value);
            });
            setScores(existingScores);
        }
        setIsLoading(false);
    };

    const handleScoreChange = (settingsId, value, isComment) => {
        setScores(prev => ({
            ...prev,
            [settingsId]: isComment ? value : parseInt(value) || 0
        }));
    };

    const handleSubmit = async () => {
        // Validate all required scores are filled
        const missingScores = scoreSettings.filter(s => !s.IsComment && (scores[s.EntryID] === undefined || scores[s.EntryID] === ''));
        if (missingScores.length > 0) {
            toast.warning("Please fill all score fields");
            return;
        }

        if (!window.confirm("Are you sure you want to submit this evaluation?")) return;

        setSubmitting(true);
        const scoreArray = scoreSettings.map(s => ({
            settingsId: s.EntryID,
            value: scores[s.EntryID] || 0,
            scoreType: s.IsComment ? 'comment' : 'score'
        }));

        const { success, data } = await api.post("staff/hr/appraisal/hod/score", {
            appraisalId,
            scores: scoreArray,
            hodStaffId
        });

        if (success && data.message === 'success') {
            toast.success("Evaluation submitted successfully!");
            navigate("/human-resources/appraisal/hod/pending");
        } else {
            toast.error("Failed to submit evaluation");
        }
        setSubmitting(false);
    };

    const calculateTotalScore = () => {
        return scoreSettings
            .filter(s => !s.IsComment)
            .reduce((sum, s) => sum + (parseInt(scores[s.EntryID]) || 0), 0);
    };

    const calculateMaxScore = () => {
        return scoreSettings
            .filter(s => !s.IsComment)
            .reduce((sum, s) => sum + (s.ItemScore || 0), 0);
    };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Evaluate Staff" items={["Appraisal", "HOD", "Evaluate"]} />
            <div className="flex-column-fluid">
                {/* Staff Details Summary */}
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

                {/* Appraisal Sections Summary */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-header"><h6 className="mb-0">Academic Positions</h6></div>
                            <div className="card-body">
                                {appraisalData?.academicPositions?.length > 0 ? (
                                    <ul className="list-unstyled mb-0">
                                        {appraisalData.academicPositions.map((item, i) => (
                                            <li key={i} className="mb-2">
                                                <i className="fa fa-graduation-cap text-primary me-2"></i>
                                                <strong>{item.AcademicPosition}</strong> at {item.InstitutionName} ({item.PeriodFrom} - {item.PeriodTo || 'Present'})
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-muted mb-0">No entries</p>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-header"><h6 className="mb-0">Professional Memberships</h6></div>
                            <div className="card-body">
                                {appraisalData?.memberships?.length > 0 ? (
                                    <ul className="list-unstyled mb-0">
                                        {appraisalData.memberships.map((item, i) => (
                                            <li key={i} className="mb-2">
                                                <i className="fa fa-id-card text-success me-2"></i>
                                                <strong>{item.Title}</strong> - {item.OrganisationName} (Since {item.YearJoined})
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-muted mb-0">No entries</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-header"><h6 className="mb-0">Training & Development</h6></div>
                            <div className="card-body">
                                {appraisalData?.trainings?.length > 0 ? (
                                    <ul className="list-unstyled mb-0">
                                        {appraisalData.trainings.map((item, i) => (
                                            <li key={i} className="mb-2">
                                                <i className="fa fa-certificate text-info me-2"></i>
                                                <strong>{item.Description}</strong> - {item.Organisation} ({item.Year})
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-muted mb-0">No entries</p>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-header"><h6 className="mb-0">Community Service</h6></div>
                            <div className="card-body">
                                {appraisalData?.communityService?.length > 0 ? (
                                    <ul className="list-unstyled mb-0">
                                        {appraisalData.communityService.map((item, i) => (
                                            <li key={i} className="mb-2">
                                                <i className="fa fa-hands-helping text-warning me-2"></i>
                                                <strong>{item.Type}</strong>: {item.Description}
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-muted mb-0">No entries</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scoring Section */}
                <div className="card">
                    <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0"><i className="fa fa-star me-2"></i>HOD Evaluation Scores</h5>
                        <span className="badge bg-success fs-6">
                            Total: {calculateTotalScore()} / {calculateMaxScore()}
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th>S/N</th>
                                        <th>Criteria</th>
                                        <th className="text-center" style={{ width: '120px' }}>Max Score</th>
                                        <th className="text-center" style={{ width: '200px' }}>Your Score / Comment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scoreSettings.map((setting, index) => (
                                        <tr key={setting.EntryID}>
                                            <td>{index + 1}</td>
                                            <td>
                                                {setting.ItemName}
                                                {setting.IsComment && <span className="badge bg-secondary ms-2">Comment</span>}
                                            </td>
                                            <td className="text-center">
                                                {setting.IsComment ? '-' : <span className="badge bg-primary">{setting.ItemScore}</span>}
                                            </td>
                                            <td>
                                                {setting.IsComment ? (
                                                    <textarea
                                                        className="form-control form-control-sm"
                                                        rows="2"
                                                        value={scores[setting.EntryID] || ''}
                                                        onChange={(e) => handleScoreChange(setting.EntryID, e.target.value, true)}
                                                        placeholder="Enter comment..."
                                                    />
                                                ) : (
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm text-center"
                                                        min="0"
                                                        max={setting.ItemScore}
                                                        value={scores[setting.EntryID] || ''}
                                                        onChange={(e) => handleScoreChange(setting.EntryID, e.target.value, false)}
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="card-footer d-flex justify-content-between">
                        <button className="btn btn-secondary" onClick={() => navigate("/human-resources/appraisal/hod/pending")}>
                            <i className="fa fa-arrow-left me-2"></i>Back
                        </button>
                        <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa fa-check me-2"></i>}
                            Submit Evaluation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(EvaluateStaff);
