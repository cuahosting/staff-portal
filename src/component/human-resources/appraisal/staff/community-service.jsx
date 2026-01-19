import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";

function CommunityService(props) {
    const { appraisalId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const staffId = props.loginData.StaffID;

    const serviceTypes = [
        "Community Development",
        "Volunteer Work",
        "Pro Bono Services",
        "Extension Services",
        "Public Awareness Campaign",
        "Outreach Program",
        "Other"
    ];

    const [formData, setFormData] = useState({
        entryId: "",
        type: "",
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
        const { success, data } = await api.get(`staff/hr/appraisal/staff/community-service/${appraisalId}`);
        if (success) setServices(data.data || []);
        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setFormData({ entryId: "", type: "", description: "" });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setFormData({
            entryId: item.EntryID,
            type: item.Type,
            description: item.Description
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.type || !formData.description) {
            toast.warning("Please fill required fields");
            return;
        }

        setSubmitting(true);
        const endpoint = formData.entryId ? "staff/hr/appraisal/staff/community-service" : "staff/hr/appraisal/staff/community-service";
        const method = formData.entryId ? "patch" : "post";

        const { success, data } = await api[method](endpoint, {
            appraisalId,
            staffId,
            ...formData
        });

        if (success && data.message === 'success') {
            toast.success(formData.entryId ? "Service updated successfully" : "Community service added successfully");
            setShowModal(false);
            loadData();
        } else {
            toast.error(formData.entryId ? "Failed to update service" : "Failed to add community service");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this entry?")) return;
        const { success, data } = await api.delete(`staff/hr/appraisal/staff/community-service/${id}`);
        if (success && data.message === 'success') {
            toast.success("Entry deleted");
            loadData();
        }
    };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Community Service"
                items={["Appraisal", "Community Service"]}
                buttons={
                    <div className="d-flex gap-2">
                        <button className="btn btn-light border" onClick={() => navigate("/human-resources/appraisal/my-appraisal")}>
                            <i className="fa fa-arrow-left me-2"></i>Back
                        </button>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            <i className="fa fa-plus me-2"></i>Add Service
                        </button>
                    </div>
                }
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body">
                        {services.length === 0 ? (
                            <div className="alert alert-info text-center">
                                <i className="fa fa-info-circle me-2"></i>No community service records added yet.
                            </div>
                        ) : (
                            <AGTable data={{
                                columns: [
                                    { label: "S/N", field: "sn" },
                                    { label: "Type", field: "type" },
                                    { label: "Description", field: "description" },
                                    { label: "Action", field: "action" }
                                ],
                                rows: services.map((item, index) => ({
                                    sn: index + 1,
                                    type: <span className="badge bg-success">{item.Type}</span>,
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
                                <h5 className="modal-title">{formData.entryId ? "Edit" : "Add"} Community Service</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Service Type <span className="text-danger">*</span></label>
                                            <select className="form-select" name="type" value={formData.type} onChange={handleInputChange} required>
                                                <option value="">Select type...</option>
                                                {serviceTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Description <span className="text-danger">*</span></label>
                                            <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} rows="4" placeholder="Describe the community service activity..." required></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                        {formData.entryId ? "Update" : "Add"} Service
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
export default connect(mapStateToProps, null)(CommunityService);
