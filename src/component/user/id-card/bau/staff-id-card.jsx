import React from 'react'
import {
    serverLink, projectAddress,
    projectEmail,
    projectName,
    projectPhone
} from '../../../../resources/url';
import Sign from './bau_reg_sign.png'
import BAULogo from './bau-logo.png'
import './bau-id-card.css'
import { useQRCode } from 'next-qrcode';
import { Link } from "react-router-dom";
import { projectURL, shortCode } from '../../../../resources/constants';


export default function BAUStaffIdCard(props) {
    const { Image } = useQRCode();

    return (
        <div>
            {props.renderIDCard && props.createRequest.CardType === "Staff" && (
                <>
                    {props.selectedStaff.staffInfo !== "undefined" && props.selectedStaff.staffInfo !== "" &&
                        props.selectedStaff.staffBiometric !== "undefined" && props.selectedStaff.staffBiometric !== ""
                        && props.selectedStaff.staffInfo.length > 0 && props.selectedStaff.staffBiometric.length > 0 ? (
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
                                                {""}
                                                <img
                                                    className="top_img"
                                                    src={
                                                        props.selectedStaff.staffBiometric[0]?.Passport.includes("simplefileupload") ?
                                                            props.selectedStaff.staffBiometric[0].Passport :
                                                            `${serverLink}public/uploads/${shortCode}/biometric/${props.selectedStaff.staffBiometric[0].Passport}`
                                                    }
                                                    alt="Staff Picture"
                                                />
                                            </h1>
                                        </div>
                                        <div className="bottom">
                                            <p>
                                                <span style={{ fontSize: '13px' }}>
                                                    {props.selectedStaff.staffInfo[0]?.FirstName}{" "}
                                                    {props.selectedStaff.staffInfo[0]?.MiddleName}{" "}
                                                    {props.selectedStaff.staffInfo[0]?.Surname}
                                                </span>
                                                < br />
                                                <h6 style={{ fontSize: '13px' }}>({props.selectedStaff.staffInfo[0].StaffID})</h6>
                                            </p>
                                            <p className="desi">
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
                                                    text={`${projectURL}/details/?q=${props.selectedStaff.staffInfo[0]?.FirstName.toLowerCase() + "-" + props.selectedStaff.staffInfo[0]?.MiddleName.toLowerCase() + "-" + props.selectedStaff.staffInfo[0]?.Surname.toLowerCase()}`}
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
                                                        alt="Staff Picture"
                                                    />
                                                    <hr />
                                                    <p className="back-text">{projectAddress}
                                                        <br />
                                                        <strong>Email</strong>:{" "}{projectEmail}
                                                        <br />
                                                        <strong>Tel</strong>:{" "}{shortCode === "BAUK" ? '+234 (0) 8087555544' : projectPhone}
                                                    </p>


                                                </div>
                                                <div className="staff-type-back p-3" style={{ fontSize: '14px', marginTop: '16px' }}>
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
