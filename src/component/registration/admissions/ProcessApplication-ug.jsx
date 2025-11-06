import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { useNavigate, useParams } from "react-router";
import { showAlert, showConfirm } from "../../common/sweetalert/sweetalert";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import
{
  admissionEmail,
  sendEmail,
  projectName,
  formatDateAndTime,
  projectHREmail, shortCode, projectAddress, projectURL, projectLogo, projectEmail, projectPhone, projectCode, projectViceChancellor, CuAdmissionEmail,
} from "../../../resources/constants";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import BabaAhmadAdmissionLetter from "./admission-letter/baba-ahmad-admission";
import AlAnsarAdmissionLetter from "./admission-letter/al-ansar-admission";
import CosmopolitanAdmissionLetter from "./admission-letter/cu_admission/cu_admission";
import Modal from "../../common/modal/modal";
import UpdateAdmissionDetails from "./update-admission-details/update-admission-details";



function ProcessApplication(props)
{
  const token = props.login[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const [appInfo, setAppInfo] = useState([]);
  const { applicant } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState(false);
  const [approved, setApproved] = useState(false);
  const [showConditional, setShowCondional] = useState(false);
  const [conditional, setConditional] = useState(false);
  const [semester, setSemester] = useState([]);
  const [courses, setCourses] = useState([]);
  const [academicStructure, setAcademicStructure] = useState([]);
  const [facultyDetails, setFacultyDetails] = useState([]);
  const decisionStaff = props.login;
  if (applicant === "")
  {
    navigate("/registration/admissions");
  }
  const [Statuscolor, setStatuscolor] = useState('info');
  const [Statustext, setStatustext] = useState('Application is awaiting your decision');
  const app_type = window.location.href.split('/')[3].split('-')[2] === "ug" ? "undergraduate" : "";
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [AdmissionLetter, setAdmissionLetter] = useState([]);
  const [sittingsIDs, setSittingsID] = useState([]);
  const [decision, setDecision] = useState({
    applicant_id: applicant,
    rejectReason: "",
    action: "",
    decisionStaff:
      decisionStaff[0].FirstName +
      " " +
      decisionStaff[0].MiddleName +
      " " +
      decisionStaff[0].Surname,
    decisionDate: date,
    appliedDate: "",
    type: "",
    level: "",
    semester: "",
    admissionSemester: props.currentSemester,
    courseCode: "",
    CourseName: "",
    con1: "",
    con2: "",
    con3: "",
    con4: "",
    con5: "",
    con6: "",
    tutionFee: "",
    url: projectURL.split("//")[1]
  });
  const [decisionDetails, setDescionsDetails] = useState([])
  const [st_tuition, setSt_tuition] = useState(0);
  const [showAdmissionLetter, setShowAdmissionLetter] = useState(false);
  const componentRef = useRef();
  const [closeModal, setCloseModal] = useState(false)

  const [dt__, setDt__] = useState([])

  useEffect(() =>
  {
    const getSemesters = async () =>
    {
    };
    getSemesters();
  }, []);

  useEffect(() =>
  {
    const getCourses = async () =>
    {
      axios
        .get(`${serverLink}registration/admissions/courses`, token)
        .then((response) =>
        {
          setCourses(response.data[1]);
          setAcademicStructure(response.data[0])
        })
        .catch((ex) =>
        {
          console.error(ex);
        });
    };
    getCourses();
  }, []);

  const getAdmissionDet = async (result, tuition) =>
  {
    setSt_tuition(tuition[0]?.TuitionAmount)
    const cons = result.data[0].AdmissionCondition.split(", ");
    setDecision({
      ...decision,
      level: result.data[0]?.AdmissionLevel,
      admissionSemester: result.data[0]?.AdmissionSchoolSemester,
      semester: result.data[0]?.AdmissionSemester,
      CourseName: result.data[0]?.CourseName,
      CourseClass: result.data[0]?.CourseClass,
      courseCode: result.data[0]?.AdmissionCourse,
      con1: cons[0],
      con2: cons[1],
      con3: cons[2],
      con4: cons[3],
      con5: cons[4],
      con6: cons[5],
      type: result.data[0]?.AdmissionType,
      decisionDetails: decisionDetails,
      tutionFee: tuition[0]?.TuitionAmount
    })
    setAdmissionLetter(result.data);
  }

  const getApplicantData = async () =>
  {
    await axios
      .get(`${serverLink}registration/admissions/semester`, token)
      .then((response) =>
      {
        setSemester(response.data);
      });


    await axios.get(`${serverLink}registration/admissions/admission-letter/${applicant}`, token)
      .then(async (result) =>
      {
        if (result.data.length > 0)
        {
          setDescionsDetails(result.data)
          const fBody = {
            CourseCode: result.data[0]?.AdmissionCourse,
            AdmissionLevel: result.data[0]?.AdmissionLevel,
            AdmissionSemester: result.data[0]?.AdmissionSemester,
            AdmissionSchoolSemester: result.data[0]?.AdmissionSchoolSemester,
            StartMonth: result.data[0]?.StartMonth,
            StartYear: result.data[0]?.StartYear,
          }

          if (shortCode === "BAUK" || shortCode === "AUM")
          {
            await axios.post(`${serverLink}registration/admissions/tuition-fee`, fBody).then((res) =>
            {
              if (res.data.length > 0)
              {
                let tuition = res.data;
                getAdmissionDet(result, res.data)
              }
            })
          } else
          {
            let t = []
            getAdmissionDet(result, t)
          }
        }
      })

    const type = "";
    try
    {
      await axios
        .get(`${serverLink}registration/admissions/payment/list/${applicant}/${app_type}`, token)
        .then((response) =>
        {
          setPaymentHistory(response.data)
        });

      let course_code;
      await axios
        .get(`${serverLink}registration/admissions/ug/information/${applicant}`, token)
        .then((response) =>
        {
          course_code = response.data.course[0].CourseCode;
          setDecision({
            ...decision,
            courseCode: response.data.course[0].CourseCode,
            CourseName: response.data.course[0].CourseName
          })
          const applicantStatus = response.data.course[0].Status;
          const color = applicantStatus.toString() === "0" ? 'warning'
            : applicantStatus.toString() === "1" ? 'info'
              : applicantStatus.toString() === "2" ? 'success'
                : applicantStatus.toString() === "3" ? 'danger'
                  : 'primary'
          const text = applicantStatus.toString() === "0" ? 'Application Not Submitted'
            : applicantStatus.toString() === "1" ? 'Application is awaiting your decision'
              : applicantStatus.toString() === "2" ? 'Application Accepted'
                : applicantStatus.toString() === "3" ? 'Application Rejected'
                  : 'Applicant Allowed for enrolment'
          setStatustext(text);
          setStatuscolor(color);
          setAppInfo(response.data);
        });

      axios.get(`${serverLink}registration/admissions/ad-faculty/${course_code}`, token)
        .then((result) =>
        {
          if (result.data.length > 0)
          {
            setFacultyDetails(result.data);
          }
        })
      setIsLoading(false);
    } catch (ex)
    {
      if (ex.response && ex.response.status === "404")
        return navigate("registration/admissions");
    }
  };

  useEffect(() =>
  {
    getApplicantData();
  }, []);

  const handleChange = (e) =>
  {
    const target = e.target;
    setDecision({
      ...decision,
      [e.target.id]: e.target.value
    });

    if (target.id === "action")
    {
      if (target.value === "2")
      {
        setConditional(true);
        setReason(false);
        setApproved(false);
        setShowCondional(false);
      }
      if (target.value === "3")
      {
        setReason(true);
        setShowCondional(false);
        setApproved(false);
        setConditional(false);
      }
    }
    if (e.target.id === "courseCode")
    {
      setDecision({
        ...decision,
        [e.target.id]: e.target.value,
        CourseName: courses.filter(x => x.CourseCode === e.target.value)[0].CourseName
      })
      let acad_structure = academicStructure.filter(x => x.CourseCode === e.target.value);
      setFacultyDetails(acad_structure);
      return false;
    }

    if (target.id === "type")
    {
      setDecision({
        ...decision,
        type: target.value, con1: "", con2: "", con3: "", con4: "", con5: "", con6: "", rejectReason: ""
      })

      if (target.value === "Conditional")
      {
        setShowCondional(true);
        setReason(false);
        setApproved(true);
      }
      else
      {
        setApproved(true);
        setShowCondional(false);
        setReason(false);
      }
      return false;
    }
  };

  const handleConditionsChange = (e) =>
  {
    if (e.target.checked === true)
    {
      setDecision({
        ...decision,
        [e.target.id]: e.target.value
      });
    } else
    {
      setDecision({
        ...decision,
        [e.target.id]: ""
      });
    }
  }


  const handleSubmit = async (e) =>
  {
    e.preventDefault();
    const values = [];
    for (var key in decision)
    {
      if (decision.hasOwnProperty(key) && key.includes("con"))
      {
        values.push(decision[key]);
      }
    }
    const decison = decision;
    const checked = [];
    values.map((val) =>
    {
      checked.push(`<li>${val}</li>`);
    });

    if (decision.action.trim() === "")
    {
      showAlert("EMPTY FIELD", "Please select a decision", "error");
      return false;
    }

    showConfirm("CONFIRM", `Are you sure you want ${decision.action === "2" ? "Approve?" : "Deny?"}`, "warning")
      .then(async (isConfirm) =>
      {
        if (isConfirm)
        {
          const admission_data = {
            CourseName: decision.CourseName,
            action: decision.action,
            admissionSemester: decision.admissionSemester,
            applicantion_id: decision.applicant_id,
            appliedDate: decision.appliedDate,
            cons: decision.con1 + ", " + decision.con2 + ", " + decision.con3 + ", " + decision.con4 + ", " + decision.con5 + ", " + decision.con6,
            courseCode: decision.courseCode,
            decisionStaff: props.login[0].StaffID,
            level: decision.level,
            rejectReason: decision.rejectReason,
            semester: decision.semester,
            type: decision.type,
            appInfo: appInfo.course[0]
          }
          if (applicant !== "")
          {
            await axios
              .put(`${serverLink}registration/admissions/admission-status`, { decision: decision, admission_data: admission_data }, token)
              .then((result) =>
              {
                //2 = approve
                //3 = reject
                getApplicantData();
                if (decision.action === "2" && decision.type === "Direct Entry")
                {

                }
                else if (decision.action === "2" && decision.type === "Conditional")
                {

                }

                if (result.data.message === "success")
                {
                  toast.success("Successfully Approve application");
                  // setTimeout(() => {
                  //   navigate("/registration/admissions");
                  // }, 1000);
                  let cons_ = []
                  if (decison.con1 !== "")
                  {
                    cons_.push(...[decison.con1])
                  }
                  if (decison.con2 !== "")
                  {
                    cons_.push(...[decison.con2])
                  }
                  if (decison.con3 !== "")
                  {
                    cons_.push(...[decison.con3])
                  }
                  if (decison.con4 !== "")
                  {
                    cons_.push(...[decison.con4])
                  }
                  if (decison.con5 !== "")
                  {
                    cons_.push(...[decison.con5])
                  }
                  if (decison.con6 !== "")
                  {
                    cons_.push(...[decison.con6])
                  }

                  if (shortCode === "CU")
                  {
                    const email_data = { cons_, decision, appInfo }
                    const dt = CuAdmissionEmail(email_data)
                    sendEmail(appInfo.applicant_data[0].EmailAddress, dt.subject, dt.title, appInfo.applicant_data[0].FirstName, dt.body, '')
                  } else
                  {
                    admissionEmail(
                      appInfo.applicant_data[0].EmailAddress,
                      "",
                      `${projectName.split('|')[0]} Admission`,
                      "Letter of Provisional Admission",
                      `${appInfo.applicant_data[0].FirstName} ${appInfo.applicant_data[0].Middlename > 0
                        ? appInfo.applicant_data[0].Middlename
                        : ""
                      } ${appInfo.applicant_data[0].Surname}`,
                      `<br />Further to your application to study at ${projectName.split("|")[0]}, I am pleased to notify you that you have
                    been offered Conditional Admission into the Degree Programme - <strong style="font-style: italic">${decision.CourseName}</strong> starting September ${new Date().getFullYear()}.<br/>

                    ${cons_.length > 0 ?
                        ` Meanwhile, you will need to provide the following documents to fully confirm your admission: <br/>
                      ${cons_.map((x, i) =>
                        {
                          return (
                            `<span key='${i}'><br/>${i + 1}. ${x}</span>`
                          )
                        })
                        }` : ''
                      }  
                    <br/> <br/>                    
                    Kindly login to your ${shortCode === "CU" ? "https://admission.cosmopolitan.edu.ng/" : <a href={`${projectURL}/admission/application/login`}>application portal</a>} to download your admission letter.
                    <br/>
                    Best wishes!<br />&nbsp;<br/>
                    Registrar,<br/>
                    ${projectName.split('|')[0]}<br/>
                    ${projectAddress}`,
                      `Admissions Office ${shortCode}`
                    );
                  }
                }
              })
              .catch((error) =>
              {
                showAlert(
                  "NETWORK ERROR",
                  "Please check your connection and try again!",
                  "error"
                );
              });
          }
          else
          {

          }
        }
      })

  };

  const allowEnrolment = async () =>
  {
    toast.info('please wait...')
    const email = {
      email: appInfo.applicant_data[0].EmailAddress,
      subject: `${projectName.split('|')[0]} Admission`,
      title: 'Enrolment',
      name: appInfo.applicant_data[0].FirstName.charAt(0).toUpperCase() + appInfo.applicant_data[0].FirstName.slice(1),
      body: `Your admission at ${shortCode} have been confirmed, click the 
      <a href="${shortCode === "CU" ? `https://admission.cosmopolitan.edu.ng/admission/application/dashboard` : `${projectURL}/admission/enrolment`}">link<a/> to proceed with the enrolment. 
      <br/>
      Or copy and paste this link in your browser : ${shortCode === "CU" ? `https://admission.cosmopolitan.edu.ng/admission/application/dashboard` : `${projectURL}/admission/enrolment`}
      <br/><br/>
      For inquiries, contact ${projectHREmail}`,
      signature: ''
    }
    showConfirm("Warning", "Allow applicant to proceed to enrol?", "warning").then(async (isConfirm) =>
    {
      if (isConfirm)
      {
        await axios.patch(`${serverLink}registration/admissions/allow-enrolment/${applicant}`, { applicant: applicant }, token)
          .then((response) =>
          {
            if (response.data.message === "success")
            {
              getApplicantData();
              toast.success('Applicant allowed to enrol.');
              toast.success('Notification email sent to applicant');
              sendEmail(email.email, email.subject, email.title, email.name, email.body, email.signature)
            }
            else
            {
              toast.error('try again...')
            }
          }).catch((e) =>
          {
            toast.error('Network error...')
            console.log('NETWORK ERROR')
          })
      }
    })
  }

  var sendData = {
    applicantInfo: appInfo.applicant_data,
    applicantCourse: appInfo.course,
    decison: decision,
    school: {
      logo: projectLogo,
      name: projectName,
      address: projectAddress,
      email: projectEmail,
      phone: projectPhone,
      shortCode: shortCode,
      viceChancellor: projectViceChancellor
    },
    facultyDetails: facultyDetails,
    appInfo: appInfo,
    decisionDetails: decisionDetails,
    tuition: st_tuition
  }




  const printAdmission = () =>
  {
    setShowAdmissionLetter(true);

    setTimeout(() =>
    {
      handleAdmissionPrint();
      setShowAdmissionLetter(false);
    }, 100);

  }

  const handleAdmissionPrint = useReactToPrint({
    content: () => componentRef.current,
  });



  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <div className="col-md-12">

        <div className={`notice d-flex bg-light-${Statuscolor} rounded border-${Statuscolor} border border-dashed p-6`}>
          <div className="d-flex flex-stack flex-grow-1">
            <div className="fw-bold">
              <h4 className="text-gray-900 fw-bolder">Application Status</h4>
              <div className="fs-6 text-gray-700">{Statustext}</div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-8 pt-20">
            <h3>Personal Information</h3>
            <table className="table table-responsive table-hover">
              <tbody>
                <tr>
                  <td className="fw-bolder">Application ID</td>
                  <th>
                    {applicant}
                  </th>
                </tr>
                <tr>
                  <td className="fw-bolder">Name</td>
                  <th>
                    {`${appInfo.applicant_data[0].FirstName} ${appInfo.applicant_data[0] > 0
                      ? appInfo.applicant_data[0].Middlename
                      : ""
                      } ${appInfo.applicant_data[0].Surname}`}
                  </th>
                </tr>
                <tr>
                  <td className="fw-bolder">Email Address</td>
                  <th>{appInfo.applicant_data[0].EmailAddress}</th>
                </tr>
                <tr>
                  <td className="fw-bolder">Phone Number</td>
                  <th>{appInfo.applicant_data[0].PhoneNumber}</th>
                </tr>
                <tr>
                  <td className="fw-bolder">Date of Birth</td>
                  <th>{formatDateAndTime(appInfo.applicant_data[0].DateOfBirth, "date")}</th>
                </tr>
                <tr>
                  <td className="fw-bolder">Gender</td>
                  <th>{appInfo.applicant_data[0].Gender}</th>
                </tr>
                <tr>
                  <td className="fw-bolder">Nationality</td>
                  <th>{appInfo.applicant_data[0].Nationality}</th>
                </tr>
                <tr>
                  <td className="fw-bolder">State of Origin</td>
                  <th>{appInfo.applicant_data[0].StateOfOrigin}</th>
                </tr>
                <tr>
                  <td className="fw-bolder">LGA</td>
                  <th>{appInfo.applicant_data[0].LGA}</th>
                </tr>
                <tr>
                  <td className="fw-bolder">Religion</td>
                  <th>{appInfo.applicant_data[0].Religion}</th>
                </tr>
                <tr>
                  <td className="fw-bolder">Occupation</td>
                  <th>
                    {appInfo.applicant_data[0].Occupation
                      ? appInfo.applicant_data[0].Occupation
                      : "Nil"}
                  </th>
                </tr>
                <tr>
                  <td className="fw-bolder">Address</td>
                  <th>{appInfo.applicant_data[0].Address}</th>
                </tr>
                {
                  shortCode === "CU" &&
                  <tr>
                    <td className="fw-bolder">ReferralCode</td>
                    <th>{appInfo.applicant_data[0].ReferralCode}</th>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          {
            decisionDetails.length > 0 && appInfo.course[0]?.Status !== 3 &&
            <div className="col-md-4 pt-20 ">
              <div className="bg-light bg-opacity-100 rounded-3 p-10 mx-md-5 h-md-100">
                <h3>Admission Details</h3>
                <div className="table table-responsive" >
                  <table className="table">
                    <tbody style={{ paddingLeft: '10px' }}>
                      <tr>
                        <td className="fw-bolder">Application ID</td>
                        <th>
                          {applicant}
                        </th>
                      </tr>
                      <tr>
                        <td className="fw-bolder">Approved Course</td>
                        <th>
                          {decisionDetails[0]?.CourseName}
                        </th>
                      </tr>
                      <tr>
                        <td className="fw-bolder">Admission Level</td>
                        <th>{decisionDetails[0]?.AdmissionLevel} Level</th>
                      </tr>
                      <tr>
                        <td className="fw-bolder">Admission Semester</td>
                        <th>{decisionDetails[0]?.AdmissionSemester}</th>
                      </tr>
                      <tr>
                        <td className="fw-bolder">School Semester</td>
                        <th>{decisionDetails[0]?.AdmissionSchoolSemester}</th>
                      </tr>
                      <tr>
                        <td className="fw-bolder">Admission Type</td>
                        <th>{decisionDetails[0]?.AdmissionType}</th>
                      </tr>
                      <tr>
                        <td className="fw-bolder">Admission Conditions</td>
                        <th>{decisionDetails[0]?.AdmissionCondition?.split(",")?.join(" |")}</th>
                      </tr>
                      <tr>
                        <td className="fw-bolder">Admission Date</td>
                        <th>{formatDateAndTime(decisionDetails[0]?.InsertedOn, "date")}</th>
                      </tr>


                    </tbody>
                  </table>
                </div>
                <div className="d-flex justify-content-between mt-4">
                  {
                    AdmissionLetter.length > 0 &&
                    <>
                      {
                        shortCode === "AUM" && <div>
                          <button className="btn btn-md btn-primary" onClick={printAdmission}>Print Admission Letter</button>
                        </div>
                      }
                      {
                        shortCode === "BAUK" || shortCode === "CU" && <div>
                          <button className="btn btn-md btn-primary" onClick={printAdmission}>Print Admission Letter</button>
                        </div>
                      }
                      {
                        shortCode === "BAUK" || shortCode === "AUM" || shortCode === "CU" &&
                        <button
                          disabled={parseInt(appInfo.course[0].Status) !== 2 ? true : false}
                          className="btn btn-sm btn-success ms-3"
                          onClick={allowEnrolment}>
                          Allow Enrolment
                        </button>
                      }
                    </>
                  }

                </div>

                <div className="d-flex justify-content-center mt-4">
                  <button className="btn btn-md btn-secondary" data-bs-toggle="modal" data-bs-target="#update_modal"
                    onClick={''}>Update Admission Requirements</button>
                </div>

                <Modal title={'Update Admission Details (AppID: ' + applicant + ')'} id={'update_modal'} large close="close_jamb">
                  <UpdateAdmissionDetails jambData={appInfo.jamb} AppId={applicant} getApplicantData={getApplicantData} setCloseModal={setCloseModal} />
                </Modal>
              </div>
            </div>
          }

        </div>
        <hr />
        <h3>O'level Information</h3>
        {appInfo.olevel_sitting.length > 0 &&
          appInfo.olevel_sitting.map((sit, index) =>
          {
            return (
              <table key={index} className="table table-row-dashed">
                <thead>
                  <tr>
                    <th className="fw-bolder">Exam Type</th>
                    <th className="fw-bolder">Exam Center</th>
                    <th className="fw-bolder">Exam Number</th>
                    <th className="fw-bolder">Exam Year</th>
                  </tr>
                  <tr>
                    <td>{sit.ExamsType}</td>
                    <td>{sit.ExamsCenter}</td>
                    <td>{sit.ExamsNumber}</td>
                    <td>{sit.ExaminationYear}</td>
                  </tr>
                </thead>
                <tbody>
                  {appInfo.oLevel.filter(x => x.SittingID === sit.EntryID).map((olevel, ki) => (
                    <tr key={ki}>
                      <td>{olevel.ExamsSubject}</td>
                      <td>{olevel.Score}</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )
          })}
        <hr />
        {
          appInfo.jamb.length > 0 &&
            projectName.toLocaleLowerCase().includes('olivia') ?
            <>
            </>
            :
            <>
              <h3>Jamb Information</h3>
              <table className="table table-row-dashed">
                <thead>
                  <tr></tr>
                </thead>
                <tbody>
                  <tr>
                    <td ></td>
                    <td className=""><span className="fw-bolder">Matric Number: </span>{appInfo.jamb.length > 0 && appInfo.jamb[0].MatricNumber}</td>
                    <td className=""><span className="fw-bolder">Exam Year: </span>{appInfo.jamb.length > 0 && appInfo.jamb[0].ExaminationYear}</td>
                  </tr>
                </tbody>
                <thead>
                  <tr>
                    <th className="fw-bolder">Subjects</th>
                    <th className="fw-bolder">Score</th>
                    {/* <th className="fw-bolder">Matric Number</th>
                    <th className="fw-bolder">Exam Year</th> */}
                  </tr>
                </thead>
                <tbody>
                  {appInfo.jamb.map((j, index) => (
                    <tr key={index}>
                      <td>{j.SubjectName}</td>
                      <td>{j.SubjectScore}</td>
                      {/* <td>{j.MatricNumber}</td>
                      <td>{j.ExaminationYear}</td> */}
                    </tr>
                  ))}
                  <tr>
                    <td className="fw-bold"><b>TOTAL</b></td>
                    <td><b>{appInfo.jamb?.map((e, i) => e.SubjectScore).reduce((a, b) => a + b, 0)}</b></td>
                  </tr>
                </tbody>
              </table>
              <hr />
            </>
        }


        <h3>Guardian Information</h3>
        <table className="table table-row-dashed">
          {
            appInfo.guardian.length > 0 ?
              <tbody>

                <tr>

                  <td className="fw-bolder">Guardian Name</td>
                  <td>
                    {`${appInfo.guardian[0].FirstName} ${appInfo.guardian[0].Middlename > 0
                      ? appInfo.guardian[0].Middlename
                      : ""
                      } ${appInfo.guardian[0].Surname}`}
                  </td>
                  <td className="fw-bolder">Email Address</td>
                  <td>{appInfo.guardian[0].PhoneNumber}</td>
                </tr>
                <tr>
                  <td className="fw-bolder">Phone Number</td>
                  <td>{appInfo.guardian[0].EmailAddress}</td>
                  <td className="fw-bolder">Gender</td>
                  <td>{appInfo.guardian[0].Gender}</td>
                </tr>
                <tr>
                  <td className="fw-bolder">Address</td>
                  <td>{appInfo.guardian[0].Address}</td>
                </tr>
              </tbody>
              :
              <tbody>
                <tr>
                  <td>No Guardian Information</td>
                </tr>
              </tbody>
          }

        </table>
        <hr />
        <h3>Supporting Documents</h3>
        <table className="table table-row-dashed">
          <thead>
            <tr>
              <th className="fw-bolder">Document Name</th>
              <th className="fw-bolder">Action</th>
            </tr>
          </thead>
          <tbody>
            {appInfo.documents.map((doc, index) => (
              <tr key={index}>
                <td>{doc.DocumentType}</td>
                <td>
                  <a
                    href={doc.FileName.includes("simplefileupload.com") ? doc.FileName : `${serverLink}public/uploads/${shortCode}/application/document/${doc.FileName}`}
                    target="_blank"
                    className="btn btn-primary"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <>
          <h3>Payment History</h3>
          <table className="table table-row-dashed">
            <thead>
              <tr>
                <th className="fw-bolder">Description</th>
                <th className="fw-bolder">Amount</th>
                <th className="fw-bolder">Reference</th>
                <th className="fw-bolder">Payment Document</th>
                <th className="fw-bolder">Date Paid</th>
                <th className="fw-bolder">Action</th>
              </tr>
            </thead>
            <tbody>
              {
                paymentHistory.length > 0 ?
                  <>
                    {
                      paymentHistory.map((j, index) =>
                      {
                        const disabled = j.Status.toString() !== "2" ? true : false;
                        const visible = j.Description.toLocaleLowerCase().includes('tuition') === true ? "block" : "none"
                        return (
                          <tr key={index}>
                            <td>{j.Description}</td>
                            <td>{j.AmountPaid}</td>
                            <td>{j.PaymentReference}</td>
                            <td><a className="btn btn-sm btn-primary" target="_blank"
                              href={j.FilePath.includes("simplefileupload.com") ? j.FilePath : `${serverLink}public/uploads/${shortCode}/application/document/${j.FilePath}`}>
                              View Document</a></td>
                            <td>{formatDateAndTime(j.InsertedDate, "date")}</td>
                            {
                              shortCode === "OAU" || shortCode === "CU" &&
                              <td>
                                <button disabled={disabled} style={{ display: `${visible}` }} className="btn btn-sm btn-primary"
                                  onClick={allowEnrolment}>
                                  Allow Enrolment
                                </button>
                              </td>
                            }
                          </tr>
                        )
                      })
                    }
                  </>
                  : <>
                    <tr>
                      <td><h3>No Payment made</h3></td>
                    </tr>
                  </>
              }

            </tbody>
          </table>
          <hr />
        </>

        <h3>Course Applied</h3>
        <h6>{appInfo.course[0].CourseName}</h6>
        <hr />
        <h3>Admission Decision</h3>

        <div className="col-md-12 ">
          <div className="row">
            <form onSubmit={handleSubmit}>
              <div className="col-md-12 fv-row">
                <label className="required fs-6 fw-bold mb-2">Decision</label>
                <select
                  className="form-select"
                  data-control="select2"
                  data-placeholder="Select a Decision"
                  id="action"
                  required
                  onChange={handleChange}
                >
                  <option value="">Select option</option>
                  <option value="2">Approve</option>
                  <option value="3">Reject</option>
                </select>
              </div>
              {conditional ? (
                <div className="col-md-12 fv-row mt-5">
                  <div className="col-md-12 fv-row">
                    <label className="required fs-6 fw-bold mb-2">
                      Decision Type
                    </label>
                    <select
                      className="form-select"
                      data-placeholder="Select a Decision type"
                      data-control="select2"
                      id="type"
                      required
                      onChange={handleChange}
                    >
                      <option value="">Select option</option>
                      <option value="Direct Entry">Direct Entry</option>
                      <option value="UTME">UTME</option>
                      <option value="Conditional">Conditional</option>
                      <option value="Transfer">Transfer</option>
                      <option value="Foundation">Foundation</option>
                      <option value="Remedials">Remedials</option>
                    </select>
                  </div>
                </div>
              ) : null}
              {showConditional ? (
                <>
                  <div className="col-md-12 fv-row">
                    <div className="row mt-5">
                      <div className="col-md-3 fv-row">
                        <div className="form-check form-check-custom form-check-solid">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value="Jamb Result"
                            id="con6"
                            onChange={handleConditionsChange}
                          />
                          <label className="form-check-label" htmlFor="con6">
                            Jamb Result
                          </label>
                        </div>
                      </div>
                      <div className="col-md-3 fv-row">
                        <div className="form-check form-check-custom form-check-solid">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value="High School Transcript"
                            id="con1"
                            onChange={handleConditionsChange}
                          />
                          <label className="form-check-label" htmlFor="con1">
                            High School Transcript
                          </label>
                        </div>
                      </div>

                      <div className="col-md-3 fv-row">
                        <div className="form-check form-check-custom form-check-solid">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value="High School Diploma"
                            id="con2"
                            onChange={handleConditionsChange}
                          />
                          <label className="form-check-label" htmlFor="con2">
                            High School Diploma
                          </label>
                        </div>
                      </div>

                      <div className="col-md-3 fv-row">
                        <div className="form-check form-check-custom form-check-solid">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value="College Transcript"
                            id="con3"
                            onChange={handleConditionsChange}
                          />
                          <label className="form-check-label" htmlFor="con3">
                            College Transcript
                          </label>
                        </div>
                      </div>


                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="row mt-5">
                      <div className="col-md-3 fv-row">
                        <div className="form-check form-check-custom form-check-solid">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value="College Degree"
                            id="con4"
                            onChange={handleConditionsChange}
                          />
                          <label className="form-check-label" htmlFor="con4">
                            College Degree
                          </label>
                        </div>
                      </div>
                      <div className="col-md-3 fv-row">
                        <div className="form-check form-check-custom form-check-solid">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value="Letter(s) of Recommendation"
                            id="con5"
                            onChange={handleConditionsChange}
                          />
                          <label className="form-check-label" htmlFor="con5">
                            Letter(s) of Recommendation
                          </label>
                        </div>
                      </div>

                    </div>
                  </div>
                </>
              ) : null}
              {approved ? (
                <>
                  <div className="row mt-5">
                    <div className="col-md-12  fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Decision Level
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select a Decision level"
                        data-control="select2"
                        id="level"
                        required
                        onChange={handleChange}
                      >
                        <option value="">Select option</option>
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
                  </div>
                  <div className="row  mt-5">
                    <div className="col-md-6 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Decision Semester
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select a Decision semester"
                        data-control="select2"
                        id="semester"
                        required
                        onChange={handleChange}
                      >
                        <option value="">Select option</option>
                        <option value="First">First Semester</option>
                        <option value="Second">Second Semester</option>
                      </select>
                    </div>
                    <div className="col-md-6 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Admission Semester
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select admission semester"
                        id="admissionSemester"
                        required
                        onChange={handleChange}
                      >
                        <option value="">Select option</option>
                        {semester.map((sem, index) => (
                          <option key={index} value={sem.SemesterCode}>
                            {sem.SemesterName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-12 fv-row">
                      <label className="required fs-6 fw-bold mb-2 mt-4">
                        Course
                      </label>
                      <select
                        className="form-select"
                        data-control="select2"
                        data-placeholder="Select a Course"
                        id="courseCode"
                        value={decision.courseCode}
                        required
                        onChange={handleChange}
                      >
                        <option value="">Select option</option>
                        {courses.length > 0 &&
                          courses.map((course, index) => (
                            <option key={index} value={course.CourseCode}>
                              {course.CourseName}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : null}
              {reason ? (
                <div className="d-flex flex-column mb-8">
                  <label className="fs-6 fw-bold mb-2">Reason</label>
                  <textarea
                    className="form-control form-control-solid"
                    rows="3"
                    placeholder="Reason for rejection"
                    onChange={handleChange}
                    id="rejectReason"
                    required
                  ></textarea>
                </div>
              ) : null}

              <div className="d-flex flex-column mb-8 mt-8">
                <button
                  disabled={shortCode === "AUM" ? false : Statuscolor !== "info" ? true : false}
                  type="submit"
                  className={`btn btn-${Statuscolor !== "info" ? Statuscolor : "primary"} mt-4`}>
                  {shortCode === "AUM" ? "Submit" : Statuscolor !== "info" ? Statustext : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {
        showAdmissionLetter && shortCode === "BAUK" && <BabaAhmadAdmissionLetter componentRef={componentRef} data={sendData} />
      }
      {
        showAdmissionLetter && shortCode === "AUM" && <AlAnsarAdmissionLetter componentRef={componentRef} data={sendData} />
      }

      {
        showAdmissionLetter && shortCode === "CU" && <CosmopolitanAdmissionLetter componentRef={componentRef} data={sendData} />
      }
    </div >
  );
}
const mapStateToProps = (state) =>
{
  return {
    login: state.LoginDetails,
    currentSemester: state.currentSemester
  };
};

export default connect(mapStateToProps, null)(ProcessApplication);
