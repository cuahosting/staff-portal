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

function StudentDefermentReturn(props) {
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

  const runDeferment = async () => {
    const { success, data } = await api.get("staff/users/student-manager/run-deferment");
    if (success && data?.message === "success") { toast.success("Completed!"); }
    else if (success) { toast.error("Please try again!"); }
  };

  useEffect(() => { getDeferments(); }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Student Deferment Return"} items={["Registration", "Student Deferment", "Student Deferment Return"]} />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-header border-0 pt-6">
            <div className="card-title" />
            <div className="card-toolbar">
              <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                {generalDatatable.length > 0 ? (<button type="button" onClick={() => runDeferment()} className="btn btn-primary">Run Deferment</button>) : (<button type="button" disabled className="btn btn-primary">No Returning Student</button>)}
              </div>
            </div>
          </div>
          <div className="card-body p-0"><ReportTable columns={columns} data={generalDatatable} /></div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(StudentDefermentReturn);
