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
import Select from 'react-select';



function AddEditStaffPensionRecord(props)
{
  const token = props.loginData[0]?.token;

  const [isLoading, setIsLoading] = useState(true);
  const [staffPensionRecordDatatable, setStaffPensionRecordDatatable] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Staff ID",
        field: "StaffID",
      },
      {
        label: "Staff Name",
        field: "StaffName",
      },
      {
        label: "PensionAdmin",
        field: "PensionAdmin",
      },
      {
        label: "RSA Pin",
        field: "RSAPin",
      },
      {
        label: "Action",
        field: "action",
      },
    ],
    rows: [],
  });
  const [createStaffPensionRecord, setCreateStaffPensionRecord] = useState({
    EntryID: "",
    StaffID: "",
    RSAPin: "",
    PensionAdminID: "",
    Staff: ""
  });
  const [staffList, setStaffList] = useState([]);
  const [pensionAdministratorsList, setPensionAdministratorsList] = useState([]);
  const [stList, setStList] = useState([])


  const getStaffPensionRecords = async () =>
  {
    const stlist = []
    getStaff().then(async (r) =>
    {
      await axios
        .get(`${serverLink}staff/hr/staff-management/staff/pension/records`, token)
        .then((result) =>
        {
          if (result.data.length > 0)
          {
            let rows = [];
            result.data.map((pension, index) =>
            {
              rows.push({
                sn: index + 1,
                EntryID: pension.EntryID,
                StaffID: pension.StaffID,
                StaffName: pension.StaffName,
                PensionAdmin: pension.PensionAdmin,
                RSAPin: pension.RSAPin,
                PensionAdminID: pension.PensionAdminID,
                action: (
                  <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#kt_modal_general"
                    onClick={() =>
                    {

                      // setCreateStaffPensionRecord({
                      //   ...createStaffPensionRecord,
                      //   Staff: "",
                      //   EntryID: "",
                      //   StaffID: "",
                      //   RSAPin: "",
                      //   PensionAdminID: "",
                      // })

                      if (r.length > 0)
                      {
                        const staff_list = r.filter(x => x.StaffID === pension.StaffID)[0];
                        setCreateStaffPensionRecord({
                          StaffID: pension.StaffID,
                          Staff: { value: staff_list.StaffID, label: staff_list.StaffID + "--" + staff_list.FirstName + " " + staff_list.MiddleName + " " + staff_list.Surname },
                          RSAPin: pension.RSAPin,
                          PensionAdminID: pension.PensionAdminID,
                          EntryID: pension.EntryID,
                        })
                      }
                    }
                    }
                  >
                    <i className="fa fa-pen" />
                  </button>
                ),
              });
            });

            setStaffPensionRecordDatatable({
              ...staffPensionRecordDatatable,
              columns: staffPensionRecordDatatable.columns,
              rows: rows,
            });
          }

          setIsLoading(false);
        })
        .catch((err) =>
        {
          console.log("NETWORK ERROR");
        });
    });


  };

  const getStaff = async () =>
  {
    return await axios
      .get(`${serverLink}staff/hr/staff-management/staff/list`, token)
      .then((response) =>
      {
        setStList(response.data)
        let rows = [];
        response.data.length > 0 &&
          response.data.map((row) =>
          {
            rows.push({ value: row.StaffID, label: row.StaffID + "--" + row.FirstName + " " + row.MiddleName + " " + row.Surname })
          });
        setStaffList(rows);
        setIsLoading(false);
        return response.data
      })
      .catch((err) =>
      {
        console.log("NETWORK ERROR");
      });
  };

  const getPensionAdministrators = async () =>
  {
    await axios
      .get(`${serverLink}staff/hr/staff-management/pension/administrators/list`, token)
      .then((response) =>
      {
        setPensionAdministratorsList(response.data);
        setIsLoading(false);
      })
      .catch((err) =>
      {
        console.log("NETWORK ERROR");
      });
  };

  const onEdit = (e) =>
  {
    setCreateStaffPensionRecord({
      ...createStaffPensionRecord,
      [e.target.id]: e.target.value,
    });
  };


  const handleStaffEdit = (e) =>
  {
    setCreateStaffPensionRecord({
      ...createStaffPensionRecord,
      StaffID: e.value,
      Staff: e
    })
  }

  const onSubmit = async () =>
  {
    if (createStaffPensionRecord.RSAPin === "")
    {
      showAlert("EMPTY FIELD", "Please enter RSAPin", "error").then((r) => { });
      return false;
    }

    if (createStaffPensionRecord.EntryID === "")
    {
      toast.info("Submitting. Please wait...");
      await axios
        .post(
          `${serverLink}staff/hr/staff-management/add/staff/pension/record`,
          createStaffPensionRecord, token
        )
        .then((result) =>
        {
          if (result.data.message === "success")
          {
            toast.success("Pension record added successfully");
            document.getElementById("pension-close").click()
            getStaffPensionRecords();
            setCreateStaffPensionRecord({
              ...createStaffPensionRecord,
              EntryID: "",
              StaffID: "",
              RSAPin: "",
              PensionAdminID: "",
            });
          } else if (result.data.message === "exist")
          {
            showAlert(
              "PENSION EXIST",
              "Staff pension record already exist!",
              "error"
            );
          } else
          {
            showAlert(
              "ERROR",
              "Something went wrong. Please try again!",
              "error"
            );
          }
        })
        .catch((error) =>
        {
          showAlert(
            "NETWORK ERROR",
            "Please check your connection and try again!",
            "error"
          );
        });
    } else
    {
      toast.info("Updating. Please wait...");
      await axios
        .patch(
          `${serverLink}staff/hr/staff-management/update/staff/pension/record`,
          createStaffPensionRecord, token
        )
        .then((result) =>
        {
          if (result.data.message === "success")
          {
            toast.success("Pension record updated successfully");
            document.getElementById("pension-close").click()
            getStaffPensionRecords();
            setCreateStaffPensionRecord({
              ...createStaffPensionRecord,
              EntryID: "",
              StaffID: "",
              RSAPin: "",
              PensionAdminID: "",
            });
          } else
          {
            showAlert(
              "ERROR",
              "Something went wrong. Please try again!",
              "error"
            );
          }
        })
        .catch((error) =>
        {
          showAlert(
            "NETWORK ERROR",
            "Please check your connection and try again!",
            "error"
          );
        });
    }
  };

  useEffect(() =>
  {
    getStaffPensionRecords().then((r) => { });

    getPensionAdministrators().then((r) => { });
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Add Staff Pension Record"}
        items={[
          "Human Resource",
          "Staff Management",
          "Add Staff Pension Record",
        ]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-header border-0 pt-6">
            <div className="card-title" />
            <div className="card-toolbar">
              <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                <button
                  type="button"
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_general"
                  onClick={() =>
                    setCreateStaffPensionRecord({
                      ...createStaffPensionRecord,
                      Staff: "",
                      EntryID: "",
                      StaffID: "",
                      RSAPin: "",
                      PensionAdminID: "",
                    })
                  }
                >
                  Add Pension Record
                </button>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <Table data={staffPensionRecordDatatable} />
          </div>
        </div>
        <Modal title={"Staff Pension Record Form"} close="pension-close">
          <div className="col-lg-12 col-md-12">
            <div className="form-group">
              <label htmlFor="StaffID">StaffID</label>
              <Select
                isDisabled={createStaffPensionRecord.Staff !== "" ? true : false}
                name="StaffID"
                value={createStaffPensionRecord.Staff}
                onChange={handleStaffEdit}
                options={staffList}
                placeholder="select staff"
              />

              {/* <select
                id="StaffID"
                name="StaffID"
                value={createStaffPensionRecord.StaffID}
                className="form-control"
                onChange={onEdit}
              >
                <option value="">Select Option</option>
                {staffList ? (
                  <>
                    {staffList.map((item, index) => {
                      return (
                        <option key={index} value={item.StaffID}>
                          {item.StaffID}
                        </option>
                      );
                    })}
                  </>
                ) : (
                  ""
                )}
              </select> */}
            </div>
          </div>
          <div className="col-lg-12 col-md-12 pt-5">
            <div className="form-group">
              <label htmlFor="PensionAdminID">Pension Administrator</label>
              <select
                id="PensionAdminID"
                name="PensionAdminID"
                value={createStaffPensionRecord.PensionAdminID}
                className="form-control"
                onChange={onEdit}
              >
                <option value="">Select Option</option>
                {pensionAdministratorsList ? (
                  <>
                    {pensionAdministratorsList.map((item, index) =>
                    {
                      return (
                        <option key={index} value={item.EntryID}>
                          {item.AdminName}
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
              <label htmlFor="RSAPin">RSA Pin</label>
              <input
                type="text"
                id="RSAPin"
                className="form-control"
                placeholder="RSAPin"
                value={createStaffPensionRecord.RSAPin}
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

const mapStateToProps = (state) =>
{
  return {
    loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(AddEditStaffPensionRecord);
