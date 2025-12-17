import React, { useEffect, useState } from "react";
import { api } from "../../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../../common/loader/loader";
import ReportTable from "../../../common/table/ReportTable";
import { encryptData } from "../../../../resources/constants";
import { Link } from "react-router-dom";

function NewStudentEnrolmentReport(props) {
    const [facultyList, setFacultyList] = useState(props.FacultyList.length > 0 ? props.FacultyList : []);
    const [coursesList, setCourseList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["Action", "ApplicationID", "StudentID", "FullName", "Gender", "EmailAddress", "PhoneNumber", "StudentLevel", "Course", "ModeOfEntry", "StateOfOrigin", "Lga", "Nationality", "Status"];
    const [data, setData] = useState([]);

    const getData = async () => {
        let course = [];
        const [facRes, courseRes, enrolRes] = await Promise.all([
            api.get("staff/academics/faculty/list"),
            api.get("staff/student-manager/course/list"),
            api.get("staff/student-manager/enrolment/list")
        ]);
        if (facRes.success && facRes.data?.length > 0) { setFacultyList(facRes.data); }
        if (courseRes.success && courseRes.data?.length > 0) { setCourseList(courseRes.data); course = courseRes.data; }
        if (enrolRes.success && enrolRes.data?.length > 0) {
            let rows = [];
            enrolRes.data.forEach((item, index) => {
                rows.push([
                    <Link className="btn btn-sm btn-primary" to={`/user/student-manager/enrolment/${encryptData(item.StudentID.toString())}`}><i className="fa fa-eye" /></Link>,
                    item.ApplicationID, item.StudentID, item.FirstName + " " + item.MiddleName + " " + item.Surname, item.Gender, item.EmailAddress, item.PhoneNumber, item.StudentLevel,
                    course.filter(x => x.CourseCode.toLowerCase() === item.CourseCode.toLowerCase())[0]?.CourseName || item.CourseCode,
                    item.ModeOfEntry, item.StateOfOrigin, item.Lga, item.Nationality,
                    <label className={item.Status === "inactive" ? "badge badge-secondary" : "badge badge-success"}>{item.Status === "inactive" ? "InActive" : "Active"}</label>
                ]);
            });
            setData(rows);
        }
        setIsLoading(false);
    };

    useEffect(() => { getData(); }, []);

    return isLoading ? (<Loader />) : (
        <><div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width: '100%' }}><div className=""><div className="row col-md-12" style={{ width: '100%' }}><ReportTable columns={columns} data={data} title={"New Student Enrolment Report"} /></div></div></div></>
    );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails, FacultyList: state.FacultyList, coursesList: state.coursesList }; };
export default connect(mapStateToProps, null)(NewStudentEnrolmentReport);
