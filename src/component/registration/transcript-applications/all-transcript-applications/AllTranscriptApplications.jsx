import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { serverLink } from "../../../../resources/url";
import Modal from "../../../common/modal/modal";
import ReportTable from "../../../common/table/report_table";
import { formatDateAndTime } from "../../../../resources/constants";
import { CommentsDisabledOutlined } from "@mui/icons-material";

import { useForm } from "react-hook-form";

function AllTranscriptApplications(props) {
  const token = props.loginData.token;

  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const columns = [
    "S/N",
    "Student ID",
    "Student Name",
    "Student Phone",
    "Student Email",
    "Inst. Name",
    "Inst. Phone",
    "Inst. Email",
    "Inst. Address",
    "Status",
  ];
  const getTranscripts = async () => {
    await axios
      .get(`${serverLink}staff/registration/transcripts`, token)
      .then((res) => {
        const data = res.data;
        let rows = [];
        if (data.message === "success") {
          data.data.length > 0 &&
            data.data.map((item, index) => {
              let status = (
                <span className="badge badge-secondary">Pending </span>
              );
              if (item.Status == "1") {
                status = <span className="badge badge-success">Approved </span>;
              }
              rows.push([
                index + 1,
                item.StudentID,
                item.Name,
                item.PhoneNumber,
                item.EmailAddress,
                item.InstitutionName,
                item.InstitutionEmail,
                item.InstitutionPhoneNo,
                item.InstitutionAddress,
                status,
              ]);
            });
        }
        setTableData(rows);
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  };

  useEffect(() => {
    getTranscripts().then();
  }, []);
  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"All Transcript Applications"}
        items={[
          "Registraion",
          "Transcript Applications",
          "All Transcript Applications",
        ]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-0">
            {" "}
            {tableData.length > 0 ? (
              <ReportTable columns={columns} data={tableData} />
            ) : (
              <></>
            )}
          </div>
        </div>

        <Modal title={"Progression Settings Form"}>
          <form>
            <div className="form-group pt-2">
              <button className="btn btn-primary w-100">Save</button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails[0],
  };
};

export default connect(mapStateToProps, null)(AllTranscriptApplications);
