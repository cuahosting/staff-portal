import React from 'react'
import { Link } from 'react-router-dom'
import { encryptData, projectStudentURL, shortCode } from '../../../../resources/constants'
import { projectAddress, projectEmail, projectName, projectPhone, serverLink } from '../../../../resources/url'
import Sign from './bau_reg_sign.png'
import BAULogo from './bau-logo.png'
import { useQRCode } from 'next-qrcode';
import './bau-id-card.css'

export default function BAUStudentIdCard(props) {
    const { Image } = useQRCode();
    return (
        <div>
            {props.renderIDCard && props.createRequest.CardType === "Student" && (
                <>
                    {props.selectedStudent.studentInfo !== "undefined" && props.selectedStudent.studentInfo !== "" &&
                        props.selectedStudent.studentBiometric !== "undefined" && props.selectedStudent.studentBiometric !== ""
                        && props.selectedStudent.studentInfo.length > 0 && props.selectedStudent.studentBiometric.length > 0 ? (
                        <>
                            <div className="content-holder col-md-3 pt-5" ref={props.componentRef}>
                                {/*FRONT PAGE*/}
                                <div className="padding">
                                    <div className="front">
                                        <div className="top">
                                            <h1 className="Details">
                                                <div className="d-flex justify-content-between">
                                                    <img style={{
                                                        width: "50px",
                                                        height: "50px",
                                                    }}
                                                        src={BAULogo}
                                                        alt="Staff Picture"
                                                    />
                                                    {projectName}
                                                </div>
                                            </h1>

                                            <h1 className="Details">
                                                <img className="top_img"
                                                    src={
                                                        props.selectedStudent.studentBiometric[0]?.Passport.includes("simplefileupload") ? props.selectedStudent.studentBiometric[0]?.Passport :
                                                            `${serverLink}public/uploads/${shortCode}/biometric/${props.selectedStudent.studentBiometric[0].Passport}`
                                                    }
                                                    alt="Staff Picture"
                                                />
                                            </h1>
                                        </div>
                                        <div className="bottom">
                                            <p>
                                                <span style={{ fontSize: '13px' }}>
                                                    {props.selectedStudent.studentInfo[0]?.FirstName}{" "}
                                                    {props.selectedStudent.studentInfo[0]?.MiddleName}{" "}
                                                    {props.selectedStudent.studentInfo[0]?.Surname}
                                                </span>
                                                < br />
                                                <h6 style={{ fontSize: '13px' }}>({props.selectedStudent.studentInfo[0].StudentID})</h6>
                                            </p>
                                            <p className="desi">
                                                {props.data.courses.length > 0 &&
                                                    props.data.courses
                                                        .filter(
                                                            (i) =>
                                                                i.CourseCode === props.selectedStudent.studentInfo[0].CourseCode
                                                        ).map(
                                                            (r) => r.CourseName
                                                        )
                                                }
                                            </p>

                                            <div className="barcode">
                                                <Image
                                                    text={`${projectStudentURL}/student/${encryptData(props.selectedStudent.studentInfo[0].StudentID)}`}
                                                    options={{
                                                        type: 'image/jpeg',
                                                        quality: 0.3,
                                                        level: 'M',
                                                        margin: 3,
                                                        scale: 4,
                                                        width: 200,
                                                        color: {
                                                            dark: '#010599FF',
                                                            light: '#FFBF60FF',
                                                        },
                                                    }}
                                                />
                                            </div>

                                            {/*<h5 className="expiry-date pt-5">Valid Until: </h5>*/}
                                            <div className="staff-type p-3" style={{ fontSize: '14px' }}>
                                                {props.createRequest.CardType}{" "} ID Card
                                            </div>
                                        </div>

                                    </div>

                                </div>

                                <div className="pagebreak"></div>

                                {/*BACK PAGE*/}
                                <div className="padding">
                                    <div className="front">
                                        <div className="back-university-name">
                                            <h1 className="Details">
                                                <div className="d-flex justify-content-between">
                                                    <img style={{
                                                        width: "50px",
                                                        height: "50px",
                                                    }}
                                                        src={BAULogo}
                                                        alt="Staff Picture"
                                                    />

                                                    {projectName}
                                                </div>

                                            </h1>
                                        </div>
                                        <div className="hr">
                                            <div className="details-info" style={{ height: 'auto' }} >
                                                <p><b>Registrar's Signature</b></p>
                                                <div style={{
                                                    textAlign: 'center'
                                                }}>
                                                    <img style={{
                                                        width: "190px",
                                                        height: "70px",
                                                    }}
                                                        src={Sign}
                                                        alt="registrar sign"
                                                    />
                                                    <br />
                                                    <p className="back-text">{projectAddress}</p>
                                                    <p className="back-text"><strong>Email</strong>:{" "}{projectEmail}</p>
                                                    <p className="back-text"><strong>Tel</strong>:{" "}{shortCode === "BAUK" ? '+234 (0) 8087555544' : projectPhone}</p>


                                                </div>
                                                <div className="staff-type-back p-3" style={{ fontSize: '14px', marginTop: '17px' }}>
                                                    {props.createRequest.CardType}{" "} ID Card
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="alert alert-info">
                            Selected student biometric and passport is empty, kindly click here to capture.
                            {" "}
                            <Link to="/users/capture/biometric">
                                click here to capture
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
