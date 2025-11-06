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

function AdmissionClearance(props) {
  const token = props.loginData.token;

  const [isLoading, setIsLoading] = useState(false);
  const [clearanceData, setClearanceData] = useState(false);
  const columns = [
    "S/N",
    "Student ID",
    "Student Name",
    "Course",
    "Level",
    "Semester",
    "Status",
    "Action By",
    "Action",
  ];
  async function TakeDecision(decision, id) {
    const dataTo={
      decision,
      id,
      Cleared: 'AdmissionCleared',
      ClearedBy: 'AdmissionClearedBy' ,
      insertedBy:props.loginData.StaffID,
      ClearedDate:'AdmissionClearedDate',
    }
    await axios
        .patch(`${serverLink}staff/users/graduation-clearance`, dataTo, token)
        .then((res) => {
          if (res.data.message === "success") {
            toast.success(decision+" Successfully");
            getClearance();
          } else {
            toast.error("An error has occurred. Please try again!");
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("NETWORK ERROR. Please try again!");
        });
  }
  const getClearance = async () => {
    await axios
      .get(`${serverLink}staff/users/graduation-clearance/admission`, token)
      .then((res) => {
        const data = res.data;
        let rows = [];
        if (data.message === "success") {
          data.data.length > 0 &&
            data.data.map((item, index) => {
              rows.push([
                index + 1,
                item.StudentID,
                item.Name,
                item.CourseCode,
                item.StudentLevel,
                item.StudentSemester,
                item.AdmissionCleared ,
                item.AdmissionClearedBy,
                <>
                  <button
                    type="button"
                    id="ApproveBtn"
                    data-toggle="tooltip"
                    data-placement="right"
                    title="Cleared"
                    onClick={() => {
                      if (item.AdmissionCleared !== "Cleared") {
                        TakeDecision("Cleared", item.StudentID);
                      }
                    }}
                    className="btn btn-sm btn-success "
                  >
                    <i className={"fa fa-check"} />
                  </button>
                  <button
                    style={{ marginLeft: "2px" }}
                    type="button"
                    id="RejectBtn"
                    data-toggle="tooltip"
                    onClick={() => {
                      if (item.AdmissionCleared !== "Rejected") {
                        TakeDecision("Rejected", item.StudentID);
                      }
                    }}
                    data-placement="right"
                    title="Reject"
                    className="btn btn-sm btn-danger "
                  >
                    <i className={"fa fa-times"} />
                  </button>
                </>,
              ]);
            });
        }
        setClearanceData(rows);
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  };

  useEffect(() => {
    getClearance().then();
  }, []);
  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Admission Clearance"}
        items={["Users", "Graduation Clearance", "Admission Clearacne"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
        <div className="card-body pt-0">
            {clearanceData.length > 0 ? (
              <ReportTable columns={columns} data={clearanceData} />
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

export default connect(mapStateToProps, null)(AdmissionClearance);
