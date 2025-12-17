import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import NewStudentEnrolmentForm from "./new-student-enrolment-form";
import StateData from "../../../../resources/state_and_lga.json";
import CountryData from "../../../../resources/country.json";

function NewStudentEnrolment(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [parentData, setParentData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [courseList, setCourseList] = useState([]);
    let [stateList, setStateList] = useState([]);
    let [lgaList, setLgaList] = useState([]);

    const [formData, setFormData] = useState({
        FirstName: "", MiddleName: "", Surname: "", Gender: "", EmailAddress: "", PhoneNumber: "", Address: "", StateOfOrigin: "", Lga: "", Nationality: "", DateOfBirth: "", CourseCode: "", StudentLevel: "", StudentSemester: "", ApplicationID: "", ModeOfEntry: "", YearOfAdmission: "", JambAdmissionDeficiency: "0", MedicalCertificateOfFitness: "0", GuarantorLetter: "0", CompletePassport: "0", OlevelDeficiency: "0", IsActive: "0", Status: "active", ParentName: "", ParentPhoneNumber: "", ParentAddress: "", AdmissionSemester: "", GraduationSemester: "", GraduationDate: "", IsTransfered: "0", IsHostelRequired: "0", CertificateNo: "", StudentID: "", InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}`
    });

    const stateData = () => { StateData.forEach((state) => { if (state.state !== 'Non-Nigerian') stateList.push(state.state); }); };

    const getData = async () => {
        setIsLoading(true); setShowForm(false);
        if (formData.ApplicationID.toString().trim() === "") { showAlert("EMPTY FIELD", "Please enter the applicationID", "error"); return false; }
        const { success, data: result } = await api.get(`staff/student-manager/application/details/${formData.ApplicationID}`);
        if (success && result?.appData?.length > 0) {
            let data = result.appData; let guardianData = result.guardianData; let courseData = result.courseData; let semesterData = result.semesterData;
            setParentData(guardianData); setCourseList(courseData); setSemesterList(semesterData);
            setFormData({ ...formData, FirstName: data[0].FirstName, MiddleName: data[0].MiddleName, Surname: data[0].Surname, Gender: data[0].Gender, EmailAddress: data[0].EmailAddress, PhoneNumber: data[0].PhoneNumber, Address: data[0].Address, StateOfOrigin: data[0].StateOfOrigin, Lga: data[0].LGA, Nationality: data[0].Nationality, DateOfBirth: data[0].DateOfBirth, CourseCode: data[0].CourseCode, StudentLevel: data[0].DecisionLevel, StudentSemester: data[0].DecisionSemester, ApplicationID: data[0].ApplicationID, ModeOfEntry: data[0].DecisionType, Status: "active", IsHostelRequired: data[0].IsHostelRequired === 'Yes' ? 1 : 0, JambAdmissionDeficiency: "0", MedicalCertificateOfFitness: "0", GuarantorLetter: "0", CompletePassport: "0", OlevelDeficiency: "0", IsTransfered: "0" });
            if (guardianData.length > 0) { setFormData({ ...formData, ParentName: `${guardianData[0].FirstName} ${guardianData[0].MiddleName} ${guardianData[0].Surname}`, ParentPhoneNumber: guardianData[0].PhoneNumber, ParentAddress: guardianData[0].Address }); }
            setShowForm(true);
        } else { showAlert("NOT FOUND", "Student record not found. Please try again!", "error"); }
        setIsLoading(false);
    };

    const onEdit = (e) => {
        if (e.target.id === 'Nationality') { setStateList([]); setLgaList([]); setFormData({ ...formData, [e.target.id]: "" }); if (e.target.value === 'Nigeria') { stateData(); } else { StateData.forEach(state => { if (state.state === 'Non-Nigerian') stateList.push(state.state); }); } }
        if (e.target.id === 'StateOfOrigin') { setLgaList([]); StateData.forEach(state => { if (state.state === e.target.value) { state.lgas.forEach(lga => { lgaList.push(lga); }); } }); }
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const onSubmit = async () => {
        for (let key in formData) { if (formData.hasOwnProperty(key) && key !== "MiddleName" && key !== "ParentName" && key !== "ParentPhoneNumber" && key !== "ParentAddress" && key !== "GraduationSemester" && key !== "GraduationDate" && key !== "CertificateNo" && key !== "StudentID") { if (formData[key] === "") { await showAlert("EMPTY FIELD", `Please enter ${key}`, "error"); return false; } } }
        setIsFormLoading('on');
    };

    useEffect(() => { stateData(); }, []);

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"New Student Enrolment"} items={["User", "Student Manager", "New Student Enrolment"]} />
            <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-header border-0 pt-6"><div className="card-title" /><div className="card-toolbar"></div><div className="d-flex col-md-12"><input type="number" id="ApplicationID" onChange={onEdit} value={formData.ApplicationID} placeholder="Search Student By Application-ID" className="form-control form-control-solid me-3 flex-grow-1" name="search" /><button className="btn btn-light btn-active-light-primary fw-bolder flex-shrink-0" onClick={getData}>Submit</button></div></div><div className="card-body pt-7">{isLoading ? <Loader /> : showForm ? <NewStudentEnrolmentForm data={formData} isFormLoading={isFormLoading} onEdit={onEdit} onSubmit={onSubmit} stateList={stateList} courseList={courseList} semesterList={semesterList} lgaList={lgaList} nationalityList={CountryData} parentData={parentData} /> : ""}</div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(NewStudentEnrolment);
