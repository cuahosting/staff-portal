import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";

function BasicDetailsForm(props) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [settingId, setSettingId] = useState(null);
    const [staffInfo, setStaffInfo] = useState(null);
    const staffId = props.loginData.StaffID;

    const [formData, setFormData] = useState({
        submissionType: "Academic",
        title: "",
        dateOfBirth: "",
        placeOfResidence: "",
        currentPosition: "",
        currentSalaryScale: "",
        currentStep: "",
        nationality: "",
        maritalStatus: "",
        gender: "",
        dateOfFirstAppointment: "",
        firstSalaryScale: "",
        firstStep: "",
        firstPosition: "",
        dateOfLastPromotion: "",
        lastPromotionPosition: "",
        lastPromotionScale: "",
        lastPromotionStep: "",
        parentLastPromotionDate: "",
        parentLastPromotionPosition: "",
        parentLastPromotionStep: "",
        parentLastPromotionScale: "",
        departmentCode: ""
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setIsLoading(true);
        const { success, data } = await api.get(`staff/hr/appraisal/staff/basic-details/${staffId}`);

        if (success) {
            setSettingId(data.settingId);
            setStaffInfo(data.staffInfo);

            // Pre-fill from existing appraisal data or staff info
            if (data.data) {
                setFormData({
                    submissionType: data.data.SubmissionType || "Academic",
                    title: data.data.Title || "",
                    dateOfBirth: data.data.DateOfBirth?.split('T')[0] || "",
                    placeOfResidence: data.data.PlaceOfResidence || "",
                    currentPosition: data.data.CurrentPosition || "",
                    currentSalaryScale: data.data.CurrentSalaryScale || "",
                    currentStep: data.data.CurrentStep || "",
                    nationality: data.data.Nationality || "",
                    maritalStatus: data.data.MaritalStatus || "",
                    gender: data.data.Gender || "",
                    dateOfFirstAppointment: data.data.DateOfFirstAppointment?.split('T')[0] || "",
                    firstSalaryScale: data.data.FirstSalaryScale || "",
                    firstStep: data.data.FirstStep || "",
                    firstPosition: data.data.FirstPosition || "",
                    dateOfLastPromotion: data.data.DateOfLastPromotion?.split('T')[0] || "",
                    lastPromotionPosition: data.data.LastPromotionPosition || "",
                    lastPromotionScale: data.data.LastPromotionScale || "",
                    lastPromotionStep: data.data.LastPromotionStep || "",
                    parentLastPromotionDate: data.data.ParentLastPromotionDate?.split('T')[0] || "",
                    parentLastPromotionPosition: data.data.ParentLastPromotionPosition || "",
                    parentLastPromotionStep: data.data.ParentLastPromotionStep || "",
                    parentLastPromotionScale: data.data.ParentLastPromotionScale || "",
                    departmentCode: data.data.DepartmentCode || data.staffInfo?.DepartmentCode || ""
                });
            } else if (data.staffInfo) {
                // Pre-fill from HR staff record
                const staff = data.staffInfo;
                setFormData(prev => ({
                    ...prev,
                    title: staff.TitleID || "",
                    dateOfBirth: staff.DateOfBirth?.split('T')[0] || "",
                    nationality: staff.NationalityID || "",
                    maritalStatus: staff.MaritalStatus || "",
                    gender: staff.Gender || "",
                    departmentCode: staff.DepartmentCode || ""
                }));
            }
        }
        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.submissionType) {
            toast.warning("Please select submission type");
            return;
        }

        setSubmitting(true);
        const payload = {
            settingId,
            staffId,
            ...formData
        };

        const { success, data } = await api.post("staff/hr/appraisal/staff/basic-details", payload);

        if (success && data.message === 'success') {
            toast.success("Basic details saved successfully");
            navigate("/human-resources/appraisal/my-appraisal");
        } else {
            toast.error("Failed to save basic details");
        }
        setSubmitting(false);
    };

    if (!settingId && !isLoading) {
        return (
            <div className="d-flex flex-column flex-row-fluid">
                <PageHeader title="Basic Details" items={["Appraisal", "Basic Details"]} />
                <div className="alert alert-warning">
                    <i className="fa fa-exclamation-triangle me-2"></i>
                    No active appraisal period. Please contact your administrator.
                </div>
            </div>
        );
    }

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Basic Details" items={["Appraisal", "Basic Details"]} />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0"><i className="fa fa-user me-2"></i>Personal & Employment Information</h5>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="card-body">
                            {/* Submission Type */}
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Submission Type <span className="text-danger">*</span></label>
                                    <select className="form-select" name="submissionType" value={formData.submissionType} onChange={handleInputChange} required>
                                        <option value="Academic">Academic Staff</option>
                                        <option value="Non-Academic">Non-Academic Staff</option>
                                        <option value="Administrative">Administrative Staff</option>
                                    </select>
                                </div>
                            </div>

                            <hr />
                            <h6 className="fw-bold mb-3"><i className="fa fa-id-card me-2"></i>Personal Information</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-md-3">
                                    <label className="form-label">Title</label>
                                    <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Dr., Prof." />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Date of Birth</label>
                                    <input type="date" className="form-control" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Gender</label>
                                    <select className="form-select" name="gender" value={formData.gender} onChange={handleInputChange}>
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Marital Status</label>
                                    <select className="form-select" name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange}>
                                        <option value="">Select...</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Divorced">Divorced</option>
                                        <option value="Widowed">Widowed</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Nationality</label>
                                    <input type="text" className="form-control" name="nationality" value={formData.nationality} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label">Place of Residence</label>
                                    <input type="text" className="form-control" name="placeOfResidence" value={formData.placeOfResidence} onChange={handleInputChange} />
                                </div>
                            </div>

                            <hr />
                            <h6 className="fw-bold mb-3"><i className="fa fa-briefcase me-2"></i>Current Position</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <label className="form-label">Current Position</label>
                                    <input type="text" className="form-control" name="currentPosition" value={formData.currentPosition} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Current Salary Scale</label>
                                    <input type="text" className="form-control" name="currentSalaryScale" value={formData.currentSalaryScale} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Current Step</label>
                                    <input type="text" className="form-control" name="currentStep" value={formData.currentStep} onChange={handleInputChange} />
                                </div>
                            </div>

                            <hr />
                            <h6 className="fw-bold mb-3"><i className="fa fa-calendar-plus me-2"></i>First Appointment</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-md-3">
                                    <label className="form-label">Date of First Appointment</label>
                                    <input type="date" className="form-control" name="dateOfFirstAppointment" value={formData.dateOfFirstAppointment} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">First Position</label>
                                    <input type="text" className="form-control" name="firstPosition" value={formData.firstPosition} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">First Salary Scale</label>
                                    <input type="text" className="form-control" name="firstSalaryScale" value={formData.firstSalaryScale} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">First Step</label>
                                    <input type="text" className="form-control" name="firstStep" value={formData.firstStep} onChange={handleInputChange} />
                                </div>
                            </div>

                            <hr />
                            <h6 className="fw-bold mb-3"><i className="fa fa-arrow-up me-2"></i>Last Promotion</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-md-3">
                                    <label className="form-label">Date of Last Promotion</label>
                                    <input type="date" className="form-control" name="dateOfLastPromotion" value={formData.dateOfLastPromotion} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Position After Promotion</label>
                                    <input type="text" className="form-control" name="lastPromotionPosition" value={formData.lastPromotionPosition} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Salary Scale</label>
                                    <input type="text" className="form-control" name="lastPromotionScale" value={formData.lastPromotionScale} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Step</label>
                                    <input type="text" className="form-control" name="lastPromotionStep" value={formData.lastPromotionStep} onChange={handleInputChange} />
                                </div>
                            </div>

                            <hr />
                            <h6 className="fw-bold mb-3"><i className="fa fa-building me-2"></i>Parent Institution Last Promotion (If Applicable)</h6>
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label">Date</label>
                                    <input type="date" className="form-control" name="parentLastPromotionDate" value={formData.parentLastPromotionDate} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Position</label>
                                    <input type="text" className="form-control" name="parentLastPromotionPosition" value={formData.parentLastPromotionPosition} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Salary Scale</label>
                                    <input type="text" className="form-control" name="parentLastPromotionScale" value={formData.parentLastPromotionScale} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Step</label>
                                    <input type="text" className="form-control" name="parentLastPromotionStep" value={formData.parentLastPromotionStep} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>
                        <div className="card-footer d-flex justify-content-between">
                            <button type="button" className="btn btn-secondary" onClick={() => navigate("/human-resources/appraisal/my-appraisal")}>
                                <i className="fa fa-arrow-left me-2"></i>Back
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa fa-save me-2"></i>}
                                Save & Continue
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(BasicDetailsForm);
