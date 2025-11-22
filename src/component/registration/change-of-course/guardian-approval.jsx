import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert, showConfirm } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
import ReportTable from "../../common/table/report_table";
import { formatDateAndTime } from "../../../resources/constants";


function ChangeofCourseGuardian(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off')
    const columns = ["SN", "StudentID", "Student Name", "Level", "Current Course ", "Requested Course", "Semester", "Guardian", "Stage", "Approved By", "Approval Date", "Final Status", "Actions"];
    const [tableData, setTableData] = useState([]);

    const getChangeofCourse = async () => {
        await axios.get(`${serverLink}staff/registration/change-of-course/applications/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((item, index) => {
                        const status = item.Status === 5 ? "Approved" : item.Status === 6 ? "Denied" : "Pending";
                        const AdmissionApprovedBy = item.AdmissionApprovedBy !== null ? item.AdmissionApprovedBy : "";
                        const disabled = item.Status === 0 ? false : true;
                        let stage = item.Status === 0 ? "Pending Guardian Approval" : item.Status === 1 ? "Guardian Approved" : item.Status === 2 ? "Guardian Denied" : item.Status === 3 ? "Admission Officer Approved" : item.Status === 4 ? "Admission Officer Denied" : item.Status === 5 ? "Registrar Approved" : "Registrar Denied";
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
                            AdmissionApprovedBy,
                            formatDateAndTime(item.AdmissionApprovedDate, "date"),
                            <span className={item.Status === 5 ? "badge badge-success" : item.Status === 6 ? "badge badge-danger" : "badge badge-secondary"}>
                                {item.Status === 5 ? "Approved" : item.Status === 6 ? "Denied" : "Pending"}
                            </span>,

                            (
                                <>
                                    <span className="d-flex justify-content-center">
                                        <button
                                            disabled={disabled}
                                            className="btn btn-sm btn-primary"
                                            onClick={() => {
                                                handleApprove(item)
                                            }
                                            }
                                        >
                                            Approve
                                        </button>
                                    </span>
                                </>
                            ),
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

    const handleApprove = async (data) => {
        showConfirm("CONFIRM APPROVAL", "Are you sure you want to approve?", "warning")
            .then(async (IsConfirmed) => {
                if (IsConfirmed) {
                    try {
                        await axios.patch(`${serverLink}staff/registration/change-of-course/guardian-approval`,
                            { EntryID: data.EntryID, GuardianApprovedBy: props.LoginDetails[0].StaffID }, token
                        )
                            .then((result) => {
                                if (result.data.message === "success") {
                                    getChangeofCourse();
                                    toast.success('Course change approved successfully');
                                } else {
                                    toast.error('please try again')
                                }
                            })
                    } catch (e) {
                        console.log('NETWORK ERROR')
                    }
                } else {

                }
            })

    }

    useEffect(() => {
        getChangeofCourse();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Change of course"}
                items={["Registration", "Change of Course", "Guardian Approval"]}
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
export default connect(mapStateToProps, null)(ChangeofCourseGuardian);
