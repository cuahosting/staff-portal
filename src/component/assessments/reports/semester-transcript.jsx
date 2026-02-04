import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux/es/exports";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { toast } from "react-toastify";
import SearchSelect from "../../common/select/SearchSelect";
import ReactToPrint from "react-to-print";
import { projectLogo, schoolName } from "../../../resources/constants";
import "./semester-transcript.css";

function SemesterTranscript(props) {
    const printRef = useRef();
    const [isLoading, setIsLoading] = useState(false);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [levelOptions] = useState([
        { value: "100", label: "100 Level" },
        { value: "200", label: "200 Level" },
        { value: "300", label: "300 Level" },
        { value: "400", label: "400 Level" },
        { value: "500", label: "500 Level" },
        { value: "600", label: "600 Level" }
    ]);
    const [reportData, setReportData] = useState(null);
    const [filters, setFilters] = useState({
        semester: "",
        semesterObj: null,
        department: "",
        departmentObj: null,
        departmentName: "",
        level: "",
        levelObj: null
    });

    // Load semesters
    const getSemesters = async () => {
        const { success, data } = await api.get("staff/timetable/timetable/semester");
        if (success && data?.length > 0) {
            let rows = data.map(row => ({
                value: row.SemesterCode,
                label: `${row.SemesterName} - ${row.SemesterCode}`
            }));
            setSemesterOptions(rows);
        }
    };

    // Load departments
    const getDepartments = async () => {
        const { success, data } = await api.get("staff/academics/department/list");
        if (success && data?.length > 0) {
            let rows = data.map(row => ({
                value: row.DepartmentCode,
                label: row.DepartmentName
            }));
            setDepartmentOptions(rows);
        }
    };

    useEffect(() => {
        getSemesters();
        getDepartments();
    }, []);

    // Fetch report data
    const fetchData = async () => {
        if (!filters.semester || !filters.department || !filters.level) {
            return;
        }

        setIsLoading(true);
        try {
            const { success, data } = await api.post("staff/assessment/exam/reports/semester-transcript", {
                semester: filters.semester,
                department: filters.department,
                level: filters.level
            });

            if (success && data?.students?.length > 0) {
                setReportData(data);
            } else {
                toast.info("No data found for the selected criteria");
                setReportData(null);
            }
        } catch (error) {
            toast.error("Error fetching report data");
            setReportData(null);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (filters.semester && filters.department && filters.level) {
            fetchData();
        }
    }, [filters.semester, filters.department, filters.level]);

    // Calculate student statistics
    const getStudentStats = (studentId) => {
        if (!reportData) return {};

        const studentResults = reportData.results.filter(r => r.StudentID === studentId);
        const prevData = reportData.prevCumulative?.find(p => p.StudentID === studentId);
        const carryOver = reportData.carryOvers?.find(c => c.StudentID === studentId);

        // Current semester calculations
        const currentTCR = studentResults.reduce((sum, r) => sum + (r.CreditUnit || 0), 0);
        const currentTCE = studentResults.filter(r => r.Grade !== 'F' && r.Grade !== 'X').reduce((sum, r) => sum + (r.CreditUnit || 0), 0);
        const currentTCP = studentResults.reduce((sum, r) => sum + (r.QualityPoint || 0), 0);
        const currentGPA = currentTCR > 0 ? (currentTCP / currentTCR).toFixed(2) : "0.00";

        // Previous cumulative
        const prevTCR = prevData?.PrevTCR || 0;
        const prevTCE = prevData?.PrevTCE || 0;
        const prevTCP = prevData?.PrevTCP || 0;
        const prevGPA = prevTCR > 0 ? (prevTCP / prevTCR).toFixed(2) : "0.00";

        // Total cumulative
        const cumTCR = currentTCR + prevTCR;
        const cumTCE = currentTCE + prevTCE;
        const cumTCP = currentTCP + prevTCP;
        const cumGPA = cumTCR > 0 ? (cumTCP / cumTCR).toFixed(2) : "0.00";

        return {
            currentTCR, currentGPA,
            prevGPA,
            cumGPA,
            carryOvers: carryOver?.CarryOverCourses || "",
            remark: parseFloat(cumGPA) >= 1.0 ? "Pass" : "Probation"
        };
    };

    // Get student's grade for a module
    const getStudentModuleGrade = (studentId, moduleCode) => {
        if (!reportData) return "-";
        const result = reportData.results.find(r => r.StudentID === studentId && r.ModuleCode === moduleCode);
        return result ? `${result.Total || '-'}-${result.Grade || '-'}` : "-";
    };

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <div className="printPageButton">
                <PageHeader
                    title="SEMESTER TRANSCRIPT"
                    items={["Assessment", "Reports", "Semester Transcript"]}
                />
            </div>

            {/* Filters */}
            <div className="row printPageButton mb-4">
                <div className="col-md-4">
                    <SearchSelect
                        label="Select Semester"
                        value={filters.semesterObj}
                        onChange={(e) => setFilters(prev => ({ ...prev, semester: e?.value || "", semesterObj: e }))}
                        options={semesterOptions}
                        placeholder="Select Semester"
                    />
                </div>
                <div className="col-md-4">
                    <SearchSelect
                        label="Select Department"
                        value={filters.departmentObj}
                        onChange={(e) => setFilters(prev => ({ ...prev, department: e?.value || "", departmentObj: e, departmentName: e?.label || "" }))}
                        options={departmentOptions}
                        placeholder="Select Department"
                    />
                </div>
                <div className="col-md-4">
                    <SearchSelect
                        label="Select Level"
                        value={filters.levelObj}
                        onChange={(e) => setFilters(prev => ({ ...prev, level: e?.value || "", levelObj: e }))}
                        options={levelOptions}
                        placeholder="Select Level"
                    />
                </div>
            </div>

            {/* Print Button */}
            {reportData && (
                <div className="mb-3 printPageButton">
                    <ReactToPrint
                        trigger={() => (
                            <button className="btn btn-primary">
                                <i className="fa fa-print me-2"></i> Print Report
                            </button>
                        )}
                        content={() => printRef.current}
                        documentTitle={`Semester Transcript - ${filters.departmentName}`}
                    />
                </div>
            )}

            {isLoading ? (
                <Loader />
            ) : (
                <div ref={printRef} className="semester-transcript-container">
                    {reportData && (
                        <>
                            {/* Print Header */}
                            <div className="print-header text-center mb-4">
                                <img src={projectLogo} alt={schoolName} width={80} height={80} />
                                <h2 className="mt-2 text-uppercase fw-bold">{schoolName}</h2>
                                <h5 className="text-uppercase">
                                    {filters.departmentName} - {filters.level} Level Second Semester
                                </h5>
                            </div>

                            {/* Main Results Table */}
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm transcript-table">
                                    <thead>
                                        <tr className="table-dark">
                                            <th rowSpan={2} className="text-center align-middle">S/N</th>
                                            <th rowSpan={2} className="align-middle">StudentId</th>
                                            <th rowSpan={2} className="align-middle">Student</th>
                                            {reportData.modules.map((mod, idx) => (
                                                <th key={idx} className="text-center">
                                                    <small>{mod.ModuleCode}</small>
                                                    <br />
                                                    <small className="text-muted">({mod.CreditUnit})</small>
                                                </th>
                                            ))}
                                            <th className="text-center">Total Credits</th>
                                            <th className="text-center">GPA</th>
                                            <th className="text-center">Previous GPA</th>
                                            <th className="text-center">Carry Over(s)</th>
                                            <th className="text-center">Remark</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.students.map((student, idx) => {
                                            const stats = getStudentStats(student.RegNo);
                                            return (
                                                <tr key={idx}>
                                                    <td className="text-center">{idx + 1}</td>
                                                    <td><small>{student.RegNo}</small></td>
                                                    <td><small>{student.Name}</small></td>
                                                    {reportData.modules.map((mod, modIdx) => (
                                                        <td key={modIdx} className="text-center">
                                                            <small>{getStudentModuleGrade(student.RegNo, mod.ModuleCode)}</small>
                                                        </td>
                                                    ))}
                                                    <td className="text-center fw-bold">{stats.currentTCR}</td>
                                                    <td className="text-center fw-bold">{stats.currentGPA}</td>
                                                    <td className="text-center">{stats.prevGPA}</td>
                                                    <td className="text-center text-danger">
                                                        <small>{stats.carryOvers}</small>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className={`badge ${stats.remark === 'Pass' ? 'bg-success' : 'bg-danger'}`}>
                                                            {stats.remark}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Module Key */}
                            <div className="module-key mt-4">
                                <h6 className="fw-bold">KEYS:</h6>
                                <table className="table table-sm table-bordered" style={{ maxWidth: '400px' }}>
                                    <tbody>
                                        {reportData.modules.map((mod, idx) => (
                                            <tr key={idx}>
                                                <td><strong>{mod.ModuleCode}</strong></td>
                                                <td>{mod.ModuleName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Signature Section */}
                            <div className="signature-section mt-5">
                                <div className="row">
                                    <div className="col-4">
                                        <div className="signature-line"></div>
                                        <p className="mb-0"><strong>Head of Department</strong></p>
                                        <p className="small">Name, Sign & Date</p>
                                    </div>
                                    <div className="col-4">
                                        <div className="signature-line"></div>
                                        <p className="mb-0"><strong>Faculty Examination Officer</strong></p>
                                        <p className="small">Name, Sign & Date</p>
                                    </div>
                                    <div className="col-4 text-center">
                                        <div className="signature-line"></div>
                                        <p className="mb-0"><strong>Dean, Faculty</strong></p>
                                        <p className="small">Name, Sign & Date</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {!reportData && filters.semester && filters.department && filters.level && (
                        <div className="alert alert-info text-center">
                            No data found for the selected criteria.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const mapStateToProps = (state) => ({
    LoginDetails: state.LoginDetails
});

export default connect(mapStateToProps, null)(SemesterTranscript);
