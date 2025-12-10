import React from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ScholarshipStudentsContent from "./scholarship-students-content";

function ScholarshipStudents(props) {
    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Student Enrollments"
                items={["Human Resources", "Scholarship", "Student Enrollments"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body py-4">
                        <ScholarshipStudentsContent {...props} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(ScholarshipStudents);
