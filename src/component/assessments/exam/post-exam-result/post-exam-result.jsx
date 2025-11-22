import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { useLocation } from "react-router";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Select2 from "react-select2-wrapper";
import { toast } from "react-toastify";
const randomToken = require('random-token');

function PostExamResult(props)
{
    const token = props.loginData.token;

    const [isLoading, setIsLoading] = useState(true);
    const [pageName, setPageName] = useState("Post Exam Result");
    const location = useLocation();
    const [semesterList, setSemesterList] = useState([]);
    const [moduleListSelect, setModuleListSelect] = useState([]);
    const [moduleList, setModuleList] = useState([]);
    const [selectedModule, setSelectedModule] = useState({
        ModuleCode: "", ModuleName: "", ModuleType: "", CreditUnit: "", CAPerCon: "", ExamPerCon: ""
    })
    const [searchItem, setSearchItem] = useState({
        StudentID: '',
        SemesterCode: '',
        ModuleCode: '',
        StudentName: '',
        SelectedStudentID: '',
        SelectedStudentLevel: '',
        SelectedStudentSemester: '',
        RegistrationStatus: ''
    });
    const [canPost, setCanPost] = useState(false)
    const [studentResult, setStudentResult] = useState({
        ExamMarkedScore: '',
        ExamScore: '',
        CAMarkedScore: '',
        CAScore: ''
    });

    const resetItem = () =>
    {
        setSearchItem({ ...searchItem, StudentID: '', ModuleCode: '', StudentName: '', SelectedStudentID: '', SelectedStudentLevel: '', SelectedStudentSemester: '', RegistrationStatus: '' });
        setSelectedModule({
            ModuleCode: "",
            ModuleName: "",
            ModuleType: "",
            CreditUnit: "",
            CAPerCon: "",
            ExamPerCon: ""
        });
        setCanPost(false);
    }

    const getRecord = async () =>
    {
        resetItem();
        await axios.get(`${serverLink}staff/timetable/timetable/semester`, token)
            .then(res =>
            {
                const data = res.data;
                let rows = [];
                if (data.length > 0)
                {
                    data.map(item =>
                    {
                        rows.push({ id: item.SemesterCode, text: item.SemesterName })
                    })
                }
                setSemesterList(rows);
            })
            .catch(err =>
            {
                console.log("NETWORK ERROR")
            });

        await axios.get(`${serverLink}staff/academics/modules/list`, token)
            .then(res =>
            {
                const data = res.data;
                let rows = [];
                if (data.length > 0)
                {
                    data.map(item =>
                    {
                        rows.push({ id: item.ModuleCode, text: `${item.ModuleName} (${item.ModuleCode})` })
                    })
                }
                setModuleListSelect(rows);
                setModuleList(data);
            })
            .catch(err =>
            {
                console.log("NETWORK ERROR")
            });
        setIsLoading(false)
    }

    const onEdit = (e) =>
    {
        const id = e.target.id;
        const value = e.target.value;
        setSearchItem({
            ...searchItem,
            [id]: value
        })

        if (id === 'ModuleCode')
        {
            set_module_parameter(value)
        }
    }

    const onSearch = async () =>
    {
        setCanPost(false);
        studentResult.ExamScore = ''
        studentResult.ExamMarkedScore = ''
        studentResult.CAMarkedScore = ''
        studentResult.CAScore = ''

        if (searchItem.SemesterCode === '')
        {
            toast.error("Please select semester");
            return false;
        }

        if (pageName.includes('Barcode'))
        {
            if (searchItem.StudentID === '')
            {
                toast.error("Please scan the barcode");
                return false;
            }
        } else
        {
            if (searchItem.ModuleCode === '')
            {
                toast.error("Please select module");
                return false;
            }

            if (searchItem.StudentID === '')
            {
                toast.error("Please enter the student ID");
                return false;
            }
        }

        toast.info("Please wait...");

        let request_for = '';
        if (pageName.includes('Barcode'))
        {
            request_for = 'barcode'
        } else if (pageName.includes('Default'))
        {
            request_for = 'default'
        } else
        {
            request_for = 'update'
        }

        const sendData = {
            ...searchItem,
            request_for: request_for
        }

        await axios.post(`${serverLink}staff/assessment/exam/exam/search/student/exam`, sendData, token)
            .then(res =>
            {
                const data = res.data;
                if (data.message === 'success')
                {
                    const student_data = data.student_data;
                    const student_result = data.result_data;
                    const registration_data = data.registration_data;

                    if (student_data.length > 0)
                    {
                        const student = student_data[0];

                        if (student.IsPresent > 0)
                        {
                            setSearchItem({
                                ...searchItem,
                                StudentName: student.StudentName,
                                SelectedStudentID: student.StudentID,
                                SelectedStudentLevel: student.StudentLevel,
                                SelectedStudentSemester: student.StudentSemester,
                                RegistrationStatus: registration_data.length > 0 ? registration_data[0].Status : 'Not Registered'
                            })

                            if (pageName.includes('Barcode'))
                            {
                                set_module_parameter(student.ModuleCode)
                            }

                            if (student_result.length > 0)
                            {
                                if (student_result[0].StudentGrade !== '' && student_result[0].StudentGrade !== '--')
                                {
                                    if (pageName.includes('Update'))
                                    {
                                        setStudentResult({
                                            ExamMarkedScore: student_result[0].ExamMarkedOver,
                                            ExamScore: student_result[0].ExamMarkedScore,
                                            CAMarkedScore: student_result[0].CAMarkedOver,
                                            CAScore: student_result[0].CAMarkedScore
                                        })
                                    } else
                                    {
                                        toast.error("Student Result was added already");
                                        return false;
                                    }
                                } else
                                {
                                    if (student_result[0].CAScore !== '')
                                    {
                                        setStudentResult({
                                            ...studentResult,
                                            CAMarkedScore: student_result[0].CAMarkedOver,
                                            CAScore: student_result[0].CAMarkedScore,
                                            ExamMarkedScore: student_result[0].ExamMarkedOver,
                                            ExamScore: student_result[0].ExamMarkedScore,
                                        })
                                    }
                                }
                            }
                            setCanPost(true);
                        } else
                        {
                            toast.error(`${student.StudentID} wasn't marked present for the selected exam`);
                            return false;
                        }



                    } else
                    {
                        toast.error("Record not found for the barcode. Please check the barcode and the selected semester");
                    }
                } else
                {
                    toast.error("Something went wrong on the server. Please try again!");
                }
            })
            .catch(err =>
            {
                toast.error("Network error. Please try again!");
                console.log("NETWORK ERROR")
            });

    }

    const set_module_parameter = (module_code) =>
    {
        const selected_module = moduleList.filter(i => i.ModuleCode === module_code)[0];
        setSelectedModule({
            ModuleCode: selected_module.ModuleCode,
            ModuleName: selected_module.ModuleName,
            ModuleType: selected_module.ModuleType,
            CreditUnit: selected_module.CreditUnit,
            CAPerCon: selected_module.CAPerCon,
            ExamPerCon: selected_module.ExamPerCon
        })
    }

    const handleScoreChange = (e) =>
    {
        if (e.target.value !== '')
        {
            setStudentResult({
                ...studentResult,
                [e.target.id]: parseFloat(e.target.value)
            })
        } else
        {
            setStudentResult({
                ...studentResult,
                [e.target.id]: e.target.value
            })
        }
    }

    const postResult = async () =>
    {
        const tokenCode = randomToken(16);

        if (studentResult.CAMarkedScore === '')
        {
            toast.error("Please enter the CA marked score");
            return false;
        }

        if (studentResult.CAScore === '')
        {
            toast.error("Please enter the CA score");
            return false;
        }

        if (studentResult.ExamMarkedScore === '')
        {
            toast.error("Please enter the exam marked score");
            return false;
        }

        if (studentResult.ExamScore === '')
        {
            toast.error("Please enter the exam score");
            return false;
        }

        if (studentResult.CAScore > studentResult.CAMarkedScore)
        {
            toast.error("CA Score cannot be more than the CA Marked Score");
            return false;
        }

        if (studentResult.ExamScore > studentResult.ExamMarkedScore)
        {
            toast.error("Exam Score cannot be more than the Exam Marked Score");
            return false;
        }

        toast.info("Posting... Please wait!");

        const ca_score = selectedModule.CAPerCon > 0 ? (studentResult.CAScore / studentResult.CAMarkedScore) * selectedModule.CAPerCon : 0;
        const exam_score = selectedModule.ExamPerCon > 0 ? (studentResult.ExamScore / studentResult.ExamMarkedScore) * selectedModule.ExamPerCon : 0;

        const sendData = {
            StudentID: searchItem.SelectedStudentID,
            ModuleCode: selectedModule.ModuleCode,
            ModuleTitle: selectedModule.ModuleName,
            StudentLevel: searchItem.SelectedStudentLevel,
            StudentSemester: searchItem.SelectedStudentSemester,
            SemesterCode: searchItem.SemesterCode,
            RegistrationStatus: searchItem.RegistrationStatus,
            CAMarkedScore: studentResult.CAScore,
            CAPerCon: selectedModule.CAPerCon,
            ExamMarkedScore: studentResult.ExamScore,
            ExamPerCon: selectedModule.ExamPerCon,
            CAMarkedOver: studentResult.CAMarkedScore,
            ExamMarkedOver: studentResult.ExamMarkedScore,
            InsertedBy: props.loginData.StaffID,
            TransactionID: `${searchItem.SemesterCode}-${tokenCode}`,
            CAScore: Math.round(ca_score * 10) / 10,
            ExamScore: Math.round(exam_score * 10) / 10,
            Total: 0
            // Total: (Math.round(ca_score * 10) / 10) + (Math.round(exam_score * 10) / 10)
        };

        await axios.post(`${serverLink}staff/assessment/exam/exam/post`, sendData, token)
            .then(res =>
            {
                const data = res.data;
                if (data.message === 'success')
                {
                    toast.success('Result Posted Successfully');
                    resetItem();
                } else
                {
                    toast.error("Result Posting Failed. Please try again!")
                }
            })
            .catch(error =>
            {
                toast.error("Something went wrong posting student result. Please try again!")
            })

    }

    useEffect(() =>
    {
        if (location.pathname.includes('barcode'))
            setPageName('Post Exam Result (Barcode)');
        else if (location.pathname.includes('default'))
            setPageName('Post Exam Result (Default)');
        else
            setPageName('Update Exam Result');

        getRecord();

    }, [location]);

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={pageName}
                items={["Assessment", "Exams & Records", pageName]}
            />

            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body p-0">
                        <div className="col-md-12">
                            <div className="row pt-5">
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label htmlFor="SemesterCode">Select Semester</label>
                                        <Select2
                                            id="SemesterCode"
                                            name="SemesterCode"
                                            data={semesterList}
                                            value={searchItem.SemesterCode}
                                            className={"form-control"}
                                            onSelect={onEdit}
                                            options={{
                                                placeholder: "Search Semester",
                                            }}
                                        />

                                    </div>

                                    {
                                        !pageName.includes('Barcode') &&
                                        <div className="form-group pt-5">
                                            <label htmlFor="ModuleCode">Select Module</label>
                                            <Select2
                                                id="ModuleCode"
                                                name="ModuleCode"
                                                data={moduleListSelect}
                                                value={searchItem.ModuleCode}
                                                className={"form-control"}
                                                onSelect={onEdit}
                                                options={{
                                                    placeholder: "Search Module",
                                                }}
                                            />
                                        </div>
                                    }

                                    <div className="form-group pt-5 pb-5">
                                        <label htmlFor="StudentID">Find Student</label>
                                        <input type="text" name="StudentID" id="StudentID" className="form-control"
                                            value={searchItem.StudentID} onChange={onEdit}
                                            placeholder={pageName.includes('Barcode') ? 'Scan Barcode' : 'Enter the Student ID'} />
                                    </div>

                                    <button className="btn btn-primary w-100" onClick={onSearch}>Search</button>
                                </div>

                                <div className="col-md-3">
                                    {
                                        selectedModule.ModuleName !== '' &&
                                        <div className="table-responsive">
                                            <table className="table table-striped">
                                                <tbody>
                                                    <tr>
                                                        <th><strong>Module Name</strong></th>
                                                        <td>{selectedModule.ModuleName}</td>
                                                    </tr>
                                                    <tr>
                                                        <th><strong>Module Code</strong></th>
                                                        <td>{selectedModule.ModuleCode}</td>
                                                    </tr>
                                                    <tr>
                                                        <th><strong>Module Type</strong></th>
                                                        <td>{selectedModule.ModuleType}</td>
                                                    </tr>
                                                    <tr>
                                                        <th><strong>Credit Unit</strong></th>
                                                        <td>{selectedModule.CreditUnit}</td>
                                                    </tr>
                                                    <tr>
                                                        <th><strong>CA Contribution</strong></th>
                                                        <td>{selectedModule.CAPerCon}%</td>
                                                    </tr>
                                                    <tr>
                                                        <th><strong>Exam Contribution</strong></th>
                                                        <td>{selectedModule.ExamPerCon}%</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    }

                                </div>

                                <div className="col-md-6">
                                    {
                                        canPost &&
                                        <div className="container">
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <h3>{searchItem.StudentName} ({searchItem.SelectedStudentID})</h3>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group pb-5 pt-5">
                                                        <label htmlFor="CAMarkedScore">CA Marked Score</label>
                                                        <input type="number" step={0.01} id="CAMarkedScore"
                                                            className="form-control"
                                                            value={studentResult.CAMarkedScore}
                                                            onChange={handleScoreChange}
                                                            placeholder={"Enter CA Marked Score"} />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group pb-5 pt-5">
                                                        <label htmlFor="CAScore">CA Score</label>
                                                        <input type="number" step={0.01} id="CAScore"
                                                            className="form-control"
                                                            value={studentResult.CAScore}
                                                            onChange={handleScoreChange}
                                                            placeholder={"Enter CA Score"} />
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group pb-5">
                                                        <label htmlFor="ExamMarkedScore">Exam Marked Score</label>
                                                        <input type="number" step={0.01} id="ExamMarkedScore"
                                                            className="form-control"
                                                            value={studentResult.ExamMarkedScore}
                                                            onChange={handleScoreChange}
                                                            placeholder={"Enter Exam Marked Score"} />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group pb-5">
                                                        <label htmlFor="ExamScore">Exam Score</label>
                                                        <input type="number" step={0.01} id="ExamScore"
                                                            className="form-control"
                                                            value={studentResult.ExamScore}
                                                            onChange={handleScoreChange}
                                                            placeholder={"Enter Exam Score"} />
                                                    </div>
                                                </div>
                                            </div>

                                            <button className="btn btn-primary w-100" onClick={postResult}>Post</button>
                                        </div>
                                    }
                                </div>
                            </div>
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

export default connect(mapStateToProps, null)(PostExamResult);
