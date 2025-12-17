import React, { useEffect, useState } from "react";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import SearchSelect from "../../common/select/SearchSelect";
import ReportTable from "../../common/table/ReportTable";

function SemesterRegistration(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [activeSemester, setActiveSemester] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [studentSelectList, setStudentSelectList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState({ StudentID: '', CourseCode: '', StudentLevel: '', StudentSemester: '' });
    const [studentData, setStudentData] = useState({ moduleList: [], registrationList: [], resultList: [] });
    let [creditLoad, setCreditLoad] = useState(0);
    const columns = ["S/N", "Module Code", "Module Name", "Course Code", "Course Level", "Course Semester", "Credit Load", "Module Type", "Register", "Status"];
    const [data, setData] = useState([]);

    const getRecords = async () => {
        const [semesterRes, studentRes] = await Promise.all([
            api.get("staff/registration/active/semester/setting"),
            api.get("staff/student-manager/student/active")
        ]);

        if (semesterRes.success && semesterRes.data) setActiveSemester(semesterRes.data);
        if (studentRes.success && studentRes.data?.length > 0) {
            const rows = studentRes.data.map(item => ({
                value: item.StudentID,
                label: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})`
            }));
            setStudentSelectList(rows);
            setStudentList(studentRes.data);
        }
        setIsLoading(false);
    };

    const fetchStudentRecord = async (student_row) => {
        const sendData = { StudentID: student_row.StudentID, CourseCode: student_row.CourseCode };
        const { success, data: result } = await api.post("staff/registration/student/registration/data", sendData);

        if (success && result?.running_module_list) {
            setStudentData({
                ...studentData,
                moduleList: result.running_module_list,
                resultList: result.result_list,
                registrationList: result.registered_module_list
            });

            if (result.running_module_list.length > 0) {
                const student_result = result.result_list;
                const registered_module = result.registered_module_list;
                const running_module = result.running_module_list;
                let credit_load = 0;
                let rows = [];

                running_module.forEach((item, index) => {
                    const module_code = item.ModuleCode;
                    let status;
                    let reg_btn;

                    const filter_reg_module = registered_module.filter(i => i.ModuleCode === module_code && i.SemesterCode === activeSemester[0].SemesterCode);
                    if (filter_reg_module.length > 0) {
                        filter_reg_module.forEach(item => {
                            credit_load += running_module.filter(i => i.ModuleCode === item.ModuleCode).reduce((n, { CreditLoad }) => n + CreditLoad, 0);
                        });
                        status = <span className="badge badge-success">Registered</span>;
                        reg_btn = <input type="checkbox" defaultChecked={true} onChange={handleCheck} value={module_code} id="Registered" name={item.CreditLoad} />;
                    } else {
                        status = <span className="badge badge-primary">Fresh</span>;
                        reg_btn = <input type="checkbox" onChange={handleCheck} value={module_code} id="Fresh" name={item.CreditLoad} />;
                    }

                    const filter_result = student_result.filter(i => i.ModuleCode === module_code);
                    if (filter_result.length > 0) {
                        const filter_passed_result = student_result.filter(i => i.ModuleCode === module_code && i.Decision === 'Pass');
                        if (filter_passed_result.length > 0) {
                            status = <span className="badge badge-info">Passed</span>;
                            reg_btn = <i className="fa fa-check" />;
                        } else {
                            status = <span className="badge badge-danger">Resit</span>;
                            if (filter_reg_module.length > 0)
                                reg_btn = <input type="checkbox" defaultChecked={true} onChange={handleCheck} value={module_code} id="Resit" name={item.CreditLoad} />;
                            else
                                reg_btn = <input type="checkbox" onChange={handleCheck} value={module_code} id="Resit" name={item.CreditLoad} />;
                        }
                    }
                    rows.push([(index + 1), item.ModuleCode, item.ModuleName, item.CourseCode, item.CourseLevel, item.CourseSemester, item.CreditLoad, item.ModuleType, reg_btn, status]);
                });
                setCreditLoad(credit_load);
                creditLoad = credit_load;
                setData(rows);
            } else {
                toast.error("No running module for the selected student's course");
            }
        } else if (success) {
            setStudentData({ moduleList: [], resultList: [], registrationList: [] });
        }
        setIsLoading(false);
    };

    const handleChange = (e) => {
        const filter_student = studentList.filter(i => i.StudentID === e.target.value);
        if (filter_student.length > 0) {
            selectedStudent.StudentID = filter_student[0].StudentID;
            selectedStudent.CourseCode = filter_student[0].CourseCode;
            selectedStudent.StudentLevel = filter_student[0].StudentLevel;
            selectedStudent.StudentSemester = filter_student[0].StudentSemester;
            setIsLoading(true);
            fetchStudentRecord(filter_student[0]);
        }
    };

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
        };
        if (sendData.action === 'add') {
            const student_load = creditLoad + parseInt(e.target.name);
            if (student_load > activeSemester[0].MaxCreditLoad) {
                toast.error(`Student's credit load (${student_load}) can't exceed the maximum allowed (${activeSemester[0].MaxCreditLoad}).`);
                return false;
            } else {
                handleSubmit(sendData);
            }
        } else {
            handleSubmit(sendData);
        }
    };

    const handleSubmit = async (sendData) => {
        toast.info('Submitting. Please wait!');
        if (sendData.action === 'add') {
            const { success, data } = await api.post("staff/registration/register", sendData);
            if (success && data?.message === 'success') {
                toast.success('Module Added');
                fetchStudentRecord(selectedStudent);
            } else if (success && data?.message === 'no timetable') {
                toast.error("No schedule for the selected module");
                setIsLoading(false);
            } else if (success && data?.message === 'conflict') {
                toast.error(`The selected module has a timetable conflict with ${data.data}`);
                setIsLoading(false);
            } else if (success) {
                toast.error("Error registering module. Please try again!");
                setIsLoading(false);
            }
        } else {
            const { success, data } = await api.patch("staff/registration/drop", sendData);
            if (success && data?.message === 'success') {
                toast.success('Module Dropped');
                fetchStudentRecord(selectedStudent);
            } else if (success) {
                toast.error("Error dropping module. Please try again!");
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        getRecords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={`${activeSemester.length > 0 ? activeSemester[0].SemesterCode : ''} Semester Registration`} items={["Registration", "Semester Registration"]} />
            <div className="row">
                {activeSemester.length > 0 ? (
                    <>
                        <div className="register">
                            <div className="row mb-5">
                                <div className="col-lg-12 col-md-12 pt-5">
                                    <SearchSelect id="StudentID" label="Select Student" value={studentSelectList.find(s => s.value === selectedStudent.StudentID) || null} options={studentSelectList} onChange={(selected) => { handleChange({ target: { value: selected?.value || '' } }); }} placeholder="Search Student" />
                                </div>
                            </div>
                            {selectedStudent.StudentID !== '' && (
                                <h3>
                                    <span className="">CREDIT LOAD REGISTERED: {creditLoad}</span>
                                    <span className="float-end">MAXIMUM ALLOWED: {activeSemester[0].MaxCreditLoad}</span>
                                </h3>
                            )}
                            {data.length > 0 && <ReportTable columns={columns} data={data} height={"800px"} />}
                        </div>
                    </>
                ) : (
                    <div className="alert alert-info">
                        Sorry, there is no semester registration settings. <Link to="/settings/registration/settings/">Add now?</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return { loginData: state.LoginDetails };
};

export default connect(mapStateToProps, null)(SemesterRegistration);
