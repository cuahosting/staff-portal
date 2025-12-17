import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";
import PaymentReceipt from "./payment-receipt";
import SearchSelect from "../../../common/select/SearchSelect";

function StudentPaymentHistory(props) {
    const token = props.loginData[0]?.token;

    const [isLoading, setIsLoading] = useState(true);
    const [paymentList, setPaymentList] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [summaryStats, setSummaryStats] = useState({
        totalPayments: 0,
        totalAmount: 0,
        successfulPayments: 0,
        pendingPayments: 0,
    });

    const [filters, setFilters] = useState({
        SemesterCode: "",
        SearchTerm: "",
        DateFrom: "",
        DateTo: "",
        Status: "",
    });

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Payment Ref", field: "PaymentRef" },
            { label: "Student ID", field: "StudentID" },
            { label: "Student Name", field: "StudentName" },
            { label: "Amount", field: "Amount" },
            { label: "Method", field: "Method" },
            { label: "Semester", field: "Semester" },
            { label: "Date", field: "Date" },
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

    const statusOptions = [
        { value: '', label: 'All' },
        { value: 'Successful', label: 'Successful' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Failed', label: 'Failed' }
    ];

    const getPayments = async () => {
        let endpoint = "staff/ac-finance/payments/history";
        const params = [];

        if (filters.SemesterCode) params.push(`semester=${filters.SemesterCode}`);
        if (filters.SearchTerm) params.push(`search=${filters.SearchTerm}`);
        if (filters.DateFrom) params.push(`dateFrom=${filters.DateFrom}`);
        if (filters.DateTo) params.push(`dateTo=${filters.DateTo}`);
        if (filters.Status) params.push(`status=${filters.Status}`);

        if (params.length > 0) {
            endpoint += "?" + params.join("&");
        }

        const result = await api.get(endpoint, token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setPaymentList(data);
            buildTable(data);
            calculateStats(data);
        }
        setIsLoading(false);
    };

    const buildTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            rows.push({
                sn: index + 1,
                PaymentRef: (
                    <span className="fw-bold text-primary">{item.PaymentReference}</span>
                ),
                StudentID: item.StudentID,
                StudentName: <span className="fw-bold">{item.StudentName}</span>,
                Amount: (
                    <span className="text-success fw-bold">
                        {currencyConverter(item.Amount)}
                    </span>
                ),
                Method: (
                    <span className="badge badge-light-info">
                        {item.PaymentMethod || "Online"}
                    </span>
                ),
                Semester: item.SemesterName || item.SemesterCode || "-",
                Date: formatDateAndTime(item.PaymentDate, "datetime"),
                Status: (
                    <span
                        className={`badge badge-light-${item.Status === "Successful" || item.Status === "success"
                                ? "success"
                                : item.Status === "Pending"
                                    ? "warning"
                                    : "danger"
                            }`}
                    >
                        {item.Status || "Successful"}
                    </span>
                ),
                action: (
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-light-info"
                            onClick={() => viewDetails(item)}
                            title="View Details"
                        >
                            <i className="fa fa-eye"></i>
                        </button>
                        <button
                            className="btn btn-sm btn-light-primary"
                            onClick={() => printReceipt(item)}
                            title="Print Receipt"
                        >
                            <i className="fa fa-print"></i>
                        </button>
                    </div>
                ),
            });
        });

        setDatatable({ ...datatable, rows });
    };

    const calculateStats = (data) => {
        const successful = data.filter(
            (p) => p.Status === "Successful" || p.Status === "success"
        );
        const pending = data.filter((p) => p.Status === "Pending");
        const totalAmount = successful.reduce((sum, p) => sum + p.Amount, 0);

        setSummaryStats({
            totalPayments: data.length,
            totalAmount: totalAmount,
            successfulPayments: successful.length,
            pendingPayments: pending.length,
        });
    };

    const getSemesters = async () => {
        const result = await api.get("staff/registration/semester/list", token, null, {}, false);

        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setSemesterList(data);
        }
    };

    const viewDetails = (item) => {
        setSelectedPayment(item);
    };

    const printReceipt = (item) => {
        setSelectedPayment(item);
        setShowReceipt(true);
    };

    const onFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.id]: e.target.value,
        });
    };

    const applyFilters = () => {
        getPayments();
    };

    const clearFilters = () => {
        setFilters({
            SemesterCode: "",
            SearchTerm: "",
            DateFrom: "",
            DateTo: "",
            Status: "",
        });
    };

    const exportToCSV = () => {
        if (paymentList.length === 0) return;

        const headers = [
            "Payment Ref",
            "Student ID",
            "Student Name",
            "Amount",
            "Method",
            "Semester",
            "Date",
            "Status",
        ];

        const rows = paymentList.map((item) => [
            item.PaymentReference,
            item.StudentID,
            item.StudentName,
            item.Amount,
            item.PaymentMethod || "Online",
            item.SemesterName || item.SemesterCode || "-",
            formatDateAndTime(item.PaymentDate, "datetime"),
            item.Status || "Successful",
        ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payment_history_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getPayments(), getSemesters()]);
        };
        fetchData();
    }, []);

    if (showReceipt && selectedPayment) {
        return (
            <PaymentReceipt
                payment={selectedPayment}
                onBack={() => {
                    setShowReceipt(false);
                    setSelectedPayment(null);
                }}
                {...props}
            />
        );
    }

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Payment History"
                items={["Human Resources", "AC-Finance", "Payment History"]}
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
                                            <i className="fa fa-receipt text-white fs-3"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="fs-2 fw-bold">{summaryStats.totalPayments}</div>
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
                                            <i className="fa fa-naira-sign text-white fs-3"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="fs-2 fw-bold">
                                            {currencyConverter(summaryStats.totalAmount)}
                                        </div>
                                        <div className="text-muted small">Total Amount</div>
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
                                            <i className="fa fa-check-circle text-white fs-3"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="fs-2 fw-bold">{summaryStats.successfulPayments}</div>
                                        <div className="text-muted small">Successful</div>
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
                                            <i className="fa fa-clock text-white fs-3"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="fs-2 fw-bold">{summaryStats.pendingPayments}</div>
                                        <div className="text-muted small">Pending</div>
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
                                    placeholder="ID, Name or Ref"
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
                                <label htmlFor="DateFrom" className="form-label">
                                    Date From
                                </label>
                                <input
                                    type="date"
                                    id="DateFrom"
                                    className="form-control form-control-solid"
                                    value={filters.DateFrom}
                                    onChange={onFilterChange}
                                />
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="DateTo" className="form-label">
                                    Date To
                                </label>
                                <input
                                    type="date"
                                    id="DateTo"
                                    className="form-control form-control-solid"
                                    value={filters.DateTo}
                                    onChange={onFilterChange}
                                />
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="Status" className="form-label">
                                    Status
                                </label>
                                <SearchSelect
                                    id="Status"
                                    value={statusOptions.find(opt => opt.value === filters.Status) || statusOptions[0]}
                                    options={statusOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'Status', value: selected?.value || '' } })}
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

                {/* Payment Table */}
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title">
                            <span className="fw-bold fs-3">Payments</span>
                            <span className="text-muted ms-3 fs-7">
                                {paymentList.length} records
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

                {/* Payment Details Modal */}
                {selectedPayment && !showReceipt && (
                    <div
                        className="modal fade show d-block"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Payment Details</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setSelectedPayment(null)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="bg-light rounded p-4">
                                                <h6 className="text-muted mb-3">Payment Information</h6>
                                                <div className="mb-2">
                                                    <small className="text-muted">Reference</small>
                                                    <div className="fw-bold">
                                                        {selectedPayment.PaymentReference}
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <small className="text-muted">Amount</small>
                                                    <div className="fw-bold text-success fs-4">
                                                        {currencyConverter(selectedPayment.Amount)}
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <small className="text-muted">Method</small>
                                                    <div>{selectedPayment.PaymentMethod || "Online"}</div>
                                                </div>
                                                <div className="mb-2">
                                                    <small className="text-muted">Date</small>
                                                    <div>
                                                        {formatDateAndTime(
                                                            selectedPayment.PaymentDate,
                                                            "datetime"
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <small className="text-muted">Status</small>
                                                    <div>
                                                        <span
                                                            className={`badge badge-light-${selectedPayment.Status === "Successful" ||
                                                                    selectedPayment.Status === "success"
                                                                    ? "success"
                                                                    : "warning"
                                                                }`}
                                                        >
                                                            {selectedPayment.Status || "Successful"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="bg-light rounded p-4">
                                                <h6 className="text-muted mb-3">Student Information</h6>
                                                <div className="mb-2">
                                                    <small className="text-muted">Student ID</small>
                                                    <div className="fw-bold">
                                                        {selectedPayment.StudentID}
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <small className="text-muted">Full Name</small>
                                                    <div className="fw-bold">
                                                        {selectedPayment.StudentName}
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <small className="text-muted">Programme</small>
                                                    <div>{selectedPayment.CourseName || "-"}</div>
                                                </div>
                                                <div>
                                                    <small className="text-muted">Semester</small>
                                                    <div>
                                                        {selectedPayment.SemesterName ||
                                                            selectedPayment.SemesterCode ||
                                                            "-"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={() => setSelectedPayment(null)}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => printReceipt(selectedPayment)}
                                    >
                                        <i className="fa fa-print me-2"></i>
                                        Print Receipt
                                    </button>
                                </div>
                            </div>
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

export default connect(mapStateToProps, null)(StudentPaymentHistory);
