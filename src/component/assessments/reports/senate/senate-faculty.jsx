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

function SenateFaculty(props) {
    const printRef = useRef();
    const [isLoading, setIsLoading] = useState(false);
    const [semesters, setSemesters] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [gradeColumns, setGradeColumns] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [moduleDetails, setModuleDetails] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { loadFilters(); }, []);

    const loadFilters = async () => {
        const [semRes, facRes] = await Promise.all([
            api.get("staff/timetable/timetable/semester"),
            api.get("staff/assessment/senate-reports/faculties")
        ]);
        if (semRes.success) setSemesters(semRes.data.map(s => ({ value: s.SemesterCode, label: `${s.SemesterName} (${s.SemesterCode})` })));
        if (facRes.success) setFaculties(facRes.data.data.map(f => ({ value: f.FacultyCode, label: f.FacultyName })));
    };

    const loadReport = async () => {
        if (!selectedSemester || !selectedFaculty) return;
        setIsLoading(true);
        const { success, data } = await api.get(`staff/assessment/senate-reports/by-faculty/${selectedSemester.value}/${selectedFaculty.value}`);
        if (success && data?.modules) {
            setReportData(data.modules);
            setGradeColumns(data.gradeSettings || ['A', 'B', 'C', 'D', 'E', 'F']);
        } else {
            toast.info("No data found");
            setReportData(null);
        }
        setIsLoading(false);
    };

    useEffect(() => { if (selectedSemester && selectedFaculty) loadReport(); }, [selectedSemester, selectedFaculty]);

    const openModuleDetails = async (module) => {
        setSelectedModule(module);
        setShowModal(true);
        const { success, data } = await api.get(`staff/assessment/senate-reports/module-details/${selectedSemester.value}/${module.ModuleCode}`);
        if (success) setModuleDetails(data);
    };

    const tableData = {
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Module Code", field: "moduleCode" },
            { label: "Module Name", field: "moduleName" },
            { label: "Lecturers", field: "lecturers" },
            ...gradeColumns.map(g => ({ label: g, field: `grade_${g}` })),
            { label: "Total", field: "total" },
            { label: "Action", field: "action" }
        ],
        rows: (reportData || []).map((mod, idx) => ({
            sn: idx + 1,
            moduleCode: <code>{mod.ModuleCode}</code>,
            moduleName: mod.ModuleName,
            lecturers: mod.Lecturers || "N/A",
            ...gradeColumns.reduce((acc, g) => ({ ...acc, [`grade_${g}`]: <span className={`grade-${g.toLowerCase()}`}>{mod.grades[g] || 0}</span> }), {}),
            total: <strong>{mod.total}</strong>,
            action: <button className="btn btn-sm btn-info" onClick={() => openModuleDetails(mod)}><i className="fa fa-eye"></i></button>
        }))
    };

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Senate Report - Faculty" items={["Assessment", "Senate Reports", "Faculty View"]} />
            <div className="flex-column-fluid">
                <div className="card mb-4 printPageButton">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Select Semester</label>
                                <SearchSelect options={semesters} value={selectedSemester} onChange={setSelectedSemester} placeholder="Select semester..." />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Select Faculty</label>
                                <SearchSelect options={faculties} value={selectedFaculty} onChange={setSelectedFaculty} placeholder="Select faculty..." />
                            </div>
                            {reportData && (
                                <div className="col-md-3 d-flex align-items-end">
                                    <ReactToPrint
                                        trigger={() => <button className="btn btn-primary"><i className="fa fa-print me-2"></i>Print</button>}
                                        content={() => printRef.current}
                                    />
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
                            <h3>Senate Result Report - {selectedFaculty?.label}</h3>
                            <p>{selectedSemester?.label}</p>
                        </div>
                        {reportData && reportData.length > 0 ? (
                            <div className="card"><div className="card-body"><AGTable data={tableData} /></div></div>
                        ) : selectedSemester && selectedFaculty && (
                            <div className="alert alert-info text-center">No results found.</div>
                        )}
                    </div>
                )}

                {showModal && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-xl modal-dialog-scrollable">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{selectedModule?.ModuleCode} - {selectedModule?.ModuleName}</h5>
                                    <button type="button" className="btn-close" onClick={() => { setShowModal(false); setModuleDetails(null); }}></button>
                                </div>
                                <div className="modal-body">
                                    {moduleDetails ? (
                                        <table className="table table-striped senate-modal-table">
                                            <thead className="table-dark">
                                                <tr><th>S/N</th><th>Student ID</th><th>Name</th><th>CA</th><th>Exam</th><th>Total</th><th>Grade</th><th>Decision</th></tr>
                                            </thead>
                                            <tbody>
                                                {moduleDetails.students?.map((s, i) => (
                                                    <tr key={i}><td>{i + 1}</td><td><code>{s.StudentID}</code></td><td>{s.StudentName}</td><td>{s.CA}</td><td>{s.Exam}</td><td><strong>{s.Total}</strong></td><td><span className={`badge bg-${s.StudentGrade === 'A' ? 'success' : s.StudentGrade === 'F' ? 'danger' : 'secondary'}`}>{s.StudentGrade}</span></td><td>{s.Decision}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <Loader />}
                                </div>
                                <div className="modal-footer"><button className="btn btn-secondary" onClick={() => { setShowModal(false); setModuleDetails(null); }}>Close</button></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(SenateFaculty);
