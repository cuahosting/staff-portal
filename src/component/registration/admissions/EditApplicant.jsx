import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { toast } from "react-toastify";
import { showAlert } from "../../common/sweetalert/sweetalert";

function EditApplicant() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [applicant, setApplicant] = useState({
        EntryID: "",
        FirstName: "",
        MiddleName: "",
        Surname: "",
        EmailAddress: "",
        PhoneNumber: "",
    });

    useEffect(() => {
        getApplicantDetails();
    }, [id]);

    const getApplicantDetails = async () => {
        try {
            console.log("Fetching applicant details for ID:", id);
            const { success, data } = await api.get(`registration/admissions/applicant/${id}`);
            console.log("API Response:", { success, data });
            if (success && data) {
                setApplicant({
                    EntryID: id, // Use the URL param id which is the application EntryID
                    FirstName: data.FirstName || "",
                    MiddleName: data.MiddleName || "",
                    Surname: data.Surname || "",
                    EmailAddress: data.EmailAddress || "",
                    PhoneNumber: data.PhoneNumber || "",
                });
            } else {
                toast.error("Failed to load applicant details");
            }
        } catch (error) {
            console.error("Error fetching applicant:", error);
            toast.error("Error loading applicant details. Please ensure backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setApplicant(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!applicant.FirstName.trim()) {
            toast.error("First Name is required");
            return;
        }
        if (!applicant.Surname.trim()) {
            toast.error("Surname is required");
            return;
        }
        if (!applicant.EmailAddress.trim()) {
            toast.error("Email Address is required");
            return;
        }
        if (!applicant.PhoneNumber.trim()) {
            toast.error("Phone Number is required");
            return;
        }

        setSubmitting(true);
        try {
            const { success, data } = await api.post("registration/admissions/update-applicant-profile", applicant);
            if (success && data?.message === "updated") {
                showAlert("Success", "Applicant profile updated successfully!", "success");
                navigate("/registration/admissions");
            } else {
                toast.error(data?.message || "Failed to update applicant profile");
            }
        } catch (error) {
            toast.error("Error updating applicant profile");
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Edit Applicant Profile" items={["Registration", "Admissions", "Edit Applicant"]} />
            <div className="flex-column-fluid">
                <div className="card" style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div className="card-header" style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
                        <h5 style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>
                            <i className="fa fa-user-edit me-2" style={{ color: '#3b82f6' }}></i>
                            Update Applicant Profile
                        </h5>
                    </div>
                    <div className="card-body" style={{ padding: '24px' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label" style={{ fontWeight: '500', color: '#374151' }}>
                                        First Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="FirstName"
                                        className="form-control"
                                        value={applicant.FirstName}
                                        onChange={handleChange}
                                        style={{ borderRadius: '8px', padding: '10px 14px' }}
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label" style={{ fontWeight: '500', color: '#374151' }}>
                                        Middle Name
                                    </label>
                                    <input
                                        type="text"
                                        name="MiddleName"
                                        className="form-control"
                                        value={applicant.MiddleName}
                                        onChange={handleChange}
                                        style={{ borderRadius: '8px', padding: '10px 14px' }}
                                        placeholder="Enter middle name"
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label" style={{ fontWeight: '500', color: '#374151' }}>
                                        Surname <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="Surname"
                                        className="form-control"
                                        value={applicant.Surname}
                                        onChange={handleChange}
                                        style={{ borderRadius: '8px', padding: '10px 14px' }}
                                        placeholder="Enter surname"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label" style={{ fontWeight: '500', color: '#374151' }}>
                                        Email Address <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="EmailAddress"
                                        className="form-control"
                                        value={applicant.EmailAddress}
                                        onChange={handleChange}
                                        style={{ borderRadius: '8px', padding: '10px 14px' }}
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label" style={{ fontWeight: '500', color: '#374151' }}>
                                        Phone Number <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="PhoneNumber"
                                        className="form-control"
                                        value={applicant.PhoneNumber}
                                        onChange={handleChange}
                                        style={{ borderRadius: '8px', padding: '10px 14px' }}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>
                            <hr className="my-4" />
                            <div className="d-flex justify-content-between">
                                <Link
                                    to="/registration/admissions"
                                    className="btn btn-outline-secondary"
                                    style={{ borderRadius: '8px', padding: '10px 20px' }}
                                >
                                    <i className="fa fa-arrow-left me-2"></i>
                                    Back to Admissions
                                </Link>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                    style={{ borderRadius: '8px', padding: '10px 24px' }}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-save me-2"></i>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditApplicant;
