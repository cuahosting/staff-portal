import React from "react";
import Select from "react-select";
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


export default function AddFacultyForm(props) {
    return (
        <>
            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="FacultyName">
                    Faculty Name
                </label>
                <div className="enhanced-input-wrapper">
                    <input
                        type="text"
                        id="FacultyName"
                        onChange={props.onEdit}
                        value={props.data.FacultyName}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Faculty Name"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="FacultyCode">
                    Faculty Code
                </label>
                <div className="enhanced-input-wrapper">
                    <input
                        style={{textTransform:'uppercase'}}
                        type="text"
                        id="FacultyCode"
                        disabled={props.data.IsEdit.toString() === "1"? true:false}
                        onChange={props.onEdit}
                        value={props.data.FacultyCode}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Faculty Code"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group col-md-12">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="FacultyDean">
                        Faculty Dean
                    </label>
                    <Select
                        name="FacultyDean"
                        value={props.data.FacultyDean2}
                        onChange={props.onStaffChange}
                        options={props.staff}
                        placeholder="select Dean"
                        styles={customSelectStyles}
                    />
                </div>

                <div className="fv-row mb-6 enhanced-form-group col-md-12">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="FacultyDeputyDean">
                        Deputy Dean
                    </label>
                    <Select
                        name="FacultyDeputyDean"
                        value={props.data.FacultyDeputyDean2}
                        onChange={props.onDeputyChange}
                        options={props.staff}
                        placeholder="select Deputy Dean"
                        styles={customSelectStyles}
                    />
                </div>
            </div>

            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="IsAcademic">
                        Is Academic
                    </label>
                    <div className="enhanced-input-wrapper">
                        <select
                            id="IsAcademic"
                            onChange={props.onEdit}
                            value={props.data.IsAcademic}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                        >
                            <option value="1">Academic</option>
                            <option value="0">Non-Academic</option>
                        </select>
                    </div>
                </div>

                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="IsAwardDegree">
                        Is Award Degree
                    </label>
                    <div className="enhanced-input-wrapper">
                        <select
                            id="IsAwardDegree"
                            onChange={props.onEdit}
                            value={props.data.IsAwardDegree}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                        >
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="form-group pt-2">
                <button onClick={props.onSubmit} id="kt_modal_new_address_submit" data-kt-indicator={props.isFormLoading} className="btn btn-primary w-100">
                    <span className="indicator-label">Submit</span>
                    <span className="indicator-progress">Please wait...
                            <span className="spinner-border spinner-border-sm align-middle ms-2"/>
                    </span>
                </button>
            </div>
        </>
    )
}
