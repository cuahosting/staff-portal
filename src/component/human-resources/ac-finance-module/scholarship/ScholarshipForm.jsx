import React from "react";

const ScholarshipForm = ({ data, onEdit, onSubmit, isFormLoading }) => {
    return (
        <div className="row">
            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <label className="required fw-bold fs-6 mb-2 text-dark">Scholarship Name</label>
                    <input type="text" id="Name" className="form-control form-control-solid"
                        placeholder="e.g. Merit-Based Scholarship" value={data.Name} onChange={onEdit} />
                </div>
            </div>

            <div className="col-md-6">
                <div className="fv-row mb-7">
                    <label className="fw-bold fs-6 mb-2 text-dark">Start Date</label>
                    <input type="date" id="StartDate" className="form-control form-control-solid"
                        value={data.StartDate ? data.StartDate.split('T')[0] : ""} onChange={onEdit} />
                </div>
            </div>

            <div className="col-md-6">
                <div className="fv-row mb-7">
                    <label className="fw-bold fs-6 mb-2 text-dark">End Date</label>
                    <input type="date" id="EndDate" className="form-control form-control-solid"
                        value={data.EndDate ? data.EndDate.split('T')[0] : ""} onChange={onEdit} />
                </div>
            </div>

            <div className="col-md-12 mb-5">
                <h4 className="fw-bolder text-dark mb-4">Coverage Percentages (%)</h4>
                <div className="separator mb-5"></div>
            </div>

            <div className="col-md-4">
                <div className="fv-row mb-7">
                    <label className="fw-bold fs-6 mb-2 text-dark">Admission (%)</label>
                    <input type="number" id="Admission" className="form-control form-control-solid"
                        min="0" max="100" placeholder="0" value={data.Admission} onChange={onEdit} />
                </div>
            </div>

            <div className="col-md-4">
                <div className="fv-row mb-7">
                    <label className="fw-bold fs-6 mb-2 text-dark">Tuition (%)</label>
                    <input type="number" id="Tuition" className="form-control form-control-solid"
                        min="0" max="100" placeholder="0" value={data.Tuition} onChange={onEdit} />
                </div>
            </div>

            <div className="col-md-4">
                <div className="fv-row mb-7">
                    <label className="fw-bold fs-6 mb-2 text-dark">Feeding (%)</label>
                    <input type="number" id="Feeding" className="form-control form-control-solid"
                        min="0" max="100" placeholder="0" value={data.Feeding} onChange={onEdit} />
                </div>
            </div>

            <div className="col-md-6">
                <div className="fv-row mb-7">
                    <label className="fw-bold fs-6 mb-2 text-dark">Transportation (%)</label>
                    <input type="number" id="Transportation" className="form-control form-control-solid"
                        min="0" max="100" placeholder="0" value={data.Transportation} onChange={onEdit} />
                </div>
            </div>

            <div className="col-md-6">
                <div className="fv-row mb-7">
                    <label className="fw-bold fs-6 mb-2 text-dark">Accommodation (%)</label>
                    <input type="number" id="Accommodation" className="form-control form-control-solid"
                        min="0" max="100" placeholder="0" value={data.Accommodation} onChange={onEdit} />
                </div>
            </div>

            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <label className="fw-bold fs-6 mb-2 text-dark">Description</label>
                    <textarea id="Description" className="form-control form-control-solid"
                        rows="3" placeholder="Additional details..." value={data.Description} onChange={onEdit}></textarea>
                </div>
            </div>

            <div className="text-center pt-15">
                <button type="reset" className="btn btn-light me-3 shadow-sm" data-bs-dismiss="modal" id="closeModal">Discard</button>
                <button type="button" className="btn btn-primary shadow-sm" onClick={onSubmit} disabled={isFormLoading === "on"}>
                    <span className="indicator-label">{isFormLoading === "on" ? "Please wait..." : "Submit"}</span>
                </button>
            </div>
        </div>
    );
};

export default ScholarshipForm;
