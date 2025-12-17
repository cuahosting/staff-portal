import React, { useEffect, useState } from "react";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import ReportTable from "../../../common/table/ReportTable";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";

function HRPensionReport(props) {

  const [isLoading, setIsLoading] = useState(true);
  const columns = ["Staff ID", "Staff Name", "Employee Contribution", "Staff Contribution", "Total", "Month", "Year", "Added By", "Added Date"]
  const [data, setData] = useState([]);

  const getRecord = async () => {
    const { success, data } = await api.get("staff/hr/pension/report");
    if (success && data.length > 0) {
      let rows = [];
      data.map((item, index) => {
        rows.push([item.StaffID, item.StaffName, currencyConverter(item.EmployeeContribution),
        currencyConverter(item.EmployerContribution), currencyConverter(item.TotalContribution),
        item.ContributionMonth, item.ContributionYear,
        item.InsertedBy, formatDateAndTime(item.InsertedDate, 'date')]
        )
      });
      setData(rows)
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getRecord();
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <ReportTable title={"Pension Report"} columns={columns} data={data} />
  );
}
const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(HRPensionReport);

