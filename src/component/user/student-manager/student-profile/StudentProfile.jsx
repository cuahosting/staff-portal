import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { Link } from "react-router-dom";
import NewStudentEnrolmentReport from "../../../registration/student-manager/reports/enrolment-report";

function StudentProfile(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const columns = ["S/N", "ID", "Student Name", "Phone", "Email", "Course Name", "Level", "Semester", "Gender", "Action"];

  const getStudentDetails = async () => {
    const { success, data } = await api.get("staff/student-manager/student/active");
    if (success && data?.length > 0) {
      let rows = [];
      data.forEach((item, index) => {
        let last4digits = item.StudentID.slice(item.StudentID.length - 4);
        rows.push([index + 1, item.StudentID, item.FirstName + " " + item.Surname, item.EmailAddress, item.PhoneNumber, item.CourseName, item.StudentLevel, item.StudentSemester, item.Gender, <Link to={`/users/student-manager/student-profile/${last4digits}`}><button type="button" className="btn btn-sm btn-primary"><i className="fa fa-eye" /></button></Link>]);
      });
      setStudentList(rows);
    }
  };

  useEffect(() => { /* getStudentDetails(); */ }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Student Profile"} items={["Users", "Student Manager", "Student Profile"]} />
      <div className="flex-column-fluid"><NewStudentEnrolmentReport hideTitle={true} /><div className="card"><div className="card-body p-0"></div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(StudentProfile);
