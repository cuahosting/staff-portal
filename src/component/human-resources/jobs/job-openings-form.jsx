import React, { useEffect, useMemo } from "react";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import JoditEditor from "jodit-react";
import { formatDate } from "../../../resources/constants";
import SearchSelect from "../../common/select/SearchSelect";


const JobOpeningsForm = (props) => {
    const editorRef = React.createRef();

    useEffect(() => {

    }, [])
    const job = props.createJob

    const facultyOptions = useMemo(() => {
        return props.FacultyList.map(x => ({
            value: x.FacultyCode,
            label: x.FacultyName
        }));
    }, [props.FacultyList]);

    const departmentOptions = useMemo(() => {
        return props.DepartmentList.map(x => ({
            value: x.DepartmentCode,
            label: x.DepartmentName
        }));
    }, [props.DepartmentList]);

    const typeOptions = [
        { value: 'FullTime', label: 'Full Time' },
        { value: 'Casual', label: 'Casual' }
    ];

    const urgentOptions = [
        { value: '1', label: 'YES' },
        { value: '0', label: 'NO' }
    ];

    const statusOptions = [
        { value: '1', label: 'Open' },
        { value: '0', label: 'Close' }
    ];

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
                        <SearchSelect
                            id="Faculty"
                            value={facultyOptions.find(opt => opt.value === job.Faculty) || null}
                            options={facultyOptions}
                            onChange={(selected) => props.onEdit({ target: { id: 'Faculty', value: selected?.value || '' } })}
                            placeholder="-select Faculty-"
                            isClearable={false}
                        />
                    </div>
                </div>
                <div className="col-md-6 mt-4">
                    <div className="form-group">
                        <label htmlFor="Department">Department</label>
                        <SearchSelect
                            id="Department"
                            value={departmentOptions.find(opt => opt.value === job.Department) || null}
                            options={departmentOptions}
                            onChange={(selected) => props.onEdit({ target: { id: 'Department', value: selected?.value || '' } })}
                            placeholder="-select Department-"
                            isClearable={false}
                        />
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
                        <SearchSelect
                            id="Type"
                            value={typeOptions.find(opt => opt.value === job.Type) || null}
                            options={typeOptions}
                            onChange={(selected) => props.onEdit({ target: { id: 'Type', value: selected?.value || '' } })}
                            placeholder="-select Type-"
                            isClearable={false}
                        />
                    </div>
                </div>
                <div className="col-md-4 mt-4">
                    <div className="form-group">
                        <label htmlFor="Urgent">Is Urgent? </label>
                        <SearchSelect
                            id="Urgent"
                            value={urgentOptions.find(opt => opt.value === job.Urgent?.toString()) || null}
                            options={urgentOptions}
                            onChange={(selected) => props.onEdit({ target: { id: 'Urgent', value: selected?.value || '' } })}
                            placeholder="-select Is Urgent-"
                            isClearable={false}
                        />
                    </div>
                </div>
                <div className="col-md-4 mt-4">
                    <div className="form-group">
                        <label htmlFor="Status">Status </label>
                        <SearchSelect
                            id="Status"
                            value={statusOptions.find(opt => opt.value === job.Status?.toString()) || null}
                            options={statusOptions}
                            onChange={(selected) => props.onEdit({ target: { id: 'Status', value: selected?.value || '' } })}
                            placeholder="-select Status-"
                            isClearable={false}
                        />
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