const AddDepartmentForm = (props) => {


    return (<>
        <div className="modal-header" id="kt_modal_add_user_header">
            <h2 className="fw-bolder">Add Department</h2>
            <div className="btn btn-icon btn-sm btn-active-icon-primary" data-kt-users-modal-action="close">
                <span className="svg-icon svg-icon-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <rect opacity="0.5" x={6} y="17.3137" width={16} height={2} rx={1} transform="rotate(-45 6 17.3137)" fill="currentColor" />
                        <rect x="7.41422" y={6} width={16} height={2} rx={1} transform="rotate(45 7.41422 6)" fill="currentColor" />
                    </svg>
                </span>
            </div>
        </div>
        <div className="modal-body scroll-y mx-5 mx-xl-15 my-7">
            <form id="kt_modal_add_user_form" className="form" action="#">
                <div className="d-flex flex-column scroll-y me-n7 pe-7" id="kt_modal_add_user_scroll" data-kt-scroll="true" data-kt-scroll-activate="{default: false, lg: true}" data-kt-scroll-max-height="auto" data-kt-scroll-dependencies="#kt_modal_add_user_header" data-kt-scroll-wrappers="#kt_modal_add_user_scroll" data-kt-scroll-offset="300px">
                    <div className="fv-row mb-7">
                        <label className="required fw-bold fs-6 mb-2">Department Name</label>
                        <input type="text" name="department_name" className="form-control form-control-solid mb-3 mb-lg-0" placeholder="Faculty Name" defaultValue="department a" />
                    </div>
                    <div className="fv-row mb-7">
                        <label className="required fw-bold fs-6 mb-2">Department Code</label>
                        <input type="email" name="department_code" className="form-control form-control-solid mb-3 mb-lg-0" placeholder="Department code" defaultValue="code of department"  />
                    </div>
                    <div className="fv-row mb-7">
                        <label className="required fw-bold fs-6 mb-2">Faculty</label>
                        <select className="form-select form-select-solid" data-kt-select2="true" data-placeholder="Select option" data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true" name="faculty">
                            <option></option>
                            <option value="1">Approved</option>
                            <option value="2">Pending</option>
                            <option value="2">In Process</option>
                            <option value="2">Rejected</option>
                        </select>

                    </div>

                </div>
                <div className="text-center pt-15">
                    <button type="reset" className="btn btn-light me-3" data-kt-users-modal-action="cancel">Discard</button>
                    <button type="submit" className="btn btn-primary" data-kt-users-modal-action="submit">
                        <span className="indicator-label">Submit</span>
                        <span className="indicator-progress">Please wait...
                            <span className="spinner-border spinner-border-sm align-middle ms-2" /></span>
                    </button>
                </div>
            </form>
        </div>
    </>)
}

export default AddDepartmentForm;