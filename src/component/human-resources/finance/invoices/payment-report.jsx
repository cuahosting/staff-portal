import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";

function PaymentReport(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [byMethod, setByMethod] = useState([]);
    const [summaryStats, setSummaryStats] = useState({
        TotalPayments: 0,
        TotalCollected: 0,
        AveragePayment: 0,
        InvoicesWithPayments: 0,
    });

    const [filters, setFilters] = useState({
        SemesterCode: "",
        PaymentMethod: "",
    });

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Receipt No", field: "ReceiptNo" },
            { label: "Student ID", field: "StudentID" },
            { label: "Student Name", field: "StudentName" },
            { label: "Invoice No", field: "InvoiceNo" },
            { label: "Amount", field: "Amount" },
            { label: "Payment Method", field: "PaymentMethod" },
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

    const methodOptions = useMemo(() => {
        const methods = byMethod.map(m => ({
            value: m.PaymentMethod,
            label: m.PaymentMethod || 'Unknown',
        }));
        return [{ value: '', label: 'All Methods' }, ...methods];
    }, [byMethod]);

    const getReportData = async () => {
        if (!filters.SemesterCode) {
            setIsLoading(false);
            return;
        }

        let endpoint = `staff/finance/invoices/payment-report?semester=${filters.SemesterCode}`;
        if (filters.PaymentMethod) endpoint += `&method=${filters.PaymentMethod}`;

        const result = await api.get(endpoint);

        if (result.success && result.data?.data) {
            const { summary, byMethod: methods, rows } = result.data.data;
            setSummaryStats(summary || {});
            setByMethod(methods || []);
            setReportData(rows || []);
            buildTable(rows || []);
        }
        setIsLoading(false);
    };

    const buildTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            rows.push({
                sn: index + 1,
                ReceiptNo: <span className="fw-bold text-primary">{item.ReceiptNumber || '-'}</span>,
                StudentID: item.StudentID,
                StudentName: <span className="fw-bold">{item.StudentName}</span>,
                InvoiceNo: <span className="text-muted">#{item.InvoiceNumber}</span>,
                Amount: <span className="text-success fw-bold">{currencyConverter(item.Amount)}</span>,
                PaymentMethod: (
                    <span className="badge badge-light-info">{item.PaymentMethod || 'N/A'}</span>
                ),
                Date: formatDateAndTime(item.PaidAt, "date"),
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

        const headers = ["Receipt No", "Student ID", "Student Name", "Invoice No", "Amount", "Payment Method", "Date"];
        const rows = reportData.map(item => [
            item.ReceiptNumber || '-', item.StudentID, item.StudentName,
            item.InvoiceNumber, item.Amount, item.PaymentMethod || 'N/A',
            formatDateAndTime(item.PaidAt, "date"),
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payment_report_${filters.SemesterCode}_${new Date().toISOString().split("T")[0]}.csv`;
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
    }, [filters.SemesterCode, filters.PaymentMethod]);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Payment Report"
                items={["Human Resources", "Finance", "Invoices", "Payment Report"]}
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
                                <label className="form-label">Payment Method</label>
                                <SearchSelect
                                    id="PaymentMethod"
                                    value={methodOptions.find(opt => opt.value === filters.PaymentMethod) || methodOptions[0]}
                                    options={methodOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'PaymentMethod', value: selected?.value || '' } })}
                                    placeholder="All Methods"
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
                                                    <i className="fa fa-receipt text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-2 fw-bold">{summaryStats.TotalPayments || 0}</div>
                                                <div className="text-muted small">Total Payments</div>
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
                                                    <i className="fa fa-money-bill-wave text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-4 fw-bold">{currencyConverter(summaryStats.TotalCollected || 0)}</div>
                                                <div className="text-muted small">Total Collected</div>
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
                                                <div className="fs-4 fw-bold">{currencyConverter(summaryStats.AveragePayment || 0)}</div>
                                                <div className="text-muted small">Average Payment</div>
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
                                                    <i className="fa fa-file-invoice text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-2 fw-bold">{summaryStats.InvoicesWithPayments || 0}</div>
                                                <div className="text-muted small">Invoices Paid</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Breakdown */}
                        {byMethod.length > 0 && (
                            <div className="card mb-4">
                                <div className="card-header border-0 pt-5">
                                    <h3 className="card-title">Payment Method Breakdown</h3>
                                </div>
                                <div className="card-body py-3">
                                    <div className="d-flex flex-wrap gap-4 justify-content-center">
                                        {byMethod.map((m, i) => (
                                            <div key={i} className="border rounded p-3 text-center" style={{ minWidth: 150 }}>
                                                <div className="fs-4 fw-bold text-primary">{currencyConverter(m.Total)}</div>
                                                <div className="text-muted small">{m.PaymentMethod || 'Unknown'}</div>
                                                <span className="badge badge-light-primary mt-1">{m.Count} payments</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Report Table */}
                        <div className="card">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title">Payment Details</h3>
                                <div className="card-toolbar">
                                    <span className="text-muted fs-7">{reportData.length} payments found</span>
                                </div>
                            </div>
                            <div className="card-body py-3">
                                {reportData.length > 0 ? (
                                    <AGTable data={datatable} />
                                ) : (
                                    <div className="text-center py-10">
                                        <i className="fa fa-receipt fs-2x text-muted mb-4"></i>
                                        <p className="text-muted">No payments found for this semester</p>
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

export default connect(mapStateToProps, null)(PaymentReport);
