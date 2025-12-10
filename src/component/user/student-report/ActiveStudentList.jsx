import axios from "axios";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/ReportTable";

const ActiveStudentList = (props) => {
  const token = props.loginData[0].token;

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const columns = [
    "S/N",
    "StudentID",
    "Student Name",
    "Course",
    "Level",
    "Semester",
    "Email Address",
    "Phone Number",
  ];

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const getStaffList = async (props) => {

    await axios
      .get(`${serverLink}student/student-report/student-list-active`, token)
      .then((res) => {
        const result = res.data;
        if (res.data.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.StudentID,
              item.StudentName,
              capitalize(item.Course),
              item.Level,
              capitalize(item.Semester),
              item.EmailAddress,
              item.PhoneNumber,
            ]);
          });
          setData(rows);
          setIsLoading(false);
        } 
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("NETWORK ERROR");
      });
  };

  useEffect(() => {
    getStaffList();
  }, []);
  return isLoading === true ? (
    <Loader />
  ) : (
    <ReportTable
      title={`Active Student List`}
      columns={columns}
      data={data}
      height={"600px"}
    />
  );
};

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails
  };
};

export default connect(mapStateToProps, null)(ActiveStudentList);
