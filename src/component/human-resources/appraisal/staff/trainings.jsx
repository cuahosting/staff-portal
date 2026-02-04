import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";

function Trainings(props) {
    const { appraisalId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [trainings, setTrainings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const staffId = props.loginData.StaffID;

    const [formData, setFormData] = useState({
        entryId: "",
        organisation: "",
        description: "",
        year: "",
        filePath: ""
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
        const { success, data } = await api.get(`staff/hr/appraisal/staff/trainings/${appraisalId}`);
        if (success) setTrainings(data.data || []);
        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setFormData({ entryId: "", organisation: "", description: "", year: "", filePath: "" });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setFormData({
            entryId: item.EntryID,
            organisation: item.Organisation,
            description: item.Description,
            year: item.Year,
            filePath: item.FilePath || ""
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.organisation || !formData.description) {
            toast.warning("Please fill required fields");
            return;
        }

        setSubmitting(true);
        const endpoint = formData.entryId ? "staff/hr/appraisal/staff/trainings" : "staff/hr/appraisal/staff/trainings";
        const method = formData.entryId ? "patch" : "post";

        const { success, data } = await api[method](endpoint, {
            appraisalId,
            staffId,
            ...formData
        });

        if (success && data.message === 'success') {
            toast.success(formData.entryId ? "Training updated successfully" : "Training added successfully");
            setShowModal(false);
            loadData();
        } else {
            toast.error(formData.entryId ? "Failed to update training" : "Failed to add training");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this training?")) return;
        const { success, data } = await api.delete(`staff/hr/appraisal/staff/trainings/${id}`);
        if (success && data.message === 'success') {
            toast.success("Training deleted");
            loadData();
        }
    };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Training & Development"
                items={["Appraisal", "Trainings"]}
                buttons={
                    <div className="d-flex gap-2">
                        <button className="btn btn-light border" onClick={() => navigate("/human-resources/appraisal/my-appraisal")}>
                            <i className="fa fa-arrow-left me-2"></i>Back
                        </button>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            <i className="fa fa-plus me-2"></i>Add Training
                        </button>
                    </div>
                }
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body">
                        {trainings.length === 0 ? (
                            <div className="alert alert-info text-center">
                                <i className="fa fa-info-circle me-2"></i>No training records added yet.
                            </div>
                        ) : (
                            <AGTable data={{
                                columns: [
                                    { label: "S/N", field: "sn" },
                                    { label: "Organisation", field: "organisation" },
                                    { label: "Description", field: "description" },
                                    { label: "Year", field: "year" },
                                    { label: "Action", field: "action" }
                                ],
                                rows: trainings.map((item, index) => ({
                                    sn: index + 1,
                                    organisation: item.Organisation,
                                    description: item.Description,
                                    year: item.Year,
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
                                <h5 className="modal-title">{formData.entryId ? "Edit" : "Add"} Training/Workshop</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Organisation <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" name="organisation" value={formData.organisation} onChange={handleInputChange} placeholder="Organizer name" required />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Description <span className="text-danger">*</span></label>
                                            <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Training/Workshop/Conference title and description" required></textarea>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Year</label>
                                            <input type="text" className="form-control" name="year" value={formData.year} onChange={handleInputChange} placeholder="e.g., 2023" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Certificate URL (Optional)</label>
                                            <input type="text" className="form-control" name="filePath" value={formData.filePath} onChange={handleInputChange} placeholder="Link to certificate" />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                        {formData.entryId ? "Update" : "Add"} Training
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
export default connect(mapStateToProps, null)(Trainings);
