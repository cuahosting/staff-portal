import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";
import AgReportTable from "../../../common/table/AGReportTable";
import { toast } from "react-toastify";
import { showAlert } from "../../../common/sweetalert/sweetalert";

function EXAMCAFinalSubmission(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [runningModules, setRunningModules] = useState([]);
    const [caSubmissionDataTable, setCASubmissionDataTable] = useState([]);
    const [createFindCARecord, setCreateFindCARecord] = useState({ ModuleCode: "" });
    const columns = ["S/N", "Module Code", "Module Name", "CA Name", "CA Contribution (100%)"];
    const [tableHeight, setTableHeight] = useState("200px");
    const [caSettingsList, setCASettingList] = useState([]);
    const [onSubmitItem, setOnSubmitItem] = useState([]);

    const getRunningModules = async () => {
        const { success, data } = await api.get("staff/assessments/staff/running/module/list");
        if (success && data?.length > 0) {
            let rows = [];
            data.forEach((row) => { rows.push({ label: `${row.ModuleName} (${row.ModuleCode})`, value: row.ModuleCode }); });
            setRunningModules(rows);
        }
        setIsLoading(false);
    };

    const findStudentsRegisteredModules = async (e) => {
        e.preventDefault();
        setCreateFindCARecord({ ...createFindCARecord, [e.target.id]: e.target.value });
        setIsLoading(true);
        const sendData = { ...createFindCARecord, ModuleCode: e.target.value };
        if (sendData.ModuleCode !== "") {
            const { success, data } = await api.get(`staff/assessments/get/ca/settings/${sendData.ModuleCode}/`);
            if (success && data?.length > 0) {
                setCASettingList(data);
                let rows = [];
                data.forEach((item, index) => {
                    let ca_score_field = <input type="number" step={0.01} className="form-control" placeholder="Enter CA Contribution" onChange={onEdit} module_code={item.ModuleCode} entry_id={item.EntryID} />;
                    rows.push([(index + 1), item.ModuleCode, item.ModuleName, item.CAName, ca_score_field]);
                });
                if (rows.length < 10) { setTableHeight(`${rows.length}00`); } else { setTableHeight(`800px`); }
                setCASubmissionDataTable(rows);
            }
        }
        setIsLoading(false);
    };

    const onEdit = (e) => { const entry_id = e.target.getAttribute("entry_id"); const value = e.target.value; if (value !== '') { let sendData = onSubmitItem; sendData.push({ entry_id: parseFloat(entry_id), score: parseFloat(value) }); setOnSubmitItem(sendData); } };

    const handleSubmit = async () => {
        const output = Object.values(onSubmitItem.reduce((a, item) => { a[item.entry_id] = item; return a; }, {}));
        if (output.length < 1) { toast.error("Please enter the CA Contribution before submitting"); return false; }
        let setting_data = [];
        caSettingsList.forEach(item => { const filter_record = output.filter(i => i.entry_id === item.EntryID); if (filter_record.length > 0) { setting_data.push(filter_record[0]); } });
        if (setting_data.length < 1) { toast.error("Please enter all the CA Contribution before submitting"); return false; }
        if (setting_data.length !== caSettingsList.length) { toast.error("Please enter all the CA Contribution before submitting"); return false; }
        let total_contribution = 0; setting_data.forEach(item => { total_contribution += item.score; });
        if (total_contribution !== 100) { toast.error("CA Contribution must be equal to 100"); return false; }
        setIsLoading(true);
        const sendData = { records: setting_data };
        const { success } = await api.patch("staff/assessments/update/ca/percentage", sendData);
        if (success) { toast.success("Final CA Submission is Saved successfully."); setCASubmissionDataTable([]); setCreateFindCARecord([]); getRunningModules(); }
        else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
        setIsLoading(false);
    };

    useEffect(() => { getRunningModules(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Exam Final CA Submission"} items={["Assessment", "Assessment", "Exam Final CA Submission"]} />
            <div className="row"><div className="row pt-5"><div className="col-lg-12 col-md-4 pt-5"><label htmlFor="ModuleCode">Select Module</label><SearchSelect id="ModuleCode" label="Select Module" value={runningModules.find(op => op.value === createFindCARecord.ModuleCode) || null} options={runningModules} onChange={(selected) => findStudentsRegisteredModules({ target: { id: 'ModuleCode', value: selected?.value || '' }, preventDefault: () => { } })} placeholder="Search Module" /></div></div></div>
            {isLoading ? (<Loader />) : (<><div className="table-responsive pt-10"><AgReportTable columns={columns} data={caSubmissionDataTable} height={tableHeight} pagination={false} /></div>{caSubmissionDataTable.length > 0 && <button className="btn btn-primary w-100" onClick={handleSubmit}>Submit</button>}</>)}
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails, currentSemester: state.currentSemester }; };
export default connect(mapStateToProps, null)(EXAMCAFinalSubmission);
