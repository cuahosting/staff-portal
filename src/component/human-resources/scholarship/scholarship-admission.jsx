import React from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ScholarshipAdmissionContent from "./scholarship-admission-content";

function ScholarshipAdmission(props) {
    return (
        <ScholarshipAdmissionContent {...props} />
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(ScholarshipAdmission);
