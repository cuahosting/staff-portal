import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { currencyConverter } from "../../../../resources/constants";
import { connect } from "react-redux";

function BalanceReport(props) {
    const token = props.loginData[0]?.token;

    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [summaryStats, setSummaryStats] = useState({
        totalStudents: 0,
        clearedStudents: 0,
        outstandingStudents: 0,
        overpaidStudents: 0,
        totalBalance: 0,
    });

    const [filters, setFilters] = useState({
        SemesterCode: "",
        BalanceType: "all",
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
        ],
        rows: [],
    });

    const getReportData = async () => {
        if (!filters.SemesterCode) {
            setIsLoading(false);
            return;
        }

        let endpoint = `staff/ac-finance/reports/balance?semester=${filters.SemesterCode}`;

        if (filters.BalanceType && filters.BalanceType !== "all") {
            endpoint += `&type=${filters.BalanceType}`;
        }

        const result = await api.get(endpoint, token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setReportData(data);
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
                    <span
                        className={`fw-bold text-${
                            balance > 0 ? "danger" : balance < 0 ? "info" : "success"
                        }`}
                    >
                        {currencyConverter(Math.abs(balance))}
                        {balance < 0 && " (CR)"}
                    </span>
                ),
                Status: <span className={`badge badge-light-${statusClass}`}>{status}</span>,
            });
        });

        setDatatable({ ...datatable, rows });
    };

    const calculateStats = (data) => {
        let cleared = 0;
        let outstanding = 0;
        let overpaid = 0;
        let totalBalance = 0;

        data.forEach((item) => {
            const balance = item.TotalBilled - item.TotalPaid;
            totalBalance += balance;

            if (balance === 0) cleared++;
            else if (balance > 0) outstanding++;
            else overpaid++;
        });

        setSummaryStats({
            totalStudents: data.length,
            clearedStudents: cleared,
            outstandingStudents: outstanding,
            overpaidStudents: overpaid,
            totalBalance,
        });
    };

    const getSemesters = async () => {
        const result = await api.get("staff/registration/semester/list", token, null, {}, false);

        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setSemesterList(data);
            if (data.length > 0) {
                const current = data.find((s) => s.IsCurrent === 1);
                setFilters((prev) => ({
                    ...prev,
                    SemesterCode: current?.SemesterCode || data[0].SemesterCode,
                }));
            }
        }
    };

    const onFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.id]: e.target.value,
        });
    };

    const applyFilters = () => {
        setIsLoading(true);
        getReportData();
    };

    const exportToCSV = () => {
        if (reportData.length === 0) return;

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

        const rows = reportData.map((item) => {
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
        a.download = `balance_report_${filters.SemesterCode}_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        getSemesters();
    }, []);

    useEffect(() => {
        if (filters.SemesterCode) {
            setIsLoading(true);
            getReportData();
        }
    }, [filters.SemesterCode, filters.BalanceType]);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Balance Report"
                items={["Human Resources", "AC-Finance", "Reports", "Balance"]}
            />

            <div className="flex-column-fluid">
                {/* Filters */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-4">
                                <label className="form-label required">Select Semester</label>
                                <select
                                    id="SemesterCode"
                                    className="form-select form-select-solid"
                                    value={filters.SemesterCode}
                                    onChange={onFilterChange}
                                >
                                    <option value="">Select Semester</option>
                                    {semesterList.map((s) => (
                                        <option key={s.SemesterCode} value={s.SemesterCode}>
                                            {s.SemesterName || s.SemesterCode}
                                            {s.IsCurrent === 1 && " (Current)"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Balance Type</label>
                                <select
                                    id="BalanceType"
                                    className="form-select form-select-solid"
                                    value={filters.BalanceType}
                                    onChange={onFilterChange}
                                >
                                    <option value="all">All Students</option>
                                    <option value="outstanding">Outstanding Only</option>
                                    <option value="cleared">Cleared Only</option>
                                    <option value="overpaid">Overpaid Only</option>
                                </select>
                            </div>
                            <div className="col-md-5 text-end">
                                <button
                                    className="btn btn-light-primary"
                                    onClick={exportToCSV}
                                    disabled={reportData.length === 0}
                                >
                                    <i className="fa fa-download me-2"></i>
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {filters.SemesterCode && (
                    <>
                        {/* Stats Cards */}
                        <div className="row g-4 mb-4">
                            <div className="col-md-2-4" style={{ flex: "0 0 20%", maxWidth: "20%" }}>
                                <div className="card bg-light-primary">
                                    <div className="card-body py-4 text-center">
                                        <div className="fs-2 fw-bold">{summaryStats.totalStudents}</div>
                                        <div className="text-muted small">Total Students</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2-4" style={{ flex: "0 0 20%", maxWidth: "20%" }}>
                                <div className="card bg-light-success">
                                    <div className="card-body py-4 text-center">
                                        <div className="fs-2 fw-bold">{summaryStats.clearedStudents}</div>
                                        <div className="text-muted small">Cleared</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2-4" style={{ flex: "0 0 20%", maxWidth: "20%" }}>
                                <div className="card bg-light-danger">
                                    <div className="card-body py-4 text-center">
                                        <div className="fs-2 fw-bold">{summaryStats.outstandingStudents}</div>
                                        <div className="text-muted small">Outstanding</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2-4" style={{ flex: "0 0 20%", maxWidth: "20%" }}>
                                <div className="card bg-light-info">
                                    <div className="card-body py-4 text-center">
                                        <div className="fs-2 fw-bold">{summaryStats.overpaidStudents}</div>
                                        <div className="text-muted small">Overpaid</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2-4" style={{ flex: "0 0 20%", maxWidth: "20%" }}>
                                <div
                                    className={`card bg-light-${
                                        summaryStats.totalBalance > 0
                                            ? "warning"
                                            : summaryStats.totalBalance < 0
                                            ? "info"
                                            : "success"
                                    }`}
                                >
                                    <div className="card-body py-4 text-center">
                                        <div className="fs-4 fw-bold">
                                            {currencyConverter(Math.abs(summaryStats.totalBalance))}
                                            {summaryStats.totalBalance < 0 && " (CR)"}
                                        </div>
                                        <div className="text-muted small">Net Balance</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Balance Distribution Chart */}
                        <div className="card mb-4">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title">Balance Distribution</h3>
                            </div>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <div
                                            className="progress"
                                            style={{ height: "30px", borderRadius: "15px" }}
                                        >
                                            {summaryStats.totalStudents > 0 && (
                                                <>
                                                    <div
                                                        className="progress-bar bg-success"
                                                        style={{
                                                            width: `${
                                                                (summaryStats.clearedStudents /
                                                                    summaryStats.totalStudents) *
                                                                100
                                                            }%`,
                                                        }}
                                                        title={`Cleared: ${summaryStats.clearedStudents}`}
                                                    >
                                                        {summaryStats.clearedStudents > 0 && (
                                                            <span className="fw-bold">
                                                                {(
                                                                    (summaryStats.clearedStudents /
                                                                        summaryStats.totalStudents) *
                                                                    100
                                                                ).toFixed(0)}
                                                                %
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div
                                                        className="progress-bar bg-danger"
                                                        style={{
                                                            width: `${
                                                                (summaryStats.outstandingStudents /
                                                                    summaryStats.totalStudents) *
                                                                100
                                                            }%`,
                                                        }}
                                                        title={`Outstanding: ${summaryStats.outstandingStudents}`}
                                                    >
                                                        {summaryStats.outstandingStudents > 0 && (
                                                            <span className="fw-bold">
                                                                {(
                                                                    (summaryStats.outstandingStudents /
                                                                        summaryStats.totalStudents) *
                                                                    100
                                                                ).toFixed(0)}
                                                                %
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div
                                                        className="progress-bar bg-info"
                                                        style={{
                                                            width: `${
                                                                (summaryStats.overpaidStudents /
                                                                    summaryStats.totalStudents) *
                                                                100
                                                            }%`,
                                                        }}
                                                        title={`Overpaid: ${summaryStats.overpaidStudents}`}
                                                    >
                                                        {summaryStats.overpaidStudents > 0 && (
                                                            <span className="fw-bold">
                                                                {(
                                                                    (summaryStats.overpaidStudents /
                                                                        summaryStats.totalStudents) *
                                                                    100
                                                                ).toFixed(0)}
                                                                %
                                                            </span>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-center mt-3 gap-5">
                                    <div className="d-flex align-items-center">
                                        <span
                                            className="bullet bullet-dot bg-success me-2"
                                            style={{ width: "10px", height: "10px" }}
                                        ></span>
                                        Cleared ({summaryStats.clearedStudents})
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span
                                            className="bullet bullet-dot bg-danger me-2"
                                            style={{ width: "10px", height: "10px" }}
                                        ></span>
                                        Outstanding ({summaryStats.outstandingStudents})
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span
                                            className="bullet bullet-dot bg-info me-2"
                                            style={{ width: "10px", height: "10px" }}
                                        ></span>
                                        Overpaid ({summaryStats.overpaidStudents})
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Table */}
                        <div className="card">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title">Student Balances</h3>
                                <div className="card-toolbar">
                                    <span className="text-muted fs-7">
                                        {reportData.length} students found
                                    </span>
                                </div>
                            </div>
                            <div className="card-body py-3">
                                {reportData.length > 0 ? (
                                    <AGTable data={datatable} />
                                ) : (
                                    <div className="text-center py-10">
                                        <i className="fa fa-chart-bar fs-2x text-muted mb-4"></i>
                                        <p className="text-muted">No data available</p>
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

export default connect(mapStateToProps, null)(BalanceReport);
