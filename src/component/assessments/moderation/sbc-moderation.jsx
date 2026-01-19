import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import SearchSelect from "../../common/select/SearchSelect";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";

function SBCModeration(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [semesters, setSemesters] = useState([]);
    const [modules, setModules] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);

    const [mode, setMode] = useState("RANGE");
    const [fromScore, setFromScore] = useState(35);
    const [toScore, setToScore] = useState(39);
    const [adjustment, setAdjustment] = useState("ADD_POINTS");
    const [adjustmentValue, setAdjustmentValue] = useState(5);
    const [reason, setReason] = useState("");
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
                    loadModules(semesterOptions[0].value);
                }
            }
        } catch (error) { toast.error("Error loading data"); }
        setIsLoading(false);
    };

    const loadModules = async (semester) => {
        setModules([]);
        setStudents([]);
        setSelectedModule(null);
        const { success, data } = await api.get(`staff/assessment/moderation/modules/${semester}`);
        if (success) {
            const moduleOptions = (data.modules || []).map(m => ({ value: m.ModuleCode, label: `${m.ModuleCode} - ${m.ModuleName}` }));
            setModules(moduleOptions);
        }
    };

    const handleSemesterChange = (selected) => {
        setSelectedSemester(selected);
        if (selected) loadModules(selected.value);
    };

    const loadStudents = async () => {
        if (!selectedModule || !selectedSemester) { toast.warning("Please select semester and module"); return; }
        setLoadingStudents(true);
        const { success, data } = await api.post("staff/assessment/moderation/students", { moduleCode: selectedModule.value, semester: selectedSemester.value });
        if (success) { setStudents(data.students || []); setSelectedStudents([]); }
        setLoadingStudents(false);
    };

    const toggleStudent = (entryId) => setSelectedStudents(prev => prev.includes(entryId) ? prev.filter(id => id !== entryId) : [...prev, entryId]);
    const toggleAll = () => selectedStudents.length === students.length ? setSelectedStudents([]) : setSelectedStudents(students.map(s => s.EntryID));

    const getFilteredStudents = () => {
        if (mode === 'ALL') return students;
        if (mode === 'SELECTED') return students.filter(s => selectedStudents.includes(s.EntryID));
        if (mode === 'RANGE') return students.filter(s => s.Total >= fromScore && s.Total <= toScore);
        return [];
    };

    const getNewScore = (originalScore) => {
        if (adjustment === 'ADD_POINTS') return Math.min(parseFloat(originalScore) + parseFloat(adjustmentValue), 100);
        return parseFloat(adjustmentValue);
    };

    const applyModeration = async () => {
        if (!reason.trim()) { toast.warning("Please provide a reason for moderation"); return; }
        const filtered = getFilteredStudents();
        if (filtered.length === 0) { toast.warning("No students match the selected criteria"); return; }

        setApplying(true);
        const { success, data } = await api.post("staff/assessment/moderation/apply", {
            moduleCode: selectedModule.value, semester: selectedSemester.value, moderationType: "SBC", mode,
            fromScore: mode === 'RANGE' ? fromScore : null, toScore: mode === 'RANGE' ? toScore : null,
            adjustment, adjustmentValue, studentIds: mode === 'SELECTED' ? selectedStudents : null, reason, moderatedBy: props.loginData.StaffID
        });

        if (success && data.message === 'success') {
            toast.success(`SBC Moderation applied to ${data.studentsModerated} students. Scores updated immediately.`);
            loadStudents();
        } else { toast.error(data.error || "Failed to apply moderation"); }
        setApplying(false);
    };

    const filteredStudents = getFilteredStudents();

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="SBC Moderation" items={["Assessment", "Moderation", "SBC"]} />
            <div className="flex-column-fluid">
                {/* Important Notice */}
                <div className="alert alert-warning mb-4">
                    <i className="fa fa-exclamation-triangle me-2"></i>
                    <strong>Important:</strong> SBC moderation is final and will be applied immediately to student records. No further approval is required.
                </div>

                {/* Filter Section */}
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <SearchSelect
                            id="semester"
                            label="Semester"
                            value={selectedSemester}
                            options={semesters}
                            onChange={handleSemesterChange}
                            placeholder="Search Semester..."
                            isClearable={false}
                        />
                    </div>
                    <div className="col-md-5">
                        <SearchSelect
                            id="module"
                            label="Module"
                            value={selectedModule}
                            options={modules}
                            onChange={setSelectedModule}
                            placeholder="Search Module..."
                        />
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                        <button className="btn btn-danger w-100" onClick={loadStudents} disabled={loadingStudents} style={{ height: '44px' }}>
                            {loadingStudents ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa fa-search me-2"></i>}Load Students
                        </button>
                    </div>
                </div>

                {students.length > 0 && (
                    <>
                        {/* Moderation Settings */}
                        <div className="card bg-light mb-4">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3"><i className="fa fa-cog me-2"></i>Moderation Settings</h6>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Apply To</label>
                                        <div className="d-flex flex-column gap-2">
                                            <div className="form-check"><input type="radio" className="form-check-input" name="mode" checked={mode === 'ALL'} onChange={() => setMode('ALL')} /><label className="form-check-label">All Students ({students.length})</label></div>
                                            <div className="form-check"><input type="radio" className="form-check-input" name="mode" checked={mode === 'SELECTED'} onChange={() => setMode('SELECTED')} /><label className="form-check-label">Selected Students ({selectedStudents.length})</label></div>
                                            <div className="form-check"><input type="radio" className="form-check-input" name="mode" checked={mode === 'RANGE'} onChange={() => setMode('RANGE')} /><label className="form-check-label">Score Range</label></div>
                                        </div>
                                    </div>
                                    {mode === 'RANGE' && (
                                        <div className="col-md-3">
                                            <label className="form-label fw-semibold">Score Range</label>
                                            <div className="d-flex gap-2 align-items-center">
                                                <input type="number" className="form-control" value={fromScore} onChange={(e) => setFromScore(e.target.value)} min="0" max="100" />
                                                <span>to</span>
                                                <input type="number" className="form-control" value={toScore} onChange={(e) => setToScore(e.target.value)} min="0" max="100" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Adjustment Type</label>
                                        <select className="form-select" value={adjustment} onChange={(e) => setAdjustment(e.target.value)}>
                                            <option value="ADD_POINTS">Add Points</option>
                                            <option value="SET_SCORE">Set to Score</option>
                                        </select>
                                        <input type="number" className="form-control mt-2" value={adjustmentValue} onChange={(e) => setAdjustmentValue(e.target.value)} min="0" max="100" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Reason for Moderation</label>
                                        <textarea className="form-control" rows="3" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason..."></textarea>
                                    </div>
                                </div>
                                <div className="mt-3 d-flex justify-content-between align-items-center">
                                    <div className="text-muted"><i className="fa fa-info-circle me-1"></i>{filteredStudents.length} student(s) will be moderated</div>
                                    <button className="btn btn-danger px-4" onClick={applyModeration} disabled={applying || filteredStudents.length === 0}>
                                        {applying ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa fa-gavel me-2"></i>}Apply SBC Moderation
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Students Table */}
                        <div className="table-responsive">
                            <table className="table table-hover table-striped">
                                <thead className="table-dark">
                                    <tr>
                                        <th style={{ width: '40px' }}><input type="checkbox" className="form-check-input" checked={selectedStudents.length === students.length && students.length > 0} onChange={toggleAll} /></th>
                                        <th>S/N</th><th>Matric No</th><th>Student Name</th><th className="text-center">CA</th><th className="text-center">Exam</th><th className="text-center">Total</th><th className="text-center">New Total</th><th className="text-center">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, index) => {
                                        const isFiltered = filteredStudents.includes(student);
                                        const newTotal = isFiltered ? getNewScore(student.Total) : student.Total;
                                        return (
                                            <tr key={student.EntryID} className={isFiltered ? 'table-danger' : ''}>
                                                <td><input type="checkbox" className="form-check-input" checked={selectedStudents.includes(student.EntryID)} onChange={() => toggleStudent(student.EntryID)} /></td>
                                                <td>{index + 1}</td>
                                                <td><span className="badge bg-secondary">{student.StudentID}</span></td>
                                                <td>{student.StudentName}</td>
                                                <td className="text-center">{student.CAScore || 0}</td>
                                                <td className="text-center">{student.ExamScore || 0}</td>
                                                <td className="text-center fw-bold">{student.Total || 0}</td>
                                                <td className="text-center">{isFiltered ? <span className="badge bg-success fs-6">{newTotal.toFixed(1)}</span> : <span className="text-muted">-</span>}</td>
                                                <td className="text-center">{student.StudentGrade || '--'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {students.length === 0 && !loadingStudents && selectedModule && (
                    <div className="alert alert-info text-center">
                        <i className="fa fa-info-circle me-2"></i>
                        No students found. Click "Load Students" to fetch data.
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(SBCModeration);
