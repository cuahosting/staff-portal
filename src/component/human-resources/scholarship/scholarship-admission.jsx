import React from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ScholarshipAdmissionContent from "./scholarship-admission-content";

function ScholarshipAdmission(props) {
    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Pre-Admission Scholarships"
                items={["Human Resources", "Scholarship", "Pre-Admission"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body py-4">
                        <ScholarshipAdmissionContent {...props} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(ScholarshipAdmission);
