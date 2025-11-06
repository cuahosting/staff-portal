import React from "react";
import {projectName} from "../../../resources/constants";
import {Link} from "@mui/material";

export default function Footer() {
    return (
        <div className="footer py-4 d-flex flex-lg-column hideFooter" id="kt_footer">
            <div
                className="container-custom container-xxl d-flex hideFooter flex-column flex-md-row align-items-center justify-content-between">
                <div className="text-dark order-2 order-md-1">
                    <span className="text-muted fw-bold me-1">2022©</span>
                    <Link to={"/"} className="text-gray-800 text-hover-primary">
                        {projectName}
                    </Link>
                </div>
                <ul className="menu menu-gray-600 menu-hover-primary fw-bold order-1">
                    <li className="menu-item">
                        <Link to="/" target="_blank" className="menu-link px-2">Dashboard</Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}
