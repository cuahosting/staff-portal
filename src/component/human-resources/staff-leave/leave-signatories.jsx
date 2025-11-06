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
import Select from 'react-select';
import { connect } from "react-redux";

const StaffLeaveSignatories = (props) => {
    const token = props.loginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true)
    const columns = ["SN", "Category", "Staff", "Position", "Inserted By", "Action"];
    const [data, setData] = useState([]);
    const [leaveCategories, setLeaveCategories] = useState([]);
    const [leaveSignatories, setLeaveSignatories] = useState([]);
    const [staffList, setStaffList] = useState([])
    const InsertedBy = props.InsertedBy;
    const [sign, setsign] = useState({
        CategoryID: "",
        StaffID: "",
        Position: "",
        InsertedBy: props.InsertedBy,
        EntryID: ""
    })

    const getData = async () => {
        try {
            await axios.get(`${serverLink}staff/service-desk/staff-list`, token)
                .then((result) => {
                    let rows_ = []
                    if (result.data.length > 0) {
                        result.data.map((row) => {
                            rows_.push({ value: row.StaffID, label: row.StaffID + " -- " + row.StaffName })
                        });
                    }
                    setStaffList(rows_);
                })

            let categories = []
            await axios.get(`${serverLink}staff/human-resources/staff-leave/leave-categories/list`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        categories = result.data
                        setLeaveCategories(result.data)
                    }
                })

            await axios.get(`${serverLink}staff/human-resources/staff-leave/leave-signs/list`, token)
                .then((result) => {
                    let rows = [];
                    if (result.data.length > 0) {
                        result.data.map((item, index) => {
                            let cat = categories.length > 0 ? categories.filter(x => x.EntryID === item.CategoryID)[0].Description : "No Category"
                            rows.push([
                                index + 1,
                                item.CategoryID + " -- " + cat,
                                item.StaffID + " -- " + item.StaffName,
                                item.Position,
                                item.InsertedBy,
                                (
                                    <button className="btn btn-sm btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#signatories"
                                        onClick={() => {
                                            setsign({
                                                ...sign,
                                                CategoryID: item.CategoryID,
                                                StaffID: { value: item.StaffID, label: item.StaffID + " -- " + item.StaffName },
                                                Position: item.Position,
                                                EntryID: item.EntryID
                                            })
                                        }}>
                                        <i className="fa fa-pen" />
                                    </button>
                                )
                            ])
                        })
                        setData(rows)
                    }
                    setIsLoading(false);
                })
        } catch (error) {
            showAlert("Network Error", "please check your connection", "error")

        }
    }
    const onMainLecturerChange = (e) => {
        setsign({
            ...sign,
            StaffID: e
        })
    }

    const onEdit = (e) => {
        setsign({
            ...sign,
            [e.target.id]: e.target.value
        })

    }

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            if (sign.EntryID === "") {
                await axios.post(`${serverLink}staff/human-resources/staff-leave/leave-signatories/add`, sign, token)
                    .then((result) => {
                        if (result.data.message === "success") {
                            getData();
                            toast.success("category added successfully");
                            document.getElementById("signatories").click();

                        } else {
                            toast.error("please try again");
                        }
                    })
            } else {
                await axios.patch(`${serverLink}staff/human-resources/staff-leave/leave-signatories/update`, sign, token)
                    .then((result) => {
                        if (result.data.message === "success") {
                            getData();
                            toast.success("category updated successfully");
                            document.getElementById("signatories").click();

                        } else {
                            toast.error("please try again");
                        }
                    })
            }
        } catch (e) {
            console.log(e)
            showAlert("Network Error", "please check your connection", "error")
        }
    }

    useEffect(() => {
        getData();
    }, [])
    return isLoading ? (<Loader />) : (
        <div className="card">
            <div className="card-header border-0 pt-6">
                <div className="card-title" ><h2>Leave Signatories</h2></div>
                <div className="card-toolbar">
                    <div
                        className="d-flex justify-content-end"
                        data-kt-customer-table-toolbar="base">
                        <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#signatories" onClick={() => {
                                setsign({
                                    ...sign,
                                    CategoryID: "",
                                    StaffID: "",
                                    Position: "",
                                    EntryID: ""
                                })
                            }}>
                            Add Signatories
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-body pt-0">
                <div className="col-md-12" style={{ overflowX: 'auto' }}>
                    <ReportTable data={data} columns={columns} height="700px" />
                </div>
            </div>

            <Modal title={"Manage signatories"} id={"signatories"} close={"signatories"}>
                <form onSubmit={onSubmit} >
                    <div className="form-group">
                        <label htmlFor="Name">Category</label>
                        <select id="CategoryID" onChange={onEdit}
                            value={sign.CategoryID}
                            className="form-select form-select">
                            <option value={""}>-select Category-</option>
                            {leaveCategories.length > 0 ?
                                <>
                                    {leaveCategories.map((x, y) => {
                                        return (
                                            <option key={y} value={x.EntryID}>{x.Description}</option>
                                        )
                                    })}
                                </>
                                :
                                <></>}
                        </select>
                    </div>
                    <br />
                    <div className="form-group">
                        <label htmlFor="Position">Postion</label>
                        <input
                            type="number"
                            min={"0"}
                            required
                            id={"Position"}
                            onChange={onEdit}
                            value={sign.Position}
                            className={"form-control"}
                            placeholder={"Enter Position"}
                        />
                    </div>
                    <br />
                    {
                        staffList.length > 0 &&
                        <div className="form-group">
                            <label htmlFor="Staff">Staff</label>
                            <Select
                                name="Staff"
                                value={sign.StaffID}
                                onChange={onMainLecturerChange}
                                options={staffList}
                            />
                        </div>
                    }
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
export default connect(mapStateToProps, null)(StaffLeaveSignatories);

