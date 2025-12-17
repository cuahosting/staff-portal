import React, { useEffect, useState, useMemo } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";

const StaffLeaveCategoryMembers = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [staffList, setStaffList] = useState([]);
    const [leaveCategories, setLeaveCategories] = useState([]);
    const columns = ["SN", "Staff ID", "Staff Name", "Gender", "Designation", "Add to Group"];
    const [data, setData] = useState([]);

    const [category, setCategory] = useState({
        CategoryID: "",
        InsertedBy: props.loginDetails[0].StaffID
    });

    const getData = async () => {
        const [staffRes, catRes] = await Promise.all([
            api.get("staff/human-resources/staff-leave/staff-list"),
            api.get("staff/human-resources/staff-leave/leave-categories/list")
        ]);

        if (staffRes.success && staffRes.data?.length > 0) {
            setStaffList(staffRes.data);
        }

        if (catRes.success && catRes.data?.length > 0) {
            setLeaveCategories(catRes.data);
        }

        setIsLoading(false);
    };

    const getCategoryStaff = async (categoryID, loader) => {
        if (loader === 1) {
            setIsLoading(true);
        }

        const { success, data: resultData } = await api.get(`staff/human-resources/staff-leave/category-staff/list/${categoryID}`);

        if (success && staffList.length > 0) {
            const rows = staffList.map((item, index) => {
                const action = resultData?.filter(x => x.StaffID === item.StaffID && x.CategoryID.toString() === categoryID.toString()) || [];
                const assigned_ = action.length > 0 ? 1 : 0;

                return [
                    index + 1,
                    item.StaffID,
                    item.StaffName,
                    <span className={item.Gender === "Male" ? "badge badge-info" : "badge badge-success"}>{item.Gender}</span>,
                    item.Designation,
                    <div className="form-check form-check-custom form-check-success form-check-solid">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            onChange={(e) => assignToCategory(e, item, categoryID)}
                            defaultChecked={assigned_ === 1}
                        />
                        <label className="form-check-label">
                            {assigned_ === 1 ? "Assigned" : "Not Assigned"}
                        </label>
                    </div>
                ];
            });
            setData(rows);
        }
        setIsLoading(false);
    };

    const assignToCategory = async (e, staff, categ_) => {
        const sendData = {
            CategoryID: categ_,
            StaffID: staff.StaffID,
            InsertedBy: category.InsertedBy
        };

        if (e.target.checked === true) {
            const { success, data } = await api.post("staff/human-resources/staff-leave/assign-to-category", sendData);

            if (success && data?.message === "success") {
                getCategoryStaff(categ_, 0);
                toast.success("Staff assigned successfully");
            } else if (success && data?.message === "exists") {
                const catDescription = leaveCategories.find(x => x.EntryID.toString() === data.category.toString())?.Description || "another";
                toast.error(`Staff already assigned to ${catDescription} group`);
            } else if (success) {
                toast.error("Network error...");
            }
        } else {
            const { success, data } = await api.post("staff/human-resources/staff-leave/remove-from-category", sendData);

            if (success && data?.message === "success") {
                getCategoryStaff(categ_, 0);
                toast.warning("Staff removed successfully");
            } else if (success) {
                toast.error("Network error...");
            }
        }
    };

    const onEdit = (e) => {
        setCategory({ ...category, [e.target.id]: e.target.value });

        if (e.target.id === "CategoryID") {
            if (e.target.value !== "") {
                getCategoryStaff(e.target.value, 1);
            } else {
                setData([]);
            }
        }
    };

    const categoryOptions = useMemo(() => {
        return leaveCategories.map(x => ({
            value: x.EntryID.toString(),
            label: x.Description
        }));
    }, [leaveCategories]);

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                                <SearchSelect
                                    id="CategoryID"
                                    value={categoryOptions.find(opt => opt.value === category.CategoryID.toString()) || null}
                                    options={categoryOptions}
                                    onChange={(selected) => onEdit({ target: { id: 'CategoryID', value: selected?.value || '' } })}
                                    placeholder="-select Category-"
                                    isClearable={false}
                                />
                            </div>
                        </div>
                        <div className="col-md-12" style={{ overflowX: 'auto' }}>
                            <ReportTable data={data} columns={columns} height="700px" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        loginDetails: state.LoginDetails
    };
};

export default connect(mapStateToProps, null)(StaffLeaveCategoryMembers);