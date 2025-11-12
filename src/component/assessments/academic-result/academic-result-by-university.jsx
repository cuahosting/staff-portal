import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { serverLink } from "../../../resources/url";
import axios from "axios";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/report_table";
import { toast } from "react-toastify";
import Select from "react-select";

function AcademicResultByUniversity(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "StudentID", "Student", "Module", "Level", "Semester", "Grade", "CAs", "Exams", "Total"];
    const [data, setData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
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

    const getCourses = async () => {
        await axios
            .get(`${serverLink}academics/module-running/faculty-list`, token)
            .then((response) => {
                let rows = [];
                if (response.data.length > 0) {
                    response.data.map((row) => {
                        rows.push({ value: row.FacultyCode, label: row.FacultyName })
                    });
                    setDepartmentsOptions(rows)
                    setDepartments(response.data);
                }
            });
    };

    const getData = async (semester, fac) => {
        setIsLoading(true)
        await axios.get(`${serverLink}staff/assessment/exam/result/by/university/${semester}/${fac}`, token)
            .then((result) => {
                let rows = [];
                if (result.data.length > 0) {
                    const distinctCourse = [...new Set(result.data.map(obj => obj.CourseName))];

                    distinctCourse.map((item, key)=> {
                        rows.push(["", "", "", "", <h1 className="text-center text-uppercase text-success">{item}</h1>, "", "", "", "", ""]);
                        result.data.filter(e=>e.CourseName === item).map((exam, index) => {
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
                    })

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
    }, [""]);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"ACADEMIC RESULT BY UNIVERSITY"}
                items={["Assessment", "ACADEMIC RESULT", " BY UNIVERSITY"]}
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
                            <label htmlFor="_Semester">Select Faculty</label>
                            <Select
                                name="DepartmentCode"
                                className="form-select form-select"
                                value={semester.DepartmentCode2}
                                onChange={onDepartmentChange}
                                options={departmentOptions}
                                placeholder="select Faculty"
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
                                <ReportTable columns={columns} data={data} title={"ACADEMIC RESULT BY UNIVERSITY"} />
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
export default connect(mapStateToProps, null)(AcademicResultByUniversity);
