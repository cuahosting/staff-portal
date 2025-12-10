import React from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ScholarshipUsageContent from "./scholarship-usage-content";

function ScholarshipUsage(props) {
    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Usage Tracking"
                items={["Human Resources", "Scholarship", "Usage Tracking"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body py-4">
                        <ScholarshipUsageContent {...props} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(ScholarshipUsage);
