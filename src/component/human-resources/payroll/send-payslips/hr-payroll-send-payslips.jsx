import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import { toast } from "react-toastify";
import PageHeader from "../../../common/pageheader/pageheader";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import AGTable from "../../../common/table/AGTable";
import { currencyConverter } from "../../../../resources/constants";
import { Modal } from "react-bootstrap";

function HrPayrollSendPayslips(props) {
    const token = props.LoginDetails[0].token;

    // State management
    const [selectedMonth, setSelectedMonth] = useState('');
    const [staffList, setStaffList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [sendingStaff, setSendingStaff] = useState({}); // Track individual sending: { staffId: true/false }
    const [emailStats, setEmailStats] = useState({
        total: 0,
        sent: 0,
        pending: 0,
        failed: 0
    });
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [emailResults, setEmailResults] = useState({
        successList: [],
        failureList: [],
        csvPath: null
    });

    // AG Grid table data
    const [tableData, setTableData] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Staff ID", field: "StaffID" },
            { label: "Staff Name", field: "FullName" },
            { label: "Department", field: "DepartmentName" },
            { label: "Email", field: "Email" },
            { label: "Gross Pay", field: "GrossPayFormatted" },
            { label: "Status", field: "status" },
            { label: "Last Sent", field: "lastSent" },
            { label: "Actions", field: "actions" }
        ],
        rows: []
    });

    // Fetch staff list with email status
    const getStaffList = async (salaryDate) => {
        if (!salaryDate) return;

        setIsLoading(true);
        try {
            const result = await axios.get(
                `${serverLink}staff/hr/payslip/staff-list/${salaryDate}`,
                token
            );

            if (result.data.message === 'success') {
                const data = result.data.data;
                setStaffList(data);
                calculateStats(data);
                updateTableData(data, salaryDate);
            } else {
                toast.error('Failed to fetch staff list');
            }
        } catch (err) {
            console.error('Network error:', err);
            toast.error('Network error while fetching staff list');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate statistics
    const calculateStats = (data) => {
        const stats = {
            total: data.length,
            sent: 0,
            pending: 0,
            failed: 0
        };

        data.forEach(staff => {
            if (staff.EmailStatus === 'sent') {
                stats.sent++;
            } else if (staff.EmailStatus === 'failed') {
                stats.failed++;
            } else {
                stats.pending++;
            }
        });

        setEmailStats(stats);
    };

    // Update table data with formatted values
    const updateTableData = (data, salaryMonth) => {
        const rows = data.map((staff, index) => {
            const statusBadge = staff.EmailStatus === 'sent'
                ? <span className="badge badge-success">Sent</span>
                : staff.EmailStatus === 'failed'
                ? <span className="badge badge-danger">Failed</span>
                : <span className="badge badge-warning">Pending</span>;

            const lastSent = staff.LastSentDate
                ? new Date(staff.LastSentDate).toLocaleString()
                : 'Never';

            const actionButton = staff.EmailStatus === 'sent'
                ? (
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => sendIndividualPayslip(staff.StaffID, staff.FullName, salaryMonth)}
                        disabled={sendingStaff[staff.StaffID] || isSending}
                    >
                        {sendingStaff[staff.StaffID] ? 'Sending...' : 'Resend'}
                    </button>
                )
                : (
                    <button
                        className="btn btn-sm btn-success"
                        onClick={() => sendIndividualPayslip(staff.StaffID, staff.FullName, salaryMonth)}
                        disabled={sendingStaff[staff.StaffID] || isSending}
                    >
                        {sendingStaff[staff.StaffID] ? 'Sending...' : 'Send'}
                    </button>
                );

            return {
                sn: index + 1,
                StaffID: staff.StaffID,
                FullName: staff.FullName,
                DepartmentName: staff.DepartmentName || 'N/A',
                Email: staff.Email || 'No Email',
                GrossPayFormatted: currencyConverter(parseFloat(staff.GrossPay) || 0),
                status: statusBadge,
                lastSent: lastSent,
                actions: actionButton
            };
        });

        setTableData(prevState => ({
            ...prevState,
            rows
        }));
    };

    // Send payslip to individual staff
    const sendIndividualPayslip = async (staffId, staffName, salaryMonth) => {
        console.log('sendIndividualPayslip called');
        console.log('salaryMonth parameter:', salaryMonth);
        console.log('salaryMonth type:', typeof salaryMonth);

        if (!salaryMonth) {
            toast.error('Please select a month first');
            return;
        }

        setSendingStaff(prev => ({ ...prev, [staffId]: true }));

        try {
            const result = await axios.post(
                `${serverLink}staff/hr/payslip/send/${staffId}/${salaryMonth}`,
                {
                    sent_by: props.LoginDetails[0].StaffID
                },
                token
            );

            if (result.data.success) {
                toast.success(`Payslip sent successfully to ${staffName}`);
                // Refresh the list to update status
                await getStaffList(salaryMonth);
            } else {
                toast.error(result.data.message || 'Failed to send payslip');
            }
        } catch (err) {
            console.error('Send error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Network error while sending payslip';
            toast.error(errorMessage);
        } finally {
            setSendingStaff(prev => {
                const updated = { ...prev };
                delete updated[staffId];
                return updated;
            });
        }
    };

    // Send payslips to all pending staff
    const sendAllPayslips = async () => {
        if (!selectedMonth) {
            toast.error('Please select a month first');
            return;
        }

        if (emailStats.pending === 0) {
            toast.info('No pending payslips to send');
            return;
        }

        const confirmSend = window.confirm(
            `Send payslips to all ${emailStats.pending} pending staff?\n\nThis will send salary breakdown emails to all staff members who haven't received their payslips yet.`
        );

        if (!confirmSend) return;

        setIsSending(true);

        try {
            const result = await axios.post(
                `${serverLink}staff/hr/payslip/send-batch`,
                { salary_date: selectedMonth },
                token
            );

            if (result.data.success) {
                setEmailResults({
                    successList: result.data.successList || [],
                    failureList: result.data.failureList || [],
                    csvPath: result.data.downloadLink || null
                });
                setShowResultsModal(true);

                toast.success(`Sent ${result.data.totalSent} payslips successfully`);

                // Refresh the list
                await getStaffList(selectedMonth);
            } else {
                toast.error('Failed to send batch payslips');
            }
        } catch (err) {
            console.error('Batch send error:', err);
            toast.error('Network error while sending batch payslips');
        } finally {
            setIsSending(false);
        }
    };

    // Handle month selection
    const handleMonthChange = (e) => {
        const month = e.target.value;
        console.log('handleMonthChange - Raw value:', month);
        console.log('handleMonthChange - Type:', typeof month);
        setSelectedMonth(month);
        if (month) {
            getStaffList(month);
        }
    };

    // Format month for display (converts YYYY-MM to readable format)
    const formatMonthDisplay = (monthStr) => {
        if (!monthStr) return '';
        const [year, month] = monthStr.split('-');
        const date = new Date(year, parseInt(month) - 1, 1);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    };

    // Download CSV error report
    const downloadCSV = () => {
        if (emailResults.csvPath) {
            window.open(`${serverLink.replace('/api/', '')}${emailResults.csvPath}`, '_blank');
        }
    };

    useEffect(() => {
        setIsLoading(false);
    }, []);

    return isLoading && !selectedMonth ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Send Payslips via Email"
                items={["Human Resources", "Payroll", "Send Payslips"]}
            />

            <div className="flex-column-fluid">
                <div className="row g-5 g-xl-8 mb-5">
                    <div className="col-xl-12">
                        <div className="card card-xl-stretch">
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-lg-6">
                                        <label className="form-label fw-bold">Select Salary Month</label>
                                        <input
                                            type="month"
                                            id="salary_month"
                                            className="form-control form-control-lg"
                                            value={selectedMonth}
                                            onChange={handleMonthChange}
                                            max={new Date().toISOString().slice(0, 7)}
                                        />
                                        {selectedMonth && (
                                            <div className="mt-2">
                                                <small className="text-muted">
                                                    Selected Month: <strong>{formatMonthDisplay(selectedMonth)}</strong> ({selectedMonth})
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                    {selectedMonth && emailStats.pending > 0 && (
                                        <div className="col-lg-6 d-flex align-items-end">
                                            <button
                                                className="btn btn-primary btn-lg w-100"
                                                onClick={sendAllPayslips}
                                                disabled={isSending}
                                            >
                                                {isSending ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa fa-envelope me-2"></i>
                                                        Send All Pending Payslips ({emailStats.pending})
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedMonth && (
                    <>
                        {/* Statistics Cards */}
                        <div className="row g-5 g-xl-8 mb-5">
                            <div className="col-xl-3 col-md-6">
                                <div className="card card-xl-stretch mb-xl-8" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-5">
                                                <span className="symbol-label bg-white bg-opacity-20">
                                                    <i className="fa fa-users fs-2 text-white"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-white opacity-75 fw-semibold d-block fs-7">Total Staff</span>
                                                <span className="text-white fw-bold fs-2">{emailStats.total}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="card card-xl-stretch mb-xl-8" style={{background: 'linear-gradient(135deg, #0BA360 0%, #3CBA92 100%)'}}>
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-5">
                                                <span className="symbol-label bg-white bg-opacity-20">
                                                    <i className="fa fa-check-circle fs-2 text-white"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-white opacity-75 fw-semibold d-block fs-7">Sent</span>
                                                <span className="text-white fw-bold fs-2">{emailStats.sent}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="card card-xl-stretch mb-xl-8" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-5">
                                                <span className="symbol-label bg-white bg-opacity-20">
                                                    <i className="fa fa-clock fs-2 text-white"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-white opacity-75 fw-semibold d-block fs-7">Pending</span>
                                                <span className="text-white fw-bold fs-2">{emailStats.pending}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="card card-xl-stretch mb-xl-8" style={{background: 'linear-gradient(135deg, #f2709c 0%, #ff9472 100%)'}}>
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-5">
                                                <span className="symbol-label bg-white bg-opacity-20">
                                                    <i className="fa fa-exclamation-circle fs-2 text-white"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-white opacity-75 fw-semibold d-block fs-7">Failed</span>
                                                <span className="text-white fw-bold fs-2">{emailStats.failed}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Staff Table */}
                        <div className="row g-5 g-xl-8">
                            <div className="col-xl-12">
                                <div className="card card-xl-stretch">
                                    <div className="card-header border-0 pt-5">
                                        <h3 className="card-title align-items-start flex-column">
                                            <span className="card-label fw-bold fs-3 mb-1">Staff Payslip Status</span>
                                            <span className="text-muted fw-semibold fs-7">Manage payslip emails for selected month</span>
                                        </h3>
                                    </div>
                                    <div className="card-body py-3">
                                        {isLoading ? (
                                            <Loader />
                                        ) : (
                                            <AGTable data={tableData} paging={true} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Results Modal */}
            <Modal
                show={showResultsModal}
                onHide={() => setShowResultsModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Batch Send Results</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="alert alert-success">
                                <strong>Successfully Sent:</strong> {emailResults.successList.length}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="alert alert-danger">
                                <strong>Failed:</strong> {emailResults.failureList.length}
                            </div>
                        </div>
                    </div>

                    {emailResults.successList.length > 0 && (
                        <div className="mb-3">
                            <h6>Successfully Sent To:</h6>
                            <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {emailResults.successList.map((item, index) => (
                                    <li key={index}>
                                        {item.StaffName} ({item.StaffID}) - {item.Email}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {emailResults.failureList.length > 0 && (
                        <div className="mb-3">
                            <h6>Failed To Send:</h6>
                            <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {emailResults.failureList.map((item, index) => (
                                    <li key={index} className="text-danger">
                                        {item.StaffName} ({item.StaffID}) - {item.Email}
                                        <br />
                                        <small>Error: {item.Error}</small>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {emailResults.csvPath && (
                        <div className="text-center">
                            <button
                                className="btn btn-primary"
                                onClick={downloadCSV}
                            >
                                Download Error Report (CSV)
                            </button>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowResultsModal(false)}
                    >
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails
    };
};

export default connect(mapStateToProps)(HrPayrollSendPayslips);
