import React from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ScholarshipDefinitionsContent from "./scholarship-definitions-content";

function ScholarshipDefinitions(props) {
    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Scholarship Definitions"
                items={["Human Resources", "Scholarship", "Definitions"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body py-4">
                        <ScholarshipDefinitionsContent {...props} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(ScholarshipDefinitions);
