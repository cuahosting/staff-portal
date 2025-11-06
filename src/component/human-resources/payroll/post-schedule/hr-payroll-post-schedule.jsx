import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {ProgressBar} from "react-bootstrap";
import axios from "axios";
import {serverLink} from "../../../../resources/url";
import {toast} from "react-toastify";
import PageHeader from "../../../common/pageheader/pageheader";
import Loader from "../../../common/loader/loader";
import {showAlert} from "../../../common/sweetalert/sweetalert";

function HrPayrollPostSchedule(props) {
    const token = props.loginData[0].token;

    const [createItem, setCreateItem] = useState({
        salary_date: '',
        inserted_by: props.loginData[0].StaffID
    })
    const [progress, setProgress] = useState({
        percentage: 0,
        variant: 'danger'
    })
    const [canSubmit, setCanSubmit] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [allowanceList, setAllowanceList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pensionSetting, setPensionSetting] = useState([]);
    const [salarySetting, setSalarySetting] = useState([]);
    const [pensionStaffList, setPensionStaffList] = useState([]);

    const getRecord = async () => {
        await axios
            .get(`${serverLink}staff/report/staff/list/status/1`, token)
            .then((result) => {
                const data = result.data;
                setStaffList(data)
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
        await axios
            .get(`${serverLink}staff/hr/payroll/salary/settings/record`, token)
            .then((result) => {
                const data = result.data;
                setSalarySetting(data)
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
        await axios
            .get(`${serverLink}staff/hr/payroll/pension/salary/enrolled`, token)
            .then((result) => {
                const data = result.data;
                setPensionStaffList(data)
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
        await axios
            .get(`${serverLink}staff/hr/payroll/pension/setting`, token)
            .then((result) => {
                const data = result.data;
                setPensionSetting(data)
                setIsLoading(false)
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });

    }

    useEffect(() => {
        getRecord()
    }, [])

    const onEdit = async (e) => {
        setCreateItem({
            ...createItem,
            [e.target.id]: e.target.value,
        });
        setIsLoading(true)
        setCanSubmit(false)
        setProgress({
            percentage: 0,
            variant: 'danger'
        })

        await axios.post(`${serverLink}staff/hr/payroll/salary/check_if_ran`, {salary_date: e.target.value}, token)
            .then(result => {
                if (result.data > 0) {
                    toast.error(`Salary already ran for ${e.target.value}`);
                    setCanSubmit(false)
                } else {
                    setCanSubmit(true);
                }
            })
            .catch(err => {
                console.log('NETWORK ERROR', err)
            });

        await axios.post(`${serverLink}staff/hr/payroll/salary/get_allowance_list`, {salary_date: e.target.value}, token)
            .then(result => {
                setAllowanceList(result.data)
                setIsLoading(false)
            })
            .catch(err => {
                console.log('NETWORK ERROR', err)
            });
    };

    const onSubmit = () => {
        setCanSubmit(false)
        if (pensionSetting.length === 0) {
            showAlert('PENSION SETTING NOT FOUND', 'Please add a pension setting from the pension section first!', 'error');
            return false;
        }
        if (salarySetting.length === 0) {
            showAlert('SALARY SETTING NOT FOUND', 'Please add a salary setting from the salary section first!', 'error');
            return false;
        }

        // setCanSubmit(false);
        if (staffList.length === 0) {
            showAlert('RECORD NOT EXIST', 'Staff Records could not be found!', 'error');
            return false;
        } else {
            staffList.map(async (item, index) => {
                let itemList = [];
                let pensionContribution = '';
                const gross = item.GrossPay;
                const basic = (salarySetting[0].Basic / 100) * gross;
                const housing = (salarySetting[0].Housing / 100) * gross;
                const transport = (salarySetting[0].Transport / 100) * gross;
                const fringe = (salarySetting[0].Fringe / 100) * gross;
                const medical = (salarySetting[0].Medical / 100) * gross;
                const wardrobe = (salarySetting[0].Wardrobe / 100) * gross;
                const payee = (salarySetting[0].Payee / 100) * gross;
                itemList.push(
                    {
                        staff_id: item.StaffID,
                        item_name: 'Basic Salary',
                        salary_type: 'Allowance',
                        amount: basic,
                        salary_date: createItem.salary_date,
                        inserted_by: createItem.inserted_by
                    },
                    {
                        staff_id: item.StaffID,
                        item_name: 'Housing',
                        salary_type: 'Allowance',
                        amount: housing,
                        salary_date: createItem.salary_date,
                        inserted_by: createItem.inserted_by
                    },
                    {
                        staff_id: item.StaffID,
                        item_name: 'Transport',
                        salary_type: 'Allowance',
                        amount: transport,
                        salary_date: createItem.salary_date,
                        inserted_by: createItem.inserted_by
                    },
                    {
                        staff_id: item.StaffID,
                        item_name: 'Fringe',
                        salary_type: 'Allowance',
                        amount: fringe,
                        salary_date: createItem.salary_date,
                        inserted_by: createItem.inserted_by
                    },
                    {
                        staff_id: item.StaffID,
                        item_name: 'Medical',
                        salary_type: 'Allowance',
                        amount: medical,
                        salary_date: createItem.salary_date,
                        inserted_by: createItem.inserted_by
                    },
                    {
                        staff_id: item.StaffID,
                        item_name: 'Wardrobe',
                        salary_type: 'Allowance',
                        amount: wardrobe,
                        salary_date: createItem.salary_date,
                        inserted_by: createItem.inserted_by
                    },
                    {
                        staff_id: item.StaffID,
                        item_name: 'Payee',
                        salary_type: 'Deduction',
                        amount: payee,
                        salary_date: createItem.salary_date,
                        inserted_by: createItem.inserted_by
                    },
                )

                if (allowanceList.length > 0) {
                    const check_staff_allowance = allowanceList.filter(i => i.StaffID === item.StaffID);
                    if (check_staff_allowance.length > 0) {
                        check_staff_allowance.map(it => {
                            if (it.AllowanceAmount > 0) {
                                itemList.push({
                                    staff_id: item.StaffID,
                                    item_name: it.GLAccountName,
                                    salary_type: 'Allowance',
                                    amount: it.AllowanceAmount,
                                    salary_date: createItem.salary_date,
                                    inserted_by: createItem.inserted_by
                                },)
                            } else {
                                itemList.push({
                                    staff_id: item.StaffID,
                                    item_name: it.GLAccountName,
                                    salary_type: 'Deduction',
                                    amount: it.DeductionAmount,
                                    salary_date: createItem.salary_date,
                                    inserted_by: createItem.inserted_by
                                },)
                            }
                        })
                    }
                }

                if (pensionStaffList.length > 0) {
                    const check_staff_pension = pensionStaffList.filter(i => i.StaffID === item.StaffID);
                    if (check_staff_pension.length > 0) {
                        const employee = (pensionSetting[0].EmployeeContribution / 100) * (basic + housing + transport)
                        const employer = (pensionSetting[0].EmployerContribution / 100) * (basic + housing + transport)
                        const pension_total = employer + employee;
                        itemList.push(
                            {
                                staff_id: item.StaffID,
                                item_name: 'Pension',
                                salary_type: 'Deduction',
                                amount: employee,
                                salary_date: createItem.salary_date,
                                inserted_by: createItem.inserted_by
                            },
                        )
                        pensionContribution = {
                            staff_id: item.StaffID,
                            employee_contribution: employee,
                            employer_contribution: employer,
                            total_contribution: pension_total,
                            contribution_date: createItem.salary_date,
                            pension_admin_id: check_staff_pension[0].PensionAdminID,
                            inserted_by: createItem.inserted_by
                        }
                    }
                }

                if (typeof pensionContribution.staff_id !== 'undefined') {
                    await axios.post(`${serverLink}staff/hr/payroll/salary/post/pension_record`, pensionContribution, token)
                        .then(res => {})
                        .catch(err => {})
                }

                itemList.map(async list => {
                    await axios.post(`${serverLink}staff/hr/payroll/salary/post/salary`, list, token)
                        .then(res => {})
                        .catch(err => {
                            console.log('NETWORK ERROR', err)
                        })

                    const percentage = (index + 1) / staffList.length * 100;
                    let variant = "";
                    if (percentage <= 25)
                        variant = 'danger'
                    else if (percentage > 25 && percentage <= 50)
                        variant = 'warning'
                    else if (percentage > 50 && percentage <= 75)
                        variant = 'info'
                    else
                        variant = 'success'

                    setProgress({
                        ...progress,
                        percentage: Math.round(percentage),
                        variant: variant
                    })

                })

                if (index + 1 === staffList.length) {
                    toast.success("SALARY POSTING IS COMPLETE");
                }

            })
        }
    }

    return isLoading ? (
        <Loader/>
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Post Schedule"}
                items={["Human Resources", "Payroll", "Post Schedule"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <h4 className={"alert alert-danger"}>You can only run salary once per month</h4>
                        </div>
                        <div className="row">
                            <div className="form-group mb-5">
                                <label htmlFor="salary_date">Select Month & Year</label>
                                <input type="month" id={"salary_date"}
                                       max={`${new Date().getFullYear()}-${new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1}`}
                                       onChange={onEdit} value={createItem.salary_date} className="form-control"/>
                            </div>

                            <div className="mb-5">
                                <ProgressBar className="pt-2" now={progress.percentage}
                                             label={`${progress.percentage}%`} variant={progress.variant} striped/>
                            </div>

                            <div className="form-group pt-2">
                                {
                                    canSubmit &&
                                    <button onClick={onSubmit} className="btn btn-primary w-100">Post</button>
                                }

                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(HrPayrollPostSchedule);
