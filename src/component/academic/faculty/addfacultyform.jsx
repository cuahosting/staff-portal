import React from "react";
import Select from "react-select";

export default function AddFacultyForm(props) {
    return (
        <>
            <div className="form-group mb-4">
                <label htmlFor="bank_name">Faculty Name</label>
                <input
                    type="text"
                    id={"FacultyName"}
                    onChange={props.onEdit}
                    value={props.data.FacultyName}
                    className={"form-control"}
                    placeholder={"Enter the Faculty Name"}
                />
            </div>
            <div className="form-group mb-4">
                <label htmlFor="bank_name">Faculty Code</label>
                <input
                    style={{textTransform:'uppercase'}} 
                    type="text"
                    id={"FacultyCode"}
                    disabled={props.data.IsEdit.toString() === "1"? true:false}
                    onChange={props.onEdit}
                    value={props.data.FacultyCode}
                    className={"form-control"}
                    placeholder={"Enter the Faculty Code"}
                />
            </div>
            <div className="row">
                <div className="form-group mb-4 col-md-12">
                    <label htmlFor="FacultyDean">Faculty Dean</label>
                    <Select
                        name="FacultyDean"
                        value={props.data.FacultyDean2}
                        onChange={props.onStaffChange}
                        options={props.staff}
                        placeholder="select Dean"
                    />
                </div>
                <div className="form-group mb-4 col-md-12">
                    <label htmlFor="bank_name">Deputy Dean</label>
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
                <div className="form-group mb-4 col-md-6">
                    <label htmlFor="bank_name">Is Academic</label>
                    <select
                        id={"IsAcademic"}
                        onChange={props.onEdit}
                        value={props.data.IsAcademic}
                        className={"form-control"}
                    >
                        <option value="1">Academic</option>
                        <option value="0">Non-Academic</option>
                    </select>
                </div>
                <div className="form-group mb-4 col-md-6">
                    <label htmlFor="bank_name">Is Award Degree</label>
                    <select
                        id={"IsAwardDegree"}
                        onChange={props.onEdit}
                        value={props.data.IsAwardDegree}
                        className={"form-control"}
                    >
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select>
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