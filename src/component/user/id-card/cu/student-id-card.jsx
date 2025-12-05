import React from 'react'
import { Link } from 'react-router-dom'
import { encryptData, projectStudentURL, shortCode } from '../../../../resources/constants'
import { projectName, projectPhone, serverLink } from '../../../../resources/url'
import Sign from './cu_vc_sign.png'
import { useQRCode } from 'next-qrcode';
import './cu-id-card.css'
import CULogo from './cu-logo.png'


export default function CUStudentIdCard(props) {
    const { Image } = useQRCode();
    return (
        <div>
            {props.renderIDCard && props.createRequest.CardType === "Student" && (
                <>
                    {props.selectedStudent.studentInfo !== "undefined" && props.selectedStudent.studentInfo !== "" &&
                        props.selectedStudent.studentBiometric !== "undefined" && props.selectedStudent.studentBiometric !== ""
                        && props.selectedStudent.studentInfo.length > 0 && props.selectedStudent.studentBiometric.length > 0 ? (
                        <>
                            <div style={{ borderStyle: '1px solid' }} ref={props.componentRef}>
                                <div className='row'>
                                    <div className='col-md-6'>
                                        <div className='id_front'>
                                            <div className='id_front_top'>
                                                <div className='d-flex'>
                                                    <img style={{
                                                        width: "50px",
                                                        height: "50px",
                                                        backgroundColor: 'white',
                                                        borderRadius: '50%'
                                                    }}
                                                        src={CULogo}
                                                        alt="University Logo"
                                                    />
                                                    <div className='id_front_top_text'>
                                                        {projectName}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <img
                                                    className="id_front_middle_image"
                                                    src={
                                                        props.selectedStudent.studentBiometric[0]?.Passport.includes("simplefileupload") ? props.selectedStudent.studentBiometric[0]?.Passport :
                                                            `${serverLink}public/uploads/${shortCode}/biometric/${props.selectedStudent.studentBiometric[0].Passport}`
                                                    }
                                                    alt="Student Passport"
                                                />
                                            </div>
                                            <div className="bottom">
                                                <p style={{ fontSize: '17px', marginTop: '15px' }}>
                                                    <span >
                                                        {props.selectedStudent.studentInfo[0]?.FirstName}{" "}
                                                        {props.selectedStudent.studentInfo[0]?.MiddleName[0]?.toUpperCase()}{". "}
                                                        {props.selectedStudent.studentInfo[0]?.Surname}
                                                    </span>
                                                    < br />
                                                    <h6>({props.selectedStudent.studentInfo[0].StudentID})</h6>
                                                </p>
                                                <p style={{ fontSize: '12px', marginTop: '-15px' }}>
                                                    {props.data.courses.length > 0 &&
                                                        props.data.courses
                                                            .filter(
                                                                (i) =>
                                                                    i.CourseCode === props.selectedStudent.studentInfo[0]?.CourseCode
                                                            ).map(
                                                                (r) => r.CourseName
                                                            )
                                                    }
                                                </p>
                                                <div className="barcode">
                                                    <Image
                                                        text={`${projectStudentURL}/student/${encryptData(props.selectedStudent.studentInfo[0]?.StudentID)}`}
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
                                                <p style={{ fontSize: '10px', marginTop: '-15px' }}>
                                                    {props.selectedStudent.studentInfo[0]?.PhoneNumber} |&nbsp;
                                                    {props.selectedStudent.studentInfo[0]?.EmailAddress?.toString()?.toLowerCase()}
                                                </p>
                                                <div className="id_card_footer_front p-3 mt-10" >
                                                    {props.createRequest.CardType}{" "} ID Card
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='col-md-6'>
                                        <div className='id_back'>
                                            <div className='id_back_top'>
                                                <img style={{
                                                    width: "90px",
                                                    height: "90px",
                                                    borderRadius: '50%'
                                                }}
                                                    src={CULogo}
                                                    alt="University Logo"
                                                />
                                            </div>
                                            <div className="bottom">
                                                <ul style={{ fontSize: '12px', fontWeight: 'bold', margin: '5px', }}>
                                                    <li>This Card is to be used by the holder for his/her stay at Cosmopolitan University, Abuja</li>
                                                    <li>It must be carried all times and presented on demand</li>
                                                    <li>It must be returned to the Security Unit upon leaving the service of the University</li>
                                                </ul>
                                                <div style={{ textAlign: 'center' }}>
                                                    <img style={{
                                                        width: "150px",
                                                        height: "50px",
                                                    }}
                                                        src={Sign}
                                                        alt="Signature"
                                                    />
                                                </div>
                                                <p style={{ fontSize: '12px', marginTop: '-40px' }}>
                                                    <strong>Tel</strong>:{" "}{shortCode === "CU" ? '+234 (0) 80334789667' : projectPhone}
                                                </p>
                                                <div className="id_card_footer_back p-3" >
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
