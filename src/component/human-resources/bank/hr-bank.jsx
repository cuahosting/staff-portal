import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function HRBank(props) {
  const token = props.loginData[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const [datatable, setDatatable] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Bank Name",
        field: "name",
      },
      {
        label: "Action",
        field: "action",
      },
    ],
    rows: [],
  });

  const [createBank, setCreateBank] = useState({
    bank_name: "",
    entry_id: "",
  });

  const getBanks = async () => {
    await axios
      .get(`${serverLink}staff/hr/bank/list`, token)
      .then((result) => {
        if (result.data.length > 0) {
          let rows = [];
          result.data.map((bank, index) => {
            rows.push({
              sn: index + 1,
              name: bank.BankName,
              action: (
                <button
                  className="btn btn-sm btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_general"
                  onClick={() =>
                    setCreateBank({
                      bank_name: bank.BankName,
                      entry_id: bank.EntryID,
                    })
                  }
                >
                  <i className="fa fa-pen" />
                </button>
              ),
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
    setCreateBank({
      ...createBank,
      [e.target.id]: e.target.value,
    });
  };

  const onSubmit = async () => {
    if (createBank.bank_name.trim() === "") {
      showAlert("EMPTY FIELD", "Please enter the bank name", "error");
      return false;
    }

    if (createBank.entry_id === "") {
      await axios
        .post(`${serverLink}staff/hr/bank/add`, createBank, token)
        .then((result) => {
          if (result.data.message === "success") {
            toast.success("Bank Added Successfully");
            document.getElementById("closeModal").click()
            getBanks();
            setCreateBank({
              ...createBank,
              bank_name: "",
              entry_id: "",
            });
          } else if (result.data.message === "exist") {
            showAlert("BANK EXIST", "Bank already exist!", "error");
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
      await axios
        .patch(`${serverLink}staff/hr/bank/update`, createBank, token)
        .then((result) => {
          if (result.data.message === "success") {
            toast.success("Bank Updated Successfully");
            document.getElementById("closeModal").click()
            getBanks();
            setCreateBank({
              ...createBank,
              bank_name: "",
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
    }
  };

  useEffect(() => {
     axios
        .get(`${serverLink}staff/hr/bank/list`, token)
        .then((result) => {
          if (result.data.length > 0) {
            let rows = [];
            result.data.map((bank, index) => {
              rows.push({
                sn: index + 1,
                name: bank.BankName,
                action: (
                    <button
                        className="btn btn-sm btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_modal_general"
                        onClick={() =>
                            setCreateBank({
                              bank_name: bank.BankName,
                              entry_id: bank.EntryID,
                            })
                        }
                    >
                      <i className="fa fa-pen" />
                    </button>
                ),
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
        title={"Banks"}
        items={["Human Resources", "Others", "Banks"]}
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
                    setCreateBank({
                      ...createBank,
                      bank_name: "",
                      entry_id: "",
                    })
                  }
                >
                  Add Bank
                </button>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <Table data={datatable} />
          </div>
        </div>
        <Modal title={"Bank Form"}>
          <div className="form-group">
            <label htmlFor="bank_name">Bank Name</label>
            <input
              type="text"
              id={"bank_name"}
              onChange={onEdit}
              value={createBank.bank_name}
              className={"form-control"}
              placeholder={"Enter the Bank Name"}
            />
          </div>

          <div className="form-group pt-2">
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


export default connect(mapStateToProps, null)(HRBank);
