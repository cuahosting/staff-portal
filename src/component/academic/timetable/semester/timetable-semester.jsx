import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import {connect} from "react-redux";
import TimetableSemesterForm from "./timetable-semester-form";
import {formatDate, formatDateAndTime} from "../../../../resources/constants";

function TimetableSemester(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Semester Name",
                field: "SemesterName",
            },
            {
                label: "Semester Code",
                field: "SemesterCode",
            },
            {
                label: "Start Date",
                field: "StartDate",
            },
            {
                label: "End Date",
                field: "EndDate",
            },
            {
                label: "Description",
                field: "Description",
            },
            {
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

    const [formData, setFormData] = useState({
        SemesterName: "",
        SemesterCode: "",
        StartDate: "",
        EndDate: "",
        Description: "",
        Status: "",
        EntryID: "",
        InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}`
    });

    const getTimetableSemester = async () => {
        await axios
            .get(`${serverLink}staff/academics/timetable/semester/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((semester, index) => {
                        rows.push({
                            sn: index + 1,
                            SemesterName: semester.SemesterName ?? "N/A",
                            SemesterCode: semester.SemesterCode ?? "N/A",
                            StartDate: formatDateAndTime(semester.StartDate, 'date')  ?? "N/A",
                            EndDate: formatDateAndTime(semester.EndDate, 'date') ?? "N/A",
                            Description: semester.Description ?? "N/A",
                            Status: semester.Status ?? "N/A",
                            action: (
                                <button
                                    className="btn btn-link p-0 text-primary" style={{marginRight:15}} title="Edit"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                        setFormData({
                                            SemesterName: semester.SemesterName,
                                            SemesterCode: semester.SemesterCode,
                                            StartDate: formatDate(semester.StartDate).toString(),
                                            EndDate: formatDate(semester.EndDate).toString(),
                                            Description: semester.Description,
                                            Status: semester.Status,
                                            EntryID: semester.EntryID,
                                            InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}`
                                        })
                                    }
                                >
                                    <i style={{ fontSize: '15px', color:"blue" }} className="fa fa-pen color-blue" />
                                </button>
                            ),
                        });
                    });

                    setDatatable({
                        ...datatable,
                        columns: datatable.columns,
                        rows: rows,
                    });
                }

                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    };

    const onEdit = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmit = async () => {
        if (formData.SemesterName.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the semster name", "error");
            return false;
        }
        if (formData.SemesterCode.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the semester code", "error");
            return false;
        }
        if (formData.StartDate.trim() === "") {
            showAlert("EMPTY FIELD", "Please select the start date", "error");
            return false;
        }
        if (formData.EndDate.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select the end date", "error");
            return false;
        }
        if (formData.Status.trim() === "") {
            showAlert("EMPTY FIELD", "Please select the semester status", "error");
            return false;
        }


        if (formData.EntryID === "") {
            setIsFormLoading('on')
            await axios
                .post(`${serverLink}staff/academics/timetable/semester/add`, formData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Timetable Semester Added Successfully");
                        setIsFormLoading('off')
                        getTimetableSemester();
                        document.getElementById("closeModal").click()
                        setFormData({
                            ...formData,
                            SemesterName: "",
                            SemesterCode: "",
                            StartDate: "",
                            EndDate: "",
                            Description: "",
                            Status: "",
                            EntryID: "",
                        });
                    } else if (result.data.message === "exist") {
                        setIsFormLoading('off')
                        showAlert("TIMETABLE SEMESTER EXIST", "Timetable semester already exist!", "error");
                    } else {
                        setIsFormLoading('off')
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    setIsFormLoading('off')
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        } else {
            setIsFormLoading('on')
            await axios
                .patch(`${serverLink}staff/academics/timetable/semester/update`, formData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Timetable Semester Updated Successfully");
                        setIsFormLoading('off')
                        getTimetableSemester();
                        document.getElementById("closeModal").click()
                        setFormData({
                            ...formData,
                            SemesterName: "",
                            SemesterCode: "",
                            StartDate: "",
                            EndDate: "",
                            Description: "",
                            Status: "",
                            EntryID: "",
                        });
                    } else {
                        setIsFormLoading('off')
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    setIsFormLoading('off')
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };

    useEffect(() => {
        axios
            .get(`${serverLink}staff/academics/timetable/semester/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((semester, index) => {
                        rows.push({
                            sn: index + 1,
                            SemesterName: semester.SemesterName ?? "N/A",
                            SemesterCode: semester.SemesterCode ?? "N/A",
                            StartDate: formatDateAndTime(semester.StartDate, 'date')  ?? "N/A",
                            EndDate: formatDateAndTime(semester.EndDate, 'date') ?? "N/A",
                            Description: semester.Description ?? "N/A",
                            Status: semester.Status ?? "N/A",
                            action: (
                                <button
                                    className="btn btn-link p-0 text-primary" style={{marginRight:15}} title="Edit"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                        setFormData({
                                            SemesterName: semester.SemesterName,
                                            SemesterCode: semester.SemesterCode,
                                            StartDate: formatDate(semester.StartDate).toString(),
                                            EndDate: formatDate(semester.EndDate).toString(),
                                            Description: semester.Description,
                                            Status: semester.Status,
                                            EntryID: semester.EntryID,
                                            InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}`
                                        })
                                    }
                                >
                                    <i style={{ fontSize: '15px', color:"blue" }} className="fa fa-pen color-blue" />
                                </button>
                            ),
                        });
                    });

                    setDatatable({
                        ...datatable,
                        columns: datatable.columns,
                        rows: rows,
                    });
                }

                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Timetable Semester"}
                items={["Academics", "Timetable", "Timetable Semester"]}
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                        <div className="card-toolbar">
                            <div
                                className="d-flex justify-content-end"
                                data-kt-customer-table-toolbar="base"
                            >
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            SemesterName: "",
                                            SemesterCode: "",
                                            StartDate: "",
                                            EndDate: "",
                                            Description: "",
                                            Status: "",
                                            EntryID: "",
                                        })
                                    }
                                >
                                    Add Timetable Semester
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <AGTable data={datatable} />
                    </div>
                </div>
                <Modal title={"Manage Timetable Semester"}>
                    <TimetableSemesterForm data={formData} isFormLoading={isFormLoading} onEdit={onEdit} onSubmit={onSubmit}/>
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(TimetableSemester);

