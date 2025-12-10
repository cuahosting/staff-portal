import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import SearchSelect from "../../common/select/SearchSelect";
import ReportTable from "../../common/table/ReportTable";

function SemesterRegistration(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [activeSemester, setActiveSemester] = useState([])
    const [studentList, setStudentList] = useState([]);
    const [studentSelectList, setStudentSelectList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState({ StudentID: '', CourseCode: '', StudentLevel: '', StudentSemester: '' })
    const [studentData, setStudentData] = useState({
        moduleList: [],
        registrationList: [],
        resultList: []
    });
    let [creditLoad, setCreditLoad] = useState(0);
    const [register, setRegister] = useState({});
    const columns = ["S/N", "Module Code", "Module Name", "Course Code", "Course Level", "Course Semester", "Credit Load", "Module Type", "Register", "Status"]
    const [data, setData] = useState([]);

    const getRecords = async () => {
        await axios.get(`${serverLink}staff/registration/active/semester/setting`, token)
            .then((response) => {
                setActiveSemester(response.data);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });

        await axios.get(`${serverLink}staff/student-manager/student/active`, token)
            .then((response) => {
                const result = response.data;
                if (result.length > 0) {
                    let rows = [];
                    result.map(item => {
                        rows.push({
                            value: item.StudentID,
                            label: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})`
                        })
                    })
                    setStudentSelectList(rows);
                }
                setStudentList(result);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });

        setIsLoading(false);
    }

    const fetchStudentRecord = async (student_row) => {
        const sendData = {
            StudentID: student_row.StudentID,
            CourseCode: student_row.CourseCode
        }

        await axios.post(`${serverLink}staff/registration/student/registration/data`, sendData, token)
            .then(res => {
                const result = res.data;
                let rows = [];
                if (typeof result.running_module_list !== 'undefined') {
                    setStudentData({
                        ...studentData,
                        moduleList: result.running_module_list,
                        resultList: result.result_list,
                        registrationList: result.registered_module_list
                    })
                    if (result.running_module_list.length > 0) {
                        const student_result = result.result_list;
                        const registered_module = result.registered_module_list;
                        const running_module = result.running_module_list;
                        let credit_load = 0;
                        running_module.map((item, index) => {
                            const module_code = item.ModuleCode;

                            let status;
                            let reg_btn;

                            const filter_reg_module = registered_module.filter(i => i.ModuleCode === module_code && i.SemesterCode === activeSemester[0].SemesterCode);
                            if (filter_reg_module.length > 0) {
                                filter_reg_module.map(item => {
                                    credit_load += running_module.filter(i => i.ModuleCode === item.ModuleCode).reduce((n, { CreditLoad }) => n + CreditLoad, 0);
                                    // setCreditLoad(running_module.filter(i => i.ModuleCode === item.ModuleCode).reduce((n, {CreditLoad}) => n + CreditLoad, 0))
                                })
                                status = <span className="badge badge-success">Registered</span>
                                reg_btn = <input type="checkbox" defaultChecked={true} onChange={handleCheck} value={module_code} id="Registered" name={item.CreditLoad} />
                            } else {
                                status = <span className="badge badge-primary">Fresh</span>
                                reg_btn = <input type="checkbox" onChange={handleCheck} value={module_code} id="Fresh" name={item.CreditLoad} />
                            }

                            const filter_result = student_result.filter(i => i.ModuleCode === module_code);
                            if (filter_result.length > 0) {
                                const filter_passed_result = student_result.filter(i => i.ModuleCode === module_code && i.Decision === 'Pass');
                                if (filter_passed_result.length > 0) {
                                    status = <span className="badge badge-info">Passed</span>
                                    reg_btn = <i className="fa fa-check" />
                                } else {
                                    status = <span className="badge badge-danger">Resit</span>
                                    if (filter_reg_module.length > 0)
                                        reg_btn = <input type="checkbox" defaultChecked={true} onChange={handleCheck} value={module_code} id="Resit" name={item.CreditLoad} />
                                    else
                                        reg_btn = <input type="checkbox" onChange={handleCheck} value={module_code} id="Resit" name={item.CreditLoad} />
                                }
                            }

                            rows.push([(index + 1), item.ModuleCode, item.ModuleName, item.CourseCode, item.CourseLevel, item.CourseSemester, item.CreditLoad, item.ModuleType, reg_btn, status])
                        })
                        setCreditLoad(credit_load)
                        creditLoad = credit_load
                    } else {
                        toast.error("No running module for the selected student's course");
                    }
                } else {
                    setStudentData({
                        moduleList: [],
                        resultList: [],
                        registrationList: []
                    })
                }
                setIsLoading(false)
                setData(rows)
            })
            .catch(err => {
                toast.error("Network error. Please check your connection and try again!")
            })

    }

    const handleChange = (e) => {
        const filter_student = studentList.filter(i => i.StudentID === e.target.value)
        if (filter_student.length > 0) {
            selectedStudent.StudentID = filter_student[0].StudentID
            selectedStudent.CourseCode = filter_student[0].CourseCode
            selectedStudent.StudentLevel = filter_student[0].StudentLevel
            selectedStudent.StudentSemester = filter_student[0].StudentSemester
            setIsLoading(true)
            fetchStudentRecord(filter_student[0])
        }
    }

    const handleCheck = (e) => {
        const sendData = {
            action: e.target.checked ? 'add' : 'drop',
            student_id: selectedStudent.StudentID,
            course_code: selectedStudent.CourseCode,
            semester_code: activeSemester[0].SemesterCode,
            module_code: e.target.value,
            student_level: selectedStudent.StudentLevel,
            student_semester: selectedStudent.StudentSemester,
            status: e.target.id,
            inserted_by: props.loginData[0].StaffID
        }
        if (sendData.action === 'add') {
            const student_load = creditLoad + parseInt(e.target.name);
            if (student_load > activeSemester[0].MaxCreditLoad) {
                toast.error(`Student's credit load (${student_load}) can't exceed the maximum allowed (${activeSemester[0].MaxCreditLoad}).`)
                return false;
            } else {
                handleSubmit(sendData);
            }
        } else {
            handleSubmit(sendData);
        }
    }

    const handleSubmit = async (sendData) => {
        toast.info('Submitting. Please wait!')
        // setIsLoading(true);

        if (sendData.action === 'add') {
            await axios.post(`${serverLink}staff/registration/register`, sendData, token)
                .then(res => {
                    const message = res.data.message;
                    if (message === 'success') {
                        toast.success('Module Added')
                        fetchStudentRecord(selectedStudent)
                    } else if (message === 'no timetable') {
                        toast.error("No schedule for the selected module")
                        setIsLoading(false)
                    } else if (message === 'conflict') {
                        toast.error(`The selected module has a timetable conflict with ${res.data.data}`)
                        setIsLoading(false)
                    } else {
                        toast.error("Error registering module. Please try again!")
                        setIsLoading(false)
                    }
                })
                .catch(err => {
                    toast.error("Network error. Please try again.")
                })
        } else {
            await axios.patch(`${serverLink}staff/registration/drop`, sendData, token)
                .then(res => {
                    const message = res.data.message;
                    if (message === 'success') {
                        toast.success('Module Dropped')
                        fetchStudentRecord(selectedStudent)
                    } else {
                        toast.error("Error dropping module. Please try again!")
                        setIsLoading(false)
                    }
                })
                .catch(err => {
                    toast.error("Network error. Please try again.")
                })
        }
    }

    useEffect(() => {
        getRecords();
    }, [])


    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={`${activeSemester.length > 0 ? activeSemester[0].SemesterCode : ''} Semester Registration`}
                items={["Registration", "Semester Registration"]} />
            <div className="row">
                {activeSemester.length > 0 ? (
                    <>
                        <div className="register">
                            <div className="row mb-5">
                                <div className="col-lg-12 col-md-12 pt-5">
                                    <SearchSelect
                                        id="StudentID"
                                        label="Select Student"
                                        value={studentSelectList.find(s => s.value === selectedStudent.StudentID) || null}
                                        options={studentSelectList}
                                        onChange={(selected) => {
                                            handleChange({ target: { value: selected?.value || '' } });
                                        }}
                                        placeholder="Search Student"
                                    />
                                </div>
                            </div>
                            {
                                selectedStudent.StudentID !== '' &&
                                <>
                                    <h3>
                                        <span className="">CREDIT LOAD REGISTERED: {creditLoad}</span>
                                        <span className="float-end">MAXIMUM ALLOWED: {activeSemester[0].MaxCreditLoad}</span>
                                    </h3>
                                </>
                            }
                            {
                                data.length > 0 && <ReportTable columns={columns} data={data} height={"800px"} />
                            }
                        </div>

                    </>
                ) : (
                    <div className="alert alert-info">
                        Sorry, there is no semester registration settings.{" "}
                        <Link to="/settings/registration/settings/">Add now?</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(SemesterRegistration);
