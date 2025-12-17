import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { ThreeDots } from "react-loader-spinner";

function AttendanceList(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [datatable, setDatatable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Student ID", field: "StudentID" }, { label: "Student Name", field: "StudentName" }, { label: "Course", field: "Course" }, { label: "Level", field: "Level" }, { label: "Semester", field: "Semester" }, { label: "Status", field: "Status" }, { label: "Attended", field: "Attended" }], rows: [] });
    const [formData, setFormData] = useState({ SelectedDate: props.attendanceData.SelectedDate, Schedule: props.attendanceData.Schedule, ModuleCode: props.attendanceData.ModuleCode, InsertedBy: `${props.loginData[0].StaffID} ` });

    const getAttendanceList = async () => {
        const { success, data } = await api.post("staff/assessment/attendance/attended", formData);
        if (success && data?.length > 0) {
            let rows = [];
            data.forEach((attendance, index) => {
                rows.push({
                    sn: index + 1, StudentID: attendance.StudentID ?? "N/A", StudentName: attendance.StudentName ?? "N/A", Course: attendance.Course ?? "N/A", Level: attendance.Level ?? "N/A", Semester: attendance.Semester ?? "N/A", Status: attendance.Status ?? "N/A",
                    Attended: attendance.Attended === 0 ? (isFormLoading ? <ThreeDots height="40" width="40" color="grey" ariaLabel="loading" /> : <input type="checkbox" id="Attended" className="form-check-input" data={attendance.StudentID} value={1} onChange={onEdit} checked={false} />) : (<span className="text-success">attended</span>)
                });
            });
            setDatatable({ ...datatable, columns: datatable.columns, rows: rows });
        }
        setIsFormLoading(false); setIsLoading(false);
    };

    const onEdit = async (e) => {
        let student_id = e.target.getAttribute('data');
        let sendData = { ...formData, StudentID: student_id };
        setIsFormLoading(true);
        const { success } = await api.post("staff/assessment/attendance/mark-attendance", sendData);
        if (success) { toast.success("Attendance was marked successfully"); getAttendanceList(); }
    };

    useEffect(() => { getAttendanceList(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Mark Attendance"} items={["Assessment", "Attendance", "Mark Attendance"]} />
            <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-header border-0 pt-6"><div className="card-title" /></div><div className="card-body p-0"><AGTable data={datatable} /></div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails, attendanceData: state.generalDetails }; };
export default connect(mapStateToProps, null)(AttendanceList);
