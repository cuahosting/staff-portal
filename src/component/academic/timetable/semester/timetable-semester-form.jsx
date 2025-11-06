import React from "react";
import {formatDate} from "../../../../resources/constants";

export default function TimetableSemesterForm(props) {
    return (
        <>
            <div className="form-group mb-4">
                <label htmlFor="SemesterName">Semester Name</label>
                <input
                    type="text"
                    id={"SemesterName"}
                    onChange={props.onEdit}
                    value={props.data.SemesterName}
                    className={"form-control"}
                    placeholder={"Enter the Semester Name"}
                />
            </div>
            <div className="form-group mb-4">
                <label htmlFor="SemesterCode">Semester Code</label>
                <input
                    type="text"
                    id={"SemesterCode"}
                    onChange={props.onEdit}
                    value={props.data.SemesterCode}
                    className={"form-control"}
                    placeholder={"Enter the Semester Code"}
                />
            </div>
            <div className="row">
                <div className="form-group mb-4 col-md-6">
                    <label htmlFor="StartDate">Start Date</label>
                    <input
                        type="date"
                        id={"StartDate"}
                        onChange={props.onEdit}
                        value={formatDate(props.data.StartDate)}
                        className={"form-control"}
                    />
                </div>
                <div className="form-group mb-4 col-md-6">
                    <label htmlFor="EndDate">End Date </label>
                    <input
                        type="date"
                        id={"EndDate"}
                        onChange={props.onEdit}
                        value={formatDate(props.data.EndDate)}
                        className={"form-control"}
                    />
                </div>
            </div>
            <div className="form-group mb-4">
                <label htmlFor="Status"> Status </label>
                <select
                    id={"Status"}
                    onChange={props.onEdit}
                    value={props.data.Status}
                    className={"form-control"}
                >
                    <option>Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">In-Active</option>
                    <option value="future">Future</option>
                </select>
            </div>
            <div className="form-group mb-4">
                <label htmlFor="Description">Description</label>
                <input
                    type="text"
                    id={"Description"}
                    onChange={props.onEdit}
                    value={props.data.Description}
                    className={"form-control"}
                    placeholder={"Enter the Description"}
                />
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