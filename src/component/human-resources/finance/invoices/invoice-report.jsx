import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";

function InvoiceReport(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [summaryStats, setSummaryStats] = useState({
        TotalInvoices: 0,
        TotalInvoiced: 0,
        TotalPaid: 0,
        TotalOutstanding: 0,
        PaidCount: 0,
        PartialCount: 0,
        UnpaidCount: 0,
        CancelledCount: 0,
    });

    const [filters, setFilters] = useState({
        SemesterCode: "",
        Status: "",
    });

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Invoice No", field: "InvoiceNo" },
            { label: "Student ID", field: "StudentID" },
            { label: "Student Name", field: "StudentName" },
            { label: "Total Amount", field: "TotalAmount" },
            { label: "Amount Paid", field: "AmountPaid" },
            { label: "Balance Due", field: "BalanceDue" },
            { label: "Status", field: "Status" },
            { label: "Date", field: "Date" },
        ],
        rows: [],
    });

    const semesterOptions = useMemo(() => {
        return semesterList.map(s => ({
            value: s.SemesterCode,
            label: (s.SemesterName || s.SemesterCode) + (s.IsCurrent === 1 ? ' (Current)' : '')
        }));
    }, [semesterList]);

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'paid', label: 'Paid' },
        { value: 'partial', label: 'Partial' },
        { value: 'unpaid', label: 'Unpaid' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const getReportData = async () => {
        if (!filters.SemesterCode) {
            setIsLoading(false);
            return;
        }

        let endpoint = `staff/finance/invoices/report?semester=${filters.SemesterCode}`;
        if (filters.Status) endpoint += `&status=${filters.Status}`;

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
            const status = item.Status === 'FullyPaid' ? 'Paid'
                : item.Status === 'PartiallyPaid' ? 'Partial'
                : item.Status === 'Cancelled' ? 'Cancelled'
                : 'Unpaid';

            rows.push({
                sn: index + 1,
                InvoiceNo: <span className="fw-bold text-primary">#{item.InvoiceNumber}</span>,
                StudentID: item.StudentID,
                StudentName: <span className="fw-bold">{item.StudentName}</span>,
                TotalAmount: currencyConverter(item.TotalAmount),
                AmountPaid: <span className="text-success">{currencyConverter(item.AmountPaid)}</span>,
                BalanceDue: (
                    <span className={`fw-bold text-${balance > 0 ? "danger" : "success"}`}>
                        {currencyConverter(balance)}
                    </span>
                ),
                Status: (
                    <span className={`badge badge-light-${status === "Paid" ? "success" : status === "Partial" ? "warning" : status === "Cancelled" ? "secondary" : "danger"}`}>
                        {status}
                    </span>
                ),
                Date: formatDateAndTime(item.InsertedDate, "date"),
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

    const onFilterChange = (e) => {
        setFilters({ ...filters, [e.target.id]: e.target.value });
    };

    const exportToCSV = () => {
        if (reportData.length === 0) return;

        const headers = ["Invoice No", "Student ID", "Student Name", "Total Amount", "Amount Paid", "Balance Due", "Status", "Date"];
        const rows = reportData.map(item => {
            const status = item.Status === 'FullyPaid' ? 'Paid'
                : item.Status === 'PartiallyPaid' ? 'Partial'
                : item.Status === 'Cancelled' ? 'Cancelled' : 'Unpaid';
            return [
                item.InvoiceNumber, item.StudentID, item.StudentName,
                item.TotalAmount, item.AmountPaid, item.BalanceDue,
                status, formatDateAndTime(item.InsertedDate, "date"),
            ];
        });

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice_report_${filters.SemesterCode}_${new Date().toISOString().split("T")[0]}.csv`;
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
    }, [filters.SemesterCode, filters.Status]);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Invoice Report"
                items={["Human Resources", "Finance", "Invoices", "Invoice Report"]}
            />

            <div className="flex-column-fluid">
                {/* Filters */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-4">
                                <label className="form-label required">Select Semester</label>
                                <SearchSelect
                                    id="SemesterCode"
                                    value={semesterOptions.find(opt => opt.value === filters.SemesterCode) || null}
                                    options={semesterOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'SemesterCode', value: selected?.value || '' } })}
                                    placeholder="Select Semester"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Status</label>
                                <SearchSelect
                                    id="Status"
                                    value={statusOptions.find(opt => opt.value === filters.Status) || statusOptions[0]}
                                    options={statusOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'Status', value: selected?.value || '' } })}
                                    placeholder="All Status"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-5 text-end">
                                <button
                                    className="btn btn-light-primary"
                                    onClick={exportToCSV}
                                    disabled={reportData.length === 0}
                                >
                                    <i className="fa fa-download me-2"></i>Export CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {filters.SemesterCode && (
                    <>
                        {/* Stats Cards */}
                        <div className="row g-4 mb-4">
                            <div className="col-md-3">
                                <div className="card bg-light-primary">
                                    <div className="card-body py-4">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-3">
                                                <span className="symbol-label bg-primary">
                                                    <i className="fa fa-file-invoice text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-2 fw-bold">{summaryStats.TotalInvoices || 0}</div>
                                                <div className="text-muted small">Total Invoices</div>
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
                                                    <i className="fa fa-money-bill text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-4 fw-bold">{currencyConverter(summaryStats.TotalInvoiced || 0)}</div>
                                                <div className="text-muted small">Total Invoiced</div>
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
                                                <div className="fs-4 fw-bold">{currencyConverter(summaryStats.TotalPaid || 0)}</div>
                                                <div className="text-muted small">Total Paid</div>
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
                                                    <i className="fa fa-exclamation-circle text-white fs-3"></i>
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
                        </div>

                        {/* Status Breakdown */}
                        <div className="card mb-4">
                            <div className="card-body py-3">
                                <div className="d-flex justify-content-center gap-5">
                                    <div className="d-flex align-items-center">
                                        <span className="badge badge-light-success me-2">{summaryStats.PaidCount || 0}</span> Paid
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="badge badge-light-warning me-2">{summaryStats.PartialCount || 0}</span> Partial
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="badge badge-light-danger me-2">{summaryStats.UnpaidCount || 0}</span> Unpaid
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="badge badge-light-secondary me-2">{summaryStats.CancelledCount || 0}</span> Cancelled
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Table */}
                        <div className="card">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title">Invoice Details</h3>
                                <div className="card-toolbar">
                                    <span className="text-muted fs-7">{reportData.length} invoices found</span>
                                </div>
                            </div>
                            <div className="card-body py-3">
                                {reportData.length > 0 ? (
                                    <AGTable data={datatable} />
                                ) : (
                                    <div className="text-center py-10">
                                        <i className="fa fa-file-invoice fs-2x text-muted mb-4"></i>
                                        <p className="text-muted">No invoices found for this semester</p>
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

export default connect(mapStateToProps, null)(InvoiceReport);
