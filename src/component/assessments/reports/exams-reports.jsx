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
import ReportTable from "../../common/table/report_table";
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
    const [generalDatatable, setGeneralDatatable] = useState([]);
    const columns = [
        "S/N",
        "Student ID",
        "Module Code",
        "Module Title",
        "Total",
        "Student Grade",
        "Decision",
        // "Action"
    ];

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
                                rows.push([
                                    index + 1,
                                    item.StudentID,
                                    item.ModuleCode,
                                    item.ModuleTitle,
                                    item.Total,
                                    item.StudentGrade,
                                    item.Decision,
                                    (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-primary"
                                                onClick={() => {
                                                    setCanSeeReport(true);
                                                    setTimeout(() => {
                                                        print();
                                                        setCanSeeReport(false);
                                                    }, 10);
                                                }}
                                            >
                                                <i className="fa fa-print" />
                                            </button>

                                        </>
                                    ),
                                ]);
                                rows.push([
                                    index + 1,
                                    item.StudentID,
                                    item.ModuleCode,
                                    item.ModuleTitle,
                                    item.Total,
                                    item.StudentGrade,
                                    item.Decision,
                                ]);
                            });
                        }
                        setGeneralDatatable(rows);
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
                                rows.push([
                                    index + 1,
                                    item.StudentID,
                                    item.ModuleCode,
                                    item.ModuleTitle,
                                    item.Total,
                                    item.StudentGrade,
                                    item.Decision,
                                    (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-primary"
                                                onClick={() => {
                                                    setCanSeeReport(true);
                                                    setTimeout(() => {
                                                        print();
                                                        setCanSeeReport(false);
                                                    }, 10);
                                                }}
                                            >
                                                <i className="fa fa-print" />
                                            </button>

                                        </>
                                    ),
                                ]);
                                rows.push([
                                    index + 1,
                                    item.StudentID,
                                    item.ModuleCode,
                                    item.ModuleTitle,
                                    item.Total,
                                    item.StudentGrade,
                                    item.Decision,
                                    // (
                                    //     <>
                                    //         <button
                                    //             type="button"
                                    //             className="btn btn-sm btn-primary"
                                    //             onClick={() => {
                                    //                 setCanSeeReport(true);
                                    //                 setTimeout(() => {
                                    //                     print();
                                    //                     setCanSeeReport(false);
                                    //                 }, 10);
                                    //                 setSelectedStudent(item.StudentID);
                                    //             }}
                                    //
                                    //         >
                                    //             <i className="fa fa-print" />
                                    //         </button>
                                    //
                                    //     </>
                                    // ),
                                ]);
                            });
                        }
                        setGeneralDatatable(rows);
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

                <ReportTable title={"Students Approved Result"} columns={columns} data={generalDatatable} />

                {/*{createReport.SemesterCode && createReport.ReportType && generalDatatable.length > 0 && (*/}
                {/*    <>*/}
                {/*        <div className="col-md-12 pt-5">*/}
                {/*            <button className="btn btn-primary w-100"*/}
                {/*                    onClick={() => {*/}
                {/*                        setCanSeeReport(true);*/}
                {/*                        setTimeout(() => {*/}
                {/*                            printAll();*/}
                {/*                            setCanSeeReport(false);*/}
                {/*                        }, 10);*/}
                {/*                    }}>Print All*/}
                {/*            </button>*/}
                {/*        </div>*/}

                {/*        {canSeeReport === true && (*/}
                {/*            <div className="table-responsive">*/}
                {/*                <div className="p-5" ref={printAllComponentRef}>*/}
                {/*                    /!*HEADER START*!/*/}
                {/*                    <div style={{ textSize: "100%" }}>*/}
                {/*                        <div className="pt-3">*/}
                {/*                            <div className="header" style={{backgroundColor: "#e0e0e0", color: "black",}}>*/}
                {/*                                <div style={{textAlign: "center", padding: "12px", color: "black",}}>*/}
                {/*                                    <h5*/}
                {/*                                        style={{*/}
                {/*                                            textAlign: "center",*/}
                {/*                                            color: "black",*/}
                {/*                                        }}*/}
                {/*                                    >*/}
                {/*                                        <img*/}
                {/*                                            alt="Logo"*/}
                {/*                                            src={projectLogo}*/}
                {/*                                            style={{*/}
                {/*                                                height: "70px",*/}
                {/*                                                alignText: "center",*/}
                {/*                                            }}*/}
                {/*                                        />*/}
                {/*                                        <br />*/}
                {/*                                        <p></p>*/}
                {/*                                        {projectName}*/}
                {/*                                    </h5>*/}
                {/*                                    <p*/}
                {/*                                        style={{*/}
                {/*                                            textAlign: "center",*/}
                {/*                                            color: "black",*/}
                {/*                                            marginButton: "50px",*/}
                {/*                                            lineHeight: "1.6",*/}
                {/*                                        }}*/}
                {/*                                    >*/}
                {/*                                        {projectAddress}<br />*/}
                {/*                                        {new Date().toLocaleString().replace(",", "")}*/}
                {/*                                    </p>*/}
                {/*                                </div>*/}
                {/*                            </div>*/}
                {/*                        </div>*/}
                {/*                    </div>*/}
                {/*                    /!*HEADER END*!/*/}

                {/*                    <h4 className="pt-5">*/}
                {/*                        {createReport.ReportType} Results for {createReport.SemesterCode} Semester Examination*/}
                {/*                    </h4>*/}

                {/*                    <table className="table table-striped p-5">*/}
                {/*                        <thead>*/}
                {/*                        <tr>*/}
                {/*                            <th>S/N</th>*/}
                {/*                            <th>StudentID</th>*/}
                {/*                            <th>Names</th>*/}
                {/*                            <th>Module Code</th>*/}
                {/*                            <th>Module Title</th>*/}
                {/*                            <th>Total</th>*/}
                {/*                            <th>Student Grade</th>*/}
                {/*                            <th>Decision</th>*/}
                {/*                        </tr>*/}
                {/*                        </thead>*/}

                {/*                        <tbody>*/}
                {/*                            {data.length > 0 && (*/}
                {/*                                <>*/}
                {/*                                    {data.map((item, index) => (*/}
                {/*                                        <tr key={index}>*/}
                {/*                                            <td>{index+1}</td>*/}
                {/*                                            <td>{item.StudentID}</td>*/}
                {/*                                            <td>*/}
                {/*                                                {students.length > 0 &&*/}
                {/*                                                students*/}
                {/*                                                    .filter(*/}
                {/*                                                        (i) => i.StudentID === item.StudentID*/}
                {/*                                                    )*/}
                {/*                                                    .map((r) => r.FirstName)}*/}
                {/*                                            </td>*/}
                {/*                                            <td>{item.ModuleCode}</td>*/}
                {/*                                            <td>{item.ModuleTitle}</td>*/}
                {/*                                            <td>{item.Total}</td>*/}
                {/*                                            <td>{item.StudentGrade}</td>*/}
                {/*                                            <td>{item.Decision}</td>*/}
                {/*                                        </tr>*/}
                {/*                                    ))}*/}
                {/*                                </>*/}
                {/*                            )}*/}
                {/*                        </tbody>*/}
                {/*                    </table>*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        )}*/}
                {/*    </>*/}
                {/*)}*/}
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
