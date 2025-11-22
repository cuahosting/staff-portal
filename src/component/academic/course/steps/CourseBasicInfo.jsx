import React from "react";

export default function CourseBasicInfo(props) {
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
                        style={{textTransform:'uppercase'}}
                        type="text"
                        id="CourseCode"
                        disabled={props.data.EntryID !== "" ? true: false}
                        onChange={props.onEdit}
                        value={props.data.CourseCode}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Course Code"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="DepartmentCode">
                    Department
                </label>
                <div className="enhanced-input-wrapper">
                    <select
                        id="DepartmentCode"
                        onChange={props.onEdit}
                        value={props.data.DepartmentCode}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                    >
                        <option>Select Department</option>
                        {
                            props.departmentList.length > 0 && props.departmentList.map((department, index) => {
                                return <option key={index} value={department.DepartmentCode}>{department.DepartmentName}</option>
                            })
                        }
                    </select>
                </div>
            </div>
        </>
    )
}
