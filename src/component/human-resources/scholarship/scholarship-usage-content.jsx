import React, { useEffect, useState } from "react";
import AGTable from "../../common/table/AGTable";
import api from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { formatDateAndTime, currencyConverter } from "../../../resources/constants";

function ScholarshipUsageContent(props) {
    const token = props.loginData[0]?.token;

    const [isLoading, setIsLoading] = useState(true);
    const [usageData, setUsageData] = useState([]);
    const [summaryStats, setSummaryStats] = useState({
        totalScholarships: 0,
        totalStudents: 0,
        totalDiscountGiven: 0,
        activeSemesters: 0,
    });
    const [scholarshipList, setScholarshipList] = useState([]);
    const [semesterList, setSemesterList] = useState([]);

    const [filters, setFilters] = useState({
        ScholarshipID: "",
        SemesterCode: "",
    });

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Student ID", field: "StudentID" },
            { label: "Student Name", field: "StudentName" },
            { label: "Scholarship", field: "Scholarship" },
            { label: "Semester", field: "Semester" },
            { label: "Original Amount", field: "OriginalAmount" },
            { label: "Discount", field: "Discount" },
            { label: "Final Amount", field: "FinalAmount" },
            { label: "Applied Date", field: "AppliedDate" },
        ],
        rows: [],
    });

    const getUsageData = async () => {
        let endpoint = "staff/ac-finance/scholarships/usage";
        const params = [];

        if (filters.ScholarshipID) {
            params.push(`scholarshipId=${filters.ScholarshipID}`);
        }
        if (filters.SemesterCode) {
            params.push(`semester=${filters.SemesterCode}`);
        }

        if (params.length > 0) {
            endpoint += "?" + params.join("&");
        }

        const result = await api.get(endpoint, token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setUsageData(data);
            buildTable(data);
            calculateStats(data);
        }
    };

    const buildTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            const discount = item.OriginalAmount - item.FinalAmount;
            rows.push({
                sn: index + 1,
                StudentID: item.StudentID,
                StudentName: <span className="fw-bold">{item.StudentName}</span>,
                Scholarship: (
                    <span className="badge badge-light-primary">{item.ScholarshipName}</span>
                ),
                Semester: item.SemesterName || item.SemesterCode,
                OriginalAmount: currencyConverter(item.OriginalAmount),
                Discount: (
                    <span className="text-success fw-bold">
                        -{currencyConverter(discount)}
                    </span>
                ),
                FinalAmount: currencyConverter(item.FinalAmount),
                AppliedDate: formatDateAndTime(item.AppliedDate, "date"),
            });
        });

        setDatatable({ ...datatable, rows });
    };

    const calculateStats = (data) => {
        const uniqueScholarships = new Set(data.map((d) => d.ScholarshipID));
        const uniqueStudents = new Set(data.map((d) => d.StudentID));
        const uniqueSemesters = new Set(data.map((d) => d.SemesterCode));
        const totalDiscount = data.reduce((sum, item) => {
            return sum + (item.OriginalAmount - item.FinalAmount);
        }, 0);

        setSummaryStats({
            totalScholarships: uniqueScholarships.size,
            totalStudents: uniqueStudents.size,
            totalDiscountGiven: totalDiscount,
            activeSemesters: uniqueSemesters.size,
        });
    };

    const getScholarships = async () => {
        const result = await api.get("staff/ac-finance/scholarships/list", token);

        if (result.success && result.data?.data) {
            setScholarshipList(result.data.data);
        }
    };

    const getSemesters = async () => {
        const result = await api.get("staff/registration/semester/list", token, null, {}, false);

        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setSemesterList(data);
        }
    };

    const onFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.id]: e.target.value,
        });
    };

    const applyFilters = () => {
        getUsageData();
    };

    const clearFilters = () => {
        setFilters({
            ScholarshipID: "",
            SemesterCode: "",
        });
    };

    const exportToCSV = () => {
        if (usageData.length === 0) return;

        const headers = [
            "Student ID",
            "Student Name",
            "Scholarship",
            "Semester",
            "Original Amount",
            "Discount",
            "Final Amount",
            "Applied Date",
        ];

        const rows = usageData.map((item) => [
            item.StudentID,
            item.StudentName,
            item.ScholarshipName,
            item.SemesterName || item.SemesterCode,
            item.OriginalAmount,
            item.OriginalAmount - item.FinalAmount,
            item.FinalAmount,
            formatDateAndTime(item.AppliedDate, "date"),
        ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `scholarship_usage_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getUsageData(), getScholarships(), getSemesters()]);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            getUsageData();
        }
    }, [filters.ScholarshipID, filters.SemesterCode]);

    if (isLoading) return <Loader />;

    return (
        <>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Scholarship Usage Tracking</h4>
                    <p className="text-muted mb-0">
                        Track how scholarships are being applied to student fees
                    </p>
                </div>
                <button className="btn btn-light-primary" onClick={exportToCSV}>
                    <i className="fa fa-download me-2"></i>
                    Export CSV
                </button>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card bg-light-primary">
                        <div className="card-body py-4">
                            <div className="d-flex align-items-center">
                                <div className="symbol symbol-50px me-3">
                                    <span className="symbol-label bg-primary">
                                        <i className="fa fa-award text-white fs-3"></i>
                                    </span>
                                </div>
                                <div>
                                    <div className="fs-2 fw-bold">{summaryStats.totalScholarships}</div>
                                    <div className="text-muted small">Scholarships Used</div>
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
                                        <i className="fa fa-users text-white fs-3"></i>
                                    </span>
                                </div>
                                <div>
                                    <div className="fs-2 fw-bold">{summaryStats.totalStudents}</div>
                                    <div className="text-muted small">Beneficiaries</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-light-warning">
                        <div className="card-body py-4">
                            <div className="d-flex align-items-center">
                                <div className="symbol symbol-50px me-3">
                                    <span className="symbol-label bg-warning">
                                        <i className="fa fa-money-bill text-white fs-3"></i>
                                    </span>
                                </div>
                                <div>
                                    <div className="fs-2 fw-bold">
                                        {currencyConverter(summaryStats.totalDiscountGiven)}
                                    </div>
                                    <div className="text-muted small">Total Discount Given</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-light-info">
                        <div className="card-body py-4">
                            <div className="d-flex align-items-center">
                                <div className="symbol symbol-50px me-3">
                                    <span className="symbol-label bg-info">
                                        <i className="fa fa-calendar text-white fs-3"></i>
                                    </span>
                                </div>
                                <div>
                                    <div className="fs-2 fw-bold">{summaryStats.activeSemesters}</div>
                                    <div className="text-muted small">Semesters Active</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-4">
                            <label htmlFor="ScholarshipID" className="form-label">
                                Scholarship
                            </label>
                            <select
                                id="ScholarshipID"
                                className="form-select form-select-solid"
                                value={filters.ScholarshipID}
                                onChange={onFilterChange}
                            >
                                <option value="">All Scholarships</option>
                                {scholarshipList.map((s) => (
                                    <option key={s.ScholarshipID} value={s.ScholarshipID}>
                                        {s.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="SemesterCode" className="form-label">
                                Semester
                            </label>
                            <select
                                id="SemesterCode"
                                className="form-select form-select-solid"
                                value={filters.SemesterCode}
                                onChange={onFilterChange}
                            >
                                <option value="">All Semesters</option>
                                {semesterList.map((s) => (
                                    <option key={s.SemesterCode} value={s.SemesterCode}>
                                        {s.SemesterName || s.SemesterCode}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <button
                                className="btn btn-light me-2"
                                onClick={clearFilters}
                            >
                                <i className="fa fa-times me-1"></i> Clear
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={applyFilters}
                            >
                                <i className="fa fa-filter me-1"></i> Apply
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Table */}
            <div className="card">
                <div className="card-header border-0 pt-5">
                    <h3 className="card-title align-items-start flex-column">
                        <span className="card-label fw-bold fs-3 mb-1">Usage History</span>
                        <span className="text-muted mt-1 fw-semibold fs-7">
                            {usageData.length} records found
                        </span>
                    </h3>
                </div>
                <div className="card-body py-3">
                    <AGTable data={datatable} />
                </div>
            </div>

            {/* Scholarship Breakdown */}
            {usageData.length > 0 && (
                <div className="card mt-4">
                    <div className="card-header border-0 pt-5">
                        <h3 className="card-title align-items-start flex-column">
                            <span className="card-label fw-bold fs-3 mb-1">Scholarship Breakdown</span>
                            <span className="text-muted mt-1 fw-semibold fs-7">
                                Summary by scholarship type
                            </span>
                        </h3>
                    </div>
                    <div className="card-body py-3">
                        <div className="table-responsive">
                            <table className="table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3">
                                <thead>
                                    <tr className="fw-bold text-muted">
                                        <th>Scholarship</th>
                                        <th className="text-center">Students</th>
                                        <th className="text-end">Total Original</th>
                                        <th className="text-end">Total Discount</th>
                                        <th className="text-end">Total Final</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const grouped = usageData.reduce((acc, item) => {
                                            const key = item.ScholarshipID;
                                            if (!acc[key]) {
                                                acc[key] = {
                                                    name: item.ScholarshipName,
                                                    students: new Set(),
                                                    original: 0,
                                                    final: 0,
                                                };
                                            }
                                            acc[key].students.add(item.StudentID);
                                            acc[key].original += item.OriginalAmount;
                                            acc[key].final += item.FinalAmount;
                                            return acc;
                                        }, {});

                                        return Object.entries(grouped).map(([key, value]) => (
                                            <tr key={key}>
                                                <td>
                                                    <span className="badge badge-light-primary">
                                                        {value.name}
                                                    </span>
                                                </td>
                                                <td className="text-center">{value.students.size}</td>
                                                <td className="text-end">
                                                    {currencyConverter(value.original)}
                                                </td>
                                                <td className="text-end text-success fw-bold">
                                                    -{currencyConverter(value.original - value.final)}
                                                </td>
                                                <td className="text-end fw-bold">
                                                    {currencyConverter(value.final)}
                                                </td>
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ScholarshipUsageContent;
