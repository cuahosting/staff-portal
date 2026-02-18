import React from "react";
import SearchSelect from "../../../common/select/SearchSelect";

const CourseScheduleFeeForm = ({ data, courses, onSelectChange, onSubmit, isFormLoading }) => {
    const courseOptions = courses.map(course => ({
        value: course.CourseCode,
        label: `${course.CourseName} (${course.CourseCode})`
    }));

    const levelOptions = [
        { value: "100", label: "100" },
        { value: "200", label: "200" },
        { value: "300", label: "300" },
        { value: "400", label: "400" },
        { value: "500", label: "500" },
        { value: "600", label: "600" },
        { value: "700", label: "700" },
        { value: "800", label: "800" },
        { value: "900", label: "900" },
    ];

    const semesterOptions = [
        { value: "First", label: "1st Semester" },
        { value: "Second", label: "2nd Semester" },
    ];

    const typeOptions = [
        { value: "0", label: "NEW" },
        { value: "1", label: "RETURNING" },
    ];

    return (
        <div className="row">
            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <SearchSelect
                        id="CourseCode"
                        label="Course"
                        required
                        options={courseOptions}
                        value={courseOptions.find(opt => opt.value === data.CourseCode)}
                        onChange={(val) => onSelectChange("CourseCode", val?.value)}
                        placeholder="Select Course"
                    />
                </div>
            </div>
            <div className="col-md-6">
                <div className="fv-row mb-7">
                    <SearchSelect
                        id="Level"
                        label="Level"
                        required
                        options={levelOptions}
                        value={levelOptions.find(opt => opt.value === data.Level)}
                        onChange={(val) => onSelectChange("Level", val?.value)}
                        placeholder="Select Level"
                    />
                </div>
            </div>
            <div className="col-md-6">
                <div className="fv-row mb-7">
                    <SearchSelect
                        id="Semester"
                        label="Semester"
                        required
                        options={semesterOptions}
                        value={semesterOptions.find(opt => opt.value === data.Semester)}
                        onChange={(val) => onSelectChange("Semester", val?.value)}
                        placeholder="Select Semester"
                    />
                </div>
            </div>
            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <SearchSelect
                        id="ScheduleType"
                        label="Schedule Type"
                        required
                        options={typeOptions}
                        value={typeOptions.find(opt => opt.value === data.ScheduleType?.toString())}
                        onChange={(val) => onSelectChange("ScheduleType", val?.value)}
                        placeholder="Select Type"
                    />
                </div>
            </div>
            <div className="text-center pt-15">
                <button type="reset" className="btn btn-light me-3" data-bs-dismiss="modal">Discard</button>
                <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={isFormLoading === "on"}>
                    <span className="indicator-label">{isFormLoading === "on" ? "Please wait..." : "Submit"}</span>
                </button>
            </div>
        </div>
    );
};

export default CourseScheduleFeeForm;
