import React, { useMemo } from "react";
import SearchSelect from "../../../common/select/SearchSelect";

const ScholarshipStudentForm = ({ data, scholarships, semesters, students, onEdit, onSelectChange, onSubmit, isFormLoading }) => {
    const semesterOptions = semesters.map(s => ({
        value: s.SemesterCode,
        label: s.SemesterCode
    }));

    const statusOptions = [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
    ];

    const scholarshipOptions = scholarships.map(s => ({
        value: s.EntryID,
        label: s.Name,
        ...s
    }));

    const studentOptions = students.map(s => ({
        value: s.StudentID,
        label: `${s.StudentID} - ${s.Name}`
    }));

    const selectedScholarship = useMemo(() => {
        return scholarshipOptions.find(opt => opt.value === data.ScholarshipID);
    }, [data.ScholarshipID, scholarshipOptions]);

    return (
        <div className="row">
            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <SearchSelect
                        id="StudentID"
                        label="Search Student"
                        required
                        options={studentOptions}
                        value={studentOptions.find(opt => opt.value === data.StudentID)}
                        onChange={(val) => onSelectChange("StudentID", val?.value)}
                        placeholder="Search by ID or Name..."
                    />
                </div>
            </div>

            <div className="col-md-6">
                <div className="fv-row mb-7">
                    <label className="fw-bold fs-6 mb-2">Full Name</label>
                    <input type="text" id="FullName" className="form-control form-control-solid bg-light"
                        placeholder="Auto-populated" value={data.FullName} readOnly />
                </div>
            </div>

            <div className="col-md-6">
                <div className="fv-row mb-7">
                    <label className="fw-bold fs-6 mb-2">Email Address</label>
                    <input type="email" id="EmailAddress" className="form-control form-control-solid bg-light"
                        placeholder="Auto-populated" value={data.EmailAddress} readOnly />
                </div>
            </div>

            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <SearchSelect
                        id="ScholarshipID"
                        label="Scholarship"
                        required
                        options={scholarshipOptions}
                        value={selectedScholarship}
                        onChange={(val) => onSelectChange("ScholarshipID", val?.value)}
                        placeholder="Select Scholarship Program"
                    />
                </div>
            </div>

            {selectedScholarship && (
                <div className="col-md-12 mb-7">
                    <div className="card shadow-none border-dashed border-primary bg-light-primary p-4 rounded-3">
                        <div className="d-flex align-items-center mb-2">
                            <i className="fa fa-info-circle text-primary me-2 fs-4"></i>
                            <span className="fw-bolder text-dark fs-6">Scholarship Benefits Coverage</span>
                        </div>
                        <div className="row g-2">
                            {[
                                { label: 'Admission', val: selectedScholarship.Admission },
                                { label: 'Tuition', val: selectedScholarship.Tuition },
                                { label: 'Feeding', val: selectedScholarship.Feeding },
                                { label: 'Transportation', val: selectedScholarship.Transportation },
                                { label: 'Accommodation', val: selectedScholarship.Accommodation }
                            ].map((benefit, i) => (
                                <div className="col-4" key={i}>
                                    <div className="d-flex flex-column border-start border-primary border-3 ps-2">
                                        <span className="text-muted fw-bold fs-8">{benefit.label}</span>
                                        <span className="text-dark fw-bolder fs-7">{benefit.val}% Coverage</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <SearchSelect
                        id="Semester"
                        label="Enrolment Semester"
                        required
                        options={semesterOptions}
                        value={semesterOptions.find(opt => opt.value === data.Semester)}
                        onChange={(val) => onSelectChange("Semester", val?.value)}
                        placeholder="Select Academic Semester"
                    />
                </div>
            </div>

            {data.EntryID && (
                <div className="col-md-12">
                    <div className="fv-row mb-7">
                        <SearchSelect
                            id="IsActive"
                            label="Enrolment Status"
                            required
                            options={statusOptions}
                            value={statusOptions.find(opt => opt.value === data.IsActive?.toString())}
                            onChange={(val) => onSelectChange("IsActive", val?.value)}
                            placeholder="Select Status"
                        />
                    </div>
                </div>
            )}

            <div className="text-center pt-15">
                <button type="reset" className="btn btn-light me-3 shadow-sm" data-bs-dismiss="modal" id="closeModal">Discard</button>
                <button type="button" className="btn btn-primary shadow-sm" onClick={onSubmit} disabled={isFormLoading === "on"}>
                    <span className="indicator-label">{isFormLoading === "on" ? "Please wait..." : "Submit"}</span>
                </button>
            </div>
        </div>
    );
};

export default ScholarshipStudentForm;
