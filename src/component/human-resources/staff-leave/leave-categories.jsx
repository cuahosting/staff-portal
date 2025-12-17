import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import { toast } from "react-toastify";

const StaffLeaveCategories = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["SN", "Action", "Name", "Description", "Annual Days Allowed", "Casual Days Allowed", "InsertedBy"];
    const [data, setData] = useState([]);
    const [leave, setLeave] = useState({
        Name: "",
        Description: "",
        LeaveDaysAllowed: "",
        CasualDaysAllowed: "",
        InsertedBy: props.InsertedBy,
        EntryID: ""
    });

    const getData = async () => {
        const { success, data: resultData } = await api.get("staff/human-resources/staff-leave/leave-categories/list");

        if (success && resultData?.length > 0) {
            const rows = resultData.map((item, index) => [
                index + 1,
                <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#leave"
                    onClick={() => setLeave(item)}
                >
                    <i className="fa fa-pen" />
                </button>,
                item.Name,
                item.Description,
                item.LeaveDaysAllowed,
                item.CasualDaysAllowed,
                item.InsertedBy
            ]);
            setData(rows);
        }
        setIsLoading(false);
    };

    const onEdit = (e) => {
        setLeave({ ...leave, [e.target.id]: e.target.value });
    };

    const resetForm = () => {
        setLeave({
            Name: "",
            Description: "",
            LeaveDaysAllowed: "",
            CasualDaysAllowed: "",
            InsertedBy: props.InsertedBy,
            EntryID: ""
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (leave.EntryID === "") {
            const { success, data } = await api.post("staff/human-resources/staff-leave/leave-categories/add", leave);

            if (success && data?.message === "success") {
                getData();
                toast.success("Category added successfully");
                document.getElementById("leave").click();
            } else if (success) {
                toast.error("The category already exists");
            }
        } else {
            const { success, data } = await api.patch("staff/human-resources/staff-leave/leave-categories/update", leave);

            if (success && data?.message === "success") {
                getData();
                toast.success("Category updated successfully");
                document.getElementById("leave").click();
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
                title="Leave Categories"
                items={["Human Resources", "Staff Leave", "Leave Categories"]}
                buttons={
                    <button
                        type="button"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#leave"
                        onClick={resetForm}
                    >
                        <i className="fa fa-plus me-2"></i>
                        Add Category
                    </button>
                }
            />
            <div className="card">
                <div className="card-header border-0 pt-6">
                    <div className="card-title"><h2>Leave Categories</h2></div>
                </div>

                <div className="card-body p-0">
                    <div className="col-md-12" style={{ overflowX: 'auto' }}>
                        <ReportTable data={data} columns={columns} height="700px" />
                    </div>
                </div>

                <Modal title={"Manage leave"} id={"leave"} close={"leave"}>
                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label htmlFor="Name">Category Code</label>
                            <input
                                type="text"
                                required
                                id="Name"
                                onChange={onEdit}
                                value={leave.Name}
                                className="form-control"
                                placeholder="e.g PO"
                            />
                        </div>
                        <br />
                        <div className="form-group">
                            <label htmlFor="Description">Description</label>
                            <input
                                type="text"
                                required
                                id="Description"
                                onChange={onEdit}
                                value={leave.Description}
                                className="form-control"
                                placeholder="e.g Principal Officers"
                            />
                        </div>
                        <br />
                        <div className="form-group">
                            <label htmlFor="LeaveDaysAllowed">Leave Days Allowed</label>
                            <input
                                type="number"
                                required
                                min="0"
                                id="LeaveDaysAllowed"
                                onChange={onEdit}
                                value={leave.LeaveDaysAllowed}
                                className="form-control"
                                placeholder="e.g 30"
                            />
                        </div>
                        <br />
                        <div className="form-group">
                            <label htmlFor="CasualDaysAllowed">Casual Days Allowed</label>
                            <input
                                type="number"
                                required
                                min="0"
                                id="CasualDaysAllowed"
                                onChange={onEdit}
                                value={leave.CasualDaysAllowed}
                                className="form-control"
                                placeholder="e.g 10"
                            />
                        </div>
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

export default connect(mapStateToProps, null)(StaffLeaveCategories);
