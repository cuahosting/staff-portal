import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import {serverLink} from "../../../../resources/url";
import {toast} from "react-toastify";
import 'react-circular-progressbar/dist/styles.css';
// eslint-disable-next-line no-unused-vars
import AgReportTable from "../../../common/table/AGReportTable";
import {shortCode} from "../../../../resources/constants";


function EvaluateGPA(props) {
    const token = props.loginData.token;
    const [isLoading, setIsLoading] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [runningModule, setRunningModule] = useState([]);
    const [semester, setSemester] = useState({
        code: "",
        desc: "",
    });

    const [resultEntryList, setResultEntryList] = useState([]);
    const [studentsList, setStudentsList] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [gpa, setGPA] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [semesters, setSemesters] = useState([]);
    const [studentRegisteredModules, setStudentRegisteredModules] = useState([]);
    const [modules, setModules] = useState([]);
    const [studentsCount, setStudentsCount] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const semesterCode  = semester.code;

    const [counter, setCounter] = useState(0);

    const getRecords = async () => {
        await axios.get(`${serverLink}staff/assessments/process/ca/data`, token)
            .then(res => {
                const data = res.data;
                if (data.message === 'success') {
                    setRunningModule(data.module_list);
                    setResultEntryList(data.result_entry_list);
                    setStudentsList(data.students_list);
                    setGPA(data.gpa);
                    setSemesters(data.semesters);
                    setStudentRegisteredModules(data.student_registered_module);
                    setModules(data.modules);

                    setStudentsCount(data.result_entry_list.filter(function({StudentID, SemesterCode}) {
                        const key = `${StudentID}${SemesterCode}`;
                        return !this.has(key) && this.add(key);}, new Set));

                } else {
                    toast.error("Something went wrong fetching data. Please try again!")
                }
            })
            .catch(err => {
                toast.error("NETWORK ERROR")
            })

        setIsLoading(false)
    }

    const getSemesters = async () => {
        axios
            .get(`${serverLink}registration/registration-report/semester-list/`, token)
            .then((response) => {
                setSemesterList(response.data);
                setIsLoading(false);
            })
            .catch((ex) => {
                console.error(ex);
            });
    };

    useEffect(() => {
        getRecords().then(() => {});
        getSemesters().then(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = async (e) => {
        setSemester({
            ...semester,
            [e.target.id]: e.target.value,
        });
    }

    const getGradeWeight = (grade) =>{
        if (shortCode === 'BAUK' || shortCode === "AUM") {
            if (grade === "A"){
                return 5;
            }
            if (grade === "B"){
                return 4;
            }
            if (grade === "C"){
                return 3;
            }
            if (grade === "D"){
                return 2;
            }
            if (grade === "E"){
                return 1;
            }
            if (grade === "F"){
                return 0;
            }
        } else {
            if (grade === "A"){
                return 4;
            }
            if (grade === "B"){
                return 3;
            }
            if (grade === "C"){
                return 2;
            }
            if (grade === "D"){
                return 1;
            }
            if (grade === "F"){
                return 0;
            }
        }

    }

    const processGPA = async () => {
        if (studentsCount.length > 0){
            let counter_value = 0;

            studentsCount.forEach( async student => {
                let CUE = 0;
                let CUR = 0;
                let WGP = 0;

                const studentResultsInSemester = resultEntryList.filter(i => i.StudentGrade !== "F" && i.StudentID === student.StudentID);
                const studentRegisteredModulesInSemester = studentRegisteredModules.filter(i => i.SemesterCode === semesterCode && i.StudentID === student.StudentID);

                // CALCULATE WGP AND CUE
                studentResultsInSemester.forEach(r => {
                    const module = modules.filter(i => i.ModuleCode === r.ModuleCode);

                    if (module.length > 0) {
                        WGP += (module[0].CreditUnit ?? 0) * getGradeWeight(r.StudentGrade);
                        CUE += (module[0].CreditUnit ?? 0);
                    }
                });

                // CALCULATE CUR
                studentRegisteredModulesInSemester.forEach(r => {
                    const module = modules.filter(i => i.ModuleCode === r.ModuleCode);
                    if (module.length > 0) {
                        CUR += (module[0].CreditUnit ?? 0);
                    }
                });

                // CALCULATE GPA
                let GPA = 0;
                if (CUR > 0) {
                    GPA = (Math.round(((WGP / CUR) + Number.EPSILON) * 100) / 100);
                }

                // STUDENT INFORMATION
                const studentInformation = studentsList.filter(i => i.StudentID === student.StudentID);

                if (studentInformation.length > 0) {
                    const gpaData = [
                        {
                            StudentID: studentInformation[0].StudentID,
                            CourseCode: studentInformation[0].CourseCode,
                            CUE: parseFloat(CUE),
                            CUR: parseFloat(CUR),
                            GPA: parseFloat(GPA).toFixed(2),
                            SemesterCode: semesterCode,
                            WGP: parseFloat(WGP),
                            InsertedBy: props.loginData.StaffID
                        }
                    ]

                    const sendData = {
                        gpa_data: gpaData
                    }

                    if (sendData !== "undefined" && sendData !== null) {
                        await axios.post(`${serverLink}staff/assessments/process/evaluation/data`, sendData, token)
                            .then(res => {
                                if (res.data.message === 'success') {
                                    toast.success(`${student.StudentID} Evaluation successfully.`);
                                } else {
                                    toast.success(`${student.StudentID} Evaluation failed.`);
                                }
                            }).catch(err => {
                                toast.error("Network Error. Please try again!");
                            })
                    }

                }
                counter_value += 1;
                setCounter(counter_value);
            });

            semester.code = "";
        }
    }

    return isLoading ? (
        <Loader/>
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={`Evaluate GPA`}
                items={["Assessment", "Evaluate GPA"]}
            />

            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body p-0">
                        <div className="col-md-12 fv-row pt-10">
                            <label className="required fs-6 fw-bold mb-2">
                                Select Semester
                            </label>
                            <select
                                className="form-select"
                                data-placeholder="Select Semester"
                                id="code"
                                onChange={handleChange}
                                value={semester.code}
                                required
                            >
                                <option value="">Select option</option>
                                {semesterList.map((s, i) => (
                                    <option key={i} value={s.SemesterCode}>
                                        {s.Description}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <br />

                    {semester.code !== "" && (
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4 Remaining"><b style={{fontSize: '150px'}}>{counter}</b>
                                    <hr/>
                                    <p>Processed GPA</p>
                                </div>
                                <div className="col-md-4 Processed text-center text-uppercase">
                                    <b style={{fontSize: '120px'}}>Of</b>
                                    <h3 className="student_name"></h3>
                                    <h3 className="percentage"></h3>
                                </div>
                                <div className="col-md-4 text-center">
                                    <b style={{fontSize: '120px'}}>{studentsCount.length}</b>
                                    <hr/>
                                    <p>Number of Students</p>
                                </div>
                            </div>
                            {counter.length > 0 ? (
                                <div className="alert alert-info">Refresh the page and evaluate GPA</div>
                            ):(
                                <button className="btn btn-primary w-100 run-progression" id="run-progression"  onClick={processGPA}>Evaluate GPA</button>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails[0],
        currentSemester: state.currentSemester,
    };
};

export default connect(mapStateToProps, null)(EvaluateGPA);
