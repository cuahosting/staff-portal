import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
import { serverLink } from "../../../../resources/url";
import axios from "axios";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import Modal from "../../../common/modal/modal";
import Table from "../../../common/table/table";
import Select from 'react-select';
import { formatDate, formatDateAndTime, TimeTablePeriods } from "../../../../resources/constants";



function ExamTimeTableHall(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off');
    const [showDate, setshowDate] = useState(false);
    const [showTable, setshowTable] = useState(false);
    const [assignesStudents, setAssignedStudents] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [assignedStudentsData, setAssignedStudentsData] = useState([]);
    const [modules, setModules] = useState({
        ModuleCode: "",
        ModuleName: ""
    })
    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "Timetable ID",
                field: "sn",
            },
            {
                label: "Module Code",
                field: "ModuleCode",
            },
            {
                label: "Module Name",
                field: "ModuleName",
            },
            {
                label: "Exam Date",
                field: "ExamDate",
            },
            {
                label: "Start Time",
                field: "StartTime",
            },
            {
                label: "End Time",
                field: "EndTime",
            },
            {
                label: "Registered Students",
                field: "RegisteredStudents",
            },
            {
                label: "Allocated Students",
                field: "AssignedStudents"
            },
            {
                label: "Action",
                field: "action",
            }
        ],
        rows: [],
    });

    const [createVenue, setcreateVenue] = useState({
        EntryID: "",
        ModuleCode: "",
        SemesterCode: "",
        SemesterCode2: "",
        ExamDate: "",
        StartTime: "",
        EndTime: "",
        VenueID: "",
        Capacity: "",
        maxCapacity: "",
        ExamTakers: 0,
        InsertedBy: props.LoginDetails[0].StaffID,
        StudentsCount: 0,
        VacantSpace_: 0,
        ExamTakers: 0,
        AssignedStudents: 0,

    });

    const [timetableList, setTimetableList] = useState([]);
    const [venueList, setVenueList] = useState([]);
    const [dates, setDates] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [showBody, setshowBody] = useState(false);
    const [vacantSpaces, setvacantSpaces] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false)

    const geSemesters = async () => {
        try {
            await axios.get(`${serverLink}staff/timetable/timetable/semester`, token)
                .then((result) => {
                    let rows = []
                    if (result.data.length > 0) {
                        result.data.map((row) => {
                            rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode })
                        });
                        setSemesterList(result.data);
                        setSemesterOptions(rows)
                    }
                    setIsLoading(false)
                })
            // setIsLoading(false)
        } catch (error) {
            console.log('NETWORK ERROR')
        }

    }
    const getData = async (e) => {
        try {
            let exam_ = []
            axios.get(`${serverLink}staff/timetable/exam-timetable/schedule/list/${e}`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        exam_.push(result.data)
                        setTimetableList(result.data);
                        let __date = []
                        result.data.map((x, y) => {
                            __date.push(x.ExamDate)
                        })
                        setDates([...new Set(__date)])
                        setshowBody(true)
                    } else {
                        toast.error('no schedules for this semester')
                        setshowBody(false)
                        setDates([])
                    }
                })
            let venue_ = [];
            axios.get(`${serverLink}staff/timetable/exam-timetable/venue/list`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        venue_.push(result.data)
                        setVenueList(result.data)
                        setIsLoading(false)
                    }
                })

        } catch (error) {
            console.log('NETWORK ERROR')
        }
    }

    const getAssignedStudents = async (semester) => {
        await axios.get(`${serverLink}staff/timetable/exam-timetable/assigned-students/${semester}`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setAssignedStudentsData(result.data)
                }
            })
            .catch((e) => {
                console.log('NETWROK ERROR FETCHING ASSIGNED STUDENTS')
            })
    }

    const addSchedule = async () => {
        setIsSubmitting(true)
        try {
            const senData = {
                ModuleCode: createVenue.ModuleCode,
                StartTime: createVenue.StartTime,
                EndTime: createVenue.EndTime,
                ExamDate: createVenue.ExamDate,
                Capacity: createVenue.Capacity,
                ExamTakers: createVenue.ExamTakers,
                VenueID: createVenue.VenueID,
                InsertedBy: props.LoginDetails[0].StaffID,
                TimeTableID: createVenue.EntryID,
                SemesterCode: createVenue.SemesterCode,
                RegisteredStudents: createVenue.StudentsCount,
            }
            if (createVenue.ExamTakers.toString() === "0") {
                toast.error(`Number of students cannot be zero`)
                return;
            }
            if (createVenue.VacantSpace_ <= 0) {
                toast.error("There are no more spaces in this hall")
                return;
            }
            if (createVenue.ExamTakers > createVenue.Capacity) {
                toast.error(`Number of students cannot be more than hall capacity`)
                return;
            }
            if (createVenue.ExamTakers > createVenue.StudentsCount) {
                toast.error(`Number of students cannot be more than registered students`)
                return;
            }

            const dt = assignedStudentsData?.filter(x => x.ModuleCode === senData.ModuleCode)

            if (parseInt(dt[0]?.Students) >= parseInt(dt[0]?.RegStudents)) {
                toast.error(`All students offering ${dt[0]?.ModuleCode} have been assigned`)
                return;
            }

            if (parseInt(createVenue.ExamTakers) + parseInt(createVenue.AssignedStudents) > parseInt(createVenue.StudentsCount)) {
                toast.error(`Number of students would exceeds registered students`)
                return;
            }



            await axios.post(`${serverLink}staff/timetable/exam-timetable/exam-venue/add`, senData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success('Venue assigned successfully')
                        getTimeTable(createVenue.ExamDate);
                        document.getElementById("closeModal").click();
                    }
                    else if (result.data.message === "no space") {
                        toast.error('Hall is occupied at this time')
                    }
                    else if (result.data.message === "all students assigned") {
                        toast.error(`all students offering ${createVenue.ModuleCode} have been assigned already`)
                    }
                    setIsSubmitting(false)
                })
        } catch (e) {
            toast.error("error submitting, please try again");
            setIsSubmitting(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    const getTimeTable = async (date) => {
        setIsLoading(true)
        const rows__ = [];
        const by_date = timetableList.filter(x => x.ExamDate.split("T")[0] === date);
        setcreateVenue({
            ...createVenue,
            ExamDate: date
        });
        const { data } = await axios.get(`${serverLink}staff/timetable/exam-timetable/assigned-students/${createVenue.SemesterCode}`, token)
        setAssignedStudentsData(data);

        try {
            await axios.get(`${serverLink}staff/timetable/exam-timetable/exam-venue/vacant_space/${date}/${createVenue.SemesterCode}`, token)
                .then((result) => {
                    let rows = [];
                    setvacantSpaces(result.data);

                    by_date.map((exam, index) => {
                        const assigned = data.length > 0 ?
                            data.filter(x => x.ModuleCode === exam.ModuleCode)[0]?.Students ?? 0 : 0;
                        const assigned_to_venues = data.length > 0 ?
                            data.filter(x => x.ModuleCode === exam.ModuleCode && x.VenueID === createVenue.VenueID)[0]?.Students ?? 0 : 0;


                        rows.push({
                            sn: exam.EntryID,
                            ModuleCode: exam.ModuleCode,
                            ModuleName: exam.ModuleName,
                            SemesterCode: exam.SemesterCode,
                            ExamDate: exam.ExamDate,
                            StartTime: TimeTablePeriods.filter(x => x.value.toString() === exam.StartTime.toString())[0].label,
                            EndTime: TimeTablePeriods.filter(x => x.value.toString() === exam.EndTime.toString())[0].label,
                            RegisteredStudents: exam.StudentsCount,
                            AssignedStudents: assigned,
                            action: (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={async () => {
                                        setcreateVenue({
                                            ...createVenue,
                                            StudentsCount: 0,
                                            ExamTakers: 0,
                                            VacantSpace_: 0
                                        })
                                        setIsSubmitting(false)

                                        let vacant_spaces = await result.data.length > 0 ?
                                            result.data.filter(x => parseInt(x.VenueID) === parseInt(createVenue.VenueID) &&
                                                x.StartTime.toString() === exam.StartTime.toString() &&
                                                x.EndTime.toString() === exam.EndTime.toString()
                                            )[0]?.Vacant ?? createVenue.Capacity : createVenue.Capacity;

                                        setcreateVenue({
                                            ...createVenue,
                                            EntryID: exam.EntryID,
                                            ModuleCode: exam.ModuleCode,
                                            ModuleName: exam.ModuleName,
                                            StartTime: exam.StartTime,
                                            ExamDate: exam.ExamDate,
                                            EndTime: exam.EndTime,
                                            SemesterCode: exam.SemesterCode,
                                            StudentsCount: parseInt(exam.StudentsCount),
                                            ExamTakers: parseInt(exam.StudentsCount),
                                            VacantSpace_: vacant_spaces,
                                            AssignedStudents: assigned,

                                        })
                                    }
                                    }
                                >
                                    Assign hall
                                </button >
                            )
                        });
                        setIsLoading(false)
                    });

                    setDatatable({
                        ...datatable,
                        columns: datatable.columns,
                        rows: rows,
                    });
                    setshowTable(true)
                    return;
                })
        } catch (e) {
            console.log(e)
        }
    }

    const onEdit = async (e) => {
        if (e.target.id === "VenueID") {
            if (e.target.value !== "") {
                setcreateVenue({
                    ...createVenue,
                    Capacity: venueList.filter(x => x.VenueID.toString() === e.target.value.toString())[0].Capacity,
                    maxCapacity: venueList.filter(x => x.VenueID.toString() === e.target.value.toString())[0].Capacity,
                    VenueID: e.target.value
                })
                setshowDate(true)
                setDatatable({
                    ...datatable,
                    rows: []
                })
            } else {
                setshowDate(false)
                setcreateVenue({
                    ...createVenue,
                    VenueID: "",
                    Capacity: "",
                    maxCapacity: ""
                })
                setshowTable(false);
            }
            return;
        }
        else if (e.target.id === "ExamDate") {
            if (e.target.value !== "") {
                setcreateVenue({
                    ...createVenue,
                    ExamDate: e.target.value
                })
            }
            else {
                setcreateVenue({
                    ...createVenue,
                    ExamDate: "",
                })
                setshowTable(false);
            }
        }
        else if (e.target.id === "Capacity") {
            setcreateVenue({
                ...createVenue,
                Capacity: e.target.value
            })
            return;
        }
    };

    const SearchExams = () => {
        getTimeTable(createVenue.ExamDate)
    }

    const onSemesterChange = async (e) => {
        if (e.value !== "") {
            setcreateVenue({
                ...createVenue,
                SemesterCode: e.value,
                SemesterCode2: e
            })
            getData(e.value);
        } else {
            setcreateVenue({
                ...createVenue,
                SemesterCode: "",
                SemesterCode2: "",
                Capacity: "",
                maxCapacity: "",
                ExamDate: "",
                VenueID: "",
            })
            setshowBody(false)
            setshowDate(false)
            setshowTable(false)
            // setData([])
        }
    }


    useEffect(() => {
        geSemesters();
    }, []);



    return isLoading === true ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Exam Timetable Schedule"}
                items={["Assessment", "Exam Timetable", "Exam Venue"]}
            />
            {venueList.length > 0 &&
                <Modal title={`${createVenue.ModuleCode} : ${createVenue.ModuleName}`}>
                    <div className="row col-md-12 mb-2">
                        <div className="col-md-8">
                            <label className="fs-3 fw-bold">Maximum Hall Capacity: {createVenue.VenueID !== "" &&
                                venueList.filter(x => x.VenueID.toString() === createVenue.VenueID.toString())[0].Capacity}
                            </label><br />
                            <label className="fs-3 fw-bold">{createVenue?.ModuleCode} Registered Students: {createVenue.StudentsCount}
                            </label>
                            <label className="fs-3 fw-bold">{createVenue?.ModuleCode} Assigned Students: {createVenue?.AssignedStudents}</label>

                        </div>
                        <div className="col-md-4">

                            <label className="fw-bolder text-success" style={{ float: 'right' }}>
                                <span>Hall Vacant spaces left</span><br />
                                <span style={{ fontSize: '50px' }}>
                                    {parseInt(createVenue.VacantSpace_)}
                                </span>

                            </label><br />

                        </div>

                        <div className="col-md-12 fs-8">
                            <span className="text-success">Enter students to write exam in this hall.</span><br />
                            <span className="text-danger">Sitting students must not be more than the hall capacity</span><br />
                            <span className="text-danger">Sitting students must not be more than number of registered students</span>
                            <br />
                        </div>
                        <div className="col-md-12 mt-4">
                            <label>Sitting students</label>
                            <input type={'number'} maxLength="3" className="form-control" id="ExamTakers" value={createVenue.ExamTakers}
                                onChange={(e) => {
                                    setcreateVenue({
                                        ...createVenue,
                                        [e.target.id]: e.target.value
                                    })
                                }} />
                        </div>
                        <div className="col-md-12 mt-4">
                            <button type="button" onClick={addSchedule} className="btn btn-sm btn-primary" disabled={isSubmitting}>
                                {
                                    isSubmitting ?
                                        <span ><i className="fa fa-spinner fa-spin" />please wait...</span>
                                        :
                                        "Assign Hall"
                                }
                            </button>
                        </div>
                    </div>

                </Modal>
            }
            <div className="flex-column-fluid">
                <div className="col-md-12">
                    {semesterList.length > 0 &&
                        <div className="col-md-12 mb-4 form-group">
                            <label htmlFor="_Semester">Select Semester</label>
                            <Select
                                id="_Semester"
                                className="form-select form-select"
                                value={createVenue.SemesterCode2}
                                onChange={onSemesterChange}
                                options={semesterOptions}
                                placeholder="select Semester"
                            />
                        </div>}
                </div>
                {
                    showBody === true &&
                    <div className="row">
                        <div className="col-md-3 form-group">
                            <label htmlFor="VenueID">Venue</label>
                            <select id="VenueID" onChange={onEdit}
                                value={createVenue.VenueID}
                                className="form-select form-select-solid"
                                data-kt-select2="true"
                                data-placeholder="Select option"
                                data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">
                                <option value={""}>-select venue-</option>
                                {venueList.length > 0 ?
                                    <>
                                        {venueList.map((x, y) => {
                                            return (
                                                <option key={y} value={x.VenueID}>{x.BlockName} - {x.VenueName}</option>
                                            )
                                        })}
                                    </>
                                    :
                                    <></>}
                            </select>
                        </div>
                        <div className="col-md-3 form-group">
                            <label htmlFor="Capacity">Hall Capacity (<small className="text-danger">max* {createVenue.maxCapacity}</small>)</label>
                            <input
                                disabled
                                type="number"
                                id={"Capacity"}
                                onChange={onEdit}
                                value={createVenue.Capacity}
                                className={"form-control"}
                                max={createVenue.maxCapacity}
                            />
                        </div>

                        {showDate === true &&
                            <>
                                <div className="col-md-3 form-group">
                                    <label htmlFor="ExamDate">Exam Date</label>
                                    <select id="ExamDate" onChange={onEdit}
                                        value={createVenue.ExamDate}
                                        className="form-select form-select"
                                        data-kt-select2="true"
                                        data-placeholder="Select option"
                                        data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">
                                        <option value={""}>-select date-</option>
                                        {dates.length > 0 ?
                                            <>
                                                {dates.map((x, y) => {
                                                    return (
                                                        <option key={y} value={x}>{formatDate(x)}</option>
                                                    )
                                                })}
                                            </>
                                            :
                                            <></>}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <button type="submit" className="btn btn-md btn-primary w-100 mt-5" onClick={SearchExams}>
                                        Search
                                    </button>
                                </div>
                            </>

                        }


                        {
                            showTable &&
                            <>
                                <div className="col-md-12 mt-4">
                                    <div className="table-responsive">
                                        <Table data={datatable} />
                                    </div>
                                </div></>
                        }
                    </div>
                }
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
export default connect(mapStateToProps, null)(ExamTimeTableHall);
