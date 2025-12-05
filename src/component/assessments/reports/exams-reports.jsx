import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import {projectAddress, serverLink} from "../../../resources/url";
import {
    formatDateAndTime,
    projectLogo,
} from "../../../resources/constants";
import { useReactToPrint } from "react-to-print";
import {
    projectName,
    projectEmail,
    projectPhone,
} from "../../../resources/url";
import AGTable from "../../common/table/AGTable";
import {showAlert} from "../../common/sweetalert/sweetalert";

function ExaminationReports(props) {
    const token = props.loginData.token;

    const [isLoading, setIsLoading] = useState(false);
    const [canSeeReport, setCanSeeReport] = useState(false);
    const [semesterList, setSemesterList] = useState([]);
    const [data, setData] = useState([]);
    const [students, setStudents] = useState([]);
    const componentRef = useRef();
    const printAllComponentRef = useRef();
    const [selectedStudent, setSelectedStudent] = useState([]);
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Student ID", field: "StudentID" },
            { label: "Module Code", field: "ModuleCode" },
            { label: "Module Title", field: "ModuleTitle" },
            { label: "Total", field: "Total" },
            { label: "Student Grade", field: "StudentGrade" },
            { label: "Decision", field: "Decision" }
        ],
        rows: []
    });

    const [createReport, setCreateReport] = useState({
        ReportType: "",
        SemesterCode: "",
        EntryID: "",
    });

    const print = useReactToPrint({
        content: () => componentRef.current,
    });

    const printAll = useReactToPrint({
        content: () => printAllComponentRef.current,
    });

    const relatedData = async () => {
        axios
            .get(`${serverLink}registration/registration-report/semester-list/`, token)
            .then((response) => {
                setSemesterList(response.data);
                setIsLoading(false);
            })
            .catch((ex) => {
                console.error(ex);
            });


        axios
            .get(`${serverLink}staff/assessment/exam/students/`, token)
            .then((response) => {
                setStudents(response.data);
                setIsLoading(false);
            })
            .catch((ex) => {
                console.error(ex);
            });
    };


    useEffect(() => {
        relatedData().then((r) => {});
    }, []);


    const onEdit = (e) => {
        setCreateReport({
            ...createReport,
            [e.target.id]: e.target.value,
        });
    }

    const onSearch = async () => {
        for (let key in createReport) {
            if (
                createReport.hasOwnProperty(key) &&
                key !== "EntryID"
            ) {
                if (createReport[key] === "") {
                    await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
                    return false;
                }
            }
        }

        if (createReport.ReportType === "Processed"){
            if (createReport.SemesterCode !== "") {
                setIsLoading(true);
                await axios
                    .get(`${serverLink}staff/assessment/exam/result/by/semester/${createReport.SemesterCode}`, token)
                    .then((res) => {
                        const data = res.data;
                        let rows = [];
                        if (data.length > 0) {
                            setData(data);
                            data.map((item, index) => {
                                rows.push({
                                    sn: index + 1,
                                    StudentID: item.StudentID || 'N/A',
                                    ModuleCode: item.ModuleCode || 'N/A',
                                    ModuleTitle: item.ModuleTitle || 'N/A',
                                    Total: item.Total || 0,
                                    StudentGrade: item.StudentGrade || 'N/A',
                                    Decision: item.Decision || 'N/A'
                                });
                            });
                        }
                        setDatatable({
                            ...datatable,
                            rows: rows
                        });
                        setIsLoading(false);
                    })
                    .catch((err) => {
                        toast.error("NETWORK ERROR. Please try again!");
                    });
            }
        }

        if (createReport.ReportType === "Approved"){
            if (createReport.SemesterCode !== "") {
                setIsLoading(true);
                await axios
                    .get(`${serverLink}staff/assessment/exam/result/by/semester/${createReport.SemesterCode}`, token)
                    .then((res) => {
                        const data = res.data;
                        let rows = [];
                        if (data.length > 0) {
                            setData(data);
                            data.map((item, index) => {
                                rows.push({
                                    sn: index + 1,
                                    StudentID: item.StudentID || 'N/A',
                                    ModuleCode: item.ModuleCode || 'N/A',
                                    ModuleTitle: item.ModuleTitle || 'N/A',
                                    Total: item.Total || 0,
                                    StudentGrade: item.StudentGrade || 'N/A',
                                    Decision: item.Decision || 'N/A'
                                });
                            });
                        }
                        setDatatable({
                            ...datatable,
                            rows: rows
                        });
                        setIsLoading(false);
                    })
                    .catch((err) => {
                        toast.error("NETWORK ERROR. Please try again!");
                    });
            }
        }
    }

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <div className="flex-column-fluid">
                <div className="row">
                    <div className="col-md-4 pt-5">
                            <label className="required">Select Semester</label>
                            <select
                                className="form-select"
                                data-placeholder="Select Semester"
                                id="SemesterCode"
                                onChange={onEdit}
                                value={createReport.SemesterCode}
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
                    {createReport.SemesterCode && (
                        <div className="col-md-4 pt-5">
                            <label htmlFor="ReportType">Select Report Type</label>
                            <select
                                className="form-control"
                                id="ReportType"
                                name="ReportType"
                                value={createReport.ReportType}
                                onChange={onEdit}
                            >
                                <option value="">Select Option</option>
                                <option value="Processed">Processed Results</option>
                                <option value="Approved">Approved Results</option>
                            </select>
                        </div>
                    )}
                    {createReport.SemesterCode && createReport.ReportType && (
                        <div className="col-md-4 pt-12">
                            <button className="btn btn-primary w-100" onClick={onSearch}>Search</button>
                        </div>
                    )}
                </div>
                <br />

                {datatable.rows.length > 0 && (
                    <div className="card card-no-border">
                        <div className="card-body p-0">
                            <AGTable data={datatable} />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails[0],
    };
};

export default connect(mapStateToProps, null)(ExaminationReports);
