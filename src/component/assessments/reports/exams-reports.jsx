import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import SearchSelect from "../../common/select/SearchSelect";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import { useReactToPrint } from "react-to-print";
import AGTable from "../../common/table/AGTable";
import { showAlert } from "../../common/sweetalert/sweetalert";

function ExaminationReports(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [semesterList, setSemesterList] = useState([]);
    const [data, setData] = useState([]);
    const componentRef = useRef();
    const printAllComponentRef = useRef();
    const [datatable, setDatatable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Student ID", field: "StudentID" }, { label: "Module Code", field: "ModuleCode" }, { label: "Module Title", field: "ModuleTitle" }, { label: "Total", field: "Total" }, { label: "Student Grade", field: "StudentGrade" }, { label: "Decision", field: "Decision" }], rows: [] });
    const [createReport, setCreateReport] = useState({ ReportType: "", SemesterCode: "", EntryID: "" });
    const [selectedSemester, setSelectedSemester] = useState(null);

    const print = useReactToPrint({ content: () => componentRef.current });
    const printAll = useReactToPrint({ content: () => printAllComponentRef.current });

    const relatedData = async () => {
        const [semRes, studRes] = await Promise.all([api.get("registration/registration-report/semester-list/"), api.get("staff/assessment/exam/students/")]);
        if (semRes.success) { setSemesterList(semRes.data || []); }
        setIsLoading(false);
    };

    useEffect(() => { relatedData(); }, []);

    const onEdit = (e) => { setCreateReport({ ...createReport, [e.target.id]: e.target.value }); };

    const handleSemesterChange = (option) => {
        setSelectedSemester(option);
        setCreateReport({ ...createReport, SemesterCode: option ? option.value : "" });
    };

    const semesterOptions = semesterList.map(s => ({ value: s.SemesterCode, label: s.Description }));

    const onSearch = async () => {
        for (let key in createReport) { if (createReport.hasOwnProperty(key) && key !== "EntryID") { if (createReport[key] === "") { await showAlert("EMPTY FIELD", `Please enter ${key}`, "error"); return false; } } }
        if (createReport.ReportType === "Processed" || createReport.ReportType === "Approved") {
            if (createReport.SemesterCode !== "") {
                setIsLoading(true);
                const { success, data } = await api.get(`staff/assessment/exam/result/by/semester/${createReport.SemesterCode}`);
                if (success && data?.length > 0) {
                    let rows = [];
                    setData(data);
                    data.forEach((item, index) => { rows.push({ sn: index + 1, StudentID: item.StudentID || 'N/A', ModuleCode: item.ModuleCode || 'N/A', ModuleTitle: item.ModuleTitle || 'N/A', Total: item.Total || 0, StudentGrade: item.StudentGrade || 'N/A', Decision: item.Decision || 'N/A' }); });
                    setDatatable({ ...datatable, rows: rows });
                } else { toast.error("NETWORK ERROR. Please try again!"); }
                setIsLoading(false);
            }
        }
    };

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Examination Reports" items={["Assessment", "Examinations", "Reports"]} />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Select Semester <span className="text-danger">*</span></label>
                                <SearchSelect
                                    id="SemesterCode"
                                    options={semesterOptions}
                                    value={selectedSemester}
                                    onChange={handleSemesterChange}
                                    placeholder="Search semester..."
                                />
                            </div>
                            {createReport.SemesterCode && (
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Select Report Type</label>
                                    <select className="form-select" id="ReportType" name="ReportType" value={createReport.ReportType} onChange={onEdit}>
                                        <option value="">Select Option</option>
                                        <option value="Processed">Processed Results</option>
                                        <option value="Approved">Approved Results</option>
                                    </select>
                                </div>
                            )}
                            {createReport.SemesterCode && createReport.ReportType && (
                                <div className="col-md-4 d-flex align-items-end">
                                    <button className="btn btn-primary w-100" onClick={onSearch}>
                                        <i className="fa fa-search me-2"></i>Search
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {datatable.rows.length > 0 && (
                    <div className="card mt-4">
                        <div className="card-body">
                            <AGTable data={datatable} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(ExaminationReports);

