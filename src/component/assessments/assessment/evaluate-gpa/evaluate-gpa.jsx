import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import SearchSelect from "../../../common/select/SearchSelect";
import { shortCode } from "../../../../resources/constants";

function EvaluateGPA(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [semesterList, setSemesterList] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);

    // Processing states
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingCount, setProcessingCount] = useState(0);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [showComplete, setShowComplete] = useState(false);
    const [processStartTime, setProcessStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Stats
    const [totalStudents, setTotalStudents] = useState(0);
    const [processedStudents, setProcessedStudents] = useState(0);
    const [pendingStudents, setPendingStudents] = useState(0);
    const [scholarshipsAssigned, setScholarshipsAssigned] = useState(0);

    // Semester report
    const [semesterReport, setSemesterReport] = useState([]);
    const [showReport, setShowReport] = useState(true);

    // Scholarship settings
    const [scholarshipSettings, setScholarshipSettings] = useState([]);
    const [showScholarshipPanel, setShowScholarshipPanel] = useState(false);
    const [newSetting, setNewSetting] = useState({ FromGPA: '', ToGPA: '', ScholarshipPercentage: '', Description: '' });
    const [isAddingSetting, setIsAddingSetting] = useState(false);

    // Grade scale - state with default based on institution
    const defaultScale = shortCode === 'BAUK' || shortCode === 'AUM' ? '5-point' : '4-point';
    const [gradeScale, setGradeScale] = useState(defaultScale);

    // Pending students modal
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [pendingStudentsList, setPendingStudentsList] = useState([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [pendingSemester, setPendingSemester] = useState(null);

    // Timer effect
    useEffect(() => {
        let timer;
        if (isProcessing && processStartTime) {
            timer = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - processStartTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isProcessing, processStartTime]);

    const formatDuration = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    // Fetch semesters and report on load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [semRes, reportRes] = await Promise.all([
                    api.get("registration/registration-report/semester-list/"),
                    api.get("staff/assessments/gpa/evaluate/gpa/semester-report")
                ]);

                if (semRes.success && semRes.data) {
                    const options = semRes.data.map(s => ({
                        value: s.SemesterCode,
                        label: `${s.SemesterCode} - ${s.Description}${s.IsActive === '1' || s.IsActive === 1 ? ' (Active)' : ''}`
                    }));
                    setSemesterList(options);
                }

                if (reportRes.success && reportRes.data?.semesters) {
                    setSemesterReport(reportRes.data.semesters);
                }
            } catch (error) {
                toast.error("Error loading data");
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    // Fetch stats when semester changes
    const handleSemesterChange = async (selected) => {
        setSelectedSemester(selected);
        setShowComplete(false);
        setProcessingCount(0);

        if (selected?.value) {
            try {
                const { success, data } = await api.get(`staff/assessments/gpa/evaluate/gpa/stats/${selected.value}`);
                if (success) {
                    setTotalStudents(data.totalStudents || 0);
                    setProcessedStudents(data.processedStudents || 0);
                    setPendingStudents(data.pendingStudents || 0);
                    setScholarshipSettings(data.scholarshipSettings || []);
                }
            } catch (error) {
                toast.error("Error fetching stats");
            }
        }
    };

    // Fetch scholarship settings
    const fetchScholarshipSettings = async () => {
        if (!selectedSemester?.value) return;
        try {
            const { success, data } = await api.get(`staff/assessments/gpa/scholarship-settings/${selectedSemester.value}`);
            if (success) {
                setScholarshipSettings(data.settings || []);
            }
        } catch (error) {
            toast.error("Error fetching scholarship settings");
        }
    };

    // Add new scholarship setting
    const handleAddSetting = async () => {
        if (!newSetting.FromGPA || !newSetting.ToGPA || !newSetting.ScholarshipPercentage) {
            return toast.error("Please fill all required fields");
        }

        setIsAddingSetting(true);
        try {
            const { success, data } = await api.post("staff/assessments/gpa/scholarship-settings", {
                ...newSetting,
                SemesterCode: selectedSemester.value,
                InsertedBy: props.loginData.StaffID
            });

            if (success) {
                toast.success("Scholarship setting added");
                setNewSetting({ FromGPA: '', ToGPA: '', ScholarshipPercentage: '', Description: '' });
                fetchScholarshipSettings();
            } else {
                toast.error(data?.error || "Failed to add setting");
            }
        } catch (error) {
            toast.error("Error adding setting");
        }
        setIsAddingSetting(false);
    };

    // Delete scholarship setting
    const handleDeleteSetting = async (id) => {
        if (!window.confirm("Delete this scholarship setting?")) return;
        try {
            const { success } = await api.delete(`staff/assessments/gpa/scholarship-settings/${id}`);
            if (success) {
                toast.success("Setting deleted");
                fetchScholarshipSettings();
            }
        } catch (error) {
            toast.error("Error deleting setting");
        }
    };

    // Fetch pending students for a semester
    const fetchPendingStudents = async (semesterCode, semesterName) => {
        setLoadingPending(true);
        setPendingSemester({ code: semesterCode, name: semesterName });
        setShowPendingModal(true);

        try {
            const { success, data } = await api.get(`staff/assessments/gpa/evaluate/gpa/pending/${semesterCode}`);
            if (success) {
                setPendingStudentsList(data.students || []);
            } else {
                toast.error("Failed to fetch pending students");
            }
        } catch (error) {
            toast.error("Error fetching pending students");
        }
        setLoadingPending(false);
    };

    // Process GPA - Sequential student-by-student processing
    const processGPA = async () => {
        if (!selectedSemester?.value) {
            return toast.error("Please select a semester");
        }

        setIsProcessing(true);
        setProcessingCount(0);
        setProcessStartTime(Date.now());
        setElapsedTime(0);
        setScholarshipsAssigned(0);
        setCurrentStudent(null);

        try {
            // 1. First fetch the list of students to process
            const studentsRes = await api.get(`staff/assessments/gpa/evaluate/gpa/students/${selectedSemester.value}`);

            if (!studentsRes.success || !studentsRes.data?.students) {
                toast.error("Failed to fetch students");
                setIsProcessing(false);
                return;
            }

            const students = studentsRes.data.students;
            setTotalStudents(students.length);

            if (students.length === 0) {
                toast.info("No students to process");
                setIsProcessing(false);
                return;
            }

            let processed = 0;
            let scholarships = 0;
            let errors = 0;

            // 2. Process each student one at a time
            for (const student of students) {
                setCurrentStudent({
                    id: student.StudentID,
                    name: student.StudentName,
                    course: student.CourseCode
                });

                try {
                    const { success, data } = await api.post("staff/assessments/gpa/evaluate/gpa/student", {
                        studentId: student.StudentID,
                        semester: selectedSemester.value,
                        InsertedBy: props.loginData.StaffID,
                        gradeScale
                    });

                    if (success && data?.student) {
                        processed++;
                        setProcessingCount(processed);

                        // Update current student with GPA result
                        setCurrentStudent(prev => ({
                            ...prev,
                            gpa: data.student.GPA,
                            cue: data.student.CUE,
                            cur: data.student.CUR
                        }));
                    } else {
                        errors++;
                    }
                } catch (err) {
                    errors++;
                    console.error(`Error processing ${student.StudentID}:`, err);
                }
            }

            // 3. Complete
            setShowComplete(true);
            setProcessedStudents(processed);
            setCurrentStudent(null);

            if (processed > 0) {
                toast.success(`Successfully processed ${processed} student(s)`);
            }
            if (errors > 0) {
                toast.warning(`${errors} student(s) failed to process`);
            }

            // 4. Refresh stats and report
            handleSemesterChange(selectedSemester);
            const reportRes = await api.get("staff/assessments/gpa/evaluate/gpa/semester-report");
            if (reportRes.success && reportRes.data?.semesters) {
                setSemesterReport(reportRes.data.semesters);
            }
        } catch (error) {
            toast.error("Error processing GPA");
            console.error(error);
        }
        setIsProcessing(false);
    };

    // Reset
    const resetProcess = () => {
        setShowComplete(false);
        setProcessingCount(0);
        handleSemesterChange(selectedSemester);
    };

    const progressPercent = totalStudents > 0 ? Math.round((processedStudents / totalStudents) * 100) : 0;

    // Status badge component
    const StatusBadge = ({ status }) => {
        const colors = {
            'Complete': 'bg-success',
            'Partial': 'bg-warning',
            'Not Started': 'bg-secondary'
        };
        return <span className={`badge ${colors[status] || 'bg-secondary'}`}>{status}</span>;
    };

    if (isLoading) return <Loader />;

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Evaluate GPA" items={["Assessment", "Evaluate GPA"]} />
            <div className="flex-column-fluid">
                <div className="card shadow-sm">
                    <div className="card-body py-5">

                        {/* Step Indicator */}
                        <div className="d-flex justify-content-center mb-5">
                            <div className="d-flex align-items-center">
                                <div className={`d-flex align-items-center justify-content-center rounded-circle ${selectedSemester ? 'bg-success' : 'bg-primary'}`} style={{ width: '40px', height: '40px' }}>
                                    <span className="text-white fw-bold">{selectedSemester ? <i className="fa fa-check"></i> : '1'}</span>
                                </div>
                                <span className={`ms-2 me-4 fw-semibold ${selectedSemester ? 'text-success' : 'text-primary'}`}>Select Semester</span>

                                <div className={`bg-${selectedSemester ? 'primary' : 'secondary'}`} style={{ width: '50px', height: '3px' }}></div>

                                <div className={`d-flex align-items-center justify-content-center rounded-circle ms-4 ${isProcessing ? 'bg-primary' : showComplete ? 'bg-success' : 'bg-secondary'}`} style={{ width: '40px', height: '40px' }}>
                                    <span className="text-white fw-bold">{showComplete ? <i className="fa fa-check"></i> : '2'}</span>
                                </div>
                                <span className={`ms-2 me-4 fw-semibold ${isProcessing ? 'text-primary' : showComplete ? 'text-success' : 'text-secondary'}`}>Processing</span>

                                <div className={`bg-${showComplete ? 'primary' : 'secondary'}`} style={{ width: '50px', height: '3px' }}></div>

                                <div className={`d-flex align-items-center justify-content-center rounded-circle ms-4 ${showComplete ? 'bg-primary' : 'bg-secondary'}`} style={{ width: '40px', height: '40px' }}>
                                    <span className="text-white fw-bold">3</span>
                                </div>
                                <span className={`ms-2 fw-semibold ${showComplete ? 'text-primary' : 'text-secondary'}`}>Complete</span>
                            </div>
                        </div>

                        {/* GPA Status Report Panel */}
                        <div className="card bg-light mb-4">
                            <div className="card-header d-flex justify-content-between align-items-center cursor-pointer" onClick={() => setShowReport(!showReport)}>
                                <h6 className="mb-0"><i className="fa fa-chart-bar me-2"></i>GPA Processing Status Report</h6>
                                <i className={`fa fa-chevron-${showReport ? 'up' : 'down'}`}></i>
                            </div>
                            {showReport && (
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Semester</th>
                                                    <th className="text-center">Total Students</th>
                                                    <th className="text-center">GPA Generated</th>
                                                    <th className="text-center">Pending</th>
                                                    <th className="text-center">Progress</th>
                                                    <th className="text-center">Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {semesterReport.slice(0, 10).map((sem, idx) => (
                                                    <tr key={idx} className={selectedSemester?.value === sem.SemesterCode ? 'table-primary' : ''}>
                                                        <td>
                                                            <strong>{sem.SemesterCode}</strong> - {sem.SemesterName}
                                                            {sem.IsActive === 'Active' && <span className="badge bg-info ms-2">Active</span>}
                                                        </td>
                                                        <td className="text-center">{sem.TotalStudents}</td>
                                                        <td className="text-center text-success fw-bold">{sem.StudentsWithGPA}</td>
                                                        <td className="text-center">
                                                            {sem.StudentsWithoutGPA > 0 ? (
                                                                <span
                                                                    className="text-warning fw-bold cursor-pointer text-decoration-underline"
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => fetchPendingStudents(sem.SemesterCode, sem.SemesterName)}
                                                                    title="Click to view pending students"
                                                                >
                                                                    {sem.StudentsWithoutGPA}
                                                                </span>
                                                            ) : (
                                                                <span className="text-success">0</span>
                                                            )}
                                                        </td>
                                                        <td className="text-center" style={{ width: '150px' }}>
                                                            <div className="progress" style={{ height: '8px' }}>
                                                                <div className="progress-bar" style={{ width: `${sem.ProcessingPercentage}%` }}></div>
                                                            </div>
                                                            <small>{sem.ProcessingPercentage}%</small>
                                                        </td>
                                                        <td className="text-center"><StatusBadge status={sem.Status} /></td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => {
                                                                    const option = semesterList.find(s => s.value === sem.SemesterCode);
                                                                    if (option) handleSemesterChange(option);
                                                                }}
                                                            >
                                                                Select
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selection Row */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Semester</label>
                                <SearchSelect
                                    options={semesterList}
                                    value={selectedSemester}
                                    onChange={handleSemesterChange}
                                    placeholder="Select Semester"
                                    isDisabled={isProcessing}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Grade Scale</label>
                                <select
                                    className="form-select"
                                    value={gradeScale}
                                    onChange={(e) => setGradeScale(e.target.value)}
                                    disabled={isProcessing}
                                >
                                    <option value="4-point">4-point</option>
                                    <option value="5-point">5-point</option>
                                </select>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                {showComplete ? (
                                    <button className="btn btn-success w-100" onClick={resetProcess}>
                                        <i className="fa fa-refresh me-2"></i>Reset
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-primary w-100"
                                        onClick={processGPA}
                                        disabled={isProcessing || !selectedSemester}
                                    >
                                        {isProcessing ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                                        ) : (
                                            <><i className="fa fa-cogs me-2"></i>Evaluate GPA</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stats Cards */}
                        {selectedSemester && !isProcessing && (
                            <div className="row mb-4">
                                <div className="col-md-3">
                                    <div className="card bg-light h-100">
                                        <div className="card-body text-center py-3">
                                            <h2 className="text-primary mb-0">{totalStudents}</h2>
                                            <small className="text-muted">Total Students</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card bg-success bg-opacity-10 h-100">
                                        <div className="card-body text-center py-3">
                                            <h2 className="text-success mb-0">{processedStudents}</h2>
                                            <small className="text-muted">GPA Processed</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card bg-warning bg-opacity-10 h-100">
                                        <div className="card-body text-center py-3">
                                            <h2 className="text-warning mb-0">{pendingStudents}</h2>
                                            <small className="text-muted">Pending</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card bg-info bg-opacity-10 h-100">
                                        <div className="card-body text-center py-3">
                                            <h2 className="text-info mb-0">{scholarshipSettings.length}</h2>
                                            <small className="text-muted">Scholarship Tiers</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Processing Progress Card */}
                        {isProcessing && (
                            <div className="card bg-light border-primary mb-4">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-md-6">
                                            <h6 className="mb-1 text-primary">
                                                <i className="fa fa-user-graduate me-2"></i>Currently Processing:
                                            </h6>
                                            {currentStudent ? (
                                                <>
                                                    <p className="mb-0 fw-bold fs-5">{currentStudent.id}</p>
                                                    <p className="mb-0 text-muted">{currentStudent.name}</p>
                                                    {currentStudent.gpa !== undefined && (
                                                        <small className="text-success">
                                                            <i className="fa fa-check me-1"></i>
                                                            GPA: <strong>{currentStudent.gpa}</strong> |
                                                            CUE: {currentStudent.cue} | CUR: {currentStudent.cur}
                                                        </small>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="mb-0 text-muted">Loading students...</p>
                                            )}
                                        </div>
                                        <div className="col-md-6">
                                            <div className="row text-center">
                                                <div className="col-4">
                                                    <h5 className="text-primary mb-0">{formatDuration(elapsedTime)}</h5>
                                                    <small className="text-muted">Elapsed</small>
                                                </div>
                                                <div className="col-4">
                                                    <h5 className="text-success mb-0">{processingCount}</h5>
                                                    <small className="text-muted">Processed</small>
                                                </div>
                                                <div className="col-4">
                                                    <h5 className="text-warning mb-0">{totalStudents - processingCount}</h5>
                                                    <small className="text-muted">Remaining</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="progress mt-3" style={{ height: '25px' }}>
                                        <div
                                            className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                                            style={{ width: `${totalStudents > 0 ? Math.round((processingCount / totalStudents) * 100) : 0}%` }}
                                        >
                                            {totalStudents > 0 ? Math.round((processingCount / totalStudents) * 100) : 0}% ({processingCount}/{totalStudents})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Completion Card */}
                        {showComplete && (
                            <div className="card bg-success bg-opacity-10 border-success mb-4">
                                <div className="card-body text-center py-4">
                                    <i className="fa fa-check-circle text-success" style={{ fontSize: '48px' }}></i>
                                    <h4 className="mt-3 text-success">GPA Evaluation Complete!</h4>
                                    <p className="mb-0">Processed {processingCount} students in {formatDuration(elapsedTime)}</p>
                                    {scholarshipsAssigned > 0 && (
                                        <p className="text-info mt-2">
                                            <i className="fa fa-award me-2"></i>
                                            {scholarshipsAssigned} student(s) assigned scholarships
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Scholarship Settings Panel */}
                        {selectedSemester && (
                            <div className="card bg-light mb-4">
                                <div className="card-header d-flex justify-content-between align-items-center cursor-pointer" onClick={() => { setShowScholarshipPanel(!showScholarshipPanel); if (!showScholarshipPanel) fetchScholarshipSettings(); }}>
                                    <h6 className="mb-0"><i className="fa fa-award me-2"></i>Scholarship Settings</h6>
                                    <i className={`fa fa-chevron-${showScholarshipPanel ? 'up' : 'down'}`}></i>
                                </div>
                                {showScholarshipPanel && (
                                    <div className="card-body">
                                        {/* Add new setting form */}
                                        <div className="row mb-3 g-2 align-items-end">
                                            <div className="col-md-2">
                                                <label className="form-label">From GPA</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="5"
                                                    className="form-control"
                                                    placeholder="e.g. 4.50"
                                                    value={newSetting.FromGPA}
                                                    onChange={(e) => setNewSetting({ ...newSetting, FromGPA: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label">To GPA</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="5"
                                                    className="form-control"
                                                    placeholder="e.g. 5.00"
                                                    value={newSetting.ToGPA}
                                                    onChange={(e) => setNewSetting({ ...newSetting, ToGPA: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label">Scholarship %</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="form-control"
                                                    placeholder="e.g. 50"
                                                    value={newSetting.ScholarshipPercentage}
                                                    onChange={(e) => setNewSetting({ ...newSetting, ScholarshipPercentage: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Description (Optional)</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="e.g. First Class Scholarship"
                                                    value={newSetting.Description}
                                                    onChange={(e) => setNewSetting({ ...newSetting, Description: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <button
                                                    className="btn btn-success w-100"
                                                    onClick={handleAddSetting}
                                                    disabled={isAddingSetting}
                                                >
                                                    {isAddingSetting ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fa fa-plus me-1"></i>Add</>}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Settings table */}
                                        {scholarshipSettings.length > 0 ? (
                                            <table className="table table-bordered">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>From GPA</th>
                                                        <th>To GPA</th>
                                                        <th>Scholarship %</th>
                                                        <th>Description</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {scholarshipSettings.map((setting, idx) => (
                                                        <tr key={idx}>
                                                            <td>{setting.FromGPA}</td>
                                                            <td>{setting.ToGPA}</td>
                                                            <td><span className="badge bg-success">{setting.ScholarshipPercentage}%</span></td>
                                                            <td>{setting.Description || '-'}</td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDeleteSetting(setting.EntryID)}
                                                                >
                                                                    <i className="fa fa-trash"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="alert alert-info mb-0">
                                                <i className="fa fa-info-circle me-2"></i>
                                                No scholarship settings configured for this semester. Add settings above to automatically assign scholarships based on GPA.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Info Section */}
                        {!selectedSemester && !isProcessing && (
                            <div className="card bg-light mb-4">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3"><i className="fa fa-info-circle me-2 text-primary"></i>What Happens When You Evaluate GPA?</h6>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="d-flex align-items-start mb-2">
                                                <span className="badge bg-primary me-2">1</span>
                                                <div><strong>Load Students</strong><br /><small className="text-muted">Fetch all students with processed results</small></div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="d-flex align-items-start mb-2">
                                                <span className="badge bg-primary me-2">2</span>
                                                <div><strong>Calculate GPA</strong><br /><small className="text-muted">Compute CUE, CUR, WGP, and GPA</small></div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="d-flex align-items-start mb-2">
                                                <span className="badge bg-primary me-2">3</span>
                                                <div><strong>Save Results</strong><br /><small className="text-muted">Store GPA in semester analysis table</small></div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="d-flex align-items-start mb-2">
                                                <span className="badge bg-primary me-2">4</span>
                                                <div><strong>Assign Scholarships</strong><br /><small className="text-muted">Auto-assign based on GPA tiers</small></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Pending Students Modal */}
            {showPendingModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-warning text-dark">
                                <h5 className="modal-title">
                                    <i className="fa fa-clock me-2"></i>
                                    Pending GPA - {pendingSemester?.code}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowPendingModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {loadingPending ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <p className="mt-2">Loading pending students...</p>
                                    </div>
                                ) : pendingStudentsList.length === 0 ? (
                                    <div className="alert alert-success text-center">
                                        <i className="fa fa-check-circle me-2"></i>
                                        All students have GPA processed for this semester!
                                    </div>
                                ) : (
                                    <>
                                        <div className="alert alert-warning mb-3">
                                            <strong>{pendingStudentsList.length}</strong> student(s) registered but without GPA
                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '400px' }}>
                                            <table className="table table-sm table-hover">
                                                <thead className="table-light sticky-top">
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Student ID</th>
                                                        <th>Student Name</th>
                                                        <th>Course</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingStudentsList.map((student, idx) => (
                                                        <tr key={idx}>
                                                            <td>{idx + 1}</td>
                                                            <td><strong>{student.StudentID}</strong></td>
                                                            <td>{student.StudentName}</td>
                                                            <td><span className="badge bg-secondary">{student.CourseCode}</span></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPendingModal(false)}>
                                    Close
                                </button>
                                {pendingStudentsList.length > 0 && (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setShowPendingModal(false);
                                            const option = semesterList.find(s => s.value === pendingSemester?.code);
                                            if (option) {
                                                handleSemesterChange(option);
                                            }
                                        }}
                                    >
                                        <i className="fa fa-cogs me-2"></i>Select & Process
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0], currentSemester: state.currentSemester });
export default connect(mapStateToProps, null)(EvaluateGPA);
