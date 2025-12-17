import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { setLoginDetails } from "../../../actions/setactiondetails";
import { NavLink, useNavigate } from "react-router-dom";
import { encryptData, projectLogo } from "../../../resources/constants";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";

function ResetPassword(props) {
    const navigate = useNavigate();
    const token = window.location.href.split('/')[4];
    const [reset, setReset] = useState({
        Password: "",
        cPassword: "",
        EmailAddress: ""
    });

    const ValidateToken = async () => {
        const { success, data } = await api.get(`login/forget_password/validate_token/${token}`);

        if (success) {
            if (!data || data.length === 0) {
                navigate('/');
            } else {
                setReset({
                    ...reset,
                    EmailAddress: data[0].EmailAddress
                });
            }
        }
    };

    useEffect(() => {
        ValidateToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        };

        const { success, data } = await api.patch(
            `login/forget_password/change_password/${token}`,
            formData
        );

        if (success && data?.message === "success") {
            toast.success('Your password have been changed successfully.');
            navigate('/');
        } else if (success) {
            toast.error('Please try again.');
        }
    };

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

                                <div className="fv-row mb-10">
                                    <label className="form-label fs-6 fw-bolder text-dark">
                                        Password
                                    </label>

                                    <input
                                        className="form-control form-control-lg form-control-solid"
                                        type="password"
                                        name="Password"
                                        value={reset.Password}
                                        onChange={onEdit}
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="fv-row mb-10">
                                    <label className="form-label fs-6 fw-bolder text-dark">
                                        Confirm Password
                                    </label>

                                    <input
                                        className="form-control form-control-lg form-control-solid"
                                        type="password"
                                        name="cPassword"
                                        value={reset.cPassword}
                                        onChange={onEdit}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="text-center">
                                    <button
                                        type="submit"
                                        id="kt_sign_in_submit"
                                        className="btn btn-lg btn-primary w-100 mb-5"
                                    >
                                        <span className="indicator-label">Reset</span>
                                        <span className="indicator-progress">
                                            Please wait...
                                            <span className="spinner-border spinner-border-sm align-middle ms-2" />
                                        </span>
                                    </button>
                                </div>
                                <NavLink to={'/'}>Back to Login</NavLink>
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
