import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import {
    currencyConverter,
    formatDateAndTime,
    moneyFormat,
} from "../../../resources/constants";
import { toast } from "react-toastify";
import AGTable from "../../common/table/AGTable";

function NSITFReport(props) {

    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Staff ID", field: "staffId" },
            { label: "Staff Name", field: "staffName" },
            { label: "Date of Birth", field: "dateOfBirth" },
            { label: "Gender", field: "gender" },
            { label: "Monthly Earnings (₦)", field: "monthlyEarnings" },
            { label: "NSITF Amount", field: "nsitfAmount" },
            { label: "Remarks", field: "remarks" },
        ],
        rows: [],
    });

    const [formData, setFormData] = useState({
        month_id: "",
        inserted_by: props.LoginDetails[0]?.StaffID,
    })

    const getTotal = () => {
        let total_amount = 0;
        reportData.filter(e => e.NetPay > 0).forEach((item) => {
            total_amount += (1 / 100) * item.NetPay;
        });
        return total_amount;
    }

    const buildTableData = (data) => {
        let rows = [];
        let total = 0;
        let nsitf = 0;

        data.filter(e => e.NetPay > 0).forEach((item, index) => {
            total += item.NetPay;
            nsitf += (1 / 100) * item.NetPay;
            rows.push({
                sn: index + 1,
                staffId: item.StaffID ?? "N/A",
                staffName: `${item.FirstName} ${item.MiddleName} ${item.Surname}`,
                dateOfBirth: formatDateAndTime(item.DateOfBirth, 'date'),
                gender: item.Gender ?? "N/A",
                monthlyEarnings: moneyFormat(item.NetPay),
                nsitfAmount: moneyFormat((1 / 100) * item.NetPay),
                remarks: "",
            });
        });

        // Add total row
        if (rows.length > 0) {
            rows.push({
                sn: "",
                staffId: "",
                staffName: "",
                dateOfBirth: "",
                gender: "Total",
                monthlyEarnings: moneyFormat(total),
                nsitfAmount: moneyFormat(nsitf),
                remarks: "",
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
            const { success, data } = await api.get(`staff/human-resources/finance-report/payroll/schedule?salary_month=${salary_month}`);
            if (success && data.length > 0) {
                setReportData(data)
                buildTableData(data);
            } else {
                setReportData([]);
                setDatatable(prev => ({ ...prev, rows: [] }));
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
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"NSITF Schedule Report"}
                items={["Human Resources", "Salary Report", "NSITF Schedule Report "]}
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
                            required />
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
export default connect(mapStateToProps, null)(NSITFReport);
