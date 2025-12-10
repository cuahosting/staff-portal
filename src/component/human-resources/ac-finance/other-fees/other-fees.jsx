import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";

function OtherFees(props) {
    const token = props.loginData[0]?.token;
    const staffID = props.loginData[0]?.StaffID;

    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("feeTypes");

    // Fee Types State
    const [feeTypeList, setFeeTypeList] = useState([]);
    const [feeTypeDatatable, setFeeTypeDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Action", field: "action" },
            { label: "Name", field: "Name" },
            { label: "Description", field: "Description" },
            { label: "Default Amount", field: "DefaultAmount" },
            { label: "Category", field: "Category" },
            { label: "Status", field: "Status" },
        ],
        rows: [],
    });

    const [feeTypeForm, setFeeTypeForm] = useState({
        Name: "",
        Description: "",
        DefaultAmount: "",
        Category: "",
        InsertedBy: staffID,
        EntryID: "",
    });

    // Invoices State
    const [invoiceList, setInvoiceList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [invoiceDatatable, setInvoiceDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Action", field: "action" },
            { label: "Invoice #", field: "InvoiceNo" },
            { label: "Student", field: "Student" },
            { label: "Description", field: "Description" },
            { label: "Total Amount", field: "TotalAmount" },
            { label: "Paid", field: "PaidAmount" },
            { label: "Outstanding", field: "Outstanding" },
            { label: "Status", field: "Status" },
            { label: "Date", field: "Date" },
        ],
        rows: [],
    });

    const [invoiceForm, setInvoiceForm] = useState({
        StudentID: "",
        Description: "",
        DueDate: "",
        Items: [],
        InsertedBy: staffID,
    });

    const [invoiceItems, setInvoiceItems] = useState([]);
    const [newItem, setNewItem] = useState({
        FeeID: "",
        Amount: "",
        Description: "",
    });

    const categoryOptions = [
        "Transcript",
        "Certificate",
        "Verification",
        "Clearance",
        "ID Card",
        "Result",
        "Replacement",
        "Late Registration",
        "Other",
    ];

    // Reset Forms
    const resetFeeTypeForm = () => {
        setFeeTypeForm({
            Name: "",
            Description: "",
            DefaultAmount: "",
            Category: "",
            InsertedBy: staffID,
            EntryID: "",
        });
    };

    const resetInvoiceForm = () => {
        setInvoiceForm({
            StudentID: "",
            Description: "",
            DueDate: "",
            Items: [],
            InsertedBy: staffID,
        });
        setInvoiceItems([]);
        setSelectedStudent(null);
        setNewItem({ FeeID: "", Amount: "", Description: "" });
    };

    // Fetch Data
    const getFeeTypes = async () => {
        const result = await api.get("staff/ac-finance/other-fees/list", token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setFeeTypeList(data);

            let rows = [];
            data.forEach((item, index) => {
                rows.push({
                    sn: index + 1,
                    Name: item.Name,
                    Description: item.Description || "-",
                    DefaultAmount: currencyConverter(item.DefaultAmount),
                    Category: (
                        <span className="badge badge-light-info">{item.Category || "N/A"}</span>
                    ),
                    Status: item.IsActive === 1 ? (
                        <span className="badge badge-light-success">Active</span>
                    ) : (
                        <span className="badge badge-light-danger">Inactive</span>
                    ),
                    action: (
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-sm btn-light-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_fee_type"
                                onClick={() => onEditFeeType(item)}
                            >
                                <i className="fa fa-edit"></i>
                            </button>
                            <button
                                className="btn btn-sm btn-light-danger"
                                onClick={() => onDeleteFeeType(item)}
                            >
                                <i className="fa fa-trash"></i>
                            </button>
                        </div>
                    ),
                });
            });

            setFeeTypeDatatable({ ...feeTypeDatatable, rows });
        }
    };

    const getInvoices = async () => {
        const result = await api.get("staff/ac-finance/other-fees/invoices/list", token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setInvoiceList(data);

            let rows = [];
            data.forEach((item, index) => {
                const outstanding = (item.TotalAmount || 0) - (item.PaidAmount || 0);
                rows.push({
                    sn: index + 1,
                    InvoiceNo: item.InvoiceNo || `OTH-${item.OtherFeeInvoiceID}`,
                    Student: (
                        <div>
                            <span className="fw-bold">{item.StudentName || item.StudentID}</span>
                            <br />
                            <small className="text-muted">{item.StudentID}</small>
                        </div>
                    ),
                    Description: item.Description || "-",
                    TotalAmount: currencyConverter(item.TotalAmount),
                    PaidAmount: (
                        <span className="text-success">{currencyConverter(item.PaidAmount || 0)}</span>
                    ),
                    Outstanding: (
                        <span className={outstanding > 0 ? "text-danger" : "text-success"}>
                            {currencyConverter(outstanding)}
                        </span>
                    ),
                    Status: getStatusBadge(item.Status),
                    Date: formatDateAndTime(item.InsertedDate, "date"),
                    action: (
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-sm btn-light-info"
                                onClick={() => viewInvoiceDetails(item)}
                            >
                                <i className="fa fa-eye"></i> View
                            </button>
                        </div>
                    ),
                });
            });

            setInvoiceDatatable({ ...invoiceDatatable, rows });
        }
    };

    const getStudents = async () => {
        const result = await api.get("staff/student/student-manager/student/list", token, null, {}, false);

        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            const options = data.map((student) => ({
                value: student.StudentID,
                label: `${student.StudentID} - ${student.FirstName} ${student.MiddleName || ''} ${student.Surname}`,
                ...student,
            }));
            setStudentList(options);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Paid":
                return <span className="badge badge-light-success">Paid</span>;
            case "Partial":
                return <span className="badge badge-light-warning">Partial</span>;
            case "Cancelled":
                return <span className="badge badge-light-danger">Cancelled</span>;
            default:
                return <span className="badge badge-light-primary">Pending</span>;
        }
    };

    // Fee Type Actions
    const onEditFeeType = (item) => {
        setFeeTypeForm({
            Name: item.Name,
            Description: item.Description || "",
            DefaultAmount: item.DefaultAmount,
            Category: item.Category || "",
            InsertedBy: staffID,
            EntryID: item.OtherFeeID,
        });
    };

    const onDeleteFeeType = async (item) => {
        const confirmed = await showAlert(
            "DELETE CONFIRMATION",
            "Are you sure you want to delete this fee type?",
            "warning"
        );

        if (confirmed) {
            const result = await api.delete(
                `staff/ac-finance/other-fees/delete/${item.OtherFeeID}`,
                token,
                { UpdatedBy: staffID }
            );

            if (result.success && result.message === "success") {
                toast.success("Fee type deleted successfully");
                getFeeTypes();
            }
        }
    };

    const onFeeTypeEdit = (e) => {
        setFeeTypeForm({
            ...feeTypeForm,
            [e.target.id]: e.target.value,
        });
    };

    const onFeeTypeSubmit = async () => {
        if (feeTypeForm.Name.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the fee name", "error");
            return;
        }
        if (feeTypeForm.DefaultAmount === "" || parseFloat(feeTypeForm.DefaultAmount) < 0) {
            showAlert("INVALID AMOUNT", "Please enter a valid default amount", "error");
            return;
        }

        const payload = {
            ...feeTypeForm,
            DefaultAmount: parseFloat(feeTypeForm.DefaultAmount),
        };

        if (feeTypeForm.EntryID === "") {
            const result = await api.post("staff/ac-finance/other-fees/add", payload, token);

            if (result.success && result.message === "success") {
                toast.success("Fee type added successfully");
                document.getElementById("closeFeeTypeModal").click();
                resetFeeTypeForm();
                getFeeTypes();
            } else if (result.message === "exist") {
                showAlert("DUPLICATE", "A fee type with this name already exists", "error");
            }
        } else {
            const result = await api.patch(
                `staff/ac-finance/other-fees/update/${feeTypeForm.EntryID}`,
                { ...payload, UpdatedBy: staffID },
                token
            );

            if (result.success && result.message === "success") {
                toast.success("Fee type updated successfully");
                document.getElementById("closeFeeTypeModal").click();
                resetFeeTypeForm();
                getFeeTypes();
            }
        }
    };

    // Invoice Actions
    const viewInvoiceDetails = (item) => {
        // Navigate to invoice details or show modal
        window.open(`/human-resources/ac-finance/invoices/${item.OtherFeeInvoiceID}?type=other`, "_blank");
    };

    const onStudentSelect = (selected) => {
        setSelectedStudent(selected);
        setInvoiceForm({
            ...invoiceForm,
            StudentID: selected?.value || "",
        });
    };

    const addInvoiceItem = () => {
        if (!newItem.FeeID) {
            showAlert("ERROR", "Please select a fee type", "error");
            return;
        }
        if (!newItem.Amount || parseFloat(newItem.Amount) <= 0) {
            showAlert("ERROR", "Please enter a valid amount", "error");
            return;
        }

        const selectedFee = feeTypeList.find((f) => f.OtherFeeID === parseInt(newItem.FeeID));
        const item = {
            FeeID: newItem.FeeID,
            FeeName: selectedFee?.Name || "",
            Amount: parseFloat(newItem.Amount),
            Description: newItem.Description || selectedFee?.Name,
        };

        setInvoiceItems([...invoiceItems, item]);
        setNewItem({ FeeID: "", Amount: "", Description: "" });
    };

    const removeInvoiceItem = (index) => {
        const items = [...invoiceItems];
        items.splice(index, 1);
        setInvoiceItems(items);
    };

    const calculateInvoiceTotal = () => {
        return invoiceItems.reduce((total, item) => total + item.Amount, 0);
    };

    const onInvoiceSubmit = async () => {
        if (!invoiceForm.StudentID) {
            showAlert("ERROR", "Please select a student", "error");
            return;
        }
        if (invoiceItems.length === 0) {
            showAlert("ERROR", "Please add at least one item to the invoice", "error");
            return;
        }

        const payload = {
            StudentID: invoiceForm.StudentID,
            Description: invoiceForm.Description,
            DueDate: invoiceForm.DueDate,
            Items: invoiceItems.map((item) => ({
                FeeID: item.FeeID,
                Amount: item.Amount,
                Description: item.Description,
            })),
            InsertedBy: staffID,
        };

        const result = await api.post("staff/ac-finance/other-fees/invoices/create", payload, token);

        if (result.success && result.message === "success") {
            toast.success("Invoice created successfully");
            document.getElementById("closeInvoiceModal").click();
            resetInvoiceForm();
            getInvoices();
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getFeeTypes(), getInvoices(), getStudents()]);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Other Fees"
                items={["Human Resources", "AC-Finance", "Other Fees"]}
            />

            <div className="flex-column-fluid">
                <div className="card">
                    {/* Tab Navigation */}
                    <div className="card-header border-0 pt-6">
                        <ul className="nav nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-5 fw-bold">
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${activeTab === "feeTypes" ? "active" : ""}`}
                                    onClick={() => setActiveTab("feeTypes")}
                                    style={{ cursor: "pointer" }}
                                >
                                    <i className="fa fa-list me-2"></i>
                                    Fee Types
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${activeTab === "invoices" ? "active" : ""}`}
                                    onClick={() => setActiveTab("invoices")}
                                    style={{ cursor: "pointer" }}
                                >
                                    <i className="fa fa-file-invoice me-2"></i>
                                    Invoices
                                </a>
                            </li>
                        </ul>
                        <div className="card-toolbar">
                            {activeTab === "feeTypes" && (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_fee_type"
                                    onClick={resetFeeTypeForm}
                                >
                                    <i className="fa fa-plus me-2"></i>
                                    Add Fee Type
                                </button>
                            )}
                            {activeTab === "invoices" && (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_invoice"
                                    onClick={resetInvoiceForm}
                                >
                                    <i className="fa fa-plus me-2"></i>
                                    Create Invoice
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="card-body py-4">
                        {activeTab === "feeTypes" && <AGTable data={feeTypeDatatable} />}
                        {activeTab === "invoices" && <AGTable data={invoiceDatatable} />}
                    </div>
                </div>

                {/* Fee Type Modal */}
                <div className="modal fade" id="kt_modal_fee_type" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {feeTypeForm.EntryID ? "Edit Fee Type" : "Add Fee Type"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    id="closeFeeTypeModal"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group mb-4">
                                    <label htmlFor="Name" className="required form-label">
                                        Fee Name
                                    </label>
                                    <input
                                        type="text"
                                        id="Name"
                                        onChange={onFeeTypeEdit}
                                        value={feeTypeForm.Name}
                                        className="form-control form-control-solid"
                                        placeholder="Enter fee name"
                                    />
                                </div>

                                <div className="form-group mb-4">
                                    <label htmlFor="Description" className="form-label">
                                        Description
                                    </label>
                                    <textarea
                                        id="Description"
                                        onChange={onFeeTypeEdit}
                                        value={feeTypeForm.Description}
                                        className="form-control form-control-solid"
                                        placeholder="Enter description"
                                        rows="2"
                                    />
                                </div>

                                <div className="form-group mb-4">
                                    <label htmlFor="DefaultAmount" className="required form-label">
                                        Default Amount
                                    </label>
                                    <input
                                        type="number"
                                        id="DefaultAmount"
                                        onChange={onFeeTypeEdit}
                                        value={feeTypeForm.DefaultAmount}
                                        className="form-control form-control-solid"
                                        placeholder="Enter default amount"
                                        min="0"
                                    />
                                </div>

                                <div className="form-group mb-4">
                                    <label htmlFor="Category" className="form-label">
                                        Category
                                    </label>
                                    <select
                                        id="Category"
                                        onChange={onFeeTypeEdit}
                                        value={feeTypeForm.Category}
                                        className="form-select form-select-solid"
                                    >
                                        <option value="">Select Category</option>
                                        {categoryOptions.map((cat, index) => (
                                            <option key={index} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={onFeeTypeSubmit}
                                >
                                    {feeTypeForm.EntryID ? "Update" : "Add"} Fee Type
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Modal */}
                <div className="modal fade" id="kt_modal_invoice" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Other Fee Invoice</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    id="closeInvoiceModal"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-8 mb-4">
                                        <label className="required form-label">Select Student</label>
                                        <SearchSelect
                                            options={studentList}
                                            value={selectedStudent}
                                            onChange={onStudentSelect}
                                            placeholder="Search student by ID or name..."
                                            isClearable
                                        />
                                    </div>
                                    <div className="col-md-4 mb-4">
                                        <label className="form-label">Due Date</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-solid"
                                            value={invoiceForm.DueDate}
                                            onChange={(e) =>
                                                setInvoiceForm({ ...invoiceForm, DueDate: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="form-group mb-4">
                                    <label className="form-label">Invoice Description</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-solid"
                                        placeholder="Enter invoice description (optional)"
                                        value={invoiceForm.Description}
                                        onChange={(e) =>
                                            setInvoiceForm({ ...invoiceForm, Description: e.target.value })
                                        }
                                    />
                                </div>

                                <hr />

                                <h6 className="mb-3">Invoice Items</h6>

                                {/* Add Item Row */}
                                <div className="row mb-3">
                                    <div className="col-md-4">
                                        <select
                                            className="form-select form-select-solid"
                                            value={newItem.FeeID}
                                            onChange={(e) => {
                                                const fee = feeTypeList.find(
                                                    (f) => f.OtherFeeID === parseInt(e.target.value)
                                                );
                                                setNewItem({
                                                    ...newItem,
                                                    FeeID: e.target.value,
                                                    Amount: fee?.DefaultAmount || "",
                                                    Description: fee?.Name || "",
                                                });
                                            }}
                                        >
                                            <option value="">Select Fee Type</option>
                                            {feeTypeList
                                                .filter((f) => f.IsActive === 1)
                                                .map((fee) => (
                                                    <option key={fee.OtherFeeID} value={fee.OtherFeeID}>
                                                        {fee.Name} ({currencyConverter(fee.DefaultAmount)})
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <input
                                            type="number"
                                            className="form-control form-control-solid"
                                            placeholder="Amount"
                                            value={newItem.Amount}
                                            onChange={(e) =>
                                                setNewItem({ ...newItem, Amount: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <input
                                            type="text"
                                            className="form-control form-control-solid"
                                            placeholder="Description"
                                            value={newItem.Description}
                                            onChange={(e) =>
                                                setNewItem({ ...newItem, Description: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <button
                                            type="button"
                                            className="btn btn-light-primary w-100"
                                            onClick={addInvoiceItem}
                                        >
                                            <i className="fa fa-plus"></i> Add
                                        </button>
                                    </div>
                                </div>

                                {/* Items List */}
                                {invoiceItems.length > 0 && (
                                    <div className="table-responsive">
                                        <table className="table table-row-bordered">
                                            <thead>
                                                <tr className="fw-bold text-muted">
                                                    <th>Fee Type</th>
                                                    <th>Description</th>
                                                    <th className="text-end">Amount</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoiceItems.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.FeeName}</td>
                                                        <td>{item.Description}</td>
                                                        <td className="text-end">
                                                            {currencyConverter(item.Amount)}
                                                        </td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-light-danger"
                                                                onClick={() => removeInvoiceItem(index)}
                                                            >
                                                                <i className="fa fa-times"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="fw-bold">
                                                    <td colSpan="2" className="text-end">
                                                        Total:
                                                    </td>
                                                    <td className="text-end text-primary">
                                                        {currencyConverter(calculateInvoiceTotal())}
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={onInvoiceSubmit}
                                    disabled={invoiceItems.length === 0}
                                >
                                    Create Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(OtherFees);
