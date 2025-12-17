import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import AgReportTable from "../../common/table/ReportTable";
import { toast } from "react-toastify";
import SearchSelect from "../../common/select/SearchSelect";

function AcademicResultByCourse(props) {
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "StudentID", "Student", "Module", "Level", "Semester", "Grade", "CAs", "Exams", "Total"];
    const [data, setData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [departmentsList, setDepartments] = useState([]);
    const [departmentOptions, setDepartmentsOptions] = useState([]);
    const [semester, setSemeter] = useState({ SemesterCode: "", SemesterCode2: "", DepartmentCode: "", DepartmentCode2: "" });

    const getSemesters = async () => {
        const { success, data: result } = await api.get("staff/timetable/timetable/semester");
        if (success && result?.length > 0) {
            let rows = [];
            result.forEach((row) => { rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode }); });
            setSemesterList(result);
            setSemesterOptions(rows);
        }
        setIsLoading(false);
    };

    const getCourses = async () => {
        const { success, data: result } = await api.get("staff/academics/course/list");
        if (success && result?.length > 0) {
            let rows = [];
            result.forEach((row) => { rows.push({ value: row.CourseCode, label: row.CourseName }); });
            setDepartmentsOptions(rows);
            setDepartments(result);
        }
    };

    const getData = async (semesterCode, course) => {
        setIsLoading(true);
        const { success, data: result } = await api.get(`staff/assessment/exam/result/by/course/${semesterCode}/${course}`);
        if (success && result?.length > 0) {
            let rows = [];
            result.forEach((exam, index) => { rows.push([index + 1, exam.StudentID, exam.StudentName, exam.ModuleCode, exam.StudentLevel, exam.StudentSemester, exam.StudentGrade, exam.CAScore, exam.ExamScore, exam.Total]); });
            setData(rows);
        } else { toast.error('no record'); setData([]); }
        setIsLoading(false);
    };

    const onSemesterChange = async (e) => {
        if (e.value !== "") { setSemeter({ ...semester, SemesterCode: e.value, SemesterCode2: e }); if (semester.DepartmentCode !== "") { getData(e.value, semester.DepartmentCode); } }
        else { setSemeter({ ...semester, SemesterCode: "", SemesterCode2: "" }); setData([]); }
    };

    const onDepartmentChange = (e) => { setSemeter({ ...semester, DepartmentCode: e.value, DepartmentCode2: e }); getData(semester.SemesterCode, e.value); };

    useEffect(() => { getSemesters(); getCourses(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"ACADEMIC RESULT BY COURSE"} items={["Assessment", "ACADEMIC RESULT", " BY COURSE"]} />
            <div className="row">
                {semesterList.length > 0 && <div className="col-md-6 mb-4"><SearchSelect id="_Semester" label="Select Semester" value={semester.SemesterCode2} onChange={onSemesterChange} options={semesterOptions} placeholder="select Semester" /></div>}
                {semester.SemesterCode !== "" && <div className="col-md-6 mb-4"><SearchSelect name="DepartmentCode" label="Select Course" value={semester.DepartmentCode2} onChange={onDepartmentChange} options={departmentOptions} placeholder="select Course" /></div>}
            </div>
            <div className="flex-column-fluid mb-2"><div className="row"><div className="mt-4">{data.length > 0 && <AgReportTable columns={columns} data={data} title={"ACADEMIC RESULT BY COURSE"} />}</div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails }; };
export default connect(mapStateToProps, null)(AcademicResultByCourse);
