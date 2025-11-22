import React from "react";
import { useState } from "react";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import Modal from "../../common/modal/modal";
import ReportTable from "../../common/table/report_table";
import axios from 'axios'
import { useEffect } from "react";
import { toast } from "react-toastify";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { connect } from "react-redux";

const StaffLeaveCategories = (props) => {
    const token = props.loginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true)
    const columns = ["SN", "Name", "Description", "Annual Days Allowed", "Casual Days Allowed", "InsertedBy", "Action"];
    const [data, setData] = useState([]);
    const [leaveCategories, setLeaveCategories] = useState();
    const [leave, setLeave] = useState({
        Name: "",
        Description: "",
        LeaveDaysAllowed: "",
        CasualDaysAllowed: "",
        InsertedBy: props.InsertedBy,
        EntryID: ""
    })

    const getData = async () => {

        await axios.get(`${serverLink}staff/human-resources/staff-leave/leave-categories/list`, token)
            .then((result) => {
                let rows = [];
                if (result.data.length > 0) {
                    result.data.map((item, index) => {
                        rows.push([
                            index + 1,
                            item.Name,
                            item.Description,
                            item.LeaveDaysAllowed,
                            item.CasualDaysAllowed,
                            item.InsertedBy,
                            (
                                <button className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#leave"
                                    onClick={() => {
                                        setLeave(item)
                                    }}>

                                    <i className="fa fa-pen" />
                                </button>
                            )
                        ])
                    })
                    setData(rows)
                }
                setIsLoading(false);
            }).catch(() => {
                showAlert("Network Error", "please check your connection", "error")
            })
    }


    const onEdit = (e) => {
        setLeave({
            ...leave,
            [e.target.id]: e.target.value
        })

    }

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            if (leave.EntryID === "") {
                await axios.post(`${serverLink}staff/human-resources/staff-leave/leave-categories/add`, leave, token)
                    .then((result) => {
                        if (result.data.message === "success") {
                            getData();
                            toast.success("category added successfully");
                            document.getElementById("leave").click();

                        } else {
                            toast.error("The category already exists");
                        }
                    })
            } else {
                await axios.patch(`${serverLink}staff/human-resources/staff-leave/leave-categories/update`, leave, token)
                    .then((result) => {
                        if (result.data.message === "success") {
                            getData();
                            toast.success("category updated successfully");
                            document.getElementById("leave").click();

                        }
                    })
            }
        } catch (e) {
            showAlert("Network Error", "please check your connection", "error")
        }
    }

    useEffect(() => {
        getData();
    }, [])
    return isLoading ? (<Loader />) : (
        <div className="card">
            <div className="card-header border-0 pt-6">
                <div className="card-title" ><h2>Leave Categories</h2></div>

                <div className="card-toolbar">
                    <div
                        className="d-flex justify-content-end"
                        data-kt-customer-table-toolbar="base">
                        <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#leave" onClick={() => {
                                setLeave({
                                    ...leave,
                                    Name: "",
                                    Description: "",
                                    LeaveDaysAllowed: "",
                                    CasualDaysAllowed: "",
                                    InsertedBy: props.InsertedBy,
                                    EntryID: ""
                                })
                            }}>
                            Add Category
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-body p-0">
                <div className="col-md-12" style={{ overflowX: 'auto' }}>
                    <ReportTable data={data} columns={columns} height="700px" />
                </div>
            </div>

            <Modal title={"Manage leave"} id={"leave"} close={"leave"}>
                <form onSubmit={onSubmit} >
                    <div className="form-group">
                        <label htmlFor="Name">Category Code</label>
                        <input
                            type="text"
                            required
                            id={"Name"}
                            onChange={onEdit}
                            value={leave.Name}
                            className={"form-control"}
                            placeholder={"e.g PO"}
                        />
                    </div>
                    <br />
                    <div className="form-group">
                        <label htmlFor="Description">Description</label>
                        <input
                            type="text"
                            required
                            id={"Description"}
                            onChange={onEdit}
                            value={leave.Description}
                            className={"form-control"}
                            placeholder={"e.g Principal Officers"}
                        />
                    </div>
                    <br />
                    <div className="form-group">
                        <label htmlFor="LeaveDaysAllowed">Leave Days Allowed</label>
                        <input
                            type="number"
                            required
                            min="0"
                            id={"LeaveDaysAllowed"}
                            onChange={onEdit}
                            value={leave.LeaveDaysAllowed}
                            className={"form-control"}
                            placeholder={"e,g 30"}
                        />
                    </div>
                    <br />
                    <div className="form-group">
                        <label htmlFor="CasualDaysAllowed">Casual Days Allowed</label>
                        <input
                            type="number"
                            required
                            min="0"
                            id={"CasualDaysAllowed"}
                            onChange={onEdit}
                            value={leave.CasualDaysAllowed}
                            className={"form-control"}
                            placeholder={"e.g 10"}
                        />
                    </div>
                    <br />
                    <div className="form-group pt-2">
                        <button type="submit" className="btn btn-primary w-100" >
                            <span className="indicator-label">Submit</span>
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        loginDetails: state.LoginDetails,
    }
}
export default connect(mapStateToProps, null)(StaffLeaveCategories);
