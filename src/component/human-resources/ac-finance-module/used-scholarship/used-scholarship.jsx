import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import DataTable from "../../../common/table/DataTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { connect } from "react-redux";

function UsedScholarshipReport(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Student ID", field: "StudentID" },
            { label: "Student Name", field: "StudentName" },
            { label: "Scholarship", field: "ScholarshipName" },
            { label: "Semester", field: "Semester" },
            { label: "Tuition (₦)", field: "Tuition" },
            { label: "Feeding (₦)", field: "Feeding" },
            { label: "Accom (₦)", field: "Accom" },
            { label: "Trans (₦)", field: "Trans" },
            { label: "Adm (₦)", field: "Adm" },
            { label: "Total (₦)", field: "RowTotal" },
        ],
        rows: [],
    });

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(num || 0);
    };

    const buildRows = (data) => {
        return data.map((item, index) => {
            const rowTotal = parseFloat(item.TuitionFeeAmount || 0) +
                parseFloat(item.FeedingFeeAmount || 0) +
                parseFloat(item.AccommodationFeeAmount || 0) +
                parseFloat(item.TransportFeeAmount || 0) +
                parseFloat(item.AdmissionFeeAmount || 0);

            return {
                sn: index + 1,
                StudentID: item.StudentID,
                StudentName: item.StudentName || "N/A",
                ScholarshipName: item.ScholarshipName,
                Semester: item.Semester,
                Tuition: formatCurrency(item.TuitionFeeAmount),
                Feeding: formatCurrency(item.FeedingFeeAmount),
                Accom: formatCurrency(item.AccommodationFeeAmount),
                Trans: formatCurrency(item.TransportFeeAmount),
                Adm: formatCurrency(item.AdmissionFeeAmount),
                RowTotal: (
                    <span className="fw-bolder text-primary">
                        {formatCurrency(rowTotal)}
                    </span>
                ),
            };
        });
    };

    const getData = async () => {
        setIsLoading(true);
        const [listRes, statsRes] = await Promise.all([
            api.get("staff/ac-finance/scholarship/used/list"),
            api.get("staff/ac-finance/scholarship/used/stats")
        ]);

        if (listRes.success) {
            setDatatable((prev) => ({ ...prev, rows: buildRows(listRes.data) }));
        }

        if (statsRes.success) {
            setStats(statsRes.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        getData();
    }, []);

    const StatCard = ({ title, value, icon, color }) => (
        <div className="col-xl-3 col-md-6 mb-5">
            <div className={`card bg-light-${color} card-xl-stretch shadow-sm`}>
                <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center mb-2">
                        <div className={`symbol symbol-45px symbol-circle bg-white shadow-sm me-3`}>
                            <span className="symbol-label">
                                <i className={`fa ${icon} text-${color} fs-3`}></i>
                            </span>
                        </div>
                        <span className="fw-bolder text-gray-800 fs-6">{title}</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-auto">
                        <span className={`text-${color} fw-boldest fs-2x`}>{value}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Used Scholarship Report"} items={["Finance", "Scholarships", "Reports"]} />

            <div className="flex-column-fluid">
                {/* Stats Section */}
                <div className="row g-5 g-xl-8 mb-4">
                    <StatCard title="Total Students" value={stats?.TotalStudents || 0} icon="fa-users" color="primary" />
                    <StatCard title="Total Claims" value={stats?.TotalApplications || 0} icon="fa-file-invoice-dollar" color="success" />
                    <StatCard title="Grand Total Spend" value={formatCurrency(stats?.GrandTotal)} icon="fa-money-bill-wave" color="info" />
                    <StatCard title="Tuition Coverage" value={formatCurrency(stats?.TotalTuition)} icon="fa-graduation-cap" color="warning" />
                </div>

                {/* Sub Stats Row */}
                <div className="row g-5 mb-8">
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 bg-white p-4 text-center">
                            <span className="text-muted fw-bold fs-7 d-block mb-1">Feeding</span>
                            <span className="text-dark fw-bolder fs-5">{formatCurrency(stats?.TotalFeeding)}</span>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 bg-white p-4 text-center">
                            <span className="text-muted fw-bold fs-7 d-block mb-1">Accommodation</span>
                            <span className="text-dark fw-bolder fs-5">{formatCurrency(stats?.TotalAccommodation)}</span>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 bg-white p-4 text-center">
                            <span className="text-muted fw-bold fs-7 d-block mb-1">Transportation</span>
                            <span className="text-dark fw-bolder fs-5">{formatCurrency(stats?.TotalTransport)}</span>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 bg-white p-4 text-center">
                            <span className="text-muted fw-bold fs-7 d-block mb-1">Admission</span>
                            <span className="text-dark fw-bolder fs-5">{formatCurrency(stats?.TotalAdmission)}</span>
                        </div>
                    </div>
                </div>

                <div className="card card-flush shadow-sm">
                    <div className="card-header align-items-center py-5 gap-2 gap-md-5">
                        <div className="card-title">
                            <h3 className="card-label fw-bolder text-gray-800">Individual Scholarship Utilization</h3>
                        </div>
                    </div>
                    <div className="card-body p-5">
                        <DataTable data={datatable} />

                        {/* Summary Footer */}
                        <div className="d-flex justify-content-end align-items-center mt-5 p-5 bg-light rounded shadow-xs">
                            <div className="text-end">
                                <span className="text-muted fw-bold fs-6 me-4">Report Summary:</span>
                                <span className="text-dark fw-boldest fs-3">Total Disbursement: {formatCurrency(stats?.GrandTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails });
export default connect(mapStateToProps, null)(UsedScholarshipReport);
