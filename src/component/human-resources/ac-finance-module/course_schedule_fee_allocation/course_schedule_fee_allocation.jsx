import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import PageHeader from "../../../common/pageheader/pageheader";
import SearchSelect from "../../../common/select/SearchSelect";
import DataTable from "../../../common/table/DataTable";
import Loader from "../../../common/loader/loader";
import { toast } from "react-toastify";
import swal from "sweetalert";

function CourseScheduleFeeAllocation(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [feeItems, setFeeItems] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedFeeItem, setSelectedFeeItem] = useState(null);
    const [allocations, setAllocations] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Fee Item", field: "FeeItemName" },
            { label: "Amount", field: "FeeItemAmount" },
            { label: "Description", field: "Description" },
            { label: "Action", field: "action" },
        ],
        rows: [],
    });

    const getInitialData = async () => {
        setIsLoading(true);
        const [scheduleRes, feeItemsRes] = await Promise.all([
            api.get("staff/ac-finance/course-schedules/list"),
            api.get("staff/ac-finance/fee-items/list")
        ]);

        if (scheduleRes.success) {
            setSchedules(scheduleRes.data.map(item => ({
                value: item.EntryID,
                label: `${item.CourseName} (${item.CourseCode}) - ${item.Level}L - ${item.Semester} - ${item.ScheduleType === 1 ? 'RETURNING' : 'NEW'}`,
                ...item
            })));
        }

        if (feeItemsRes.success) {
            setFeeItems(feeItemsRes.data.map(item => ({
                value: item.EntryID,
                label: `${item.Name} (₦${parseFloat(item.Amount).toLocaleString()})`,
                ...item
            })));
        }
        setIsLoading(false);
    };

    const getAllocations = async (scheduleID) => {
        setIsTableLoading(true);
        const { success, data } = await api.get(`staff/ac-finance/allocation/list/${scheduleID}`);
        if (success) {
            const rows = data.map((item, index) => ({
                sn: index + 1,
                FeeItemName: item.FeeItemName,
                FeeItemAmount: `₦${parseFloat(item.FeeItemAmount).toLocaleString()}`,
                Description: item.Description || "N/A",
                action: (
                    <button className="btn btn-link p-0 text-danger" title="Remove"
                        onClick={() => handleDelete(item.EntryID)}>
                        <i style={{ fontSize: '15px', color: "red" }} className="fa fa-trash" />
                    </button>
                ),
            }));
            setAllocations(prev => ({ ...prev, rows }));
        }
        setIsTableLoading(false);
    };

    const handleAddAllocation = async () => {
        if (!selectedSchedule) {
            toast.error("Please select a course schedule");
            return;
        }
        if (!selectedFeeItem) {
            toast.error("Please select a fee item");
            return;
        }

        const payload = {
            ScheduleFeeID: selectedSchedule.value,
            FeeItemID: selectedFeeItem.value,
            InsertedBy: props.loginData[0].StaffID
        };

        const { success, data } = await api.post("staff/ac-finance/allocation/add", payload);
        if (success) {
            if (data?.message === "success") {
                toast.success("Fee item allocated successfully");
                getAllocations(selectedSchedule.value);
                setSelectedFeeItem(null);
            } else if (data?.message === "exist") {
                toast.warning("This fee item is already allocated to this schedule");
            }
        }
    };

    const handleDelete = (id) => {
        swal({
            title: "Are you sure?",
            text: "You are about to remove this fee item from the schedule",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                const { success } = await api.delete(`staff/ac-finance/allocation/delete/${id}`);
                if (success) {
                    toast.success("Allocation removed");
                    getAllocations(selectedSchedule.value);
                }
            }
        });
    };

    useEffect(() => {
        getInitialData();
    }, []);

    useEffect(() => {
        if (selectedSchedule) {
            getAllocations(selectedSchedule.value);
        } else {
            setAllocations(prev => ({ ...prev, rows: [] }));
        }
    }, [selectedSchedule]);

    if (isLoading) return <Loader />;

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Course Schedule Fee Allocation"} items={["Finance", "Fee Allocation"]} />

            <div className="flex-column-fluid">
                <div className="card mb-5 mb-xl-8">
                    <div className="card-body py-3">
                        <div className="row g-9 mb-8 align-items-end">
                            <div className="col-md-6">
                                <label className="form-label fw-bolder text-dark">Course Schedule</label>
                                <SearchSelect
                                    placeholder="Search Course Schedule..."
                                    options={schedules}
                                    value={selectedSchedule}
                                    onChange={(val) => setSelectedSchedule(val)}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bolder text-dark">Fee Item</label>
                                <SearchSelect
                                    placeholder="Select Fee Item..."
                                    options={feeItems}
                                    value={selectedFeeItem}
                                    onChange={(val) => setSelectedFeeItem(val)}
                                />
                            </div>
                            <div className="col-md-2">
                                <button type="button" className="btn btn-primary w-100" onClick={handleAddAllocation}>
                                    Allocate Fee
                                </button>
                            </div>
                        </div>

                        {selectedSchedule && (
                            <div className="bg-light-primary p-5 rounded-3 mb-8">
                                <div className="d-flex flex-stack flex-wrap">
                                    <div className="me-2">
                                        <div className="text-dark fw-bolder fs-3">Allocated Fees for {selectedSchedule.CourseName}</div>
                                        <div className="text-muted fw-bold fs-6">{selectedSchedule.Level}L | {selectedSchedule.Semester} | {selectedSchedule.ScheduleType === 1 ? 'Returning' : 'New'}</div>
                                    </div>
                                    <div className="fw-bolder fs-2 text-primary">
                                        Total: ₦{allocations.rows.reduce((sum, row) => {
                                            const amount = parseFloat(row.FeeItemAmount.replace(/[₦,]/g, ''));
                                            return sum + (isNaN(amount) ? 0 : amount);
                                        }, 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="table-responsive">
                            {isTableLoading ? (
                                <div className="text-center py-10">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <DataTable data={allocations} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails });
export default connect(mapStateToProps, null)(CourseScheduleFeeAllocation);
