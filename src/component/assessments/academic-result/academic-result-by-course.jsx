import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { serverLink } from "../../../resources/url";
import axios from "axios";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import AgReportTable from "../../common/table/report_table";
import { toast } from "react-toastify";
import Select from "react-select";

function AcademicResultByCourse(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "StudentID", "Student", "Module", "Level", "Semester", "Grade", "CAs", "Exams", "Total"];
    const [data, setData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [departmentsList, setDepartments] = useState([]);
    const [departmentOptions, setDepartmentsOptions] = useState([]);
    const [semester, setSemeter] = useState({
        SemesterCode: "",
        SemesterCode2: "",
        DepartmentCode: "",
        DepartmentCode2: "",
    })

    const getSemesters = async () => {
        try {
            await axios.get(`${serverLink}staff/timetable/timetable/semester`, token)
                .then((result) => {
                    let rows = []
                    if (result.data.length > 0) {
                        result.data.forEach((row) => {
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

    const getData = async (semester, course) => {
        setIsLoading(true)
        await axios.get(`${serverLink}staff/assessment/exam/result/by/course/${semester}/${course}`, token)
            .then((result) => {
                let rows = [];
                if (result.data.length > 0) {
                    result.data.forEach((exam, index) => {
                        rows.push([
                            index + 1,
                            exam.StudentID,
                            exam.StudentName,
                            exam.ModuleCode,
                            exam.StudentLevel,
                            exam.StudentSemester,
                            exam.StudentGrade,
                            exam.CAScore,
                            exam.ExamScore,
                            exam.Total
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
                ...semester,
                SemesterCode: e.value,
                SemesterCode2: e
            })
            if (semester.DepartmentCode !== ""){
                getData(e.value,semester.DepartmentCode);
            }
        }else{
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

        getData( semester.SemesterCode,e.value);
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
                title={"ACADEMIC RESULT BY COURSE"}
                items={["Assessment", "ACADEMIC RESULT", " BY COURSE"]}
            />
            <div className="row">
                {semesterList.length > 0 &&
                <div className="col-md-6 mb-4 form-group">
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
                {
                    semester.SemesterCode !== "" ?
                        <div className="col-md-6 mb-4 form-group">
                            <label htmlFor="_Semester">Select Course</label>
                            <Select
                                name="DepartmentCode"
                                className="form-select form-select"
                                value={semester.DepartmentCode2}
                                onChange={onDepartmentChange}
                                options={departmentOptions}
                                placeholder="select Course"
                            />
                        </div>
                        : <></>
                }

            </div>
            <div className="flex-column-fluid mb-2">
                <div className="row">
                    {
                        <div className="mt-4">
                            {data.length > 0 &&
                            <AgReportTable columns={columns} data={data} title={"ACADEMIC RESULT BY COURSE"} />
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
export default connect(mapStateToProps, null)(AcademicResultByCourse);
