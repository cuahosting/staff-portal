import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { serverLink } from "../../../resources/url";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import { showAlert, showConfirm } from "../../common/sweetalert/sweetalert";
import ReportTable from "../../common/table/report_table";
import Select from 'react-select';
import JoditEditor from "jodit-react";
import { toast } from "react-toastify";
import { formatDate, formatDateAndTime } from "../../../resources/constants";
import Loader from "../../common/loader/loader";
import staffList from "../../user/staff-report/staff-list";



const StaffLeaveApply = (props) => {
    const token = props.loginDetails[0].token;

    const editorRef = React.createRef();
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["SN", "Leave Type", "Start Date", "End Date", "Days Taken", "Resumption Date", "Relief Staff", "Stage", "Status", "Begin", "End"];
    const [data, setData] = useState([]);
    const [StaffList, setStaffList] = useState([]);
    const [leaveCategory, setLeaveCategory] = useState([]);
    const [applications, setApplications] = useState([]);
    let [leaveForm, setLeaveForm] = useState(false)
    const [notCompleted, setNotCompleted] = useState([]);

    const staff_id = props.loginDetails[0].StaffID
    const [leave, setLeave] = useState({
        CasualDaysTaken: 0,
        AnnualDaysTaken: 0,
        LeaveType: "",
        StartDate: "",
        EndDate: "",
        DaysTaken: "",
        ResumptionDate: "",
        ReliefStaffID: "",
        ReliefStaffID2: "",
        Comment: "",
        SemesterCode: props.currentSemester,
        InsertedBy: props.loginDetails[0].StaffID

    })
    const getData = async () => {
        try {
            // await axios.get(`${serverLink}staff/human-resources/staff-leave/staff-list`, token)
            //     .then((result) => {
            //         let rows_ = []
            //         if (result.data.length > 0) {
            //             setStaffList(result.data);
            //         }
            //     })

            await axios.get(`${serverLink}staff/human-resources/staff-leave/leave-categories/${staff_id}`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        setLeaveCategory(result.data)
                    }
                })

            await axios.get(`${serverLink}staff/human-resources/staff-leave/leave-applications/${staff_id}`, token)
                .then((result) => {
                    let rows = [];
                    if (result.data.length > 0) {
                        let not_completed = result.data.filter(x => x.ActionStage === 0 || x.ActionStage === 1 || x.ActionStage === 2);
                        setNotCompleted(not_completed)
                        let causal = result.data.filter(x => x.LeaveType === 'Casual' && x.ApplicationStatus === 1).map(x => x.DaysTaken).reduce((a, b) => a + b, 0);
                        let annual = result.data.filter(x => x.LeaveType === 'Main' && x.ApplicationStatus === 1).map(x => x.DaysTaken).reduce((a, b) => a + b, 0)
                        setLeave({
                            ...leave,
                            CasualDaysTaken: causal,
                            AnnualDaysTaken: annual
                        });
                        result.data.map((item, index) => {
                            rows.push([
                                index + 1,
                                item.LeaveType,
                                formatDateAndTime(item.StartDate, "date"),
                                formatDateAndTime(item.EndDate, "date"),
                                item.DaysTaken,
                                formatDateAndTime(item.ResumptionDate, "date"),
                                item.ReliefStaffID,
                                <label className={item.ActionStage === 0 ? "badge badge-secondary"
                                    : item.ActionStage === 1 ? "badge badge-primary"
                                        : item.ActionStage === 2 ? "badge badge-info"
                                            : item.ActionStage === 3 ? "badge badge-success"
                                                : "badge badge-danger"}>
                                    {
                                        item.ActionStage === 0 ? "Pending Approval" : item.ActionStage === 1 ? "Approved" : item.ActionStage === 2 ? "Started" : item.ActionStage === 3 ? "Completed" : "Denied"
                                    }
                                </label>,
                                <label className={item.ApplicationStatus === 0 ? "badge badge-secondary"
                                    : item.ApplicationStatus === 1 ? "badge badge-success"
                                        : "badge badge-danger"}>
                                    {
                                        item.ApplicationStatus === 0 ? "Pending" : item.ApplicationStatus === 1 ? "Approved" : "Denied"
                                    }
                                </label>,
                                (
                                    <>
                                        {
                                            item.ActionStage === 1 ?
                                                <button className="btn btn-sm btn-primary" onClick={() => { handleBegin(item) }}  >
                                                    Begin</button>
                                                :
                                                <>--</>
                                        }
                                    </>
                                ),
                                (
                                    <>
                                        {
                                            item.ActionStage === 2 ?
                                                <button className="btn btn-sm btn-primary" onClick={() => { handleResume(item) }}  >
                                                    Resume</button>
                                                :
                                                <>--</>
                                        }
                                    </>
                                )


                            ])
                        })
                    }
                    setData(rows)
                    setIsLoading(false);
                })
        } catch (e) {
            showAlert("Network Error", "please check your connection", "error")

        }
    }

    useEffect(() => {
        getData();
    }, [])

    const getStaffList = async () => {
        axios.get(`${serverLink}staff/academics/timetable-planner/staff/list`, token)
            .then((response) => {
                let rows = [];
                if (response.data.length > 0) {
                    response.data.map((row) => {
                        rows.push({ value: row.StaffID, label: row.StaffID + "--" + row.FirstName + " " + row.MiddleName + " " + row.Surname })
                    });
                    setStaffList(rows)
                }
                else {
                    setStaffList([])
                }
                setIsLoading(false);
            })
            .catch((ex) => {
                console.error(ex);
            });
    };

    useEffect(() => {
        getStaffList();
    }, []);

    const onEdit = (e) => {
        setLeave({
            ...leave,
            [e.target.id]: e.target.value
        })

        if (e.target.id === "EndDate" && leave.StartDate !== "") {
            let start = new Date(leave.StartDate);
            let end = new Date(e.target.value);
            var time_diff = end.getTime() - start.getTime();
            var days_dif = time_diff / (1000 * 3600 * 24);
            let newDate = addDays(new Date(e.target.value), 1);
            setLeave({
                ...leave,
                [e.target.id]: e.target.value,
                DaysTaken: days_dif,
                ResumptionDate: formatDate(newDate)
            })
        }
    }
    const onStaffChange = async (e) => {
        setLeave({
            ...leave,
            ReliefStaffID2: e,
            ReliefStaffID: e.value
        })
    }

    const handleBegin = (item) => {
        showConfirm("Warning", "Are you sure you want to begin your leave days?", "warning")
            .then(async (isConfirmed) => {
                if (isConfirmed) {
                    try {
                        await axios.patch(`${serverLink}staff/human-resources/staff-leave/begin-staff-leave/${item.EntryID}`, { InsertedBy: props.loginDetails[0].InsertedBy }, token)
                            .then((result) => {
                                if (result.data.message === "success") {
                                    getData();
                                    toast.success("leave successfully started.")
                                }
                            })
                    } catch (e) {
                        showAlert("Error", "Netwrok error, check your connection", "error")
                    }
                }
            })
    }

    const handleResume = (item) => {
        showConfirm("Warning", "Are you sure you have completed your leave days?", "warning")
            .then(async (isConfirmed) => {
                if (isConfirmed) {
                    try {
                        await axios.patch(`${serverLink}staff/human-resources/staff-leave/resume-staff/${item.EntryID}`, { InsertedBy: props.loginDetails[0].InsertedBy }, token)
                            .then((result) => {
                                if (result.data.message === "success") {
                                    getData();
                                    toast.success("leave successfully completed.")
                                }
                            })
                    } catch (e) {
                        showAlert("Error", "Netwrok error, check your connection", "error")
                    }
                }
            })
    }

    const addDays = (date, days) => {
        return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        if (leave.LeaveType === "") {
            showAlert("Error", "please select leave type", "error");
            return;
        }
        if (leave.StartDate === "") {
            showAlert("Error", "please select StartDate", "error");
            return;
        }
        if (leave.EndDate === "") {
            showAlert("Error", "please select EndDate", "error");
            return;
        }
        if (leave.LeaveType === "Main") {
            if (parseInt(leave.DaysTaken) > parseInt(leaveCategory[0].LeaveDaysAllowed)) {
                showAlert("Error", `Sorry, you cannot apply for more than ${parseInt(leaveCategory[0].LeaveDaysAllowed)} days for annual leave`, "error");
                return;
            }
            let no_days = parseInt(leave.AnnualDaysTaken) + parseInt(leave.DaysTaken);
            if (no_days > parseInt(leaveCategory[0].LeaveDaysAllowed)) {
                showAlert("Error", "You do not have days left in your Annual Leave days", "error");
                return;
            }
            applyLeave();
        }
        if (leave.LeaveType === "Casual") {
            if (parseInt(leave.DaysTaken) > parseInt(leaveCategory[0].CasualDaysAllowed)) {
                showAlert("Error", `Sorry, you cannot apply for more than ${parseInt(leaveCategory[0].CasualDaysAllowed)} days for casual leave`, "error");
                return;
            }
            let no_days = parseInt(leave.CasualDaysTaken) + parseInt(leave.DaysTaken);
            if (no_days > parseInt(leaveCategory[0].CasualDaysAllowed)) {
                showAlert("Error", "You do not have days left in your Casual Leave days", "error");
                return;
            }
            applyLeave();

        }

    }

    const applyLeave = async () => {
        try {
            await axios.post(`${serverLink}staff/human-resources/staff-leave/apply-leave`, leave, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        getData();
                        setLeaveForm(false);
                        setLeave({
                            ...leave,
                            LeaveType: "",
                            StartDate: "",
                            EndDate: "",
                            DaysTaken: "",
                            ResumptionDate: "",
                            ReliefStaffID: "",
                            Comment: "",
                        })
                        toast.success("leave application successful, kindly await response from the HR");

                    } else {
                        toast.error("failed, please try again!")
                    }
                })

        } catch (e) {
            showAlert("Error", "Network error, please check your connection", "error")
        }
    }
    const OnCommentChange = (e) => {
        setLeave({
            ...leave,
            Comment: e
        })
    }


    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Staff Leave"}
                items={["Human Resources", "Staff Leave", "Apply"]}
            />

            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" ><h2>Leave Application</h2></div>

                        <div className="card-toolbar">
                            {
                                leaveCategory.length > 0 ?
                                    <div className="d-flex justify-content-end"
                                        data-kt-customer-table-toolbar="base">
                                        <button
                                            disabled={notCompleted.length > 0 ? true : false}
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setLeaveForm(leaveForm = !leaveForm);
                                                setLeave({
                                                    ...leave,
                                                    LeaveType: "",
                                                    StartDate: "",
                                                    EndDate: "",
                                                    DaysTaken: "",
                                                    ResumptionDate: "",
                                                    ReliefStaffID: "",
                                                    Comment: "",
                                                })
                                            }} >
                                            {notCompleted.length > 0 ? "You cannot apply for leave now" : " Apply for leave"}

                                        </button>
                                    </div>
                                    :
                                    <div>
                                        <label className="alert alert-warning">Sorry, you can not apply for leave now, kindly contact the HR</label>
                                    </div>
                            }
                        </div>
                    </div>



                    <div className="card-body p-0">
                        <div>
                            {
                                leaveCategory.length > 0 &&
                                <div className="row col-md-12">
                                    <div className="d-flex flex-column flex-grow-1 pe-8">
                                        <div className="d-flex flex-wrap">
                                            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="fs-2x fw-bold counted" data-kt-countup="true" data-kt-countup-value={4500} data-kt-countup-prefix="$" data-kt-initialized={1}>
                                                        {leaveCategory[0].LeaveDaysAllowed}
                                                    </div>
                                                </div>
                                                <div className="fw-semibold fs-6 text-gray-600">Annual Days Allowed</div>
                                            </div>
                                            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="fs-2x fw-bold counted" data-kt-countup="true" data-kt-countup-value={75} data-kt-initialized={1}>{leave.AnnualDaysTaken}</div>
                                                </div>

                                                <div className="fw-semibold fs-6 text-gray-600">Annual Days Taken</div>
                                            </div>
                                            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="fs-2x fw-bold counted" data-kt-countup="true" data-kt-countup-value={75} data-kt-initialized={1}>{leaveCategory[0].CasualDaysAllowed}</div>
                                                </div>

                                                <div className="fw-semibold fs-6 text-gray-600">Casual Days Allowed</div>
                                            </div>
                                            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="fs-2x fw-bold counted" data-kt-countup="true" data-kt-countup-value={75} data-kt-initialized={1}>{leave.CasualDaysTaken}</div>
                                                </div>

                                                <div className="fw-semibold fs-6 text-gray-600">Casual Days Taken</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                            {
                                leaveForm === true &&
                                <form onSubmit={onSubmit} >
                                    <div className="form-group">
                                        <label htmlFor="LeaveType">LeaveType</label>
                                        <select className="form-select" id="LeaveType" onChange={onEdit} value={leave.LeaveType}>
                                            <option value={""}>-select leave type-</option>
                                            <option value={"Main"}>Main</option>
                                            <option value={"Casual"}>Casual</option>
                                        </select>
                                    </div>
                                    <br />
                                    <div className="row col-md-12">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="StartDate">Start Date</label>
                                                <input
                                                    type="date" required id={"StartDate"} onChange={onEdit} value={leave.StartDate}
                                                    className={"form-control"}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="StartDate">End Date</label>
                                                <input
                                                    type="date" disabled={leave.StartDate === "" ? true : false} required id={"EndDate"} min={leave.StartDate} onChange={onEdit} value={leave.EndDate}
                                                    className={"form-control"}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row col-md-12">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="DaysTaken">Number of Days</label>
                                                <input
                                                    type="number" disabled id={"DaysTaken"} onChange={onEdit} value={leave.DaysTaken}
                                                    className={"form-control"}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="ResumptionDate">Resumption Date</label>
                                                <input
                                                    type="date" disabled id={"ResumptionDate"} onChange={onEdit} value={leave.ResumptionDate}
                                                    className={"form-control"}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="form-group">
                                        <label htmlFor="ReliefStaffID">Relief Staff</label>
                                        <Select
                                            name="staffID"
                                            value={leave.ReliefStaffID2}
                                            onChange={onStaffChange}
                                            options={StaffList}
                                        />
                                    </div>
                                    <br />
                                    <div className="form-group">
                                        <label htmlFor="Comment">Additional Comment</label>
                                        <JoditEditor
                                            value={leave.Comment}
                                            ref={editorRef}
                                            tabIndex={1}
                                            onChange={OnCommentChange}
                                        />
                                    </div>
                                    <br />
                                    <div className="form-group pt-2">
                                        <button type="submit" className="btn btn-primary w-100" >
                                            <span className="indicator-label">Submit</span>
                                        </button>
                                    </div>
                                </form>
                            }
                        </div>
                        <div className="col-md-12" style={{ overflowX: 'auto' }}>
                            {
                                data.length > 0 &&
                                <ReportTable data={data} columns={columns} height="700px" />
                            }
                        </div>
                    </div>

                    <Modal title={"Manage leave"} id={"leave"} close={"leave"}>
                        <form onSubmit={onSubmit} >
                            <div className="form-group">
                                <label htmlFor="Name">Name</label>
                                <input
                                    type="text"
                                    required
                                    id={"Name"}
                                    onChange={onEdit}
                                    value={leave.Name}
                                    className={"form-control"}
                                    placeholder={"Enter Name"}
                                />
                            </div>
                            <br />
                            <div className="form-group">
                                <label htmlFor="Description">Description</label>
                                <input
                                    type="text"
                                    required
                                    id={"Description"}
                                    onChange={onEdit}
                                    value={leave.Description}
                                    className={"form-control"}
                                    placeholder={"Enter Description"}
                                />
                            </div>
                            <br />
                            <div className="form-group">
                                <label htmlFor="LeaveDaysAllowed">LeaveDaysAllowed</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    id={"LeaveDaysAllowed"}
                                    onChange={onEdit}
                                    value={leave.LeaveDaysAllowed}
                                    className={"form-control"}
                                    placeholder={"Enter LeaveDaysAllowed"}
                                />
                            </div>
                            <br />
                            <div className="form-group">
                                <label htmlFor="CasualDaysAllowed">CasualDaysAllowed</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    id={"CasualDaysAllowed"}
                                    onChange={onEdit}
                                    value={leave.CasualDaysAllowed}
                                    className={"form-control"}
                                    placeholder={"Enter CasualDaysAllowed"}
                                />
                            </div>
                            <br />
                            <div className="form-group pt-2">
                                <button type="submit" className="btn btn-primary w-100" >
                                    <span className="indicator-label">Submit</span>
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        loginDetails: state.LoginDetails,
        currentSemester: state.currentSemester
    }
}
export default connect(mapStateToProps, null)(StaffLeaveApply);