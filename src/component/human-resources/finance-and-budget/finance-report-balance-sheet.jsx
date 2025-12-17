import React, { useEffect, useRef, useState, useMemo } from "react";
import { api } from "../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { currencyConverter, formatDateAndTime, shortCode } from "../../../resources/constants";
import DataTable from "../../common/table/DataTable";
import SearchSelect from "../../common/select/SearchSelect";

function FinanceReportBalanceSheet(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [assetList, setAssetList] = useState([])
    const [liabilityList, setLiabilityList] = useState([])
    const [equityList, setEquityList] = useState([])
    const [rawData, setRawData] = useState([]);
    const [accountList, setAccountList] = useState([])
    const [yearList, setYearList] = useState([])
    const [transactionList, setTransactionList] = useState([]);
    const [reportType, setReportType] = useState({ report_type: '', year_id: '', start_date: '', end_date: '' });
    const [reportTitle, setReportTitle] = useState("");
    const current_year = formatDateAndTime(new Date(), 'year_only');
    const last_five_years = [current_year, current_year - 1, current_year - 2, current_year - 3, current_year - 4]

    const getData = async () => {
        const { success, data: result } = await api.get("staff/finance/finance-and-budget/transaction-data");
        if (success && result.message === 'success') {
            setAccountList(result.account)
            setYearList(result.year)
            setTransactionList(result.data)
        }
        setIsLoading(false);
    }

    const handleChange = (e) => {
        // Handle SearchSelect changes directly or emulate event for generic handler
        const id = e.target ? e.target.id : e.id;
        const value = e.target ? e.target.value : e.value;

        if (id === 'report_type') {
            setReportType({ ...reportType, report_type: value, year_id: '', start_date: '', end_date: '' })
            if (value === 'years') {
                reportFormatter('years', parseInt(value), '', '')
            } else {
                setReportTitle("")
                setRawData([])
            }
        }
        else {
            setReportType(prev => ({ ...prev, [id]: value }));
            if (value !== '') {
                if (id === 'year_id') {
                    reportFormatter('year_id', parseInt(value), '', '')
                } else {
                    if (id === 'start_date')
                        reportFormatter('date', '', value, reportType.end_date)
                    else {
                        // Ensure we have the latest start_date/end_date for formatting
                        const sDate = id === 'start_date' ? value : reportType.start_date;
                        const eDate = id === 'end_date' ? value : reportType.end_date;

                        if (id === 'end_date' || (id === 'start_date' && reportType.end_date)) {
                            reportFormatter('date', '', sDate, eDate)
                        }
                    }
                }
            } else {
                setRawData([])
            }
        }
    }

    // Adaptor for SearchSelect to work with the generic handler logic or use specific handlers
    const handleSelectChange = (field) => (selected) => {
        handleChange({ id: field, value: selected ? selected.value : '' });
    };

    const getAccountYear = (year_list, year_id) => {
        const list = year_list.filter(r => r.EntryID === year_id);
        return list.length > 0 ? `${formatDateAndTime(list[0].StartDate, 'date')} to ${formatDateAndTime(list[0].EndDate, 'date')}` : 'No Date'
    }

    const reportFormatter = (type, year_id = '', start_date = '', end_date = '') => {
        if (type === 'year_id') {
            setReportTitle(`Balance Sheet Report from ${getAccountYear(yearList, year_id)}`)
            let asset_list = [];
            let liability_list = [];
            let equity_list = [];
            if (accountList.length > 0) {
                accountList.map(r => {
                    if (r.AccountType === 'Asset')
                        asset_list.push({ title: r.AccountName, id: r.EntryID })
                    else if (r.AccountType === 'Liability')
                        liability_list.push({ title: r.AccountName, id: r.EntryID })
                    else if (r.AccountType === 'Equity')
                        equity_list.push({ title: r.AccountName, id: r.EntryID })
                })
            }
            let sendData = [];
            const year_transaction_list = transactionList.filter(r => r.YearID === year_id)
            let asset_records = []
            if (asset_list.length > 0) {
                asset_list.map(r => {
                    const transactions = year_transaction_list.filter(e => e.DebitAccountID === r.id || e.CreditAccountID === r.id);
                    const total = transactions.length > 0 ? transactions.map(item => item.Amount).reduce((prev, next) => prev + next) : 0
                    asset_records.push({ title: r.title, amount: total })
                })
            }

            let liability_records = []
            if (liability_list.length > 0) {
                liability_list.map(r => {
                    const transactions = year_transaction_list.filter(e => e.DebitAccountID === r.id || e.CreditAccountID === r.id);
                    const total = transactions.length > 0 ? transactions.map(item => item.Amount).reduce((prev, next) => prev + next) : 0
                    liability_records.push({ title: r.title, amount: total })
                })
            }

            let equity_records = []
            if (equity_list.length > 0) {
                equity_list.map(r => {
                    const transactions = year_transaction_list.filter(e => e.DebitAccountID === r.id || e.CreditAccountID === r.id);
                    const total = transactions.length > 0 ? transactions.map(item => item.Amount).reduce((prev, next) => prev + next) : 0
                    equity_records.push({ title: r.title, amount: total })
                })
            }
            sendData.push(
                {
                    title: 'Assets',
                    items: asset_records,
                    total: asset_records.length > 0 ? asset_records.map(item => item.amount).reduce((prev, next) => prev + next) : 0
                },
                {
                    title: 'Liabilities',
                    items: liability_records,
                    total: liability_records.length > 0 ? liability_records.map(item => item.amount).reduce((prev, next) => prev + next) : 0
                },
                {
                    title: 'Equity',
                    items: equity_records,
                    total: equity_records.length > 0 ? equity_records.map(item => item.amount).reduce((prev, next) => prev + next) : 0
                })

            setAssetList(asset_list)
            setLiabilityList(liability_list)
            setEquityList(equity_list)
            setRawData(sendData)

        }
        else if (type === 'years') {
            setReportTitle(`Balance Sheet Report for the last Five Years`);
            let asset_list = [];
            let liability_list = [];
            let equity_list = [];
            if (accountList.length > 0) {
                accountList.map(r => {
                    if (r.AccountType === 'Asset')
                        asset_list.push({ title: r.AccountName, id: r.EntryID })
                    else if (r.AccountType === 'Liability')
                        liability_list.push({ title: r.AccountName, id: r.EntryID })
                    else if (r.AccountType === 'Equity')
                        equity_list.push({ title: r.AccountName, id: r.EntryID })
                })
            }
            let sendData = [];
            last_five_years.map(year => {
                let transaction_list = transactionList.filter(item => {
                    return (new Date(item.TransactionDate).getTime() >= new Date(`${year}-01-01`).getTime() && new Date(item.TransactionDate).getTime() <= new Date(`${year}-12-31`).getTime())
                });


                let asset_records = []
                if (asset_list.length > 0) {
                    asset_list.map(r => {
                        const transactions = transaction_list.filter(e => e.DebitAccountID === r.id || e.CreditAccountID === r.id);
                        const total = transactions.length > 0 ? transactions.map(item => item.Amount).reduce((prev, next) => prev + next) : 0
                        asset_records.push({ title: r.title, amount: total })
                    })
                }

                let liability_records = []
                if (liability_list.length > 0) {
                    liability_list.map(r => {
                        const transactions = transaction_list.filter(e => e.DebitAccountID === r.id || e.CreditAccountID === r.id);
                        const total = transactions.length > 0 ? transactions.map(item => item.Amount).reduce((prev, next) => prev + next) : 0
                        liability_records.push({ title: r.title, amount: total })
                    })
                }

                let equity_records = []
                if (equity_list.length > 0) {
                    equity_list.map(r => {
                        const transactions = transaction_list.filter(e => e.DebitAccountID === r.id || e.CreditAccountID === r.id);
                        const total = transactions.length > 0 ? transactions.map(item => item.Amount).reduce((prev, next) => prev + next) : 0
                        equity_records.push({ title: r.title, amount: total })
                    })
                }
                sendData.push([
                    {
                        title: 'Assets',
                        items: asset_records,
                        total: asset_records.length > 0 ? asset_records.map(item => item.amount).reduce((prev, next) => prev + next) : 0
                    },
                    {
                        title: 'Liabilities',
                        items: liability_records,
                        total: liability_records.length > 0 ? liability_records.map(item => item.amount).reduce((prev, next) => prev + next) : 0
                    },
                    {
                        title: 'Equity',
                        items: equity_records,
                        total: equity_records.length > 0 ? equity_records.map(item => item.amount).reduce((prev, next) => prev + next) : 0
                    }])
            })
            setAssetList(asset_list)
            setLiabilityList(liability_list)
            setEquityList(equity_list)
            setRawData(sendData)
        }
        else {
            if (start_date !== '' && end_date !== '') {
                setReportTitle(`Balance Sheet Report from ${formatDateAndTime(start_date, 'date')} to ${formatDateAndTime(end_date, 'date')}`)
                let transaction_list = transactionList.filter(item => { return (new Date(item.TransactionDate).getTime() >= new Date(start_date).getTime() && new Date(item.TransactionDate).getTime() <= new Date(end_date).getTime()) });
                let asset_list = [];
                let liability_list = [];
                let equity_list = [];
                if (accountList.length > 0) {
                    accountList.map(r => {
                        if (r.AccountType === 'Asset')
                            asset_list.push({ title: r.AccountName, id: r.EntryID })
                        else if (r.AccountType === 'Liability')
                            liability_list.push({ title: r.AccountName, id: r.EntryID })
                        else if (r.AccountType === 'Equity')
                            equity_list.push({ title: r.AccountName, id: r.EntryID })
                    })
                }
                let sendData = [];
                let asset_records = []
                if (asset_list.length > 0) {
                    asset_list.map(r => {
                        const transactions = transaction_list.filter(e => e.DebitAccountID === r.id || e.CreditAccountID === r.id);
                        const total = transactions.length > 0 ? transactions.map(item => item.Amount).reduce((prev, next) => prev + next) : 0
                        asset_records.push({ title: r.title, amount: total })
                    })
                }

                let liability_records = []
                if (liability_list.length > 0) {
                    liability_list.map(r => {
                        const transactions = transaction_list.filter(e => e.DebitAccountID === r.id || e.CreditAccountID === r.id);
                        const total = transactions.length > 0 ? transactions.map(item => item.Amount).reduce((prev, next) => prev + next) : 0
                        liability_records.push({ title: r.title, amount: total })
                    })
                }

                let equity_records = []
                if (equity_list.length > 0) {
                    equity_list.map(r => {
                        const transactions = transaction_list.filter(e => e.DebitAccountID === r.id || e.CreditAccountID === r.id);
                        const total = transactions.length > 0 ? transactions.map(item => item.Amount).reduce((prev, next) => prev + next) : 0
                        equity_records.push({ title: r.title, amount: total })
                    })
                }
                sendData.push(
                    {
                        title: 'Assets',
                        items: asset_records,
                        total: asset_records.length > 0 ? asset_records.map(item => item.amount).reduce((prev, next) => prev + next) : 0
                    },
                    {
                        title: 'Liabilities',
                        items: liability_records,
                        total: liability_records.length > 0 ? liability_records.map(item => item.amount).reduce((prev, next) => prev + next) : 0
                    },
                    {
                        title: 'Equity',
                        items: equity_records,
                        total: equity_records.length > 0 ? equity_records.map(item => item.amount).reduce((prev, next) => prev + next) : 0
                    })

                setAssetList(asset_list)
                setLiabilityList(liability_list)
                setEquityList(equity_list)
                setRawData(sendData)

            }
        }
    }

    // Format data for DataTable
    const dataTable = useMemo(() => {
        if (!rawData || rawData.length === 0) return { columns: [], rows: [] };

        const isMultiYear = reportType.report_type === 'years';

        if (isMultiYear) {
            // Columns for Description + 5 Years
            const columns = [
                { label: 'Description', field: 'description' },
                ...last_five_years.map((year, i) => ({ label: year.toString(), field: `year_${i}` }))
            ];

            let rows = [];

            // Helper to build rows for a section (e.g. Assets)
            const addSection = (sectionTitle, sectionIndexInRaw) => {
                // Section Header
                rows.push({
                    description: <b>{sectionTitle.toUpperCase()}</b>,
                    ...Object.fromEntries(last_five_years.map((_, i) => [`year_${i}`, '']))
                });

                // Items
                // rawData is array of arrays [year0Data, year1Data...]
                // year0Data is array of sections [{title:'Assets', items:[]}, ...]
                // We assume all years have same items structure
                const firstYearSection = rawData[0][sectionIndexInRaw]; // {title: 'Assets', items: [...], total: ...}

                if (firstYearSection && firstYearSection.items) {
                    firstYearSection.items.forEach((item, itemIdx) => {
                        const row = {
                            description: item.title,
                        };
                        // Fill value from each year
                        rawData.forEach((yearData, yearIdx) => {
                            const yearSection = yearData[sectionIndexInRaw];
                            const yearItem = yearSection.items[itemIdx];
                            row[`year_${yearIdx}`] = currencyConverter(yearItem ? yearItem.amount : 0);
                        });
                        rows.push(row);
                    });
                }

                // Section Total
                const totalRow = {
                    description: <b>TOTAL</b>,
                };
                rawData.forEach((yearData, yearIdx) => {
                    const yearSection = yearData[sectionIndexInRaw];
                    totalRow[`year_${yearIdx}`] = <b>{currencyConverter(yearSection ? yearSection.total : 0)}</b>;
                });
                rows.push(totalRow);
            };

            addSection('ASSETS', 0);
            addSection('LIABILITIES', 1);
            addSection('EQUITY', 2);

            // Grand Total (Liability + Equity)
            const grandTotalRow = {
                description: <b>TOTAL LIABILITY + EQUITY</b>
            };
            rawData.forEach((yearData, yearIdx) => {
                const liabilityTotal = yearData[1].total;
                const equityTotal = yearData[2].total;
                grandTotalRow[`year_${yearIdx}`] = <b>{currencyConverter(liabilityTotal + equityTotal)}</b>;
            });
            rows.push(grandTotalRow);

            return { columns, rows };
        } else {
            // Single view (Financial Year or Date Range)
            const columns = [
                { label: 'Description', field: 'description' },
                { label: 'Amount', field: 'amount' }
            ];

            let rows = [];

            const addSection = (sectionTitle, sectionData) => {
                // Section Header
                rows.push({ description: <b>{sectionTitle.toUpperCase()}</b>, amount: '' });

                // Items
                if (sectionData.items) {
                    sectionData.items.forEach(item => {
                        rows.push({
                            description: item.title,
                            amount: currencyConverter(item.amount)
                        });
                    });
                }

                // Total
                rows.push({
                    description: <b>TOTAL</b>,
                    amount: <b>{currencyConverter(sectionData.total)}</b>
                });
            };

            if (rawData.length === 3) {
                addSection('ASSETS', rawData[0]);
                addSection('LIABILITIES', rawData[1]);
                addSection('EQUITY', rawData[2]);

                // Grand Total
                rows.push({
                    description: <b>TOTAL LIABILITY + EQUITY</b>,
                    amount: <b>{currencyConverter(rawData[1].total + rawData[2].total)}</b>
                });
            }

            return { columns, rows };
        }
    }, [rawData, reportType.report_type, last_five_years]);


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
                        <PageHeader title={"BALANCE SHEET REPORT"} items={["Human-Resources", "Finance & Budget", "Report (Balance Sheet)"]} />

                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label htmlFor="report_type">Select Report Type</label>
                                <SearchSelect
                                    id="report_type"
                                    value={reportType.report_type ? {
                                        value: reportType.report_type,
                                        label: reportType.report_type === 'financial_year' ? 'Report By Financial Year' :
                                            reportType.report_type === 'date' ? 'Report By Transaction Date' :
                                                reportType.report_type === 'years' ? 'Report By Last Five Years' : reportType.report_type
                                    } : null}
                                    onChange={handleSelectChange('report_type')}
                                    options={[
                                        { value: 'financial_year', label: 'Report By Financial Year' },
                                        { value: 'date', label: 'Report By Transaction Date' },
                                        { value: 'years', label: 'Report By Last Five Years' }
                                    ]}
                                    placeholder="Select Option"
                                />
                            </div>
                            {
                                reportType.report_type === 'financial_year' &&
                                <div className="col-md-8 mb-3">
                                    <label htmlFor="year_id">Select Financial Year</label>
                                    <SearchSelect
                                        id="year_id"
                                        value={reportType.year_id ? {
                                            value: reportType.year_id,
                                            label: yearList.find(r => r.EntryID === parseInt(reportType.year_id)) ?
                                                `${formatDateAndTime(yearList.find(r => r.EntryID === parseInt(reportType.year_id)).StartDate, 'date')} to ${formatDateAndTime(yearList.find(r => r.EntryID === parseInt(reportType.year_id)).EndDate, 'date')}`
                                                : 'Selected Year'
                                        } : null}
                                        onChange={handleSelectChange('year_id')}
                                        options={yearList.map(r => ({
                                            value: r.EntryID,
                                            label: `${formatDateAndTime(r.StartDate, 'date')} to ${formatDateAndTime(r.EndDate, 'date')}`
                                        }))}
                                        placeholder="Select Option"
                                    />
                                </div>
                            }
                            {
                                reportType.report_type === 'date' &&
                                <>
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="start_date">Report Start Date</label>
                                        <input type="date" id="start_date" className="form-control" value={reportType.start_date} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="end_date">Report End Date</label>
                                        <input type="date" id="end_date" className="form-control" disabled={reportType.start_date === ''} min={reportType.start_date} value={reportType.end_date} onChange={handleChange} />
                                    </div>
                                </>
                            }
                        </div>

                        {
                            rawData.length > 0 &&
                            <div className="row" style={{ width: '100%' }}>
                                <h2>{reportTitle}</h2>
                                <div className="col-md-12">
                                    <DataTable
                                        data={dataTable}
                                        paging={false}
                                    />
                                </div>
                            </div>
                        }
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
export default connect(mapStateToProps, null)(FinanceReportBalanceSheet);
