import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { setLoginDetails } from "../../../actions/setactiondetails";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { EmailTemplates, encryptData, projectLogo, sendEmail } from "../../../resources/constants";
import { toast } from "react-toastify";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { Input } from "../../common/form";

function ResetPassword(props) {
    const navigate = useNavigate();
    const token = window.location.href.split('/')[4]
    const [reset, setReset] = useState({
        Password: "",
        cPassword: "",
        EmailAddress: ""
    });

    const ValidateToken = async () => {
        await axios
            .get(`${serverLink}login/forget_password/validate_token/${token}`)
            .then((res) => {
                if (res.data.length === 0) {
                    navigate('/')
                } else {
                    setReset({
                        ...reset,
                        EmailAddress: res.data[0].EmailAddress
                    })
                }
            })
            .catch((err) => {
                console.log("NETWORK ERROR", err);
            });
    };

    useEffect(() => {
        ValidateToken();
    }, [])

    const onEdit = (e) => {
        setReset({
            ...reset,
            [e.target.name]: e.target.value,
        });
    };


    const onSubmit = async (e) => {
        e.preventDefault();
        if (reset.Password !== reset.cPassword) {
            toast.error('Password does not match');
            return;
        }
        const formData = {
            Password: encryptData(reset.Password),
            EmailAddress: reset.EmailAddress
        }
        await axios.patch(`${serverLink}login/forget_password/change_password/${token}`, formData)
            .then((result) => {
                if (result.data.message === "success") {
                    toast.success('Your password have been changed successfully.');
                    navigate('/')
                } else {
                    toast.error('Please try again.')
                }
            }).catch((e) => {
                toast.error('Please try again.')
                console.log('NETWORK ERROR')
            })
    }

    return (
        <>
            <div className="d-flex flex-column flex-root">
                <div className="d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed">
                    <div className="d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20">
                        <div className="w-lg-500px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto">
                            <form
                                onSubmit={onSubmit}
                                className="form w-100"
                                noValidate="novalidate"
                                id="kt_sign_in_form"
                                action="#"
                            >
                                <div className="text-center mb-10">
                                    <img alt="Logo" src={projectLogo} className="h-40px mb-5" />
                                    <h1 className="text-dark mb-3">Reset your password</h1>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <Input
                                        id="Password"
                                        type="password"
                                        value={reset.Password}
                                        onChange={onEdit}
                                        label="Password"
                                        placeholder="Enter new password"
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <Input
                                        id="cPassword"
                                        type="password"
                                        value={reset.cPassword}
                                        onChange={onEdit}
                                        label="Confirm Password"
                                        placeholder="Re-enter new password"
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>

                                <div className="text-center">
                                    <button
                                        type="submit"
                                        id="kt_sign_in_submit"
                                        className="btn btn-lg btn-primary w-100 mb-5"
                                    >
                                        <span className="indicator-label">Reset Password</span>
                                        <span className="indicator-progress">
                                            Please wait...
                                            <span className="spinner-border spinner-border-sm align-middle ms-2" />
                                        </span>
                                    </button>
                                    <div className="text-center">
                                        <NavLink to={'/'} className="link-primary fw-bold">
                                            Back to Login
                                        </NavLink>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setOnLoginDetails: (p) => {
            dispatch(setLoginDetails(p));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
