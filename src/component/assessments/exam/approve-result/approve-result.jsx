import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import {serverLink} from "../../../../resources/url";
import {toast} from "react-toastify";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import ReportTable from "../../../common/table/report_table";
import randomToken from 'random-token';


function ApproveResult(props) {
    const token = props.loginData.token;

    const [isLoading,setIsLoading] = useState(true);
    const animatedComponents = makeAnimated();
    const [semesterList, setSemesterList] = useState([]);
    const [resultList, setResultList] = useState([]);
    const [resultFilter, setResultFilter] = useState([]);
    const [moduleListSelect, setModuleListSelect] = useState([]);
    const [semesterCode, setSemesterCode] = useState('');
    const [moduleCode, setModuleCode] = useState([]);
    const [counter, setCounter] = useState(0);
    const columns = ["S/N", "Student ID", "Module Code", "Module Name", "CA Score", "Exam Score", "Total", "Student Grade", "Decision"]
    const [tableData, setTableData] = useState([]);

    const getRecord = async () => {
        await axios.get(`${serverLink}staff/assessment/exam/approve/result/data`, token)
            .then(res => {
                const data = res.data;
                if (data.message === 'success') {
                    const semester_list = data.semester_list;
                    const module_list = data.module_list;

                    setResultList(data.result_list);

                    let semester_rows = [];
                    if (semester_list.length > 0) {
                        semester_list.map(sem => {
                            semester_rows.push({id: sem.SemesterCode, text: sem.SemesterName})
                        })
                    }
                    setSemesterList(semester_rows);

                    let module_rows = [];
                    if (module_list.length > 0) {
                        module_rows.push({value: 'all', label: `Select All`})
                        module_list.map(item => {
                            module_rows.push({value: item.ModuleCode, label: `${item.ModuleName} (${item.ModuleCode})`})
                        })
                    }
                    setModuleListSelect(module_rows);

                    setIsLoading(false)

                } else {
                    toast.error("Error fetching processing data")
                }
            })
            .catch(err => {
                toast.error("NETWORK ERROR")
            })
    }

    const handleChange = (e) => {
        const id = e.target.id;
        const value = e.target.value;
        setSemesterCode(value)
        setResultFilter([])
    }

    const handleModuleChange = (e) => {
        let rows = [];
        let table_data = [];
        if (e.length > 0) {
            e.map(r => {
                rows.push(r.value)
            })
        }
        setModuleCode(rows);

        let filter_results = [];
        let index_counter = 1;
        if (rows.length > 0) {
            rows.map(r => {
                const filter = resultList.filter(i => i.ModuleCode === r && i.SemesterCode === semesterCode);
                if (filter.length > 0) {
                    filter.map((p, index) => {
                        table_data.push([(index_counter), p.StudentID, p.ModuleCode, p.ModuleTitle, p.CAScore, p.ExamScore, p.Total, p.StudentGrade, p.Decision])
                        filter_results.push(p)
                        index_counter +=1;
                    })
                }
            })
        }
        setTableData(table_data);
        setResultFilter(filter_results)
    }

    const onProcessResult = async () => {
        let result_to_process = [];

        moduleCode.map(module => {
            const module_result = resultList.filter(i => i.ModuleCode === module);
            if (module_result.length > 0) {
                module_result.map(rs => {
                    result_to_process.push(rs)
                })
            }
        });

        let counter_index = 1;
        result_to_process.map(async (result, index) => {
            const sendData = {
                Status: 1,
                UpdatedBy: props.loginData.StaffID,
                EntryID: result.EntryID
            }
            await axios.patch(`${serverLink}staff/assessment/exam/approve/result`, sendData, token)
                .then(res => {
                    if (res.data.message === 'success') {
                        toast.success(`${result.StudentID}'s ${result.ModuleTitle} result approved successfully`)
                    } else {
                        toast.error(`${result.StudentID}'s ${result.ModuleTitle} result not approved. Try again!`)
                    }
                    setCounter(counter_index)
                    counter_index +=1;
                })
                .catch(err => {
                    toast.error("Network error")
                })
        })

    }

    useEffect(() => { getRecord(); },[])

    return isLoading ? <Loader/> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Approve Result"} items={["Assessment", "Exams & Records", "Approve Result"]}/>
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
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


                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="ModuleCode">Select Module</label>
                                    <Select
                                        defaultValue={moduleCode}
                                        components={animatedComponents}
                                        options={moduleListSelect}
                                        isMulti
                                        isDisabled={semesterCode === ''}
                                        onChange={selected => {
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
                            <div className="col-md-5 Remaining text-center">
                                <b style={{fontSize: '100px'}}>{counter}</b>
                                <hr/>
                                <p>Approved Result</p>
                            </div>
                            <div className="col-md-2 Processed text-center text-uppercase">
                                <b style={{fontSize: '60px'}}>Of</b>
                            </div>
                            <div className="col-md-5 text-center">
                                <b style={{fontSize: '100px'}}>{resultFilter.length}</b>
                                <hr/>
                                <p>Pending Result</p>
                            </div>
                        </div>

                        {
                            resultFilter.length > 0 &&
                            <div className="col-md-12 pt-10">
                                <button className="btn btn-primary w-100" onClick={onProcessResult}>APPROVE RESULT</button>
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

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails[0],
    };
};

export default connect(mapStateToProps, null)(ApproveResult);
