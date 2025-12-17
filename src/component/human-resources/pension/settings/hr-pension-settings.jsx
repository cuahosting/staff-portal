import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { formatDate, formatDateAndTime } from "../../../../resources/constants";

function HRPensionSettings(props) {

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
    const { success, data } = await api.get("staff/hr/pension/settings/list");
    if (success && data.length > 0) {
      let rows = [];
      data.map((item, index) => {
        rows.push({
          sn: index + 1,
          employee_contribution: item.EmployeeContribution,
          employer_contribution: item.EmployerContribution,
          inserted_by: item.InsertedBy,
          inserted_date: formatDateAndTime(item.InsertedDate.split('T')[0], 'date'),
          entry_id: item.EntryID,
        });
      });
      setDatatable({
        ...datatable,
        columns: datatable.columns,
        rows: rows,
      });
    }
    setIsLoading(false);
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

    const { success, data } = await api.post("staff/hr/pension/settings/add", createSettings);
    if (success) {
      if (data.message === "success") {
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
        showAlert("ERROR", "Something went wrong. Please try again!", "error");
      }
    } else {
      showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
    }
  };

  useEffect(() => {
    getRecords();
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Pension Settings"}
        items={["Human Resources", "Pension", "Pension Settings"]}
        buttons={
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
            <i className="fa fa-plus me-2"></i>
            Add Pension Settings
          </button>
        }
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-5">
            <AGTable data={datatable} />
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

