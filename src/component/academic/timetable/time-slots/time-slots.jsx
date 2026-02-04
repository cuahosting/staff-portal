import React, { useEffect, useState, useMemo } from "react";
import AGTable from "../../../common/table/AGTable";
import Modal from "../../../common/modal/modal";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import { connect } from "react-redux";

function TimeSlotsSettings(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "ID", field: "EntryID" },
            { label: "Action", field: "action" },
            { label: "Slot Name", field: "SlotName" },
            { label: "Start Time", field: "StartTimeDisplay" },
            { label: "End Time", field: "EndTimeDisplay" },
            { label: "Status", field: "StatusBadge" }
        ],
        rows: []
    });
    const [formData, setFormData] = useState({
        StartTime: "",
        EndTime: "",
        SlotName: "",
        Status: "Active",
        EntryID: "",
        CreatedBy: props.LoginDetails[0]?.StaffID || ""
    });

    const formatHour = (hour) => {
        if (hour === 0) return "12:00 AM";
        if (hour === 12) return "12:00 PM";
        if (hour < 12) return `${hour}:00 AM`;
        return `${hour - 12}:00 PM`;
    };

    const getTimeSlots = async () => {
        const { success, data } = await api.get("staff/timetable-settings/time-slots");
        if (success && data?.length > 0) {
            const rows = data.map((slot) => ({
                EntryID: slot.EntryID,
                SlotName: slot.SlotName,
                StartTimeDisplay: formatHour(slot.StartTime),
                EndTimeDisplay: formatHour(slot.EndTime),
                StatusBadge: (
                    <span className={`badge ${slot.Status === 'Active' ? 'badge-light-success' : 'badge-light-danger'}`}>
                        {slot.Status}
                    </span>
                ),
                action: (
                    <button
                        className="btn btn-link p-0 text-primary"
                        title="Edit"
                        data-bs-toggle="modal"
                        data-bs-target="#TimeSlotModal"
                        onClick={() => setFormData({
                            EntryID: slot.EntryID,
                            StartTime: slot.StartTime,
                            EndTime: slot.EndTime,
                            SlotName: slot.SlotName,
                            Status: slot.Status,
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
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const onSubmit = async () => {
        if (formData.StartTime === "" || formData.EndTime === "") {
            toast.error("Please enter start and end times");
            return;
        }
        if (parseInt(formData.StartTime) >= parseInt(formData.EndTime)) {
            toast.error("Start time must be before end time");
            return;
        }

        setIsFormLoading('on');

        const slotName = formData.SlotName || `${formatHour(parseInt(formData.StartTime))} - ${formatHour(parseInt(formData.EndTime))}`;
        const payload = { ...formData, SlotName: slotName };

        if (formData.EntryID === "") {
            const { success, data } = await api.post("staff/timetable-settings/time-slots", payload);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Time Slot Added Successfully");
                    getTimeSlots();
                    resetForm();
                    document.getElementById("closeModal").click();
                } else if (data?.message === "exists") {
                    toast.error("This time slot already exists!");
                } else {
                    toast.error(data?.error || "Something went wrong");
                }
            }
        } else {
            const { success, data } = await api.patch(`staff/timetable-settings/time-slots/${formData.EntryID}`, payload);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Time Slot Updated Successfully");
                    getTimeSlots();
                    resetForm();
                    document.getElementById("closeModal").click();
                } else {
                    toast.error(data?.error || "Something went wrong");
                }
            }
        }
        setIsFormLoading('off');
    };

    const resetForm = () => {
        setFormData({
            StartTime: "",
            EndTime: "",
            SlotName: "",
            Status: "Active",
            EntryID: "",
            CreatedBy: props.LoginDetails[0]?.StaffID || ""
        });
    };

    useEffect(() => {
        getTimeSlots();
    }, []);

    const hourOptions = useMemo(() => {
        const options = [];
        for (let i = 6; i <= 22; i++) {
            options.push({ value: i, label: formatHour(i) });
        }
        return options;
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
                                data-bs-target="#TimeSlotModal"
                                onClick={resetForm}
                            >
                                <i className="fa fa-plus me-2" />Add Time Slot
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="col-md-12" style={{ overflowX: 'auto' }}>
                        <AGTable data={datatable} />
                    </div>
                </div>

                <Modal title="Manage Time Slot" id="TimeSlotModal" close="TimeSlotModal">
                    <div className="fv-row mb-6">
                        <label className="form-label fs-6 fw-bolder text-dark" htmlFor="StartTime">
                            Start Time
                        </label>
                        <select
                            id="StartTime"
                            className="form-select form-select-lg form-select-solid"
                            value={formData.StartTime}
                            onChange={onEdit}
                        >
                            <option value="">- Select Start Time -</option>
                            {hourOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="fv-row mb-6">
                        <label className="form-label fs-6 fw-bolder text-dark" htmlFor="EndTime">
                            End Time
                        </label>
                        <select
                            id="EndTime"
                            className="form-select form-select-lg form-select-solid"
                            value={formData.EndTime}
                            onChange={onEdit}
                        >
                            <option value="">- Select End Time -</option>
                            {hourOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="fv-row mb-6">
                        <label className="form-label fs-6 fw-bolder text-dark" htmlFor="SlotName">
                            Slot Name (Optional)
                        </label>
                        <input
                            type="text"
                            id="SlotName"
                            className="form-control form-control-lg form-control-solid"
                            placeholder="Auto-generated if empty"
                            value={formData.SlotName}
                            onChange={onEdit}
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
export default connect(mapStateToProps, null)(TimeSlotsSettings);
