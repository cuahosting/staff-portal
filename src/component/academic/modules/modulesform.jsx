import React from "react";
import Select from "react-select";

export const ModulesForm = (props) => {

    return (
        <form onSubmit={props.onSubmit}>
            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="ModuleName">
                        Module Name
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            required
                            type="text"
                            id="ModuleName"
                            onChange={props.onEdit}
                            value={props.createModule.ModuleName}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Module Description"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="fv-row mb-6 enhanced-form-group">
                        <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="ModuleCode">
                            Module Code
                        </label>
                        <div className="enhanced-input-wrapper">
                            <input
                                required
                                style={{textTransform:'uppercase'}}
                                type="text"
                                id="ModuleCode"
                                onChange={props.onEdit}
                                value={props.createModule.ModuleCode}
                                className="form-control form-control-lg form-control-solid enhanced-input"
                                placeholder="Enter the Module Code"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="fv-row mb-6 enhanced-form-group">
                        <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="ModuleType">
                            Module Type
                        </label>
                        <div className="enhanced-input-wrapper">
                            <select
                                id="ModuleType"
                                onChange={props.onEdit}
                                required
                                value={props.createModule.ModuleType}
                                className="form-control form-control-lg form-control-solid enhanced-input"
                                data-kt-select2="true"
                                data-placeholder="Select option"
                                data-dropdown-parent="#kt_menu_624456606a84b"
                                data-allow-clear="true"
                            >
                                <option value="">-select type-</option>
                                <option value="Core">Core</option>
                                <option value="Elective">Elective</option>
                                <option value="Lecture">Lecture</option>
                                <option value="Interactive">Interactive</option>
                                <option value="Class">Class</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Online">Online</option>
                                <option value="Seminar">Seminar</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="DepartmentCode">
                        Course
                    </label>
                    <Select
                        name="DepartmentCode"
                        value={props.createModule.DepartmentCode2}
                        onChange={props.onDepartmentChange}
                        options={props.departmentOptions}
                        placeholder="select Course"
                    />
                </div>

                <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CreditUnit">
                        Credit Unit
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="text"
                            required
                            id="CreditUnit"
                            onChange={props.onEdit}
                            value={props.createModule.CreditUnit}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Module Credit unit"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CAPerCon">
                        CA per con
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="text"
                            required
                            id="CAPerCon"
                            onChange={props.onEdit}
                            value={props.createModule.CAPerCon}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter C A per con"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="ExamPerCon">
                        Exam Per Con
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="text"
                            id="ExamPerCon"
                            onChange={props.onEdit}
                            value={props.createModule.ExamPerCon}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the exam per con"
                            autoComplete="off"
                        />
                    </div>
                </div>

            </div>
            <div className="form-group pt-2">
                <button type="submit" className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={props.isFormLoading}>
                <span className="indicator-label">Submit</span>
                <span className="indicator-progress">Please wait...
                            <span className="spinner-border spinner-border-sm align-middle ms-2" />
                        </span>
                </button>
            </div>
        </form>
    )
}
