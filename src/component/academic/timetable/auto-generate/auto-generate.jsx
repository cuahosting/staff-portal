import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { showAlert, showConfirm } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import { connect } from "react-redux";

import TimetableViewContainer from "../timetable-view/section/timetable-view-container";
import SearchSelect from "../../../common/select/SearchSelect";
import Modal from "../../../common/modal/modal";

function AutoGenerateTimetable(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [step, setStep] = useState(1);
    const [semesters, setSemesters] = useState([]);
    const [prerequisites, setPrerequisites] = useState(null);
    const [generationResult, setGenerationResult] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [slotStats, setSlotStats] = useState(null);
    const [unusedSlots, setUnusedSlots] = useState([]);

    // Lists for filtering preview
    const [venueList, setVenueList] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [moduleList, setModuleList] = useState([]);

    // Preview Filter State
    const [viewType, setViewType] = useState('');
    const [viewValue, setViewValue] = useState('');

    const [formData, setFormData] = useState({
        semesterCode: "",
        referenceSemesterCode: "",
        insertedBy: props.LoginDetails[0]?.StaffID || ""
    });

    const getSemesters = async () => {
        setIsLoading(true);
        const [semRes, venRes, grpRes, stfRes, modRes] = await Promise.all([
            api.get("staff/academics/timetable/semester/list"),
            api.get("staff/timetable/timetable/venue/view"),
            api.get("staff/timetable/timetable/student/group/list"),
            api.get("staff/hr/staff-management/staff/list"),
            api.get("staff/academics/module/list")
        ]);

        if (semRes.success && semRes.data?.length > 0) setSemesters(semRes.data);
        if (venRes.success) setVenueList(venRes.data || []);
        if (grpRes.success) setGroupList(grpRes.data || []);
        if (stfRes.success) setStaffList(stfRes.data || []);
        if (modRes.success) setModuleList(modRes.data || []);

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

    const initializeSlots = async () => {
        setIsGenerating(true);
        const { success, data } = await api.post("staff/timetable-generator/init-slots", {
            semesterCode: formData.semesterCode,
            insertedBy: formData.insertedBy
        });

        if (success && data.message === "success") {
            setSlotStats(data);
            toast.success(`${data.slotsCreated} slots initialized!`);
            setStep(3);
        } else {
            showAlert("ERROR", "Failed to initialize slots", "error");
        }
        setIsGenerating(false);
    };

    // Progress state for module-by-module generation
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generateProgress, setGenerateProgress] = useState({
        total: 0,
        processed: 0,
        scheduled: 0,
        conflicts: 0,
        skipped: 0,
        currentModule: ''
    });

    const generateTimetable = async () => {
        // 1. Get list of modules to process
        const { success: modSuccess, data: modData } = await api.get(`staff/timetable-generator/get-modules/${formData.semesterCode}`);

        if (!modSuccess || !modData.modules?.length) {
            showAlert("ERROR", "Failed to load modules for generation", "error");
            return;
        }

        const modules = modData.modules;
        setShowGenerateModal(true);
        setGenerateProgress({
            total: modules.length,
            processed: 0,
            scheduled: 0,
            conflicts: 0,
            skipped: 0,
            currentModule: ''
        });

        const results = {
            scheduled: [],
            conflicts: [],
            skipped: [],
            stats: { totalModules: modules.length, scheduledCount: 0, conflictCount: 0, skippedCount: 0 }
        };

        // 2. Process each module one by one
        for (let i = 0; i < modules.length; i++) {
            const mod = modules[i];

            setGenerateProgress(prev => ({
                ...prev,
                currentModule: `${mod.ModuleCode} - ${mod.ModuleName || ''}`
            }));

            // Skip modules without groups
            if (!mod.hasGroups) {
                results.skipped.push({ moduleCode: mod.ModuleCode, moduleName: mod.ModuleName, reason: "No student groups" });
                results.stats.skippedCount++;
                setGenerateProgress(prev => ({
                    ...prev,
                    processed: i + 1,
                    skipped: prev.skipped + 1
                }));
                continue;
            }

            try {
                const { success, data } = await api.post("staff/timetable-generator/generate-module", {
                    semesterCode: formData.semesterCode,
                    referenceSemesterCode: formData.referenceSemesterCode,
                    moduleCode: mod.ModuleCode,
                    insertedBy: formData.insertedBy
                }, { timeout: 30000, showError: false });

                if (success) {
                    if (data.message === "scheduled" || data.message === "partial") {
                        results.scheduled.push({ moduleCode: mod.ModuleCode, moduleName: mod.ModuleName, slots: data.slots });
                        results.stats.scheduledCount++;
                        setGenerateProgress(prev => ({
                            ...prev,
                            processed: i + 1,
                            scheduled: prev.scheduled + 1
                        }));
                    } else if (data.message === "conflict") {
                        results.conflicts.push({ moduleCode: mod.ModuleCode, moduleName: mod.ModuleName, reason: data.reason });
                        results.stats.conflictCount++;
                        setGenerateProgress(prev => ({
                            ...prev,
                            processed: i + 1,
                            conflicts: prev.conflicts + 1
                        }));
                    } else if (data.message === "skipped") {
                        results.skipped.push({ moduleCode: mod.ModuleCode, moduleName: mod.ModuleName, reason: data.reason });
                        results.stats.skippedCount++;
                        setGenerateProgress(prev => ({
                            ...prev,
                            processed: i + 1,
                            skipped: prev.skipped + 1
                        }));
                    }
                } else {
                    results.conflicts.push({ moduleCode: mod.ModuleCode, moduleName: mod.ModuleName, reason: "Request failed" });
                    results.stats.conflictCount++;
                    setGenerateProgress(prev => ({
                        ...prev,
                        processed: i + 1,
                        conflicts: prev.conflicts + 1
                    }));
                }
            } catch (error) {
                results.conflicts.push({ moduleCode: mod.ModuleCode, moduleName: mod.ModuleName, reason: "Timeout or error" });
                results.stats.conflictCount++;
                setGenerateProgress(prev => ({
                    ...prev,
                    processed: i + 1,
                    conflicts: prev.conflicts + 1
                }));
            }
        }

        setShowGenerateModal(false);
        setGenerationResult({ results, message: "success" });
        await loadPreviewData();
        toast.success(`Generation complete! ${results.stats.scheduledCount} modules scheduled.`);
    };

    const loadPreviewData = async () => {
        const [previewRes, unusedRes] = await Promise.all([
            api.get(`staff/timetable-generator/preview/${formData.semesterCode}`),
            api.get(`staff/timetable-generator/unused-slots/${formData.semesterCode}`)
        ]);

        if (previewRes.success) {
            setPreviewData(previewRes.data.entries || []);
        }
        if (unusedRes.success) {
            setUnusedSlots(unusedRes.data.slots || []);
        }
    };


    // Save progress state
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveProgress, setSaveProgress] = useState({
        total: 0,
        processed: 0,
        saved: 0,
        errors: 0,
        currentEntry: ''
    });

    const saveTimetable = async () => {
        const confirmed = await showConfirm(
            "Save Timetable",
            `Are you sure you want to save this timetable? This will create ${previewData.length} schedule entries in the database.`,
            "warning"
        );

        if (!confirmed) return;

        // Check if timetable exists
        const { success: checkSuccess, data: checkData } = await api.get(`staff/timetable-generator/check/${formData.semesterCode}`);
        if (checkSuccess && checkData?.exists) {
            const wantToClear = await showConfirm(
                "Timetable Exists",
                "A timetable already exists for this semester. Do you want to clear it first?",
                "danger",
                "Yes, Clear & Save"
            );

            if (wantToClear) {
                await api.post("staff/timetable-generator/clear", { semesterCode: formData.semesterCode });
                toast.success("Previous timetable cleared.");
            } else {
                return;
            }
        }

        // Start entry-by-entry save
        setShowSaveModal(true);
        setSaveProgress({
            total: previewData.length,
            processed: 0,
            saved: 0,
            errors: 0,
            currentEntry: ''
        });

        let savedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < previewData.length; i++) {
            const entry = previewData[i];

            setSaveProgress(prev => ({
                ...prev,
                currentEntry: `${entry.ModuleCode} - ${entry.DayName} ${entry.StartTime}:00`
            }));

            try {
                const { success, data } = await api.post("staff/timetable-generator/save-entry", {
                    entryId: entry.EntryID,
                    semesterCode: formData.semesterCode,
                    insertedBy: formData.insertedBy
                }, { timeout: 30000, showError: false });

                if (success && data.message === "saved") {
                    savedCount++;
                    setSaveProgress(prev => ({
                        ...prev,
                        processed: i + 1,
                        saved: prev.saved + 1
                    }));
                } else {
                    errorCount++;
                    setSaveProgress(prev => ({
                        ...prev,
                        processed: i + 1,
                        errors: prev.errors + 1
                    }));
                }
            } catch (error) {
                errorCount++;
                setSaveProgress(prev => ({
                    ...prev,
                    processed: i + 1,
                    errors: prev.errors + 1
                }));
            }
        }

        // Clear tmp table after save
        await api.post("staff/timetable-generator/clear-tmp", { semesterCode: formData.semesterCode });

        setShowSaveModal(false);
        toast.success(`Timetable saved! ${savedCount} entries created.`);
        setStep(4);
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
        setPreviewData([]);
        setSlotStats(null);
        setViewType('');
        setViewValue('');
    };

    useEffect(() => {
        getSemesters();
    }, []);

    if (isLoading) return <Loader />;

    // Helper to get dropdown options based on view type
    const getViewOptions = () => {
        switch (viewType) {
            case 'venue':
                return venueList.map(v => ({ value: v.VenueID, label: v.VenueName }));
            case 'group':
                return groupList.map(g => ({ value: g.EntryID, label: g.GroupName }));
            case 'staff':
                return staffList.map(s => ({ value: s.StaffID, label: `${s.FirstName} ${s.Surname}` }));
            case 'module':
                return moduleList.map(m => ({ value: m.ModuleCode, label: `${m.ModuleCode} - ${m.ModuleName}` }));
            default:
                return [];
        }
    };

    // Transform preview data for TimetableViewContainer
    const getFilteredPreviewData = () => {
        if (!previewData || !viewType || !viewValue) return [];

        let filtered = [];

        if (viewType === 'venue') {
            filtered = previewData.filter(e => parseInt(e.VenueID) === parseInt(viewValue));
        } else if (viewType === 'group') {
            filtered = previewData.filter(e => e.GroupIDs && e.GroupIDs.split(',').includes(String(viewValue)));
        } else if (viewType === 'staff') {
            filtered = previewData.filter(e => e.StaffIDs && e.StaffIDs.split(',').includes(String(viewValue)));
        } else if (viewType === 'module') {
            filtered = previewData.filter(e => e.ModuleCode === viewValue);
        }

        return filtered.map(entry => {
            const staffListForEntry = (entry.StaffIDs || '').split(',').filter(Boolean).map(sid => {
                const staff = staffList.find(s => s.StaffID === sid.trim());
                return { StaffName: staff ? `${staff.FirstName} ${staff.Surname}` : sid };
            });

            const groupListForEntry = (entry.GroupIDs || '').split(',').filter(Boolean).map(gid => {
                const group = groupList.find(g => g.EntryID === parseInt(gid.trim()));
                return { groupName: group ? group.GroupName : gid, groupID: gid };
            });

            return {
                ...entry,
                StaffList: staffListForEntry,
                GroupList: groupListForEntry,
                VenueID: entry.VenueName || entry.VenueID,
                Color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
                NumOfHours: entry.EndTime - entry.StartTime,
                ModuleCode: entry.ModuleCode
            };
        });
    };

    const renderStepIndicator = () => (
        <div className="d-flex justify-content-center mb-8">
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className="d-flex align-items-center">
                    <div
                        className={`rounded-circle d-flex align-items-center justify-content-center ${step >= s ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                        style={{ width: 40, height: 40, fontWeight: 'bold' }}
                    >
                        {step > s ? <i className="fa fa-check" /> : s}
                    </div>
                    {s < 4 && (
                        <div className={`mx-2 ${step > s ? 'bg-primary' : 'bg-light'}`} style={{ width: 60, height: 4 }} />
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
                        <div className="text-muted mt-2">Use previous semester's timetable as reference (modules will try to keep same slots)</div>
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
                                ? <><i className="fa fa-check-circle me-2" />All prerequisites are met! Click "Initialize Slots" to continue.</>
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
                        onClick={initializeSlots}
                        disabled={!prerequisites?.allReady || isGenerating}
                        data-kt-indicator={isGenerating ? 'on' : 'off'}
                    >
                        <span className="indicator-label">
                            Initialize Slots <i className="fa fa-arrow-right ms-2" />
                        </span>
                        <span className="indicator-progress">
                            Initializing...
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
                <h3 className="card-title">Step 3: Generate & Preview</h3>
            </div>
            <div className="card-body">
                {slotStats && (
                    <div className="alert alert-info mb-6">
                        <i className="fa fa-info-circle me-2" />
                        <strong>{slotStats.slotsCreated}</strong> available slots initialized
                        ({slotStats.breakdown.timeSlots} time slots × {slotStats.breakdown.lectureDays} days × {slotStats.breakdown.venues} venues)
                    </div>
                )}

                <div className="row mb-6">
                    <div className="col-md-6">
                        <button
                            className="btn btn-info btn-lg w-100"
                            onClick={generateTimetable}
                            disabled={isGenerating}
                            data-kt-indicator={isGenerating ? 'on' : 'off'}
                        >
                            <span className="indicator-label">
                                <i className="fa fa-cogs me-2" /> Generate Timetable
                            </span>
                            <span className="indicator-progress">
                                Generating...
                                <span className="spinner-border spinner-border-sm align-middle ms-2" />
                            </span>
                        </button>
                    </div>
                    <div className="col-md-6">
                        <button
                            className="btn btn-success btn-lg w-100"
                            onClick={saveTimetable}
                            disabled={isSaving || previewData.length === 0}
                            data-kt-indicator={isSaving ? 'on' : 'off'}
                        >
                            <span className="indicator-label">
                                <i className="fa fa-save me-2" /> Save Timetable ({previewData.length} entries)
                            </span>
                            <span className="indicator-progress">
                                Saving...
                                <span className="spinner-border spinner-border-sm align-middle ms-2" />
                            </span>
                        </button>
                    </div>
                </div>

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

                        <div className="row mb-6">
                            <div className="col-md-6">
                                <h5>Preview Schedule</h5>
                                <button
                                    className="btn btn-info w-100 mb-4"
                                    data-bs-toggle="modal"
                                    data-bs-target="#preview_modal"
                                >
                                    <i className="fa fa-eye me-2" /> Open Timetable Preview
                                </button>

                                <Modal
                                    title={`Timetable Preview - ${formData.semesterCode}`}
                                    id="preview_modal"
                                    large={true}
                                >
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <SearchSelect
                                                label="Select View Option"
                                                options={[
                                                    { value: 'venue', label: 'Venue' },
                                                    { value: 'group', label: 'Group' },
                                                    { value: 'staff', label: 'Staff' },
                                                    { value: 'module', label: 'Module' }
                                                ]}
                                                value={viewType ? { value: viewType, label: viewType.charAt(0).toUpperCase() + viewType.slice(1) } : null}
                                                onChange={(selected) => { setViewType(selected?.value || ''); setViewValue(''); }}
                                                placeholder="Search View Option"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <SearchSelect
                                                label="Select Report Item"
                                                disabled={!viewType}
                                                options={getViewOptions()}
                                                value={getViewOptions().find(op => op.value === viewValue) || null}
                                                onChange={(selected) => setViewValue(selected?.value || '')}
                                                placeholder="Search Report Item"
                                            />
                                        </div>
                                    </div>

                                    {viewType && viewValue && (
                                        <TimetableViewContainer
                                            title={`Preview`}
                                            sub_title={`Timetable Preview - Semester: ${formData.semesterCode}`}
                                            data={getFilteredPreviewData()}
                                            show_key={true}
                                            type={viewType}
                                        />
                                    )}

                                    {!viewValue && (
                                        <div className="alert alert-info">
                                            Please select a view option and item to preview specific schedules.
                                        </div>
                                    )}
                                </Modal>
                            </div>

                            <div className="col-md-6">
                                <h5>Slot Utilization</h5>
                                <button
                                    className="btn btn-secondary w-100 mb-4"
                                    data-bs-toggle="modal"
                                    data-bs-target="#slots_modal"
                                >
                                    <i className="fa fa-chart-pie me-2" /> View Slot Utilization ({unusedSlots.length} unused)
                                </button>

                                <Modal
                                    title="Slot Utilization Report"
                                    id="slots_modal"
                                    large={true}
                                >
                                    <div className="row text-center mb-4">
                                        <div className="col-6">
                                            <h2 className="text-success mb-0">{previewData.length}</h2>
                                            <span className="text-muted">Used Slots</span>
                                        </div>
                                        <div className="col-6">
                                            <h2 className="text-secondary mb-0">{unusedSlots.length}</h2>
                                            <span className="text-muted">Unused Slots</span>
                                        </div>
                                    </div>

                                    <div className="progress mb-3" style={{ height: '25px' }}>
                                        <div
                                            className="progress-bar bg-success"
                                            style={{ width: `${slotStats?.slotsCreated ? (previewData.length / slotStats.slotsCreated) * 100 : 0}%` }}
                                        >
                                            {slotStats?.slotsCreated ? Math.round((previewData.length / slotStats.slotsCreated) * 100) : 0}% Used
                                        </div>
                                    </div>

                                    <p className="text-muted text-center mb-4">
                                        <i className="fa fa-info-circle me-1"></i>
                                        {slotStats?.slotsCreated || 0} total slots ({slotStats?.breakdown?.timeSlots || 0} times × {slotStats?.breakdown?.lectureDays || 0} days × {slotStats?.breakdown?.venues || 0} venues)
                                    </p>

                                    <h5 className="text-secondary mt-4 mb-3">
                                        <i className="fa fa-calendar-times me-2"></i>
                                        Unused Time Slots ({unusedSlots.length})
                                    </h5>

                                    {unusedSlots.length > 0 ? (
                                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            <table className="table table-sm table-bordered table-striped">
                                                <thead className="bg-light sticky-top">
                                                    <tr>
                                                        <th>Day</th>
                                                        <th>Time Slot</th>
                                                        <th>Venue</th>
                                                        <th>Capacity</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {unusedSlots.map((slot, idx) => (
                                                        <tr key={idx}>
                                                            <td>{slot.DayName}</td>
                                                            <td>{slot.TimeSlot}</td>
                                                            <td>{slot.VenueName}</td>
                                                            <td>{slot.Capacity}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="alert alert-success text-center">
                                            <i className="fa fa-check-circle me-2"></i>
                                            All slots have been utilized!
                                        </div>
                                    )}
                                </Modal>
                            </div>
                        </div>



                        {generationResult.results?.conflicts?.length > 0 && (
                            <div className="mb-6">
                                <h5 className="text-danger">Conflicts ({generationResult.results.conflicts.length})</h5>
                                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="card">
            <div className="card-header bg-light-success">
                <h3 className="card-title text-success"><i className="fa fa-check-circle me-2" />Timetable Saved!</h3>
            </div>
            <div className="card-body text-center">
                <div className="mb-6">
                    <i className="fa fa-calendar-check text-success" style={{ fontSize: '80px' }} />
                </div>
                <h4 className="mb-4">Timetable for {formData.semesterCode} has been saved successfully!</h4>
                <p className="text-muted mb-6">
                    {previewData.length} schedule entries were created in the database.
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

    const renderGenerateModal = () => (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-primary">
                        <h5 className="modal-title text-white">
                            <i className="fa fa-cogs me-2"></i>
                            Generating Timetable...
                        </h5>
                    </div>
                    <div className="modal-body">
                        <div className="text-center mb-4">
                            <h3 className="mb-1">{generateProgress.processed} of {generateProgress.total}</h3>
                            <p className="text-muted mb-0">Modules Processed</p>
                        </div>

                        <div className="progress mb-4" style={{ height: '25px' }}>
                            <div
                                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                                role="progressbar"
                                style={{ width: `${generateProgress.total > 0 ? (generateProgress.processed / generateProgress.total) * 100 : 0}%` }}
                            >
                                {generateProgress.total > 0 ? Math.round((generateProgress.processed / generateProgress.total) * 100) : 0}%
                            </div>
                        </div>

                        {generateProgress.currentModule && (
                            <div className="alert alert-secondary d-flex align-items-center p-3 mb-4">
                                <div className="spinner-border spinner-border-sm text-primary me-3"></div>
                                <div>
                                    <small className="text-muted d-block">Currently Processing:</small>
                                    <span className="fw-bold text-primary">{generateProgress.currentModule}</span>
                                </div>
                            </div>
                        )}

                        <div className="row text-center">
                            <div className="col-4 border-end">
                                <h4 className="text-success mb-0">{generateProgress.scheduled}</h4>
                                <small className="text-muted">Scheduled</small>
                            </div>
                            <div className="col-4 border-end">
                                <h4 className="text-danger mb-0">{generateProgress.conflicts}</h4>
                                <small className="text-muted">Conflicts</small>
                            </div>
                            <div className="col-4">
                                <h4 className="text-warning mb-0">{generateProgress.skipped}</h4>
                                <small className="text-muted">Skipped</small>
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

    const renderSaveModal = () => (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-success">
                        <h5 className="modal-title text-white">
                            <i className="fa fa-save me-2"></i>
                            Saving Timetable...
                        </h5>
                    </div>
                    <div className="modal-body">
                        <div className="text-center mb-4">
                            <h3 className="mb-1">{saveProgress.processed} of {saveProgress.total}</h3>
                            <p className="text-muted mb-0">Entries Saved</p>
                        </div>

                        <div className="progress mb-4" style={{ height: '25px' }}>
                            <div
                                className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                                role="progressbar"
                                style={{ width: `${saveProgress.total > 0 ? (saveProgress.processed / saveProgress.total) * 100 : 0}%` }}
                            >
                                {saveProgress.total > 0 ? Math.round((saveProgress.processed / saveProgress.total) * 100) : 0}%
                            </div>
                        </div>

                        {saveProgress.currentEntry && (
                            <div className="alert alert-secondary d-flex align-items-center p-3 mb-4">
                                <div className="spinner-border spinner-border-sm text-success me-3"></div>
                                <div>
                                    <small className="text-muted d-block">Currently Saving:</small>
                                    <span className="fw-bold text-success">{saveProgress.currentEntry}</span>
                                </div>
                            </div>
                        )}

                        <div className="row text-center">
                            <div className="col-6 border-end">
                                <h4 className="text-success mb-0">{saveProgress.saved}</h4>
                                <small className="text-muted">Saved</small>
                            </div>
                            <div className="col-6">
                                <h4 className="text-danger mb-0">{saveProgress.errors}</h4>
                                <small className="text-muted">Errors</small>
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
            {showGenerateModal && renderGenerateModal()}
            {showSaveModal && renderSaveModal()}
        </div>
    );
}

const mapStateToProps = (state) => ({ LoginDetails: state.LoginDetails });
export default connect(mapStateToProps, null)(AutoGenerateTimetable);
