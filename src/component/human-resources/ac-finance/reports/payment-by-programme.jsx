import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { currencyConverter } from "../../../../resources/constants";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";

function PaymentByProgramme(props) {
    const token = props.loginData[0]?.token;

    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState("");
    const [summaryStats, setSummaryStats] = useState({
        totalBilled: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        totalProgrammes: 0,
    });

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Programme", field: "Programme" },
            { label: "Faculty", field: "Faculty" },
            { label: "Students", field: "Students" },
            { label: "Total Billed", field: "TotalBilled" },
            { label: "Total Paid", field: "TotalPaid" },
            { label: "Outstanding", field: "Outstanding" },
            { label: "Rate", field: "CollectionRate" },
        ],
        rows: [],
    });

    const semesterOptions = useMemo(() => {
        return semesterList.map(s => ({
            value: s.SemesterCode,
            label: (s.SemesterName || s.SemesterCode) + (s.IsCurrent === 1 ? ' (Current)' : '')
        }));
    }, [semesterList]);

    const getReportData = async () => {
        if (!selectedSemester) {
            setIsLoading(false);
            return;
        }

        const result = await api.get(
            `staff/ac-finance/reports/payment-by-programme?semester=${selectedSemester}`,
            token
        );

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setReportData(data);
            buildTable(data);
            calculateStats(data);
        }
        setIsLoading(false);
    };

    const buildTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            const outstanding = item.TotalBilled - item.TotalPaid;
            const rate = item.TotalBilled > 0
                ? ((item.TotalPaid / item.TotalBilled) * 100).toFixed(1)
                : 0;

            rows.push({
                sn: index + 1,
                Programme: <span className="fw-bold">{item.CourseName}</span>,
                Faculty: (
                    <span className="badge badge-light-primary">
                        {item.FacultyName || "-"}
                    </span>
                ),
                Students: item.StudentCount,
                TotalBilled: currencyConverter(item.TotalBilled),
                TotalPaid: (
                    <span className="text-success fw-bold">
                        {currencyConverter(item.TotalPaid)}
                    </span>
                ),
                Outstanding: (
                    <span className={outstanding > 0 ? "text-danger fw-bold" : "text-success"}>
                        {currencyConverter(outstanding)}
                    </span>
                ),
                CollectionRate: (
                    <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1 me-2" style={{ height: "8px", width: "80px" }}>
                            <div
                                className={`progress-bar ${rate >= 80 ? "bg-success" : rate >= 50 ? "bg-warning" : "bg-danger"
                                    }`}
                                style={{ width: `${rate}%` }}
                            ></div>
                        </div>
                        <span className="fw-bold" style={{ minWidth: "45px" }}>{rate}%</span>
                    </div>
                ),
            });
        });

        setDatatable({ ...datatable, rows });
    };

    const calculateStats = (data) => {
        const totals = data.reduce(
            (acc, item) => ({
                billed: acc.billed + item.TotalBilled,
                paid: acc.paid + item.TotalPaid,
            }),
            { billed: 0, paid: 0 }
        );

        setSummaryStats({
            totalBilled: totals.billed,
            totalPaid: totals.paid,
            totalOutstanding: totals.billed - totals.paid,
            totalProgrammes: data.length,
        });
    };

    const getSemesters = async () => {
        const result = await api.get("staff/registration/semester/list", token, null, {}, false);

        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setSemesterList(data);
            if (data.length > 0) {
                const current = data.find((s) => s.IsCurrent === 1);
                setSelectedSemester(current?.SemesterCode || data[0].SemesterCode);
            }
        }
    };

    const exportToCSV = () => {
        if (reportData.length === 0) return;

        const headers = ["Programme", "Faculty", "Students", "Total Billed", "Total Paid", "Outstanding", "Collection Rate"];
        const rows = reportData.map((item) => {
            const outstanding = item.TotalBilled - item.TotalPaid;
            const rate = item.TotalBilled > 0
                ? ((item.TotalPaid / item.TotalBilled) * 100).toFixed(1)
                : 0;

            return [
                item.CourseName,
                item.FacultyName || "-",
                item.StudentCount,
                item.TotalBilled,
                item.TotalPaid,
                outstanding,
                `${rate}%`,
            ];
        });

        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payment_by_programme_${selectedSemester}_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        getSemesters();
    }, []);

    useEffect(() => {
        if (selectedSemester) {
            setIsLoading(true);
            getReportData();
        }
    }, [selectedSemester]);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Payment Report by Programme"
                items={["Human Resources", "AC-Finance", "Reports", "By Programme"]}
            />

            <div className="flex-column-fluid">
                {/* Semester Filter */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row align-items-end">
                            <div className="col-md-4">
                                <label className="form-label required">Select Semester</label>
                                <SearchSelect
                                    id="selectedSemester"
                                    value={semesterOptions.find(opt => opt.value === selectedSemester) || null}
                                    options={semesterOptions}
                                    onChange={(selected) => setSelectedSemester(selected?.value || '')}
                                    placeholder="Select Semester"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-8 text-end">
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

                {selectedSemester && (
                    <>
                        {/* Stats Cards */}
                        <div className="row g-4 mb-4">
                            <div className="col-md-3">
                                <div className="card bg-light-primary">
                                    <div className="card-body py-4">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-3">
                                                <span className="symbol-label bg-primary">
                                                    <i className="fa fa-graduation-cap text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-4 fw-bold">{summaryStats.totalProgrammes}</div>
                                                <div className="text-muted small">Programmes</div>
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
                                                    <i className="fa fa-file-invoice text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-4 fw-bold">
                                                    {currencyConverter(summaryStats.totalBilled)}
                                                </div>
                                                <div className="text-muted small">Total Billed</div>
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
                                                <div className="fs-4 fw-bold">
                                                    {currencyConverter(summaryStats.totalPaid)}
                                                </div>
                                                <div className="text-muted small">Collected</div>
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
                                                    <i className="fa fa-exclamation-triangle text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-4 fw-bold">
                                                    {currencyConverter(summaryStats.totalOutstanding)}
                                                </div>
                                                <div className="text-muted small">Outstanding</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Table */}
                        <div className="card">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title">Payment Summary by Programme</h3>
                            </div>
                            <div className="card-body py-3">
                                {reportData.length > 0 ? (
                                    <AGTable data={datatable} />
                                ) : (
                                    <div className="text-center py-10">
                                        <i className="fa fa-chart-bar fs-2x text-muted mb-4"></i>
                                        <p className="text-muted">No data available for this semester</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {!selectedSemester && (
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

export default connect(mapStateToProps, null)(PaymentByProgramme);
