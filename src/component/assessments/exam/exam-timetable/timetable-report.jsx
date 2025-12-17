import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { formatDate, TimeTablePeriods } from "../../../../resources/constants";
import ReportTable from "../../../common/table/ReportTable";
import { toast } from "react-toastify";
import SearchSelect from "../../../common/select/SearchSelect";

function ExamTimeTableReport(props) {
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["Code", "Name", "Semester", "Exam Date", "Start Time", "End Time", "Hall", "Capacity", "Students"];
    const [data, setData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [semester, setSemeter] = useState({ SemesterCode: "", SemesterCode2: "" });

    const getSemesters = async () => {
        const { success, data: result } = await api.get("staff/timetable/timetable/semester");
        if (success && result?.length > 0) {
            let rows = [];
            result.forEach((row) => { rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode }); });
            setSemesterList(result); setSemesterOptions(rows);
        }
        setIsLoading(false);
    };

    const getData = async (e) => {
        setIsLoading(true);
        const { success, data: result } = await api.get(`staff/timetable/exam-timetable/report/${e}`);
        if (success && result?.length > 0) {
            let rows = [];
            result.forEach((exam) => {
                rows.push([exam.ModuleCode, exam.ModuleName, exam.SemesterCode, formatDate(exam.ExamDate), TimeTablePeriods.filter(x => x.value.toString() === exam.StartTime.toString())[0]?.label, TimeTablePeriods.filter(x => x.value.toString() === exam.EndTime.toString())[0]?.label, exam.CampusName + " - " + exam.BlockName + " - " + exam.VenueName, exam.Capacity, exam.Students]);
            });
            setData(rows);
        } else { toast.error('no record'); setData([]); }
        setIsLoading(false);
    };

    const onSemesterChange = async (e) => {
        if (e.value !== "") { setSemeter({ SemesterCode: e.value, SemesterCode2: e }); getData(e.value); }
        else { setSemeter({ SemesterCode: "", SemesterCode2: "" }); setData([]); }
    };

    useEffect(() => { getSemesters(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Exam Timetable Report"} items={["Assessment", "Exam Timetable", "Report"]} />
            <div className="col-md-12">{semesterList.length > 0 && <div className="col-md-12 mb-4"><SearchSelect id="_Semester" label="Select Semester" value={semesterList.find(op => op.value === semester.SemesterCode2?.value) || null} onChange={onSemesterChange} options={semesterOptions} placeholder="select Semester" /></div>}</div>
            <div className="flex-column-fluid mb-2"><div className="row"><div className="mt-4">{data.length > 0 && <ReportTable columns={columns} data={data} title={"Exam Timetable Report"} />}</div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails, FacultyList: state.FacultyList }; };
export default connect(mapStateToProps, null)(ExamTimeTableReport);
