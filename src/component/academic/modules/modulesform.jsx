import React from "react";
import Select from "react-select";

export const ModulesForm = (props) => {

    return (
        <form onSubmit={props.onSubmit}>
            <div className="row">
                <div className="form-group">
                    <label htmlFor="ModuleName">Module Name</label>
                    <input
                        required
                        type="text"
                        id={"ModuleName"}
                        onChange={props.onEdit}
                        value={props.createModule.ModuleName}
                        className={"form-control"}
                        placeholder={"Enter the Module Description"}
                    />
                </div>
                <div className="col-md-6 mt-4">
                    <div className="form-group">
                        <label htmlFor="ModuleCode">Module Code</label>
                        <input
                            required
                            style={{textTransform:'uppercase'}} 
                            type="text"
                            id={"ModuleCode"}
                            onChange={props.onEdit}
                            value={props.createModule.ModuleCode}
                            className={"form-control"}
                            placeholder={"Enter the Module Code"}
                        />
                    </div>
                </div>
                <div className="col-md-6 mt-4">
                    <div className="form-group">
                        <label htmlFor="ModuleType">Module Type</label>
                        <select id="ModuleType" onChange={props.onEdit}
                            required
                            value={props.createModule.ModuleType}
                            className="form-select form-select-solid"
                            data-kt-select2="true"
                            data-placeholder="Select option"
                            data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">
                            <option value={""}>-select type-</option>
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
                <div className="form-group mt-4">
                    <label htmlFor="DepartmentCode">Course</label>
                    <Select
                        name="DepartmentCode"
                        value={props.createModule.DepartmentCode2}
                        onChange={props.onDepartmentChange}
                        options={props.departmentOptions}
                        placeholder="select Course"
                    />
                    {/*<select*/}
                    {/*    required*/}
                    {/*    id="DepartmentCode" onChange={props.onEdit}*/}
                    {/*    value={props.createModule.DepartmentCode}*/}
                    {/*    className="form-select form-select-solid"*/}
                    {/*    data-kt-select2="true"*/}
                    {/*    data-placeholder="Select option"*/}
                    {/*    data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">*/}
                    {/*    <option value={""}>-select department-</option>*/}
                    {/*    {props.departmentsList.length > 0 ?*/}
                    {/*        <>*/}
                    {/*            {props.departmentsList.map((x, y) => {*/}
                    {/*                return (*/}
                    {/*                    <option key={y} value={x.CourseCode}>{x.CourseName}</option>*/}
                    {/*                )*/}
                    {/*            })}*/}
                    {/*        </>*/}
                    {/*        : <></>}*/}

                    {/*</select>*/}
                </div>
                <div className="form-group mt-4">
                    <label htmlFor="CreditUnit">Credit Unit</label>
                    <input
                        type="text"
                        required
                        id={"CreditUnit"}
                        onChange={props.onEdit}
                        value={props.createModule.CreditUnit}
                        className={"form-control"}
                        placeholder={"Enter the Module Credit unit"}
                    />
                </div>
                <div className="form-group mt-4">
                    <label htmlFor="CAPerCon">CA per con</label>
                    <input
                        type="text"
                        required
                        id={"CAPerCon"}
                        onChange={props.onEdit}
                        value={props.createModule.CAPerCon}
                        className={"form-control"}
                        placeholder={"Enter C A per con"}
                    />
                </div>
                <div className="form-group mt-4">
                    <label htmlFor="ExamPerCon">ExamPerCon</label>
                    <input
                        type="text"
                        id={"ExamPerCon"}
                        onChange={props.onEdit}
                        value={props.createModule.ExamPerCon}
                        className={"form-control"}
                        placeholder={"Enter the exam per con"}
                    />
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
