import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux/es/exports";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { toast } from "react-toastify";
import SearchSelect from "../../common/select/SearchSelect";
import ReactToPrint from "react-to-print";
import { projectLogo, schoolName } from "../../../resources/constants";
import "./module-result-summary.css";

function ModuleResultSummary(props) {
    const printRef = useRef();
    const [isLoading, setIsLoading] = useState(false);
    const [semesterList, setSemesterList] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({
        semester: "",
        semesterObj: null,
        faculty: "",
        facultyObj: null,
        facultyName: "",
        department: "",
        departmentObj: null,
        departmentName: ""
    });

    // Load semesters on mount
    const getSemesters = async () => {
        const { success, data } = await api.get("staff/timetable/timetable/semester");
        if (success && data?.length > 0) {
            let rows = data.map(row => ({
                value: row.SemesterCode,
                label: `${row.SemesterName} - ${row.SemesterCode}`
            }));
            setSemesterList(data);
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

    // Build faculty options from props
    useEffect(() => {
        if (props.FacultyList?.length > 0) {
            let rows = props.FacultyList.map(x => ({
                label: x.FacultyName,
                value: x.FacultyCode
            }));
            setFacultyOptions(rows);
        }
        getSemesters();
        getDepartments();
    }, [props.FacultyList]);

    // Fetch report data
    const fetchData = async () => {
        if (!filters.semester || !filters.department) {
            return;
        }

        setIsLoading(true);
        try {
            const { success, data: result } = await api.post("staff/assessment/exam/reports/module-summary", {
                semester: filters.semester,
                faculty: filters.faculty,
                department: filters.department
            });

            if (success && result?.length > 0) {
                setData(result);
            } else {
                toast.info("No data found for the selected criteria");
                setData([]);
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

    const onFacultyChange = (e) => {
        setFilters(prev => ({ ...prev, faculty: e?.value || "", facultyObj: e, facultyName: e?.label || "" }));
    };

    const onDepartmentChange = (e) => {
        setFilters(prev => ({ ...prev, department: e?.value || "", departmentObj: e, departmentName: e?.label || "" }));
    };

    useEffect(() => {
        if (filters.semester && filters.department) {
            fetchData();
        }
    }, [filters.semester, filters.department]);

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <div className="printPageButton">
                <PageHeader
                    title="MODULE RESULT SUMMARY"
                    items={["Assessment", "Reports", "Module Result Summary"]}
                />
            </div>

            {/* Filters */}
            <div className="row printPageButton mb-4">
                <div className="col-md-4">
                    <SearchSelect
                        label="Select Semester"
                        value={filters.semesterObj}
                        onChange={onSemesterChange}
                        options={semesterOptions}
                        placeholder="Select Semester"
                    />
                </div>
                <div className="col-md-4">
                    <SearchSelect
                        label="Select Faculty"
                        value={filters.facultyObj}
                        onChange={onFacultyChange}
                        options={facultyOptions}
                        placeholder="Select Faculty"
                    />
                </div>
                <div className="col-md-4">
                    <SearchSelect
                        label="Select Department"
                        value={filters.departmentObj}
                        onChange={onDepartmentChange}
                        options={departmentOptions}
                        placeholder="Select Department"
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
                        documentTitle={`Module Result Summary - ${filters.departmentName}`}
                    />
                </div>
            )}

            {isLoading ? (
                <Loader />
            ) : (
                <div ref={printRef} className="module-result-summary-container">
                    {data.length > 0 && (
                        <>
                            {/* Print Header */}
                            <div className="print-header text-center mb-4">
                                <img src={projectLogo} alt={schoolName} width={80} height={80} />
                                <h2 className="mt-2 text-uppercase fw-bold">{schoolName}</h2>
                                <h4 className="text-uppercase">
                                    {filters.facultyName ? `Faculty of ${filters.facultyName}` : ""}
                                </h4>
                                <h5 className="text-uppercase fw-semibold">
                                    MODULE RESULT SUMMARY ({filters.semester})
                                </h5>
                                <h6 className="text-uppercase">
                                    Department of {filters.departmentName}
                                </h6>
                            </div>

                            {/* Results Table */}
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped module-summary-table">
                                    <thead className="table-dark">
                                        <tr>
                                            <th rowSpan={2} className="text-center align-middle">S/N</th>
                                            <th colSpan={3} className="text-center">Module Details</th>
                                            <th colSpan={7} className="text-center">Grade Summary</th>
                                        </tr>
                                        <tr>
                                            <th>Module Code</th>
                                            <th>Module Description</th>
                                            <th>Lecturer</th>
                                            <th className="text-center">A (70-100)</th>
                                            <th className="text-center">B (60-69)</th>
                                            <th className="text-center">C (50-59)</th>
                                            <th className="text-center">D (40-49)</th>
                                            <th className="text-center">F (39-0)</th>
                                            <th className="text-center">Incomplete</th>
                                            <th className="text-center">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{index + 1}</td>
                                                <td>{row.ModuleCode}</td>
                                                <td>{row.ModuleDescription}</td>
                                                <td>{row.Lecturer}</td>
                                                <td className="text-center">{row.GradeA || 0}</td>
                                                <td className="text-center">{row.GradeB || 0}</td>
                                                <td className="text-center">{row.GradeC || 0}</td>
                                                <td className="text-center">{row.GradeD || 0}</td>
                                                <td className="text-center">{row.GradeF || 0}</td>
                                                <td className="text-center">{row.Incomplete || 0}</td>
                                                <td className="text-center fw-bold">{row.Total || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Signature Section */}
                            <div className="signature-section mt-5">
                                <div className="row">
                                    <div className="col-4 text-center">
                                        <div className="signature-line"></div>
                                        <p className="mb-0"><strong>Head of Department</strong></p>
                                        <p className="small">Name, Sign & Date</p>
                                    </div>
                                    <div className="col-4 text-center">
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

                    {data.length === 0 && filters.semester && filters.department && (
                        <div className="alert alert-info text-center">
                            No results found for the selected criteria. Please adjust your filters.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const mapStateToProps = (state) => ({
    LoginDetails: state.LoginDetails,
    FacultyList: state.FacultyList
});

export default connect(mapStateToProps, null)(ModuleResultSummary);
