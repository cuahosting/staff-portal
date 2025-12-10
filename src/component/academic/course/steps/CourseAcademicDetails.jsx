import React from "react";
import SearchSelect from "../../../common/select/SearchSelect";

// Options for select fields
const durationTypeOptions = [
    { value: 'Months', label: 'Months' },
    { value: 'Years', label: 'Years' },
    { value: 'Semesters', label: 'Semesters' },
];

const yesNoOptions = [
    { value: '1', label: 'Yes' },
    { value: '0', label: 'No' },
];

const applicationTypeOptions = [
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'postgraduate', label: 'Postgraduate' },
];

export default function CourseAcademicDetails(props) {
    return (
        <>
            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="Duration">
                        Duration
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="number"
                            id="Duration"
                            onChange={props.onEdit}
                            value={props.data.Duration}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Course Duration"
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <SearchSelect
                        id="DurationType"
                        label="Duration Type"
                        value={durationTypeOptions.find(opt => opt.value === props.data.DurationType) || null}
                        options={durationTypeOptions}
                        onChange={(selected) => props.onEdit({ target: { id: 'DurationType', value: selected?.value || '' } })}
                        placeholder="Select Duration Type"
                    />
                </div>
            </div>

            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="DegreeInView">
                        Degree In View
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="text"
                            id="DegreeInView"
                            onChange={props.onEdit}
                            value={props.data.DegreeInView}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Degree In View"
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <SearchSelect
                        id="IsAwardDegree"
                        label="Is Award Degree"
                        value={yesNoOptions.find(opt => opt.value === props.data.IsAwardDegree?.toString()) || null}
                        options={yesNoOptions}
                        onChange={(selected) => props.onEdit({ target: { id: 'IsAwardDegree', value: selected?.value || '' } })}
                        placeholder="Select Option"
                    />
                </div>
            </div>

            <SearchSelect
                id="ApplicationType"
                label="Application Type"
                value={applicationTypeOptions.find(opt => opt.value === props.data.ApplicationType) || null}
                options={applicationTypeOptions}
                onChange={(selected) => props.onEdit({ target: { id: 'ApplicationType', value: selected?.value || '' } })}
                placeholder="Select Application Type"
            />
        </>
    )
}
