import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import SearchSelect from "../../common/select/SearchSelect";
import { useReactToPrint } from "react-to-print";

function LecturerAttendanceReport(props) {
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
        const { success, data } = await api.get(`staff/assessment/attendance/report/lecturer-attendance/${semesterCode}`);
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

    const uniqueLecturers = [...new Set(report.map(r => r.StaffID))].length;
    const totalModules = report.length;
    const totalClasses = report.reduce((sum, r) => sum + (r.ClassesHeld || 0), 0);
    const avgAttendance = report.length > 0 ? Math.round(report.reduce((s, r) => s + r.AvgAttendance, 0) / report.length) : 0;

    if (isLoading) return <Loader />;

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Lecturer Attendance Report"
                items={["Assessments", "Attendance", "Lecturer Report"]}
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
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-primary mb-1">{uniqueLecturers}</h3><small className="text-muted">Lecturers</small></div></div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-dark mb-1">{totalModules}</h3><small className="text-muted">Module Assignments</small></div></div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-info mb-1">{totalClasses}</h3><small className="text-muted">Total Classes Held</small></div></div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className={`fw-bold mb-1 ${avgAttendance >= 75 ? 'text-success' : avgAttendance >= 50 ? 'text-warning' : 'text-danger'}`}>{avgAttendance}%</h3><small className="text-muted">Avg Attendance</small></div></div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h6 className="card-title mb-0">Lecturer Module Attendance</h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: 50 }}>S/N</th>
                                                <th>Staff ID</th>
                                                <th>Lecturer Name</th>
                                                <th>Module Code</th>
                                                <th>Module Name</th>
                                                <th className="text-center">Classes Held</th>
                                                <th className="text-center">Registered</th>
                                                <th className="text-center">Recorded</th>
                                                <th className="text-center">Avg Attendance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.map((row, i) => (
                                                <tr key={i}>
                                                    <td>{i + 1}</td>
                                                    <td className="fw-bold">{row.StaffID}</td>
                                                    <td>{row.StaffName}</td>
                                                    <td>{row.ModuleCode}</td>
                                                    <td>{row.ModuleName}</td>
                                                    <td className="text-center">{row.ClassesHeld}</td>
                                                    <td className="text-center">{row.RegisteredStudents}</td>
                                                    <td className="text-center">{row.StudentsRecorded}</td>
                                                    <td className="text-center">
                                                        <span className={`badge ${row.AvgAttendance >= 75 ? 'bg-success' : row.AvgAttendance >= 50 ? 'bg-warning' : 'bg-danger'}`}>
                                                            {row.AvgAttendance}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedSemester && !isReportLoading && (
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <i className="fa fa-chalkboard-teacher fa-3x text-muted mb-3 d-block"></i>
                            <h5 className="text-muted">Select a semester to view lecturer attendance</h5>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(LecturerAttendanceReport);
