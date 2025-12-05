import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../common/pageheader/pageheader";
import StaffLeaveCategories from "./leave-categories";
import StaffLeaveSignatories from "./leave-signatories";

const StaffLeaveSettings = (props) => {
    const InsertedBy = props.loginDetails[0].StaffID

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Staff Leave Settings"}
                items={["Human Resources", "Staff Leave", "Settings"]}
            />

            <div id="kt_content_container" className="container-custom container-xxl d-flex flex-column-fluid">

                <div className="pt-0 pb-0">
                    <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder">
                        <li className="nav-item mt-2">
                            <a className="nav-link text-active-primary ms-0 me-10 py-5 active" data-bs-toggle="tab" href="#kt_tabs_tab_1">Leave Categories</a>
                        </li>
                        <li className="nav-item mt-2">
                            <a className="nav-link text-active-primary ms-0 me-10 py-5" data-bs-toggle="tab" href="#kt_tabs_tab_2">Signatories</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex-column-fluid">
                <div className="tab-content" data-kt-scroll="true" data-kt-scroll-activate="{default: true, lg: false}" data-kt-scroll-height="auto" data-kt-scroll-offset="70px" >
                    <div className="tab-pane fade active show" id="kt_tabs_tab_1" >
                        <StaffLeaveCategories InsertedBy={InsertedBy} />
                    </div>
                    <div className="tab-pane fade" id="kt_tabs_tab_2">
                        <StaffLeaveSignatories InsertedBy={InsertedBy} />
                    </div>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        loginDetails: state.LoginDetails
    }
}

export default connect(mapStateToProps, null)(StaffLeaveSettings);