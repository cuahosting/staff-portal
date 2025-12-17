import React from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ScholarshipStudentsContent from "./scholarship-students-content";

function ScholarshipStudents(props) {
    return (
        <ScholarshipStudentsContent {...props} />
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(ScholarshipStudents);
