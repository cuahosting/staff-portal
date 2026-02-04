import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";

function DutySchedule(props) {
    const { appraisalId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [duties, setDuties] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const staffId = props.loginData.StaffID;

    const [formData, setFormData] = useState({
        entryId: "",
        description: ""
    });

    useEffect(() => {
        if (appraisalId) loadData();
        else {
            toast.warning("Please complete Basic Details first");
            navigate("/human-resources/appraisal/my-appraisal");
        }
    }, [appraisalId]);

    const loadData = async () => {
        setIsLoading(true);
        const { success, data } = await api.get(`staff/hr/appraisal/staff/duty-schedule/${appraisalId}`);
        if (success) setDuties(data.data || []);
        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setFormData({ entryId: "", description: "" });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setFormData({
            entryId: item.EntryID,
            description: item.Description
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description) {
            toast.warning("Please enter a description");
            return;
        }

        setSubmitting(true);
        const endpoint = formData.entryId ? "staff/hr/appraisal/staff/duty-schedule" : "staff/hr/appraisal/staff/duty-schedule";
        const method = formData.entryId ? "patch" : "post";

        const { success, data } = await api[method](endpoint, {
            appraisalId,
            staffId,
            ...formData
        });

        if (success && data.message === 'success') {
            toast.success(formData.entryId ? "Duty updated successfully" : "Duty added successfully");
            setShowModal(false);
            loadData();
        } else {
            toast.error(formData.entryId ? "Failed to update duty" : "Failed to add duty");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this duty?")) return;
        const { success, data } = await api.delete(`staff/hr/appraisal/staff/duty-schedule/${id}`);
        if (success && data.message === 'success') {
            toast.success("Duty deleted");
            loadData();
        }
    };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Duty Schedule"
                items={["Appraisal", "Duty Schedule"]}
                buttons={
                    <div className="d-flex gap-2">
                        <button className="btn btn-light border" onClick={() => navigate("/human-resources/appraisal/my-appraisal")}>
                            <i className="fa fa-arrow-left me-2"></i>Back
                        </button>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            <i className="fa fa-plus me-2"></i>Add Duty
                        </button>
                    </div>
                }
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body">
                        <p className="text-muted mb-3">
                            <i className="fa fa-info-circle me-2"></i>
                            List your current job duties and responsibilities for this appraisal period.
                        </p>
                        {duties.length === 0 ? (
                            <div className="alert alert-info text-center">
                                <i className="fa fa-info-circle me-2"></i>No duty schedule entries added yet.
                            </div>
                        ) : (
                            <AGTable data={{
                                columns: [
                                    { label: "S/N", field: "sn" },
                                    { label: "Description", field: "description" },
                                    { label: "Action", field: "action" }
                                ],
                                rows: duties.map((item, index) => ({
                                    sn: index + 1,
                                    description: item.Description,
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

            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{formData.entryId ? "Edit" : "Add"} Job Duty</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Duty Description <span className="text-danger">*</span></label>
                                        <textarea
                                            className="form-control"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="4"
                                            placeholder="Describe your job duty/responsibility..."
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                        {formData.entryId ? "Update" : "Add"} Duty
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
export default connect(mapStateToProps, null)(DutySchedule);
