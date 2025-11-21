import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { setDashboardData, setLoginDetails, setPermissionDetails } from "../../../actions/setactiondetails";
import { Link } from "react-router-dom";
import { Audit, decryptData, EmailTemplates, encryptData, projectLogo, sendEmail } from "../../../resources/constants";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { GoogleLogin } from "@react-oauth/google";
import "./auth-animations.css";

function Login(props)
{
  const [login, setLogin] = useState({
    StaffID: "",
    Password: "",
  });

  useEffect(() =>
  {
    props.setOnDashboardData([])
    // console.log(decryptData('QXNudzM2cm9uV1JodzdwcFlXcFNXQT09'))
  }, [])


  const onEdit = (e) =>
  {
    setLogin({
      ...login,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e) =>
  {
    e.preventDefault();
    const sendData = {
      username: login.StaffID,
      password: login.Password, // Send plain text password to match backend expectation
    };

    if (login.StaffID === "")
    {
      showAlert("Empty Field", "Please enter your staff ID", "error");
      return false;
    }

    if (login.Password === "")
    {
      showAlert("Empty Field", "Please enter your password", "error");
      return false;
    }

    toast.info("Login.... Please wait");

    await axios
      .post(`${serverLink}login/staff_portal_login`, sendData)
      .then((result) =>
      {
        if (result.data.message === "success")
        {
          Audit(login.StaffID, 'logged in to staff portal', result.data.userData[0].token)
          toast.success("Login successful");
          props.setOnPermissionDetails(result.data.permissionData);
          props.setOnLoginDetails(result.data.userData);
        } else
        {
          showAlert(
            "INVALID",
            "Invalid login credentials. Please check and try again!",
            "error"
          );
        }
      })
      .catch((error) =>
      {
        console.log(error)
        showAlert(
          "NETWORK ERROR",
          "Please check your network connection and try again!",
          "error"
        );
      });
  };

  const onGoogleLoginSuccess = async (credentialResponse) =>
  {
    try
    {
      toast.info("Authenticating with Google... Please wait");

      const sendData = {
        token: credentialResponse.credential,
      };

      await axios
        .post(`${serverLink}login/staff_portal_login/auth`, sendData)
        .then((result) =>
        {
          if (result.data.message === "success")
          {
            Audit(result.data.userData[0].StaffID, 'logged in to staff portal via Google', result.data.userData[0].token);
            toast.success("Login successful");
            props.setOnPermissionDetails(result.data.permissionData);
            props.setOnLoginDetails(result.data.userData);
          } else
          {
            showAlert(
              "AUTHENTICATION FAILED",
              "Unable to authenticate with Google. Please try again or use username/password!",
              "error"
            );
          }
        })
        .catch((error) =>
        {
          console.log(error);
          showAlert(
            "NETWORK ERROR",
            "Please check your network connection and try again!",
            "error"
          );
        });
    } catch (error)
    {
      console.log(error);
      showAlert(
        "ERROR",
        "An error occurred during Google authentication. Please try again!",
        "error"
      );
    }
  };

  const onGoogleLoginError = () =>
  {
    showAlert(
      "GOOGLE LOGIN FAILED",
      "Failed to login with Google. Please try again or use username/password!",
      "error"
    );
  };


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
                  <h1 className="text-dark mb-3 auth-title">
                    Sign in to the Staff Portal
                  </h1>
                </div>

                <div className="fv-row mb-10 auth-form-group">
                  <label className="form-label fs-6 fw-bolder text-dark auth-label">
                    Staff ID
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      className="form-control form-control-lg form-control-solid auth-input"
                      type="text"
                      name="StaffID"
                      value={login.StaffID}
                      onChange={onEdit}
                      autoComplete="off"
                      placeholder="Enter your Staff ID"
                    />
                  </div>
                </div>

                <div className="fv-row mb-10 auth-form-group">
                  <div className="d-flex flex-stack mb-2">
                    <label className="form-label fw-bolder text-dark fs-6 mb-0 auth-label">
                      Password
                    </label>

                    <Link to={"/forgot-password"} className="auth-link">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="auth-input-wrapper">
                    <input
                      className="form-control form-control-lg form-control-solid auth-input"
                      type="password"
                      name="Password"
                      value={login.Password}
                      onChange={onEdit}
                      autoComplete="off"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div className="text-center auth-form-group">
                  <button
                    type="submit"
                    id="kt_sign_in_submit"
                    className="btn btn-lg btn-primary w-100 mb-5 auth-button"
                  >
                    <span className="indicator-label">Login</span>
                    <span className="indicator-progress">
                      Please wait...
                      <span className="spinner-border spinner-border-sm align-middle ms-2 auth-spinner"></span>
                    </span>
                  </button>

                  <div className="separator separator-content my-5 auth-separator">
                    <span className="w-125px text-gray-500 fw-semibold fs-7">Or</span>
                  </div>

                  <div className="d-flex justify-content-center google-login-wrapper">
                    <GoogleLogin
                      onSuccess={onGoogleLoginSuccess}
                      onError={onGoogleLoginError}
                      theme="outline"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                      width="100%"
                    />
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
    setOnPermissionDetails: (p) =>
    {
      dispatch(setPermissionDetails(p));
    },
    setOnDashboardData: (p) =>
    {
      dispatch(setDashboardData(p));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
