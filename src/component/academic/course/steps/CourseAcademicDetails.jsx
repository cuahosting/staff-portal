import React from "react";

export default function CourseAcademicDetails(props) {
    return (
        <>
            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="Duration">
                        Duration
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="number"
                            id="Duration"
                            onChange={props.onEdit}
                            value={props.data.Duration}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Course Duration"
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="DurationType">
                        Duration Type
                    </label>
                    <div className="enhanced-input-wrapper">
                        <select
                            id="DurationType"
                            onChange={props.onEdit}
                            value={props.data.DurationType}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                        >
                            <option>Select Duration Type</option>
                            <option value="Months">Months</option>
                            <option value="Years">Years</option>
                            <option value="Semesters">Semesters</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="DegreeInView">
                        Degree In View
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="text"
                            id="DegreeInView"
                            onChange={props.onEdit}
                            value={props.data.DegreeInView}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Degree In View"
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="IsAwardDegree">
                        Is Award Degree
                    </label>
                    <div className="enhanced-input-wrapper">
                        <select
                            id="IsAwardDegree"
                            onChange={props.onEdit}
                            value={props.data.IsAwardDegree}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                        >
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="ApplicationType">
                    Application Type
                </label>
                <div className="enhanced-input-wrapper">
                    <select
                        id="ApplicationType"
                        onChange={props.onEdit}
                        value={props.data.ApplicationType}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                    >
                        <option>Select Application Type</option>
                        <option value="undergraduate">undergraduate</option>
                        <option value="postgraduate">postgraduate</option>
                    </select>
                </div>
            </div>
        </>
    )
}
