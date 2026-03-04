import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setLoginDetails, setPermissionDetails } from "../../../actions/setactiondetails";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import axios from "axios";

const UPS_SSO_EXCHANGE_URL = process.env.REACT_APP_UPS_SSO_EXCHANGE_URL || "https://portal.cosmopolitan.edu.ng/api/sso/exchange";
const PORTAL_SSO_SECRET = process.env.REACT_APP_PORTAL_SSO_SECRET || "";
const BACKEND_SSO_SECRET = process.env.REACT_APP_UPS_SSO_SECRET || "";

function SSOCallback(props) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("Authenticating via SSO...");

    useEffect(() => {
        handleSSOLogin();
    }, []);

    const handleSSOLogin = async () => {
        const code = searchParams.get("sso_code");

        if (!code) {
            setStatus("No SSO code provided");
            toast.error("Invalid SSO login attempt");
            setTimeout(() => navigate("/login"), 2000);
            return;
        }

        try {
            // Step 1: Exchange SSO code with UPS for user info
            setStatus("Validating SSO code...");
            const exchangeRes = await axios.post(UPS_SSO_EXCHANGE_URL, {
                code,
                portalSecret: PORTAL_SSO_SECRET,
            });

            if (!exchangeRes.data?.valid) {
                throw new Error(exchangeRes.data?.error || "SSO code exchange failed");
            }

            const { user } = exchangeRes.data;

            // Step 2: Call backend to get full user data + permissions + API token
            setStatus("Loading your profile...");
            const loginRes = await axios.post(`${serverLink}login/staff_portal_login/ups_sso`, {
                staffId: user.id,
                ssoSecret: BACKEND_SSO_SECRET,
            });

            if (loginRes.data?.message === "success") {
                toast.success("SSO login successful");
                props.setOnPermissionDetails(loginRes.data.permissionData);
                props.setOnLoginDetails(loginRes.data.userData);
                navigate("/");
            } else {
                throw new Error("Staff account not found or inactive");
            }
        } catch (error) {
            console.error("SSO login error:", error);
            const msg = error.response?.data?.error || error.message || "SSO login failed";
            setStatus(`Login failed: ${msg}`);
            toast.error(msg);
            setTimeout(() => navigate("/login"), 3000);
        }
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "#f8f9fa",
            fontFamily: "'Poppins', sans-serif",
        }}>
            <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "48px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                textAlign: "center",
                maxWidth: "400px",
            }}>
                <div style={{
                    width: "48px",
                    height: "48px",
                    border: "4px solid #e0e0e0",
                    borderTopColor: "#1a1a2e",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 24px",
                }} />
                <h2 style={{ fontSize: "18px", color: "#1a1a2e", marginBottom: "8px" }}>
                    Single Sign-On
                </h2>
                <p style={{ color: "#666", fontSize: "14px" }}>{status}</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

const mapDispatchToProps = (dispatch) => ({
    setOnLoginDetails: (p) => dispatch(setLoginDetails(p)),
    setOnPermissionDetails: (p) => dispatch(setPermissionDetails(p)),
});

export default connect(null, mapDispatchToProps)(SSOCallback);
