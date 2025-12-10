import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import { currencyConverter, formatDateAndTime, sumObjectArray } from "../../../resources/constants";

function FinanceReportTrialBalance(props)
{
    const token = props.LoginDetails[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Account Name", "Total Credit", "Total Debit"];
    const [dataTable, setDataTable] = useState([]);
    const [transactionList, setTransactionList] = useState([])
    const [accountList, setAccountList] = useState([])
    const [reportData, setReportData] = useState({ start_date: '', end_date: '' })
    const getAccountName = (account_list, account_id) =>
    {
        const list = account_list.filter(r => r.EntryID === account_id);
        return list.length > 0 ? list[0].AccountName : 'No Account'
    }

    const getData = async () =>
    {
        await axios.get(`${serverLink}staff/finance/finance-and-budget/transaction-data`, token)
            .then((result) =>
            {
                if (result.data.message === 'success')
                {
                    setTransactionList(result.data.data)
                    setAccountList(result.data.account)
                }
                setIsLoading(false);
            })
            .catch((err) =>
            {
                toast.error("NETWORK ERROR")
            });
    }

    const handleChange = (e) =>
    {
        const report_data = {
            ...reportData,
            [e.target.id]: e.target.value
        };
        setReportData(report_data)
        if (report_data.start_date !== '' && report_data.end_date !== '')
        {
            let transaction_list = transactionList.filter(item => { return (new Date(item.TransactionDate).getTime() >= new Date(report_data.start_date).getTime() && new Date(item.TransactionDate).getTime() <= new Date(report_data.end_date).getTime()) });
            if (accountList.length > 0)
            {
                let rows = [];
                let total_debit = 0;
                let total_credit = 0;
                accountList.map((r, i) =>
                {
                    const debit_transaction = transaction_list.filter(e => e.DebitAccountID === r.EntryID);
                    const credit_transaction = transaction_list.filter(e => e.CreditAccountID === r.EntryID);
                    const debit_total = debit_transaction.length > 0 ? sumObjectArray(debit_transaction, 'Amount') : 0;
                    const credit_total = credit_transaction.length > 0 ? sumObjectArray(credit_transaction, 'Amount') : 0;
                    rows.push([
                        i + 1, r.AccountName, currencyConverter(credit_total), currencyConverter(debit_total)
                    ])
                    total_debit += debit_total;
                    total_credit += credit_total;
                })
                rows.push([
                    `${accountList.length} accounts`, 'Z-Total', currencyConverter(total_credit), currencyConverter(total_debit)
                ])
                setDataTable(rows)
            } else
            {
                toast.error("No transaction record within the selected date range");
                setDataTable([])
            }
        }
    }

    useEffect(() =>
    {
        getData()
    }, []);

    return isLoading ? (
        <Loader />
    ) :
        (
            <>
                <div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width: '100%' }}>
                    <div className="">
                        <PageHeader
                            title={"TRIAL BALANCE REPORT"}
                            items={["Human-Resources", "Finance & Budget", "Trial Balance Report"]}
                        />
                        <div className="row col-md-12">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="start_date">Start Date</label>
                                <input type="date" id="start_date" className="form-control" value={reportData.start_date} onChange={handleChange} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="end_date">End Date</label>
                                <input type="date" id="end_date" className="form-control" disabled={reportData.start_date === ''} min={reportData.start_date} value={reportData.end_date} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="row col-md-12" style={{ width: '100%' }}>
                            <ReportTable
                                row_count={100}
                                title={`Trial Balance Report`}
                                columns={columns}
                                data={dataTable}
                                height={"1500px"}
                            />
                        </div>
                    </div>

                </div>
            </>
        )
}

const mapStateToProps = (state) =>
{
    return {
        LoginDetails: state.LoginDetails,
    };
};
export default connect(mapStateToProps, null)(FinanceReportTrialBalance);
