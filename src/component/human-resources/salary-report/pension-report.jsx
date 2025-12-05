import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { serverLink } from "../../../resources/url";
import axios from "axios";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import {currencyConverter, moneyFormat} from "../../../resources/constants";
import { toast } from "react-toastify";
import AGTable from "../../common/table/AGTable";

function PensionScheduleReport(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Staff ID", field: "staffId" },
            { label: "First Name", field: "firstName" },
            { label: "MiddleName", field: "middleName" },
            { label: "Surname", field: "surname" },
            { label: "PFA", field: "pfa" },
            { label: "RSA PIN", field: "rsaPin" },
            { label: "Employee Contribution (₦)", field: "employeeContribution" },
            { label: "Employer Contribution (₦)", field: "employerContribution" },
            { label: "Total Contribution Payable (₦)", field: "totalContribution" },
        ],
        rows: [],
    });

    const [formData, setFormData] = useState({
        month_id: "",
        inserted_by: props.LoginDetails[0]?.StaffID,
    })

    const getTotal = () => {
        let total_amount = 0;
        reportData.filter(e => e.employee_contribution > 0).forEach((item) => {
            total_amount += item.total_pension_contribution;
        });
        return total_amount;
    }

    const buildTableData = (data) => {
        let rows = [];
        let total = 0;
        let employee = 0;
        let employer = 0;

        data.filter(e => e.employee_contribution > 0).forEach((item, index) => {
            total += item.total_pension_contribution;
            employee += item.employee_contribution;
            employer += item.employer_contribution;
            rows.push({
                sn: index + 1,
                staffId: item.StaffID ?? "N/A",
                firstName: item.FirstName ?? "N/A",
                middleName: item.MiddleName ?? "N/A",
                surname: item.Surname ?? "N/A",
                pfa: item.PensionName ?? "N/A",
                rsaPin: item.RSAPin ?? "N/A",
                employeeContribution: moneyFormat(item.employee_contribution),
                employerContribution: moneyFormat(item.employer_contribution),
                totalContribution: moneyFormat(item.total_pension_contribution),
            });
        });

        // Add total row
        if (rows.length > 0) {
            rows.push({
                sn: "",
                staffId: "",
                firstName: "",
                middleName: "",
                surname: "",
                pfa: "",
                rsaPin: "Total",
                employeeContribution: moneyFormat(employee),
                employerContribution: moneyFormat(employer),
                totalContribution: moneyFormat(total),
            });
        }

        setDatatable(prev => ({
            ...prev,
            rows: rows,
        }));
    };

    const getSalaryReport = async (salary_month) => {
        if (salary_month === "") {
            setDatatable(prev => ({ ...prev, rows: [] }));
        } else {
            setIsLoading(true)
            await axios.get(`${serverLink}staff/human-resources/finance-report/payroll/schedule?salary_month=${salary_month}`, token)
                .then((res) => {
                    console.log(res.data)
                    if (res.data.length > 0) {
                        setReportData(res.data)
                        buildTableData(res.data);
                    } else {
                        setReportData([]);
                        setDatatable(prev => ({ ...prev, rows: [] }));
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
                            {datatable.rows.length > 0 &&
                                <div className="card card-no-border">
                                    <div className="card-body p-0">
                                        <AGTable data={datatable} />
                                    </div>
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
