import { useEffect, useState } from 'react';
import './al-ansar-admission.css'
import BgImage from './bg_admission_alansar.png'
import VCSign from './al_ansar_vc_sign.png'
import admission_officer from './aum_admission_officer_white.png'
import { convertNumbertoWords, currencyConverter, projectPaymentURL, schoolName } from '../../../../resources/constants';

const AlAnsarAdmissionLetter = (props) => {
    const applicantCourse = props.data.applicantCourse[0];
    const applicantInfo = props.data.applicantInfo[0];
    const decison = props.data.decison;
    const school = props.data.school
    const today = new Date();
    const faculty = props.data.facultyDetails[0]
    const title = props.data.decison.type === "Conditional" ? "CONDITIONAL OFFER OF ADMISSION" : "OFFER OF PROVISIONAL ADMISSION";
    const imagewidth = props.data.school.shortCode === "OUB" ? "120px" : "40px";
    let cons_ = []
    if (props.data.decison.con1 !== "") {
        cons_.push(...[props.data.decison.con1])
    }
    if (props.data.decison.con2 !== "") {
        cons_.push(...[props.data.decison.con2])
    }
    if (props.data.decison.con3 !== "") {
        cons_.push(...[props.data.decison.con3])
    }
    if (props.data.decison.con4 !== "") {
        cons_.push(...[props.data.decison.con4])
    }
    if (props.data.decison.con5 !== "") {
        cons_.push(...[props.data.decison.con5])
    }
    if (props.data.decison.con6 !== "") {
        cons_.push(...[props.data.decison.con6])
    }
    const [data, setData] = useState([props.data])
    const session = parseInt(props.data.decisionDetails[0]?.AdmissionSemester.replace(/\D/g, ""));
    return (
        <div>
            {
                data.length > 0 &&
                <div >
                    {
                        props.data.decison.type === "Conditional" ?
                            <div className="body" style={{
                                backgroundImage: `url(${BgImage})`,
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: 'cover',
                                backgroundColor: 'transparent !important',
                                paddingBottom: '70px'
                            }}

                                ref={props.componentRef}
                            >
                                <div className="table-wrapper"  >
                                    <div>
                                        <br />
                                        <p className='p-text' >
                                            APP/{decison.admissionSemester}/{decison.applicant_id}
                                            <br />
                                            {applicantInfo.Surname} {applicantInfo.MiddleName} {applicantInfo.FirstName}
                                            <br />
                                            {applicantInfo.Address}
                                            <br />
                                            {applicantInfo.StateOfOrigin}, {applicantInfo.Nationality}
                                            <br />
                                            {today.getDate()}. {today.getMonth() + 1}. {today.getFullYear()}
                                        </p>
                                        <p>Dear {applicantInfo.FirstName},</p>
                                    </div>
                                    <div className="title">{title}</div>
                                    <div style={{ marginTop: "-5px" }} >
                                        <p>
                                            Further to your application to study at {school.name.split("|")[0]}, I am pleased to notify you that you have been offered Conditional Admission into the Degree Programme - <strong style={{ fontStyle: 'italic' }}>{applicantCourse.CourseName}</strong> starting from 20{session}/20{session + 1} Academic Session due to begin in September, 20{session}.</p>
                                        <p>In order to secure your place, you are advised to make payment of your tuition fee of <strong>Seven Hundred and Eighty Five Thousand Naira Only (N785,000.00)</strong> to cover two semesters using the following account details:</p>
                                        <strong>
                                            <p>Account Name: Al-Ansar University<br />
                                                Bank: Zenith Bank PLC<br />
                                                Account: 1016506533
                                            </p>
                                        </strong>
                                        <p>
                                            Meanwhile, you will need to provide the following documents to fully confirm your admission:<br />
                                            {cons_.length > 0 &&
                                                cons_.map((x, i) => {
                                                    return (
                                                        <span key={i}>&emsp;{i + 1}. {x}</span>
                                                    )
                                                })
                                            }                </p>

                                        Meanwhile, note that the admission is made subject to:<br />
                                        1. The regularization of admission by JAMB; and<br />
                                        2. Your participation in the Matriculation which is scheduled to take place in early November, 20{session}<br /><br />
                                        Congratulations!
                                        <br />
                                        <img src={admission_officer} width="180px" alt="admission officer sign" />
                                        <br />
                                        Abdulkadir Ahmed<br />
                                        Admission Officer
                                    </div>
                                    <br />
                                </div>
                            </div>
                            :

                            <div className="body" style={{
                                backgroundImage: `url(${BgImage})`,
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: 'cover',
                                backgroundColor: 'transparent !important',
                                paddingBottom: '5px'
                            }} ref={props.componentRef} >
                                <div className="table-wrapper" >
                                    <div>
                                        <br />
                                        {/* //applicant_id  in the line below is actually the application id*/}
                                        <p className='p-text' >
                                            Application Number: APP/{decison.admissionSemester}/{decison.applicant_id}
                                            <br />
                                            Jamb Registration: {props.data.appInfo.jamb !== "" ? props.data.appInfo.jamb[0].MatricNumber : ""}
                                            <br />
                                            Date: {today.getDate()}. {today.getMonth() + 1}. {today.getFullYear()}
                                        </p>
                                        <p>Dear {applicantInfo.FirstName} {applicantInfo.MiddleName} {applicantInfo.Surname},</p>
                                    </div>
                                    &nbsp;
                                    <div className="title">{title}</div>
                                    <div style={{ marginTop: "-5px" }} >
                                        Following your application for admission into {schoolName}, I am pleased to inform you that you have been offered provisional admission into <strong>{props.data.decisionDetails[0]?.AdmissionLevel} Level</strong> to read <strong>{applicantCourse.CourseName}</strong> in the <strong>{faculty.FacultyName}</strong> for duration of {applicantCourse.CourseName.includes('Nursing Science') || applicantCourse.CourseName.includes('Medical Laboratory Science') ? "ten (10) semesters" : applicantCourse.CourseName.includes('Medicine and Surgery') ? "twelve (12) semesters" : "eight (8) semesters"} beginning from the 20{session}/20{session + 1} academic session. Your tuition fee for the programme is <strong>{convertNumbertoWords(parseInt(props.data.tuition))}</strong> Naira only <strong>({currencyConverter(parseInt(props.data.tuition))})</strong> per session.<a href='https://aum.edu.ng/fees/tuition'>&nbsp;Please click here for your fees</a>
                                        <div>
                                            Please note that this offer of admission is valid for the 20{session}/20{session + 1} academic session only and is subject to either full or at least 60% payment of the annual (session) tuition fee before registration. Where 60% is paid to commence the session, the remaining 40% (outstanding balance) must be made before the beginning of second semester for the admission to remain valid. Payments are to be made via the <a href={projectPaymentURL}>payment portal</a> or into <br />
                                            <b>FIRST BANK, ACCOUNT NO: 2045352768 - AL-ANSAR UNIVERSITY LIMITED 20{session}/{session + 1} SESSION REGISTRATION ACCOUNT.</b>
                                        </div>
                                        <div>
                                            Registration and enrollment commence immediately after payment and you are required to fulfill the following terms and conditions.
                                        </div>
                                        <ol type="a">
                                            <li>Possession of a minimum of 5 ‘O’ Level Credits including English Language, Mathematics and other three (3) relevant subjects in the area of course of studies as stated in the admission guidelines.</li>
                                            <li>Possession of a minimum of cut-off mark entry requirement for the programme as approved by the University and JAMB.</li>
                                            <li>You are to come along with the original certificates/statement of results and also produce three (3) copies of each.</li>
                                        </ol>
                                        <div className='mb-2'>
                                            Comprehensive Student Handbook can be accessed <a href='https://res.cloudinary.com/dyohp14ha/image/upload/v1693040741/Al-Ansar_University_Student_Handbook_j8ylbr.pdf'>here</a>. It contains information about the University, academic policies, student services, discipline and much more.
                                        </div>
                                        <span style={{ marginLeft: '0px' }}>Please accept my congratulations on your admission!</span>  <br />
                                        <span style={{ marginLeft: '0px' }}>Yours faithfully
                                            <br />
                                            <img src={admission_officer} width="130px" alt="admission officer sign" />
                                            <br /></span>
                                        <span style={{ marginLeft: '0px', display:'block' }}>Abdulkadir Ahmed <span style={{fontSize:12}}><i><b>M.inst.AM, OCP</b></i></span></span>
                                        <span style={{ marginTop: '-10px',  display:'block' }}>Admission Officer</span>
                                        <span style={{ marginTop: '-10px',  display:'block' }}>For: Registrar</span>
                                    </div>
                                </div>
                            </div>
                    }

                </div>
            }
        </div >
    )
}
export default AlAnsarAdmissionLetter