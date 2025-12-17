import React from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ScholarshipDefinitionsContent from "./scholarship-definitions-content";

function ScholarshipDefinitions(props) {
    return (
        <ScholarshipDefinitionsContent {...props} />
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(ScholarshipDefinitions);
