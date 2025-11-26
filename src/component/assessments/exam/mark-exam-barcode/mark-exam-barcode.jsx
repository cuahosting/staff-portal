import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import AgReportTable from "../../../common/table/report_table";
import { TimeTablePeriods, dynamicSort, formatDate } from "../../../../resources/constants";
import Select from "react-select";
import CsvDownloadButton from 'react-json-to-csv'


function MarkExamBarcode(props) {
    const token = props.loginData[0].token
    const [isLoading, setIsLoading] = useState(false);
    const [venue, setVenue] = useState([]);
    const [data, setData] = useState([]);
    const [data2, setData2] = useState([]);
    const columns = ["S/N", "Student ID", "Student Name", "Module Code", "Module Name", "Attendance", "Exam Hall", "Seat No", "Mark Attendance"];
    const [semesterList, setSemesterList] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [timetableList, setTimetableList] = useState([])
    const [examDates, setExamDates] = useState([])
    const [isMarking, setisMarking] = useState(false)


    const [formData, setFormData] = useState({
        VenueID: "",
        VenueID2: "",
        Date: "",
        Start: "",
        End: "",
        SemesterCode: "",
        SemesterCode2: "",
        ExamDate: "",
        ExamDate2: "",
        InsertedBy: props.loginData[0].StaffID
    })

    const getExamData = async () => {
        await axios
            .get(`${serverLink}staff/timetable/exam/data`, token)
            .then((response) => {
                let rows = [];
                response.data.Venue.length > 0 &&
                    response.data.Venue.map((row) => {
                        rows.push({ text: row.VenueName, id: row.EntryID, });
                    });
                setVenue(rows);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });

        await axios.get(`${serverLink}staff/timetable/timetable/semester`, token)
            .then((result) => {
                let rows = []
                if (result.data.length > 0) {
                    result.data.map((row) => {
                        rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode, id: "Semester" })
                    });
                    setSemesterList(result.data);
                    setSemesterOptions(rows)
                }
                setIsLoading(false)
            })
    };

    const [data3, setData3] = useState([])
    const getAttendanceData = async (hall_allocation_id) => {
        toast.info("Please wait...");
        await axios.get(`${serverLink}staff/timetable/exam/barcode/data/${hall_allocation_id}`, token)
            .then((response) => {
                if (response.data.length > 0) {
                    let rows = [];
                    response.data.length > 0 &&
                        response.data.map((row, index) => {
                            rows.push([(index + 1), row.StudentID, row.StudentName, row.ModuleCode,
                            row.ModuleName,
                            row.IsPresent == 1 ? "Attended" : "Not Attended",
                            row.HallName,
                            row.SeatNo,
                            (
                                row.IsPresent === 1 ?
                                    // <input type="checkbox" checked onChange={(e) => onUnMarkAttendance(row, e)} />
                                    <input type="checkbox" checked disabled /> :
                                    <input type="checkbox" checked={!true} onChange={(e) => onMarkAttendance(row, e)}
                                    />
                            )]);
                        });
                    setData(rows);
                    setData2(response.data)
                    let rows2 = [];
                    response.data.map((x, i) => {
                        rows2.push(
                            [x.StudentID, x.StudentName, x.HallName, x.ModuleCode, x.SeatNo, x.Barcode, '', '']
                        )
                    })
                    setData3(rows2.sort(function (a, b) {
                        return parseInt(a.SeatNo) - parseInt(b.SeatNo)
                    }))
                }
                if (response.data.length === 0) {
                    toast.error("No Record Found");
                    setData([]);
                    setData2([])
                    setData3([])
                }
            })
            .catch((err) => {
                toast.error("NETWORK ERROR");
                console.log("NETWORK ERROR");
            }).finally(() => {
                setIsLoading(false);
            })
    };

    const onSemesterChange = async (e) => {
        if (e.value !== "") {
            if (e.id === "Semester") {
                setFormData({
                    ...formData,
                    SemesterCode: e.value,
                    SemesterCode2: e,
                    TimetableID2: "",
                    TimetableID: "",
                    ExamDate: "",
                    ExamDate2: "",
                })
                setData([]);
                setData2([])
                setData3([])
                getTimetable(e.value);
            } else if (e.id === "ExamDate") {
                const filtered_data = ttData.length > 0 ? ttData.filter(k => formatDate(k.ExamDate) === e.value) : [];
                if (filtered_data.length > 0) {
                    let rows = []
                    filtered_data.map((row) => {
                        const start = TimeTablePeriods.filter(x => x.value === row.StartTime.toString())[0].label
                        const end = TimeTablePeriods.filter(x => x.value === row.EndTime.toString())[0].label
                        rows.push({
                            value: row.EntryID,
                            label: row.ModuleName + ` (${row.ModuleCode})` + " - " + row.VenueName + ` (${row.VenueID}) ---- ` + start + " - " + end,
                            id: "Timetable",
                            HallAllocationID: row.EntryID
                        })
                    });
                    setTimetableList(rows)
                }
                setFormData({
                    ...formData,
                    ExamDate2: e,
                    ExamDate: e.value,
                    TimetableID2: "",
                    TimetableID: ""
                })
                setData([]);
                setData2([])
                setData3([])
            } else if (e.id === "Timetable") {
                setFormData({
                    ...formData,
                    TimetableID: e.value,
                    TimetableID2: e,
                    HallAllocationID: e.HallAllocationID
                })
                getAttendanceData(e.HallAllocationID)
            }

        } else {
            setFormData({
                ...formData,
                SemesterCode: "",
                SemesterCode2: ""
            })
            setData([]);
            setData2([])
            setData3([])
        }
    }

    const [ttData, setTTData] = useState([])
    const getTimetable = async (e) => {
        setIsLoading(true)
        const { data } = await axios.get(`${serverLink}staff/timetable/exam-timetable/report/${e}`, token);
        if (data.length > 0) {
            const tt = [...new Set(data.map((r) => formatDate(r.ExamDate)))]
            setExamDates(tt.map((r) => { return { value: r, label: r, id: "ExamDate" } }))
            setTTData(data)
        }

        setIsLoading(false)
    }


    const onEdit = async (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    }

    const onMarkAttendance = async (data, e) => {
        let sendData = { ...formData, BarcodeID: data.EntryID }
        await axios.patch(`${serverLink}staff/timetable/exam/barcode/mark-attendance`, sendData, token).then((result) => {
            if (result.data.message === "success") {
                toast.success("Exam Attendance Marked Successfully");
                getAttendanceData(data.HallID);
            } else {
                showAlert(
                    "ERROR",
                    "Something went wrong. Please try again!",
                    "error"
                );
            }

        }).catch((err) => {
            console.log("NETWORK ERROR");
        });

    }

    const onUnMarkAttendance = async (data, e) => {
        let sendData = { ...formData, BarcodeID: data.EntryID }
        await axios.patch(`${serverLink}staff/timetable/exam/barcode/un-mark-attendance`, sendData, token).then((result) => {
            if (result.data.message === "success") {
                toast.success("Exam Attendance Un-Marked Successfully");
                getAttendanceData(data.HallID);
            } else {
                showAlert(
                    "ERROR",
                    "Something went wrong. Please try again!",
                    "error"
                );
            }

        }).catch((err) => {
            console.log("NETWORK ERROR");
        });

    }


    const onMarkAll = async () => {
        setisMarking(true)
        await axios.patch(`${serverLink}staff/timetable/exam/barcode/mark-attendance/all`, data2, token).then((result) => {
            if (result.data.message === "success") {
                toast.success("Exam Attendance Marked Successfully");
                const dt = formData.TimetableID2
                getAttendanceData(dt.HallAllocationID);
            } else if (result.data.message === "no data") {
                showAlert(
                    "ERROR",
                    "No Attendace Data",
                    "error"
                );
            }
            else {
                showAlert(
                    "ERROR",
                    "Something went wrong. Please try again!",
                    "error"
                );
            }

        }).catch((err) => {
            console.log("NETWORK ERROR");
        }).finally(() => {
            setisMarking(false)
        })
    }


    useEffect(() => {
        getExamData().then((r) => {
        });
    }, []);


    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Mark Exam Barcode Attendance"}
                items={["Assessment", "Exam & Record", "Mark Exam Barcode Attendance"]}
            />
            <div className="row">
                <div className="row pt-5">
                    <div className="col-lg-6 col-md-6 pt-5">
                        <label htmlFor="_Semester">Select Semester</label>
                        <Select
                            id="_Semester"
                            className="form-select form-select"
                            value={formData.SemesterCode2}
                            onChange={onSemesterChange}
                            options={semesterOptions}
                            placeholder="select Semester"
                        />
                    </div>
                    <div className="col-lg-6 col-md-6 pt-5">
                        <label htmlFor="_Semester">Select Date</label>
                        <Select
                            id="_Semester"
                            className="form-select form-select"
                            value={formData.ExamDate2}
                            onChange={onSemesterChange}
                            options={examDates}
                            placeholder="Select Date"
                        />
                    </div>

                    <div className="col-lg-9 col-md-9 pt-5">
                        <div className="form-group">
                            <label htmlFor="_Semester">Select Timetable</label>
                            <Select
                                id="_Semester"
                                className="form-select form-select"
                                value={formData.TimetableID2}
                                onChange={onSemesterChange}
                                options={timetableList}
                                placeholder="Select Timetable"
                            />
                        </div>
                    </div>
                    {
                        data2.length > 0 &&
                        <div className="col-lg-3 col-md-3 pt-5 mt-3">
                            <div className="d-flex justify-content-between">
                                <CsvDownloadButton
                                    data={data3}
                                    className="btn btn-md btn-primary mt-5 float-start"
                                    filename={`Attendance For ${formData.TimetableID2.label}`}
                                    delimiter=","
                                    style={{ //pass other props, like styles
                                        boxShadow: "inset 0px 1px 0px 0px #e184f3",
                                        textShadow: "0px 1px 0px #9b14b3"
                                    }}
                                    headers={["StudentID", "Student Name", "Venue", "Module Code", "SeatNo", "Barcode", "Sign In", "Sign Out"]}
                                >
                                    Export Attendance Data ✨
                                </CsvDownloadButton>
                                {/* <button disabled={isMarking} type="button" className="btn btn-md btn-primary mt-5 float-end" onClick={onMarkAll}>
                                    {
                                        isMarking ?
                                            "please wait..." : "Mark All"
                                    }
                                </button> */}
                            </div>
                        </div>
                    }
                </div>
            </div>

            {isLoading ? (
                <Loader />
            ) : (
                <div className="table-responsive pt-10">
                    <AgReportTable columns={columns} data={data} height="700px" />
                </div>

            )}
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
        currentSemester: state.currentSemester,
    };
};

export default connect(mapStateToProps, null)(MarkExamBarcode);
