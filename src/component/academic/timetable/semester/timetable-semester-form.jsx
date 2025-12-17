import React from "react";
import { formatDate } from "../../../../resources/constants";
import SearchSelect from "../../../common/select/SearchSelect";

export default function TimetableSemesterForm(props) {
    return (
        <>
            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="SemesterName">
                    Semester Name
                </label>
                <div className="enhanced-input-wrapper">
                    <input
                        type="text"
                        id="SemesterName"
                        onChange={props.onEdit}
                        value={props.data.SemesterName}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Semester Name"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="SemesterCode">
                    Semester Code
                </label>
                <div className="enhanced-input-wrapper">
                    <input
                        type="text"
                        id="SemesterCode"
                        onChange={props.onEdit}
                        value={props.data.SemesterCode}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Semester Code"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="StartDate">
                        Start Date
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="date"
                            id="StartDate"
                            onChange={props.onEdit}
                            value={formatDate(props.data.StartDate)}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                        />
                    </div>
                </div>

                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="EndDate">
                        End Date
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="date"
                            id="EndDate"
                            onChange={props.onEdit}
                            value={formatDate(props.data.EndDate)}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                        />
                    </div>
                </div>
            </div>

            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="Status">
                    Status
                </label>
                <div className="enhanced-input-wrapper">
                    <SearchSelect
                        id="Status"
                        value={[
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "In-Active" },
                            { value: "future", label: "Future" }
                        ].find(opt => opt.value === props.data.Status) || null}
                        options={[
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "In-Active" },
                            { value: "future", label: "Future" }
                        ]}
                        onChange={(selected) => props.onEdit({ target: { id: 'Status', value: selected?.value || '' } })}
                        placeholder="Select Status"
                        isClearable={false}
                    />
                </div>
            </div>

            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="Description">
                    Description
                </label>
                <div className="enhanced-input-wrapper">
                    <input
                        type="text"
                        id="Description"
                        onChange={props.onEdit}
                        value={props.data.Description}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Description"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="form-group pt-2">
                <button onClick={props.onSubmit} id="kt_modal_new_address_submit" data-kt-indicator={props.isFormLoading} className="btn btn-primary w-100">
                    <span className="indicator-label">Submit</span>
                    <span className="indicator-progress">Please wait...
                        <span className="spinner-border spinner-border-sm align-middle ms-2" />
                    </span>
                </button>
            </div>
        </>
    )
}
