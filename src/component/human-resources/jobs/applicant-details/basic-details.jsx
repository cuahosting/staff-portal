import JoditEditor from "jodit-react";
import React from "react";
import Modal from "../../../common/modal/modal";
import { serverLink } from "../../../../resources/url";
import { Link } from "react-router-dom";
import * as DOMPurify from 'dompurify';
import { projectURL, shortCode } from "../../../../resources/constants";


const BasicApplicantDetails = (props) =>
{
    const editorRef = React.createRef();

    const applicant = props.applicant
    const makeDecisionButton = applicant.Status === "0" ? false : applicant.Status === "1" ? false : true

    const color = applicant.Status === "0" ? 'primary'
        : applicant.Status === "1" ? 'info'
            : applicant.Status === "2" ? 'danger'
                : 'success'
    const text = applicant.Status === "0" ? 'Applicant is awaiting your decision '
        : applicant.Status === "1" ? 'Applicant invited for interview'
            : applicant.Status === "2" ? 'Applicant Rejected'
                : 'Application Accepted'

    const fname = applicant.FirstName !== "" ? applicant.FirstName : ""
    const mname = applicant.MiddleName !== "" ? applicant.MiddleName : ""
    const sname = applicant.Surname !== "" ? applicant.Surname : ""

    const cvUrl = applicant.CurriculumVitae !== null
        ? applicant.CurriculumVitae.includes("simplefileupload")
            ? applicant.CurriculumVitae
            : `${serverLink}public/uploads/${shortCode}/job_application/cv/${applicant.CurriculumVitae}`
        : "";

    const openPdfInNewWindow = () => {
        if (cvUrl) {
            window.open(cvUrl, '_blank', 'width=1200,height=800');
        }
    }

    return (
        <div className="col-md-12">
            <div className="card mb-5 mb-xl-10">
                <div className="card-body pt-9 pb-0">
                    <div className={`d-flex justify-content-end p-6`}>
                        <div className="d-flex flex-stack">
                            <Link className='' style={{ float: 'right' }} to='/human-resources/jobs/applications'>View Other Applications</Link>
                        </div>
                    </div>
                    <div className={`notice d-flex bg-light-${color} rounded border-${color} border border-dashed p-6`}>
                        <div className="d-flex flex-stack flex-grow-1">
                            <div className="fw-bold">
                                <h4 className="text-gray-900 fw-bolder">Application Status</h4>
                                <div className="fs-6 text-gray-700">{text}</div>
                            </div>
                        </div>
                    </div>
                    <br />
                    {/*begin::Details*/}
                    <div className="d-flex flex-wrap flex-sm-nowrap mb-3">
                        <div className="flex-grow-1">

                            <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                                <div className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="text-gray-900 text-hover-primary fs-2 fw-bolder me-1">
                                            {fname + " " + mname + " " + sname}
                                        </span>
                                    </div>
                                    <div className="d-flex flex-wrap fw-bold fs-6 mb-4 pe-2">
                                        <span className="d-flex align-items-center text-gray-400 text-hover-primary me-5 mb-2">
                                            <span className="svg-icon svg-icon-4 me-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"> <path opacity="0.3" d="M10,2h0V1.5a.5.5,0,0,0-1,0V2H5A1,1,0,0,0,4,3V13a1,1,0,0,0,1,1h5a1,1,0,0,0,1-1V3A1,1,0,0,0,10,2ZM6,13H5V12H6Zm0-2H5V10H6ZM6,9H5V8H6Zm2,4H7V12H8Zm0-2H7V10H8ZM8,9H7V8H8Zm2,4H9V12h1Zm0-2H9V10h1Zm0-2H9V8h1Zm0-2.5a.5.5,0,0,1-.5.5h-4A.5.5,0,0,1,5,6.5v-3A.5.5,0,0,1,5.5,3h4a.5.5,0,0,1,.5.5Z" />
                                                </svg>
                                            </span>
                                            {applicant.PhoneNumber}</span>
                                        <span className="d-flex align-items-center text-gray-400 text-hover-primary mb-2">
                                            <span className="svg-icon svg-icon-4 me-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
                                                    <path opacity="0.3" d="M21 19H3C2.4 19 2 18.6 2 18V6C2 5.4 2.4 5 3 5H21C21.6 5 22 5.4 22 6V18C22 18.6 21.6 19 21 19Z" fill="currentColor" />
                                                    <path d="M21 5H2.99999C2.69999 5 2.49999 5.10005 2.29999 5.30005L11.2 13.3C11.7 13.7 12.4 13.7 12.8 13.3L21.7 5.30005C21.5 5.10005 21.3 5 21 5Z" fill="currentColor" />
                                                </svg>
                                            </span>
                                            {applicant.EmailAddress}</span>
                                    </div>
                                </div>
                                <div className="d-flex my-4">
                                    <div
                                        className="d-flex justify-content-end"
                                        data-kt-customer-table-toolbar="base">
                                        <button
                                            disabled={makeDecisionButton}
                                            type="button"
                                            className="btn btn-primary"
                                            data-bs-toggle="modal"
                                            data-bs-target="#applicant">
                                            Make Decision
                                        </button>
                                        <a
                                            style={{ pointerEvents: color === 'success' ? "" : "none" }}
                                            type="button"
                                            target="_blank"
                                            className="btn btn-primary ms-5"
                                            href={`${projectURL}/enrol/${applicant.ApplicationID}`}
                                        >
                                            Enrol Staff
                                        </a>

                                        <Modal title={"Manage Applicant"} large={true} style={{ width: '400px' }} id={"applicant"} close={"applicant"} >
                                            <select id="Status" onChange={props.onEdit}
                                                className="form-select form-select-solid"
                                                data-kt-select2="true"
                                                data-placeholder="Select option"
                                                data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">
                                                <option value={""}>-select Status-</option>
                                                <option value={"1"} >Invite for Interview</option>
                                                <option value={"2"} className="text-danger">Reject Applicant</option>
                                                <option value={"3"} className="text-success">Accept Applicant</option>

                                            </select>
                                            <br />
                                            <div className="form-group">
                                                <label htmlFor="CoverLetter">Email Template</label>
                                                <JoditEditor
                                                    ref={editorRef}
                                                    value={props.mail.EmailBody}
                                                    onChange={props.onEmailTemplateChange}
                                                    tabIndex={1}
                                                />
                                            </div>
                                            <br />
                                            <div className="form-group">
                                                <button type="button" className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={props.isFormLoading} onClick={props.onSubmit}>
                                                    <span className="indicator-label">Confirm Decision</span>
                                                    <span className="indicator-progress">Please wait...
                                                        <span className="spinner-border spinner-border-sm align-middle ms-2" />
                                                    </span>
                                                </button>
                                            </div>
                                        </Modal>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex flex-wrap flex-stack">
                                <div className="d-flex flex-column flex-grow-1 pe-8">
                                    <div className="d-flex flex-wrap">
                                        <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                            <div className="fw-bold fs-6 text-gray-400">Position</div>
                                            <div className="d-flex align-items-center">
                                                <div className="fs-2 fw-bolder">{applicant.Position}</div>
                                            </div>
                                        </div>
                                        <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                            <div className="fw-bold fs-6 text-gray-400">Department</div>
                                            <div className="d-flex align-items-center">
                                                <div className="fs-2 fw-bolder">{
                                                    props.departmentList?.filter(
                                                        x => x.DepartmentCode.toLowerCase() === applicant.Department.toLowerCase())[0]?.DepartmentName
                                                }</div>
                                            </div>
                                        </div>
                                        <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                            <div className="fw-bold fs-6 text-gray-400">Faculty</div>
                                            <div className="d-flex align-items-center">
                                                <div className="fs-2 fw-bolder">{
                                                    props.facultyList?.filter(x => x.FacultyCode.toLowerCase() === applicant.Faculty.toLowerCase())[0]?.FacultyName
                                                }</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>



                </div>
            </div>
            <div className="col-md-12">
                <div className="card mb-5 mb-xl-10" id="kt_profile_details_view">
                    <div className="card-header cursor-pointer">
                        <div className="card-title m-0">
                            <h3 className="fw-bolder m-0">Cover Letter</h3>
                        </div>
                    </div>
                    <div className="card-body p-9">
                        <div className="row mb-7">
                            <div className="col-lg-12">
                                <span className="fw-bolder fs-6 text-gray-800" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(applicant.CoverLetter) }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="card mb-5 mb-xl-10" id="kt_profile_details_view">
                    <div className="card-header">
                        <div className="card-title m-0">
                            <div className="d-flex justify-content-between">
                                <h3 className="fw-bolder m-0">Curriculum Vitae</h3>
                            </div>

                        </div>
                    </div>
                    <div className="card-body p-9">
                        <div className="row col-md-12 mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <a target="_blank" rel="noreferrer" href={cvUrl} className="btn btn-primary">
                                    <i className="fa fa-external-link me-2"></i>
                                    Open CV in New Tab
                                </a>
                                <button onClick={openPdfInNewWindow} className="btn btn-secondary">
                                    <i className="fa fa-window-maximize me-2"></i>
                                    Open CV in Popup Window
                                </button>
                            </div>
                        </div>
                        <div className="row col-md-12 mb-7">
                            <div className="col-md-12">
                                <div className="d-flex justify-content-center" style={{ width: '100%', height: '800px', borderStyle: 'groove', borderWidth: '3px', borderRadius: '5px' }}>
                                    {cvUrl ? (
                                        <iframe
                                            src={cvUrl}
                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                            title="Curriculum Vitae"
                                        />
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-center text-muted">
                                            <p>No CV available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default BasicApplicantDetails;