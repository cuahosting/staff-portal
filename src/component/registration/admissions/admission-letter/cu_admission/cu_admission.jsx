import { useEffect, useState } from 'react';
import './cu_admission.css'
import BgImage from './cu_bg_1.jpg'
import VCSign from './cu_sign.png'
import RegSign from './reg_sign.png'
import { currencyConverter, formatDate, formatDateAndTime } from '../../../../../resources/constants';

const CosmopolitanAdmissionLetter = (props) => {
    const applicantCourse = props.data.applicantCourse[0];
    const applicantInfo = props.data.applicantInfo[0];
    const decison = props.data.decison;
    const dec = props.data.decisionDetails[0]
    const school = props.data.school
    const isScholarship = props.data.isScholarship || false;
    const scholarshipBody = props.data.scholarshipBody || '';
    const today = new Date();
    const faculty = props.data.facultyDetails[0]
    const title = isScholarship ? "SCHOLARSHIP OFFER OF ADMISSION" :
        (props.data.decison.type === "Conditional" ? "CONDITIONAL OFFER OF ADMISSION" : "OFFER OF PROVISIONAL ADMISSION");

    let cons_ = []
    if (props.data.decison.con1 !== "") { cons_.push(props.data.decison.con1) }
    if (props.data.decison.con2 !== "") { cons_.push(props.data.decison.con2) }
    if (props.data.decison.con3 !== "") { cons_.push(props.data.decison.con3) }
    if (props.data.decison.con4 !== "") { cons_.push(props.data.decison.con4) }
    if (props.data.decison.con5 !== "") { cons_.push(props.data.decison.con5) }
    if (props.data.decison.con6 !== "") { cons_.push(props.data.decison.con6) }

    const [data, setData] = useState([props.data])

    return (
        <div>
            {data.length > 0 &&
                <div>
                    <div className="admission-letter-body" style={{
                        backgroundImage: `url(${BgImage})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundColor: 'transparent',
                        minHeight: '297mm',
                        width: '210mm',
                        padding: '0',
                        margin: '0 auto',
                        fontFamily: "'Times New Roman', Times, serif",
                        fontSize: '12pt',
                        lineHeight: '1.5',
                        color: '#333'
                    }} ref={props.componentRef}>

                        <div style={{ padding: '240px 50px 40px 50px' }}>
                            {/* Two Column Header - Student Info (Left) and Reference (Right) */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                                {/* Left Column - Student Info */}
                                <div style={{ flex: 1 }}>
                                    <p style={{ marginBottom: '3px', fontSize: '11pt' }}>
                                        <strong>{applicantInfo.Surname?.toUpperCase()} {applicantInfo.MiddleName?.toUpperCase() || ''} {applicantInfo.FirstName?.toUpperCase()}</strong>
                                    </p>
                                    <p style={{ marginBottom: '0', fontSize: '11pt', color: '#555' }}>
                                        {applicantInfo.Address || 'Nigeria'}
                                    </p>
                                </div>
                                {/* Right Column - Reference and Date */}
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '11pt', marginBottom: '3px' }}>
                                        <strong>Our Ref:</strong> CU/REG/ADM/{dec.AdmissionSemester?.split('-')[0]}/{dec.ApplicationID}
                                    </p>
                                    <p style={{ fontSize: '11pt', marginBottom: '0' }}>
                                        <strong>Date:</strong> {formatDateAndTime(formatDate(dec.InsertedOn), "date")}
                                    </p>
                                </div>
                            </div>

                            {/* Salutation */}
                            <p style={{ marginBottom: '15px', fontSize: '12pt' }}>Dear <strong>{applicantInfo.FirstName}</strong>,</p>

                            {/* Title */}
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '20px',
                                padding: '10px',
                                backgroundColor: isScholarship ? 'rgba(0, 100, 0, 0.1)' : 'rgba(0, 51, 102, 0.1)',
                                borderRadius: '5px'
                            }}>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '14pt',
                                    fontWeight: 'bold',
                                    color: isScholarship ? '#006400' : '#003366',
                                    textDecoration: 'underline'
                                }}>
                                    {title}
                                </h3>
                                {isScholarship && scholarshipBody && (
                                    <p style={{ margin: '5px 0 0 0', fontSize: '11pt', fontStyle: 'italic', color: '#006400' }}>
                                        Sponsored by: {scholarshipBody}
                                    </p>
                                )}
                            </div>

                            {/* Main Body */}
                            <p style={{ textAlign: 'justify', marginBottom: '15px', fontSize: '12pt' }}>
                                Further to your application for admission to study at <strong>{school.name.split("|")[0].trim()}</strong>,
                                I am pleased to inform you that you have been offered {isScholarship ? 'a Scholarship' : 'Provisional'} Admission
                                to undertake the programme below:
                            </p>

                            {/* Programme Details Box */}
                            <div style={{
                                marginLeft: '30px',
                                marginBottom: '20px',
                                padding: '15px 20px',
                                backgroundColor: '#f8f9fa',
                                borderLeft: '4px solid #003366',
                                borderRadius: '0 5px 5px 0'
                            }}>
                                <table style={{ width: '100%', fontSize: '11pt' }}>
                                    <tbody>
                                        <tr><td style={{ width: '40%', padding: '4px 0' }}><strong>Title of Programme:</strong></td><td>{dec.CourseName}</td></tr>
                                        <tr><td style={{ padding: '4px 0' }}><strong>Mode of Study:</strong></td><td>Full-Time</td></tr>
                                        <tr><td style={{ padding: '4px 0' }}><strong>Admission Type:</strong></td><td>{dec.AdmissionType}</td></tr>
                                        <tr><td style={{ padding: '4px 0' }}><strong>Term of Admission:</strong></td><td>{dec.StartMonth} {dec.StartYear}</td></tr>
                                        <tr><td style={{ padding: '4px 0' }}><strong>Course Duration:</strong></td><td>{applicantCourse.Duration} {applicantCourse.DurationType}</td></tr>
                                        <tr><td style={{ padding: '4px 0' }}><strong>Fee Status:</strong></td><td>{isScholarship ? 'Scholarship' : 'Home'}</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Fees Section - Only show for regular admission, not scholarship */}
                            {!isScholarship && (
                                <>
                                    <h4 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px', color: '#003366' }}>
                                        Fees and Other Costs
                                    </h4>
                                    <p style={{ marginBottom: '10px', fontSize: '11pt' }}>
                                        The Tuition Fee for the first year of the programme is stated below:
                                    </p>
                                    <div style={{
                                        marginLeft: '30px',
                                        marginBottom: '20px',
                                        padding: '15px 20px',
                                        backgroundColor: '#fff8e1',
                                        borderLeft: '4px solid #ffc107',
                                        borderRadius: '0 5px 5px 0'
                                    }}>
                                        <table style={{ width: '100%', fontSize: '11pt' }}>
                                            <tbody>
                                                <tr><td style={{ padding: '4px 0' }}>Tuition Fee (per semester):</td><td style={{ textAlign: 'right' }}><strong>{currencyConverter(parseInt(applicantCourse.TuitionFee || 0))}</strong></td></tr>
                                                <tr><td style={{ padding: '4px 0' }}>Tuition Fee (per session):</td><td style={{ textAlign: 'right' }}><strong>{currencyConverter(parseInt(applicantCourse.TuitionFee || 0) * 2)}</strong></td></tr>
                                                <tr><td style={{ padding: '4px 0' }}>Accommodation (per semester):</td><td style={{ textAlign: 'right' }}><strong>₦450,000.00</strong></td></tr>
                                                <tr><td style={{ padding: '4px 0' }}>Application Processing Fee:</td><td style={{ textAlign: 'right' }}><strong>₦20,000.00</strong></td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {/* Scholarship Note */}
                            {isScholarship && scholarshipBody && (
                                <div style={{
                                    marginBottom: '20px',
                                    padding: '15px 20px',
                                    backgroundColor: 'rgba(0, 100, 0, 0.05)',
                                    borderLeft: '4px solid #006400',
                                    borderRadius: '0 5px 5px 0'
                                }}>
                                    <p style={{ margin: 0, fontSize: '11pt' }}>
                                        <strong>Scholarship Information:</strong> Your tuition and related fees are sponsored by <strong>{scholarshipBody}</strong>.
                                        Please ensure compliance with all scholarship requirements and conditions.
                                    </p>
                                </div>
                            )}

                            {/* Closing */}
                            <p style={{ textAlign: 'justify', marginBottom: '10px', fontSize: '11pt' }}>
                                Please note that this offer of admission is subject to your acceptance of the conditions and undertaking.
                            </p>
                            <p style={{ marginBottom: '20px', fontSize: '11pt' }}>
                                Please accept my congratulations on your admission!
                            </p>

                            {/* Signature Section */}
                            <div style={{ marginTop: '30px' }}>
                                <img src={RegSign} style={{ width: '180px', height: '45px' }} alt="Registrar Signature" />
                                <div style={{ borderTop: '1px solid #333', width: '280px', paddingTop: '5px', marginTop: '5px' }}>
                                    <p style={{ margin: 0, fontSize: '11pt' }}><strong>Mani Ibrahim Ahmad, PhD. FNIM</strong></p>
                                    <p style={{ margin: 0, fontSize: '10pt', color: '#555' }}>Registrar</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '50px',
                                right: '50px',
                                textAlign: 'center',
                                fontSize: '9pt',
                                color: '#666',
                                borderTop: '1px solid #ccc',
                                paddingTop: '10px'
                            }}>
                                <p style={{ margin: 0 }}>
                                    Cosmopolitan University, Abuja | www.cosmopolitan.edu.ng | admissions@cosmopolitan.edu.ng
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}
export default CosmopolitanAdmissionLetter