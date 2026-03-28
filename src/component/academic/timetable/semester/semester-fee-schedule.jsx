import React from "react";
import { currencyConverter } from "../../../../resources/constants";

export default function SemesterFeeSchedule({ feeSchedules, onFeeChange, semesterCode }) {
    const feeFields = [
        { key: "NewTuition", label: "New Tuition" },
        { key: "ReturningTuition", label: "Returning Tuition" },
        { key: "Accommodation", label: "Accommodation" },
        { key: "Feeding", label: "Feeding" },
        { key: "Laundry", label: "Laundry" },
    ];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="fw-bold mb-1">Schedule of Fees for {semesterCode}</h5>
                    <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                        Fees are pre-populated from the previous semester. Adjust as needed.
                    </p>
                </div>
                <span className="badge bg-primary">{feeSchedules.length} Programme(s)</span>
            </div>

            {feeSchedules.length === 0 ? (
                <div className="alert alert-warning">No programmes found. Please add courses first.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle" style={{ fontSize: 13 }}>
                        <thead className="table-light">
                            <tr>
                                <th style={{ minWidth: 200 }}>Programme</th>
                                {feeFields.map(f => (
                                    <th key={f.key} style={{ minWidth: 130 }}>{f.label}</th>
                                ))}
                                <th style={{ minWidth: 130 }}>Total (New)</th>
                                <th style={{ minWidth: 130 }}>Total (Returning)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feeSchedules.map((schedule, index) => {
                                const totalNew = (parseFloat(schedule.NewTuition) || 0) + (parseFloat(schedule.Accommodation) || 0) + (parseFloat(schedule.Feeding) || 0) + (parseFloat(schedule.Laundry) || 0);
                                const totalReturning = (parseFloat(schedule.ReturningTuition) || 0) + (parseFloat(schedule.Accommodation) || 0) + (parseFloat(schedule.Feeding) || 0) + (parseFloat(schedule.Laundry) || 0);
                                return (
                                    <tr key={index}>
                                        <td>
                                            <strong>{schedule.CourseCode}</strong>
                                            <br /><small className="text-muted">{schedule.CourseName}</small>
                                        </td>
                                        {feeFields.map(f => (
                                            <td key={f.key}>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={schedule[f.key] || ""}
                                                    onChange={(e) => onFeeChange(schedule.CourseCode, f.key, e.target.value)}
                                                    min="0"
                                                    step="100"
                                                />
                                            </td>
                                        ))}
                                        <td className="fw-bold text-success">{currencyConverter(totalNew)}</td>
                                        <td className="fw-bold text-primary">{currencyConverter(totalReturning)}</td>
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
