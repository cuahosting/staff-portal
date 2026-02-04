import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import SearchSelect from "../../common/select/SearchSelect";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";

function UniversityModeration(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);

    const [fromScore, setFromScore] = useState(35);
    const [toScore, setToScore] = useState(39);
    const [newScore, setNewScore] = useState(40);
    const [reason, setReason] = useState("");

    const [previewCount, setPreviewCount] = useState(null);
    const [previewing, setPreviewing] = useState(false);
    const [applying, setApplying] = useState(false);

    useEffect(() => { loadInitialData(); }, []);

    const loadInitialData = async () => {
        try {
            const { success, data } = await api.get("staff/settings/dashboard/semester/list");
            if (success) {
                const semesterOptions = (data || []).map(s => ({ value: s.SemesterCode, label: s.SemesterName }));
                setSemesters(semesterOptions);
                if (semesterOptions.length > 0) {
                    setSelectedSemester(semesterOptions[0]);
                }
            }
        } catch (error) { toast.error("Error loading data"); }
        setIsLoading(false);
    };

    const previewAffectedStudents = async () => {
        if (!selectedSemester) { toast.warning("Please select a semester"); return; }
        if (fromScore >= toScore) { toast.warning("'From Score' must be less than 'To Score'"); return; }

        setPreviewing(true);
        const { success, data } = await api.post("staff/assessment/moderation/university-wide/preview", {
            semester: selectedSemester.value,
            fromScore,
            toScore
        });

        if (success) {
            setPreviewCount(data.count);
            if (data.count === 0) {
                toast.info("No students found in the specified score range");
            }
        } else {
            toast.error(data.error || "Failed to preview");
        }
        setPreviewing(false);
    };

    const applyModeration = async () => {
        if (!selectedSemester) { toast.warning("Please select a semester"); return; }
        if (!reason.trim()) { toast.warning("Please provide a reason for moderation"); return; }
        if (previewCount === null || previewCount === 0) { toast.warning("Please preview affected students first"); return; }

        const confirmMsg = `Are you sure you want to moderate ${previewCount} students from score range ${fromScore}-${toScore} to ${newScore}? This action will be logged and cannot be undone.`;
        if (!window.confirm(confirmMsg)) return;

        setApplying(true);
        const { success, data } = await api.post("staff/assessment/moderation/university-wide/apply", {
            semester: selectedSemester.value,
            fromScore,
            toScore,
            newScore,
            reason,
            moderatedBy: props.loginData.StaffID
        });

        if (success && data.message === 'success') {
            toast.success(`University-wide moderation applied to ${data.studentsModerated} students.`);
            setPreviewCount(null);
            setReason("");
        } else {
            toast.error(data.error || "Failed to apply moderation");
        }
        setApplying(false);
    };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="University-Wide Moderation" items={["Assessment", "Moderation", "University-Wide"]} />
            <div className="flex-column-fluid">
                {/* Warning Banner */}
                <div className="alert alert-danger mb-4">
                    <i className="fa fa-exclamation-triangle me-2"></i>
                    <strong>Warning:</strong> University-wide moderation affects ALL students across ALL modules within the specified score range. This action is final and will be logged for audit purposes.
                </div>

                {/* Filter Section */}
                <div className="card mb-4">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3"><i className="fa fa-globe me-2"></i>University-Wide Moderation Settings</h6>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <SearchSelect
                                    id="semester"
                                    label="Semester"
                                    value={selectedSemester}
                                    options={semesters}
                                    onChange={(v) => { setSelectedSemester(v); setPreviewCount(null); }}
                                    placeholder="Search Semester..."
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Score Range (From - To)</label>
                                <div className="d-flex gap-2 align-items-center">
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={fromScore}
                                        onChange={(e) => { setFromScore(parseFloat(e.target.value)); setPreviewCount(null); }}
                                        min="0"
                                        max="100"
                                        placeholder="From"
                                    />
                                    <span className="text-muted">to</span>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={toScore}
                                        onChange={(e) => { setToScore(parseFloat(e.target.value)); setPreviewCount(null); }}
                                        min="0"
                                        max="100"
                                        placeholder="To"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">New Score (Set To)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={newScore}
                                    onChange={(e) => setNewScore(parseFloat(e.target.value))}
                                    min="0"
                                    max="100"
                                    placeholder="New score to set"
                                />
                            </div>
                        </div>

                        <div className="row g-3 mt-2">
                            <div className="col-md-8">
                                <label className="form-label fw-semibold">Reason for Moderation</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Enter reason for this university-wide moderation..."
                                ></textarea>
                            </div>
                            <div className="col-md-4 d-flex flex-column justify-content-end">
                                <button
                                    className="btn btn-info w-100 mb-2"
                                    onClick={previewAffectedStudents}
                                    disabled={previewing}
                                >
                                    {previewing ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa fa-eye me-2"></i>}
                                    Preview Affected Students
                                </button>
                            </div>
                        </div>

                        {/* Preview Result */}
                        {previewCount !== null && (
                            <div className={`alert ${previewCount > 0 ? 'alert-warning' : 'alert-info'} mt-4 d-flex justify-content-between align-items-center`}>
                                <div>
                                    <i className={`fa ${previewCount > 0 ? 'fa-users' : 'fa-info-circle'} me-2`}></i>
                                    {previewCount > 0 ? (
                                        <><strong>{previewCount}</strong> students found with scores between <strong>{fromScore}</strong> and <strong>{toScore}</strong> will be moderated to <strong>{newScore}</strong></>
                                    ) : (
                                        'No students found in the specified score range'
                                    )}
                                </div>
                                {previewCount > 0 && (
                                    <button
                                        className="btn btn-danger px-4"
                                        onClick={applyModeration}
                                        disabled={applying || !reason.trim()}
                                    >
                                        {applying ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa fa-gavel me-2"></i>}
                                        Apply University-Wide Moderation
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="card bg-light">
                    <div className="card-body">
                        <h6 className="fw-bold"><i className="fa fa-info-circle me-2"></i>How it works</h6>
                        <ol className="mb-0">
                            <li>Select a semester</li>
                            <li>Enter the score range (e.g., 35 to 39)</li>
                            <li>Enter the new score (e.g., 40)</li>
                            <li>Click "Preview" to see how many students are affected</li>
                            <li>Provide a reason and click "Apply" to moderate all matching students</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(UniversityModeration);
