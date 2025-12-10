import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import ReportTable from "../../common/table/ReportTable";


const StaffLeaveCategoryMembers = (props) => {
    const token = props.loginDetails[0].token;

    const [isLoading, setIsLoading] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [leaveCategories, setLeaveCategories] = useState([]);
    const columns = ["SN", "Staff ID", "Staff Name", "Gender", "Desgination", "Add to Group"]
    const [data, setData] = useState([]);

    const [category, setCategory] = useState({
        CategoryID: "",
        InsertedBy: props.loginDetails[0].StaffID
    })

    const getData = async () => {
        await axios.get(`${serverLink}staff/human-resources/staff-leave/staff-list`, token)
            .then((result) => {
                let rows_ = []
                if (result.data.length > 0) {
                    setStaffList(result.data);
                }

            })

        await axios.get(`${serverLink}staff/human-resources/staff-leave/leave-categories/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setLeaveCategories(result.data)
                }
                setIsLoading(false);
            }).catch(() => {
                showAlert("Network Error", "please check your connection", "error")
            })
    }

    const getCategoryStaff = async (categoryID, loader) => {
        if (loader === 1) {
            setIsLoading(true);
        }
        let assigned_ = [];
        await axios.get(`${serverLink}staff/human-resources/staff-leave/category-staff/list/${categoryID}`, token)
            .then((result) => {
                let rows = []
                if (staffList.length > 0) {
                    staffList.forEach((item, index) => {
                        let action = []
                        action = result.data.filter(x => x.StaffID === item.StaffID && x.CategoryID.toString() === categoryID.toString());
                        assigned_ = action.length > 0 ? 1 : 0;
                        rows.push([
                            index + 1,
                            item.StaffID,
                            item.StaffName,
                            <span className={item.Gender === "Male" ? "badge badge-info" : "badge badge-success"}>{item.Gender}</span>,
                            item.Designation,
                            (
                                <div className="form-check form-check-custom form-check-success form-check-solid">
                                    <input className="form-check-input" type="checkbox"
                                        onChange={(e) => {
                                            assignToCategory(e, item, categoryID)
                                        }}
                                        defaultChecked={assigned_ === 1 ? true : false} />
                                    <label className="form-check-label">
                                        {assigned_ === 1 ? "Assigned" : "Not Assigned"}
                                    </label>
                                </div>
                            )
                        ])
                    })
                }
                setData(rows)
                setIsLoading(false)
            })
        return assigned_;
    }

    const assignToCategory = async (e, staff, categ_) => {
        const sendData = {
            CategoryID: categ_,
            StaffID: staff.StaffID,
            InsertedBy: category.InsertedBy
        }
        try {
            if (e.target.checked === true) {
                await axios.post(`${serverLink}staff/human-resources/staff-leave/assign-to-category`, sendData, token)
                    .then((result) => {
                        if (result.data.message === "success") {
                            getCategoryStaff(categ_, 0).then((e) => {
                                toast.success("staff assigned successfully")
                            });;
                        } else if (result.data.message === "exists") {
                            toast.error(`staff already assigned to
                            ${leaveCategories.filter(x => x.EntryID.toString() === result.data.category.toString())[0].Description} group`)
                        }
                        else {
                            toast.error('network error...')
                        }
                    })
            }
            else {
                await axios.post(`${serverLink}staff/human-resources/staff-leave/remove-from-category`, sendData, token)
                    .then((result) => {
                        if (result.data.message === "success") {
                            getCategoryStaff(categ_, 0).then((e) => {
                                toast.warning("staff removed successfully")
                            });

                        } else {
                            toast.error('network error...')
                        }
                    })
            }
        } catch (e) {

        }

    }

    const onEdit = (e) => {
        setCategory({
            ...category,
            [e.target.id]: e.target.value
        })

        if (e.target.id === "CategoryID") {
            if (e.target.value !== "") {
                getCategoryStaff(e.target.value, 1)
            } else {
                setData([])
            }

        }

    }

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Staff Leave Settings"}
                items={["Human Resources", "Staff Leave", "Settings"]}
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body pt-5">
                        <div className="row col-md-12">
                            <div className="form-group">
                                <select id="CategoryID" onChange={onEdit}
                                    value={category.CategoryID}
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
                        </div>
                        <div className="col-md-12" style={{ overflowX: 'auto' }}>
                            <ReportTable data={data} columns={columns} height="700px" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        loginDetails: state.LoginDetails
    }
}
export default connect(mapStateToProps, null)(StaffLeaveCategoryMembers);