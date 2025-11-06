import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import {toast} from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import {currencyConverter, formatDate, formatDateAndTime, sumObjectArray} from "../../../resources/constants";
import Modal from "../../common/modal/modal";
import ReportTable from "../../common/table/report_table";
import swal from "sweetalert";
import Select from "react-select";

function FinanceMyBudget(props) {
    const token = props.LoginDetails[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Year", "Amount", "Allocated Amount", "Balance Amount", "Status", "Added Date", "Decision By", "Decision Date", "Action"];
    const [dataTable, setDataTable] = useState([]);
    const [yearList, setYearList] = useState([]);
    const [accountList, setAccountList] = useState([]);
    const [budgetTrackerList, setBudgetTrackerList] = useState([]);
    const [budgetItems, setBudgetItems] = useState([]);
    const formInitialize = {entry_id:'', department_code: props.LoginDetails[0].DepartmentCode, year_id:'', amount:0, allocated_amount:0, balance_amount:0, status:'submitted', inserted_by: props.LoginDetails[0].StaffID}
    const [selectedBudget, setSelectedBudget] = useState(formInitialize);
    const selectedItemInitialize = {entry_id:'', budget_id:'', item_name:'', item_description:'', quantity:'',amount:'',total:'',inserted_by: props.LoginDetails[0].StaffID}
    const [selectedItem, setSelectedItem] = useState([]);
    //For budget item list that people select to add a new budget
    const [budgetSelectValue, setBudgetSelectValue] = useState({entry_id: '', item_name:'', account_id:''});

    const getBudgetYear = (year_list, year_id) => {
        const list = year_list.filter(r=>r.EntryID === year_id);
        return list.length > 0 ? `${formatDateAndTime(list[0].StartDate, 'date')} to ${formatDateAndTime(list[0].EndDate, 'date')}` : 'No Date'
    }

    const getActiveAccountYear = () => {
        const years = yearList.filter(e=>e.IsActive === 1);
        return years.length > 0 ? years[0].EntryID : 0;
    }

    const getAccountName = (account_id) => {
        const account = accountList.filter(e=>e.EntryID === account_id);
        return account.length > 0 ? `${account[0].AccountName} (${account[0].AccountType})` : 0;
    }

    const getData = async () => {
        await axios.get(`${serverLink}staff/finance/finance-and-budget/my-budget-data/${props.LoginDetails[0].StaffID}`, token)
            .then((result) => {
                if (result.data.message === 'success') {
                    const year_list = result.data.year;
                    const budget_list = result.data.data;
                    const tracker_list = result.data.tracker
                    const budget_items = result.data.item;
                    const budget_item_list = result.data.budget_item_list;
                    const account_list = result.data.account_list
                    setYearList(year_list)
                    setBudgetTrackerList(tracker_list);
                    setBudgetItems(budget_item_list);
                    setAccountList(account_list)

                    if (budget_list.length > 0) {
                        let rows = [];
                        budget_list.map((item, index) => {
                            rows.push([
                                index+1, getBudgetYear(year_list, item.YearID), currencyConverter(item.Amount), currencyConverter(item.AllocatedAmount), currencyConverter(item.BalanceAmount), item.Status, formatDateAndTime(item.InsertedDate, 'date'), item.DecisionBy, formatDateAndTime(item.DecisionDate, 'date'),
                                <div className="btn-group">
                                    <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_general"
                                            onClick={()=>handleOnEdit(item, budget_items)}
                                    ><i className="fa fa-pen" /></button>
                                    {
                                        item.Status === 'submitted' &&
                                        <button className="btn btn-danger btn-sm"
                                                onClick={()=>{
                                                    swal({title: "Are you sure?", text: "Once deleted, you will not be able to recover the budget!", icon: "warning", buttons: true, dangerMode: true,
                                                    }).then((willDelete) => {
                                                        if (willDelete) {
                                                            handleBudgetDelete(item.EntryID);
                                                        }
                                                    });
                                                }}
                                        ><i className="fa fa-trash" /></button>
                                    }

                                </div>
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
        let error_checker = 0;
        if (selectedItem.length === 0) {toast.error("Enter the budget item(s)");error_checker=1;}
        selectedItem.map((r,i) => {
            if (r.item_name === '') {toast.error(`Please enter item ${i+1} name`); error_checker=1;}
            if (r.description === '') {toast.error(`Please enter item ${i+1} description`);error_checker=1;}
            if (r.amount === '') {toast.error(`Please enter item ${i+1} amount`);error_checker=1;}
            if (r.quantity === '') {toast.error(`Please enter item ${i+1} quantity`);error_checker=1;}
        });

        if (error_checker === 1) return false

        const sendData = {
            ...selectedBudget,
            amount: selectedItem.map(item => item.total).reduce((prev, next) => prev + next),
            items: selectedItem,
            year_id: getActiveAccountYear()
        }
        toast.info("Submitting...");

        if (selectedBudget.entry_id === '') {
            await axios.post(`${serverLink}staff/finance/finance-and-budget/budget`, sendData, token)
                .then(res => {
                    if (res.data.message === 'success') {
                        toast.success("Budget Added Successfully");
                        setSelectedBudget(formInitialize);
                        setSelectedItem([]);
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
            await axios.patch(`${serverLink}staff/finance/finance-and-budget/budget`, sendData, token)
                .then(res => {
                    if (res.data.message === 'success') {
                        toast.success("Budget Updated Successfully");
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

    const handleSubmitBudgetItem = async (e) => {
        e.preventDefault();
        if (budgetSelectValue.item_name.trim() === '') {toast.error("Enter the item name");return false;}
        if (budgetSelectValue.account_id === '') {toast.error("Please select account");return false;}
        toast.info("Submitting...");

        if (budgetSelectValue.entry_id === '') {
            await axios.post(`${serverLink}staff/finance/finance-and-budget/budget-item`, budgetSelectValue, token)
                .then(res => {
                    if (res.data.message === 'success') {
                        toast.success("Budget Item Added Successfully");
                        setBudgetSelectValue({entry_id: '', item_name:'', account_id: ''});
                        getData();
                    } else {
                        toast.error(res.data.message)
                    }
                })
                .catch((err) => {
                    toast.error("NETWORK ERROR")
                })
        } else {
            await axios.patch(`${serverLink}staff/finance/finance-and-budget/budget-item`, budgetSelectValue, token)
                .then(res => {
                    if (res.data.message === 'success') {
                        toast.success("Budget Item Updated Successfully");
                        setBudgetSelectValue({entry_id: '', item_name:'', account_id: ''});
                        getData();
                    } else {
                        toast.error(res.data.message)
                    }
                })
                .catch((err) => {
                    toast.error("NETWORK ERROR")
                })
        }
    }

    const handleOnEdit = (item, bug_items) => {
        setSelectedBudget({entry_id:item.EntryID, department_code: item.DepartmentCode, year_id:item.YearID, amount:item.Amount, allocated_amount:item.AllocatedAmount, balance_amount:item.BalanceAmount, status:'submitted', inserted_by: item.InsertedBy});
        const budget_items = bug_items.filter(r=>r.BudgetID === item.EntryID);
        if (budget_items.length > 0) {
            const items = [];
            budget_items.map(r => {
                items.push({entry_id:r.EntryID, budget_id:r.BudgetID, item_name:r.ItemName, item_description:r.ItemDescription, quantity:r.Quantity,amount:r.Amount,total:r.Total,inserted_by: props.LoginDetails[0].StaffID})
            })
            setSelectedItem(items)
        }
    }

    //BUDGET DELETION
    const handleDelete = async (item, index) => {
        const filter_selected_item = selectedItem[index];
        let items = [];
        selectedItem.map((r,i) => {
            if (i!==index) {
                items.push(r)
            }
        })
        setSelectedItem(items);
        if (filter_selected_item.entry_id !== '') {
            toast.info("Deleting...")
            await axios.delete(`${serverLink}staff/finance/finance-and-budget/budget-item/${item.entry_id}/${item.total}`, token)
                .then(res => {
                    if (res.data.message === 'success') {
                        toast.success("Budget Item Deleted Successfully");
                        getData();
                    } else {
                        toast.error(res.data.message)
                    }
                })
                .catch((err) => {
                    toast.error("NETWORK ERROR")
                })
        }
    }

    //ITEM DELETE
    const handleBudgetDelete = async (item) => {
        toast.info("Deleting...")
        await axios.delete(`${serverLink}staff/finance/finance-and-budget/budget/${item}`, token)
            .then(res => {
                if (res.data.message === 'success') {
                    toast.success("Budget Deleted Successfully");
                    getData();
                } else {
                    toast.error(res.data.message)
                }
            })
            .catch((err) => {
                toast.error("NETWORK ERROR")
            })
    }

    const onAddBudgetItem = () => {
        setSelectedItem([...selectedItem,selectedItemInitialize])
    }
    const handleItemChange = (e) => {
        const id = e.target.id;
        const value = e.target.value;
        const index = id.split("-")[2];

        const item_record = selectedItem;
        item_record.map((r,i) => {
            if (i === parseInt(index)) {
                if (id.includes("item-name")) {
                    r.item_name = value;
                } else if (id.includes("item-description")) {
                    r.item_description = value;
                } else if (id.includes("item-amount")) {
                    r.amount = value;
                } else {
                    r.quantity = value;
                }
                r.total = r.quantity*r.amount
            }
        });
        setSelectedItem([...item_record])

    }

    useEffect(() => {
        getData();
    }, []);

    return isLoading ? (
            <Loader />
        ) :
        (
            <>
                <Modal large title={selectedBudget.entry_id === '' ? `Add New Budget: ${getBudgetYear(yearList, getActiveAccountYear())}` : `Update Budget: ${getBudgetYear(yearList, selectedBudget.year_id)}`}>
                    <div className="row">
                        <h3 className="mb-3">Budget Items</h3>
                        {
                            selectedItem.length > 0 && selectedItem.map((r,i) => {
                                return (
                                    <div key={i} className="row mb-3">
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor={`item-name-${i}`}>Item {i+1} Name</label>
                                                <select id={`item-name-${i}`} className="form-control" value={r.item_name} onChange={handleItemChange}>
                                                    <option value="">Select Option</option>
                                                    {
                                                        budgetItems.length > 0 &&
                                                        budgetItems.map((r,i) => {
                                                            return <option key={i} value={r.ItemName}>{r.ItemName}</option>
                                                        })
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor={`item-description-${i}`}>Item {i+1} Description</label>
                                                <input type="text" className="form-control" id={`item-description-${i}`} value={r.item_description} onChange={handleItemChange}/>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label htmlFor={`item-amount-${i}`}>Item {i+1} Unit Price</label>
                                                <input type="number" className="form-control" id={`item-amount-${i}`} value={r.amount} onChange={handleItemChange}/>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label htmlFor={`item-quantity-${i}`}>Item {i+1} Quantity</label>
                                                <input type="number" className="form-control" id={`item-quantity-${i}`} value={r.quantity} onChange={handleItemChange}/>
                                            </div>
                                        </div>
                                        {
                                            (selectedBudget.status === 'submitted' || selectedBudget.status === 'reviewed') &&
                                                <div className="col-md-1">
                                                    <button className="btn btn-danger btn-sm mt-8" onClick={()=>handleDelete(r, i)}><i className="fa fa-trash" /></button>
                                                </div>
                                        }
                                    </div>
                                )
                            })
                        }

                    </div>
                    {
                        (selectedBudget.status === 'submitted' || selectedBudget.status === 'reviewed') &&
                        <>
                            <button className="btn btn-primary w-75" onClick={handleSubmit} disabled={selectedItem.length===0}>Submit</button>
                            <button type="button" className="btn btn-info w-25" onClick={onAddBudgetItem}>Add Item</button>
                        </>
                    }

                    {
                        selectedItem.length > 0 &&
                            <div className="col-md-12 table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>S/N</th>
                                            <th>Item Name</th>
                                            <th>Item Description</th>
                                            <th>Unit Price</th>
                                            <th>Qty</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        selectedItem.map((r,i) => {
                                            return (
                                                <tr key={i}>
                                                    <td>{i+1}</td>
                                                    <td>{r.item_name}</td>
                                                    <td>{r.item_description}</td>
                                                    <td>{currencyConverter(r.amount)}</td>
                                                    <td>{r.quantity}</td>
                                                    <td>{currencyConverter(r.quantity*r.amount)}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th></th>
                                            <th></th>
                                            <th></th>
                                            <th></th>
                                            <th>TOTAL</th>
                                            <th>{currencyConverter(selectedItem.map(item => item.amount*item.quantity).reduce((prev, next) => prev + next))}</th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                    }

                    {
                        budgetTrackerList.filter(e=>e.BudgetID === selectedBudget.entry_id).length > 0 &&
                        <div className="col-md-12 mt-5 table-responsive">
                            <h2>BUDGET TRACKER</h2>
                            <table className="table table-striped">
                                <thead>
                                <tr>
                                    <th>S/N</th>
                                    <th>Action</th>
                                    <th>Amount</th>
                                    <th>Inserted By</th>
                                    <th>Received By</th>
                                    <th>InsertedDate</th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    budgetTrackerList.filter(e=>e.BudgetID === selectedBudget.entry_id).map((r,i) => {
                                        return (
                                            <tr key={i}>
                                                <td>{i+1}</td>
                                                <td>{r.Action}</td>
                                                <td>{currencyConverter(r.Amount)}</td>
                                                <td>{r.InsertedBy}</td>
                                                <td>{r.ReceivedBy}</td>
                                                <td>{formatDateAndTime(r.InsertedDate, 'date_and_time')}</td>
                                            </tr>
                                        )
                                    })
                                }
                                </tbody>
                            </table>
                        </div>
                    }
                </Modal>
                
                <Modal id="kt_modal_general_item" large title={'Budget Items'}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <div className="form-group">
                                <label htmlFor="year_id">{budgetSelectValue.entry_id === '' ? 'Add' : 'Update'} Budget Item</label>
                                <input type="text" className="form-control" value={budgetSelectValue.item_name} onChange={(e) => {setBudgetSelectValue({...budgetSelectValue, item_name: e.target.value})}}/>
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <div className="form-group">
                                <label htmlFor="account_type">Select Account Type</label>
                                <select id="account_type" className="form-control" value={budgetSelectValue.account_id} onChange={(e) => {setBudgetSelectValue({...budgetSelectValue, account_id: e.target.value})}}>
                                    <option value="">Select Option</option>
                                    {
                                        accountList.length > 0 &&
                                        accountList.map((r,i) => {
                                            return <option key={i} value={r.EntryID}>{`${r.AccountName} (${r.AccountType})`}</option>
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-primary w-100" onClick={handleSubmitBudgetItem}>Submit</button>

                    {
                        budgetItems.length > 0 &&
                            <div className="col-md-12 mt-5 table-responsive">
                                <h2>Budget Items</h2>
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>S/N</th>
                                            <th>Item Name</th>
                                            <th>Account</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        budgetItems.map((r,i) => {
                                            return (
                                                <tr key={i}>
                                                    <td>{i+1}</td>
                                                    <td>{r.ItemName}</td>
                                                    <td>{getAccountName(r.AccountID)}</td>
                                                    <td>
                                                        {
                                                            parseInt(props.LoginDetails[0].IsAdmin) === 1 ?
                                                                <button className="btn btn-info btn-sm" onClick={()=>{setBudgetSelectValue({...budgetSelectValue, entry_id: r.EntryID, item_name: r.ItemName, account_id: r.AccountID})}}><i className="fa fa-pen" /></button>
                                                                : '--'
                                                        }
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </table>
                            </div>
                    }
                </Modal>

                <div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width:'100%' }}>
                    <div className="">
                        <PageHeader
                            title={"MY BUDGET"}
                            items={["Human-Resources", "Finance & Budget", "My Budget"]}
                        />
                        <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_general"  onClick={()=>{ setSelectedBudget({...formInitialize, year_id: getActiveAccountYear()}); setSelectedItem([]) }}>Add New Budget <i className="fa fa-plus" /></button>

                        <button className="btn btn-info btn-sm pull-right" data-bs-toggle="modal" data-bs-target="#kt_modal_general_item"  onClick={()=>{ setBudgetSelectValue({entry_id: '', item_name: ''}) }}>Add Budget Item <i className="fa fa-plus" /></button>
                        <div className="row col-md-12" style={{width:'100%'}}>
                            <ReportTable
                                title={`My Budget List`}
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
export default connect(mapStateToProps, null)(FinanceMyBudget);
