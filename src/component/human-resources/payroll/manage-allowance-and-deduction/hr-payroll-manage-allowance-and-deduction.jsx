import React, { useEffect, useState } from "react";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import AGReportTable from "../../../common/table/AGReportTable";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";
import Modal from "../../../common/modal/modal";
import { connect } from "react-redux";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import SearchSelect from "../../../common/select/SearchSelect";

function HRPayrollManageAllowanceAndDeduction(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [ledgerList, setLedgerList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [staffSelect, setStaffSelect] = useState([]);
    const columns = ["SN", "Action", "Staff ID", "Staff Name", "Post Type", "Ledger Account", "Start Date", "End Date", "Frequency", "Amount", "Status", "Added By"];
    const [data, setData] = useState([]);

    // Bulk Allowance State
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkPreview, setBulkPreview] = useState(null);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkForm, setBulkForm] = useState({
        percentage: "",
        post_type: "Allowance",
        ledger_account: "",
        start_date: "",
        end_date: "",
        frequency: "Monthly"
    });

    const [createItem, setCreateItem] = useState({
        staff_id: "",
        post_type: "",
        ledger_account: "",
        start_date: "",
        end_date: "",
        frequency: "",
        amount: "",
        inserted_by: props.loginData[0].StaffID,
        status: "active",
        entry_id: "",
    });

    const onClear = () => {
        setCreateItem({
            ...createItem,
            staff_id: "",
            staff: "",
            post_type: "",
            ledger_account: "",
            start_date: "",
            end_date: "",
            frequency: "",
            amount: "",
            status: "active",
            inserted_by: props.loginData[0].StaffID,
            entry_id: "",
        });
    };

    const getRecord = async () => {
        const [ledgerRes, entryRes, staffRes] = await Promise.all([
            api.get("staff/hr/payroll/ledger/list"),
            api.get("staff/hr/payroll/entry/list"),
            api.get("staff/report/staff/list/status/1")
        ]);

        if (ledgerRes.success && ledgerRes.data?.length > 0) {
            setLedgerList(ledgerRes.data);
        }

        if (entryRes.success && entryRes.data?.length > 0) {
            const rows = entryRes.data.map((item, index) => [
                index + 1,
                <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#kt_modal_general"
                    onClick={() => {
                        setCreateItem({
                            staff_id: item.StaffID,
                            staff: { value: item.StaffID, label: item.StaffID + "--" + item.StaffName },
                            post_type: item.PostType,
                            ledger_account: item.LedgerAccount,
                            start_date: item.StartDate,
                            end_date: item.EndDate,
                            frequency: item.Frequency,
                            amount: item.Amount,
                            status: item.Status,
                            inserted_by: props.loginData[0].StaffID,
                            entry_id: item.EntryID,
                        });
                    }}
                >
                    <i className="fa fa-pen" />
                </button>,
                item.StaffID,
                item.StaffName,
                item.PostType,
                item.Description,
                formatDateAndTime(item.StartDate, "month_and_year"),
                formatDateAndTime(item.EndDate, "month_and_year"),
                item.Frequency,
                currencyConverter(item.Amount),
                item.Status,
                item.InsertedBy
            ]);
            setData(rows);
        }

        if (staffRes.success && staffRes.data?.length > 0) {
            setStaffList(staffRes.data);
            const staffRows = staffRes.data.map(row => ({
                value: row.StaffID,
                label: row.StaffID + "--" + row.StaffName
            }));
            setStaffSelect(staffRows);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        getRecord();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onEdit = (e) => {
        setCreateItem({ ...createItem, [e.target.id]: e.target.value });
    };

    const handleStaffEdit = (e) => {
        setCreateItem({
            ...createItem,
            staff_id: e?.value || "",
            staff: e
        });
    };

    // Bulk Allowance Functions
    const handleBulkPreview = async () => {
        if (!bulkForm.percentage) {
            toast.warning("Please enter a percentage");
            return;
        }
        setBulkLoading(true);
        try {
            const { success, data } = await api.post("staff/hr/salaries/bulk-allowance-preview", {
                percentage: bulkForm.percentage,
                post_type: bulkForm.post_type
            });
            if (success && data.preview) {
                setBulkPreview(data);
            }
        } catch (err) {
            toast.error("Failed to generate preview");
        }
        setBulkLoading(false);
    };

    const handleBulkSubmit = async () => {
        if (!bulkForm.percentage || !bulkForm.ledger_account || !bulkForm.start_date || !bulkForm.end_date) {
            toast.warning("Please fill all required fields");
            return;
        }

        setBulkLoading(true);
        try {
            const { success, data } = await api.post("staff/hr/salaries/bulk-allowance-by-percentage", {
                ...bulkForm,
                inserted_by: props.loginData[0].StaffID
            });
            if (success && data.message === "success") {
                toast.success(`Successfully allocated to ${data.summary.staffProcessed} staff members`);
                setShowBulkModal(false);
                setBulkPreview(null);
                setBulkForm({ percentage: "", post_type: "Allowance", ledger_account: "", start_date: "", end_date: "", frequency: "Monthly" });
                getRecord();
            } else {
                toast.error(data.message || "Failed to process bulk allocation");
            }
        } catch (err) {
            toast.error("Failed to process bulk allocation");
        }
        setBulkLoading(false);
    };

    const onSubmit = async () => {
        if (createItem.staff_id === "") {
            showAlert("EMPTY FIELD", "Please select the staff", "error");
            return false;
        }

        if (createItem.post_type === "") {
            showAlert("EMPTY FIELD", "Please select the post type", "error");
            return false;
        }

        if (createItem.ledger_account === "") {
            showAlert("EMPTY FIELD", "Please select the ledger account", "error");
            return false;
        }

        if (createItem.frequency === "") {
            showAlert("EMPTY FIELD", "Please select the frequency", "error");
            return false;
        }

        if (createItem.start_date === "") {
            showAlert("EMPTY FIELD", "Please select the start date", "error");
            return false;
        }

        if (createItem.end_date === "") {
            showAlert("EMPTY FIELD", "Please select the end date", "error");
            return false;
        }

        if (createItem.frequency === 'Once') {
            if (createItem.start_date !== createItem.end_date) {
                showAlert("EMPTY FIELD", "Please check your start and end date. You can't select more than one month for a frequency of once!", "error");
                return false;
            }
        }

        if (createItem.status === "") {
            showAlert("EMPTY FIELD", "Please select the status", "error");
            return false;
        }

        if (createItem.amount === "") {
            showAlert("EMPTY FIELD", "Please enter the amount", "error");
            return false;
        }

        if (createItem.entry_id === "") {
            toast.warning("Adding, please wait...");
            const { success, data } = await api.post("staff/hr/payroll/entry/add", createItem);

            if (success && data?.message === "success") {
                toast.success("Record Added Successfully");
                document.getElementById("closeModal").click();
                getRecord();
                onClear();
            } else if (success) {
                showAlert("ERROR", "Something went wrong. Please try again!", "error");
            }
        } else {
            toast.warning("Updating, please wait...");
            const { success, data } = await api.patch("staff/hr/payroll/entry/update", createItem);

            if (success && data?.message === "success") {
                toast.success("Record Updated Successfully");
                document.getElementById("closeModal").click();
                getRecord();
                onClear();
            } else if (success) {
                showAlert("ERROR", "Something went wrong. Please try again!", "error");
            }
        }
    };

    return isLoading ? (
        <Loader />
    ) : (
        <div style={{ width: '100%' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Allowances and Deductions</h3>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><a href="/">Home</a></li>
                            <li className="breadcrumb-item">Human Resource</li>
                            <li className="breadcrumb-item">Payroll</li>
                            <li className="breadcrumb-item active">Manage Allowance and Deduction</li>
                        </ol>
                    </nav>
                </div>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => setShowBulkModal(true)}
                    >
                        <i className="fa fa-users me-2"></i>Bulk Allocation by %
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_modal_general"
                        onClick={onClear}
                    >
                        <i className="fa fa-plus me-2"></i>Add New
                    </button>
                </div>
            </div>

            <div className="card shadow-sm" style={{ width: '100%' }}>
                <div className="card-body p-0" style={{ width: '100%' }}>
                    <AGReportTable columns={columns} data={data} height="600px" />
                </div>
            </div>

            {/* Bulk Allocation Modal */}
            {showBulkModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Bulk Allocation by Percentage of Gross Pay</h5>
                                <button type="button" className="btn-close" onClick={() => { setShowBulkModal(false); setBulkPreview(null); }}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row mb-4">
                                    <div className="col-md-3">
                                        <label className="form-label required">Percentage (%)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            value={bulkForm.percentage}
                                            onChange={(e) => setBulkForm({ ...bulkForm, percentage: e.target.value })}
                                            placeholder="e.g., 5"
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label required">Post Type</label>
                                        <select
                                            className="form-select"
                                            value={bulkForm.post_type}
                                            onChange={(e) => setBulkForm({ ...bulkForm, post_type: e.target.value })}
                                        >
                                            <option value="Allowance">Allowance</option>
                                            <option value="Deduction">Deduction</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label required">Ledger Account</label>
                                        <SearchSelect
                                            options={ledgerList.map(item => ({ label: `${item.Description} (${item.AccountNumber})`, value: item.EntryID }))}
                                            value={ledgerList.map(item => ({ label: `${item.Description} (${item.AccountNumber})`, value: item.EntryID })).find(op => op.value === bulkForm.ledger_account) || null}
                                            onChange={(selected) => setBulkForm({ ...bulkForm, ledger_account: selected?.value || '' })}
                                            placeholder="Select Ledger"
                                        />
                                    </div>
                                    <div className="col-md-2 d-flex align-items-end">
                                        <button className="btn btn-info w-100" onClick={handleBulkPreview} disabled={bulkLoading}>
                                            <i className="fa fa-eye me-1"></i>Preview
                                        </button>
                                    </div>
                                </div>
                                <div className="row mb-4">
                                    <div className="col-md-3">
                                        <label className="form-label required">Start Date</label>
                                        <input type="month" className="form-control" value={bulkForm.start_date} onChange={(e) => setBulkForm({ ...bulkForm, start_date: e.target.value })} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label required">End Date</label>
                                        <input type="month" className="form-control" value={bulkForm.end_date} min={bulkForm.start_date} onChange={(e) => setBulkForm({ ...bulkForm, end_date: e.target.value })} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Frequency</label>
                                        <select className="form-select" value={bulkForm.frequency} onChange={(e) => setBulkForm({ ...bulkForm, frequency: e.target.value })}>
                                            <option value="Once">Once</option>
                                            <option value="Monthly">Monthly</option>
                                            <option value="Quarterly">Quarterly</option>
                                            <option value="Annually">Annually</option>
                                        </select>
                                    </div>
                                </div>

                                {bulkPreview && (
                                    <div className="mt-4">
                                        <div className="alert alert-info">
                                            <strong>Preview Summary:</strong> {bulkPreview.staffCount} staff members |
                                            <strong> Total Amount:</strong> {currencyConverter(bulkPreview.totalAmount)} |
                                            <strong> Type:</strong> {bulkForm.post_type}
                                        </div>
                                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            <table className="table table-sm table-bordered">
                                                <thead className="table-light">
                                                    <tr><th>Staff ID</th><th>Staff Name</th><th>Gross Pay</th><th>Calculated Amount ({bulkForm.percentage}%)</th></tr>
                                                </thead>
                                                <tbody>
                                                    {bulkPreview.preview.slice(0, 50).map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td>{item.staffId}</td>
                                                            <td>{item.staffName}</td>
                                                            <td>{currencyConverter(item.grossPay)}</td>
                                                            <td className="text-success fw-bold">{currencyConverter(item.calculatedAmount)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {bulkPreview.preview.length > 50 && <p className="text-muted">...and {bulkPreview.preview.length - 50} more</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowBulkModal(false); setBulkPreview(null); }}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleBulkSubmit} disabled={bulkLoading || !bulkPreview}>
                                    {bulkLoading ? 'Processing...' : 'Apply to All Staff'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Modal title={"Manage Allowance and Deduction Form"} large={true}>
                <div className="row mb-5">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="staff_id">Select Staff</label>
                            <SearchSelect
                                isDisabled={createItem.staff !== ""}
                                id="staff"
                                value={createItem.staff}
                                onChange={handleStaffEdit}
                                options={staffSelect}
                                placeholder="select staff"
                            />
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="post_type">Select Post Type</label>
                            <SearchSelect
                                id="post_type"
                                onChange={(selected) => onEdit({ target: { id: 'post_type', value: selected?.value || '' } })}
                                value={[{ label: 'Allowance', value: 'Allowance' }, { label: 'Deduction', value: 'Deduction' }].find(op => op.value === createItem.post_type) || null}
                                options={[{ label: 'Allowance', value: 'Allowance' }, { label: 'Deduction', value: 'Deduction' }]}
                                placeholder="Select Option"
                            />
                        </div>
                    </div>
                </div>

                <div className="row mb-5">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="ledger_account">Select Ledger Account</label>
                            <SearchSelect
                                id="ledger_account"
                                onChange={(selected) => onEdit({ target: { id: 'ledger_account', value: selected?.value || '' } })}
                                value={ledgerList ? ledgerList.map(item => ({ label: `${item.Description} (${item.AccountNumber})`, value: item.EntryID })).find(op => op.value === createItem.ledger_account) || null : null}
                                options={ledgerList ? ledgerList.map(item => ({ label: `${item.Description} (${item.AccountNumber})`, value: item.EntryID })) : []}
                                placeholder="Select Option"
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="frequency">Select Frequency</label>
                            <SearchSelect
                                id="frequency"
                                onChange={(selected) => onEdit({ target: { id: 'frequency', value: selected?.value || '' } })}
                                value={[{ label: 'Once', value: 'Once' }, { label: 'Monthly', value: 'Monthly' }, { label: 'Quarterly', value: 'Quarterly' }, { label: 'Annually', value: 'Annually' }].find(op => op.value === createItem.frequency) || null}
                                options={[{ label: 'Once', value: 'Once' }, { label: 'Monthly', value: 'Monthly' }, { label: 'Quarterly', value: 'Quarterly' }, { label: 'Annually', value: 'Annually' }]}
                                placeholder="Select Option"
                            />
                        </div>
                    </div>
                </div>

                <div className="row mb-5">
                    <div className="col-md-6">
                        <label htmlFor="start_date">Start Date</label>
                        <input type="month" id="start_date" disabled={createItem.frequency === ''} onChange={onEdit} value={createItem.start_date} className="form-control" />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="end_date">End Date</label>
                        <input type="month" id="end_date" disabled={createItem.frequency === '' || createItem.start_date === ''} min={createItem.start_date} max={createItem.frequency === 'Once' ? createItem.start_date : ''} onChange={onEdit} value={createItem.end_date} className="form-control" />
                    </div>
                </div>

                <div className="row mb-5">
                    <div className="col-md-6">
                        <label htmlFor="status">Select Status</label>
                        <SearchSelect
                            id="status"
                            onChange={(selected) => onEdit({ target: { id: 'status', value: selected?.value || '' } })}
                            value={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }].find(op => op.value === createItem.status) || null}
                            options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]}
                            placeholder="Select Status"
                        />
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="Amount">Amount</label>
                        <input type="number" step={0.01} id="amount" onChange={onEdit} value={createItem.amount} className="form-control" />
                    </div>
                </div>

                <div className="form-group pt-2">
                    <button onClick={onSubmit} className="btn btn-primary w-100">
                        Submit
                    </button>
                </div>
            </Modal>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(HRPayrollManageAllowanceAndDeduction);
