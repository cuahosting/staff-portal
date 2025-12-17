import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { formatDateAndTime, projectLogo } from "../../../../resources/constants";
import { useReactToPrint } from "react-to-print";
import { projectName, projectEmail, projectPhone } from "../../../../resources/url";
import ReportTable from "../../../common/table/ReportTable";

function ReturnList(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [generalDatatable, setGeneralDatatable] = useState([]);
  const columns = ["S/N", "Student ID", "Student Name", "Reason", "Semesters Off", "Guardian Name", "Guardian Contact", "Applied On"];

  const getDeferments = async () => {
    const { success, data } = await api.get("staff/users/student-manager/student-return-list");
    if (success && data?.message === "success" && data.data?.length > 0) {
      const rows = data.data.map((item, index) => [index + 1, item.StudentID, item.Name, item.Reason, item.NumberOfSemesters, item.ParentName, item.ParentPhoneNumber, formatDateAndTime(item.InsertedOn, "date_and_time")]);
      setGeneralDatatable(rows);
    }
  };

  useEffect(() => { getDeferments(); }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Return List"} items={["Registration", "Student Deferment", "Return List"]} />
      <div className="flex-column-fluid">
        <div className="card"><div className="card-body p-0"><ReportTable columns={columns} data={generalDatatable} /></div></div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(ReturnList);
