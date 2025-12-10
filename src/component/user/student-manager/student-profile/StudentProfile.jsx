import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { serverLink } from "../../../../resources/url";
import Modal from "../../../common/modal/modal";
import ReportTable from "../../../common/table/ReportTable";
import { formatDateAndTime } from "../../../../resources/constants";
import { CommentsDisabledOutlined } from "@mui/icons-material";

import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import NewStudentEnrolmentReport from "../../../registration/student-manager/reports/enrolment-report";

function StudentProfile(props) {
  const token = props.loginData.token;

  const [isLoading, setIsLoading] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const columns = [
    "S/N",
    "ID",
    "Student Name",
    "Phone",
    "Email",
    "Course Name",
    "Level",
    "Semester",
    "Gender",
    "Action",
  ];

  const getStudentDetails = async () => {
    await axios
      .get(`${serverLink}staff/student-manager/student/active`, token)
      .then((res) => {
        const data = res;
        let rows = [];
        data.data.length > 0 &&
          data.data.map((item, index) => {
            let last4digits = item.StudentID.slice(item.StudentID.length-4);
            rows.push([
              index + 1,
              item.StudentID,
              item.FirstName + " " + item.Surname,
              item.EmailAddress,
              item.PhoneNumber,
              item.CourseName,
              item.StudentLevel,
              item.StudentSemester,
              item.Gender,
              <Link
                  to={`/users/student-manager/student-profile/${last4digits}`}
                >
              <button
                      type="button"
                      className="btn btn-sm btn-primary"
                    >
                      <i className="fa fa-eye" />
                    </button>
                    </Link>
            ]);
          });
        setStudentList(rows);
      })
      .catch((err) => {
        toast.error("NETWORK ERROR. Please try again!");
      });
  };
  useEffect(() => {
    //getStudentDetails();
  }, []);
  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Student Profile"}
        items={["Users", "Student Manager", "Student Profile"]}
      />
      <div className="flex-column-fluid">
      <NewStudentEnrolmentReport hideTitle={true}/>
        <div className="card">
          <div className="card-body p-0">
          
            {/* <ReportTable columns={columns} data={studentList} /> */}
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

export default connect(mapStateToProps, null)(StudentProfile);
