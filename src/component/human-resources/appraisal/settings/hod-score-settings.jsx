import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";

function HodScoreSettings(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        entryId: null,
        itemName: "",
        itemScore: 10,
        appraisalType: "Academic",
        isComment: 0
    });
    const [submitting, setSubmitting] = useState(false);
    const [filterType, setFilterType] = useState("All");

    const appraisalTypes = ["Academic", "Non-Academic", "Administrative"];

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        const { success, data } = await api.get("staff/hr/appraisal/hod-score-settings/list");
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
        setFormData({ entryId: null, itemName: "", itemScore: 10, appraisalType: "Academic", isComment: 0 });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setFormData({
            entryId: item.EntryID,
            itemName: item.ItemName,
            itemScore: item.ItemScore,
            appraisalType: item.AppraisalType,
            isComment: item.IsComment
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.itemName) {
            toast.warning("Please enter item name");
            return;
        }

        setSubmitting(true);
        const endpoint = formData.entryId ? "staff/hr/appraisal/hod-score-settings/update" : "staff/hr/appraisal/hod-score-settings/add";
        const method = formData.entryId ? "patch" : "post";

        const payload = {
            ...formData,
            insertedBy: props.loginData.StaffID
        };

        const { success, data } = await api[method](endpoint, payload);
        if (success && data.message === 'success') {
            toast.success(formData.entryId ? "Criteria updated successfully" : "Criteria added successfully");
            setShowModal(false);
            loadSettings();
        } else {
            toast.error(data.error || "Operation failed");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this scoring criteria?")) return;

        const { success, data } = await api.delete(`staff/hr/appraisal/hod-score-settings/delete/${id}`);
        if (success && data.message === 'success') {
            toast.success("Criteria deleted successfully");
            loadSettings();
        } else {
            toast.error(data.error || "Delete failed");
        }
    };

    const filteredSettings = filterType === "All"
        ? settings
        : settings.filter(s => s.AppraisalType === filterType);

    const totalScore = filteredSettings.filter(s => !s.IsComment).reduce((sum, s) => sum + (s.ItemScore || 0), 0);

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="HOD Scoring Criteria"
                items={["Human Resources", "Appraisal", "HOD Score Settings"]}
                buttons={
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <i className="fa fa-plus me-2"></i>Add Criteria
                    </button>
                }
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-3">
                            <select
                                className="form-select form-select-sm"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                style={{ width: '150px' }}
                            >
                                <option value="All">All Types</option>
                                {appraisalTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <span className="badge bg-info fs-6">Total Score: {totalScore}</span>
                        </div>
                    </div>
                    <div className="card-body">
                        {filteredSettings.length === 0 ? (
                            <div className="alert alert-info text-center">
                                <i className="fa fa-info-circle me-2"></i>No scoring criteria configured yet.
                            </div>
                        ) : (
                            <AGTable data={{
                                columns: [
                                    { label: "S/N", field: "sn" },
                                    { label: "Criteria Name", field: "itemName" },
                                    { label: "Max Score", field: "itemScore" },
                                    { label: "Type", field: "appraisalType" },
                                    { label: "Comment Only", field: "isComment" },
                                    { label: "Actions", field: "action" }
                                ],
                                rows: filteredSettings.map((item, index) => ({
                                    sn: index + 1,
                                    itemName: item.ItemName,
                                    itemScore: item.IsComment ? <span className="text-muted">-</span> : <span className="badge bg-primary">{item.ItemScore}</span>,
                                    appraisalType: <span className={`badge ${item.AppraisalType === 'Academic' ? 'bg-success' : item.AppraisalType === 'Non-Academic' ? 'bg-warning' : 'bg-info'}`}>{item.AppraisalType}</span>,
                                    isComment: item.IsComment ? <i className="fa fa-check text-success"></i> : <i className="fa fa-times text-muted"></i>,
                                    action: (
                                        <div className="d-flex gap-1 justify-content-center">
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
                                    {formData.entryId ? 'Edit Scoring Criteria' : 'Add Scoring Criteria'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Criteria Name <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="itemName"
                                                value={formData.itemName}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Teaching Effectiveness"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Appraisal Type</label>
                                            <select
                                                className="form-select"
                                                name="appraisalType"
                                                value={formData.appraisalType}
                                                onChange={handleInputChange}
                                            >
                                                {appraisalTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Max Score</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="itemScore"
                                                value={formData.itemScore}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="100"
                                                disabled={formData.isComment === 1}
                                            />
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="isComment"
                                                    name="isComment"
                                                    checked={formData.isComment === 1}
                                                    onChange={handleInputChange}
                                                />
                                                <label className="form-check-label" htmlFor="isComment">
                                                    Comment Only (No Score)
                                                </label>
                                            </div>
                                            <small className="text-muted">Check this if this is a comment field without numeric scoring</small>
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
export default connect(mapStateToProps, null)(HodScoreSettings);
