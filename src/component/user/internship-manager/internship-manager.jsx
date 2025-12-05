import React, { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import axios from "axios";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { serverLink } from "../../../resources/url";
import Table from "../../common/table/table";
import Modal from "../../common/modal/modal";
import {showAlert} from "../../common/sweetalert/sweetalert";
import {toast} from "react-toastify";
import { shortCode } from "../../../resources/constants";


function InternshipManager(props) {
    const token = props.loginData.token;

    const [isLoading, setIsLoading] = useState(true);
    const [semesterList, setSemesterList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [currentRecordSemester, setCurrentRecordSemester] = useState([]);
    const [semester, setSemester] = useState({
        code: "",
        desc: "",
    });
    const [studentsDatatable, setStudentsDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Student ID",
                field: "StudentID",
            },
            {
                label: "Student Name",
                field: "StudentName",
            },
            {
                label: "Company Name",
                field: "CompanyName",
            },{
                label: "Company Address",
                field: "CompanyAddress",
            },{
                label: "Acceptance",
                field: "AcceptanceDocument",
            },{
                label: "Status",
                field: "Status",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [updateStudentInternship, setUpdateStudentInternship] = useState({
        EntryID: "",
        StudentID: "",
        StaffID: "",
        CompanyName: "",
        CompanyAddress: "",
        AcceptanceDocument: "",
        SupervisorName: "",
        SupervisorPhoneNumber: "",
        SemesterCode: "",
        Status: "",
    });


    const onEdit = (e) => {
        setUpdateStudentInternship({
            ...updateStudentInternship,
            [e.target.id]: e.target.value,
        });
    };

    const onInternshipApproval = async () => {
        for (let key in updateStudentInternship) {
            if (
                updateStudentInternship.hasOwnProperty(key) &&
                key !== "SupervisorName" &&
                key !== "SupervisorPhoneNumber" &&
                key !== "Status"
            ) {
                if (updateStudentInternship[key] === "") {
                    await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
                    return false;
                }
            }
        }

        if (updateStudentInternship.StaffID !== "" && updateStudentInternship.StaffID !== "undefined"){
            const record = [
                {
                    StudentID: updateStudentInternship.StudentID,
                    StaffID: updateStudentInternship.StaffID,
                    CompanyName: updateStudentInternship.CompanyName,
                    CompanyAddress: updateStudentInternship.CompanyAddress,
                    SupervisorName: updateStudentInternship.StaffID,
                    SupervisorPhoneNumber: updateStudentInternship.SupervisorPhoneNumber,
                    SemesterCode: updateStudentInternship.SemesterCode,
                    Status: updateStudentInternship.Status,
                }
            ]

            const sendData = {
                records: record
            }

            if (sendData) {
                toast.info("Submitting. Please wait...");
                await axios
                    .patch(`${serverLink}staff/users/internship-manager/update/supervisor/info`, sendData, token)
                    .then((result) => {
                        if (result.data.message === "success") {
                            toast.success("Record updated successfully");
                            getAllRecords();
                            document.getElementById("closeModal").click()

                        } else {
                            showAlert(
                                "ERROR",
                                "Something went wrong. Please try again!",
                                "error"
                            );
                        }
                    })
                    .catch((error) => {
                        showAlert(
                            "NETWORK ERROR",
                            "Please check your connection and try again!",
                            "error"
                        );
                    });
            }
        }
    }

    const getSemesters = useCallback(async () => {
        axios
            .get(`${serverLink}registration/registration-report/semester-list/`, token)
            .then((response) => {
                setSemesterList(response.data);
                setIsLoading(false);
            })
            .catch((ex) => {
                console.error(ex);
            });
    }, [token]);

    const getStaffMemo = useCallback(async () => {
        axios.get(`${serverLink}staff/hr/staff-management/staff/list`, token)
            .then((res) => {
                setStaffList(res.data);
                setIsLoading(false);
                if (res.data.length > 0 ){
                    let rows = [];
                    res.data.forEach(item => {
                        rows.push({
                            id: item.StaffID,
                            text: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StaffID})`
                        })
                    })
                }
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    }, [token]);

    useEffect(() => {
        getSemesters().then((r) => {});
        getStaffMemo().then((r) => {});
    }, [getSemesters, getStaffMemo]);

    const handleChange = async (e) => {
        setIsLoading(true);

        setSemester({
            ...semester,
            [e.target.id]: e.target.value,
        });

        const semesterCode = e.target.value;

        if (semesterCode !== ""){
            await axios
                .get(`${serverLink}staff/users/internship-manager/student/list/${semesterCode}`, token)
                .then((result) => {

                    if (result.data.length > 0){
                        let rows = [];
                        result.data.forEach((item, index) => {
                            rows.push({
                                sn: index + 1,
                                StudentID: item.StudentID,
                                CompanyName: item.CompanyName,
                                CompanyAddress: item.CompanyAddress,
                                CompanyState: item.CompanyState,
                                AcceptanceDocument: (
                                    <>
                                        {item.AcceptanceDocument ? (
                                            <a className="btn btn-sm btn-danger" target="_blank"
                                               rel="noreferrer"
                                               href={`${serverLink}public/uploads/${shortCode}/student_uploads/internship_uploads/${item.AcceptanceDocument}`}>
                                                <i className="fa fa-file-pdf" />
                                            </a>
                                        ):(
                                            <p>No Attachment</p>
                                        )}
                                    </>
                                ),
                                SupervisorName: item.SupervisorName,
                                SupervisorPhoneNumber: item.SupervisorPhoneNumber,
                                SemesterCode: item.SemesterCode,
                                Status: (
                                    <>
                                        {item.Status === 0 && (
                                            <span className="badge badge-info">Applied</span>
                                        )}

                                        {item.Status === 1 && (
                                            <span className="badge badge-light-info">Approved</span>
                                        )}

                                        {item.Status === 2 && (
                                            <span className="badge badge-danger">Rejected</span>
                                        )}

                                        {item.Status === 3 && (
                                            <span className="badge badge-success">Accepted</span>
                                        )}
                                    </>
                                ),
                                action: (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() =>{
                                            setUpdateStudentInternship({
                                                StudentID: item.StudentID,
                                                CompanyName: item.CompanyName,
                                                CompanyAddress: item.CompanyAddress,
                                                CompanyState: item.CompanyState,
                                                AcceptanceDocument: item.AcceptanceDocument,
                                                SupervisorName: item.SupervisorName,
                                                SupervisorPhoneNumber: item.SupervisorPhoneNumber,
                                                SemesterCode: item.SemesterCode,
                                                Status: item.Status,
                                            })
                                            setCurrentRecordSemester(item.SemesterCode);
                                        }
                                    }>
                                        <i className="fa fa-pen" />
                                    </button>
                                ),
                            });
                        });

                        setStudentsDatatable({
                            ...studentsDatatable,
                            columns: studentsDatatable.columns,
                            rows: rows,
                        });
                    }else {
                        setStudentsDatatable({
                            ...studentsDatatable,
                            columns: studentsDatatable.columns,
                            rows: [],
                        });
                    }
                })
                .catch((err) => {
                    console.log("NETWORK ERROR");
                });
        }

        setIsLoading(false);
    }

    const getAllRecords = async (e) => {
        if (currentRecordSemester !== ""){
            await axios
                .get(`${serverLink}staff/users/internship-manager/student/list/${currentRecordSemester}`, token)
                .then((result) => {

                    if (result.data.length > 0){
                        let rows = [];
                        result.data.forEach((item, index) => {
                            rows.push({
                                sn: index + 1,
                                StudentID: item.StudentID,
                                CompanyName: item.CompanyName,
                                CompanyAddress: item.CompanyAddress,
                                CompanyState: item.CompanyState,
                                AcceptanceDocument: (
                                    <>
                                        {item.AcceptanceDocument ? (
                                            <a className="btn btn-sm btn-danger" target="_blank"
                                               rel="noreferrer"
                                               href={`${serverLink}public/uploads/${shortCode}/student_uploads/internship_uploads/${item.AcceptanceDocument}`}>
                                                <i className="fa fa-file-pdf" />
                                            </a>
                                        ):(
                                            <p>
                                                {"No Attachment"}
                                            </p>
                                        )}
                                    </>
                                ),
                                SupervisorName: item.SupervisorName,
                                SupervisorPhoneNumber: item.SupervisorPhoneNumber,
                                SemesterCode: item.SemesterCode,
                                Status: (
                                    <>
                                        {item.Status === 0 && (
                                            <span className="badge badge-info">Applied</span>
                                        )}

                                        {item.Status === 1 && (
                                            <span className="badge badge-light-info">Approved</span>
                                        )}

                                        {item.Status === 2 && (
                                            <span className="badge badge-danger">Rejected</span>
                                        )}

                                        {item.Status === 3 && (
                                            <span className="badge badge-success">Accepted</span>
                                        )}
                                    </>
                                ),
                                action: (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() =>
                                            setUpdateStudentInternship({
                                                StudentID: item.StudentID,
                                                CompanyName: item.CompanyName,
                                                CompanyAddress: item.CompanyAddress,
                                                CompanyState: item.CompanyState,
                                                AcceptanceDocument: item.AcceptanceDocument,
                                                SupervisorName: item.SupervisorName,
                                                SupervisorPhoneNumber: item.SupervisorPhoneNumber,
                                                SemesterCode: item.SemesterCode,
                                                Status: item.Status,
                                            })
                                        }
                                    >
                                        <i className="fa fa-pen" />
                                    </button>
                                ),
                            });
                        });

                        setStudentsDatatable({
                            ...studentsDatatable,
                            columns: studentsDatatable.columns,
                            rows: rows,
                        });
                    }else {
                        setStudentsDatatable({
                            ...studentsDatatable,
                            columns: studentsDatatable.columns,
                            rows: [],
                        });
                    }
                })
                .catch((err) => {
                    console.log("NETWORK ERROR");
                });
        }
    }

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Internship Approval"}
                items={["Users", "Internship Approval"]}
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body p-0">
                        <div className="col-md-12 fv-row pt-10">
                            <label className="required fs-6 fw-bold mb-2">
                                Select Semester
                            </label>
                            <select
                                className="form-select"
                                data-placeholder="Select Semester"
                                id="code"
                                onChange={handleChange}
                                value={semester.code}
                                required
                            >
                                <option value="">Select option</option>
                                {semesterList.map((s, i) => (
                                    <option key={i} value={s.SemesterCode}>
                                        {s.Description}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <br />

                        {studentsDatatable.rows.length > 0 ? (
                            <Table data={studentsDatatable} />
                        ): (
                            <div className="alert alert-info col-md-12">Kindly select semester to view students internship for approval or the selected semester has no students.</div>
                        )}

                        <Modal title={"Approve Student Internship"}>
                            <div className="col-lg-12 col-md-12">
                                <div className="form-group">
                                    <label htmlFor="StaffID">StaffID</label>
                                    <select
                                        id="StaffID"
                                        name="StaffID"
                                        value={updateStudentInternship.StaffID}
                                        className="form-control"
                                        onChange={onEdit}
                                    >
                                        <option value="">Select Option</option>
                                        {staffList ? (
                                            <>
                                                {staffList.map((item, index) => {
                                                    return (
                                                        <option key={index} value={item.StaffID}>
                                                            {item.FirstName}{" "}{item.MiddleName}{" "}{item.Surname}{" "}({item.StaffID})
                                                        </option>
                                                    );
                                                })}
                                            </>
                                        ) : (
                                            ""
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="col-lg-12 col-md-12 pt-5">
                                <div className="form-group">
                                    <label htmlFor="SupervisorPhoneNumber">Supervisor PhoneNumber</label>
                                    <input
                                        type="text"
                                        id="SupervisorPhoneNumber"
                                        className="form-control"
                                        placeholder="Supervisor Phone Number"
                                        value={updateStudentInternship.SupervisorPhoneNumber}
                                        onChange={onEdit}
                                    />
                                </div>
                            </div>
                            <div className="col-lg-12 col-md-12">
                                <div className="form-group pt-3">
                                    <label htmlFor="Status">Decision</label>
                                    <select
                                        className="form-control"
                                        id="Status"
                                        name="Status"
                                        value={updateStudentInternship.Status}
                                        onChange={onEdit}
                                    >
                                        <option value="">Select Option</option>
                                        <option value="0">Applied</option>
                                        <option value="1">Approve</option>
                                        <option value="2">Rejected</option>
                                        <option value="3">Accepted</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group pt-5">
                                <button onClick={onInternshipApproval} className="btn btn-primary w-100">
                                    Submit
                                </button>
                            </div>
                        </Modal>

                    </div>
                </div>

            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails[0],
    };
};

export default connect(mapStateToProps, null)(InternshipManager);
