import React from "react";
import { useState } from "react";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import axios from 'axios'
import { useEffect } from "react";
import { toast } from "react-toastify";
import { showAlert } from "../../common/sweetalert/sweetalert";
import SearchSelect from "../../common/select/SearchSelect";
import { connect } from "react-redux";

const StaffLeaveSignatories = (props) => {
    const token = props.loginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true)
    const columns = ["SN", "Action", "Category", "Staff", "Position", "Inserted By"];
    const [data, setData] = useState([]);
    const [leaveCategories, setLeaveCategories] = useState([]);
    const [staffList, setStaffList] = useState([])
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
                        result.data.forEach((row) => {
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
                        result.data.forEach((item, index) => {
                            let cat = categories.length > 0 ? categories.filter(x => x.EntryID === item.CategoryID)[0].Description : "No Category"
                            rows.push([
                                index + 1,
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
                                ),
                                item.CategoryID + " -- " + cat,
                                item.StaffID + " -- " + item.StaffName,
                                item.Position,
                                item.InsertedBy
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
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
                        onClick={() => {
                            setsign({
                                ...sign,
                                CategoryID: "",
                                StaffID: "",
                                Position: "",
                                EntryID: ""
                            })
                        }}
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
                    <form onSubmit={onSubmit} >
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
                                <SearchSelect
                                    name="Staff"
                                    value={sign.StaffID}
                                    onChange={onMainLecturerChange}
                                    options={staffList}
                                    placeholder="Select Staff"
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
        </div>
    )
}
const mapStateToProps = (state) => {
    return {
        loginDetails: state.LoginDetails,
    }
}
export default connect(mapStateToProps, null)(StaffLeaveSignatories);

