import React, { useEffect, useState } from "react";
import AGTable from "../../common/table/AGTable";
import api from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { formatDateAndTime } from "../../../resources/constants";
import SearchSelect from "../../common/select/SearchSelect";

function ScholarshipAdmissionContent(props) {
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
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkFile, setBulkFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
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
        setIsLoading(true);
        let url = "staff/ac-finance/scholarship-admission/list";
        if (filterStatus === "unused") {
            url = "staff/ac-finance/scholarship-admission/unused";
        }

        const result = await api.get(url, token);
        if (result.success && result.data && Array.isArray(result.data)) {
            setAssignmentList(result.data);
            buildTable(result.data);
        } else if (result.success && result.data?.data) {
            setAssignmentList(result.data.data);
            buildTable(result.data.data);
        } else {
            setAssignmentList([]);
            buildTable([]);
        }
        setIsLoading(false);
    };

    const buildTable = (data) => {
        const rows = [];
        data.forEach((item, index) => {
            rows.push({
                sn: index + 1,
                FullName: item.FullName,
                Email: item.EmailAddress,
                Scholarship: item.ScholarshipName,
                Semester: item.SchoolSemester,
                Status: (
                    <span className={`badge badge-light-${item.IsUsed ? "success" : "warning"}`}>
                        {item.IsUsed ? "Used" : "Unused"}
                    </span>
                ),
                AssignedDate: formatDateAndTime(item.InsertedDate),
                action: (
                    <div className="d-flex justify-content-end flex-shrink-0">
                        {item.IsUsed === 0 && (
                            <>
                                <button
                                    className="btn btn-sm btn-light-info me-2"
                                    onClick={() => onEditClick(item)}
                                >
                                    <i className="fa fa-pencil"></i>
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
            EntryID: item.AdmissionScholarshipID, // Assuming EntryID is mapped to AdmissionScholarshipID in backend response
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
                `staff/ac-finance/scholarship-admission/delete/${item.EntryID}`, // Use EntryID here
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

        // Use EntryID instead of empty check if needed, or check correctly for edit mode
        if (!formData.EntryID) {
            const result = await api.post("staff/ac-finance/scholarship-admission/assign", formData, token);

            if (result.success && result.message === "success") {
                toast.success("Scholarship assigned successfully");
                setShowModal(false);
                resetForm();
                getAssignments();
            } else if (result.message === "exist") {
                showAlert("Warning", "An unused scholarship assignment already exists for this email.", "warning");
            } else {
                toast.error(result.message || "Failed to assign scholarship");
            }
        } else {
            // Update
            const result = await api.patch(
                `staff/ac-finance/scholarship-admission/update/${formData.EntryID}`,
                formData,
                token
            );

            if (result.success && result.message === "success") {
                toast.success("Assignment updated");
                setShowModal(false);
                resetForm();
                getAssignments();
            } else {
                toast.error(result.message || "Failed to update assignment");
            }
        }
    };

    useEffect(() => {
        getAssignments();
        getScholarships();
        getSemesters();
    }, [filterStatus]);

    // Prepare options for SearchSelect
    const scholarshipOptions = scholarshipList.map(s => ({
        value: s.ScholarshipID,
        label: s.Name
    }));

    const semesterOptions = semesterList.map(s => ({
        value: s.SemesterCode,
        label: s.SemesterName || s.SemesterCode
    }));

    return (
        <div className="d-flex flex-column gap-5">
            <PageHeader
                title="Pre-Admission Scholarships"
                buttons={
                    <div className="d-flex align-items-center gap-2 text-nowrap">
                        <select
                            className="form-select w-200px" // Fixed width for cleaner look
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Assignments</option>
                            <option value="unused">Unused Only</option>
                        </select>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowBulkModal(true)}
                        >
                            <i className="fa fa-upload me-1"></i> Bulk Upload
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                        >
                            <i className="fa fa-plus me-1"></i> Assign Scholarship
                        </button>
                    </div>
                }
            />

            <div className="card">
                <div className="card-body">
                    {isLoading ? (
                        <Loader />
                    ) : (
                        <AGTable
                            data={datatable}
                            className="table-responsive"
                            fixedHeader={true}
                        />
                    )}
                </div>
            </div>

            {/* Assign/Edit Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {formData.EntryID ? "Edit Assignment" : "Assign Scholarship (Pre-Admission)"}
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
                                        className="form-control"
                                        placeholder="Applicant's Full Name"
                                        value={formData.FullName}
                                        onChange={onEdit}
                                    />
                                </div>
                                <div className="form-group mb-4">
                                    <label htmlFor="EmailAddress" className="required form-label">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="EmailAddress"
                                        className="form-control"
                                        placeholder="Applicant's Email"
                                        value={formData.EmailAddress}
                                        onChange={onEdit}
                                    />
                                </div>
                                <div className="form-group mb-4">
                                    <SearchSelect
                                        id="ScholarshipID"
                                        label="Scholarship"
                                        required
                                        options={scholarshipOptions}
                                        value={scholarshipOptions.find(opt => opt.value === formData.ScholarshipID) || null}
                                        onChange={(selected) => setFormData({ ...formData, ScholarshipID: selected ? selected.value : "" })}
                                        placeholder="Select Scholarship"
                                    />
                                </div>

                                <div className="form-group mb-4">
                                    <SearchSelect
                                        id="SchoolSemester"
                                        label="Admission Semester"
                                        required
                                        options={semesterOptions}
                                        value={semesterOptions.find(opt => opt.value === formData.SchoolSemester) || null}
                                        onChange={(selected) => setFormData({ ...formData, SchoolSemester: selected ? selected.value : "" })}
                                        placeholder="Select Semester"
                                    />
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

            {/* Bulk Upload Modal */}
            {showBulkModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Bulk Upload Scholarships</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowBulkModal(false);
                                        setBulkFile(null);
                                        setPreviewData([]);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info mb-4">
                                    <div className="d-flex align-items-center">
                                        <i className="fa fa-info-circle fs-4 me-2"></i>
                                        <span>Use this to assign scholarships to multiple students at once via Excel.</span>
                                    </div>
                                    <div className="mt-2">
                                        <small>Required Columns: <strong>FullName, Email</strong></small>
                                    </div>
                                    <div className="mt-2 text-end">
                                        <button className="btn btn-sm btn-link p-0" onClick={() => window.open('/template/scholarship_upload_template.xlsx')}>
                                            Download Template
                                        </button>
                                    </div>
                                </div>

                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <SearchSelect
                                            id="BulkScholarshipID"
                                            label="Scholarship"
                                            required
                                            options={scholarshipOptions}
                                            value={scholarshipOptions.find(opt => opt.value === formData.ScholarshipID) || null}
                                            onChange={(selected) => setFormData({ ...formData, ScholarshipID: selected ? selected.value : "" })}
                                            placeholder="Select Scholarship"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <SearchSelect
                                            id="BulkSchoolSemester"
                                            label="Admission Semester"
                                            required
                                            options={semesterOptions}
                                            value={semesterOptions.find(opt => opt.value === formData.SchoolSemester) || null}
                                            onChange={(selected) => setFormData({ ...formData, SchoolSemester: selected ? selected.value : "" })}
                                            placeholder="Select Semester"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label required">Select Excel File</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept=".xlsx, .xls"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            setBulkFile(file);
                                            if (file) {
                                                import("xlsx").then(xlsx => {
                                                    const reader = new FileReader();
                                                    reader.onload = (evt) => {
                                                        const bstr = evt.target.result;
                                                        const wb = xlsx.read(bstr, { type: 'binary' });
                                                        const wsname = wb.SheetNames[0];
                                                        const ws = wb.Sheets[wsname];
                                                        const data = xlsx.utils.sheet_to_json(ws);
                                                        setPreviewData(data);
                                                    };
                                                    reader.readAsBinaryString(file);
                                                });
                                            } else {
                                                setPreviewData([]);
                                            }
                                        }}
                                    />
                                    <div className="form-text">Supported formats: .xlsx, .xls</div>
                                </div>

                                {previewData.length > 0 && (
                                    <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        <table className="table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3">
                                            <thead>
                                                <tr className="fw-bold text-muted">
                                                    <th>Raw Data Preview (Top {previewData.length} rows)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewData.map((row, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="d-flex flex-column">
                                                                <span className="fw-bold text-dark">{row['FullName'] || row['Full Name'] || row['Name'] || 'N/A'}</span>
                                                                <span className="text-muted small">{row['Email'] || row['EmailAddress'] || 'N/A'}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() => {
                                        setShowBulkModal(false);
                                        setBulkFile(null);
                                        setPreviewData([]);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    disabled={!bulkFile || !formData.ScholarshipID || !formData.SchoolSemester}
                                    onClick={async () => {
                                        if (!bulkFile || !formData.ScholarshipID || !formData.SchoolSemester) {
                                            toast.error("Please select a file, scholarship, and semester");
                                            return;
                                        }

                                        const uploadData = new FormData();
                                        uploadData.append('file', bulkFile);
                                        uploadData.append('InsertedBy', staffID);
                                        uploadData.append('ScholarshipID', formData.ScholarshipID);
                                        uploadData.append('SchoolSemester', formData.SchoolSemester);

                                        setIsLoading(true);
                                        try {
                                            const result = await api.post("staff/ac-finance/scholarship-admission/bulk-upload", uploadData, token, {
                                                headers: { 'Content-Type': 'multipart/form-data' }
                                            });
                                            if (result.success) {
                                                toast.success(result.message || "Bulk upload processed successfully");
                                                setShowBulkModal(false);
                                                setBulkFile(null);
                                                setPreviewData([]);
                                                getAssignments();
                                            } else {
                                                toast.error(result.message || "Failed to process upload");
                                            }
                                        } catch (error) {
                                            console.error(error);
                                            toast.error("An error occurred during upload");
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }}
                                >
                                    Upload & Process
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ScholarshipAdmissionContent;
