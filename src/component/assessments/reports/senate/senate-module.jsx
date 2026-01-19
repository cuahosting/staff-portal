import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import ReactToPrint from "react-to-print";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import SearchSelect from "../../../common/select/SearchSelect";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import { projectLogo, schoolName } from "../../../../resources/constants";
import { toast } from "react-toastify";
import "./senate-report.css";

function SenateModule(props) {
    const printRef = useRef();
    const [isLoading, setIsLoading] = useState(false);
    const [semesters, setSemesters] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [gradeColumns, setGradeColumns] = useState([]);
    const [moduleDetails, setModuleDetails] = useState(null);

    useEffect(() => { loadFilters(); }, []);

    const loadFilters = async () => {
        const [semRes, modRes] = await Promise.all([
            api.get("staff/timetable/timetable/semester"),
            api.get("staff/assessment/senate-reports/modules")
        ]);
        if (semRes.success) setSemesters(semRes.data.map(s => ({ value: s.SemesterCode, label: `${s.SemesterName} (${s.SemesterCode})` })));
        if (modRes.success) setModules(modRes.data.data.map(m => ({ value: m.ModuleCode, label: `${m.ModuleCode} - ${m.ModuleName}` })));
    };

    const loadReport = async () => {
        if (!selectedSemester || !selectedModule) return;
        setIsLoading(true);

        const [reportRes, detailsRes] = await Promise.all([
            api.get(`staff/assessment/senate-reports/by-module/${selectedSemester.value}/${selectedModule.value}`),
            api.get(`staff/assessment/senate-reports/module-details/${selectedSemester.value}/${selectedModule.value}`)
        ]);

        if (reportRes.success && reportRes.data?.modules) {
            setReportData(reportRes.data.modules[0] || null);
            setGradeColumns(reportRes.data.gradeSettings || ['A', 'B', 'C', 'D', 'E', 'F']);
        } else {
            setReportData(null);
        }

        if (detailsRes.success) {
            setModuleDetails(detailsRes.data);
        } else {
            setModuleDetails(null);
        }

        if (!reportRes.data?.modules?.length) toast.info("No data found");
        setIsLoading(false);
    };

    useEffect(() => { if (selectedSemester && selectedModule) loadReport(); }, [selectedSemester, selectedModule]);

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Senate Report - Module" items={["Assessment", "Senate Reports", "Module View"]} />
            <div className="flex-column-fluid">
                <div className="card mb-4 printPageButton">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Select Semester</label>
                                <SearchSelect options={semesters} value={selectedSemester} onChange={setSelectedSemester} placeholder="Select semester..." />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Select Module</label>
                                <SearchSelect options={modules} value={selectedModule} onChange={setSelectedModule} placeholder="Search module..." />
                            </div>
                            {reportData && (
                                <div className="col-md-3 d-flex align-items-end">
                                    <ReactToPrint trigger={() => <button className="btn btn-primary"><i className="fa fa-print me-2"></i>Print</button>} content={() => printRef.current} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isLoading ? <Loader /> : (
                    <div ref={printRef} className="senate-report-container">
                        <div className="senate-print-header">
                            <img src={projectLogo} alt={schoolName} />
                            <h2>{schoolName}</h2>
                            <h3>Senate Result Report - Module Details</h3>
                            <p>{selectedModule?.label} | {selectedSemester?.label}</p>
                        </div>

                        {reportData && (
                            <>
                                {/* Module Summary Card */}
                                <div className="card mb-4">
                                    <div className="card-header bg-primary text-white">
                                        <h5 className="mb-0">{reportData.ModuleCode} - {reportData.ModuleName}</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <p><strong>Lecturers:</strong> {reportData.Lecturers || "N/A"}</p>
                                            </div>
                                            <div className="col-md-4">
                                                <p><strong>Course:</strong> {reportData.CourseName}</p>
                                            </div>
                                            <div className="col-md-4">
                                                <p><strong>Total Students:</strong> {reportData.total}</p>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-12">
                                                <h6>Grade Distribution:</h6>
                                                <div className="d-flex flex-wrap gap-3">
                                                    {gradeColumns.map(g => (
                                                        <div key={g} className="text-center p-3 border rounded" style={{ minWidth: '80px' }}>
                                                            <h4 className={`grade-${g.toLowerCase()} mb-0`}>{reportData.grades[g] || 0}</h4>
                                                            <small className="text-muted">Grade {g}</small>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Student Results Table */}
                                {moduleDetails?.students?.length > 0 && (
                                    <div className="card">
                                        <div className="card-header">
                                            <h6 className="mb-0"><i className="fa fa-users me-2"></i>Student Results</h6>
                                        </div>
                                        <div className="card-body">
                                            <table className="table table-striped table-hover">
                                                <thead className="table-dark">
                                                    <tr>
                                                        <th>S/N</th>
                                                        <th>Student ID</th>
                                                        <th>Student Name</th>
                                                        <th className="text-center">CA</th>
                                                        <th className="text-center">Exam</th>
                                                        <th className="text-center">Total</th>
                                                        <th className="text-center">Grade</th>
                                                        <th>Decision</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {moduleDetails.students.map((s, i) => (
                                                        <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td><code>{s.StudentID}</code></td>
                                                            <td>{s.StudentName}</td>
                                                            <td className="text-center">{s.CA}</td>
                                                            <td className="text-center">{s.Exam}</td>
                                                            <td className="text-center"><strong>{s.Total}</strong></td>
                                                            <td className="text-center">
                                                                <span className={`badge bg-${s.StudentGrade === 'A' ? 'success' : s.StudentGrade === 'F' ? 'danger' : 'secondary'}`}>
                                                                    {s.StudentGrade}
                                                                </span>
                                                            </td>
                                                            <td>{s.Decision}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {!reportData && selectedSemester && selectedModule && (
                            <div className="alert alert-info text-center">No results found for this module.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(SenateModule);
