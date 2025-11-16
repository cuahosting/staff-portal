import React from "react";
import { Input, SearchSelect } from "../../common/form";

export default function CourseForm(props) {
    return (
        <>
            <Input
                id="CourseName"
                type="text"
                value={props.data.CourseName}
                onChange={props.onEdit}
                label="Course Name"
                placeholder="Enter the Course Name"
                required
            />
            <Input
                id="CourseCode"
                type="text"
                value={props.data.CourseCode}
                onChange={props.onEdit}
                label="Course Code"
                placeholder="Enter the Course Code"
                disabled={props.data.EntryID !== ""}
                style={{ textTransform: 'uppercase' }}
                required
            />
            <div className="row">
                <div className="col-md-6">
                    <Input
                        id="Duration"
                        type="number"
                        value={props.data.Duration}
                        onChange={props.onEdit}
                        label="Duration"
                        placeholder="Enter the Course Duration"
                        required
                    />
                </div>
                <div className="col-md-6">
                    <SearchSelect
                        id="DurationType"
                        value={props.data.DurationType ? { value: props.data.DurationType, label: props.data.DurationType } : null}
                        onChange={(selectedOption) => {
                            const e = {
                                target: {
                                    id: "DurationType",
                                    value: selectedOption?.value || ""
                                }
                            };
                            props.onEdit(e);
                        }}
                        options={[
                            { value: "Months", label: "Months" },
                            { value: "Years", label: "Years" },
                            { value: "Semesters", label: "Semesters" }
                        ]}
                        label="Duration Type"
                        placeholder="Select Duration Type"
                        required
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <Input
                        id="DegreeInView"
                        type="text"
                        value={props.data.DegreeInView}
                        onChange={props.onEdit}
                        label="Degree In View"
                        placeholder="Enter the Degree In View"
                        required
                    />
                </div>
                <div className="col-md-6">
                    <SearchSelect
                        id="IsAwardDegree"
                        value={props.data.IsAwardDegree ? { value: props.data.IsAwardDegree, label: props.data.IsAwardDegree === "1" ? "Yes" : "No" } : null}
                        onChange={(selectedOption) => {
                            const e = {
                                target: {
                                    id: "IsAwardDegree",
                                    value: selectedOption?.value || ""
                                }
                            };
                            props.onEdit(e);
                        }}
                        options={[
                            { value: "1", label: "Yes" },
                            { value: "0", label: "No" }
                        ]}
                        label="Is Award Degree"
                        placeholder="Select option"
                        required
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <Input
                        id="TuitionFee"
                        type="number"
                        value={props.data.TuitionFee}
                        onChange={props.onEdit}
                        label="Tuition Fee"
                        placeholder="Enter the Tuition Fee"
                        required
                    />
                </div>
                <div className="col-md-6">
                    <Input
                        id="CourseClass"
                        type="text"
                        value={props.data.CourseClass}
                        onChange={props.onEdit}
                        label="Course Class"
                        placeholder="Enter the Course Class"
                        required
                    />
                </div>
            </div>
            <SearchSelect
                id="DepartmentCode"
                value={props.data.DepartmentCode ?
                    props.departmentList.find(dept => dept.DepartmentCode === props.data.DepartmentCode) ?
                        { value: props.data.DepartmentCode, label: props.departmentList.find(dept => dept.DepartmentCode === props.data.DepartmentCode).DepartmentName }
                        : null
                    : null
                }
                onChange={(selectedOption) => {
                    const e = {
                        target: {
                            id: "DepartmentCode",
                            value: selectedOption?.value || ""
                        }
                    };
                    props.onEdit(e);
                }}
                options={props.departmentList.map(dept => ({
                    value: dept.DepartmentCode,
                    label: dept.DepartmentName
                }))}
                label="Department"
                placeholder="Select Department"
                required
            />
            <div className="row">
                <div className="col-md-6">
                    <SearchSelect
                        id="IsGens"
                        value={props.data.IsGens ? { value: props.data.IsGens, label: props.data.IsGens === "1" ? "Yes" : "No" } : null}
                        onChange={(selectedOption) => {
                            const e = {
                                target: {
                                    id: "IsGens",
                                    value: selectedOption?.value || ""
                                }
                            };
                            props.onEdit(e);
                        }}
                        options={[
                            { value: "1", label: "Yes" },
                            { value: "0", label: "No" }
                        ]}
                        label="Is Gens"
                        placeholder="Select Option"
                        required
                    />
                </div>
                <div className="col-md-6">
                    <SearchSelect
                        id="ApplicationType"
                        value={props.data.ApplicationType ? { value: props.data.ApplicationType, label: props.data.ApplicationType.charAt(0).toUpperCase() + props.data.ApplicationType.slice(1) } : null}
                        onChange={(selectedOption) => {
                            const e = {
                                target: {
                                    id: "ApplicationType",
                                    value: selectedOption?.value || ""
                                }
                            };
                            props.onEdit(e);
                        }}
                        options={[
                            { value: "undergraduate", label: "Undergraduate" },
                            { value: "postgraduate", label: "Postgraduate" }
                        ]}
                        label="Application Type"
                        placeholder="Select Application Type"
                        required
                    />
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