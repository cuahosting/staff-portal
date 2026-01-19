import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux/es/exports";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { toast } from "react-toastify";
import SearchSelect from "../../common/select/SearchSelect";
import ReactToPrint from "react-to-print";
import { projectLogo, schoolName } from "../../../resources/constants";
import "./module-individual-results.css";

function ModuleIndividualResults(props) {
    const printRef = useRef();
    const [isLoading, setIsLoading] = useState(false);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [moduleOptions, setModuleOptions] = useState([]);
    const [data, setData] = useState([]);
    const [moduleInfo, setModuleInfo] = useState(null);
    const [filters, setFilters] = useState({
        semester: "",
        semesterObj: null,
        moduleCode: "",
        moduleObj: null
    });

    // Load semesters on mount
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

    // Load modules
    const getModules = async () => {
        const { success, data } = await api.get("staff/assessment/exam/module/all");
        if (success && data?.length > 0) {
            let rows = data.map(row => ({
                value: row.ModuleCode,
                label: `${row.ModuleName} (${row.ModuleCode})`
            }));
            setModuleOptions(rows);
        }
    };

    useEffect(() => {
        getSemesters();
        getModules();
    }, []);

    // Fetch report data
    const fetchData = async () => {
        if (!filters.semester || !filters.moduleCode) {
            return;
        }

        setIsLoading(true);
        try {
            const { success, data: result } = await api.post("staff/assessment/exam/reports/module-results", {
                semester: filters.semester,
                moduleCode: filters.moduleCode
            });

            if (success && result?.results?.length > 0) {
                setData(result.results);
                setModuleInfo(result.moduleInfo);
            } else {
                toast.info("No results found for the selected module");
                setData([]);
                setModuleInfo(null);
            }
        } catch (error) {
            toast.error("Error fetching report data");
            setData([]);
        }
        setIsLoading(false);
    };

    const onSemesterChange = (e) => {
        setFilters(prev => ({ ...prev, semester: e?.value || "", semesterObj: e }));
    };

    const onModuleChange = (e) => {
        setFilters(prev => ({ ...prev, moduleCode: e?.value || "", moduleObj: e }));
    };

    useEffect(() => {
        if (filters.semester && filters.moduleCode) {
            fetchData();
        }
    }, [filters.semester, filters.moduleCode]);

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <div className="printPageButton">
                <PageHeader
                    title="INDIVIDUAL MODULE RESULTS"
                    items={["Assessment", "Reports", "Individual Module Results"]}
                />
            </div>

            {/* Filters */}
            <div className="row printPageButton mb-4">
                <div className="col-md-6">
                    <SearchSelect
                        label="Select Semester"
                        value={filters.semesterObj}
                        onChange={onSemesterChange}
                        options={semesterOptions}
                        placeholder="Select Semester"
                    />
                </div>
                <div className="col-md-6">
                    <SearchSelect
                        label="Select Module"
                        value={filters.moduleObj}
                        onChange={onModuleChange}
                        options={moduleOptions}
                        placeholder="Select Module"
                    />
                </div>
            </div>

            {/* Print Button */}
            {data.length > 0 && (
                <div className="mb-3 printPageButton">
                    <ReactToPrint
                        trigger={() => (
                            <button className="btn btn-primary">
                                <i className="fa fa-print me-2"></i> Print Report
                            </button>
                        )}
                        content={() => printRef.current}
                        documentTitle={`Module Results - ${moduleInfo?.ModuleCode}`}
                    />
                </div>
            )}

            {isLoading ? (
                <Loader />
            ) : (
                <div ref={printRef} className="module-individual-results-container">
                    {data.length > 0 && moduleInfo && (
                        <>
                            {/* Print Header */}
                            <div className="print-header text-center mb-4">
                                <img src={projectLogo} alt={schoolName} width={80} height={80} />
                                <h2 className="mt-2 text-uppercase fw-bold">{schoolName}</h2>
                                <h4 className="text-uppercase">Allied Health Sciences Results ({filters.semester})</h4>
                            </div>

                            {/* Module Title */}
                            <div className="text-center mb-4">
                                <h5 className="fw-bold">
                                    {moduleInfo.ModuleCode} - {moduleInfo.ModuleName}
                                </h5>
                            </div>

                            {/* Results Table */}
                            <div className="table-responsive">
                                <table className="table table-bordered module-results-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="text-center">S/N</th>
                                            <th>Student ID</th>
                                            <th>Module Code</th>
                                            <th>Module Title</th>
                                            <th className="text-center">CA (30)</th>
                                            <th className="text-center">Exam (70)</th>
                                            <th className="text-center">Total</th>
                                            <th className="text-center">Grade</th>
                                            <th>Comments</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row, index) => (
                                            <tr key={index} className={row.Comments ? 'table-warning' : ''}>
                                                <td className="text-center">{index + 1}</td>
                                                <td>{row.StudentID}</td>
                                                <td>{row.ModuleCode}</td>
                                                <td>{row.ModuleTitle}</td>
                                                <td className="text-center">{row.CAScore ?? '-'}</td>
                                                <td className="text-center">{row.ExamScore ?? '-'}</td>
                                                <td className="text-center fw-bold">{row.Total ?? '-'}</td>
                                                <td className="text-center">
                                                    <span className={`badge ${getGradeBadgeClass(row.Grade)}`}>
                                                        {row.Grade || '-'}
                                                    </span>
                                                </td>
                                                <td className="text-danger">{row.Comments}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Statistics */}
                            <div className="summary-section mt-4">
                                <div className="row">
                                    <div className="col-md-6">
                                        <table className="table table-sm table-bordered">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Total Students:</strong></td>
                                                    <td>{data.length}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Passed:</strong></td>
                                                    <td>{data.filter(r => r.Total >= 40).length}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Failed:</strong></td>
                                                    <td>{data.filter(r => r.Total < 40 && r.Total !== null).length}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Incomplete:</strong></td>
                                                    <td>{data.filter(r => r.Comments === 'Incomplete').length}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {data.length === 0 && filters.semester && filters.moduleCode && (
                        <div className="alert alert-info text-center">
                            No results found for the selected module.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function getGradeBadgeClass(grade) {
    switch (grade) {
        case 'A': return 'bg-success';
        case 'B': return 'bg-primary';
        case 'C': return 'bg-info';
        case 'D': return 'bg-warning text-dark';
        case 'F': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

const mapStateToProps = (state) => ({
    LoginDetails: state.LoginDetails
});

export default connect(mapStateToProps, null)(ModuleIndividualResults);
