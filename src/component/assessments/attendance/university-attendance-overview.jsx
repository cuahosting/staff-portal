import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import SearchSelect from "../../common/select/SearchSelect";
import { useReactToPrint } from "react-to-print";

function UniversityAttendanceOverview(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [faculties, setFaculties] = useState([]);
    const printRef = useRef();

    const loadSemesters = async () => {
        const { success, data } = await api.get("staff/assessment/attendance/semesters");
        if (success) setSemesters(data.map(s => ({ value: s.SemesterCode, label: s.SemesterName })));
        setIsLoading(false);
    };

    const fetchReport = async (semesterCode) => {
        setIsReportLoading(true);
        const { success, data } = await api.get(`staff/assessment/attendance/report/university-overview/${semesterCode}`);
        if (success && data.faculties) {
            setFaculties(data.faculties);
        } else {
            toast.error("Failed to load report");
            setFaculties([]);
        }
        setIsReportLoading(false);
    };

    useEffect(() => { loadSemesters(); }, []);

    useEffect(() => {
        if (selectedSemester) fetchReport(selectedSemester.value);
        else setFaculties([]);
    }, [selectedSemester]);

    const handlePrint = useReactToPrint({ contentRef: printRef });

    const totalModules = faculties.reduce((s, f) => s + f.TotalModules, 0);
    const totalClasses = faculties.reduce((s, f) => s + f.TotalClasses, 0);
    const totalRegistered = faculties.reduce((s, f) => s + f.RegisteredStudents, 0);
    const overallAvg = faculties.length > 0 ? Math.round(faculties.reduce((s, f) => s + f.AvgAttendance, 0) / faculties.length) : 0;

    if (isLoading) return <Loader />;

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="University Attendance Overview"
                items={["Assessments", "Attendance", "University Overview"]}
                buttons={faculties.length > 0 && (
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

                {isReportLoading ? <Loader /> : faculties.length > 0 && (
                    <div ref={printRef}>
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-primary mb-1">{faculties.length}</h3><small className="text-muted">Faculties</small></div></div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-dark mb-1">{totalModules}</h3><small className="text-muted">Modules</small></div></div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className="fw-bold text-info mb-1">{totalClasses}</h3><small className="text-muted">Classes Held</small></div></div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm"><div className="card-body text-center"><h3 className={`fw-bold mb-1 ${overallAvg >= 75 ? 'text-success' : overallAvg >= 50 ? 'text-warning' : 'text-danger'}`}>{overallAvg}%</h3><small className="text-muted">Overall Attendance</small></div></div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h6 className="card-title mb-0">Faculty Attendance Overview</h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: 50 }}>S/N</th>
                                                <th>Faculty</th>
                                                <th className="text-center">Modules</th>
                                                <th className="text-center">Classes Held</th>
                                                <th className="text-center">Registered Students</th>
                                                <th className="text-center">Avg Attendance</th>
                                                <th style={{ width: 200 }}>Progress</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {faculties.map((fac, i) => (
                                                <tr key={i}>
                                                    <td>{i + 1}</td>
                                                    <td className="fw-bold">{fac.FacultyName}</td>
                                                    <td className="text-center">{fac.TotalModules}</td>
                                                    <td className="text-center">{fac.TotalClasses}</td>
                                                    <td className="text-center">{fac.RegisteredStudents}</td>
                                                    <td className="text-center">
                                                        <span className={`badge ${fac.AvgAttendance >= 75 ? 'bg-success' : fac.AvgAttendance >= 50 ? 'bg-warning' : 'bg-danger'}`}>
                                                            {fac.AvgAttendance}%
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="progress" style={{ height: 8 }}>
                                                            <div className={`progress-bar ${fac.AvgAttendance >= 75 ? 'bg-success' : fac.AvgAttendance >= 50 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${fac.AvgAttendance}%` }} />
                                                        </div>
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
                            <i className="fa fa-university fa-3x text-muted mb-3 d-block"></i>
                            <h5 className="text-muted">Select a semester to view the university attendance overview</h5>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(UniversityAttendanceOverview);
