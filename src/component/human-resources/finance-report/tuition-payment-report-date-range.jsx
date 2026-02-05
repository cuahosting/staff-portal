import React, { useEffect, useState, useMemo } from "react";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";
import { formatDate, currencyConverter } from "../../../resources/constants";

function TuitionPaymentReportDateRange(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [canSeeReport, setCanSeeReport] = useState(false);
    const [allSemester, setAllSemester] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [tableHeight, setTableHeight] = useState("600px");

    const columns = [
        "S/N",
        "Student ID",
        "Student Name",
        "Course",
        "Payment Item",
        "Amount",
        "Payment Method",
        "Date",
        "Semester",
    ];

    const semesterOptions = useMemo(() => {
        return allSemester.map((s) => ({
            value: s.SemesterCode,
            label: s.SemesterName || s.SemesterCode,
        }));
    }, [allSemester]);

    useEffect(() => {
        const getSchoolSemester = async () => {
            try {
                const { success, data } = await api.get("staff/human-resources/finance-report/student-payment/semesters");
                if (success) {
                    setAllSemester(data);
                }
            } catch (ex) {
                console.error(ex);
            }
        };
        getSchoolSemester();
    }, []);

    const handleChange = async (semesterCode) => {
        if (!semesterCode) return toast.info("Please select a semester");
        if (!startDate || !endDate) return toast.info("Please select both start and end dates");

        try {
            setIsLoading(true);
            const { success, data: result } = await api.get(
                `staff/human-resources/finance-report/tuition-payment-report-date-range?semester=${semesterCode}&startDate=${startDate}&endDate=${endDate}`
            );

            if (success) {
                if (result.data && result.data.length > 0) {
                    let rows = [];
                    result.data.forEach((item, index) => {
                        rows.push([
                            index + 1,
                            item.StudentID,
                            item.StudentName,
                            item.CourseName || item.CourseCode,
                            item.PaymentItem,
                            currencyConverter(item.Amount),
                            item.PaymentMethod,
                            formatDate(item.InsertedDate),
                            item.SemesterCode,
                        ]);
                    });
                    setTableHeight(result.data.length > 100 ? "1000px" : "600px");
                    setData(rows);
                    setTotalAmount(result.totalAmount);
                    setCanSeeReport(true);
                } else {
                    toast.info("No feeding payments found for the selected criteria");
                    setCanSeeReport(false);
                    setData([]);
                }
            }
        } catch (err) {
            toast.error("Failed to fetch feeding payment report");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Feeding Payment Report"}
                items={["Human Resources", "Finance & Records", "Tuition Payment Report"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body pt-2">
                        <div className="col-md-12">
                            <div className="row">
                                <div className="col-md-3">
                                    <label className="required fs-6 fw-bold mb-2">
                                        Select Semester
                                    </label>
                                    <SearchSelect
                                        id="semester"
                                        value={semesterOptions.find((opt) => opt.value === selectedSemester) || null}
                                        options={semesterOptions}
                                        onChange={(selected) => {
                                            setSelectedSemester(selected?.value || "");
                                        }}
                                        placeholder="Select semester"
                                        isClearable={false}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="required fs-6 fw-bold mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="required fs-6 fw-bold mb-2">End Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3 d-flex align-items-end">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleChange(selectedSemester)}
                                    >
                                        Fetch Records
                                    </button>
                                </div>
                            </div>
                        </div>

                        {canSeeReport && (
                            <div className="row mt-5">
                                <div className="col-md-12">
                                    <div className="alert alert-info mb-3">
                                        <strong>Total Tuition Payments:</strong> {currencyConverter(totalAmount)} |
                                        <strong> Total Records:</strong> {data.length}
                                    </div>
                                    <ReportTable
                                        title={`Tuition Payment Report - ${selectedSemester}`}
                                        columns={columns}
                                        data={data}
                                        height={tableHeight}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        login: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(TuitionPaymentReportDateRange);
