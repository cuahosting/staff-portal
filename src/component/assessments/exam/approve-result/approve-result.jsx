import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import SearchSelect from "../../../common/select/SearchSelect";
import AgReportTable from "../../../common/table/ReportTable";

function ApproveResult(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [semesterList, setSemesterList] = useState([]);
    const [resultList, setResultList] = useState([]);
    const [resultFilter, setResultFilter] = useState([]);
    const [moduleListSelect, setModuleListSelect] = useState([]);
    const [semesterCode, setSemesterCode] = useState('');
    const [moduleCode, setModuleCode] = useState([]);
    const [counter, setCounter] = useState(0);
    const columns = ["S/N", "Student ID", "Module Code", "Module Name", "CA Score", "Exam Score", "Total", "Student Grade", "Decision"];
    const [tableData, setTableData] = useState([]);

    const getRecord = async () => {
        const { success, data } = await api.get("staff/assessment/exam/approve/result/data");
        if (success && data?.message === 'success') {
            const semester_list = data.semester_list;
            const module_list = data.module_list;
            setResultList(data.result_list);
            let semester_rows = [];
            if (semester_list?.length > 0) { semester_list.forEach(sem => { semester_rows.push({ value: sem.SemesterCode, label: sem.SemesterName }); }); }
            setSemesterList(semester_rows);
            let module_rows = [];
            if (module_list?.length > 0) { module_rows.push({ value: 'all', label: `Select All` }); module_list.forEach(item => { module_rows.push({ value: item.ModuleCode, label: `${item.ModuleName} (${item.ModuleCode})` }); }); }
            setModuleListSelect(module_rows);
        } else { toast.error("Error fetching processing data"); }
        setIsLoading(false);
    };

    const handleChange = (e) => { setSemesterCode(e.target.value); setResultFilter([]); };

    const handleModuleChange = (e) => {
        let rows = [];
        let table_data = [];
        if (e.length > 0) { e.forEach(r => { rows.push(r.value); }); }
        setModuleCode(rows);
        let filter_results = [];
        let index_counter = 1;
        if (rows.length > 0) {
            rows.forEach(r => {
                const filter = resultList.filter(i => i.ModuleCode === r && i.SemesterCode === semesterCode);
                if (filter.length > 0) {
                    filter.forEach((p) => { table_data.push([(index_counter), p.StudentID, p.ModuleCode, p.ModuleTitle, p.CAScore, p.ExamScore, p.Total, p.StudentGrade, p.Decision]); filter_results.push(p); index_counter += 1; });
                }
            });
        }
        setTableData(table_data); setResultFilter(filter_results);
    };

    const onProcessResult = async () => {
        let result_to_process = [];
        moduleCode.forEach(module => { const module_result = resultList.filter(i => i.ModuleCode === module); if (module_result.length > 0) { module_result.forEach(rs => { result_to_process.push(rs); }); } });
        let counter_index = 1;
        for (const result of result_to_process) {
            const sendData = { Status: 1, UpdatedBy: props.loginData.StaffID, EntryID: result.EntryID };
            const { success } = await api.patch("staff/assessment/exam/approve/result", sendData);
            if (success) { toast.success(`${result.StudentID}'s ${result.ModuleTitle} result approved successfully`); }
            else { toast.error(`${result.StudentID}'s ${result.ModuleTitle} result not approved. Try again!`); }
            setCounter(counter_index); counter_index += 1;
        }
    };

    useEffect(() => { getRecord(); }, []);

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Approve Result"} items={["Assessment", "Exams & Records", "Approve Result"]} />
            <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-body">
                <div className="row"><div className="col-md-6"><div className="form-group"><label htmlFor="SemesterCode">Select Semester</label><SearchSelect id="SemesterCode" label="Select Semester" value={semesterList.find(op => op.value === semesterCode) || null} options={semesterList} onChange={(selected) => handleChange({ target: { id: 'SemesterCode', value: selected?.value || '' }, preventDefault: () => { } })} placeholder="Select Semester" /></div></div>
                    <div className="col-md-6"><div className="form-group"><label htmlFor="ModuleCode">Select Module</label><SearchSelect label="Select Module" value={moduleListSelect.filter(op => moduleCode.includes(op.value))} options={moduleListSelect} isMulti isDisabled={semesterCode === ''} onChange={selected => { selected && selected.find(option => option.value === "all") ? handleModuleChange(moduleListSelect.slice(1)) : handleModuleChange((selected || [])); }} placeholder="Select Module" /></div></div></div>
                <div className="row pt-5"><div className="col-md-5 Remaining text-center"><b style={{ fontSize: '100px' }}>{counter}</b><hr /><p>Approved Result</p></div><div className="col-md-2 Processed text-center text-uppercase"><b style={{ fontSize: '60px' }}>Of</b></div><div className="col-md-5 text-center"><b style={{ fontSize: '100px' }}>{resultFilter.length}</b><hr /><p>Pending Result</p></div></div>
                {resultFilter.length > 0 && <div className="col-md-12 pt-10"><button className="btn btn-primary w-100" onClick={onProcessResult}>APPROVE RESULT</button><span className="badge bg-danger w-100">This process might take a while to complete</span></div>}
                {tableData.length > 0 && <div className="row pt-5"><AgReportTable columns={columns} data={tableData} height={'800px'} /></div>}
            </div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(ApproveResult);
