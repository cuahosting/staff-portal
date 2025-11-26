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
import { useRef } from 'react';
import { createRoutesFromElements } from 'react-router';
import { useReactToPrint } from 'react-to-print';
import CourseForm from "../../academic/course/courseform";
import Modal from "../../common/modal/modal";
import PaySlipPrint from "./pay-slip-print";

function PaySlip(props) {
    const token = props.LoginDetails[0].token;
    const componentRef = useRef();

    const [isLoading, setIsLoading] = useState(true);
    const header = ["S/N", "STAFF ID", "STAFF NAME", "DESIGNATION", "SALARY DATE", "ACTIONS"];
    const [data, setData] = useState([])
    const [reportData, setReportData] = useState([])
    const [semesterList, setSemesterList] = useState([]);
    const [salaryDetails, setSalaryDetails] = useState([])
    const [salaryDetails2, setSalaryDetails2] = useState([])
    const [employeeID, setEmployeeID] = useState([])
    const [salaryMonths, setSalaryMonths] = useState([])
    const [tableData, setTableData] = useState([]);
    const [printPaySlip, setprintPaySlip] = useState(false)
    const detailsColumns = ["S/N", "ITEM", "TYPE", "AMOUNT", "DATE"]

    const [formData, setFormData] = useState({
        month_id: "",
        inserted_by: props.LoginDetails[0]?.StaffID,
    })

    const getData = async () => {

        await axios.get(`${serverLink}staff/human-resources/finance-report/report/salary-months`, token).then((res) => {
            setSalaryMonths(res.data)
            setIsLoading(false)
        }).catch((e) => {
            toast.error(e.response.data)
        })

    }
    const [fetechingRecord, setFetchingRecord] = useState(null)


    const getSalaryReport = async (salary_month) => {

        if (salary_month === "") {
            setTableData([])
        } else {
            setIsLoading(true)
            await axios.get(`${serverLink}staff/human-resources/finance-report/report/salary/summary?salary_month=${salary_month}`, token)
                .then((res) => {
                    if (res.data.length > 0) {
                        let rows = [];
                        let row2 = [];
                        let ft;
                        res.data.map((x, i) => {
                            row2.push(x.employee_id)
                            rows.push({
                                SN: x.i + 1,
                                employee_id: x.employee_id,
                                employee_name: x.employee_name,
                                designation: x.designation,
                                salary_date: formatDateAndTime(x.salary_date, "month_and_year"),
                                action: <div className='d-flex'>
                                    < button
                                        className='btn  btn-primary m-lg-2'  data-bs-toggle="modal" data-bs-target="#standard-modal"
                                        onClick={async () => {
                                            setSalaryDetails([])
                                            // onOpenModal(true)
                                            setFetchingRecord(x.employee_id)
                                            setFormData({
                                                employee_id: x.employee_id,
                                                employee_name: x.employee_name,
                                                salary_date: x.salary_date,
                                                total_pay: x.total_pay,
                                                run_date: x.inserted_date

                                            })
                                            await axios.get(`${serverLink}staff/human-resources/finance-report/report/salary/details/${x.employee_id}/${x.salary_date}`, token).then((results) => {
                                                if (results.data.length > 0) {

                                                    let det_rows = []
                                                    setSalaryDetails2(results.data)
                                                    results.data.map((det, index) => {
                                                        det_rows.push([
                                                            index + 1,
                                                            det.item_name,
                                                            <span
                                                                className={det.salary_type === "Allowance" ? "text-success" : "text-danger"}>
                                                            {det.salary_type}
                                                        </span>,
                                                            <span
                                                                className={det.salary_type === "Allowance" ? "text-success" : "text-danger"}>
                                                            {currencyConverter(det.amount)}
                                                        </span>,
                                                            formatDateAndTime(det.salary_date, "month_and_year")
                                                        ])
                                                    })
                                                    setSalaryDetails(det_rows)
                                                } else {
                                                    setSalaryDetails([])
                                                }
                                                setFetchingRecord(null)
                                            })
                                        }}
                                    >

                                        <i className='fa fa-eye'/>
                                        &nbsp; {fetechingRecord !== null ? "loading" : "Print Split"}
                                    </button>

                                </div>
                            })
                        })
                        setEmployeeID(row2)
                        setTableData(rows)
                    }
                    setIsLoading(false)
                }).catch((e) => {
                    setIsLoading(false)
                    toast.error("error getting allowances")
                })
        }
    }

    useEffect(() => {
        getData();
    }, [])


    const  showTable = () => {
        try {
            return tableData.map((item, index) => {
                return (
                    <tr key={index}>
                        <td className="text-xs font-weight-bold">{index +1}</td>
                        <td className="text-xs font-weight-bold">{item.employee_id}</td>
                        <td className="text-xs font-weight-bold">{item.employee_name}</td>
                        <td className="text-xs font-weight-bold">{item.designation}</td>
                        <td className="text-xs font-weight-bold">{item.salary_date}</td>
                        <td className="text-xs font-weight-bold">{item.action}</td>
                    </tr>
                );
            });
        } catch (e) {
            alert(e.message);
        }
    };


    const onChange = (e) => {
        const val = e.target.value;
        setFormData({
            ...formData,
            [e.target.id]: val,
        })

        getSalaryReport(val)
    }

    const onPrintPaySlip = () => {
        setprintPaySlip(true);
        setTimeout(() => {
            handlePrint();
            setprintPaySlip(false);
        }, 100);
    }

    // const handlePrint = useReactToPrint({
    //     content: () => componentRef.current,
    // });


    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=800,height=600');

        const htmlContent = `
      <html>
        <head>
          <title>Pay Slip</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        
          <style>
            /* Add any custom styles here if needed */
            body { font-family: Arial, sans-serif; padding: 20px; }
          </style>
        </head>
        <body>
          <div id="print-content"></div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        setTimeout(() => {
            // Render the React component into the new window
            const printRoot = printWindow.document.getElementById('print-content');
            if (printRoot) {
                // You can use ReactDOM to render here
                import("react-dom/client").then(({ createRoot }) => {
                    const root = createRoot(printRoot);
                    root.render(<PaySlipPrint data={{ salary: salaryDetails2, ...formData }} />);
                });
            }
        }, 100);
    };



    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Salary PaySlip Report"}
                items={["Human Resources", "Salary Report", "Salary PaySlip Report"]}
            />
            <div className="col-md-12">
                <div className="col-md-12 pb-3">
                    <div className="form-group">
                        <label htmlFor="month_id">Select Salary Month</label>
                        <select className='form-control' id="month_id" onChange={onChange}
                                value={formData.month_id} required>
                            <option value={""}> -select month-</option>
                            {
                                salaryMonths.length > 0 &&
                                salaryMonths.map((x, i) => {
                                    return (
                                        <option value={x.SalaryDate}
                                                key={i}> {formatDateAndTime(x.SalaryDate, "month_and_year")} </option>
                                    )
                                })
                            }
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex-column-fluid mb-2">
                <div className="row">
                    {
                        <div className="mt-4">
                            {tableData.length > 0 &&
                                <div className="table-responsive">
                                    <DataTable header={header} body={showTable()} title="PaySlip Report"/>
                                </div>
                            }
                        </div>
                    }
                </div>
            </div>
            <Modal id="standard-modal"  isLarge title={`SALARY DETAILS FOR ` + formatDateAndTime(formData?.salary_date, "month_and_year") + " | " + formData?.employee_name}>
                {
                    salaryDetails.length > 0 ?
                        <div>
                            {/* <ReportTable
                                data={salaryDetails}
                                columns={detailsColumns}
                            /> */}

                            <div className='table-responsive'>
                                <table className='table table-striped'>
                                    <thead>
                                    <tr>
                                        <td>SN</td>
                                        <td>ITEM</td>
                                        <td>CATEGORY</td>
                                        <td>AMOUNT</td>
                                        <td>DATE</td>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        salaryDetails2.length > 0 &&
                                        salaryDetails2.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.ItemName}</td>
                                                    <td>
                                                            <span className={item.SalaryType === "Allowance" ? "text-success" : "text-danger"}>
                                                                {item.SalaryType}
                                                            </span>
                                                    </td>
                                                    <td>
                                                            <span className={item.SalaryType === "Allowance" ? "text-success" : "text-danger"}>
                                                                {currencyConverter(item.Amount)}
                                                            </span>
                                                    </td>
                                                    <td>{formatDateAndTime(item.SalaryDate, "month_and_year")}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </table>
                            </div>

                            <div className='mt-5 pt-5 text-center fw-bolder h-100'>
                                {/*<h1>*/}
                                {/*    TOTAL : {currencyConverter(formData?.total_pay)}*/}
                                {/*</h1>*/}
                                <div>
                                    <button
                                        className='btn btn-md btn-primary'
                                        onClick={onPrintPaySlip} >
                                        + Print Pay Slip
                                    </button>
                                </div>
                            </div>
                        </div>
                        :
                        <Loader />
                }

            </Modal>

            {
                printPaySlip &&
                <PaySlipPrint
                    data={{ salary: salaryDetails2, ...formData }}
                    componentRef={componentRef}
                />
            }
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        FacultyList: state.FacultyList
    };
};
export default connect(mapStateToProps, null)(PaySlip);
