import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { formatDate, formatDateAndTime } from "../../../resources/constants";
import { connect } from "react-redux";

function SemesterRegistrationSettings(props) {
  const token = props.loginData[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const [
    registrationSettingsRecordDatatable,
    setRegistrationSettingsRecordDatatable,
  ] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Min Credit Load",
        field: "MinCreditLoad",
      },
      {
        label: "Max Credit Load",
        field: "MaxCreditLoad",
      },
      {
        label: "Min Spill Over",
        field: "MinSpillOver",
      },
      {
        label: "Semester Code",
        field: "SemesterCode",
      },
      {
        label:"StartDate",
        field:"StartDate"
      },
      {
        label:"EndDate",
        field:"EndDate"
      },
      {
        label: "Action",
        field: "action",
      },
    ],
    rows: [],
  });
  const [createRegistrationSettingsRecord, setCreateRegistrationSettings] =
    useState({
      EntryID: "",
      MinCreditLoad: "",
      MaxCreditLoad: "",
      MinSpillOver: "",
      SemesterCode: "",
      StartDate: "",
      EndDate: "",
      InsertedOn: "",
      InsertedBy: `${props.loginData[0].StaffID}`,
      UpdatedOn: "",
      UpdatedBy: `${props.loginData[0].StaffID}`,
    });

  const [data, setData] = useState([]);

  const resetItem = () => {
    setCreateRegistrationSettings({
      ...createRegistrationSettingsRecord,
      EntryID: "",
      MinCreditLoad: "",
      MaxCreditLoad: "",
      MinSpillOver: "",
      SemesterCode: "",
      StartDate: "",
      EndDate: "",
      InsertedOn: "",
      InsertedBy: `${props.loginData[0].StaffID}`,
      UpdatedOn: "",
      UpdatedBy: `${props.loginData[0].StaffID}`,
    })
  }

  const getProcessRelatedRecord = async () => {
    await axios
      .get(`${serverLink}staff/timetable/timetable/semester`, token)
      .then((response) => {
        setData(response.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("NETWORK ERROR");
      });
  };

  const getSemesterRegistrationRecords = async () => {
    await axios
      .get(`${serverLink}staff/registration/settings`, token)
      .then((result) => {
        if (result.data.length > 0) {
          let rows = [];
          result.data.map((semester, index) => {
            rows.push({
              sn: index + 1,
              EntryID: semester.EntryID,
              MinCreditLoad: semester.MinCreditLoad,
              MaxCreditLoad: semester.MaxCreditLoad,
              MinSpillOver: semester.MinSpillOver,
              SemesterCode: semester.SemesterCode,
              StartDate: formatDateAndTime(semester.StartDate, "date") ?? "N/A",
              EndDate: formatDateAndTime(semester.EndDate, "date") ?? "N/A",
              InsertedOn: semester.InsertedOn,
              InsertedBy: semester.InsertedBy,
              UpdatedOn: semester.UpdatedOn,
              UpdatedBy: semester.UpdatedBy,
              action: (
                <button
                  className="btn btn-sm btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_general"
                  onClick={() =>
                    setCreateRegistrationSettings({
                      EntryID: semester.EntryID,
                      MinCreditLoad: semester.MinCreditLoad,
                      MaxCreditLoad: semester.MaxCreditLoad,
                      MinSpillOver: semester.MinSpillOver,
                      SemesterCode: semester.SemesterCode,
                      StartDate: formatDate(semester.StartDate).toString(),
                      EndDate: formatDate(semester.EndDate).toString(),
                      InsertedOn: semester.InsertedOn,
                      InsertedBy: `${props.loginData[0].StaffID}`,
                      UpdatedOn: semester.UpdatedOn,
                      UpdatedBy: `${props.loginData[0].StaffID}`,
                    })
                  }
                >
                  <i className="fa fa-pen" />
                </button>
              ),
            });
          });

          setRegistrationSettingsRecordDatatable({
            ...registrationSettingsRecordDatatable,
            columns: registrationSettingsRecordDatatable.columns,
            rows: rows,
          });
        }

        setIsLoading(false);
      })
      .catch((err) => {
        console.log("NETWORK ERROR");
      });
  };

  const onEdit = (e) => {
    setCreateRegistrationSettings({
      ...createRegistrationSettingsRecord,
      [e.target.id]: e.target.value,
    });
  };

  const onSubmit = async () => {
    for (let key in createRegistrationSettingsRecord) {
      if (
        createRegistrationSettingsRecord.hasOwnProperty(key) &&
        key !== "UpdatedBy" &&
        key !== "EntryID" &&
        key !== "UpdatedOn" &&
        key !== "InsertedOn" &&
        key !== "InsertedBy"
      ) {
        if (createRegistrationSettingsRecord[key] === "") {
          await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
          return false;
        }
      }
    }

    if (createRegistrationSettingsRecord.EntryID === "") {
      toast.info("Submitting. Please wait...");
      await axios
        .post(
          `${serverLink}staff/registration/add/settings`,
          createRegistrationSettingsRecord, token
        )
        .then((result) => {
          if (result.data.message === "success") {
            toast.success("Settings submitted successfully");
            getSemesterRegistrationRecords();
            getProcessRelatedRecord();
            resetItem();
          } else if (result.data.message === "exist") {
            showAlert("RECORD EXIST", "Record already exist!", "error");
          } else {
            showAlert(
              "ERROR",
              "Something went wrong. Please try again!",
              "error"
            );
          }
        })
        .catch((error) => {
          showAlert(
            "NETWORK ERROR",
            "Please check your connection and try again!",
            "error"
          );
        });
    } else {
      toast.info("Updating. Please wait...");
      await axios
        .patch(
          `${serverLink}staff/registration/update/settings/`,
          createRegistrationSettingsRecord, token
        )
        .then((result) => {
          if (result.data.message === "success") {
            toast.success("Settings updated successfully");
            getSemesterRegistrationRecords();
            getProcessRelatedRecord();
            resetItem();
          } else {
            showAlert(
              "ERROR",
              "Something went wrong. Please try again!",
              "error"
            );
          }
        })
        .catch((error) => {
          showAlert(
            "NETWORK ERROR",
            "Please check your connection and try again!",
            "error"
          );
        });
    }
  };

  useEffect(() => {
    getSemesterRegistrationRecords().then((r) => {});
    getProcessRelatedRecord().then((r) => {});
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Semester Registration Settings"}
        items={["Settings", "Registration", "Semester Registration Settings"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-header border-0 pt-6">
            <div className="card-title" />
            <div className="card-toolbar">
              <div
                className="d-flex justify-content-end"
                data-kt-customer-table-toolbar="base"
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_general"
                  onClick={() => resetItem()}
                >
                  Add Semester Settings
                </button>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <AGTable data={registrationSettingsRecordDatatable} />
          </div>
        </div>
        <Modal title={"Semester Registration Settings Form"}>
          <div className="col-lg-12 col-md-12">
            <div className="form-group">
              <label htmlFor="SemesterCode">Semester</label>
              <select
                id="SemesterCode"
                name="SemesterCode"
                value={createRegistrationSettingsRecord.SemesterCode}
                className="form-control"
                onChange={onEdit}
              >
                <option value="">Select Option</option>
                {data.length > 0 ? (
                  <>
                    {data.map((item, index) => {
                      return (
                        <option key={index} value={item.SemesterCode}>
                          {item.SemesterName} ({item.Status})
                        </option>
                      );
                    })}
                  </>
                ) : (
                  ""
                )}
              </select>
            </div>
          </div>
          <div className="col-lg-12 col-md-12 pt-5">
            <div className="form-group">
              <label htmlFor="MinCreditLoad">Min Credit Load</label>
              <input
                type="text"
                id="MinCreditLoad"
                className="form-control"
                placeholder="MinCreditLoad"
                value={createRegistrationSettingsRecord.MinCreditLoad}
                onChange={onEdit}
              />
            </div>
          </div>
          <div className="col-lg-12 col-md-12 pt-5">
            <div className="form-group">
              <label htmlFor="MaxCreditLoad">Max Credit Load</label>
              <input
                type="text"
                id="MaxCreditLoad"
                className="form-control"
                placeholder="MaxCreditLoad"
                value={createRegistrationSettingsRecord.MaxCreditLoad}
                onChange={onEdit}
              />
            </div>
          </div>
          <div className="col-lg-12 col-md-12 pt-5">
            <div className="form-group">
              <label htmlFor="MinSpillOver">Min Spill Over</label>
              <input
                type="text"
                id="MinSpillOver"
                className="form-control"
                placeholder="MinSpillOver"
                value={createRegistrationSettingsRecord.MinSpillOver}
                onChange={onEdit}
              />
            </div>
          </div>
          <div className="col-lg-12 col-md-12 pt-5">
            <div className="form-group">
              <label htmlFor="StartDate">Start Date</label>
              <input
                type="date"
                id="StartDate"
                className="form-control"
                placeholder="Start Date"
                required
                value={formatDate(createRegistrationSettingsRecord.StartDate)}
                onChange={onEdit}
              />
            </div>
          </div>
          <div className="col-lg-12 col-md-12 pt-5">
            <div className="form-group">
              <label htmlFor="EndDate">End Date</label>
              <input
                type="date"
                id="EndDate"
                className="form-control"
                placeholder="End Date"
                required
                value={formatDate(createRegistrationSettingsRecord.EndDate)}
                onChange={onEdit}
              />
            </div>
          </div>

          <div className="form-group pt-5">
            <button onClick={onSubmit} className="btn btn-primary w-100">
              Submit
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(SemesterRegistrationSettings);
