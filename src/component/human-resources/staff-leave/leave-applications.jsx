import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { serverLink } from "../../../resources/url";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import ReportTable from "../../common/table/report_table";
import Select from 'react-select';
import JoditEditor from "jodit-react";
import { toast } from "react-toastify";
import { decryptData, formatDate, formatDateAndTime } from "../../../resources/constants";
import Loader from "../../common/loader/loader";
import Select from "react-select";
import staffList from "../../user/staff-report/staff-list";
import * as DOMPurify from 'dompurify';


const StaffLeaveApplications = (props) => {
    const token = props.loginDetails[0].token;

    const editorRef = React.createRef();
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["SN", "Staff", "Leave Type", "Start Date", "End Date", "Days Taken", "Resumption Date", "Stage", "Status", "Action"];
    const [data, setData] = useState([]);
    let [leaveForm, setLeaveForm] = useState(false)
    const [leaveCategory, setLeaveCategory] = useState([]);
    const [StaffList, setStaffList] = useState([])

    const [leave, setLeave] = useState({
        CasualDaysTaken: 0,
        AnnualDaysTaken: 0,
        EntryID: "",
        LeaveType: "",
        StartDate: "",
        EndDate: "",
        DaysTaken: "",
        ResumptionDate: "",
        ReliefStaffID: "",
        ReliefStaffID2: "",
        Comment: "",
        StaffID: "",
        StaffName: "",
        ApplicationStatus: "",
        ActionNote: "",
        SemesterCode: props.currentSemester,
        InsertedBy: props.loginDetails[0].StaffID

    })
    const getData = async () => {
        try {
            let leave_cat = []
            await axios.get(`${serverLink}staff/human-resources/staff-leave/leave-categories`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        leave_cat = result.data;
                        setLeaveCategory(result.data);
                    }
                })

            await axios.get(`${serverLink}staff/human-resources/staff-leave/leave-applications/${props.loginDetails[0].StaffID}`, token)
                .then((result) => {
                    let rows = [];
                    if (result.data.length > 0) {
                        result.data.map((item, index) => {
                            let casual = result.data.filter(x => x.LeaveType === 'Casual' && x.ApplicationStatus === 1);
                            let annual = result.data.filter(x => x.LeaveType === 'Main' && x.ApplicationStatus === 1);
                            rows.push([
                                index + 1,
                                item.StaffID + "--" + item.StaffName,
                                item.LeaveType,
                                formatDateAndTime(item.StartDate, "date"),
                                formatDateAndTime(item.EndDate, "date"),
                                item.DaysTaken,
                                formatDateAndTime(item.ResumptionDate, "date"),
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
                                <button className="btn btn-sm btn-primary"
                                    data-bs-target="#leave" data-bs-toggle="modal"
                                    onClick={async () => {
                                        try {
                                            const cat_ = (await leave_cat.length) > 0 ?
                                                leave_cat.filter(x => x.StaffID.toString() === item.StaffID.toString()) : []
                                            if (cat_.length > 0) {
                                                setTimeout(async () => {
                                                    await setLeave({
                                                        ...leave,
                                                        CasualDaysTaken: casual.filter(x => x.StaffID === item.StaffID)
                                                            .map(x => x.DaysTaken).reduce((a, b) => a + b, 0),
                                                        AnnualDaysTaken: annual.filter(x => x.StaffID === item.StaffID)
                                                            .map(x => x.DaysTaken).reduce((a, b) => a + b, 0),
                                                        LeaveDaysAllowed: cat_[0].LeaveDaysAllowed,
                                                        CasualDaysAllowed: cat_[0].CasualDaysAllowed,
                                                        EntryID: item.EntryID,
                                                        LeaveType: item.LeaveType,
                                                        StartDate: formatDate(item.StartDate),
                                                        EndDate: formatDate(item.EndDate),
                                                        DaysTaken: item.DaysTaken,
                                                        ResumptionDate: (formatDate(item.ResumptionDate)),
                                                        ReliefStaffID: item.ReliefStaffID + "--" + item.ReliefStaffName,
                                                        ReliefStaffID2: { value: item.StaffID, label: item.StaffID + "--" + item.FirstName + " " + item.MiddleName + " " + item.Surname },
                                                        Comment: item.Comment,
                                                        StaffID: item.StaffID,
                                                        StaffName: item.StaffName,
                                                        ApplicationStatus: item.ApplicationStatus
                                                    })
                                                }, 200);
                                            }
                                        } catch (e) {
                                            console.log(e)
                                        }
                                    }} >
                                    <i className="fa fa-pen" />
                                </button>
                            ])
                        })
                    }
                    setData(rows)
                    setIsLoading(false);
                })
        } catch (e) {
            console.log(e)
            showAlert("Network Error", "please check your connection", "error")

        }
    }


    useEffect(() => {
        getData();
    }, []);

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

    const OnActionNoteChange = (e) => {
        setLeave({
            ...leave,
            ActionNote: e
        })
    }
    const addDays = (date, days) => {
        return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        if (leave.EntryID === "") {
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
            await axios.patch(`${serverLink}staff/human-resources/staff-leave/decide-leave`, leave, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        getData();
                        document.getElementById("leave").click();
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
                        toast.success("leave decision made successfully");

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
                    </div>



                    <div className="card-body pt-0">
                        <div className="col-md-12" style={{ overflowX: 'auto' }}>
                            <ReportTable data={data} columns={columns} height="700px" />
                        </div>
                    </div>


                    <Modal title={"Manage leave " + leave.StaffID + " -- " + leave.StaffName} id={"leave"} close={"leave"} large={true} style={{ width: '500px' }}>

                        {
                            leaveCategory.length > 0 &&
                            <div className="row col-md-12">
                                <div className="d-flex flex-column flex-grow-1 pe-8">
                                    <div className="d-flex flex-wrap">
                                        <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                            <div className="d-flex align-items-center">
                                                <div className="fs-2x fw-bold counted" data-kt-countup="true" data-kt-countup-value={4500} data-kt-countup-prefix="$" data-kt-initialized={1}>
                                                    {leave.LeaveDaysAllowed}
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
                                                <div className="fs-2x fw-bold counted" data-kt-countup="true" data-kt-countup-value={75} data-kt-initialized={1}>{leave.CasualDaysAllowed}</div>
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
                        <form onSubmit={onSubmit} >
                            <div className="form-group">
                                <label htmlFor="LeaveType">LeaveType</label>
                                <select disabled className="form-select" id="LeaveType" onChange={onEdit} value={leave.LeaveType}>
                                    <option value={""}>-select leave type-</option>
                                    <option value={"Main"}>Main</option>
                                    <option value={"Casual"}>Causal</option>
                                </select>
                            </div>
                            <br />
                            <div className="row ">
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
                            <div className="row">
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
                                    isDisabled={true}
                                    name="staffID"
                                    value={leave.ReliefStaffID2}
                                    onChange={onStaffChange}
                                    options={StaffList}
                                />
                            </div>
                            <br />
                            <div className="form-group">
                                <label htmlFor="Comment">Additional Comment</label>
                                <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(leave.Comment) }} />
                            </div>
                            <br />
                            <br />
                            <div className="form-group">
                                <label htmlFor="ApplicationStatus">Decision</label>
                                <select className="form-select" id="ApplicationStatus" onChange={onEdit}>
                                    <option value={""}>-select decision-</option>
                                    <option value={1}>Approve</option>
                                    <option value={2}>Deny</option>
                                </select>
                            </div>
                            <br />
                            <div className="form-group">
                                <label htmlFor="ActionNote">Action Note</label>
                                <JoditEditor
                                    value={leave.ActionNote}
                                    ref={editorRef}
                                    tabIndex={1}
                                    onChange={OnActionNoteChange}
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
export default connect(mapStateToProps, null)(StaffLeaveApplications);