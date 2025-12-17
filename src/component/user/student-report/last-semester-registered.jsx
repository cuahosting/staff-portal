import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import { connect } from "react-redux";

function LastSemesterRegistered(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const columns = ["S/N", "StudentID", "Student Name", "Course", "Level", "Semester", "Last Registered"];

  useEffect(() => {
    const fetchData = async () => {
      const { success, data: result } = await api.get("student/student-report/last-semester-registered/");
      if (success && result?.length > 0) {
        let rows = [];
        result.forEach((item, index) => { rows.push([index + 1, item.StudentID, item.Name, item.CourseName, item.StudentLevel, item.StudentSemester, item.SemesterCode]); });
        setTableHeight(result.length > 100 ? "1000px" : "600px");
        setData(rows);
        setCanSeeReport(true);
      } else { toast.error("There is no record"); setCanSeeReport(false); }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Last Semester Registered"} items={["Users", "Student Report", "Last Semester Registered"]} />
      <div className="flex-column-fluid"><div className="card"><div className="card-body pt-2">{canSeeReport && (<div className="row"><div className="col-md-12 mt-5"><ReportTable title={`Last Semester Registered`} columns={columns} data={data} height={tableHeight} /></div></div>)}</div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(LastSemesterRegistered);
