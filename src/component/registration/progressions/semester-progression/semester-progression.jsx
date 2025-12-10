import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import { toast } from "react-toastify";
import ReportTable from "../../../common/table/ReportTable";

function SemesterProgression(props)
{
    const token = props.loginData.token;

    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Student ID", "Student Name", "Course", "Level", "Semester", "Total Carry Over"]
    const [data, setData] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [regSetting, setRegSetting] = useState({
        active_semester: "",
        min_spill_over: ""
    });
    const [counter, setCounter] = useState(0);
    const [progressionStep, setProgressionStep] = useState([]);

    const getRecords = async () =>
    {
        await axios.get(`${serverLink}staff/registration/progression/semester-progression`, token)
            .then(res =>
            {
                const data = res.data;
                if (data.message === 'success')
                {
                    if (data.reg_setting.length < 1)
                    {
                        toast.error("Please add the registration setting for the active semester before running progression!")
                    } else
                    {
                        const min_spill_over = data.reg_setting[0].MinSpillOver;
                        setRegSetting({
                            min_spill_over: min_spill_over,
                            active_semester: data.reg_setting[0].SemesterCode
                        })

                        if (data.student_list.length > 0)
                        {
                            const progression_list = data.student_list.filter(i => i.TotalCarryOver <= min_spill_over);
                            if (progression_list.length > 0)
                            {
                                let rows = [];
                                progression_list.map((item, index) =>
                                {
                                    rows.push([(index + 1), item.StudentID, item.StudentName, item.CourseName, item.StudentLevel, item.StudentSemester, item.TotalCarryOver])
                                })
                                setData(rows)
                                setStudentList(progression_list)
                                setProgressionStep(data.steps)
                            } else
                            {
                                toast.info("No pending progression")
                            }
                        } else
                        {
                            toast.info("No pending progression")
                        }
                    }
                    setIsLoading(false)
                } else
                {
                    toast.error("Something went wrong fetching data. Please try again!")
                }
            })
            .catch(err =>
            {
                toast.error("NETWORK ERROR")
            })
    }

    const runProgression = async () =>
    {
        document.getElementById('run-progression').setAttribute("disabled", "disabled");
        let counter_score = 0;
        studentList.map(async item =>
        {
            const current_step = progressionStep.filter(i => i.CourseCode === item.CourseCode && i.CourseLevel === item.StudentLevel && i.CourseSemester === item.StudentSemester);
            if (current_step.length > 0)
            {
                const student_step = current_step[0].Step;
                const next_step = progressionStep.filter(
                    i => i.CourseCode === item.CourseCode && i.Step === (student_step + 1));

                if (next_step.length > 0)
                {
                    const sendData = {
                        student_id: item.StudentID,
                        student_level: next_step[0].CourseLevel,
                        student_semester: next_step[0].CourseSemester,
                        old_student_level: item.StudentLevel,
                        old_student_semester: item.StudentSemester,
                        semester_code: regSetting.active_semester,
                        carry_over: item.TotalCarryOver,
                        inserted_by: props.loginData.StaffID
                    }

                    await axios.post(`${serverLink}staff/registration/progression/progress-progression`, sendData, token)
                        .then(res =>
                        {
                            if (res.data.message === 'success')
                                toast.success(`${item.StudentID} progression successful`)
                            else
                                toast.error(`Something went wrong progressing ${item.StudentID}. Please try again!`)
                        })
                        .catch(err =>
                        {
                            toast.error("NETWORK ERROR")
                        })
                } else
                {
                    toast.error(`${item.StudentID} next level and semester progression step was not found. Please add from progression step`)
                }
            } else
            {
                toast.error(`${item.CourseName} current level and semester progression step was not found. Please add from progression step`)
            }
            counter_score += 1;
            setCounter(counter_score)
        })
    }

    useEffect(() =>
    {
        getRecords();
    }, []);

    useEffect(() =>
    {
        if (counter === studentList.length && studentList.length > 0)
        {
            setTimeout(() =>
            {
                toast.success("PROGRESSION RUN SUCCESSFUL");
                setCounter(0)
                getRecords();
                document.getElementById('run-progression').removeAttribute("disabled")
            }, 3000)
        }
    }, [counter])
    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={`${regSetting.active_semester} Semester Progression`}
                items={["Registration", "Progression", "Semester Progression"]}
            />

            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4 Remaining"><b style={{ fontSize: '150px' }}>{counter}</b>
                                <hr />
                                <p>Processed Progression</p>
                            </div>
                            <div className="col-md-4 Processed text-center text-uppercase">
                                <b style={{ fontSize: '150px' }}>Of</b>
                                <h3 className="student_name"></h3>
                                <h3 className="percentage"></h3>
                            </div>
                            <div className="col-md-4 text-center">
                                <b style={{ fontSize: '150px' }}>{studentList.length}</b>
                                <hr />
                                <p>Total Active Not Progressed</p>
                            </div>
                        </div>
                        {
                            studentList.length > 0 ? <button className="btn btn-primary w-100 run-progression" id="run-progression" onClick={runProgression}>Run Progression</button> : <div className="alert alert-info">No pending progression for the active semester</div>
                        }

                        <div className="row">
                            <ReportTable data={data} columns={columns} height={"700px"} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

const mapStateToProps = (state) =>
{
    return {
        loginData: state.LoginDetails[0],
    };
};

export default connect(mapStateToProps, null)(SemesterProgression);
