import React from "react";
import Select from "react-select";

export default function AddFacultyForm(props) {
    return (
        <>
            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="FacultyName">
                    Faculty Name
                </label>
                <div className="enhanced-input-wrapper">
                    <input
                        type="text"
                        id="FacultyName"
                        onChange={props.onEdit}
                        value={props.data.FacultyName}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Faculty Name"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="FacultyCode">
                    Faculty Code
                </label>
                <div className="enhanced-input-wrapper">
                    <input
                        style={{textTransform:'uppercase'}}
                        type="text"
                        id="FacultyCode"
                        disabled={props.data.IsEdit.toString() === "1"? true:false}
                        onChange={props.onEdit}
                        value={props.data.FacultyCode}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Faculty Code"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group col-md-12">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="FacultyDean">
                        Faculty Dean
                    </label>
                    <Select
                        name="FacultyDean"
                        value={props.data.FacultyDean2}
                        onChange={props.onStaffChange}
                        options={props.staff}
                        placeholder="select Dean"
                    />
                </div>

                <div className="fv-row mb-6 enhanced-form-group col-md-12">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="FacultyDeputyDean">
                        Deputy Dean
                    </label>
                    <Select
                        name="FacultyDeputyDean"
                        value={props.data.FacultyDeputyDean2}
                        onChange={props.onDeputyChange}
                        options={props.staff}
                        placeholder="select Deputy Dean"
                    />
                </div>
            </div>

            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="IsAcademic">
                        Is Academic
                    </label>
                    <div className="enhanced-input-wrapper">
                        <select
                            id="IsAcademic"
                            onChange={props.onEdit}
                            value={props.data.IsAcademic}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                        >
                            <option value="1">Academic</option>
                            <option value="0">Non-Academic</option>
                        </select>
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
