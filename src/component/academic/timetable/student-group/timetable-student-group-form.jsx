import React from "react";

export default function StudentGroupForm(props) {
    return (
        <>
            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="GroupName">
                    Group Name
                </label>
                <div className="enhanced-input-wrapper">
                    <input
                        type="text"
                        id="GroupName"
                        onChange={props.onEdit}
                        value={props.data.GroupName}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Group Name"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="GroupCode">
                    Group Code
                </label>
                <div className="enhanced-input-wrapper">
                    <input
                        type="text"
                        id="GroupCode"
                        onChange={props.onEdit}
                        value={props.data.GroupCode}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        placeholder="Enter the Group Code"
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="fv-row mb-6 enhanced-form-group">
                <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CourseCode">
                    Course
                </label>
                <div className="enhanced-input-wrapper">
                    <select
                        id="CourseCode"
                        onChange={props.onEdit}
                        value={props.data.CourseCode}
                        className="form-control form-control-lg form-control-solid enhanced-input"
                    >
                        <option>Select Course</option>
                        {
                            props.courseList.length > 0 && props.courseList.map((course, index) => {
                                return <option key={index} value={course.CourseCode}>{course.CourseName}</option>
                            })
                        }
                    </select>
                </div>
            </div>

            <div className="row">
                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CourseLevel">
                        Course Level
                    </label>
                    <div className="enhanced-input-wrapper">
                        <select
                            id="CourseLevel"
                            onChange={props.onEdit}
                            value={props.data.CourseLevel}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                        >
                            <option>Select Course Level</option>
                            <option value="100">100</option>
                            <option value="200">200</option>
                            <option value="300">300</option>
                            <option value="400">400</option>
                            <option value="500">500</option>
                            <option value="600">600</option>
                            <option value="700">700</option>
                            <option value="800">800</option>
                            <option value="900">900</option>
                        </select>
                    </div>
                </div>

                <div className="fv-row mb-6 enhanced-form-group col-md-6">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CourseSemester">
                        Course Semester
                    </label>
                    <div className="enhanced-input-wrapper">
                        <select
                            id="CourseSemester"
                            onChange={props.onEdit}
                            value={props.data.CourseSemester}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                        >
                            <option>Select Course Semester</option>
                            <option value="First">First Semester</option>
                            <option value="Second">Second Semester</option>
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
