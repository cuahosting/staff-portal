import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import { connect } from "react-redux/es/exports";
import Loader from "../../../common/loader/loader";
import Table from "../../../common/table/table";
import {toast} from "react-toastify";
import {showAlert, showConfirm, showContentAlert} from "../../../common/sweetalert/sweetalert";
import PageHeader from "../../../common/pageheader/pageheader";

function FinanceAllowResult(props) {
    const token = props.LoginDetails[0].token;

    const [isFormLoading, setIsFormLoading] = useState('off');
    const [requestBy, setRequestBy] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [studentDatatable, setStudentDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Student ID",
                field: "StudentID",
            },
            {
                label: "First Name",
                field: "FirstName",
            },
            {
                label: "Surname",
                field: "Surname",
            },
            {
                label: "Middle Name",
                field: "MiddleName",
            },
            {
                label: "Student Level",
                field: "StudentLevel",
            },
            {
                label: "Student Semester",
                field: "StudentSemester",
            },
            {
                label: "Unblock",
                field: "unblock",
            },
            {
                label: "Unblock Request",
                field: "unblockRequest",
            },

        ],
        rows: [],
    });

    const getData = async () => {
        await axios.get(`${serverLink}staff/student-manager/finance/result/clearance`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((item, index) => {
                        rows.push({
                            sn: index + 1,
                            StudentID: item.StudentID,
                            FirstName: item.FirstName,
                            MiddleName: item.MiddleName,
                            Surname: item.Surname,
                            StudentLevel: item.StudentLevel,
                            StudentSemester: item.StudentSemester,
                            CourseName: item.CourseName,
                            unblock: (
                                <button className="btn btn-primary btn-sm" onClick={()=>onAllowResult(item)}> Unblock <i className="fa fa-unlock"/></button>
                            ),
                            unblockRequest: (
                                <button className="btn btn-primary btn-sm" onClick={()=>onAllowResultRequest(item)}> Unblock Request <i className="fa fa-send"/></button>
                            ),
                        });
                    });
                    setStudentDatatable({
                        ...studentDatatable,
                        columns: studentDatatable.columns,
                        rows: rows,
                    });

                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err)
                console.log('NETWORK ERROR');
            });
    }


    const onAllowResult = async (data) => {
        let sendData ={
            StudentID: data.StudentID,
            FirstName: data.FirstName,
            MiddleName: data.MiddleName,
            Surname: data.Surname,
            CourseCode: data.CourseCode,
            CourseName: data.CourseName,
            StudentLevel: data.StudentLevel,
            StudentSemester: data.StudentSemester,
            EmailAddress: data.EmailAddress,
            InsertedBy: props.LoginDetails[0].StaffID,
            RequestBy: requestBy
        };

        let studentName = `${data.FirstName} ${data.MiddleName} ${data.Surname}`
        showConfirm(
            "CONFIRM UNBLOCKING",
            `Are you sure you want to unblock ${studentName} for Result?`,
            "warning"
        ).then( async (IsConfirmed) => {
            if (IsConfirmed)  {
                await axios.post(`${serverLink}staff/finance/allow-student-result`, sendData, token)
                    .then(result => {
                        if (result.data.message === "success") {
                            getData()
                            toast.success("Result Access Granted Successfully");
                        }else {
                            showAlert(
                                "ERROR",
                                "Something went wrong. Please try again!",
                                "error"
                            );
                        }
                    })
                    .catch(err => {
                        console.error('ERROR', err);
                    })
            } else {

            }
        });
    }


    const onAllowResultRequest = async (data) => {
        let studentName = `${data.FirstName} ${data.MiddleName} ${data.Surname}`
        showContentAlert(
            `Unblock  ${studentName} `,
        ).then( async (StaffID) => {
            if (!StaffID) {
                throw  showAlert("EMPTY FIELD", "Please enter the StaffID", "error");
                return false;
            }else{
                let sendData ={
                    StudentID: data.StudentID,
                    FirstName: data.FirstName,
                    MiddleName: data.MiddleName,
                    Surname: data.Surname,
                    CourseCode: data.CourseCode,
                    CourseName: data.CourseName,
                    StudentLevel: data.StudentLevel,
                    StudentSemester: data.StudentSemester,
                    EmailAddress: data.EmailAddress,
                    InsertedBy: props.LoginDetails[0].StaffID,
                    RequestBy: StaffID
                };
                return await axios.post(`${serverLink}staff/finance/allow-student-result`, sendData, token)
            }

        }).then(result => {
            if (result.data.message === "success") {
                getData()
                toast.success("Request Sent Successfully");
                showAlert(
                    "FINANCE UNBLOCK STUDENT",
                    "Request Sent Successfully",
                    "success"
                );
            }else {
                showAlert(
                    "ERROR",
                    "Something went wrong. Please try again!",
                    "error"
                );
            }

        })
            .catch(err => {
                if (err) {
                    showAlert("EMPTY FIELD", "Please enter the StaffID", "error");
                } else {
                    showContentAlert.stopLoading();
                    showContentAlert.close();
                }
            });

    }



    useEffect(() => {
        getData()
    }, []);

    return isLoading ? (
            <Loader />
        ) :
        (
            <>
                <div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width:'100%' }}>
                    <div className="">
                        <PageHeader
                            title={"FINANCE UNBLOCK STUDENT RESULT"}
                            items={["Human-Resources", "Finance", "Finance Unblock Student Result"]}
                        />
                        <div className="row col-md-12" style={{width:'100%'}}>
                            <Table  data={studentDatatable}/>
                        </div>
                    </div>

                </div>
            </>
        )
}


const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
    };
};
export default connect(mapStateToProps, null)(FinanceAllowResult);
