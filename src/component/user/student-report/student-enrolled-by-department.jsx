import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import Chart from "react-google-charts";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";

function StudentsEnrolledByDepartment(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [academicCount, setAcademicCount] = useState(0);
  const [nonAcademicCount, setNonAcademicCount] = useState(0);
  const data = [["Category", "Staff Count"], ["Academic", academicCount], ["Non Academic", nonAcademicCount]];
  const options = { title: "Staff Distribution" };

  const getStaffList = async () => {
    const { success, data: result } = await api.get("staff/staff-report/staff-distribution");
    if (success && result?.length > 0) { setAcademicCount(result[0].Academic); setNonAcademicCount(result[0].NonAcademic); }
    else { toast.error("There are no Dean's available"); }
    setIsLoading(false);
  };

  useEffect(() => { getStaffList(); }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Staff Distribution"} items={["Users", "Staff Report", "Staff Distribution"]} />
      <div className="flex-column-fluid"><div className="card"><div className="card-header border-0 pt-6"><div className="card-title" /></div><div className="card-body p-0"><Chart chartType="PieChart" data={data} options={options} width={"100%"} height={"600px"} /></div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(StudentsEnrolledByDepartment);
