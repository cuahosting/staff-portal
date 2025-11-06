import { useEffect, useState } from 'react';
import { convertNumbertoWords, currencyConverter } from '../../../../resources/constants';
import './baba-ahmad-admission.css'
import BgImage from './baba-ahmed-admission_bg.png'
import VCSign from './bau-reg-sign.jpeg'

const BabaAhmadAdmissionLetter = (props) => {
    const applicantCourse = props.data.applicantCourse[0];
    const applicantInfo = props.data.applicantInfo[0];
    const decison = props.data.decison;
    const school = props.data.school
    const today = new Date();
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


    return (
        <div>
            {
                data.length > 0 &&
                <div >
                    {
                        props.data.decison.type === "Conditional" ?
                            <div style={{
                                backgroundImage: `url(${BgImage})`,
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: 'cover',
                                backgroundColor: 'transparent !important',
                                paddingBottom: '70px'
                            }} className="body"
                                ref={props.componentRef}
                            >
                                <div className="table-wrapper" >
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
                                    <br /><br />
                                    <div className="title">{title}</div>
                                    <div style={{ marginTop: "-5px" }} >
                                        Further to your application to study at {school.name.split("|")[0]}, I am pleased to notify you that you have
                                        been offered Conditional Admission into the Degree Programme - <strong>{decison.CourseName.toUpperCase()} ({props.data.decisionDetails[0]?.AdmissionLevel} Level {decison.semester})</strong><br />
                                        In order to secure your place, you are advised to make payment of your tuition fee of {convertNumbertoWords(parseInt(props.data.tuition))} Naira Only ( {currencyConverter(parseInt(props.data.tuition))}) <strong>({currencyConverter(parseInt(props.data.tuition) * 2)} for Two Semesters Tuition)</strong>.<br /><br />

                                        Meanwhile, you will need to provide the following documents to fully confirm your admission:<br />
                                        {cons_.length > 0 &&
                                            cons_.map((x, i) => {
                                                return (
                                                    <span key={i}>&emsp;{i + 1}. {x}</span>
                                                )
                                            })
                                        }
                                        <br />
                                        You have one month period of time within which to provide {school.shortCode} with the above indicated item(s), failing which, your admission into {school.shortCode} may be postpone to another semester, academic year or rescinded altogether.<br />
                                        We look forward to you completing your admission requirements and joining  {school.shortCode} for your educational pursuits.<br />
                                        Best wishes!
                                        <br />
                                        <img src={VCSign} width="180px" alt="vc sign" />
                                        <br />
                                        {school.viceChancellor}<br />
                                        <p>
                                            <strong>
                                                Samuel Olu Ademilua,<br />
                                            </strong>
                                            {/* For the Vice-Chancellor */}
                                        </p>
                                    </div>
                                    <br /><br />
                                </div>
                            </div>
                            :

                            <div className="body" style={{
                                backgroundImage: `url(${BgImage})`,
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: 'cover',
                                backgroundColor: 'transparent !important',
                                paddingBottom: '35px'
                            }} ref={props.componentRef} >
                                <br />
                                <div className="table-wrapper" >
                                    <p></p>
                                    <div>
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
                                        Further to your application to study at {school.name.split("|")[0]}, I am delighted to inform you that you have been offered Provisional Admission into the <strong>{decison.CourseName.toUpperCase()} ({props.data.decisionDetails[0]?.AdmissionLevel} Level), starting from the {decison.admissionSemester} semester, due to begin in January 2023.</strong><br /><br />

                                        In order to secure your place, you are advised to make payment of your tuition fee of {convertNumbertoWords(parseInt(props.data.tuition))} Naira Only ({currencyConverter(parseInt(props.data.tuition))}) <strong>({currencyConverter(parseInt(props.data.tuition) * 2)} to cover two semesters using the following account details)</strong>.<br /><br />
                                        <span><strong>Account Name: </strong>Baba Ahmed University Sch. Fees Coll. A\C</span>
                                        <br />
                                        <span><strong>Bank: </strong> Zenith Bank Plc.</span>
                                        <br />
                                        <span><strong>Account Number: 1130096660</strong></span>
                                        <br />
                                        Meanwhile, note that the admission is made subject to :
                                        <ol>
                                            <li>The regularization of the admission by JAMB; and</li>
                                            <li>Payment of tuition fee before the registration deadline</li>
                                        </ol>

                                        Note that your Matriculation is subject to 1 above.
                                        <br />
                                        {/* you need to logon to JAMB CAPS Portal, upload your O'Level Result and change your
                                        first choice Institution to {school.name.split("|")[0]} (if {school.name.split("|")[0]} is not already your 1st choice), then print your
                                        JAMB Admission Letter for submission upon resumption. You are equally required to come along
                                        with your O'Level Result with at least 5 credits including English Language, Physics, Chemistry and
                                        Mathematics. This admission and course offered as well as your participation in Matriculation is
                                        subject to fulfilling the above conditions<br /><br />
                                        We look forward to you joining the {school.name.split("|")[0]} Family and having an exciting and illustrious educational experience with us! */}
                                        <br />
                                        Congratulations.
                                        <br />
                                        <img src={VCSign} width="180px" alt="vc sign" />
                                        <br />
                                        {/* {school.viceChancellor}<br /> */}
                                        {/* <div>Vice-Chancellor</div> */}
                                        <p>
                                            <strong>
                                                Samuel Olu Ademilua<br />
                                            </strong>
                                            <br />
                                            {/* For the Vice-Chancellor. */}
                                        </p>
                                        <br />
                                    </div>
                                </div>
                            </div>

                    }

                </div>
            }
        </div>
    )
}
export default BabaAhmadAdmissionLetter