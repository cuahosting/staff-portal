import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";

function SemesterProgression(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [studentList, setStudentList] = useState([]);
    const [highCarryOverList, setHighCarryOverList] = useState([]);
    const [regSetting, setRegSetting] = useState({ active_semester: "", min_spill_over: "" });
    const [progressionStep, setProgressionStep] = useState([]);

    // Processing state
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedCount, setProcessedCount] = useState(0);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [processResults, setProcessResults] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [totalDuration, setTotalDuration] = useState(0);

    const getRecords = async () => {
        const { success, data } = await api.get("staff/registration/progression/semester-progression");
        if (success && data?.message === 'success') {
            if (data.reg_setting.length < 1) {
                toast.error("Please add the registration setting for the active semester before running progression!");
            } else {
                const min_spill_over = data.reg_setting[0].MinSpillOver;
                setRegSetting({ min_spill_over: min_spill_over, active_semester: data.reg_setting[0].SemesterCode });

                if (data.student_list.length > 0) {
                    // Split students into eligible and high carryover
                    const eligible = data.student_list.filter(i => i.TotalCarryOver <= min_spill_over);
                    const highCarry = data.student_list.filter(i => i.TotalCarryOver > min_spill_over);
                    setStudentList(eligible);
                    setHighCarryOverList(highCarry);
                    setProgressionStep(data.steps);
                }
            }
            setIsLoading(false);
        } else {
            toast.error("Something went wrong fetching data. Please try again!");
        }
    };

    const runProgression = async () => {
        setIsProcessing(true);
        setProcessedCount(0);
        setProcessResults([]);
        setTotalDuration(0);

        let results = [];
        let counter = 0;
        const startTime = Date.now();

        for (const student of studentList) {
            setCurrentStudent({
                id: student.StudentID,
                name: student.StudentName,
                course: student.CourseName,
                level: student.StudentLevel,
                semester: student.StudentSemester,
                carryOver: student.TotalCarryOver
            });

            const studentStartTime = Date.now();
            let status = 'success';
            let nextLevel = '';
            let nextSemester = '';
            let duration = 0;

            try {
                // Find current step
                const current_step = progressionStep.filter(i =>
                    i.CourseCode === student.CourseCode &&
                    i.CourseLevel === student.StudentLevel &&
                    i.CourseSemester === student.StudentSemester
                );

                if (current_step.length > 0) {
                    const student_step = current_step[0].Step;
                    const next_step = progressionStep.filter(i =>
                        i.CourseCode === student.CourseCode &&
                        i.Step === (student_step + 1)
                    );

                    if (next_step.length > 0) {
                        nextLevel = next_step[0].CourseLevel;
                        nextSemester = next_step[0].CourseSemester;

                        const sendData = {
                            student_id: student.StudentID,
                            student_level: nextLevel,
                            student_semester: nextSemester,
                            old_student_level: student.StudentLevel,
                            old_student_semester: student.StudentSemester,
                            semester_code: regSetting.active_semester,
                            carry_over: student.TotalCarryOver,
                            inserted_by: props.loginData.StaffID
                        };

                        const { success, data } = await api.post("staff/registration/progression/progress-progression", sendData);

                        if (!success || data?.message !== 'success') {
                            status = 'failed';
                        }
                    } else {
                        status = 'no_next_step';
                    }
                } else {
                    status = 'no_current_step';
                }
            } catch (error) {
                status = 'failed';
            }

            duration = ((Date.now() - studentStartTime) / 1000).toFixed(1);

            results.push({
                studentId: student.StudentID,
                studentName: student.StudentName,
                course: student.CourseName,
                fromLevel: student.StudentLevel,
                fromSemester: student.StudentSemester,
                toLevel: nextLevel,
                toSemester: nextSemester,
                status,
                duration: `${duration}s`
            });

            counter++;
            setProcessedCount(counter);
            setTotalDuration(((Date.now() - startTime) / 1000).toFixed(1));
        }

        setProcessResults(results);
        setCurrentStudent(null);
        setIsProcessing(false);
        setShowModal(true);

        const successCount = results.filter(r => r.status === 'success').length;
        toast.success(`Processed ${successCount} of ${results.length} students`);
    };

    const resetProcess = () => {
        setShowModal(false);
        setProcessedCount(0);
        setProcessResults([]);
        setCurrentStudent(null);
        setTotalDuration(0);
        getRecords();
    };

    useEffect(() => { getRecords(); }, []);

    const successCount = processResults.filter(r => r.status === 'success').length;
    const failedCount = processResults.filter(r => r.status === 'failed').length;
    const skippedCount = processResults.filter(r => r.status === 'no_next_step' || r.status === 'no_current_step').length;
    const progressPercent = studentList.length > 0 ? Math.round((processedCount / studentList.length) * 100) : 0;

    const formatDuration = (seconds) => {
        const secs = parseFloat(seconds);
        if (secs < 60) return `${secs.toFixed(1)}s`;
        const mins = Math.floor(secs / 60);
        const remainingSecs = Math.floor(secs % 60);
        return `${mins}m ${remainingSecs}s`;
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'success': return 'Progressed';
            case 'failed': return 'Failed';
            case 'no_next_step': return 'No Next Step';
            case 'no_current_step': return 'No Current Step';
            default: return status;
        }
    };

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={`${regSetting.active_semester} Semester Progression`} items={["Registration", "Progression", "Semester Progression"]} />
            <div className="flex-column-fluid">
                <div className="card shadow-sm">
                    <div className="card-body py-5">

                        {/* Step Indicator */}
                        <div className="d-flex justify-content-center mb-5">
                            <div className="d-flex align-items-center">
                                <div className={`d-flex align-items-center justify-content-center rounded-circle ${!isProcessing && !showModal ? 'bg-primary' : 'bg-success'}`} style={{ width: '40px', height: '40px' }}>
                                    <span className="text-white fw-bold">{!isProcessing && !showModal ? '1' : <i className="fa fa-check"></i>}</span>
                                </div>
                                <span className={`ms-2 me-4 fw-semibold ${!isProcessing && !showModal ? 'text-primary' : 'text-success'}`}>Ready</span>

                                <div className={`bg-${isProcessing || showModal ? 'primary' : 'secondary'}`} style={{ width: '50px', height: '3px' }}></div>

                                <div className={`d-flex align-items-center justify-content-center rounded-circle ms-4 ${isProcessing ? 'bg-primary' : showModal ? 'bg-success' : 'bg-secondary'}`} style={{ width: '40px', height: '40px' }}>
                                    <span className="text-white fw-bold">{showModal ? <i className="fa fa-check"></i> : '2'}</span>
                                </div>
                                <span className={`ms-2 me-4 fw-semibold ${isProcessing ? 'text-primary' : showModal ? 'text-success' : 'text-secondary'}`}>Processing</span>

                                <div className={`bg-${showModal ? 'primary' : 'secondary'}`} style={{ width: '50px', height: '3px' }}></div>

                                <div className={`d-flex align-items-center justify-content-center rounded-circle ms-4 ${showModal ? 'bg-primary' : 'bg-secondary'}`} style={{ width: '40px', height: '40px' }}>
                                    <span className="text-white fw-bold">3</span>
                                </div>
                                <span className={`ms-2 fw-semibold ${showModal ? 'text-primary' : 'text-secondary'}`}>Complete</span>
                            </div>
                        </div>

                        {/* Step 1: Ready State */}
                        {!isProcessing && !showModal && (
                            <>
                                <div className="text-center mb-4">
                                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light-primary" style={{ width: '80px', height: '80px' }}>
                                        <i className="fa fa-graduation-cap text-primary" style={{ fontSize: '35px' }}></i>
                                    </div>
                                    <h2 className="mt-3 mb-2">Process Semester Progression</h2>
                                    <p className="text-muted mb-0">This process will advance eligible students to their next level and semester</p>
                                </div>

                                {/* What This Does */}
                                <div className="alert alert-light border mb-4">
                                    <h6 className="mb-2"><i className="fa fa-info-circle text-primary me-2"></i>What happens when you click "Start"?</h6>
                                    <ul className="mb-0 small text-muted">
                                        <li>Each eligible student's current level and semester will be checked</li>
                                        <li>Students with carryover ≤ {regSetting.min_spill_over} are eligible for progression</li>
                                        <li>The next level/semester will be determined from progression step rules</li>
                                        <li>Student records will be updated and progression logged</li>
                                    </ul>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <div className="card bg-light-success border-0 h-100">
                                            <div className="card-body text-center py-3">
                                                <h1 className="display-4 fw-bold text-success mb-0">{studentList.length}</h1>
                                                <p className="text-success fw-semibold mb-0 small">Eligible for Progression</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card bg-light-warning border-0 h-100">
                                            <div className="card-body text-center py-3">
                                                <h1 className="display-4 fw-bold text-warning mb-0">{highCarryOverList.length}</h1>
                                                <p className="text-warning fw-semibold mb-0 small">High Carryover (Skipped)</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card bg-light-info border-0 h-100">
                                            <div className="card-body text-center py-3">
                                                <h1 className="display-4 fw-bold text-info mb-0">{studentList.length + highCarryOverList.length}</h1>
                                                <p className="text-info fw-semibold mb-0 small">Total Active Students</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {studentList.length > 0 ? (
                                    <button className="btn btn-primary btn-lg w-100 py-3" onClick={runProgression}>
                                        <i className="fa fa-play me-2"></i>
                                        Start Progression ({studentList.length} students)
                                    </button>
                                ) : (
                                    <div className="alert alert-warning text-center py-3 mb-0">
                                        <i className="fa fa-exclamation-triangle me-2"></i>
                                        No students eligible for progression in the active semester
                                    </div>
                                )}
                            </>
                        )}

                        {/* Step 2: Processing State */}
                        {isProcessing && (
                            <div className="py-3">
                                <div className="text-center mb-4">
                                    <h3 className="mb-1">Processing Students...</h3>
                                    <p className="text-muted mb-0">Please wait while students are being progressed</p>
                                </div>

                                {/* Current Student Card */}
                                {currentStudent && (
                                    <div className="card border-primary mb-4 mx-auto" style={{ maxWidth: '700px' }}>
                                        <div className="card-header bg-primary text-white py-2">
                                            <div className="d-flex align-items-center">
                                                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                                <span>Currently Processing</span>
                                            </div>
                                        </div>
                                        <div className="card-body py-3">
                                            <div className="row align-items-center">
                                                <div className="col-md-8">
                                                    <h5 className="mb-1">
                                                        <span className="badge bg-secondary me-2">{currentStudent.id}</span>
                                                        {currentStudent.name}
                                                    </h5>
                                                    <small className="text-muted">
                                                        {currentStudent.course} | Level {currentStudent.level} - {currentStudent.semester} Semester
                                                    </small>
                                                </div>
                                                <div className="col-md-4 text-md-end mt-2 mt-md-0">
                                                    <span className="badge bg-warning fs-6 px-3 py-2">
                                                        <i className="fa fa-book me-1"></i>
                                                        {currentStudent.carryOver} Carryover
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Progress Section */}
                                <div className="card bg-light mx-auto mb-3" style={{ maxWidth: '700px' }}>
                                    <div className="card-body py-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="fw-semibold">Overall Progress</span>
                                            <span className="fw-bold text-primary">{progressPercent}%</span>
                                        </div>
                                        <div className="progress mb-3" style={{ height: '25px' }}>
                                            <div
                                                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                                                role="progressbar"
                                                style={{ width: `${progressPercent}%` }}
                                            >
                                                <span className="fw-semibold">{processedCount} of {studentList.length} students</span>
                                            </div>
                                        </div>

                                        <div className="row text-center">
                                            <div className="col-4 border-end">
                                                <h5 className="mb-0 text-primary">{formatDuration(totalDuration)}</h5>
                                                <small className="text-muted">Elapsed</small>
                                            </div>
                                            <div className="col-4 border-end">
                                                <h5 className="mb-0 text-info">
                                                    {processedCount > 0 ? formatDuration(Math.round((totalDuration / processedCount) * (studentList.length - processedCount))) : '...'}
                                                </h5>
                                                <small className="text-muted">Est. Remaining</small>
                                            </div>
                                            <div className="col-4">
                                                <h5 className="mb-0 text-success">
                                                    {processedCount > 0 ? (totalDuration / processedCount).toFixed(1) : '...'}s
                                                </h5>
                                                <small className="text-muted">Avg per Student</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-center text-danger small mb-0">
                                    <i className="fa fa-exclamation-circle me-1"></i>
                                    Do not close or refresh this page until processing is complete
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 3: Summary Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title">
                                    <i className="fa fa-check-circle me-2"></i>
                                    Progression Complete!
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={resetProcess}></button>
                            </div>
                            <div className="modal-body p-0">
                                {/* Summary Stats */}
                                <div className="row g-0 text-center border-bottom">
                                    <div className="col-3 p-3" style={{ backgroundColor: '#e8f5e9' }}>
                                        <h3 className="text-success mb-0">{successCount}</h3>
                                        <small className="text-success">Progressed</small>
                                    </div>
                                    <div className="col-3 p-3" style={{ backgroundColor: '#ffebee' }}>
                                        <h3 className="text-danger mb-0">{failedCount}</h3>
                                        <small className="text-danger">Failed</small>
                                    </div>
                                    <div className="col-3 p-3" style={{ backgroundColor: '#fff3e0' }}>
                                        <h3 className="text-warning mb-0">{skippedCount}</h3>
                                        <small className="text-warning">Missing Step</small>
                                    </div>
                                    <div className="col-3 p-3" style={{ backgroundColor: '#e3f2fd' }}>
                                        <h3 className="text-info mb-0">{formatDuration(totalDuration)}</h3>
                                        <small className="text-info">Total Time</small>
                                    </div>
                                </div>

                                {/* Results Table */}
                                <div className="table-responsive" style={{ maxHeight: '400px' }}>
                                    <table className="table table-hover table-sm mb-0">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th style={{ width: '50px' }}>S/N</th>
                                                <th style={{ width: '140px' }}>Student ID</th>
                                                <th>Student Name</th>
                                                <th style={{ width: '100px' }}>From</th>
                                                <th style={{ width: '100px' }}>To</th>
                                                <th style={{ width: '70px' }}>Time</th>
                                                <th style={{ width: '100px' }} className="text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {processResults.map((result, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td><span className="badge bg-secondary">{result.studentId}</span></td>
                                                    <td>{result.studentName}</td>
                                                    <td><small>{result.fromLevel} - {result.fromSemester}</small></td>
                                                    <td><small>{result.toLevel ? `${result.toLevel} - ${result.toSemester}` : '-'}</small></td>
                                                    <td><small className="text-muted">{result.duration}</small></td>
                                                    <td className="text-center">
                                                        {result.status === 'success' && <span className="badge bg-success">{getStatusText(result.status)}</span>}
                                                        {result.status === 'failed' && <span className="badge bg-danger">{getStatusText(result.status)}</span>}
                                                        {(result.status === 'no_next_step' || result.status === 'no_current_step') && <span className="badge bg-warning">{getStatusText(result.status)}</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer bg-light">
                                <small className="text-muted me-auto">
                                    <i className="fa fa-info-circle me-1"></i>
                                    Students with "Missing Step" need progression step rules configured
                                </small>
                                <button type="button" className="btn btn-primary px-4" onClick={resetProcess}>
                                    <i className="fa fa-check me-2"></i>Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(SemesterProgression);
