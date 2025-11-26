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
import BankDataTable from "../../common/data-table/bank-data-table";
import {showConfirm} from "../../common/sweetalert/sweetalert";

function BankReport(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const header = ["S/N", "Staff Name", "Designation", "Phone", "Salary Amount (₦)", "Bank", "Acc. No.", "Employment type"];
    const [data, setData] = useState([])
    const [reportData, setReportData] = useState([])
    const [reportDataBK, setReportDataBK] = useState([])
    const [banks, setBanks] = useState([]);
    const [IsVCApproved, setIsVCApproved] = useState(false);
    const [IsBursarApproved, setIsBursarApproved] = useState(false);

    const [formData, setFormData] = useState({
        month_id: "",
        bank: "",
        inserted_by: props.LoginDetails[0]?.StaffID,
    })


    const  showTable = () => {
        try {
            let total = 0;
            const row = reportData.filter(e => e.NetPay > 0).map((item, index) => {
                total += item.NetPay;
                return (
                    <tr key={index}>
                        <td className="text-xs font-weight-bold">{index +1}</td>
                        <td className="text-xs font-weight-bold">{item.FirstName} {item.MiddleName} {item.Surname}</td>
                        <td className="text-xs font-weight-bold">{item.Designation}</td>
                        <td className="text-xs font-weight-bold">{item.PhoneNumber}</td>
                        <td className="text-xs font-weight-bold">{moneyFormat(item.NetPay)}</td>
                        <td className="text-xs font-weight-bold">{item.BankName}</td>
                        <td className="text-xs font-weight-bold">{item.AccountNumber}</td>
                        <td className="text-xs font-weight-bold">{item.StaffType}</td>
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
                                <td className="text-xs font-weight-bold"><h3>Total</h3></td>
                                <td className="text-xs font-weight-bold"><b>{moneyFormat(total)}</b></td>
                                <td className="text-xs font-weight-bold"></td>
                                <td className="text-xs font-weight-bold"></td>
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

        } else {
            setIsLoading(true)
            await axios.get(`${serverLink}staff/human-resources/finance-report/payroll/schedule?salary_month=${salary_month}`, token)
                .then((res) => {
                    if (res.data.length > 0) {
                        setReportData(res.data)
                        setReportDataBK(res.data)
                        setIsVCApproved(res.data.every(e => e.vc_approval === true))
                        setIsBursarApproved(res.data.every(e => e.bursar_approval === true))
                    }
                    setIsLoading(false)
                }).catch((e) => {
                    setIsLoading(false)
                    toast.error("error getting allowances")
                })
        }
    }

    const  getTotal = () => {
        let total_amount = 0;
        reportData.filter(e => e.NetPay > 0).map((item, index) => {
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
            setFormData({
                ...formData,
                bank: e.target.value
            })
            setIsLoading(false); // ✅ Move here — after data is set
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
                    <div className="col-md-6 pb-3">
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
                    <div className="col-md-6 pb-3">
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
                    </div>
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
                            {reportData.length > 0 &&
                                <div className="table-responsive">
                                    <BankDataTable header={header} date={" "+formatDateAndTime(formData.month_id, 'month_and_year')} body={showTable()}  caption={`TOTAL AMOUNT: ${currencyConverter(getTotal() ?? 0)}`} total_amount={getTotal() ?? 0} title={`Bank Schedule Report ${formatDateAndTime(formData.month_id, 'month_and_year')}`}
                                    signatory={(IsVCApproved && IsBursarApproved) ? <div className="d-flex justify-content-between ">
                                        <p style={{fontSize: '14px'}}>
                                            <img src={require('../../../images/vc_sign.jpeg')} style={{height: '70px', width: '200px'}}/><br/>
                                            Vice Chancellor<br/>
                                            {/* <b>Prof. name.</b><br/> */}
                                            Vice Chancellor<br/>
                                            Cosmopolitan University<br/>
                                            Central Area Abuja, Nigeria <br/>
                                            <br/>

                                        </p>

                                        <p style={{fontSize: '14px'}}>
                                            <img src={require('../../../images/bursar.jpeg')} style={{height: '70px', width: '200px'}}/><br/>
                                            Bursar<br/>
                                            {/* <b>Dr. Onigah Peter Oko,</b><br/> */}
                                            Chief Financial Officer<br/>
                                            Cosmopolitan University<br/>
                                            Central Area Abuja, Nigeria <br/>
                                        </p>
                                    </div> : <></>}
                                    />

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
