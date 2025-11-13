import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import { toast } from "react-toastify";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import ReportTable from "../../../common/table/report_table";
import randomToken from 'random-token';


function ProcessResult(props)
{
    const token = props.loginData.token;

    const [isLoading, setIsLoading] = useState(true);
    const animatedComponents = makeAnimated();
    const [semesterList, setSemesterList] = useState([]);
    const [resultList, setResultList] = useState([]);
    const [resultFilter, setResultFilter] = useState([]);
    const [gradeSettingList, setGradeSettingList] = useState([]);
    const [moduleListSelect, setModuleListSelect] = useState([]);
    const [gradeSettingSelect, setGradeSettingSelect] = useState([]);
    const [semesterCode, setSemesterCode] = useState('');
    const [moduleCode, setModuleCode] = useState([]);
    const [gradeSetting, setGradeSetting] = useState('');
    const [counter, setCounter] = useState(0);
    const columns = ["S/N", "Student ID", "Module Code", "Module Name", "CA Score", "Exam Score", "Total"]
    const [tableData, setTableData] = useState([]);

    const getRecord = async () =>
    {
        await axios.get(`${serverLink}staff/assessment/exam/process/result/data`, token)
            .then(res =>
            {
                const data = res.data;
                if (data.message === 'success')
                {
                    const semester_list = data.semester_list;
                    const grade_type = data.grade_type;
                    const module_list = data.module_list;

                    setResultList(data.result_list);
                    setGradeSettingList(data.grade_list);

                    let semester_rows = [];
                    if (semester_list.length > 0)
                    {
                        semester_list.map(sem =>
                        {
                            semester_rows.push({ id: sem.SemesterCode, text: sem.SemesterName })
                        })
                    }
                    setSemesterList(semester_rows);

                    let grade_rows = [];
                    if (grade_type.length > 0)
                    {
                        grade_type.map(item =>
                        {
                            grade_rows.push({ id: item.GradeType, text: item.GradeType })
                        })
                    }
                    setGradeSettingSelect(grade_rows);

                    let module_rows = [];
                    if (module_list.length > 0)
                    {
                        module_rows.push({ value: 'all', label: `Select All` })
                        module_list.map(item =>
                        {
                            module_rows.push({ value: item.ModuleCode, label: `${item.ModuleName} (${item.ModuleCode})` })
                        })
                    }
                    setModuleListSelect(module_rows);

                    setIsLoading(false)

                } else
                {
                    toast.error("Error fetching processing data")
                }
            })
            .catch(err =>
            {
                toast.error("NETWORK ERROR")
            })
    }

    const handleChange = (e) =>
    {
        const id = e.target.id;
        const value = e.target.value;

        if (id === 'SemesterCode')
            setSemesterCode(value)
        else if (id === 'GradeSetting')
            setGradeSetting(value);

        setResultFilter([])
    }

    const handleModuleChange = (e) =>
    {

        let rows = [];
        let table_data = [];
        if (e.length > 0)
        {
            e.map(r =>
            {
                rows.push(r.value)
            })
        }
        setModuleCode(rows);

        let filter_results = [];
        let index_counter = 1;
        if (rows.length > 0)
        {
            rows.map(r =>
            {
                const filter = resultList.filter(i => i.ModuleCode === r && i.SemesterCode === semesterCode);
                if (filter.length > 0)
                {
                    filter.map((p, index) =>
                    {
                        table_data.push([(index_counter), p.StudentID, p.ModuleCode, p.ModuleTitle, p.CAScore, p.ExamScore, p.Total])
                        filter_results.push(p)
                        index_counter += 1;
                    })
                }
            })
        }
        setTableData(table_data);
        setResultFilter(filter_results)
    }

    const onProcessResult = async () =>
    {
        let result_to_process = [];

        moduleCode.map(module =>
        {
            const module_result = resultList.filter(i => i.ModuleCode === module);
            if (module_result.length > 0)
            {
                module_result.map(rs =>
                {
                    result_to_process.push(rs)
                })
            }
        });

        result_to_process.map(result =>
        {
            result.Status = 0;
            result.UpdatedBy = props.loginData.StaffID;
            result.TransactionID = randomToken(20);
            if (result.CAPerCon === null && result.ExamPerCon === null)
            {
                result.StudentGrade = 'Incomplete';
                result.Decision = 'RM';
            }
            else
            {
                if (result.CAPerCon === 100)
                {
                    const grade = getResultGrade(result.CAScore);
                    result.ExamScore = 0;
                    result.Total = result.CAScore;
                    result.StudentGrade = grade.grade;
                    result.Decision = grade.decision;
                }
                else if (result.ExamPerCon === 100)
                {
                    const grade = getResultGrade(result.ExamScore);
                    result.CAScore = 0;
                    result.Total = result.ExamScore;
                    result.StudentGrade = grade.grade;
                    result.Decision = grade.decision;
                }
                else
                {
                    let ca_total;
                    if (result.CAScore === null || result.CAScore === 0)
                        ca_total = 0;
                    else
                    {
                        ca_total = result.CAScore;
                    }
                    let exam_total;
                    if (result.ExamScore === null || result.ExamScore === 0)
                        exam_total = 0;
                    else
                    {
                        exam_total = result.ExamScore;
                    }
                    let total = (Math.round(ca_total * 10) / 10) + (Math.round(exam_total * 10) / 10)
                    const grade = getResultGrade(total);
                    result.Total = total;
                    result.StudentGrade = grade.grade;
                    result.Decision = grade.decision;
                }

            }
        })

        result_to_process.map(async (result, index) =>
        {
            await axios.patch(`${serverLink}staff/assessment/exam/process/result`, result, token)
                .then(res =>
                {
                    if (res.data.message === 'success')
                    {
                        toast.success(`${result.StudentID}'s ${result.ModuleTitle} result processed successfully`)
                    } else
                    {
                        toast.error(`${result.StudentID}'s ${result.ModuleTitle} result not processed. Try again!`)
                    }
                    setCounter(index + 1)
                })
                .catch(err =>
                {
                    toast.error("Network error")
                })
        })

    }

    const getResultGrade = (total) =>
    {
        const grade_list = gradeSettingList.filter(i => i.GradeType === gradeSetting && total >= i.MinRange && total <= i.MaxRange);
        if (grade_list.length > 0)
        {
            return { grade: grade_list[0].Grade, decision: grade_list[0].Decision }
        } else
        {
            return { grade: 'Incomplete', decision: 'RM' }
        }
    }

    useEffect(() => { getRecord(); }, [])

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Process Result"} items={["Assessment", "Exams & Records", "Process Result"]} />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="SemesterCode">Select Semester</label>
                                    <Select
                                        id="SemesterCode"
                                        defaultValue={semesterCode}
                                        data={semesterList}
                                        onSelect={handleChange}
                                        options={{
                                            placeholder: "Select Semester",
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="GradeSetting">Select Grade Setting</label>
                                    <Select
                                        id="GradeSetting"
                                        defaultValue={gradeSetting}
                                        data={gradeSettingSelect}
                                        onSelect={handleChange}
                                        options={{
                                            placeholder: "Select Grade Setting",
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="ModuleCode">Select Module</label>
                                    <Select
                                        defaultValue={moduleCode}
                                        components={animatedComponents}
                                        options={moduleListSelect}
                                        isMulti
                                        isDisabled={semesterCode === '' || gradeSetting === ''}
                                        onChange={selected =>
                                        {
                                            selected.length &&
                                                selected.find(option => option.value === "all")
                                                ? handleModuleChange(moduleListSelect.slice(1))
                                                : handleModuleChange((selected))
                                        }}
                                    />

                                </div>
                            </div>

                        </div>

                        <div className="row pt-5">
                            <div className="col-md-3">
                                {
                                    gradeSetting !== '' ?
                                        <div className="table-responsive">
                                            <h4>Grade Setting</h4>
                                            <table className="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>Grade</th>
                                                        <th>Range</th>
                                                        <th>Decision</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        gradeSettingList.length > 0 &&
                                                        gradeSettingList.map((item, index) =>
                                                        {
                                                            if (item.GradeType === gradeSetting)
                                                            {
                                                                return <tr key={index}>
                                                                    <td>{item.Grade}</td>
                                                                    <td>{item.MinRange} - {item.MaxRange}</td>
                                                                    <td>{item.Decision}</td>
                                                                </tr>
                                                            }
                                                        })
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                        : <div className="alert alert-info">Select Grade Setting to View</div>
                                }

                            </div>
                            <div className="col-md-4 Remaining text-center">
                                <b style={{ fontSize: '100px' }}>{counter}</b>
                                <hr />
                                <p>Processed Result</p>
                            </div>
                            <div className="col-md-1 Processed text-center text-uppercase">
                                <b style={{ fontSize: '60px' }}>Of</b>
                            </div>
                            <div className="col-md-4 text-center">
                                <b style={{ fontSize: '100px' }}>{resultFilter.length}</b>
                                <hr />
                                <p>Total Un-Process Result</p>
                            </div>
                        </div>

                        {
                            resultFilter.length > 0 &&
                            <div className="col-md-12 pt-10">
                                <button className="btn btn-primary w-100" onClick={onProcessResult}>PROCESS RESULT</button>
                                <span className="badge bg-danger w-100">This process might take a while to complete</span>
                            </div>
                        }

                        {
                            tableData.length > 0 &&
                            <div className="row pt-5">
                                <ReportTable columns={columns} data={tableData} height={'800px'} />
                            </div>
                        }

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

export default connect(mapStateToProps, null)(ProcessResult);
