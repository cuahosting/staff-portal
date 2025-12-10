import React, { useEffect, useState } from "react";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";

function AcademicScholarships(props) {
    const token = props.loginData[0]?.token;
    const staffID = props.loginData[0]?.StaffID;

    const [isLoading, setIsLoading] = useState(true);
    const [tierList, setTierList] = useState([]);
    const [scholarshipList, setScholarshipList] = useState([]);
    const [qualifiedStudents, setQualifiedStudents] = useState([]);

    const [tierDatatable, setTierDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Tier Name", field: "TierName" },
            { label: "Min GPA", field: "MinGPA" },
            { label: "Max GPA", field: "MaxGPA" },
            { label: "Scholarship", field: "Scholarship" },
            { label: "Status", field: "Status" },
            { label: "Action", field: "action" },
        ],
        rows: [],
    });

    const [studentDatatable, setStudentDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Student ID", field: "StudentID" },
            { label: "Full Name", field: "FullName" },
            { label: "Programme", field: "Programme" },
            { label: "GPA", field: "GPA" },
            { label: "Tier", field: "Tier" },
            { label: "Scholarship", field: "Scholarship" },
            { label: "Status", field: "Status" },
        ],
        rows: [],
    });

    const [formData, setFormData] = useState({
        TierName: "",
        MinGPA: "",
        MaxGPA: "",
        ScholarshipID: "",
        InsertedBy: staffID,
        EntryID: "",
    });

    const [showModal, setShowModal] = useState(false);
    const [activeView, setActiveView] = useState("tiers"); // tiers or students

    const resetForm = () => {
        setFormData({
            TierName: "",
            MinGPA: "",
            MaxGPA: "",
            ScholarshipID: "",
            InsertedBy: staffID,
            EntryID: "",
        });
    };

    const getTiers = async () => {
        const result = await api.get("staff/ac-finance/academic-scholarships/tiers", token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setTierList(data);
            buildTierTable(data);
        }
    };

    const buildTierTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            rows.push({
                sn: index + 1,
                TierName: <span className="fw-bold">{item.TierName}</span>,
                MinGPA: item.MinGPA.toFixed(2),
                MaxGPA: item.MaxGPA.toFixed(2),
                Scholarship: (
                    <span className="badge badge-light-primary">
                        {item.ScholarshipName}
                    </span>
                ),
                Status: item.IsActive === 1 ? (
                    <span className="badge badge-light-success">Active</span>
                ) : (
                    <span className="badge badge-light-danger">Inactive</span>
                ),
                action: (
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-light-primary"
                            onClick={() => onEditTier(item)}
                        >
                            <i className="fa fa-edit"></i>
                        </button>
                        <button
                            className={`btn btn-sm ${item.IsActive === 1 ? "btn-light-warning" : "btn-light-success"}`}
                            onClick={() => onToggleTierStatus(item)}
                        >
                            <i className={`fa ${item.IsActive === 1 ? "fa-ban" : "fa-check"}`}></i>
                        </button>
                        <button
                            className="btn btn-sm btn-light-danger"
                            onClick={() => onDeleteTier(item)}
                        >
                            <i className="fa fa-trash"></i>
                        </button>
                    </div>
                ),
            });
        });

        setTierDatatable({ ...tierDatatable, rows });
    };

    const getQualifiedStudents = async () => {
        const result = await api.get("staff/ac-finance/academic-scholarships/qualified-students", token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setQualifiedStudents(data);
            buildStudentTable(data);
        }
    };

    const buildStudentTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            rows.push({
                sn: index + 1,
                StudentID: item.StudentID,
                FullName: <span className="fw-bold">{item.FullName}</span>,
                Programme: item.CourseName,
                GPA: <span className="badge badge-light-info">{item.GPA?.toFixed(2) || "N/A"}</span>,
                Tier: item.TierName || "N/A",
                Scholarship: item.ScholarshipName ? (
                    <span className="badge badge-light-primary">{item.ScholarshipName}</span>
                ) : (
                    <span className="text-muted">-</span>
                ),
                Status: item.IsAssigned ? (
                    <span className="badge badge-light-success">Assigned</span>
                ) : (
                    <span className="badge badge-light-warning">Pending</span>
                ),
            });
        });

        setStudentDatatable({ ...studentDatatable, rows });
    };

    const getScholarships = async () => {
        const result = await api.get("staff/ac-finance/scholarships/active", token);

        if (result.success && result.data?.data) {
            setScholarshipList(result.data.data);
        }
    };

    const onEditTier = (item) => {
        setFormData({
            TierName: item.TierName,
            MinGPA: item.MinGPA,
            MaxGPA: item.MaxGPA,
            ScholarshipID: item.ScholarshipID,
            InsertedBy: staffID,
            EntryID: item.AcademicScholarshipTierID,
        });
        setShowModal(true);
    };

    const onToggleTierStatus = async (item) => {
        const action = item.IsActive === 1 ? "deactivate" : "activate";
        const confirmed = await showAlert(
            "CONFIRM",
            `Are you sure you want to ${action} this tier?`,
            "warning"
        );

        if (confirmed) {
            const result = await api.patch(
                `staff/ac-finance/academic-scholarships/tier/update/${item.AcademicScholarshipTierID}`,
                { IsActive: item.IsActive === 1 ? 0 : 1, UpdatedBy: staffID },
                token
            );

            if (result.success && result.message === "success") {
                toast.success(`Tier ${action}d successfully`);
                getTiers();
            }
        }
    };

    const onDeleteTier = async (item) => {
        const confirmed = await showAlert(
            "DELETE",
            "Delete this GPA tier? Students assigned via this tier will not be affected.",
            "warning"
        );

        if (confirmed) {
            const result = await api.delete(
                `staff/ac-finance/academic-scholarships/tier/delete/${item.AcademicScholarshipTierID}`,
                token
            );

            if (result.success && result.message === "success") {
                toast.success("Tier deleted successfully");
                getTiers();
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
        if (formData.TierName.trim() === "") {
            showAlert("ERROR", "Please enter a tier name", "error");
            return;
        }
        if (formData.MinGPA === "" || parseFloat(formData.MinGPA) < 0) {
            showAlert("ERROR", "Please enter a valid minimum GPA", "error");
            return;
        }
        if (formData.MaxGPA === "" || parseFloat(formData.MaxGPA) < 0) {
            showAlert("ERROR", "Please enter a valid maximum GPA", "error");
            return;
        }
        if (parseFloat(formData.MinGPA) >= parseFloat(formData.MaxGPA)) {
            showAlert("ERROR", "Minimum GPA must be less than maximum GPA", "error");
            return;
        }
        if (!formData.ScholarshipID) {
            showAlert("ERROR", "Please select a scholarship", "error");
            return;
        }

        const payload = {
            ...formData,
            MinGPA: parseFloat(formData.MinGPA),
            MaxGPA: parseFloat(formData.MaxGPA),
        };

        if (formData.EntryID === "") {
            const result = await api.post("staff/ac-finance/academic-scholarships/tier/add", payload, token);

            if (result.success && result.message === "success") {
                toast.success("GPA tier added successfully");
                setShowModal(false);
                resetForm();
                getTiers();
            } else if (result.message === "overlap") {
                showAlert("OVERLAP", "This GPA range overlaps with an existing tier", "error");
            }
        } else {
            const result = await api.patch(
                `staff/ac-finance/academic-scholarships/tier/update/${formData.EntryID}`,
                { ...payload, UpdatedBy: staffID },
                token
            );

            if (result.success && result.message === "success") {
                toast.success("GPA tier updated successfully");
                setShowModal(false);
                resetForm();
                getTiers();
            }
        }
    };

    const processAcademicScholarships = async () => {
        const confirmed = await showAlert(
            "PROCESS SCHOLARSHIPS",
            "This will automatically assign scholarships to all qualified students based on their GPA. Continue?",
            "warning"
        );

        if (confirmed) {
            const result = await api.post(
                "staff/ac-finance/academic-scholarships/process",
                { InsertedBy: staffID },
                token
            );

            if (result.success) {
                toast.success(`${result.data?.assigned || 0} students assigned scholarships`);
                getQualifiedStudents();
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getTiers(), getScholarships(), getQualifiedStudents()]);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading) return <Loader />;

    return (
        <>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Academic (GPA-Based) Scholarships</h4>
                    <p className="text-muted mb-0">
                        Define GPA tiers and automatically assign scholarships to qualifying students
                    </p>
                </div>
                <div className="d-flex gap-3">
                    <div className="btn-group">
                        <button
                            className={`btn ${activeView === "tiers" ? "btn-primary" : "btn-light"}`}
                            onClick={() => setActiveView("tiers")}
                        >
                            <i className="fa fa-layer-group me-2"></i>GPA Tiers
                        </button>
                        <button
                            className={`btn ${activeView === "students" ? "btn-primary" : "btn-light"}`}
                            onClick={() => setActiveView("students")}
                        >
                            <i className="fa fa-users me-2"></i>Qualified Students
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Alert */}
            <div className="alert alert-info d-flex align-items-center mb-4">
                <i className="fa fa-info-circle me-3 fs-4"></i>
                <div>
                    Academic scholarships are automatically assigned based on student GPA. Define GPA tiers
                    below, then process to assign scholarships to all qualifying students.
                </div>
            </div>

            {activeView === "tiers" ? (
                <>
                    {/* Tier Actions */}
                    <div className="d-flex justify-content-between mb-4">
                        <div></div>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-success"
                                onClick={processAcademicScholarships}
                            >
                                <i className="fa fa-cogs me-2"></i>
                                Process Scholarships
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    resetForm();
                                    setShowModal(true);
                                }}
                            >
                                <i className="fa fa-plus me-2"></i>
                                Add GPA Tier
                            </button>
                        </div>
                    </div>

                    {/* Tiers Table */}
                    <AGTable data={tierDatatable} />
                </>
            ) : (
                <>
                    {/* Students Stats */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-4">
                            <div className="card bg-light-primary">
                                <div className="card-body py-3">
                                    <div className="d-flex align-items-center">
                                        <i className="fa fa-users fs-2 text-primary me-3"></i>
                                        <div>
                                            <div className="fs-4 fw-bold">{qualifiedStudents.length}</div>
                                            <div className="text-muted small">Total Qualified</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card bg-light-success">
                                <div className="card-body py-3">
                                    <div className="d-flex align-items-center">
                                        <i className="fa fa-check-circle fs-2 text-success me-3"></i>
                                        <div>
                                            <div className="fs-4 fw-bold">
                                                {qualifiedStudents.filter(s => s.IsAssigned).length}
                                            </div>
                                            <div className="text-muted small">Assigned</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card bg-light-warning">
                                <div className="card-body py-3">
                                    <div className="d-flex align-items-center">
                                        <i className="fa fa-clock fs-2 text-warning me-3"></i>
                                        <div>
                                            <div className="fs-4 fw-bold">
                                                {qualifiedStudents.filter(s => !s.IsAssigned).length}
                                            </div>
                                            <div className="text-muted small">Pending</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Students Table */}
                    <AGTable data={studentDatatable} />
                </>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {formData.EntryID ? "Edit GPA Tier" : "Add GPA Tier"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group mb-4">
                                    <label htmlFor="TierName" className="required form-label">
                                        Tier Name
                                    </label>
                                    <input
                                        type="text"
                                        id="TierName"
                                        onChange={onEdit}
                                        value={formData.TierName}
                                        className="form-control form-control-solid"
                                        placeholder="e.g., First Class, Second Class Upper"
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-4">
                                            <label htmlFor="MinGPA" className="required form-label">
                                                Minimum GPA
                                            </label>
                                            <input
                                                type="number"
                                                id="MinGPA"
                                                onChange={onEdit}
                                                value={formData.MinGPA}
                                                className="form-control form-control-solid"
                                                placeholder="e.g., 3.50"
                                                min="0"
                                                max="5"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group mb-4">
                                            <label htmlFor="MaxGPA" className="required form-label">
                                                Maximum GPA
                                            </label>
                                            <input
                                                type="number"
                                                id="MaxGPA"
                                                onChange={onEdit}
                                                value={formData.MaxGPA}
                                                className="form-control form-control-solid"
                                                placeholder="e.g., 4.00"
                                                min="0"
                                                max="5"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group mb-4">
                                    <label htmlFor="ScholarshipID" className="required form-label">
                                        Scholarship to Assign
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
                                    {formData.EntryID ? "Update" : "Add"} Tier
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AcademicScholarships;
