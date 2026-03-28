import React, { useEffect, useState } from "react";
import { api } from "../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";
import { currencyConverter, formatDateAndTime } from "../../../resources/constants";

function GLReportIncomeStatement(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [yearList, setYearList] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [revenueTable, setRevenueTable] = useState([]);
    const [expenseTable, setExpenseTable] = useState([]);
    const [totals, setTotals] = useState(null);

    const revenueColumns = ["S/N", "Account Code", "Account Name", "IFRS Classification", "Amount"];
    const expenseColumns = ["S/N", "Account Code", "Account Name", "IFRS Classification", "Amount"];

    const getYears = async () => {
        const { success, data } = await api.get("staff/finance/finance-and-budget/financial-year");
        if (success && data.message === "success") {
            const years = data.data || [];
            setYearList(years.map((y) => ({ value: y.EntryID, label: `${formatDateAndTime(y.StartDate, "date")} to ${formatDateAndTime(y.EndDate, "date")}` })));
            const active = years.find((y) => y.IsActive === 1);
            if (active) setSelectedYear({ value: active.EntryID, label: `${formatDateAndTime(active.StartDate, "date")} to ${formatDateAndTime(active.EndDate, "date")}` });
        }
        setIsLoading(false);
    };

    const getData = async () => {
        const params = {};
        if (selectedYear) params.yearId = selectedYear.value;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const { success, data } = await api.get("staff/finance/gl/reports/income-statement", params);
        if (success && data.success) {
            const revenue = data.data.revenue || [];
            const expenses = data.data.expenses || [];
            setTotals(data.data.totals);

            setRevenueTable(
                revenue.map((item, index) => [
                    index + 1,
                    item.AccountCode,
                    item.AccountName,
                    item.IFRSClassification || "--",
                    currencyConverter(Math.abs(item.NetAmount)),
                ])
            );

            setExpenseTable(
                expenses.map((item, index) => [
                    index + 1,
                    item.AccountCode,
                    item.AccountName,
                    item.IFRSClassification || "--",
                    currencyConverter(Math.abs(item.NetAmount)),
                ])
            );
        }
    };

    useEffect(() => {
        getYears();
    }, []);

    useEffect(() => {
        if (selectedYear) getData();
    }, [selectedYear, startDate, endDate]);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="card" style={{ borderStyle: "none", borderWidth: "0px", width: "100%" }}>
            <div className="">
                <PageHeader title={"INCOME STATEMENT"} items={["Human-Resources", "General Ledger", "Income Statement"]} />

                <div className="row mb-4 px-3">
                    <div className="col-md-4">
                        <label className="form-label fw-bold">Financial Year</label>
                        <SearchSelect
                            value={selectedYear}
                            onChange={(s) => setSelectedYear(s)}
                            options={yearList}
                            isClearable
                            placeholder="Select Year"
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Start Date</label>
                        <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-bold">End Date</label>
                        <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>

                {/* Revenue Section */}
                <div className="px-3 mb-4">
                    <h4 className="fw-bold text-success mb-3">Revenue</h4>
                    <div className="row col-md-12" style={{ width: "100%" }}>
                        <ReportTable title="Revenue Accounts" columns={revenueColumns} data={revenueTable} height="300px" />
                    </div>
                    {totals && (
                        <div className="text-end pe-5 fw-bold text-success">
                            Total Revenue: {currencyConverter(totals.totalRevenue)}
                        </div>
                    )}
                </div>

                {/* Expense Section */}
                <div className="px-3 mb-4">
                    <h4 className="fw-bold text-danger mb-3">Expenses</h4>
                    <div className="row col-md-12" style={{ width: "100%" }}>
                        <ReportTable title="Expense Accounts" columns={expenseColumns} data={expenseTable} height="300px" />
                    </div>
                    {totals && (
                        <div className="text-end pe-5 fw-bold text-danger">
                            Total Expenses: {currencyConverter(totals.totalExpenses)}
                        </div>
                    )}
                </div>

                {/* Summary */}
                {totals && (
                    <div className="px-3 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="row text-center">
                                    <div className="col-md-4">
                                        <h5 className="text-muted">Total Revenue</h5>
                                        <h3 className="text-success">{currencyConverter(totals.totalRevenue)}</h3>
                                    </div>
                                    <div className="col-md-4">
                                        <h5 className="text-muted">Total Expenses</h5>
                                        <h3 className="text-danger">{currencyConverter(totals.totalExpenses)}</h3>
                                    </div>
                                    <div className="col-md-4">
                                        <h5 className="text-muted">Net Income</h5>
                                        <h3 className={totals.netIncome >= 0 ? "text-success" : "text-danger"}>
                                            {currencyConverter(totals.netIncome)}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
    };
};
export default connect(mapStateToProps, null)(GLReportIncomeStatement);
