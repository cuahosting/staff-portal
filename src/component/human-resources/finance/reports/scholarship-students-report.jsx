import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";

function ScholarshipStudentsReport(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [scholarshipList, setScholarshipList] = useState([]);
    const [selectedScholarship, setSelectedScholarship] = useState("");
    const [selectedScholarshipInfo, setSelectedScholarshipInfo] = useState(null);
    const [summaryStats, setSummaryStats] = useState({
        totalStudents: 0,
        activeStudents: 0,
        inactiveStudents: 0,
    });

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Student ID", field: "StudentID" },
            { label: "Student Name", field: "StudentName" },
            { label: "Programme", field: "Programme" },
            { label: "Level", field: "Level" },
            { label: "Faculty", field: "Faculty" },
            { label: "Status", field: "Status" },
            { label: "Enrolled Date", field: "EnrolledDate" },
        ],
        rows: [],
    });

    const scholarshipOptions = useMemo(() => {
        return scholarshipList.map((s) => ({
            value: s.EntryID,
            label: `${s.ScholarshipName} (Tuition: ${s.TuitionPercentage}%)`,
        }));
    }, [scholarshipList]);

    const getScholarships = async () => {
        const result = await api.get("staff/finance/reports/scholarships-list");

        if (result.success && result.data?.data) {
            setScholarshipList(result.data.data);
        }
        setIsLoading(false);
    };

    const getReportData = async () => {
        if (!selectedScholarship) {
            setIsLoading(false);
            return;
        }

        const result = await api.get(
            `staff/finance/reports/scholarship-students?scholarshipId=${selectedScholarship}`
        );

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setReportData(data);
            buildTable(data);
            calculateStats(data);

            if (data.length > 0) {
                setSelectedScholarshipInfo({
                    name: data[0].ScholarshipName,
                    tuition: data[0].TuitionPercentage,
                    hostel: data[0].HostelPercentage,
                    feeding: data[0].FeedingPercentage,
                });
            }
        } else {
            setReportData([]);
            setDatatable((prev) => ({ ...prev, rows: [] }));
            setSummaryStats({ totalStudents: 0, activeStudents: 0, inactiveStudents: 0 });
        }
        setIsLoading(false);
    };

    const buildTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            rows.push({
                sn: index + 1,
                StudentID: item.StudentID,
                StudentName: <span className="fw-bold">{item.StudentName || "-"}</span>,
                Programme: item.CourseName || "-",
                Level: item.Level || "-",
                Faculty: (
                    <span className="badge badge-light-primary">
                        {item.FacultyName || "-"}
                    </span>
                ),
                Status: (
                    <span
                        className={`badge badge-light-${item.Status === "Active" ? "success" : "danger"}`}
                    >
                        {item.Status}
                    </span>
                ),
                EnrolledDate: formatDateAndTime(item.EnrolledDate, "date"),
            });
        });

        setDatatable((prev) => ({ ...prev, rows }));
    };

    const calculateStats = (data) => {
        const active = data.filter((d) => d.Status === "Active").length;
        setSummaryStats({
            totalStudents: data.length,
            activeStudents: active,
            inactiveStudents: data.length - active,
        });
    };

    const exportToCSV = () => {
        if (reportData.length === 0) return;

        const headers = [
            "Student ID",
            "Student Name",
            "Programme",
            "Level",
            "Faculty",
            "Status",
            "Enrolled Date",
        ];

        const rows = reportData.map((item) => [
            item.StudentID,
            item.StudentName || "-",
            item.CourseName || "-",
            item.Level || "-",
            item.FacultyName || "-",
            item.Status,
            formatDateAndTime(item.EnrolledDate, "date"),
        ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `scholarship_students_${selectedScholarship}_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        getScholarships();
    }, []);

    useEffect(() => {
        if (selectedScholarship) {
            setIsLoading(true);
            getReportData();
        }
    }, [selectedScholarship]);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Scholarship Students Report"
                items={["Human Resources", "Finance", "Reports", "Scholarship Students"]}
            />

            <div className="flex-column-fluid">
                {/* Scholarship Filter */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row align-items-end">
                            <div className="col-md-5">
                                <label className="form-label required">Select Scholarship</label>
                                <SearchSelect
                                    id="selectedScholarship"
                                    value={
                                        scholarshipOptions.find(
                                            (opt) => opt.value === selectedScholarship
                                        ) || null
                                    }
                                    options={scholarshipOptions}
                                    onChange={(selected) =>
                                        setSelectedScholarship(selected?.value || "")
                                    }
                                    placeholder="Select Scholarship"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-7 text-end">
                                <button
                                    className="btn btn-light-primary"
                                    onClick={exportToCSV}
                                    disabled={reportData.length === 0}
                                >
                                    <i className="fa fa-download me-2"></i>
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedScholarship && (
                    <>
                        {/* Scholarship Info + Stats */}
                        <div className="row g-4 mb-4">
                            <div className="col-md-3">
                                <div className="card bg-light-primary">
                                    <div className="card-body py-4">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-3">
                                                <span className="symbol-label bg-primary">
                                                    <i className="fa fa-users text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-2 fw-bold">
                                                    {summaryStats.totalStudents}
                                                </div>
                                                <div className="text-muted small">Total Students</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-light-success">
                                    <div className="card-body py-4">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-3">
                                                <span className="symbol-label bg-success">
                                                    <i className="fa fa-check-circle text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-2 fw-bold">
                                                    {summaryStats.activeStudents}
                                                </div>
                                                <div className="text-muted small">Active</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-light-danger">
                                    <div className="card-body py-4">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-3">
                                                <span className="symbol-label bg-danger">
                                                    <i className="fa fa-times-circle text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-2 fw-bold">
                                                    {summaryStats.inactiveStudents}
                                                </div>
                                                <div className="text-muted small">Inactive</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {selectedScholarshipInfo && (
                                <div className="col-md-3">
                                    <div className="card bg-light-info">
                                        <div className="card-body py-4">
                                            <div className="d-flex align-items-center">
                                                <div className="symbol symbol-50px me-3">
                                                    <span className="symbol-label bg-info">
                                                        <i className="fa fa-percentage text-white fs-3"></i>
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="fs-6 fw-bold">
                                                        Tuition: {selectedScholarshipInfo.tuition}%
                                                    </div>
                                                    <div className="text-muted small">
                                                        Hostel: {selectedScholarshipInfo.hostel}% | Feeding:{" "}
                                                        {selectedScholarshipInfo.feeding}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Report Table */}
                        <div className="card">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title">
                                    Students under{" "}
                                    {selectedScholarshipInfo?.name || "Selected Scholarship"}
                                </h3>
                                <div className="card-toolbar">
                                    <span className="text-muted fs-7">
                                        {reportData.length} students found
                                    </span>
                                </div>
                            </div>
                            <div className="card-body py-3">
                                {reportData.length > 0 ? (
                                    <AGTable data={datatable} />
                                ) : (
                                    <div className="text-center py-10">
                                        <i className="fa fa-users fs-2x text-muted mb-4"></i>
                                        <p className="text-muted">
                                            No students found for this scholarship
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {!selectedScholarship && (
                    <div className="card">
                        <div className="card-body text-center py-15">
                            <i className="fa fa-award fs-2x text-muted mb-4"></i>
                            <p className="text-muted fs-5">
                                Please select a scholarship to view enrolled students
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(ScholarshipStudentsReport);
