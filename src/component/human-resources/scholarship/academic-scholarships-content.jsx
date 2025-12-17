import React, { useEffect, useState } from "react";
import AGTable from "../../common/table/AGTable";
import api from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";

function AcademicScholarshipsContent(props) {
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
                TierName: <span className="fw-bold">{item.TierName || `Tier ${index + 1}`}</span>,
                MinGPA: (item.MinGPA ?? item.minGPA)?.toFixed(2) || "N/A",
                MaxGPA: (item.MaxGPA ?? item.maxGPA)?.toFixed(2) || "N/A",
                Scholarship: (
                    <span className="badge badge-light-primary">
                        {item.ScholarshipName || `${item.percentage || 0}%`}
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

    const calculateTierName = (gpa) => {
        if (!gpa) return "N/A";
        const val = parseFloat(gpa);
        if (val >= 4.50) return "First Class";
        if (val >= 3.50) return "Second Class Upper";
        if (val >= 2.50) return "Second Class Lower";
        if (val >= 2.00) return "Third Class";
        return "N/A";
    };

    const getQualifiedStudents = async () => {
        try {
            const result = await api.get("staff/ac-finance/academic-scholarships/qualified-students", token);

            if (result.success && result.data?.data) {
                const data = result.data.data;
                setQualifiedStudents(data);
                buildStudentTable(data);
            }
        } catch (error) {
            console.error("Error fetching qualified students:", error);
        }
    };

    const buildStudentTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            rows.push({
                sn: index + 1,
                StudentID: item.StudentID,
                FullName: <span className="fw-bold">{item.StudentName || item.FullName}</span>,
                Programme: item.CourseName,
                GPA: <span className="badge badge-light-info">{item.GPA ? parseFloat(item.GPA).toFixed(2) : "N/A"}</span>,
                Tier: item.TierName || `${calculateTierName(item.GPA) || "N/A"}`,
                Scholarship: item.ScholarshipName ? (
                    <span className="badge badge-light-primary">{item.ScholarshipName}</span>
                ) : (
                    <span className="badge badge-light-primary">{item.ScholarshipPercentage ? `${item.ScholarshipPercentage}%` : "0%"}</span>
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
        try {
            const result = await api.get("staff/ac-finance/scholarships/active", token);
            if (result.success && result.data?.data) {
                setScholarshipList(result.data.data);
            }
        } catch (error) {
            console.error("Error fetching scholarships", error);
        }
    };

    const onEdit = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const onEditTier = (item) => {
        setFormData({
            TierName: "", // Backend tiers don't have names
            MinGPA: item.minGPA,
            MaxGPA: item.maxGPA,
            ScholarshipID: "",
            EntryID: "1" // Dummy ID to trigger 'Update' mode in modal
        });
        setShowModal(true);
    };

    const onToggleTierStatus = (item) => {
        toast.info("System-defined tiers cannot be modified.");
    };

    const onDeleteTier = (item) => {
        toast.info("System-defined tiers cannot be deleted.");
    };

    const onSubmit = () => {
        toast.info("Modifying system tiers is not currently supported.");
        setShowModal(false);
    };

    const processAcademicScholarships = async () => {
        if (qualifiedStudents.length === 0) {
            toast.warning("No qualified students to process.");
            return;
        }

        const confirm = await showAlert({
            title: "Process Scholarships?",
            text: `This will assign academic scholarships to ${qualifiedStudents.length} eligible students.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Process"
        });

        if (confirm.isConfirmed) {
            setIsLoading(true);
            try {
                // Fetch current semester
                const semResult = await api.get("staff/settings/dashboard/current_semester", token);
                const semester = semResult.data?.data?.SemesterCode || semResult.data?.SemesterCode;

                if (!semester) {
                    throw new Error("Could not determine current semester");
                }

                const payload = {
                    students: qualifiedStudents.map(s => ({ StudentID: s.StudentID, GPA: s.GPA })),
                    SchoolSemesterUsed: semester,
                    InsertedBy: staffID
                };

                const result = await api.post("staff/ac-finance/academic-scholarships/award-bulk", payload, token);

                if (result.success || result.data?.success) {
                    toast.success("Scholarships processed successfully!");
                    getQualifiedStudents(); // Refresh list
                } else {
                    toast.error("Failed to process scholarships.");
                }
            } catch (error) {
                console.error("Error processing scholarships:", error);
                toast.error("An error occurred while processing.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([getTiers(), getScholarships(), getQualifiedStudents()]);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Some data failed to load");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) return <Loader />;

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Academic (GPA) Scholarships"
                items={["Human Resources", "Scholarship", "Academic (GPA)"]}
                buttons={
                    <div className="d-flex gap-2">
                        {/* View Switcher */}
                        <div className="btn-group me-2">
                            <button
                                className={`btn btn-sm ${activeView === "tiers" ? "btn-primary" : "btn-light"}`}
                                onClick={() => setActiveView("tiers")}
                            >
                                <i className="fa fa-layer-group me-2"></i>GPA Tiers
                            </button>
                            <button
                                className={`btn btn-sm ${activeView === "students" ? "btn-primary" : "btn-light"}`}
                                onClick={() => setActiveView("students")}
                            >
                                <i className="fa fa-users me-2"></i>Qualified Students
                            </button>
                        </div>

                        {/* Actions for Tiers View */}
                        {activeView === "tiers" && (
                            <>
                                <button
                                    className="btn btn-sm btn-light-success"
                                    onClick={processAcademicScholarships}
                                >
                                    <i className="fa fa-cogs me-2"></i>
                                    Process
                                </button>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => {
                                        resetForm();
                                        setShowModal(true);
                                    }}
                                >
                                    <i className="fa fa-plus me-2"></i>
                                    Add Tier
                                </button>
                            </>
                        )}
                    </div>
                }
            />

            <div className="flex-column-fluid">
                {/* Info Alert */}
                <div className="alert alert-info d-flex align-items-center mb-4">
                    <i className="fa fa-info-circle me-3 fs-4"></i>
                    <div>
                        Academic scholarships are automatically assigned based on student GPA. Define GPA tiers
                        below, then process to assign scholarships to all qualifying students.
                    </div>
                </div>

                {activeView === "tiers" ? (
                    <div className="card">
                        <div className="card-body py-4">
                            <AGTable data={tierDatatable} />
                        </div>
                    </div>
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
                        <div className="card">
                            <div className="card-body py-4">
                                <AGTable data={studentDatatable} />
                            </div>
                        </div>
                    </>
                )}
            </div>

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
        </div>
    );
}

export default AcademicScholarshipsContent;
