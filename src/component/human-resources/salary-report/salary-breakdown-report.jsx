import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { serverLink } from "../../../resources/url";
import axios from "axios";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { currencyConverter, formatDateAndTime } from "../../../resources/constants";
import { toast } from "react-toastify";
import AGTable from "../../common/table/AGTable";
import "./style.css";

function SalaryBreakdownReport(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [salaryBreakdown, setSalaryBreakdown] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [sendingEmails, setSendingEmails] = useState({}); // Track sending state per staff

    // AG Grid table structure
    const [reportTable, setReportTable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Staff ID", field: "StaffID" },
            { label: "Staff Name", field: "FullName" },
            { label: "Department", field: "DepartmentName" },
            { label: "Gross Pay", field: "GrossPayFormatted" },
            { label: "Basic", field: "BasicFormatted" },
            { label: "Housing", field: "HousingFormatted" },
            { label: "Transport", field: "TransportFormatted" },
            { label: "Fringe", field: "FringeFormatted" },
            { label: "Medical", field: "MedicalFormatted" },
            { label: "Wardrobe", field: "WardrobeFormatted" },
            { label: "Payee (Tax)", field: "PayeeFormatted" },
            { label: "Pension", field: "PensionFormatted" },
            { label: "Total Allowances", field: "TotalAllowancesFormatted" },
            { label: "Total Deductions", field: "TotalDeductionsFormatted" },
            { label: "Net Pay", field: "NetPayFormatted" },
            { label: "Actions", field: "actions" }
        ],
        rows: []
    });

    // Fetch available months on load
    const getAvailableMonths = async () => {
        try {
            const result = await axios.get(
                `${serverLink}staff/human-resources/finance-report/report/salary-months`,
                token
            );
            setAvailableMonths(result.data || []);
            setIsLoading(false);
        } catch (err) {
            console.error("Error fetching available months:", err);
            toast.error("Error loading available salary months");
            setIsLoading(false);
        }
    };

    // Fetch salary breakdown for selected month
    const getSalaryBreakdown = async (salaryDate) => {
        if (!salaryDate) {
            setSalaryBreakdown([]);
            setReportTable({ ...reportTable, rows: [] });
            return;
        }

        setIsDataLoading(true);
        try {
            const result = await axios.get(
                `${serverLink}staff/human-resources/finance-report/report/salary-breakdown/${salaryDate}`,
                token
            );

            const data = result.data || [];

            // Format the data for display
            const formattedData = data.map((item, index) => ({
                sn: index + 1,
                StaffID: item.StaffID,
                FullName: item.FullName?.trim() || '',
                DepartmentName: item.DepartmentName || '-',
                GrossPay: parseFloat(item.GrossPay) || 0,
                GrossPayFormatted: currencyConverter(parseFloat(item.GrossPay) || 0),
                Basic: parseFloat(item.Basic) || 0,
                BasicFormatted: currencyConverter(parseFloat(item.Basic) || 0),
                Housing: parseFloat(item.Housing) || 0,
                HousingFormatted: currencyConverter(parseFloat(item.Housing) || 0),
                Transport: parseFloat(item.Transport) || 0,
                TransportFormatted: currencyConverter(parseFloat(item.Transport) || 0),
                Fringe: parseFloat(item.Fringe) || 0,
                FringeFormatted: currencyConverter(parseFloat(item.Fringe) || 0),
                Medical: parseFloat(item.Medical) || 0,
                MedicalFormatted: currencyConverter(parseFloat(item.Medical) || 0),
                Wardrobe: parseFloat(item.Wardrobe) || 0,
                WardrobeFormatted: currencyConverter(parseFloat(item.Wardrobe) || 0),
                Payee: parseFloat(item.Payee) || 0,
                PayeeFormatted: currencyConverter(parseFloat(item.Payee) || 0),
                Pension: parseFloat(item.Pension) || 0,
                PensionFormatted: currencyConverter(parseFloat(item.Pension) || 0),
                TotalAllowances: parseFloat(item.TotalAllowances) || 0,
                TotalAllowancesFormatted: currencyConverter(parseFloat(item.TotalAllowances) || 0),
                TotalDeductions: parseFloat(item.TotalDeductions) || 0,
                TotalDeductionsFormatted: currencyConverter(parseFloat(item.TotalDeductions) || 0),
                NetPay: parseFloat(item.NetPay) || 0,
                NetPayFormatted: currencyConverter(parseFloat(item.NetPay) || 0),
                actions: (
                    <button
                        className="btn btn-sm btn-light-info"
                        onClick={() => sendPayslip(item.StaffID, item.FullName?.trim() || '', salaryDate)}
                        disabled={sendingEmails[item.StaffID]}
                    >
                        {sendingEmails[item.StaffID] ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Sending...
                            </>
                        ) : (
                            <>
                                <i className="fa fa-envelope me-2"></i>
                                Send Payslip
                            </>
                        )}
                    </button>
                )
            }));

            setSalaryBreakdown(formattedData);
            setReportTable({ ...reportTable, rows: formattedData });
            setIsDataLoading(false);
        } catch (err) {
            console.error("Error fetching salary breakdown:", err);
            toast.error("Error loading salary breakdown data");
            setIsDataLoading(false);
        }
    };

    // Send individual payslip email
    const sendPayslip = async (staffId, staffName, salaryMonth) => {
        console.log('sendPayslip called - salaryMonth:', salaryMonth);

        if (!salaryMonth) {
            toast.error('No salary month selected');
            return;
        }

        // Confirm action
        const confirmSend = window.confirm(
            `Send payslip email to ${staffName}?\n\nThis will send the salary breakdown for ${formatMonth(salaryMonth)} to their registered email address.`
        );

        if (!confirmSend) return;

        // Set loading state for this staff
        setSendingEmails(prev => ({ ...prev, [staffId]: true }));

        try {
            const response = await axios.post(
                `${serverLink}staff/hr/payslip/send/${staffId}/${salaryMonth}`,
                {
                    sent_by: props.LoginDetails[0].StaffID
                },
                token
            );

            if (response.data.message === 'success') {
                toast.success(`Payslip sent successfully to ${staffName}`);
            } else {
                toast.error(response.data.message || 'Failed to send payslip');
            }
        } catch (error) {
            console.error('Error sending payslip:', error);
            toast.error(error.response?.data?.message || 'Failed to send payslip email');
        } finally {
            // Clear loading state for this staff
            setSendingEmails(prev => {
                const updated = { ...prev };
                delete updated[staffId];
                return updated;
            });
        }
    };

    useEffect(() => {
        getAvailableMonths();
    }, []);

    const onMonthChange = (e) => {
        const month = e.target.value;
        setSelectedMonth(month);
        getSalaryBreakdown(month);
    };

    // Format month for display
    const formatMonth = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    // Calculate totals
    const totals = {
        staff: salaryBreakdown.length,
        grossPay: salaryBreakdown.reduce((sum, s) => sum + s.GrossPay, 0),
        totalAllowances: salaryBreakdown.reduce((sum, s) => sum + s.TotalAllowances, 0),
        totalDeductions: salaryBreakdown.reduce((sum, s) => sum + s.TotalDeductions, 0),
        totalPayee: salaryBreakdown.reduce((sum, s) => sum + s.Payee, 0),
        totalPension: salaryBreakdown.reduce((sum, s) => sum + s.Pension, 0),
        netPay: salaryBreakdown.reduce((sum, s) => sum + s.NetPay, 0)
    };

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <div className="printPageButton">
                <PageHeader
                    title={"Salary Breakdown Report"}
                    items={["Human Resources", "Salary Report", "Salary Breakdown Report"]}
                />
            </div>

            <div className="flex-column-fluid">
                <div className="card card-xl-stretch mb-5 mb-xl-8">
                    <div className="card-header border-0 pt-5">
                        <h3 className="card-title align-items-start flex-column">
                            <span className="card-label fw-bold fs-3 mb-1">
                                <i className="fa fa-chart-bar me-2 text-primary"></i>
                                Monthly Salary Breakdown
                            </span>
                            <span className="text-muted mt-1 fw-semibold fs-7">
                                View detailed salary breakdown for posted months
                            </span>
                        </h3>
                    </div>
                    <div className="card-body py-3">
                        {/* Month Selector */}
                        <div className="row mb-5">
                            <div className="col-lg-4">
                                <label className="form-label fs-6 fw-bold text-dark">
                                    <i className="fa fa-calendar me-2 text-primary"></i>
                                    Select Salary Month
                                </label>
                                <select
                                    className="form-select form-select-solid"
                                    value={selectedMonth}
                                    onChange={onMonthChange}
                                >
                                    <option value="">-- Select Month --</option>
                                    {availableMonths.map((item, index) => (
                                        <option key={index} value={item.SalaryDate}>
                                            {formatMonth(item.SalaryDate)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedMonth && (
                                <div className="col-lg-8 d-flex align-items-end">
                                    <button
                                        className="btn btn-light-primary"
                                        onClick={() => window.print()}
                                    >
                                        <i className="fa fa-print me-2"></i>
                                        Print Report
                                    </button>
                                </div>
                            )}
                        </div>

                        {isDataLoading ? (
                            <div className="text-center py-10">
                                <span className="spinner-border spinner-border-lg text-primary"></span>
                                <p className="mt-3 text-muted">Loading salary data...</p>
                            </div>
                        ) : selectedMonth && salaryBreakdown.length > 0 ? (
                            <>
                                {/* Summary Stats */}
                                <div className="row g-3 mb-5">
                                    <div className="col-lg-2 col-md-4 col-6">
                                        <div className="border rounded p-3 text-center bg-light-primary">
                                            <span className="text-muted d-block fs-7">Total Staff</span>
                                            <span className="fw-bold fs-4 text-primary">{totals.staff}</span>
                                        </div>
                                    </div>
                                    <div className="col-lg-2 col-md-4 col-6">
                                        <div className="border rounded p-3 text-center bg-light-success">
                                            <span className="text-muted d-block fs-7">Total Gross</span>
                                            <span className="fw-bold fs-6 text-success">
                                                {currencyConverter(totals.grossPay)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-lg-2 col-md-4 col-6">
                                        <div className="border rounded p-3 text-center bg-light-info">
                                            <span className="text-muted d-block fs-7">Total Allowances</span>
                                            <span className="fw-bold fs-6 text-info">
                                                {currencyConverter(totals.totalAllowances)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-lg-2 col-md-4 col-6">
                                        <div className="border rounded p-3 text-center bg-light-danger">
                                            <span className="text-muted d-block fs-7">Total Deductions</span>
                                            <span className="fw-bold fs-6 text-danger">
                                                {currencyConverter(totals.totalDeductions)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-lg-2 col-md-4 col-6">
                                        <div className="border rounded p-3 text-center bg-light-warning">
                                            <span className="text-muted d-block fs-7">Total Payee</span>
                                            <span className="fw-bold fs-6 text-warning">
                                                {currencyConverter(totals.totalPayee)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-lg-2 col-md-4 col-6">
                                        <div className="border rounded p-3 text-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                            <span className="text-white opacity-75 d-block fs-7">Total Net Pay</span>
                                            <span className="fw-bold fs-6 text-white">
                                                {currencyConverter(totals.netPay)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* AG Grid Table */}
                                <div style={{ minHeight: '400px' }}>
                                    <AGTable data={reportTable} paging={true} />
                                </div>
                            </>
                        ) : selectedMonth && salaryBreakdown.length === 0 ? (
                            <div className="notice d-flex bg-light-warning rounded border-warning border border-dashed p-6">
                                <span className="svg-icon svg-icon-2tx svg-icon-warning me-4">
                                    <i className="fa fa-exclamation-triangle fs-1 text-warning"></i>
                                </span>
                                <div className="d-flex flex-stack flex-grow-1 flex-wrap flex-md-nowrap">
                                    <div className="mb-3 mb-md-0 fw-semibold">
                                        <h4 className="text-gray-900 fw-bold">No Data Found</h4>
                                        <div className="fs-6 text-gray-700 pe-7">
                                            No salary records found for {formatMonth(selectedMonth)}.
                                            This could mean no salaries were posted for this month.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="notice d-flex bg-light-primary rounded border-primary border border-dashed p-6">
                                <span className="svg-icon svg-icon-2tx svg-icon-primary me-4">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.3" d="M19.0687 17.9688H11.0687C10.4687 17.9688 10.0687 18.3687 10.0687 18.9688V19.9688C10.0687 20.5687 10.4687 20.9688 11.0687 20.9688H19.0687C19.6687 20.9688 20.0687 20.5687 20.0687 19.9688V18.9688C20.0687 18.3687 19.6687 17.9688 19.0687 17.9688Z" fill="currentColor"></path>
                                        <path d="M4.06875 17.9688C3.86875 17.9688 3.66874 17.8688 3.46874 17.7688C2.96874 17.4688 2.86875 16.8688 3.16875 16.3688L6.76874 10.9688L3.16875 5.56876C2.86875 5.06876 2.96874 4.46873 3.46874 4.16873C3.96874 3.86873 4.56875 3.96878 4.86875 4.46878L8.86875 10.4688C9.06875 10.7688 9.06875 11.2688 8.86875 11.5688L4.86875 17.5688C4.66875 17.7688 4.36875 17.9688 4.06875 17.9688Z" fill="currentColor"></path>
                                    </svg>
                                </span>
                                <div className="d-flex flex-stack flex-grow-1 flex-wrap flex-md-nowrap">
                                    <div className="mb-3 mb-md-0 fw-semibold">
                                        <h4 className="text-gray-900 fw-bold">
                                            Please select a salary month to view the breakdown report
                                        </h4>
                                        <div className="fs-6 text-gray-700 pe-7">
                                            {availableMonths.length > 0
                                                ? `${availableMonths.length} month(s) with posted salaries available.`
                                                : 'No salary months available. Please post salaries first.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(SalaryBreakdownReport);
