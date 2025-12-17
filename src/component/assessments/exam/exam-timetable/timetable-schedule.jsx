import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
import { api } from "../../../../resources/api";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import Modal from "../../../common/modal/modal";
import AGTable from "../../../common/table/AGTable";
import SearchSelect from "../../../common/select/SearchSelect";
import { formatDate, TimeTablePeriods } from "../../../../resources/constants";

function ExamTimeTableSchedule(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off');
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [modules, setModules] = useState([]);
    const [datatable, setDatatable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Module Code", field: "ModuleCode" }, { label: "Module Name", field: "ModuleName" }, { label: "Exam Date", field: "ExamDate" }, { label: "Start Time", field: "StartTime" }, { label: "End Time", field: "EndTime" }, { label: "Action", field: "action" }], rows: [] });
    const [createSchedule, setcreateSchedule] = useState({ EntryID: "", ModuleCode: "", ModuleCodeVal: "", SemesterCode: "", SemesterCode2: "", ExamDate: "", StartTime: "", EndTime: "", InsertedBy: props.LoginDetails[0].StaffID });
    const [moduleList, setModuleList] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [showBody, setshowBody] = useState(false);

    const getData = async () => {
        const [modRes, semRes] = await Promise.all([api.get("staff/academics/modules/list"), api.get("staff/timetable/timetable/semester")]);
        if (modRes.success && modRes.data?.length > 0) {
            let rows = [];
            modRes.data.forEach((row) => { rows.push({ value: row.ModuleCode, label: row.ModuleCode + " - " + row.ModuleName }); });
            setModules(rows); setModuleList(modRes.data);
        }
        if (semRes.success && semRes.data?.length > 0) {
            let rows = [];
            semRes.data.forEach((row) => { rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode }); });
            setSemesterList(semRes.data); setSemesterOptions(rows);
        }
        setIsLoading(false);
    };

    const getTimetable = async (semester) => {
        setIsLoading(true);
        const { success, data } = await api.get(`staff/timetable/exam-timetable/schedule/list/${semester}`);
        if (success && data?.length > 0) {
            let rows = [];
            data.forEach((exam, index) => {
                const sem = semesterList.length > 0 ? semesterList.filter(x => x.SemesterCode === exam.SemesterCode) : [];
                rows.push({
                    sn: index + 1, EntryID: exam.EntryID, ModuleCode: exam.ModuleCode, ModuleName: exam.ModuleName, SemesterCode: exam.SemesterCode, ExamDate: formatDate(exam.ExamDate), StartTime: TimeTablePeriods.filter(x => x.value.toString() === exam.StartTime.toString())[0]?.label, EndTime: TimeTablePeriods.filter(x => x.value.toString() === exam.EndTime.toString())[0]?.label,
                    action: (<button className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => { setcreateSchedule({ ...createSchedule, EntryID: exam.EntryID, ModuleCode: exam.ModuleCode, ModuleCodeVal: { value: exam.ModuleCode, label: exam.ModuleCode + " - " + exam.ModuleName }, SemesterCode: exam.SemesterCode, SemesterCode2: { value: sem[0]?.SemesterCode, label: sem[0]?.SemesterName + "- " + sem[0]?.SemesterCode }, ExamDate: exam.ExamDate, StartTime: exam.StartTime, EndTime: exam.EndTime }); }}><i className="fa fa-pen" /></button>)
                });
            });
            setDatatable({ ...datatable, columns: datatable.columns, rows: rows }); setshowBody(true);
        } else { toast.error('no record'); setshowBody(false); }
        setIsLoading(false);
    };

    const onModuleChange = (e) => { setcreateSchedule({ ...createSchedule, ModuleCode: e.value, ModuleCodeVal: e }); };
    const onEdit = (e) => { setcreateSchedule({ ...createSchedule, [e.target.id]: e.target.value }); };
    const onEditSemester = (e) => { setcreateSchedule({ ...createSchedule, SemesterCode: e.value, SemesterCode2: e }); };

    const onSubmit = async () => {
        if (createSchedule.ModuleCode === "") { showAlert("EMPTY FIELD", "Please select the module", "error"); return false; }
        if (createSchedule.ExamDate === "") { showAlert("EMPTY FIELD", "Please enter the exam date", "error"); return false; }
        if (createSchedule.EndTime === "") { showAlert("EMPTY FIELD", "Please enter end time", "error"); return false; }
        if (createSchedule.StartTime.toString() === "") { showAlert("EMPTY FIELD", "Please enter start time", "error"); return false; }
        if (createSchedule.SemesterCode.toString() === "") { showAlert("EMPTY FIELD", "Please select semester code", "error"); return false; }
        if (parseInt(createSchedule.EndTime) < parseInt(createSchedule.StartTime)) { showAlert("TIME ERROR", "End Time cannot be less than start time", "error"); return false; }
        if (parseInt(createSchedule.EndTime) === parseInt(createSchedule.StartTime)) { showAlert("TIME ERROR", "StartTime cannot be same and EndTime", "error"); return false; }
        if (parseInt(createSchedule.EndTime) - parseInt(createSchedule.StartTime) > 4) { showAlert("TIME ERROR", "Exam time cannot be more than four hours", "error"); return false; }

        if (createSchedule.EntryID === "") {
            setisFormLoading('on');
            const { success, message } = await api.post("staff/timetable/exam-timetable/schedule/add", createSchedule);
            if (success) { getData(); getTimetable(createSchedule.SemesterCode); toast.success("timetable created Successfully"); setcreateSchedule({ ...createSchedule, EntryID: "", ModuleCode: "", SemesterCode: "", ExamDate: "", StartTime: "", EndTime: "" }); document.getElementById("closeModal").click(); }
            else if (message === "exists") { showAlert("TIMETABLE EXIST", "timetable already exist!", "error"); }
            else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            setisFormLoading('off');
        } else {
            setisFormLoading('on');
            const { success, message } = await api.patch("staff/timetable/exam-timetable/schedule/update", createSchedule);
            if (success) { getTimetable(createSchedule.SemesterCode); toast.success("timetable created Successfully"); setcreateSchedule({ ...createSchedule, EntryID: "", ModuleCode: "", SemesterCode: "", SemesterCode2: "", ExamDate: "", StartTime: "", EndTime: "" }); document.getElementById("closeModal").click(); }
            else if (message === "exists") { showAlert("TIMETABLE EXIST", "timetable already exist!", "error"); }
            else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            setisFormLoading('off');
        }
    };

    const onSemesterChange = async (e) => { if (e.value !== "") { setcreateSchedule({ ...createSchedule, SemesterCode: e.value, SemesterCode2: e }); getTimetable(e.value); } else { setcreateSchedule({ ...createSchedule, SemesterCode: "", SemesterCode2: "" }); setshowBody(false); } };

    useEffect(() => { getData(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Exam Timetable Schedule"} items={["Assessment", "Exam Timetable", "Timetable"]} buttons={<button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setcreateSchedule({ ...createSchedule, EntryID: "", ModuleCode: "", ModuleCodeVal: { value: "", label: "" }, SemesterCode2: "", ExamDate: "", StartTime: "", EndTime: "", InsertedBy: props.LoginDetails[0].StaffID })}>Add Timetable</button>} />
            <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-body p-0"><div className="col-md-12">{semesterList.length > 0 && <div className="col-md-12 mb-4"><SearchSelect id="_Semester" label="Select Semester" value={createSchedule.SemesterCode2} onChange={onSemesterChange} options={semesterOptions} placeholder="select Semester" /></div>}</div>{showBody === true && <div className="col-md-12" style={{ overflowX: 'auto' }}><AGTable data={datatable} /></div>}</div></div>
                <Modal title={"Timetable"}><div className="row"><div className="col-md-12 form-group"><label htmlFor="SemesterCode">Semester</label><SearchSelect id="_Semester" value={createSchedule.SemesterCode2} onChange={onEditSemester} options={semesterOptions} placeholder="select Semester" /></div><div className=" col-md-12 form-group mt-4"><label htmlFor="ModuleCode">Module</label><SearchSelect name="ModuleCode" value={createSchedule.ModuleCodeVal} onChange={onModuleChange} options={modules} placeholder="select module" /></div><div className="col-md-12 form-group mt-4"><label htmlFor="ExamDate">Exam Date</label><input type="date" id={"ExamDate"} onChange={onEdit} value={createSchedule.ExamDate} className={"form-control"} /></div><div className="col-md-6 mt-4"><label htmlFor="StartTime">Start Time</label><SearchSelect id="StartTime" onChange={(selected) => onEdit({ target: { id: 'StartTime', value: selected?.value || '' } })} value={TimeTablePeriods.find(op => op.value == createSchedule.StartTime) || null} options={TimeTablePeriods} placeholder="Select start time" /></div><div className="col-md-6 mt-4"><label htmlFor="EndTime">End Time</label><SearchSelect id="EndTime" onChange={(selected) => onEdit({ target: { id: 'EndTime', value: selected?.value || '' } })} value={TimeTablePeriods.find(op => op.value == createSchedule.EndTime) || null} options={TimeTablePeriods} placeholder="Select end time" /></div></div><div className="form-group pt-2"><button onClick={onSubmit} className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={isFormLoading}><span className="indicator-label">Submit</span><span className="indicator-progress">Please wait...<span className="spinner-border spinner-border-sm align-middle ms-2" /></span></button></div></Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails, FacultyList: state.FacultyList }; };
export default connect(mapStateToProps, null)(ExamTimeTableSchedule);
