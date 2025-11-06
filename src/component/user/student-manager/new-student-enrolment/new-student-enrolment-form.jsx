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
                        type="email"
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
                    <select
                        id={"Lga"}
                        onChange={props.onEdit}
                        value={props.data.Lga}
                        className={"form-control"}
                    >
                        <option>Select LGA</option>
                        {
                            props.lgaList.map((lga, index) => {
                                return <option key={index} value={lga}>{lga}</option>
                            })
                        }

                    </select>
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
                        <select
                            id={"StudentLevel"}
                            onChange={props.onEdit}
                            value={props.data.StudentLevel}
                            className={"form-control"}
                        >
                            <option>Select Student Level</option>
                            <option value="100">100</option>
                            <option value="200">200</option>
                            <option value="300">300</option>
                            <option value="400">400</option>
                            <option value="500">500</option>
                            <option value="600">600</option>
                            <option value="700">700</option>
                            <option value="800">800</option>
                            <option value="900">900</option>
                        </select>
                    </div>
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="StudentSemester">Student Semester</label>
                    <select
                        id={"StudentSemester"}
                        onChange={props.onEdit}
                        value={props.data.StudentSemester}
                        className={"form-control"}
                    >
                        <option value="">Select Semester</option>
                        <option value="First Semester">First Semester</option>
                        <option value="Second Semester">Second Semester</option>
                        <option value="Third Semester">Third Semester</option>
                    </select>
                </div>
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="ModeOfEntry">Mode Of Entry</label>
                    <select
                        id={"ModeOfEntry"}
                        onChange={props.onEdit}
                        value={props.data.ModeOfEntry}
                        className={"form-control"}
                    >
                        <option>Select Mode Of Entry</option>
                        <option value="UTME">UTME</option>
                        <option value="IJMB">IJMB</option>
                        <option value="Direct Entry">Direct Entry</option>
                        <option value="Transfer">Transfer</option>
                        <option value="Conditional">Conditional</option>
                        <option value="Foundation">Foundation</option>
                    </select>
                </div>
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="YearOfAdmission">Year Of Admission </label>
                    <select
                        id={"YearOfAdmission"}
                        onChange={props.onEdit}
                        value={props.data.YearOfAdmission}
                        className={"form-control"}
                    >
                        <option>Select Year Of Admission</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                        <option value="2019">2019</option>
                    </select>
                </div>
                <div className="form-group col-md-4 mb-4">
                    <label htmlFor="AdmissionSemester">Admission Semester</label>
                    <select
                        id={"AdmissionSemester"}
                        onChange={props.onEdit}
                        value={props.data.AdmissionSemester}
                        className={"form-control"}
                    >
                        <option>Select Admission Semester</option>
                        {
                            props.semesterList.length > 0 && props.semesterList.map((semester, index) => {
                                return <option key={index} value={semester.SemesterCode}>{semester.SemesterCode}</option>
                            })
                        }

                    </select>
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
                            value={props.data.JambAdmissionDeficiency}
                            onChange={props.onEdit}
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
                <div className="col-lg-4 col-md-6 pt-5">
                    <div className="form-check">
                        <label className="form-check-label" htmlFor="IsActive">
                            Is Active ?
                        </label>
                        <input
                            type="checkbox"
                            id="IsActive"
                            className="form-check-input"
                            value={props.data.IsActive}
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