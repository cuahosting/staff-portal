import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";
import Select from 'react-select';
import { ProgressBar } from "react-bootstrap";

function HrSalaryManagement(props) {
    const token = props.loginData[0].token;
    const staffID = props.loginData[0].StaffID;
    const [isLoading, setIsLoading] = useState(true);

    // Main data states
    const [salaryRecords, setSalaryRecords] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [staffSelect, setStaffSelect] = useState([]);
    const [banksList, setBanksList] = useState([]);
    const [salarySettings, setSalarySettings] = useState(null);

    // Table data
    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Staff ID",
                field: "StaffID",
            },
            {
                label: "Staff Name",
                field: "StaffName",
            },
            {
                label: "Department",
                field: "Department",
            },
            {
                label: "Designation",
                field: "Designation",
            },
            {
                label: "Payment Amount",
                field: "PaymentAmount",
            },
            {
                label: "Bank Details",
                field: "BankDetails",
            },
            {
                label: "Due Date",
                field: "DueDate",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });

    // Form states
    const [createItem, setCreateItem] = useState({
        BeneficiaryName: "",
        StaffID: "",
        PaymentAmount: "",
        DueDate: "",
        BeneficiaryCode: "",
        BeneficiaryAccountNumber: "",
        BankSortCode: "",
        DebitAcconutNumber: "",
        EmployeeType: "",
        inserted_by: staffID,
        entry_id: "",
        staff: null
    });

    // Bulk add states
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [bulkData, setBulkData] = useState({
        PaymentAmount: "",
        DueDate: "",
        EmployeeType: ""
    });

    // View breakdown states
    const [breakdownData, setBreakdownData] = useState(null);
    const [viewingStaff, setViewingStaff] = useState(null);

    // History states
    const [historyData, setHistoryData] = useState(null);

    // Salary push states
    const [pushData, setPushData] = useState({
        salary_date: "",
        inserted_by: staffID
    });
    const [progress, setProgress] = useState({
        percentage: 0,
        variant: 'danger'
    });
    const [isPushing, setIsPushing] = useState(false);

    // Fetch all salary records
    const getSalaryRecords = async () => {
        try {
            await axios.get(`${serverLink}staff/hr/salaries/all`, token)
                .then((result) => {
                    const records = result.data;
                    setSalaryRecords(records);
                    formatTableData(records);
                })
                .catch((err) => {
                    console.log("NETWORK ERROR");
                    toast.error("Failed to fetch salary records");
                });
        } catch (e) {
            console.log(e);
        }
    };

    // Fetch all active staff
    const getStaffList = async () => {
        try {
            await axios.get(`${serverLink}staff/report/staff/list/status/1`, token)
                .then((result) => {
                    const staff = result.data;
                    setStaffList(staff);

                    // Format for react-select
                    let options = [];
                    staff.map((s) => {
                        options.push({
                            value: s.StaffID,
                            label: `${s.StaffID} -- ${s.StaffName}`
                        });
                    });
                    setStaffSelect(options);
                })
                .catch((err) => {
                    console.log("NETWORK ERROR");
                });
        } catch (e) {
            console.log(e);
        }
    };

    // Fetch banks list
    const getBanks = async () => {
        try {
            await axios.get(`${serverLink}staff/hr/staff/data`, token)
                .then((result) => {
                    setBanksList(result.data.banks);
                })
                .catch((err) => {
                    console.log("NETWORK ERROR");
                });
        } catch (e) {
            console.log(e);
        }
    };

    // Fetch salary settings
    const getSalarySettings = async () => {
        try {
            await axios.get(`${serverLink}staff/hr/payroll/salary/settings/record`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        setSalarySettings(result.data[0]);
                    }
                })
                .catch((err) => {
                    console.log("NETWORK ERROR");
                });
        } catch (e) {
            console.log(e);
        }
    };

    // Format table data
    const formatTableData = (records) => {
        let rows = [];
        records.forEach((item, index) => {
            const bankDetails = item.BeneficiaryAccountNumber ?
                `${item.BeneficiaryAccountNumber} (${item.BankSortCode || 'N/A'})` :
                "No bank details";

            rows.push({
                sn: index + 1,
                StaffID: item.StaffID,
                StaffName: item.StaffName || "N/A",
                Department: item.Department || "N/A",
                Designation: item.Designation || "N/A",
                PaymentAmount: currencyConverter(item.PaymentAmount),
                BankDetails: bankDetails,
                DueDate: item.DueDate || "N/A",
                action: (
                    <>
                        <button
                            className="btn btn-link p-0 text-info" style={{ marginRight: 15 }}
                            data-bs-toggle="modal"
                            data-bs-target="#breakdown_modal"
                            onClick={() => viewBreakdown(item.StaffID)}
                            title="View Breakdown"
                        >
                            <i style={{ fontSize: '15px', color: "#17a2b8" }} className="fa fa-eye" />
                        </button>
                        <button
                            className="btn btn-link p-0 text-success" style={{ marginRight: 15 }}
                            data-bs-toggle="modal"
                            data-bs-target="#history_modal"
                            onClick={() => viewHistory(item.StaffID)}
                            title="View History"
                        >
                            <i style={{ fontSize: '15px', color: "#28a745" }} className="fa fa-history" />
                        </button>
                        <button
                            className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }}
                            data-bs-toggle="modal"
                            data-bs-target="#kt_modal_general"
                            onClick={() => onEditSalary(item)}
                            title="Edit"
                        >
                            <i style={{ fontSize: '15px', color: "blue" }} className="fa fa-pen" />
                        </button>
                        <button
                            className="btn btn-link p-0 text-danger"
                            onClick={() => onDelete(item.EntryID)}
                            title="Delete"
                        >
                            <i style={{ fontSize: '15px', color: "red" }} className="fa fa-trash" />
                        </button>
                    </>
                )
            });
        });
        setDatatable({
            ...datatable,
            rows: rows,
        });
    };

    // Get bank name by ID
    const getBankName = (bankId) => {
        const bank = banksList.find(b => b.EntryID === parseInt(bankId));
        return bank ? bank.BankName : "N/A";
    };

    // Handle form input change
    const onEdit = (e) => {
        setCreateItem({
            ...createItem,
            [e.target.id]: e.target.value
        });
    };

    // Handle staff selection
    const handleStaffSelect = async (selectedOption) => {
        if (!selectedOption) {
            setCreateItem({
                ...createItem,
                staff: null,
                StaffID: "",
                BeneficiaryName: "",
                BeneficiaryAccountNumber: "",
                BankSortCode: "",
                BeneficiaryCode: ""
            });
            return;
        }

        setCreateItem({
            ...createItem,
            staff: selectedOption,
            StaffID: selectedOption.value
        });

        // Fetch staff details including bank info
        try {
            await axios.get(`${serverLink}staff/hr/staff/${selectedOption.value}`, token)
                .then((result) => {
                    const staffData = result.data.staff[0];
                    const bankData = result.data.staff_bank;

                    let updateData = {
                        ...createItem,
                        staff: selectedOption,
                        StaffID: selectedOption.value,
                        BeneficiaryName: `${staffData.FirstName} ${staffData.MiddleName || ''} ${staffData.Surname}`.trim(),
                        BeneficiaryCode: selectedOption.value
                    };

                    if (bankData.length > 0) {
                        updateData.BeneficiaryAccountNumber = bankData[0].AccountNumber;
                        updateData.BankSortCode = getBankName(bankData[0].BankID);
                    }

                    setCreateItem(updateData);
                })
                .catch((err) => {
                    console.log("Error fetching staff details");
                });
        } catch (e) {
            console.log(e);
        }
    };

    // Open add modal
    const onOpenAddModal = () => {
        setCreateItem({
            BeneficiaryName: "",
            StaffID: "",
            PaymentAmount: "",
            DueDate: "",
            BeneficiaryCode: "",
            BeneficiaryAccountNumber: "",
            BankSortCode: "",
            DebitAcconutNumber: "",
            EmployeeType: "",
            inserted_by: staffID,
            entry_id: "",
            staff: null
        });
    };

    // Edit salary record
    const onEditSalary = (item) => {
        const staffOption = staffSelect.find(s => s.value === item.StaffID);

        setCreateItem({
            BeneficiaryName: item.BeneficiaryName,
            StaffID: item.StaffID,
            PaymentAmount: item.PaymentAmount,
            DueDate: item.DueDate,
            BeneficiaryCode: item.BeneficiaryCode || "",
            BeneficiaryAccountNumber: item.BeneficiaryAccountNumber || "",
            BankSortCode: item.BankSortCode || "",
            DebitAcconutNumber: item.DebitAcconutNumber || "",
            EmployeeType: item.EmployeeType || "",
            inserted_by: staffID,
            entry_id: item.EntryID,
            staff: staffOption
        });
    };

    // Submit salary record (create or update)
    const onSubmitSalary = async () => {
        // Validation
        if (createItem.StaffID === "") {
            showAlert("EMPTY FIELD", "Please select a staff member", "error");
            return false;
        }

        if (createItem.BeneficiaryName === "") {
            showAlert("EMPTY FIELD", "Please enter beneficiary name", "error");
            return false;
        }

        if (createItem.PaymentAmount === "" || parseFloat(createItem.PaymentAmount) <= 0) {
            showAlert("INVALID AMOUNT", "Please enter a valid payment amount", "error");
            return false;
        }

        if (createItem.DueDate === "") {
            showAlert("EMPTY FIELD", "Please select a due date", "error");
            return false;
        }

        if (createItem.EmployeeType === "") {
            showAlert("EMPTY FIELD", "Please select employee type", "error");
            return false;
        }

        // Prepare data
        const submitData = {
            BeneficiaryName: createItem.BeneficiaryName,
            StaffID: createItem.StaffID,
            PaymentAmount: parseFloat(createItem.PaymentAmount),
            DueDate: createItem.DueDate,
            BeneficiaryCode: createItem.BeneficiaryCode,
            BeneficiaryAccountNumber: createItem.BeneficiaryAccountNumber,
            BankSortCode: createItem.BankSortCode,
            DebitAcconutNumber: createItem.DebitAcconutNumber,
            EmployeeType: createItem.EmployeeType
        };

        try {
            if (createItem.entry_id === "") {
                // Create new record
                await axios.post(`${serverLink}staff/hr/salaries/create`, submitData, token)
                    .then((result) => {
                        if (result.data.message === "success") {
                            toast.success("Salary record added successfully");
                            document.getElementById("closeModal").click();
                            getSalaryRecords();
                            onOpenAddModal();
                        } else if (result.data.message === "exist") {
                            toast.error("Salary record already exists for this staff");
                        } else if (result.data.message === "Staff not found") {
                            toast.error("Staff not found in the system");
                        } else {
                            toast.error("Failed to add salary record");
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        toast.error("Network error occurred");
                    });
            } else {
                // Update existing record
                submitData.EntryID = createItem.entry_id;
                await axios.patch(`${serverLink}staff/hr/salaries/update`, submitData, token)
                    .then((result) => {
                        if (result.data.message === "success") {
                            toast.success("Salary record updated successfully");
                            document.getElementById("closeModal").click();
                            getSalaryRecords();
                            onOpenAddModal();
                        } else {
                            toast.error("Failed to update salary record");
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        toast.error("Network error occurred");
                    });
            }
        } catch (e) {
            console.log(e);
            toast.error("An error occurred");
        }
    };

    // Delete salary record
    const onDelete = (entryId) => {
        showAlert(
            "CONFIRM DELETE",
            "Are you sure you want to delete this salary record? This action cannot be undone.",
            "warning",
            true,
            () => {
                axios.delete(`${serverLink}staff/hr/salaries/delete/${entryId}`, token)
                    .then((result) => {
                        if (result.data.message === "success") {
                            toast.success("Salary record deleted successfully");
                            getSalaryRecords();
                        } else {
                            toast.error("Failed to delete salary record");
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        toast.error("Network error occurred");
                    });
            }
        );
    };

    // Handle bulk staff selection
    const handleBulkStaffSelect = (selectedOptions) => {
        setSelectedStaff(selectedOptions || []);
    };

    // Handle bulk data input
    const onBulkEdit = (e) => {
        setBulkData({
            ...bulkData,
            [e.target.id]: e.target.value
        });
    };

    // Open bulk add modal
    const onOpenBulkModal = () => {
        setSelectedStaff([]);
        setBulkData({
            PaymentAmount: "",
            DueDate: "",
            EmployeeType: ""
        });
    };

    // Submit bulk staff addition
    const onSubmitBulk = async () => {
        // Validation
        if (selectedStaff.length === 0) {
            showAlert("NO STAFF SELECTED", "Please select at least one staff member", "error");
            return false;
        }

        if (bulkData.PaymentAmount === "" || parseFloat(bulkData.PaymentAmount) <= 0) {
            showAlert("INVALID AMOUNT", "Please enter a valid payment amount", "error");
            return false;
        }

        if (bulkData.DueDate === "") {
            showAlert("EMPTY FIELD", "Please select a due date", "error");
            return false;
        }

        if (bulkData.EmployeeType === "") {
            showAlert("EMPTY FIELD", "Please select employee type", "error");
            return false;
        }

        toast.info(`Adding ${selectedStaff.length} staff to salary records...`);

        let successCount = 0;
        let errorCount = 0;

        // Process each selected staff
        for (let i = 0; i < selectedStaff.length; i++) {
            const staffId = selectedStaff[i].value;

            try {
                // Fetch staff details
                const staffResponse = await axios.get(`${serverLink}staff/hr/staff/${staffId}`, token);
                const staffData = staffResponse.data.staff[0];
                const bankData = staffResponse.data.staff_bank;

                const submitData = {
                    BeneficiaryName: `${staffData.FirstName} ${staffData.MiddleName || ''} ${staffData.Surname}`.trim(),
                    StaffID: staffId,
                    PaymentAmount: parseFloat(bulkData.PaymentAmount),
                    DueDate: bulkData.DueDate,
                    BeneficiaryCode: staffId,
                    BeneficiaryAccountNumber: bankData.length > 0 ? bankData[0].AccountNumber : "",
                    BankSortCode: bankData.length > 0 ? getBankName(bankData[0].BankID) : "",
                    DebitAcconutNumber: "",
                    EmployeeType: bulkData.EmployeeType
                };

                const result = await axios.post(`${serverLink}staff/hr/salaries/create`, submitData, token);

                if (result.data.message === "success") {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (err) {
                console.log(err);
                errorCount++;
            }
        }

        if (successCount > 0) {
            toast.success(`Successfully added ${successCount} staff to salary records`);
        }

        if (errorCount > 0) {
            toast.warning(`${errorCount} staff could not be added (may already exist or errors occurred)`);
        }

        document.getElementById("closeBulkModal").click();
        getSalaryRecords();
        onOpenBulkModal();
    };

    // View salary breakdown
    const viewBreakdown = async (staffId) => {
        setBreakdownData(null);
        setViewingStaff(staffId);

        const currentDate = new Date();
        const salaryDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

        try {
            await axios.get(`${serverLink}staff/hr/salaries/${staffId}/${salaryDate}`, token)
                .then((result) => {
                    if (result.data.message) {
                        toast.error(result.data.message);
                    } else {
                        setBreakdownData(result.data);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    toast.error("Failed to fetch salary breakdown");
                });
        } catch (e) {
            console.log(e);
        }
    };

    // View salary history
    const viewHistory = async (staffId) => {
        setHistoryData(null);

        try {
            await axios.get(`${serverLink}staff/hr/salaries/history/${staffId}`, token)
                .then((result) => {
                    if (result.data.message) {
                        toast.error(result.data.message);
                    } else {
                        setHistoryData(result.data);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    toast.error("Failed to fetch salary history");
                });
        } catch (e) {
            console.log(e);
        }
    };

    // Handle salary push input
    const onPushEdit = (e) => {
        setPushData({
            ...pushData,
            [e.target.id]: e.target.value
        });
    };

    // Submit salary push
    const onSubmitPush = async () => {
        if (pushData.salary_date === "") {
            showAlert("EMPTY FIELD", "Please select a salary month", "error");
            return false;
        }

        showAlert(
            "CONFIRM SALARY PUSH",
            `Are you sure you want to generate salaries for ${pushData.salary_date}? This will process all active staff.`,
            "warning",
            true,
            async () => {
                setIsPushing(true);
                setProgress({ percentage: 0, variant: 'danger' });

                try {
                    await axios.post(`${serverLink}staff/hr/salaries/push`, pushData, token)
                        .then((result) => {
                            if (result.data.message === "success") {
                                setProgress({ percentage: 100, variant: 'success' });
                                toast.success("Salary push completed successfully");

                                setTimeout(() => {
                                    document.getElementById("closePushModal").click();
                                    getSalaryRecords();
                                    setIsPushing(false);
                                    setPushData({ salary_date: "", inserted_by: staffID });
                                    setProgress({ percentage: 0, variant: 'danger' });
                                }, 2000);
                            } else if (result.data.message === "exist") {
                                toast.error(result.data.info || "Salary already processed for this month");
                                setIsPushing(false);
                            } else {
                                toast.error(result.data.message || "Failed to push salaries");
                                setIsPushing(false);
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            toast.error("Network error occurred");
                            setIsPushing(false);
                        });
                } catch (e) {
                    console.log(e);
                    toast.error("An error occurred");
                    setIsPushing(false);
                }
            }
        );
    };

    // Initialize component
    useEffect(() => {
        const fetchData = async () => {
            await getSalaryRecords();
            await getStaffList();
            await getBanks();
            await getSalarySettings();
            setIsLoading(false);
        };

        fetchData();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Salary Management"}
                items={["Human Resources", "Payroll", "Salary Management"]}
            />

            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title">
                            <h3 className="fw-bold m-0">Staff Salary Records</h3>
                        </div>
                        <div className="card-toolbar">
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    data-bs-toggle="modal"
                                    data-bs-target="#push_modal"
                                    onClick={() => setPushData({ salary_date: "", inserted_by: staffID })}
                                >
                                    <i className="fa fa-play-circle me-2" />
                                    Push Salaries
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-info"
                                    data-bs-toggle="modal"
                                    data-bs-target="#bulk_modal"
                                    onClick={onOpenBulkModal}
                                >
                                    <i className="fa fa-users me-2" />
                                    Bulk Add Staff
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={onOpenAddModal}
                                >
                                    <i className="fa fa-plus me-2" />
                                    Add New Record
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        <AGTable data={datatable} />
                    </div>
                </div>
            </div>

            {/* Modal 1: Add/Edit Salary Record */}
            <Modal title={createItem.entry_id === "" ? "Add Salary Record" : "Edit Salary Record"} large={true}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="staff_select" className="form-label required">Select Staff</label>
                        <Select
                            isDisabled={createItem.entry_id !== ""}
                            name="staff_select"
                            value={createItem.staff}
                            onChange={handleStaffSelect}
                            options={staffSelect}
                            placeholder="Select staff member"
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="BeneficiaryName" className="form-label required">Beneficiary Name</label>
                        <input
                            type="text"
                            id="BeneficiaryName"
                            onChange={onEdit}
                            value={createItem.BeneficiaryName}
                            className="form-control"
                            placeholder="Enter beneficiary name"
                        />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="PaymentAmount" className="form-label required">Payment Amount (₦)</label>
                        <input
                            type="number"
                            step="0.01"
                            id="PaymentAmount"
                            onChange={onEdit}
                            value={createItem.PaymentAmount}
                            className="form-control"
                            placeholder="Enter payment amount"
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="DueDate" className="form-label required">Due Date</label>
                        <input
                            type="date"
                            id="DueDate"
                            onChange={onEdit}
                            value={createItem.DueDate}
                            className="form-control"
                        />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="BeneficiaryCode" className="form-label">Beneficiary Code</label>
                        <input
                            type="text"
                            id="BeneficiaryCode"
                            onChange={onEdit}
                            value={createItem.BeneficiaryCode}
                            className="form-control"
                            placeholder="Enter beneficiary code"
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="EmployeeType" className="form-label required">Employee Type</label>
                        <select
                            id="EmployeeType"
                            onChange={onEdit}
                            value={createItem.EmployeeType}
                            className="form-select"
                        >
                            <option value="">Select employee type</option>
                            <option value="Full-Time">Full-Time</option>
                            <option value="Part-Time">Part-Time</option>
                            <option value="Contract">Contract</option>
                        </select>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="BeneficiaryAccountNumber" className="form-label">Account Number</label>
                        <input
                            type="text"
                            id="BeneficiaryAccountNumber"
                            onChange={onEdit}
                            value={createItem.BeneficiaryAccountNumber}
                            className="form-control"
                            placeholder="Enter account number"
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="BankSortCode" className="form-label">Bank Name</label>
                        <input
                            type="text"
                            id="BankSortCode"
                            onChange={onEdit}
                            value={createItem.BankSortCode}
                            className="form-control"
                            placeholder="Enter bank name"
                        />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-12">
                        <label htmlFor="DebitAcconutNumber" className="form-label">Debit Account Number</label>
                        <input
                            type="text"
                            id="DebitAcconutNumber"
                            onChange={onEdit}
                            value={createItem.DebitAcconutNumber}
                            className="form-control"
                            placeholder="Enter debit account number"
                        />
                    </div>
                </div>

                <div className="form-group pt-2">
                    <button onClick={onSubmitSalary} className="btn btn-primary w-100">
                        {createItem.entry_id === "" ? "Add Salary Record" : "Update Salary Record"}
                    </button>
                </div>
            </Modal>

            {/* Modal 2: Bulk Add Staff */}
            <div className="modal fade" tabIndex="-1" id="bulk_modal">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Bulk Add Staff to Salary Records</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeBulkModal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <label className="form-label required">Select Staff Members</label>
                                    <Select
                                        isMulti
                                        name="bulk_staff"
                                        options={staffSelect}
                                        value={selectedStaff}
                                        onChange={handleBulkStaffSelect}
                                        placeholder="Select multiple staff members"
                                    />
                                    <small className="text-muted">Selected: {selectedStaff.length} staff</small>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label htmlFor="PaymentAmount" className="form-label required">Payment Amount (₦)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        id="PaymentAmount"
                                        onChange={onBulkEdit}
                                        value={bulkData.PaymentAmount}
                                        className="form-control"
                                        placeholder="Enter payment amount"
                                    />
                                    <small className="text-muted">This amount will be applied to all selected staff</small>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="DueDate" className="form-label required">Due Date</label>
                                    <input
                                        type="date"
                                        id="DueDate"
                                        onChange={onBulkEdit}
                                        value={bulkData.DueDate}
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-12">
                                    <label htmlFor="EmployeeType" className="form-label required">Employee Type</label>
                                    <select
                                        id="EmployeeType"
                                        onChange={onBulkEdit}
                                        value={bulkData.EmployeeType}
                                        className="form-select"
                                    >
                                        <option value="">Select employee type</option>
                                        <option value="Full-Time">Full-Time</option>
                                        <option value="Part-Time">Part-Time</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>
                            </div>

                            <div className="alert alert-info">
                                <i className="fa fa-info-circle me-2" />
                                Bank details will be automatically fetched from staff records if available.
                            </div>

                            <div className="form-group pt-2">
                                <button onClick={onSubmitBulk} className="btn btn-primary w-100">
                                    Add {selectedStaff.length} Staff to Salary Records
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal 3: View Breakdown */}
            <div className="modal fade" tabIndex="-1" id="breakdown_modal">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Salary Breakdown</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {breakdownData ? (
                                <>
                                    <div className="mb-4">
                                        <h6 className="fw-bold">Staff Information</h6>
                                        <table className="table table-sm table-borderless">
                                            <tbody>
                                                <tr>
                                                    <td className="fw-bold">Staff ID:</td>
                                                    <td>{breakdownData.staffInfo.StaffID}</td>
                                                    <td className="fw-bold">Full Name:</td>
                                                    <td>{breakdownData.staffInfo.FullName}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-bold">Department:</td>
                                                    <td>{breakdownData.staffInfo.Department}</td>
                                                    <td className="fw-bold">Designation:</td>
                                                    <td>{breakdownData.staffInfo.Designation}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mb-4">
                                        <h6 className="fw-bold text-success">Allowances</h6>
                                        <table className="table table-sm table-hover">
                                            <tbody>
                                                <tr>
                                                    <td>Basic Salary ({breakdownData.salarySettings.Basic}%)</td>
                                                    <td className="text-end">{currencyConverter(breakdownData.salaryBreakdown.allowances.basic)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Housing Allowance ({breakdownData.salarySettings.Housing}%)</td>
                                                    <td className="text-end">{currencyConverter(breakdownData.salaryBreakdown.allowances.housing)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Transport Allowance ({breakdownData.salarySettings.Transport}%)</td>
                                                    <td className="text-end">{currencyConverter(breakdownData.salaryBreakdown.allowances.transport)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Fringe Benefit ({breakdownData.salarySettings.Fringe}%)</td>
                                                    <td className="text-end">{currencyConverter(breakdownData.salaryBreakdown.allowances.fringe)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Medical Allowance ({breakdownData.salarySettings.Medical}%)</td>
                                                    <td className="text-end">{currencyConverter(breakdownData.salaryBreakdown.allowances.medical)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Wardrobe Allowance ({breakdownData.salarySettings.Wardrobe}%)</td>
                                                    <td className="text-end">{currencyConverter(breakdownData.salaryBreakdown.allowances.wardrobe)}</td>
                                                </tr>
                                                {breakdownData.salaryBreakdown.allowances.additional > 0 && (
                                                    <tr>
                                                        <td>Additional Allowances</td>
                                                        <td className="text-end">{currencyConverter(breakdownData.salaryBreakdown.allowances.additional)}</td>
                                                    </tr>
                                                )}
                                                <tr className="fw-bold border-top">
                                                    <td>Total Allowances</td>
                                                    <td className="text-end text-success">{currencyConverter(breakdownData.salaryBreakdown.allowances.total)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mb-4">
                                        <h6 className="fw-bold text-danger">Deductions</h6>
                                        <table className="table table-sm table-hover">
                                            <tbody>
                                                <tr>
                                                    <td>PAYE Tax</td>
                                                    <td className="text-end">{currencyConverter(breakdownData.salaryBreakdown.deductions.tax)}</td>
                                                </tr>
                                                {breakdownData.pensionSettings && breakdownData.pensionSettings.IsEnrolled && (
                                                    <>
                                                        <tr>
                                                            <td>Pension (Employee Contribution - {breakdownData.pensionSettings.EmployeeContribution}%)</td>
                                                            <td className="text-end">{currencyConverter(breakdownData.salaryBreakdown.deductions.pensionEmployee)}</td>
                                                        </tr>
                                                        <tr className="text-muted">
                                                            <td>Pension (Employer Contribution - {breakdownData.pensionSettings.EmployerContribution}%)</td>
                                                            <td className="text-end">{currencyConverter(breakdownData.salaryBreakdown.deductions.pensionEmployer)}</td>
                                                        </tr>
                                                    </>
                                                )}
                                                {breakdownData.salaryBreakdown.deductions.additional > 0 && (
                                                    <tr>
                                                        <td>Additional Deductions</td>
                                                        <td className="text-end">{currencyConverter(breakdownData.salaryBreakdown.deductions.additional)}</td>
                                                    </tr>
                                                )}
                                                <tr className="fw-bold border-top">
                                                    <td>Total Deductions</td>
                                                    <td className="text-end text-danger">{currencyConverter(breakdownData.salaryBreakdown.deductions.total)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="alert alert-primary">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="fw-bold fs-5">Net Salary:</span>
                                            <span className="fw-bold fs-4">{currencyConverter(breakdownData.salaryBreakdown.netSalary)}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-3">Loading salary breakdown...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal 4: Salary History */}
            <div className="modal fade" tabIndex="-1" id="history_modal">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Salary History</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {historyData ? (
                                <>
                                    <div className="mb-4">
                                        <h6 className="fw-bold">Staff Information</h6>
                                        <table className="table table-sm table-borderless">
                                            <tbody>
                                                <tr>
                                                    <td className="fw-bold">Staff ID:</td>
                                                    <td>{historyData.staffInfo.StaffID}</td>
                                                    <td className="fw-bold">Full Name:</td>
                                                    <td>{historyData.staffInfo.FullName}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-bold">Department:</td>
                                                    <td>{historyData.staffInfo.Department}</td>
                                                    <td className="fw-bold">Designation:</td>
                                                    <td>{historyData.staffInfo.Designation}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mb-4">
                                        <h6 className="fw-bold">Monthly Salary Summary</h6>
                                        {historyData.salaryHistory.length > 0 ? (
                                            <table className="table table-sm table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Salary Month</th>
                                                        <th className="text-end">Total Allowances</th>
                                                        <th className="text-end">Total Deductions</th>
                                                        <th className="text-end">Net Salary</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {historyData.salaryHistory.map((record, index) => (
                                                        <tr key={index}>
                                                            <td>{record.salaryDate}</td>
                                                            <td className="text-end text-success">{currencyConverter(record.totalAllowances)}</td>
                                                            <td className="text-end text-danger">{currencyConverter(record.totalDeductions)}</td>
                                                            <td className="text-end fw-bold">{currencyConverter(record.netSalary)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="alert alert-info">
                                                No salary history found for this staff member.
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-3">Loading salary history...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal 5: Salary Push */}
            <div className="modal fade" tabIndex="-1" id="push_modal">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Push Salaries for All Active Staff</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closePushModal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="salary_date" className="form-label required">Salary Month</label>
                                <input
                                    type="month"
                                    id="salary_date"
                                    onChange={onPushEdit}
                                    value={pushData.salary_date}
                                    className="form-control"
                                    disabled={isPushing}
                                />
                                <small className="text-muted">Select the month for which to generate salaries</small>
                            </div>

                            {isPushing && (
                                <div className="mb-3">
                                    <label className="form-label">Processing...</label>
                                    <ProgressBar
                                        now={progress.percentage}
                                        label={`${progress.percentage}%`}
                                        variant={progress.variant}
                                        striped
                                        animated
                                    />
                                </div>
                            )}

                            <div className="alert alert-warning">
                                <i className="fa fa-exclamation-triangle me-2" />
                                <strong>Warning:</strong> This will calculate and post salaries for all active staff members.
                                Make sure salary settings are configured correctly before proceeding.
                            </div>

                            <div className="form-group pt-2">
                                <button
                                    onClick={onSubmitPush}
                                    className="btn btn-success w-100"
                                    disabled={isPushing}
                                >
                                    {isPushing ? "Processing..." : "Push Salaries"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(HrSalaryManagement);
