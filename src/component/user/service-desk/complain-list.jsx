import React, { useState } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import axios from 'axios'
import { toast } from "react-toastify";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { serverLink } from "../../../resources/url";
import { useEffect } from "react";
import JoditEditor from "jodit-react";
import ReportTable from "../../common/table/report_table";
import Select from 'react-select';
import { formatDateAndTime, shortCode } from "../../../resources/constants";
import * as DOMPurify from 'dompurify';

const ComplainList = (props) => {
    const token = props.LoginDetails[0].token;

    const color = ['success', 'danger', 'info', 'secondary', 'primary', 'warning']
    const editorRef = React.createRef();
    const [isLoading, setisLoading] = useState(true);
    const [complainTypes, setComplainTypes] = useState([]);
    const [isFormLoading, setIsFormLoading] = useState('off')
    const columns = ["SN", "FullName", "User Type", "Complain Type", "Title", "Description", "File", "Status", "Action"]
    const [complain, setComplain] = useState({
        StaffID: "",
        Stage: "",
        StageDescription: "",
        InsertedBy: props.LoginDetails[0].StaffID,
        currentSemester: props.currentSemester,
        EntryID: "",
        SemesterCode:""
    })
    const [semesterList, setSemesterList] = useState([]);
    const [data, setData] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [trackingList, setTrackingList] = useState([]);

    const getData = async () => {
        try {

            await axios.get(`${serverLink}staff/service-desk/complain-types/list`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        setComplainTypes(result.data)
                    }
                    setisLoading(false);
                })

            await axios.get(`${serverLink}staff/service-desk/timetable_semester`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        setSemesterList(result.data)
                    }
                })
            await axios.get(`${serverLink}staff/service-desk/staff-list`, token)
                .then((result) => {
                    let rows_ = []
                    if (result.data.length > 0) {
                        result.data.map((row) => {
                            rows_.push({ value: row.StaffID, label: row.StaffID+" - "+row.FirstName + " " + row.MiddleName + " " + row.Surname },)
                        });
                    }
                    setStaffList(rows_);
                })
        }
        catch (e) {
        }
    }

    const onMainLecturerChange = (e) => {
        setComplain({
            ...complain,
            StaffID: e
        })
    }

    const getComplainst = async (semester) => {
        if(semester === ""){
            toast.error("please select semester");
            setData([])
            return;
        }
        await axios.get(`${serverLink}staff/service-desk/complain-list/${semester}`, token)
            .then((result) => {
                let rows = [];
                if (result.data.length > 0) {
                    result.data.map((item, index) => {
                        rows.push([
                            index + 1,
                            item.UserType === "staff" ? item.StaffName : item.StudentName,
                            item.UserType,
                            complainTypes.filter(x => x.EntryID.toString() === item.ComplainType.toString())[0].ComplainType,
                            item.ComplainTitle,
                            <button className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#description" onClick={() => {
                                    setComplain({
                                        ...complain,
                                        Description: item.Description,
                                    });
                                }}>
                                Description
                            </button>,
                            <a className="btn btn-link" target={"_blank"} href={`${serverLink}public/uploads/${shortCode}/service-desk/${item.FilePath}`} >View File</a>,
                            <span className={item.Status === "Submitted" ? "badge badge-secondary"
                                : item.Status === "1" ? "badge badge-info"
                                    : item.Status === "2" ? "badge badge-info"
                                        : item.Status === "3" ? "badge badge-primary" : "badge badge-success"}
                            >
                                {item.Status === "Submitted" ? "Submitted"
                                    : item.Status === "1" ? "Assigned to staff"
                                        : item.Status === "2" ? "Esacalated"
                                            : item.Status === "3" ? "In-progress" : "Resolved"}
                            </span>,
                            <button className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#resolve" onClick={() => {
                                    setComplain({
                                        ...complain,
                                        EntryID: item.EntryID,
                                        Status: item.Status,
                                        SemesterCode: item.SemesterCode
                                    });
                                    setTrackingList([])
                                    getTracking(item.EntryID);
                                }}>
                                <i className="fa fa-pen" />
                            </button>
                        ])
                    })
                    setData(rows)
                } else {
                    toast.error('no records')
                    setData([])
                }
            })
    }

    const getTracking = async (complain_id) => {
        await axios.get(`${serverLink}staff/service-desk/tracking-list/${complain_id}`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setTrackingList(result.data)
                }
            })
    }

    const onSubmit = async () => {
        setIsFormLoading('on');
        try {
            await axios.post(`${serverLink}staff/service-desk/add-tracking`, complain, token)
                .then(async (result) => {
                    if (result.data.message === "success") {
                        getTracking(complain.EntryID);
                        getComplainst(complain.SemesterCode);
                        setIsFormLoading('off');
                        toast.success("progress added succesfully")
                        setComplain({
                            ...complain,
                            StaffID: "",
                            Stage: "",
                            StageDescription: "",
                            EntryID: "",
                        })
                        document.getElementById("close").click();

                    } else {
                        setIsFormLoading('off');
                        showAlert("ERROR", "complaint have already been submitted", 'error');
                    }
                })
        } catch (e) {
            showAlert("ERROR", "network error, please try again", 'error');
        }
    }

    const onEdit = (e) => {
        if (e.target.id === "SemesterCode") {
            setComplain({
                ...complain,
                [e.target.id]: e.target.value
            })    
            getComplainst(e.target.value);
        }
        setComplain({
            ...complain,
            [e.target.id]: e.target.value
        })

    }

    const onDescriptionChange = (e) => {
        setComplain({
            ...complain,
            "StageDescription": e
        })
    }
    useEffect(() => {
        getData();
    }, [])

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Service Desk"}
                items={["Users", "Service Desk", "Complain List"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body pt-5">
                        <div className="row col-md-12 mb-5 mt-5">
                            <div className="form-group">
                                <label htmlFor="SemesterCode">Semester </label>
                                <select id="SemesterCode" onChange={onEdit}
                                    value={complain.SemesterCode} className="form-select" >
                                    <option value={""}>-select type-</option>
                                    {
                                        semesterList.length > 0 &&
                                        semesterList.map((x, i) => {
                                            return (
                                                <option key={i} value={x.SemesterCode} >{x.SemesterName} </option>
                                            )
                                        })
                                    }
                                </select>
                            </div>
                            <div className="col-md-12 mt-5">
                                {
                                    data.length > 0 &&
                                    <ReportTable columns={columns} data={data} height="700px" />
                                }
                            </div>

                            <Modal title={"Complaint description"} id="description" width={"500px"} close="close">
                                <div className="col-md-12">
                                    <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(complain.Description) }} ></p>
                                </div>
                            </Modal>

                            <Modal title={"Resolve Complaint"} id="resolve" large={true} style={{ width: '500px' }}>
                                <div className="row col-md-12">
                                    <div className="card-body">
                                        <div className="timeline-label mb-5">
                                            {
                                                trackingList.length > 0 ?
                                                    <>
                                                        <div className="timeline-item">
                                                            <div className="timeline-label fw-bold text-gray-800 fs-6">time</div>
                                                            <div className="timeline-badge">
                                                                <i className="fa fa-genderless text-success fs-1" />
                                                            </div>
                                                            <div className="timeline-content d-flex">
                                                                <span className="fw-bold text-gray-800 ps-3">Complain Tracking timeline</span>
                                                            </div>
                                                        </div>
                                                        {
                                                            trackingList.map((x, y) => {
                                                                var color_ = color[Math.floor(Math.random() * color.length)];
                                                                let date_ = new Date(x.InsertedDate)
                                                                let date = formatDateAndTime(x.InsertedDate, "date")
                                                                let hrs = date_.getHours();
                                                                let mins = date_.getMinutes();
                                                                if (hrs <= 9)
                                                                    hrs = '0' + hrs
                                                                if (mins < 10)
                                                                    mins = '0' + mins
                                                                const postTime = hrs + ':' + mins
                                                                return (
                                                                    <div className="timeline-item" key={y}>
                                                                        <div className="timeline-label fw-bolder text-gray-800 fs-6">{postTime}</div>
                                                                        <div className="timeline-badge">
                                                                            <i className={`fa fa-genderless text-${color_} fs-1`} />
                                                                        </div>
                                                                        <div className="fw-mormal timeline-content ps-3">
                                                                            <span className="fw-bolder text-gray-400 fs-8">{date} : {postTime}</span><br />
                                                                            <span className="fw-bold" >
                                                                                {x.ActionBy}:
                                                                            </span><span style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(x.Description) }} />
                                                                            {x.AssignedTo !=="" &&
                                                                                <p>Action Assigned To: <span className="fw-bold">{x.AssignedTo} {x.StaffName}</span></p>}

                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </> :
                                                    <>
                                                        <label className="alert alert-info badge-lg">
                                                            No Tracking Record Found
                                                        </label>
                                                    </>
                                            }
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="Stage">Stage</label>
                                            <select id="Stage" onChange={onEdit}
                                                value={complain.Stage} className="form-select" >
                                                <option value={""}>-select stage-</option>
                                                <option value={"1"}>Assigned to staff</option>
                                                <option value={"2"}>Escalated</option>
                                                <option value={"3"}>In Progress</option>
                                                <option value={"4"}>Resolved</option>
                                            </select>
                                        </div>
                                    </div>
                                    {
                                        complain.Stage === "1" || complain.Stage === "2" ?
                                            <div className="col-md-12 mt-5">
                                                <div className="form-group">
                                                    <label htmlFor="Staff">Staff</label>
                                                    <Select
                                                        name="Staff"
                                                        value={complain.StaffID}
                                                        onChange={onMainLecturerChange}
                                                        options={staffList}
                                                    />
                                                </div>
                                            </div>
                                            : <></>
                                    }
                                    <div className="col-md-12 mt-5">
                                        <label htmlFor="StageDescription">Description</label>
                                        <JoditEditor
                                            value={complain.StageDescription}
                                            ref={editorRef}
                                            tabIndex={1}
                                            onChange={onDescriptionChange}
                                        />

                                    </div>
                                    <div className="col-md-12 mt-5">
                                        <button disabled={complain.Status === "4"?true: false} type="button" onClick={onSubmit} className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={isFormLoading}>
                                            <span className="indicator-label">{complain.Status === "4" ? "Complain Resolved":"Submit"}</span>
                                            <span className="indicator-progress">Please wait...
                                                <span className="spinner-border spinner-border-sm align-middle ms-2" />
                                            </span>
                                        </button>

                                    </div>

                                </div>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}
const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        currentSemester: state.currentSemester
    };
};
export default connect(mapStateToProps, null)(ComplainList);