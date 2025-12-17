import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import SearchSelect from "../../../common/select/SearchSelect";

function TimetableMigration(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [semesterList, setSemesterList] = useState([]);
    const [schoolSemester, setSchoolSemester] = useState("");
    const [schoolSemester2, setSchoolSemester2] = useState("");
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [semesterOptions2, setSemesterOptions2] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedSemester2, setSelectedSemester2] = useState("");
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ timetableData: [], from: '', to: '', InsertedBy: props.loginData[0].StaffID });

    const getSemesterList = async () => {
        const { success, data } = await api.get("staff/timetable/timetable/semester");
        if (success && data?.length > 0) { let rows = []; data.forEach((row) => { rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode }); }); setSemesterList(data); setSemesterOptions(rows); setSemesterOptions2(rows); }
        setIsLoading(false);
    };

    const onSemesterChange = async (e) => {
        const semester = e.value;
        setSelectedSemester(semester);
        setSchoolSemester(e);
        toast.info('Please wait...');
        if (semester !== '') {
            const { success, data } = await api.get(`staff/timetable/migration/availability/${semester}`);
            if (success && data?.length > 0) { setFormData({ ...formData, timetableData: data, from: semester }); }
            else { toast.error(`Sorry, no timetable found for the selected trimester => (${semester}).`); setFormData({ ...formData, timetableData: [], from: "" }); }
            setIsLoading(false);
        } else { toast.error('Please select semester'); setIsLoading(false); }
    };

    const onSemesterChange2 = async (e) => {
        const semester = e.value;
        setSelectedSemester2(semester);
        setSchoolSemester2(e);
        toast.info('Please wait...');
        if (semester !== '') {
            const { success, data } = await api.get(`staff/timetable/migration/check/${semester}`);
            if (success && data?.length > 0) { toast.error(`Sorry, timetable already added for the selected trimester => (${semester}).`); setFormData({ ...formData, to: "" }); }
            else { setFormData({ ...formData, to: semester }); }
            setIsLoading(false);
        } else { toast.error('Please select semester'); setIsLoading(false); }
    };

    const run_migration = async (e) => {
        e.preventDefault();
        if (formData.from.toString().trim() === "") { toast.error('Please select from semester form field'); return false; }
        if (formData.to.toString().trim() === "") { toast.error('Please select to semester form field'); return false; }
        if (formData.timetableData.length < 1) { toast.error('Timetable data can not be empty; Please select to semester form field to get timetable data'); return false; }
        toast.info("please wait while system is running migration...");
        const { success, data } = await api.post("staff/timetable/migration", formData);
        if (success) {
            if (data?.message === "exist") { toast.error(`Sorry, timetable already added for the selected trimester => (${formData.to}).`); }
            else if (data?.message === "success") { toast.success("Timetable Migration Completed"); }
            else { toast.error("NETWORK ERROR. Please try again!"); }
        }
    };

    useEffect(() => { getSemesterList(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Timetable Migration"} items={["Academics", "Timetable", "Timetable Migration"]} />
            <div className="row">
                <div className="col-md-5"><label htmlFor="SemesterCode">From </label><SearchSelect name="SemesterCode" className="form-select w-100" value={schoolSemester} onChange={onSemesterChange} options={semesterOptions} placeholder="select Semester" /></div>
                <div className="col-md-5"><label htmlFor="SemesterCode">To</label><SearchSelect name="SemesterCode" className="form-select w-100" value={schoolSemester2} onChange={onSemesterChange2} options={semesterOptions2} placeholder="select Semester" /></div>
                <div className="col-md-2"><br /><button className="btn btn-primary form-control" type="button" onClick={run_migration} style={{ marginTop: '10px' }}>Run Migration</button><br /></div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(TimetableMigration);
