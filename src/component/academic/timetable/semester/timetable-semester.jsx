import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import TimetableSemesterForm from "./timetable-semester-form";
import SemesterFeeSchedule from "./semester-fee-schedule";
import SemesterBulkConfirmation from "./semester-bulk-confirmation";
import { formatDate, formatDateAndTime, currencyConverter } from "../../../../resources/constants";

function TimetableSemester(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [currentStep, setCurrentStep] = useState(0); // 0 = list, 1 = details, 2 = fees, 3 = bulk
    const [datatable, setDatatable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Action", field: "action" }, { label: "Semester Name", field: "SemesterName" }, { label: "Semester Code", field: "SemesterCode" }, { label: "Start Date", field: "StartDate" }, { label: "End Date", field: "EndDate" }, { label: "Description", field: "Description" }, { label: "Status", field: "Status" }], rows: [] });
    const [formData, setFormData] = useState({ SemesterName: "", SemesterCode: "", StartDate: "", EndDate: "", Description: "", Status: "", EntryID: "", InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}` });

    // Fee schedule state
    const [feeSchedules, setFeeSchedules] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isFeeLoading, setIsFeeLoading] = useState(false);

    // Bulk payment state
    const [bulkStudents, setBulkStudents] = useState([]);
    const [selectedBulkStudents, setSelectedBulkStudents] = useState([]);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    const getTimetableSemester = async () => {
        const { success, data } = await api.get("staff/academics/timetable/semester/list");
        if (success && data?.length > 0) {
            let rows = [];
            data.forEach((semester, index) => {
                rows.push({
                    sn: index + 1, SemesterName: semester.SemesterName ?? "N/A", SemesterCode: semester.SemesterCode ?? "N/A", StartDate: formatDateAndTime(semester.StartDate, 'date') ?? "N/A", EndDate: formatDateAndTime(semester.EndDate, 'date') ?? "N/A", Description: semester.Description ?? "N/A", Status: semester.Status ?? "N/A",
                    action: (<button className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }} title="Edit" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setFormData({ SemesterName: semester.SemesterName, SemesterCode: semester.SemesterCode, StartDate: formatDate(semester.StartDate).toString(), EndDate: formatDate(semester.EndDate).toString(), Description: semester.Description, Status: semester.Status, EntryID: semester.EntryID, InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}` })}><i style={{ fontSize: '15px', color: "blue" }} className="fa fa-pen color-blue" /></button>),
                });
            });
            setDatatable({ ...datatable, rows: rows });
        }
        setIsLoading(false);
    };

    const onEdit = (e) => { setFormData({ ...formData, [e.target.id]: e.target.value }); };

    // Edit existing semester (modal-based, simple)
    const onEditSubmit = async () => {
        if (formData.SemesterName.trim() === "") { showAlert("EMPTY FIELD", "Please enter the semester name", "error"); return; }
        if (formData.SemesterCode.trim() === "") { showAlert("EMPTY FIELD", "Please enter the semester code", "error"); return; }
        if (formData.StartDate.trim() === "") { showAlert("EMPTY FIELD", "Please select the start date", "error"); return; }
        if (formData.EndDate.toString().trim() === "") { showAlert("EMPTY FIELD", "Please select the end date", "error"); return; }
        if (formData.Status.trim() === "") { showAlert("EMPTY FIELD", "Please select the semester status", "error"); return; }

        setIsFormLoading('on');
        const { success, data } = await api.patch("staff/academics/timetable/semester/update", formData);
        if (success) {
            if (data?.message === "success") { toast.success("Timetable Semester Updated Successfully"); getTimetableSemester(); document.getElementById("closeModal").click(); setFormData({ ...formData, SemesterName: "", SemesterCode: "", StartDate: "", EndDate: "", Description: "", Status: "", EntryID: "" }); }
            else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
        }
        setIsFormLoading('off');
    };

    // Step 1: Validate and move to fees
    const onNextToFees = async () => {
        if (formData.SemesterName.trim() === "") { showAlert("EMPTY FIELD", "Please enter the semester name", "error"); return; }
        if (formData.SemesterCode.trim() === "") { showAlert("EMPTY FIELD", "Please enter the semester code", "error"); return; }
        if (formData.StartDate.trim() === "") { showAlert("EMPTY FIELD", "Please select the start date", "error"); return; }
        if (formData.EndDate.toString().trim() === "") { showAlert("EMPTY FIELD", "Please select the end date", "error"); return; }
        if (formData.Status.trim() === "") { showAlert("EMPTY FIELD", "Please select the semester status", "error"); return; }

        setIsFeeLoading(true);
        const { success, data } = await api.get("staff/academics/timetable/semester/previous-fees");
        if (success) {
            setCourses(data.courses || []);
            // Build fee schedule for each course, pre-filling from previous semester
            const schedules = (data.courses || []).map(course => {
                const prev = (data.fees || []).find(f => f.CourseCode === course.CourseCode);
                return {
                    CourseCode: course.CourseCode,
                    CourseName: course.CourseName,
                    NewTuition: prev?.NewTuition || 0,
                    ReturningTuition: prev?.ReturningTuition || 0,
                    Accommodation: prev?.Accommodation || 0,
                    Feeding: prev?.Feeding || 0,
                    Laundry: prev?.Laundry || 0,
                };
            });
            setFeeSchedules(schedules);
        }
        setIsFeeLoading(false);
        setCurrentStep(2);
    };

    // Step 2: Move to bulk confirmation
    const onNextToBulk = async () => {
        setIsBulkLoading(true);
        const { success, data } = await api.get("staff/academics/timetable/semester/bulk-students");
        if (success) {
            // Group by student
            const grouped = {};
            (data || []).forEach(row => {
                if (!grouped[row.StudentID]) {
                    grouped[row.StudentID] = {
                        StudentID: row.StudentID,
                        StudentName: `${row.Surname} ${row.FirstName} ${row.MiddleName || ''}`.trim(),
                        CourseCode: row.CourseCode,
                        StudentLevel: row.StudentLevel,
                        categories: [],
                    };
                }
                grouped[row.StudentID].categories.push({
                    EntryID: row.EntryID,
                    FeeCategory: row.FeeCategory,
                    SemestersRemaining: row.SemestersRemaining,
                    TotalAmount: row.TotalAmount,
                });
            });
            setBulkStudents(Object.values(grouped));
            setSelectedBulkStudents(Object.values(grouped).map(s => s.StudentID));
        }
        setIsBulkLoading(false);
        setCurrentStep(3);
    };

    // Fee schedule change handler
    const onFeeChange = (courseCode, field, value) => {
        setFeeSchedules(prev => prev.map(s =>
            s.CourseCode === courseCode ? { ...s, [field]: parseFloat(value) || 0 } : s
        ));
    };

    // Final submit
    const onFinalSubmit = async () => {
        setIsFormLoading('on');
        const payload = {
            ...formData,
            feeSchedules,
            bulkStudents: bulkStudents.filter(s => selectedBulkStudents.includes(s.StudentID)),
        };

        const { success, data } = await api.post("staff/academics/timetable/semester/add", payload);
        if (success) {
            if (data?.message === "success") {
                showAlert("SUCCESS", "Semester created with fee schedules and bulk confirmations!", "success");
                setCurrentStep(0);
                getTimetableSemester();
                setFormData({ ...formData, SemesterName: "", SemesterCode: "", StartDate: "", EndDate: "", Description: "", Status: "", EntryID: "" });
                setFeeSchedules([]);
                setBulkStudents([]);
                setSelectedBulkStudents([]);
            } else if (data?.message === "exist") {
                showAlert("TIMETABLE SEMESTER EXIST", "Timetable semester already exists!", "error");
            } else {
                showAlert("ERROR", "Something went wrong. Please try again!", "error");
            }
        }
        setIsFormLoading('off');
    };

    const toggleBulkStudent = (studentId) => {
        setSelectedBulkStudents(prev =>
            prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
        );
    };

    useEffect(() => { getTimetableSemester(); }, []);

    if (isLoading) return <Loader />;

    // Wizard steps
    const steps = [
        { label: "Semester Details", number: 1 },
        { label: "Schedule of Fees", number: 2 },
        { label: "Bulk Payment Confirmation", number: 3 },
    ];

    // Wizard view (creating new semester)
    if (currentStep > 0) {
        return (
            <div className="d-flex flex-column flex-row-fluid">
                <PageHeader title={"Create New Semester"} items={["Academics", "Timetable", "Create Semester"]}
                    buttons={<button className="btn btn-secondary" onClick={() => setCurrentStep(0)}><i className="fa fa-arrow-left me-2"></i>Back to List</button>} />

                {/* Stepper */}
                <div className="card mb-4">
                    <div className="card-body py-4">
                        <div className="d-flex justify-content-between align-items-center">
                            {steps.map((step, i) => (
                                <div key={i} className="d-flex align-items-center flex-grow-1">
                                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= step.number ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                                        style={{ width: 36, height: 36, fontSize: 14, fontWeight: 'bold' }}>
                                        {currentStep > step.number ? <i className="fa fa-check" /> : step.number}
                                    </div>
                                    <span className={`ms-2 fw-semibold ${currentStep >= step.number ? 'text-primary' : 'text-muted'}`} style={{ fontSize: 13 }}>{step.label}</span>
                                    {i < steps.length - 1 && <div className="flex-grow-1 mx-3" style={{ height: 2, backgroundColor: currentStep > step.number ? '#0d6efd' : '#dee2e6' }} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="card">
                    <div className="card-body">
                        {currentStep === 1 && (
                            <>
                                <TimetableSemesterForm data={formData} isFormLoading={isFormLoading} onEdit={onEdit} onSubmit={() => {}} />
                                <div className="d-flex justify-content-end mt-4">
                                    <button className="btn btn-primary" onClick={onNextToFees}>
                                        Next: Schedule of Fees <i className="fa fa-arrow-right ms-2"></i>
                                    </button>
                                </div>
                            </>
                        )}

                        {currentStep === 2 && (
                            <>
                                {isFeeLoading ? <Loader /> : (
                                    <SemesterFeeSchedule
                                        feeSchedules={feeSchedules}
                                        onFeeChange={onFeeChange}
                                        semesterCode={formData.SemesterCode}
                                    />
                                )}
                                <div className="d-flex justify-content-between mt-4">
                                    <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
                                        <i className="fa fa-arrow-left me-2"></i> Previous
                                    </button>
                                    <button className="btn btn-primary" onClick={onNextToBulk}>
                                        Next: Bulk Payments <i className="fa fa-arrow-right ms-2"></i>
                                    </button>
                                </div>
                            </>
                        )}

                        {currentStep === 3 && (
                            <>
                                {isBulkLoading ? <Loader /> : (
                                    <SemesterBulkConfirmation
                                        bulkStudents={bulkStudents}
                                        selectedStudents={selectedBulkStudents}
                                        onToggle={toggleBulkStudent}
                                        onSelectAll={() => setSelectedBulkStudents(bulkStudents.map(s => s.StudentID))}
                                        onDeselectAll={() => setSelectedBulkStudents([])}
                                    />
                                )}
                                <div className="d-flex justify-content-between mt-4">
                                    <button className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
                                        <i className="fa fa-arrow-left me-2"></i> Previous
                                    </button>
                                    <button className="btn btn-success" onClick={onFinalSubmit} disabled={isFormLoading === 'on'}>
                                        {isFormLoading === 'on' ? (
                                            <><span className="spinner-border spinner-border-sm me-2" /> Creating Semester...</>
                                        ) : (
                                            <><i className="fa fa-check me-2"></i> Create Semester</>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // List view (default)
    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Timetable Semester"} items={["Academics", "Timetable", "Timetable Semester"]}
                buttons={<button type="button" className="btn btn-primary" onClick={() => { setFormData({ ...formData, SemesterName: "", SemesterCode: "", StartDate: "", EndDate: "", Description: "", Status: "", EntryID: "" }); setCurrentStep(1); }}><i className="fa fa-plus me-2"></i>Add Timetable Semester</button>} />
            <div className="flex-column-fluid">
                <div className="card card-no-border"><div className="card-body p-0"><AGTable data={datatable} /></div></div>
                <Modal title={"Edit Timetable Semester"}>
                    <TimetableSemesterForm data={formData} isFormLoading={isFormLoading} onEdit={onEdit} onSubmit={onEditSubmit} />
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(TimetableSemester);
