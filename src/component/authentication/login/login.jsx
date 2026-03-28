import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { setDashboardData, setLoginDetails, setPermissionDetails } from "../../../actions/setactiondetails";
import { useNavigate } from "react-router-dom";
import { Audit, projectLogo } from "../../../resources/constants";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";
import { useGoogleLogin } from "@react-oauth/google";
import "./login.css";

function Login(props) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    props.setOnDashboardData([])
  }, [])

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        toast.info("Authenticating with Google... Please wait");
        const { success, data } = await api.post("login/staff_portal_login/google", { access_token: tokenResponse.access_token });
        setIsLoading(false);
        if (success && data?.message === "success") {
          Audit(data.userData[0].StaffID, 'logged in to staff portal via Google', data.userData[0].token);
          toast.success("Login successful");
          props.setOnPermissionDetails(data.permissionData);
          props.setOnLoginDetails(data.userData);
          navigate("/");
        } else if (success) {
          showAlert("AUTHENTICATION FAILED", "Unable to authenticate with Google. Please try again!", "error");
        }
      } catch (error) {
        setIsLoading(false);
        showAlert("ERROR", "An error occurred during Google authentication. Please try again!", "error");
      }
    },
    onError: () => {
      showAlert("GOOGLE LOGIN FAILED", "Failed to login with Google. Please try again!", "error");
    },
  });


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
              <h1 className="login-title">Staff Portal</h1>
              <div className="login-subtitle">
                Sign in with your Google account to continue
              </div>
            </div>

            {/* Form Card */}
            <div className="login-form-card">
              <div className="py-5 px-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="google-sso-btn"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    backgroundColor: '#fff',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#4285F4'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(66,133,244,0.15)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Sign in with Google</span>
                    </>
                  )}
                </button>
              </div>
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
