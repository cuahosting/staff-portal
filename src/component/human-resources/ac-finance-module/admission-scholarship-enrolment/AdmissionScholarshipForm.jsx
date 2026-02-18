import React from "react";
import SearchSelect from "../../../common/select/SearchSelect";

const AdmissionScholarshipForm = ({ data, scholarships, semesters, onEdit, onSelectChange, onSubmit, isFormLoading }) => {

    const semesterOptions = semesters.map(s => ({
        value: s.SemesterCode,
        label: s.SemesterCode
    }));

    const usedOptions = [
        { value: "0", label: "Not Used" },
        { value: "1", label: "Used" },
    ];

    const scholarshipOptions = scholarships.map(s => ({
        value: s.EntryID,
        label: s.Name
    }));

    return (
        <div className="row">
            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <label className="required fw-bold fs-6 mb-2">Applicant Full Name</label>
                    <input type="text" id="FullName" className="form-control form-control-solid"
                        placeholder="Enter full name" value={data.FullName} onChange={onEdit} />
                </div>
            </div>

            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <label className="required fw-bold fs-6 mb-2">Email Address</label>
                    <input type="email" id="EmailAddress" className="form-control form-control-solid"
                        placeholder="Enter email address" value={data.EmailAddress} onChange={onEdit} />
                </div>
            </div>

            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <SearchSelect
                        id="ScholarshipID"
                        label="Scholarship"
                        required
                        options={scholarshipOptions}
                        value={scholarshipOptions.find(opt => opt.value === data.ScholarshipID)}
                        onChange={(val) => onSelectChange("ScholarshipID", val?.value)}
                        placeholder="Select Scholarship"
                    />
                </div>
            </div>

            <div className="col-md-12">
                <div className="fv-row mb-7">
                    <SearchSelect
                        id="SchoolSemester"
                        label="Semester"
                        required
                        options={semesterOptions}
                        value={semesterOptions.find(opt => opt.value === data.SchoolSemester)}
                        onChange={(val) => onSelectChange("SchoolSemester", val?.value)}
                        placeholder="Select Semester"
                    />
                </div>
            </div>

            {data.EntryID && (
                <div className="col-md-12">
                    <div className="fv-row mb-7">
                        <SearchSelect
                            id="IsUsed"
                            label="Status"
                            required
                            options={usedOptions}
                            value={usedOptions.find(opt => opt.value === data.IsUsed?.toString())}
                            onChange={(val) => onSelectChange("IsUsed", val?.value)}
                            placeholder="Select Status"
                        />
                    </div>
                </div>
            )}

            <div className="text-center pt-15">
                <button type="reset" className="btn btn-light me-3" data-bs-dismiss="modal" id="closeModal">Discard</button>
                <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={isFormLoading === "on"}>
                    <span className="indicator-label">{isFormLoading === "on" ? "Please wait..." : "Submit"}</span>
                </button>
            </div>
        </div>
    );
};

export default AdmissionScholarshipForm;
