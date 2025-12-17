import React from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import AcademicScholarshipsContent from "./academic-scholarships-content";

function AcademicScholarships(props) {
    return (
        <AcademicScholarshipsContent {...props} />
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(AcademicScholarships);
