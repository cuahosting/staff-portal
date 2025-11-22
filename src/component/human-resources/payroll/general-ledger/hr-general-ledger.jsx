import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import Table from "../../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import {connect} from "react-redux";
import {formatDateAndTime} from "../../../../resources/constants";

function HRGeneralLedger(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Account Number",
                field: "account_number",
            },
            {
                label: "Description",
                field: "description",
            },
            {
                label: "Account Type",
                field: "account_type",
            },
            {
                label: "Balance/Income",
                field: "balance_or_income",
            },
            {
                label: "Updated By",
                field: "inserted_by",
            },
            {
                label: "Date",
                field: "inserted_date",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });

    const [createItem, setCreateItem] = useState({
        account_number: "",
        description: "",
        account_type: "",
        balance_or_income: "",
        inserted_by: props.loginData[0].StaffID,
        entry_id: "",
    });

    const getRecord = async () => {
        await axios
            .get(`${serverLink}staff/hr/payroll/ledger/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((item, index) => {
                        rows.push({
                            sn: index + 1,
                            account_number: item.AccountNumber,
                            description: item.Description,
                            account_type: item.AccountType,
                            balance_or_income: item.BalanceOrIncome,
                            inserted_by: item.StaffName,
                            inserted_date: formatDateAndTime(item.InsertedDate, 'date'),
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                        setCreateItem({
                                            account_number: item.AccountNumber,
                                            description: item.Description,
                                            account_type: item.AccountType,
                                            balance_or_income: item.BalanceOrIncome,
                                            entry_id: item.EntryID,
                                        })
                                    }
                                >
                                    <i className="fa fa-pen" />
                                </button>
                            ),
                        });
                    });

                    setDatatable({
                        ...datatable,
                        columns: datatable.columns,
                        rows: rows,
                    });
                }

                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    };

    const onEdit = (e) => {
        setCreateItem({
            ...createItem,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmit = async () => {
        if (createItem.account_number.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the ledger account number", "error");
            return false;
        }
        if (createItem.description.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the ledger description", "error");
            return false;
        }
        if (createItem.account_type.trim() === "") {
            showAlert("EMPTY FIELD", "Please select the account type", "error");
            return false;
        }
        if (createItem.balance_or_income.trim() === "") {
            showAlert("EMPTY FIELD", "Please select the balance/income", "error");
            return false;
        }

        if (createItem.entry_id === "") {
            await axios
                .post(`${serverLink}staff/hr/payroll/ledger/add`, createItem, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Ledger Added Successfully");
                        document.getElementById("closeModal").click()
                        getRecord();
                        setCreateItem({
                            ...createItem,
                            account_number: "",
                            description: "",
                            account_type: "",
                            balance_or_income: "",
                            entry_id: "",
                        });
                    } else if (result.data.message === "exist") {
                        showAlert("LEDGER EXIST", "Ledger already exist!", "error");
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    console.log(error)
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        } else {
            await axios
                .patch(`${serverLink}staff/hr/payroll/ledger/update`, createItem, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Ledger Updated Successfully");
                        document.getElementById("closeModal").click()
                        getRecord();
                        setCreateItem({
                            ...createItem,
                            account_number: "",
                            description: "",
                            account_type: "",
                            balance_or_income: "",
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

    useEffect(() => {
        getRecord().then(r => {});
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"General Ledger"}
                items={["Human Resources", "Payroll", "General Ledger"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                        <div className="card-toolbar">
                            <div
                                className="d-flex justify-content-end"
                                data-kt-customer-table-toolbar="base"
                            >
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                        setCreateItem({
                                            ...createItem,
                                            account_number: "",
                                            description: "",
                                            account_type: "",
                                            balance_or_income: "",
                                            entry_id: "",
                                        })
                                    }
                                >
                                    Add a Ledger
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <Table data={datatable} />
                    </div>
                </div>
                <Modal title={"General Ledger"}>
                    <div className="form-group">
                        <label htmlFor="account_number">Account Number</label>
                        <input
                            type="number"
                            id={"account_number"}
                            onChange={onEdit}
                            value={createItem.account_number}
                            className={"form-control"}
                            placeholder={"Enter the Account Number"}
                        />
                    </div>
                    <div className="form-group pt-2">
                        <label htmlFor="description">Ledger Description</label>
                        <input
                            type="text"
                            id={"description"}
                            onChange={onEdit}
                            value={createItem.description}
                            className={"form-control"}
                            placeholder={"Enter the Ledger Description"}
                        />
                    </div>
                    <div className="form-group pt-2">
                        <label htmlFor="account_type">Account Type</label>
                        <select id="account_type" className="form-select" onChange={onEdit} value={createItem.account_type}>
                            <option value="">Select Account Type</option>
                            <option value="Heading">Heading</option>
                            <option value="Posting">Posting</option>
                        </select>
                    </div>

                    <div className="form-group pt-2">
                        <label htmlFor="account_type">Balance/Income</label>
                        <select id="balance_or_income" className="form-select" onChange={onEdit} value={createItem.balance_or_income}>
                            <option value="">Select Account Type</option>
                            <option value="Balance Sheet">Balance Sheet</option>
                            <option value="Income Statement">Income Statement</option>
                        </select>
                    </div>

                    <div className="form-group pt-2">
                        <button onClick={onSubmit} className="btn btn-primary w-100">
                            Submit
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(HRGeneralLedger);
