import React, { useEffect, useState } from "react";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";

function InvoiceDetails({ invoice, onBack, loginData }) {
    const token = loginData[0]?.token;

    const [isLoading, setIsLoading] = useState(true);
    const [invoiceDetails, setInvoiceDetails] = useState(null);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [payments, setPayments] = useState([]);
    const [activeTab, setActiveTab] = useState("items");

    const [itemsDatatable, setItemsDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Description", field: "Description" },
            { label: "Category", field: "Category" },
            { label: "Amount", field: "Amount" },
        ],
        rows: [],
    });

    const [paymentsDatatable, setPaymentsDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Payment Ref", field: "PaymentRef" },
            { label: "Amount", field: "Amount" },
            { label: "Method", field: "Method" },
            { label: "Date", field: "Date" },
            { label: "Status", field: "Status" },
            { label: "Action", field: "action" },
        ],
        rows: [],
    });

    const getInvoiceDetails = async () => {
        const result = await api.get(
            `staff/ac-finance/invoices/details/${invoice.InvoiceID}`,
            token
        );

        if (result.success && result.data?.data) {
            setInvoiceDetails(result.data.data);
        }
    };

    const getInvoiceItems = async () => {
        const result = await api.get(
            `staff/ac-finance/invoices/items/${invoice.InvoiceID}`,
            token
        );

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setInvoiceItems(data);
            buildItemsTable(data);
        }
    };

    const buildItemsTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            rows.push({
                sn: index + 1,
                Description: <span className="fw-bold">{item.Description}</span>,
                Category: (
                    <span className="badge badge-light-primary">{item.Category || "General"}</span>
                ),
                Amount: currencyConverter(item.Amount),
            });
        });

        setItemsDatatable({ ...itemsDatatable, rows });
    };

    const getPayments = async () => {
        const result = await api.get(
            `staff/ac-finance/invoices/payments/${invoice.InvoiceID}`,
            token
        );

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setPayments(data);
            buildPaymentsTable(data);
        }
    };

    const buildPaymentsTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            rows.push({
                sn: index + 1,
                PaymentRef: (
                    <span className="fw-bold text-primary">{item.PaymentReference}</span>
                ),
                Amount: (
                    <span className="text-success fw-bold">{currencyConverter(item.Amount)}</span>
                ),
                Method: item.PaymentMethod || "Online",
                Date: formatDateAndTime(item.PaymentDate, "datetime"),
                Status: (
                    <span
                        className={`badge badge-light-${
                            item.Status === "Successful" ? "success" : "warning"
                        }`}
                    >
                        {item.Status || "Successful"}
                    </span>
                ),
                action: (
                    <button
                        className="btn btn-sm btn-light-primary"
                        onClick={() => printReceipt(item)}
                    >
                        <i className="fa fa-print"></i> Receipt
                    </button>
                ),
            });
        });

        setPaymentsDatatable({ ...paymentsDatatable, rows });
    };

    const printReceipt = (payment) => {
        window.open(`/ac-finance/receipt/print/${payment.PaymentID}`, "_blank");
    };

    const printInvoice = () => {
        window.open(`/ac-finance/invoice/print/${invoice.InvoiceID}`, "_blank");
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getInvoiceDetails(), getInvoiceItems(), getPayments()]);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading) return <Loader />;

    const balance = invoice.TotalAmount - invoice.AmountPaid;
    const status = balance <= 0 ? "Paid" : balance < invoice.TotalAmount ? "Partial" : "Unpaid";

    return (
        <div className="d-flex flex-column flex-row-fluid">
            {/* Back Button & Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <button className="btn btn-light-primary me-3" onClick={onBack}>
                        <i className="fa fa-arrow-left"></i>
                    </button>
                    <div>
                        <h4 className="mb-0">Invoice #{invoice.InvoiceNumber}</h4>
                        <small className="text-muted">
                            Created on {formatDateAndTime(invoice.InsertedDate, "datetime")}
                        </small>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={printInvoice}>
                    <i className="fa fa-print me-2"></i>
                    Print Invoice
                </button>
            </div>

            {/* Invoice Summary Card */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <h6 className="text-muted mb-3">Student Information</h6>
                            <div className="d-flex align-items-center mb-3">
                                <div className="symbol symbol-50px me-3">
                                    <span className="symbol-label bg-light-primary">
                                        <i className="fa fa-user fs-3 text-primary"></i>
                                    </span>
                                </div>
                                <div>
                                    <div className="fw-bold fs-5">{invoice.StudentName}</div>
                                    <div className="text-muted">{invoice.StudentID}</div>
                                </div>
                            </div>
                            <div className="row g-3">
                                <div className="col-6">
                                    <small className="text-muted d-block">Programme</small>
                                    <span>{invoiceDetails?.CourseName || "-"}</span>
                                </div>
                                <div className="col-6">
                                    <small className="text-muted d-block">Level</small>
                                    <span>{invoiceDetails?.Level || "-"}</span>
                                </div>
                                <div className="col-6">
                                    <small className="text-muted d-block">Semester</small>
                                    <span>{invoice.SemesterName || invoice.SemesterCode}</span>
                                </div>
                                <div className="col-6">
                                    <small className="text-muted d-block">Status</small>
                                    <span
                                        className={`badge badge-light-${
                                            status === "Paid"
                                                ? "success"
                                                : status === "Partial"
                                                ? "warning"
                                                : "danger"
                                        }`}
                                    >
                                        {status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <h6 className="text-muted mb-3">Payment Summary</h6>
                            <div className="bg-light rounded p-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Total Amount:</span>
                                    <span className="fw-bold fs-5">
                                        {currencyConverter(invoice.TotalAmount)}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Amount Paid:</span>
                                    <span className="text-success fw-bold fs-5">
                                        {currencyConverter(invoice.AmountPaid)}
                                    </span>
                                </div>
                                <hr className="my-2" />
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Balance:</span>
                                    <span
                                        className={`fw-bold fs-4 ${
                                            balance > 0 ? "text-danger" : "text-success"
                                        }`}
                                    >
                                        {currencyConverter(balance)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="card">
                <div className="card-header border-0 pt-5">
                    <ul className="nav nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-5 fw-bold">
                        <li className="nav-item">
                            <a
                                className={`nav-link ${activeTab === "items" ? "active" : ""}`}
                                onClick={() => setActiveTab("items")}
                                style={{ cursor: "pointer" }}
                            >
                                <i className="fa fa-list me-2"></i>
                                Invoice Items ({invoiceItems.length})
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                className={`nav-link ${activeTab === "payments" ? "active" : ""}`}
                                onClick={() => setActiveTab("payments")}
                                style={{ cursor: "pointer" }}
                            >
                                <i className="fa fa-money-bill me-2"></i>
                                Payments ({payments.length})
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="card-body py-4">
                    {activeTab === "items" ? (
                        <>
                            <AGTable data={itemsDatatable} />
                            <div className="border-top pt-3 mt-3">
                                <div className="d-flex justify-content-end">
                                    <div className="text-end">
                                        <div className="text-muted mb-1">Total</div>
                                        <div className="fs-3 fw-bold">
                                            {currencyConverter(invoice.TotalAmount)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {payments.length > 0 ? (
                                <AGTable data={paymentsDatatable} />
                            ) : (
                                <div className="text-center py-10">
                                    <i className="fa fa-money-bill fs-2x text-muted mb-4"></i>
                                    <p className="text-muted">No payments recorded yet</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Payment Timeline */}
            {payments.length > 0 && (
                <div className="card mt-4">
                    <div className="card-header border-0 pt-5">
                        <h3 className="card-title">Payment Timeline</h3>
                    </div>
                    <div className="card-body">
                        <div className="timeline">
                            {payments.map((payment, index) => (
                                <div className="timeline-item" key={index}>
                                    <div className="timeline-line w-40px"></div>
                                    <div className="timeline-icon symbol symbol-circle symbol-40px">
                                        <div className="symbol-label bg-light-success">
                                            <i className="fa fa-check text-success"></i>
                                        </div>
                                    </div>
                                    <div className="timeline-content mb-10 mt-n1">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <span className="fs-5 fw-bold text-success">
                                                    {currencyConverter(payment.Amount)}
                                                </span>
                                                <span className="text-muted ms-2">
                                                    via {payment.PaymentMethod || "Online"}
                                                </span>
                                            </div>
                                            <span className="text-muted fs-7">
                                                {formatDateAndTime(payment.PaymentDate, "datetime")}
                                            </span>
                                        </div>
                                        <div className="text-muted mt-1">
                                            Ref: {payment.PaymentReference}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InvoiceDetails;
