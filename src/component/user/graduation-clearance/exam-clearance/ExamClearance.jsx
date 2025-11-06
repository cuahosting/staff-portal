import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { serverLink } from "../../../../resources/url";
import Modal from "../../../common/modal/modal";
import ReportTable from "../../../common/table/report_table";
import Table from "../../../common/table/table";
import { formatDateAndTime } from "../../../../resources/constants";
import { CommentsDisabledOutlined } from "@mui/icons-material";

import { useForm } from "react-hook-form";

function ExamClearance(props) {
  const token = props.loginData.token;

  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
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

  const [datatable, setDatatable] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Module Code",
        field: "code",
      },
      {
        label: "Module Title",
        field: "title",
      },
      {
        label: "Module Credit",
        field: "credit",
      },
      {
        label: "Student Grade",
        field: "grade",
      },
    ],
    rows: [],
  });
  async function TakeDecision(decision, id) {
    const dataTo = {
      decision,
      id,
      Cleared: "ExamsCleared",
      ClearedBy: "ExamsClearedBy",
      insertedBy: props.loginData.StaffID,
      ClearedDate: "ExamsClearedDate",
    };
    await axios
      .patch(`${serverLink}staff/users/graduation-clearance`, dataTo, token)
      .then((res) => {
        if (res.data.message === "success") {
          toast.success(decision + " Successfully");
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
  async function getStudentPerformance(id) {
    let last4digits = id.slice(id.length - 4);
    await axios
      .get(
        `${serverLink}staff/users/graduation-clearance/academic-performance/${last4digits}`, token
      )
      .then((res) => {
        if (res.data.data.length > 0) {
          let rows = [];
          res.data.data.map((item, index) => {
            rows.push({
              sn: index + 1,
              code: item.ModuleCode,
              title: item.ModuleTitle,
              credit: "3",
              grade: item.StudentGrade,
            });
          });

          setDatatable({
            ...datatable,
            columns: datatable.columns,
            rows: rows,
          });
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
      .get(`${serverLink}staff/users/graduation-clearance/exam`, token)
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
                item.ExamsCleared,
                item.ExamsClearedBy,
                <>
                  <button
                    type="button"
                    id="ApproveBtn"
                    data-toggle="tooltip"
                    data-placement="right"
                    title="Cleared"
                    onClick={() => {
                      if (item.ExamsCleared !== "Cleared") {
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
                      setName(item.Name);
                      getStudentPerformance(item.StudentID);
                    }}
                    data-placement="right"
                    data-bs-toggle="modal"
                    data-bs-target="#modal_academic"
                    title="View"
                    className="btn btn-sm btn-primary "
                  >
                    <i className={"fa fa-eye"} />
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
        title={"Exam Clearance"}
        items={["Users", "Graduation Clearance", "Exam Clearacne"]}
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

        <div
          className="modal fade"
          id="modal_academic"
          tabIndex="-1"
          aria-labelledby="bedForm"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h3
                  className="modal-title"
                  id="bedForm"
                >{`${name} Academic Performance`}</h3>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <Table data={datatable} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails[0],
  };
};

export default connect(mapStateToProps, null)(ExamClearance);
