import React from "react";

export default function FeeItemForm({ data, onEdit, onSubmit, isFormLoading }) {
    return (
        <div className="row">
            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <label className="required fs-6 fw-bold mb-2">Item Name</label>
                    <input
                        type="text"
                        className="form-control form-control-solid"
                        placeholder="Enter item name"
                        id="Name"
                        value={data.Name}
                        onChange={onEdit}
                    />
                </div>
            </div>
            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <label className="fs-6 fw-bold mb-2">Description</label>
                    <textarea
                        className="form-control form-control-solid"
                        placeholder="Enter description"
                        id="Description"
                        value={data.Description}
                        onChange={onEdit}
                        rows="3"
                    ></textarea>
                </div>
            </div>
            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <label className="required fs-6 fw-bold mb-2">Amount</label>
                    <input
                        type="number"
                        className="form-control form-control-solid"
                        placeholder="Enter amount"
                        id="Amount"
                        value={data.Amount}
                        onChange={onEdit}
                    />
                </div>
            </div>
            <div className="text-center pt-15">
                <button type="reset" className="btn btn-light me-3" data-bs-dismiss="modal" id="closeModal">Discard</button>
                <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={isFormLoading === "on"}>
                    <span className="indicator-label">{isFormLoading === "on" ? "Please wait..." : "Submit"}</span>
                </button>
            </div>
        </div>
    );
}
