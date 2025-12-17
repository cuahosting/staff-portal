import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import { projectName, serverLink, simpleFileUploadAPIKey } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import SimpleFileUpload from "react-simple-file-upload";
import { connect } from "react-redux";
import SearchSelect from "../../common/select/SearchSelect";

function UploadStaffDocument(props) {

  const [isLoading, setIsLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [addDocument, setAddDocument] = useState(false);
  const [staffDocuments, setStaffDocuments] = useState([]);
  const addForm = () => {
    setAddDocument(true);
    setAddStaffDocument({
      StaffID: "",
      DocumentType: "",
      file: "",
      InsertedBy: "",
      InsertedDate: "",
    });
  };
  const [addStaffDocument, setAddStaffDocument] = useState({
    StaffID: "",
    DocumentType: "",
    file: "",
    InsertedBy: "",
    InsertedDate: "",
  });

  useEffect(() => {
    getStaff().then((r) => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteItem = async (id, image) => {
    if (id) {
      toast.info(`Deleting... Please wait!`);
      const { success, data } = await api.delete(`application/pg/document/delete/${id}/${image}`);
      if (success) {
        if (data.message === "success") {
          toast.success(`Deleted`);
        } else {
          toast.error(`Something went wrong. Please check your connection and try again!`);
        }
      } else {
        console.log("NETWORK ERROR");
      }
    }
  };

  const getStaff = async () => {
    const { success, data } = await api.get("staff/hr/staff-management/staff/list");
    if (success && data) {
      let rows = [];
      data.length > 0 &&
        data.map((row) => {
          rows.push({ value: row.StaffID, label: row.StaffID + " -- " + row.FirstName + " " + row.MiddleName + " " + row.Surname });
        });
      setStaffList(rows);
    }
    setIsLoading(false);
  };

  const getStaffDocument = async (staffId) => {
    const { success, data } = await api.get(`staff/hr/staff-management/staff/document/`, { staffId });
    if (success && data) {
      setStaffDocuments(data);
    }
  };


  const handlePassportUpload = async (url) => {
    if (url !== '' && addStaffDocument.DocumentType !== '' && addStaffDocument.DocumentType.length > 0
      && addStaffDocument.InsertedDate !== '' && addStaffDocument.InsertedDate.length > 0
      && addStaffDocument.InsertedBy !== '' && addStaffDocument.InsertedBy.length > 0) {
      await showAlert("EMPTY FIELD", `All fields are required`, "error");
      return false;
    }




    const sendData = {
      StaffID: addStaffDocument.StaffID,
      DocumentType: addStaffDocument.DocumentType,
      Document: url,
      InsertedBy: props.loginData[0].StaffID,
      InsertedDate: addStaffDocument.InsertedDate,
    };

    console.log(sendData)

    const { success, data } = await api.post("staff/hr/staff-management/upload/staff/document", sendData);
    if (success) {
      if (data.message === "success") {
        toast.success(`Document Uploaded`);
        setAddDocument(false);
      } else {
        toast.error(`Something went wrong submitting your document!`);
      }
    } else {
      console.log("Error uploading document");
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    for (let key in addStaffDocument) {
      if (
        addStaffDocument.hasOwnProperty(key) &&
        key !== "InsertedBy" &&
        key !== "InsertedDate"
      ) {
        if (addStaffDocument[key] === "") {
          await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
          return false;
        }
      }
    }

    if (addStaffDocument.file.size / 1024 > 2048) {
      toast.error(`File Size Can't be more than 2MB`);
      return false;
    }

    toast.info(`Submitting... Please wait!`);

    let formData = new FormData();
    formData.append("file", addStaffDocument.file);

    const { success, data } = await api.post("staff/hr/staff-management/uploadDocument", formData, { headers: { "Content-Type": "multipart/form-data" } });
    if (success && data.type === "success") {
      const sendData = {
        StaffID: addStaffDocument.StaffID,
        DocumentType: addStaffDocument.DocumentType,
        Document: data.file.filename,
        InsertedBy: addStaffDocument.InsertedBy,
        InsertedDate: addStaffDocument.InsertedDate,
      };
      const postRes = await api.post("staff/hr/staff-management/upload/staff/document", sendData);
      if (postRes.success && postRes.data.message === "success") {
        toast.success(`Document Uploaded`);
        setAddDocument(false);
      } else {
        toast.error(`Something went wrong submitting your document!`);
      }
    } else {
      toast.error(`Something went wrong uploading your document. Please try again!`);
    }
  };

  const onEdit = (e) => {
    const id = e.target.id;
    const value = id === "file" ? e.target.files[0] : e.target.value;

    setAddStaffDocument({
      ...addStaffDocument,
      [id]: value,
    });

    getStaffDocument().then((r) => { });
  };

  const handleStaffEdit = (e) => {
    setAddStaffDocument({
      ...addStaffDocument,
      [e.target.id]: e.target.value,
    });
  }


  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Upload Staff Document"}
        items={["Human Resource", "Staff Management", "Upload Staff Document"]}
      />
      <div className="row">
        <div className="register">
          {addDocument ? (
            <div style={{ float: "right" }}>
              {/*<button className="btn btn-primary" onClick={onSubmit}>*/}
              {/*  Save*/}
              {/*</button>*/}
            </div>
          ) : (
            <div style={{ float: "right" }}>
              <button className="btn btn-primary" onClick={addForm}>
                Add Staff Document
              </button>
            </div>
          )}
          <br />
          <br />
          <br />
          <hr />

          {addDocument ? (
            <div className="row">
              <div className="col-lg-4 col-md-4">
                <SearchSelect
                  id="StaffID"
                  label="Staff ID"
                  value={staffList.find(s => s.value === addStaffDocument.StaffID) || null}
                  options={staffList}
                  onChange={(selected) => {
                    setAddStaffDocument({
                      ...addStaffDocument,
                      StaffID: selected?.value || '',
                    });
                  }}
                  placeholder="Search staff"
                />

                {/* <select
                    id="StaffID"
                    name="StaffID"
                    value={addStaffDocument.StaffID}
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
              <div className="col-lg-4 col-md-4">
                <div className="form-group">
                  <label htmlFor="DocumentType">Document Type</label>
                  <input
                    type="text"
                    id="DocumentType"
                    className="form-control"
                    placeholder="Enter Document Title"
                    value={addStaffDocument.DocumentType}
                    onChange={onEdit}
                  />
                </div>
              </div>


              <div className="col-lg-4 col-md-4">
                <div className="form-group">
                  <label htmlFor="Designation">Upload Document </label>
                  <strong className="text-danger"><small>File must not exceed 2mb</small></strong>
                  <SimpleFileUpload
                    apiKey={simpleFileUploadAPIKey}
                    tag={`${projectName}-passport`}
                    onSuccess={handlePassportUpload}
                    accepted={"image/*"}
                    maxFileSize={2}
                    preview="false"
                    width="100%"
                    height="100"
                  />

                  <span className="badge bg-primary">
                    Only .jpg, .png, .jpeg are allowed, Max of 2MB
                  </span>
                </div>
              </div>


              {/*<div className="col-lg-4 col-md-4">*/}
              {/*  <div className="form-group">*/}
              {/*    <label htmlFor="Designation">File Name</label>*/}
              {/*    <input*/}
              {/*      type="file"*/}
              {/*      accept=".pdf, .jpg, .png, .jpeg"*/}
              {/*      id="file"*/}
              {/*      name="file"*/}
              {/*      className="form-control"*/}
              {/*      placeholder="File Name"*/}
              {/*      required*/}
              {/*      onChange={onEdit}*/}
              {/*    />*/}
              {/*    <span className="badge bg-secondary">*/}
              {/*      Only .pdf, .jpg, .png, .jpeg are allowed*/}
              {/*    </span>*/}
              {/*  </div>*/}
              {/*</div>*/}

            </div>
          ) : null}

          {/*<div className="table-responsive">*/}
          {/*  {!staffDocuments.length < 1 ? (*/}
          {/*    <table className="table table-hover">*/}
          {/*      <thead>*/}
          {/*        <tr>*/}
          {/*          <th>Document Type</th>*/}
          {/*          <th>File Name</th>*/}
          {/*          <th>Action</th>*/}
          {/*        </tr>*/}
          {/*      </thead>*/}
          {/*      <tbody>*/}
          {/*        {staffDocuments.map((item, index) => (*/}
          {/*          <tr key={index}>*/}
          {/*            <td>{item.Document}</td>*/}
          {/*            <td>*/}
          {/*              <a*/}
          {/*                target="_blank"*/}
          {/*                // referrerPolicy="no-referrer"*/}
          {/*                // href={`${serverLink}public/uploads/application/document/${item.FileName}`}*/}
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
    </div >
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(UploadStaffDocument);
