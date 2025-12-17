import React, { useEffect, useState, useRef, useMemo } from "react";
import { connect } from "react-redux/es/exports";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import {
    currencyConverter,
    formatDateAndTime,
} from "../../../resources/constants";
import { toast } from "react-toastify";
import AGTable from "../../common/table/AGTable";
import Modal from "../../common/modal/modal";
import PaySlipPrint from "./pay-slip-print";
import SearchSelect from "../../common/select/SearchSelect";

function PaySlip(props) {
    const componentRef = useRef();

    const [isLoading, setIsLoading] = useState(true);
    const [salaryDetails, setSalaryDetails] = useState([])
    const [salaryDetails2, setSalaryDetails2] = useState([])
    const [salaryMonths, setSalaryMonths] = useState([])
    const [printPaySlip, setprintPaySlip] = useState(false)
    const [fetechingRecord, setFetchingRecord] = useState(null)

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Action", field: "action" },
            { label: "STAFF ID", field: "staffId" },
            { label: "STAFF NAME", field: "staffName" },
            { label: "DESIGNATION", field: "designation" },
            { label: "SALARY DATE", field: "salaryDate" },
        ],
        rows: [],
    });

    const [formData, setFormData] = useState({
        month_id: "",
        inserted_by: props.LoginDetails[0]?.StaffID,
    })

    const getData = async () => {
        const { success, data, error } = await api.get("staff/human-resources/finance-report/report/salary-months");
        if (success) {
            setSalaryMonths(data);
        } else {
            toast.error(error || "Error fetching salary months");
        }
        setIsLoading(false);
    }

    // Options for SearchSelect
    const monthOptions = useMemo(() => {
        return salaryMonths.map(x => ({
            value: x.SalaryDate,
            label: formatDateAndTime(x.SalaryDate, "month_and_year")
        }));
    }, [salaryMonths]);

    const handleViewDetails = async (x) => {
        setSalaryDetails([])
        setFetchingRecord(x.employee_id)
        setFormData({
            employee_id: x.employee_id,
            employee_name: x.employee_name,
            salary_date: x.salary_date,
            total_pay: x.total_pay,
            run_date: x.inserted_date
        })
        const { success, data } = await api.get(`staff/human-resources/finance-report/report/salary/details/${x.employee_id}/${x.salary_date}`);
        if (success && data.length > 0) {
            let det_rows = []
            setSalaryDetails2(data)
            data.forEach((det, index) => {
                det_rows.push([
                    index + 1,
                    det.item_name,
                    <span className={det.salary_type === "Allowance" ? "text-success" : "text-danger"}>
                        {det.salary_type}
                    </span>,
                    <span className={det.salary_type === "Allowance" ? "text-success" : "text-danger"}>
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
    }

    const getSalaryReport = async (salary_month) => {
        if (salary_month === "") {
            setDatatable(prev => ({ ...prev, rows: [] }));
        } else {
            setIsLoading(true)
            const { success, data } = await api.get(`staff/human-resources/finance-report/report/salary/summary?salary_month=${salary_month}`);
            if (success && data.length > 0) {
                let rows = [];
                data.forEach((x, i) => {
                    rows.push({
                        sn: i + 1,
                        staffId: x.employee_id ?? "N/A",
                        staffName: x.employee_name ?? "N/A",
                        designation: x.designation ?? "N/A",
                        salaryDate: formatDateAndTime(x.salary_date, "month_and_year"),
                        action: (
                            <button
                                className='btn btn-link p-0 text-primary'
                                style={{ marginRight: 15 }}
                                title="View Details"
                                data-bs-toggle="modal"
                                data-bs-target="#standard-modal"
                                onClick={() => handleViewDetails(x)}
                            >
                                <i style={{ fontSize: '15px', color: "blue" }} className='fa fa-eye' />
                            </button>
                        )
                    })
                })
                setDatatable(prev => ({
                    ...prev,
                    rows: rows,
                }));
            } else {
                setDatatable(prev => ({ ...prev, rows: [] }));
            }
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
                        <SearchSelect
                            id="month_id"
                            value={monthOptions.find(opt => opt.value === formData.month_id) || null}
                            options={monthOptions}
                            onChange={(selected) => onChange({ target: { id: 'month_id', value: selected?.value || '' } })}
                            placeholder="-select month-"
                            isClearable={false}
                        />
                    </div>
                </div>
            </div>
            <div className="flex-column-fluid mb-2">
                <div className="row">
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
            <Modal id="standard-modal" isLarge title={`SALARY DETAILS FOR ` + formatDateAndTime(formData?.salary_date, "month_and_year") + " | " + formData?.employee_name}>
                {
                    salaryDetails.length > 0 ?
                        <div>
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
