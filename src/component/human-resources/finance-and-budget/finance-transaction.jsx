import React, { useEffect, useState } from "react";
import { api } from "../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { currencyConverter, formatDate, formatDateAndTime } from "../../../resources/constants";
import Modal from "../../common/modal/modal";
import ReportTable from "../../common/table/ReportTable";
import swal from "sweetalert";
import SearchSelect from "../../common/select/SearchSelect";

function FinanceTransaction(props) {
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Action", "Transaction Date", "Year", "Description", "Debit Account", "Credit Account", "Amount", "Added By", "Added Date"];
    const [dataTable, setDataTable] = useState([]);
    const formDataVariable = { entry_id: '', transaction_date: '', description: '', debit_account_id: '', credit_account_id: '', debit: 0.0, credit: 0.0, year: '', amount: '', inserted_by: props.LoginDetails[0].StaffID }
    const [formData, setFormData] = useState(formDataVariable);
    const [yearList, setYearList] = useState([]);
    const [accountList, setAccountList] = useState([]);
    const [accountOptions, setAccountOptions] = useState([])

    const getAccountName = (account_list, account_id) => {
        const list = account_list.filter(r => r.EntryID === account_id);
        return list.length > 0 ? list[0].AccountName : 'No Account'
    }

    const getAccountYear = (year_list, year_id) => {
        const list = year_list.filter(r => r.EntryID === year_id);
        return list.length > 0 ? `${formatDateAndTime(list[0].StartDate, 'date')} to ${formatDateAndTime(list[0].EndDate, 'date')}` : 'No Date'
    }

    const getActiveAccountYear = (year_list) => {
        const years = year_list.filter(e => e.IsActive === 1);
        return years.length > 0 ? years[0].EntryID : 0;
    }

    const getData = async () => {
        const { success, data: result } = await api.get("staff/finance/finance-and-budget/transaction-data");
        if (success && result.message === 'success') {
            const year_list = result.year;
            setYearList(year_list)
            const account_list = result.account;
            setAccountList(account_list)
            let account_list_array = [];
            if (account_list.length > 0) {
                account_list.map(r => {
                    account_list_array.push({ value: r.EntryID, label: `${r.AccountName} (${r.AccountType})` })
                })
            }
            setAccountOptions(account_list_array)
            if (result.data.length > 0) {
                let rows = [];
                result.data.map((item, index) => {
                    rows.push([
                        index + 1,
                        <div className="btn-group">
                            <button className="btn btn-danger btn-sm"
                                onClick={() => {
                                    swal({
                                        title: "Are you sure?",
                                        text: "Once deleted, you will not be able to recover the transaction!",
                                        icon: "warning",
                                        buttons: true,
                                        dangerMode: true,
                                    }).then((willDelete) => {
                                        if (willDelete) {
                                            handleDelete(item.EntryID);
                                        }
                                    });
                                }}
                            ><i className="fa fa-trash" /></button>
                        </div>,
                        formatDateAndTime(item.TransactionDate, 'date'), getAccountYear(year_list, item.YearID), item.Description, getAccountName(account_list, item.DebitAccountID), getAccountName(account_list, item.CreditAccountID),
                        currencyConverter(item.Amount), item.InsertedBy, formatDateAndTime(item.InsertedDate, 'date')
                    ]);
                });
                setDataTable(rows)
            }
        }
        setIsLoading(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.transaction_date === '') { toast.error("Please select the transaction date"); return false; }
        if (formData.amount === '') { toast.error("Please enter the transaction amount"); return false; }
        if (formData.description === '') { toast.error("Please enter the description"); return false; }
        if (formData.debit_account_id === '') { toast.error("Please select the debit account"); return false; }
        if (formData.credit_account_id === '') { toast.error("Please select the credit account"); return false; }
        if (formData.year === '') { toast.error("Please select the financial year"); return false; }
        if (formData.debit_account_id === formData.credit_account_id) { toast.error("Debit and Credit Account Cannot be the same"); return false; }

        const sendData = {
            ...formData,
            debit_account_id: formData.debit_account_id.value,
            credit_account_id: formData.credit_account_id.value,
            debit: -parseFloat(formData.amount),
            credit: parseFloat(formData.amount)
        }
        toast.info("Submitting...");

        if (formData.entry_id === '') {
            const { success, data } = await api.post("staff/finance/finance-and-budget/transaction", sendData);
            if (success) {
                if (data.message === 'success') {
                    toast.success("Transaction Added Successfully");
                    document.getElementById("closeModal").click();
                    getData();
                } else {
                    toast.error(data.message)
                }
            }
        } else {
            const { success, data } = await api.patch("staff/finance/finance-and-budget/transaction", sendData);
            if (success) {
                if (data.message === 'success') {
                    toast.success("Transaction Updated Successfully");
                    getData();
                    document.getElementById("closeModal").click();
                } else {
                    toast.error(data.message)
                }
            }
        }
    }

    const handleDelete = async (item) => {
        toast.info("Deleting...")
        const { success, data } = await api.delete(`staff/finance/finance-and-budget/transaction/${item}/${formData.inserted_by}`);
        if (success) {
            if (data.message === 'success') {
                toast.success("Transaction Deleted Successfully");
                getData();
            } else {
                toast.error(data.message)
            }
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
                <Modal large title={formData.entry_id === '' ? 'Add Journal Transaction' : 'Update Journal Transaction'}>
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <div className="form-group">
                                    <label htmlFor="transaction_date">Transaction Date</label>
                                    <input type="date" id="transaction_date" className="form-control" value={formData.transaction_date} onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })} />
                                </div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <div className="form-group">
                                    <label htmlFor="amount">Transaction Amount</label>
                                    <input type="number" id="amount" step={0.01} className="form-control" value={formData.amount} onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })} />
                                </div>
                            </div>
                            <div className="col-md-12 mb-3">
                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <input type="text" id="description" className="form-control" value={formData.description} onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <div className="form-group">
                                    <label htmlFor="debit_account_id">Select Debit Account</label>
                                    <SearchSelect
                                        value={formData.debit_account_id}
                                        onChange={(e) => setFormData({ ...formData, debit_account_id: e })}
                                        options={accountOptions}
                                        placeholder="Select Debit Account"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <div className="form-group">
                                    <label htmlFor="credit_account_id">Select Credit Account</label>
                                    <SearchSelect
                                        value={formData.credit_account_id}
                                        onChange={(e) => setFormData({ ...formData, credit_account_id: e })}
                                        options={accountOptions}
                                        placeholder="Select Credit Account"
                                    />
                                </div>
                            </div>
                        </div>


                        <button className="btn btn-primary w-100">Submit</button>
                    </form>
                </Modal>
                <div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width: '100%' }}>
                    <div className="">
                        <PageHeader
                            title={"JOURNAL TRANSACTION"}
                            items={["Human-Resources", "Finance & Budget", "Journal Transaction"]}
                            buttons={
                                <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setFormData({ ...formDataVariable, year: getActiveAccountYear(yearList) })}>
                                    <i className="fa fa-plus me-2"></i>
                                    Add Transaction
                                </button>
                            }
                        />
                        <div className="row col-md-12" style={{ width: '100%' }}>
                            <ReportTable
                                title={`Journal Transactions`}
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
export default connect(mapStateToProps, null)(FinanceTransaction);
