import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { formatDateAndTime, currencyConverter } from "../../../../resources/constants";
import SearchSelect from "../../../common/select/SearchSelect";

function HrGrossPayManagement(props) {
  const token = props.loginData[0].token;
  const staffID = props.loginData[0].StaffID;

  const [isLoading, setIsLoading] = useState(true);
  const [staffOptions, setStaffOptions] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [selectedStaffForHistory, setSelectedStaffForHistory] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [datatable, setDatatable] = useState({
    columns: [
      { label: "S/N", field: "sn" },
      { label: "Action", field: "action" },
      { label: "Staff ID", field: "StaffID" },
      { label: "Staff Name", field: "FullName" },
      { label: "Department", field: "DepartmentName" },
      { label: "Designation", field: "DesignationName" },
      { label: "Gross Pay", field: "GrossPayFormatted" },
      { label: "Staff Type", field: "StaffType" },
      { label: "Status", field: "Status" },
    ],
    rows: [],
  });

  const [updateForm, setUpdateForm] = useState({
    StaffID: "",
    CurrentGrossPay: 0,
    NewGrossPay: "",
    Remarks: "",
  });

  // Fetch staff list
  const getStaffList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${serverLink}staff/hr/gross-pay/list`, token);
      const data = response.data;

      // Format data for table
      const rows = data.map((item, index) => ({
        sn: index + 1,
        StaffID: item.StaffID,
        FullName: item.FullName,
        DepartmentName: item.DepartmentName || "N/A",
        DesignationName: item.DesignationName || "N/A",
        GrossPayFormatted: currencyConverter(item.GrossPay || 0),
        GrossPay: item.GrossPay || 0,
        StaffType: item.StaffType || "N/A",
        Status: item.IsActive === 1 ? "Active" : "Inactive",
        action: (
          <>
            <button
              className="btn btn-link p-0 text-primary"
              style={{ marginRight: 15 }}
              title="Edit Gross Pay"
              data-bs-toggle="modal"
              data-bs-target="#kt_modal_general"
              onClick={() => openUpdateModal(item)}
            >
              <i style={{ fontSize: "15px", color: "blue" }} className="fa fa-pen" />
            </button>
            <button
              className="btn btn-link p-0 text-info"
              title="View History"
              data-bs-toggle="modal"
              data-bs-target="#kt_modal_history"
              onClick={() => viewHistory(item)}
            >
              <i style={{ fontSize: "15px", color: "teal" }} className="fa fa-history" />
            </button>
          </>
        ),
      }));

      setDatatable({
        ...datatable,
        rows: rows,
      });

      // Create options for dropdown
      const options = data.map((item) => ({
        value: item.StaffID,
        label: `${item.StaffID} - ${item.FullName}`,
        grossPay: item.GrossPay || 0,
      }));
      setStaffOptions(options);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      toast.error("Failed to fetch staff list");
    } finally {
      setIsLoading(false);
    }
  };

  // Open update modal
  const openUpdateModal = (staff) => {
    setUpdateForm({
      StaffID: staff.StaffID,
      CurrentGrossPay: staff.GrossPay || 0,
      NewGrossPay: "",
      Remarks: "",
    });
  };

  // Handle staff selection in update modal
  const handleStaffSelect = (selected) => {
    if (selected) {
      // Find the original option to ensure we get the grossPay property
      // In case SearchSelect or data transformation strips extra properties
      const originalOption = staffOptions.find(opt => opt.value === selected.value);

      setUpdateForm({
        ...updateForm,
        StaffID: selected.value,
        CurrentGrossPay: originalOption ? originalOption.grossPay : 0,
      });
    } else {
      setUpdateForm({
        ...updateForm,
        StaffID: "",
        CurrentGrossPay: 0,
      });
    }
  };

  // Handle update form change
  const handleUpdateChange = (e) => {
    setUpdateForm({
      ...updateForm,
      [e.target.name]: e.target.value,
    });
  };

  // Submit update
  const handleUpdate = async () => {
    if (!updateForm.StaffID) {
      toast.error("Please select a staff member");
      return;
    }

    if (!updateForm.NewGrossPay || parseFloat(updateForm.NewGrossPay) < 0) {
      toast.error("Please enter a valid gross pay amount");
      return;
    }

    try {
      const response = await axios.patch(
        `${serverLink}staff/hr/gross-pay/update`,
        {
          StaffID: updateForm.StaffID,
          GrossPay: parseFloat(updateForm.NewGrossPay),
          Remarks: updateForm.Remarks,
          UpdatedBy: staffID,
        },
        token
      );

      if (response.data.message === "success") {
        toast.success("Gross pay updated successfully");
        document.getElementById("closeModal").click();
        getStaffList();
        setUpdateForm({
          StaffID: "",
          CurrentGrossPay: 0,
          NewGrossPay: "",
          Remarks: "",
        });
      } else {
        toast.error("Failed to update gross pay");
      }
    } catch (error) {
      console.error("Error updating gross pay:", error);
      toast.error("An error occurred while updating");
    }
  };

  // View history
  const viewHistory = async (staff) => {
    setSelectedStaffForHistory(staff);
    try {
      const response = await axios.get(
        `${serverLink}staff/hr/gross-pay/history/${staff.StaffID}`,
        token
      );
      setHistoryData(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to fetch history");
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadResult(null);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async () => {
    if (!uploadFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("UpdatedBy", staffID);

      const response = await axios.post(
        `${serverLink}staff/hr/gross-pay/bulk-upload`,
        formData,
        {
          headers: {
            ...token.headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.message === "success") {
        setUploadResult(response.data.summary);
        toast.success(
          `Upload complete: ${response.data.summary.success} successful, ${response.data.summary.failed.length} failed`
        );
        getStaffList();
      } else {
        toast.error(response.data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error.response?.data?.error || "An error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  // Download template
  const downloadTemplate = async () => {
    try {
      const response = await axios.get(
        `${serverLink}staff/hr/gross-pay/download-template`,
        {
          ...token,
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "gross_pay_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  };

  // Reset upload modal
  const resetUploadModal = () => {
    setUploadFile(null);
    setUploadResult(null);
  };

  // Reset update modal
  const resetUpdateModal = () => {
    setUpdateForm({
      StaffID: "",
      CurrentGrossPay: 0,
      NewGrossPay: "",
      Remarks: "",
    });
  };

  useEffect(() => {
    getStaffList();
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Staff Gross Pay Management"}
        items={["Human Resources", "Payroll", "Gross Pay Management"]}
        buttons={
          <>
            <button
              type="button"
              className="btn btn-primary me-2"
              data-bs-toggle="modal"
              data-bs-target="#kt_modal_upload"
              onClick={resetUploadModal}
            >
              <i className="fa fa-upload me-2"></i>Upload Excel
            </button>
            <button
              type="button"
              className="btn btn-outline-primary me-2"
              onClick={downloadTemplate}
            >
              <i className="fa fa-download me-2"></i>Download Template
            </button>
            <button
              type="button"
              className="btn btn-success"
              data-bs-toggle="modal"
              data-bs-target="#kt_modal_general"
              onClick={resetUpdateModal}
            >
              <i className="fa fa-plus me-2"></i>Update Staff Pay
            </button>
          </>
        }
      />
      <div className="flex-column-fluid">
        <div className="card card-no-border">
          <div className="card-body p-0">
            <AGTable data={datatable} />
          </div>
        </div>

        {/* Update Modal */}
        <Modal title={"Update Staff Gross Pay"}>
          <div className="row">
            <div className="col-12 mb-4">
              <label className="form-label fs-6 fw-bolder text-dark">Select Staff</label>
              <SearchSelect
                options={staffOptions}
                onChange={handleStaffSelect}
                value={staffOptions.find((opt) => opt.value === updateForm.StaffID) || null}
                placeholder="Search by Staff ID or Name..."
              />
            </div>
            {updateForm.StaffID && (
              <>
                <div className="col-12 mb-4">
                  <label className="form-label fs-6 fw-bolder text-dark">Current Gross Pay</label>
                  <input
                    type="text"
                    className="form-control form-control-lg form-control-solid"
                    value={currencyConverter(updateForm.CurrentGrossPay)}
                    disabled
                  />
                </div>
                <div className="col-12 mb-4">
                  <label className="form-label fs-6 fw-bolder text-dark">
                    New Gross Pay <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg form-control-solid"
                    name="NewGrossPay"
                    value={updateForm.NewGrossPay}
                    onChange={handleUpdateChange}
                    placeholder="Enter new gross pay amount"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-12 mb-4">
                  <label className="form-label fs-6 fw-bolder text-dark">Remarks</label>
                  <textarea
                    className="form-control form-control-lg form-control-solid"
                    name="Remarks"
                    value={updateForm.Remarks}
                    onChange={handleUpdateChange}
                    placeholder="Optional: Enter reason for update"
                    rows="2"
                  ></textarea>
                </div>
              </>
            )}
            <div className="col-12">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleUpdate}
                disabled={!updateForm.StaffID}
              >
                Update Gross Pay
              </button>
            </div>
          </div>
        </Modal>

        {/* Upload Modal */}
        <Modal title={"Upload Gross Pay Excel"} id={"kt_modal_upload"}>
          <div className="row">
            <div className="col-12 mb-4">
              <div className="alert alert-info">
                <strong>Instructions:</strong>
                <ul className="mb-0 mt-2">
                  <li>
                    Excel file must have two columns: <strong>StaffID</strong> and{" "}
                    <strong>GrossPay</strong>
                  </li>
                  <li>Click "Download Template" to get a sample file</li>
                  <li>Fill in your data and upload</li>
                </ul>
              </div>
            </div>
            <div className="col-12 mb-4">
              <label className="form-label fs-6 fw-bolder text-dark">Select Excel File</label>
              <input
                type="file"
                className="form-control form-control-lg form-control-solid"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </div>
            {uploadFile && (
              <div className="col-12 mb-4">
                <span className="badge bg-success">
                  <i className="fa fa-file-excel me-1"></i>
                  {uploadFile.name}
                </span>
              </div>
            )}
            {uploadResult && (
              <div className="col-12 mb-4">
                <div className="alert alert-success">
                  <strong>Upload Summary:</strong>
                  <br />
                  Successful: {uploadResult.success}
                  <br />
                  Failed: {uploadResult.failed.length}
                </div>
                {uploadResult.failed.length > 0 && (
                  <div className="alert alert-warning">
                    <strong>Failed Records:</strong>
                    <ul
                      className="mb-0 mt-2"
                      style={{ maxHeight: "150px", overflowY: "auto" }}
                    >
                      {uploadResult.failed.map((item, idx) => (
                        <li key={idx}>
                          Row {item.row}: {item.StaffID} - {item.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="col-12">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleBulkUpload}
                disabled={!uploadFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fa fa-upload me-2"></i>Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>

        {/* History Modal */}
        <Modal title={"Gross Pay History"} id={"kt_modal_history"} large={true}>
          {selectedStaffForHistory && (
            <div className="mb-4">
              <h6>
                Staff: {selectedStaffForHistory.FullName} ({selectedStaffForHistory.StaffID})
              </h6>
            </div>
          )}
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Previous Gross Pay</th>
                  <th>New Gross Pay</th>
                  <th>Method</th>
                  <th>Updated By</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {historyData.length > 0 ? (
                  historyData.map((item, index) => (
                    <tr key={index}>
                      <td>{formatDateAndTime(item.UpdatedDate, "date_and_time")}</td>
                      <td>{currencyConverter(item.PreviousGrossPay || 0)}</td>
                      <td>{currencyConverter(item.NewGrossPay)}</td>
                      <td>
                        <span
                          className={`badge ${item.UpdateMethod === "MANUAL" ? "bg-primary" : "bg-info"
                            }`}
                        >
                          {item.UpdateMethod}
                        </span>
                      </td>
                      <td>{item.UpdatedByName || item.UpdatedBy}</td>
                      <td>{item.Remarks || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No history records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  loginData: state.LoginDetails,
  permissionData: state.PermissionDetails,
});

export default connect(mapStateToProps)(HrGrossPayManagement);
