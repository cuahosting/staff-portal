import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";

function ProcessCA(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [modules, setModules] = useState([]);
    const [moduleStudentCounts, setModuleStudentCounts] = useState({});
    const [stats, setStats] = useState({ runningModules: 0, registeredStudents: 0, modulesWithCASettings: 0 });
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedCount, setProcessedCount] = useState(0);
    const [currentModule, setCurrentModule] = useState(null);
    const [processResults, setProcessResults] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [totalDuration, setTotalDuration] = useState(0);

    const getStats = async () => {
        try {
            const { success: statsSuccess, data: statsData } = await api.get("staff/assessments/process/ca/stats");
            if (statsSuccess) {
                setStats(statsData);
            }

            const { success, data } = await api.get("staff/assessments/process/ca/data");
            if (success && data?.message === 'success') {
                const caModuleCodes = [...new Set(data.ca_setting_list.map(s => s.ModuleCode))];
                const modulesWithCA = data.module_list.filter(m => caModuleCodes.includes(m.ModuleCode));
                setModules(modulesWithCA);

                const studentCounts = {};
                data.registered_student_list.forEach(s => {
                    studentCounts[s.ModuleCode] = (studentCounts[s.ModuleCode] || 0) + 1;
                });
                setModuleStudentCounts(studentCounts);
            }
        } catch (error) {
            toast.error("Error fetching data");
        }
        setIsLoading(false);
    };

    useEffect(() => { getStats(); }, []);

    const processCA = async () => {
        setIsProcessing(true);
        setProcessedCount(0);
        setProcessResults([]);
        setTotalDuration(0);

        let results = [];
        let counter = 0;
        const startTime = Date.now();

        for (const module of modules) {
            const studentCount = moduleStudentCounts[module.ModuleCode] || 0;
            setCurrentModule({ code: module.ModuleCode, name: module.ModuleName, students: studentCount });

            let status = 'success';
            let students = 0;
            const moduleStartTime = Date.now();
            let duration = 0;

            try {
                const { success, data } = await api.post("staff/assessments/process/ca/module", {
                    moduleCode: module.ModuleCode,
                    semester: props.currentSemester,
                    InsertedBy: props.loginData.StaffID
                }, { timeout: 300000, showError: false });

                duration = ((Date.now() - moduleStartTime) / 1000).toFixed(1);

                if (success && data.message === 'success') {
                    students = data.studentsProcessed;
                } else if (data?.message === 'skipped') {
                    status = 'skipped';
                } else {
                    status = 'failed';
                }
            } catch (error) {
                duration = ((Date.now() - moduleStartTime) / 1000).toFixed(1);
                status = 'failed';
            }

            results.push({ moduleCode: module.ModuleCode, moduleName: module.ModuleName, status, students, duration: `${duration}s` });
            counter++;
            setProcessedCount(counter);
            setTotalDuration(((Date.now() - startTime) / 1000).toFixed(1));
        }

        setProcessResults(results);
        setCurrentModule(null);
        setIsProcessing(false);
        setShowModal(true);

        const successCount = results.filter(r => r.status === 'success').length;
        toast.success(`Processed ${successCount} of ${results.length} modules`);
    };

    const resetProcess = () => {
        setShowModal(false);
        setProcessedCount(0);
        setProcessResults([]);
        setCurrentModule(null);
        setTotalDuration(0);
        getStats();
    };

    const successCount = processResults.filter(r => r.status === 'success').length;
    const failedCount = processResults.filter(r => r.status === 'failed').length;
    const skippedCount = processResults.filter(r => r.status === 'skipped').length;
    const progressPercent = modules.length > 0 ? Math.round((processedCount / modules.length) * 100) : 0;

    // Format duration: show in min:sec if over 60 seconds
    const formatDuration = (seconds) => {
        const secs = parseFloat(seconds);
        if (secs < 60) return `${secs.toFixed(1)}s`;
        const mins = Math.floor(secs / 60);
        const remainingSecs = Math.floor(secs % 60);
        return `${mins}m ${remainingSecs}s`;
    };


    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={`Process CA`} items={["Assessment", "Process CA"]} />
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
                                        <i className="fa fa-calculator text-primary" style={{ fontSize: '35px' }}></i>
                                    </div>
                                    <h2 className="mt-3 mb-2">Process Continuous Assessment</h2>
                                    <p className="text-muted mb-0">This process will calculate and consolidate CA scores for all students</p>
                                </div>

                                {/* What This Does */}
                                <div className="alert alert-light border mb-4">
                                    <h6 className="mb-2"><i className="fa fa-info-circle text-primary me-2"></i>What happens when you click "Start"?</h6>
                                    <ul className="mb-0 small text-muted">
                                        <li>Each module's CA settings will be fetched from the database</li>
                                        <li>All student scores for Tests, Assignments, and Quizzes will be aggregated</li>
                                        <li>The final CA score will be calculated and saved to student records</li>
                                        <li>Progress will be shown for each module as it's processed</li>
                                    </ul>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <div className="card bg-light-primary border-0 h-100">
                                            <div className="card-body text-center py-3">
                                                <h1 className="display-4 fw-bold text-primary mb-0">{stats.runningModules}</h1>
                                                <p className="text-primary fw-semibold mb-0 small">Running Modules</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card bg-light-success border-0 h-100">
                                            <div className="card-body text-center py-3">
                                                <h1 className="display-4 fw-bold text-success mb-0">{stats.registeredStudents}</h1>
                                                <p className="text-success fw-semibold mb-0 small">Registered Students</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card bg-light-info border-0 h-100">
                                            <div className="card-body text-center py-3">
                                                <h1 className="display-4 fw-bold text-info mb-0">{modules.length}</h1>
                                                <p className="text-info fw-semibold mb-0 small">Modules to Process</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {modules.length > 0 ? (
                                    <button className="btn btn-primary btn-lg w-100 py-3" onClick={processCA}>
                                        <i className="fa fa-play me-2"></i>
                                        Start Processing CA
                                    </button>
                                ) : (
                                    <div className="alert alert-warning text-center py-3 mb-0">
                                        <i className="fa fa-exclamation-triangle me-2"></i>
                                        No modules with CA settings found for the active semester
                                    </div>
                                )}
                            </>
                        )}

                        {/* Step 2: Processing State */}
                        {isProcessing && (
                            <div className="py-3">
                                <div className="text-center mb-4">
                                    <h3 className="mb-1">Processing Modules...</h3>
                                    <p className="text-muted mb-0">Please wait while CA scores are being calculated</p>
                                </div>

                                {/* Current Module Card */}
                                {currentModule && (
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
                                                        <span className="badge bg-secondary me-2">{currentModule.code}</span>
                                                        {currentModule.name}
                                                    </h5>
                                                    <small className="text-muted">Calculating CA scores for all registered students...</small>
                                                </div>
                                                <div className="col-md-4 text-md-end mt-2 mt-md-0">
                                                    <span className="badge bg-info fs-6 px-3 py-2">
                                                        <i className="fa fa-users me-1"></i>
                                                        {currentModule.students} Students
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
                                                <span className="fw-semibold">{processedCount} of {modules.length} modules</span>
                                            </div>
                                        </div>

                                        <div className="row text-center">
                                            <div className="col-4 border-end">
                                                <h5 className="mb-0 text-primary">{formatDuration(totalDuration)}</h5>
                                                <small className="text-muted">Elapsed</small>
                                            </div>
                                            <div className="col-4 border-end">
                                                <h5 className="mb-0 text-info">
                                                    {processedCount > 0 ? formatDuration(Math.round((totalDuration / processedCount) * (modules.length - processedCount))) : '...'}
                                                </h5>
                                                <small className="text-muted">Est. Remaining</small>
                                            </div>
                                            <div className="col-4">
                                                <h5 className="mb-0 text-success">
                                                    {processedCount > 0 ? (totalDuration / processedCount).toFixed(1) : '...'}s
                                                </h5>
                                                <small className="text-muted">Avg per Module</small>
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
                                    Processing Complete!
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={resetProcess}></button>
                            </div>
                            <div className="modal-body p-0">
                                {/* Summary Stats */}
                                <div className="row g-0 text-center border-bottom">
                                    <div className="col-3 p-3" style={{ backgroundColor: '#e8f5e9' }}>
                                        <h3 className="text-success mb-0">{successCount}</h3>
                                        <small className="text-success">Successful</small>
                                    </div>
                                    <div className="col-3 p-3" style={{ backgroundColor: '#ffebee' }}>
                                        <h3 className="text-danger mb-0">{failedCount}</h3>
                                        <small className="text-danger">Failed</small>
                                    </div>
                                    <div className="col-3 p-3" style={{ backgroundColor: '#fff3e0' }}>
                                        <h3 className="text-warning mb-0">{skippedCount}</h3>
                                        <small className="text-warning">Skipped</small>
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
                                                <th style={{ width: '120px' }}>Module Code</th>
                                                <th>Module Name</th>
                                                <th style={{ width: '90px' }} className="text-center">Students</th>
                                                <th style={{ width: '80px' }}>Time</th>
                                                <th style={{ width: '70px' }} className="text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {processResults.map((result, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td><span className="badge bg-secondary">{result.moduleCode}</span></td>
                                                    <td>{result.moduleName}</td>
                                                    <td className="text-center">
                                                        <span className="badge bg-info">{result.students || 0}</span>
                                                    </td>
                                                    <td><small className="text-muted">{result.duration}</small></td>
                                                    <td className="text-center">
                                                        {result.status === 'success' && <i className="fa fa-check-circle text-success" style={{ fontSize: '18px' }}></i>}
                                                        {result.status === 'failed' && <i className="fa fa-times-circle text-danger" style={{ fontSize: '18px' }}></i>}
                                                        {result.status === 'skipped' && <i className="fa fa-minus-circle text-warning" style={{ fontSize: '18px' }}></i>}
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
                                    Hover over status icons for details
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

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0], currentSemester: state.currentSemester });
export default connect(mapStateToProps, null)(ProcessCA);
