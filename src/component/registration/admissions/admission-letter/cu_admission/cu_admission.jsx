import { useEffect, useState } from 'react';
import './cu_admission.css'
import BgImage from './cu_bg_1.jpg'
import VCSign from './cu_sign.png'
import { currencyConverter, formatDate, formatDateAndTime } from '../../../../../resources/constants';

const CosmopolitanAdmissionLetter = (props) =>
{
    const applicantCourse = props.data.applicantCourse[0];
    const applicantInfo = props.data.applicantInfo[0];
    const decison = props.data.decison;
    const dec = props.data.decisionDetails[0]
    const school = props.data.school
    const today = new Date();
    const faculty = props.data.facultyDetails[0]
    const title = props.data.decison.type === "Conditional" ? "CONDITIONAL OFFER OF ADMISSION" : "OFFER OF PROVISIONAL ADMISSION";
    const imagewidth = props.data.school.shortCode === "OUB" ? "120px" : "40px";
    let cons_ = []
    if (props.data.decison.con1 !== "")
    {
        cons_.push(...[props.data.decison.con1])
    }
    if (props.data.decison.con2 !== "")
    {
        cons_.push(...[props.data.decison.con2])
    }
    if (props.data.decison.con3 !== "")
    {
        cons_.push(...[props.data.decison.con3])
    }
    if (props.data.decison.con4 !== "")
    {
        cons_.push(...[props.data.decison.con4])
    }
    if (props.data.decison.con5 !== "")
    {
        cons_.push(...[props.data.decison.con5])
    }
    if (props.data.decison.con6 !== "")
    {
        cons_.push(...[props.data.decison.con6])
    }
    const [data, setData] = useState([props.data])
    console.log(dec)

    return (
        <div>
            {
                data.length > 0 &&
                <div >


                    <div className="body" style={{
                        backgroundImage: `url(${BgImage})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundColor: 'transparent !important',
                        // paddingBottom: '20px'
                    }} ref={props.componentRef} >
                        <div className="table-wrapper" style={{ marginLeft: "40px", marginRight: "40px" }} >
                            <div>
                                <br />
                                <p className='p-text' >
                                    Application ID: APP/{dec.AdmissionSemester}/{dec.ApplicationID}
                                    <br />
                                    Decision Date: {formatDateAndTime(formatDate(dec.InsertedOn), "date")}
                                    <br />
                                    Applicant Name: {applicantInfo.Surname} {applicantInfo.MiddleName} {applicantInfo.FirstName}
                                    <br />

                                </p>
                                <div>Dear {applicantInfo.FirstName},</div>
                            </div>
                            <div className="" style={{ fontWeight: "bolder" }}>Offer of Provisional Admission</div>
                            <div style={{ marginTop: "-5px" }} >
                                Further to your application for admission to study at {school.name.split("|")[0].trim()}, I am pleased to inform you that you have been offered Provisional Admission to undertake the below programme:<br />
                                <div style={{ marginLeft: "80px" }}>
                                    <p>
                                        <span className='fw-bold fw-bolder'>Title of Programme: {dec.CourseName}</span> <br />
                                        <span className='fw-bold fw-bolder'>Mode of Study: Full-Time</span> <br />
                                        <span className='fw-bold fw-bolder'>Admission Type: {dec.AdmissionType}</span> <br />
                                        <span className='fw-bold fw-bolder'>Term of Admission: {dec.StartMonth} {dec.StartYear} </span> <br />
                                        <span className='fw-bold fw-bolder'>Course Length: {applicantCourse.Duration + " " + applicantCourse.DurationType}</span> <br />
                                        <span className='fw-bold fw-bolder'>Fee Status: Home</span>
                                    </p>
                                </div>
                                <div className="" style={{ fontWeight: "bolder" }}>Fees and other costs</div>
                                <div>
                                    The Tuition Fee for the first year of the programme is stated below
                                </div>
                                <div style={{ marginLeft: "80px" }}>
                                    <span className='fw-bold fw-bolder'>{currencyConverter(parseInt(applicantCourse.TuitionFee))} per semester</span> <br />
                                    <span className='fw-bold fw-bolder'>{currencyConverter(parseInt(applicantCourse.TuitionFee) * 2)} per session</span> <br />
                                    <span className='fw-bold fw-bolder'>N 450,000.00 Accommodation per semester</span> <br />
                                    <span className='fw-bold fw-bolder'>N 20,000.00 Application Processing Fee</span>
                                </div>
                                {/*<div>*/}
                                {/*    As a pioneer student of the university, you are eligible for a 10% tuition discount. Other*/}
                                {/*    discounts include;*/}
                                {/*</div>*/}
                                {/*<div style={{ marginLeft: "80px" }}>*/}
                                {/*    <span className='fw-bold fw-bolder'>10% Discount Siblings</span><br />*/}
                                {/*    <span className='fw-bold fw-bolder'>10% Discount Straight As or 300+ in JAMB and an excellent transcript </span><br />*/}
                                {/*    <span className='fw-bold fw-bolder'>10% Discount GPA of 3.6 on a scale of 4 in their first semester</span>*/}
                                {/*</div>*/}
                                <br />
                                <div> Please note that this offer of admission is subject to your acceptance of the conditions and undertaking.</div>
                                <div>Please accept my congratulations on your admission!</div>
                                <img src={require("./reg_sign.png")} style={{ width: "240px", height: '50px', marginTop: '15px' }} />
                                <div>
                                    Mani Ibrahim Ahmad, PhD. FNIM<br />
                                    Registrar
                                </div>
                            </div>
                        </div>
                    </div>



                </div>
            }
        </div >
    )
}
export default CosmopolitanAdmissionLetter