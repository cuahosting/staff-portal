import React, { useEffect, useState } from "react";
import { api } from "../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import { currencyConverter, formatDateAndTime, sumObjectArray } from "../../../resources/constants";

function FinanceReportGeneralLedger(props) {
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Transaction Date", "Description", "Debit Account", "Credit Account", "Debit", "Credit", "Added By", "Added Date"];
    const [dataTable, setDataTable] = useState([]);
    const [transactionList, setTransactionList] = useState([])
    const [accountList, setAccountList] = useState([])
    const [reportData, setReportData] = useState({ start_date: '', end_date: '' })
    const getAccountName = (account_list, account_id) => {
        const list = account_list.filter(r => r.EntryID === account_id);
        return list.length > 0 ? list[0].AccountName : 'No Account'
    }

    const getData = async () => {
        const { success, data: result } = await api.get("staff/finance/finance-and-budget/transaction-data");
        if (success && result.message === 'success') {
            setTransactionList(result.data)
            setAccountList(result.account)
        }
        setIsLoading(false);
    }

    const handleChange = (e) => {
        const report_data = {
            ...reportData,
            [e.target.id]: e.target.value
        };
        setReportData(report_data)
        if (report_data.start_date !== '' && report_data.end_date !== '') {
            let transaction_list = transactionList.filter(item => { return (new Date(item.TransactionDate).getTime() >= new Date(report_data.start_date).getTime() && new Date(item.TransactionDate).getTime() <= new Date(report_data.end_date).getTime()) });

            if (transaction_list.length > 0) {
                let rows = [];
                transaction_list.map((item, index) => {
                    rows.push([
                        index + 1, formatDateAndTime(item.TransactionDate, 'date'), item.Description, getAccountName(accountList, item.DebitAccountID), getAccountName(accountList, item.CreditAccountID),
                        currencyConverter(item.Debit), currencyConverter(item.Credit), item.InsertedBy, formatDateAndTime(item.InsertedDate, 'date')
                    ]);
                });
                rows.push([`${transaction_list.length} rows`, '--', '--', '--', '--', currencyConverter(sumObjectArray(transaction_list, 'Debit')), currencyConverter(sumObjectArray(transaction_list, 'Credit')), '--', '--'])
                setDataTable(rows)
            } else {
                toast.error("No transaction record within the selected date range");
                setDataTable([])
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
                <div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width: '100%' }}>
                    <div className="">
                        <PageHeader
                            title={"GENERAL LEDGER REPORT"}
                            items={["Human-Resources", "Finance & Budget", "General Ledger Report"]}
                        />
                        <div className="row col-md-12">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="start_date">Ledger Start Date</label>
                                <input type="date" id="start_date" className="form-control" value={reportData.start_date} onChange={handleChange} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="end_date">Ledger End Date</label>
                                <input type="date" id="end_date" className="form-control" disabled={reportData.start_date === ''} min={reportData.start_date} value={reportData.end_date} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="row col-md-12" style={{ width: '100%' }}>
                            <ReportTable
                                title={`General ledger Report`}
                                columns={columns}
                                data={dataTable}
                                height={"800px"}
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
export default connect(mapStateToProps, null)(FinanceReportGeneralLedger);
