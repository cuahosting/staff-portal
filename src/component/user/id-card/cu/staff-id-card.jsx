import React from 'react'
import {
    serverLink, projectName,
    projectPhone
} from '../../../../resources/url';
import './cu-id-card.css'
import { useQRCode } from 'next-qrcode';
import { Link } from "react-router-dom";
import { projectURL, shortCode } from '../../../../resources/constants';
import CULogo from './cu-logo.png'
import Sign from './cu_vc_sign.png'




export default function CUStaffIdCard(props) {
    const { Image } = useQRCode();

    return (
        <div>
            {props.renderIDCard && props.createRequest.CardType === "Staff" && (
                <>
                    {props.selectedStaff.staffInfo !== "undefined" && props.selectedStaff.staffInfo !== "" &&
                        props.selectedStaff.staffBiometric !== "undefined" && props.selectedStaff.staffBiometric !== ""
                        && props.selectedStaff.staffInfo.length > 0 && props.selectedStaff.staffBiometric.length > 0 ? (
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
                                                        alt="Staff Picture"
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
                                                        props.selectedStaff.staffBiometric[0]?.Passport.includes("simplefileupload") ?
                                                            props.selectedStaff.staffBiometric[0].Passport :
                                                            `${serverLink}public/uploads/${shortCode}/biometric/${props.selectedStaff.staffBiometric[0].Passport}`
                                                    }
                                                    alt="Staff Picture"
                                                />
                                            </div>
                                            <div className="bottom">
                                                <p style={{ fontSize: '17px', marginTop: '15px' }}>
                                                    <span >
                                                        {props.selectedStaff.staffInfo[0]?.FirstName}{" "}
                                                        {props.selectedStaff.staffInfo[0]?.MiddleName[0]?.toUpperCase()}{". "}
                                                        {props.selectedStaff.staffInfo[0]?.Surname}
                                                    </span>
                                                    < br />
                                                    <h6>({props.selectedStaff.staffInfo[0].StaffID})</h6>
                                                </p>
                                                <p style={{ fontSize: '12px', marginTop: '-15px' }}>
                                                    {props.data.designation.length > 0 &&
                                                        props.data.designation
                                                            .filter(
                                                                (i) =>
                                                                    i.EntryID === props.selectedStaff.staffInfo[0].DesignationID
                                                            ).map(
                                                                (r) => r.DesignationName
                                                            )
                                                    }
                                                </p>
                                                <div className="barcode">
                                                    <Image
                                                        text={`${projectURL}/details/?q=${props.selectedStaff.staffInfo[0]?.FirstName.toLowerCase() + "-" + props.selectedStaff.staffInfo[0]?.MiddleName.toLowerCase() + "-" + props.selectedStaff.staffInfo[0]?.Surname?.toLowerCase()}`}
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
                                                    {props.selectedStaff.staffInfo[0]?.PhoneNumber} |&nbsp; 
                                                    {props.selectedStaff.staffInfo[0]?.EmailAddress?.toString()?.toLowerCase()}
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
                                                    alt="Staff Picture"
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
                                                        alt="Staff Picture"
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
                            Selected staff biometric and passport is empty, kindly
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
