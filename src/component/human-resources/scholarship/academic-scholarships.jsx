import React from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import AcademicScholarshipsContent from "./academic-scholarships-content";

function AcademicScholarships(props) {
    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Academic (GPA) Scholarships"
                items={["Human Resources", "Scholarship", "Academic (GPA)"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body py-4">
                        <AcademicScholarshipsContent {...props} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(AcademicScholarships);
