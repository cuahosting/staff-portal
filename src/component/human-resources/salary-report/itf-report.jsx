import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { serverLink } from "../../../resources/url";
import axios from "axios";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import {
    currencyConverter,
    formatDate,
    formatDateAndTime,
    moneyFormat,
    TimeTablePeriods
} from "../../../resources/constants";
import { toast } from "react-toastify";
import DataTable from "../../common/data-table/data-table";

function ITFReport(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const header = ["S/N", "Staff ID", "Staff Name", "Date of Birth", "Gender", "Monthly Earnings (₦)", "ITF Amount", "Remarks"];
    const [data, setData] = useState([])
    const [reportData, setReportData] = useState([])
    const [semesterList, setSemesterList] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);

    const [formData, setFormData] = useState({
        month_id: "",
        inserted_by: props.LoginDetails[0]?.StaffID,
    })

    const  getTotal = () => {
        let total_amount = 0;
        reportData.filter(e => e.NetPay > 0).map((item, index) => {
            total_amount += (1/100) * item.NetPay;
        });
        return total_amount;
    }

    const  showTable = () => {
        try {
            let total  = 0;
            let itf = 0;
            const row =  reportData.filter(e => e.NetPay > 0).map((item, index) => {
                total += item.NetPay;
                itf += (1/100) * item.NetPay;
                return (
                    <tr key={index}>
                        <td className="text-xs font-weight-bold">{index +1}</td>
                        <td className="text-xs font-weight-bold">{item.StaffID}</td>
                        <td className="text-xs font-weight-bold">{item.FirstName} {item.MiddleName} {item.Surname}</td>
                        <td className="text-xs font-weight-bold">{formatDateAndTime(item.DateOfBirth, 'date')}</td>
                        <td className="text-xs font-weight-bold">{item.Gender}</td>
                        <td className="text-xs font-weight-bold">{moneyFormat(item.NetPay)}</td>
                        <td className="text-xs font-weight-bold">{moneyFormat((1/100) * item.NetPay)}</td>
                        <td className="text-xs font-weight-bold">{' '}</td>
                    </tr>
                );
            });

            return (
                <>
                    {row}
                    {
                        row.length > 0 ?
                            <tr>
                                <td className="text-xs font-weight-bold">999999</td>
                                <td className="text-xs font-weight-bold"></td>
                                <td className="text-xs font-weight-bold"></td>
                                <td className="text-xs font-weight-bold"></td>
                                <td className="text-xs font-weight-bold"><h3>Total</h3></td>
                                <td className="text-xs font-weight-bold"><b>{moneyFormat(total)}</b></td>
                                <td className="text-xs font-weight-bold"><b>{moneyFormat(itf)}</b></td>
                                <td className="text-xs font-weight-bold"></td>
                            </tr>
                            : <></>
                    }
                </>
            )
        } catch (e) {
            alert(e.message);
        }
    };

    const getSalaryReport = async (salary_month) => {

        if (salary_month === "") {

        } else {
            setIsLoading(true)
            await axios.get(`${serverLink}staff/human-resources/finance-report/payroll/schedule?salary_month=${salary_month}`, token)
                .then((res) => {
                    if (res.data.length > 0) {
                        setReportData(res.data)
                    }
                    setIsLoading(false)
                }).catch((e) => {
                    setIsLoading(false)
                    toast.error("error getting allowances")
                })
        }
    }

    const onChange = (e) => {
        const val = e.target.value;
        setFormData({
            ...formData,
            [e.target.id]: val,
        })

        getSalaryReport(val)
    }

    useEffect(() => {
        setTimeout(()=>{
            setIsLoading(false)
        }, 2000);
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"ITF Schedule Report"}
                items={["Human Resources", "Salary Report", "ITF Schedule Report "]}
            />
            <div className="col-md-12">
                <div className="col-md-12 pb-3">
                    <div className="form-group">
                        <label htmlFor="month_id">Select Salary Month</label>
                        <input type="month" id="month_id"
                               className="form-control"
                               value={formData.month_id}
                               onChange={onChange}
                               max={`${new Date().getFullYear()}-${new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1}`}
                               required/>
                    </div>
                </div>
            </div>
            <div className="flex-column-fluid mb-2">
                <div className="row">
                    {
                        reportData.length > 0 ? <div className="text-end"><h4><b>{`TOTAL AMOUNT: ${currencyConverter(getTotal() ?? 0)}`}</b></h4></div> : <></>
                    }
                    {
                        <div className="mt-4">
                            {reportData.length > 0 &&
                                <div className="table-responsive">
                                    <DataTable header={header} body={showTable()} title="ITF Schedule Report"/>
                                </div>
                            }
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        FacultyList: state.FacultyList
    };
};
export default connect(mapStateToProps, null)(ITFReport);
