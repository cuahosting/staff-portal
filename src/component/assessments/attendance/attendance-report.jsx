import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import SearchSelect from "../../common/select/SearchSelect";
import { useReactToPrint } from "react-to-print";

function AttendanceReport(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [report, setReport] = useState([]);
    const [totalClasses, setTotalClasses] = useState(0);
    const [totalStudents, setTotalStudents] = useState(0);
    const printRef = useRef();

    const staffID = props.loginData.StaffID;

    const getModules = async () => {
        const { success, data } = await api.get(`staff/assessment/attendance/timetable/${staffID}`);
        if (success && data?.length > 0) {
            const uniqueModules = [];
            const seen = new Set();
            data.forEach(item => {
                if (!seen.has(item.ModuleCode)) {
                    seen.add(item.ModuleCode);
                    uniqueModules.push({
                        value: item.ModuleCode,
                        label: `${item.ModuleCode} - ${item.ModuleName || item.ModuleTitle || item.ModuleCode}`,
                        semesterCode: item.SemesterCode,
                    });
                }
            });
            setModules(uniqueModules);
        }
        setIsLoading(false);
    };

    const fetchReport = async (moduleCode, semesterCode) => {
        setIsReportLoading(true);
        const { success, data } = await api.post("staff/assessment/attendance/report", {
            staffId: staffID,
            moduleCode,
            semesterCode,
        });
        if (success) {
            setReport(data.report || []);
            setTotalClasses(data.totalClasses || 0);
            setTotalStudents(data.totalStudents || 0);
        } else {
            toast.error("Failed to load report");
        }
        setIsReportLoading(false);
    };

    const handleModuleChange = (selected) => {
        if (selected) {
            setSelectedModule(selected);
            fetchReport(selected.value, selected.semesterCode);
        } else {
            setSelectedModule(null);
            setReport([]);
        }
    };

    const handlePrint = useReactToPrint({ contentRef: printRef });

    useEffect(() => { getModules(); }, []);

    const avgAttendance = report.length > 0
        ? Math.round(report.reduce((sum, r) => sum + r.Percentage, 0) / report.length)
        : 0;
    const belowThreshold = report.filter(r => r.Percentage < 75).length;
    const goodAttendance = report.filter(r => r.Percentage >= 75).length;

    if (isLoading) return <Loader />;

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Attendance Report"
                items={["Assessments", "Attendance", "Report"]}
                buttons={report.length > 0 && (
                    <button className="btn btn-primary" onClick={handlePrint}>
                        <i className="fa fa-print me-2"></i>Print Report
                    </button>
                )}
            />

            <div className="flex-column-fluid">
                {/* Module Selector */}
                <div className="card mb-4">
                    <div className="card-body">
                        <label className="fw-bold mb-2">Select Module</label>
                        <SearchSelect
                            value={selectedModule}
                            onChange={handleModuleChange}
                            options={modules}
                            placeholder="Search your modules..."
                            isClearable
                        />
                    </div>
                </div>

                {isReportLoading ? <Loader /> : selectedModule && (
                    <div ref={printRef}>
                        {/* Summary Cards */}
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body text-center">
                                        <h3 className="fw-bold text-primary mb-1">{totalClasses}</h3>
                                        <small className="text-muted">Classes Held</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body text-center">
                                        <h3 className="fw-bold text-dark mb-1">{totalStudents}</h3>
                                        <small className="text-muted">Registered Students</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body text-center">
                                        <h3 className={`fw-bold mb-1 ${avgAttendance >= 75 ? 'text-success' : avgAttendance >= 50 ? 'text-warning' : 'text-danger'}`}>
                                            {avgAttendance}%
                                        </h3>
                                        <small className="text-muted">Average Attendance</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body text-center">
                                        <h3 className="fw-bold text-danger mb-1">{belowThreshold}</h3>
                                        <small className="text-muted">Below 75%</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Table */}
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h6 className="card-title mb-0">
                                    {selectedModule.label} — Attendance Report
                                </h6>
                                <span className="badge bg-dark">{totalClasses} class(es) held</span>
                            </div>
                            <div className="card-body p-0">
                                {report.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <i className="fa fa-clipboard-list fa-3x mb-3 d-block"></i>
                                        No students registered for this module
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: 50 }}>S/N</th>
                                                    <th>Student ID</th>
                                                    <th>Student Name</th>
                                                    <th className="text-center">Classes Attended</th>
                                                    <th className="text-center">Total Classes</th>
                                                    <th className="text-center">Percentage</th>
                                                    <th style={{ width: 200 }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {report.map((student, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td className="fw-bold">{student.StudentID}</td>
                                                        <td>{student.StudentName}</td>
                                                        <td className="text-center fw-bold">{student.ClassesAttended}</td>
                                                        <td className="text-center">{student.TotalClasses}</td>
                                                        <td className="text-center">
                                                            <span className={`badge ${
                                                                student.Percentage >= 75 ? 'bg-success' :
                                                                student.Percentage >= 50 ? 'bg-warning' : 'bg-danger'
                                                            }`}>
                                                                {student.Percentage}%
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="progress" style={{ height: 8 }}>
                                                                <div
                                                                    className={`progress-bar ${
                                                                        student.Percentage >= 75 ? 'bg-success' :
                                                                        student.Percentage >= 50 ? 'bg-warning' : 'bg-danger'
                                                                    }`}
                                                                    style={{ width: `${student.Percentage}%` }}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!selectedModule && !isReportLoading && (
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <i className="fa fa-chart-bar fa-3x text-muted mb-3 d-block"></i>
                            <h5 className="text-muted">Select a module to view the attendance report</h5>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(AttendanceReport);
