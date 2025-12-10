import React from "react";
import SearchSelect from "../../common/select/SearchSelect";
// Custom styles for react-select to match login input styling
const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        border: '2px solid #e8e8e8',
        backgroundColor: state.isFocused ? '#ffffff' : '#f8f9fa',
        padding: '0.25rem 0.5rem',
        fontSize: '1rem',
        borderRadius: '0.5rem',
        outline: 'none',
        boxShadow: state.isFocused
            ? '0 6px 20px rgba(13, 110, 253, 0.15)'
            : provided.boxShadow,
        borderColor: state.isFocused ? '#0d6efd' : '#e8e8e8',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: state.isFocused ? 'translateY(-2px)' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#0d6efd' : '#d0d0d0',
            backgroundColor: '#ffffff',
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
        borderRadius: '0.5rem',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
        border: '2px solid #e8e8e8',
    }),
    menuPortal: (provided) => ({
        ...provided,
        zIndex: 9999,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? '#0d6efd'
            : state.isFocused
                ? '#e3f2fd'
                : '#ffffff',
        color: state.isSelected ? '#ffffff' : '#2c3e50',
        padding: '0.75rem 1.25rem',
        cursor: 'pointer',
        fontSize: '1rem',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#a0a0a0',
        fontSize: '0.95rem',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#2c3e50',
        fontSize: '1rem',
    }),
};


export const ModulesForm = (props) => {

    return (
        <form onSubmit={props.onSubmit}>
            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="ModuleName">
                        Module Name
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            required
                            type="text"
                            id="ModuleName"
                            onChange={props.onEdit}
                            value={props.createModule.ModuleName}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Module Description"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="fv-row mb-6 enhanced-form-group">
                        <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="ModuleCode">
                            Module Code
                        </label>
                        <div className="enhanced-input-wrapper">
                            <input
                                required
                                style={{ textTransform: 'uppercase' }}
                                type="text"
                                id="ModuleCode"
                                onChange={props.onEdit}
                                value={props.createModule.ModuleCode}
                                className="form-control form-control-lg form-control-solid enhanced-input"
                                placeholder="Enter the Module Code"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="fv-row mb-6 enhanced-form-group">
                        <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="ModuleType">
                            Module Type
                        </label>
                        <div className="enhanced-input-wrapper">
                            <select
                                id="ModuleType"
                                onChange={props.onEdit}
                                required
                                value={props.createModule.ModuleType}
                                className="form-control form-control-lg form-control-solid enhanced-input"
                                data-kt-select2="true"
                                data-placeholder="Select option"
                                data-dropdown-parent="#kt_menu_624456606a84b"
                                data-allow-clear="true"
                            >
                                <option value="">-select type-</option>
                                <option value="Core">Core</option>
                                <option value="Elective">Elective</option>
                                <option value="Lecture">Lecture</option>
                                <option value="Interactive">Interactive</option>
                                <option value="Class">Class</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Online">Online</option>
                                <option value="Seminar">Seminar</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="DepartmentCode">
                        Course
                    </label>
                    <SearchSelect
                        name="DepartmentCode"
                        value={props.createModule.DepartmentCode2}
                        onChange={props.onDepartmentChange}
                        options={props.departmentOptions}
                        placeholder="select Course"
                        styles={customSelectStyles}
                    />
                </div>

                <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CreditUnit">
                        Credit Unit
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="text"
                            required
                            id="CreditUnit"
                            onChange={props.onEdit}
                            value={props.createModule.CreditUnit}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Module Credit unit"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CAPerCon">
                        CA per con
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="text"
                            required
                            id="CAPerCon"
                            onChange={props.onEdit}
                            value={props.createModule.CAPerCon}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter C A per con"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="ExamPerCon">
                        Exam Per Con
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="text"
                            id="ExamPerCon"
                            onChange={props.onEdit}
                            value={props.createModule.ExamPerCon}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the exam per con"
                            autoComplete="off"
                        />
                    </div>
                </div>

            </div>
            <div className="form-group pt-2">
                <button type="submit" className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={props.isFormLoading}>
                    <span className="indicator-label">Submit</span>
                    <span className="indicator-progress">Please wait...
                        <span className="spinner-border spinner-border-sm align-middle ms-2" />
                    </span>
                </button>
            </div>
        </form>
    )
}
