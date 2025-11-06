import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
import { serverLink } from "../../../resources/url";
import axios from "axios";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import Select from 'react-select';

function CANotSubmitted(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "S/N",
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
                label: "Staff ID",
                field: "StaffID",
            },
            {
                label: "Staff Name",
                field: "StaffName",
            },
            {
                label: "Student Count",
                field: "GetStudentTakingModule",
            }
        ],
        rows: [],
    });

    const [createSchedule, setcreateSchedule] = useState({
        EntryID: "",
        ModuleCode: "",
        ModuleCodeVal: "",
        SemesterCode: "",
        SemesterCode2: "",
        ExamDate: "",
        StartTime: "",
        EndTime: "",
        InsertedBy: props.LoginDetails[0].StaffID,
    });

    const [semesterList, setSemesterList] = useState([]);
    const [showBody, setshowBody] = useState(false)

    const getData = async () => {
        try {
            await axios.get(`${serverLink}staff/timetable/timetable/semester`, token)
                .then((result) => {
                    let rows = []
                    if (result.data.length > 0) {
                        result.data.map((row) => {
                            rows.push({ value: row.SemesterCode, label: row.SemesterName +"- "+row.SemesterCode })
                        });
                        setSemesterList(result.data);
                        setSemesterOptions(rows)
                    }
                    setIsLoading(false)

                })
        } catch (error) {
            console.log('NETWORK ERROR')
        }
    }

    const getTimetable =async(semester)=>{
        setIsLoading(true)
        await axios.get(`${serverLink}staff/assessment/exam/ca-not-submitted/${semester}`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((exam, index) => {
                        rows.push({
                            sn: index + 1,
                            EntryID: exam.EntryID,
                            ModuleCode: exam.ModuleCode,
                            ModuleName: exam.ModuleName,
                            StaffID: exam.StaffID,
                            StaffName: exam.StaffName,
                            GetStudentTakingModule: exam.GetStudentTakingModule,
                        });
                    });

                    setDatatable({
                        ...datatable,
                        columns: datatable.columns,
                        rows: rows,
                    });
                    setIsLoading(false)
                    setshowBody(true)
                }else{
                    setIsLoading(false);
                    toast.error('no record')
                    setshowBody(false)
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    }

    const onSemesterChange = async (e) => {
        if (e.value !== "") {
            setcreateSchedule({
                ...createSchedule,
                SemesterCode: e.value,
                SemesterCode2: e
            })
            getTimetable(e.value);
        } else {
            setcreateSchedule({
                ...createSchedule,
                SemesterCode: "",
                SemesterCode2: ""
            })
            setshowBody(false)
        }
    }
    useEffect(() => {
        getData();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"CA Not Submitted"}
                items={["Assessment", "Report", "CA Not Submitted"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body pt-2">
                        <div className="col-md-12">
                            {semesterList.length > 0 &&
                                <div className="col-md-12 mb-4 form-group">
                                    <label htmlFor="_Semester">Select Semester</label>
                                    <Select
                                        id="_Semester"
                                        className="form-select form-select"
                                        value={createSchedule.SemesterCode2}
                                        onChange={onSemesterChange}
                                        options={semesterOptions}
                                        placeholder="select Semester"
                                    />

                                </div>}
                        </div>
                        {
                            showBody === true &&
                            <div className="col-md-12" style={{ overflowX: 'auto' }}>
                                <Table data={datatable} />
                            </div>
                        }
                    </div>
                </div>
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
export default connect(mapStateToProps, null)(CANotSubmitted);
