import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { ThreeDots } from "react-loader-spinner";
// import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

function AttendanceList(props)
{
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [datatable, setDatatable] = useState({
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
                label: "Student Name",
                field: "StudentName",
            },
            {
                label: "Course",
                field: "Course",
            },
            {
                label: "Level",
                field: "Level",
            },
            {
                label: "Semester",
                field: "Semester",
            },
            {
                label: "Status",
                field: "Status",
            },
            {
                label: "Attended",
                field: "Attended",
            },

        ],
        rows: [],
    });

    const [formData, setFormData] = useState({
        SelectedDate: props.attendanceData.SelectedDate,
        Schedule: props.attendanceData.Schedule,
        ModuleCode: props.attendanceData.ModuleCode,
        InsertedBy: `${props.loginData[0].StaffID} `
    });


    const getAttendanceList = async () =>
    {
        await axios
            .post(`${serverLink}staff/assessment/attendance/attended`, formData, token)
            .then((result) =>
            {
                if (result.data.length > 0)
                {

                    let rows = [];
                    console.log(result.data)
                    result.data.map((attendance, index) =>
                    {
                        rows.push({
                            sn: index + 1,
                            StudentID: attendance.StudentID ?? "N/A",
                            StudentName: attendance.StudentName ?? "N/A",
                            Course: attendance.Course ?? "N/A",
                            Level: attendance.Level ?? "N/A",
                            Semester: attendance.Semester ?? "N/A",
                            Status: attendance.Status ?? "N/A",
                            Attended: attendance.Attended === 0 ? (
                                isFormLoading ? <ThreeDots height="40" width="40" color="grey" ariaLabel="loading" />
                                    : <input
                                        type="checkbox"
                                        id="Attended"
                                        className="form-check-input"
                                        data={attendance.StudentID}
                                        value={1}
                                        onChange={onEdit}
                                        checked={false}
                                    />
                            )
                                : (
                                    // <input
                                    //     type="checkbox"
                                    //     id="Attended"
                                    //     className="form-check-input"
                                    //     checked={true}
                                    //     disabled
                                    // />
                                    (<span className="text-success">attended</span>)
                                ),
                        });
                    });

                    setDatatable({
                        ...datatable,
                        columns: datatable.columns,
                        rows: rows,
                    });
                }
                setIsFormLoading(false);
                setIsLoading(false);
            })

            .catch((err) =>
            {
                console.log("NETWORK ERROR");
            });
    };

    const onEdit = async (e) =>
    {
        let value = e.target.value;
        let student_id = e.target.getAttribute('data');
        let sendData = { ...formData, StudentID: student_id };
        setIsFormLoading(true);
        await axios
            .post(`${serverLink}staff/assessment/attendance/mark-attendance`, sendData, token)
            .then((result) =>
            {
                if (result.data.message === "success")
                {
                    toast.success("Attendance was marked successfully");
                    getAttendanceList();
                }
            })

    };


    useEffect(() =>
    {
        getAttendanceList();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Mark Attendance"}
                items={["Assessment", "Attendance", "Mark Attendance"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                    </div>
                    <div className="card-body pt-0">
                        <Table data={datatable} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) =>
{
    return {
        loginData: state.LoginDetails,
        attendanceData: state.generalDetails,
    };
};

export default connect(mapStateToProps, null)(AttendanceList);

