import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import SearchSelect from "../../common/select/SearchSelect";
import { useReactToPrint } from "react-to-print";

function ModuleAvgDepartment(props) {
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
        const { success, data } = await api.get(`staff/assessment/attendance/report/module-avg/department/${semesterCode}`);
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

    const totalDepts = report.length;
    const totalModules = report.reduce((s, d) => s + d.modules.length, 0);
    const overallAvg = report.length > 0 ? Math.round(report.reduce((s, d) => s + d.avgAttendance, 0) / report.length) : 0;

    // Group by faculty for display
    const grouped = report.reduce((acc, dept) => {
        if (!acc[dept.FacultyName]) acc[dept.FacultyName] = [];
        acc[dept.FacultyName].push(dept);
        return acc;
    }, {});

    if (isLoading) return <Loader />;

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Module Average Attendance — By Department"
                items={["Assessments", "Attendance", "Module Avg - Department"]}
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
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-primary mb-1">{totalDepts}</h3><small className="text-muted">Departments</small></div></div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-dark mb-1">{totalModules}</h3><small className="text-muted">Total Modules</small></div></div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className={`fw-bold mb-1 ${overallAvg >= 75 ? 'text-success' : overallAvg >= 50 ? 'text-warning' : 'text-danger'}`}>{overallAvg}%</h3><small className="text-muted">Overall Avg</small></div></div>
                            </div>
                        </div>

                        {Object.entries(grouped).map(([facultyName, depts], fIdx) => (
                            <div key={fIdx} className="mb-4">
                                <h5 className="fw-bold mb-3"><i className="fa fa-building me-2 text-primary"></i>{facultyName}</h5>
                                {depts.map((dept, dIdx) => (
                                    <div className="card mb-3" key={dIdx}>
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <h6 className="card-title mb-0"><i className="fa fa-sitemap me-2"></i>{dept.DepartmentName}</h6>
                                            <span className={`badge ${dept.avgAttendance >= 75 ? 'bg-success' : dept.avgAttendance >= 50 ? 'bg-warning' : 'bg-danger'}`}>
                                                Dept Avg: {dept.avgAttendance}%
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
                                                            <th className="text-center">Classes</th>
                                                            <th className="text-center">Students</th>
                                                            <th className="text-center">Avg Attendance</th>
                                                            <th style={{ width: 180 }}>Progress</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {dept.modules.map((mod, i) => (
                                                            <tr key={i}>
                                                                <td>{i + 1}</td>
                                                                <td className="fw-bold">{mod.ModuleCode}</td>
                                                                <td>{mod.ModuleName}</td>
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
                        ))}
                    </div>
                )}

                {!selectedSemester && !isReportLoading && (
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <i className="fa fa-sitemap fa-3x text-muted mb-3 d-block"></i>
                            <h5 className="text-muted">Select a semester to view module attendance by department</h5>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(ModuleAvgDepartment);
