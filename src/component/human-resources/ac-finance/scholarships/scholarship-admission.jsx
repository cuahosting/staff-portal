import React, { useEffect, useState } from "react";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { formatDateAndTime } from "../../../../resources/constants";

function ScholarshipAdmission(props) {
    const token = props.loginData[0]?.token;
    const staffID = props.loginData[0]?.StaffID;

    const [isLoading, setIsLoading] = useState(true);
    const [assignmentList, setAssignmentList] = useState([]);
    const [scholarshipList, setScholarshipList] = useState([]);
    const [semesterList, setSemesterList] = useState([]);

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Full Name", field: "FullName" },
            { label: "Email", field: "Email" },
            { label: "Scholarship", field: "Scholarship" },
            { label: "Semester", field: "Semester" },
            { label: "Status", field: "Status" },
            { label: "Assigned Date", field: "AssignedDate" },
            { label: "Action", field: "action" },
        ],
        rows: [],
    });

    const [formData, setFormData] = useState({
        FullName: "",
        EmailAddress: "",
        ScholarshipID: "",
        SchoolSemester: "",
        InsertedBy: staffID,
        EntryID: "",
    });

    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");

    const resetForm = () => {
        setFormData({
            FullName: "",
            EmailAddress: "",
            ScholarshipID: "",
            SchoolSemester: "",
            InsertedBy: staffID,
            EntryID: "",
        });
    };

    const getAssignments = async () => {
        const endpoint = filterStatus === "unused"
            ? "staff/ac-finance/scholarship-admission/unused"
            : "staff/ac-finance/scholarship-admission/list";

        const result = await api.get(endpoint, token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setAssignmentList(data);
            buildTable(data);
        }
    };

    const buildTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            rows.push({
                sn: index + 1,
                FullName: <span className="fw-bold">{item.FullName}</span>,
                Email: item.EmailAddress,
                Scholarship: (
                    <span className="badge badge-light-primary">{item.ScholarshipName}</span>
                ),
                Semester: item.SemesterName || item.SchoolSemester,
                Status: item.IsUsed === 1 ? (
                    <span className="badge badge-light-success">Used</span>
                ) : (
                    <span className="badge badge-light-warning">Unused</span>
                ),
                AssignedDate: formatDateAndTime(item.InsertedDate, "date"),
                action: (
                    <div className="d-flex gap-2">
                        {item.IsUsed !== 1 && (
                            <>
                                <button
                                    className="btn btn-sm btn-light-primary"
                                    onClick={() => onEditClick(item)}
                                >
                                    <i className="fa fa-edit"></i>
                                </button>
                                <button
                                    className="btn btn-sm btn-light-danger"
                                    onClick={() => onDelete(item)}
                                >
                                    <i className="fa fa-trash"></i>
                                </button>
                            </>
                        )}
                        {item.IsUsed === 1 && (
                            <span className="text-muted small">Converted to student</span>
                        )}
                    </div>
                ),
            });
        });

        setDatatable({ ...datatable, rows });
    };

    const getScholarships = async () => {
        const result = await api.get("staff/ac-finance/scholarships/active", token);

        if (result.success && result.data?.data) {
            setScholarshipList(result.data.data);
        }
    };

    const getSemesters = async () => {
        const result = await api.get("staff/registration/semester/list", token, null, {}, false);

        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setSemesterList(data);
        }
    };

    const onEditClick = (item) => {
        setFormData({
            FullName: item.FullName,
            EmailAddress: item.EmailAddress,
            ScholarshipID: item.ScholarshipID,
            SchoolSemester: item.SchoolSemester,
            InsertedBy: staffID,
            EntryID: item.AdmissionScholarshipID,
        });
        setShowModal(true);
    };

    const onDelete = async (item) => {
        const confirmed = await showAlert(
            "DELETE",
            "Delete this pre-admission scholarship assignment?",
            "warning"
        );

        if (confirmed) {
            const result = await api.delete(
                `staff/ac-finance/scholarship-admission/delete/${item.AdmissionScholarshipID}`,
                token
            );

            if (result.success && result.message === "success") {
                toast.success("Assignment deleted");
                getAssignments();
            }
        }
    };

    const onEdit = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmit = async () => {
        if (formData.FullName.trim() === "") {
            showAlert("ERROR", "Please enter the full name", "error");
            return;
        }
        if (formData.EmailAddress.trim() === "") {
            showAlert("ERROR", "Please enter the email address", "error");
            return;
        }
        if (!formData.ScholarshipID) {
            showAlert("ERROR", "Please select a scholarship", "error");
            return;
        }
        if (!formData.SchoolSemester) {
            showAlert("ERROR", "Please select a semester", "error");
            return;
        }

        if (formData.EntryID === "") {
            const result = await api.post("staff/ac-finance/scholarship-admission/assign", formData, token);

            if (result.success && result.message === "success") {
                toast.success("Scholarship assigned successfully");
                setShowModal(false);
                resetForm();
                getAssignments();
            } else if (result.message === "exist") {
                showAlert("DUPLICATE", "This email already has a scholarship assignment for this semester", "error");
            }
        } else {
            const result = await api.patch(
                `staff/ac-finance/scholarship-admission/update/${formData.EntryID}`,
                { ...formData, UpdatedBy: staffID },
                token
            );

            if (result.success && result.message === "success") {
                toast.success("Assignment updated successfully");
                setShowModal(false);
                resetForm();
                getAssignments();
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getAssignments(), getScholarships(), getSemesters()]);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            getAssignments();
        }
    }, [filterStatus]);

    if (isLoading) return <Loader />;

    return (
        <>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Pre-Admission Scholarships</h4>
                    <p className="text-muted mb-0">
                        Assign scholarships to applicants before they become students
                    </p>
                </div>
                <div className="d-flex gap-3">
                    <select
                        className="form-select form-select-solid w-150px"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="unused">Unused Only</option>
                    </select>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                    >
                        <i className="fa fa-plus me-2"></i>
                        Assign Scholarship
                    </button>
                </div>
            </div>

            {/* Info Alert */}
            <div className="alert alert-info d-flex align-items-center mb-4">
                <i className="fa fa-info-circle me-3 fs-4"></i>
                <div>
                    Pre-admission scholarships are assigned to applicants by email. When the applicant
                    enrolls as a student, their scholarship will be automatically applied if the email matches.
                </div>
            </div>

            {/* Table */}
            <AGTable data={datatable} />

            {/* Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {formData.EntryID ? "Edit Assignment" : "Assign Pre-Admission Scholarship"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group mb-4">
                                    <label htmlFor="FullName" className="required form-label">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="FullName"
                                        onChange={onEdit}
                                        value={formData.FullName}
                                        className="form-control form-control-solid"
                                        placeholder="Enter applicant's full name"
                                    />
                                </div>

                                <div className="form-group mb-4">
                                    <label htmlFor="EmailAddress" className="required form-label">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="EmailAddress"
                                        onChange={onEdit}
                                        value={formData.EmailAddress}
                                        className="form-control form-control-solid"
                                        placeholder="Enter applicant's email"
                                    />
                                    <small className="text-muted">
                                        This email will be matched when the student enrolls
                                    </small>
                                </div>

                                <div className="form-group mb-4">
                                    <label htmlFor="ScholarshipID" className="required form-label">
                                        Scholarship
                                    </label>
                                    <select
                                        id="ScholarshipID"
                                        className="form-select form-select-solid"
                                        value={formData.ScholarshipID}
                                        onChange={onEdit}
                                    >
                                        <option value="">Select Scholarship</option>
                                        {scholarshipList.map((s) => (
                                            <option key={s.ScholarshipID} value={s.ScholarshipID}>
                                                {s.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group mb-4">
                                    <label htmlFor="SchoolSemester" className="required form-label">
                                        Admission Semester
                                    </label>
                                    <select
                                        id="SchoolSemester"
                                        className="form-select form-select-solid"
                                        value={formData.SchoolSemester}
                                        onChange={onEdit}
                                    >
                                        <option value="">Select Semester</option>
                                        {semesterList.map((s) => (
                                            <option key={s.SemesterCode} value={s.SemesterCode}>
                                                {s.SemesterName || s.SemesterCode}
                                            </option>
                                        ))}
                                    </select>
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
                                    {formData.EntryID ? "Update" : "Assign"} Scholarship
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ScholarshipAdmission;
