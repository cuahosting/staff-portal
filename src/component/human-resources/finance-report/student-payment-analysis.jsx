import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import SearchSelect from "../../common/select/SearchSelect";
import Loader from "../../common/loader/loader";
import Modal from "../../common/modal/modal";
import { currencyConverter, formatDate } from "../../../resources/constants";
import "./student-payment-analysis.css";

function StudentPaymentAnalysis(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [allSemester, setAllSemester] = useState([]);
    const [selectedSemesters, setSelectedSemesters] = useState([]);
    const [studentData, setStudentData] = useState([]);
    const [activeSemesters, setActiveSemesters] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [showFullReportModal, setShowFullReportModal] = useState(false);
    const [fullReportData, setFullReportData] = useState(null);

    const semesterOptions = useMemo(() => {
        return allSemester.map((s) => ({
            value: s.SemesterCode,
            label: s.SemesterCode + (s.Status === "Active" ? " (Active)" : ""),
        }));
    }, [allSemester]);

    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const { success, data } = await api.get("staff/human-resources/finance-report/student-payment/semesters");
                if (success) {
                    setAllSemester(data);
                    const defaultSemesters = data.slice(0, 4).map(s => s.SemesterCode);
                    setSelectedSemesters(defaultSemesters);
                }
            } catch (ex) {
                console.error(ex);
            }
        };
        fetchSemesters();
    }, []);

    const handleFetchData = async () => {
        if (selectedSemesters.length === 0) {
            toast.warning("Please select at least one semester");
            return;
        }

        try {
            setIsLoading(true);
            const { success, data } = await api.get(
                `staff/human-resources/finance-report/student-payment/analysis?semesters=${selectedSemesters.join(",")}`
            );

            if (success) {
                setStudentData(data.students || []);
                setActiveSemesters(data.semesters || []);
            }
        } catch (err) {
            toast.error("Failed to fetch payment analysis");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearCache = async () => {
        if (window.confirm("Clear cache and regenerate data on next request?")) {
            await api.delete("staff/human-resources/finance-report/student-payment/cache");
            toast.success("Cache cleared successfully");
        }
    };

    const handleViewDetails = async (studentId, semester, studentName) => {
        setSelectedStudent({ studentId, semester, studentName });
        setShowDetailsModal(true);
        setDetailsLoading(true);

        try {
            const { success, data } = await api.get(
                `staff/human-resources/finance-report/student-payment/details/${studentId}/${semester}`
            );
            if (success) {
                setPaymentDetails(data);
            }
        } catch (err) {
            toast.error("Failed to fetch payment details");
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleViewFullReport = async (studentId) => {
        setShowFullReportModal(true);
        setDetailsLoading(true);
        setFullReportData(null);

        try {
            const { success, data } = await api.get(
                `staff/human-resources/finance-report/student-payment/full-report/${studentId}`
            );
            if (success) {
                setFullReportData(data);
            }
        } catch (err) {
            toast.error("Failed to fetch student report");
        } finally {
            setDetailsLoading(false);
        }
    };

    // Filter students based on search
    const filteredStudents = useMemo(() => {
        if (!searchTerm) return studentData;
        const term = searchTerm.toLowerCase();
        return studentData.filter(s =>
            s.StudentID?.toLowerCase().includes(term) ||
            s.FullName?.toLowerCase().includes(term)
        );
    }, [studentData, searchTerm]);

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Student Payment Analysis"}
                items={["Human Resources", "Finance & Records", "Student Payment Analysis"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body pt-2">
                        {/* Filters */}
                        <div className="row mb-4">
                            <div className="col-md-5">
                                <label className="fs-6 fw-bold mb-2">Select Semesters to Analyze</label>
                                <SearchSelect
                                    id="semesters"
                                    isMulti={true}
                                    value={semesterOptions.filter((opt) => selectedSemesters.includes(opt.value))}
                                    options={semesterOptions}
                                    onChange={(selected) => {
                                        setSelectedSemesters(selected ? selected.map((s) => s.value) : []);
                                    }}
                                    placeholder="Select semesters..."
                                />
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={() => setSelectedSemesters(allSemester.map(s => s.SemesterCode))}
                                >
                                    Select All
                                </button>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <button className="btn btn-primary w-100" onClick={handleFetchData} disabled={isLoading}>
                                    {isLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>Loading...</> : <><i className="fa fa-search me-2"></i>Analyze Payments</>}
                                </button>
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <button className="btn btn-outline-danger w-100" onClick={handleClearCache}>
                                    <i className="fa fa-sync me-2"></i>Clear Cache
                                </button>
                            </div>
                        </div>

                        {/* Results */}
                        {studentData.length > 0 && (
                            <>
                                {/* Summary Stats */}
                                <div className="row mb-3">
                                    <div className="col-md-2">
                                        <div className="payment-stats-card primary">
                                            <span className="stat-value">{filteredStudents.length}</span>
                                            <span className="text-muted ms-2 small">Students</span>
                                        </div>
                                    </div>
                                    <div className="col-md-2">
                                        <div className="payment-stats-card success">
                                            <span className="stat-value">{activeSemesters.length}</span>
                                            <span className="text-muted ms-2 small">Semesters</span>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="🔍 Search by Student ID or Name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        {/* Semester Quick Nav */}
                                        <div className="semester-nav">
                                            {activeSemesters.map((sem, idx) => (
                                                <button
                                                    key={sem}
                                                    className="semester-nav-btn"
                                                    onClick={() => {
                                                        const el = document.querySelector(`[data-semester="${sem}"]`);
                                                        if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
                                                    }}
                                                >
                                                    {sem}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Table with Sticky Columns */}
                                <div className="payment-analysis-table-container">
                                    <div className="payment-analysis-table-scroll" id="tableScroll">
                                        <table className="payment-analysis-table">
                                            <thead>
                                                <tr>
                                                    <th rowSpan="2" className="sticky-col col-sn">SN</th>
                                                    <th rowSpan="2" className="sticky-col col-print">🖨️</th>
                                                    <th rowSpan="2" className="sticky-col col-id">Student ID</th>
                                                    <th rowSpan="2" className="sticky-col col-name">Full Name</th>
                                                    <th rowSpan="2" className="sticky-col col-course">Course</th>
                                                    {activeSemesters.map((sem, idx) => (
                                                        <th
                                                            key={sem}
                                                            colSpan="4"
                                                            className={`semester-group ${idx > 0 ? 'semester-border' : ''}`}
                                                            data-semester={sem}
                                                        >
                                                            {sem}
                                                        </th>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    {activeSemesters.map((sem, idx) => (
                                                        <React.Fragment key={`sub-${sem}`}>
                                                            <th className={`sub-header results ${idx > 0 ? 'semester-border' : ''}`}>Results</th>
                                                            <th className="sub-header expected">Expected</th>
                                                            <th className="sub-header payment">Paid 💳</th>
                                                            <th className="sub-header balance">Balance</th>
                                                        </React.Fragment>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredStudents.map((student, index) => (
                                                    <tr key={student.StudentID}>
                                                        <td className="sticky-col col-sn">{index + 1}</td>
                                                        <td className="sticky-col col-print">
                                                            <button
                                                                className="btn btn-sm btn-success print-btn"
                                                                onClick={() => handleViewFullReport(student.StudentID)}
                                                            >
                                                                🖨️
                                                            </button>
                                                        </td>
                                                        <td className="sticky-col col-id">{student.StudentID}</td>
                                                        <td className="sticky-col col-name" title={student.FullName}>{student.FullName}</td>
                                                        <td className="sticky-col col-course">{student.CourseName || student.CourseCode}</td>
                                                        {activeSemesters.map((sem, idx) => {
                                                            const results = student[`${sem}_Results`] || 0;
                                                            const expected = student[`${sem}_Expected`] || 0;
                                                            const payment = student[`${sem}_Payment`] || 0;
                                                            const balance = student[`${sem}_Balance`] || 0;
                                                            const paymentCount = student[`${sem}_PaymentCount`] || 0;

                                                            return (
                                                                <React.Fragment key={`data-${sem}`}>
                                                                    <td className={`results-cell ${results > 0 ? 'has-value' : 'cell-zero'} ${idx > 0 ? 'semester-border' : ''}`}>
                                                                        {results > 0 ? results : '-'}
                                                                    </td>
                                                                    <td className={`expected-cell ${expected !== 0 ? '' : 'cell-zero'}`}>
                                                                        {expected !== 0 ? currencyConverter(expected) : '-'}
                                                                    </td>
                                                                    <td
                                                                        className={`payment-cell ${payment !== 0 ? 'clickable' : 'cell-zero'}`}
                                                                        onClick={() => payment !== 0 && handleViewDetails(student.StudentID, sem, student.FullName)}
                                                                    >
                                                                        {payment !== 0 ? (
                                                                            <>
                                                                                {currencyConverter(payment)}
                                                                                {paymentCount > 0 && <span className="payment-count">({paymentCount})</span>}
                                                                            </>
                                                                        ) : '-'}
                                                                    </td>
                                                                    <td className={`balance-cell ${balance > 0 ? 'positive' : balance < 0 ? 'negative-balance' : 'zero cell-zero'}`}>
                                                                        {balance !== 0 ? currencyConverter(balance) : '-'}
                                                                    </td>
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {!isLoading && studentData.length === 0 && (
                            <div className="text-center py-5 text-muted">
                                <i className="fa fa-chart-bar fa-3x mb-3"></i>
                                <p>Select semesters and click "Analyze Payments" to generate report</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Details Modal */}
            {showDetailsModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog" style={{ maxWidth: '90%', width: '90%' }}>
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    💳 Payment Details: {selectedStudent?.studentName} - Semester {selectedStudent?.semester}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailsModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {detailsLoading ? (
                                    <div className="text-center py-4"><Loader /></div>
                                ) : (
                                    <>
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead className="table-dark">
                                                    <tr>
                                                        <th className="text-nowrap">#</th>
                                                        <th className="text-nowrap">Semester</th>
                                                        <th className="text-nowrap">Payment ID</th>
                                                        <th style={{ minWidth: '350px' }}>Description</th>
                                                        <th className="text-nowrap">Method</th>
                                                        <th className="text-end text-nowrap">Expected</th>
                                                        <th className="text-end text-nowrap">Amount Paid</th>
                                                        <th className="text-end text-nowrap">Outstanding</th>
                                                        <th className="text-nowrap">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paymentDetails.map((payment, index) => (
                                                        <tr key={index}>
                                                            <td className="text-nowrap">{index + 1}</td>
                                                            <td className="text-nowrap"><span className="badge bg-primary">{payment.SemesterCode}</span></td>
                                                            <td className="text-nowrap"><code>{payment.PaymentID}</code></td>
                                                            <td style={{ whiteSpace: 'normal', minWidth: '350px' }}>{payment.DetailDescription || payment.Description}</td>
                                                            <td className="text-nowrap">{payment.PaymentMethod}</td>
                                                            <td className="text-end text-nowrap">{currencyConverter(payment.TotalExpectedAmount)}</td>
                                                            <td className="text-end text-success fw-bold text-nowrap">{currencyConverter(payment.AmountPaid)}</td>
                                                            <td className="text-end text-warning text-nowrap">{currencyConverter(payment.OutStandingAmount)}</td>
                                                            <td className="text-nowrap">{formatDate(payment.InsertedDate)}</td>
                                                        </tr>
                                                    ))}
                                                    {paymentDetails.length === 0 && (
                                                        <tr><td colSpan="9" className="text-center text-muted">No payment records found</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        {paymentDetails.length > 0 && (
                                            <div className="alert alert-success text-end">
                                                <strong>Total Payments: {paymentDetails.length}</strong> |
                                                <strong className="ms-2">Total Amount: {currencyConverter(paymentDetails.reduce((sum, p) => sum + parseFloat(p.AmountPaid || 0), 0))}</strong>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Student Report Modal */}
            {showFullReportModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog" style={{ maxWidth: '90%', width: '90%' }}>
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title">🖨️ Complete Student Report</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowFullReportModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {detailsLoading ? (
                                    <div className="text-center py-4"><Loader /></div>
                                ) : fullReportData?.student ? (
                                    <div id="printArea">
                                        {/* Student Profile */}
                                        <div className="card mb-4">
                                            <div className="card-header bg-light">
                                                <h5 className="mb-0">📋 Student Profile</h5>
                                            </div>
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-4"><strong>Full Name:</strong> {fullReportData.student.FullName}</div>
                                                    <div className="col-md-4"><strong>Student ID:</strong> <code>{fullReportData.student.StudentID}</code></div>
                                                    <div className="col-md-4"><strong>Course:</strong> {fullReportData.student.CourseCode}</div>
                                                    <div className="col-md-4 mt-2"><strong>Level:</strong> {fullReportData.student.StudentLevel}</div>
                                                    <div className="col-md-4 mt-2"><strong>Email:</strong> {fullReportData.student.EmailAddress || 'N/A'}</div>
                                                    <div className="col-md-4 mt-2"><strong>Phone:</strong> {fullReportData.student.PhoneNumber || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payments Table */}
                                        <h5>💳 All Payment Records</h5>
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-sm">
                                                <thead className="table-dark">
                                                    <tr>
                                                        <th className="text-nowrap">#</th>
                                                        <th className="text-nowrap">Semester</th>
                                                        <th className="text-nowrap">Payment ID</th>
                                                        <th style={{ minWidth: '400px' }}>Description</th>
                                                        <th className="text-end text-nowrap">Expected</th>
                                                        <th className="text-end text-nowrap">Paid</th>
                                                        <th className="text-end text-nowrap">Outstanding</th>
                                                        <th className="text-nowrap">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {fullReportData.payments?.map((p, idx) => (
                                                        <tr key={idx}>
                                                            <td className="text-nowrap">{idx + 1}</td>
                                                            <td className="text-nowrap"><span className="badge bg-secondary">{p.SemesterCode}</span></td>
                                                            <td className="text-nowrap"><code>{p.PaymentID}</code></td>
                                                            <td style={{ whiteSpace: 'normal', minWidth: '400px' }}>{p.DetailDescription || p.Description}</td>
                                                            <td className="text-end text-nowrap">{currencyConverter(p.TotalExpectedAmount)}</td>
                                                            <td className="text-end text-success text-nowrap">{currencyConverter(p.AmountPaid)}</td>
                                                            <td className="text-end text-warning text-nowrap">{currencyConverter(p.OutStandingAmount)}</td>
                                                            <td className="text-nowrap">{formatDate(p.InsertedDate)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="text-center mt-4">
                                            <button className="btn btn-primary" onClick={() => window.print()}>
                                                🖨️ Print Report
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted py-4">Student not found</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        login: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(StudentPaymentAnalysis);
