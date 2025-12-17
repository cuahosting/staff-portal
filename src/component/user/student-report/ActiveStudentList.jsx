import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/ReportTable";

const ActiveStudentList = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const columns = ["S/N", "StudentID", "Student Name", "Course", "Level", "Semester", "Email Address", "Phone Number"];
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const getStudentList = async () => {
    const { success, data: result } = await api.get("student/student-report/student-list-active");
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item, index) => { rows.push([index + 1, item.StudentID, item.StudentName, capitalize(item.Course), item.Level, capitalize(item.Semester), item.EmailAddress, item.PhoneNumber]); });
      setData(rows);
    }
    setIsLoading(false);
  };

  useEffect(() => { getStudentList(); }, []);

  return isLoading ? (<Loader />) : (<ReportTable title={`Active Student List`} columns={columns} data={data} height={"600px"} />);
};

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(ActiveStudentList);
