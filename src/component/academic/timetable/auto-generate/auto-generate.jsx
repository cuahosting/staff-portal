import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import { showAlert, showConfirm } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import { connect } from "react-redux";

function AutoGenerateTimetable(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [step, setStep] = useState(1);
    const [semesters, setSemesters] = useState([]);
    const [prerequisites, setPrerequisites] = useState(null);
    const [generationResult, setGenerationResult] = useState(null);

    const [formData, setFormData] = useState({
        semesterCode: "",
        referenceSemesterCode: "",
        insertedBy: props.LoginDetails[0]?.StaffID || ""
    });

    const [processingStats, setProcessingStats] = useState({
        total: 0,
        processed: 0,
        success: 0,
        failed: 0,
        currentModule: ''
    });
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveDuration, setSaveDuration] = useState(0);

    const formatDuration = (seconds) => {
        const secs = parseFloat(seconds);
        if (secs < 60) return `${secs.toFixed(1)}s`;
        const mins = Math.floor(secs / 60);
        const remainingSecs = Math.floor(secs % 60);
        return `${mins}m ${remainingSecs}s`;
    };

    const getSemesters = async () => {
        const { success, data } = await api.get("staff/academics/timetable/semester/list");
        if (success && data?.length > 0) {
            setSemesters(data);
        }
        setIsLoading(false);
    };

    const checkPrerequisites = async () => {
        if (!formData.semesterCode) {
            showAlert("SELECT SEMESTER", "Please select a target semester", "error");
            return;
        }

        setIsLoading(true);
        const { success, data } = await api.get(`staff/timetable-generator/prerequisites/${formData.semesterCode}`);
        if (success) {
            setPrerequisites(data);
            setStep(2);
        } else {
            showAlert("ERROR", "Failed to check prerequisites", "error");
        }
        setIsLoading(false);
    };

    const previewGeneration = async () => {
        setIsGenerating(true);
        const { success, data } = await api.post("staff/timetable-generator/preview", formData);
        if (success) {
            setGenerationResult(data);
            setStep(3);
        } else {
            showAlert("ERROR", "Failed to preview generation", "error");
        }
        setIsGenerating(false);
    };

    // Group generated entries by module code
    const groupEntriesByModule = (entries) => {
        const grouped = {};
        entries.forEach(entry => {
            if (!grouped[entry.ModuleCode]) {
                grouped[entry.ModuleCode] = {
                    moduleCode: entry.ModuleCode,
                    moduleName: entry.moduleName,
                    entries: []
                };
            }
            grouped[entry.ModuleCode].entries.push(entry);
        });
        return Object.values(grouped);
    };

    // Save timetable module-by-module (prevents timeout issues)
    const saveModuleByModule = async () => {
        const moduleGroups = groupEntriesByModule(generationResult.generatedEntries);

        setShowSaveModal(true);
        setProcessingStats({
            total: moduleGroups.length,
            processed: 0,
            success: 0,
            failed: 0,
            currentModule: ''
        });

        const startTime = Date.now();
        let results = [];
        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < moduleGroups.length; i++) {
            const moduleGroup = moduleGroups[i];

            setProcessingStats(prev => ({
                ...prev,
                currentModule: `${moduleGroup.moduleCode} - ${moduleGroup.moduleName || ''}`
            }));

            try {
                const { success, data } = await api.post("staff/timetable-generator/save-module", {
                    entries: moduleGroup.entries,
                    semesterCode: formData.semesterCode
                }, { timeout: 60000, showError: false });

                if (success && data.message === "success") {
                    successCount++;
                    results.push({
                        moduleCode: moduleGroup.moduleCode,
                        moduleName: moduleGroup.moduleName,
                        status: 'success',
                        entriesCount: moduleGroup.entries.length
                    });
                } else {
                    failedCount++;
                    results.push({
                        moduleCode: moduleGroup.moduleCode,
                        moduleName: moduleGroup.moduleName,
                        status: 'failed',
                        entriesCount: moduleGroup.entries.length
                    });
                }
            } catch (error) {
                failedCount++;
                results.push({
                    moduleCode: moduleGroup.moduleCode,
                    moduleName: moduleGroup.moduleName,
                    status: 'failed',
                    entriesCount: moduleGroup.entries.length
                });
            }

            setProcessingStats(prev => ({
                ...prev,
                processed: i + 1,
                success: successCount,
                failed: failedCount
            }));
            setSaveDuration((Date.now() - startTime) / 1000);
        }

        setShowSaveModal(false);

        if (successCount > 0) {
            toast.success(`Timetable saved! ${successCount} modules saved successfully.`);
            setStep(4);
        } else {
            showAlert("ERROR", "Failed to save timetable. Please try again.", "error");
        }
    };

    const generateTimetable = async () => {
        const confirmed = await showConfirm(
            "Confirm Generation",
            `Are you sure you want to save the timetable for semester ${formData.semesterCode}? This will create ${generationResult?.generatedEntries?.length || 0} schedule entries for ${groupEntriesByModule(generationResult?.generatedEntries || []).length} modules.`,
            "warning"
        );

        if (!confirmed) return;

        setIsGenerating(true);

        // Check if timetable already exists
        const { success: checkSuccess, data: checkData } = await api.get(`staff/timetable-generator/check/${formData.semesterCode}`);

        if (checkSuccess && checkData?.exists) {
            const wantToClear = await showConfirm(
                "Timetable Exists",
                "A timetable already exists for this semester. Do you want to CLEAR it and save the new one? This action cannot be undone.",
                "danger",
                "Yes, Clear & Save"
            );

            if (wantToClear) {
                const { success: clearSuccess } = await api.post("staff/timetable-generator/clear", { semesterCode: formData.semesterCode });
                if (clearSuccess) {
                    toast.success("Previous timetable cleared. Saving new timetable...");
                    await saveModuleByModule();
                } else {
                    showAlert("ERROR", "Failed to clear existing timetable", "error");
                }
            }
        } else {
            // No existing timetable, proceed with save
            await saveModuleByModule();
        }

        setIsGenerating(false);
    };

    const resetWizard = () => {
        setStep(1);
        setFormData({
            semesterCode: "",
            referenceSemesterCode: "",
            insertedBy: props.LoginDetails[0]?.StaffID || ""
        });
        setPrerequisites(null);
        setGenerationResult(null);
    };

    useEffect(() => {
        getSemesters();
    }, []);

    if (isLoading) return <Loader />;

    const renderStepIndicator = () => (
        <div className="d-flex justify-content-center mb-8">
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className="d-flex align-items-center">
                    <div
                        className={`rounded-circle d-flex align-items-center justify-content-center ${step >= s ? 'bg-primary text-white' : 'bg-light text-muted'
                            }`}
                        style={{ width: 40, height: 40, fontWeight: 'bold' }}
                    >
                        {step > s ? <i className="fa fa-check" /> : s}
                    </div>
                    {s < 4 && (
                        <div
                            className={`mx-2 ${step > s ? 'bg-primary' : 'bg-light'}`}
                            style={{ width: 60, height: 4 }}
                        />
                    )}
                </div>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Step 1: Select Semester</h3>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6 mb-6">
                        <label className="form-label fs-6 fw-bolder">Target Semester *</label>
                        <select
                            className="form-select form-select-lg form-select-solid"
                            value={formData.semesterCode}
                            onChange={(e) => setFormData({ ...formData, semesterCode: e.target.value })}
                        >
                            <option value="">- Select Semester -</option>
                            {semesters.map((sem) => (
                                <option key={sem.SemesterCode} value={sem.SemesterCode}>
                                    {sem.SemesterCode} - {sem.SemesterName}
                                </option>
                            ))}
                        </select>
                        <div className="text-muted mt-2">Select the semester to generate timetable for</div>
                    </div>
                    <div className="col-md-6 mb-6">
                        <label className="form-label fs-6 fw-bolder">Reference Semester (Optional)</label>
                        <select
                            className="form-select form-select-lg form-select-solid"
                            value={formData.referenceSemesterCode}
                            onChange={(e) => setFormData({ ...formData, referenceSemesterCode: e.target.value })}
                        >
                            <option value="">- None -</option>
                            {semesters.filter(s => s.SemesterCode !== formData.semesterCode).map((sem) => (
                                <option key={sem.SemesterCode} value={sem.SemesterCode}>
                                    {sem.SemesterCode} - {sem.SemesterName}
                                </option>
                            ))}
                        </select>
                        <div className="text-muted mt-2">Use previous semester's timetable as reference (e.g., 25A for 26A)</div>
                    </div>
                </div>
                <div className="d-flex justify-content-end mt-4">
                    <button className="btn btn-primary" onClick={checkPrerequisites}>
                        Next: Check Prerequisites <i className="fa fa-arrow-right ms-2" />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Step 2: Prerequisites Check</h3>
            </div>
            <div className="card-body">
                {prerequisites && (
                    <>
                        <div className={`alert ${prerequisites.allReady ? 'alert-success' : 'alert-warning'} mb-6`}>
                            {prerequisites.allReady
                                ? <><i className="fa fa-check-circle me-2" />All prerequisites are met! You can proceed with generation.</>
                                : <><i className="fa fa-exclamation-triangle me-2" />Some prerequisites are not met. Please fix them before proceeding.</>
                            }
                        </div>
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Prerequisite</th>
                                        <th>Count</th>
                                        <th>Status</th>
                                        <th>Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(prerequisites.prerequisites).map(([key, value]) => (
                                        <tr key={key}>
                                            <td className="fw-bold text-capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                                            <td>{value.count}</td>
                                            <td>
                                                <span className={`badge ${value.ready ? 'badge-light-success' : 'badge-light-danger'}`}>
                                                    {value.ready ? 'Ready' : 'Not Ready'}
                                                </span>
                                            </td>
                                            <td>{value.message}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                <div className="d-flex justify-content-between mt-4">
                    <button className="btn btn-light" onClick={() => setStep(1)}>
                        <i className="fa fa-arrow-left me-2" /> Back
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={previewGeneration}
                        disabled={!prerequisites?.allReady || isGenerating}
                        data-kt-indicator={isGenerating ? 'on' : 'off'}
                    >
                        <span className="indicator-label">
                            Next: Preview Generation <i className="fa fa-arrow-right ms-2" />
                        </span>
                        <span className="indicator-progress">
                            Generating preview...
                            <span className="spinner-border spinner-border-sm align-middle ms-2" />
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Step 3: Preview Generation Results</h3>
            </div>
            <div className="card-body">
                {generationResult && (
                    <>
                        <div className="row mb-6">
                            <div className="col-md-3">
                                <div className="card bg-light-primary">
                                    <div className="card-body text-center">
                                        <h2 className="text-primary">{generationResult.results?.stats?.totalModules || 0}</h2>
                                        <span>Total Modules</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-light-success">
                                    <div className="card-body text-center">
                                        <h2 className="text-success">{generationResult.results?.stats?.scheduledCount || 0}</h2>
                                        <span>Scheduled</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-light-danger">
                                    <div className="card-body text-center">
                                        <h2 className="text-danger">{generationResult.results?.stats?.conflictCount || 0}</h2>
                                        <span>Conflicts</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-light-warning">
                                    <div className="card-body text-center">
                                        <h2 className="text-warning">{generationResult.results?.stats?.skippedCount || 0}</h2>
                                        <span>Skipped</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {generationResult.generatedEntries?.length > 0 && (
                            <div className="mb-6">
                                <h5>Generated Entries Preview ({generationResult.generatedEntries.length})</h5>
                                <div className="col-md-12">
                                    <AGTable
                                        data={{
                                            columns: [
                                                { label: "Day", field: "DayName" },
                                                { label: "Time", field: "Time" },
                                                { label: "Module", field: "Module" },
                                                { label: "Students", field: "StudentCount" },
                                                { label: "Venue (Cap)", field: "Venue" },
                                                { label: "Type", field: "Type" },
                                                { label: "From Ref", field: "IsFromReference" }
                                            ],
                                            rows: generationResult.generatedEntries.map((entry, idx) => ({
                                                DayName: entry.DayName,
                                                Time: `${entry.StartTime} - ${entry.EndTime}`,
                                                Module: (
                                                    <div>
                                                        <span className="fw-bold d-block">{entry.ModuleCode}</span>
                                                        <small className="text-muted d-block" style={{ fontSize: '11px', lineHeight: '1.2' }}>
                                                            {entry.moduleName}
                                                        </small>
                                                        {entry.isSharedModule && (
                                                            <span className="badge badge-light-warning mt-1" style={{ fontSize: '10px' }}>Shared</span>
                                                        )}
                                                    </div>
                                                ),
                                                StudentCount: (
                                                    <div style={{ fontSize: '13px', fontWeight: '500' }}>
                                                        {entry.studentCount}
                                                        <span style={{ fontSize: '11px', color: '#666', marginLeft: '6px', display: 'inline-block' }}>
                                                            F-{entry.FreshCount || 0} | C-{entry.CarryoverCount || 0}
                                                        </span>
                                                    </div>
                                                ),
                                                Venue: (
                                                    <span className={entry.studentCount > entry.venueCapacity ? "text-danger fw-bold" : ""}>
                                                        {entry.venueName} ({entry.venueCapacity})
                                                        {entry.studentCount > entry.venueCapacity && <i className="fa fa-exclamation-circle ms-1 text-danger" title="Over Capacity" />}
                                                    </span>
                                                ),
                                                Type: entry.ModuleType,
                                                IsFromReference: entry.fromReference ? <span className="badge badge-light-success">Yes</span> : <span className="badge badge-light-secondary">No</span>
                                            }))
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {generationResult.results?.conflicts?.length > 0 && (
                            <div className="mb-6">
                                <h5 className="text-danger">Conflicts</h5>
                                <div className="table-responsive">
                                    <table className="table table-sm table-bordered">
                                        <thead className="bg-light-danger">
                                            <tr>
                                                <th>Module</th>
                                                <th>Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {generationResult.results.conflicts.map((conflict, idx) => (
                                                <tr key={idx}>
                                                    <td>{conflict.moduleCode} - {conflict.moduleName}</td>
                                                    <td>{conflict.reason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="text-muted mb-4">
                            Execution time: {generationResult.executionTime}
                        </div>
                    </>
                )}
                <div className="d-flex justify-content-between mt-4">
                    <button className="btn btn-light" onClick={() => setStep(2)}>
                        <i className="fa fa-arrow-left me-2" /> Back
                    </button>
                    <button
                        className="btn btn-success"
                        onClick={generateTimetable}
                        disabled={isGenerating || !generationResult?.generatedEntries?.length}
                        data-kt-indicator={isGenerating ? 'on' : 'off'}
                    >
                        <span className="indicator-label">
                            <i className="fa fa-check me-2" /> Generate & Save Timetable
                        </span>
                        <span className="indicator-progress">
                            Saving...
                            <span className="spinner-border spinner-border-sm align-middle ms-2" />
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderSaveModal = () => (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-primary">
                        <h5 className="modal-title text-white">
                            <i className="fa fa-save me-2"></i>
                            Saving Timetable...
                        </h5>
                    </div>
                    <div className="modal-body">
                        <div className="text-center mb-4">
                            <h3 className="mb-1">{processingStats.processed} of {processingStats.total}</h3>
                            <p className="text-muted mb-0">Modules Saved</p>
                        </div>

                        <div className="progress mb-3" style={{ height: '25px' }}>
                            <div
                                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                                role="progressbar"
                                style={{ width: `${(processingStats.processed / processingStats.total) * 100}%` }}
                            >
                                {Math.round((processingStats.processed / processingStats.total) * 100)}%
                            </div>
                        </div>

                        {processingStats.currentModule && (
                            <div className="alert alert-secondary d-flex align-items-center p-3 mb-4">
                                <div className="spinner-border spinner-border-sm text-primary me-3"></div>
                                <div>
                                    <small className="text-muted d-block">Currently Saving:</small>
                                    <span className="fw-bold text-primary">{processingStats.currentModule}</span>
                                </div>
                            </div>
                        )}

                        <div className="row text-center">
                            <div className="col-4 border-end">
                                <h4 className="text-success mb-0">{processingStats.success}</h4>
                                <small className="text-muted">Success</small>
                            </div>
                            <div className="col-4 border-end">
                                <h4 className="text-danger mb-0">{processingStats.failed}</h4>
                                <small className="text-muted">Failed</small>
                            </div>
                            <div className="col-4">
                                <h4 className="text-info mb-0">{formatDuration(saveDuration)}</h4>
                                <small className="text-muted">Elapsed</small>
                            </div>
                        </div>

                        <p className="text-center text-danger small mt-4 mb-0">
                            <i className="fa fa-exclamation-triangle me-1"></i>
                            Please do not close or refresh this page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="card">
            <div className="card-header bg-light-success">
                <h3 className="card-title text-success"><i className="fa fa-check-circle me-2" />Generation Complete!</h3>
            </div>
            <div className="card-body text-center">
                <div className="mb-6">
                    <i className="fa fa-calendar-check text-success" style={{ fontSize: '80px' }} />
                </div>
                <h4 className="mb-4">Timetable for {formData.semesterCode} has been generated successfully!</h4>
                <p className="text-muted mb-6">
                    {generationResult?.generatedEntries?.length || 0} schedule entries were created.
                </p>
                <div className="d-flex justify-content-center gap-4">
                    <button className="btn btn-primary" onClick={resetWizard}>
                        <i className="fa fa-redo me-2" /> Generate Another
                    </button>
                    <a href="/academics/timetable/timetable-view" className="btn btn-success">
                        <i className="fa fa-eye me-2" /> View Timetable
                    </a>
                </div>
            </div>
        </div>
    );

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Auto-Generate Timetable"
                items={["Academics", "Timetable", "Auto-Generate"]}
            />
            <div className="container-xxl d-flex flex-column-fluid">
                <div className="col-12">
                    {renderStepIndicator()}
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </div>
            </div>
            {showSaveModal && renderSaveModal()}
        </div>
    );
}

const mapStateToProps = (state) => ({ LoginDetails: state.LoginDetails });
export default connect(mapStateToProps, null)(AutoGenerateTimetable);
