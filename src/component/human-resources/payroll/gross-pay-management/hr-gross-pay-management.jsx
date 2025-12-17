import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api, apiClient } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { formatDateAndTime, currencyConverter } from "../../../../resources/constants";
import SearchSelect from "../../../common/select/SearchSelect";

function HrGrossPayManagement(props) {
  const staffID = props.loginData[0].StaffID;

  const [isLoading, setIsLoading] = useState(true);
  const [staffOptions, setStaffOptions] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [selectedStaffForHistory, setSelectedStaffForHistory] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Bulk Increase State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkPercentage, setBulkPercentage] = useState("");
  const [bulkPreview, setBulkPreview] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

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
    const { success, data } = await api.get("staff/hr/gross-pay/list");

    if (success && data) {
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

      setDatatable({ ...datatable, rows });

      // Create options for dropdown
      const options = data.map((item) => ({
        value: item.StaffID,
        label: `${item.StaffID} - ${item.FullName}`,
        grossPay: item.GrossPay || 0,
      }));
      setStaffOptions(options);
    }
    setIsLoading(false);
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
      const originalOption = staffOptions.find(opt => opt.value === selected.value);
      setUpdateForm({
        ...updateForm,
        StaffID: selected.value,
        CurrentGrossPay: originalOption ? originalOption.grossPay : 0,
      });
    } else {
      setUpdateForm({ ...updateForm, StaffID: "", CurrentGrossPay: 0 });
    }
  };

  // Handle update form change
  const handleUpdateChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
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

    const { success, data } = await api.patch("staff/hr/gross-pay/update", {
      StaffID: updateForm.StaffID,
      GrossPay: parseFloat(updateForm.NewGrossPay),
      Remarks: updateForm.Remarks,
      UpdatedBy: staffID,
    });

    if (success && data?.message === "success") {
      toast.success("Gross pay updated successfully");
      document.getElementById("closeModal").click();
      getStaffList();
      setUpdateForm({ StaffID: "", CurrentGrossPay: 0, NewGrossPay: "", Remarks: "" });
    } else if (success) {
      toast.error("Failed to update gross pay");
    }
  };

  // View history
  const viewHistory = async (staff) => {
    setSelectedStaffForHistory(staff);
    const { success, data } = await api.get(`staff/hr/gross-pay/history/${staff.StaffID}`);

    if (success) {
      setHistoryData(data || []);
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

  // Handle bulk upload - uses apiClient directly for FormData
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

      const response = await apiClient.post("staff/hr/gross-pay/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
      const response = await apiClient.get("staff/hr/gross-pay/download-template", {
        responseType: "blob",
      });

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
    setUpdateForm({ StaffID: "", CurrentGrossPay: 0, NewGrossPay: "", Remarks: "" });
  };

  // Bulk Increase Functions
  const handleBulkIncreasePreview = async () => {
    if (!bulkPercentage || parseFloat(bulkPercentage) <= 0) {
      toast.warning("Please enter a valid percentage");
      return;
    }
    setBulkLoading(true);
    try {
      const { success, data } = await api.post("staff/hr/salaries/bulk-gross-pay-preview", {
        percentage: bulkPercentage
      });
      if (success && data.preview) {
        setBulkPreview(data);
      }
    } catch (err) {
      toast.error("Failed to generate preview");
    }
    setBulkLoading(false);
  };

  const handleBulkIncreaseSubmit = async () => {
    if (!bulkPercentage || !bulkPreview) {
      toast.warning("Please preview before applying");
      return;
    }
    setBulkLoading(true);
    try {
      const { success, data } = await api.post("staff/hr/salaries/bulk-gross-pay-increase", {
        percentage: bulkPercentage,
        inserted_by: staffID
      });
      if (success && data.message === "success") {
        toast.success(`Successfully increased gross pay for ${data.summary.staffProcessed} staff members`);
        setShowBulkModal(false);
        setBulkPreview(null);
        setBulkPercentage("");
        getStaffList();
      } else {
        toast.error(data.message || "Failed to process bulk increase");
      }
    } catch (err) {
      toast.error("Failed to process bulk increase");
    }
    setBulkLoading(false);
  };

  useEffect(() => {
    getStaffList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              className="btn btn-warning me-2"
              onClick={() => setShowBulkModal(true)}
            >
              <i className="fa fa-percent me-2"></i>Bulk Increase by %
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
                    <ul className="mb-0 mt-2" style={{ maxHeight: "150px", overflowY: "auto" }}>
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
                        <span className={`badge ${item.UpdateMethod === "MANUAL" ? "bg-primary" : "bg-info"}`}>
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

        {/* Bulk Increase Modal */}
        {showBulkModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Bulk Gross Pay Increase by Percentage</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowBulkModal(false); setBulkPreview(null); }}></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <label className="form-label">Increase Percentage (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={bulkPercentage}
                        onChange={(e) => setBulkPercentage(e.target.value)}
                        placeholder="e.g., 10 for 10% increase"
                      />
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                      <button className="btn btn-info w-100" onClick={handleBulkIncreasePreview} disabled={bulkLoading}>
                        <i className="fa fa-eye me-2"></i>Preview Changes
                      </button>
                    </div>
                  </div>

                  {bulkPreview && (
                    <div className="mt-4">
                      <div className="alert alert-warning">
                        <strong>⚠️ Warning:</strong> This will permanently update gross pay for <strong>{bulkPreview.staffCount}</strong> staff members.
                        <br />
                        Total increase: <strong>{currencyConverter(bulkPreview.totalIncrease)}</strong>
                      </div>
                      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        <table className="table table-sm table-bordered">
                          <thead className="table-light">
                            <tr><th>Staff ID</th><th>Staff Name</th><th>Current Gross Pay</th><th>New Gross Pay</th><th>Increase</th></tr>
                          </thead>
                          <tbody>
                            {bulkPreview.preview.slice(0, 50).map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.staffId}</td>
                                <td>{item.staffName}</td>
                                <td>{currencyConverter(item.currentGrossPay)}</td>
                                <td className="text-success fw-bold">{currencyConverter(item.newGrossPay)}</td>
                                <td className="text-primary">+{currencyConverter(item.increase)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {bulkPreview.preview.length > 50 && <p className="text-muted">...and {bulkPreview.preview.length - 50} more staff members</p>}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowBulkModal(false); setBulkPreview(null); }}>Cancel</button>
                  <button type="button" className="btn btn-danger" onClick={handleBulkIncreaseSubmit} disabled={bulkLoading || !bulkPreview}>
                    {bulkLoading ? 'Processing...' : 'Apply Increase to All Staff'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  loginData: state.LoginDetails,
  permissionData: state.PermissionDetails,
});

export default connect(mapStateToProps)(HrGrossPayManagement);
