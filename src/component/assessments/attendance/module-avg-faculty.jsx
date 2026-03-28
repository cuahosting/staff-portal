import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import SearchSelect from "../../common/select/SearchSelect";
import { useReactToPrint } from "react-to-print";

function ModuleAvgFaculty(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [report, setReport] = useState([]);
    const printRef = useRef();

    const loadSemesters = async () => {
        const { success, data } = await api.get("staff/assessment/attendance/semesters");
        if (success) setSemesters(data.map(s => ({ value: s.SemesterCode, label: s.SemesterName })));
        setIsLoading(false);
    };

    const fetchReport = async (semesterCode) => {
        setIsReportLoading(true);
        const { success, data } = await api.get(`staff/assessment/attendance/report/module-avg/faculty/${semesterCode}`);
        if (success && data.report) {
            setReport(data.report);
        } else {
            toast.error("Failed to load report");
            setReport([]);
        }
        setIsReportLoading(false);
    };

    useEffect(() => { loadSemesters(); }, []);

    useEffect(() => {
        if (selectedSemester) fetchReport(selectedSemester.value);
        else setReport([]);
    }, [selectedSemester]);

    const handlePrint = useReactToPrint({ contentRef: printRef });

    const totalFaculties = report.length;
    const totalModules = report.reduce((s, f) => s + f.modules.length, 0);
    const overallAvg = report.length > 0 ? Math.round(report.reduce((s, f) => s + f.avgAttendance, 0) / report.length) : 0;

    if (isLoading) return <Loader />;

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Module Average Attendance — By Faculty"
                items={["Assessments", "Attendance", "Module Avg - Faculty"]}
                buttons={report.length > 0 && (
                    <button className="btn btn-primary" onClick={handlePrint}>
                        <i className="fa fa-print me-2"></i>Print Report
                    </button>
                )}
            />
            <div className="flex-column-fluid">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <label className="fw-bold mb-2">Select Semester</label>
                                <SearchSelect value={selectedSemester} onChange={setSelectedSemester} options={semesters} placeholder="Select semester..." isClearable />
                            </div>
                        </div>
                    </div>
                </div>

                {isReportLoading ? <Loader /> : report.length > 0 && (
                    <div ref={printRef}>
                        <div className="row mb-4">
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-primary mb-1">{totalFaculties}</h3><small className="text-muted">Faculties</small></div></div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-dark mb-1">{totalModules}</h3><small className="text-muted">Total Modules</small></div></div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className={`fw-bold mb-1 ${overallAvg >= 75 ? 'text-success' : overallAvg >= 50 ? 'text-warning' : 'text-danger'}`}>{overallAvg}%</h3><small className="text-muted">Overall Avg</small></div></div>
                            </div>
                        </div>

                        {report.map((fac, idx) => (
                            <div className="card mb-4" key={idx}>
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h6 className="card-title mb-0"><i className="fa fa-building me-2"></i>{fac.FacultyName}</h6>
                                    <span className={`badge ${fac.avgAttendance >= 75 ? 'bg-success' : fac.avgAttendance >= 50 ? 'bg-warning' : 'bg-danger'}`}>
                                        Faculty Avg: {fac.avgAttendance}%
                                    </span>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: 50 }}>S/N</th>
                                                    <th>Module Code</th>
                                                    <th>Module Name</th>
                                                    <th>Department</th>
                                                    <th className="text-center">Classes</th>
                                                    <th className="text-center">Students</th>
                                                    <th className="text-center">Avg Attendance</th>
                                                    <th style={{ width: 180 }}>Progress</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fac.modules.map((mod, i) => (
                                                    <tr key={i}>
                                                        <td>{i + 1}</td>
                                                        <td className="fw-bold">{mod.ModuleCode}</td>
                                                        <td>{mod.ModuleName}</td>
                                                        <td>{mod.DepartmentName}</td>
                                                        <td className="text-center">{mod.totalClasses}</td>
                                                        <td className="text-center">{mod.registeredStudents}</td>
                                                        <td className="text-center">
                                                            <span className={`badge ${mod.avgAttendance >= 75 ? 'bg-success' : mod.avgAttendance >= 50 ? 'bg-warning' : 'bg-danger'}`}>{mod.avgAttendance}%</span>
                                                        </td>
                                                        <td>
                                                            <div className="progress" style={{ height: 8 }}>
                                                                <div className={`progress-bar ${mod.avgAttendance >= 75 ? 'bg-success' : mod.avgAttendance >= 50 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${mod.avgAttendance}%` }} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!selectedSemester && !isReportLoading && (
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <i className="fa fa-building fa-3x text-muted mb-3 d-block"></i>
                            <h5 className="text-muted">Select a semester to view module attendance by faculty</h5>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(ModuleAvgFaculty);
