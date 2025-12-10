import React, { useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ScholarshipDefinitions from "./scholarship-definitions";
import ScholarshipStudents from "./scholarship-students";
import ScholarshipAdmission from "./scholarship-admission";
import AcademicScholarships from "./academic-scholarships";
import ScholarshipUsage from "./scholarship-usage";

function ScholarshipManagement(props) {
    const [activeTab, setActiveTab] = useState("definitions");

    const tabs = [
        { key: "definitions", label: "Definitions", icon: "fa-solid fa-book" },
        { key: "students", label: "Student Enrollments", icon: "fa-solid fa-users" },
        { key: "admission", label: "Pre-Admission", icon: "fa-solid fa-user-plus" },
        { key: "academic", label: "Academic (GPA)", icon: "fa-solid fa-graduation-cap" },
        { key: "usage", label: "Usage Tracking", icon: "fa-solid fa-chart-line" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "definitions":
                return <ScholarshipDefinitions {...props} />;
            case "students":
                return <ScholarshipStudents {...props} />;
            case "admission":
                return <ScholarshipAdmission {...props} />;
            case "academic":
                return <AcademicScholarships {...props} />;
            case "usage":
                return <ScholarshipUsage {...props} />;
            default:
                return <ScholarshipDefinitions {...props} />;
        }
    };

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Scholarship Management"
                items={["Human Resources", "AC-Finance", "Scholarships"]}
            />

            <div className="flex-column-fluid">
                <div className="card">
                    {/* Tab Navigation */}
                    <div className="card-header border-0 pt-6">
                        <ul className="nav nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-5 fw-bold">
                            {tabs.map((tab) => (
                                <li className="nav-item" key={tab.key}>
                                    <a
                                        className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
                                        onClick={() => setActiveTab(tab.key)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <i className={`${tab.icon} me-2`}></i>
                                        {tab.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tab Content */}
                    <div className="card-body py-4">{renderTabContent()}</div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(ScholarshipManagement);
