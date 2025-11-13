import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { setDashboardData, setLoginDetails, setPermissionDetails } from "../../../actions/setactiondetails";
import { Link } from "react-router-dom";
import { Audit, decryptData, EmailTemplates, encryptData, projectLogo, sendEmail } from "../../../resources/constants";
import { toast } from "react-toastify";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { Input } from "../../common/form";
import { validateLogin } from "./loginSchema";

function Login(props)
{
  const [staffID, setStaffID] = useState("");
  const [password, setPassword] = useState("");
  const [staffIDError, setStaffIDError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() =>
  {
    props.setOnDashboardData([])
  }, [])

  const handleStaffIDChange = (e) =>
  {
    setStaffID(e.target.value);
    // Clear error when user starts typing
    if (staffIDError) {
      setStaffIDError("");
    }
  };

  const handlePasswordChange = (e) =>
  {
    setPassword(e.target.value);
    // Clear error when user starts typing
    if (passwordError) {
      setPasswordError("");
    }
  };

  const onSubmit = async (e) =>
  {
    e.preventDefault();

    // Clear previous errors
    setStaffIDError("");
    setPasswordError("");

    // Validate form data with Zod
    const validation = validateLogin({
      StaffID: staffID,
      Password: password
    });

    if (!validation.success) {
      // Set individual field errors
      if (validation.errors.StaffID) {
        setStaffIDError(validation.errors.StaffID);
      }
      if (validation.errors.Password) {
        setPasswordError(validation.errors.Password);
      }

      // Show the first error message
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }

    // Start loading
    setLoading(true);

    const sendData = {
      username: staffID,
      password: encryptData(password),
    };

    toast.info("Signing in... Please wait");

    try {
      const result = await axios.post(`${serverLink}login/staff_portal_login`, sendData);

      setLoading(false);

      if (result.data.message === "success") {
        Audit(staffID, 'logged in to staff portal', result.data.userData[0].token);
        toast.success("Login successful");
        props.setOnPermissionDetails(result.data.permissionData);
        props.setOnLoginDetails(result.data.userData);
      } else {
        toast.error("Invalid login credentials. Please check and try again!");
      }
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error);
      toast.error("Please check your network connection and try again!");
    }
  };



  return (
    <>
      <div className="d-flex flex-column flex-root" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 50%, transparent 100%)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          animation: 'float 10s ease-in-out infinite reverse'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'float 7s ease-in-out infinite 2s'
        }}></div>

        <div className="d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed">
          <div className="d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20">
            <div className="w-lg-500px bg-white rounded-4 p-10 p-lg-15 mx-auto" style={{
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.35), 0 10px 25px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              zIndex: 1,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <form
                onSubmit={onSubmit}
                className="form w-100"
                noValidate="novalidate"
                id="kt_sign_in_form"
                action="#"
              >
                <div className="text-center mb-12">
                  <img
                    alt="Logo"
                    src={projectLogo}
                    className="h-100px mb-6"
                    style={{
                      filter: 'drop-shadow(0 8px 16px rgba(102, 126, 234, 0.2))',
                      animation: 'fadeInDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                  <h1 className="mb-3" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '700',
                    fontSize: '2rem',
                    letterSpacing: '-0.5px',
                    animation: 'fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards'
                  }}>
                    Welcome Back
                  </h1>
                  <p className="text-muted mb-0" style={{
                    fontSize: '1rem',
                    fontWeight: '400',
                    color: '#6c757d',
                    animation: 'fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards'
                  }}>
                    Sign in to access the Staff Portal
                  </p>
                </div>

                <div style={{
                  animation: 'fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards'
                }}>
                  <Input
                    id="StaffID"
                    type="text"
                    value={staffID}
                    onChange={handleStaffIDChange}
                    label="Staff ID"
                    placeholder="Enter your Staff ID"
                    className="form-control-lg form-control-solid"
                    autoComplete="off"
                    error={staffIDError}
                    required
                  />
                </div>

                <div className="mb-4" style={{
                  animation: 'fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s backwards'
                }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span></span>
                    <Link
                      to={"/forgot-password"}
                      className="text-decoration-none"
                      style={{
                        color: '#667eea',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#764ba2';
                        e.target.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#667eea';
                        e.target.style.textDecoration = 'none';
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <Input
                    id="Password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    label="Password"
                    placeholder="Password"
                    className="form-control-lg form-control-solid"
                    autoComplete="off"
                    error={passwordError}
                    required
                  />
                </div>

                <div className="text-center" style={{
                  animation: 'fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s backwards'
                }}>
                  <button
                    type="submit"
                    id="kt_sign_in_submit"
                    className="btn btn-lg w-100 mb-5"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '1.05rem',
                      padding: '16px 24px',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-3px) scale(1.02)';
                        e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.35)';
                    }}
                  >
                    {!loading ? (
                      <span className="indicator-label" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}>
                        Sign In
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease' }}>
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </span>
                    ) : (
                      <span className="indicator-progress d-flex align-items-center justify-content-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Signing in...
                      </span>
                    )}
                  </button>
                </div>

                {/* CSS Animations */}
                <style>{`
                  @keyframes fadeInDown {
                    0% {
                      opacity: 0;
                      transform: translateY(-30px);
                    }
                    100% {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }

                  @keyframes fadeInUp {
                    0% {
                      opacity: 0;
                      transform: translateY(30px);
                    }
                    100% {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }

                  @keyframes fadeIn {
                    0% {
                      opacity: 0;
                    }
                    100% {
                      opacity: 1;
                    }
                  }

                  @keyframes float {
                    0%, 100% {
                      transform: translate(0, 0) scale(1);
                    }
                    33% {
                      transform: translate(10px, -20px) scale(1.03);
                    }
                    66% {
                      transform: translate(-10px, 10px) scale(0.98);
                    }
                  }

                  /* Smooth transitions for inputs */
                  .form-control:focus {
                    border-color: #667eea !important;
                    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                  }

                  /* Card hover effect */
                  .w-lg-500px:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4), 0 15px 30px rgba(0, 0, 0, 0.25);
                  }
                `}</style>
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
