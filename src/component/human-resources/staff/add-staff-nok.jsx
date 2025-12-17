import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import SearchSelect from "../../common/select/SearchSelect";

// Options for relationship dropdown
const relationshipOptions = [
  { value: 'Wife', label: 'Wife' },
  { value: 'Husband', label: 'Husband' },
  { value: 'Mother', label: 'Mother' },
  { value: 'Sister', label: 'Sister' },
  { value: 'Son', label: 'Son' },
  { value: 'Brother', label: 'Brother' },
  { value: 'Father', label: 'Father' },
  { value: 'Daughter', label: 'Daughter' },
  { value: 'Uncle', label: 'Uncle' },
  { value: 'Aunty', label: 'Aunty' },
  { value: 'N/A', label: 'N/A' },
];

function AddStaffNOK(props) {

  const [isLoading, setIsLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [addNOK, setAddNOK] = useState(false);
  const [data, setData] = useState({
    bank: [],
  });
  // eslint-disable-next-line no-unused-vars
  const [qualifications, setQualifications] = useState([]);
  const addForm = () => {
    setAddNOK(true);
    setAddStaffNOK({
      StaffID: "",
      FirstName: "",
      Surname: "",
      MiddleName: "",
      Relationship: "",
      PhoneNumber: "",
      Address: "",
      EmailAddress: "",
      InsertBy: props.loginData[0].StaffID,
      InsertDate: "",
    });
  };

  const [addStaffNOK, setAddStaffNOK] = useState({
    StaffID: "",
    FirstName: "",
    Surname: "",
    MiddleName: "",
    Relationship: "",
    PhoneNumber: "",
    Address: "",
    EmailAddress: "",
    InsertBy: props.loginData[0].StaffID,
    InsertDate: "",
  });

  const getData = async () => {
    const { success, data } = await api.get("staff/hr/staff-management/staff/data");
    if (success) {
      setData(data);
    }
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
      const { success, data } = await api.delete(`application/pg/document/delete/${id}/${image}`);
      if (success && data.message === "success") {
        toast.success(`Deleted`);
      } else {
        toast.error(`Something went wrong. Please check your connection and try again!`);
      }
    }
  };

  const getStaff = async () => {
    const { success, data } = await api.get("staff/hr/staff-management/staff/list");
    if (success && data.length > 0) {
      let rows = [];
      data.map((row) => {
        rows.push({ value: row.StaffID, label: row.StaffID + " -- " + row.FirstName + " " + row.MiddleName + " " + row.Surname });
      });
      setStaffList(rows);
    }
    setIsLoading(false);
  };

  const getStaffBank = async () => {
    const { success, data } = await api.get("staff/hr/staff-management/qualifications/");
    if (success) {
      setQualifications(data);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    for (let key in addStaffNOK) {
      if (
        addStaffNOK.hasOwnProperty(key) &&
        key !== "InsertBy" &&
        key !== "InsertDate" &&
        key !== "MiddleName"
      ) {
        if (addStaffNOK[key] === "") {
          await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
          return false;
        }
      }
    }

    toast.info(`Submitting... Please wait!`);
    const { success, data } = await api.post("staff/hr/staff-management/attach/staff/nok", addStaffNOK);
    if (success) {
      if (data.message === "exist") {
        toast.error(`NOK Has Already Been Added for the Staff, Kindly View Staff to Modify the Record`);
      } else if (data.message === "success") {
        toast.success("NOK Added Successfully");
        setAddNOK(false);
      } else {
        console.log("error", data);
        toast.error(`Something went wrong. Please try again!`);
      }
    }
  };

  const onEdit = (e) => {
    const id = e.target.id;
    const value = e.target.value;

    setAddStaffNOK({
      ...addStaffNOK,
      [id]: value,
    });

    getStaffBank().then((r) => { });
  };

  const handleStaffEdit = (e) => {
    setAddStaffNOK({
      ...addStaffNOK,
      [e.target.id]: e.target.value,
    });
  }

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Add Staff NOK"}
        items={["Human Resource", "Staff Management", "Add Staff NOK"]}
      />
      <div className="row">
        <div className="register">
          {addNOK ? (
            <div style={{ float: "right" }}>
              <button className="btn btn-primary" onClick={onSubmit}>
                Save
              </button>
            </div>
          ) : (
            <div style={{ float: "right" }}>
              <button className="btn btn-primary" onClick={addForm}>
                Add Staff NOK
              </button>
            </div>
          )}
          <br />
          <br />
          <br />
          <hr />

          {addNOK ? (
            <div className="row">
              <div className="col-lg-6 col-md-6 pt-5">
                <SearchSelect
                  id="StaffID"
                  label="Staff ID"
                  value={staffList.find(s => s.value === addStaffNOK.StaffID) || null}
                  options={staffList}
                  onChange={(selected) => {
                    setAddStaffNOK({
                      ...addStaffNOK,
                      StaffID: selected?.value || '',
                    });
                  }}
                  placeholder="Search staff"
                />
              </div>
              <div className="col-lg-6 pt-5">
                <div className="form-group">
                  <label htmlFor="FirstName">First Name</label>
                  <input
                    type="text"
                    id="FirstName"
                    className="form-control"
                    placeholder="First Name"
                    value={addStaffNOK.FirstName}
                    onChange={onEdit}
                  />
                </div>
              </div>
              <div className="col-lg-4 pt-5">
                <div className="form-group">
                  <label htmlFor="Surname">Surname</label>
                  <input
                    type="text"
                    id="Surname"
                    className="form-control"
                    placeholder="Surname"
                    value={addStaffNOK.Surname}
                    onChange={onEdit}
                  />
                </div>
              </div>
              <div className="col-lg-4 pt-5">
                <div className="form-group">
                  <label htmlFor="MiddleName">Middle Name</label>
                  <input
                    type="text"
                    id="MiddleName"
                    className="form-control"
                    placeholder="Middle Name"
                    value={addStaffNOK.MiddleName}
                    onChange={onEdit}
                  />
                </div>
              </div>
              <div className="col-lg-4 pt-5">
                <SearchSelect
                  id="Relationship"
                  label="Relationship"
                  value={relationshipOptions.find(r => r.value === addStaffNOK.Relationship) || null}
                  options={relationshipOptions}
                  onChange={(selected) => {
                    setAddStaffNOK({
                      ...addStaffNOK,
                      Relationship: selected?.value || '',
                    });
                  }}
                  placeholder="Select Relationship"
                  required
                />
              </div>
              <div className="col-lg-4 pt-5">
                <div className="form-group">
                  <label htmlFor="PhoneNumber">PhoneNumber</label>
                  <input
                    type="number"
                    id="PhoneNumber"
                    className="form-control"
                    placeholder="Phone Number"
                    value={addStaffNOK.PhoneNumber}
                    onChange={onEdit}
                  />
                </div>
              </div>
              <div className="col-lg-4 pt-5">
                <div className="form-group">
                  <label htmlFor="EmailAddress">Email Address</label>
                  <input
                    type="email"
                    id="EmailAddress"
                    className="form-control"
                    placeholder="Email Address"
                    value={addStaffNOK.EmailAddress}
                    onChange={onEdit}
                  />
                </div>
              </div>
              <div className="col-lg-12 col-md-12 pt-5">
                <div className="form-group">
                  <label htmlFor="Address">Contact Address</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    id="Address"
                    placeholder="Contact Address"
                    required
                    value={addStaffNOK.Address}
                    onChange={onEdit}
                  />
                </div>
              </div>

              {/*<div className="col-lg-4 col-md-4 pt-5">*/}
              {/*  <div className="form-group">*/}
              {/*    <label htmlFor="StaffID">StaffID</label>*/}
              {/*    <select*/}
              {/*      id="StaffID"*/}
              {/*      name="StaffID"*/}
              {/*      value={addStaffQualifications.StaffID}*/}
              {/*      className="form-control"*/}
              {/*      onChange={onEdit}*/}
              {/*    >*/}
              {/*      <option value="">Select Option</option>*/}
              {/*      {staffList ? (*/}
              {/*        <>*/}
              {/*          {staffList.map((item, index) => {*/}
              {/*            return (*/}
              {/*              <option key={index} value={item.StaffID}>*/}
              {/*                {item.StaffID}*/}
              {/*              </option>*/}
              {/*            );*/}
              {/*          })}*/}
              {/*        </>*/}
              {/*      ) : (*/}
              {/*        ""*/}
              {/*      )}*/}
              {/*    </select>*/}
              {/*  </div>*/}
              {/*</div>*/}
              {/*<div className="col-lg-4 col-md-4 pt-5">*/}
              {/*  <div className="form-group">*/}
              {/*    <label htmlFor="QualificationID">Qualification Title</label>*/}
              {/*    <select*/}
              {/*      id="QualificationID"*/}
              {/*      name="QualificationID"*/}
              {/*      value={addStaffQualifications.QualificationID}*/}
              {/*      className="form-control"*/}
              {/*      onChange={onEdit}*/}
              {/*    >*/}
              {/*      <option value="">Select Option</option>*/}
              {/*      {qualifications ? (*/}
              {/*        <>*/}
              {/*          {qualifications.map((item, index) => {*/}
              {/*            return (*/}
              {/*              <option key={index} value={item.EntryID}>*/}
              {/*                {item.QualificationTitle}*/}
              {/*              </option>*/}
              {/*            );*/}
              {/*          })}*/}
              {/*        </>*/}
              {/*      ) : (*/}
              {/*        ""*/}
              {/*      )}*/}
              {/*    </select>*/}
              {/*  </div>*/}
              {/*</div>*/}
              {/*<div className="col-lg-4 col-md-4 pt-5">*/}
              {/*  <div className="form-group">*/}
              {/*    <label htmlFor="Discipline">Discipline</label>*/}
              {/*    <input*/}
              {/*      type="text"*/}
              {/*      id="Discipline"*/}
              {/*      className="form-control"*/}
              {/*      placeholder="Discipline"*/}
              {/*      value={addStaffQualifications.Discipline}*/}
              {/*      onChange={onEdit}*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*</div>*/}
              {/*<div className="col-lg-8 col-md-8 pt-5">*/}
              {/*  <div className="form-group">*/}
              {/*    <label htmlFor="InstitutionName">InstitutionName</label>*/}
              {/*    <input*/}
              {/*      type="text"*/}
              {/*      id="InstitutionName"*/}
              {/*      className="form-control"*/}
              {/*      placeholder="InstitutionName"*/}
              {/*      value={addStaffQualifications.InstitutionName}*/}
              {/*      onChange={onEdit}*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*</div>*/}
              {/*<div className="col-lg-4 col-md-4 pt-5">*/}
              {/*  <div className="form-group">*/}
              {/*    <label htmlFor="InstitutionName">Year</label>*/}
              {/*    <input*/}
              {/*      type="number"*/}
              {/*      id="Year"*/}
              {/*      className="form-control"*/}
              {/*      placeholder="Year"*/}
              {/*      value={addStaffQualifications.Year}*/}
              {/*      onChange={onEdit}*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*</div>*/}
            </div>
          ) : null}

          {/*<div className="table-responsive">*/}
          {/*  {!qualifications.length < 1 ? (*/}
          {/*    <table className="table table-hover">*/}
          {/*      <thead>*/}
          {/*        <tr>*/}
          {/*          <th>Document Type</th>*/}
          {/*          <th>File Name</th>*/}
          {/*          <th>Action</th>*/}
          {/*        </tr>*/}
          {/*      </thead>*/}
          {/*      <tbody>*/}
          {/*        {qualifications.map((item, index) => (*/}
          {/*          <tr key={index}>*/}
          {/*            <td>{item.Document}</td>*/}
          {/*            <td>*/}
          {/*              <a*/}
          {/*                target="_blank"*/}
          {/*                // referrerPolicy="no-referrer"*/}
          {/*                // href={`${serverLink}public/uploads/${shortCode}/application/document/${item.FileName}`}*/}
          {/*              >*/}
          {/*                <i className="fa fa-file-pdf-o" />*/}
          {/*              </a>*/}
          {/*            </td>*/}
          {/*            <td>*/}
          {/*              <Button*/}
          {/*                variant="danger"*/}
          {/*                onClick={() =>*/}
          {/*                  deleteItem(item.EntryID, item.FileName)*/}
          {/*                }*/}
          {/*              >*/}
          {/*                <i*/}
          {/*                  className="fa fa-trash-o small"*/}
          {/*                  style={{ fontsize: "30px" }}*/}
          {/*                ></i>*/}
          {/*              </Button>*/}
          {/*            </td>*/}
          {/*          </tr>*/}
          {/*        ))}*/}
          {/*      </tbody>*/}
          {/*    </table>*/}
          {/*  ) : (*/}
          {/*    <div className="alert alert-info">*/}
          {/*      There is no record. Click on Add Document*/}
          {/*    </div>*/}
          {/*  )}*/}
          {/*</div>*/}
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

export default connect(mapStateToProps, null)(AddStaffNOK);
