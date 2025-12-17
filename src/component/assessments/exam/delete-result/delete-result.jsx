import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import AgReportTable from "../../../common/table/ReportTable";
import { showConfirm } from "../../../common/sweetalert/sweetalert";
import SearchSelect from "../../../common/select/SearchSelect";

function DeleteResult(props) {
    const toTitleCase = (str) => { if (!str) return ''; return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); };
    const [isLoading, setIsLoading] = useState(true);
    const [studentID, setStudentID] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentList, setStudentList] = useState([]);
    const columns = ["Action", "Student ID", "Module Code", "Module Name", "CA", "Exam", "Total", "Grade", "Decision", "Semester"];
    const [tableData, setTableData] = useState([]);

    const getStudents = async () => {
        const { success, data } = await api.get("student/student-report/student-list-active2");
        if (success && data?.length > 0) {
            let rows = [];
            data.forEach(student => { rows.push({ value: student.StudentID, label: `${student.StudentID} - ${toTitleCase(student.StudentName)}` }); });
            setStudentList(rows);
        }
        setIsLoading(false);
    };

    const handleChange = (selected) => { setSelectedStudent(selected); setStudentID(selected?.value || ""); };

    const searchResult = async () => {
        setIsLoading(true);
        const sendData = { StudentID: studentID };
        const { success, data } = await api.post("staff/assessment/exam/student/result", sendData);
        if (success && data?.message === 'success') {
            let rows = [];
            if (data.data?.length > 0) {
                data.data.forEach((row) => { rows.push([<i className="fa fa-trash text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDelete(row)} />, row.StudentID, row.ModuleCode, row.ModuleTitle, row.CAScore, row.ExamScore, row.Total, row.StudentGrade, row.Decision, row.SemesterCode]); });
            } else { toast.error("No result found for the selected student"); }
            setTableData(rows);
        } else { toast.error("Error fetching processing data"); }
        setIsLoading(false);
    };

    const handleDelete = async (result) => {
        showConfirm('RESULT DELETION?', `Are you sure you want to delete the following result\nStudent ID: ${result.StudentID}\nModule Code: ${result.ModuleCode}\nModule Name: ${result.ModuleTitle}\nTotal: ${result.Total}\nGrade: ${result.StudentGrade}\nDecision: ${result.Decision}\nSemester: ${result.SemesterCode}`, `error`, '', ["Cancel", "Yes, Delete"]).then(async (isConfirm) => {
            if (isConfirm) {
                const { success } = await api.delete(`staff/assessment/exam/delete/result/${result.EntryID}/${props.loginData.StaffID}`);
                if (success) { toast.success("Result deleted successfully!"); searchResult(); }
                else { toast.error("Something went wrong deleting result. Please try again!"); }
            }
        });
    };

    useEffect(() => { getStudents(); }, []);

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Delete Result"} items={["Assessment", "Exams & Records", "Delete Result"]} />
            <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-body">
                <div className="row"><div className="col-md-10"><SearchSelect id="StudentID" label="Select Student" value={selectedStudent} options={studentList} onChange={handleChange} placeholder="Search for a student..." /></div><div className="col-md-2"><button className="btn btn-primary w-100 mt-8" onClick={searchResult} disabled={!studentID}>Search</button></div></div>
                {tableData.length > 0 && <div className="row pt-5"><AgReportTable columns={columns} data={tableData} height={'800px'} /></div>}
            </div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(DeleteResult);
