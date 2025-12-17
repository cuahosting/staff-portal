import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import 'react-circular-progressbar/dist/styles.css';

function ProcessCA(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [runningModule, setRunningModule] = useState([]);
    const [registeredStudent, setRegisteredStudent] = useState([]);
    const [caSettings, setCASettings] = useState([]);
    const [caEntryID, setCAEntryID] = useState([]);
    const [counter, setCounter] = useState(0);

    const getRecords = async () => {
        const { success, data } = await api.get("staff/assessments/process/ca/data");
        if (success && data?.message === 'success') {
            setRunningModule(data.module_list);
            setRegisteredStudent(data.registered_student_list);
            setCASettings(data.ca_setting_list);
            setCAEntryID(data.ca_entry_list);
        } else { toast.error("Something went wrong fetching data. Please try again!"); }
        setIsLoading(false);
    };

    useEffect(() => { getRecords(); }, []);

    const processStudentsCA = async () => {
        let counter_value = 0;
        runningModule.forEach(async module => {
            const module_name = module.ModuleName;
            const module_code = module.ModuleCode;
            let student_ca_data = [];
            const module_ca_settings = caSettings.filter(i => i.ModuleCode === module_code);
            const module_reg_students = registeredStudent.filter(i => i.ModuleCode === module_code);
            if (module_ca_settings.length > 0) {
                if (module_reg_students.length > 0) {
                    module_reg_students.forEach(student => {
                        let student_ca_record = [];
                        const student_id = student.StudentID;
                        const student_level = student.StudentLevel;
                        const student_semester = student.StudentSemester;
                        module_ca_settings.forEach(setting => {
                            const student_ca = caEntryID.filter(i => i.StudentID === student_id && i.SettingsID === setting.EntryID);
                            if (student_ca.length > 0) { const student_ca_value = (student_ca[0].CAScore / setting.CAMarked) * setting.CAPerCon; student_ca_record.push(student_ca_value); }
                            else { student_ca_record.push(0); }
                        });
                        const student_ca_total = student_ca_record.reduce((partialSum, a) => partialSum + a, 0);
                        const student_total_module_ca_score = Math.round((student_ca_total + Number.EPSILON) * 100) / 100;
                        student_ca_data.push({ StudentID: student_id, StudentLevel: student_level, StudentSemester: student_semester, ModuleCode: module_code, ModuleName: module_name, CAMarkedScore: student_total_module_ca_score, CAPerCon: runningModule.filter(i => i.ModuleCode === module_code)[0]['CAPerCon'], CAScore: Math.round(((student_total_module_ca_score / 100) * module.CAPerCon + Number.EPSILON) * 100) / 100, InsertedBy: props.loginData.StaffID });
                    });
                    if (student_ca_data.length > 0) {
                        const sendData = { ca_data: student_ca_data };
                        const { success } = await api.post("staff/assessments/post/processed/ca", sendData);
                        if (success) { toast.success(`${module_name} processed successfully`); } else { toast.success(`${module_name} not process`); }
                    }
                }
            }
            counter_value += 1; setCounter(counter_value);
        });
    };

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={`Process CA`} items={["Assessment", "Process CA"]} />
            <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-body">
                <div className="row"><div className="col-md-4 Remaining"><b style={{ fontSize: '150px' }}>{counter}</b><hr /><p>Processed Module</p></div><div className="col-md-4 Processed text-center text-uppercase"><b style={{ fontSize: '120px' }}>Of</b><h3 className="student_name"></h3><h3 className="percentage"></h3></div><div className="col-md-4 text-center"><b style={{ fontSize: '120px' }}>{runningModule.length}</b><hr /><p>Total Running Modules</p></div></div>
                {runningModule.length > 0 ? <button className="btn btn-primary w-100 run-progression" id="run-progression" onClick={processStudentsCA}>Process CA</button> : <div className="alert alert-info">There is no running module for the active semester</div>}
            </div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0], currentSemester: state.currentSemester }; };
export default connect(mapStateToProps, null)(ProcessCA);
