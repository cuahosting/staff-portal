import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { toast } from "react-toastify";
import SearchSelect from "../../common/select/SearchSelect";
import AgReportTable from "../../common/table/ReportTable";
import { formatDateAndTime } from "../../../resources/constants";

function ResultActivityTracker(props) {
    const token = props.loginData.token;

    const [isLoading, setIsLoading] = useState(true);
    const [semesterList, setSemesterList] = useState([]);
    const [semesterCode, setSemesterCode] = useState("");
    const [resultList, setResultList] = useState([]);
    const columns = ["S/N", "Student ID", "Module Code", "Module Title", "O CA", "N CA", "O Exam", "N Exam", "O Total", "N Total", "O Grade", "N Grade", "Action By", "Action Date"]
    const [tableData, setTableData] = useState([]);

    const getRecords = async () => {
        await axios.get(`${serverLink}staff/timetable/timetable/semester`, token)
            .then(res => {
                const data = res.data;
                let rows = [];
                if (data.length > 0) {
                    data.map(item => {
                        rows.push({ value: item.SemesterCode, label: item.SemesterName })
                    })
                }
                setIsLoading(false)
                setSemesterList(rows);
            })
            .catch(err => {
                console.log("NETWORK ERROR")
            });
    }

    const searchResult = async (e) => {
        setSemesterCode(e.target.value);
        setIsLoading(true);

        await axios.get(`${serverLink}staff/assessment/exam/result/activity/log/${e.target.value}`, token)
            .then(res => {
                const data = res.data;
                if (data.message === 'success') {
                    let rows = [];
                    if (data.data.length > 0) {
                        data.data.map((row, index) => {
                            rows.push([
                                (index + 1), row.StudentID, row.ModuleCode, row.ModuleTitle, row.PrevCAScore, row.CurCAScore, row.PrevExamScore, row.CurExamScore,
                                row.PrevTotal, row.CurTotal, row.PrevGrade, row.CurGrade, row.ActionBy, formatDateAndTime(row.ActionDate, 'date_and_time')])
                        })
                    } else {
                        toast.error("No result activity found for the selected semester")
                    }
                    setTableData(rows);
                    setIsLoading(false)
                } else {
                    toast.error("Error fetching processing data")
                }
            })
            .catch(err => {
                toast.error("NETWORK ERROR")
            })
    }

    useEffect(() => { getRecords() }, []);

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Result Activity Tracker"} items={["Assessment", "Exams Reports", "Result Activity Tracker"]} />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="SemesterCode">Select Semester</label>
                                    <SearchSelect
                                        id="SemesterCode"
                                        label="Select Semester"
                                        value={semesterList.find(op => op.value === semesterCode) || null}
                                        options={semesterList}
                                        onChange={(selected) => searchResult({ target: { value: selected?.value || '' } })}
                                        placeholder="Search Semester"
                                    />
                                </div>
                            </div>

                        </div>

                        {
                            tableData.length > 0 &&
                            <div className="row pt-5">
                                <AgReportTable title={"Result Activity Tracker"} columns={columns} data={tableData} height={'800px'} />
                            </div>
                        }

                    </div>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails[0],
    };
};

export default connect(mapStateToProps, null)(ResultActivityTracker);
