import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { projectName, serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import NewStudentEnrolmentForm from "./new-student-enrolment-form";
import StateData from "../../../../resources/state_and_lga.json"
import CountryData from "../../../../resources/country.json"
import {
    decryptData,
    encryptData, projectCode,
    projectDomain,
    projectFacebook,
    projectStudentURL,
    projectTwitter,
    projectURL,
    projectYoutube,
    sendEmail,
    shortCode
} from "../../../../resources/constants";
import { formatDate } from "../../../../resources/constants";
function NewStudentEnrolment(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [parentData, setParentData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [courseList, setCourseList] = useState([]);
    let [stateList, setStateList] = useState([]);
    let [lgaList, setLgaList] = useState([]);

    const [formData, setFormData] = useState({
        FirstName: "",
        MiddleName: "",
        Surname: "",
        Gender: "",
        EmailAddress: "",
        PhoneNumber: "",
        Address: "",
        StateOfOrigin: "",
        Lga: "",
        Nationality: "",
        DateOfBirth: "",
        CourseCode: "",
        FacultyCode: "",
        StudentLevel: "",
        StudentSemester: "",
        ApplicationID: "",
        ModeOfEntry: "",
        YearOfAdmission: new Date().getFullYear().toString(),
        JambAdmissionDeficiency: "0",
        MedicalCertificateOfFitness: "0",
        GuarantorLetter: "0",
        CompletePassport: "0",
        OlevelDeficiency: "0",
        IsActive: "1",
        Status: "active",
        ParentName: "",
        ParentPhoneNumber: "",
        ParentAddress: "",
        AdmissionSemester: "",
        GraduationSemester: "",
        GraduationDate: "",
        IsTransfered: "0",
        IsHostelRequired: "0",
        CertificateNo: "",
        StudentID: "",
        SchoolDomain: projectDomain,
        shortCode: shortCode,
        Password: `${encryptData('123456789')}`,
        InsertedBy: `${props.loginData[0].StaffID}`
    });

    const stateData = () => {
        StateData.map((state) => {
            if (state.state !== 'Non-Nigerian')
                setStateList(stateList => [...stateList, state.state])
        });
    }


    const getData = async () => {
        setIsLoading(true)
        setShowForm(false)
        if (formData.ApplicationID.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the applicationID", "error");
            return false;
        }

        await axios.get(`${serverLink}staff/student-manager/application/details/${formData.ApplicationID}`, token)
            .then((result) => {
                if (result.data.appData.length > 0) {
                    let data = result.data.appData;
                    let guardianData = result.data.guardianData;
                    let courseData = result.data.courseData;
                    let semesterData = result.data.semesterData;

                    setParentData(guardianData)
                    setCourseList(courseData)
                    setSemesterList(semesterData)
                    setFormData({
                        ...formData,
                        FirstName: data[0].FirstName,
                        MiddleName: data[0].MiddleName,
                        Surname: data[0].Surname,
                        Gender: data[0].Gender,
                        EmailAddress: data[0].EmailAddress.toString(),
                        PhoneNumber: data[0].PhoneNumber,
                        Address: data[0].Address,
                        StateOfOrigin: data[0].StateOfOrigin,
                        Lga: data[0].LGA,
                        Nationality: data[0].Nationality,
                        DateOfBirth: formatDate(data[0].DateOfBirth),
                        CourseCode: data[0].CourseCode,
                        FacultyCode: data[0].FacultyCode,
                        StudentLevel: data[0].DecisionLevel,
                        StudentSemester: data[0].DecisionSemester,
                        ApplicationID: data[0].ApplicationID,
                        ModeOfEntry: data[0].DecisionType,
                        ParentName: guardianData.length > 0 ? `${guardianData[0].FirstName} ${guardianData[0].MiddleName} ${guardianData[0].Surname}` : "",
                        ParentPhoneNumber: guardianData.length > 0 ? guardianData[0].PhoneNumber : "",
                        ParentAddress: guardianData.length > 0 ? guardianData[0].Address : "",
                        AdmissionSemester: data[0].AdmissionSemester,
                        Status: "active",
                        IsHostelRequired: data[0].IsHostelRequired === 'Yes' ? "1" : "0",
                        JambAdmissionDeficiency: "0",
                        MedicalCertificateOfFitness: "0",
                        GuarantorLetter: "0",
                        CompletePassport: "0",
                        OlevelDeficiency: "0",
                        IsTransfered: "0",
                    })

                    setShowForm(true)
                } else {
                    showAlert(
                        "NOT FOUND",
                        "Student record not found. Please try again!",
                        "error"
                    );
                    setIsLoading(false);
                    return false;
                }
                setIsLoading(false);
            }).catch((err) => {
                console.log("NETWORK ERROR");
            });
    }


    const onEdit = (e) => {
        let value = e.target.value;
        if (e.target.id === 'JambAdmissionDeficiency') {
            value === "1" ? value = "0" : value = "1";
        }
        if (e.target.id === 'MedicalCertificateOfFitness') {
            value === "1" ? value = "0" : value = "1";
        }
        if (e.target.id === 'GuarantorLetter') {
            value === "1" ? value = "0" : value = "1";
        }
        if (e.target.id === 'CompletePassport') {
            value === "1" ? value = "0" : value = "1";
        }
        if (e.target.id === 'OlevelDeficiency') {
            value === "1" ? value = "0" : value = "1";
        }
        if (e.target.id === 'IsTransfered') {
            value === "1" ? value = "0" : value = "1";
        }
        if (e.target.id === 'IsHostelRequired') {
            value === "1" ? value = "0" : value = "1";
        }

        if (e.target.id === 'Nationality') {
            setStateList([])
            if (e.target.value === 'Nigeria') {
                stateData()
            } else {
                StateData.map(state => {
                    if (state.state === 'Non-Nigerian')
                        setStateList(stateList => [...stateList, state.state])
                });
            }
        }

        setFormData({
            ...formData,
            [e.target.id]: value,
        });
    };

    const onSubmit = async () => {

        for (let key in formData) {
            if (
                formData.hasOwnProperty(key) &&
                key !== "MiddleName" &&
                key !== "ParentName" &&
                key !== "ParentPhoneNumber" &&
                key !== "ParentAddress" &&
                key !== "GraduationSemester" &&
                key !== "GraduationDate" &&
                key !== "CertificateNo" &&
                key !== "StudentID"
            ) {
                if (formData[key] === "") {
                    await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
                    return false;
                }
            }

        }

        setIsFormLoading('on')

        let url = "";
        let admission_year = formData.AdmissionSemester.substr(0, 2);
        let course_code = formData.CourseCode;
        if (projectCode === "ALANSAR_UNIVERSITY_STAFF_PORTAL") {
            url = `al-ansar/get-last-student-id/${course_code}/${admission_year}`;
        }else if (projectCode === "COSMOPOLITAN_UNIVERSITY_STAFF_PORTAL") {
            url = `cu/get-last-student-id`;
        } else {
            url = "get-last-student-id";
        }

        await axios.get(`${serverLink}staff/student-manager/${url}`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let last_student_id = result.data[0].StudentID;
                    let indexOfId = 0;
                    if (projectCode === "COSMOPOLITAN_UNIVERSITY_STAFF_PORTAL") {
                        indexOfId = last_student_id.split('-')[last_student_id.split('-').length - 1];
                    }else{
                        indexOfId = last_student_id.split('/')[last_student_id.split('/').length - 1];
                    }
                    let lastIndex = Number(indexOfId) + 1;

                    let padStudentID = "";
                    let new_student_id = "";
                    if (projectCode === "ALANSAR_UNIVERSITY_STAFF_PORTAL") {
                        padStudentID = (lastIndex, places) => String(lastIndex).padStart(places, "0");
                        new_student_id = `${formData.FacultyCode}/${formData.CourseCode}/${admission_year}/${padStudentID(lastIndex, 3)}`
                    }else if (projectCode === "COSMOPOLITAN_UNIVERSITY_STAFF_PORTAL") {
                        padStudentID = (lastIndex, places) => String(lastIndex).padStart(places, "0");
                        new_student_id = `${formData.AdmissionSemester}-${formData.FacultyCode}-${formData.CourseCode}-${padStudentID(lastIndex, 4)}`
                    } else {
                        padStudentID = (lastIndex, places) => String(lastIndex).padStart(places, "0");
                        new_student_id = `${shortCode === "BAUK" ? "BAU" : shortCode}/${formData.FacultyCode}/${formData.AdmissionSemester}/${padStudentID(lastIndex, 4)}`
                    }

                    let sendData = { ...formData, StudentID: new_student_id }

                    axios.post(`${serverLink}staff/student-manager/enrolment`, sendData, token)
                        .then((result) => {
                            if (result.data.message === "success") {
                                const data = result.data.StudentData;
                                sendEmail(
                                    `${formData.EmailAddress}`,
                                    `IT Services Department`,
                                    "Student IT Accounts",
                                    `${formData.FirstName} ${formData.MiddleName} ${formData.Surname}`,
                                    `
                                     <p>Student ID: <b>${sendData.StudentID}</b></p>
                                    <p>Student Name: <b>${formData.FirstName} ${formData.MiddleName} ${formData.Surname}</b></p>
                                    <p>Email Address: <b>${data.StudentEmail} </b></p>
                                    <p>Course: <b>${formData.CourseCode} </b></p>
                                    <p>Level: <b>${formData.StudentLevel} </b></p>
                                    <p>Semester: <b>${formData.StudentSemester} </b></p>
                                    
                                    <h3 style="padding-top: 20px"><strong>Student Portal (Results, Registration, Timetable, etc.)</strong></h3>
                                    <p>
                                        <ul>
                                            <li>URL: ${projectStudentURL}</li>
                                            <li>Username: ${data.Username}</li>
                                            <li>Password: ${decryptData(formData.Password)}</li>
                                        </ul>
                                    </p>
                                      <p>*If you have forgotten or do not have your user login details, kindly go to IT Services Desk and get a new one or have your Student Portal Account reset. </p>
                                       <h3 style="padding-top: 20px"><strong>Helpful Links</strong></h3>
                                    <p>Website: ${projectURL}</p>
                                    <p>Twitter: ${projectTwitter}</p>
                                    <p>Facebook: ${projectFacebook}</p>
                                    <p>Youtube: ${projectYoutube}</p>      
                                      `,
                                    `Regards,<br/>Admissions Officer<br/>${projectName}`
                                );
                                toast.success("Student Enrolled Successfully");
                                setIsFormLoading('off')
                            } else if (result.data.message === "exist") {
                                setIsFormLoading('off')
                                showAlert(
                                    "ERROR",
                                    "This student has already been enrolled!",
                                    "error"
                                );
                            } else {
                                setIsFormLoading('off')
                                showAlert(
                                    "ERROR",
                                    "Something went wrong. Please try again!",
                                    "error"
                                );
                            }
                        })
                        .catch((error) => {
                            setIsFormLoading('off')
                            showAlert(
                                "NETWORK ERROR",
                                "Please check your connection and try again!",
                                "error"
                            );
                        });
                } else {

                    let lastIndex = 1;
                    let padStudentID = "";
                    let new_student_id = "";
                    if (projectCode === "ALANSAR_UNIVERSITY_STAFF_PORTAL") {
                        padStudentID = (lastIndex, places) => String(lastIndex).padStart(places, "0");
                        new_student_id = `${formData.FacultyCode}/${formData.CourseCode}/${admission_year}/${padStudentID(lastIndex, 3)}`
                    }else if (projectCode === "COSMOPOLITAN_UNIVERSITY_STAFF_PORTAL") {
                        padStudentID = (lastIndex, places) => String(lastIndex).padStart(places, "0");
                        new_student_id = `${formData.AdmissionSemester}-${formData.FacultyCode}-${formData.CourseCode}-${padStudentID(lastIndex, 4)}`
                    } else {
                        padStudentID = (lastIndex, places) => String(lastIndex).padStart(places, "0");
                        new_student_id = `${shortCode === "BAUK" ? "BAU" : shortCode}/${formData.FacultyCode}/${formData.AdmissionSemester}/${padStudentID(lastIndex, 4)}`
                    }
                    let sendData = { ...formData, StudentID: new_student_id }

                    axios.post(`${serverLink}staff/student-manager/enrolment`, sendData, token)
                        .then((result) => {
                            if (result.data.message === "success") {
                                const data = result.data.StudentData;
                                sendEmail(
                                    `${formData.EmailAddress} `,
                                    `IT Services Department`,
                                    "Student IT Accounts",
                                    `${formData.FirstName} ${formData.MiddleName} ${formData.Surname}`,
                                    `
                                     <p>Student ID: <b>${sendData.StudentID}</b></p>
                                    <p>Student Name: <b>${formData.FirstName} ${formData.MiddleName} ${formData.Surname}</b></p>
                                    <p>Email Address: <b>${data.StudentEmail} </b></p>
                                    <p>Course: <b>${formData.CourseCode} </b></p>
                                    <p>Level: <b>${formData.StudentLevel} </b></p>
                                    <p>Semester: <b>${formData.StudentSemester} </b></p>
                                    
                                    
                                    <h3 style="padding-top: 20px"><strong>Student Portal (Results, Registration, Timetable, etc.)</strong></h3>
                                    <p>
                                        <ul>
                                            <li>URL: ${projectStudentURL}</li>
                                            <li>Username: ${data.Username}</li>
                                            <li>Password: ${decryptData(formData.Password)}</li>
                                        </ul>
                                    </p>
                                    <p>
                                        Login to your portal for course registration<br/>
                                        Navigate to Student Registration => New Student Registration <br/>
                                        Select courses you wish to register and submit<br/>
                                        To Add/Drop a course, Navigate to Registration => Add & Drop or go to ICT/Service Desk
                                    </p>
                                      <p>*If you have forgotten or do not have your user login details, kindly go to IT Services Desk and get a new one or have your Student Portal Account reset. </p>
                                       <h3 style="padding-top: 20px"><strong>Helpful Links</strong></h3>
                                    <p>Website: ${projectURL}</p>
                                    <p>Twitter: ${projectTwitter}</p>
                                    <p>Facebook: ${projectFacebook}</p>
                                    <p>Youtube: ${projectYoutube}</p>      
                                      `,
                                    `Regards,<br/>Admissions Officer<br/>${projectName}`
                                );
                                toast.success("Student Enrolled Successfully");
                                setIsFormLoading('off')
                            } else if (result.data.message === "exist") {
                                setIsFormLoading('off')
                                showAlert(
                                    "ERROR",
                                    "This applicant has already been enrolled!",
                                    "error"
                                );
                            } else {
                                setIsFormLoading('off')
                                showAlert(
                                    "ERROR",
                                    "Something went wrong. Please try again!",
                                    "error"
                                );
                            }
                        })
                        .catch((error) => {
                            setIsFormLoading('off')
                            showAlert(
                                "NETWORK ERROR",
                                "Please check your connection and try again!",
                                "error"
                            );
                        });
                }
            }).catch((err) => {
                console.log("NETWORK ERROR");
            });

    };


    useEffect(() => {
        stateData();
    }, [])


    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"New Student Enrolment"}
                items={["User", "Student Manager", "New Student Enrolment"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                        <div className="card-toolbar">
                        </div>
                        <div className="d-flex col-md-12">
                            <input type="number" id="ApplicationID" onChange={onEdit} value={formData.ApplicationID} placeholder="Search Student By Application-ID" className="form-control form-control-solid me-3 flex-grow-1" name="search" />
                            <button className="btn btn-light btn-active-light-primary fw-bolder flex-shrink-0" onClick={getData} >Submit </button>
                        </div>
                    </div>
                    <div className="card-body pt-7" style={{
                        display: 'block',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}>
                        {
                            isLoading ? <Loader /> :
                                showForm ?
                                    <NewStudentEnrolmentForm data={formData} isFormLoading={isFormLoading} onEdit={onEdit} onSubmit={onSubmit} stateList={stateList} courseList={courseList} semesterList={semesterList} lgaList={lgaList} nationalityList={CountryData} parentData={parentData} />
                                    : ""
                        }

                    </div>
                </div>

            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(NewStudentEnrolment);

