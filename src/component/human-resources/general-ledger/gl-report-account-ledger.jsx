import React, { useEffect, useState } from "react";
import { api } from "../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";
import { currencyConverter, formatDateAndTime } from "../../../resources/constants";
import { useParams, useNavigate } from "react-router-dom";

function GLReportAccountLedger(props) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [accountOptions, setAccountOptions] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accountInfo, setAccountInfo] = useState(null);
    const [dataTable, setDataTable] = useState([]);
    const [totals, setTotals] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const columns = ["S/N", "Action", "Date", "Journal #", "Description", "Source", "Debit", "Credit", "Running Balance"];

    const getAccounts = async () => {
        const { success, data } = await api.get("staff/finance/gl/accounts/list", { postable: "1" });
        if (success && data.success) {
            const accounts = data.data || [];
            const options = accounts.map((a) => ({ value: a.EntryID, label: `${a.AccountCode} - ${a.AccountName}` }));
            setAccountOptions(options);
            if (id) {
                const match = options.find((o) => o.value === parseInt(id));
                if (match) setSelectedAccount(match);
            }
        }
        setIsLoading(false);
    };

    const getData = async (accountId) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const { success, data } = await api.get(`staff/finance/gl/reports/account-ledger/${accountId}`, params);
        if (success && data.success) {
            setAccountInfo(data.data.account);
            setTotals(data.data.totals);
            const entries = data.data.entries || [];
            const rows = entries.map((item, index) => [
                index + 1,
                <button
                    className="btn btn-info btn-sm"
                    onClick={() => navigate(`/human-resources/general-ledger/journal-detail/${item.JournalID}`)}
                    title="View Journal"
                >
                    <i className="fa fa-eye" />
                </button>,
                formatDateAndTime(item.TransactionDate, "date"),
                item.JournalNumber,
                item.LineDescription || item.JournalDescription,
                item.SourceModule || "MANUAL",
                item.DebitAmount ? currencyConverter(item.DebitAmount) : "--",
                item.CreditAmount ? currencyConverter(item.CreditAmount) : "--",
                currencyConverter(item.RunningBalance),
            ]);
            setDataTable(rows);
        }
    };

    useEffect(() => {
        getAccounts();
    }, []);

    useEffect(() => {
        if (selectedAccount) {
            getData(selectedAccount.value);
        } else {
            setDataTable([]);
            setTotals(null);
            setAccountInfo(null);
        }
    }, [selectedAccount, startDate, endDate]);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="card" style={{ borderStyle: "none", borderWidth: "0px", width: "100%" }}>
            <div className="">
                <PageHeader
                    title={"ACCOUNT LEDGER"}
                    items={["Human-Resources", "General Ledger", "Account Ledger"]}
                    buttons={
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate("/human-resources/general-ledger/trial-balance")}>
                            <i className="fa fa-arrow-left me-2"></i>Back to Trial Balance
                        </button>
                    }
                />

                <div className="row mb-4 px-3">
                    <div className="col-md-4">
                        <label className="form-label fw-bold">Account</label>
                        <SearchSelect
                            value={selectedAccount}
                            onChange={(s) => {
                                setSelectedAccount(s);
                                if (s) navigate(`/human-resources/general-ledger/account-ledger/${s.value}`, { replace: true });
                            }}
                            options={accountOptions}
                            isClearable
                            placeholder="Select Account"
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

                {accountInfo && (
                    <div className="row mb-3 px-3">
                        <div className="col-md-12">
                            <div className="d-flex gap-4 align-items-center">
                                <span><strong>Account:</strong> {accountInfo.AccountCode} - {accountInfo.AccountName}</span>
                                <span><strong>Type:</strong> {accountInfo.AccountType}</span>
                                <span><strong>Normal Balance:</strong> {accountInfo.NormalBalance}</span>
                                {totals && (
                                    <>
                                        <span className="fw-bold text-primary">Net Balance: {currencyConverter(totals.netBalance)}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="row col-md-12" style={{ width: "100%" }}>
                    <ReportTable title="Account Ledger" columns={columns} data={dataTable} height="600px" />
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
export default connect(mapStateToProps, null)(GLReportAccountLedger);
