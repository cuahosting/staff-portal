import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../resources/api";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import { showAlert, showConfirm } from "../../common/sweetalert/sweetalert";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";
import JoditEditor from "jodit-react";
import { toast } from "react-toastify";
import { formatDate, formatDateAndTime } from "../../../resources/constants";
import Loader from "../../common/loader/loader";

const StaffLeaveApply = (props) => {
    const editorRef = React.createRef();
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["SN", "Action", "Staff", "Leave Type", "Start Date", "End Date", "Days Taken", "Resumption Date", "Stage"];
    const [data, setData] = useState([]);
    const [StaffList, setStaffList] = useState([]);

    // Hardcode available leave types for now
    const leaveCategory = [
        { Name: "Main", LeaveDaysAllowed: 30 },
        { Name: "Casual", LeaveDaysAllowed: 10 },
        { Name: "Sick", LeaveDaysAllowed: 14 },
        { Name: "Maternity", LeaveDaysAllowed: 90 },
        { Name: "Paternity", LeaveDaysAllowed: 10 },
        { Name: "Study", LeaveDaysAllowed: 30 },
    ];

    let [leaveForm, setLeaveForm] = useState(false);
    const [notCompleted, setNotCompleted] = useState([]);
    const [daysTakenByType, setDaysTakenByType] = useState({});
    const staff_id = props.loginDetails[0].StaffID;

    const [leave, setLeave] = useState({
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
    });

    const getData = async () => {
        const { success, data: resultData } = await api.get(`staff/human-resources/staff-leave/leave-applications/${staff_id}`);

        if (success && resultData?.length > 0) {
            const not_completed = resultData.filter(x => x.ActionStage === 0 || x.ActionStage === 1 || x.ActionStage === 2);
            setNotCompleted(not_completed);

            // calculate days taken per leave type (approved only)
            const taken = {};
            resultData
                .filter(x => x.ApplicationStatus === 1)
                .forEach((x) => {
                    taken[x.LeaveType] = (taken[x.LeaveType] || 0) + Number(x.DaysTaken || 0);
                });
            setDaysTakenByType(taken);

            const rows = resultData.map((item, index) => {
                const staffLabel = item.ReliefStaffID ? `${item.ReliefStaffID}` : props.loginDetails[0].StaffID;
                return [
                    index + 1,
                    <>
                        {item.ActionStage === 1 ? (
                            <button className="btn btn-sm btn-primary" onClick={() => handleBegin(item)}>Begin</button>
                        ) : item.ActionStage === 2 ? (
                            <button className="btn btn-sm btn-primary" onClick={() => handleResume(item)}>Resume</button>
                        ) : (
                            <>--</>
                        )}
                    </>,
                    staffLabel,
                    item.LeaveType,
                    formatDateAndTime(item.StartDate, "date"),
                    formatDateAndTime(item.EndDate, "date"),
                    item.DaysTaken,
                    formatDateAndTime(item.ResumptionDate, "date"),
                    <label className={
                        item.ActionStage === 0 ? "badge badge-secondary"
                            : item.ActionStage === 1 ? "badge badge-primary"
                                : item.ActionStage === 2 ? "badge badge-info"
                                    : item.ActionStage === 3 ? "badge badge-success"
                                        : "badge badge-danger"
                    }>
                        {item.ActionStage === 0 ? "Pending Approval"
                            : item.ActionStage === 1 ? "Approved"
                                : item.ActionStage === 2 ? "Started"
                                    : item.ActionStage === 3 ? "Completed"
                                        : "Denied"}
                    </label>
                ];
            });
            setData(rows);
        }
        setIsLoading(false);
    };

    const getStaffList = async () => {
        const { success, data } = await api.get("staff/academics/timetable-planner/staff/list");

        if (success && data?.length > 0) {
            const rows = data.map(row => ({
                value: row.StaffID,
                label: row.StaffID + "--" + row.FirstName + " " + row.MiddleName + " " + row.Surname
            }));
            setStaffList(rows);
        } else {
            setStaffList([]);
        }
    };

    useEffect(() => {
        getData();
        getStaffList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onEdit = (e) => {
        const { id, value } = e.target;
        const updated = { ...leave, [id]: value };

        const startVal = id === "StartDate" ? value : leave.StartDate;
        const endVal = id === "EndDate" ? value : leave.EndDate;

        if (startVal && endVal) {
            const start = new Date(startVal);
            const end = new Date(endVal);
            const days = getBusinessDays(start, end);
            updated.DaysTaken = days;
            updated.ResumptionDate = formatDate(nextBusinessDay(end));
        }

        setLeave(updated);
    };

    const onStaffChange = async (e) => {
        setLeave({
            ...leave,
            ReliefStaffID2: e,
            ReliefStaffID: e?.value || ""
        });
    };

    const handleBegin = (item) => {
        showConfirm("Warning", "Are you sure you want to begin your leave days?", "warning")
            .then(async (isConfirmed) => {
                if (isConfirmed) {
                    const { success, data } = await api.patch(
                        `staff/human-resources/staff-leave/begin-staff-leave/${item.EntryID}`,
                        { InsertedBy: props.loginDetails[0].InsertedBy }
                    );

                    if (success && data?.message === "success") {
                        getData();
                        toast.success("Leave successfully started.");
                    }
                }
            });
    };

    const handleResume = (item) => {
        showConfirm("Warning", "Are you sure you have completed your leave days?", "warning")
            .then(async (isConfirmed) => {
                if (isConfirmed) {
                    const { success, data } = await api.patch(
                        `staff/human-resources/staff-leave/resume-staff/${item.EntryID}`,
                        { InsertedBy: props.loginDetails[0].InsertedBy }
                    );

                    if (success && data?.message === "success") {
                        getData();
                        toast.success("Leave successfully completed.");
                    }
                }
            });
    };

    // Business-day helpers
    const isWeekend = (d) => {
        const day = d.getDay();
        return day === 0 || day === 6;
    };

    const getBusinessDays = (start, end) => {
        if (!start || !end || end < start) return 0;
        let count = 0;
        const cursor = new Date(start);
        while (cursor <= end) {
            if (!isWeekend(cursor)) count++;
            cursor.setDate(cursor.getDate() + 1);
        }
        return count;
    };

    const nextBusinessDay = (date) => {
        const d = new Date(date);
        d.setDate(d.getDate() + 1);
        while (isWeekend(d)) {
            d.setDate(d.getDate() + 1);
        }
        return d;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (leave.LeaveType === "") {
            showAlert("Error", "Please select leave type", "error");
            return;
        }
        if (leave.StartDate === "") {
            showAlert("Error", "Please select StartDate", "error");
            return;
        }
        if (leave.EndDate === "") {
            showAlert("Error", "Please select EndDate", "error");
            return;
        }

        const selectedCategory = leaveCategory.find((c) => c.Name === leave.LeaveType);
        if (!selectedCategory) {
            showAlert("Error", "Invalid leave type selected", "error");
            return;
        }

        const allowed = parseInt(selectedCategory.LeaveDaysAllowed || 0);
        const alreadyTaken = parseInt(daysTakenByType[leave.LeaveType] || 0);
        const requested = parseInt(leave.DaysTaken || 0);

        if (requested > allowed) {
            showAlert("Error", `Sorry, you cannot apply for more than ${allowed} days for ${leave.LeaveType} leave`, "error");
            return;
        }

        if (alreadyTaken + requested > allowed) {
            showAlert("Error", "You do not have days left in this leave category", "error");
            return;
        }

        applyLeave();
    };

    const applyLeave = async () => {
        const { success, data } = await api.post("staff/human-resources/staff-leave/apply-leave", leave);

        if (success && data?.message === "success") {
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
            });
            toast.success("Leave application successful, kindly await response from the HR");
        } else if (success) {
            toast.error("Failed, please try again!");
        }
    };

    const OnCommentChange = (e) => {
        setLeave({ ...leave, Comment: e });
    };

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Staff Leave"}
                items={["Human Resources", "Staff Leave", "Apply"]}
            />

            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title"><h2>Leave Application</h2></div>

                        <div className="card-toolbar">
                            {leaveCategory.length > 0 ? (
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        disabled={notCompleted.length > 0}
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setLeaveForm(!leaveForm);
                                            setLeave({
                                                ...leave,
                                                LeaveType: "",
                                                StartDate: "",
                                                EndDate: "",
                                                DaysTaken: "",
                                                ResumptionDate: "",
                                                ReliefStaffID: "",
                                                Comment: "",
                                            });
                                        }}
                                    >
                                        {notCompleted.length > 0 ? "You cannot apply for leave now" : "Apply for leave"}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <label className="alert alert-warning">Sorry, you cannot apply for leave now, kindly contact the HR</label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card-body p-0">
                        <div>
                            {leaveCategory.length > 0 && (
                                <div className="row col-md-12">
                                    <div className="d-flex flex-wrap">
                                        {leaveCategory.map((cat, idx) => (
                                            <div key={idx} className="border border-gray-300 border-dashed rounded min-w-175px py-3 px-4 me-6 mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="fs-2x fw-bold counted">{cat.LeaveDaysAllowed}</div>
                                                </div>
                                                <div className="fw-semibold fs-6 text-gray-600">{cat.Name} Days Allowed</div>
                                                <div className="text-gray-600">Taken: {daysTakenByType[cat.Name] || 0}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {leaveForm === true && (
                                <form onSubmit={onSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="LeaveType">LeaveType</label>
                                        <SearchSelect
                                            id="LeaveType"
                                            value={leaveCategory.map(c => ({ label: c.Name, value: c.Name })).find(c => c.value === leave.LeaveType) || null}
                                            onChange={(selected) => onEdit({ target: { id: 'LeaveType', value: selected?.value || '' } })}
                                            options={leaveCategory.map(c => ({ label: c.Name, value: c.Name }))}
                                            placeholder="-select leave type-"
                                        />
                                    </div>
                                    <br />
                                    <div className="row col-md-12">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="StartDate">Start Date</label>
                                                <input type="date" required id="StartDate" onChange={onEdit} value={leave.StartDate} className="form-control" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="StartDate">End Date</label>
                                                <input type="date" disabled={leave.StartDate === ""} required id="EndDate" min={leave.StartDate} onChange={onEdit} value={leave.EndDate} className="form-control" />
                                            </div>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row col-md-12">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="DaysTaken">Number of Days</label>
                                                <input type="number" disabled id="DaysTaken" onChange={onEdit} value={leave.DaysTaken} className="form-control" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="ResumptionDate">Resumption Date</label>
                                                <input type="date" disabled id="ResumptionDate" onChange={onEdit} value={leave.ResumptionDate} className="form-control" />
                                            </div>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="form-group">
                                        <label htmlFor="ReliefStaffID">Relief Staff</label>
                                        <SearchSelect
                                            id="ReliefStaffID"
                                            value={leave.ReliefStaffID2}
                                            onChange={onStaffChange}
                                            options={StaffList}
                                            placeholder="Select Relief Staff"
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
                                        <button type="submit" className="btn btn-primary w-100">
                                            <span className="indicator-label">Submit</span>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                        <div className="col-md-12" style={{ overflowX: 'auto' }}>
                            {data.length > 0 && <ReportTable data={data} columns={columns} height="700px" />}
                        </div>
                    </div>

                    <Modal title={"Manage leave"} id={"leave"} close={"leave"}>
                        <form onSubmit={onSubmit}>
                            <div className="form-group">
                                <label htmlFor="Name">Name</label>
                                <input type="text" required id="Name" onChange={onEdit} value={leave.Name} className="form-control" placeholder="Enter Name" />
                            </div>
                            <br />
                            <div className="form-group">
                                <label htmlFor="Description">Description</label>
                                <input type="text" required id="Description" onChange={onEdit} value={leave.Description} className="form-control" placeholder="Enter Description" />
                            </div>
                            <br />
                            <div className="form-group">
                                <label htmlFor="LeaveDaysAllowed">LeaveDaysAllowed</label>
                                <input type="number" required min="0" id="LeaveDaysAllowed" onChange={onEdit} value={leave.LeaveDaysAllowed} className="form-control" placeholder="Enter LeaveDaysAllowed" />
                            </div>
                            <br />
                            <div className="form-group">
                                <label htmlFor="CasualDaysAllowed">CasualDaysAllowed</label>
                                <input type="number" required min="0" id="CasualDaysAllowed" onChange={onEdit} value={leave.CasualDaysAllowed} className="form-control" placeholder="Enter CasualDaysAllowed" />
                            </div>
                            <br />
                            <div className="form-group pt-2">
                                <button type="submit" className="btn btn-primary w-100">
                                    <span className="indicator-label">Submit</span>
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        loginDetails: state.LoginDetails,
        currentSemester: state.currentSemester
    };
};

export default connect(mapStateToProps, null)(StaffLeaveApply);
