import React, { useEffect, useState } from "react";
import { api } from "../../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../../common/loader/loader";
import AGTable from "../../../common/table/AGTable";
import { toast } from "react-toastify";
import { showAlert, showConfirm, showContentAlert } from "../../../common/sweetalert/sweetalert";
import PageHeader from "../../../common/pageheader/pageheader";

function FinanceAllowRegistration(props) {
    const [isFormLoading, setIsFormLoading] = useState('off');

    const [isLoading, setIsLoading] = useState(true);
    const [requestBy, setRequestBy] = useState("");
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
                label: "Course Name",
                field: "CourseName",
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
        const { success, data } = await api.get("staff/student-manager/finance/registration/clearance");
        if (success && data && data.length > 0) {
            let rows = [];
            data.map((item, index) => {
                rows.push({
                    sn: index + 1,
                    StudentID: item.StudentID,
                    FirstName: item.FirstName,
                    MiddleName: item.MiddleName,
                    Surname: item.Surname,
                    StudentLevel: item.StudentLevel,
                    StudentSemester: item.StudentSemester.replace("Semester", ""),
                    CourseName: item.CourseName,
                    unblock: (
                        <button className="btn btn-primary btn-sm" onClick={() => onAllowRegistration(item)}> Unblock <i className="fa fa-unlock" /></button>
                    ),
                    unblockRequest: (
                        <button className="btn btn-primary btn-sm" onClick={() => onAllowRegistrationRequest(item)}> Unblock Request <i className="fa fa-send" /></button>
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
    }


    const onAllowRegistration = async (data) => {
        let sendData = {
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
            `Are you sure you want to unblock ${studentName} for Registration?`,
            "warning"
        ).then(async (IsConfirmed) => {
            if (IsConfirmed) {
                const { success, data } = await api.post("staff/finance/allow-student-registration", sendData);
                if (success && data.message === "success") {
                    getData()
                    toast.success("Registration Access Granted Successfully");
                } else {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            }
        });
    }


    const onAllowRegistrationRequest = async (data) => {
        let studentName = `${data.FirstName} ${data.MiddleName} ${data.Surname}`
        showContentAlert(
            `Unblock  ${studentName} `,
        ).then(async (StaffID) => {
            if (!StaffID) {
                throw showAlert("EMPTY FIELD", "Please enter the StaffID", "error");
                return false;
            } else {
                let sendData = {
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
                return await api.post("staff/finance/allow-student-registration", sendData)
            }

        }).then(result => {
            if (result.success && result.data.message === "success") {
                getData()
                toast.success("Request Sent Successfully");
                showAlert(
                    "FINANCE UNBLOCK STUDENT",
                    "Request Sent Successfully",
                    "success"
                );
            } else {
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
                <div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width: '100%' }}>
                    <div className="">
                        <PageHeader
                            title={"FINANCE UNBLOCK STUDENT REGISTRATION"}
                            items={["Human-Resources", "Finance", "Finance Unblock Student Registration"]}
                        />
                        <div className="row col-md-12" style={{ width: '100%' }}>
                            <AGTable data={studentDatatable} />
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
export default connect(mapStateToProps, null)(FinanceAllowRegistration);
