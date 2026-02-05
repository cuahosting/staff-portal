import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import AGReportTable from "../../../common/table/AGReportTable";
import SearchSelect from "../../../common/select/SearchSelect";
import { currencyConverter } from "../../../../resources/constants";

function TimetableReportByFaculty(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState("");

    const columns = [
        "S/N",
        "Module Code",
        "Module Name",
        "Staff ID",
        "Staff Name",
        "No of Hours",
        "No of Students",
        "Employment Type",
        "Gross Salary"
    ];
    const [tableData, setTableData] = useState([]);

    const getInitialData = async () => {
        try {
            const [semRes, facRes] = await Promise.all([
                api.get("staff/timetable/timetable/semester"),
                api.get("academics/module-running/faculty-list")
            ]);

            if (semRes.success) {
                const sOptions = semRes.data.map(row => ({
                    value: row.SemesterCode,
                    label: `${row.SemesterName} - ${row.SemesterCode}`
                }));
                setSemesterOptions(sOptions);
            }

            if (facRes.success) {
                const fOptions = facRes.data.map(row => ({
                    value: row.FacultyCode,
                    label: row.FacultyName
                }));
                setFacultyOptions(fOptions);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load initial data");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReport = async () => {
        if (!selectedSemester) return toast.info("Please select a semester");
        if (!selectedFaculty) return toast.info("Please select a faculty");

        try {
            setIsLoading(true);
            const { success, data } = await api.get(
                `staff/timetable/report/faculty-staff-analysis?semester=${selectedSemester}&faculty=${selectedFaculty}`
            );

            if (success) {
                if (data && data.length > 0) {
                    const rows = [];
                    let currentDept = null;
                    let sn = 1;

                    data.forEach((item) => {
                        if (item.DepartmentName !== currentDept) {
                            currentDept = item.DepartmentName;
                            // Add a special group header row format that AGReportTable/DataTable understands
                            rows.push({
                                isGroupHeader: true,
                                groupTitle: `Department: ${currentDept || 'N/A'}`
                            });
                        }

                        rows.push([
                            sn++,
                            item.ModuleCode,
                            item.ModuleName,
                            item.StaffID,
                            item.StaffName,
                            item.NoOfHours,
                            item.NoOfStudents,
                            item.EmploymentType || '--',
                            currencyConverter(item.GrossSalary || 0)
                        ]);
                    });
                    setTableData(rows);
                } else {
                    setTableData([]);
                    toast.info("No records found for the selected criteria");
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch report data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getInitialData();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Faculty Staff Analysis Report"}
                items={["Academics", "Timetable", "Faculty Staff Analysis"]}
            />
            <div className="flex-column-fluid">
                <div className="card mb-6">
                    <div className="card-body pt-6">
                        <div className="row">
                            <div className="col-md-4">
                                <label className="form-label fs-6 fw-bolder text-dark">Select Semester</label>
                                <SearchSelect
                                    value={semesterOptions.find(opt => opt.value === selectedSemester) || null}
                                    onChange={(val) => setSelectedSemester(val?.value || "")}
                                    options={semesterOptions}
                                    placeholder="Select Semester"
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fs-6 fw-bolder text-dark">Select Faculty</label>
                                <SearchSelect
                                    value={facultyOptions.find(opt => opt.value === selectedFaculty) || null}
                                    onChange={(val) => setSelectedFaculty(val?.value || "")}
                                    options={facultyOptions}
                                    placeholder="Select Faculty"
                                />
                            </div>
                            <div className="col-md-4 d-flex align-items-end">
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={fetchReport}
                                >
                                    Fetch Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {tableData.length > 0 && (
                    <div className="card mb-6">
                        <div className="card-body">
                            <AGReportTable
                                title={`Analysis Report - ${selectedSemester}`}
                                columns={columns}
                                data={tableData}
                                height={"800px"}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return { loginData: state.LoginDetails };
};

export default connect(mapStateToProps, null)(TimetableReportByFaculty);
