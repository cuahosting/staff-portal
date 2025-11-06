import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { serverLink } from "../../../../resources/url";
import axios from "axios";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { formatDate, formatDateAndTime, TimeTablePeriods } from "../../../../resources/constants";
import ReportTable from "../../../common/table/report_table";
import { toast } from "react-toastify";
import Select from "react-select";

function ExamTimeTableReport(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "ModuleCode", "ModuleName", "SemesterCode", "Exam Date", "StartTime", "EndTime", "Hall", "Capacity", "Students"];
    const [data, setData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [semester, setSemeter] = useState({
        SemesterCode: "",
        SemesterCode2: ""
    })

    const getSemesters = async () => {
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
            console.log(error)
        }

    }

    const getData = async (e) => {
        setIsLoading(true)
        await axios.get(`${serverLink}staff/timetable/exam-timetable/report/${e}`, token)
            .then((result) => {
                let rows = [];
                if (result.data.length > 0) {
                    result.data.map((exam, index) => {
                        rows.push([
                            index + 1,
                            exam.ModuleCode,
                            exam.ModuleName,
                            exam.SemesterCode,
                            formatDate(exam.ExamDate), // formatDateAndTime(exam.ExamDate, "date"),
                            TimeTablePeriods.filter(x => x.value.toString() === exam.StartTime.toString())[0].label,
                            TimeTablePeriods.filter(x => x.value.toString() === exam.EndTime.toString())[0].label,
                            exam.CampusName+" - "+exam.BlockName+" - "+exam.VenueName,
                            exam.Capacity,
                            exam.Students
                        ]);
                    });
                    setIsLoading(false)
                }
                else {
                    toast.error('no record');
                    setIsLoading(false)
                }
                setIsLoading(false);
                setData(rows)
            })
            .catch((err) => {
                console.log(err)
                console.log("NETWORK ERROR");
            });
    }

    const onSemesterChange = async (e) => {
        if (e.value !== "") {
            setSemeter({
                SemesterCode: e.value,
                SemesterCode2: e
            })
            getData(e.value);
        }else{
            setSemeter({
                SemesterCode: "",
                SemesterCode2: ""
            })
            setData([])
        }
    }
    useEffect(() => {
        getSemesters();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Exam Timetable Report"}
                items={["Assessment", "Exam Timetable", "Report"]}
            />
            <div className="col-md-12">
                {semesterList.length > 0 &&
                    <div className="col-md-12 mb-4 form-group">
                        <label htmlFor="_Semester">Select Semester</label>
                        <Select
                            id="_Semester"
                            className="form-select form-select"
                            value={semester.SemesterCode2}
                            onChange={onSemesterChange}
                            options={semesterOptions}
                            placeholder="select Semester"
                        />
                    </div>}
            </div>
            <div className="flex-column-fluid mb-2">
                <div className="row">
                    {
                        <div className="mt-4">
                           {data.length > 0 &&
                            <ReportTable columns={columns} data={data} title={"Exam Timetable Report"} />
                            }
                        </div>
                    }
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
export default connect(mapStateToProps, null)(ExamTimeTableReport);
