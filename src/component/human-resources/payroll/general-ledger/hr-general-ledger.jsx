import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import AGReportTable from "../../../common/table/AGReportTable";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { formatDateAndTime } from "../../../../resources/constants";

function HRGeneralLedger(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Action", "Account Number", "Description", "Account Type", "Balance/Income", "Updated By", "Date"];
    const [data, setData] = useState([]);

    const [createItem, setCreateItem] = useState({
        account_number: "",
        description: "",
        account_type: "",
        balance_or_income: "",
        inserted_by: props.loginData[0].StaffID,
        entry_id: "",
    });

    const resetForm = () => {
        setCreateItem({
            ...createItem,
            account_number: "",
            description: "",
            account_type: "",
            balance_or_income: "",
            entry_id: "",
        });
    };

    const getRecord = async () => {
        await axios
            .get(`${serverLink}staff/hr/payroll/ledger/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((item, index) => {
                        rows.push([
                            index + 1,
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
                            </button>,
                            item.AccountNumber,
                            item.Description,
                            item.AccountType,
                            item.BalanceOrIncome,
                            item.StaffName,
                            formatDateAndTime(item.InsertedDate, 'date')
                        ]);
                    });
                    setData(rows);
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
                        document.getElementById("closeModal").click();
                        getRecord();
                        resetForm();
                    } else if (result.data.message === "exist") {
                        showAlert("LEDGER EXIST", "Ledger already exist!", "error");
                    } else {
                        showAlert("ERROR", "Something went wrong. Please try again!", "error");
                    }
                })
                .catch((error) => {
                    console.log(error);
                    showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
                });
        } else {
            await axios
                .patch(`${serverLink}staff/hr/payroll/ledger/update`, createItem, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Ledger Updated Successfully");
                        document.getElementById("closeModal").click();
                        getRecord();
                        resetForm();
                    } else {
                        showAlert("ERROR", "Something went wrong. Please try again!", "error");
                    }
                })
                .catch((error) => {
                    showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
                });
        }
    };

    useEffect(() => {
        getRecord();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div style={{ width: '100%' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1">General Ledger</h3>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><a href="/">Home</a></li>
                            <li className="breadcrumb-item">Human Resources</li>
                            <li className="breadcrumb-item">Payroll</li>
                            <li className="breadcrumb-item active">General Ledger</li>
                        </ol>
                    </nav>
                </div>
                <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#kt_modal_general"
                    onClick={resetForm}
                >
                    <i className="fa fa-plus me-2"></i>Add Ledger
                </button>
            </div>

            <div className="card shadow-sm" style={{ width: '100%' }}>
                <div className="card-body p-0" style={{ width: '100%' }}>
                    <AGReportTable columns={columns} data={data} height="600px" />
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
                    <label htmlFor="balance_or_income">Balance/Income</label>
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
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(HRGeneralLedger);
