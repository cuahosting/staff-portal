import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import AGReportTable from "../../../common/table/AGReportTable";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";
import Modal from "../../../common/modal/modal";
import { connect } from "react-redux";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import SearchSelect from "../../../common/select/SearchSelect";



function HRPayrollManageAllowanceAndDeduction(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [ledgerList, setLedgerList] = useState([]);
    const [ledgerSelect, setLedgerSelect] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [staffSelect, setStaffSelect] = useState([]);
    const columns = ["SN", "Action", "Staff ID", "Staff Name", "Post Type", "Ledger Account", "Start Date", "End Date", "Frequency", "Amount", "Status", "Added By"]
    const [data, setData] = useState([]);
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
    })

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
        })
    };

    const getRecord = async () => {
        await axios
            .get(`${serverLink}staff/hr/payroll/ledger/list`, token)
            .then((result) => {
                const data = result.data;
                setLedgerList(data)
                if (data.length > 0) {
                    let ledger_list = [];
                    data.map(item => {
                        ledger_list.push({ value: item.EntryID, label: item.Description, id: 'ledger_account' })
                    })
                    setLedgerSelect(ledger_list);
                }
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });

        await axios
            .get(`${serverLink}staff/hr/payroll/entry/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((item, index) => {
                        rows.push([
                            index + 1,
                            <button
                                className={"btn btn-sm btn-primary"}
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_general"
                                onClick={async () => {

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
                                    })
                                }

                                }
                            ><i className="fa fa-pen" /></button>,
                            item.StaffID, item.StaffName, item.PostType, item.Description,
                            formatDateAndTime(item.StartDate, "month_and_year"),
                            formatDateAndTime(item.EndDate, "month_and_year"),
                            item.Frequency, currencyConverter(item.Amount),
                            item.Status, item.InsertedBy]
                        )
                    });
                    setData(rows)
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });

        await axios
            .get(`${serverLink}staff/report/staff/list/status/1`, token)
            .then((result) => {
                const data = result.data;
                setStaffList(data)
                if (data.length > 0) {
                    // let _list = [];
                    // data.map(item => {
                    //     _list.push({ value: item.StaffID, label: item.StaffName, id: 'staff_id' })
                    // })

                    let rows = [];
                    data.length > 0 &&
                        data.map((row) => {
                            rows.push({ value: row.StaffID, label: row.StaffID + "--" + row.StaffName });
                        });
                    setStaffSelect(rows);
                }
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    };

    useEffect(() => {
        getRecord();
    }, []);

    const onEdit = (e) => {
        setCreateItem({
            ...createItem,
            [e.target.id]: e.target.value,
        });
    };
    const handleStaffEdit = (e) => {
        setCreateItem({
            ...createItem,
            staff_id: e?.value || "",
            staff: e
        })
    }

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
            toast.warning("adding, please wait...")
            await axios.post(`${serverLink}staff/hr/payroll/entry/add`, createItem, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Record Added Successfully");
                        document.getElementById("closeModal").click()
                        getRecord();
                        setCreateItem({
                            ...createItem,
                            staff_id: "",
                            post_type: "",
                            ledger_account: "",
                            start_date: "",
                            end_date: "",
                            frequency: "",
                            amount: "",
                            inserted_by: props.loginData[0].StaffID,
                            entry_id: "",
                        });
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else {
            toast.warning("updating, please wait...")
            await axios.patch(`${serverLink}staff/hr/payroll/entry/update`, createItem, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Record Updated Successfully");
                        document.getElementById("closeModal").click()
                        getRecord();
                        setCreateItem({
                            ...createItem,
                            staff_id: "",
                            post_type: "",
                            ledger_account: "",
                            start_date: "",
                            end_date: "",
                            frequency: "",
                            amount: "",
                            inserted_by: props.loginData[0].StaffID,
                            entry_id: "",
                        });
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
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

            <div className="card shadow-sm" style={{ width: '100%' }}>
                <div className="card-body p-0" style={{ width: '100%' }}>
                    <AGReportTable columns={columns} data={data} height="600px" />
                </div>
            </div>

            <Modal title={"Manage Allowance and Deduction Form"} large={true}>

                <div className="row mb-5">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="staff_id">Select Staff</label>
                            <SearchSelect
                                isDisabled={createItem.staff !== "" ? true : false}
                                id="staff"
                                value={createItem.staff}
                                onChange={handleStaffEdit}
                                options={staffSelect}
                                placeholder="select staff"
                            />
                            {/*<Select*/}
                            {/*    id={"staff_id"}*/}
                            {/*    options={staffSelect}*/}
                            {/*    onChange={handleSelectChange}*/}
                            {/*/>*/}
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
                            {/*<Select*/}
                            {/*    id={"ledger_account"}*/}
                            {/*    defaultValue={createItem.ledger_account}*/}
                            {/*    options={ledgerSelect}*/}
                            {/*    onChange={handleSelectChange}*/}
                            {/*/>*/}
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
                        <input type="month" id={"start_date"} disabled={createItem.frequency === ''} onChange={onEdit} value={createItem.start_date} className="form-control" />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="end_date">End Date</label>
                        <input type="month" id={"end_date"} disabled={createItem.frequency === '' || createItem.start_date === ''} min={createItem.start_date} max={createItem.frequency === 'Once' ? createItem.start_date : ''} onChange={onEdit} value={createItem.end_date} className="form-control" />
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
                        <input type="number" step={0.01} id={"amount"} onChange={onEdit} value={createItem.amount} className="form-control" />
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
