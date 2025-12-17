import React, { useEffect, useState } from "react";
import ReportTable from "../../common/table/ReportTable";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function DeanList(props) {
  const [isLoading, setIsLoading] = useState(true);
  const columns = ["S/N", "Dean ID", "Dean Name", "Email Address", "Phone Number", "Faculty Name", "Department Name", "Designation", "Gender", "Status"];
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");

  const getStaffList = async () => {
    const { success, data: result } = await api.get("staff/staff-report/dean-list");
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item, index) => { rows.push([index + 1, item.StaffID, item.StaffName, item.OfficialEmailAddress, item.PhoneNumber, item.FacultyName, item.DepartmentName, item.DesignationName, item.Gender, item.IsActive === 1 ? "Active" : "Inactive"]); });
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
    } else { toast.error("There are no dean's available"); }
    setIsLoading(false);
  };

  useEffect(() => { getStaffList(); }, []);

  return isLoading ? (<Loader />) : (<ReportTable title={`Dean List`} columns={columns} data={data} height={tableHeight} />);
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(DeanList);
