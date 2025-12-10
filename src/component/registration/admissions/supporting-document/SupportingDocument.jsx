import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { serverLink } from "../../../../resources/url";
import Modal from "../../../common/modal/modal";
import ReportTable from "../../../common/table/ReportTable";
import { formatDateAndTime } from "../../../../resources/constants";

import { useForm } from "react-hook-form";

function SupportingDocument(props)
{
  const token = props.loginData.token
  const { register, handleSubmit, setValue } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [entry_id, setEntryId] = useState("");
  const [docs, setDocs] = useState([]);
  const columns = [
    "S/N",
    "Document Name",
    "IsRequired",
    "Min Document",
    "Application Type",
    "Added By",
    "Added Date",
    "Action",
  ];
  const getDocs = async () =>
  {
    await axios
      .get(`${serverLink}registration/admissions/supporting-doc`, token)
      .then((res) =>
      {
        const data = res.data;
        let rows = [];
        if (data.message === "success")
        {
          data.data.length > 0 &&
            data.data.map((item, index) =>
            {
              let required = (
                <span className="badge badge-success">Required</span>
              );
              if (item.IsRequired === "0")
              {
                required = (
                  <span className="badge badge-default">Not Required</span>
                );
              }
              rows.push([
                index + 1,
                item.DocumentName,
                required,
                item.MinDocument,
                item.ApplicationType,
                item.InsertedBy,
                formatDateAndTime(item.InsertedDate, "date_and_time"),
                <button
                  onClick={() =>
                  {
                    setEntryId(item.EntryID);
                    setValue("docname", item.DocumentName);
                    setValue("isrequired", item.IsRequired);
                    setValue("mindoc", item.MinDocument);
                    setValue("doctype", item.ApplicationType);
                  }}
                  type="button"
                  className="btn btn-primary btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_general"
                >
                  <i className={"fa fa-pen"} />
                </button>,
              ]);
            });
        }
        setDocs(rows);
      })
      .catch((err) =>
      {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  };
  const clearItems = () =>
  {
    setEntryId("");
    setValue("docname", "");
    setValue("isrequired", "");
    setValue("mindoc", "");
    setValue("doctype", "");
  };

  useEffect(() =>
  {
    getDocs();
  }, []);
  // /staff/report
  const addSupportingDoc = async (data) =>
  {
    if (data.docname === "")
    {
      toast.error("Please Provide Document Name");
      return false;
    }
    if (data.isrequired === "")
    {
      toast.error("Please select If Document is Required");
      return false;
    }
    if (data.mindoc === "")
    {
      toast.error("Please Provide Min Document");
      return false;
    }
    if (data.doctype === "")
    {
      toast.error("Please Select Document Type");
      return false;
    }
    if (entry_id == "")
    {
      let dataTo = {
        entry_id: "",
        doctype: data.doctype,
        mindoc: data.mindoc,
        isrequired: data.isrequired,
        docname: data.docname,
        insertedBy: props.loginData.StaffID,
      };
      await axios
        .post(`${serverLink}registration/admissions/supporting-doc`, dataTo, token)
        .then((res) =>
        {
          if (res.data.message === "success")
          {
            toast.success("Document Added Successfully");
            document.getElementById("closeModal").click();
            clearItems();

            getDocs();
          } else
          {
            toast.error(res.data.message);
          }
        })
        .catch((err) =>
        {
          console.log(err);
          toast.error("NETWORK ERROR. Please try again!");
        });
    } else
    {
      let dataTo = {
        entry_id: entry_id,
        doctype: data.doctype,
        mindoc: data.mindoc,
        isrequired: data.isrequired,
        docname: data.docname,
        insertedBy: props.loginData.StaffID,
      };
      await axios
        .patch(`${serverLink}registration/admissions/supporting-doc`, dataTo, token)
        .then((res) =>
        {
          if (res.data.message === "success")
          {
            toast.success("Document Updated Successfully");
            document.getElementById("closeModal").click();
            clearItems();
            getDocs();
          } else
          {
            toast.error("An error has occurred. Please try again!");
          }
        })
        .catch((err) =>
        {
          console.log(err);
          toast.error("NETWORK ERROR. Please try again!");
        });
    }
  };

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Admission"}
        items={["Registraion", "Admissions", "Supporting Documents"]}
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
                  onClick={() => clearItems()}
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_general"
                >
                  Add Supporting Document
                </button>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <ReportTable columns={columns} data={docs} />
          </div>
        </div>

        <Modal title={"Add Document Form"}>
          <form onSubmit={handleSubmit(addSupportingDoc)}>
            <div className="form-group">
              <label htmlFor="hostelFor">Select Application Type</label>

              <select
                id="hostelFor"
                {...register("doctype")}
                required
                className="form-control"
              >
                <option value="">Select Application Type</option>
                <option value="undergraduate">Under Graduate</option>
                <option value="postgraduate">Post Graduate</option>
              </select>
            </div>

            <div className="form-group pt-5">
              <label htmlFor="hostelName">Document Name</label>
              <input
                id="hostelName"
                {...register("docname")}
                required
                placeholder="Enter Document Name"
                className="form-control"
              />
            </div>
            <div className="form-group pt-5">
              <label htmlFor="manager">Minimum Document</label>
              <input
                id="hostelLocation"
                {...register("mindoc")}
                required
                type="number"
                placeholder="Enter Minimum Document"
                className="form-control"
              />
            </div>

            <div className="form-group pt-5">
              <label htmlFor="hostelLocation">select Document Necessity</label>
              <select
                id="hostelFor"
                {...register("isrequired")}
                required
                className="form-control"
              >
                <option value="">Select Document Necessity</option>
                <option value="1">Required</option>
                <option value="0">Not Requried</option>
              </select>
            </div>

            <div className="form-group pt-5">
              <button className="btn btn-primary w-100">Save</button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) =>
{
  return {
    loginData: state.LoginDetails[0],
  };
};

export default connect(mapStateToProps, null)(SupportingDocument);
