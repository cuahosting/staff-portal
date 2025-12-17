import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/ReportTable";
import { formatDateAndTime } from "../../../resources/constants";
import { connect } from "react-redux";

function ChangeofCourseReport(props) {
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["sn", "StudentID", "Student Name", "Level", "Current Course ", "Requested Course", "Semester", "Guardian", "Stage", "Approved By", "Final status", "Approval date"];
    const [tableData, setTableData] = useState([]);

    const getChangeofCourse = async () => {
        const { success, data } = await api.get("staff/registration/change-of-course/applications/list");
        if (success && data?.length > 0) {
            const rows = data.map((item, index) => {
                const RegistrarApprovedBy = item.RegistrarApprovedBy !== null ? item.RegistrarApprovedBy : "--";
                let stage = item.GuardianApprovedBy === null ? "Pending Guardian Approval" : item.AdmissionApprovedBy === null ? "Guardian Approved" : item.RegistrarApprovedBy === null ? "Admission Officer Approved" : "Registrar Approved";
                return [
                    index + 1, item.StudentID, item.StudentName, item.StudentLevel + " Level", item.CourseName, item.RequestedCourseName, item.SemesterCode,
                    <div><div>{item.GuardianName}</div><div>{item.GuardianEmailAddress}</div><div>{item.GuardianPhone}</div></div>,
                    stage, RegistrarApprovedBy,
                    <span className={item.Status === 5 ? "badge badge-success" : item.Status === 6 ? "badge badge-danger" : "badge badge-secondary"}>{item.Status === 5 ? "Approved" : item.Status === 6 ? "Denied" : "Pending"}</span>,
                    formatDateAndTime(item.RegistrarApprovedDate, "date")
                ];
            });
            setTableData(rows);
        }
        setIsLoading(false);
    };

    useEffect(() => { getChangeofCourse(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Change of course"} items={["Registration", "Change of Course", "Report"]} />
            <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-body p-0"><div className="col-md-12" style={{ overflowX: 'auto' }}><ReportTable columns={columns} data={tableData} title={"Guardian Approval"} /></div></div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails, FacultyList: state.FacultyList }; };
export default connect(mapStateToProps, null)(ChangeofCourseReport);
