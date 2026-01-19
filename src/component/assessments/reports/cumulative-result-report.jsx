import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux/es/exports";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { toast } from "react-toastify";
import SearchSelect from "../../common/select/SearchSelect";
import ReactToPrint from "react-to-print";
import { projectLogo, schoolName } from "../../../resources/constants";
import "./cumulative-result-report.css";

function CumulativeResultReport(props) {
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
            const { success, data } = await api.post("staff/assessment/exam/reports/cumulative-results", {
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

    // Get student's score/grade for a module
    const getStudentModuleResult = (studentId, moduleCode) => {
        if (!reportData) return "-";
        const result = reportData.currentResults.find(r => r.StudentID === studentId && r.ModuleCode === moduleCode);
        return result ? result.ScoreGrade : "-";
    };

    // Get cumulative data for student
    const getStudentCumulativeData = (studentId) => {
        if (!reportData) return {};
        const cumData = reportData.cumulativeData?.find(c => c.StudentID === studentId);
        const outstanding = reportData.outstandingCourses?.find(o => o.StudentID === studentId);

        if (!cumData) return {
            currentTCR: 0, currentTCU: 0, currentTCP: 0, currentGPA: "0.00",
            prevTCR: 0, prevTCU: 0, prevTCP: 0, prevGPA: "0.00",
            cumTCR: 0, cumTCU: 0, cumTCP: 0, cumGPA: "0.00",
            outstanding: "", remark: "Pass"
        };

        const currentGPA = cumData.CurrentTCR > 0 ? (cumData.CurrentTCP / cumData.CurrentTCR).toFixed(2) : "0.00";
        const prevGPA = cumData.PrevTCR > 0 ? (cumData.PrevTCP / cumData.PrevTCR).toFixed(2) : "0.00";
        const cumGPA = cumData.CumTCR > 0 ? (cumData.CumTCP / cumData.CumTCR).toFixed(2) : "0.00";

        const remark = outstanding?.Outstanding ? `${outstanding.Outstanding}` : (parseFloat(cumGPA) >= 1.0 ? "Pass" : "Probation");

        return {
            currentTCR: cumData.CurrentTCR || 0,
            currentTCU: cumData.CurrentTCU || 0,
            currentTCP: cumData.CurrentTCP || 0,
            currentGPA,
            prevTCR: cumData.PrevTCR || 0,
            prevTCU: cumData.PrevTCU || 0,
            prevTCP: cumData.PrevTCP || 0,
            prevGPA,
            cumTCR: cumData.CumTCR || 0,
            cumTCU: cumData.CumTCU || 0,
            cumTCP: cumData.CumTCP || 0,
            cumGPA,
            outstanding: outstanding?.Outstanding || "",
            remark
        };
    };

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <div className="printPageButton">
                <PageHeader
                    title="CUMULATIVE RESULT REPORT"
                    items={["Assessment", "Reports", "Cumulative Result Report"]}
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
                        documentTitle={`Cumulative Results - ${filters.departmentName}`}
                    />
                </div>
            )}

            {isLoading ? (
                <Loader />
            ) : (
                <div ref={printRef} className="cumulative-result-container">
                    {reportData && (
                        <>
                            {/* Print Header */}
                            <div className="print-header text-center mb-4">
                                <img src={projectLogo} alt={schoolName} width={80} height={80} />
                                <h2 className="mt-2 text-uppercase fw-bold">{schoolName}</h2>
                            </div>

                            {/* Section 1: Course Results with Scores */}
                            <div className="table-responsive mb-4">
                                <table className="table table-bordered table-sm cumulative-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="text-center">S/N</th>
                                            <th>Reg. No.</th>
                                            <th>Name</th>
                                            {reportData.modules.map((mod, idx) => (
                                                <th key={idx} className="text-center module-header">
                                                    {mod.ModuleCode}
                                                    <br />
                                                    <small>({mod.CreditUnit})</small>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.students.map((student, idx) => (
                                            <tr key={idx}>
                                                <td className="text-center">{idx + 1}</td>
                                                <td><small>{student.RegNo}</small></td>
                                                <td><small>{student.Name}</small></td>
                                                {reportData.modules.map((mod, modIdx) => (
                                                    <td key={modIdx} className="text-center">
                                                        <small>{getStudentModuleResult(student.RegNo, mod.ModuleCode)}</small>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Section 2: GPA Analysis */}
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm gpa-analysis-table">
                                    <thead className="table-dark">
                                        <tr>
                                            <th rowSpan={2} className="text-center align-middle">SN</th>
                                            <th rowSpan={2} className="align-middle">Reg. No.</th>
                                            <th rowSpan={2} className="align-middle">Name</th>
                                            <th colSpan={4} className="text-center">Current</th>
                                            <th colSpan={4} className="text-center">Previous</th>
                                            <th colSpan={4} className="text-center">Cumulative</th>
                                            <th rowSpan={2} className="text-center align-middle">Remark</th>
                                        </tr>
                                        <tr className="table-secondary">
                                            <th className="text-center">TCR</th>
                                            <th className="text-center">TCU</th>
                                            <th className="text-center">TCP</th>
                                            <th className="text-center">GPA</th>
                                            <th className="text-center">TCR</th>
                                            <th className="text-center">TCU</th>
                                            <th className="text-center">TCP</th>
                                            <th className="text-center">GPA</th>
                                            <th className="text-center">TCR</th>
                                            <th className="text-center">TCU</th>
                                            <th className="text-center">TCP</th>
                                            <th className="text-center">GPA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.students.map((student, idx) => {
                                            const stats = getStudentCumulativeData(student.RegNo);
                                            const isPass = !stats.outstanding && parseFloat(stats.cumGPA) >= 1.0;
                                            return (
                                                <tr key={idx}>
                                                    <td className="text-center">{idx + 1}</td>
                                                    <td><small>{student.RegNo}</small></td>
                                                    <td><small>{student.Name}</small></td>
                                                    {/* Current */}
                                                    <td className="text-center">{stats.currentTCR}</td>
                                                    <td className="text-center">{stats.currentTCU}</td>
                                                    <td className="text-center">{stats.currentTCP}</td>
                                                    <td className="text-center fw-bold">{stats.currentGPA}</td>
                                                    {/* Previous */}
                                                    <td className="text-center">{stats.prevTCR}</td>
                                                    <td className="text-center">{stats.prevTCU}</td>
                                                    <td className="text-center">{stats.prevTCP}</td>
                                                    <td className="text-center fw-bold">{stats.prevGPA}</td>
                                                    {/* Cumulative */}
                                                    <td className="text-center">{stats.cumTCR}</td>
                                                    <td className="text-center">{stats.cumTCU}</td>
                                                    <td className="text-center">{stats.cumTCP}</td>
                                                    <td className="text-center fw-bold">{stats.cumGPA}</td>
                                                    {/* Remark */}
                                                    <td className={`text-center ${isPass ? 'text-success' : 'text-danger'}`}>
                                                        <small>
                                                            {isPass ? 'Pass' : stats.outstanding || 'Probation'}
                                                        </small>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Legend */}
                            <div className="legend mt-3">
                                <small>
                                    <strong>Legend:</strong> TCR = Total Credits Registered | TCU = Total Credits Earned | TCP = Total Credit Points | GPA = Grade Point Average
                                </small>
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

export default connect(mapStateToProps, null)(CumulativeResultReport);
