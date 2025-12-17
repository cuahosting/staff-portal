import React, { useEffect, useState, useMemo, useRef } from "react";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import SearchSelect from "../../common/select/SearchSelect";
import "./exam-attendance-sheet.css";

function ExamAttendanceSheet(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [canSeeReport, setCanSeeReport] = useState(false);
    const [allSemester, setAllSemester] = useState([]);
    const [venues, setVenues] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedVenue, setSelectedVenue] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [showSignColumns, setShowSignColumns] = useState(true);
    const [reportData, setReportData] = useState(null);
    const printRef = useRef();

    const semesterOptions = useMemo(() => {
        return allSemester.map((s) => ({
            value: s.SemesterCode,
            label: s.SemesterCode,
        }));
    }, [allSemester]);

    const venueOptions = useMemo(() => {
        return venues.map((v) => ({
            value: v.VenueName,
            label: `${v.VenueName} (Capacity: ${v.Capacity})`,
        }));
    }, [venues]);

    const moduleOptions = useMemo(() => {
        return modules.map((m) => ({
            value: m.ModuleCode,
            label: `${m.ModuleCode} - ${m.ModuleName}`,
        }));
    }, [modules]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [semesterRes, venueRes] = await Promise.all([
                    api.get("staff/human-resources/finance-report/student-payment/semesters"),
                    api.get("staff/assessments/exam-reports/exam-attendance/venues"),
                ]);

                if (semesterRes.success) setAllSemester(semesterRes.data);
                if (venueRes.success) setVenues(venueRes.data);
            } catch (ex) {
                console.error(ex);
            }
        };
        fetchData();
    }, []);

    const handleSemesterChange = async (semesterCode) => {
        setSelectedSemester(semesterCode);
        setSelectedModule("");
        setCanSeeReport(false);

        if (semesterCode) {
            try {
                const { success, data } = await api.get(
                    `staff/assessments/exam-reports/exam-attendance/modules/${semesterCode}`
                );
                if (success) setModules(data);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleGenerateReport = async () => {
        if (!selectedSemester || !selectedVenue || !selectedModule) {
            toast.warning("Please select semester, venue, and module");
            return;
        }

        try {
            setIsLoading(true);
            const { success, data } = await api.get(
                `staff/assessments/exam-reports/exam-attendance/sheet?semester=${selectedSemester}&venue=${selectedVenue}&moduleCode=${selectedModule}`
            );

            if (success) {
                if (data.students && data.students.length > 0) {
                    setReportData(data);
                    setCanSeeReport(true);
                } else {
                    toast.info("No students found for the selected criteria");
                    setCanSeeReport(false);
                }
            }
        } catch (err) {
            toast.error("Failed to generate attendance sheet");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Exam Attendance Sheet"}
                items={["Assessment", "Exam Attendance Sheet"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body pt-2">
                        {/* Filters */}
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <label className="required fs-6 fw-bold mb-2">Semester</label>
                                <SearchSelect
                                    id="semester"
                                    value={semesterOptions.find((opt) => opt.value === selectedSemester) || null}
                                    options={semesterOptions}
                                    onChange={(selected) => handleSemesterChange(selected?.value)}
                                    placeholder="Select semester"
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="required fs-6 fw-bold mb-2">Venue</label>
                                <SearchSelect
                                    id="venue"
                                    value={venueOptions.find((opt) => opt.value === selectedVenue) || null}
                                    options={venueOptions}
                                    onChange={(selected) => setSelectedVenue(selected?.value || "")}
                                    placeholder="Select venue"
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="required fs-6 fw-bold mb-2">Module</label>
                                <SearchSelect
                                    id="module"
                                    value={moduleOptions.find((opt) => opt.value === selectedModule) || null}
                                    options={moduleOptions}
                                    onChange={(selected) => setSelectedModule(selected?.value || "")}
                                    placeholder="Select module"
                                    isDisabled={!selectedSemester}
                                />
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <button className="btn btn-primary w-100" onClick={handleGenerateReport}>
                                    <i className="fa fa-search me-2"></i>Generate
                                </button>
                            </div>
                        </div>

                        {/* Options */}
                        {canSeeReport && (
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="showSignColumns"
                                            checked={showSignColumns}
                                            onChange={(e) => setShowSignColumns(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="showSignColumns">
                                            Include Sign In / Sign Out columns
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-6 text-end">
                                    <button className="btn btn-success" onClick={handlePrint}>
                                        <i className="fa fa-print me-2"></i>Print Attendance Sheet
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Report */}
                        {canSeeReport && reportData && (
                            <div ref={printRef} className="attendance-sheet-container">
                                <div className="attendance-header text-center mb-4">
                                    <h3>
                                        {reportData.moduleInfo?.ModuleCode} - {reportData.moduleInfo?.ModuleName}
                                    </h3>
                                    <h4>({reportData.semester} Examinations)</h4>
                                    <h5>Attendance Sheet</h5>
                                    <p>
                                        <strong>Venue:</strong> {reportData.hallInfo?.VenueName} |{" "}
                                        <strong>Date:</strong> {reportData.hallInfo?.ExamDate || "TBD"} |{" "}
                                        <strong>Time:</strong> {reportData.hallInfo?.StartTime ? `${reportData.hallInfo.StartTime} - ${reportData.hallInfo.EndTime}` : "TBD"}
                                    </p>
                                </div>

                                <table className="table table-bordered attendance-table">
                                    <thead>
                                        <tr>
                                            <th>S/N</th>
                                            <th>Student ID</th>
                                            <th>Student Name</th>
                                            <th>Module Code</th>
                                            <th>Module Description</th>
                                            <th>Seat No</th>
                                            {showSignColumns && (
                                                <>
                                                    <th style={{ width: "100px" }}>Sign In</th>
                                                    <th style={{ width: "100px" }}>Sign Out</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.students.map((student, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{student.StudentID}</td>
                                                <td>{student.FullName}</td>
                                                <td>{student.ModuleCode}</td>
                                                <td>{student.ModuleName}</td>
                                                <td>{student.SeatNo || "-"}</td>
                                                {showSignColumns && (
                                                    <>
                                                        <td></td>
                                                        <td></td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="attendance-footer mt-4">
                                    <p><strong>Total Students:</strong> {reportData.totalStudents}</p>
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

export default connect(mapStateToProps, null)(ExamAttendanceSheet);
