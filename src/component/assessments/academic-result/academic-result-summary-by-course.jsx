import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { serverLink } from "../../../resources/url";
import axios from "axios";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import AgReportTable from "../../common/table/ReportTable";
import { toast } from "react-toastify";
import SearchSelect from "../../common/select/SearchSelect";

function AcademicResultSummaryByCourse(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [columns, setColumn] = useState(["S/N", "StudentID", "Student"]);
    const [data, setData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [departmentsList, setDepartments] = useState([]);
    const [departmentOptions, setDepartmentsOptions] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [levelOptions, setLevelOptions] = useState([{ value: "100", label: "100" }, { value: "200", label: "200" }, { value: "300", label: "300" }, { value: "400", label: "400" }, { value: "500", label: "500" }]);
    // eslint-disable-next-line no-unused-vars
    const [courseSemesterOptions, setCourseSemesterOptions] = useState([{ value: "First", label: "First" }, { value: "Second", label: "Second" }]);
    const [semester, setSemeter] = useState({
        SemesterCode: "",
        SemesterCode2: "",
        DepartmentCode: "",
        DepartmentCode2: "",
        Level: "",
        Level2: "",
        Semester: "",
        Semester2: "",
    })

    const getSemesters = async () => {
        try {
            await axios.get(`${serverLink}staff/timetable/timetable/semester`, token)
                .then((result) => {
                    let rows = []
                    if (result.data.length > 0) {
                        result.data.forEach((row) => {
                            rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode })
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

    const getCourses = async () => {
        await axios
            .get(`${serverLink}staff/academics/course/list`, token)
            .then((result) => {
                let rows = [];
                if (result.data.length > 0) {
                    result.data.forEach((row) => {
                        rows.push({ value: row.CourseCode, label: row.CourseName })
                    });
                    setDepartmentsOptions(rows)
                    setDepartments(result.data);
                }
            });
    };

    const getTotal = (grade) => {
        if (grade === "A") {
            return 5;
        } else if (grade === "B") {
            return 4;
        } else if (grade === "C") {
            return 3;
        } else if (grade === "D") {
            return 2;
        } else if (grade === "E") {
            return 1;
        } else {
            return 0;
        }
    }

    const getRemark = (gpa) => {
        if (gpa === 0) {
            return "SUSPENSION OF SEMESTER";
        } else if (gpa < 2.0) {
            return "PROBATION";
        } else {
            return "PASS";
        }
    }

    const getModuleName = (moduleList, code) => {
        if (moduleList.filter(e => e.ModuleCode === code).length > 0) {
            return moduleList.filter(e => e.ModuleCode === code)[0].ModuleName;
        }
    }

    const getData = async (semester, course, level, course_semester) => {
        if (semester && course && level && course_semester) {
            setIsLoading(true)
            const sendData = { CourseCode: course, SchoolSemester: semester, CourseLevel: level, CourseSemester: course_semester };
            await axios.post(`${serverLink}staff/assessment/exam/result/summary/by-course`, sendData, token)
                .then((result) => {
                    const students = result.data.students; const modules = result.data.modules; const results = result.data.results;
                    // eslint-disable-next-line no-unused-vars
                    let row = []; let rows = []; let cols = ["S/N", "StudentID", "Student"]; let place_holder = [];
                    const distinctModuleCodes = [...new Set(modules.map(obj => obj.ModuleCode))];
                    distinctModuleCodes.forEach((e) => cols.push(e))
                    cols.push(...["Total", "GPA", "Carry Over(S)", "Remark"])
                    distinctModuleCodes.forEach(() => place_holder.push(" "))
                    if (students.length > 0) {
                        students.forEach((student, index) => {
                            // eslint-disable-next-line no-unused-vars
                            let result_rows = []; let gp = 0; let registered_cu = 0; let student_carry_overs = []; let remark = "";
                            distinctModuleCodes.forEach((module) => {
                                let cu = 0;
                                if (modules.filter(e => e.ModuleCode === module && e.StudentID === student.StudentID).length > 0) {
                                    modules.filter(e => e.ModuleCode === module && e.StudentID === student.StudentID).forEach((element) => {
                                        registered_cu += parseInt(element.CreditUnit);
                                        cu = parseInt(element.CreditUnit);
                                        if (results.filter(e => e.ModuleCode === element.ModuleCode && e.StudentID === student.StudentID).length > 0) {
                                            results.filter(e => e.ModuleCode === element.ModuleCode && e.StudentID === student.StudentID).forEach((item) => {
                                                gp += cu * getTotal(item.StudentGrade);
                                                result_rows.push(item.StudentGrade)
                                                if (item.StudentGrade === "F") student_carry_overs.push(item.ModuleCode);
                                            })
                                        } else {
                                            result_rows.push("F")
                                        }
                                    })

                                } else {
                                    result_rows.push("NR")
                                }
                            })
                            rows.push([index + 1, student.StudentID, student.StudentName, ...result_rows, gp, (gp / registered_cu).toFixed(2), student_carry_overs.join(", "), getRemark((gp / registered_cu))]);
                        });

                        rows.push(["", "", "", ...place_holder, "", "", "", "",]);
                        rows.push(["", "", "", ...place_holder, "", "", "", "",]);
                        rows.push(["", "", "KEYS:", ...place_holder, "", "", "", "",]);
                        distinctModuleCodes.forEach((item) => {
                            rows.push(["", "", "", item, getModuleName(modules, item), "", "", "", "",]);
                        })
                        rows.push(["", "", "", ...place_holder, "", "", "", "",]);
                        rows.push(["", "_____________________________", "", "", "", "", "", "", "", "_____________________________", "", "",]);
                        rows.push(["", "Head of Department", "", "", "", "", "", "", "", "Faculty Examination Officer", "", "",]);
                        rows.push(["", "Name, Sign & Date", "", "", "", "", "", "", "", "Name, Sign & Date", "", "",]);
                        rows.push(["", "", "", ...place_holder, "", "", "", "",]);
                        rows.push(["", "", "", "", "", "________________________________________", "", "", "", "",]);
                        rows.push(["", "", "", "", "", "Dean, Faculty of Science and Computing", "", "", "", "",]);
                        rows.push(["", "", "", "", "", "Name, Sign & Date", "", "", "", "",]);
                    }
                    else {
                        toast.error('no record');
                    }


                    setIsLoading(false);
                    setColumn([...cols])
                    setData(rows)
                })
                .catch((err) => {
                    console.log(err)
                    console.log("NETWORK ERROR");
                });
        }
    }

    const onSemesterChange = async (e) => {
        if (e.value !== "") {
            setSemeter({
                ...semester,
                SemesterCode: e.value,
                SemesterCode2: e
            })
            if (semester.DepartmentCode !== "") {
                getData(e.value, semester.DepartmentCode, semester.Level, semester.Semester);
            }
        } else {
            setSemeter({
                ...semester,
                SemesterCode: "",
                SemesterCode2: ""
            })
            setData([])
        }
    }
    const onDepartmentChange = (e) => {
        setSemeter({
            ...semester,
            DepartmentCode: e.value,
            DepartmentCode2: e,
        })

        getData(semester.SemesterCode, e.value, semester.Level, semester.Semester);
    }
    const onLevelChange = (e) => {
        setSemeter({
            ...semester,
            Level: e.value,
            Level2: e,
        })

        getData(semester.SemesterCode, semester.DepartmentCode, e.value, semester.Semester);
    }
    const onCourseSemesterChange = (e) => {
        setSemeter({
            ...semester,
            Semester: e.value,
            Semester2: e,
        })

        getData(semester.SemesterCode, semester.DepartmentCode, semester.Level, e.value);
    }


    useEffect(() => {
        getSemesters();
        getCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"ACADEMIC RESULT SUMMARY"}
                items={["Assessment", "ACADEMIC RESULT SUMMARY"]}
            />
            <div className="row">
                {semesterList.length > 0 &&
                    <div className="col-md-3 mb-4">
                        <SearchSelect
                            id="_Semester"
                            label="Select Semester"
                            value={semester.SemesterCode2}
                            onChange={onSemesterChange}
                            options={semesterOptions}
                            placeholder="select Semester"
                        />
                    </div>}
                {
                    semester.SemesterCode !== "" ?
                        <>
                            <div className="col-md-3 mb-4">
                                <SearchSelect
                                    name="DepartmentCode"
                                    label="Select Course"
                                    value={semester.DepartmentCode2}
                                    onChange={onDepartmentChange}
                                    options={departmentOptions}
                                    placeholder="select Course"
                                />
                            </div>
                            <div className="col-md-3 mb-4">
                                <SearchSelect
                                    name="DepartmentCode"
                                    label="Select Level"
                                    value={semester.Level2}
                                    onChange={onLevelChange}
                                    options={levelOptions}
                                    placeholder="select Level"
                                />
                            </div>
                            <div className="col-md-3 mb-4">
                                <SearchSelect
                                    name="Semester"
                                    id="Semester"
                                    label="Select Semester"
                                    value={semester.Semester2}
                                    onChange={onCourseSemesterChange}
                                    options={courseSemesterOptions}
                                    placeholder="select Semester"
                                />
                            </div>
                        </>
                        : <></>
                }

            </div>
            <div className="flex-column-fluid mb-2">
                <div className="row">
                    {
                        <div className="mt-4">
                            {data.length > 0 &&
                                <AgReportTable columns={columns} data={data} title={"ACADEMIC RESULT SUMMARY"} />
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
    };
};
export default connect(mapStateToProps, null)(AcademicResultSummaryByCourse);
