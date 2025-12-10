import React from "react";
import SearchSelect from "../../../common/select/SearchSelect";

// Options for IsGens select
const isGensOptions = [
    { value: '1', label: 'Yes' },
    { value: '0', label: 'No' },
];

export default function CourseFinancialInfo(props) {
    return (
        <>
            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="TuitionFee">
                        Tuition Fee
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="number"
                            id="TuitionFee"
                            onChange={props.onEdit}
                            value={props.data.TuitionFee}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Tuition Fee"
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CourseClass">
                        Course Class
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="text"
                            id="CourseClass"
                            onChange={props.onEdit}
                            value={props.data.CourseClass}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Course Class"
                            autoComplete="off"
                        />
                    </div>
                </div>
            </div>

            <SearchSelect
                id="IsGens"
                label="Is Gens"
                value={isGensOptions.find(opt => opt.value === props.data.IsGens?.toString()) || null}
                options={isGensOptions}
                onChange={(selected) => props.onEdit({ target: { id: 'IsGens', value: selected?.value || '' } })}
                placeholder="Select Option"
            />
        </>
    )
}
