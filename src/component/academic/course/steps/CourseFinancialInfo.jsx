import React from "react";

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

            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="IsGens">
                    Is Gens
                </label>
                <div className="enhanced-input-wrapper">
                    <select
                        id="IsGens"
                        onChange={props.onEdit}
                        value={props.data.IsGens}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                    >
                        <option>Select Option</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select>
                </div>
            </div>
        </>
    )
}
