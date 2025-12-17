import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/ReportTable";

const StudentListAll = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const columns = ["S/N", "StudentID", "Student Name", "Course", "Level", "Semester", "Email Address", "Phone Number", "Status"];
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const getStaffList = async () => {
    const { success, data: result } = await api.get("student/student-report/student-list-all");
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item, index) => { rows.push([index + 1, item.StudentID, item.StudentName, capitalize(item.Course), item.Level, capitalize(item.Semester), item.EmailAddress, item.PhoneNumber, item.Status]); });
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
    } else { toast.error("There are no Dean's available"); }
    setIsLoading(false);
  };

  useEffect(() => { getStaffList(); }, []);

  return isLoading ? (<Loader />) : (<ReportTable title={` Student List All`} columns={columns} data={data} height={tableHeight} />);
};

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(StudentListAll);
