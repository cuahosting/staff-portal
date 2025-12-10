import React, { useEffect, useState } from "react";
import ReportTable from "../../common/table/ReportTable";
import Loader from "../../common/loader/loader";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function HodList(props) {
  const token = props.loginData[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const columns = [
    "S/N",
    "HOD ID",
    "HOD Name",
    "Email Address",
    "Phone Number",
    "Faculty Name",
    "Department Name",
    "Department Code",
    "Designation",
    "Gender",
    "Status",
  ];
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");

  const getStaffList = async () => {
    await axios
      .get(`${serverLink}staff/staff-report/hod-list`, token)
      .then((res) => {
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.StaffID,
              item.StaffName,
              item.OfficialEmailAddress,
              item.PhoneNumber,
              item.FacultyName,
              item.DepartmentName,
              item.DepartmentCode,
              item.DesignationName,
              item.Gender,
              item.IsActive === 1 ? "Active" : "Inactive",
            ]);
          });
          setTableHeight(result.length > 100 ? "1000px" : "600px");
          setData(rows);
        } else {
          toast.error("There are no Dean's available");
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

  return isLoading ? (
    <Loader />
  ) : (
    <ReportTable
      title={`HOD List`}
      columns={columns}
      data={data}
      height={tableHeight}
    />
  );
}

const mapStateToProps = (state) => {
  return {
      loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(HodList);
