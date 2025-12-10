import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import {toast} from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import Modal from "../../common/modal/modal";
import {currencyConverter, formatDate, formatDateAndTime} from "../../../resources/constants";

function FinanceReportAccountReceivableAging(props) {
    const token = props.LoginDetails[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Name", "Current", "1-30 Days", "31-60 Days", "61-90 Days", "Over 90 Days", "Total Due"];
    const [dataTable, setDataTable] = useState([]);
    const [dataTable2, setDataTable2] = useState([]);
    const [reportType, setReportType] = useState('Vendor')
    const [yearList, setYearList] = useState([])
    const [transactionList, setTransactionList] = useState([]);

    const getData = async () => {
        await axios.get(`${serverLink}staff/finance/inventory/accounts-receivable-aging-report`, token)
            .then((result) => {
                if (result.data.message === 'success') {
                    if (result.data.Request.length > 0) {
                        //Vendor
                        populate_vendor(result)

                        //Manufacturer
                        populate_manufacturer(result)
                    }else{
                        setDataTable([])
                        setDataTable2([])
                    }
                }
                setIsLoading(false);
            })
            .catch((err) => {
                toast.error("NETWORK ERROR")
            });
    }

    const populate_vendor = (result) => {
        let rows = [];
        let current_column_total = 0; let one_thirty_column_total = 0; let thirty_sixty_column_total = 0; let sixty_ninety_column_total = 0; let over_ninety_column_total = 0; let total_due_column_total = 0;
        result.data.Vendor.map((item, index) => {
            let current = 0; let one_thirty = 0; let thirty_sixty = 0; let sixty_ninety = 0; let over_ninety = 0; let total_due = 0;
            result.data.Request.filter(e=> e.request_type === "Vendor" && e.requested_from === item.vendor_id).map((x, i) => {
                let startDate = new Date(formatDate(x.inserted_date));
                let endDate = new Date(Date.now());
                let timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
                let daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                if (daysDiff <= 1) {
                    current += x.balance;
                } else if (daysDiff <= 30) {
                    one_thirty += x.balance;
                } else if (daysDiff <= 60) {
                    thirty_sixty += x.balance;
                } else if (daysDiff <= 90) {
                    sixty_ninety += x.balance;
                } else {
                    over_ninety += x.balance;
                }

                //Total Due
                total_due = current + one_thirty + thirty_sixty + sixty_ninety + over_ninety;
            })
            if (total_due < 0) {
                rows.push([
                    index + 1,
                    item.vendor_name,
                    currencyConverter(current),
                    currencyConverter(one_thirty),
                    currencyConverter(thirty_sixty),
                    currencyConverter(sixty_ninety),
                    currencyConverter(over_ninety),
                    currencyConverter(total_due),
                ])
                current_column_total += current;
                one_thirty_column_total += one_thirty;
                thirty_sixty_column_total += thirty_sixty;
                sixty_ninety_column_total += sixty_ninety;
                over_ninety_column_total += over_ninety;
                total_due_column_total += total_due;
            }
        })
        if (total_due_column_total < 0) {
            rows.push([
                "--",
                "Total",
                currencyConverter(current_column_total),
                currencyConverter(one_thirty_column_total),
                currencyConverter(thirty_sixty_column_total),
                currencyConverter(sixty_ninety_column_total),
                currencyConverter(over_ninety_column_total),
                currencyConverter(total_due_column_total),
            ])
        }
        setDataTable(rows)
    }

    const populate_manufacturer = (result) => {
        let rows2 = [];
        let current_column_total2 = 0; let one_thirty_column_total2 = 0; let thirty_sixty_column_total2 = 0; let sixty_ninety_column_total2 = 0; let over_ninety_column_total2 = 0; let total_due_column_total2 = 0;
        result.data.Manufacturer.map((item, index) => {
            let current = 0;
            let one_thirty = 0;
            let thirty_sixty = 0;
            let sixty_ninety = 0;
            let over_ninety = 0;
            let total_due = 0;
            result.data.Request.filter(e => e.request_type === "Manufacturer" && e.requested_from === item.manufacturer_id).map((x, i) => {
                let startDate = new Date(formatDate(x.inserted_date));
                let endDate = new Date(Date.now());
                let timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
                let daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                if (daysDiff <= 1) {
                    current += x.balance;
                } else if (daysDiff <= 30) {
                    one_thirty += x.balance;
                } else if (daysDiff <= 60) {
                    thirty_sixty += x.balance;
                } else if (daysDiff <= 90) {
                    sixty_ninety += x.balance;
                } else {
                    over_ninety += x.balance;
                }

                //Total Due
                total_due = current + one_thirty + thirty_sixty + sixty_ninety + over_ninety;
            })
            if (total_due < 0) {
                rows2.push([
                    index + 1,
                    item.manufacturer_name,
                    currencyConverter(current),
                    currencyConverter(one_thirty),
                    currencyConverter(thirty_sixty),
                    currencyConverter(sixty_ninety),
                    currencyConverter(over_ninety),
                    currencyConverter(total_due),
                ])
                current_column_total2 += current;
                one_thirty_column_total2 += one_thirty;
                thirty_sixty_column_total2 += thirty_sixty;
                sixty_ninety_column_total2 += sixty_ninety;
                over_ninety_column_total2 += over_ninety;
                total_due_column_total2 += total_due;
            }
        })
        if (total_due_column_total2 < 0) {
            rows2.push([
                "--",
                "Total",
                currencyConverter(current_column_total2),
                currencyConverter(one_thirty_column_total2),
                currencyConverter(thirty_sixty_column_total2),
                currencyConverter(sixty_ninety_column_total2),
                currencyConverter(over_ninety_column_total2),
                currencyConverter(total_due_column_total2),
            ])
        }
        setDataTable2(rows2)
    }

    useEffect(() => {
        getData()
    }, []);

    const handleChange = (e) => {
        const id = e.target.id;
        const value = e.target.value;
        if (id === 'report_type')
            setReportType(value)
    }

    return isLoading ? (
            <Loader />
        ) :
        (
            <>
                <div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width:'100%' }}>
                    <div className="">
                        <PageHeader title={"ACCOUNT RECEIVABLE AGING REPORT"} items={["Human-Resources", "Finance & Budget", "Account Receivable Aging Report"]}/>
                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label htmlFor="report_type">Select Report Type</label>
                                <select id="report_type" value={reportType} className="form-control" onChange={handleChange}>
                                    <option value="">Select Option</option>
                                    <option value="Vendor">Vendor</option>
                                    <option value="Manufacturer">Manufacturer</option>
                                </select>
                            </div>
                        </div>
                        <div className="row col-md-12" style={{width:'100%'}}>
                            {
                                reportType === "Vendor" ?
                                    <ReportTable
                                        title={`Account Receivable Aging Report (Vendor)`}
                                        columns={columns}
                                        data={dataTable}
                                        height={"600px"}
                                    />
                                    :
                                    reportType === "Manufacturer" ?
                                        <ReportTable
                                            title={`Account Receivable Aging Report (Manufacturer)`}
                                            columns={columns}
                                            data={dataTable2}
                                            height={"600px"}
                                        />
                                        :
                                        <ReportTable
                                            title={`Account Receivable Aging Report`}
                                            columns={columns}
                                            data={[]}
                                            height={"600px"}
                                        />
                            }
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
export default connect(mapStateToProps, null)(FinanceReportAccountReceivableAging);
