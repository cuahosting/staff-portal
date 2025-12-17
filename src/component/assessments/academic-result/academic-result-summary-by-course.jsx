import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import AgReportTable from "../../common/table/ReportTable";
import { toast } from "react-toastify";
import SearchSelect from "../../common/select/SearchSelect";

function AcademicResultSummaryByCourse(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [columns, setColumn] = useState(["S/N", "StudentID", "Student"]);
    const [data, setData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [departmentsList, setDepartments] = useState([]);
    const [departmentOptions, setDepartmentsOptions] = useState([]);
    const [levelOptions] = useState([{ value: "100", label: "100" }, { value: "200", label: "200" }, { value: "300", label: "300" }, { value: "400", label: "400" }, { value: "500", label: "500" }]);
    const [courseSemesterOptions] = useState([{ value: "First", label: "First" }, { value: "Second", label: "Second" }]);
    const [semester, setSemeter] = useState({ SemesterCode: "", SemesterCode2: "", DepartmentCode: "", DepartmentCode2: "", Level: "", Level2: "", Semester: "", Semester2: "" });

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

    const getTotal = (grade) => { if (grade === "A") return 5; else if (grade === "B") return 4; else if (grade === "C") return 3; else if (grade === "D") return 2; else if (grade === "E") return 1; else return 0; };
    const getRemark = (gpa) => { if (gpa === 0) return "SUSPENSION OF SEMESTER"; else if (gpa < 2.0) return "PROBATION"; else return "PASS"; };
    const getModuleName = (moduleList, code) => { if (moduleList.filter(e => e.ModuleCode === code).length > 0) return moduleList.filter(e => e.ModuleCode === code)[0].ModuleName; };

    const getData = async (semesterCode, course, level, course_semester) => {
        if (semesterCode && course && level && course_semester) {
            setIsLoading(true);
            const sendData = { CourseCode: course, SchoolSemester: semesterCode, CourseLevel: level, CourseSemester: course_semester };
            const { success, data: result } = await api.post("staff/assessment/exam/result/summary/by-course", sendData);
            if (success && result) {
                const students = result.students; const modules = result.modules; const results = result.results;
                let rows = []; let cols = ["S/N", "StudentID", "Student"]; let place_holder = [];
                const distinctModuleCodes = [...new Set(modules.map(obj => obj.ModuleCode))];
                distinctModuleCodes.forEach((e) => cols.push(e));
                cols.push(...["Total", "GPA", "Carry Over(S)", "Remark"]);
                distinctModuleCodes.forEach(() => place_holder.push(" "));
                if (students?.length > 0) {
                    students.forEach((student, index) => {
                        let result_rows = []; let gp = 0; let registered_cu = 0; let student_carry_overs = [];
                        distinctModuleCodes.forEach((module) => {
                            let cu = 0;
                            if (modules.filter(e => e.ModuleCode === module && e.StudentID === student.StudentID).length > 0) {
                                modules.filter(e => e.ModuleCode === module && e.StudentID === student.StudentID).forEach((element) => {
                                    registered_cu += parseInt(element.CreditUnit);
                                    cu = parseInt(element.CreditUnit);
                                    if (results.filter(e => e.ModuleCode === element.ModuleCode && e.StudentID === student.StudentID).length > 0) {
                                        results.filter(e => e.ModuleCode === element.ModuleCode && e.StudentID === student.StudentID).forEach((item) => {
                                            gp += cu * getTotal(item.StudentGrade);
                                            result_rows.push(item.StudentGrade);
                                            if (item.StudentGrade === "F") student_carry_overs.push(item.ModuleCode);
                                        });
                                    } else { result_rows.push("F"); }
                                });
                            } else { result_rows.push("NR"); }
                        });
                        rows.push([index + 1, student.StudentID, student.StudentName, ...result_rows, gp, (gp / registered_cu).toFixed(2), student_carry_overs.join(", "), getRemark((gp / registered_cu))]);
                    });
                    rows.push(["", "", "", ...place_holder, "", "", "", ""]);
                    rows.push(["", "", "", ...place_holder, "", "", "", ""]);
                    rows.push(["", "", "KEYS:", ...place_holder, "", "", "", ""]);
                    distinctModuleCodes.forEach((item) => { rows.push(["", "", "", item, getModuleName(modules, item), "", "", "", ""]); });
                    rows.push(["", "", "", ...place_holder, "", "", "", ""]);
                    rows.push(["", "_____________________________", "", "", "", "", "", "", "", "_____________________________", "", ""]);
                    rows.push(["", "Head of Department", "", "", "", "", "", "", "", "Faculty Examination Officer", "", ""]);
                    rows.push(["", "Name, Sign & Date", "", "", "", "", "", "", "", "Name, Sign & Date", "", ""]);
                    rows.push(["", "", "", ...place_holder, "", "", "", ""]);
                    rows.push(["", "", "", "", "", "________________________________________", "", "", "", ""]);
                    rows.push(["", "", "", "", "", "Dean, Faculty of Science and Computing", "", "", "", ""]);
                    rows.push(["", "", "", "", "", "Name, Sign & Date", "", "", "", ""]);
                } else { toast.error('no record'); }
                setColumn([...cols]);
                setData(rows);
            }
            setIsLoading(false);
        }
    };

    const onSemesterChange = async (e) => { if (e.value !== "") { setSemeter({ ...semester, SemesterCode: e.value, SemesterCode2: e }); if (semester.DepartmentCode !== "") { getData(e.value, semester.DepartmentCode, semester.Level, semester.Semester); } } else { setSemeter({ ...semester, SemesterCode: "", SemesterCode2: "" }); setData([]); } };
    const onDepartmentChange = (e) => { setSemeter({ ...semester, DepartmentCode: e.value, DepartmentCode2: e }); getData(semester.SemesterCode, e.value, semester.Level, semester.Semester); };
    const onLevelChange = (e) => { setSemeter({ ...semester, Level: e.value, Level2: e }); getData(semester.SemesterCode, semester.DepartmentCode, e.value, semester.Semester); };
    const onCourseSemesterChange = (e) => { setSemeter({ ...semester, Semester: e.value, Semester2: e }); getData(semester.SemesterCode, semester.DepartmentCode, semester.Level, e.value); };

    useEffect(() => { getSemesters(); getCourses(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"ACADEMIC RESULT SUMMARY"} items={["Assessment", "ACADEMIC RESULT SUMMARY"]} />
            <div className="row">
                {semesterList.length > 0 && <div className="col-md-3 mb-4"><SearchSelect id="_Semester" label="Select Semester" value={semester.SemesterCode2} onChange={onSemesterChange} options={semesterOptions} placeholder="select Semester" /></div>}
                {semester.SemesterCode !== "" && <>
                    <div className="col-md-3 mb-4"><SearchSelect name="DepartmentCode" label="Select Course" value={semester.DepartmentCode2} onChange={onDepartmentChange} options={departmentOptions} placeholder="select Course" /></div>
                    <div className="col-md-3 mb-4"><SearchSelect name="DepartmentCode" label="Select Level" value={semester.Level2} onChange={onLevelChange} options={levelOptions} placeholder="select Level" /></div>
                    <div className="col-md-3 mb-4"><SearchSelect name="Semester" id="Semester" label="Select Semester" value={semester.Semester2} onChange={onCourseSemesterChange} options={courseSemesterOptions} placeholder="select Semester" /></div>
                </>}
            </div>
            <div className="flex-column-fluid mb-2"><div className="row"><div className="mt-4">{data.length > 0 && <AgReportTable columns={columns} data={data} title={"ACADEMIC RESULT SUMMARY"} />}</div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails }; };
export default connect(mapStateToProps, null)(AcademicResultSummaryByCourse);
