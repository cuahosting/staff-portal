import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import SearchSelect from "../../common/select/SearchSelect";

function CANotSubmitted(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [datatable, setDatatable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Module Code", field: "ModuleCode" }, { label: "Module Name", field: "ModuleName" }, { label: "Staff ID", field: "StaffID" }, { label: "Staff Name", field: "StaffName" }, { label: "Student Count", field: "GetStudentTakingModule" }], rows: [] });
    const [createSchedule, setcreateSchedule] = useState({ EntryID: "", ModuleCode: "", ModuleCodeVal: "", SemesterCode: "", SemesterCode2: "", ExamDate: "", StartTime: "", EndTime: "", InsertedBy: props.LoginDetails[0].StaffID });
    const [semesterList, setSemesterList] = useState([]);
    const [showBody, setshowBody] = useState(false);

    const getData = async () => {
        const { success, data } = await api.get("staff/timetable/timetable/semester");
        if (success && data?.length > 0) {
            let rows = [];
            data.forEach((row) => { rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode }); });
            setSemesterList(data); setSemesterOptions(rows);
        }
        setIsLoading(false);
    };

    const getTimetable = async (semester) => {
        setIsLoading(true);
        const { success, data } = await api.get(`staff/assessment/exam/ca-not-submitted/${semester}`);
        if (success && data?.length > 0) {
            let rows = [];
            data.forEach((exam, index) => { rows.push({ sn: index + 1, EntryID: exam.EntryID, ModuleCode: exam.ModuleCode, ModuleName: exam.ModuleName, StaffID: exam.StaffID, StaffName: exam.StaffName, GetStudentTakingModule: exam.GetStudentTakingModule }); });
            setDatatable({ ...datatable, columns: datatable.columns, rows: rows }); setshowBody(true);
        } else { toast.error('no record'); setshowBody(false); }
        setIsLoading(false);
    };

    const onSemesterChange = async (e) => {
        if (e.value !== "") { setcreateSchedule({ ...createSchedule, SemesterCode: e.value, SemesterCode2: e }); getTimetable(e.value); }
        else { setcreateSchedule({ ...createSchedule, SemesterCode: "", SemesterCode2: "" }); setshowBody(false); }
    };

    useEffect(() => { getData(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"CA Not Submitted"} items={["Assessment", "Report", "CA Not Submitted"]} />
            <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-body pt-2"><div className="col-md-12">{semesterList.length > 0 && <div className="col-md-12 mb-4"><SearchSelect id="_Semester" label="Select Semester" value={createSchedule.SemesterCode2} onChange={onSemesterChange} options={semesterOptions} placeholder="select Semester" /></div>}</div>{showBody === true && <div className="col-md-12" style={{ overflowX: 'auto' }}><AGTable data={datatable} /></div>}</div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails, FacultyList: state.FacultyList }; };
export default connect(mapStateToProps, null)(CANotSubmitted);
