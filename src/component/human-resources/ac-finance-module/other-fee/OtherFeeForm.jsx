import React from "react";
import SearchSelect from "../../../common/select/SearchSelect";

const OtherFeeForm = ({ data, onEdit, onSelectChange, onSubmit, isFormLoading }) => {
    const categoryOptions = [
        { value: "Library", label: "Library" },
        { value: "Lab", label: "Lab" },
        { value: "Certificate", label: "Certificate" },
        { value: "Transcript", label: "Transcript" },
        { value: "Admission", label: "Admission" },
        { value: "Others", label: "Others" },
    ];

    const statusOptions = [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
    ];

    return (
        <div className="row">
            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <label className="required fw-bold fs-6 mb-2">Item Name</label>
                    <input
                        type="text"
                        id="Name"
                        className="form-control form-control-solid"
                        placeholder="e.g. Library Fee, Lab Fee"
                        value={data.Name}
                        onChange={onEdit}
                    />
                </div>
            </div>

            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <SearchSelect
                        id="Category"
                        label="Category"
                        required
                        options={categoryOptions}
                        value={categoryOptions.find(opt => opt.value === data.Category)}
                        onChange={(val) => onSelectChange("Category", val?.value)}
                        placeholder="Select Category"
                    />
                </div>
            </div>

            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <label className="required fw-bold fs-6 mb-2">Default Amount (₦)</label>
                    <input
                        type="number"
                        id="DefaultAmount"
                        className="form-control form-control-solid"
                        placeholder="0.00"
                        value={data.DefaultAmount}
                        onChange={onEdit}
                    />
                </div>
            </div>

            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <label className="fw-bold fs-6 mb-2">Description</label>
                    <textarea
                        id="Description"
                        className="form-control form-control-solid"
                        rows="3"
                        placeholder="Brief description of the fee"
                        value={data.Description}
                        onChange={onEdit}
                    ></textarea>
                </div>
            </div>

            {data.EntryID && (
                <div className="col-md-12">
                    <div className="fv-row mb-7">
                        <SearchSelect
                            id="IsActive"
                            label="Status"
                            required
                            options={statusOptions}
                            value={statusOptions.find(opt => opt.value === data.IsActive?.toString())}
                            onChange={(val) => onSelectChange("IsActive", val?.value)}
                            placeholder="Select Status"
                        />
                    </div>
                </div>
            )}

            <div className="text-center pt-15">
                <button type="reset" className="btn btn-light me-3" data-bs-dismiss="modal">Discard</button>
                <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={isFormLoading === "on"}>
                    <span className="indicator-label">{isFormLoading === "on" ? "Please wait..." : "Submit"}</span>
                </button>
            </div>
        </div>
    );
};

export default OtherFeeForm;
