import React, { useEffect, useState } from "react";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import JoditEditor from "jodit-react";
import { formatDate } from "../../../resources/constants";


const JobOpeningsForm = (props) => {
    const editorRef = React.createRef();

    useEffect(() => {

    }, [])
    const job = props.createJob

    //const { editorState } = editorState;
    return (
        <form >
            <div className="row col-md-12">
                <div className="col-md-12">
                    <div className="form-group">
                        <label htmlFor="Position">Position</label>
                        <input
                            type="text"
                            id={"Position"}
                            onChange={props.onEdit}
                            value={job.Position}
                            className={"form-control"}
                            placeholder={"Enter position"}
                        />
                    </div>
                </div>
                <div className="col-md-6 mt-4">
                    <div className="form-group">
                        <label htmlFor="Faculty">Faculty</label>
                        <select id="Faculty" onChange={props.onEdit}
                            value={job.Faculty}
                            className="form-select form-select-solid"
                            data-kt-select2="true"
                            data-placeholder="Select option"
                            data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">
                            <option value={""}>-select Faculty-</option>
                            {props.FacultyList.length > 0 ?
                                <>
                                    {props.FacultyList.map((x, y) => {
                                        return (
                                            <option key={y} value={x.FacultyCode}>{x.FacultyName}</option>
                                        )
                                    })}
                                </>
                                :
                                <></>}
                        </select>
                    </div>
                </div>
                <div className="col-md-6 mt-4">
                    <div className="form-group">
                        <label htmlFor="Department">Department</label>
                        <select id="Department" onChange={props.onEdit}
                            value={job.Department}
                            className="form-select form-select-solid"
                            data-kt-select2="true"
                            data-placeholder="Select option"
                            data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">
                            <option value={""}>-select Department-</option>
                            {props.DepartmentList.length > 0 ?
                                <>
                                    {props.DepartmentList.map((x, y) => {
                                        return (
                                            <option key={y} value={x.DepartmentCode}>{x.DepartmentName}</option>
                                        )
                                    })}
                                </>
                                :
                                <></>}
                        </select>
                    </div>
                </div>
                <div className="col-md-6 mt-4">
                    <div className="form-group">
                        <label htmlFor="OpeningDate">Opening Date</label>
                        <input
                            type="date"
                            id={"OpeningDate"}
                            onChange={props.onEdit}
                            value={formatDate(job.OpeningDate)}
                            className={"form-control"}
                        />
                    </div>
                </div>
                <div className="col-md-6 mt-4">
                    <div className="form-group">
                        <label htmlFor="ClosingDate">Closing Date</label>
                        <input
                            type="date"
                            id={"ClosingDate"}
                            onChange={props.onEdit}
                            value={formatDate(job.ClosingDate)}
                            className={"form-control"}
                        />
                    </div>
                </div>
                <div className="col-md-4 mt-4">
                    <div className="form-group">
                        <label htmlFor="Type">Job Type</label>
                        <select id="Type" onChange={props.onEdit}
                            value={job.Type}
                            className="form-select form-select-solid"
                            data-kt-select2="true"
                            data-placeholder="Select option"
                            data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">
                            <option value={""}>-select Type-</option>
                            <option value={"FullTime"}>Full Time</option>
                            <option value={"Casual"}>Casual</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-4 mt-4">
                    <div className="form-group">
                        <label htmlFor="Urgent">Is Urgent? </label>
                        <select id="Urgent" onChange={props.onEdit}
                            value={job.Urgent}
                            className="form-select form-select-solid"
                            data-kt-select2="true"
                            data-placeholder="Select option"
                            data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">
                            <option value={""}>-select Is Urgent-</option>
                            <option value={"1"}>YES</option>
                            <option value={"0"}>NO</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-4 mt-4">
                    <div className="form-group">
                        <label htmlFor="Status">Status </label>
                        <select id="Status" onChange={props.onEdit}
                            value={job.Status}
                            className="form-select form-select-solid"
                            data-kt-select2="true"
                            data-placeholder="Select option"
                            data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">
                            <option value={""}>-select Status-</option>
                            <option value={"1"}>Open</option>
                            <option value={"0"}>Close</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-12">
                    <div className="form-group">
                        <label htmlFor="">Job Description</label>
                        <JoditEditor
                            value={job.Description}
                            ref={editorRef}
                            tabIndex={1}
                            onChange={props.onDescriptionChange}
                        />
                    </div>
                </div>
                <div className="col-md-12">
                    <div className="form-group">
                        <label htmlFor="">Job Requirements</label>
                        <JoditEditor
                            value={job.Requirements}
                            ref={editorRef}
                            tabIndex={1}
                            onChange={props.onRequiremnetChange}
                        />
                    </div>
                </div>
                <div className="col-md-4 mt-4">
                    <div className="form-group">
                        <label htmlFor="InterviewDate">Interview Date</label>
                        <input
                            type="date"
                            id={"InterviewDate"}
                            onChange={props.onEdit}
                            value={formatDate(job.InterviewDate)}
                            className={"form-control"}
                            placeholder={"Enter Interview Date"}
                        />
                    </div>
                </div>
                <div className="col-md-4 mt-4">
                    <div className="form-group">
                        <label htmlFor="InterviewTime">Interview Time</label>
                        <input
                            type="time"
                            id={"InterviewTime"}
                            onChange={props.onEdit}
                            value={job.InterviewTime}
                            className={"form-control"}
                        />
                    </div>
                </div>
                <div className="col-md-4 mt-4">
                    <div className="form-group">
                        <label htmlFor="InterviewVenue">Interview Venue</label>
                        <input
                            type="text"
                            id={"InterviewVenue"}
                            onChange={props.onEdit}
                            value={job.InterviewVenue}
                            className={"form-control"}
                            placeholder={"Interview Venue"}
                        />
                    </div>
                </div>

                <div className="form-group pt-2 mt-4">
                    <button type="button" onClick={props.onSubmit} className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={props.isFormLoading}>
                        <span className="indicator-label">Submit</span>
                        <span className="indicator-progress">Please wait...
                            <span className="spinner-border spinner-border-sm align-middle ms-2" />
                        </span>
                    </button>
                </div>
            </div>
        </form>
    )
}

export default JobOpeningsForm;