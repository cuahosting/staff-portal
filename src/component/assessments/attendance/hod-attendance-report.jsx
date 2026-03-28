import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import SearchSelect from "../../common/select/SearchSelect";
import { useReactToPrint } from "react-to-print";

function HODAttendanceReport(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [semesters, setSemesters] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const printRef = useRef();

    const staffID = props.loginData.StaffID;

    const loadData = async () => {
        const [semRes, courseRes] = await Promise.all([
            api.get("staff/assessment/attendance/semesters"),
            api.get(`staff/assessment/attendance/courses/hod/${staffID}`),
        ]);
        if (semRes.success) setSemesters(semRes.data.map(s => ({ value: s.SemesterCode, label: s.SemesterName })));
        if (courseRes.success) setCourses(courseRes.data.map(c => ({ value: c.CourseCode, label: `${c.CourseCode} - ${c.CourseName}` })));
        setIsLoading(false);
    };

    const fetchReport = async (semesterCode, courseCode) => {
        setIsReportLoading(true);
        const { success, data } = await api.post("staff/assessment/attendance/report/hod", { semesterCode, courseCode, staffId: staffID });
        if (success && data.modules) {
            setModules(data.modules);
        } else {
            toast.error(data?.message || "Failed to load report");
            setModules([]);
        }
        setIsReportLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        if (selectedSemester && selectedCourse) {
            fetchReport(selectedSemester.value, selectedCourse.value);
        } else {
            setModules([]);
        }
    }, [selectedSemester, selectedCourse]);

    const handlePrint = useReactToPrint({ contentRef: printRef });

    const totalStudents = modules.reduce((sum, m) => sum + m.totalStudents, 0);
    const allStudents = modules.flatMap(m => m.report);
    const avgAttendance = allStudents.length > 0 ? Math.round(allStudents.reduce((s, r) => s + r.Percentage, 0) / allStudents.length) : 0;
    const belowThreshold = allStudents.filter(r => r.Percentage < 75).length;

    if (isLoading) return <Loader />;

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="HOD Attendance Report"
                items={["Assessments", "Attendance", "HOD Report"]}
                buttons={modules.length > 0 && (
                    <button className="btn btn-primary" onClick={handlePrint}>
                        <i className="fa fa-print me-2"></i>Print Report
                    </button>
                )}
            />
            <div className="flex-column-fluid">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="fw-bold mb-2">Select Semester</label>
                                <SearchSelect value={selectedSemester} onChange={setSelectedSemester} options={semesters} placeholder="Select semester..." isClearable />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="fw-bold mb-2">Select Course (Department)</label>
                                <SearchSelect value={selectedCourse} onChange={setSelectedCourse} options={courses} placeholder="Select course..." isClearable />
                            </div>
                        </div>
                    </div>
                </div>

                {isReportLoading ? <Loader /> : modules.length > 0 && (
                    <div ref={printRef}>
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-primary mb-1">{modules.length}</h3><small className="text-muted">Modules</small></div></div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-dark mb-1">{totalStudents}</h3><small className="text-muted">Total Students</small></div></div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className={`fw-bold mb-1 ${avgAttendance >= 75 ? 'text-success' : avgAttendance >= 50 ? 'text-warning' : 'text-danger'}`}>{avgAttendance}%</h3><small className="text-muted">Average Attendance</small></div></div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-danger mb-1">{belowThreshold}</h3><small className="text-muted">Below 75%</small></div></div>
                            </div>
                        </div>

                        {modules.map((mod, idx) => (
                            <div className="card mb-4" key={idx}>
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h6 className="card-title mb-0">{mod.moduleCode} - {mod.moduleName}</h6>
                                    <span className="badge bg-dark">{mod.totalClasses} class(es) held</span>
                                </div>
                                <div className="card-body p-0">
                                    {mod.report.length === 0 ? (
                                        <div className="text-center py-4 text-muted">No students registered</div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                                                <thead className="table-light">
                                                    <tr>
                                                        <th style={{ width: 50 }}>S/N</th>
                                                        <th>Student ID</th>
                                                        <th>Student Name</th>
                                                        <th className="text-center">Attended</th>
                                                        <th className="text-center">Total</th>
                                                        <th className="text-center">Percentage</th>
                                                        <th style={{ width: 200 }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mod.report.map((student, i) => (
                                                        <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td className="fw-bold">{student.StudentID}</td>
                                                            <td>{student.StudentName}</td>
                                                            <td className="text-center fw-bold">{student.ClassesAttended}</td>
                                                            <td className="text-center">{student.TotalClasses}</td>
                                                            <td className="text-center">
                                                                <span className={`badge ${student.Percentage >= 75 ? 'bg-success' : student.Percentage >= 50 ? 'bg-warning' : 'bg-danger'}`}>{student.Percentage}%</span>
                                                            </td>
                                                            <td>
                                                                <div className="progress" style={{ height: 8 }}>
                                                                    <div className={`progress-bar ${student.Percentage >= 75 ? 'bg-success' : student.Percentage >= 50 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${student.Percentage}%` }} />
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
                        ))}
                    </div>
                )}

                {(!selectedSemester || !selectedCourse) && !isReportLoading && (
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <i className="fa fa-chart-bar fa-3x text-muted mb-3 d-block"></i>
                            <h5 className="text-muted">Select a semester and course to view the attendance report</h5>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(HODAttendanceReport);
