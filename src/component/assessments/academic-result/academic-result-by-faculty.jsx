import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { serverLink } from "../../../resources/url";
import axios from "axios";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import AgReportTable from "../../common/table/ReportTable";
import { toast } from "react-toastify";
import SearchSelect from "../../common/select/SearchSelect";

function AcademicResultByFaculty(props) {
    const token = props.LoginDetails[0].token;
    const faculty_code = props.departmentList.length > 0 ?
        props.departmentList.filter(x => x.DepartmentCode === props.LoginDetails[0].DepartmentCode)[0].FacultyCode
        : ""

    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "StudentID", "Student", "Module", "Level", "Semester", "Grade", "CAs", "Exams", "Total"];
    const [data, setData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [semester, setSemeter] = useState({
        SemesterCode: "",
        SemesterCode2: "",
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

    const getData = async (semester, fac) => {
        setIsLoading(true)
        await axios.get(`${serverLink}staff/assessment/exam/result/by/faculty/${semester}/${fac}`, token)
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
            getData(e.value, faculty_code);

        } else {
            setSemeter({
                ...semester,
                SemesterCode: "",
                SemesterCode2: ""
            })
            setData([])
        }
    }


    useEffect(() => {
        getSemesters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"ACADEMIC RESULT BY FACULTY"}
                items={["Assessment", "ACADEMIC RESULT", " BY FACULTY"]}
            />
            <div className="row">
                {semesterList.length > 0 &&
                    <div className="col-md-12 mb-4">
                        <SearchSelect
                            id="_Semester"
                            label="Select Semester"
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
                                <AgReportTable columns={columns} data={data} title={"ACADEMIC RESULT BY FACULTY"} />
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
        departmentList: state.DepartmentList,
    };
};
export default connect(mapStateToProps, null)(AcademicResultByFaculty);
