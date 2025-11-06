import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import {connect} from "react-redux";
import NewStudentEnrolmentForm from "./new-student-enrolment-form";
import StateData from "../../../../resources/state_and_lga.json"
import CountryData from "../../../../resources/country.json"

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
        StudentLevel: "",
        StudentSemester: "",
        ApplicationID: "",
        ModeOfEntry: "",
        YearOfAdmission: "",
        JambAdmissionDeficiency: "0",
        MedicalCertificateOfFitness: "0",
        GuarantorLetter: "0",
        CompletePassport: "0",
        OlevelDeficiency: "0",
        IsActive: "0",
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
        InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}`
    });

   const stateData = () => {
        StateData.map((state) => {
            if (state.state !== 'Non-Nigerian')
                stateList.push(state.state)
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
                    let docData = result.data.docData;
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
                        EmailAddress: data[0].EmailAddress,
                        PhoneNumber: data[0].PhoneNumber,
                        Address: data[0].Address,
                        StateOfOrigin: data[0].StateOfOrigin,
                        Lga: data[0].LGA,
                        Nationality: data[0].Nationality,
                        DateOfBirth: data[0].DateOfBirth,
                        CourseCode: data[0].CourseCode,
                        StudentLevel: data[0].DecisionLevel,
                        StudentSemester: data[0].DecisionSemester,
                        ApplicationID: data[0].ApplicationID,
                        ModeOfEntry: data[0].DecisionType,
                        Status: "active",
                        IsHostelRequired: data[0].IsHostelRequired === 'Yes' ? 1 : 0,
                        JambAdmissionDeficiency: "0",
                        MedicalCertificateOfFitness: "0",
                        GuarantorLetter: "0",
                        CompletePassport: "0",
                        OlevelDeficiency: "0",
                        IsTransfered: "0",
                    })
                    if (guardianData.length > 0) {
                        setFormData({
                            ...formData,
                            ParentName: `${guardianData[0].FirstName} ${guardianData[0].MiddleName} ${guardianData[0].Surname}`,
                            ParentPhoneNumber: guardianData[0].PhoneNumber,
                            ParentAddress: guardianData[0].Address,
                        })
                    }
                    setShowForm(true)
                }else{
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

        if (e.target.id === 'Nationality') {
            setStateList([])
            setLgaList([])
            setFormData({
                ...formData,
                [e.target.id]: "",
            });
            if (e.target.value === 'Nigeria') {
                stateData()
            } else {
                StateData.map(state => {
                    if (state.state === 'Non-Nigerian')
                        stateList.push(state.state)
                });
            }
        }


        if(e.target.id === 'StateOfOrigin') {
            setLgaList([])
            StateData.map(state => {
                if(state.state === e.target.value) {
                    state.lgas.map(lga => {
                        lgaList.push(lga)
                    })
                }
            })

        }
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
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

            // await axios.get(`${serverLink}staff/student-manager/get-last-student-id`, token)
            // .then((result) => {
            //     if (result.data.length > 0) {
            //         let last_student_id = result.data[0].StudentID;
            //         let indexOfId = last_student_id.split('/')[3];
            //         let lastIndex = Number(indexOfId) + 1;

            //         const padStudentID = (lastIndex, places) => String(lastIndex).padStart(places, "0");
            //         let new_student_id = `BAU/${formData.AdmissionSemester}/${formData.CourseCode}/${padStudentID(lastIndex, 4)}`
            //         setFormData({
            //             ...formData,
            //             StudentID: new_student_id,
            //         });

            //          axios.post(`${serverLink}staff/student-manager/enrolment`, formData, token)
            //             .then((result) => {
            //                 if (result.data.message === "success") {
            //                     toast.success("Student Enrolled Successfully");
            //                     setIsFormLoading('off')
            //                 }  else {
            //                     setIsFormLoading('off')
            //                     showAlert(
            //                         "ERROR",
            //                         "Something went wrong. Please try again!",
            //                         "error"
            //                     );
            //                 }
            //             })
            //             .catch((error) => {
            //                 setIsFormLoading('off')
            //                 showAlert(
            //                     "NETWORK ERROR",
            //                     "Please check your connection and try again!",
            //                     "error"
            //                 );
            //             });
            //     }else{

            //         let lastIndex = 1;
            //         const padStudentID = (lastIndex, places) => String(lastIndex).padStart(places, "0");
            //         let new_student_id = `BAU/${formData.AdmissionSemester}/${formData.CourseCode}/${padStudentID(lastIndex, 4)}`
            //         setFormData({
            //             ...formData,
            //             StudentID: new_student_id,
            //         });

            //         axios.post(`${serverLink}staff/student-manager/enrolment`, formData, token)
            //             .then((result) => {
            //                 if (result.data.message === "success") {
            //                     toast.success("Student Enrolled Successfully");
            //                     setIsFormLoading('off')
            //                 }  else {
            //                     setIsFormLoading('off')
            //                     showAlert(
            //                         "ERROR",
            //                         "Something went wrong. Please try again!",
            //                         "error"
            //                     );
            //                 }
            //             })
            //             .catch((error) => {
            //                 setIsFormLoading('off')
            //                 showAlert(
            //                     "NETWORK ERROR",
            //                     "Please check your connection and try again!",
            //                     "error"
            //                 );
            //             });
            //     }
            // }).catch((err) => {
            //     console.log("NETWORK ERROR");
            // });

    };


    useEffect(()=> {
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
                            <input type="number" id="ApplicationID" onChange={onEdit} value={formData.ApplicationID} placeholder="Search Student By Application-ID" className="form-control form-control-solid me-3 flex-grow-1" name="search"/>
                                <button className="btn btn-light btn-active-light-primary fw-bolder flex-shrink-0" onClick={getData} >Submit </button>
                        </div>
                    </div>
                    <div className="card-body pt-7">
                        {
                            isLoading ? <Loader /> :
                                    showForm ?
                                        <NewStudentEnrolmentForm data={formData} isFormLoading={isFormLoading} onEdit={onEdit} onSubmit={onSubmit} stateList={stateList} courseList={courseList} semesterList={semesterList} lgaList={lgaList} nationalityList={CountryData} parentData={parentData}/>
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

