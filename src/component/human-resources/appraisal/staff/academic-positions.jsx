import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";

function AcademicPositions(props) {
    const { appraisalId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [positions, setPositions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const staffId = props.loginData.StaffID;

    const [formData, setFormData] = useState({
        entryId: "",
        institutionName: "",
        academicPosition: "",
        periodFrom: "",
        periodTo: ""
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
        const { success, data } = await api.get(`staff/hr/appraisal/staff/academic-positions/${appraisalId}`);
        if (success) setPositions(data.data || []);
        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setFormData({ entryId: "", institutionName: "", academicPosition: "", periodFrom: "", periodTo: "" });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setFormData({
            entryId: item.EntryID,
            institutionName: item.InstitutionName,
            academicPosition: item.AcademicPosition,
            periodFrom: item.PeriodFrom,
            periodTo: item.PeriodTo || ""
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.institutionName || !formData.academicPosition) {
            toast.warning("Please fill required fields");
            return;
        }

        setSubmitting(true);
        const endpoint = formData.entryId ? "staff/hr/appraisal/staff/academic-positions" : "staff/hr/appraisal/staff/academic-positions";
        const method = formData.entryId ? "patch" : "post";

        const { success, data } = await api[method](endpoint, {
            appraisalId,
            staffId,
            ...formData
        });

        if (success && data.message === 'success') {
            toast.success(formData.entryId ? "Position updated successfully" : "Position added successfully");
            setShowModal(false);
            loadData();
        } else {
            toast.error(formData.entryId ? "Failed to update position" : "Failed to add position");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this position?")) return;
        const { success, data } = await api.delete(`staff/hr/appraisal/staff/academic-positions/${id}`);
        if (success && data.message === 'success') {
            toast.success("Position deleted");
            loadData();
        }
    };

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Academic Positions"
                items={["Appraisal", "Academic Positions"]}
                buttons={
                    <div className="d-flex gap-2">
                        <button className="btn btn-light border" onClick={() => navigate("/human-resources/appraisal/my-appraisal")}>
                            <i className="fa fa-arrow-left me-2"></i>Back
                        </button>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            <i className="fa fa-plus me-2"></i>Add Position
                        </button>
                    </div>
                }
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body">
                        {positions.length === 0 ? (
                            <div className="alert alert-info text-center">
                                <i className="fa fa-info-circle me-2"></i>No academic positions added yet.
                            </div>
                        ) : (
                            <AGTable data={{
                                columns: [
                                    { label: "S/N", field: "sn" },
                                    { label: "Institution Name", field: "institutionName" },
                                    { label: "Position", field: "position" },
                                    { label: "Period From", field: "periodFrom" },
                                    { label: "Period To", field: "periodTo" },
                                    { label: "Action", field: "action" }
                                ],
                                rows: positions.map((item, index) => ({
                                    sn: index + 1,
                                    institutionName: item.InstitutionName,
                                    position: item.AcademicPosition,
                                    periodFrom: item.PeriodFrom,
                                    periodTo: item.PeriodTo || 'Present',
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
                                <h5 className="modal-title">{formData.entryId ? "Edit" : "Add"} Academic Position</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Institution Name <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" name="institutionName" value={formData.institutionName} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Academic Position <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" name="academicPosition" value={formData.academicPosition} onChange={handleInputChange} placeholder="e.g., Professor, Lecturer II" required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Period From</label>
                                            <input type="text" className="form-control" name="periodFrom" value={formData.periodFrom} onChange={handleInputChange} placeholder="e.g., 2015" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Period To</label>
                                            <input type="text" className="form-control" name="periodTo" value={formData.periodTo} onChange={handleInputChange} placeholder="e.g., 2020 or Present" />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                        {formData.entryId ? "Update" : "Add"} Position
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
export default connect(mapStateToProps, null)(AcademicPositions);
