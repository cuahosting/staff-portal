import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import { toast } from "react-toastify";

import AgReportTable from "../../../common/table/ReportTable";
import { showConfirm } from "../../../common/sweetalert/sweetalert";
import SearchSelect from "../../../common/select/SearchSelect";

function DeleteResult(props) {
    const token = props.loginData.token;

    // Convert string to Title Case
    const toTitleCase = (str) => {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const [isLoading, setIsLoading] = useState(true);
    const [studentID, setStudentID] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentList, setStudentList] = useState([]);
    const [resultList, setResultList] = useState([]);
    const columns = ["Action", "Student ID", "Module Code", "Module Name", "CA", "Exam", "Total", "Grade", "Decision", "Semester"]
    const [tableData, setTableData] = useState([]);

    const getStudents = async () => {
        await axios.get(`${serverLink}student/student-report/student-list-active2`, token)
            .then(res => {
                let rows = [];
                if (res.data.length > 0) {
                    res.data.forEach(student => {
                        rows.push({ value: student.StudentID, label: `${student.StudentID} - ${toTitleCase(student.StudentName)}` });
                    });
                }
                setStudentList(rows);
                setIsLoading(false);
            })
            .catch(err => {
                console.log("NETWORK ERROR");
                setIsLoading(false);
            });
    };

    const handleChange = (selected) => {
        setSelectedStudent(selected);
        setStudentID(selected?.value || "");
    };

    const searchResult = async () => {
        setIsLoading(true);
        const sendData = {
            StudentID: studentID
        }

        await axios.post(`${serverLink}staff/assessment/exam/student/result`, sendData, token)
            .then(res => {
                const data = res.data;
                if (data.message === 'success') {
                    let rows = [];
                    if (data.data.length > 0) {
                        data.data.map((row, index) => {
                            rows.push([
                                <i className="fa fa-trash text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDelete(row)} />,
                                row.StudentID, row.ModuleCode, row.ModuleTitle, row.CAScore,
                                row.ExamScore, row.Total, row.StudentGrade, row.Decision, row.SemesterCode
                            ])
                        })
                    } else {
                        toast.error("No result found for the selected student")
                    }
                    setTableData(rows);
                    setIsLoading(false)
                } else {
                    toast.error("Error fetching processing data")
                }
            })
            .catch(err => {
                toast.error("NETWORK ERROR")
            })
    }

    const handleDelete = async (result) => {
        showConfirm(
            'RESULT DELETION?',
            `Are you sure you want to delete the following result
                    Student ID: ${result.StudentID}
                    Module Code: ${result.ModuleCode}
                    Module Name: ${result.ModuleTitle}
                    Total: ${result.Total}
                    Grade: ${result.StudentGrade}
                    Decision: ${result.Decision}
                    Semester: ${result.SemesterCode}
                  `,
            `error`,
            '',
            ["Cancel", "Yes, Delete"]
        ).then(async (isConfirm) => {
            if (isConfirm) {
                await axios.delete(`${serverLink}staff/assessment/exam/delete/result/${result.EntryID}/${props.loginData.StaffID}`, token)
                    .then(res => {
                        if (res.data.message === 'success') {
                            toast.success("Result deleted successfully!");
                            searchResult();
                        } else {
                            toast.error("Something went wrong deleting result. Please try again!")
                        }
                    })
                    .catch(err => {
                        toast.error("Failed to delete. Network issue. Please try again!")
                    })
            }
        })
    }

    useEffect(() => {
        getStudents();
    }, []);

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Delete Result"} items={["Assessment", "Exams & Records", "Delete Result"]} />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-10">
                                <SearchSelect
                                    id="StudentID"
                                    label="Select Student"
                                    value={selectedStudent}
                                    options={studentList}
                                    onChange={handleChange}
                                    placeholder="Search for a student..."
                                />
                            </div>
                            <div className="col-md-2">
                                <button className="btn btn-primary w-100 mt-8" onClick={searchResult} disabled={!studentID}>Search</button>
                            </div>
                        </div>

                        {
                            tableData.length > 0 &&
                            <div className="row pt-5">
                                <AgReportTable columns={columns} data={tableData} height={'800px'} />
                            </div>
                        }

                    </div>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails[0],
    };
};

export default connect(mapStateToProps, null)(DeleteResult);
