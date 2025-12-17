import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { toast } from "react-toastify";
import SearchSelect from "../../common/select/SearchSelect";
import { projectLogo, schoolName } from "../../../resources/constants";
import "./student-result-slip.css";

function StudentResultSlip(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [semesterList, setSemesterList] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [departmentOptions, setDepartmentsOptions] = useState([]);
    const [levelOptions, setLevelOptions] = useState([]);
    const [Results, setResults] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [session, setSession] = useState([]);
    const [semester, setSemeter] = useState({ SemesterCode: "", SemesterCode2: "", DepartmentCode: "", DepartmentCode2: "", FacultyCode: "", FacultyCode2: "", Level: "", Level2: "", Semester: "", Semester2: "" });

    const getSemesters = async () => {
        const { success, data } = await api.get("staff/timetable/timetable/semester");
        if (success && data?.length > 0) {
            let rows = [];
            data.forEach((row) => { rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode }); });
            setSemesterList(data); setSemesterOptions(rows);
        }
        setIsLoading(false);
    };

    const getCourses = async () => {
        const { success, data } = await api.get("staff/academics/department/list");
        if (success && data?.length > 0) {
            let rows = [];
            data.forEach((row) => { rows.push({ value: row.DepartmentCode, label: row.DepartmentName }); });
            setDepartmentsOptions(rows);
        }
    };

    const getData = async (semester, department, faculty) => {
        if (semester && department && faculty) {
            setIsLoading(true);
            const sendData = { faculty: faculty, department: department, semester: semester };
            const { success, data } = await api.post("staff/assessment/exam/get/student/result-slip", sendData);
            if (success && data?.result?.length > 0) {
                let result_ = data.result;
                const d = new Date(data.result[0].InsertedDate); let year = d.getFullYear(); setSession(year);
                const distinctGroupByValue = [...new Set(result_.map(obj => obj.groupByValue))];
                setResults(result_); setLevelOptions(distinctGroupByValue); setStudentList(data.student);
            } else { toast.error('No result found'); }
            setIsLoading(false);
        }
    };

    const onSemesterChange = async (e) => { if (e.value !== "") { setSemeter({ ...semester, SemesterCode: e.value, SemesterCode2: e }); getData(e.value, semester.DepartmentCode, semester.FacultyCode); } else { setSemeter({ ...semester, SemesterCode: "", SemesterCode2: "" }); } };
    const onDepartmentChange = (e) => { setSemeter({ ...semester, DepartmentCode: e.value, DepartmentName: e.label, DepartmentCode2: e }); getData(semester.SemesterCode, e.value, semester.FacultyCode); };
    const onFacultyChange = (e) => { setSemeter({ ...semester, FacultyCode: e.value, FacultyName: e.label, FacultyCode2: e }); getData(semester.SemesterCode, semester.DepartmentCode, e.value); };

    useEffect(() => { let rows = []; props.FacultyList.length > 0 && props.FacultyList.forEach((x) => { rows.push({ label: x.FacultyName, value: x.FacultyCode }); }); setFacultyList(rows); getSemesters(); getCourses(); }, []);

    const printNow = () => { window.print(); };
    const session_selected = parseInt(semester.SemesterCode.replace(/\D/g, ""));

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid ">
            <div className="printPageButton"><PageHeader title={"STUDENT RESULT SLIP"} items={["Report", "STUDENT RESULT SLIP"]} /></div>
            <div className="row printPageButton">{semesterList.length > 0 && <div className="col-md-4 mb-4"><SearchSelect id="_Semester" label="Select Semester" value={semester.SemesterCode2} onChange={onSemesterChange} options={semesterOptions} placeholder="select Semester" /></div>}{semester.SemesterCode !== "" ? <><div className="col-md-4 mb-4"><SearchSelect name="FacultyCode" label="Select Faculty" value={semester.FacultyCode2} onChange={onFacultyChange} options={facultyList} placeholder="select Faculty" /></div><div className="col-md-4 mb-4"><SearchSelect name="DepartmentCode" label="Select Department" value={semester.DepartmentCode2} onChange={onDepartmentChange} options={departmentOptions} placeholder="select Course" /></div></> : <></>}</div>
            <div className="flex-column-fluid mb-2"><div className="row">{Results.length > 0 ? studentList.map((userData, int) => { let data = Results.filter(e => e.StudentID === userData.StudentID); let final_grade_point = 0; let final_grade_point_average = 0; let final_credit_unit = 0; let cgpa_ = 0; let cgpa = 0; final_grade_point = data.map(e => parseInt(e.GradePoints)).reduce((a, b) => a + b, 0); final_credit_unit = data.map(e => parseInt(e.CreditLoad)).reduce((a, b) => a + b, 0); cgpa_ = data.map(e => parseInt(e.CreditLoad)).reduce((a, b) => a + b, 0) !== 0 ? data.map(e => parseInt(e.GradePoints)).reduce((a, b) => a + b, 0) / data.map(e => parseInt(e.CreditLoad)).reduce((a, b) => a + b, 0) : 0; let y = parseFloat(cgpa_.toFixed(2)); final_grade_point_average = y; return (<div className="myDivToPrint page"><div className=""><div className="mt-5"><div className="header"><img src={projectLogo} alt={schoolName} width={100} height={100} /><span><h2 className="mt-2 text-center text-uppercase">{schoolName}</h2><p><strong className="text-uppercase font-weight-bold"><h5>({semester.FacultyName})</h5></strong><strong className="text-uppercase"><h5>(DEPARTMENT OF {semester.DepartmentName})</h5></strong></p><h5 className="">STUDENT'S RESULT SLIP</h5><br /></span></div></div><br /><div className="row"><div className="col-2"><b>Name:</b></div><div className="col-4">{userData.StudentName}</div><div className="col-3"><b></b></div><div className="col-3"></div><div className="col-2"><b>Student ID:</b></div><div className="col-4">{userData.StudentID}</div><div className="col-3"><b></b></div><div className="col-3"></div><div className="col-2"><b>Session:</b></div><div className="col-4">20{session_selected}/20{session_selected + 1}</div></div><div className="mt-5">{Results.filter(e => e.StudentID === userData.StudentID).length > 0 && levelOptions.map((level, key) => { let sem = key === 0 ? '1st' : '2nd'; let total_cu = 0; let total_grade = 0; let gpa_ = 0; let gpa = 0; const d = new Date(Results[0].InsertedDate); let year = d.getFullYear(); let newyear = year + 1; return (<><div className='text-center'><strong>{Results[0].StudentLevel} Level {sem} Semester 20{session_selected}/20{session_selected + 1} Session Examination Results</strong></div><table key={key} className="" style={{ width: '100%', fontSize: '12px' }}><thead><tr style={{ fontWeight: "bold" }} className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200"><td align="left"> Course Code</td><td align="left">Course Title</td><td align="left">Unit</td><td align="left"> Marks</td><td align="left"> Grade</td><td align="left"> GP</td><td align="left"> Product (UxGP)</td></tr></thead><tbody>{Results.filter(e => e.StudentID === userData.StudentID && e.groupByValue === level).map((x, y) => { total_cu += parseInt(x.CreditLoad); total_grade += parseFloat(x.GradePoints); gpa_ = total_cu !== 0 ? total_grade / total_cu : 0; gpa = parseFloat(gpa_.toFixed(2)); cgpa += gpa; return (<tr key={y} style={{ width: '100%' }}><td align="left">{x.ModuleCode}</td><td align="left">{x.ModuleTitle}</td><td>{x.CreditLoad}</td><td align="left"> {x.Total}</td><td align="left"> {x.StudentGrade}</td><td align="left"> {x.GradeObtained}</td><td align="left"> {parseInt(x.CreditLoad) * x.GradeObtained}</td></tr>); })}</tbody><tfoot><tr className="main_head"><td colSpan={2} ></td><td>{total_cu}</td><td colSpan={3} ></td><td>{total_grade}</td></tr></tfoot></table><div className="row mb-5" style={{ marginTop: "30px" }}><div className="col-3"><b>Semester GPA:</b></div><div className="col-4">{gpa}</div><div className="col-2"><b></b></div><div className="col-3"></div><div className="col-3"><b>Cumulative Unit:</b></div><div className="col-4">{key === 0 ? total_cu : final_credit_unit}</div><div className="col-2"><b></b></div><div className="col-3"></div><div className="col-3"><b>Cumulative GP:</b></div><div className="col-4">{key === 0 ? total_grade : final_grade_point}</div><div className="col-2"><b></b></div><div className="col-3"></div><div className="col-3"><b>Cumulative GPA:</b></div><div className="col-4">{key === 0 ? gpa : final_grade_point_average}</div></div></>); })}</div></div><button id="printPageButton" style={{ marginTop: '10px' }} onClick={printNow} className="btn btn-secondary">Print <i className="bi-printer" /></button></div>); }) : semester.SemesterCode !== '' && semester.FacultyCode !== '' && semester.DepartmentCode !== '' ? <div className='col-md-12 text-center alert alert-danger'>No result found!!!</div> : <></>}</div></div>
        </div>
    );
}
const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails, FacultyList: state.FacultyList }; };
export default connect(mapStateToProps, null)(StudentResultSlip);
