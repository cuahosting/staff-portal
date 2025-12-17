import React, { useEffect, useState, useMemo } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import PageHeader from "../../../common/pageheader/pageheader";
import Loader from "../../../common/loader/loader";
import AGReportTable from "../../../common/table/AGReportTable";
import { currencyConverter } from "../../../../resources/constants";
import * as XLSX from "xlsx";
import SearchSelect from "../../../common/select/SearchSelect";

function HrSalarySchedule(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [salaryMonths, setSalaryMonths] = useState([]);
    const [scheduleData, setScheduleData] = useState([]);
    const [summary, setSummary] = useState(null);

    const [formData, setFormData] = useState({
        salaryMonth: "",
        paymentDueDate: "",
        debitAccountNumber: "1229034027"
    });

    const columns = [
        "S/N",
        "Transaction Ref",
        "Beneficiary Name",
        "Staff ID",
        "Payment Amount",
        "Payment Due Date",
        "Beneficiary Code",
        "Account Number",
        "Sort Code",
        "Debit Account",
        "Comment"
    ];

    const [tableData, setTableData] = useState([]);

    // Fetch available salary months
    const fetchSalaryMonths = async () => {
        const { success, data } = await api.get("staff/hr/salary-schedule/months");
        if (success) {
            setSalaryMonths(data);
        }
        setIsLoading(false);
    };

    // Fetch schedule data for selected month
    const fetchScheduleData = async (salaryDate) => {
        if (!salaryDate) return;

        setIsLoading(true);

        const [dataRes, summaryRes] = await Promise.all([
            api.get(`staff/hr/salary-schedule/data/${salaryDate}`),
            api.get(`staff/hr/salary-schedule/summary/${salaryDate}`)
        ]);

        if (dataRes.success) {
            setScheduleData(dataRes.data);

            // Format data for table display
            const formattedData = dataRes.data.map((item, index) => {
                const transactionRef = `SAL-${salaryDate.replace("-", "")}-${String(index + 1).padStart(4, "0")}`;
                return [
                    index + 1,
                    transactionRef,
                    (item.FullName?.trim() || "").toUpperCase(),
                    item.StaffID,
                    currencyConverter(item.NetPay || 0),
                    formData.paymentDueDate || "",
                    item.StaffID,
                    item.AccountNumber || "",
                    item.SortCode || "",
                    formData.debitAccountNumber,
                    item.DesignationName || ""
                ];
            });
            setTableData(formattedData);
        }

        if (summaryRes.success) {
            setSummary(summaryRes.data);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        fetchSalaryMonths();
    }, []);

    // Update table data when payment due date changes
    useEffect(() => {
        if (scheduleData.length > 0 && formData.salaryMonth) {
            const formattedData = scheduleData.map((item, index) => {
                const transactionRef = `SAL-${formData.salaryMonth.replace("-", "")}-${String(index + 1).padStart(4, "0")}`;
                return [
                    index + 1,
                    transactionRef,
                    (item.FullName?.trim() || "").toUpperCase(),
                    item.StaffID,
                    currencyConverter(item.NetPay || 0),
                    formData.paymentDueDate || "",
                    item.StaffID,
                    item.AccountNumber || "",
                    item.SortCode || "",
                    formData.debitAccountNumber,
                    item.DesignationName || ""
                ];
            });
            setTableData(formattedData);
        }
    }, [formData.paymentDueDate, formData.debitAccountNumber]);

    const formatMonthYear = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    // Options for SearchSelect
    const monthOptions = useMemo(() => {
        return salaryMonths.map(item => ({
            value: item.SalaryDate,
            label: formatMonthYear(item.SalaryDate)
        }));
    }, [salaryMonths]);

    const onEdit = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });

        if (id === "salaryMonth" && value) {
            fetchScheduleData(value);
        }
    };

    // Export to Excel in Zenith Bank format
    const exportToExcel = () => {
        if (scheduleData.length === 0) {
            toast.error("No data to export");
            return;
        }

        if (!formData.paymentDueDate) {
            toast.error("Please set a payment due date before exporting");
            return;
        }

        // Zenith Bank exact header format with instructions
        const headers = [
            "TRANSACTION REFERENCE NUMBER (MANDATORY FIELD) This is a unique reference created by the payer and used to identify a payment. Must not contain commas semi-colon apostrophe or space. Text format. Alpha-numeric(max. 30 characters)",
            "BENEFICIARY NAME (MANDATORY FIELD) Text format. Alpha-numeric(max. 100 characters)",
            "STAFF ID",
            "PAYMENT AMOUNT (MANDATORY FIELD) Number format with 2 decimal digits. Must not contain commas semi-colon apostrophe or spaces",
            "PAYMENT DUE DATE (MANDATORY FIELD) This is the effective date of payment. Format is DD/MM/YYYY (max. 10 characters)",
            "BENEFICIARY CODE (MANDATORY FIELD) Unique code assigned by Payer to the beneficiary. Used on Corporate I-Bank to search for payments made to the beneficiary. Alphanumeric e.g. staff number. RC no. or name (max. 35 characters)",
            "BENEFICIARY ACCOUNT NUMBER (MANDATORY FIELD) Numeric (10 digits)",
            "BENEFICIARY BANK SORT CODE (MANDATORY FIELD) This is used to represent Beneficiary Bank Name and Payment routing method. Leave blank for Zenith beneficiaries. Use first 3-digits for Instant transfer via InterSwitch. Use 9-digits for non-instant transfer via NEFT",
            "DEBIT ACCOUNT NUMBER (MANDATORY FIELD) This is the account number to debit. Number format (max. 10 digits)",
            "COMMENT"
        ];

        // Format payment due date to DD/MM/YYYY format
        const formatDateToDDMMYYYY = (dateStr) => {
            if (!dateStr) return "";
            const date = new Date(dateStr);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const formattedDueDate = formatDateToDDMMYYYY(formData.paymentDueDate);

        // Prepare data rows
        const dataRows = scheduleData.map((item, index) => {
            return [
                index + 1,
                (item.FullName?.trim() || "").toUpperCase(),
                item.StaffID,
                parseFloat(item.NetPay || 0).toFixed(2),
                formattedDueDate,
                `STAFF${index + 1}`,
                item.AccountNumber || "",
                item.SortCode || "",
                formData.debitAccountNumber,
                item.DesignationName || ""
            ];
        });

        // Create worksheet with header and data
        const worksheetData = [headers, ...dataRows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths
        worksheet["!cols"] = [
            { wch: 35 },
            { wch: 40 },
            { wch: 12 },
            { wch: 18 },
            { wch: 18 },
            { wch: 20 },
            { wch: 18 },
            { wch: 20 },
            { wch: 18 },
            { wch: 30 }
        ];

        // Create workbook and add worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Schedule");

        // Generate filename
        const filename = `Salary_Schedule_${formData.salaryMonth}_${new Date().toISOString().split("T")[0]}.xlsx`;

        // Download
        XLSX.writeFile(workbook, filename);
        toast.success("Excel file downloaded successfully!");
    };

    return isLoading && salaryMonths.length === 0 ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Bank Salary Schedule"}
                items={["Human Resources", "Payroll", "Salary Schedule"]}
            />
            <div className="flex-column-fluid">
                <div className="row g-5 g-xl-8">
                    {/* Stats Cards */}
                    {summary && (
                        <>
                            <div className="col-xl-3">
                                <div className="card card-xl-stretch mb-xl-8" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-5">
                                                <span className="symbol-label bg-white bg-opacity-20">
                                                    <i className="fa fa-users fs-2 text-white"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-white opacity-75 fw-semibold d-block fs-7">Total Staff</span>
                                                <span className="text-white fw-bold fs-2">{summary.TotalStaff || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3">
                                <div className="card card-xl-stretch mb-xl-8" style={{ background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" }}>
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-5">
                                                <span className="symbol-label bg-white bg-opacity-20">
                                                    <i className="fa fa-plus-circle fs-2 text-white"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-white opacity-75 fw-semibold d-block fs-7">Total Allowances</span>
                                                <span className="text-white fw-bold fs-5">{currencyConverter(summary.TotalAllowances || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3">
                                <div className="card card-xl-stretch mb-xl-8" style={{ background: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)" }}>
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-5">
                                                <span className="symbol-label bg-white bg-opacity-20">
                                                    <i className="fa fa-minus-circle fs-2 text-white"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-white opacity-75 fw-semibold d-block fs-7">Total Deductions</span>
                                                <span className="text-white fw-bold fs-5">{currencyConverter(summary.TotalDeductions || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3">
                                <div className="card card-xl-stretch mb-xl-8" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-5">
                                                <span className="symbol-label bg-white bg-opacity-20">
                                                    <i className="fa fa-money-bill-wave fs-2 text-white"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-white opacity-75 fw-semibold d-block fs-7">Total Net Pay</span>
                                                <span className="text-white fw-bold fs-5">{currencyConverter(summary.TotalNetPay || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Main Form Card */}
                    <div className="col-xl-12">
                        <div className="card card-xl-stretch mb-5 mb-xl-8">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title align-items-start flex-column">
                                    <span className="card-label fw-bold fs-3 mb-1">
                                        <i className="fa fa-file-excel me-2 text-success"></i>
                                        Bank Payment Schedule
                                    </span>
                                    <span className="text-muted mt-1 fw-semibold fs-7">Generate bank payment file for salary disbursement</span>
                                </h3>
                            </div>
                            <div className="card-body py-3">
                                <div className="row align-items-end">
                                    <div className="col-lg-3">
                                        <div className="mb-3">
                                            <label className="form-label fs-6 fw-bold text-dark">
                                                <i className="fa fa-calendar me-2 text-primary"></i>
                                                Select Salary Month
                                            </label>
                                            <SearchSelect
                                                id="salaryMonth"
                                                value={monthOptions.find(opt => opt.value === formData.salaryMonth) || null}
                                                options={monthOptions}
                                                onChange={(selected) => onEdit({ target: { id: 'salaryMonth', value: selected?.value || '' } })}
                                                placeholder="-- Select Month --"
                                                isClearable={false}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-3">
                                        <div className="mb-3">
                                            <label className="form-label fs-6 fw-bold text-dark">
                                                <i className="fa fa-calendar-check me-2 text-primary"></i>
                                                Payment Due Date
                                            </label>
                                            <input
                                                type="date"
                                                id="paymentDueDate"
                                                className="form-control form-control-solid"
                                                value={formData.paymentDueDate}
                                                onChange={onEdit}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-3">
                                        <div className="mb-3">
                                            <label className="form-label fs-6 fw-bold text-dark">
                                                <i className="fa fa-university me-2 text-primary"></i>
                                                Debit Account Number
                                            </label>
                                            <input
                                                type="text"
                                                id="debitAccountNumber"
                                                className="form-control form-control-solid"
                                                value={formData.debitAccountNumber}
                                                onChange={onEdit}
                                                placeholder="Enter debit account"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-3">
                                        <div className="mb-3">
                                            <button
                                                type="button"
                                                className="btn btn-success w-100"
                                                onClick={exportToExcel}
                                                disabled={scheduleData.length === 0 || !formData.paymentDueDate}
                                            >
                                                <i className="fa fa-file-excel me-2"></i>
                                                Export to Excel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    {formData.salaryMonth && (
                        <div className="col-xl-12">
                            <div className="card card-xl-stretch mb-5 mb-xl-8">
                                <div className="card-header border-0 pt-5">
                                    <h3 className="card-title align-items-start flex-column">
                                        <span className="card-label fw-bold fs-3 mb-1">
                                            <i className="fa fa-table me-2 text-primary"></i>
                                            Salary Schedule Preview
                                        </span>
                                        <span className="text-muted mt-1 fw-semibold fs-7">
                                            {tableData.length} staff members for {formatMonthYear(formData.salaryMonth)}
                                        </span>
                                    </h3>
                                </div>
                                <div className="card-body p-0">
                                    {isLoading ? (
                                        <div className="d-flex justify-content-center align-items-center p-10">
                                            <span className="spinner-border text-primary"></span>
                                        </div>
                                    ) : (
                                        <AGReportTable columns={columns} data={tableData} height="500px" />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Help Card */}
                    <div className="col-xl-12">
                        <div className="card card-xl-stretch mb-5 mb-xl-8">
                            <div className="card-header border-0">
                                <h3 className="card-title fw-bold text-dark">
                                    <i className="fa fa-info-circle me-2 text-info"></i>
                                    Instructions
                                </h3>
                            </div>
                            <div className="card-body pt-0">
                                <div className="d-flex align-items-center mb-4">
                                    <span className="bullet bullet-vertical h-40px bg-primary me-3"></span>
                                    <div className="flex-grow-1">
                                        <span className="text-gray-800 fw-bold fs-6">Step 1: Select Month</span>
                                        <span className="text-muted d-block fs-7">Choose the salary month you want to generate the schedule for</span>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center mb-4">
                                    <span className="bullet bullet-vertical h-40px bg-warning me-3"></span>
                                    <div className="flex-grow-1">
                                        <span className="text-gray-800 fw-bold fs-6">Step 2: Set Due Date</span>
                                        <span className="text-muted d-block fs-7">Enter the payment due date for the bank transfer</span>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center mb-4">
                                    <span className="bullet bullet-vertical h-40px bg-info me-3"></span>
                                    <div className="flex-grow-1">
                                        <span className="text-gray-800 fw-bold fs-6">Step 3: Verify Debit Account</span>
                                        <span className="text-muted d-block fs-7">Confirm the debit account number (default: 1229034027)</span>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <span className="bullet bullet-vertical h-40px bg-success me-3"></span>
                                    <div className="flex-grow-1">
                                        <span className="text-gray-800 fw-bold fs-6">Step 4: Export</span>
                                        <span className="text-muted d-block fs-7">Click "Export to Excel" to download the bank payment schedule</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(HrSalarySchedule);
