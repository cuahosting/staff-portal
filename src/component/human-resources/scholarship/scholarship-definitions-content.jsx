import React, { useEffect, useState } from "react";
import AGTable from "../../common/table/AGTable";
import PageHeader from "../../common/pageheader/pageheader";
import api from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { formatDateAndTime } from "../../../resources/constants";

function ScholarshipDefinitionsContent(props) {
    const token = props.loginData[0]?.token;
    const staffID = props.loginData[0]?.StaffID;

    const [isLoading, setIsLoading] = useState(true);
    const [scholarshipList, setScholarshipList] = useState([]);
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Action", field: "action" },
            { label: "Name", field: "Name" },
            { label: "Description", field: "Description" },
            { label: "Admission %", field: "Admission" },
            { label: "Tuition %", field: "Tuition" },
            { label: "Feeding %", field: "Feeding" },
            { label: "Transport %", field: "Transportation" },
            { label: "Accommodation %", field: "Accommodation" },
            { label: "Status", field: "Status" },
        ],
        rows: [],
    });

    const [formData, setFormData] = useState({
        Name: "",
        Description: "",
        StartDate: "",
        EndDate: "",
        Admission: 0,
        Tuition: 0,
        Feeding: 0,
        Transportation: 0,
        Accommodation: 0,
        InsertedBy: staffID,
        EntryID: "",
    });

    const [showModal, setShowModal] = useState(false);

    const resetForm = () => {
        setFormData({
            Name: "",
            Description: "",
            StartDate: "",
            EndDate: "",
            Admission: 0,
            Tuition: 0,
            Feeding: 0,
            Transportation: 0,
            Accommodation: 0,
            InsertedBy: staffID,
            EntryID: "",
        });
    };

    const getRecords = async () => {
        const result = await api.get("staff/ac-finance/scholarships/list", token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setScholarshipList(data);

            let rows = [];
            data.forEach((item, index) => {
                rows.push({
                    sn: index + 1,
                    Name: (
                        <div>
                            <span className="fw-bold">{item.Name}</span>
                            {item.StartDate && (
                                <div className="text-muted small">
                                    {formatDateAndTime(item.StartDate, "date")} -{" "}
                                    {item.EndDate ? formatDateAndTime(item.EndDate, "date") : "Ongoing"}
                                </div>
                            )}
                        </div>
                    ),
                    Description: item.Description || "-",
                    Admission: <span className="badge badge-light-info">{item.Admission}%</span>,
                    Tuition: <span className="badge badge-light-primary">{item.Tuition}%</span>,
                    Feeding: <span className="badge badge-light-success">{item.Feeding}%</span>,
                    Transportation: <span className="badge badge-light-warning">{item.Transportation}%</span>,
                    Accommodation: <span className="badge badge-light-dark">{item.Accommodation}%</span>,
                    Status: item.IsActive === 1 ? (
                        <span className="badge badge-light-success">Active</span>
                    ) : (
                        <span className="badge badge-light-danger">Inactive</span>
                    ),
                    action: (
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-sm btn-light-primary"
                                onClick={() => onEditClick(item)}
                            >
                                <i className="fa fa-edit"></i>
                            </button>
                            <button
                                className={`btn btn-sm ${item.IsActive === 1 ? 'btn-light-warning' : 'btn-light-success'}`}
                                onClick={() => onToggleStatus(item)}
                            >
                                <i className={`fa ${item.IsActive === 1 ? 'fa-ban' : 'fa-check'}`}></i>
                            </button>
                            <button
                                className="btn btn-sm btn-light-danger"
                                onClick={() => onDeleteClick(item)}
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
            StartDate: item.StartDate ? item.StartDate.split("T")[0] : "",
            EndDate: item.EndDate ? item.EndDate.split("T")[0] : "",
            Admission: item.Admission || 0,
            Tuition: item.Tuition || 0,
            Feeding: item.Feeding || 0,
            Transportation: item.Transportation || 0,
            Accommodation: item.Accommodation || 0,
            InsertedBy: staffID,
            EntryID: item.ScholarshipID,
        });
        setShowModal(true);
    };

    const onToggleStatus = async (item) => {
        const action = item.IsActive === 1 ? "deactivate" : "activate";
        const confirmed = await showAlert(
            "CONFIRM",
            `Are you sure you want to ${action} this scholarship?`,
            "warning"
        );

        if (confirmed) {
            const result = await api.patch(
                `staff/ac-finance/scholarships/update/${item.ScholarshipID}`,
                { IsActive: item.IsActive === 1 ? 0 : 1, UpdatedBy: staffID },
                token
            );

            if (result.success && result.message === "success") {
                toast.success(`Scholarship ${action}d successfully`);
                getRecords();
            }
        }
    };

    const onDeleteClick = async (item) => {
        const confirmed = await showAlert(
            "DELETE CONFIRMATION",
            "Are you sure you want to delete this scholarship?",
            "warning"
        );

        if (confirmed) {
            const result = await api.delete(
                `staff/ac-finance/scholarships/delete/${item.ScholarshipID}`,
                token,
                { UpdatedBy: staffID }
            );

            if (result.success && result.message === "success") {
                toast.success("Scholarship deleted successfully");
                getRecords();
            }
        }
    };

    const onEdit = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: id.includes("Date") ? value : (["Admission", "Tuition", "Feeding", "Transportation", "Accommodation"].includes(id) ? parseFloat(value) || 0 : value),
        });
    };

    const onSubmit = async () => {
        if (formData.Name.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the scholarship name", "error");
            return;
        }

        // Validate percentages
        const percentages = ["Admission", "Tuition", "Feeding", "Transportation", "Accommodation"];
        for (const field of percentages) {
            if (formData[field] < 0 || formData[field] > 100) {
                showAlert("INVALID VALUE", `${field} percentage must be between 0 and 100`, "error");
                return;
            }
        }

        if (formData.EntryID === "") {
            const result = await api.post("staff/ac-finance/scholarships/add", formData, token);

            if (result.success && result.message === "success") {
                toast.success("Scholarship added successfully");
                setShowModal(false);
                resetForm();
                getRecords();
            } else if (result.message === "exist") {
                showAlert("DUPLICATE", "A scholarship with this name already exists", "error");
            }
        } else {
            const result = await api.patch(
                `staff/ac-finance/scholarships/update/${formData.EntryID}`,
                { ...formData, UpdatedBy: staffID },
                token
            );

            if (result.success && result.message === "success") {
                toast.success("Scholarship updated successfully");
                setShowModal(false);
                resetForm();
                getRecords();
            }
        }
    };

    useEffect(() => {
        getRecords();
    }, []);

    if (isLoading) return <Loader />;

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Scholarship Definitions"
                items={["Human Resources", "Scholarship", "Definitions"]}
                buttons={
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                    >
                        <i className="fa fa-plus me-2"></i>
                        Add Scholarship
                    </button>
                }
            />

            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body py-4">
                        <AGTable data={datatable} />
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {formData.EntryID ? "Edit Scholarship" : "Add Scholarship"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12 mb-4">
                                        <label htmlFor="Name" className="required form-label">
                                            Scholarship Name
                                        </label>
                                        <input
                                            type="text"
                                            id="Name"
                                            onChange={onEdit}
                                            value={formData.Name}
                                            className="form-control form-control-solid"
                                            placeholder="Enter scholarship name"
                                        />
                                    </div>

                                    <div className="col-md-12 mb-4">
                                        <label htmlFor="Description" className="form-label">
                                            Description
                                        </label>
                                        <textarea
                                            id="Description"
                                            onChange={onEdit}
                                            value={formData.Description}
                                            className="form-control form-control-solid"
                                            placeholder="Enter description"
                                            rows="2"
                                        />
                                    </div>

                                    <div className="col-md-6 mb-4">
                                        <label htmlFor="StartDate" className="form-label">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            id="StartDate"
                                            onChange={onEdit}
                                            value={formData.StartDate}
                                            className="form-control form-control-solid"
                                        />
                                    </div>

                                    <div className="col-md-6 mb-4">
                                        <label htmlFor="EndDate" className="form-label">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            id="EndDate"
                                            onChange={onEdit}
                                            value={formData.EndDate}
                                            className="form-control form-control-solid"
                                        />
                                    </div>
                                </div>

                                <hr />
                                <h6 className="mb-3">Discount Percentages (0-100%)</h6>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="Admission" className="form-label">
                                            Admission Fee
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                id="Admission"
                                                onChange={onEdit}
                                                value={formData.Admission}
                                                className="form-control form-control-solid"
                                                min="0"
                                                max="100"
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="Tuition" className="form-label">
                                            Tuition Fee
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                id="Tuition"
                                                onChange={onEdit}
                                                value={formData.Tuition}
                                                className="form-control form-control-solid"
                                                min="0"
                                                max="100"
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="Feeding" className="form-label">
                                            Feeding Fee
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                id="Feeding"
                                                onChange={onEdit}
                                                value={formData.Feeding}
                                                className="form-control form-control-solid"
                                                min="0"
                                                max="100"
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="Transportation" className="form-label">
                                            Transportation Fee
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                id="Transportation"
                                                onChange={onEdit}
                                                value={formData.Transportation}
                                                className="form-control form-control-solid"
                                                min="0"
                                                max="100"
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="Accommodation" className="form-label">
                                            Accommodation Fee
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                id="Accommodation"
                                                onChange={onEdit}
                                                value={formData.Accommodation}
                                                className="form-control form-control-solid"
                                                min="0"
                                                max="100"
                                            />
                                            <span className="input-group-text">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={onSubmit}
                                >
                                    {formData.EntryID ? "Update" : "Add"} Scholarship
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ScholarshipDefinitionsContent;
