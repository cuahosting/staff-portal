import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert, showConfirm } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
import ReportTable from "../../common/table/report_table";
import { ChangeOfCourseEmail, formatDateAndTime, sendEmail } from "../../../resources/constants";


function ChangeOfCourseRegistrarOfficeApproval(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off')
    const columns = ["SN", "StudentID", "Student Name", "Level", "Current Course ", "Requested Course", "Semester", "Guardian", "Stage", "Approved By", "Approval Date", "Final Status", "Actions", "Result"]
    const [tableData, setTableData] = useState([]);

    const result_columns = ["sn", "ModuleCode", "ModuleName", "Semester", "Level", "CA Score", "Exam Score", "Total", "Grade", "Decision"]
    const [result_data, setResultData] = useState([]);
    const [result_, Setresult_] = useState([])

    const [result, setResult] = useState([]);

    const getChangeofCourse = async () => {
        //let result_ = [];
        await axios.get(`${serverLink}staff/registration/change-of-course/result/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    //result_.push(result.data)
                    setResult(result.data);
                    Setresult_(result.data)
                }

            })
    };


    const getApplications = async () => {
        await axios.get(`${serverLink}staff/registration/change-of-course/applications/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((item, index) => {
                        const status = item.Status === 5 ? "Approved" : item.Status === 6 ? "Denied" : "Pending";
                        const RegistrarApprovedBy = item.RegistrarApprovedBy !== null ? item.RegistrarApprovedBy : "--";
                        const disabled = item.Status === 3 || item.Status === 4 ? false : true;
                        let stage = item.Status === 0 ? "Pending Guardian Approval" :
                            item.Status === 1 ? "Guardian Approved" :
                                item.Status === 2 ? "Guardian Denied" :
                                    item.Status === 3 ? "Admission Officer Approved" :
                                        item.Status === 4 ? "Admission Officer Denied" :
                                            item.Status === 5 ? "Registrar Approved" :
                                                "Registrar Denied";
                        rows.push([
                            index + 1,
                            item.StudentID,
                            item.StudentName,
                            item.StudentLevel + " Level",
                            item.CourseName,
                            item.RequestedCourseName,
                            item.SemesterCode,
                            <div>
                                <div>{item.GuardianName}</div>
                                <div>{item.GuardianEmailAddress}</div>
                                <div>{item.GuardianPhone}</div>
                            </div>,
                            stage,
                            RegistrarApprovedBy,
                            formatDateAndTime(item.AdmissionApprovedDate, "date"),
                            <span className={item.Status === 5 ? "badge badge-success" : item.Status === 6 ? "badge badge-danger" : "badge badge-secondary"}>
                                {item.Status === 5 ? "Approved" : item.Status === 6 ? "Denied" : "Pending"}
                            </span>,
                            (
                                <>
                                    <span className="d-flex justify-content-center">
                                        <button
                                            disabled={disabled}
                                            className="btn btn-sm btn-primary"
                                            onClick={() => {
                                                handleApprove(item)
                                            }
                                            }
                                        >
                                            Approve
                                        </button>
                                        <button
                                            disabled={disabled}
                                            className="btn btn-sm btn-danger ms-2"
                                            onClick={() => {
                                                handleDeny(item)
                                            }
                                            }
                                        >
                                            Deny
                                        </button>
                                    </span>
                                </>
                            ),
                            (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#result"
                                    onClick={() => {
                                        setResultData([])
                                        const res_ = result_?.filter(x => x.StudentID === item.StudentID);
                                        let res_rows = [];
                                        if (res_.length > 0) {
                                            res_.map((_res, _index) => {
                                                res_rows.push([
                                                    _index + 1,
                                                    _res.ModuleCode,
                                                    _res.ModuleTitle,
                                                    _res.SemesterCode,
                                                    _res.StudentLevel,
                                                    _res.CAScore,
                                                    _res.ExamScore,
                                                    _res.Total,
                                                    _res.StudentGrade,
                                                    _res.Decision,

                                                ])
                                            })
                                            setResultData(res_rows)
                                        }
                                    }
                                    }
                                >
                                    View Result
                                </button>
                            )
                        ]);
                    });

                    setTableData(rows);
                }

                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    }

    useEffect(() => {
        getApplications();
    }, [result_])

    const handleApprove = async (data) => {
        let old_student_id = data.StudentID;
        let new_student_id = old_student_id.replace(old_student_id.split('/')[1], data.RequestedFaculty)
        console.log(new_student_id)
        showConfirm("CONFIRM APPROVAL", "Are you sure you want to approve?", "warning")
            .then(async (IsConfirmed) => {
                if (IsConfirmed) {
                    try {
                        await axios.patch(`${serverLink}staff/registration/change-of-course/registrar-approval`,
                            { EntryID: data.EntryID, AdmissionApprovedBy: props.LoginDetails[0]?.StaffID, data: data, new_student_id: new_student_id }, token
                        )
                            .then((result) => {
                                if (result.data.message === "success") {
                                    getApplications()
                                    toast.success('Course change approved successfully');
                                    let email = ChangeOfCourseEmail(data, new_student_id);
                                    sendEmail(data.EmailAddress, email.subject, email.title, old_student_id, email.body, '')


                                } else {
                                    toast.error('please try again')
                                }
                            })
                    } catch (e) {
                        console.log('NETWORK ERROR')
                    }
                } else {

                }
            })
    }

    const handleDeny = async (data) => {
        showConfirm("CONFIRM DENY", "Are you sure you want to deny?", "warning")
            .then(async (IsConfirmed) => {
                if (IsConfirmed) {
                    try {
                        await axios.patch(`${serverLink}staff/registration/change-of-course/registrar-denial`,
                            { EntryID: data.EntryID, AdmissionApprovedBy: props.LoginDetails[0].StaffID }, token
                        )
                            .then((result) => {
                                if (result.data.message === "success") {
                                    toast.success('Course Change denied');
                                    getChangeofCourse();

                                } else {
                                    toast.error('please try again')
                                }
                            })
                    } catch (e) {
                        console.log('NETWORK ERROR')
                    }
                } else {

                }
            })
    }

    useEffect(() => {
        getChangeofCourse();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Change of course"}
                items={["Registration", "Change of Course", "Registrar Office Approval"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body p-0">
                        <div className="col-md-12" style={{ overflowX: 'auto' }}>
                            <ReportTable columns={columns} data={tableData} title={"Registrar Approval"} />

                        </div>
                    </div>
                </div>


                <Modal title={"Student result"} id={"result"} close={"result"} large={true} style={{ width: '500px' }}>

                    {
                        result_data.length > 0 ?
                            <ReportTable columns={result_columns} data={result_data} title={"Student Result"} />
                            :
                            <label className="alert alert-warning">No results</label>
                    }


                </Modal>
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

export default connect(mapStateToProps, null)(ChangeOfCourseRegistrarOfficeApproval);
