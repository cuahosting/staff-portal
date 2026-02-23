import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import DataTable from "../../../common/table/DataTable";
import SearchSelect from "../../../common/select/SearchSelect";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { toast } from "react-toastify";
import swal from "sweetalert";
import { motion, AnimatePresence } from "framer-motion";

const GEN_MODES = [
    { value: "Student", label: "Individual Student" },
    { value: "Course", label: "By Course" },
    { value: "University", label: "University Wide" }
];

const SEMESTERS = [
    { value: "First", label: "First Semester" },
    { value: "Second", label: "Second Semester" }
];

function GenerateStudentInvoice(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [genMode, setGenMode] = useState(null);
    const [semester, setSemester] = useState(SEMESTERS[0]);

    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [schoolSemesters, setSchoolSemesters] = useState([]);

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedSchoolSemester, setSelectedSchoolSemester] = useState(null);

    const [previewData, setPreviewData] = useState(null);
    const [breakdownData, setBreakdownData] = useState(null);
    const [batchResult, setBatchResult] = useState(null);

    const [invoiceList, setInvoiceList] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Action", field: "action" },
            { label: "Invoice Code", field: "InvoiceCode" },
            { label: "Student ID", field: "StudentID" },
            { label: "Name", field: "StudentName" },
            { label: "Total Amount", field: "amountFormatted" },
            { label: "School Semester", field: "SchoolSemester" },
            { label: "Date", field: "dateFormatted" },
        ],
        rows: [],
    });

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(num || 0);
    };

    const getData = async (isBackground = false) => {
        if (!isBackground) setIsLoading(true);
        const [studentRes, schoolSemRes, invoiceRes, courseRes] = await Promise.all([
            api.get("staff/ac-finance/scholarship/students/active"),
            api.get("staff/ac-finance/scholarship/semesters"),
            api.get("staff/ac-finance/invoice/list"),
            api.get("staff/ac-finance/course-schedules/list")
        ]);

        if (studentRes.success) {
            setStudents(studentRes.data.map(s => ({ value: s.StudentID, label: `${s.StudentID} - ${s.Name}` })));
        }
        if (schoolSemRes.success) {
            setSchoolSemesters(schoolSemRes.data.map(s => ({ value: s.SemesterCode, label: s.SemesterCode })));
        }
        if (invoiceRes.success) {
            setInvoiceList(prev => ({ ...prev, rows: buildInvoiceRows(invoiceRes.data) }));
        }
        if (courseRes.success) {
            const uniqueCourses = [];
            const map = new Map();
            for (const item of courseRes.data) {
                if (!map.has(item.CourseCode)) {
                    map.set(item.CourseCode, true);
                    uniqueCourses.push({ value: item.CourseCode, label: `${item.CourseName} (${item.CourseCode})` });
                }
            }
            setCourses(uniqueCourses);
        }
        if (!isBackground) setIsLoading(false);
    };

    const buildInvoiceRows = (data) => {
        return data.map((item, index) => ({
            sn: index + 1,
            InvoiceCode: <span className="fw-bold text-primary">{item.InvoiceCode}</span>,
            StudentID: item.StudentID,
            StudentName: item.StudentName,
            amountFormatted: <span className="fw-bolder text-dark">{formatCurrency(item.TotalAmount)}</span>,
            SchoolSemester: item.SchoolSemester,
            dateFormatted: new Date(item.InsertedDate).toLocaleDateString(),
            action: (
                <div className="d-flex align-items-center">
                    <button className="btn btn-icon btn-light-primary btn-sm me-2" title="Breakdown" onClick={() => handleViewBreakdown(item)}>
                        <i className="fa fa-eye" />
                    </button>
                    <button className="btn btn-icon btn-light-danger btn-sm" title="Delete" onClick={() => handleDelete(item.EntryID)}>
                        <i className="fa fa-trash" />
                    </button>
                </div>
            )
        }));
    };

    const handleViewBreakdown = async (invoice) => {
        setIsGenerating(true);
        const { success, data } = await api.get(`staff/ac-finance/invoice/items/${invoice.EntryID}`);
        if (success) {
            setBreakdownData({
                invoice,
                items: data
            });
            setPreviewData(null);
            setBatchResult(null);
            document.getElementById("openModalBtn").click();
        }
        setIsGenerating(false);
    };

    const handleAction = async () => {
        if (!selectedSchoolSemester || !semester) {
            toast.warning("Please select both School Semester and Semester");
            return;
        }

        if (genMode.value === "Student") {
            if (!selectedStudent) return toast.warning("Please select a student");
            handlePreview();
        } else if (genMode.value === "Course") {
            if (!selectedCourse) return toast.warning("Please select a course");
            handleBatchGenerate("Course");
        } else {
            handleBatchGenerate("University");
        }
    };

    const handlePreview = async () => {
        setIsGenerating(true);
        const { success, data } = await api.post("staff/ac-finance/invoice/preview", {
            StudentID: selectedStudent.value,
            SchoolSemester: selectedSchoolSemester.value,
            Semester: semester.value
        });

        if (success) {
            setPreviewData(data);
            setBatchResult(null);
            document.getElementById("openModalBtn").click();
        }
        setIsGenerating(false);
    };

    const handleBatchGenerate = async (type) => {
        swal({
            title: `Generate Batch Invoices?`,
            text: `You are about to generate invoices for ${type === 'Course' ? selectedCourse.label : 'the entire University'} for ${semester.label} (${selectedSchoolSemester.value}).`,
            icon: "warning",
            buttons: ["Cancel", "Yes, Proceed"],
        }).then(async (willGenerate) => {
            if (willGenerate) {
                setIsGenerating(true);
                const { success, data } = await api.post("staff/ac-finance/invoice/batch-generate", {
                    Type: type,
                    CourseID: type === 'Course' ? selectedCourse.value : null,
                    Semester: semester.value,
                    SchoolSemester: selectedSchoolSemester.value,
                    StaffID: props.loginData[0].StaffID
                }, { timeout: 300000 }); // 5 minutes timeout for batch operations

                if (success) {
                    setBatchResult(data);
                    setPreviewData(null);
                    document.getElementById("openModalBtn").click();
                    getData(true); // Background update
                }
                setIsGenerating(false);
            }
        });
    };

    const handleSingleGenerate = async () => {
        setIsGenerating(true);
        const { success } = await api.post("staff/ac-finance/invoice/generate", {
            StudentID: selectedStudent.value,
            SchoolSemester: selectedSchoolSemester.value,
            Items: previewData.items,
            StaffID: props.loginData[0].StaffID
        });

        if (success) {
            toast.success("Invoice generated successfully");
            getData(true); // Background update
            setPreviewData(null);
            document.getElementById("closeModal").click();
        }
        setIsGenerating(false);
    };

    const handleDelete = (id) => {
        swal({
            title: "Are you sure?",
            text: "This will delete the invoice and all its items",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                const { success } = await api.delete(`staff/ac-finance/invoice/delete/${id}`);
                if (success) {
                    toast.success("Invoice deleted");
                    getData();
                }
            }
        });
    };

    useEffect(() => {
        getData();
    }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Generate Student Invoice"} items={["Finance", "Invoices", "Generator"]} />

            <div className="flex-column-fluid">
                <div className="card shadow-sm mb-10 overflow-hidden">
                    <div className="card-body py-8">
                        <div className="row g-9 align-items-center justify-content-center">
                            <div className={genMode ? "col-md-3" : "col-md-6"}>
                                <label className="form-label fw-boldest text-primary fs-6 mb-2">Generation Target</label>
                                <SearchSelect
                                    placeholder="Choose who to generate for..."
                                    options={GEN_MODES}
                                    value={genMode}
                                    onChange={(val) => {
                                        setGenMode(val);
                                        setSelectedStudent(null);
                                        setSelectedCourse(null);
                                    }}
                                />
                            </div>

                            <AnimatePresence>
                                {genMode && (
                                    <motion.div
                                        className="col-md-9"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="row g-9 align-items-end">
                                            <div className="col-md-4">
                                                <label className="form-label fw-bolder text-dark">Semester</label>
                                                <SearchSelect
                                                    options={SEMESTERS}
                                                    value={semester}
                                                    onChange={(val) => setSemester(val)}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-bolder text-dark">School Semester</label>
                                                <SearchSelect
                                                    placeholder="Academic Session"
                                                    options={schoolSemesters}
                                                    value={selectedSchoolSemester}
                                                    onChange={(val) => setSelectedSchoolSemester(val)}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <button type="button" className={`btn btn-${genMode.value === 'Student' ? 'primary' : 'success'} w-100 py-3 shadow-sm`}
                                                    onClick={handleAction} disabled={isGenerating}>
                                                    {isGenerating ? (
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                    ) : null}
                                                    {genMode.value === 'Student' ? "Preview Invoice" : "Generate Batch"}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <AnimatePresence>
                            {genMode && (genMode.value === "Student" || genMode.value === "Course") && (
                                <motion.div
                                    className="row mt-8"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="col-md-6">
                                        <div className="bg-light-primary rounded p-5">
                                            <label className="form-label fw-boldest text-dark">{genMode.value === "Student" ? "Search Student" : "Select Course"}</label>
                                            <SearchSelect
                                                placeholder={genMode.value === "Student" ? "Search by ID or Name..." : "Select Course..."}
                                                options={genMode.value === "Student" ? students : courses}
                                                value={genMode.value === "Student" ? selectedStudent : selectedCourse}
                                                onChange={(val) => genMode.value === "Student" ? setSelectedStudent(val) : setSelectedCourse(val)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6 d-flex align-items-center">
                                        <div className="text-muted fs-6 fst-italic ps-5">
                                            {genMode.value === "Student"
                                                ? "Pick a specific student to generate an individual financial commitment."
                                                : "All active students in the selected course will have invoices generated based on their current level."}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Progress Indicator - Now under the form */}
                        <AnimatePresence>
                            {isGenerating && genMode?.value !== "Student" && (
                                <motion.div
                                    className="mt-8 p-5 bg-light-warning rounded-pill border border-warning border-dashed d-flex align-items-center"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <div className="spinner-border text-warning spinner-border-sm me-4" role="status"></div>
                                    <div className="d-flex flex-column flex-grow-1">
                                        <span className="fw-boldest text-dark fs-7">BATCH GENERATION IN PROGRESS</span>
                                        <div className="w-100 h-4px bg-white bg-opacity-50 rounded mt-1 overflow-hidden">
                                            <motion.div
                                                className="h-100 bg-warning"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "95%" }}
                                                transition={{ duration: 15, ease: "linear" }}
                                            />
                                        </div>
                                    </div>
                                    <div className="ms-4 text-muted fw-bold fs-8 text-uppercase">Wait a moment</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header pt-5 border-0">
                        <h3 className="card-title align-items-start flex-column">
                            <span className="card-label fw-boldest text-dark fs-3">Recent Transactions</span>
                            <span className="text-muted mt-1 fw-bold fs-7">Overview of generated student invoices</span>
                        </h3>
                    </div>
                    <div className="card-body p-5">
                        <DataTable data={invoiceList} />
                    </div>
                </div>

                <button id="openModalBtn" data-bs-toggle="modal" data-bs-target="#kt_modal_general" className="d-none"></button>

                <Modal title={previewData ? "Invoice Breakdown" : breakdownData ? `Items for ${breakdownData.invoice.InvoiceCode}` : "Generation Summary"} large onClose={() => { setPreviewData(null); setBreakdownData(null); setBatchResult(null); }}>
                    {previewData && (
                        <div className="row">
                            <div className="col-md-12 mb-7">
                                <div className="d-flex flex-stack bg-light-info p-5 rounded position-relative overflow-hidden">
                                    <div className="position-absolute top-0 end-0 opacity-10" style={{ transform: 'rotate(-20deg) translate(20px, -20px)' }}>
                                        <i className="fa fa-file-invoice-dollar fs-1" style={{ fontSize: '100px' }}></i>
                                    </div>
                                    <div className="d-flex flex-column z-index-1">
                                        <span className="text-muted fw-boldest fs-8">STUDENT PROFILE</span>
                                        <span className="text-dark fw-boldest fs-3">{previewData.student.FirstName} {previewData.student.Surname}</span>
                                        <span className="text-primary fw-bold fs-6">{previewData.student.StudentID} | {previewData.student.CourseCode} | L{previewData.student.StudentLevel}</span>
                                    </div>
                                    <div className="d-flex flex-column text-end z-index-1">
                                        <span className="text-muted fw-boldest fs-8">TARGET SESSION</span>
                                        <span className="text-dark fw-boldest fs-4">{semester.label}</span>
                                        <span className="text-muted fw-bold fs-7">{selectedSchoolSemester?.value}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <div className="table-responsive">
                                    <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                                        <thead>
                                            <tr className="fw-boldest text-muted bg-light">
                                                <th className="ps-4 rounded-start">Financial Item</th>
                                                <th className="text-end pe-4 rounded-end">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="ps-4">
                                                        <div className="fw-boldest text-dark fs-6">{item.ItemName}</div>
                                                        <div className="text-muted fs-8">{item.Description}</div>
                                                    </td>
                                                    <td className="text-end pe-4 fw-boldest text-dark">{formatCurrency(item.FinalAmount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-light-primary">
                                                <td className="ps-4 fs-3 fw-boldest text-dark py-5">TOTAL PAYABLE</td>
                                                <td className="text-end pe-4 fs-3 fw-boldest text-primary py-5">{formatCurrency(previewData.grandTotal)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div className="text-center pt-15 w-100">
                                <button type="reset" className="btn btn-light btn-active-light-primary fw-boldest px-10 me-3" data-bs-dismiss="modal" id="closeModal">Discard</button>
                                <button type="button" className="btn btn-primary shadow-sm fw-boldest px-15" onClick={handleSingleGenerate} disabled={isGenerating}>
                                    Confirm & Create Invoice
                                </button>
                            </div>
                        </div>
                    )}

                    {breakdownData && (
                        <div className="row">
                            <div className="col-md-12 mb-7">
                                <div className="d-flex flex-stack bg-light-success p-5 rounded">
                                    <div className="d-flex flex-column">
                                        <span className="text-muted fw-boldest fs-8">INVOICE TO</span>
                                        <span className="text-dark fw-boldest fs-3">{breakdownData.invoice.StudentName}</span>
                                        <span className="text-muted fw-bold fs-6">{breakdownData.invoice.StudentID} | {breakdownData.invoice.SchoolSemester}</span>
                                    </div>
                                    <div className="text-end">
                                        <span className="text-muted fw-boldest fs-8">REFERENCE</span>
                                        <div className="text-dark fw-boldest fs-4">{breakdownData.invoice.InvoiceCode}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <div className="table-responsive">
                                    <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                                        <thead>
                                            <tr className="fw-boldest text-muted bg-light">
                                                <th className="ps-4 rounded-start">Financial Item</th>
                                                <th className="text-end pe-4 rounded-end">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {breakdownData.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="ps-4">
                                                        <div className="fw-boldest text-dark fs-6">{item.ItemName}</div>
                                                        <div className="text-muted fs-8">{item.Description}</div>
                                                    </td>
                                                    <td className="text-end pe-4 fw-boldest text-dark">{formatCurrency(item.Amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-light-success">
                                                <td className="ps-4 fs-3 fw-boldest text-dark py-5">TOTAL AMOUNT</td>
                                                <td className="text-end pe-4 fs-3 fw-boldest text-success py-5">{formatCurrency(breakdownData.invoice.TotalAmount)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div className="text-center pt-10 w-100">
                                <button type="button" className="btn btn-primary fw-boldest px-15" data-bs-dismiss="modal">Close View</button>
                            </div>
                        </div>
                    )}

                    {batchResult && (
                        <div className="text-center p-10">
                            <div className="mb-10 animate__animated animate__bounceIn">
                                <div className="symbol symbol-100px symbol-circle bg-light-success rotate-90 mb-5">
                                    <span className="symbol-label">
                                        <i className="fa fa-check text-success fs-1"></i>
                                    </span>
                                </div>
                                <h1 className="fw-boldest text-dark mt-5">Process Completed</h1>
                                <p className="text-muted fw-bold fs-6">The batch invoicing run has finished for {batchResult.successCount + batchResult.skipCount + batchResult.errorCount} student(s).</p>
                            </div>

                            <div className="row g-5 mb-10">
                                <div className="col-4">
                                    <div className="card shadow-none border-dashed border-success bg-light-success p-6">
                                        <div className="fs-2hx fw-boldest text-success mb-2">{batchResult.successCount}</div>
                                        <div className="fw-boldest fs-7 text-uppercase text-success">Generated</div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="card shadow-none border-dashed border-warning bg-light-warning p-6">
                                        <div className="fs-2hx fw-boldest text-warning mb-2">{batchResult.skipCount}</div>
                                        <div className="fw-boldest fs-7 text-uppercase text-warning">Skipped</div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="card shadow-none border-dashed border-danger bg-light-danger p-6">
                                        <div className="fs-2hx fw-boldest text-danger mb-2">{batchResult.errorCount}</div>
                                        <div className="fw-boldest fs-7 text-uppercase text-danger">Mismatches</div>
                                    </div>
                                </div>
                            </div>

                            {/* Show total message */}
                            <div className="alert alert-dismissible bg-light-primary d-flex flex-column flex-sm-row p-5 mb-10">
                                <i className="fa fa-info-circle fs-2hx text-primary me-4 mb-5 mb-sm-0"></i>
                                <div className="d-flex flex-column text-start">
                                    <h4 className="fw-boldest text-dark fs-5">Success: {batchResult.successCount} new invoices created.</h4>
                                    <span>The transaction list has been updated in the background.</span>
                                </div>
                            </div>

                            {batchResult.errors && batchResult.errors.length > 0 && (
                                <div className="text-start mb-10 bg-light-danger p-5 rounded border border-danger border-dashed">
                                    <h5 className="fw-boldest text-danger mb-3">Diagnostic Log (First 5):</h5>
                                    <ul className="text-dark fs-7 fw-bold mb-0">
                                        {batchResult.errors.map((err, i) => <li key={i} className="mb-1">{err}</li>)}
                                    </ul>
                                </div>
                            )}

                            <button className="btn btn-primary fw-boldest px-20 py-4 shadow-sm" data-bs-dismiss="modal">Close Summary</button>
                        </div>
                    )}
                </Modal>
            </div >
        </div >
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails });
export default connect(mapStateToProps, null)(GenerateStudentInvoice);
