import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { currencyConverter } from "../../../../resources/constants";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";

function BalanceManagement(props) {
    const token = props.loginData[0]?.token;

    const [isLoading, setIsLoading] = useState(true);
    const [balanceList, setBalanceList] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [levelList, setLevelList] = useState([]);
    const [programmeList, setProgrammeList] = useState([]);
    const [summaryStats, setSummaryStats] = useState({
        totalStudents: 0,
        totalOutstanding: 0,
        totalOverpaid: 0,
        totalCleared: 0,
    });

    const [filters, setFilters] = useState({
        SemesterCode: "",
        Level: "",
        ProgrammeID: "",
        BalanceType: "",
        SearchTerm: "",
    });

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Student ID", field: "StudentID" },
            { label: "Student Name", field: "StudentName" },
            { label: "Programme", field: "Programme" },
            { label: "Level", field: "Level" },
            { label: "Total Billed", field: "TotalBilled" },
            { label: "Total Paid", field: "TotalPaid" },
            { label: "Balance", field: "Balance" },
            { label: "Status", field: "Status" },
            { label: "Action", field: "action" },
        ],
        rows: [],
    });

    const semesterOptions = useMemo(() => {
        return [{ value: '', label: 'All' }, ...semesterList.map(s => ({
            value: s.SemesterCode,
            label: s.SemesterName || s.SemesterCode
        }))];
    }, [semesterList]);

    const levelOptions = useMemo(() => {
        return [{ value: '', label: 'All' }, ...levelList.map(l => ({
            value: l.Level,
            label: l.LevelName || l.Level
        }))];
    }, [levelList]);

    const programmeOptions = useMemo(() => {
        return [{ value: '', label: 'All' }, ...programmeList.map(p => ({
            value: p.CourseID,
            label: p.CourseName
        }))];
    }, [programmeList]);

    const balanceTypeOptions = [
        { value: '', label: 'All' },
        { value: 'outstanding', label: 'Outstanding' },
        { value: 'overpaid', label: 'Overpaid' },
        { value: 'cleared', label: 'Cleared' }
    ];

    const getBalances = async () => {
        let endpoint = "staff/ac-finance/balances/list";
        const params = [];

        if (filters.SemesterCode) params.push(`semester=${filters.SemesterCode}`);
        if (filters.Level) params.push(`level=${filters.Level}`);
        if (filters.ProgrammeID) params.push(`programme=${filters.ProgrammeID}`);
        if (filters.BalanceType) params.push(`balanceType=${filters.BalanceType}`);
        if (filters.SearchTerm) params.push(`search=${filters.SearchTerm}`);

        if (params.length > 0) {
            endpoint += "?" + params.join("&");
        }

        const result = await api.get(endpoint, token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setBalanceList(data);
            buildTable(data);
            calculateStats(data);
        }
        setIsLoading(false);
    };

    const buildTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            const balance = item.TotalBilled - item.TotalPaid;
            let status = "Cleared";
            let statusClass = "success";

            if (balance > 0) {
                status = "Outstanding";
                statusClass = "danger";
            } else if (balance < 0) {
                status = "Overpaid";
                statusClass = "info";
            }

            rows.push({
                sn: index + 1,
                StudentID: item.StudentID,
                StudentName: <span className="fw-bold">{item.StudentName}</span>,
                Programme: item.CourseName || "-",
                Level: item.Level || "-",
                TotalBilled: currencyConverter(item.TotalBilled),
                TotalPaid: (
                    <span className="text-success">{currencyConverter(item.TotalPaid)}</span>
                ),
                Balance: (
                    <span className={`fw-bold text-${balance > 0 ? "danger" : balance < 0 ? "info" : "success"}`}>
                        {currencyConverter(Math.abs(balance))}
                        {balance < 0 && " (CR)"}
                    </span>
                ),
                Status: <span className={`badge badge-light-${statusClass}`}>{status}</span>,
                action: (
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-light-info"
                            onClick={() => viewStudentDetails(item)}
                        >
                            <i className="fa fa-eye"></i>
                        </button>
                        <button
                            className="btn btn-sm btn-light-primary"
                            onClick={() => viewPaymentHistory(item)}
                        >
                            <i className="fa fa-history"></i>
                        </button>
                    </div>
                ),
            });
        });

        setDatatable({ ...datatable, rows });
    };

    const calculateStats = (data) => {
        let outstanding = 0;
        let overpaid = 0;
        let cleared = 0;

        data.forEach((item) => {
            const balance = item.TotalBilled - item.TotalPaid;
            if (balance > 0) {
                outstanding += balance;
            } else if (balance < 0) {
                overpaid += Math.abs(balance);
            } else {
                cleared++;
            }
        });

        setSummaryStats({
            totalStudents: data.length,
            totalOutstanding: outstanding,
            totalOverpaid: overpaid,
            totalCleared: cleared,
        });
    };

    const getSemesters = async () => {
        const result = await api.get("staff/registration/semester/list", token, null, {}, false);

        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setSemesterList(data);
        }
    };

    const getLevels = async () => {
        const result = await api.get("staff/academics/levels/list", token, null, {}, false);

        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setLevelList(data);
        }
    };

    const getProgrammes = async () => {
        const result = await api.get("staff/academics/courses/list", token, null, {}, false);

        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setProgrammeList(data);
        }
    };

    const viewStudentDetails = (item) => {
        window.location.href = `/ac-finance/student-balance/${item.StudentID}`;
    };

    const viewPaymentHistory = (item) => {
        window.location.href = `/ac-finance/payment-history?student=${item.StudentID}`;
    };

    const onFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.id]: e.target.value,
        });
    };

    const applyFilters = () => {
        getBalances();
    };

    const clearFilters = () => {
        setFilters({
            SemesterCode: "",
            Level: "",
            ProgrammeID: "",
            BalanceType: "",
            SearchTerm: "",
        });
    };

    const exportToCSV = () => {
        if (balanceList.length === 0) return;

        const headers = [
            "Student ID",
            "Student Name",
            "Programme",
            "Level",
            "Total Billed",
            "Total Paid",
            "Balance",
            "Status",
        ];

        const rows = balanceList.map((item) => {
            const balance = item.TotalBilled - item.TotalPaid;
            let status = "Cleared";
            if (balance > 0) status = "Outstanding";
            else if (balance < 0) status = "Overpaid";

            return [
                item.StudentID,
                item.StudentName,
                item.CourseName || "-",
                item.Level || "-",
                item.TotalBilled,
                item.TotalPaid,
                balance,
                status,
            ];
        });

        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `student_balances_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getBalances(), getSemesters(), getLevels(), getProgrammes()]);
        };
        fetchData();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Balance Management"
                items={["Human Resources", "AC-Finance", "Balances"]}
            />

            <div className="flex-column-fluid">
                {/* Stats Cards */}
                <div className="row g-4 mb-4">
                    <div className="col-md-3">
                        <div className="card bg-light-primary">
                            <div className="card-body py-4">
                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-50px me-3">
                                        <span className="symbol-label bg-primary">
                                            <i className="fa fa-users text-white fs-3"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="fs-2 fw-bold">{summaryStats.totalStudents}</div>
                                        <div className="text-muted small">Total Students</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-light-danger">
                            <div className="card-body py-4">
                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-50px me-3">
                                        <span className="symbol-label bg-danger">
                                            <i className="fa fa-exclamation-triangle text-white fs-3"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="fs-2 fw-bold">
                                            {currencyConverter(summaryStats.totalOutstanding)}
                                        </div>
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
                                            <i className="fa fa-arrow-up text-white fs-3"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="fs-2 fw-bold">
                                            {currencyConverter(summaryStats.totalOverpaid)}
                                        </div>
                                        <div className="text-muted small">Total Overpaid</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-light-success">
                            <div className="card-body py-4">
                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-50px me-3">
                                        <span className="symbol-label bg-success">
                                            <i className="fa fa-check-circle text-white fs-3"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="fs-2 fw-bold">{summaryStats.totalCleared}</div>
                                        <div className="text-muted small">Cleared Students</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-2">
                                <label htmlFor="SearchTerm" className="form-label">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    id="SearchTerm"
                                    className="form-control form-control-solid"
                                    placeholder="ID or Name"
                                    value={filters.SearchTerm}
                                    onChange={onFilterChange}
                                />
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="SemesterCode" className="form-label">
                                    Semester
                                </label>
                                <SearchSelect
                                    id="SemesterCode"
                                    value={semesterOptions.find(opt => opt.value === filters.SemesterCode) || semesterOptions[0]}
                                    options={semesterOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'SemesterCode', value: selected?.value || '' } })}
                                    placeholder="All"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="Level" className="form-label">
                                    Level
                                </label>
                                <SearchSelect
                                    id="Level"
                                    value={levelOptions.find(opt => opt.value === filters.Level) || levelOptions[0]}
                                    options={levelOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'Level', value: selected?.value || '' } })}
                                    placeholder="All"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="ProgrammeID" className="form-label">
                                    Programme
                                </label>
                                <SearchSelect
                                    id="ProgrammeID"
                                    value={programmeOptions.find(opt => opt.value === filters.ProgrammeID) || programmeOptions[0]}
                                    options={programmeOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'ProgrammeID', value: selected?.value || '' } })}
                                    placeholder="All"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="BalanceType" className="form-label">
                                    Status
                                </label>
                                <SearchSelect
                                    id="BalanceType"
                                    value={balanceTypeOptions.find(opt => opt.value === filters.BalanceType) || balanceTypeOptions[0]}
                                    options={balanceTypeOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'BalanceType', value: selected?.value || '' } })}
                                    placeholder="All"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <div className="d-flex gap-2">
                                    <button className="btn btn-light flex-grow-1" onClick={clearFilters}>
                                        <i className="fa fa-times"></i>
                                    </button>
                                    <button className="btn btn-primary flex-grow-1" onClick={applyFilters}>
                                        <i className="fa fa-filter"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Balance Table */}
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title">
                            <span className="fw-bold fs-3">Student Balances</span>
                            <span className="text-muted ms-3 fs-7">
                                {balanceList.length} records
                            </span>
                        </div>
                        <div className="card-toolbar">
                            <button className="btn btn-light-primary" onClick={exportToCSV}>
                                <i className="fa fa-download me-2"></i>
                                Export CSV
                            </button>
                        </div>
                    </div>
                    <div className="card-body py-4">
                        <AGTable data={datatable} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(BalanceManagement);
