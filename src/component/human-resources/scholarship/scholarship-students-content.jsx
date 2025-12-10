import React, { useEffect, useState } from "react";
import AGTable from "../../common/table/AGTable";
import api from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { formatDateAndTime } from "../../../resources/constants";
import SearchSelect from "../../common/select/SearchSelect";

function ScholarshipStudentsContent(props) {
    const token = props.loginData[0]?.token;
    const staffID = props.loginData[0]?.StaffID;

    const [isLoading, setIsLoading] = useState(true);
    const [enrollmentList, setEnrollmentList] = useState([]);
    const [scholarshipList, setScholarshipList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [semesterList, setSemesterList] = useState([]);

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Student", field: "Student" },
            { label: "Scholarship", field: "Scholarship" },
            { label: "Semester", field: "Semester" },
            { label: "Status", field: "Status" },
            { label: "Enrolled Date", field: "EnrolledDate" },
            { label: "Action", field: "action" },
        ],
        rows: [],
    });

    const [formData, setFormData] = useState({
        ScholarshipID: "",
        StudentID: "",
        FullName: "",
        EmailAddress: "",
        Semester: "",
        InsertedBy: staffID,
    });

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filterScholarship, setFilterScholarship] = useState("");

    const resetForm = () => {
        setFormData({
            ScholarshipID: "",
            StudentID: "",
            FullName: "",
            EmailAddress: "",
            Semester: "",
            InsertedBy: staffID,
        });
        setSelectedStudent(null);
    };

    const getEnrollments = async () => {
        const result = await api.get("staff/ac-finance/scholarship-students/list", token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setEnrollmentList(data);
            buildTable(data);
        }
    };

    const buildTable = (data) => {
        let filtered = data;
        if (filterScholarship) {
            filtered = data.filter((item) => item.ScholarshipID === parseInt(filterScholarship));
        }

        let rows = [];
        filtered.forEach((item, index) => {
            rows.push({
                sn: index + 1,
                Student: (
                    <div>
                        <span className="fw-bold">{item.FullName || item.StudentName}</span>
                        <br />
                        <small className="text-muted">{item.StudentID}</small>
                        {item.EmailAddress && (
                            <>
                                <br />
                                <small className="text-muted">{item.EmailAddress}</small>
                            </>
                        )}
                    </div>
                ),
                Scholarship: (
                    <span className="badge badge-light-primary">{item.ScholarshipName}</span>
                ),
                Semester: item.SemesterName || item.Semester,
                Status: item.IsActive === 1 ? (
                    <span className="badge badge-light-success">Active</span>
                ) : (
                    <span className="badge badge-light-danger">Inactive</span>
                ),
                EnrolledDate: formatDateAndTime(item.InsertedDate, "date"),
                action: (
                    <div className="d-flex gap-2">
                        {item.IsActive === 1 ? (
                            <button
                                className="btn btn-sm btn-light-warning"
                                onClick={() => onDeactivate(item)}
                            >
                                <i className="fa fa-ban"></i> Deactivate
                            </button>
                        ) : (
                            <button
                                className="btn btn-sm btn-light-success"
                                onClick={() => onActivate(item)}
                            >
                                <i className="fa fa-check"></i> Activate
                            </button>
                        )}
                        <button
                            className="btn btn-sm btn-light-danger"
                            onClick={() => onRemove(item)}
                        >
                            <i className="fa fa-trash"></i>
                        </button>
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

    const getStudents = async () => {
        const result = await api.get("staff/student/student-manager/student/list", token, null, {}, false);

        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            const options = data.map((student) => ({
                value: student.StudentID,
                label: `${student.StudentID} - ${student.FirstName} ${student.MiddleName || ""} ${student.Surname}`,
                fullName: `${student.FirstName} ${student.MiddleName || ""} ${student.Surname}`.trim(),
                email: student.EmailAddress,
                ...student,
            }));
            setStudentList(options);
        }
    };

    const getSemesters = async () => {
        const result = await api.get("staff/registration/semester/list", token, null, {}, false);

        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setSemesterList(data);
        }
    };

    const onStudentSelect = (selected) => {
        setSelectedStudent(selected);
        if (selected) {
            setFormData({
                ...formData,
                StudentID: selected.value,
                FullName: selected.fullName,
                EmailAddress: selected.email || "",
            });
        } else {
            setFormData({
                ...formData,
                StudentID: "",
                FullName: "",
                EmailAddress: "",
            });
        }
    };

    const onActivate = async (item) => {
        const result = await api.patch(
            `staff/ac-finance/scholarship-students/activate/${item.ScholarshipStudentID}`,
            { UpdatedBy: staffID },
            token
        );

        if (result.success && result.message === "success") {
            toast.success("Enrollment activated");
            getEnrollments();
        }
    };

    const onDeactivate = async (item) => {
        const confirmed = await showAlert(
            "DEACTIVATE",
            "Deactivate this scholarship enrollment?",
            "warning"
        );

        if (confirmed) {
            const result = await api.patch(
                `staff/ac-finance/scholarship-students/deactivate/${item.ScholarshipStudentID}`,
                { UpdatedBy: staffID },
                token
            );

            if (result.success && result.message === "success") {
                toast.success("Enrollment deactivated");
                getEnrollments();
            }
        }
    };

    const onRemove = async (item) => {
        const confirmed = await showAlert(
            "REMOVE ENROLLMENT",
            "Are you sure you want to remove this student from the scholarship?",
            "warning"
        );

        if (confirmed) {
            const result = await api.delete(
                `staff/ac-finance/scholarship-students/remove/${item.ScholarshipStudentID}`,
                token
            );

            if (result.success && result.message === "success") {
                toast.success("Enrollment removed");
                getEnrollments();
            }
        }
    };

    const onSubmit = async () => {
        if (!formData.ScholarshipID) {
            showAlert("ERROR", "Please select a scholarship", "error");
            return;
        }
        if (!formData.StudentID) {
            showAlert("ERROR", "Please select a student", "error");
            return;
        }
        if (!formData.Semester) {
            showAlert("ERROR", "Please select a semester", "error");
            return;
        }

        const result = await api.post("staff/ac-finance/scholarship-students/enroll", formData, token);

        if (result.success && result.message === "success") {
            toast.success("Student enrolled successfully");
            setShowModal(false);
            resetForm();
            getEnrollments();
        } else if (result.message === "exist") {
            showAlert("DUPLICATE", "This student is already enrolled in this scholarship", "error");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getEnrollments(), getScholarships(), getStudents(), getSemesters()]);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (enrollmentList.length > 0) {
            buildTable(enrollmentList);
        }
    }, [filterScholarship]);

    if (isLoading) return <Loader />;

    return (
        <>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Student Enrollments</h4>
                    <p className="text-muted mb-0">Manage scholarship student enrollments</p>
                </div>
                <div className="d-flex gap-3">
                    <select
                        className="form-select form-select-solid w-200px"
                        value={filterScholarship}
                        onChange={(e) => setFilterScholarship(e.target.value)}
                    >
                        <option value="">All Scholarships</option>
                        {scholarshipList.map((s) => (
                            <option key={s.ScholarshipID} value={s.ScholarshipID}>
                                {s.Name}
                            </option>
                        ))}
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
                        Enroll Student
                    </button>
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
                                <h5 className="modal-title">Enroll Student in Scholarship</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group mb-4">
                                    <label className="required form-label">Scholarship</label>
                                    <select
                                        className="form-select form-select-solid"
                                        value={formData.ScholarshipID}
                                        onChange={(e) =>
                                            setFormData({ ...formData, ScholarshipID: e.target.value })
                                        }
                                    >
                                        <option value="">Select Scholarship</option>
                                        {scholarshipList.map((s) => (
                                            <option key={s.ScholarshipID} value={s.ScholarshipID}>
                                                {s.Name} (Tuition: {s.Tuition}%)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group mb-4">
                                    <label className="required form-label">Student</label>
                                    <SearchSelect
                                        options={studentList}
                                        value={selectedStudent}
                                        onChange={onStudentSelect}
                                        placeholder="Search student..."
                                    />
                                </div>

                                <div className="form-group mb-4">
                                    <label className="required form-label">Semester</label>
                                    <select
                                        className="form-select form-select-solid"
                                        value={formData.Semester}
                                        onChange={(e) =>
                                            setFormData({ ...formData, Semester: e.target.value })
                                        }
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
                                    Enroll Student
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ScholarshipStudentsContent;
