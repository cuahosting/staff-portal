import React from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ScholarshipUsageContent from "./scholarship-usage-content";

function ScholarshipUsage(props) {
    return (
        <ScholarshipUsageContent {...props} />
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(ScholarshipUsage);
