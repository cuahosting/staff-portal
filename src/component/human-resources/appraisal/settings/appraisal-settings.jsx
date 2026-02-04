import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import { formatDateAndTime } from "../../../../resources/constants";

function AppraisalSettings(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        entryId: null,
        reportFrom: "",
        reportTo: "",
        status: 0
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        const { success, data } = await api.get("staff/hr/appraisal/settings/list");
        if (success) setSettings(data.data || []);
        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
    };

    const openAddModal = () => {
        setFormData({ entryId: null, reportFrom: "", reportTo: "", status: 0 });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setFormData({
            entryId: item.EntryID,
            reportFrom: item.ReportFrom?.split('T')[0] || "",
            reportTo: item.ReportTo?.split('T')[0] || "",
            status: item.Status
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.reportFrom || !formData.reportTo) {
            toast.warning("Please fill all required fields");
            return;
        }

        setSubmitting(true);
        const endpoint = formData.entryId ? "staff/hr/appraisal/settings/update" : "staff/hr/appraisal/settings/add";
        const method = formData.entryId ? "patch" : "post";

        const { success, data } = await api[method](endpoint, formData);
        if (success && data.message === 'success') {
            toast.success(formData.entryId ? "Setting updated successfully" : "Setting added successfully");
            setShowModal(false);
            loadSettings();
        } else {
            toast.error(data.error || "Operation failed");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this appraisal period?")) return;

        const { success, data } = await api.delete(`staff/hr/appraisal/settings/delete/${id}`);
        if (success && data.message === 'success') {
            toast.success("Setting deleted successfully");
            loadSettings();
        } else {
            toast.error(data.error || "Delete failed");
        }
    };

    const toggleStatus = async (item) => {
        const { success, data } = await api.patch("staff/hr/appraisal/settings/update", {
            entryId: item.EntryID,
            reportFrom: item.ReportFrom,
            reportTo: item.ReportTo,
            status: item.Status === 1 ? 0 : 1
        });

        if (success && data.message === 'success') {
            toast.success(item.Status === 1 ? "Period deactivated" : "Period activated");
            loadSettings();
        }
    };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Appraisal Settings"
                items={["Human Resources", "Appraisal", "Settings"]}
                buttons={
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <i className="fa fa-plus me-2"></i>Add Period
                    </button>
                }
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body">
                        {settings.length === 0 ? (
                            <div className="alert alert-info text-center">
                                <i className="fa fa-info-circle me-2"></i>No appraisal periods configured yet.
                            </div>
                        ) : (
                            <AGTable data={{
                                columns: [
                                    { label: "S/N", field: "sn" },
                                    { label: "Report From", field: "reportFrom" },
                                    { label: "Report To", field: "reportTo" },
                                    { label: "Status", field: "status" },
                                    { label: "Actions", field: "actions" }
                                ],
                                rows: settings.map((item, index) => ({
                                    sn: index + 1,
                                    reportFrom: formatDateAndTime(item.ReportFrom, 'date'),
                                    reportTo: formatDateAndTime(item.ReportTo, 'date'),
                                    status: (
                                        <span
                                            className={`badge ${item.Status === 1 ? 'bg-success' : 'bg-secondary'}`}
                                            onClick={() => toggleStatus(item)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {item.Status === 1 ? 'Active' : 'Inactive'}
                                        </span>
                                    ),
                                    actions: (
                                        <div className="d-flex gap-1">
                                            <button className="btn btn-sm btn-info" onClick={() => openEditModal(item)}>
                                                <i className="fa fa-edit"></i>
                                            </button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.EntryID)}>
                                                <i className="fa fa-trash"></i>
                                            </button>
                                        </div>
                                    )
                                }))
                            }} />
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {formData.entryId ? 'Edit Appraisal Period' : 'Add Appraisal Period'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Report From <span className="text-danger">*</span></label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="reportFrom"
                                                value={formData.reportFrom}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Report To <span className="text-danger">*</span></label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="reportTo"
                                                value={formData.reportTo}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="status"
                                                    name="status"
                                                    checked={formData.status === 1}
                                                    onChange={handleInputChange}
                                                />
                                                <label className="form-check-label" htmlFor="status">
                                                    Set as Active Period
                                                </label>
                                            </div>
                                            <small className="text-muted">Only one period can be active at a time</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                        {formData.entryId ? 'Update' : 'Add'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(AppraisalSettings);
