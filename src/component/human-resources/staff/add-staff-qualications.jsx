import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import Select2 from "react-select2-wrapper";
import "react-select2-wrapper/css/select2.css";

function AddStaffQualifications(props) {
  const token = props.loginData[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [addDocument, setAddDocument] = useState(false);
  const [qualifications, setQualifications] = useState([]);
  const addForm = () => {
    setAddDocument(true);
    setAddStaffQualifications({
      StaffID: "",
      QualificationID: "",
      Discipline: "",
      InstitutionName: "",
      Year: "",
    });
  };

  const [addStaffQualifications, setAddStaffQualifications] = useState({
    StaffID: "",
    QualificationID: "",
    Discipline: "",
    InstitutionName: "",
    Year: "",
  });

  useEffect(() => {
    getStaff().then((r) => { });
    getQualification().then((r) => { });
  }, []);

  const deleteItem = async (id, image) => {
    if (id) {
      toast.info(`Deleting... Please wait!`);
      await axios
        .delete(`${serverLink}application/pg/document/delete/${id}/${image}`, token)
        .then((res) => {
          if (res.data.message === "success") {
            // props.update_app_data();
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
            rows.push({ text: row.StaffID + "--" + row.FirstName + " " + row.MiddleName + "" + row.Surname, id: row.StaffID });
          });
        setStaffList(rows);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("NETWORK ERROR");
      });
  };

  const getQualification = async () => {
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
    for (let key in addStaffQualifications) {
      if (
        addStaffQualifications.hasOwnProperty(key) &&
        key !== "InsertBy" &&
        key !== "InsertDate"
      ) {
        if (addStaffQualifications[key] === "") {
          await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
          return false;
        }
      }
    }

    // console.log("Staff Documents", addStaffQualifications);
    // return false;
    toast.info(`Submitting... Please wait!`);
    await axios
      .post(
        `${serverLink}staff/hr/staff-management/staff/qualifications`,
        addStaffQualifications, token
      )
      .then((res) => {
        if (res.data.message === "success") {
          console.log("Response Type", res.data);
          toast.success("Qualification Added Successfully");
          setAddDocument(false);
        } else {
          console.log("error", res);
          toast.error(`Something went wrong. Please try again!`);
        }
      })
      .catch((error) => {
        console.log("NETWORK ERROR", error);
      });
  };

  const onEdit = (e) => {
    const id = e.target.id;
    const value = id === "file" ? e.target.files[0] : e.target.value;

    setAddStaffQualifications({
      ...addStaffQualifications,
      [id]: value,
    });

    getQualification().then((r) => { });
  };

  const handleStaffEdit = (e) => {
    setAddStaffQualifications({
      ...addStaffQualifications,
      [e.target.id]: e.target.value,
    });
  }


  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Add Staff Qualification"}
        items={[
          "Human Resource",
          "Staff Management",
          "Add Staff Qualification",
        ]}
      />
      <div className="row">
        <div className="register">
          {addDocument ? (
            <div style={{ float: "right" }}>
              <button className="btn btn-primary" onClick={onSubmit}>
                Save
              </button>
            </div>
          ) : (
            <div style={{ float: "right" }}>
              <button className="btn btn-primary" onClick={addForm}>
                Add Staff Qualification
              </button>
            </div>
          )}
          <br />
          <br />
          <br />
          <hr />

          {addDocument ? (
            <div className="row">
              <div className="col-lg-4 col-md-4 pt-5">
                <div className="form-group">
                  <label htmlFor="StaffID">StaffID</label>
                  <Select2
                    id="StaffID"
                    value={addStaffQualifications.StaffID}
                    data={staffList}
                    onSelect={handleStaffEdit}
                    options={{
                      placeholder: "Search staff",
                    }}
                  />
                  {/* <select
                    id="StaffID"
                    name="StaffID"
                    value={addStaffQualifications.StaffID}
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
              <div className="col-lg-4 col-md-4 pt-5">
                <div className="form-group">
                  <label htmlFor="QualificationID">Qualification Title</label>
                  <select
                    id="QualificationID"
                    name="QualificationID"
                    value={addStaffQualifications.QualificationID}
                    className="form-control"
                    onChange={onEdit}
                  >
                    <option value="">Select Option</option>
                    {qualifications ? (
                      <>
                        {qualifications.map((item, index) => {
                          return (
                            <option key={index} value={item.EntryID}>
                              {item.QualificationTitle}
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
              <div className="col-lg-4 col-md-4 pt-5">
                <div className="form-group">
                  <label htmlFor="Discipline">Discipline</label>
                  <input
                    type="text"
                    id="Discipline"
                    className="form-control"
                    placeholder="Discipline"
                    value={addStaffQualifications.Discipline}
                    onChange={onEdit}
                  />
                </div>
              </div>
              <div className="col-lg-8 col-md-8 pt-5">
                <div className="form-group">
                  <label htmlFor="InstitutionName">InstitutionName</label>
                  <input
                    type="text"
                    id="InstitutionName"
                    className="form-control"
                    placeholder="InstitutionName"
                    value={addStaffQualifications.InstitutionName}
                    onChange={onEdit}
                  />
                </div>
              </div>
              <div className="col-lg-4 col-md-4 pt-5">
                <div className="form-group">
                  <label htmlFor="InstitutionName">Year</label>
                  <input
                    type="number"
                    id="Year"
                    className="form-control"
                    placeholder="Year"
                    value={addStaffQualifications.Year}
                    onChange={onEdit}
                  />
                </div>
              </div>
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
          {/*                // href={`${serverLink}/application/document/${item.FileName}`}*/}
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

export default connect(mapStateToProps, null)(AddStaffQualifications);

