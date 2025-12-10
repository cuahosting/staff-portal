import React from "react";
import SearchSelect from "../../common/select/SearchSelect";

// Options for boolean selects
const academicOptions = [
    { value: '1', label: 'Academic' },
    { value: '0', label: 'Non-Academic' },
];

const yesNoOptions = [
    { value: '1', label: 'Yes' },
    { value: '0', label: 'No' },
];

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
                        style={{ textTransform: 'uppercase' }}
                        type="text"
                        id="FacultyCode"
                        disabled={props.data.IsEdit.toString() === "1" ? true : false}
                        onChange={props.onEdit}
                        value={props.data.FacultyCode}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Faculty Code"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <SearchSelect
                        id="FacultyDean"
                        label="Faculty Dean"
                        value={props.data.FacultyDean2}
                        options={props.staff}
                        onChange={props.onStaffChange}
                        placeholder="Select Dean"
                    />
                </div>

                <div className="col-md-12">
                    <SearchSelect
                        id="FacultyDeputyDean"
                        label="Deputy Dean"
                        value={props.data.FacultyDeputyDean2}
                        options={props.staff}
                        onChange={props.onDeputyChange}
                        placeholder="Select Deputy Dean"
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <SearchSelect
                        id="IsAcademic"
                        label="Is Academic"
                        value={academicOptions.find(o => o.value === props.data.IsAcademic?.toString())}
                        options={academicOptions}
                        onChange={(selected) => {
                            props.onEdit({ target: { id: 'IsAcademic', value: selected?.value || '1' } });
                        }}
                        placeholder="Select type"
                    />
                </div>

                <div className="col-md-6">
                    <SearchSelect
                        id="IsAwardDegree"
                        label="Is Award Degree"
                        value={yesNoOptions.find(o => o.value === props.data.IsAwardDegree?.toString())}
                        options={yesNoOptions}
                        onChange={(selected) => {
                            props.onEdit({ target: { id: 'IsAwardDegree', value: selected?.value || '1' } });
                        }}
                        placeholder="Select type"
                    />
                </div>
            </div>

            <div className="form-group pt-2">
                <button onClick={props.onSubmit} id="kt_modal_new_address_submit" data-kt-indicator={props.isFormLoading} className="btn btn-primary w-100">
                    <span className="indicator-label">Submit</span>
                    <span className="indicator-progress">Please wait...
                        <span className="spinner-border spinner-border-sm align-middle ms-2" />
                    </span>
                </button>
            </div>
        </>
    )
}
