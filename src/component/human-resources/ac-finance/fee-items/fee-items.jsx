import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { currencyConverter } from "../../../../resources/constants";
import { connect } from "react-redux";

function FeeItems(props) {
    const token = props.loginData[0]?.token;
    const staffID = props.loginData[0]?.StaffID;

    const [isLoading, setIsLoading] = useState(true);
    const [feeItemList, setFeeItemList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Action", field: "action" },
            { label: "Name", field: "Name" },
            { label: "Description", field: "Description" },
            { label: "Amount", field: "Amount" },
            { label: "Category", field: "Category" },
            { label: "Status", field: "Status" },
        ],
        rows: [],
    });

    const [formData, setFormData] = useState({
        Name: "",
        Description: "",
        Amount: "",
        Category: "",
        InsertedBy: staffID,
        EntryID: "",
    });

    const categoryOptions = [
        "Tuition",
        "Hostel",
        "Feeding",
        "Medical",
        "Administrative",
        "Examination",
        "Laboratory",
        "Library",
        "Sports",
        "ICT",
        "Development",
        "Other",
    ];

    const resetForm = () => {
        setFormData({
            Name: "",
            Description: "",
            Amount: "",
            Category: "",
            InsertedBy: staffID,
            EntryID: "",
        });
    };

    const getRecords = async () => {
        const result = await api.get("staff/ac-finance/fee-items/list", token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setFeeItemList(data);

            // Extract unique categories
            const uniqueCategories = [...new Set(data.map((item) => item.Category).filter(Boolean))];
            setCategories(uniqueCategories);

            // Build table rows
            let rows = [];
            data.forEach((item, index) => {
                rows.push({
                    sn: index + 1,
                    Name: item.Name,
                    Description: item.Description || "-",
                    Amount: currencyConverter(item.Amount),
                    Category: (
                        <span className="badge badge-light-primary">{item.Category || "N/A"}</span>
                    ),
                    Status: item.IsActive === 1 ? (
                        <span className="badge badge-light-success">Active</span>
                    ) : (
                        <span className="badge badge-light-danger">Inactive</span>
                    ),
                    action: (
                        <div className="d-flex gap-1">
                            <button
                                className="btn btn-icon btn-sm btn-light-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_general"
                                onClick={() => onEditClick(item)}
                                title="Edit"
                            >
                                <i className="fa fa-edit"></i>
                            </button>
                            <button
                                className={`btn btn-icon btn-sm ${item.IsActive === 1 ? 'btn-light-warning' : 'btn-light-success'}`}
                                onClick={() => onToggleStatus(item)}
                                title={item.IsActive === 1 ? 'Deactivate' : 'Activate'}
                            >
                                <i className={`fa ${item.IsActive === 1 ? 'fa-ban' : 'fa-check'}`}></i>
                            </button>
                            <button
                                className="btn btn-icon btn-sm btn-light-danger"
                                onClick={() => onDeleteClick(item)}
                                title="Delete"
                            >
                                <i className="fa fa-trash"></i>
                            </button>
                        </div>
                    ),
                });
            });

            setDatatable({ ...datatable, rows });
        }
        setIsLoading(false);
    };

    const onEditClick = (item) => {
        setFormData({
            Name: item.Name,
            Description: item.Description || "",
            Amount: item.Amount,
            Category: item.Category || "",
            InsertedBy: staffID,
            EntryID: item.FeeItemID,
        });
    };

    const onToggleStatus = async (item) => {
        const action = item.IsActive === 1 ? "deactivate" : "activate";
        const confirmed = await showAlert(
            "CONFIRM",
            `Are you sure you want to ${action} this fee item?`,
            "warning"
        );

        if (confirmed) {
            const result = await api.patch(
                `staff/ac-finance/fee-items/update/${item.FeeItemID}`,
                { IsActive: item.IsActive === 1 ? 0 : 1, UpdatedBy: staffID },
                token
            );

            if (result.success && result.message === "success") {
                toast.success(`Fee item ${action}d successfully`);
                getRecords();
            }
        }
    };

    const onDeleteClick = async (item) => {
        const confirmed = await showAlert(
            "DELETE CONFIRMATION",
            "Are you sure you want to delete this fee item? This action cannot be undone.",
            "warning"
        );

        if (confirmed) {
            const result = await api.delete(
                `staff/ac-finance/fee-items/delete/${item.FeeItemID}`,
                token,
                { UpdatedBy: staffID }
            );

            if (result.success && result.message === "success") {
                toast.success("Fee item deleted successfully");
                getRecords();
            }
        }
    };

    const onEdit = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmit = async () => {
        // Validation
        if (formData.Name.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the fee item name", "error");
            return;
        }
        if (formData.Amount === "" || parseFloat(formData.Amount) < 0) {
            showAlert("INVALID AMOUNT", "Please enter a valid amount", "error");
            return;
        }
        if (formData.Category.trim() === "") {
            showAlert("EMPTY FIELD", "Please select a category", "error");
            return;
        }

        const payload = {
            ...formData,
            Amount: parseFloat(formData.Amount),
        };

        if (formData.EntryID === "") {
            // Create new
            const result = await api.post("staff/ac-finance/fee-items/add", payload, token);

            if (result.success) {
                if (result.message === "success") {
                    toast.success("Fee item added successfully");
                    document.getElementById("closeModal").click();
                    resetForm();
                    getRecords();
                } else if (result.message === "exist") {
                    showAlert("DUPLICATE", "A fee item with this name already exists", "error");
                }
            }
        } else {
            // Update existing
            const result = await api.patch(
                `staff/ac-finance/fee-items/update/${formData.EntryID}`,
                { ...payload, UpdatedBy: staffID },
                token
            );

            if (result.success && result.message === "success") {
                toast.success("Fee item updated successfully");
                document.getElementById("closeModal").click();
                resetForm();
                getRecords();
            }
        }
    };

    useEffect(() => {
        getRecords();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Fee Items"
                items={["Human Resources", "AC-Finance", "Fee Items"]}
                buttons={
                    <button
                        type="button"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_modal_general"
                        onClick={resetForm}
                    >
                        <i className="fa fa-plus me-2"></i>
                        Add Fee Item
                    </button>
                }
            />

            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title">
                            <div className="d-flex align-items-center position-relative my-1">
                                <i className="fa fa-search position-absolute ms-5"></i>
                                <input
                                    type="text"
                                    className="form-control form-control-solid w-250px ps-13"
                                    placeholder="Search fee items..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="card-body py-4">
                        <AGTable data={datatable} />
                    </div>
                </div>

                <Modal title={formData.EntryID ? "Edit Fee Item" : "Add Fee Item"}>
                    <div className="form-group mb-4">
                        <label htmlFor="Name" className="required form-label">
                            Fee Item Name
                        </label>
                        <input
                            type="text"
                            id="Name"
                            onChange={onEdit}
                            value={formData.Name}
                            className="form-control form-control-solid"
                            placeholder="Enter fee item name"
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label htmlFor="Description" className="form-label">
                            Description
                        </label>
                        <textarea
                            id="Description"
                            onChange={onEdit}
                            value={formData.Description}
                            className="form-control form-control-solid"
                            placeholder="Enter description (optional)"
                            rows="3"
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label htmlFor="Amount" className="required form-label">
                            Default Amount
                        </label>
                        <input
                            type="number"
                            id="Amount"
                            onChange={onEdit}
                            value={formData.Amount}
                            className="form-control form-control-solid"
                            placeholder="Enter default amount"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label htmlFor="Category" className="required form-label">
                            Category
                        </label>
                        <select
                            id="Category"
                            onChange={onEdit}
                            value={formData.Category}
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

                    <div className="form-group pt-4">
                        <button onClick={onSubmit} className="btn btn-primary w-100">
                            {formData.EntryID ? "Update Fee Item" : "Add Fee Item"}
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(FeeItems);
