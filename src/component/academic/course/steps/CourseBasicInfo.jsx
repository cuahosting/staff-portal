import React from "react";
import SearchSelect from "../../../common/select/SearchSelect";

export default function CourseBasicInfo(props) {
    // Convert departmentList to options format for SearchSelect
    const departmentOptions = props.departmentList.map(dept => ({
        value: dept.DepartmentCode,
        label: dept.DepartmentName
    }));

    return (
        <>
            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CourseName">
                    Course Name
                </label>
                <div className="enhanced-input-wrapper">
                    <input
                        type="text"
                        id="CourseName"
                        onChange={props.onEdit}
                        value={props.data.CourseName}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Course Name"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CourseCode">
                    Course Code
                </label>
                <div className="enhanced-input-wrapper">
                    <input
                        style={{ textTransform: 'uppercase' }}
                        type="text"
                        id="CourseCode"
                        disabled={props.data.EntryID !== "" ? true : false}
                        onChange={props.onEdit}
                        value={props.data.CourseCode}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Course Code"
                        autoComplete="off"
                    />
                </div>
            </div>

            <SearchSelect
                id="DepartmentCode"
                label="Department"
                value={departmentOptions.find(opt => opt.value === props.data.DepartmentCode) || null}
                options={departmentOptions}
                onChange={(selected) => props.onEdit({ target: { id: 'DepartmentCode', value: selected?.value || '' } })}
                placeholder="Select Department"
            />
        </>
    )
}
