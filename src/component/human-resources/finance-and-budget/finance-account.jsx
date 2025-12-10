import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import {toast} from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import Modal from "../../common/modal/modal";
import {currencyConverter, formatDateAndTime} from "../../../resources/constants";

function FinanceAccount(props) {
    const token = props.LoginDetails[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Action", "Account Name", "Account Type", "Added By", "Added Date", "Updated By", "Updated Date"];
    const [dataTable, setDataTable] = useState([]);
    const formDataVariable = {entry_id:'', account_name:'', account_type:'', inserted_by:props.LoginDetails[0].StaffID}
    const [formData, setFormData] = useState(formDataVariable)

    const getData = async () => {
        await axios.get(`${serverLink}staff/finance/finance-and-budget/account`, token)
            .then((result) => {
                if (result.data.message === 'success') {
                    if (result.data.data.length > 0) {
                        let rows = [];
                        result.data.data.map((item, index) => {
                            rows.push([index + 1,
                                <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_general"
                                        onClick={()=>setFormData({
                                            ...formData,
                                            entry_id: item.EntryID, account_name: item.AccountName, account_type: item.AccountType
                                        })}
                                ><i className="fa fa-pen" /></button>,
                                item.AccountName, item.AccountType, item.InsertedBy, formatDateAndTime(item.InsertedDate, 'date'), item.UpdatedBy, formatDateAndTime(item.UpdatedDate, 'date')
                            ]);
                        });
                        setDataTable(rows)
                    }
                }
                setIsLoading(false);
            })
            .catch((err) => {
                toast.error("NETWORK ERROR")
            });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.account_name.trim() === '') {
            toast.error("Please enter the account name");
            return false;
        }
        if (formData.account_type.trim() === '') {
            toast.error("Please enter the account type");
            return false;
        }
        toast.info("Submitting...");
        const sendData = {
            ...formData,
            account_name: formData.account_name.trim(),
            account_type: formData.account_type.trim()
        }
        if (formData.entry_id === '') {
            await axios.post(`${serverLink}staff/finance/finance-and-budget/account`, sendData, token)
                .then(res => {
                    if (res.data.message === 'success') {
                        toast.success("Account Added Successfully");
                        document.getElementById("closeModal").click();
                        getData();
                    } else {
                        toast.error(res.data.message)
                    }
                })
                .catch((err) => {
                    toast.error("NETWORK ERROR")
                })
        } else {
            await axios.patch(`${serverLink}staff/finance/finance-and-budget/account`, sendData, token)
                .then(res => {
                    if (res.data.message === 'success') {
                        toast.success("Account Updated Successfully");
                        getData();
                        document.getElementById("closeModal").click();
                    } else {
                        toast.error(res.data.message)
                    }
                })
                .catch((err) => {
                    toast.error("NETWORK ERROR")
                })
        }
    }

    useEffect(() => {
        getData()
    }, []);

    return isLoading ? (
            <Loader />
        ) :
        (
            <>
                <Modal title={formData.entry_id === '' ? 'Add Account' : 'Update Account'}>
                    <form onSubmit={handleSubmit}>
                        <div className="col-md-12 mb-3">
                            <div className="form-group">
                                <label htmlFor="account_name">Account Name</label>
                                <input type="text" id="account_name" className="form-control" value={formData.account_name} onChange={(e)=>setFormData({...formData, [e.target.id]: e.target.value})}/>
                            </div>
                        </div>
                        <div className="col-md-12 mb-3">
                            <div className="form-group">
                                <label htmlFor="account_type">Account Type</label>
                                <select id="account_type" className="form-control" value={formData.account_type} onChange={(e)=>setFormData({...formData, [e.target.id]: e.target.value})}>
                                    <option value="">Select Account Type</option>
                                    <option value="Asset">Asset</option>
                                    <option value="Liability">Liability</option>
                                    <option value="Equity">Equity</option>
                                    <option value="Revenue">Revenue</option>
                                    <option value="Expense">Expense</option>
                                    <option value="Contra">Contra</option>
                                </select>
                            </div>
                        </div>

                        <button className="btn btn-primary w-100">Submit</button>
                    </form>
                </Modal>
                <div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width:'100%' }}>
                    <div className="">
                        <PageHeader
                            title={"ACCOUNT"}
                            items={["Human-Resources", "Finance & Budget", "Financial Accounts"]}
                            buttons={
                                <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_general"  onClick={()=>setFormData(formDataVariable)}>
                                    <i className="fa fa-plus me-2"></i>
                                    Add Account
                                </button>
                            }
                        />
                        <div className="row col-md-12" style={{width:'100%'}}>
                            <ReportTable
                                title={`Financial Accounts`}
                                columns={columns}
                                data={dataTable}
                                height={"600px"}
                            />
                        </div>
                    </div>

                </div>
            </>
        )
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
    };
};
export default connect(mapStateToProps, null)(FinanceAccount);
