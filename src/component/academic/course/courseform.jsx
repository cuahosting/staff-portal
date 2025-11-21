import React from "react";
import Select2 from "react-select2-wrapper";

export default function CourseForm(props) {
    return (
        <>
            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CourseName">
                    Course Name
                </label>
                <div className="enhanced-input-wrapper">
                    <input
                        type="text"
                        id="CourseName"
                        onChange={props.onEdit}
                        value={props.data.CourseName}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Course Name"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CourseCode">
                    Course Code
                </label>
                <div className="enhanced-input-wrapper">
                    <input
                        style={{textTransform:'uppercase'}}
                        type="text"
                        id="CourseCode"
                        disabled={props.data.EntryID !== "" ? true: false}
                        onChange={props.onEdit}
                        value={props.data.CourseCode}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Course Code"
                        autoComplete="off"
                    />
                </div>
            </div>

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

            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="TuitionFee">
                        Tuition Fee
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="number"
                            id="TuitionFee"
                            onChange={props.onEdit}
                            value={props.data.TuitionFee}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Tuition Fee"
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CourseClass">
                        Course Class
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="text"
                            id="CourseClass"
                            onChange={props.onEdit}
                            value={props.data.CourseClass}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Course Class"
                            autoComplete="off"
                        />
                    </div>
                </div>
            </div>

            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="DepartmentCode">
                    Department
                </label>
                <div className="enhanced-input-wrapper">
                    <select
                        id="DepartmentCode"
                        onChange={props.onEdit}
                        value={props.data.DepartmentCode}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                    >
                        <option>Select Department</option>
                        {
                            props.departmentList.length > 0 && props.departmentList.map((department, index) => {
                                return <option key={index} value={department.DepartmentCode}>{department.DepartmentName}</option>
                            })
                        }
                    </select>
                </div>
            </div>

            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="IsGens">
                        Is Gens
                    </label>
                    <div className="enhanced-input-wrapper">
                        <select
                            id="IsGens"
                            onChange={props.onEdit}
                            value={props.data.IsGens}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                        >
                            <option>Select Option</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>
                </div>
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
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
