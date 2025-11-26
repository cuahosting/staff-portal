import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import Table from "../../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import {connect} from "react-redux";
import {formatDate, formatDateAndTime} from "../../../../resources/constants";

function HRPensionSettings(props) {
  const token = props.loginData[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const [datatable, setDatatable] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Employee Contribution (%)",
        field: "employee_contribution",
      },
      {
        label: "Employer Contribution (%)",
        field: "employer_contribution",
      },
      {
        label: "Inserted By",
        field: "inserted_by",
      },
      {
        label: "Inserted Date",
        field: "inserted_date",
      },
    ],
    rows: [],
  });

  const [createSettings, setCreateSettings] = useState({
    employee_contribution: "",
    employer_contribution: "",
    inserted_by: props.loginData[0].StaffID,
    inserted_date: "",
    entry_id: "",
  });

  const getRecords = async () => {
    await axios
      .get(`${serverLink}staff/hr/pension/settings/list`, token)
      .then((result) => {
        if (result.data.length > 0) {
          let rows = [];
          result.data.map((data, index) => {
            rows.push({
              sn: index + 1,
              employee_contribution: data.EmployeeContribution,
              employer_contribution: data.EmployerContribution,
              inserted_by: data.InsertedBy,
              inserted_date: formatDateAndTime(data.InsertedDate.split('T')[0], 'date'),
              entry_id: data.EntryID,
            });
          });

          setDatatable({
            ...datatable,
            columns: datatable.columns,
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
    setCreateSettings({
      ...createSettings,
      [e.target.id]: e.target.value,
    });
  };

  const onSubmit = async () => {
    if (createSettings.employee_contribution === "") {
      showAlert("EMPTY FIELD", "Please enter the employee percentage contribution", "error");
      return false;
    }

    if (createSettings.employer_contribution === "") {
      showAlert("EMPTY FIELD", "Please enter the staff percentage contribution", "error");
      return false;
    }

    await axios
        .post(`${serverLink}staff/hr/pension/settings/add`, createSettings, token)
        .then((result) => {
          if (result.data.message === "success") {
            toast.success("Pension Settings Added Successfully");
            document.getElementById("closeModal").click()
            getRecords();
            setCreateSettings({
              ...createSettings,
              employee_contribution: "",
              employer_contribution: "",
              inserted_by: props.loginData.StaffID,
              inserted_date: "",
              entry_id: "",
            });
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
  };

  useEffect(() => {
     axios
        .get(`${serverLink}staff/hr/pension/settings/list`, token)
        .then((result) => {
          if (result.data.length > 0) {
            let rows = [];
            result.data.map((data, index) => {
              rows.push({
                sn: index + 1,
                employee_contribution: data.EmployeeContribution,
                employer_contribution: data.EmployerContribution,
                inserted_by: data.InsertedBy,
                inserted_date: formatDateAndTime(data.InsertedDate.split('T')[0], 'date'),
                entry_id: data.EntryID,
              });
            });

            setDatatable({
              ...datatable,
              columns: datatable.columns,
              rows: rows,
            });
          }

          setIsLoading(false);
        })
        .catch((err) => {
          console.log("NETWORK ERROR");
        });
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Pension Settings"}
        items={["Human Resources", "Pension", "Pension Settings"]}
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
                  onClick={() =>
                    setCreateSettings({
                      ...createSettings,
                      employee_contribution: "",
                      employer_contribution: "",
                      inserted_by: props.loginData[0].StaffID,
                      inserted_date: "",
                      entry_id: "",
                    })
                  }
                >
                  Add Pension Settings
                </button>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <Table data={datatable} />
          </div>
        </div>
        <Modal title={"Pension Settings Form"}>
          <div className="form-group">
            <label htmlFor="employee_contribution">Employee Contribution (Percentage)</label>
            <input
              type="number"
              step={0.01}
              id={"employee_contribution"}
              onChange={onEdit}
              value={createSettings.employee_contribution}
              max={100}
              className={"form-control"}
              placeholder={"Enter the Employee Contribution (Percentage)"}
            />
          </div>
          <div className="form-group pt-2">
            <label htmlFor="employer_contribution">Employer Contribution (Percentage)</label>
            <input
              type="number"
              step={0.01}
              id={"employer_contribution"}
              onChange={onEdit}
              value={createSettings.employer_contribution}
              max={100}
              className={"form-control"}
              placeholder={"Enter the Employer Contribution (Percentage)"}
            />
          </div>

          <div className="form-group pt-2">
            <button onClick={onSubmit} className="btn btn-primary w-100">
              Save
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

export default connect(mapStateToProps, null)(HRPensionSettings);

