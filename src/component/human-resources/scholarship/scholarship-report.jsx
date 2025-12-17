import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import api from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { currencyConverter, formatDateAndTime } from "../../../resources/constants";
import { connect } from "react-redux";
import SearchSelect from "../../common/select/SearchSelect";

function ScholarshipReport(props) {
    const token = props.loginData[0]?.token;

    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [scholarshipList, setScholarshipList] = useState([]);
    const [summaryStats, setSummaryStats] = useState({
        totalBeneficiaries: 0,
        totalScholarships: 0,
        totalDiscountGiven: 0,
        averageDiscount: 0,
    });

    const [filters, setFilters] = useState({
        SemesterCode: "",
        ScholarshipID: "",
    });

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Student ID", field: "StudentID" },
            { label: "Student Name", field: "StudentName" },
            { label: "Programme", field: "Programme" },
            { label: "Scholarship", field: "Scholarship" },
            { label: "Original Fee", field: "OriginalFee" },
            { label: "Discount", field: "Discount" },
            { label: "Final Fee", field: "FinalFee" },
            { label: "Applied Date", field: "AppliedDate" },
        ],
        rows: [],
    });

    const [scholarshipSummary, setScholarshipSummary] = useState([]);

    const getReportData = async () => {
        if (!filters.SemesterCode) {
            setIsLoading(false);
            return;
        }

        let endpoint = `staff/ac-finance/reports/scholarship?semester=${filters.SemesterCode}`;

        if (filters.ScholarshipID) {
            endpoint += `&scholarshipId=${filters.ScholarshipID}`;
        }

        const result = await api.get(endpoint, token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setReportData(data);
            buildTable(data);
            calculateStats(data);
            buildScholarshipSummary(data);
        }
        setIsLoading(false);
    };

    const buildTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            const discount = item.OriginalAmount - item.FinalAmount;

            rows.push({
                sn: index + 1,
                StudentID: item.StudentID,
                StudentName: <span className="fw-bold">{item.StudentName}</span>,
                Programme: item.CourseName || "-",
                Scholarship: (
                    <span className="badge badge-light-primary">{item.ScholarshipName}</span>
                ),
                OriginalFee: currencyConverter(item.OriginalAmount),
                Discount: (
                    <span className="text-success fw-bold">
                        -{currencyConverter(discount)}
                    </span>
                ),
                FinalFee: currencyConverter(item.FinalAmount),
                AppliedDate: formatDateAndTime(item.AppliedDate, "date"),
            });
        });

        setDatatable({ ...datatable, rows });
    };

    const calculateStats = (data) => {
        const uniqueScholarships = new Set(data.map((d) => d.ScholarshipID));
        const totalDiscount = data.reduce(
            (sum, item) => sum + (item.OriginalAmount - item.FinalAmount),
            0
        );

        setSummaryStats({
            totalBeneficiaries: data.length,
            totalScholarships: uniqueScholarships.size,
            totalDiscountGiven: totalDiscount,
            averageDiscount: data.length > 0 ? totalDiscount / data.length : 0,
        });
    };

    const buildScholarshipSummary = (data) => {
        const grouped = data.reduce((acc, item) => {
            const key = item.ScholarshipID;
            if (!acc[key]) {
                acc[key] = {
                    name: item.ScholarshipName,
                    students: 0,
                    totalOriginal: 0,
                    totalFinal: 0,
                };
            }
            acc[key].students++;
            acc[key].totalOriginal += item.OriginalAmount;
            acc[key].totalFinal += item.FinalAmount;
            return acc;
        }, {});

        setScholarshipSummary(Object.values(grouped));
    };

    const getSemesters = async () => {
        const result = await api.get("staff/registration/semester/list", token, null, {}, false);

        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setSemesterList(data);
            if (data.length > 0) {
                const current = data.find((s) => s.IsCurrent === 1);
                setFilters((prev) => ({
                    ...prev,
                    SemesterCode: current?.SemesterCode || data[0].SemesterCode,
                }));
            }
        }
    };

    const getScholarships = async () => {
        const result = await api.get("staff/ac-finance/scholarships/list", token);

        if (result.success && result.data?.data) {
            setScholarshipList(result.data.data);
        }
    };

    const onFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.id]: e.target.value,
        });
    };

    const semesterOptions = useMemo(() => {
        return semesterList.map(s => ({
            value: s.SemesterCode,
            label: (s.SemesterName || s.SemesterCode) + (s.IsCurrent === 1 ? ' (Current)' : '')
        }));
    }, [semesterList]);

    const scholarshipOptions = useMemo(() => {
        return [{ value: '', label: 'All Scholarships' }, ...scholarshipList.map(s => ({
            value: s.ScholarshipID,
            label: s.Name
        }))];
    }, [scholarshipList]);

    const applyFilters = () => {
        setIsLoading(true);
        getReportData();
    };

    const exportToCSV = () => {
        if (reportData.length === 0) return;

        const headers = [
            "Student ID",
            "Student Name",
            "Programme",
            "Scholarship",
            "Original Fee",
            "Discount",
            "Final Fee",
            "Applied Date",
        ];

        const rows = reportData.map((item) => [
            item.StudentID,
            item.StudentName,
            item.CourseName || "-",
            item.ScholarshipName,
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
        a.download = `scholarship_report_${filters.SemesterCode}_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getSemesters(), getScholarships()]);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (filters.SemesterCode) {
            setIsLoading(true);
            getReportData();
        }
    }, [filters.SemesterCode, filters.ScholarshipID]);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Scholarship Report"
                items={["Human Resources", "Scholarship", "Reports"]}
            />

            <div className="flex-column-fluid">
                {/* Filters */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-4">
                                <label className="form-label required">Select Semester</label>
                                <SearchSelect
                                    id="SemesterCode"
                                    value={semesterOptions.find(opt => opt.value === filters.SemesterCode) || null}
                                    options={semesterOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'SemesterCode', value: selected?.value || '' } })}
                                    placeholder="Select Semester"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Scholarship</label>
                                <SearchSelect
                                    id="ScholarshipID"
                                    value={scholarshipOptions.find(opt => opt.value === filters.ScholarshipID) || scholarshipOptions[0]}
                                    options={scholarshipOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'ScholarshipID', value: selected?.value || '' } })}
                                    placeholder="All Scholarships"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-4 text-end">
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

                {filters.SemesterCode && (
                    <>
                        {/* Stats Cards */}
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
                                                    {summaryStats.totalBeneficiaries}
                                                </div>
                                                <div className="text-muted small">Beneficiaries</div>
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
                                                    <i className="fa fa-award text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-2 fw-bold">
                                                    {summaryStats.totalScholarships}
                                                </div>
                                                <div className="text-muted small">Scholarship Types</div>
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
                                                    <i className="fa fa-money-bill text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-4 fw-bold">
                                                    {currencyConverter(summaryStats.totalDiscountGiven)}
                                                </div>
                                                <div className="text-muted small">Total Discount</div>
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
                                                    <i className="fa fa-calculator text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-4 fw-bold">
                                                    {currencyConverter(summaryStats.averageDiscount)}
                                                </div>
                                                <div className="text-muted small">Avg. Discount</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scholarship Summary */}
                        {scholarshipSummary.length > 0 && (
                            <div className="card mb-4">
                                <div className="card-header border-0 pt-5">
                                    <h3 className="card-title">Summary by Scholarship Type</h3>
                                </div>
                                <div className="card-body py-3">
                                    <div className="table-responsive">
                                        <table className="table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3">
                                            <thead>
                                                <tr className="fw-bold text-muted">
                                                    <th>Scholarship</th>
                                                    <th className="text-center">Students</th>
                                                    <th className="text-end">Original Total</th>
                                                    <th className="text-end">Total Discount</th>
                                                    <th className="text-end">Final Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {scholarshipSummary.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <span className="badge badge-light-primary">
                                                                {item.name}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">{item.students}</td>
                                                        <td className="text-end">
                                                            {currencyConverter(item.totalOriginal)}
                                                        </td>
                                                        <td className="text-end text-success fw-bold">
                                                            -{currencyConverter(item.totalOriginal - item.totalFinal)}
                                                        </td>
                                                        <td className="text-end fw-bold">
                                                            {currencyConverter(item.totalFinal)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="fw-bold bg-light">
                                                    <td>Total</td>
                                                    <td className="text-center">
                                                        {scholarshipSummary.reduce((s, i) => s + i.students, 0)}
                                                    </td>
                                                    <td className="text-end">
                                                        {currencyConverter(
                                                            scholarshipSummary.reduce((s, i) => s + i.totalOriginal, 0)
                                                        )}
                                                    </td>
                                                    <td className="text-end text-success">
                                                        -
                                                        {currencyConverter(
                                                            scholarshipSummary.reduce(
                                                                (s, i) => s + (i.totalOriginal - i.totalFinal),
                                                                0
                                                            )
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {currencyConverter(
                                                            scholarshipSummary.reduce((s, i) => s + i.totalFinal, 0)
                                                        )}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detailed Report Table */}
                        <div className="card">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title">Detailed Scholarship Applications</h3>
                                <div className="card-toolbar">
                                    <span className="text-muted fs-7">
                                        {reportData.length} records found
                                    </span>
                                </div>
                            </div>
                            <div className="card-body py-3">
                                {reportData.length > 0 ? (
                                    <AGTable data={datatable} />
                                ) : (
                                    <div className="text-center py-10">
                                        <i className="fa fa-award fs-2x text-muted mb-4"></i>
                                        <p className="text-muted">No scholarship data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {!filters.SemesterCode && (
                    <div className="card">
                        <div className="card-body text-center py-15">
                            <i className="fa fa-calendar-alt fs-2x text-muted mb-4"></i>
                            <p className="text-muted fs-5">Please select a semester to view the report</p>
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

export default connect(mapStateToProps, null)(ScholarshipReport);
