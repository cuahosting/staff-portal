import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../common/pageheader/pageheader";
import Loader from "../../common/loader/loader";
import api from "../../../resources/api";
import { currencyConverter } from "../../../resources/constants";
import { connect } from "react-redux";

function AcFinanceDashboard(props) {
    const token = props.loginData[0]?.token;

    const [isLoading, setIsLoading] = useState(true);
    const [statistics, setStatistics] = useState({
        totalFeeItems: 0,
        totalSchedules: 0,
        activeScholarships: 0,
        scholarshipBeneficiaries: 0,
        totalInvoiced: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        collectionRate: 0,
    });
    const [recentPayments, setRecentPayments] = useState([]);
    const [topOutstanding, setTopOutstanding] = useState([]);

    const menuItems = [
        {
            title: "Fee Items",
            description: "Manage fee item definitions",
            icon: "fa-solid fa-list-check",
            link: "/human-resources/ac-finance/fee-items",
            color: "primary",
        },
        {
            title: "Fee Schedules",
            description: "Configure course fee schedules",
            icon: "fa-solid fa-calendar-days",
            link: "/human-resources/ac-finance/fee-schedules",
            color: "info",
        },
        {
            title: "Scholarships",
            description: "Manage scholarships & enrollments",
            icon: "fa-solid fa-graduation-cap",
            link: "/human-resources/ac-finance/scholarships",
            color: "success",
        },
        {
            title: "Invoices",
            description: "View and manage student invoices",
            icon: "fa-solid fa-file-invoice-dollar",
            link: "/human-resources/ac-finance/invoices",
            color: "warning",
        },
        {
            title: "Balances",
            description: "Outstanding & credit balances",
            icon: "fa-solid fa-scale-balanced",
            link: "/human-resources/ac-finance/balances",
            color: "danger",
        },
        {
            title: "Other Fees",
            description: "Miscellaneous fee management",
            icon: "fa-solid fa-coins",
            link: "/human-resources/ac-finance/other-fees",
            color: "secondary",
        },
        {
            title: "Payment History",
            description: "View student payment records",
            icon: "fa-solid fa-clock-rotate-left",
            link: "/human-resources/ac-finance/payment-history",
            color: "dark",
        },
    ];

    const reportItems = [
        {
            title: "Payment by Level",
            link: "/human-resources/ac-finance/reports/payment-by-level",
            icon: "fa-solid fa-layer-group",
        },
        {
            title: "Payment by Programme",
            link: "/human-resources/ac-finance/reports/payment-by-programme",
            icon: "fa-solid fa-book",
        },
        {
            title: "Payment by Department",
            link: "/human-resources/ac-finance/reports/payment-by-department",
            icon: "fa-solid fa-building",
        },
        {
            title: "Payment by Faculty",
            link: "/human-resources/ac-finance/reports/payment-by-faculty",
            icon: "fa-solid fa-university",
        },
        {
            title: "Outstanding Report",
            link: "/human-resources/ac-finance/reports/outstanding",
            icon: "fa-solid fa-exclamation-triangle",
        },
        {
            title: "Balance Report",
            link: "/human-resources/ac-finance/reports/balance",
            icon: "fa-solid fa-wallet",
        },
        {
            title: "Scholarship Report",
            link: "/human-resources/ac-finance/reports/scholarships",
            icon: "fa-solid fa-award",
        },
    ];

    const getDashboardData = async () => {
        try {
            // Fetch overview statistics
            const overviewResult = await api.get(
                "staff/ac-finance/dashboard/overview",
                token,
                null,
                {},
                false
            );

            if (overviewResult.success && overviewResult.data) {
                setStatistics(overviewResult.data);
            }

            // Fetch recent payments
            const paymentsResult = await api.get(
                "staff/ac-finance/payments/list",
                token,
                { limit: 10 },
                {},
                false
            );

            if (paymentsResult.success && paymentsResult.data?.data) {
                setRecentPayments(paymentsResult.data.data.slice(0, 10));
            }

            // Fetch top outstanding
            const outstandingResult = await api.get(
                "staff/ac-finance/balances/students-with-outstanding",
                token,
                { limit: 10 },
                {},
                false
            );

            if (outstandingResult.success && outstandingResult.data?.data) {
                setTopOutstanding(outstandingResult.data.data.slice(0, 10));
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getDashboardData();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="AC-Finance Dashboard"
                items={["Human Resources", "AC-Finance", "Dashboard"]}
            />

            <div className="flex-column-fluid">
                {/* Statistics Cards */}
                <div className="row g-5 g-xl-8 mb-5">
                    <div className="col-xl-3 col-md-6">
                        <div className="card bg-primary hoverable card-xl-stretch mb-xl-8">
                            <div className="card-body">
                                <i className="fa-solid fa-file-invoice-dollar text-white fs-2x"></i>
                                <div className="text-white fw-bold fs-2 mt-3">
                                    {currencyConverter(statistics.totalInvoiced)}
                                </div>
                                <div className="text-white fw-semibold fs-6">Total Invoiced</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <div className="card bg-success hoverable card-xl-stretch mb-xl-8">
                            <div className="card-body">
                                <i className="fa-solid fa-check-circle text-white fs-2x"></i>
                                <div className="text-white fw-bold fs-2 mt-3">
                                    {currencyConverter(statistics.totalCollected)}
                                </div>
                                <div className="text-white fw-semibold fs-6">Total Collected</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <div className="card bg-danger hoverable card-xl-stretch mb-xl-8">
                            <div className="card-body">
                                <i className="fa-solid fa-exclamation-circle text-white fs-2x"></i>
                                <div className="text-white fw-bold fs-2 mt-3">
                                    {currencyConverter(statistics.totalOutstanding)}
                                </div>
                                <div className="text-white fw-semibold fs-6">Total Outstanding</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <div className="card bg-info hoverable card-xl-stretch mb-xl-8">
                            <div className="card-body">
                                <i className="fa-solid fa-percent text-white fs-2x"></i>
                                <div className="text-white fw-bold fs-2 mt-3">
                                    {statistics.collectionRate}%
                                </div>
                                <div className="text-white fw-semibold fs-6">Collection Rate</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="row g-5 g-xl-8 mb-5">
                    <div className="col-xl-3 col-md-6">
                        <div className="card hoverable card-xl-stretch mb-xl-8">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-50px me-5">
                                        <span className="symbol-label bg-light-primary">
                                            <i className="fa-solid fa-list text-primary fs-2x"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="fw-bold fs-2">{statistics.totalFeeItems}</div>
                                        <div className="text-muted fs-6">Fee Items</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <div className="card hoverable card-xl-stretch mb-xl-8">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-50px me-5">
                                        <span className="symbol-label bg-light-info">
                                            <i className="fa-solid fa-calendar text-info fs-2x"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="fw-bold fs-2">{statistics.totalSchedules}</div>
                                        <div className="text-muted fs-6">Fee Schedules</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <div className="card hoverable card-xl-stretch mb-xl-8">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-50px me-5">
                                        <span className="symbol-label bg-light-success">
                                            <i className="fa-solid fa-graduation-cap text-success fs-2x"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="fw-bold fs-2">{statistics.activeScholarships}</div>
                                        <div className="text-muted fs-6">Active Scholarships</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <div className="card hoverable card-xl-stretch mb-xl-8">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-50px me-5">
                                        <span className="symbol-label bg-light-warning">
                                            <i className="fa-solid fa-users text-warning fs-2x"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="fw-bold fs-2">{statistics.scholarshipBeneficiaries}</div>
                                        <div className="text-muted fs-6">Scholarship Beneficiaries</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Access Menu */}
                <div className="row g-5 g-xl-8 mb-5">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title align-items-start flex-column">
                                    <span className="card-label fw-bold fs-3 mb-1">Quick Access</span>
                                    <span className="text-muted mt-1 fw-semibold fs-7">
                                        Navigate to different modules
                                    </span>
                                </h3>
                            </div>
                            <div className="card-body py-3">
                                <div className="row g-4">
                                    {menuItems.map((item, index) => (
                                        <div className="col-xl-3 col-md-4 col-sm-6" key={index}>
                                            <Link
                                                to={item.link}
                                                className={`card bg-light-${item.color} hoverable card-xl-stretch mb-xl-8 text-decoration-none`}
                                            >
                                                <div className="card-body">
                                                    <i className={`${item.icon} text-${item.color} fs-2x mb-3`}></i>
                                                    <div className={`text-${item.color} fw-bold fs-5`}>
                                                        {item.title}
                                                    </div>
                                                    <div className="text-muted fs-7">{item.description}</div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reports Section */}
                <div className="row g-5 g-xl-8 mb-5">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title align-items-start flex-column">
                                    <span className="card-label fw-bold fs-3 mb-1">Reports</span>
                                    <span className="text-muted mt-1 fw-semibold fs-7">
                                        Access financial reports
                                    </span>
                                </h3>
                            </div>
                            <div className="card-body py-3">
                                <div className="row g-3">
                                    {reportItems.map((item, index) => (
                                        <div className="col-xl-3 col-md-4 col-sm-6" key={index}>
                                            <Link
                                                to={item.link}
                                                className="btn btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary w-100 py-4 text-start"
                                            >
                                                <i className={`${item.icon} me-3`}></i>
                                                {item.title}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="row g-5 g-xl-8">
                    {/* Recent Payments */}
                    <div className="col-xl-6">
                        <div className="card card-xl-stretch mb-5 mb-xl-8">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title align-items-start flex-column">
                                    <span className="card-label fw-bold fs-3 mb-1">Recent Payments</span>
                                    <span className="text-muted mt-1 fw-semibold fs-7">
                                        Last 10 payment transactions
                                    </span>
                                </h3>
                                <div className="card-toolbar">
                                    <Link
                                        to="/human-resources/ac-finance/payment-history"
                                        className="btn btn-sm btn-light-primary"
                                    >
                                        View All
                                    </Link>
                                </div>
                            </div>
                            <div className="card-body py-3">
                                <div className="table-responsive">
                                    <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                                        <thead>
                                            <tr className="fw-bold text-muted">
                                                <th>Student</th>
                                                <th>Amount</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentPayments.length > 0 ? (
                                                recentPayments.map((payment, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div className="symbol symbol-40px me-3">
                                                                    <span className="symbol-label bg-light-primary">
                                                                        <i className="fa-solid fa-user text-primary"></i>
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-dark fw-bold d-block fs-7">
                                                                        {payment.StudentName || payment.StudentID}
                                                                    </span>
                                                                    <span className="text-muted fw-semibold d-block fs-8">
                                                                        {payment.StudentID}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="text-success fw-bold">
                                                                {currencyConverter(payment.Amount)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="text-muted fs-7">
                                                                {new Date(payment.PaymentDate).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center text-muted py-5">
                                                        No recent payments
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Outstanding */}
                    <div className="col-xl-6">
                        <div className="card card-xl-stretch mb-5 mb-xl-8">
                            <div className="card-header border-0 pt-5">
                                <h3 className="card-title align-items-start flex-column">
                                    <span className="card-label fw-bold fs-3 mb-1">Top Outstanding</span>
                                    <span className="text-muted mt-1 fw-semibold fs-7">
                                        Students with highest balances
                                    </span>
                                </h3>
                                <div className="card-toolbar">
                                    <Link
                                        to="/human-resources/ac-finance/reports/outstanding"
                                        className="btn btn-sm btn-light-danger"
                                    >
                                        View All
                                    </Link>
                                </div>
                            </div>
                            <div className="card-body py-3">
                                <div className="table-responsive">
                                    <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                                        <thead>
                                            <tr className="fw-bold text-muted">
                                                <th>Student</th>
                                                <th>Outstanding</th>
                                                <th>Level</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topOutstanding.length > 0 ? (
                                                topOutstanding.map((student, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div className="symbol symbol-40px me-3">
                                                                    <span className="symbol-label bg-light-danger">
                                                                        <i className="fa-solid fa-user text-danger"></i>
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-dark fw-bold d-block fs-7">
                                                                        {student.StudentName || student.StudentID}
                                                                    </span>
                                                                    <span className="text-muted fw-semibold d-block fs-8">
                                                                        {student.StudentID}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="text-danger fw-bold">
                                                                {currencyConverter(student.OutstandingAmount || student.Amount)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="badge badge-light-primary">
                                                                {student.Level || "N/A"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center text-muted py-5">
                                                        No outstanding balances
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(AcFinanceDashboard);
