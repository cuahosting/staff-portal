import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { moneyFormat, formatDateAndTime } from "../../../resources/constants";
import { toast } from "react-toastify";
import "./style.css"

const logoStyle = {
    width: "100%",
};

function SalarySummaryReport(props) {

    const [isLoading, setIsLoading] = useState(true);
    const [isShow, setIsShow] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [allowances, setAllowances] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [deductions, setDeductions] = useState([]);
    const [reportData, setReportData] = useState({
        PAYE: 0,
        Gross_Pay: 0,
        Net_Pay: 0,
        Basic: 0,
        Housing: 0,
        Transport: 0,
        Medical: 0,
        Fringe: 0,
        Wardrobe: 0,
        Pension: 0,
        staff_coporative: 0,
        NHF: 0,
        NHIS: 0,
        staff_salary_advance: 0,
        student_receivable: 0,
        other_income: 0,
        employee_contributions: 0,
        employer_contributions: 0,
        total_contributions: 0,
        staff_salary_payable: 0,
        dr_total: 0,
        cr_total: 0
    })
    const [formData, setFormData] = useState({
        month_id: "",
        inserted_by: props.LoginDetails[0]?.StaffID,
    })


    const getSalaryReport = async (salary_month) => {

        if (salary_month === "") {

        } else {
            setIsLoading(true)
            const { success, data } = await api.get(`staff/human-resources/finance-report/journal/voucher?salary_month=${salary_month}`);
            if (success) {
                console.log(data)
                setReportData(data)
                const allowanceItemTotals = data.allowance_list.reduce((acc, curr) => {
                    const itemName = curr.ItemName;
                    if (!acc[itemName]) {
                        acc[itemName] = { item_name: itemName, amount: 0 };
                    }
                    acc[itemName].Amount += curr.Amount;
                    return acc;
                }, {});
                const allowance_list = Object.values(allowanceItemTotals);

                const deductionItemTotals = data.deduction_list.reduce((acc, curr) => {
                    const itemName = curr.ItemName;
                    if (!acc[itemName]) {
                        acc[itemName] = { item_name: itemName, amount: 0 };
                    }
                    acc[itemName].Amount += curr.Amount;
                    return acc;
                }, {});
                const deduction_list = Object.values(deductionItemTotals);

                setAllowances(allowance_list)
                setDeductions(deduction_list)
                setIsShow(true)
            } else {
                console.log("Error fetching report")
                toast.error("error getting allowances")
            }
            setIsLoading(false)
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
        setTimeout(() => {
            setIsLoading(false)
        }, 2000);
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <>

            <div className="d-flex flex-column flex-row-fluid">
                <div className="printPageButton">
                    <PageHeader
                        title={"Salary Summary Report"}
                        items={["Human Resources", "Salary Report", "Salary Summary Report "]}
                    />
                </div>
                <div className="col-md-12" id="printPageButton">
                    <div className="col-md-12 pb-3">
                        <div className="form-group">
                            <label htmlFor="month_id">Select Salary Month</label>
                            <input type="month" id="month_id"
                                className="form-control"
                                value={formData.month_id}
                                onChange={onChange}
                                max={`${new Date().getFullYear()}-${new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1}`}
                                required />
                        </div>
                    </div>
                </div>
                <div className="flex-column-fluid mb-2">
                    <div className="row">
                        {
                            <div className="card">
                                <div className="card-body">
                                    {
                                        isShow ?
                                            <div className="col-md-12">
                                                <div className="mb-5  col-md-12">
                                                    <div className=" col-md-12">
                                                        <div className="m-0">
                                                            <img
                                                                src={require('../../../images/banner2.png')}
                                                                alt="Logo"
                                                                style={logoStyle}
                                                            />
                                                            <h3 className="text-center text-gray-800 text-uppercase">SALARY
                                                                SUMMARY FOR {formatDateAndTime(formData.month_id, 'month_and_year')}</h3>
                                                            <div
                                                                className="fw-bold  text-gray-600 mb-8 text-end">Date: {formatDateAndTime(formData.month_id, 'date')}</div>
                                                            <div className="flex-grow-1">
                                                                <div className="table-responsive border-bottom mb-9">
                                                                    <table
                                                                        className="table table-bordered table-striped mb-5"
                                                                        style={{
                                                                            border: '1px solid #cccccc',
                                                                            paddingLeft: '15px'
                                                                        }}>
                                                                        <thead>
                                                                            <tr style={{
                                                                                border: '1px solid #9c9897',
                                                                                backgroundColor: '#cccccc',
                                                                                textAlign: 'center'
                                                                            }}>
                                                                                <th colSpan={4}
                                                                                    style={{
                                                                                        padding: '12px',
                                                                                        fontSize: '18px'
                                                                                    }}>
                                                                                    <b>Payroll-Related Costs</b>
                                                                                </th>
                                                                            </tr>
                                                                            <tr style={{ border: '1px solid #9c9897' }}>
                                                                                <th style={{ padding: '12px' }} width={40}>
                                                                                    <b>S/N</b></th>
                                                                                <th style={{ padding: '12px' }}>
                                                                                    <b>Description</b>
                                                                                </th>
                                                                                <th><b>Allowance (N)</b></th>
                                                                                <th><b>Deduction (N)</b></th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr style={{ border: '1px solid #cccccc' }}>
                                                                                <th style={{ padding: '12px' }}>1</th>
                                                                                <td>PAYEE</td>
                                                                                <td></td>
                                                                                <td>{moneyFormat(reportData.PAYE)}</td>
                                                                            </tr>
                                                                            <tr style={{ border: '1px solid #cccccc' }}>
                                                                                <th style={{ padding: '12px' }}>2</th>
                                                                                <td>Basic Salary</td>
                                                                                <td>{moneyFormat(reportData.Basic)}</td>
                                                                                <td></td>
                                                                            </tr>
                                                                            <tr style={{ border: '1px solid #cccccc' }}>
                                                                                <th style={{ padding: '12px' }}>2</th>
                                                                                <td>Transport</td>
                                                                                <td>{moneyFormat(reportData.Transport)}</td>
                                                                                <td></td>
                                                                            </tr>
                                                                            <tr style={{ border: '1px solid #cccccc' }}>
                                                                                <th style={{ padding: '12px' }}>2</th>
                                                                                <td>Housing</td>
                                                                                <td>{moneyFormat(reportData.Housing)}</td>
                                                                                <td></td>
                                                                            </tr>
                                                                            <tr style={{ border: '1px solid #cccccc' }}>
                                                                                <th style={{ padding: '12px' }}>2</th>
                                                                                <td>Medical</td>
                                                                                <td>{moneyFormat(reportData.Medical)}</td>
                                                                                <td></td>
                                                                            </tr>
                                                                            <tr style={{ border: '1px solid #cccccc' }}>
                                                                                <th style={{ padding: '12px' }}>2</th>
                                                                                <td>Fringe</td>
                                                                                <td>{moneyFormat(reportData.Fringe)}</td>
                                                                                <td></td>
                                                                            </tr>
                                                                            <tr style={{ border: '1px solid #cccccc' }}>
                                                                                <th style={{ padding: '12px' }}>2</th>
                                                                                <td>Wardrobe</td>
                                                                                <td>{moneyFormat(reportData.Wardrobe)}</td>
                                                                                <td></td>
                                                                            </tr>
                                                                            <tr style={{ border: '1px solid #cccccc' }}>
                                                                                <th style={{ padding: '12px' }}>2</th>
                                                                                <td>Pension</td>
                                                                                <td></td>
                                                                                <td>{moneyFormat(reportData.Pension)}</td>
                                                                            </tr>
                                                                            <tr style={{ border: '1px solid #cccccc' }}>
                                                                                <th style={{ padding: '12px' }}>2</th>
                                                                                <td>Other Allowance</td>
                                                                                <td>{moneyFormat(reportData.non_standard_allowances)}</td>
                                                                                <td> </td>
                                                                            </tr>
                                                                            <tr style={{ border: '1px solid #cccccc' }}>
                                                                                <th style={{ padding: '12px' }}>2</th>
                                                                                <td>Other Deduction</td>
                                                                                <td></td>
                                                                                <td>{moneyFormat(reportData.other_deduction)}</td>
                                                                            </tr>
                                                                            <tr style={{ border: '1px solid #cccccc' }}>
                                                                                <th style={{ padding: '12px' }}>3</th>
                                                                                <td>NSITF Contribution</td>
                                                                                <td></td>
                                                                                <td>{moneyFormat(reportData.NSITF)}</td>
                                                                            </tr>
                                                                            <tr style={{ border: '1px solid #cccccc' }}>
                                                                                <th style={{ padding: '12px' }}>3</th>
                                                                                <td>ITF Contribution</td>
                                                                                <td></td>
                                                                                <td>{moneyFormat(reportData.ITF)}</td>
                                                                            </tr>
                                                                            <tr style={{ border: '1px solid #cccccc' }}>
                                                                                <th style={{ padding: '12px' }}>3</th>
                                                                                <td>NET PAY</td>
                                                                                <td></td>
                                                                                <td>{moneyFormat(reportData.Net_Pay)}</td>
                                                                            </tr>

                                                                            <tr style={{ border: '1px solid #cccccc' }}>
                                                                                <th></th>
                                                                                <td style={{
                                                                                    padding: '12px',
                                                                                    fontSize: '16px'
                                                                                }}>
                                                                                    <b>Total</b></td>
                                                                                <td>
                                                                                    <b>{moneyFormat(reportData.dr_total)}</b>
                                                                                </td>
                                                                                <td>
                                                                                    <b>{moneyFormat(reportData.Net_Pay + reportData.cr_total)}</b>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td colSpan={4}>&nbsp;</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                                <div className="col-md-3 offset-sm-5 d-print-none mt-3">
                                                                    <button className="form-control btn btn-primary" onClick={() => window.print()}> Print </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            :
                                            <div
                                                className="notice d-flex bg-light-primary rounded border-primary border border-dashed min-w-lg-600px flex-shrink-0 p-4">
                                                <span className="svg-icon svg-icon-2tx svg-icon-primary me-4">
                                                    <svg width="24" height="24" viewBox="0 0 24 24"
                                                        fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path opacity="0.3"
                                                            d="M19.0687 17.9688H11.0687C10.4687 17.9688 10.0687 18.3687 10.0687 18.9688V19.9688C10.0687 20.5687 10.4687 20.9688 11.0687 20.9688H19.0687C19.6687 20.9688 20.0687 20.5687 20.0687 19.9688V18.9688C20.0687 18.3687 19.6687 17.9688 19.0687 17.9688Z"
                                                            fill="currentColor"></path>
                                                        <path
                                                            d="M4.06875 17.9688C3.86875 17.9688 3.66874 17.8688 3.46874 17.7688C2.96874 17.4688 2.86875 16.8688 3.16875 16.3688L6.76874 10.9688L3.16875 5.56876C2.86875 5.06876 2.96874 4.46873 3.46874 4.16873C3.96874 3.86873 4.56875 3.96878 4.86875 4.46878L8.86875 10.4688C9.06875 10.7688 9.06875 11.2688 8.86875 11.5688L4.86875 17.5688C4.66875 17.7688 4.36875 17.9688 4.06875 17.9688Z"
                                                            fill="currentColor"></path>
                                                    </svg>
                                                </span>
                                                <div className="d-flex flex-stack flex-grow-1 flex-wrap flex-md-nowrap">
                                                    <div className="mb-3 mb-md-0 fw-semibold">
                                                        <h4 className="text-gray-900 fw-bold">Please select salary month
                                                            to
                                                            view report</h4>
                                                        {/*<div className="fs-6 text-gray-700 pe-7">Please select salary month to view report</div>*/}
                                                    </div>

                                                </div>
                                            </div>
                                    }

                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        FacultyList: state.FacultyList
    };
};
export default connect(mapStateToProps, null)(SalarySummaryReport);
