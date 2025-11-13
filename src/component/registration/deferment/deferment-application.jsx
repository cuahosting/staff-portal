import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/report_table";
import { connect } from 'react-redux'
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { formatDateAndTime } from "../../../resources/constants";
import { toast } from "react-toastify";
import { showConfirm } from "../../common/sweetalert/sweetalert";

function DefermentApplications(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const columns = ["SN", "StudentID", "StudenName", "No of Semesters", "CurrentSemester", "ReturnSemester", "Applied On", "Status", "Reason", "Action"]
    const [reportData, setReportData] = useState([]);
    const [semesterList, setSemeterList] = useState([]);
    const [showTable, setshowTable] = useState(false);

    const columns2 = ["SN", "StudentID", "StudenName", "No of Semesters", "CurrentSemester", "ReturnSemester", "Applied On", "Status"];
    const [retrningStudents, setReturningStudents] = useState([]);

    const [deferment, setdeferment] = useState({
        SemesterCode: "",
        InsertedBy: props.LoginDetails[0].StaffID,
        Reason: ""
    });
    const CurrentSemester = props.CurrentSemester;

    const getSemeter = async () => {
        try {
            axios.get(`${serverLink}staff/timetable/timetable/semester`, token)
                .then((result) => {
                    setSemeterList(result.data)
                })

            getReturningStudents();
            setIsLoading(false)
        } catch (error) {
            console.log('NETWROK ERROR')
        }
    }
    const getReturningStudents = async () => {
        axios.get(`${serverLink}staff/registration/deferment-applications/returning/${CurrentSemester}`, token)
            .then((result) => {
                let rows = [];
                if (result.data.length > 0) {
                    result.data.map((item, index) => {
                        let status = item.Status === 0 ? "Pending"
                            : item.Status === 1 ? "Approved"
                                : item.Status === 2 ? "Rejected"
                                    : "Completed";
                        let classname = item.Status === 0 ? "badge badge-secondary"
                            : item.Status === 1 ? "badge badge-success"
                                : item.Status === 2 ? "badge badge-danger"
                                    : "badge badge-primary"
                        rows.push([
                            index + 1,
                            item.StudentID,
                            item.StudentName,
                            item.NumberOfSemesters,
                            item.CurrentSemester,
                            item.ReturnSemester,
                            formatDateAndTime(item.InsertedOn, "date"),
                            <span>
                                <label className={classname} >{status}</label>
                            </span>
                        ])
                    })
                    setReturningStudents(rows)
                } else {
                    setReturningStudents([])
                }
            })
    }

    const getDeferment = async (semester) => {
        axios.get(`${serverLink}staff/registration/deferment-applications/list/${semester}`, token)
            .then((result) => {
                let rows = [];
                if (result.data.length > 0) {
                    result.data.map((item, index) => {
                        let status = item.Status === 0 ? "Pending"
                            : item.Status === 1 ? "Approved"
                                : item.Status === 2 ? "Rejected"
                                    : "Completed";
                        let classname = item.Status === 0 ? "badge badge-secondary"
                            : item.Status === 1 ? "badge badge-success"
                                : item.Status === 2 ? "badge badge-danger"
                                    : "badge badge-primary"
                        rows.push([
                            index + 1,
                            item.StudentID,
                            item.StudentName,
                            item.NumberOfSemesters,
                            item.CurrentSemester,
                            item.ReturnSemester,
                            formatDateAndTime(item.InsertedOn, "date"),
                            <span>
                                <label className={classname} >{status}</label>
                            </span>,
                            <div className="btn-group btn-group-toggle" data-toggle="buttons">
                                <button data-bs-toggle="modal" data-bs-target="#deferment" className="btn btn-sm btn-primary"
                                    onClick={() => {
                                        setdeferment({
                                            ...deferment,
                                            Reason: item.Reason
                                        })

                                    }}
                                > View Reason
                                </button>
                            </div>,
                            <span>
                                <div className="btn-group btn-group-toggle" data-toggle="buttons">
                                    {/* disabled={item.Status === 1 || item.Status === 4 ? true : false} */}
                                    <button disabled={item.Status === 1 || item.Status === 4 ? true : false} className="btn btn-sm btn-success me-2" onClick={() => { handleApprove(item.EntryID, semester) }}>Approve</button>
                                    <button
                                    disabled={item.Status === 1 || item.Status === 4 ? true : false}
                                        className="btn btn-sm btn-danger " onClick={() => { handleReject(item.EntryID, semester) }}>Reject</button>
                                </div>
                            </span>


                        ])
                    })
                    setReportData(rows)
                    setshowTable(true)
                } else {
                    toast.error('no records...')
                    setReportData([])
                }
            })
    }

    const handleApprove = async (id, semester) => {
        await axios.patch(`${serverLink}staff/registration/deferment/approve/${id}`, { InsertedBy: deferment.InsertedBy }, token)
            .then((result) => {
                if (result.data.message === "success") {
                    toast.success('deferment approved successfully')
                    getDeferment(semester)
                } else {
                    toast.error('please try again...')
                }
            })
    }
    const handleReject = async (id, semester) => {
        await axios.patch(`${serverLink}staff/registration/deferment/reject/${id}`, { InsertedBy: deferment.InsertedBy }, token)
            .then((result) => {
                if (result.data.message === "success") {
                    toast.success('deferment rejected successfully')
                    getDeferment(semester)
                } else {
                    toast.error('please try again...')
                }
            })
    }
    const onEdit = (e) => {
        if (e.target.id === "") {
            toast.error('select semester')
        } else {
            setdeferment({
                ...deferment,
                [e.target.id]: e.target.value
            });
            getDeferment(e.target.value)
        }
    };

    const runReturningStudents = async () => {
        showConfirm(
            'WARNING', `Are you sure you want to run, this will resume all deferred students for semester ${CurrentSemester}`, 'warning'
        ).then(async (isConfirmed) => {
            if (isConfirmed) {
                toast.info('please wait...')
                axios.patch(`${serverLink}staff/registration/deferment/run-retuning-students/${CurrentSemester}`, { InsertedBy: deferment.InsertedBy }, token)
                    .then((result) => {
                        if (result.data.message === "success") {
                            toast.success('students successfully returned');
                            getReturningStudents();
                        }
                    })
            } else {

            }
        })

    };


    useEffect(() => {
        getSemeter();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Deferment"}
                items={["Registration", "Deferment", "Manage Deferment"]}
            />
            <div id="kt_content_container" className="container-custom container-xxl d-flex flex-column-fluid">

                <div className="pt-0 pb-0">
                    <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder">
                        <li className="nav-item mt-2">
                            <a className="nav-link text-active-primary ms-0 me-10 py-5 active" data-bs-toggle="tab" href="#kt_tabs_tab_1">Applications</a>
                        </li>
                        <li className="nav-item mt-2">
                            <a className="nav-link text-active-primary ms-0 me-10 py-5" data-bs-toggle="tab" href="#kt_tabs_tab_2">Returning Students</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex-column-fluid">
                <div
                    className="tab-content"
                    data-kt-scroll="true"
                    data-kt-scroll-activate="{default: true, lg: false}"
                    data-kt-scroll-height="auto"
                    data-kt-scroll-offset="70px"
                >
                    <div
                        className="tab-pane fade active show"
                        id="kt_tabs_tab_1"
                    >
                        <div className="flex-column-fluid">
                            <div className="card">
                                <div className="card-body pt-5">
                                    <select
                                        className="form-select mt-3"
                                        id="SemesterCode"
                                        value={deferment.SemesterCode}
                                        required
                                        onChange={onEdit}
                                    >
                                        <option value="">Select semester</option>
                                        {semesterList.length > 0 &&
                                            semesterList.map((semester, index) => (
                                                <option key={index} value={semester.SemesterCode}>
                                                    {semester.SemesterName}
                                                </option>
                                            ))}
                                    </select>
                                    <div className="col-md-12" style={{ overflowX: 'auto' }}>
                                        {
                                            showTable &&
                                            <ReportTable  columns={columns} data={reportData} title={"Deferement"} />
                                        }
                                    </div>
                                </div>
                            </div>
                            <Modal id="deferment" title={"Deferment Reason"}>
                                <div className="row">
                                    <p>
                                        {deferment.Reason}
                                    </p>
                                </div>
                            </Modal>
                        </div>
                    </div>
                    <div
                        className="tab-pane fade"
                        id="kt_tabs_tab_2">
                        <div className="card">
                            <div className="card-header border-0 pt-6">
                                <div className="card-title" />
                                <div className="card-toolbar">
                                    <div
                                        className="d-flex justify-content-end"
                                        data-kt-customer-table-toolbar="base"
                                    >
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={runReturningStudents}
                                        >
                                            Run Returning Students
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="col-md-12" style={{ overflowX: 'auto' }}>
                                    <ReportTable id="returning" columns={columns2} data={retrningStudents} title={`Returning students for ${CurrentSemester} `} />
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        CurrentSemester: state.currentSemester
    };
};
export default connect(mapStateToProps, null)(DefermentApplications);
