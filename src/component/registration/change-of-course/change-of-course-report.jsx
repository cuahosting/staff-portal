import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/report_table";
import { formatDateAndTime } from "../../../resources/constants";
import { connect } from "react-redux";


function ChangeofCourseReport(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off')
    const columns = ["sn", "StudentID", "Student Name", "Level", "Current Course ", "Requested Course", "Semester", "Guardian", "Stage", "Approved By", "Final status", "Approval date",]
    const [tableData, setTableData] = useState([]);

    const getChangeofCourse = async () => {
        await axios.get(`${serverLink}staff/registration/change-of-course/applications/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((item, index) => {
                        const status = item.RegistrarApprovedBy !== null ? item.RegistrarApprovedBy.split(",")[0] : "yay";
                        const RegistrarApprovedBy = item.RegistrarApprovedBy !== null ? item.RegistrarApprovedBy : "--";
                        let stage = "";
                        if (item.GuardianApprovedBy === null) {
                            stage = "Pending Guardian Approval";
                        }
                        if (item.GuardianApprovedBy !== null) {
                            stage = "Guardian Approved";
                        }
                        if (item.AdmissionApprovedBy !== null) {
                            stage = "Admission Officer Approved";
                        }
                        if (item.RegistrarApprovedBy !== null) {
                            stage = "Registrar Approved";
                        }
                        rows.push([
                            index + 1,
                            item.StudentID,
                            item.StudentName,
                            item.StudentLevel + " Level",
                            item.CourseName,
                            item.RequestedCourseName,
                            item.SemesterCode,
                            <div>
                                <div>{item.GuardianName}</div>
                                <div>{item.GuardianEmailAddress}</div>
                                <div>{item.GuardianPhone}</div>
                            </div>,
                            stage,
                            RegistrarApprovedBy,
                            <span className={item.Status === 5 ? "badge badge-success" : item.Status === 6 ? "badge badge-danger" : "badge badge-secondary"}>
                                {item.Status === 5 ? "Approved" : item.Status === 6 ? "Denied" : "Pending"}
                            </span>,
                            formatDateAndTime(item.RegistrarApprovedDate, "date"),
                        ]);
                    });

                    setTableData(rows);
                }

                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    };

    useEffect(() => {
        getChangeofCourse();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Change of course"}
                items={["Registration", "Change of Course", "Report"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body p-0">
                        <div className="col-md-12" style={{ overflowX: 'auto' }}>
                            <ReportTable columns={columns} data={tableData} title={"Guardian Approval"} />

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        FacultyList: state.FacultyList
    };
};

export default connect(mapStateToProps, null)(ChangeofCourseReport);
