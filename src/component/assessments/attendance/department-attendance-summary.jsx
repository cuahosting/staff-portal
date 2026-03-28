import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import SearchSelect from "../../common/select/SearchSelect";
import { useReactToPrint } from "react-to-print";

function DepartmentAttendanceSummary(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [summary, setSummary] = useState([]);
    const printRef = useRef();

    const loadSemesters = async () => {
        const { success, data } = await api.get("staff/assessment/attendance/semesters");
        if (success) setSemesters(data.map(s => ({ value: s.SemesterCode, label: s.SemesterName })));
        setIsLoading(false);
    };

    const fetchReport = async (semesterCode) => {
        setIsReportLoading(true);
        const { success, data } = await api.get(`staff/assessment/attendance/report/department-summary/${semesterCode}`);
        if (success && data.summary) {
            setSummary(data.summary);
        } else {
            toast.error("Failed to load report");
            setSummary([]);
        }
        setIsReportLoading(false);
    };

    useEffect(() => { loadSemesters(); }, []);

    useEffect(() => {
        if (selectedSemester) fetchReport(selectedSemester.value);
        else setSummary([]);
    }, [selectedSemester]);

    const handlePrint = useReactToPrint({ contentRef: printRef });

    const activeDepts = summary.filter(d => d.TotalModules > 0);
    const totalModules = summary.reduce((s, d) => s + d.TotalModules, 0);
    const avgAll = activeDepts.length > 0 ? Math.round(activeDepts.reduce((s, d) => s + d.AvgAttendance, 0) / activeDepts.length) : 0;

    // Group by faculty for display
    const grouped = summary.reduce((acc, dept) => {
        if (!acc[dept.FacultyName]) acc[dept.FacultyName] = [];
        acc[dept.FacultyName].push(dept);
        return acc;
    }, {});

    if (isLoading) return <Loader />;

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Department Attendance Summary"
                items={["Assessments", "Attendance", "Department Summary"]}
                buttons={summary.length > 0 && (
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

                {isReportLoading ? <Loader /> : summary.length > 0 && (
                    <div ref={printRef}>
                        <div className="row mb-4">
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-primary mb-1">{activeDepts.length}</h3><small className="text-muted">Active Departments</small></div></div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-dark mb-1">{totalModules}</h3><small className="text-muted">Total Modules</small></div></div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className={`fw-bold mb-1 ${avgAll >= 75 ? 'text-success' : avgAll >= 50 ? 'text-warning' : 'text-danger'}`}>{avgAll}%</h3><small className="text-muted">Overall Avg Attendance</small></div></div>
                            </div>
                        </div>

                        {Object.entries(grouped).map(([facultyName, depts], idx) => (
                            <div className="card mb-4" key={idx}>
                                <div className="card-header bg-light">
                                    <h6 className="card-title mb-0"><i className="fa fa-building me-2"></i>{facultyName}</h6>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: 50 }}>S/N</th>
                                                    <th>Department</th>
                                                    <th className="text-center">Modules</th>
                                                    <th className="text-center">Classes Held</th>
                                                    <th className="text-center">Registered</th>
                                                    <th className="text-center">Avg Attendance</th>
                                                    <th style={{ width: 200 }}>Progress</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {depts.map((dept, i) => (
                                                    <tr key={i}>
                                                        <td>{i + 1}</td>
                                                        <td className="fw-bold">{dept.DepartmentName}</td>
                                                        <td className="text-center">{dept.TotalModules}</td>
                                                        <td className="text-center">{dept.TotalClasses}</td>
                                                        <td className="text-center">{dept.RegisteredStudents}</td>
                                                        <td className="text-center">
                                                            <span className={`badge ${dept.AvgAttendance >= 75 ? 'bg-success' : dept.AvgAttendance >= 50 ? 'bg-warning' : 'bg-danger'}`}>
                                                                {dept.AvgAttendance}%
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="progress" style={{ height: 8 }}>
                                                                <div className={`progress-bar ${dept.AvgAttendance >= 75 ? 'bg-success' : dept.AvgAttendance >= 50 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${dept.AvgAttendance}%` }} />
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
                            <i className="fa fa-sitemap fa-3x text-muted mb-3 d-block"></i>
                            <h5 className="text-muted">Select a semester to view department attendance summary</h5>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(DepartmentAttendanceSummary);
