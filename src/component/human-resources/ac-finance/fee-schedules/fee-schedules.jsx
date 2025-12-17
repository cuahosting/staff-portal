import React, { useEffect, useState, useMemo } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { currencyConverter } from "../../../../resources/constants";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";

function FeeSchedules(props) {
    const token = props.loginData[0]?.token;
    const staffID = props.loginData[0]?.StaffID;

    const [isLoading, setIsLoading] = useState(true);
    const [scheduleList, setScheduleList] = useState([]);
    const [feeItemList, setFeeItemList] = useState([]);
    const [courseList, setCourseList] = useState([]);

    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [scheduleItems, setScheduleItems] = useState([]);

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Action", field: "action" },
            { label: "Course", field: "Course" },
            { label: "Level", field: "Level" },
            { label: "Semester", field: "Semester" },
            { label: "Type", field: "ScheduleType" },
            { label: "Total Amount", field: "TotalAmount" },
            { label: "Items", field: "ItemCount" },
            { label: "Status", field: "Status" },
        ],
        rows: [],
    });

    const [formData, setFormData] = useState({
        CourseID: "",
        Level: "",
        Semester: "",
        ScheduleType: "0",
        InsertedBy: staffID,
        EntryID: "",
    });

    const [linkItemForm, setLinkItemForm] = useState({
        ScheduleFeeID: "",
        FeeItemID: "",
        CustomAmount: "",
    });

    const levelOptions = ["100", "200", "300", "400", "500", "600"];
    const scheduleTypeOptions = [
        { value: "0", label: "New Student" },
        { value: "1", label: "Returning Student" },
    ];
    const semesterOptions = [
        { value: "First Semester", label: "First Semester" },
        { value: "Second Semester", label: "Second Semester" },
    ];

    const levelSelectOptions = levelOptions.map(level => ({
        value: level,
        label: `${level} Level`
    }));

    const feeItemOptions = useMemo(() => {
        return feeItemList.map(item => ({
            value: item.FeeItemID,
            label: `${item.Name} (${currencyConverter(item.Amount)})`,
            amount: item.Amount
        }));
    }, [feeItemList]);

    // Reset Forms
    const resetForm = () => {
        setFormData({
            CourseID: "",
            Level: "",
            Semester: "",
            ScheduleType: "0",
            InsertedBy: staffID,
            EntryID: "",
        });
    };

    const resetLinkForm = () => {
        setLinkItemForm({
            ScheduleFeeID: selectedSchedule?.ScheduleFeeID || "",
            FeeItemID: "",
            CustomAmount: "",
        });
    };

    // Fetch Data
    const getSchedules = async () => {
        const result = await api.get("staff/ac-finance/fee-schedules/list", token);

        if (result.success && result.data?.data) {
            const data = result.data.data;
            setScheduleList(data);
            buildScheduleTable(data);
        }
    };

    const buildScheduleTable = (data) => {
        let rows = [];
        data.forEach((item, index) => {
            rows.push({
                sn: index + 1,
                Course: (
                    <div>
                        <span className="fw-bold">{item.CourseName || item.CourseID}</span>
                        <br />
                        <small className="text-muted">{item.CourseID}</small>
                    </div>
                ),
                Level: <span className="badge badge-light-primary">{item.Level}</span>,
                Semester: item.SemesterName || item.Semester,
                ScheduleType: item.ScheduleType === 0 || item.ScheduleType === "0" ? (
                    <span className="badge badge-light-info">New Student</span>
                ) : (
                    <span className="badge badge-light-warning">Returning</span>
                ),
                TotalAmount: (
                    <span className="fw-bold text-primary">
                        {currencyConverter(item.TotalAmount || 0)}
                    </span>
                ),
                ItemCount: (
                    <span className="badge badge-light-dark">{item.ItemCount || 0} items</span>
                ),
                Status: item.IsActive === 1 ? (
                    <span className="badge badge-light-success">Active</span>
                ) : (
                    <span className="badge badge-light-danger">Inactive</span>
                ),
                action: (
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-icon btn-light-info"
                            data-bs-toggle="modal"
                            data-bs-target="#kt_modal_view_schedule"
                            onClick={() => onViewSchedule(item)}
                            title="View Details"
                        >
                            <i className="fa fa-eye"></i>
                        </button>
                        <button
                            className="btn btn-sm btn-icon btn-light-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#kt_modal_schedule"
                            onClick={() => onEditSchedule(item)}
                            title="Edit"
                        >
                            <i className="fa fa-edit"></i>
                        </button>
                        <button
                            className="btn btn-sm btn-icon btn-light-success"
                            onClick={() => onCopySchedule(item)}
                            title="Copy Schedule"
                        >
                            <i className="fa fa-copy"></i>
                        </button>
                    </div>
                ),
            });
        });

        setDatatable({ ...datatable, rows });
    };

    const getFeeItems = async () => {
        const result = await api.get("staff/ac-finance/fee-items/active", token);

        if (result.success && result.data?.data) {
            setFeeItemList(result.data.data);
        }
    };

    const getCourses = async () => {
        const result = await api.get("staff/academics/course/list", token, null, {}, false);

        if (result.success && result.data) {
            const data = Array.isArray(result.data) ? result.data : result.data.data || [];
            const options = data.map((course) => ({
                value: course.CourseCode,
                label: `${course.CourseCode} - ${course.CourseName}`,
            }));
            setCourseList(options);
        }
    };

    const getScheduleItems = async (scheduleId) => {
        const result = await api.get(`staff/ac-finance/fee-schedules/${scheduleId}`, token);

        if (result.success && result.data?.data) {
            setScheduleItems(result.data.data.items || []);
        }
    };

    // Schedule Actions
    const onViewSchedule = async (item) => {
        setSelectedSchedule(item);
        await getScheduleItems(item.ScheduleFeeID);
    };

    const onEditSchedule = (item) => {
        setFormData({
            CourseID: item.CourseID,
            Level: item.Level,
            Semester: item.Semester,
            ScheduleType: String(item.ScheduleType),
            InsertedBy: staffID,
            EntryID: item.ScheduleFeeID,
        });
    };

    const onCopySchedule = async (item) => {
        const confirmed = await showAlert(
            "COPY SCHEDULE",
            "This will create a copy of this fee schedule. Continue?",
            "info"
        );

        if (confirmed) {
            // Open modal to select target course/level/semester
            setFormData({
                CourseID: item.CourseID,
                Level: item.Level,
                Semester: "",
                ScheduleType: String(item.ScheduleType),
                InsertedBy: staffID,
                EntryID: "",
                CopyFromID: item.ScheduleFeeID,
            });
            document.querySelector('[data-bs-target="#kt_modal_copy"]')?.click();
        }
    };

    const onEdit = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmit = async () => {
        if (!formData.CourseID) {
            showAlert("ERROR", "Please select a course", "error");
            return;
        }
        if (!formData.Level) {
            showAlert("ERROR", "Please select a level", "error");
            return;
        }
        if (!formData.Semester) {
            showAlert("ERROR", "Please select a semester", "error");
            return;
        }

        if (formData.EntryID === "") {
            const result = await api.post("staff/ac-finance/fee-schedules/add", formData, token);

            if (result.success && result.message === "success") {
                toast.success("Fee schedule created successfully");
                document.getElementById("closeScheduleModal").click();
                resetForm();
                getSchedules();
            } else if (result.message === "exist") {
                showAlert("DUPLICATE", "A fee schedule already exists for this combination", "error");
            }
        } else {
            const result = await api.patch(
                `staff/ac-finance/fee-schedules/update/${formData.EntryID}`,
                { ...formData, UpdatedBy: staffID },
                token
            );

            if (result.success && result.message === "success") {
                toast.success("Fee schedule updated successfully");
                document.getElementById("closeScheduleModal").click();
                resetForm();
                getSchedules();
            }
        }
    };

    // Link/Unlink Items
    const onLinkItem = async () => {
        if (!linkItemForm.FeeItemID) {
            showAlert("ERROR", "Please select a fee item", "error");
            return;
        }

        const payload = {
            ScheduleFeeID: selectedSchedule.ScheduleFeeID,
            FeeItemID: linkItemForm.FeeItemID,
            CustomAmount: linkItemForm.CustomAmount ? parseFloat(linkItemForm.CustomAmount) : null,
            InsertedBy: staffID,
        };

        const result = await api.post("staff/ac-finance/fee-schedules/link-item", payload, token);

        if (result.success && result.message === "success") {
            toast.success("Fee item linked successfully");
            resetLinkForm();
            getScheduleItems(selectedSchedule.ScheduleFeeID);
            getSchedules();
        } else if (result.message === "exist") {
            showAlert("DUPLICATE", "This fee item is already linked to this schedule", "error");
        }
    };

    const onUnlinkItem = async (item) => {
        const confirmed = await showAlert(
            "UNLINK ITEM",
            `Remove "${item.FeeItemName}" from this schedule?`,
            "warning"
        );

        if (confirmed) {
            const result = await api.delete(
                `staff/ac-finance/fee-schedules/unlink-item/${selectedSchedule.ScheduleFeeID}/${item.FeeItemID}`,
                token
            );

            if (result.success && result.message === "success") {
                toast.success("Fee item removed from schedule");
                getScheduleItems(selectedSchedule.ScheduleFeeID);
                getSchedules();
            }
        }
    };

    const onUpdateItemAmount = async (item, newAmount) => {
        const result = await api.patch(
            `staff/ac-finance/fee-schedules/update-link/${item.LinkID}`,
            { CustomAmount: parseFloat(newAmount), UpdatedBy: staffID },
            token
        );

        if (result.success && result.message === "success") {
            toast.success("Amount updated");
            getScheduleItems(selectedSchedule.ScheduleFeeID);
            getSchedules();
        }
    };

    const calculateScheduleTotal = () => {
        return scheduleItems.reduce((total, item) => {
            return total + (item.CustomAmount || item.DefaultAmount || 0);
        }, 0);
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getSchedules(), getFeeItems(), getCourses()]);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Fee Schedules"
                items={["Human Resources", "AC-Finance", "Fee Schedules"]}
                buttons={
                    <button
                        type="button"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_modal_schedule"
                        onClick={resetForm}
                    >
                        <i className="fa fa-plus me-2"></i>
                        Add Schedule
                    </button>
                }
            />

            <div className="flex-column-fluid">
                <div className="row">
                    {/* Schedule List */}
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header border-0 pt-6">
                                <div className="card-title">
                                    <h3 className="card-label">Fee Schedules</h3>
                                </div>
                            </div>
                            <div className="card-body pt-0">
                                <AGTable data={datatable} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Schedule Modal */}
                <div className="modal fade" id="kt_modal_schedule" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {formData.EntryID ? "Edit Fee Schedule" : "Create Fee Schedule"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    id="closeScheduleModal"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group mb-4">
                                    <label className="required form-label">Course</label>
                                    <SearchSelect
                                        options={courseList}
                                        value={courseList.find((c) => c.value === formData.CourseID)}
                                        onChange={(selected) =>
                                            setFormData({ ...formData, CourseID: selected?.value || "" })
                                        }
                                        placeholder="Select course..."
                                        isClearable
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-4">
                                            <label className="required form-label">Level</label>
                                            <SearchSelect
                                                id="Level"
                                                value={levelSelectOptions.find(opt => opt.value === formData.Level) || null}
                                                options={levelSelectOptions}
                                                onChange={(selected) => setFormData({ ...formData, Level: selected?.value || '' })}
                                                placeholder="Select Level"
                                                isClearable={false}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group mb-4">
                                            <label className="required form-label">Student Type</label>
                                            <SearchSelect
                                                id="ScheduleType"
                                                value={scheduleTypeOptions.find(opt => opt.value === formData.ScheduleType) || null}
                                                options={scheduleTypeOptions}
                                                onChange={(selected) => setFormData({ ...formData, ScheduleType: selected?.value || '0' })}
                                                placeholder="Select Type"
                                                isClearable={false}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group mb-4">
                                    <label className="required form-label">Semester</label>
                                    <SearchSelect
                                        options={semesterOptions}
                                        value={semesterOptions.find((s) => s.value === formData.Semester)}
                                        onChange={(selected) =>
                                            setFormData({ ...formData, Semester: selected?.value || "" })
                                        }
                                        placeholder="Select semester..."
                                        isClearable
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={onSubmit}
                                >
                                    {formData.EntryID ? "Update" : "Create"} Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* View Schedule Details Modal */}
                <Modal id="kt_modal_view_schedule" title="Schedule Details" large close="closeViewModal">
                    {selectedSchedule && (
                        <>
                            {/* Schedule Info */}
                            <div className="d-flex flex-wrap gap-3 mb-5">
                                <div className="border rounded p-3 flex-grow-1">
                                    <small className="text-muted">Course</small>
                                    <div className="fw-bold">
                                        {selectedSchedule.CourseName || selectedSchedule.CourseID}
                                    </div>
                                </div>
                                <div className="border rounded p-3">
                                    <small className="text-muted">Level</small>
                                    <div className="fw-bold">{selectedSchedule.Level}</div>
                                </div>
                                <div className="border rounded p-3">
                                    <small className="text-muted">Type</small>
                                    <div className="fw-bold">
                                        {selectedSchedule.ScheduleType === 0 ? "New" : "Returning"}
                                    </div>
                                </div>
                            </div>

                            {/* Add Item Form */}
                            <div className="bg-light rounded p-4 mb-4">
                                <h6 className="mb-3">Add Fee Item</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <SearchSelect
                                            id="FeeItemID"
                                            value={feeItemOptions.find(opt => opt.value === parseInt(linkItemForm.FeeItemID)) || null}
                                            options={feeItemOptions}
                                            onChange={(selected) => {
                                                setLinkItemForm({
                                                    ...linkItemForm,
                                                    FeeItemID: selected?.value || '',
                                                    CustomAmount: selected?.amount || '',
                                                });
                                            }}
                                            placeholder="Select Fee Item"
                                            isClearable={false}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <input
                                            type="number"
                                            className="form-control form-control-solid"
                                            placeholder="Custom Amount"
                                            value={linkItemForm.CustomAmount}
                                            onChange={(e) =>
                                                setLinkItemForm({
                                                    ...linkItemForm,
                                                    CustomAmount: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <button
                                            type="button"
                                            className="btn btn-primary w-100"
                                            onClick={onLinkItem}
                                        >
                                            <i className="fa fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="table-responsive">
                                <table className="table table-row-bordered align-middle">
                                    <thead>
                                        <tr className="fw-bold text-muted">
                                            <th>Fee Item</th>
                                            <th className="text-end">Amount</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scheduleItems.length > 0 ? (
                                            scheduleItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <span className="fw-bold">
                                                            {item.FeeItemName || item.Name}
                                                        </span>
                                                        <br />
                                                        <small className="text-muted">
                                                            {item.Category}
                                                        </small>
                                                    </td>
                                                    <td className="text-end">
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm form-control-solid text-end"
                                                            defaultValue={
                                                                item.CustomAmount || item.DefaultAmount
                                                            }
                                                            onBlur={(e) =>
                                                                onUpdateItemAmount(item, e.target.value)
                                                            }
                                                            style={{ width: "120px", display: "inline-block" }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-light-danger"
                                                            onClick={() => onUnlinkItem(item)}
                                                        >
                                                            <i className="fa fa-times"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="text-center text-muted py-5">
                                                    No items linked to this schedule
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {scheduleItems.length > 0 && (
                                        <tfoot>
                                            <tr className="fw-bold bg-light">
                                                <td>Total</td>
                                                <td className="text-end text-primary">
                                                    {currencyConverter(calculateScheduleTotal())}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </>
                    )}
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    loginData: state.LoginDetails,
});

export default connect(mapStateToProps, null)(FeeSchedules);
