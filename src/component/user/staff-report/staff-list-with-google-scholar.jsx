import React, { useEffect, useState } from "react";
import ReportTable from "../../common/table/ReportTable";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function StaffListByGoogleScholar(props) {
  const [isLoading, setIsLoading] = useState(true);
  const columns = ["S/N", "Staff ID", "Staff Name", "Email Address", "Link", "Status"];
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");

  const getStaffList = async () => {
    const { success, data: result } = await api.get("staff/staff-report/staff-list-by-google-scholars");
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item, index) => { rows.push([index + 1, item.StaffID, item.StaffName, item.OfficialEmailAddress, item.Scholar, item.IsActive === 1 ? "Active" : "Inactive"]); });
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
    } else { toast.error("There are no Dean's available"); }
    setIsLoading(false);
  };

  useEffect(() => { getStaffList(); }, []);

  return isLoading ? (<Loader />) : (<ReportTable title={`Staff List By Google Scholars`} columns={columns} data={data} height={tableHeight} />);
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(StaffListByGoogleScholar);
