import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import { toast } from "react-toastify";
import SearchSelect from "../../common/select/SearchSelect";

const StaffLeaveSignatories = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["SN", "Action", "Category", "Staff", "Position", "Inserted By"];
    const [data, setData] = useState([]);
    const [leaveCategories, setLeaveCategories] = useState([]);
    const [staffList, setStaffList] = useState([]);

    const [sign, setsign] = useState({
        CategoryID: "",
        StaffID: "",
        Position: "",
        InsertedBy: props.InsertedBy,
        EntryID: ""
    });

    const getData = async () => {
        const [staffRes, catRes, signsRes] = await Promise.all([
            api.get("staff/service-desk/staff-list"),
            api.get("staff/human-resources/staff-leave/leave-categories/list"),
            api.get("staff/human-resources/staff-leave/leave-signs/list")
        ]);

        if (staffRes.success && staffRes.data?.length > 0) {
            const rows_ = staffRes.data.map(row => ({
                value: row.StaffID,
                label: row.StaffID + " -- " + row.StaffName
            }));
            setStaffList(rows_);
        }

        let categories = [];
        if (catRes.success && catRes.data?.length > 0) {
            categories = catRes.data;
            setLeaveCategories(catRes.data);
        }

        if (signsRes.success && signsRes.data?.length > 0) {
            const rows = signsRes.data.map((item, index) => {
                const cat = categories.length > 0
                    ? categories.find(x => x.EntryID === item.CategoryID)?.Description || "No Category"
                    : "No Category";
                return [
                    index + 1,
                    <button
                        className="btn btn-sm btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#signatories"
                        onClick={() => {
                            setsign({
                                ...sign,
                                CategoryID: item.CategoryID,
                                StaffID: { value: item.StaffID, label: item.StaffID + " -- " + item.StaffName },
                                Position: item.Position,
                                EntryID: item.EntryID
                            });
                        }}
                    >
                        <i className="fa fa-pen" />
                    </button>,
                    item.CategoryID + " -- " + cat,
                    item.StaffID + " -- " + item.StaffName,
                    item.Position,
                    item.InsertedBy
                ];
            });
            setData(rows);
        }
        setIsLoading(false);
    };

    const onMainLecturerChange = (e) => {
        setsign({ ...sign, StaffID: e });
    };

    const onEdit = (e) => {
        setsign({ ...sign, [e.target.id]: e.target.value });
    };

    const resetForm = () => {
        setsign({
            CategoryID: "",
            StaffID: "",
            Position: "",
            EntryID: ""
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (sign.EntryID === "") {
            const { success, data } = await api.post("staff/human-resources/staff-leave/leave-signatories/add", sign);

            if (success && data?.message === "success") {
                getData();
                toast.success("Category added successfully");
                document.getElementById("signatories").click();
            } else if (success) {
                toast.error("Please try again");
            }
        } else {
            const { success, data } = await api.patch("staff/human-resources/staff-leave/leave-signatories/update", sign);

            if (success && data?.message === "success") {
                getData();
                toast.success("Category updated successfully");
                document.getElementById("signatories").click();
            } else if (success) {
                toast.error("Please try again");
            }
        }
    };

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title="Leave Signatories"
                items={["Human Resources", "Staff Leave", "Leave Signatories"]}
                buttons={
                    <button
                        type="button"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#signatories"
                        onClick={resetForm}
                    >
                        <i className="fa fa-plus me-2"></i>
                        Add Signatories
                    </button>
                }
            />
            <div className="card">
                <div className="card-header border-0 pt-6">
                    <div className="card-title"><h2>Leave Signatories</h2></div>
                </div>

                <div className="card-body p-0">
                    <div className="col-md-12" style={{ overflowX: 'auto' }}>
                        <ReportTable data={data} columns={columns} height="700px" />
                    </div>
                </div>

                <Modal title={"Manage signatories"} id={"signatories"} close={"signatories"}>
                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label htmlFor="Name">Category</label>
                            <SearchSelect
                                id="CategoryID"
                                value={leaveCategories.find(op => op.EntryID === sign.CategoryID) ? { value: sign.CategoryID, label: leaveCategories.find(op => op.EntryID === sign.CategoryID).Description } : null}
                                onChange={(selected) => onEdit({ target: { id: 'CategoryID', value: selected?.value || '' } })}
                                options={leaveCategories.map(x => ({ value: x.EntryID, label: x.Description }))}
                                placeholder="-select Category-"
                            />
                        </div>
                        <br />
                        <div className="form-group">
                            <label htmlFor="Position">Position</label>
                            <input
                                type="number"
                                min="0"
                                required
                                id="Position"
                                onChange={onEdit}
                                value={sign.Position}
                                className="form-control"
                                placeholder="Enter Position"
                            />
                        </div>
                        <br />
                        {staffList.length > 0 && (
                            <div className="form-group">
                                <label htmlFor="Staff">Staff</label>
                                <SearchSelect
                                    name="Staff"
                                    value={sign.StaffID}
                                    onChange={onMainLecturerChange}
                                    options={staffList}
                                    placeholder="Select Staff"
                                />
                            </div>
                        )}
                        <br />
                        <div className="form-group pt-2">
                            <button type="submit" className="btn btn-primary w-100">
                                <span className="indicator-label">Submit</span>
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        loginDetails: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(StaffLeaveSignatories);
