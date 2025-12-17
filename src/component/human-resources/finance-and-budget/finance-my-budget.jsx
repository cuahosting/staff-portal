import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { currencyConverter, formatDate, formatDateAndTime, sumObjectArray } from "../../../resources/constants";
import Modal from "../../common/modal/modal";
import AGTable from "../../common/table/AGTable";
import swal from "sweetalert";
import SearchSelect from "../../common/select/SearchSelect";

function FinanceMyBudget(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [budgetDatatable, setBudgetDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Year", field: "year" },
            { label: "Amount", field: "amount" },
            { label: "Allocated Amount", field: "allocatedAmount" },
            { label: "Balance Amount", field: "balanceAmount" },
            { label: "Status", field: "status" },
            { label: "Added Date", field: "addedDate" },
            { label: "Decision By", field: "decisionBy" },
            { label: "Decision Date", field: "decisionDate" },
            { label: "Action", field: "action" }
        ],
        rows: [],
    });
    const [yearList, setYearList] = useState([]);
    const [accountList, setAccountList] = useState([]);
    const [budgetTrackerList, setBudgetTrackerList] = useState([]);
    const [budgetItems, setBudgetItems] = useState([]);
    const formInitialize = { entry_id: '', department_code: props.LoginDetails[0].DepartmentCode, year_id: '', amount: 0, allocated_amount: 0, balance_amount: 0, status: 'submitted', inserted_by: props.LoginDetails[0].StaffID }
    const [selectedBudget, setSelectedBudget] = useState(formInitialize);
    const selectedItemInitialize = { entry_id: '', budget_id: '', item_name: '', item_description: '', quantity: '', amount: '', total: '', inserted_by: props.LoginDetails[0].StaffID }
    const [selectedItem, setSelectedItem] = useState([]);
    //For budget item list that people select to add a new budget
    const [budgetSelectValue, setBudgetSelectValue] = useState({ entry_id: '', item_name: '', account_id: '' });

    const getBudgetYear = (year_list, year_id) => {
        const list = year_list.filter(r => r.EntryID === year_id);
        return list.length > 0 ? `${formatDateAndTime(list[0].StartDate, 'date')} to ${formatDateAndTime(list[0].EndDate, 'date')}` : 'No Date'
    }

    const getActiveAccountYear = () => {
        const years = yearList.filter(e => e.IsActive === 1);
        return years.length > 0 ? years[0].EntryID : 0;
    }

    const getAccountName = (account_id) => {
        const account = accountList.filter(e => e.EntryID === account_id);
        return account.length > 0 ? `${account[0].AccountName} (${account[0].AccountType})` : 0;
    }

    const getData = async () => {
        const { success, data: result } = await api.get(`staff/finance/finance-and-budget/my-budget-data/${props.LoginDetails[0].StaffID}`);
        if (success && result.message === 'success') {
            const year_list = result.year;
            const budget_list = result.data;
            const tracker_list = result.tracker
            const budget_items = result.item;
            const budget_item_list = result.budget_item_list;
            const account_list = result.account_list
            setYearList(year_list)
            setBudgetTrackerList(tracker_list);
            setBudgetItems(budget_item_list);
            setAccountList(account_list)

            if (budget_list.length > 0) {
                let rows = [];
                budget_list.map((item, index) => {
                    rows.push({
                        sn: index + 1,
                        year: getBudgetYear(year_list, item.YearID),
                        amount: currencyConverter(item.Amount),
                        allocatedAmount: currencyConverter(item.AllocatedAmount),
                        balanceAmount: currencyConverter(item.BalanceAmount),
                        status: item.Status,
                        addedDate: formatDateAndTime(item.InsertedDate, 'date'),
                        decisionBy: item.DecisionBy,
                        decisionDate: formatDateAndTime(item.DecisionDate, 'date'),
                        action: (
                            <>
                                <button className="btn btn-primary btn-sm" style={{ marginRight: 15 }} data-bs-toggle="modal" data-bs-target="#kt_modal_general"
                                    onClick={() => handleOnEdit(item, budget_items)}
                                ><i className="fa fa-pen" /></button>
                                {
                                    item.Status === 'submitted' &&
                                    <button className="btn btn-danger btn-sm"
                                        onClick={() => {
                                            swal({
                                                title: "Are you sure?", text: "Once deleted, you will not be able to recover the budget!", icon: "warning", buttons: true, dangerMode: true,
                                            }).then((willDelete) => {
                                                if (willDelete) {
                                                    handleBudgetDelete(item.EntryID);
                                                }
                                            });
                                        }}
                                    ><i className="fa fa-trash" /></button>
                                }
                            </>
                        )
                    });
                });
                setBudgetDatatable({
                    ...budgetDatatable,
                    rows: rows,
                });
            }
        }
        setIsLoading(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        let error_checker = 0;
        if (selectedItem.length === 0) { toast.error("Enter the budget item(s)"); error_checker = 1; }
        selectedItem.map((r, i) => {
            if (r.item_name === '') { toast.error(`Please enter item ${i + 1} name`); error_checker = 1; }
            if (r.description === '') { toast.error(`Please enter item ${i + 1} description`); error_checker = 1; }
            if (r.amount === '') { toast.error(`Please enter item ${i + 1} amount`); error_checker = 1; }
            if (r.quantity === '') { toast.error(`Please enter item ${i + 1} quantity`); error_checker = 1; }
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
            const { success, data } = await api.post("staff/finance/finance-and-budget/budget", sendData);
            if (success) {
                if (data.message === 'success') {
                    toast.success("Budget Added Successfully");
                    setSelectedBudget(formInitialize);
                    setSelectedItem([]);
                    document.getElementById("closeModal").click();
                    getData();
                } else {
                    toast.error(data.message)
                }
            }
        } else {
            const { success, data } = await api.patch("staff/finance/finance-and-budget/budget", sendData);
            if (success) {
                if (data.message === 'success') {
                    toast.success("Budget Updated Successfully");
                    getData();
                    document.getElementById("closeModal").click();
                } else {
                    toast.error(data.message)
                }
            }
        }
    }

    const handleSubmitBudgetItem = async (e) => {
        e.preventDefault();
        if (budgetSelectValue.item_name.trim() === '') { toast.error("Enter the item name"); return false; }
        if (budgetSelectValue.account_id === '') { toast.error("Please select account"); return false; }
        toast.info("Submitting...");

        if (budgetSelectValue.entry_id === '') {
            const { success, data } = await api.post("staff/finance/finance-and-budget/budget-item", budgetSelectValue);
            if (success) {
                if (data.message === 'success') {
                    toast.success("Budget Item Added Successfully");
                    setBudgetSelectValue({ entry_id: '', item_name: '', account_id: '' });
                    getData();
                } else {
                    toast.error(data.message)
                }
            }
        } else {
            const { success, data } = await api.patch("staff/finance/finance-and-budget/budget-item", budgetSelectValue);
            if (success) {
                if (data.message === 'success') {
                    toast.success("Budget Item Updated Successfully");
                    setBudgetSelectValue({ entry_id: '', item_name: '', account_id: '' });
                    getData();
                } else {
                    toast.error(data.message)
                }
            }
        }
    }

    const handleOnEdit = (item, bug_items) => {
        setSelectedBudget({ entry_id: item.EntryID, department_code: item.DepartmentCode, year_id: item.YearID, amount: item.Amount, allocated_amount: item.AllocatedAmount, balance_amount: item.BalanceAmount, status: 'submitted', inserted_by: item.InsertedBy });
        const budget_items = bug_items.filter(r => r.BudgetID === item.EntryID);
        if (budget_items.length > 0) {
            const items = [];
            budget_items.map(r => {
                items.push({ entry_id: r.EntryID, budget_id: r.BudgetID, item_name: r.ItemName, item_description: r.ItemDescription, quantity: r.Quantity, amount: r.Amount, total: r.Total, inserted_by: props.LoginDetails[0].StaffID })
            })
            setSelectedItem(items)
        }
    }

    //BUDGET DELETION
    const handleDelete = async (item, index) => {
        const filter_selected_item = selectedItem[index];
        let items = [];
        selectedItem.map((r, i) => {
            if (i !== index) {
                items.push(r)
            }
        })
        setSelectedItem(items);
        if (filter_selected_item.entry_id !== '') {
            toast.info("Deleting...")
            const { success, data } = await api.delete(`staff/finance/finance-and-budget/budget-item/${item.entry_id}/${item.total}`);
            if (success) {
                if (data.message === 'success') {
                    toast.success("Budget Item Deleted Successfully");
                    getData();
                } else {
                    toast.error(data.message)
                }
            }
        }
    }

    //ITEM DELETE
    const handleBudgetDelete = async (item) => {
        toast.info("Deleting...")
        const { success, data } = await api.delete(`staff/finance/finance-and-budget/budget/${item}`);
        if (success) {
            if (data.message === 'success') {
                toast.success("Budget Deleted Successfully");
                getData();
            } else {
                toast.error(data.message)
            }
        }
    }

    const onAddBudgetItem = () => {
        setSelectedItem([...selectedItem, selectedItemInitialize])
    }
    const handleItemChange = (e) => {
        const id = e.target.id;
        const value = e.target.value;
        const index = id.split("-")[2];

        const item_record = selectedItem;
        item_record.map((r, i) => {
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
                r.total = r.quantity * r.amount
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
                            selectedItem.length > 0 && selectedItem.map((r, i) => {
                                return (
                                    <div key={i} className="row mb-3">
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor={`item-name-${i}`}>Item {i + 1} Name</label>
                                                <SearchSelect
                                                    id={`item-name-${i}`}
                                                    value={budgetItems.map(r => ({ value: r.ItemName, label: r.ItemName })).find(opt => opt.value === r.item_name) || null}
                                                    options={budgetItems.map(r => ({ value: r.ItemName, label: r.ItemName }))}
                                                    onChange={(selected) => handleItemChange({ target: { id: `item-name-${i}`, value: selected?.value || '' } })}
                                                    placeholder="Select Option"
                                                    isClearable={false}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor={`item-description-${i}`}>Item {i + 1} Description</label>
                                                <input type="text" className="form-control" id={`item-description-${i}`} value={r.item_description} onChange={handleItemChange} />
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label htmlFor={`item-amount-${i}`}>Item {i + 1} Unit Price</label>
                                                <input type="number" className="form-control" id={`item-amount-${i}`} value={r.amount} onChange={handleItemChange} />
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label htmlFor={`item-quantity-${i}`}>Item {i + 1} Quantity</label>
                                                <input type="number" className="form-control" id={`item-quantity-${i}`} value={r.quantity} onChange={handleItemChange} />
                                            </div>
                                        </div>
                                        {
                                            (selectedBudget.status === 'submitted' || selectedBudget.status === 'reviewed') &&
                                            <div className="col-md-1">
                                                <button className="btn btn-danger btn-sm mt-8" onClick={() => handleDelete(r, i)}><i className="fa fa-trash" /></button>
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
                            <button className="btn btn-primary w-75" onClick={handleSubmit} disabled={selectedItem.length === 0}>Submit</button>
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
                                        selectedItem.map((r, i) => {
                                            return (
                                                <tr key={i}>
                                                    <td>{i + 1}</td>
                                                    <td>{r.item_name}</td>
                                                    <td>{r.item_description}</td>
                                                    <td>{currencyConverter(r.amount)}</td>
                                                    <td>{r.quantity}</td>
                                                    <td>{currencyConverter(r.quantity * r.amount)}</td>
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
                                        <th>{currencyConverter(selectedItem.map(item => item.amount * item.quantity).reduce((prev, next) => prev + next))}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    }

                    {
                        budgetTrackerList.filter(e => e.BudgetID === selectedBudget.entry_id).length > 0 &&
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
                                        budgetTrackerList.filter(e => e.BudgetID === selectedBudget.entry_id).map((r, i) => {
                                            return (
                                                <tr key={i}>
                                                    <td>{i + 1}</td>
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
                                <input type="text" className="form-control" value={budgetSelectValue.item_name} onChange={(e) => { setBudgetSelectValue({ ...budgetSelectValue, item_name: e.target.value }) }} />
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <div className="form-group">
                                <label htmlFor="account_type">Select Account Type</label>
                                <SearchSelect
                                    id="account_type"
                                    value={accountList.map(r => ({ value: r.EntryID.toString(), label: `${r.AccountName} (${r.AccountType})` })).find(opt => opt.value === budgetSelectValue.account_id?.toString()) || null}
                                    options={accountList.map(r => ({ value: r.EntryID.toString(), label: `${r.AccountName} (${r.AccountType})` }))}
                                    onChange={(selected) => setBudgetSelectValue({ ...budgetSelectValue, account_id: selected?.value || '' })}
                                    placeholder="Select Option"
                                    isClearable={false}
                                />
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
                                        budgetItems.map((r, i) => {
                                            return (
                                                <tr key={i}>
                                                    <td>{i + 1}</td>
                                                    <td>{r.ItemName}</td>
                                                    <td>{getAccountName(r.AccountID)}</td>
                                                    <td>
                                                        {
                                                            parseInt(props.LoginDetails[0].IsAdmin) === 1 ?
                                                                <button className="btn btn-info btn-sm" onClick={() => { setBudgetSelectValue({ ...budgetSelectValue, entry_id: r.EntryID, item_name: r.ItemName, account_id: r.AccountID }) }}><i className="fa fa-pen" /></button>
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

                <div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width: '100%' }}>
                    <div className="">
                        <PageHeader
                            title={"MY BUDGET"}
                            items={["Human-Resources", "Finance & Budget", "My Budget"]}
                            buttons={
                                <>
                                    <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => { setSelectedBudget({ ...formInitialize, year_id: getActiveAccountYear() }); setSelectedItem([]) }}>Add New Budget <i className="fa fa-plus" /></button>
                                    <button className="btn btn-info btn-sm pull-right" data-bs-toggle="modal" data-bs-target="#kt_modal_general_item" onClick={() => { setBudgetSelectValue({ entry_id: '', item_name: '' }) }}>Add Budget Item <i className="fa fa-plus" /></button>
                                </>
                            }
                        />
                        <div className="row col-md-12" style={{ width: '100%' }}>
                            <AGTable data={budgetDatatable} />
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
