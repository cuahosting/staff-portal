import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { serverLink } from "../../../resources/url";
import axios from "axios";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import {
    currencyConverter,
    formatDateAndTime,
    moneyFormat,
} from "../../../resources/constants";
import { toast } from "react-toastify";
import AGTable from "../../common/table/AGTable";
import {showConfirm} from "../../common/sweetalert/sweetalert";

function BankReport(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState([])
    const [reportDataBK, setReportDataBK] = useState([])
    const [banks, setBanks] = useState([]);
    const [IsVCApproved, setIsVCApproved] = useState(false);
    const [IsBursarApproved, setIsBursarApproved] = useState(false);

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Staff Name", field: "staffName" },
            { label: "Designation", field: "designation" },
            { label: "Phone", field: "phone" },
            { label: "Salary Amount (₦)", field: "salaryAmount" },
            { label: "Bank", field: "bank" },
            { label: "Acc. No.", field: "accountNumber" },
            { label: "Employment type", field: "employmentType" },
        ],
        rows: [],
    });

    const [formData, setFormData] = useState({
        month_id: "",
        bank: "",
        inserted_by: props.LoginDetails[0]?.StaffID,
    })

    const buildTableData = (data) => {
        let rows = [];
        let total = 0;

        data.filter(e => e.NetPay > 0).forEach((item, index) => {
            total += item.NetPay;
            rows.push({
                sn: index + 1,
                staffName: `${item.FirstName} ${item.MiddleName} ${item.Surname}`,
                designation: item.Designation ?? "N/A",
                phone: item.PhoneNumber ?? "N/A",
                salaryAmount: moneyFormat(item.NetPay),
                bank: item.BankName ?? "N/A",
                accountNumber: item.AccountNumber ?? "N/A",
                employmentType: item.StaffType ?? "N/A",
            });
        });

        // Add total row
        if (rows.length > 0) {
            rows.push({
                sn: "",
                staffName: "",
                designation: "",
                phone: "Total",
                salaryAmount: moneyFormat(total),
                bank: "",
                accountNumber: "",
                employmentType: "",
            });
        }

        setDatatable(prev => ({
            ...prev,
            rows: rows,
        }));
    };

    const getData = async () => {
        await axios.get(`${serverLink}staff/human-resources/finance-report/get-banks`, token)
            .then((res) => {
                if (res.data.length > 0) {
                    setBanks(res.data)
                }
                setIsLoading(false)
            }).catch((e) => {
                setIsLoading(false)
                toast.error("error getting bank data")
            })
    }

    const getSalaryReport = async (salary_month) => {
        if (salary_month === "") {
            setDatatable(prev => ({ ...prev, rows: [] }));
        } else {
            setIsLoading(true)
            await axios.get(`${serverLink}staff/human-resources/finance-report/payroll/schedule?salary_month=${salary_month}`, token)
                .then((res) => {
                    if (res.data.length > 0) {
                        setReportData(res.data)
                        setReportDataBK(res.data)
                        setIsVCApproved(res.data.every(e => e.vc_approval === true))
                        setIsBursarApproved(res.data.every(e => e.bursar_approval === true))
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

    const getTotal = () => {
        let total_amount = 0;
        reportData.filter(e => e.NetPay > 0).forEach((item) => {
            total_amount += item.NetPay;
        });
        return total_amount;
    }

    const onChangeBank = (e) => {
        setIsLoading(true);

        setTimeout(() => {
            let filtered = reportDataBK.filter(x =>
                (x.BankName ?? '').toString().toLowerCase().includes(
                    e.target.value.toString().toLowerCase()
                )
            );
            setReportData(filtered);
            buildTableData(filtered);
            setFormData({
                ...formData,
                bank: e.target.value
            })
            setIsLoading(false);
        }, 1000);
    };

    const onChange = (e) => {
        const val = e.target.value;
        setFormData({
            ...formData,
            [e.target.id]: val,
        })

        getSalaryReport(val)
    }

    useEffect(() => {
        getData();
    }, []);

    const vc_approval = async () => {
        toast.info(`Please wait!...`);
        try {
            const sendData = {salary_date: formData.month_id}
            const res = await axios.patch(`${serverLink}staff/human-resources/finance-report/vc-approval`, sendData, token);
            if (res.data.message === "success") {
                toast.success(`VC Approval Successful`);
                getSalaryReport(formData.month_id)
            } else {
                toast.error(`Something went wrong. Please check your connection and try again!`);
            }
        } catch (error) {
            console.error("NETWORK ERROR", error);
        }
    };

    const bursar_approval = async () => {
        toast.info(`Please wait!...`);
        try {
            const sendData = {salary_date: formData.month_id}
            const res = await axios.patch(`${serverLink}staff/human-resources/finance-report/bursar-approval`, sendData, token);
            if (res.data.message === "success") {
                toast.success(`Bursar Approval Successful`);
                getSalaryReport(formData.month_id)
            } else {
                toast.error(`Something went wrong. Please check your connection and try again!`);
            }
        } catch (error) {
            console.error("NETWORK ERROR", error);
        }
    };

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Bank Schedule Report"}
                items={["Human Resources", "Salary Report", "Bank Schedule Report "]}
            />
            <div className="col-md-12">
                <div className="row">
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
                    {/* <div className="col-md-6 pb-3">
                        <div className="form-group">
                            <label htmlFor="month_id">Select Bank</label>
                            <select className="form-control" id="bank" name="bank" value={formData.bank} onChange={onChangeBank}>
                                <option value="">All</option>
                                {banks.map((item, index) => {
                                    return (
                                        <option key={index} value={item.BankName}>
                                            {item.BankName}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div> */}
                </div>

            </div>
            <div className="flex-column-fluid mb-2">
                <div className="row">
                    {
                        reportData.length > 0 ?
                            !(IsVCApproved && IsBursarApproved) ?
                            <h4 className="alert alert-info mb-3">
                                This payroll schedule has not been approved. Please approve it before submitting to the bank.
                            </h4>
                            : <></> : <></>
                    }

                    {
                        reportData.length > 0 &&
                        <div style={{marginBottom: '10px'}} className="d-flex justify-content-end">
                            {
                                !IsBursarApproved &&
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={()=>showConfirm("Warning", `Are you sure you want to approve payroll schedule for ${formatDateAndTime(formData.month_id, "month_and_year")} ?`, "warning")
                                        .then( async (confirm) => {
                                            if (confirm) {
                                                bursar_approval()
                                            }
                                        })}
                                >
                                    Bursar Approval
                                </button>
                            }
                            {
                                !IsVCApproved &&
                                <button
                                    style={{marginLeft: '10px'}}
                                    type="button"
                                    className="btn btn-info"
                                    onClick={()=>showConfirm("Warning", `Are you sure you want to approve payroll schedule for ${formatDateAndTime(formData.month_id, "month_and_year")} ?`, "warning")
                                        .then( async (confirm) => {
                                            if (confirm) {
                                                vc_approval()
                                            }
                                        })}
                                >
                                    VC Approval
                                </button>
                            }
                        </div>
                    }
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
                                    {(IsVCApproved && IsBursarApproved) &&
                                        <div className="d-flex justify-content-between p-4 print-only">
                                            <p style={{fontSize: '14px'}}>
                                                <img src={require('../../../images/vc_sign.jpeg')} style={{height: '70px', width: '200px'}} alt="VC Signature"/><br/>
                                                Vice Chancellor<br/>
                                                Vice Chancellor<br/>
                                                Cosmopolitan University<br/>
                                                Central Area Abuja, Nigeria <br/>
                                                <br/>
                                            </p>

                                            <p style={{fontSize: '14px'}}>
                                                <img src={require('../../../images/bursar.jpeg')} style={{height: '70px', width: '200px'}} alt="Bursar Signature"/><br/>
                                                Bursar<br/>
                                                Chief Financial Officer<br/>
                                                Cosmopolitan University<br/>
                                                Central Area Abuja, Nigeria <br/>
                                            </p>
                                        </div>
                                    }
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
export default connect(mapStateToProps, null)(BankReport);
