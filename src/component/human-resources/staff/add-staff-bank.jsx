import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import SearchSelect from "../../common/select/SearchSelect";

// Options for static dropdowns
const accountTypeOptions = [
  { value: 'Savings', label: 'Savings' },
  { value: 'Current', label: 'Current' },
  { value: 'Domiciliary', label: 'Domiciliary' },
  { value: 'N/A', label: 'N/A' },
];

function AddStaffBank(props) {
  const token = props.loginData[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const [addBank, setAddBank] = useState(false);
  const [data, setData] = useState({
    bank: [],
  });
  // eslint-disable-next-line no-unused-vars
  const [qualifications, setQualifications] = useState([]);
  const addForm = () => {
    setAddBank(true);
    setAddStaffBank({
      StaffID: "",
      StaffID2: null,
      AccountNumber: "",
      AccountType: "",
      AccountType2: null,
      BankID: "",
      BankID2: null,
      BVN: "",
      InsertedBy: props.loginData[0].StaffID,
      InsertedDate: "",
    });
  };

  const [addStaffBank, setAddStaffBank] = useState({
    StaffID: "",
    StaffID2: null,
    AccountNumber: "",
    AccountType: "",
    AccountType2: null,
    BankID: "",
    BankID2: null,
    BVN: "",
    InsertedBy: "",
    InsertedDate: "",
  });

  const getData = async () => {
    await axios
      .get(`${serverLink}staff/hr/staff-management/staff/data`, token)
      .then((response) => {
        setData(response.data);
        // Build bank options
        if (response.data.bank && response.data.bank.length > 0) {
          const banks = response.data.bank.map(item => ({
            value: item.EntryID,
            label: item.BankName
          }));
          setBankOptions(banks);
        }
      })
      .catch((error) => {
        console.log("NETWORK ERROR", error);
      });
  };

  useEffect(() => {
    getStaff().then((r) => { });
    getData().then((r) => { });
    getStaffBank().then((r) => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteItem = async (id, image) => {
    if (id) {
      toast.info(`Deleting... Please wait!`);
      await axios
        .delete(`${serverLink}application/pg/document/delete/${id}/${image}`, token)
        .then((res) => {
          if (res.data.message === "success") {
            toast.success(`Deleted`);
          } else {
            toast.error(
              `Something went wrong. Please check your connection and try again!`
            );
          }
        })
        .catch((error) => {
          console.log("NETWORK ERROR", error);
        });
    }
  };

  const getStaff = async () => {
    await axios
      .get(`${serverLink}staff/hr/staff-management/staff/list`, token)
      .then((response) => {
        let rows = [];
        response.data.length > 0 &&
          response.data.map((row) => {
            rows.push({
              value: row.StaffID,
              label: row.StaffID + " -- " + row.FirstName + " " + row.MiddleName + " " + row.Surname
            });
          });
        setStaffList(rows);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("NETWORK ERROR");
      });
  };

  const getStaffBank = async () => {
    await axios
      .get(`${serverLink}staff/hr/staff-management/qualifications/`, token)
      .then((response) => {
        setQualifications(response.data);
      })
      .catch((err) => {
        console.log("NETWORK ERROR");
      });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    for (let key in addStaffBank) {
      if (
        addStaffBank.hasOwnProperty(key) &&
        key !== "InsertedBy" &&
        key !== "InsertedDate" &&
        key !== "StaffID2" &&
        key !== "AccountType2" &&
        key !== "BankID2"
      ) {
        if (addStaffBank[key] === "") {
          await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
          return false;
        }
      }
    }

    toast.info(`Submitting... Please wait!`);
    await axios
      .post(
        `${serverLink}staff/hr/staff-management/attach/staff/bank`,
        addStaffBank, token
      )
      .then((res) => {
        if (res.data.message === "exist") {
          toast.error(
            `Bank Details Has Already Been Added for the Staff, Kindly View Staff to Modify the Record`
          );
        } else if (res.data.message === "success") {
          toast.success("Bank Added Successfully");
          setAddBank(false);
        } else {
          toast.error(`Something went wrong. Please try again!`);
        }
      })
      .catch((error) => {
        console.log("NETWORK ERROR", error);
      });
  };

  const onEdit = (e) => {
    const id = e.target.id;
    const value = e.target.value;

    setAddStaffBank({
      ...addStaffBank,
      [id]: value,
    });

    getStaffBank().then((r) => { });
  };

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Add Staff Bank"}
        items={["Human Resource", "Staff Management", "Add Staff Bank"]}
      />
      <div className="row">
        <div className="register">
          {addBank ? (
            <div style={{ float: "right" }}>
              <button className="btn btn-primary" onClick={onSubmit}>
                Save
              </button>
            </div>
          ) : (
            <div style={{ float: "right" }}>
              <button className="btn btn-primary" onClick={addForm}>
                Add Staff Bank
              </button>
            </div>
          )}
          <br />
          <br />
          <br />
          <hr />

          {addBank ? (
            <div className="row">
              <div className="col-lg-6 col-md-6 pt-5">
                <SearchSelect
                  id="StaffID"
                  label="Staff ID"
                  value={addStaffBank.StaffID2}
                  options={staffList}
                  onChange={(selected) => {
                    setAddStaffBank({
                      ...addStaffBank,
                      StaffID: selected?.value || '',
                      StaffID2: selected,
                    });
                  }}
                  placeholder="Search staff"
                />
              </div>
              <div className="col-lg-6 col-md-6 pt-5">
                <SearchSelect
                  id="BankID"
                  label="Bank Name"
                  value={addStaffBank.BankID2}
                  options={bankOptions}
                  onChange={(selected) => {
                    setAddStaffBank({
                      ...addStaffBank,
                      BankID: selected?.value || '',
                      BankID2: selected,
                    });
                  }}
                  placeholder="Select Bank"
                  required
                />
              </div>
              <div className="col-lg-6 col-md-6 pt-5">
                <div className="form-group">
                  <label htmlFor="AccountNumber">Account Number</label>
                  <input
                    type="number"
                    id="AccountNumber"
                    className="form-control"
                    placeholder="Account Number"
                    value={addStaffBank.AccountNumber}
                    onChange={onEdit}
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-6 pt-5">
                <SearchSelect
                  id="AccountType"
                  label="Account Type"
                  value={addStaffBank.AccountType2}
                  options={accountTypeOptions}
                  onChange={(selected) => {
                    setAddStaffBank({
                      ...addStaffBank,
                      AccountType: selected?.value || '',
                      AccountType2: selected,
                    });
                  }}
                  placeholder="Select Account Type"
                  required
                />
              </div>
              <div className="col-lg-6 col-md-6 pt-5">
                <div className="form-group">
                  <label htmlFor="BVN">BVN</label>
                  <input
                    type="tel"
                    id="BVN"
                    className="form-control"
                    placeholder="BVN"
                    required
                    value={addStaffBank.BVN}
                    onChange={onEdit}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(AddStaffBank);
