import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { serverLink } from "../../../resources/url";
import axios from "axios";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import {currencyConverter, formatDate, moneyFormat, TimeTablePeriods} from "../../../resources/constants";
import { toast } from "react-toastify";
import Select from "react-select";
import DataTable from "../../common/data-table/data-table";

function PensionScheduleReport(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const header = ["S/N", "Staff ID", "First Name", "MiddleName", "Surname", "PFA", "RSA PIN", "Employee Contribution (₦)", "Employer Contribution (₦)", "Total Contribution Payable (₦)"];
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
        reportData.filter(e => e.employee_contribution > 0).map((item, index) => {
            total_amount += item.total_pension_contribution;
        });
        return total_amount;
    }

    const  showTable = () => {
        try {
            let total  = 0;
            let employee = 0;
            let employer = 0;
            const row =  reportData.filter(e => e.employee_contribution > 0).map((item, index) => {
                total += item.total_pension_contribution;
                employee +=  item.employee_contribution;
                employer +=  item.employer_contribution;
                return (
                    <tr key={index}>
                        <td className="text-xs font-weight-bold">{index +1}</td>
                        <td className="text-xs font-weight-bold">{item.StaffID}</td>
                        <td className="text-xs font-weight-bold">{item.FirstName}</td>
                        <td className="text-xs font-weight-bold">{item.MiddleName}</td>
                        <td className="text-xs font-weight-bold">{item.Surname}</td>
                        <td className="text-xs font-weight-bold">{item.PensionName}</td>
                        <td className="text-xs font-weight-bold">{item.RSAPin}</td>
                        <td className="text-xs font-weight-bold">{moneyFormat(item.employee_contribution)}</td>
                        <td className="text-xs font-weight-bold">{moneyFormat(item.employer_contribution)}</td>
                        <td className="text-xs font-weight-bold">{moneyFormat(item.total_pension_contribution)}</td>
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
                                <td className="text-xs font-weight-bold"></td>
                                <td className="text-xs font-weight-bold"></td>
                                <td className="text-xs font-weight-bold"><h3>Total</h3></td>
                                <td className="text-xs font-weight-bold"><b>{moneyFormat(employee)}</b></td>
                                <td className="text-xs font-weight-bold"><b>{moneyFormat(employer)}</b></td>
                                <td className="text-xs font-weight-bold"><b>{moneyFormat(total)}</b></td>
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
                    console.log(res.data)
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
                title={"Pension Schedule Report"}
                items={["Human Resources", "Salary Report", "Pension Schedule Report "]}
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
                                    <DataTable header={header} body={showTable()} title="Pension Schedule Report"/>
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
export default connect(mapStateToProps, null)(PensionScheduleReport);
