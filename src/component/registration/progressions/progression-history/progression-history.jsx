import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import ReportTable from "../../../common/table/ReportTable";

function ProgressionHistory(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState("");
    const [historyData, setHistoryData] = useState([]);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [studentInfo, setStudentInfo] = useState(null);
    const [studentHistory, setStudentHistory] = useState([]);
    const [loadingStudent, setLoadingStudent] = useState(false);

    const columns = ["S/N", "Student ID", "Student Name", "Course", "Progression", "Carryover", "Date"];

    const getSemesters = async () => {
        const { success, data } = await api.get("staff/registration/progression/semesters-with-progression");
        if (success && data?.message === 'success') {
            setSemesters(data.data);
            if (data.data.length > 0) {
                setSelectedSemester(data.data[0].SemesterCode);
            }
        } else {
            toast.error("Error fetching semesters");
        }
        setIsLoading(false);
    };

    const getHistory = async (semesterCode) => {
        if (!semesterCode) return;

        const { success, data } = await api.get(`staff/registration/progression/progression-history/${semesterCode}`);
        if (success && data?.message === 'success') {
            setHistoryData(data.data);
        } else {
            toast.error("Error fetching progression history");
        }
    };

    const viewStudentHistory = async (studentId) => {
        setLoadingStudent(true);
        setShowStudentModal(true);

        const { success, data } = await api.get(`staff/registration/progression/student-history/${studentId}`);
        if (success && data?.message === 'success') {
            setStudentInfo(data.student);
            setStudentHistory(data.history);
        } else {
            toast.error("Error fetching student history");
        }
        setLoadingStudent(false);
    };

    const closeModal = () => {
        setShowStudentModal(false);
        setStudentInfo(null);
        setStudentHistory([]);
    };

    useEffect(() => { getSemesters(); }, []);

    useEffect(() => {
        if (selectedSemester) {
            getHistory(selectedSemester);
        }
    }, [selectedSemester]);

    // Format data for table
    const tableData = historyData.map((item, index) => [
        index + 1,
        <span
            className="badge bg-primary cursor-pointer"
            style={{ cursor: 'pointer' }}
            onClick={() => viewStudentHistory(item.StudentID)}
            title="Click to view student history"
        >
            {item.StudentID}
        </span>,
        item.StudentName,
        item.CourseName,
        <span className="d-inline-flex align-items-center">
            <span className="badge bg-secondary me-2">{item.FromLevel} - {item.FromSemester}</span>
            <i className="fa fa-arrow-right text-primary mx-2"></i>
            <span className="badge bg-success">{item.ToLevel} - {item.ToSemester}</span>
        </span>,
        item.CarryOver,
        item.InsertedOn
    ]);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={`Progression History`} items={["Registration", "Progression", "History"]} />
            <div className="flex-column-fluid">
                <div className="card shadow-sm">
                    <div className="card-header border-0 pt-5">
                        <h3 className="card-title align-items-start flex-column">
                            <span className="card-label fw-bold text-dark">Progression History</span>
                            <span className="text-gray-400 mt-1 fw-semibold fs-7">View progression records by semester</span>
                        </h3>
                        <div className="card-toolbar">
                            <select
                                className="form-select form-select-solid w-250px"
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                            >
                                {semesters.map((sem, index) => (
                                    <option key={index} value={sem.SemesterCode}>
                                        {sem.SemesterName || sem.SemesterCode} ({sem.ProgressionCount} students)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="card-body pt-0">
                        {historyData.length > 0 ? (
                            <>
                                <div className="alert alert-info mb-4">
                                    <i className="fa fa-info-circle me-2"></i>
                                    <strong>{historyData.length}</strong> students were progressed in this semester.
                                    Click on a Student ID to view their complete progression history.
                                </div>
                                <ReportTable data={tableData} columns={columns} height={"600px"} />
                            </>
                        ) : (
                            <div className="alert alert-warning text-center py-5">
                                <i className="fa fa-exclamation-triangle me-2"></i>
                                No progression records found for the selected semester
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Student History Modal */}
            {showStudentModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    <i className="fa fa-user me-2"></i>
                                    Student Progression History
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                {loadingStudent ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <p className="mt-2 text-muted">Loading student history...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Student Info Card */}
                                        {studentInfo && (
                                            <div className="card bg-light mb-4">
                                                <div className="card-body py-3">
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <h5 className="mb-1">{studentInfo.StudentName}</h5>
                                                            <span className="badge bg-primary fs-6">{studentInfo.StudentID}</span>
                                                        </div>
                                                        <div className="col-md-6 text-md-end">
                                                            <p className="mb-0 text-muted">{studentInfo.CourseName}</p>
                                                            <p className="mb-0">
                                                                <strong>Current:</strong> Level {studentInfo.StudentLevel} - {studentInfo.StudentSemester} Semester
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Progression Timeline */}
                                        <h6 className="mb-3">
                                            <i className="fa fa-history me-2 text-primary"></i>
                                            Progression Timeline ({studentHistory.length} progressions)
                                        </h6>

                                        {studentHistory.length > 0 ? (
                                            <div className="timeline-container">
                                                {studentHistory.map((item, index) => (
                                                    <div key={index} className="d-flex align-items-start mb-3">
                                                        <div className="me-3 text-center" style={{ width: '40px' }}>
                                                            <div className={`rounded-circle d-flex align-items-center justify-content-center ${index === studentHistory.length - 1 ? 'bg-success' : 'bg-primary'}`}
                                                                style={{ width: '35px', height: '35px' }}>
                                                                <span className="text-white fw-bold">{index + 1}</span>
                                                            </div>
                                                            {index < studentHistory.length - 1 && (
                                                                <div className="bg-secondary mx-auto" style={{ width: '2px', height: '30px' }}></div>
                                                            )}
                                                        </div>
                                                        <div className="card flex-grow-1 mb-0">
                                                            <div className="card-body py-2 px-3">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div className="d-flex align-items-center">
                                                                        <span className="badge bg-secondary me-2">
                                                                            Level {item.FromLevel} - {item.FromSemester}
                                                                        </span>
                                                                        <i className="fa fa-arrow-right text-success mx-2"></i>
                                                                        <span className="badge bg-success">
                                                                            Level {item.ToLevel} - {item.ToSemester}
                                                                        </span>
                                                                    </div>
                                                                    <span className="badge bg-warning">{item.CarryOver} carryover</span>
                                                                </div>
                                                                <div className="mt-1 d-flex justify-content-between">
                                                                    <small className="text-muted">
                                                                        <i className="fa fa-calendar me-1"></i>
                                                                        {item.SemesterName || item.SemesterCode}
                                                                    </small>
                                                                    <small className="text-muted">
                                                                        <i className="fa fa-clock me-1"></i>
                                                                        {item.InsertedOn}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="alert alert-warning">
                                                <i className="fa fa-exclamation-triangle me-2"></i>
                                                No progression history found for this student
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="modal-footer bg-light">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    <i className="fa fa-times me-2"></i>Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails[0] });
export default connect(mapStateToProps, null)(ProgressionHistory);
