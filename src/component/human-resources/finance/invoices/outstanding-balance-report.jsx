import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { currencyConverter } from "../../../../resources/constants";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";

function OutstandingBalanceReport(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [levelList, setLevelList] = useState([]);
    const [programmeList, setProgrammeList] = useState([]);
    const [summaryStats, setSummaryStats] = useState({
        TotalStudents: 0,
        TotalOutstanding: 0,
        AverageOutstanding: 0,
        HighestOutstanding: 0,
    });

    const [filters, setFilters] = useState({
        SemesterCode: "",
        Level: "",
        ProgrammeID: "",
    });

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Invoice No", field: "InvoiceNo" },
            { label: "Student ID", field: "StudentID" },
            { label: "Student Name", field: "StudentName" },
            { label: "Programme", field: "Programme" },
            { label: "Level", field: "Level" },
            { label: "Total Amount", field: "TotalAmount" },
            { label: "Amount Paid", field: "AmountPaid" },
            { label: "Outstanding", field: "Outstanding" },
            { label: "Status", field: "Status" },
        ],
        rows: [],
    });

    const semesterOptions = useMemo(() => {
        return semesterList.map(s => ({
            value: s.SemesterCode,
            label: (s.SemesterName || s.SemesterCode) + (s.IsCurrent === 1 ? ' (Current)' : '')
        }));
    }, [semesterList]);

    const levelOptions = useMemo(() => {
        return [{ value: '', label: 'All Levels' }, ...levelList.map(l => ({
            value: l.Level || l.LevelName,
            label: l.LevelName || l.Level
        }))];
    }, [levelList]);

    const programmeOptions = useMemo(() => {
        return [{ value: '', label: 'All Programmes' }, ...programmeList.map(p => ({
            value: p.CourseCode || p.CourseID,
            label: p.CourseName
        }))];
    }, [programmeList]);

    const getReportData = async () => {
        if (!filters.SemesterCode) {
            setIsLoading(false);
            return;
        }

        let endpoint = `staff/finance/invoices/outstanding-report?semester=${filters.SemesterCode}`;
        if (filters.Level) endpoint += `&level=${filters.Level}`;
        if (filters.ProgrammeID) endpoint += `&programme=${filters.ProgrammeID}`;

        const result = await api.get(endpoint);

        if (result.success && result.data?.data) {
            const { summary, rows } = result.data.data;
            setSummaryStats(summary || {});
            setReportData(rows || []);
            buildTable(rows || []);
        }
        setIsLoading(false);
    };

    const buildTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            const balance = parseFloat(item.BalanceDue) || 0;
            const status = item.Status === 'PartiallyPaid' ? 'Partial' : 'Unpaid';

            rows.push({
                sn: index + 1,
                InvoiceNo: <span className="fw-bold text-primary">#{item.InvoiceNumber}</span>,
                StudentID: item.StudentID,
                StudentName: <span className="fw-bold">{item.StudentName}</span>,
                Programme: item.CourseName || "-",
                Level: item.Level || "-",
                TotalAmount: currencyConverter(item.TotalAmount),
                AmountPaid: <span className="text-success">{currencyConverter(item.AmountPaid)}</span>,
                Outstanding: <span className="text-danger fw-bold">{currencyConverter(balance)}</span>,
                Status: (
                    <span className={`badge badge-light-${status === "Partial" ? "warning" : "danger"}`}>
                        {status}
                    </span>
                ),
            });
        });

        setDatatable(prev => ({ ...prev, rows }));
    };

    const getSemesters = async () => {
        const result = await api.get("staff/registration/semester/list");
        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setSemesterList(data);
            if (data.length > 0) {
                const current = data.find(s => s.IsCurrent === 1);
                setFilters(prev => ({
                    ...prev,
                    SemesterCode: current?.SemesterCode || data[0].SemesterCode,
                }));
            }
        }
    };

    const getLevels = async () => {
        const result = await api.get("staff/academics/levels/list");
        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setLevelList(data);
        }
    };

    const getProgrammes = async () => {
        const result = await api.get("staff/academics/courses/list");
        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setProgrammeList(data);
        }
    };

    const onFilterChange = (e) => {
        setFilters({ ...filters, [e.target.id]: e.target.value });
    };

    const applyFilters = () => {
        setIsLoading(true);
        getReportData();
    };

    const clearFilters = () => {
        setFilters({ ...filters, Level: "", ProgrammeID: "" });
    };

    const exportToCSV = () => {
        if (reportData.length === 0) return;

        const headers = ["Invoice No", "Student ID", "Student Name", "Programme", "Level", "Total Amount", "Amount Paid", "Outstanding", "Status"];
        const rows = reportData.map(item => {
            const status = item.Status === 'PartiallyPaid' ? 'Partial' : 'Unpaid';
            return [
                item.InvoiceNumber, item.StudentID, item.StudentName,
                item.CourseName || "-", item.Level || "-",
                item.TotalAmount, item.AmountPaid, item.BalanceDue, status,
            ];
        });

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `outstanding_balance_report_${filters.SemesterCode}_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        Promise.all([getSemesters(), getLevels(), getProgrammes()]);
    }, []);

    useEffect(() => {
        if (filters.SemesterCode) {
            setIsLoading(true);
            getReportData();
        }
    }, [filters.SemesterCode]);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Outstanding Balance Report"
                items={["Human Resources", "Finance", "Invoices", "Outstanding Balances"]}
            />

            <div className="flex-column-fluid">
                {/* Filters */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-3">
                                <label className="form-label required">Semester</label>
                                <SearchSelect
                                    id="SemesterCode"
                                    value={semesterOptions.find(opt => opt.value === filters.SemesterCode) || null}
                                    options={semesterOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'SemesterCode', value: selected?.value || '' } })}
                                    placeholder="Select Semester"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Level</label>
                                <SearchSelect
                                    id="Level"
                                    value={levelOptions.find(opt => opt.value === filters.Level) || levelOptions[0]}
                                    options={levelOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'Level', value: selected?.value || '' } })}
                                    placeholder="All"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Programme</label>
                                <SearchSelect
                                    id="ProgrammeID"
                                    value={programmeOptions.find(opt => opt.value === filters.ProgrammeID) || programmeOptions[0]}
                                    options={programmeOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'ProgrammeID', value: selected?.value || '' } })}
                                    placeholder="All"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-4">
                                <div className="d-flex gap-2">
                                    <button className="btn btn-light" onClick={clearFilters}>
                                        <i className="fa fa-times me-1"></i> Clear
                                    </button>
                                    <button className="btn btn-primary" onClick={applyFilters}>
                                        <i className="fa fa-filter me-1"></i> Apply
                                    </button>
                                    <button
                                        className="btn btn-light-primary"
                                        onClick={exportToCSV}
                                        disabled={reportData.length === 0}
                                    >
                                        <i className="fa fa-download me-1"></i> Export
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {filters.SemesterCode && (
                    <>
                        {/* Stats Cards */}
                        <div className="row g-4 mb-4">
                            <div className="col-md-3">
                                <div className="card bg-light-danger">
                                    <div className="card-body py-4">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-3">
                                                <span className="symbol-label bg-danger">
                                                    <i className="fa fa-users text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-2 fw-bold">{summaryStats.TotalStudents || 0}</div>
                                                <div className="text-muted small">Students with Debt</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-light-warning">
                                    <div className="card-body py-4">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-3">
                                                <span className="symbol-label bg-warning">
                                                    <i className="fa fa-exclamation-triangle text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-4 fw-bold">{currencyConverter(summaryStats.TotalOutstanding || 0)}</div>
                                                <div className="text-muted small">Total Outstanding</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-light-info">
                                    <div className="card-body py-4">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-3">
                                                <span className="symbol-label bg-info">
                                                    <i className="fa fa-calculator text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-4 fw-bold">{currencyConverter(summaryStats.AverageOutstanding || 0)}</div>
                                                <div className="text-muted small">Avg. Outstanding</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-light-primary">
                                    <div className="card-body py-4">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-3">
                                                <span className="symbol-label bg-primary">
                                                    <i className="fa fa-arrow-up text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-4 fw-bold">{currencyConverter(summaryStats.HighestOutstanding || 0)}</div>
                                                <div className="text-muted small">Highest Debt</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Table */}
                        <div className="card">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title">Students with Outstanding Balances</h3>
                                <div className="card-toolbar">
                                    <span className="text-muted fs-7">{reportData.length} students found</span>
                                </div>
                            </div>
                            <div className="card-body py-3">
                                {reportData.length > 0 ? (
                                    <AGTable data={datatable} />
                                ) : (
                                    <div className="text-center py-10">
                                        <i className="fa fa-check-circle fs-2x text-success mb-4"></i>
                                        <p className="text-muted">No outstanding balances found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {!filters.SemesterCode && (
                    <div className="card">
                        <div className="card-body text-center py-15">
                            <i className="fa fa-calendar-alt fs-2x text-muted mb-4"></i>
                            <p className="text-muted fs-5">Please select a semester to view the report</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(OutstandingBalanceReport);
