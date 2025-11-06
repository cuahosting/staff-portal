import React from "react";
import {formatDate} from "../../../../resources/constants";

export default function NewStudentEnrolmentForm(props) {
    return (
        <>
            <h5>Basic Information</h5>
            <hr />
            <div className="row">
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="FirstName">First Name</label>
                    <input
                        type="text"
                        id="FirstName"
                        className="form-control"
                        placeholder="First Name"
                        onChange={props.onEdit}
                        value={props.data.FirstName}
                    />
                </div>
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="MiddleName">Middle Name</label>
                    <input
                        type="text"
                        id="MiddleName"
                        className="form-control"
                        placeholder="Middle Name"
                        onChange={props.onEdit}
                        value={props.data.MiddleName}
                    />
                </div>
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="Surname">Surname</label>
                    <input
                        type="text"
                        id="Surname"
                        className="form-control"
                        placeholder="Surname"
                        onChange={props.onEdit}
                        value={props.data.Surname}
                    />
                </div>
                <div className="form-group  col-md-4 mb-4">
                    <label htmlFor="Gender"> Gender</label>
                    <select
                        id={"Gender"}
                        onChange={props.onEdit}
                        value={props.data.Gender}
                        className={"form-control"}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="DateOfBirth">Date Of Birth</label>
                    <input
                        type="date"
                        id="DateOfBirth"
                        className="form-control"
                        placeholder="Date Of Birth"
                        onChange={props.onEdit}
                        value={formatDate(props.data.DateOfBirth)}
                    />
                </div>
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="PhoneNumber">Phone Number</label>
                    <input
                        type="number"
                        id="PhoneNumber"
                        className="form-control"
                        placeholder="Phone Number"
                        onChange={props.onEdit}
                        value={props.data.PhoneNumber}
                    />
                </div>
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="EmailAddress">EmailAddress</label>
                    <input
                        type="text"
                        id="EmailAddress"
                        className="form-control"
                        placeholder="Email Address"
                        onChange={props.onEdit}
                        value={props.data.EmailAddress}
                    />
                </div>
                <div className="form-group  col-md-4 mb-4">
                    <label htmlFor="Nationality">Nationality</label>
                    <select
                        id={"Nationality"}
                        onChange={props.onEdit}
                        value={props.data.Nationality}
                        className={"form-control"}
                    >
                        <option value="">Select Nationality</option>
                        {
                            props.nationalityList.map((country, index) => {
                                return <option key={index} value={country}>{country}</option>
                            })
                        }

                    </select>
                </div>
                <div className="form-group  col-md-4 mb-4">
                    <label htmlFor="StateOfOrigin">State Of Origin</label>
                    <select
                        id={"StateOfOrigin"}
                        onChange={props.onEdit}
                        value={props.data.StateOfOrigin}
                        className={"form-control"}
                    >
                        <option>Select State</option>
                        {
                            props.stateList.map((state, index) => {
                                return <option key={index} value={state}>{state}</option>
                            })
                        }

                    </select>
                </div>
                <div className="form-group  col-md-4 mb-4">
                    <label htmlFor="Lga">LGA</label>
                    <input
                        type="Lga"
                        id="Lga"
                        className="form-control"
                        placeholder="LGA"
                        onChange={props.onEdit}
                        value={props.data.Lga}
                    />
                </div>
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="Address">Address</label>
                    <input
                        type="text"
                        id="Address"
                        className="form-control"
                        placeholder="Address"
                        onChange={props.onEdit}
                        value={props.data.Address}
                    />
                </div>
                <div className="form-group mb-5 mt-5">
                    <h5>Program Details</h5>
                    <hr />
                </div>
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="CourseCode">Course </label>
                    <select
                        id={"CourseCode"}
                        onChange={props.onEdit}
                        value={props.data.CourseCode}
                        className={"form-control"}
                        disabled
                    >
                        <option>Select Course</option>
                        {
                            props.courseList.length > 0 && props.courseList.map((course, index) => {
                                return <option key={index} value={course.CourseCode}>{course.CourseName}</option>
                            })
                        }

                    </select>
                </div>
                    <div className="form-group mb-4 col-md-4">
                        <label htmlFor="StudentLevel">Student Level</label>
                        <input
                            type="StudentLevel"
                            id="StudentLevel"
                            className="form-control"
                            placeholder="Student Level"
                            onChange={props.onEdit}
                            value={props.data.StudentLevel}
                            readOnly
                        />
                    </div>
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="StudentSemester">Student Semester</label>
                    <input
                        type="StudentSemester"
                        id="StudentSemester"
                        className="form-control"
                        placeholder="Student Semester"
                        onChange={props.onEdit}
                        value={props.data.StudentSemester}
                        readOnly
                    />
                </div>
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="ModeOfEntry">Mode Of Entry</label>
                    <input
                        type="ModeOfEntry"
                        id="ModeOfEntry"
                        className="form-control"
                        placeholder="Mode Of Entry"
                        onChange={props.onEdit}
                        value={props.data.ModeOfEntry}
                        readOnly
                    />
                </div>
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="AdmissionSemester">Admission Semester</label>
                    <input
                        type="AdmissionSemester"
                        id="AdmissionSemester"
                        className="form-control"
                        placeholder="Admission Semester"
                        onChange={props.onEdit}
                        value={props.data.AdmissionSemester}
                        readOnly
                    />
                </div>
            </div>
            {
                props.parentData.length > 0 ?
                    <div className={"row"}>
                        <div className="form-group mb-5 mt-5">
                            <h5>Guardian Details</h5>
                            <hr />
                        </div>
                        <div className="form-group col-md-4 mb-4">
                            <label htmlFor="ParentName">Parent Name</label>
                            <input
                                type="text"
                                id="ParentName"
                                className="form-control"
                                placeholder="Parent Name"
                                onChange={props.onEdit}
                                value={props.data.ParentName}
                            />
                        </div>
                        <div className="form-group col-md-4 mb-4">
                            <label htmlFor="ParentPhoneNumber">Parent Phone Number</label>
                            <input
                                type="number"
                                id="ParentPhoneNumber"
                                className="form-control"
                                placeholder="ParentPhoneNumber"
                                onChange={props.onEdit}
                                value={props.data.ParentPhoneNumber}
                            />
                        </div>
                        <div className="form-group col-md-4 mb-4">
                            <label htmlFor="ParentAddress">Parent Address</label>
                            <input
                                type="text"
                                id="ParentAddress"
                                className="form-control"
                                placeholder="ParentAddress"
                                onChange={props.onEdit}
                                value={props.data.ParentAddress}
                            />
                        </div>
                    </div> : ""
            }
            <div className={"row"}>
                <div className="form-group mb-5 mt-5">
                    <h5>Application Status</h5>
                    <hr />
                </div>
                <div className="col-lg-4 col-md-6 pt-5">
                    <div className="form-check">
                        <label className="form-check-label" htmlFor="JambAdmissionDeficiency">
                            Jamb Admission Deficiency ?
                        </label>
                        <input
                            type="checkbox"
                            id="JambAdmissionDeficiency"
                            className="form-check-input"
                            key={props.data.JambAdmissionDeficiency}
                            value={props.data.JambAdmissionDeficiency}
                            onChange={props.onEdit}
                            checked={props.data.JambAdmissionDeficiency !== '0'}
                        />
                    </div>
                </div>

                <div className="col-lg-4 col-md-6 pt-5">
                    <div className="form-check">
                        <label className="form-check-label" htmlFor="MedicalCertificateOfFitness">
                            Medical Certificate Of Fitness ?
                        </label>
                        <input
                            type="checkbox"
                            id="MedicalCertificateOfFitness"
                            className="form-check-input"
                            value={props.data.MedicalCertificateOfFitness}
                            onChange={props.onEdit}
                        />
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 pt-5">
                    <div className="form-check">
                        <label className="form-check-label" htmlFor="GuarantorLetter">
                            Guarantor Letter ?
                        </label>
                        <input
                            type="checkbox"
                            id="GuarantorLetter"
                            className="form-check-input"
                            value={props.data.GuarantorLetter}
                            onChange={props.onEdit}
                        />
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 pt-5">
                    <div className="form-check">
                        <label className="form-check-label" htmlFor="CompletePassport">
                            Complete Passport ?
                        </label>
                        <input
                            type="checkbox"
                            id="CompletePassport"
                            className="form-check-input"
                            value={props.data.CompletePassport}
                            onChange={props.onEdit}
                        />
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 pt-5">
                    <div className="form-check">
                        <label className="form-check-label" htmlFor="OlevelDeficiency">
                            O-level Deficiency ?
                        </label>
                        <input
                            type="checkbox"
                            id="OlevelDeficiency"
                            className="form-check-input"
                            value={props.data.OlevelDeficiency}
                            onChange={props.onEdit}
                        />
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 pt-5">
                    <div className="form-check">
                        <label className="form-check-label" htmlFor="IsTransfered">
                            Is Transfered ?
                        </label>
                        <input
                            type="checkbox"
                            id="IsTransfered"
                            className="form-check-input"
                            value={props.data.IsTransfered}
                            onChange={props.onEdit}
                        />
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 pt-5">
                    <div className="form-check">
                        <label className="form-check-label" htmlFor="IsHostelRequired">
                            Is Hostel Required ?
                        </label>
                        <input
                            type="checkbox"
                            id="IsHostelRequired"
                            className="form-check-input"
                            value={props.data.IsHostelRequired === 'Yes' ? 1 : 0}
                            onChange={props.onEdit}
                        />
                    </div>
                </div>
            </div>
            <div className="form-group col-md-4 offset-sm-4 pt-4">
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