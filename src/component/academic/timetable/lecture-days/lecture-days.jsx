import React, { useEffect, useState } from "react";
import AGTable from "../../../common/table/AGTable";
import Modal from "../../../common/modal/modal";
import { api } from "../../../../resources/api";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import { connect } from "react-redux";

function LectureDaysSettings(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "ID", field: "EntryID" },
            { label: "Action", field: "action" },
            { label: "Day Name", field: "DayName" },
            { label: "Order", field: "DayOrder" },
            { label: "Status", field: "StatusBadge" }
        ],
        rows: []
    });
    const [formData, setFormData] = useState({
        DayName: "",
        DayOrder: "",
        Status: "Active",
        EntryID: "",
        CreatedBy: props.LoginDetails[0]?.StaffID || ""
    });

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const getLectureDays = async () => {
        const { success, data } = await api.get("staff/timetable-settings/lecture-days");
        if (success && data?.length > 0) {
            const rows = data.map((day) => ({
                EntryID: day.EntryID,
                DayName: day.DayName,
                DayOrder: day.DayOrder,
                StatusBadge: (
                    <span className={`badge ${day.Status === 'Active' ? 'badge-light-success' : 'badge-light-danger'}`}>
                        {day.Status}
                    </span>
                ),
                action: (
                    <button
                        className="btn btn-link p-0 text-primary"
                        title="Edit"
                        data-bs-toggle="modal"
                        data-bs-target="#LectureDayModal"
                        onClick={() => setFormData({
                            EntryID: day.EntryID,
                            DayName: day.DayName,
                            DayOrder: day.DayOrder,
                            Status: day.Status,
                            UpdatedBy: props.LoginDetails[0]?.StaffID
                        })}
                    >
                        <i className="fa fa-pen" style={{ fontSize: '15px', color: "blue" }} />
                    </button>
                )
            }));
            setDatatable({ ...datatable, rows });
        } else {
            setDatatable({ ...datatable, rows: [] });
        }
        setIsLoading(false);
    };

    const onEdit = (e) => {
        const value = e.target.value;
        const id = e.target.id;

        if (id === "DayName") {
            const dayIndex = daysOfWeek.indexOf(value);
            setFormData({
                ...formData,
                [id]: value,
                DayOrder: dayIndex !== -1 ? dayIndex + 1 : formData.DayOrder
            });
        } else {
            setFormData({ ...formData, [id]: value });
        }
    };

    const onSubmit = async () => {
        if (formData.DayName === "") {
            showAlert("EMPTY FIELD", "Please select a day", "error");
            return;
        }

        setIsFormLoading('on');

        if (formData.EntryID === "") {
            const { success, data } = await api.post("staff/timetable-settings/lecture-days", formData);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Lecture Day Added Successfully");
                    getLectureDays();
                    resetForm();
                    document.getElementById("closeModal").click();
                } else if (data?.message === "exists") {
                    showAlert("DAY EXISTS", "This lecture day already exists!", "error");
                } else {
                    showAlert("ERROR", data?.error || "Something went wrong", "error");
                }
            }
        } else {
            const { success, data } = await api.patch(`staff/timetable-settings/lecture-days/${formData.EntryID}`, formData);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Lecture Day Updated Successfully");
                    getLectureDays();
                    resetForm();
                    document.getElementById("closeModal").click();
                } else {
                    showAlert("ERROR", data?.error || "Something went wrong", "error");
                }
            }
        }
        setIsFormLoading('off');
    };

    const resetForm = () => {
        setFormData({
            DayName: "",
            DayOrder: "",
            Status: "Active",
            EntryID: "",
            CreatedBy: props.LoginDetails[0]?.StaffID || ""
        });
    };

    useEffect(() => {
        getLectureDays();
    }, []);

    return isLoading ? (<Loader />) : (
        <>
            <div className="card card-no-border">
                <div className="card-header border-0 pt-6">
                    <div className="card-title" />
                    <div className="card-toolbar">
                        <div className="d-flex justify-content-end">
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#LectureDayModal"
                                onClick={resetForm}
                            >
                                <i className="fa fa-plus me-2" />Add Lecture Day
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="col-md-12" style={{ overflowX: 'auto' }}>
                        <AGTable data={datatable} />
                    </div>
                </div>

                <Modal title="Manage Lecture Day" id="LectureDayModal" close="LectureDayModal">
                    <div className="fv-row mb-6">
                        <label className="form-label fs-6 fw-bolder text-dark" htmlFor="DayName">
                            Day Name
                        </label>
                        <select
                            id="DayName"
                            className="form-select form-select-lg form-select-solid"
                            value={formData.DayName}
                            onChange={onEdit}
                        >
                            <option value="">- Select Day -</option>
                            {daysOfWeek.map((day, index) => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>

                    <div className="fv-row mb-6">
                        <label className="form-label fs-6 fw-bolder text-dark" htmlFor="DayOrder">
                            Day Order (for sorting)
                        </label>
                        <input
                            type="number"
                            id="DayOrder"
                            className="form-control form-control-lg form-control-solid"
                            placeholder="1 for Monday, 2 for Tuesday, etc."
                            value={formData.DayOrder}
                            onChange={onEdit}
                            min="1"
                            max="7"
                        />
                    </div>

                    <div className="fv-row mb-6">
                        <label className="form-label fs-6 fw-bolder text-dark" htmlFor="Status">
                            Status
                        </label>
                        <select
                            id="Status"
                            className="form-select form-select-lg form-select-solid"
                            value={formData.Status}
                            onChange={onEdit}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="form-group pt-2">
                        <button
                            onClick={onSubmit}
                            className="btn btn-primary w-100"
                            data-kt-indicator={isFormLoading}
                        >
                            <span className="indicator-label">Submit</span>
                            <span className="indicator-progress">
                                Please wait...
                                <span className="spinner-border spinner-border-sm align-middle ms-2" />
                            </span>
                        </button>
                    </div>
                </Modal>
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({ LoginDetails: state.LoginDetails });
export default connect(mapStateToProps, null)(LectureDaysSettings);
