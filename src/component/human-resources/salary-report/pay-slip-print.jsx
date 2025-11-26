import React from 'react'
import Logo from "../../../images/logo.png"
import { projectAddress, projectName } from '../../../resources/constants';
import { currencyConverter, currentDate, formatDateAndTime, generate_token } from '../../../resources/constants';


export default function PaySlipPrint(props) {
    // const gross_pay = props.data?.salary?.filter(x => x.item_name === "Gross Pay")?.map(e => parseFloat(e.amount)).reduce((a, b) => a + b, 0)
    const gross_pay = props.data?.salary?.filter(x => x.SalaryType === "Allowance")?.map(e => parseFloat(e.Amount)).reduce((a, b) => a + b, 0)
    // const net_pay = props.data?.salary?.filter(x => x.item_name === "Net Pay")?.map(e => parseFloat(e.amount)).reduce((a, b) => a + b, 0)
    // const sum_deductions = props.data?.salary?.filter(x => x.item_name === "Total Deduction")?.map(e => parseFloat(e.amount)).reduce((a, b) => a + b, 0)
    const sum_deductions = props.data?.salary?.filter(x => x.SalaryType === "Deduction")?.map(e => parseFloat(e.Amount)).reduce((a, b) => a + b, 0)
    const net_pay = gross_pay - sum_deductions;
    const styles = {
        bg_text: {
            margin: "3rem",
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: -1,
            transform: "rotate(300deg)",
            color: "#c6afaf",
            WebkitTransform: "rotate(300deg)"
        }
    }

    const logoStyle = {
        width: "100%",
        // height: "110px",
        marginBottom: "20px", // Adjusted margin for logo
    };


    return (
        <div ref={props.componentRef} className="container-fluid">
            <div className="card" >
                <div className="card-body p-lg-20">
                    <div className="d-flex flex-column flex-xl-row">
                        <div className="flex-lg-row-fluid me-xl-18 mb-10 mb-xl-0">
                            <div style={styles.bg_text}>
                                {projectName}
                            </div>
                            <div className="mt-n1">
                                <img
                                    src={require('../../../images/banner2.png')}
                                    alt="Logo"
                                    style={logoStyle}
                                />
                                {/*<div className="d-flex flex-stack pb-10">*/}
                                {/*    <a href="#" className='d-flex'>*/}
                                {/*        <div style={{ float: "left" }}>*/}
                                {/*            <img alt="Logo" src={Logo} className="img-thumbnail" width={"150px"} height="150px" />*/}
                                {/*        </div>*/}
                                {/*        <div style={{ fontSize: "30px", textAlign: "left", marginLeft: '15px' }} className="text-gray-800" >*/}

                                {/*            <strong>{projectName}</strong>*/}
                                {/*            <div className="fw-semibold fs-7 text-gray-600">*/}
                                {/*                {projectAddress}*/}
                                {/*            </div>*/}
                                {/*        </div>*/}
                                {/*    </a>*/}
                                {/*</div>*/}
                                <div className="m-0">
                                    <div className='d-flex justify-content-between'>
                                        <div className="fw-bold fs-1 text-gray-600 mb-8">
                                            PaySlip <small> for {formatDateAndTime(props.data?.salary_date, "month_and_year")}</small>
                                        </div>
                                        <div className="fw-bold fs-3 text-gray-800 mb-8">Slip ID:
                                            #{props.data?.employee_id + generate_token(3)}</div>
                                    </div>
                                    <div className="row g-5 mb-5">
                                        <div className="col-sm-6">
                                            <div className="fw-semibold fs-7 text-gray-600 mb-1">Issue Date:</div>
                                            <div className="fw-bold fs-6 text-gray-800">
                                                {formatDateAndTime(currentDate, "date")}
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="fw-semibold fs-7 text-gray-600 mb-1">Processed Date:</div>
                                            <div
                                                className="fw-bold fs-6 text-gray-800 d-flex align-items-center flex-wrap">
                                                <span className="pe-2">
                                                    {
                                                        formatDateAndTime(props.data?.run_date, "date")
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="row g-5 mb-3">
                                        <div className="col-sm-6">
                                            <div className="fw-semibold fs-7 text-gray-600 mb-2">Staff Name: <span
                                                className="fw-bold fs-6 text-gray-800">{props.data?.employee_name}</span>
                                            </div>
                                            <div className="fw-semibold fs-7 text-gray-600 mb-2">Staff ID: <span
                                                className="fw-bold fs-6 text-gray-800">{props.data.salary[0]?.staff_id}</span>
                                            </div>
                                            <div className="fw-semibold fs-7 text-gray-600 mb-2">Designation: <span
                                                className="fw-bold fs-6 text-gray-800">{props.data.salary[0]?.designation}</span>
                                            </div>

                                            {/*<div className="fw-bold fs-4 text-gray-800">*/}
                                            {/*    {props.data?.employee_name}*/}
                                            {/*</div>*/}
                                            {/*<div className="fw-bold fs-4 text-gray-800">*/}
                                            {/*    Employee ID: {props.data.salary[0]?.staff_id}*/}
                                            {/*</div>*/}
                                        </div>

                                        <div className="col-sm-6">
                                            <div className="fw-semibold fs-7 text-gray-600 mb-1">Period:</div>
                                            <div
                                                className="fw-bold fs-6 text-gray-800 d-flex align-items-center flex-wrap">
                                                <span className="pe-2">
                                                    {
                                                        formatDateAndTime(props.data?.salary_date, "month_and_year")
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="table-responsive  mb-9">
                                        <table className="table table-row-dashed table-row-gray-300 mb-3">
                                            <thead>
                                            <tr className="fs-6 fw-bold text-muted">
                                                <th className="min-w-175px pb-2">Description</th>
                                                <th className="min-w-80px text-end pb-2">Allowances</th>
                                                <th className="min-w-100px text-end pb-2">Deductions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                props.data.salary.length > 0 &&
                                                props.data.salary.map((x, i) => {
                                                    return (
                                                        <tr className="fw-bold text-gray-700 fs-5 text-end" key={i}>
                                                            <td className="d-flex align-items-start">
                                                                <i className={`fa fa-genderless ${x.SalaryType === "Allowance" ? "text-success" : "text-danger"} fs-2 me-2`}/>
                                                                {x.ItemName}</td>
                                                            <td className="text-success">
                                                                {
                                                                    x.SalaryType === "Allowance" &&
                                                                    currencyConverter(x.Amount)
                                                                }
                                                            </td>
                                                            <td className="text-danger">
                                                                {
                                                                    x.SalaryType === "Deduction" &&
                                                                    currencyConverter(x.Amount)
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="d-flex justify-content-between">
                                        <div className="mw-300px">
                                            <div className="mb-5">
                                                {/*<div className="fw-semibold pe-10 text-gray-600 fs-7">________________________________</div>*/}
                                                {/*<div className="text-start fw-bold fs-6 text-gray-800">*/}
                                                {/*    SIGNATURE AND DATE*/}
                                                {/*</div>*/}
                                            </div>
                                        </div>
                                        <div className="mw-300px">
                                            <div className="d-flex flex-stack mb-3">
                                                <div className="fw-semibold pe-10 text-gray-600 ">GROSS PAY</div>
                                                <div className="text-end fw-bold fs-6 text-gray-800 text-success">
                                                     {currencyConverter(gross_pay)}
                                                </div>
                                            </div>

                                            <div className="d-flex flex-stack mb-3">
                                                <div className="fw-semibold pe-10 text-gray-600 ">DEDUCTIONS</div>
                                                <div className="text-end fw-bold  text-gray-800 text-danger">
                                                    {currencyConverter(sum_deductions)}
                                                </div>
                                            </div>

                                            <div className="d-flex flex-stack">
                                                <div className="fw-semibold pe-10 text-gray-600 "> NET PAY:</div>
                                                <div
                                                    className="text-end fw-bold fs-6 text-gray-800"> {currencyConverter(net_pay)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

    )
}