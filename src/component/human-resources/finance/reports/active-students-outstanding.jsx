import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";

function ActiveStudentsOutstanding(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [levelList, setLevelList] = useState([]);
    const [programmeList, setProgrammeList] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [summaryStats, setSummaryStats] = useState({
        TotalStudents: 0,
        TotalOutstanding: 0,
        AverageOutstanding: 0,
        HighestOutstanding: 0,
        LowestOutstanding: 0,
        GrandTotalBilled: 0,
        GrandTotalPaid: 0,
    });
    const [byLevel, setByLevel] = useState([]);
    const [byFaculty, setByFaculty] = useState([]);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalStudent, setModalStudent] = useState(null);
    const [modalInvoices, setModalInvoices] = useState([]);
    const [modalPayments, setModalPayments] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    const [filters, setFilters] = useState({
        SemesterCode: "",
        Level: "",
        ProgrammeID: "",
        FacultyCode: "",
        MinAmount: "",
    });

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Student ID", field: "StudentID" },
            { label: "Student Name", field: "StudentName" },
            { label: "Programme", field: "Programme" },
            { label: "Faculty", field: "Faculty" },
            { label: "Level", field: "Level" },
            { label: "Total Billed", field: "TotalBilled" },
            { label: "Total Paid", field: "TotalPaid" },
            { label: "Outstanding", field: "Outstanding" },
            { label: "Action", field: "action" },
        ],
        rows: [],
    });

    const semesterOptions = useMemo(() => {
        return semesterList.map(s => ({
            value: s.SemesterCode,
            label: s.SemesterName || s.SemesterCode
        }));
    }, [semesterList]);

    const levelOptions = useMemo(() => {
        return [{ value: '', label: 'All' }, ...levelList.map(l => ({
            value: l.Level,
            label: l.LevelName || l.Level
        }))];
    }, [levelList]);

    const programmeOptions = useMemo(() => {
        return [{ value: '', label: 'All' }, ...programmeList.map(p => ({
            value: p.CourseID,
            label: p.CourseName
        }))];
    }, [programmeList]);

    const facultyOptions = useMemo(() => {
        return [{ value: '', label: 'All' }, ...facultyList.map(f => ({
            value: f.FacultyCode,
            label: f.FacultyName
        }))];
    }, [facultyList]);

    const getReportData = async () => {
        if (!filters.SemesterCode) {
            setIsLoading(false);
            return;
        }

        let endpoint = `staff/finance/reports/active-students-outstanding?semester=${filters.SemesterCode}`;
        if (filters.Level) endpoint += `&level=${filters.Level}`;
        if (filters.ProgrammeID) endpoint += `&programme=${filters.ProgrammeID}`;
        if (filters.FacultyCode) endpoint += `&faculty=${filters.FacultyCode}`;
        if (filters.MinAmount) endpoint += `&minAmount=${filters.MinAmount}`;

        const result = await api.get(endpoint);

        if (result.success && result.data?.data) {
            const { summary, byLevel: lvl, byFaculty: fac, rows } = result.data.data;
            setReportData(rows || []);
            setSummaryStats(summary || {});
            setByLevel(lvl || []);
            setByFaculty(fac || []);
            buildTable(rows || []);
        }
        setIsLoading(false);
    };

    const buildTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            const outstanding = parseFloat(item.Outstanding) || (item.TotalBilled - item.TotalPaid);

            rows.push({
                sn: index + 1,
                StudentID: item.StudentID,
                StudentName: <span className="fw-bold">{item.StudentName}</span>,
                Programme: item.CourseName || "-",
                Faculty: item.FacultyName || "-",
                Level: item.Level || "-",
                TotalBilled: currencyConverter(item.TotalBilled),
                TotalPaid: (
                    <span className="text-success">{currencyConverter(item.TotalPaid)}</span>
                ),
                Outstanding: (
                    <span className="text-danger fw-bold">
                        {currencyConverter(outstanding)}
                    </span>
                ),
                action: (
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-light-info"
                            onClick={() => viewStudentDetails(item)}
                            title="View Details"
                        >
                            <i className="fa fa-eye"></i>
                        </button>
                        <button
                            className="btn btn-sm btn-light-primary"
                            onClick={() => sendReminder(item)}
                            title="Send Reminder"
                        >
                            <i className="fa fa-envelope"></i>
                        </button>
                    </div>
                ),
            });
        });

        setDatatable((prev) => ({ ...prev, rows }));
    };

    const getSemesters = async () => {
        const result = await api.get("staff/registration/semester/list");
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

    const getLevels = async () => {
        const result = await api.get("staff/academics/levels/list");
        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setLevelList(data);
        }
    };

    const getProgrammes = async () => {
        const result = await api.get("staff/academics/courses/list");
        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setProgrammeList(data);
        }
    };

    const getFaculties = async () => {
        const result = await api.get("staff/academics/faculty/list");
        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            setFacultyList(data);
        }
    };

    const viewStudentDetails = async (item) => {
        setModalStudent(item);
        setShowModal(true);
        setModalLoading(true);
        setModalInvoices([]);
        setModalPayments([]);

        const invoiceResult = await api.get(
            `staff/finance/invoices/list?semester=${filters.SemesterCode}&search=${item.StudentID}`
        );
        if (invoiceResult.success && invoiceResult.data?.data) {
            const invoices = invoiceResult.data.data;
            setModalInvoices(invoices);

            const allPayments = [];
            for (const inv of invoices) {
                const payResult = await api.get(`staff/finance/invoices/payments/${inv.InvoiceID}`);
                if (payResult.success && payResult.data?.data) {
                    allPayments.push(...payResult.data.data.map(p => ({
                        ...p,
                        InvoiceNumber: inv.InvoiceNumber,
                    })));
                }
            }
            setModalPayments(allPayments);
        }
        setModalLoading(false);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalStudent(null);
        setModalInvoices([]);
        setModalPayments([]);
    };

    const sendReminder = async (item) => {
        alert(`Reminder would be sent to ${item.StudentName} (${item.Email || "No email"})`);
    };

    const onFilterChange = (e) => {
        setFilters({ ...filters, [e.target.id]: e.target.value });
    };

    const applyFilters = () => {
        setIsLoading(true);
        getReportData();
    };

    const clearFilters = () => {
        setFilters({
            ...filters,
            Level: "",
            ProgrammeID: "",
            FacultyCode: "",
            MinAmount: "",
        });
    };

    const exportToCSV = () => {
        if (reportData.length === 0) return;

        const headers = [
            "Student ID", "Student Name", "Programme", "Department",
            "Faculty", "Level", "Phone", "Email",
            "Total Billed", "Total Paid", "Outstanding",
        ];
        const csvRows = reportData.map((item) => [
            item.StudentID,
            item.StudentName,
            item.CourseName || "-",
            item.DepartmentName || "-",
            item.FacultyName || "-",
            item.Level || "-",
            item.PhoneNumber || "-",
            item.Email || "-",
            item.TotalBilled,
            item.TotalPaid,
            parseFloat(item.Outstanding) || (item.TotalBilled - item.TotalPaid),
        ]);

        const csvContent = [headers, ...csvRows]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `active_students_outstanding_${filters.SemesterCode}_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        Promise.all([getSemesters(), getLevels(), getProgrammes(), getFaculties()]);
    }, []);

    useEffect(() => {
        if (filters.SemesterCode) {
            setIsLoading(true);
            getReportData();
        }
    }, [filters.SemesterCode]);

    const collectionRate = summaryStats.GrandTotalBilled > 0
        ? ((summaryStats.GrandTotalPaid / summaryStats.GrandTotalBilled) * 100).toFixed(1)
        : 0;

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Active Students - Outstanding Balances"
                items={["Human Resources", "Finance", "Reports", "Active Students Outstanding"]}
            />

            <div className="flex-column-fluid">
                {/* Filters */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-2">
                                <label className="form-label required">Semester</label>
                                <SearchSelect
                                    id="SemesterCode"
                                    value={semesterOptions.find(opt => opt.value === filters.SemesterCode) || null}
                                    options={semesterOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'SemesterCode', value: selected?.value || '' } })}
                                    placeholder="Select"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Level</label>
                                <SearchSelect
                                    id="Level"
                                    value={levelOptions.find(opt => opt.value === filters.Level) || levelOptions[0]}
                                    options={levelOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'Level', value: selected?.value || '' } })}
                                    placeholder="All"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Faculty</label>
                                <SearchSelect
                                    id="FacultyCode"
                                    value={facultyOptions.find(opt => opt.value === filters.FacultyCode) || facultyOptions[0]}
                                    options={facultyOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'FacultyCode', value: selected?.value || '' } })}
                                    placeholder="All"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Programme</label>
                                <SearchSelect
                                    id="ProgrammeID"
                                    value={programmeOptions.find(opt => opt.value === filters.ProgrammeID) || programmeOptions[0]}
                                    options={programmeOptions}
                                    onChange={(selected) => onFilterChange({ target: { id: 'ProgrammeID', value: selected?.value || '' } })}
                                    placeholder="All"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-1">
                                <label className="form-label">Min Amt</label>
                                <input
                                    type="number"
                                    id="MinAmount"
                                    className="form-control form-control-solid"
                                    placeholder="0"
                                    value={filters.MinAmount}
                                    onChange={onFilterChange}
                                />
                            </div>
                            <div className="col-md-3">
                                <div className="d-flex gap-2">
                                    <button className="btn btn-light" onClick={clearFilters}>
                                        <i className="fa fa-times me-1"></i> Clear
                                    </button>
                                    <button className="btn btn-primary" onClick={applyFilters}>
                                        <i className="fa fa-filter me-1"></i> Apply
                                    </button>
                                    <button
                                        className="btn btn-light-primary"
                                        onClick={exportToCSV}
                                        disabled={reportData.length === 0}
                                    >
                                        <i className="fa fa-download"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {filters.SemesterCode && (
                    <>
                        {/* Summary Stats */}
                        <div className="row g-4 mb-4">
                            <div className="col-md-3">
                                <div className="card bg-light-danger">
                                    <div className="card-body py-4">
                                        <div className="d-flex align-items-center">
                                            <div className="symbol symbol-50px me-3">
                                                <span className="symbol-label bg-danger">
                                                    <i className="fa fa-users text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-2 fw-bold">{summaryStats.TotalStudents || 0}</div>
                                                <div className="text-muted small">Active Students with Debt</div>
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
                                                    <i className="fa fa-exclamation-triangle text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-4 fw-bold">
                                                    {currencyConverter(summaryStats.TotalOutstanding || 0)}
                                                </div>
                                                <div className="text-muted small">Total Outstanding</div>
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
                                                    <i className="fa fa-calculator text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-4 fw-bold">
                                                    {currencyConverter(summaryStats.AverageOutstanding || 0)}
                                                </div>
                                                <div className="text-muted small">Avg. Outstanding</div>
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
                                                    <i className="fa fa-percentage text-white fs-3"></i>
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fs-2 fw-bold">{collectionRate}%</div>
                                                <div className="text-muted small">Collection Rate</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown Cards */}
                        <div className="row g-4 mb-4">
                            {/* By Level */}
                            {byLevel.length > 0 && (
                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-header border-0 pt-5">
                                            <h3 className="card-title">Outstanding by Level</h3>
                                        </div>
                                        <div className="card-body py-3">
                                            <div className="table-responsive">
                                                <table className="table table-sm table-bordered" style={{ fontSize: 13 }}>
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Level</th>
                                                            <th className="text-center">Students</th>
                                                            <th className="text-end">Billed</th>
                                                            <th className="text-end">Paid</th>
                                                            <th className="text-end">Outstanding</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {byLevel.map((row, i) => (
                                                            <tr key={i}>
                                                                <td className="fw-bold">{row.Level}</td>
                                                                <td className="text-center">{row.StudentCount}</td>
                                                                <td className="text-end">{currencyConverter(row.TotalBilled)}</td>
                                                                <td className="text-end text-success">{currencyConverter(row.TotalPaid)}</td>
                                                                <td className="text-end text-danger fw-bold">{currencyConverter(row.Outstanding)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* By Faculty */}
                            {byFaculty.length > 0 && (
                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-header border-0 pt-5">
                                            <h3 className="card-title">Outstanding by Faculty</h3>
                                        </div>
                                        <div className="card-body py-3">
                                            <div className="table-responsive">
                                                <table className="table table-sm table-bordered" style={{ fontSize: 13 }}>
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Faculty</th>
                                                            <th className="text-center">Students</th>
                                                            <th className="text-end">Billed</th>
                                                            <th className="text-end">Paid</th>
                                                            <th className="text-end">Outstanding</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {byFaculty.map((row, i) => (
                                                            <tr key={i}>
                                                                <td className="fw-bold">{row.FacultyName}</td>
                                                                <td className="text-center">{row.StudentCount}</td>
                                                                <td className="text-end">{currencyConverter(row.TotalBilled)}</td>
                                                                <td className="text-end text-success">{currencyConverter(row.TotalPaid)}</td>
                                                                <td className="text-end text-danger fw-bold">{currencyConverter(row.Outstanding)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Student Detail Table */}
                        <div className="card">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title">Active Students with Outstanding Balances</h3>
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
                                        <i className="fa fa-check-circle fs-2x text-success mb-4"></i>
                                        <p className="text-muted">No active students with outstanding payments found</p>
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

            {/* Student Payment Details Modal */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Payment Details - {modalStudent?.StudentName}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                {modalLoading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" />
                                        <p className="text-muted mt-2">Loading payment details...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Student Summary */}
                                        <div className="bg-light rounded p-4 mb-4">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="mb-2"><span className="text-muted">Student ID:</span> <strong>{modalStudent?.StudentID}</strong></div>
                                                    <div className="mb-2"><span className="text-muted">Name:</span> <strong>{modalStudent?.StudentName}</strong></div>
                                                    <div className="mb-2"><span className="text-muted">Programme:</span> {modalStudent?.CourseName || '-'}</div>
                                                    <div><span className="text-muted">Faculty:</span> {modalStudent?.FacultyName || '-'}</div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-2"><span className="text-muted">Level:</span> {modalStudent?.Level || '-'}</div>
                                                    <div className="mb-2"><span className="text-muted">Phone:</span> {modalStudent?.PhoneNumber || '-'}</div>
                                                    <div className="mb-2"><span className="text-muted">Total Billed:</span> <strong>{currencyConverter(modalStudent?.TotalBilled)}</strong></div>
                                                    <div><span className="text-muted">Total Paid:</span> <span className="text-success fw-bold">{currencyConverter(modalStudent?.TotalPaid)}</span></div>
                                                </div>
                                            </div>
                                            <hr />
                                            <div className="text-center">
                                                <span className="text-muted">Outstanding Balance: </span>
                                                <span className="text-danger fw-bold fs-4">
                                                    {currencyConverter(parseFloat(modalStudent?.Outstanding) || (modalStudent?.TotalBilled - modalStudent?.TotalPaid))}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Invoices */}
                                        <h6 className="fw-bold mb-3">Invoices</h6>
                                        {modalInvoices.length === 0 ? (
                                            <p className="text-muted">No invoices found</p>
                                        ) : (
                                            <div className="table-responsive mb-4">
                                                <table className="table table-sm table-bordered" style={{ fontSize: 13 }}>
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Invoice No</th>
                                                            <th className="text-end">Total Amount</th>
                                                            <th className="text-end">Paid</th>
                                                            <th className="text-end">Balance</th>
                                                            <th>Status</th>
                                                            <th>Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {modalInvoices.map((inv, i) => {
                                                            const balance = parseFloat(inv.BalanceDue) || 0;
                                                            const status = inv.Status === 'FullyPaid' ? 'Paid'
                                                                : inv.Status === 'PartiallyPaid' ? 'Partial'
                                                                : inv.Status === 'Cancelled' ? 'Cancelled' : 'Unpaid';
                                                            return (
                                                                <tr key={i}>
                                                                    <td className="fw-bold text-primary">#{inv.InvoiceNumber}</td>
                                                                    <td className="text-end">{currencyConverter(inv.TotalAmount)}</td>
                                                                    <td className="text-end text-success">{currencyConverter(inv.AmountPaid)}</td>
                                                                    <td className={`text-end fw-bold ${balance > 0 ? 'text-danger' : 'text-success'}`}>
                                                                        {currencyConverter(balance)}
                                                                    </td>
                                                                    <td>
                                                                        <span className={`badge badge-light-${status === 'Paid' ? 'success' : status === 'Partial' ? 'warning' : status === 'Cancelled' ? 'secondary' : 'danger'}`}>
                                                                            {status}
                                                                        </span>
                                                                    </td>
                                                                    <td>{formatDateAndTime(inv.InsertedDate, "date")}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Payments */}
                                        <h6 className="fw-bold mb-3">Payment History</h6>
                                        {modalPayments.length === 0 ? (
                                            <p className="text-muted">No payments recorded</p>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-sm table-bordered" style={{ fontSize: 13 }}>
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Reference</th>
                                                            <th>Invoice</th>
                                                            <th className="text-end">Amount</th>
                                                            <th>Method</th>
                                                            <th>Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {modalPayments.map((p, i) => (
                                                            <tr key={i}>
                                                                <td>{p.PaymentReference || '-'}</td>
                                                                <td className="text-primary">#{p.InvoiceNumber}</td>
                                                                <td className="text-end text-success fw-bold">{currencyConverter(p.Amount)}</td>
                                                                <td><span className="badge badge-light-info">{p.PaymentMethod || 'N/A'}</span></td>
                                                                <td>{formatDateAndTime(p.PaymentDate, "date")}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" onClick={closeModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(ActiveStudentsOutstanding);
