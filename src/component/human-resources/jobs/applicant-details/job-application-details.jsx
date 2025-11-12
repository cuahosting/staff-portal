import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import { Audit, decryptData, EmailTemplates } from "../../../../resources/constants";
import { useParams } from "react-router";
import BasicApplicantDetails from "./basic-details";
import { sendEmail } from "../../../../resources/constants";


function JobApplicantDetails(props) {
    const token = props.LoginDetails[0].token;

    const params = useParams();
    const applicationID = decryptData(params.id);

    const [isFormLoading, setIsFormLoading] = useState('off');
    const [isLoading, setIsLoading] = useState(true);

    const [facultyList, setFacultyList] = useState(
        props.FacultyList.length > 0 ? props.FacultyList : []
    )
    const [departmentList, setDepartmentList] = useState(
        props.DepartmentList.length > 0 ? props.DepartmentList : []
    )

    const [applicant, setApplicant] = useState({})
    const [interview, setInterView] = useState({
        InterviewTime: "",
        InterviewVenue: "",
        InterviewDate: "",
        Position: "",
        applicantName: "",
        applicationID: window.btoa(applicationID)
    })

    const [data, setData] = useState([])


    const [mail, setEmail] = useState({
        EmailBody: "",
        ApplicationID: applicant.ApplicationID,
        EmailAddress: "",
        Status: "",
        StatusBy: props.LoginDetails[0].StaffID,
        name: applicant.FirstName,
        subject: "",
        title: "",
        signature: ""
    })

    const getMetaData = async () => {
        await axios.get(`${serverLink}staff/academics/faculty/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setFacultyList(result.data)
                }
            })

        await axios.get(`${serverLink}staff/academics/department/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setDepartmentList(result.data)
                }
            })
    }

    const getData = async () => {
        await axios.get(`${serverLink}jobs/job-applications/${applicationID}`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setData(result.data);
                    setApplicant(result.data[0])
                    const name = result.data[0].FirstName + " " + result.data[0].Surname
                    setEmail({
                        ...mail,
                        ApplicationID: result.data[0].ApplicationID,
                        EmailAddress: result.data[0].EmailAddress,
                    })
                    const jobID = result.data[0].JobID
                    axios.get(`${serverLink}jobs/job-openings/all/list`, token)
                        .then((result) => {
                            if (result.data.length > 0) {
                                const filtered = result.data.filter(x => x.EntryID.toString() === jobID.toString())
                                setInterView({
                                    ...interview,
                                    InterviewTime: filtered[0].InterviewTime,
                                    InterviewDate: filtered[0].InterViewDate,
                                    InterviewVenue: filtered[0].InterviewVenue,
                                    Position: filtered[0].Position,
                                    applicantName: name
                                })
                            }
                            setIsLoading(false);
                        })
                }
            })
            .catch((err) => {
                console.log('NETWORK ERROR');
            });
    }

    const onEdit = (e) => {
        const type = e.target.value
        const emailBody = type !== "" ? EmailTemplates(type, interview).body : "";
        const subject = type !== "" ? EmailTemplates(type, interview).subject : "";
        const title = type !== "" ? EmailTemplates(type, interview).title : "";
        const name = applicant.FirstName;

        setEmail({
            ...mail,
            EmailBody: emailBody,
            Status: e.target.value,
            subject: subject,
            title: title,
            name: name,
        })
    };

    const onEmailTemplateChange = (e) => {
        setEmail({
            ...mail,
            EmailBody: e
        })

    }

    const onSubmit = async () => {
        if (mail.Status === "") {
            await showAlert("EMPTY FIELD", `Please select status`, "error");
            return false;
        }
        if (mail.Status !== "") {
            setIsFormLoading('on')
            await axios
                .patch(`${serverLink}jobs/job-applications/make_decision`, mail, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        getData()
                        const text = mail.Status === "1" ? 'Applicant invited for interview'
                            : mail.Status === "2" ? 'Applicant Rejected'
                                : 'Applicant Accepted'
                        toast.success(text);

                        const auditmessage = mail.Status === "1" ? `Applicant ${applicationID} invited for interview by ${props.LoginDetails[0].StaffID}`
                            : mail.Status === "2" ? `Applicant ${applicationID} job application Rejected bt ${props.LoginDetails[0].StaffID}`
                                : `Applicant ${applicationID} Accepted by ${props.LoginDetails[0].StaffID}`
                        Audit(props.LoginDetails[0].StaffID, auditmessage);
                        setEmail({
                            ...mail,
                            Status: "",

                        });
                        sendEmail(
                            mail.EmailAddress,
                            mail.subject,
                            mail.title,
                            mail.name.charAt(0).toUpperCase() + mail.name.slice(1),
                            mail.EmailBody,
                            mail.signature)
                        setIsFormLoading('off')
                        document.getElementById("closeModal").click();
                    }
                    else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        } else {
            await showAlert("EMPTY FIELD", `Please select status`, "error");
        }
    };

    useEffect(() => {
        getMetaData();
        getData()
    }, []);

    return isLoading ? (
        <Loader />
    ) :
        (
            <>
                <div className="col-md-12">
                    <BasicApplicantDetails
                        applicant={applicant}
                        facultyList={facultyList}
                        departmentList={departmentList}
                        onEdit={onEdit}
                        interview={interview}
                        onEmailTemplateChange={onEmailTemplateChange}
                        mail={mail}
                        onSubmit={onSubmit}
                        isFormLoading={isFormLoading}
                    />
                </div>

            </>
        )
}
const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        FacultyList: state.FacultyList,
        DepartmentList: state.DepartmentList
    };
};
export default connect(mapStateToProps, null)(JobApplicantDetails);
