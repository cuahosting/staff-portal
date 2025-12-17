import React, { useEffect, useState } from "react";
import { api } from "../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { currencyConverter, formatDate, formatDateAndTime } from "../../../resources/constants";
import Modal from "../../common/modal/modal";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";
import { Rtt } from "@mui/icons-material";


function FinanceBudgetReport(props) {
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Department", "Budgeted Amt.", "Allocated Amt.", "Balance", "Status", "Items", "Activities", "Inserted By", "Inserted Date", "Items | Tracking"];
    const formDataVariable = { entry_id: '', year: "", inserted_by: props.LoginDetails[0].StaffID, Decision: "", Description: "", Amount: 0, RecievedBy: "", BudgetID: "" }
    const [formData, setFormData] = useState(formDataVariable);
    const [yearsList, setYearsList] = useState([])
    const [staffList, setStaffList] = useState([])
    const [budgetList, setBudgetList] = useState([])
    const [budgetItemsList, setBudgetItemsList] = useState([])
    const [budgetItemsList2, setBudgetItemsList2] = useState([])
    const [budgetTrackerList, setBudgetTrackerList] = useState([])
    const item_columns = ["ItemName", "ItemDescription", "Quantity", "Amount", "Total", "InsertedBy"]
    const tracker_columns = ["Action", "Amount", "Inserted By", "Received By", "Timestamp"]
    const [selectedYear, setSelectedYear] = useState('')


    const getData = async () => {
        const { success, data } = await api.get("staff/finance/finance-and-budget/financial-year");
        if (success) {
            const results = data.data;
            let rows = [];
            if (results.length > 0) {
                results.map((x) => {
                    rows.push({
                        value: x.EntryID,
                        label: `${formatDateAndTime(x.StartDate, "date")}  to  ${formatDateAndTime(x.EndDate, "date")}`,
                        StartDate: formatDate(x.StartDate),
                        EndDate: formatDate(x.EndDate)
                    })
                })
                setYearsList(rows)
            }
        }

        const staffResult = await api.get("staff/report/staff/list/status/1");
        if (staffResult.success) {
            let _staff = []
            if (staffResult.data.length > 0) {
                staffResult.data.map((x) => {
                    _staff.push({
                        value: x.StaffID,
                        label: x.StaffName,
                    })
                })
                setStaffList(_staff)
            }
        }
        setIsLoading(false)
    }

    const onYearChange = (e) => {
        if (e) {
            getReport(e)
        } else {
            setFormData({
                ...formData,
                year: ""
            })
            setBudgetList([])
        }
    }

    const onStaffChange = (e) => {
        setFormData({
            ...formData,
            RecievedBy: e
        })
    }

    const getReport = async (year) => {
        setFormData({
            ...formData,
            year: year
        })
        try {
            const { success, data: res } = await api.get(`staff/finance/finance-and-budget/budget-report/${year.value}`);
            if (success) {
                const budgets = res.budgets;
                const budget_items = res.budget_items;
                const budget_track = res.budget_track;
                let rows = []
                if (budgets.length > 0) {
                    budgets.map((x, i) => {
                        const items = budget_items.length > 0 ? budget_items.filter(j => j.BudgetID === x.EntryID) : [];
                        const tracking = budget_track.length > 0 ? budget_track.filter(j => j.BudgetID === x.EntryID) : [];
                        rows.push([
                            i + 1,
                            x.DepartmentName,
                            currencyConverter(x.Amount),
                            currencyConverter(x.AllocatedAmount),
                            currencyConverter(x.BalanceAmount),
                            x.Status,
                            items.length,
                            tracking.length,
                            x.InsertedBy,
                            formatDateAndTime(x.InsertedDate, "date"),
                            <div className="d-flex">
                                <button className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#details_modal" type="button" title="View Items" id="items"
                                    onClick={() => {
                                        if (budget_items.length > 0) {
                                            let _budget_items = [];
                                            items.length > 0 &&
                                                items.map((_budg, _index) => {
                                                    _budget_items.push([
                                                        _budg.ItemName,
                                                        _budg.ItemDescription,
                                                        _budg.Quantity,
                                                        currencyConverter(_budg.Amount),
                                                        currencyConverter(_budg.Total),
                                                        _budg.InsertedBy
                                                    ])
                                                })
                                            setBudgetItemsList(_budget_items)
                                            setBudgetItemsList2(items)
                                        } else {
                                            setBudgetItemsList([])
                                            setBudgetItemsList2([])
                                        }
                                        setFormData({
                                            ...formData,
                                            BudgetID: x.EntryID,
                                            Amount: "", Description: "", Decision: "", year: year
                                        })
                                    }}
                                >
                                    <i className="fa fa-arrow-alt-circle-right" />
                                </button>


                                <button className="btn btn-sm btn-info ms-3" data-bs-toggle="modal" data-bs-target="#tracking_modal" title="View Tracking" id="tracking"
                                    onClick={() => {
                                        if (budget_track.length > 0) {
                                            let _budget_track = [];
                                            tracking.length > 0 &&
                                                tracking.map((_budg, _index) => {
                                                    _budget_track.push([
                                                        _budg.Action,
                                                        currencyConverter(_budg.Amount),
                                                        _budg.InsertedBy,
                                                        _budg.ReceivedBy,
                                                        formatDateAndTime(_budg.InsertedDate, "date_and_time")
                                                    ])
                                                })
                                            setBudgetTrackerList(_budget_track)
                                        } else {
                                            setBudgetTrackerList([])
                                        }

                                    }}
                                >
                                    <i className="fa fa-arrow-alt-circle-right" />
                                </button>

                            </div>
                        ])
                    })
                    setBudgetList(rows)

                } else {
                    setBudgetList([])
                }
            }
        } catch (e) {
            console.log(e)
            toast.error("Error Fetching Report, please try again!!!")
        }
    }


    useEffect(() => {
        getData()
    }, []);

    const onEdit = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
        if (e.target.id === "Decision") {
            if (e.target.value === "Full Allocation") {
                const total = budgetItemsList2.length > 0 ?
                    budgetItemsList2.map((x) => { return x.Total }).reduce((a, b) => a + b, 0) : 0;
                setFormData({
                    ...formData,
                    Amount: total,
                    [e.target.id]: e.target.value
                })
            } else {
                setFormData({
                    ...formData,
                    Amount: 0,
                    [e.target.id]: e.target.value
                })
            }
        }
    }

    const onAllocate = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            TrackerMessage: `${formData.Decision} : ${formData.Description}`,
            InsertedBy: formData.inserted_by,
            RecievedBy: formData.RecievedBy.value,
        }
        try {
            const { success, data: res } = await api.post("staff/finance/finance-and-budget/budget-approval", payload);
            if (success) {
                if (res.message === "success") {
                    toast.success(`Succesful`);
                    getReport(formData.year.value)
                    setFormData({
                        ...formData,
                        Amount: 0,
                        Decision: "",
                        Description: "",
                    })
                    document.getElementById("close_details_modal").click();
                } else if (res.message === "completed") {
                    toast.error("Sorry!, this budget has been allocated completely")
                } else if (res.message === "exceeds") {
                    toast.error("Sorry!, Allocated amount would exceed budgeted amount, please reduce the amount you want to allocate")
                } else if (res.message === "no budget") {
                    toast.error("no budget found")
                } else {
                    toast.error("failed")
                }
            }
        } catch (e) {
            toast.error("Something went wrong, please try again...")
        }

    }

    return isLoading ? (
        <Loader />
    ) :
        (
            <>
                <Modal large title={'Budget Report'} id="details_modal" close="close_details_modal">
                    <div className="row">
                        <div className="col-md-12">
                            <ReportTable
                                title={`Budget Items `}
                                columns={item_columns}
                                data={budgetItemsList}
                                height={"300px"}
                            />
                        </div>
                        <hr />
                        <h3>Approval</h3>
                        <div className="col-md-3 mt-5">
                            <label>Decision</label>
                            <SearchSelect
                                id="Decision"
                                value={[
                                    { value: "Reviewed", label: "Reviewed" },
                                    { value: "Approved", label: "Approved" },
                                    { value: "Rejected", label: "Rejected" },
                                    { value: "Partial Allocation", label: "Partial Allocation" },
                                    { value: "Full Allocation", label: "Full Allocation" }
                                ].find(opt => opt.value === formData.Decision) || null}
                                options={[
                                    { value: "Reviewed", label: "Reviewed" },
                                    { value: "Approved", label: "Approved" },
                                    { value: "Rejected", label: "Rejected" },
                                    { value: "Partial Allocation", label: "Partial Allocation" },
                                    { value: "Full Allocation", label: "Full Allocation" }
                                ]}
                                onChange={(selected) => onEdit({ target: { id: 'Decision', value: selected?.value || '' } })}
                                placeholder="--select--"
                                isClearable={false}
                            />
                        </div>"
                        <div className="col-md-9 mt-5">
                            <label>Description</label>
                            <input type="text" name="Description" id="Description" className="form-control" onChange={onEdit} value={formData.Description} />
                        </div>
                        {
                            formData.Decision.includes("Allocation") &&
                            <>
                                <div className="col-md-6 mt-5">
                                    <label>Amount</label>
                                    <input type="number" step={"any"} name="Amount" id="Amount" className="form-control" value={formData.Amount} onChange={onEdit} />
                                </div>
                                <div className="col-md-6 mt-5">
                                    <SearchSelect
                                        id="RecievedBy"
                                        className="form-select form-select"
                                        value={formData.RecievedBy}
                                        onChange={onStaffChange}
                                        options={staffList}
                                        placeholder="select Reciever"
                                    />
                                </div></>
                        }
                        <div className="col-md-12 mt-5">
                            <button className="btn btn-md btn-primary w-100" onClick={(e) => onAllocate(e)} type="submit" >Submit</button>
                        </div>
                    </div>

                </Modal>

                <Modal large title={'Budget Tracking'} id="tracking_modal">
                    <div className="row">
                        <h4>Tracking Report</h4>
                        <div className="col-md-12">
                            <ReportTable
                                title={`Budget Items `}
                                columns={tracker_columns}
                                data={budgetTrackerList}
                                height={"300px"}
                            />
                        </div>
                    </div>

                </Modal>
                <div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width: '100%' }}>
                    <div className="">
                        <PageHeader
                            title={"Budget Report"}
                            items={["Human-Resources", "Finance & Budget", "Budget Report"]}
                        />
                        <div className="row col-md-12">
                            <SearchSelect
                                id="BudgetYear"
                                label="Select Budget Year"
                                value={formData.year}
                                onChange={onYearChange}
                                options={yearsList}
                                placeholder="Select Budget Year"
                            />
                        </div>
                        <div className="row col-md-12" style={{ width: '100%' }}>
                            <ReportTable
                                title={`Budget Reports`}
                                columns={columns}
                                data={budgetList}
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
export default connect(mapStateToProps, null)(FinanceBudgetReport);
