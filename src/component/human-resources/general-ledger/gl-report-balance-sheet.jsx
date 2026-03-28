import React, { useEffect, useState } from "react";
import { api } from "../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";
import { currencyConverter, formatDateAndTime } from "../../../resources/constants";

function GLReportBalanceSheet(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [yearList, setYearList] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [asOfDate, setAsOfDate] = useState("");
    const [assetTable, setAssetTable] = useState([]);
    const [liabilityTable, setLiabilityTable] = useState([]);
    const [equityTable, setEquityTable] = useState([]);
    const [totals, setTotals] = useState(null);

    const sectionColumns = ["S/N", "Account Code", "Account Name", "IFRS Classification", "Amount"];

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

    const buildSectionRows = (items) =>
        items.map((item, index) => [
            index + 1,
            item.AccountCode,
            item.AccountName,
            item.IFRSClassification || "--",
            currencyConverter(Math.abs(item.NetAmount)),
        ]);

    const getData = async () => {
        const params = {};
        if (selectedYear) params.yearId = selectedYear.value;
        if (asOfDate) params.asOfDate = asOfDate;

        const { success, data } = await api.get("staff/finance/gl/reports/balance-sheet", params);
        if (success && data.success) {
            setAssetTable(buildSectionRows(data.data.assets || []));
            setLiabilityTable(buildSectionRows(data.data.liabilities || []));
            setEquityTable(buildSectionRows(data.data.equity || []));
            setTotals(data.data.totals);
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
                <PageHeader title={"BALANCE SHEET"} items={["Human-Resources", "General Ledger", "Balance Sheet"]} />

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
                            {totals.isBalanced ? (
                                <span className="badge badge-success fs-6">Balanced</span>
                            ) : (
                                <span className="badge badge-danger fs-6">Unbalanced</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Assets */}
                <div className="px-3 mb-4">
                    <h4 className="fw-bold text-primary mb-3">Assets</h4>
                    <div className="row col-md-12" style={{ width: "100%" }}>
                        <ReportTable title="Assets" columns={sectionColumns} data={assetTable} height="250px" />
                    </div>
                    {totals && (
                        <div className="text-end pe-5 fw-bold text-primary">
                            Total Assets: {currencyConverter(totals.totalAssets)}
                        </div>
                    )}
                </div>

                {/* Liabilities */}
                <div className="px-3 mb-4">
                    <h4 className="fw-bold text-warning mb-3">Liabilities</h4>
                    <div className="row col-md-12" style={{ width: "100%" }}>
                        <ReportTable title="Liabilities" columns={sectionColumns} data={liabilityTable} height="250px" />
                    </div>
                    {totals && (
                        <div className="text-end pe-5 fw-bold text-warning">
                            Total Liabilities: {currencyConverter(totals.totalLiabilities)}
                        </div>
                    )}
                </div>

                {/* Equity */}
                <div className="px-3 mb-4">
                    <h4 className="fw-bold text-success mb-3">Equity</h4>
                    <div className="row col-md-12" style={{ width: "100%" }}>
                        <ReportTable title="Equity" columns={sectionColumns} data={equityTable} height="250px" />
                    </div>
                    {totals && (
                        <div className="text-end pe-5 fw-bold text-success">
                            Total Equity: {currencyConverter(totals.totalEquity)}
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
                                        <h5 className="text-muted">Total Assets</h5>
                                        <h3 className="text-primary">{currencyConverter(totals.totalAssets)}</h3>
                                    </div>
                                    <div className="col-md-4">
                                        <h5 className="text-muted">Total Liabilities</h5>
                                        <h3 className="text-warning">{currencyConverter(totals.totalLiabilities)}</h3>
                                    </div>
                                    <div className="col-md-4">
                                        <h5 className="text-muted">Total Equity</h5>
                                        <h3 className="text-success">{currencyConverter(totals.totalEquity)}</h3>
                                    </div>
                                </div>
                                <div className="text-center mt-3">
                                    <h5 className="text-muted">Assets = Liabilities + Equity</h5>
                                    <h4>
                                        {currencyConverter(totals.totalAssets)} = {currencyConverter(totals.totalLiabilities)} + {currencyConverter(totals.totalEquity)}
                                    </h4>
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
export default connect(mapStateToProps, null)(GLReportBalanceSheet);
