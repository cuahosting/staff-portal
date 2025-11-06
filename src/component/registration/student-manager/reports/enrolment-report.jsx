import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import { connect } from "react-redux/es/exports";
import Loader from "../../../common/loader/loader";
import ReportTable from "../../../common/table/report_table";
import { encryptData, formatDate, formatDateAndTime } from "../../../../resources/constants";
import { Link } from "react-router-dom";


function NewStudentEnrolmentReport(props) {
    const token = props.LoginDetails[0].token;

    const [isFormLoading, setIsFormLoading] = useState('off');

    const [facultyList, setFacultyList] = useState(
        props.FacultyList.length > 0 ? props.FacultyList : []
    )
    const [coursesList, setCourseList] = useState([]);

    const [isLoading, setIsLoading] = useState(props.enrolData ? props.enrolData.length < 0 ? true : false : true);
    const columns = ["View Details", "ApplicationID", "StudentID", "FullName", "Gender", "EmailAddress", "PhoneNumber", "StudentLevel", "Course", "ModeOfEntry", "StateOfOrigin", "Lga", "Nationality", "Status"]

    const [data, setData] = useState(props.enrolData ? props.enrolData.length > 0 ? props.enrolData : [] : [])

    const getData = async () => {

        await axios.get(`${serverLink}staff/student-manager/enrolment/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((item, index) => {
                        rows.push([
                            <Link className="btn btn-sm btn-primary" to={`/registration/student-manager/enrolment/${encryptData(item.StudentID.toString())}`}><i className="fa fa-eye" /></Link>,
                            item.ApplicationID,
                            item.StudentID,
                            item.FirstName + " " + item.MiddleName + " " + item.Surname,
                            item.Gender,
                            item.EmailAddress,
                            item.PhoneNumber,
                            item.StudentLevel + " Level",
                            item.CourseName,
                            item.ModeOfEntry,
                            item.StateOfOrigin,
                            item.Lga,
                            item.Nationality,
                            <label className={
                                item.Status === "inactive" ? "badge badge-secondary" : "badge badge-success"
                            }>{
                                    item.Status === "inactive" ? "InActive" : "Active"
                                }</label>,
                        ])
                    })
                    setData(rows)
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err)
                console.log('NETWORK ERROR');
            });
    }


    useEffect(() => {
        getData()
    }, []);

    return isLoading ? (
        <Loader />
    ) :
        (
            <>
                <div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width: '100%' }}>
                    <div className="">
                        <div className="row col-md-12" style={{ width: '100%' }}>
                            <ReportTable columns={columns} data={data} title={!props.hideTitle ? "New Student Enrolment Report" : ""} height={800} />
                        </div>
                    </div>

                </div>
            </>
        )
}


const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        FacultyList: state.FacultyList,
        coursesList: state.coursesList
    };
};
export default connect(mapStateToProps, null)(NewStudentEnrolmentReport);
