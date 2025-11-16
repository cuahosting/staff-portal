import React, { useState } from "react";
import { connect } from "react-redux";
import { setLoginDetails } from "../../../actions/setactiondetails";
import { Link, NavLink } from "react-router-dom";
import { EmailTemplates, encryptData, projectLogo, sendEmail } from "../../../resources/constants";
import { toast } from "react-toastify";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import "./auth-animations.css";

function ForgotPassword(props)
{
  const [reset, setReset] = useState({
    EmailAddress: "",
  });

  const onEdit = (e) =>
  {
    setReset({
      ...reset,
      [e.target.name]: e.target.value,
    });
  };


  const onSubmit = async (e) =>
  {
    e.preventDefault();
    const token = "pa" + Math.floor(Math.random() * 999999999);
    const email = EmailTemplates('5', encryptData(token));
    toast.info('loading, please wait...')
    await axios.patch(`${serverLink}login/forget_password/add_token/${reset.EmailAddress}`, { token: encryptData(token) })
      .then((result) =>
      {
        if (result.data.message === "success")
        {
          toast.success('An email have been sent to your mailbox, please check and proceed.')
          sendEmail(
            reset.EmailAddress, email.subject, email.title, reset.EmailAddress, email.body, '', ''
          )
        }
        else if (result.data.message === "no email")
        {
          toast.error('Sorry!, your email address is not registered')
        }
        else
        {
          // toast.error('Please try again.')
        }
      }).catch((e) =>
      {
        console.log('NETWORK ERROR')
      })

  }

  return (
    <>
      <div className="d-flex flex-column flex-root auth-page auth-background">
        <div className="d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed">
          <div className="d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20">
            <div className="w-lg-500px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto auth-card">
              <form
                onSubmit={onSubmit}
                className="form w-100"
                noValidate="novalidate"
                id="kt_sign_in_form"
                action="#"
              >
                <div className="text-center mb-10">
                  <img alt="Logo" src={projectLogo} className="h-80px mb-5 auth-logo" />
                  <h1 className="text-dark mb-3 auth-title">Forgot Password?</h1>
                  <div className="auth-description">
                    Enter your email address and we'll send you a link to reset your password.
                  </div>
                </div>

                <div className="fv-row mb-10 auth-form-group">
                  <label className="form-label fs-6 fw-bolder text-dark auth-label">
                    Staff Email Address
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      className="form-control form-control-lg form-control-solid auth-input"
                      type="email"
                      name="EmailAddress"
                      value={reset.EmailAddress}
                      onChange={onEdit}
                      autoComplete="off"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="text-center auth-form-group">
                  <button
                    type="submit"
                    id="kt_sign_in_submit"
                    className="btn btn-lg btn-primary w-100 mb-5 auth-button"
                  >
                    <span className="indicator-label">Reset Password</span>
                    <span className="indicator-progress">
                      Please wait...
                      <span className="spinner-border spinner-border-sm align-middle ms-2 auth-spinner" />
                    </span>
                  </button>
                </div>
                <div className="text-center auth-form-group">
                  <NavLink to={'/'} className="auth-link text-primary fw-bold">
                    <i className="bi bi-arrow-left me-2"></i>Back to Login
                  </NavLink>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) =>
{
  return {
    loginData: state.LoginDetails,
  };
};

const mapDispatchToProps = (dispatch) =>
{
  return {
    setOnLoginDetails: (p) =>
    {
      dispatch(setLoginDetails(p));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
