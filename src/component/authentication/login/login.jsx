import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { setDashboardData, setLoginDetails, setPermissionDetails } from "../../../actions/setactiondetails";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Audit, encryptData, projectLogo } from "../../../resources/constants";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";
import { GoogleLogin } from "@react-oauth/google";
import "./login.css";

function Login(props) {
  const navigate = useNavigate();
  const [login, setLogin] = useState({
    StaffID: "",
    Password: "",
  });

  useEffect(() => {
    props.setOnDashboardData([])
  }, [])

  const onEdit = (e) => {
    setLogin({
      ...login,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const sendData = {
      username: login.StaffID,
      password: encryptData(login.Password),
    };

    if (login.StaffID === "") {
      showAlert("Empty Field", "Please enter your staff ID", "error");
      return false;
    }

    if (login.Password === "") {
      showAlert("Empty Field", "Please enter your password", "error");
      return false;
    }

    toast.info("Login.... Please wait");

    const { success, data } = await api.post("login/staff_portal_login", sendData);

    if (success && data?.message === "success") {
      Audit(login.StaffID, 'logged in to staff portal', data.userData[0].token);
      toast.success("Login successful");
      props.setOnPermissionDetails(data.permissionData);
      props.setOnLoginDetails(data.userData);
      navigate("/");
    } else if (success) {
      toast.error("Invalid login credentials. Please check and try again!");
    }
  };

  const onGoogleLoginSuccess = async (credentialResponse) => {
    try {
      toast.info("Authenticating with Google... Please wait");

      const sendData = {
        token: credentialResponse.credential,
      };

      const { success, data } = await api.post("login/staff_portal_login/auth", sendData);

      if (success && data?.message === "success") {
        Audit(data.userData[0].StaffID, 'logged in to staff portal via Google', data.userData[0].token);
        toast.success("Login successful");
        props.setOnPermissionDetails(data.permissionData);
        props.setOnLoginDetails(data.userData);
        navigate("/");
      } else if (success) {
        showAlert(
          "AUTHENTICATION FAILED",
          "Unable to authenticate with Google. Please try again or use username/password!",
          "error"
        );
      }
    } catch (error) {
      console.log(error);
      showAlert(
        "ERROR",
        "An error occurred during Google authentication. Please try again!",
        "error"
      );
    }
  };

  const onGoogleLoginError = () => {
    showAlert(
      "GOOGLE LOGIN FAILED",
      "Failed to login with Google. Please try again or use username/password!",
      "error"
    );
  };

  return (
    <>
      <div className="login-split-container">
        {/* Left Panel - Image */}
        <div className="login-left-panel" style={{ backgroundImage: "url('/students-studying-together-medium-shot.jpg')" }}>
          <div className="login-left-content">
            <h1 className="login-left-title">Empowering Education Together</h1>
            <p className="login-left-subtitle">Seamlessly manage your academic journey with the Cosmopolitan University Staff Portal.</p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="login-right-panel">
          <div className="login-form-wrapper">
            {/* Header - Outside Card */}
            <div className="login-header">
              <img alt="Logo" src="/logo.png" className="login-header-logo" />
              <h1 className="login-title">Sign In</h1>
              <div className="login-subtitle">
                Enter your details to access your account
              </div>
            </div>

            {/* Form Card */}
            <div className="login-form-card">
              <form
                onSubmit={onSubmit}
                className="form w-100"
                noValidate="novalidate"
                id="kt_sign_in_form"
                action="#"
              >
                <div className="fv-row mb-8">
                  <label className="login-label">
                    Staff ID
                  </label>
                  <input
                    className="login-input"
                    type="text"
                    name="StaffID"
                    value={login.StaffID}
                    onChange={onEdit}
                    autoComplete="off"
                    placeholder="Enter your Staff ID"
                  />
                </div>

                <div className="fv-row mb-10">
                  <div className="d-flex flex-stack mb-2 justify-content-between align-items-center w-100">
                    <label className="login-label mb-0">
                      Password
                    </label>
                  </div>
                  <input
                    className="login-input"
                    type="password"
                    name="Password"
                    value={login.Password}
                    onChange={onEdit}
                    autoComplete="off"
                    placeholder="Enter your password"
                  />
                  <Link to={"/forgot-password"} className="login-forgot-link">
                    Forgot Password?
                  </Link>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    id="kt_sign_in_submit"
                    className="login-btn mb-5"
                  >
                    {!login.isLoading ? (
                      <span className="indicator-label">Login</span>
                    ) : (
                      <span className="indicator-progress">
                        Please wait...
                        <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                      </span>
                    )}
                  </button>

                  <div className="login-divider">
                    <span>OR</span>
                  </div>

                  <div className="google-login-wrapper">
                    <GoogleLogin
                      onSuccess={onGoogleLoginSuccess}
                      onError={onGoogleLoginError}
                      theme="outline"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                      width="300"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Feature Keywords - Outside Card */}
            <div className="login-features">
              <div className="login-feature">
                <i className="fa fa-lock"></i>
                <span>Secured</span>
              </div>
              <div className="login-feature">
                <i className="fa fa-briefcase"></i>
                <span>Professional</span>
              </div>
              <div className="login-feature">
                <i className="fa fa-mobile-alt"></i>
                <span>Responsive</span>
              </div>
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
    setOnPermissionDetails: (p) => {
      dispatch(setPermissionDetails(p));
    },
    setOnDashboardData: (p) => {
      dispatch(setDashboardData(p));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
