import React, { useEffect, useState } from "react";
import { api } from "../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";
import { currencyConverter, formatDateAndTime } from "../../../resources/constants";
import { useNavigate } from "react-router-dom";

function GLReportTrialBalance(props) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [yearList, setYearList] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [asOfDate, setAsOfDate] = useState("");
    const [dataTable, setDataTable] = useState([]);
    const [totals, setTotals] = useState(null);

    const columns = ["S/N", "Action", "Account Code", "Account Name", "Type", "IFRS Classification", "Debit", "Credit"];

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
        if (asOfDate) params.asOfDate = asOfDate;

        const { success, data } = await api.get("staff/finance/gl/reports/trial-balance", params);
        if (success && data.success) {
            const accounts = data.data.accounts || [];
            setTotals(data.data.totals);
            const rows = accounts.map((item, index) => [
                index + 1,
                <button
                    className="btn btn-info btn-sm"
                    onClick={() => navigate(`/human-resources/general-ledger/account-ledger/${item.EntryID}`)}
                    title="View Account Ledger"
                >
                    <i className="fa fa-eye" />
                </button>,
                item.AccountCode,
                item.AccountName,
                item.AccountType,
                item.IFRSClassification || "--",
                currencyConverter(item.TotalDebit),
                currencyConverter(item.TotalCredit),
            ]);
            setDataTable(rows);
        }
    };

    useEffect(() => {
        getYears();
    }, []);

    useEffect(() => {
        if (selectedYear) getData();
    }, [selectedYear, asOfDate]);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="card" style={{ borderStyle: "none", borderWidth: "0px", width: "100%" }}>
            <div className="">
                <PageHeader title={"TRIAL BALANCE"} items={["Human-Resources", "General Ledger", "Trial Balance"]} />

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
                    <div className="col-md-3">
                        <label className="form-label fw-bold">As of Date</label>
                        <input type="date" className="form-control" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
                    </div>
                    {totals && (
                        <div className="col-md-5 d-flex align-items-end">
                            <div className="d-flex gap-3">
                                <span className="fw-bold">Total Debit: {currencyConverter(totals.totalDebit)}</span>
                                <span className="fw-bold">Total Credit: {currencyConverter(totals.totalCredit)}</span>
                                {totals.isBalanced ? (
                                    <span className="badge badge-success fs-6">Balanced</span>
                                ) : (
                                    <span className="badge badge-danger fs-6">Unbalanced</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="row col-md-12" style={{ width: "100%" }}>
                    <ReportTable title="Trial Balance" columns={columns} data={dataTable} height="600px" />
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
    };
};
export default connect(mapStateToProps, null)(GLReportTrialBalance);
