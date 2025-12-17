import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import Modal from "../../../common/modal/modal";
import ReportTable from "../../../common/table/ReportTable";

function AllTranscriptApplications(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const columns = ["S/N", "Student ID", "Student Name", "Student Phone", "Student Email", "Inst. Name", "Inst. Phone", "Inst. Email", "Inst. Address", "Status"];

  const getTranscripts = async () => {
    const { success, data } = await api.get("staff/registration/transcripts");
    if (success && data?.message === "success" && data.data?.length > 0) {
      const rows = data.data.map((item, index) => {
        let status = <span className="badge badge-secondary">Pending</span>;
        if (item.Status == "1") status = <span className="badge badge-success">Approved</span>;
        return [index + 1, item.StudentID, item.Name, item.PhoneNumber, item.EmailAddress, item.InstitutionName, item.InstitutionEmail, item.InstitutionPhoneNo, item.InstitutionAddress, status];
      });
      setTableData(rows);
    }
  };

  useEffect(() => { getTranscripts(); }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"All Transcript Applications"} items={["Registraion", "Transcript Applications", "All Transcript Applications"]} />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body p-0">{tableData.length > 0 ? (<ReportTable columns={columns} data={tableData} />) : (<></>)}</div>
        </div>
        <Modal title={"Progression Settings Form"}><form><div className="form-group pt-2"><button className="btn btn-primary w-100">Save</button></div></form></Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(AllTranscriptApplications);
