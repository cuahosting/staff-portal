import React from "react";
import { currencyConverter } from "../../../../resources/constants";

export default function SemesterBulkConfirmation({ bulkStudents, selectedStudents, onToggle, onSelectAll, onDeselectAll }) {
    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="fw-bold mb-1">Bulk Payment Confirmation</h5>
                    <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                        Students below have prepaid semesters via bulk/full-programme payments. Select students to confirm for the new semester.
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={onSelectAll}>Select All</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onDeselectAll}>Deselect All</button>
                    <span className="badge bg-success align-self-center">{selectedStudents.length} / {bulkStudents.length} Selected</span>
                </div>
            </div>

            {bulkStudents.length === 0 ? (
                <div className="alert alert-info">
                    <i className="fa fa-info-circle me-2"></i>
                    No students with active bulk prepaid semesters found. You can skip this step.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle" style={{ fontSize: 13 }}>
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: 50 }}>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={selectedStudents.length === bulkStudents.length}
                                        onChange={() => selectedStudents.length === bulkStudents.length ? onDeselectAll() : onSelectAll()}
                                    />
                                </th>
                                <th>Student ID</th>
                                <th>Student Name</th>
                                <th>Programme</th>
                                <th>Level</th>
                                <th>Prepaid Categories</th>
                                <th>Semesters Remaining</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bulkStudents.map((student, index) => {
                                const isSelected = selectedStudents.includes(student.StudentID);
                                return (
                                    <tr key={index} className={isSelected ? 'table-success' : ''} style={{ cursor: 'pointer' }} onClick={() => onToggle(student.StudentID)}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={isSelected}
                                                onChange={() => onToggle(student.StudentID)}
                                            />
                                        </td>
                                        <td className="fw-bold">{student.StudentID}</td>
                                        <td>{student.StudentName}</td>
                                        <td>{student.CourseCode}</td>
                                        <td>{student.StudentLevel}</td>
                                        <td>
                                            {student.categories.map((cat, i) => (
                                                <span key={i} className="badge bg-info me-1 mb-1">
                                                    {cat.FeeCategory}
                                                </span>
                                            ))}
                                        </td>
                                        <td>
                                            {student.categories.map((cat, i) => (
                                                <div key={i} style={{ fontSize: 12 }}>
                                                    {cat.FeeCategory}: <strong>{cat.SemestersRemaining}</strong> remaining
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
