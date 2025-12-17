import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { ProgressBar } from "react-bootstrap";
import { api, apiClient } from "../../../../resources/api";
import { serverLink } from "../../../../resources/url";
import { toast } from "react-toastify";
import PageHeader from "../../../common/pageheader/pageheader";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import AGTable from "../../../common/table/AGTable";
import { currencyConverter } from "../../../../resources/constants";

function HrPayrollPostSchedule(props) {
    const [createItem, setCreateItem] = useState({
        salary_date: '',
        inserted_by: props.loginData[0].StaffID
    });
    const [canSubmit, setCanSubmit] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [allowanceList, setAllowanceList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pensionSetting, setPensionSetting] = useState([]);
    const [salarySetting, setSalarySetting] = useState([]);
    const [pensionStaffList, setPensionStaffList] = useState([]);

    // Preview Modal State
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [salaryBreakdown, setSalaryBreakdown] = useState([]);
    const [isPosting, setIsPosting] = useState(false);
    const [currentPostingStaff, setCurrentPostingStaff] = useState("");
    const [postingProgress, setPostingProgress] = useState({
        current: 0,
        total: 0,
        percentage: 0,
        variant: 'danger'
    });

    // Email sending states
    const [isSendingEmails, setIsSendingEmails] = useState(false);
    const [showEmailResultsModal, setShowEmailResultsModal] = useState(false);
    const [emailResults, setEmailResults] = useState({ successList: [], failureList: [], csvPath: null });
    const [emailProgress, setEmailProgress] = useState({ current: 0, total: 0, percentage: 0 });

    // AG Grid data for preview table
    const [previewTable, setPreviewTable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Staff ID - Name", field: "StaffIDName" },
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
            { label: "Status", field: "status" }
        ],
        rows: []
    });

    const getRecord = async () => {
        const [staffRes, salaryRes, pensionStaffRes, pensionSettingRes] = await Promise.all([
            api.get("staff/report/staff/list/status/1"),
            api.get("staff/hr/payroll/salary/settings/record"),
            api.get("staff/hr/payroll/pension/salary/enrolled"),
            api.get("staff/hr/payroll/pension/setting")
        ]);

        if (staffRes.success) setStaffList(staffRes.data || []);
        if (salaryRes.success) setSalarySetting(salaryRes.data || []);
        if (pensionStaffRes.success) setPensionStaffList(pensionStaffRes.data || []);
        if (pensionSettingRes.success) setPensionSetting(pensionSettingRes.data || []);

        setIsLoading(false);
    };

    useEffect(() => {
        getRecord();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onEdit = async (e) => {
        setCreateItem({ ...createItem, [e.target.id]: e.target.value });
        setIsLoading(true);
        setCanSubmit(false);

        const [checkRes, allowanceRes] = await Promise.all([
            api.post("staff/hr/payroll/salary/check_if_ran", { salary_date: e.target.value }),
            api.post("staff/hr/payroll/salary/get_allowance_list", { salary_date: e.target.value })
        ]);

        if (checkRes.success) {
            if (checkRes.data > 0) {
                toast.error(`Salary already ran for ${e.target.value}`);
                setCanSubmit(false);
            } else {
                setCanSubmit(true);
            }
        }

        if (allowanceRes.success) {
            setAllowanceList(allowanceRes.data || []);
        }

        setIsLoading(false);
    };

    // Calculate tax using Payee percentage from hr_salary_settings
    const calcSalaryPayee = (monthlySalary) => {
        const taxPercentage = salarySetting[0]?.Payee || 0;
        const monthlyTax = (taxPercentage / 100) * monthlySalary;
        return Math.round(monthlyTax * 100) / 100;
    };

    // Generate preview breakdown for all staff
    const generatePreview = () => {
        if (pensionSetting.length === 0) {
            showAlert('PENSION SETTING NOT FOUND', 'Please add a pension setting from the pension section first!', 'error');
            return false;
        }
        if (salarySetting.length === 0) {
            showAlert('SALARY SETTING NOT FOUND', 'Please add a salary setting from the salary section first!', 'error');
            return false;
        }
        if (staffList.length === 0) {
            showAlert('RECORD NOT EXIST', 'Staff Records could not be found!', 'error');
            return false;
        }

        const breakdown = [];

        staffList.forEach((item, index) => {
            const gross = item.GrossPay || 0;
            const basic = (salarySetting[0].Basic / 100) * gross;
            const housing = (salarySetting[0].Housing / 100) * gross;
            const transport = (salarySetting[0].Transport / 100) * gross;
            const fringe = (salarySetting[0].Fringe / 100) * gross;
            const medical = (salarySetting[0].Medical / 100) * gross;
            const wardrobe = (salarySetting[0].Wardrobe / 100) * gross;

            // Only calculate payee if isDeductions = 1
            let payee = 0;
            if (item.isDeductions === 1) {
                payee = calcSalaryPayee(gross);
            }

            // Check if staff has IsPension = 1 in hr_staff table
            let pensionEmployee = 0;
            let pensionEmployer = 0;
            let pensionData = null;

            if (item.IsPension === 1) {
                pensionEmployee = 0.08 * gross;
                pensionEmployer = (pensionSetting[0].EmployerContribution / 100) * gross;

                const check_staff_pension = pensionStaffList.filter(i => i.StaffID === item.StaffID);
                pensionData = {
                    employee: pensionEmployee,
                    employer: pensionEmployer,
                    total: pensionEmployee + pensionEmployer,
                    adminId: check_staff_pension.length > 0 ? check_staff_pension[0].PensionAdminID : null
                };
            }

            // Build salary items for this staff
            const salaryItems = [
                { item_name: 'Basic Salary', salary_type: 'Allowance', amount: basic },
                { item_name: 'Housing', salary_type: 'Allowance', amount: housing },
                { item_name: 'Transport', salary_type: 'Allowance', amount: transport },
                { item_name: 'Fringe', salary_type: 'Allowance', amount: fringe },
                { item_name: 'Medical', salary_type: 'Allowance', amount: medical },
                { item_name: 'Wardrobe', salary_type: 'Allowance', amount: wardrobe },
            ];

            if (payee > 0) {
                salaryItems.push({ item_name: 'Payee', salary_type: 'Deduction', amount: payee });
            }
            if (pensionEmployee > 0) {
                salaryItems.push({ item_name: 'Pension', salary_type: 'Deduction', amount: pensionEmployee });
            }

            let customAllowances = 0;
            let customDeductions = 0;
            if (allowanceList.length > 0) {
                const check_staff_allowance = allowanceList.filter(i => i.StaffID === item.StaffID);
                check_staff_allowance.forEach(it => {
                    if (it.AllowanceAmount > 0) {
                        salaryItems.push({ item_name: it.GLAccountName, salary_type: 'Allowance', amount: it.AllowanceAmount });
                        customAllowances += it.AllowanceAmount;
                    } else {
                        salaryItems.push({ item_name: it.GLAccountName, salary_type: 'Deduction', amount: it.DeductionAmount });
                        customDeductions += it.DeductionAmount;
                    }
                });
            }

            const totalAllowances = basic + housing + transport + fringe + medical + wardrobe + customAllowances;
            const totalDeductions = payee + pensionEmployee + customDeductions;
            const netPay = totalAllowances - totalDeductions;

            const fullName = item.FullName || `${item.FirstName || ''} ${item.Surname || ''}`.trim();

            breakdown.push({
                sn: index + 1,
                StaffID: item.StaffID,
                FullName: fullName,
                StaffIDName: `${item.StaffID} - ${fullName}`,
                GrossPay: gross,
                GrossPayFormatted: currencyConverter(gross),
                Basic: basic,
                BasicFormatted: currencyConverter(basic),
                Housing: housing,
                HousingFormatted: currencyConverter(housing),
                Transport: transport,
                TransportFormatted: currencyConverter(transport),
                Fringe: fringe,
                FringeFormatted: currencyConverter(fringe),
                Medical: medical,
                MedicalFormatted: currencyConverter(medical),
                Wardrobe: wardrobe,
                WardrobeFormatted: currencyConverter(wardrobe),
                Payee: payee,
                PayeeFormatted: currencyConverter(payee),
                Pension: pensionEmployee,
                PensionFormatted: currencyConverter(pensionEmployee),
                TotalAllowances: totalAllowances,
                TotalAllowancesFormatted: currencyConverter(totalAllowances),
                TotalDeductions: totalDeductions,
                TotalDeductionsFormatted: currencyConverter(totalDeductions),
                NetPay: netPay,
                NetPayFormatted: currencyConverter(netPay),
                status: <span className="badge badge-light-warning">Pending</span>,
                statusText: 'Pending',
                salaryItems: salaryItems,
                pensionData: pensionData
            });
        });

        setSalaryBreakdown(breakdown);
        setPreviewTable({ ...previewTable, rows: breakdown });
        setPostingProgress({ current: 0, total: breakdown.length, percentage: 0, variant: 'danger' });
        setShowPreviewModal(true);
    };

    // Post salaries with proper async handling
    const postSalaries = async () => {
        if (salaryBreakdown.length === 0) return;

        setIsPosting(true);
        setCanSubmit(false);

        let successCount = 0;
        let failedCount = 0;
        const updatedBreakdown = [...salaryBreakdown];

        for (let i = 0; i < salaryBreakdown.length; i++) {
            const staff = salaryBreakdown[i];
            setCurrentPostingStaff(`${staff.StaffID} - ${staff.FullName}`);

            updatedBreakdown[i] = {
                ...updatedBreakdown[i],
                status: <span className="badge badge-light-info">Processing...</span>,
                statusText: 'Processing'
            };
            setPreviewTable({ ...previewTable, rows: [...updatedBreakdown] });

            const { success, data } = await api.post("staff/hr/payroll/salary/post/batch", {
                staff_id: staff.StaffID,
                salary_date: createItem.salary_date,
                inserted_by: createItem.inserted_by,
                salary_items: staff.salaryItems,
                pension_data: staff.pensionData
            });

            if (success && data?.message === 'success') {
                successCount++;
                updatedBreakdown[i] = {
                    ...updatedBreakdown[i],
                    status: <span className="badge badge-light-success">Posted</span>,
                    statusText: 'Posted'
                };
            } else {
                failedCount++;
                updatedBreakdown[i] = {
                    ...updatedBreakdown[i],
                    status: <span className="badge badge-light-danger">Failed</span>,
                    statusText: 'Failed'
                };
            }

            const percentage = Math.round(((i + 1) / salaryBreakdown.length) * 100);
            let variant = 'danger';
            if (percentage > 25 && percentage <= 50) variant = 'warning';
            else if (percentage > 50 && percentage <= 75) variant = 'info';
            else if (percentage > 75) variant = 'success';

            setPostingProgress({ current: i + 1, total: salaryBreakdown.length, percentage, variant });
            setPreviewTable({ ...previewTable, rows: [...updatedBreakdown] });
        }

        setIsPosting(false);
        setCurrentPostingStaff("");

        if (failedCount === 0) {
            toast.success(`Salary posting complete! ${successCount} staff processed successfully.`);
        } else {
            toast.warning(`Salary posting complete. ${successCount} succeeded, ${failedCount} failed.`);
        }
    };

    // Send batch payslips via email
    const sendBatchPayslips = async () => {
        if (!createItem.salary_date) {
            toast.error('No salary month selected');
            return;
        }

        const confirmSend = window.confirm(
            `Are you sure you want to send payslips to all staff for ${new Date(createItem.salary_date + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}?\n\nThis will send emails to all staff members with salary data for this month.`
        );

        if (!confirmSend) return;

        setIsSendingEmails(true);
        setEmailProgress({ current: 0, total: 0, percentage: 0 });

        const { success, data } = await api.post("staff/hr/payslip/send-batch", {
            salary_date: createItem.salary_date,
            sent_by: props.loginData[0].StaffID
        });

        if (success && data?.message === 'success') {
            const { successCount, failureCount, successList, failureList, csvPath } = data;

            setEmailResults({
                successList: successList || [],
                failureList: failureList || [],
                csvPath: csvPath || null
            });

            setEmailProgress({
                current: successCount + failureCount,
                total: successCount + failureCount,
                percentage: 100
            });

            setShowEmailResultsModal(true);

            if (failureCount === 0) {
                toast.success(`All ${successCount} payslips sent successfully!`);
            } else {
                toast.warning(`${successCount} payslips sent, ${failureCount} failed. See error report.`);
            }
        } else if (success) {
            toast.error(data?.message || 'Failed to send payslips');
        }

        setIsSendingEmails(false);
    };

    // Close email results modal
    const closeEmailResultsModal = () => {
        setShowEmailResultsModal(false);
        setEmailResults({ successList: [], failureList: [], csvPath: null });
        setEmailProgress({ current: 0, total: 0, percentage: 0 });
    };

    // Close preview modal
    const closePreviewModal = () => {
        if (isPosting) {
            showAlert('POSTING IN PROGRESS', 'Please wait for the posting process to complete.', 'warning');
            return;
        }
        setShowPreviewModal(false);
        setSalaryBreakdown([]);
        setPreviewTable({ ...previewTable, rows: [] });
    };

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Post Schedule"}
                items={["Human Resources", "Payroll", "Post Schedule"]}
            />
            <div className="flex-column-fluid">
                <div className="row g-5 g-xl-8">
                    {/* Stats Cards */}
                    <div className="col-xl-4">
                        <div className="card card-xl-stretch mb-xl-8" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-50px me-5">
                                        <span className="symbol-label bg-white bg-opacity-20">
                                            <i className="fa fa-users fs-2 text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-white opacity-75 fw-semibold d-block fs-7">Active Staff</span>
                                        <span className="text-white fw-bold fs-2">{staffList.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-4">
                        <div className="card card-xl-stretch mb-xl-8" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-50px me-5">
                                        <span className="symbol-label bg-white bg-opacity-20">
                                            <i className="fa fa-list-alt fs-2 text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-white opacity-75 fw-semibold d-block fs-7">Allowances/Deductions</span>
                                        <span className="text-white fw-bold fs-2">{allowanceList.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-4">
                        <div className="card card-xl-stretch mb-xl-8" style={{ background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)' }}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-50px me-5">
                                        <span className="symbol-label bg-white bg-opacity-20">
                                            <i className="fa fa-building fs-2 text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-white opacity-75 fw-semibold d-block fs-7">Pension Enrolled</span>
                                        <span className="text-white fw-bold fs-2">{pensionStaffList.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Form Card */}
                    <div className="col-xl-12">
                        <div className="card card-xl-stretch mb-5 mb-xl-8">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title align-items-start flex-column">
                                    <span className="card-label fw-bold fs-3 mb-1">
                                        <i className="fa fa-calendar-alt me-2 text-primary"></i>
                                        Run Monthly Salary
                                    </span>
                                    <span className="text-muted mt-1 fw-semibold fs-7">Process payroll for all active staff members</span>
                                </h3>
                            </div>
                            <div className="card-body py-3">
                                {/* Warning Alert */}
                                <div className="alert alert-warning d-flex align-items-center mb-5" role="alert">
                                    <i className="fa fa-exclamation-triangle fs-3 me-3 text-warning"></i>
                                    <div>
                                        <h5 className="mb-1 text-warning">Important Notice</h5>
                                        <span>You can only run salary <strong>once per month</strong>. Please ensure all staff records and allowances are up to date before proceeding.</span>
                                    </div>
                                </div>

                                <div className="row align-items-end">
                                    <div className="col-lg-6">
                                        <div className="mb-0">
                                            <label className="form-label fs-6 fw-bold text-dark">
                                                <i className="fa fa-calendar me-2 text-primary"></i>
                                                Select Month & Year
                                            </label>
                                            <input
                                                type="month"
                                                id="salary_date"
                                                max={`${new Date().getFullYear()}-${new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1}`}
                                                onChange={onEdit}
                                                value={createItem.salary_date}
                                                className="form-control form-control-lg form-control-solid"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="mb-0">
                                            {canSubmit ? (
                                                <button onClick={generatePreview} className="btn btn-primary btn-lg w-100">
                                                    <i className="fa fa-eye me-2"></i>
                                                    Preview & Post Salary for {createItem.salary_date ? new Date(createItem.salary_date + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Selected Month'}
                                                </button>
                                            ) : (
                                                <button className="btn btn-secondary btn-lg w-100" disabled>
                                                    <i className="fa fa-eye me-2"></i>
                                                    Select a month to continue
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="col-xl-6">
                        <div className="card card-xl-stretch mb-5 mb-xl-8">
                            <div className="card-header border-0">
                                <h3 className="card-title fw-bold text-dark">
                                    <i className="fa fa-check-circle me-2 text-success"></i>
                                    Pre-Posting Checklist
                                </h3>
                            </div>
                            <div className="card-body pt-0">
                                <div className="d-flex align-items-center mb-4">
                                    <span className={`bullet bullet-vertical h-40px ${salarySetting.length > 0 ? 'bg-success' : 'bg-danger'} me-3`}></span>
                                    <div className="flex-grow-1">
                                        <span className="text-gray-800 fw-bold fs-6">Salary Settings</span>
                                        <span className="text-muted d-block fs-7">Basic, Housing, Transport percentages</span>
                                    </div>
                                    <span className={`badge badge-${salarySetting.length > 0 ? 'success' : 'danger'}`}>
                                        {salarySetting.length > 0 ? 'Configured' : 'Not Set'}
                                    </span>
                                </div>
                                <div className="d-flex align-items-center mb-4">
                                    <span className={`bullet bullet-vertical h-40px ${pensionSetting.length > 0 ? 'bg-success' : 'bg-danger'} me-3`}></span>
                                    <div className="flex-grow-1">
                                        <span className="text-gray-800 fw-bold fs-6">Pension Settings</span>
                                        <span className="text-muted d-block fs-7">Employee & Employer contribution rates</span>
                                    </div>
                                    <span className={`badge badge-${pensionSetting.length > 0 ? 'success' : 'danger'}`}>
                                        {pensionSetting.length > 0 ? 'Configured' : 'Not Set'}
                                    </span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <span className={`bullet bullet-vertical h-40px ${staffList.length > 0 ? 'bg-success' : 'bg-warning'} me-3`}></span>
                                    <div className="flex-grow-1">
                                        <span className="text-gray-800 fw-bold fs-6">Staff Records</span>
                                        <span className="text-muted d-block fs-7">Active staff with gross pay</span>
                                    </div>
                                    <span className={`badge badge-${staffList.length > 0 ? 'success' : 'warning'}`}>
                                        {staffList.length} Staff
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-6">
                        <div className="card card-xl-stretch mb-5 mb-xl-8">
                            <div className="card-header border-0">
                                <h3 className="card-title fw-bold text-dark">
                                    <i className="fa fa-info-circle me-2 text-info"></i>
                                    Salary Components
                                </h3>
                            </div>
                            <div className="card-body pt-0">
                                <div className="d-flex align-items-center mb-4">
                                    <span className="bullet bullet-vertical h-40px bg-primary me-3"></span>
                                    <div className="flex-grow-1">
                                        <span className="text-gray-800 fw-bold fs-6">Allowances</span>
                                        <span className="text-muted d-block fs-7">Basic, Housing, Transport, Fringe, Medical, Wardrobe</span>
                                    </div>
                                    <span className="badge badge-primary">6 Items</span>
                                </div>
                                <div className="d-flex align-items-center mb-4">
                                    <span className="bullet bullet-vertical h-40px bg-danger me-3"></span>
                                    <div className="flex-grow-1">
                                        <span className="text-gray-800 fw-bold fs-6">Deductions</span>
                                        <span className="text-muted d-block fs-7">PAYEE Tax, Pension Contribution</span>
                                    </div>
                                    <span className="badge badge-danger">2 Items</span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <span className="bullet bullet-vertical h-40px bg-info me-3"></span>
                                    <div className="flex-grow-1">
                                        <span className="text-gray-800 fw-bold fs-6">Custom Entries</span>
                                        <span className="text-muted d-block fs-7">Staff-specific allowances & deductions</span>
                                    </div>
                                    <span className="badge badge-info">{allowanceList.length} Items</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full-Screen Preview Modal */}
            {showPreviewModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-fullscreen">
                        <div className="modal-content">
                            <div className="modal-header py-3" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-50px me-4">
                                        <span className="symbol-label bg-white bg-opacity-20">
                                            <i className="fa fa-money-bill-wave fs-2 text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <h5 className="modal-title text-white fw-bold mb-0">
                                            Salary Preview - {createItem.salary_date ? new Date(createItem.salary_date + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
                                        </h5>
                                        <span className="text-white opacity-75 fs-7">
                                            Review salary breakdown for {salaryBreakdown.length} staff members before posting
                                        </span>
                                    </div>
                                </div>
                                <button type="button" className="btn btn-sm btn-icon btn-light" onClick={closePreviewModal} disabled={isPosting}>
                                    <i className="fa fa-times"></i>
                                </button>
                            </div>
                            <div className="modal-body p-0">
                                {/* Progress Section */}
                                {(isPosting || postingProgress.percentage > 0) && (
                                    <div className="bg-light border-bottom p-4">
                                        <div className="row align-items-center">
                                            <div className="col-lg-8">
                                                <div className="d-flex align-items-center mb-2">
                                                    {isPosting && <span className="spinner-border spinner-border-sm me-2 text-primary"></span>}
                                                    <span className="fw-bold fs-6">
                                                        {isPosting ? 'Posting Salaries...' : 'Posting Complete'}
                                                    </span>
                                                    {currentPostingStaff && (
                                                        <span className="text-muted ms-3">Processing: {currentPostingStaff}</span>
                                                    )}
                                                </div>
                                                <ProgressBar
                                                    now={postingProgress.percentage}
                                                    label={`${postingProgress.current} / ${postingProgress.total} (${postingProgress.percentage}%)`}
                                                    variant={postingProgress.variant}
                                                    striped
                                                    animated={isPosting}
                                                    style={{ height: '30px' }}
                                                />
                                            </div>
                                            <div className="col-lg-4 text-end">
                                                <div className="d-flex justify-content-end gap-3">
                                                    <div className="text-center">
                                                        <span className="text-muted d-block fs-7">Processed</span>
                                                        <span className="fw-bold fs-4 text-primary">{postingProgress.current}</span>
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="text-muted d-block fs-7">Total</span>
                                                        <span className="fw-bold fs-4">{postingProgress.total}</span>
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="text-muted d-block fs-7">Progress</span>
                                                        <span className={`fw-bold fs-4 text-${postingProgress.variant}`}>{postingProgress.percentage}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Summary Stats */}
                                <div className="bg-white border-bottom p-3">
                                    <div className="row g-3">
                                        <div className="col-lg-2 col-md-4 col-6">
                                            <div className="border rounded p-3 text-center bg-light-primary">
                                                <span className="text-muted d-block fs-7">Total Staff</span>
                                                <span className="fw-bold fs-4 text-primary">{salaryBreakdown.length}</span>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                            <div className="border rounded p-3 text-center bg-light-success">
                                                <span className="text-muted d-block fs-7">Total Gross</span>
                                                <span className="fw-bold fs-6 text-success">
                                                    {currencyConverter(salaryBreakdown.reduce((sum, s) => sum + s.GrossPay, 0))}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                            <div className="border rounded p-3 text-center bg-light-info">
                                                <span className="text-muted d-block fs-7">Total Allowances</span>
                                                <span className="fw-bold fs-6 text-info">
                                                    {currencyConverter(salaryBreakdown.reduce((sum, s) => sum + s.TotalAllowances, 0))}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                            <div className="border rounded p-3 text-center bg-light-danger">
                                                <span className="text-muted d-block fs-7">Total Deductions</span>
                                                <span className="fw-bold fs-6 text-danger">
                                                    {currencyConverter(salaryBreakdown.reduce((sum, s) => sum + s.TotalDeductions, 0))}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                            <div className="border rounded p-3 text-center bg-light-warning">
                                                <span className="text-muted d-block fs-7">Total Payee</span>
                                                <span className="fw-bold fs-6 text-warning">
                                                    {currencyConverter(salaryBreakdown.reduce((sum, s) => sum + s.Payee, 0))}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                            <div className="border rounded p-3 text-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                                <span className="text-white opacity-75 d-block fs-7">Total Net Pay</span>
                                                <span className="fw-bold fs-6 text-white">
                                                    {currencyConverter(salaryBreakdown.reduce((sum, s) => sum + s.NetPay, 0))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AG Grid Table */}
                                <div className="p-3" style={{ height: 'calc(100vh - 380px)' }}>
                                    <AGTable data={previewTable} paging={true} />
                                </div>
                            </div>
                            <div className="modal-footer py-3 bg-light">
                                <div className="d-flex justify-content-between w-100 align-items-center">
                                    <div>
                                        <span className="text-muted">
                                            <i className="fa fa-info-circle me-1"></i>
                                            {postingProgress.percentage === 100
                                                ? 'All salaries have been posted successfully.'
                                                : 'Click "Post All Salaries" to begin the posting process.'}
                                        </span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button type="button" className="btn btn-light" onClick={closePreviewModal} disabled={isPosting}>
                                            <i className="fa fa-times me-2"></i>
                                            {postingProgress.percentage === 100 ? 'Close' : 'Cancel'}
                                        </button>
                                        {postingProgress.percentage === 100 && (
                                            <button
                                                type="button"
                                                className="btn btn-info"
                                                onClick={sendBatchPayslips}
                                                disabled={isSendingEmails || !createItem.salary_date}
                                            >
                                                {isSendingEmails ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Sending Emails...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa fa-envelope me-2"></i>
                                                        Send All Payslips
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        {postingProgress.percentage < 100 && (
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={postSalaries}
                                                disabled={isPosting || salaryBreakdown.length === 0}
                                            >
                                                {isPosting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Posting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa fa-paper-plane me-2"></i>
                                                        Post All Salaries ({salaryBreakdown.length} Staff)
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Results Modal */}
            {showEmailResultsModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-40px me-3">
                                        <span className="symbol-label bg-white bg-opacity-20">
                                            <i className="fa fa-envelope fs-3 text-white"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <h5 className="modal-title text-white fw-bold mb-0">
                                            Payslip Email Results
                                        </h5>
                                        <span className="text-white opacity-75 fs-7">
                                            {createItem.salary_date ? new Date(createItem.salary_date + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
                                        </span>
                                    </div>
                                </div>
                                <button type="button" className="btn btn-sm btn-icon btn-light" onClick={closeEmailResultsModal}>
                                    <i className="fa fa-times"></i>
                                </button>
                            </div>
                            <div className="modal-body p-0">
                                {/* Summary Cards */}
                                <div className="p-5 bg-light border-bottom">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <div className="border rounded p-4 text-center bg-white">
                                                <i className="fa fa-paper-plane fs-2x text-primary mb-2"></i>
                                                <div className="text-muted fs-7">Total Sent</div>
                                                <div className="fw-bold fs-2x text-primary">{emailProgress.total}</div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="border rounded p-4 text-center bg-white">
                                                <i className="fa fa-check-circle fs-2x text-success mb-2"></i>
                                                <div className="text-muted fs-7">Successful</div>
                                                <div className="fw-bold fs-2x text-success">{emailResults.successList.length}</div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="border rounded p-4 text-center bg-white">
                                                <i className="fa fa-exclamation-circle fs-2x text-danger mb-2"></i>
                                                <div className="text-muted fs-7">Failed</div>
                                                <div className="fw-bold fs-2x text-danger">{emailResults.failureList.length}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Success List */}
                                {emailResults.successList.length > 0 && (
                                    <div className="p-5 border-bottom">
                                        <h6 className="text-success mb-3">
                                            <i className="fa fa-check-circle me-2"></i>
                                            Successfully Sent ({emailResults.successList.length})
                                        </h6>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            <table className="table table-sm table-row-bordered">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th>Staff ID</th>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {emailResults.successList.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="text-gray-800">{item.StaffID}</td>
                                                            <td className="text-gray-800">{item.StaffName}</td>
                                                            <td className="text-muted">{item.Email}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Failure List */}
                                {emailResults.failureList.length > 0 && (
                                    <div className="p-5">
                                        <h6 className="text-danger mb-3">
                                            <i className="fa fa-exclamation-circle me-2"></i>
                                            Failed to Send ({emailResults.failureList.length})
                                        </h6>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            <table className="table table-sm table-row-bordered">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th>Staff ID</th>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Error</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {emailResults.failureList.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="text-gray-800">{item.StaffID}</td>
                                                            <td className="text-gray-800">{item.StaffName}</td>
                                                            <td className="text-muted">{item.Email}</td>
                                                            <td className="text-danger">{item.Error}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer bg-light">
                                <div className="d-flex justify-content-between w-100 align-items-center">
                                    <div>
                                        {emailResults.csvPath && (
                                            <a
                                                href={`${serverLink}${emailResults.csvPath}`}
                                                download
                                                className="btn btn-sm btn-light-danger"
                                            >
                                                <i className="fa fa-download me-2"></i>
                                                Download Error Report (CSV)
                                            </a>
                                        )}
                                    </div>
                                    <button type="button" className="btn btn-primary" onClick={closeEmailResultsModal}>
                                        <i className="fa fa-check me-2"></i>
                                        Close
                                    </button>
                                </div>
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
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(HrPayrollPostSchedule);
