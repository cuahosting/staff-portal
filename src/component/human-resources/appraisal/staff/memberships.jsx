import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";

function Memberships(props) {
    const { appraisalId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [memberships, setMemberships] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const staffId = props.loginData.StaffID;

    const [formData, setFormData] = useState({
        entryId: "",
        organisationName: "",
        title: "",
        yearJoined: ""
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
        const { success, data } = await api.get(`staff/hr/appraisal/staff/memberships/${appraisalId}`);
        if (success) setMemberships(data.data || []);
        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setFormData({ entryId: "", organisationName: "", title: "", yearJoined: "" });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setFormData({
            entryId: item.EntryID,
            organisationName: item.OrganisationName,
            title: item.Title,
            yearJoined: item.YearJoined || ""
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.organisationName || !formData.title) {
            toast.warning("Please fill required fields");
            return;
        }

        setSubmitting(true);
        const endpoint = formData.entryId ? "staff/hr/appraisal/staff/memberships" : "staff/hr/appraisal/staff/memberships";
        const method = formData.entryId ? "patch" : "post";

        const { success, data } = await api[method](endpoint, {
            appraisalId,
            staffId,
            ...formData
        });

        if (success && data.message === 'success') {
            toast.success(formData.entryId ? "Membership updated successfully" : "Membership added successfully");
            setShowModal(false);
            loadData();
        } else {
            toast.error(formData.entryId ? "Failed to update membership" : "Failed to add membership");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this membership?")) return;
        const { success, data } = await api.delete(`staff/hr/appraisal/staff/memberships/${id}`);
        if (success && data.message === 'success') {
            toast.success("Membership deleted");
            loadData();
        }
    };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Professional Memberships"
                items={["Appraisal", "Memberships"]}
                buttons={
                    <div className="d-flex gap-2">
                        <button className="btn btn-light border" onClick={() => navigate("/human-resources/appraisal/my-appraisal")}>
                            <i className="fa fa-arrow-left me-2"></i>Back
                        </button>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            <i className="fa fa-plus me-2"></i>Add Membership
                        </button>
                    </div>
                }
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body">
                        {memberships.length === 0 ? (
                            <div className="alert alert-info text-center">
                                <i className="fa fa-info-circle me-2"></i>No professional memberships added yet.
                            </div>
                        ) : (
                            <AGTable data={{
                                columns: [
                                    { label: "S/N", field: "sn" },
                                    { label: "Organisation", field: "organisationName" },
                                    { label: "Membership Title", field: "title" },
                                    { label: "Year Joined", field: "yearJoined" },
                                    { label: "Action", field: "action" }
                                ],
                                rows: memberships.map((item, index) => ({
                                    sn: index + 1,
                                    organisationName: item.OrganisationName,
                                    title: item.Title,
                                    yearJoined: item.YearJoined,
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
                                <h5 className="modal-title">{formData.entryId ? "Edit" : "Add"} Professional Membership</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Organisation Name <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" name="organisationName" value={formData.organisationName} onChange={handleInputChange} placeholder="e.g., IEEE, ACM, NCS" required />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Membership Title <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Fellow, Member, Associate" required />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Year Joined</label>
                                            <input type="text" className="form-control" name="yearJoined" value={formData.yearJoined} onChange={handleInputChange} placeholder="e.g., 2018" />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                        {formData.entryId ? "Update" : "Add"} Membership
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
export default connect(mapStateToProps, null)(Memberships);
