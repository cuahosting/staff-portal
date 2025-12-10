import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import {connect} from "react-redux";
import {formatDate, formatDateAndTime} from "../../../../resources/constants";
import {ProgressBar} from "react-bootstrap";

function HrSalarySettings(props) {
  const token = props.loginData[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const [datatable, setDatatable] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Basic (%)",
        field: "basic",
      },
      {
        label: "Housing (%)",
        field: "housing",
      },
      {
        label: "Transport (%)",
        field: "transport",
      },
      {
        label: "Fringe (%)",
        field: "fringe",
      },
      {
        label: "Medical (%)",
        field: "medical",
      },
      {
        label: "Wardrobe (%)",
        field: "wardrobe",
      },
      // {
      //   label: "Payee (%)",
      //   field: "payee",
      // },
      {
        label: "Inserted By",
        field: "inserted_by",
      },
      {
        label: "Inserted Date",
        field: "inserted_date",
      },
      {
        label: "Actions",
        field: "actions",
      },
    ],
    rows: [],
  });

  const [createSettings, setCreateSettings] = useState({
    basic: 0,
    housing: 0,
    transport: 0,
    fringe: 0,
    medical: 0,
    wardrobe: 0,
    payee: 0,
    inserted_by: props.loginData[0].StaffID,
    inserted_date: "",
    entry_id: "",
  });
  const [total, setTotal] = useState(0);

  const handleDelete = async (entryId) => {
    showAlert(
      'DELETE CONFIRMATION',
      'Are you sure you want to delete this salary setting? This action cannot be undone.',
      'warning',
      true,
      true
    ).then(async (result) => {
      if (result) {
        await axios
          .post(`${serverLink}staff/hr/payroll/salary/settings/delete`, { entry_id: entryId }, token)
          .then((response) => {
            if (response.data.message === "success") {
              toast.success("Salary Setting Deleted Successfully");
              getRecords();
            } else {
              showAlert("ERROR", "Failed to delete salary setting. Please try again!", "error");
            }
          })
          .catch((error) => {
            showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
          });
      }else{
        console.log(result)
      }
    });
  };

  const getRecords = async () => {
    await axios
      .get(`${serverLink}staff/hr/payroll/salary/settings/list`, token)
      .then((result) => {
        if (result.data.length > 0) {
          let rows = [];
          result.data.map((data, index) => {
            rows.push({
              sn: index + 1,
              basic: data.Basic,
              housing: data.Housing,
              transport: data.Transport,
              fringe: data.Fringe,
              medical: data.Medical,
              wardrobe: data.Wardrobe,
              payee: data.Payee,
              inserted_by: data.InsertedBy,
              inserted_date: formatDateAndTime(data.InsertedDate.split('T')[0], 'date'),
              entry_id: data.EntryID,
              actions: (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(data.EntryID)}
                >
                  <i className="fa fa-trash"></i> Delete
                </button>
              ),
            });
          });

          setDatatable({
            ...datatable,
            columns: datatable.columns,
            rows: rows,
          });
        } else {
          setDatatable({
            ...datatable,
            columns: datatable.columns,
            rows: [],
          });
        }

        setIsLoading(false);
      })
      .catch((err) => {
        console.log("NETWORK ERROR");
      });
  };

  const onEdit = (e) => {
    const updateData = {
      ...createSettings,
      [e.target.id]: parseFloat(e.target.value)
    }
    setCreateSettings(updateData);

    setTotal(parseFloat(updateData.basic)+parseFloat(updateData.housing)+parseFloat(updateData.transport)+parseFloat(updateData.medical)+parseFloat(updateData.wardrobe)+parseFloat(updateData.fringe))
  };

  const onSubmit = async () => {
    if (createSettings.basic === "") {
      showAlert("EMPTY FIELD", "Please enter the basic percentage", "error");
      return false;
    }

    if (createSettings.housing === "") {
      showAlert("EMPTY FIELD", "Please enter the housing percentage", "error");
      return false;
    }

    if (createSettings.transport === "") {
      showAlert("EMPTY FIELD", "Please enter the transport percentage", "error");
      return false;
    }

    if (createSettings.fringe === "") {
      showAlert("EMPTY FIELD", "Please enter the fringe percentage", "error");
      return false;
    }

    if (createSettings.medical === "") {
      showAlert("EMPTY FIELD", "Please enter the medical percentage", "error");
      return false;
    }

    if (createSettings.wardrobe === "") {
      showAlert("EMPTY FIELD", "Please enter the wardrobe percentage", "error");
      return false;
    }

    if (createSettings.basic+createSettings.housing+createSettings.transport+createSettings.fringe+createSettings.medical+createSettings.wardrobe !== 100) {
      showAlert("SECTION 1 ERROR", "The section 1 entries isn't equal to 100%", "error");
      return false;
    }

    if (createSettings.payee === "") {
      showAlert("EMPTY FIELD", "Please enter the payee percentage", "error");
      return false;
    }

    await axios
        .post(`${serverLink}staff/hr/payroll/salary/settings/add`, createSettings, token)
        .then((result) => {
          if (result.data.message === "success") {
            toast.success("Salary Settings Added Successfully");
            document.getElementById("closeModal").click()
            getRecords();
            setCreateSettings({
              ...createSettings,
              basic: 0,
              housing: 0,
              transport: 0,
              fringe: 0,
              medical: 0,
              wardrobe: 0,
              payee: 0,
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
        .get(`${serverLink}staff/hr/payroll/salary/settings/list`, token)
        .then((result) => {
          if (result.data.length > 0) {
            let rows = [];
            result.data.map((data, index) => {
              rows.push({
                sn: index + 1,
                basic: data.Basic,
                housing: data.Housing,
                transport: data.Transport,
                fringe: data.Fringe,
                medical: data.Medical,
                wardrobe: data.Wardrobe,
                payee: data.Payee,
                inserted_by: data.InsertedBy,
                inserted_date: formatDateAndTime(data.InsertedDate.split('T')[0], 'date'),
                entry_id: data.EntryID,
                actions: (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(data.EntryID)}
                  >
                    <i className="fa fa-trash"></i> Delete
                  </button>
                ),
              });
            });

            setDatatable({
              ...datatable,
              columns: datatable.columns,
              rows: rows,
            });
          } else {
            setDatatable({
              ...datatable,
              columns: datatable.columns,
              rows: [],
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
      <PageHeader title={"Payroll Salary Settings"} items={["Human Resources", "Payroll", "Salary Settings"]}/>
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-header border-0 pt-6">
            <div className="card-title">
              {datatable.rows.length > 0 && (
                <div className="alert alert-info d-flex align-items-center mb-0">
                  <i className="fa fa-info-circle me-2"></i>
                  <span>Salary settings already configured. Delete the existing setting to add a new one.</span>
                </div>
              )}
            </div>
            <div className="card-toolbar">
              <div
                className="d-flex justify-content-end"
                data-kt-customer-table-toolbar="base"
              >
                {datatable.rows.length === 0 && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#kt_modal_general"
                    onClick={() =>
                      setCreateSettings({
                        ...createSettings,
                        basic: 0,
                        housing: 0,
                        transport: 0,
                        fringe: 0,
                        medical: 0,
                        wardrobe: 0,
                        payee: 0,
                        inserted_by: props.loginData[0].StaffID,
                        inserted_date: "",
                        entry_id: "",
                      })
                    }
                  >
                    Add Salary Settings
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <AGTable data={datatable} />
          </div>
        </div>
        <Modal title={"Salary Settings Form"} large={true}>
          <h5>Section 1: Salary Settings</h5>
          <p className="badge badge-info w-100">The sum of all entries from this section must be 100</p>
          <ProgressBar className="pt-2" now={total} label={`${total}%`} variant="success" striped />
          <div className="row pt-5">
            <div className="form-group col-md-6">
              <label htmlFor="basic">Basic (Percentage)</label>
              <input
                  type="number"
                  step={0.01}
                  id={"basic"}
                  onChange={onEdit}
                  value={createSettings.basic}
                  max={100}
                  className={"form-control"}
                  placeholder={"Enter the Basic (Percentage)"}
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="housing">Housing (Percentage)</label>
              <input
                  type="number"
                  step={0.01}
                  id={"housing"}
                  onChange={onEdit}
                  value={createSettings.housing}
                  max={100}
                  className={"form-control"}
                  placeholder={"Enter the Housing (Percentage)"}
              />
            </div>
          </div>

          <div className="row">
            <div className="form-group col-md-6 pt-5">
              <label htmlFor="transport">Transport (Percentage)</label>
              <input
                  type="number"
                  step={0.01}
                  id={"transport"}
                  onChange={onEdit}
                  value={createSettings.transport}
                  max={100}
                  className={"form-control"}
                  placeholder={"Enter the Transport (Percentage)"}
              />
            </div>
            <div className="form-group col-md-6 pt-5">
              <label htmlFor="fringe">Fringe (Percentage)</label>
              <input
                  type="number"
                  step={0.01}
                  id={"fringe"}
                  onChange={onEdit}
                  value={createSettings.fringe}
                  max={100}
                  className={"form-control"}
                  placeholder={"Enter the Fringe (Percentage)"}
              />
            </div>
          </div>


          <div className="row">
            <div className="form-group col-md-6 pt-5">
              <label htmlFor="medical">Medical (Percentage)</label>
              <input
                  type="number"
                  step={0.01}
                  id={"medical"}
                  onChange={onEdit}
                  value={createSettings.medical}
                  max={100}
                  className={"form-control"}
                  placeholder={"Enter the Medical (Percentage)"}
              />
            </div>
            <div className="form-group col-md-6 pt-5">
              <label htmlFor="wardrobe">Wardrobe (Percentage)</label>
              <input
                  type="number"
                  step={0.01}
                  id={"wardrobe"}
                  onChange={onEdit}
                  value={createSettings.wardrobe}
                  max={100}
                  className={"form-control"}
                  placeholder={"Enter the Wardrobe (Percentage)"}
              />
            </div>
          </div>
          {/* <hr/>
          <h5>Section 2: Payee Settings</h5>
          <div className="form-group pb-5">
            <label htmlFor="payee">Payee (Percentage)</label>
            <input
              type="number"
              step={0.01}
              id={"payee"}
              onChange={onEdit}
              value={createSettings.payee}
              max={100}
              className={"form-control"}
              placeholder={"Enter the Payee (Percentage)"}
            />
          </div> */}

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

export default connect(mapStateToProps, null)(HrSalarySettings);

