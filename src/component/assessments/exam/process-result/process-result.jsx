import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import AgReportTable from "../../../common/table/ReportTable";
import { api } from "../../../../resources/api";
import SearchSelect from "../../../common/select/SearchSelect";

function ProcessResult(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [semesterList, setSemesterList] = useState([]);
    const [moduleListSelect, setModuleListSelect] = useState([]);
    const [gradeSettingSelect, setGradeSettingSelect] = useState([]);
    const [gradeList, setGradeList] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [selectedModuleName, setSelectedModuleName] = useState("");
    const [selectedGradeSetting, setSelectedGradeSetting] = useState("");
    const [results, setResults] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingCount, setProcessingCount] = useState(0);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [showComplete, setShowComplete] = useState(false);
    const [processStartTime, setProcessStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    const columns = ["S/N", "Matric No", "Name", "CA", "Exam", "Total", "Grade", "Decision", "Status"];

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

    const getRecord = async () => {
        const { success, data } = await api.get("staff/assessment/exam/process/result/data");
        if (success && data.message === 'success') {
            setSemesterList(data.semester_list.map(item => ({ label: item.SemesterName, value: item.SemesterCode })));
            setGradeSettingSelect(data.grade_type.map(item => ({ label: item.GradeType, value: item.GradeType })));
            setGradeList(data.grade_list);
        }
        setIsLoading(false);
    };

    const getModules = async (semester) => {
        setSelectedSemester(semester);
        setResults([]);
        setTableData([]);
        setShowComplete(false);
        const { success, data } = await api.get(`staff/academics/process-running-module/timetable-modules/list/${semester}`);
        if (success && data) {
            setModuleListSelect(data.map(item => ({ label: `${item.ModuleCode} - ${item.Modulename}`, value: item.ModuleCode, name: item.Modulename })));
        }
    };

    const getResults = async (moduleCode, moduleName) => {
        setSelectedModule(moduleCode);
        setSelectedModuleName(moduleName);
        setShowComplete(false);
        if (!selectedSemester || !moduleCode) return;

        setIsProcessing(true);
        const { success, data } = await api.post("staff/assessment/moderation/students", {
            moduleCode,
            semester: selectedSemester
        });

        if (success && data.students) {
            setResults(data.students);
            updateTable(data.students);
        }
        setIsProcessing(false);
    };

    const updateTable = (studentResults) => {
        const rows = studentResults.map((item, index) => [
            index + 1,
            item.StudentID,
            item.StudentName,
            parseFloat(item.CAScore || 0).toFixed(1),
            parseFloat(item.ExamScore || 0).toFixed(1),
            parseFloat(item.Total || 0).toFixed(1),
            item.StudentGrade || '--',
            item.Decision || '--',
            item.StudentGrade && item.StudentGrade !== '--' ? '✓ Processed' : '⏳ Pending'
        ]);
        setTableData(rows);
    };

    const getGradeForScore = (score, gradeType) => {
        const applicableGrades = gradeList.filter(g => g.GradeType === gradeType);
        for (const grade of applicableGrades) {
            if (score >= grade.MinRange && score <= grade.MaxRange) {
                return { Grade: grade.Grade, Decision: grade.Decision };
            }
        }
        return { Grade: '--', Decision: '--' };
    };

    const onProcessResult = async () => {
        if (!selectedSemester || !selectedModule || !selectedGradeSetting) {
            return toast.error("Please select all fields");
        }

        const toProcess = results.filter(r => !r.StudentGrade || r.StudentGrade === '--');

        if (toProcess.length === 0) {
            return toast.info("All results already processed");
        }

        setIsProcessing(true);
        setProcessingCount(0);
        setProcessStartTime(Date.now());
        setElapsedTime(0);

        let processed = 0;
        let errors = 0;

        for (const result of toProcess) {
            // Round up the total score
            const total = Math.ceil(parseFloat(result.Total) || 0);
            const gradeInfo = getGradeForScore(total, selectedGradeSetting);

            setCurrentStudent({ id: result.StudentID, name: result.StudentName, total, grade: gradeInfo.Grade });

            try {
                const { success } = await api.patch("staff/assessment/exam/process/result", {
                    EntryID: result.EntryID,
                    Total: total,
                    StudentGrade: gradeInfo.Grade,
                    Decision: gradeInfo.Decision
                });

                if (success) {
                    processed++;
                    setProcessingCount(processed);

                    // Update local results for live table update
                    result.StudentGrade = gradeInfo.Grade;
                    result.Decision = gradeInfo.Decision;
                    updateTable([...results]);
                } else {
                    errors++;
                }
            } catch {
                errors++;
            }
        }

        setIsProcessing(false);
        setCurrentStudent(null);
        setShowComplete(true);

        if (processed > 0) {
            toast.success(`Successfully processed ${processed} result(s)`);
        }
        if (errors > 0) {
            toast.warning(`${errors} result(s) failed to process`);
        }
    };

    const resetProcess = () => {
        setShowComplete(false);
        getResults(selectedModule, selectedModuleName);
    };

    useEffect(() => { getRecord(); }, []);

    const pendingCount = results.filter(r => !r.StudentGrade || r.StudentGrade === '--').length;
    const processedCount = results.length - pendingCount;
    const progressPercent = results.length > 0 && pendingCount > 0
        ? Math.round((processingCount / pendingCount) * 100)
        : (results.length > 0 && pendingCount === 0 ? 100 : 0);

    // Calculate estimated remaining time
    const avgTimePerStudent = processingCount > 0 ? elapsedTime / processingCount : 0;
    const remainingStudents = pendingCount - processingCount;
    const estimatedRemaining = Math.round(avgTimePerStudent * remainingStudents);

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Process Result"} items={["Assessment", "Exams & Records", "Process Result"]} />
            <div className="flex-column-fluid">
                <div className="card shadow-sm">
                    <div className="card-body py-5">

                        {/* Step Indicator */}
                        <div className="d-flex justify-content-center mb-5">
                            <div className="d-flex align-items-center">
                                <div className={`d-flex align-items-center justify-content-center rounded-circle ${results.length > 0 ? 'bg-success' : 'bg-primary'}`} style={{ width: '40px', height: '40px' }}>
                                    <span className="text-white fw-bold">{results.length > 0 ? <i className="fa fa-check"></i> : '1'}</span>
                                </div>
                                <span className={`ms-2 me-4 fw-semibold ${results.length > 0 ? 'text-success' : 'text-primary'}`}>Select Module</span>

                                <div className={`bg-${results.length > 0 ? 'primary' : 'secondary'}`} style={{ width: '50px', height: '3px' }}></div>

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

                        {/* Selection Row */}
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Semester</label>
                                <SearchSelect options={semesterList} onChange={(e) => getModules(e.value)} placeholder="Select Semester" isDisabled={isProcessing} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Module</label>
                                <SearchSelect options={moduleListSelect} onChange={(e) => getResults(e.value, e.name)} isDisabled={!selectedSemester || isProcessing} placeholder="Select Module" />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Grade Setting</label>
                                <SearchSelect options={gradeSettingSelect} onChange={(e) => setSelectedGradeSetting(e.value)} placeholder="Select Grade Type" isDisabled={isProcessing} />
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                {showComplete ? (
                                    <button className="btn btn-success w-100" onClick={resetProcess}>
                                        <i className="fa fa-refresh me-2"></i>Reset
                                    </button>
                                ) : (
                                    <button className="btn btn-primary w-100" onClick={onProcessResult} disabled={isProcessing || pendingCount === 0 || !selectedGradeSetting}>
                                        {isProcessing ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                                        ) : (
                                            <><i className="fa fa-cogs me-2"></i>Process ({pendingCount})</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Processing Progress Card */}
                        {isProcessing && currentStudent && (
                            <div className="card bg-light border-primary mb-4">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-md-6">
                                            <h6 className="mb-1 text-primary"><i className="fa fa-user-graduate me-2"></i>Currently Processing:</h6>
                                            <p className="mb-0 fw-bold">{currentStudent.id} - {currentStudent.name}</p>
                                            <small className="text-muted">Total: {currentStudent.total} → Grade: <span className="text-success fw-bold">{currentStudent.grade}</span></small>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="row text-center">
                                                <div className="col-4">
                                                    <h5 className="text-primary mb-0">{formatDuration(elapsedTime)}</h5>
                                                    <small className="text-muted">Elapsed</small>
                                                </div>
                                                <div className="col-4">
                                                    <h5 className="text-warning mb-0">{formatDuration(estimatedRemaining)}</h5>
                                                    <small className="text-muted">Est. Remaining</small>
                                                </div>
                                                <div className="col-4">
                                                    <h5 className="text-success mb-0">{processingCount}/{pendingCount}</h5>
                                                    <small className="text-muted">Progress</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="progress mt-3" style={{ height: '20px' }}>
                                        <div
                                            className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                                            role="progressbar"
                                            style={{ width: `${progressPercent}%` }}
                                        >
                                            {progressPercent}%
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
                                    <h4 className="mt-3 text-success">Processing Complete!</h4>
                                    <p className="mb-0">Processed {processingCount} results in {formatDuration(elapsedTime)}</p>
                                </div>
                            </div>
                        )}

                        {/* Stats Cards */}
                        {results.length > 0 && !isProcessing && (
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <div className="card bg-light h-100">
                                        <div className="card-body text-center py-3">
                                            <h2 className="text-primary mb-0">{results.length}</h2>
                                            <small className="text-muted">Total Students</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-success bg-opacity-10 h-100">
                                        <div className="card-body text-center py-3">
                                            <h2 className="text-success mb-0">{processedCount}</h2>
                                            <small className="text-muted">Processed</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-warning bg-opacity-10 h-100">
                                        <div className="card-body text-center py-3">
                                            <h2 className="text-warning mb-0">{pendingCount}</h2>
                                            <small className="text-muted">Pending</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* What Happens Section */}
                        {results.length === 0 && !isProcessing && (
                            <div className="card bg-light mb-4">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3"><i className="fa fa-info-circle me-2 text-primary"></i>What Happens When You Process Results?</h6>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-start mb-2">
                                                <span className="badge bg-primary me-2">1</span>
                                                <div><strong>Load Students</strong><br /><small className="text-muted">Fetch all students with exam scores for the selected module</small></div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-start mb-2">
                                                <span className="badge bg-primary me-2">2</span>
                                                <div><strong>Calculate Grades</strong><br /><small className="text-muted">Apply grade settings to calculate grades based on total score</small></div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-start mb-2">
                                                <span className="badge bg-primary me-2">3</span>
                                                <div><strong>Update Records</strong><br /><small className="text-muted">Save grades and decisions to student result entries</small></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results Table */}
                        {tableData.length > 0 && (
                            <AgReportTable columns={columns} data={tableData} height={'500px'} />
                        )}

                        {selectedModule && results.length === 0 && !isProcessing && (
                            <div className="alert alert-info text-center">
                                <i className="fa fa-info-circle me-2"></i>
                                No results found for this module
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(ProcessResult);
