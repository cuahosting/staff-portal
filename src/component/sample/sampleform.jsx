import React from "react";
function SampleForm() {
    return (
        <form className="form" action="#" id="kt_modal_add_customer_form" data-kt-redirect="../../demo21/dist/apps/customers/list.html">
                    <div className="fv-row mb-7">
                        <label className="required fs-6 fw-bold mb-2">Name</label>
                        <input type="text" className="form-control form-control-solid" placeholder="" name="name" value="Sean Bean"/>
                    </div>
                    <div className="fv-row mb-7">
                        <label className="fs-6 fw-bold mb-2">
                            <span className="required">Email</span>
                            <i className="fas fa-exclamation-circle ms-1 fs-7" data-bs-toggle="tooltip" title="Email address must be active"></i>
                        </label>
                        <input type="email" className="form-control form-control-solid" placeholder=""
                               name="email" value="sean@dellito.com"/>
                    </div>
                    <div className="fv-row mb-15">
                        <label className="fs-6 fw-bold mb-2">Description</label>
                        <input type="text" className="form-control form-control-solid" placeholder="" name="description"/>
                    </div>
                    <div className="fw-bolder fs-3 rotate collapsible mb-7" data-bs-toggle="collapse" href="#kt_modal_add_customer_billing_info" role="button" aria-expanded="false" aria-controls="kt_customer_view_details">Shipping Information
                        <span className="ms-2 rotate-180">
                                        <span className="svg-icon svg-icon-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M11.4343 12.7344L7.25 8.55005C6.83579 8.13583 6.16421 8.13584 5.75 8.55005C5.33579 8.96426 5.33579 9.63583 5.75 10.05L11.2929 15.5929C11.6834 15.9835 12.3166 15.9835 12.7071 15.5929L18.25 10.05C18.6642 9.63584 18.6642 8.96426 18.25 8.55005C17.8358 8.13584 17.1642 8.13584 16.75 8.55005L12.5657 12.7344C12.2533 13.0468 11.7467 13.0468 11.4343 12.7344Z" fill="currentColor"/>
                                            </svg>
                                        </span>
                                    </span>
                    </div>
                    <div id="kt_modal_add_customer_billing_info" className="collapse show">
                        <div className="d-flex flex-column mb-7 fv-row">
                            <label className="required fs-6 fw-bold mb-2">Address Line 1</label>
                            <input className="form-control form-control-solid" placeholder="" name="address1" value="101, Collins Street"/>
                        </div>
                        <div className="d-flex flex-column mb-7 fv-row">
                            <label className="fs-6 fw-bold mb-2">Address Line 2</label>
                            <input className="form-control form-control-solid" placeholder="" name="address2" value=""/>
                        </div>
                        <div className="d-flex flex-column mb-7 fv-row">
                            <label className="required fs-6 fw-bold mb-2">Town</label>
                            <input className="form-control form-control-solid" placeholder="" name="city" value="Melbourne"/>
                        </div>
                        <div className="row g-9 mb-7">
                            <div className="col-md-6 fv-row">
                                <label className="required fs-6 fw-bold mb-2">State / Province</label>
                                <input className="form-control form-control-solid" placeholder=""
                                       name="state" value="Victoria"/>
                            </div>
                            <div className="col-md-6 fv-row">
                                <label className="required fs-6 fw-bold mb-2">Post Code</label>
                                <input className="form-control form-control-solid" placeholder="" name="postcode" value="3000"/>
                            </div>
                        </div>
                        <div className="d-flex flex-column mb-7 fv-row">
                            <label className="fs-6 fw-bold mb-2">
                                <span className="required">Country</span>
                                <i className="fas fa-exclamation-circle ms-1 fs-7" data-bs-toggle="tooltip" title="Country of origination"></i>
                            </label>
                            <select name="country" aria-label="Select a Country" data-control="select2" data-placeholder="Select a Country..." data-dropdown-parent="#kt_modal_add_customer" className="form-select form-select-solid fw-bolder">
                                <option value="">Select a Country...</option>
                                <option value="NG">Nigeria</option>
                            </select>
                        </div>
                    </div>

        </form>

    );
}

export default SampleForm;