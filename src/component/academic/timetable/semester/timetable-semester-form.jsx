import React from "react";
import {formatDate} from "../../../../resources/constants";

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
                    <select
                        id="Status"
                        onChange={props.onEdit}
                        value={props.data.Status}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                    >
                        <option>Select Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">In-Active</option>
                        <option value="future">Future</option>
                    </select>
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
                            <span className="spinner-border spinner-border-sm align-middle ms-2"/>
                    </span>
                </button>
            </div>
        </>
    )
}
