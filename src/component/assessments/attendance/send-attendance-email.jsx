import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import SearchSelect from "../../common/select/SearchSelect";

function SendAttendanceEmail(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [report, setReport] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(new Set());
    const [sendResults, setSendResults] = useState([]);

    const loadSemesters = async () => {
        const { success, data } = await api.get("staff/assessment/attendance/semesters");
        if (success) setSemesters(data.map(s => ({ value: s.SemesterCode, label: s.SemesterName })));
        setIsLoading(false);
    };

    const fetchReport = async (semesterCode) => {
        setIsReportLoading(true);
        setSelectedStaff(new Set());
        setSendResults([]);
        const { success, data } = await api.get(`staff/assessment/attendance/report/lecturer-attendance/${semesterCode}`);
        if (success && data.report) {
            setReport(data.report);
        } else {
            toast.error("Failed to load lecturers");
            setReport([]);
        }
        setIsReportLoading(false);
    };

    useEffect(() => { loadSemesters(); }, []);

    useEffect(() => {
        if (selectedSemester) fetchReport(selectedSemester.value);
        else { setReport([]); setSelectedStaff(new Set()); setSendResults([]); }
    }, [selectedSemester]);

    // Get unique lecturers
    const lecturers = [];
    const seen = new Set();
    report.forEach(r => {
        if (!seen.has(r.StaffID)) {
            seen.add(r.StaffID);
            lecturers.push({ StaffID: r.StaffID, StaffName: r.StaffName, modules: report.filter(x => x.StaffID === r.StaffID) });
        }
    });

    const toggleStaff = (staffId) => {
        setSelectedStaff(prev => {
            const next = new Set(prev);
            if (next.has(staffId)) next.delete(staffId);
            else next.add(staffId);
            return next;
        });
    };

    const toggleAll = () => {
        if (selectedStaff.size === lecturers.length) {
            setSelectedStaff(new Set());
        } else {
            setSelectedStaff(new Set(lecturers.map(l => l.StaffID)));
        }
    };

    const sendEmails = async () => {
        if (selectedStaff.size === 0) {
            toast.warning("Please select at least one lecturer");
            return;
        }
        setIsSending(true);
        setSendResults([]);
        const { success, data } = await api.post("staff/assessment/attendance/email/send-lecturer-attendance", {
            semesterCode: selectedSemester.value,
            staffIds: Array.from(selectedStaff)
        });
        if (success && data.results) {
            setSendResults(data.results);
            const sent = data.results.filter(r => r.status === 'sent').length;
            const failed = data.results.filter(r => r.status === 'failed').length;
            const skipped = data.results.filter(r => r.status === 'skipped').length;
            toast.success(`Emails sent: ${sent}, Failed: ${failed}, Skipped: ${skipped}`);
        } else {
            toast.error("Failed to send emails");
        }
        setIsSending(false);
    };

    if (isLoading) return <Loader />;

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Send Attendance Email"
                items={["Assessments", "Attendance", "Send Email"]}
            />
            <div className="flex-column-fluid">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row align-items-end">
                            <div className="col-md-6 mb-3">
                                <label className="fw-bold mb-2">Select Semester</label>
                                <SearchSelect value={selectedSemester} onChange={setSelectedSemester} options={semesters} placeholder="Select semester..." isClearable />
                            </div>
                            <div className="col-md-6 mb-3">
                                {lecturers.length > 0 && (
                                    <button className="btn btn-success" onClick={sendEmails} disabled={isSending || selectedStaff.size === 0}>
                                        {isSending ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</>
                                        ) : (
                                            <><i className="fa fa-envelope me-2"></i>Send Email to {selectedStaff.size} Lecturer(s)</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isReportLoading ? <Loader /> : lecturers.length > 0 && (
                    <>
                        {sendResults.length > 0 && (
                            <div className="card mb-4">
                                <div className="card-header"><h6 className="card-title mb-0">Send Results</h6></div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-sm mb-0" style={{ fontSize: 13 }}>
                                            <thead className="table-light">
                                                <tr><th>Staff ID</th><th>Email</th><th>Status</th><th>Details</th></tr>
                                            </thead>
                                            <tbody>
                                                {sendResults.map((r, i) => (
                                                    <tr key={i}>
                                                        <td>{r.staffId}</td>
                                                        <td>{r.email || '-'}</td>
                                                        <td>
                                                            <span className={`badge ${r.status === 'sent' ? 'bg-success' : r.status === 'skipped' ? 'bg-warning' : 'bg-danger'}`}>
                                                                {r.status}
                                                            </span>
                                                        </td>
                                                        <td>{r.reason || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h6 className="card-title mb-0">Select Lecturers ({selectedStaff.size} of {lecturers.length} selected)</h6>
                                <button className="btn btn-sm btn-outline-primary" onClick={toggleAll}>
                                    {selectedStaff.size === lecturers.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: 50 }}>
                                                    <input type="checkbox" className="form-check-input" checked={selectedStaff.size === lecturers.length && lecturers.length > 0} onChange={toggleAll} />
                                                </th>
                                                <th>Staff ID</th>
                                                <th>Lecturer Name</th>
                                                <th className="text-center">Modules</th>
                                                <th className="text-center">Total Classes</th>
                                                <th className="text-center">Avg Attendance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lecturers.map((lec, i) => {
                                                const totalClasses = lec.modules.reduce((s, m) => s + (m.ClassesHeld || 0), 0);
                                                const avgAtt = lec.modules.length > 0 ? Math.round(lec.modules.reduce((s, m) => s + m.AvgAttendance, 0) / lec.modules.length) : 0;
                                                return (
                                                    <tr key={i} onClick={() => toggleStaff(lec.StaffID)} style={{ cursor: 'pointer' }}>
                                                        <td>
                                                            <input type="checkbox" className="form-check-input" checked={selectedStaff.has(lec.StaffID)} onChange={() => toggleStaff(lec.StaffID)} />
                                                        </td>
                                                        <td className="fw-bold">{lec.StaffID}</td>
                                                        <td>{lec.StaffName}</td>
                                                        <td className="text-center">{lec.modules.length}</td>
                                                        <td className="text-center">{totalClasses}</td>
                                                        <td className="text-center">
                                                            <span className={`badge ${avgAtt >= 75 ? 'bg-success' : avgAtt >= 50 ? 'bg-warning' : 'bg-danger'}`}>{avgAtt}%</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {!selectedSemester && !isReportLoading && (
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <i className="fa fa-envelope fa-3x text-muted mb-3 d-block"></i>
                            <h5 className="text-muted">Select a semester to load lecturers and send attendance emails</h5>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(SendAttendanceEmail);
