import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { setgeneralDetails } from "../../../actions/setactiondetails";
import { Link } from "react-router-dom";
import { formatDateAndTime } from "../../../resources/constants";
import "../attendance/attendance.css";

function GenerateAttendance(props)
{
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [attendanceCard, setAttendanceCard] = useState([]);
    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Module Code",
                field: "ModuleCode"
            },
            {
                label: "Module",
                field: "ModuleName",
            },
            {
                label: "Day",
                field: "DayName",
            },
            {
                label: "Start",
                field: "StartTime",
            },
            {
                label: "End",
                field: "EndTime",
            },
            {
                label: "Module Kind",
                field: "ModuleType",
            },
            {
                label: "Mark Attendance",
                field: "Mark",
            },
            {
                label: "Attendance Card",
                field: "Generate",
            },

        ],
        rows: [],
    });

    const [selectedDate, setSelectedDate] = useState("");

    const [formData, setFormData] = useState({
        SelectedDate: "",
        Schedule: "",
        ModuleCode: "",
        InsertedBy: `${props.loginData[0].StaffID} `
    });

    const printNow = () =>
    {
        window.print();
    }


    const getStaffTimetable = async (date) =>
    {
        await axios
            .get(`${serverLink}staff/assessment/attendance/timetable/${formData.InsertedBy}`, token)
            .then((result) =>
            {
                if (result.data.length > 0)
                {
                    let rows = [];
                    result.data.map((timetable, index) =>
                    {
                        setFormData({
                            ...formData,
                            SelectedDate: date,
                            Schedule: timetable.EntryID,
                            ModuleCode: timetable.ModuleCode,
                        })
                        rows.push({
                            sn: index + 1,
                            ModuleCode: timetable.ModuleCode ?? "N/A",
                            ModuleName: timetable.ModuleName ?? "N/A",
                            DayName: timetable.DayName ?? "N/A",
                            StartTime: timetable.StartTime ?? "N/A",
                            EndTime: timetable.EndTime ?? "N/A",
                            ModuleType: timetable.ModuleType ?? "N/A",
                            Mark: (
                                <Link to={"/assessments/attendance/list"}>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={async () =>
                                        {
                                            const attendanceData = {
                                                ModuleCode: timetable.ModuleCode,
                                                Schedule: timetable.EntryID,
                                                SelectedDate: date,
                                            };
                                            props.setOnGeneralDetails(attendanceData);
                                        }}
                                    >
                                        <i className="fa fa-check-circle" />
                                    </button>
                                </Link>
                            ),
                            Generate: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => onGenerateAttendanceCard(timetable.ModuleCode, date, timetable.EntryID)}
                                >
                                    <i className="fa fa-id-card" />
                                </button>
                            ),
                        });
                    });

                    setDatatable({
                        ...datatable,
                        columns: datatable.columns,
                        rows: rows,
                    });
                }

                setIsLoading(false);
            })
            .catch((err) =>
            {
                console.log("NETWORK ERROR");
            });
    };

    const onEdit = (e) =>
    {
        if (e.target.id === "SelectedDate")
        {
            if (e.target.value !== "")
            {
                getStaffTimetable(e.target.value);
            }
        }
        setSelectedDate(e.target.value);
    };


    const onGenerateAttendanceCard = async (module, date, schedule) =>
    {
        let sendData = { SelectedDate: date, Schedule: schedule, ModuleCode: module, InsertedBy: formData.InsertedBy };
        await axios
            .post(`${serverLink}staff/assessment/attendance/generate-attendance-card`, sendData, token)
            .then((result) =>
            {
                if (result.data.message === "success")
                {
                    setAttendanceCard(result.data.generated_token);
                    toast.success("Attendance cards has been generated successfully");
                    document.getElementById("card").click()
                } else if (result.data.message === "exist")
                {
                    toast.error("Sorry, all generated attendance cards have been used...");
                } else if (result.data.message === "empty")
                {
                    toast.error("Sorry, there is no student taking this module...");
                } else
                {
                    toast.error("Something went wrong, please try again!");
                }
            })
    }


    useEffect(() =>
    {
    }, []);

    return isLoading ? (
        <Loader />
    ) : (<>
        <div className="d-flex flex-column flex-row-fluid hideFooter">
            <PageHeader
                title={"Mark Attendance"}
                items={["Assessment", "Attendance", "Mark Attendance"]}
            />
            <div className="flex-column-fluid">
                <div className="card hideFooter">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                        <div className="card-toolbar">
                            <div className="pull-left" >
                                <input type="date" name="SelectedDate" id="SelectedDate" className="form-control" onChange={onEdit} value={selectedDate} />
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0 hideFooter">
                        <AGTable data={datatable} />
                    </div>

                </div>
            </div>
        </div>
        <button type="button" id="card" hidden={true} data-bs-toggle="modal" data-bs-target="#kt_modal_general" />
        <Modal title={"Attendance Card"} large={true} style={{ width: "500px" }}>
            <div className="row">
                {
                    attendanceCard.length > 0 && attendanceCard.map((item, index) =>
                    {
                        return (
                            <div key={index} className="col-md-4 mb-2">
                                <div className="card">
                                    <div className="card-body">
                                        {formData.ModuleCode} | 23A | {selectedDate} <br />
                                        <small>expires: {formatDateAndTime(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1 * 7), 'date')}</small>
                                        <hr />
                                        <h4><b>{item}</b></h4>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
            <button id="printPageButton" onClick={printNow} className="btn btn-secondary mb-5 mt-3">Print <i className="fa fa-print" /></button>
        </Modal>
    </>);
}

const mapStateToProps = (state) =>
{
    return {
        loginData: state.LoginDetails,
    };
};

const mapDisptachToProps = (dispatch) =>
{
    return {
        setOnGeneralDetails: (p) =>
        {
            dispatch(setgeneralDetails(p));
        },
    };
};

export default connect(mapStateToProps, mapDisptachToProps)(GenerateAttendance);