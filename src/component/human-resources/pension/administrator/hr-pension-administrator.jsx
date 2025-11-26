import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import Table from "../../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function HRPensionAdministrator(props) {
  const token = props.loginData[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const [datatable, setDatatable] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Administrator Name",
        field: "name",
      },
      {
        label: "Phone Number",
        field: "phone",
      },
      {
        label: "Email Address",
        field: "email",
      },
      {
        label: "Action",
        field: "action",
      },
    ],
    rows: [],
  });

  const [createItem, setCreateItem] = useState({
    admin_name: "",
    contact_no: "",
    contact_email: "",
    entry_id: "",
  });

  const getRecord = async () => {
    await axios
      .get(`${serverLink}staff/hr/pension/administrator/list`, token)
      .then((result) => {
        if (result.data.length > 0) {
          let rows = [];
          result.data.map((item, index) => {
            rows.push({
              sn: index + 1,
              name: item.AdminName,
              phone: item.ContactNo,
              email: item.ContactEmail,
              action: (
                <button
                  className="btn btn-sm btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_general"
                  onClick={() =>
                    setCreateItem({
                      admin_name: item.AdminName,
                      contact_no: item.ContactNo,
                      contact_email: item.ContactEmail,
                      entry_id: item.EntryID,
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
    setCreateItem({
      ...createItem,
      [e.target.id]: e.target.value,
    });
  };

  const onSubmit = async () => {
    if (createItem.admin_name.trim() === "") {
      showAlert("EMPTY FIELD", "Please enter the administrator name", "error");
      return false;
    }
    if (createItem.contact_no === "") {
      showAlert("EMPTY FIELD", "Please enter the administrator phone number", "error");
      return false;
    }
    if (createItem.contact_email.trim() === "") {
      showAlert("EMPTY FIELD", "Please enter the administrator email address", "error");
      return false;
    }

    if (createItem.entry_id === "") {
      await axios
        .post(`${serverLink}staff/hr/pension/administrator/add`, createItem, token)
        .then((result) => {
          if (result.data.message === "success") {
            toast.success("Administrator Added Successfully");
            document.getElementById("closeModal").click()
            getRecord();
            setCreateItem({
              ...createItem,
              admin_name: "",
              contact_no: "",
              contact_email: "",
              entry_id: "",
            });
          } else if (result.data.message === "exist") {
            showAlert("ADMINISTRATOR EXIST", "Administrator already exist!", "error");
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
        .patch(`${serverLink}staff/hr/pension/administrator/update`, createItem, token)
        .then((result) => {
          if (result.data.message === "success") {
            toast.success("Administrator Updated Successfully");
            document.getElementById("closeModal").click()
            getRecord();
            setCreateItem({
              ...createItem,
              admin_name: "",
              contact_email: "",
              contact_no: "",
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
        .get(`${serverLink}staff/hr/pension/administrator/list`, token)
        .then((result) => {
          if (result.data.length > 0) {
            let rows = [];
            result.data.map((item, index) => {
              rows.push({
                sn: index + 1,
                name: item.AdminName,
                phone: item.ContactNo,
                email: item.ContactEmail,
                action: (
                    <button
                        className="btn btn-sm btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_modal_general"
                        onClick={() =>
                            setCreateItem({
                              admin_name: item.AdminName,
                              contact_no: item.ContactNo,
                              contact_email: item.ContactEmail,
                              entry_id: item.EntryID,
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
        title={"Pension Administrators"}
        items={["Human Resources", "Pension", "Pension Administrators"]}
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
                    setCreateItem({
                      ...createItem,
                      admin_name: "",
                      contact_no: "",
                      contact_email: "",
                      entry_id: "",
                    })
                  }
                >
                  Add Administrator
                </button>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <Table data={datatable} />
          </div>
        </div>
        <Modal title={"Pension Administrator Form"}>
          <div className="form-group">
            <label htmlFor="admin_name">Administrator Name</label>
            <input
              type="text"
              id={"admin_name"}
              onChange={onEdit}
              value={createItem.admin_name}
              className={"form-control"}
              placeholder={"Enter the Administrator Name"}
            />
          </div>
          <div className="form-group pt-2">
            <label htmlFor="contact_no">Phone Number</label>
            <input
              type="number"
              id={"contact_no"}
              onChange={onEdit}
              value={createItem.contact_no}
              className={"form-control"}
              placeholder={"Enter the Administrator Phone Number"}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact_email">Email Address</label>
            <input
              type="email"
              id={"contact_email"}
              onChange={onEdit}
              value={createItem.contact_email}
              className={"form-control"}
              placeholder={"Enter the Administrator Email Address"}
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

export default connect(mapStateToProps, null)(HRPensionAdministrator);

