import React, { useEffect, useState, useMemo } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";
import InvoiceDetails from "./invoice-details";
import SearchSelect from "../../../common/select/SearchSelect";

function InvoiceManagement(props) {
    const token = props.loginData[0]?.token;
    const staffID = props.loginData[0]?.StaffID;

    const [isLoading, setIsLoading] = useState(true);
    const [invoiceList, setInvoiceList] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const [filters, setFilters] = useState({
        SemesterCode: "",
        Status: "",
        SearchTerm: "",
    });

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Invoice No", field: "InvoiceNo" },
            { label: "Student", field: "Student" },
            { label: "Semester", field: "Semester" },
            { label: "Total Amount", field: "TotalAmount" },
            { label: "Amount Paid", field: "AmountPaid" },
            { label: "Balance", field: "Balance" },
            { label: "Status", field: "Status" },
            { label: "Date", field: "Date" },
            { label: "Action", field: "action" },
        ],
        rows: [],
    });

    const semesterOptions = useMemo(() => {
        return [{ value: '', label: 'All Semesters' }, ...semesterList.map(s => ({
            value: s.SemesterCode,
            label: s.SemesterName || s.SemesterCode
        }))];
    }, [semesterList]);

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'paid', label: 'Paid' },
        { value: 'partial', label: 'Partial' },
        { value: 'unpaid', label: 'Unpaid' }
    ];

    const getInvoices = async () => {
        let endpoint = "staff/ac-finance/invoices/list";
        const params = [];

        if (filters.SemesterCode) {
            params.push(`semester=${filters.SemesterCode}`);
        }
        if (filters.Status) {
            params.push(`status=${filters.Status}`);
        }
        if (filters.SearchTerm) {
            params.push(`search=${filters.SearchTerm}`);
        }

        if (params.length > 0) {
            endpoint += "?" + params.join("&");
        }

        const result = await api.get(endpoint, token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setInvoiceList(data);
            buildTable(data);
        }
        setIsLoading(false);
    };

    const buildTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            const balance = item.TotalAmount - item.AmountPaid;
            const status = balance <= 0 ? "Paid" : balance < item.TotalAmount ? "Partial" : "Unpaid";

            rows.push({
                sn: index + 1,
                InvoiceNo: (
                    <span className="fw-bold text-primary">#{item.InvoiceNumber}</span>
                ),
                Student: (
                    <div>
                        <div className="fw-bold">{item.StudentName}</div>
                        <small className="text-muted">{item.StudentID}</small>
                    </div>
                ),
                Semester: item.SemesterName || item.SemesterCode,
                TotalAmount: currencyConverter(item.TotalAmount),
                AmountPaid: (
                    <span className="text-success">{currencyConverter(item.AmountPaid)}</span>
                ),
                Balance: (
                    <span className={balance > 0 ? "text-danger fw-bold" : "text-success"}>
                        {currencyConverter(balance)}
                    </span>
                ),
                Status: (
                    <span
                        className={`badge badge-light-${status === "Paid" ? "success" : status === "Partial" ? "warning" : "danger"
                            }`}
                    >
                        {status}
                    </span>
                ),
                Date: formatDateAndTime(item.InsertedDate, "date"),
                action: (
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-light-info"
                            onClick={() => onViewDetails(item)}
                        >
                            <i className="fa fa-eye"></i> View
                        </button>
                        <button
                            className="btn btn-sm btn-light-primary"
                            onClick={() => onPrintInvoice(item)}
                        >
                            <i className="fa fa-print"></i>
                        </button>
                        {status !== "Paid" && (
                            <button
                                className="btn btn-sm btn-light-danger"
                                onClick={() => onCancelInvoice(item)}
                            >
                                <i className="fa fa-times"></i>
                            </button>
                        )}
                    </div>
                ),
            });
        });

        setDatatable({ ...datatable, rows });
    };

    const getSemesters = async () => {
        const result = await api.get("staff/registration/semester/list", token, null, {}, false);

        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setSemesterList(data);
        }
    };

    const searchStudents = async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 2) {
            setStudentList([]);
            return;
        }

        const result = await api.get(
            `staff/ac-finance/students/search?search=${searchTerm}`,
            token
        );

        if (result.success && result.data?.data) {
            setStudentList(result.data.data);
        }
    };

    const onViewDetails = (item) => {
        setSelectedInvoice(item);
    };

    const onPrintInvoice = (item) => {
        window.open(`/ac-finance/invoice/print/${item.InvoiceID}`, "_blank");
    };

    const onCancelInvoice = async (item) => {
        const confirmed = await showAlert(
            "CANCEL INVOICE",
            "Are you sure you want to cancel this invoice? This action cannot be undone.",
            "warning"
        );

        if (confirmed) {
            const result = await api.patch(
                `staff/ac-finance/invoices/cancel/${item.InvoiceID}`,
                { UpdatedBy: staffID },
                token
            );

            if (result.success && result.message === "success") {
                toast.success("Invoice cancelled successfully");
                getInvoices();
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
        getInvoices();
    };

    const clearFilters = () => {
        setFilters({
            SemesterCode: "",
            Status: "",
            SearchTerm: "",
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getInvoices(), getSemesters()]);
        };
        fetchData();
    }, []);

    if (selectedInvoice) {
        return (
            <InvoiceDetails
                invoice={selectedInvoice}
                onBack={() => {
                    setSelectedInvoice(null);
                    getInvoices();
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
                title="Invoice Management"
                items={["Human Resources", "AC-Finance", "Invoices"]}
            />

            <div className="flex-column-fluid">
                {/* Stats Cards */}
                <div className="row g-4 mb-4">
                    <div className="col-md-3">
                        <div className="card bg-light-primary">
                            <div className="card-body py-4">
                                <div className="d-flex align-items-center">
                                    <i className="fa fa-file-invoice fs-2 text-primary me-3"></i>
                                    <div>
                                        <div className="fs-3 fw-bold">{invoiceList.length}</div>
                                        <div className="text-muted small">Total Invoices</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-light-success">
                            <div className="card-body py-4">
                                <div className="d-flex align-items-center">
                                    <i className="fa fa-check-circle fs-2 text-success me-3"></i>
                                    <div>
                                        <div className="fs-3 fw-bold">
                                            {invoiceList.filter((i) => i.TotalAmount - i.AmountPaid <= 0).length}
                                        </div>
                                        <div className="text-muted small">Fully Paid</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-light-warning">
                            <div className="card-body py-4">
                                <div className="d-flex align-items-center">
                                    <i className="fa fa-clock fs-2 text-warning me-3"></i>
                                    <div>
                                        <div className="fs-3 fw-bold">
                                            {invoiceList.filter((i) => {
                                                const bal = i.TotalAmount - i.AmountPaid;
                                                return bal > 0 && bal < i.TotalAmount;
                                            }).length}
                                        </div>
                                        <div className="text-muted small">Partial</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-light-danger">
                            <div className="card-body py-4">
                                <div className="d-flex align-items-center">
                                    <i className="fa fa-exclamation-circle fs-2 text-danger me-3"></i>
                                    <div>
                                        <div className="fs-3 fw-bold">
                                            {invoiceList.filter((i) => i.AmountPaid === 0).length}
                                        </div>
                                        <div className="text-muted small">Unpaid</div>
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
                            <div className="col-md-3">
                                <label htmlFor="SearchTerm" className="form-label">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    id="SearchTerm"
                                    className="form-control form-control-solid"
                                    placeholder="Student ID or Name"
                                    value={filters.SearchTerm}
                                    onChange={onFilterChange}
                                />
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="SemesterCode" className="form-label">
                                    Semester
                                </label>
                                <SearchSelect
                                    id="SemesterCode"
                                    value={semesterOptions.find(opt => opt.value === filters.SemesterCode) || semesterOptions[0]}
                                    options={semesterOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'SemesterCode', value: selected?.value || '' } })}
                                    placeholder="All Semesters"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="Status" className="form-label">
                                    Status
                                </label>
                                <SearchSelect
                                    id="Status"
                                    value={statusOptions.find(opt => opt.value === filters.Status) || statusOptions[0]}
                                    options={statusOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'Status', value: selected?.value || '' } })}
                                    placeholder="All Status"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-3">
                                <button className="btn btn-light me-2" onClick={clearFilters}>
                                    <i className="fa fa-times me-1"></i> Clear
                                </button>
                                <button className="btn btn-primary" onClick={applyFilters}>
                                    <i className="fa fa-filter me-1"></i> Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title">
                            <span className="fw-bold fs-3">Invoices</span>
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

export default connect(mapStateToProps, null)(InvoiceManagement);
