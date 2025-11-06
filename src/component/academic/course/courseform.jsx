import React from "react";
import Select2 from "react-select2-wrapper";

export default function CourseForm(props) {
    return (
        <>
            <div className="form-group mb-4">
                <label htmlFor="CourseName">Course Name</label>
                <input
                    type="text"
                    id={"CourseName"}
                    onChange={props.onEdit}
                    value={props.data.CourseName}
                    className={"form-control"}
                    placeholder={"Enter the Course Name"}
                />
            </div>
            <div className="form-group mb-4">
                <label htmlFor="CourseCode">Course Code</label>
                <input
                    style={{textTransform:'uppercase'}} 
                    type="text"
                    id={"CourseCode"}
                    disabled={props.data.EntryID !== "" ? true: false}
                    onChange={props.onEdit}
                    value={props.data.CourseCode}
                    className={"form-control"}
                    placeholder={"Enter the Course Code"}
                />
            </div>
            <div className="row">
                <div className="form-group mb-4 col-md-6">
                    <label htmlFor="Duration">Duration</label>
                    <input
                        type="number"
                        id={"Duration"}
                        onChange={props.onEdit}
                        value={props.data.Duration}
                        className={"form-control"}
                        placeholder={"Enter the Course Duration"}
                    />
                </div>
                <div className="form-group mb-4 col-md-6">
                    <label htmlFor="DurationType">Duration Type</label>
                    <select
                        id={"DurationType"}
                        onChange={props.onEdit}
                        value={props.data.DurationType}
                        className={"form-control"}
                    >
                        <option>Select Duration Type</option>
                        <option value="Months">Months</option>
                        <option value="Years">Years</option>
                        <option value="Semesters">Semesters</option>
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="form-group mb-4 col-md-6">
                    <label htmlFor="DegreeInView">Degree In View</label>
                    <input
                        type="text"
                        id={"DegreeInView"}
                        onChange={props.onEdit}
                        value={props.data.DegreeInView}
                        className={"form-control"}
                        placeholder={"Enter the Degree In View"}
                    />
                </div>
                <div className="form-group mb-4 col-md-6">
                    <label htmlFor="IsAwardDegree">Is Award Degree </label>
                    <select
                        id={"IsAwardDegree"}
                        onChange={props.onEdit}
                        value={props.data.IsAwardDegree}
                        className={"form-control"}
                    >
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="form-group mb-4 col-md-6">
                    <label htmlFor="TuitionFee"> Tuition Fee</label>
                    <input
                        type="number"
                        id={"TuitionFee"}
                        onChange={props.onEdit}
                        value={props.data.TuitionFee}
                        className={"form-control"}
                        placeholder={"Enter the Tuition Fee"}
                    />
                </div>
                <div className="form-group mb-4 col-md-6">
                    <label htmlFor="CourseClass">Course Class</label>
                    <input
                        type="text"
                        id={"CourseClass"}
                        onChange={props.onEdit}
                        value={props.data.CourseClass}
                        className={"form-control"}
                        placeholder={"Enter the Course Class"}
                    />
                </div>
            </div>
            <div className="form-group mb-4">
                <label htmlFor="DepartmentCode">Department </label>
                {/*<Select2*/}
                {/*    id="DepartmentCode"*/}
                {/*    name="DepartmentCode"*/}
                {/*    data={departmentList}*/}
                {/*    value={searchItem.SemesterCode}*/}
                {/*    className={"form-control"}*/}
                {/*    onSelect={props.onEdit}*/}
                {/*    options={{*/}
                {/*        placeholder: "Search Departments",*/}
                {/*    }}*/}
                {/*/>*/}
                <select
                    id={"DepartmentCode"}
                    onChange={props.onEdit}
                    value={props.data.DepartmentCode}
                    className={"form-control"}
                >
                    <option>Select Department</option>
                    {
                        props.departmentList.length > 0 && props.departmentList.map((department, index) => {
                            return <option key={index} value={department.DepartmentCode}>{department.DepartmentName}</option>
                        })
                    }

                </select>
            </div>
            <div className="row">
                <div className="form-group mb-4 col-md-6">
                    <label htmlFor="IsGens">Is Gens</label>
                    <select
                        id={"IsGens"}
                        onChange={props.onEdit}
                        value={props.data.IsGens}
                        className={"form-control"}
                    >
                        <option>Select Option</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select>
                </div>
                <div className="form-group mb-4 col-md-6">
                    <label htmlFor="ApplicationType">Application Type</label>
                    <select
                        id={"ApplicationType"}
                        onChange={props.onEdit}
                        value={props.data.ApplicationType}
                        className={"form-control"}
                    >
                        <option>Select Application Type</option>
                        <option value="undergraduate">undergraduate</option>
                        <option value="postgraduate">postgraduate</option>
                    </select>
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