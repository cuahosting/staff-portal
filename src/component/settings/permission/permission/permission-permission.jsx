import React, { useEffect, useState, useMemo } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";
import ReportTable from "../../../common/table/ReportTable";
import SearchSelect from "../../../common/select/SearchSelect";

function PermissionPermission(props) {
    const [isLoading, setIsLoading] = useState(true);
    const column = ["S/N", "Sub Sub Menu", "Menu/Sub Menu", "Visibility", "Menu Link", "Updated By/Updated Date", "Edit", "Delete"];
    const [data, setData] = useState([]);
    const [createItem, setCreateItem] = useState({
        group_id: "",
        inserted_by: props.loginData[0].StaffID,
        entry_id: "",
    });
    const [permissionList, setPermissionList] = useState([]);
    const [groupList, setGroupList] = useState([]);

    const groupOptions = useMemo(() => {
        return groupList.map(group => ({
            value: group.EntryID,
            label: group.GroupName
        }));
    }, [groupList]);

    const getRecords = async (group_id = '') => {
        const [groupRes, menuRes] = await Promise.all([
            api.get("staff/settings/group/list"),
            api.get("staff/settings/menu/view/list")
        ]);

        if (groupRes.success && groupRes.data) {
            setGroupList(groupRes.data);
        }

        if (menuRes.success && menuRes.data) {
            setPermissionList(menuRes.data);
        }

        setIsLoading(false);

        if (group_id !== '') {
            await populatePermission(group_id);
        }
    };

    const handleGroupChange = async (e) => {
        const value = e.target.value;
        setCreateItem({ ...createItem, group_id: value });
        await populatePermission(value);
    };

    const populatePermission = async (group_id) => {
        let rows = [];
        if (group_id !== '') {
            const { success, data: group_permission } = await api.get(`staff/settings/group/permission/${group_id}`);

            if (success && group_permission) {
                permissionList.forEach((item, index) => {
                    let inserted_by = '';
                    let inserted_date = '';
                    let editBtn = (
                        <button className="btn btn-sm btn-success" onClick={() => onHandleMemberBtn(item.SubSubMenuID, group_id, 'add', '')}>
                            <i className="fa fa-check" />
                        </button>
                    );
                    let deleteBtn = null;

                    const check = group_permission.filter(i => i.SubSubMenuID === item.SubSubMenuID);

                    if (check.length > 0) {
                        inserted_by = check[0].InsertedBy;
                        inserted_date = formatDateAndTime(check[0].InsertedDate, 'date');
                        editBtn = null;
                        deleteBtn = (
                            <button className="btn btn-sm btn-danger" onClick={() => onHandleMemberBtn(item.SubSubMenuID, group_id, 'remove', check[0].EntryID)}>
                                <i className="fa fa-trash" />
                            </button>
                        );
                    }

                    const menuSubMenu = (
                        <div>
                            <div>{item.MenuName}</div>
                            <div className="text-muted small">{item.SubMenuName}</div>
                        </div>
                    );

                    const updatedByDate = (
                        <div>
                            <div>{inserted_by}</div>
                            <div className="text-muted small">{inserted_date}</div>
                        </div>
                    );

                    const visibility = item.Visibility === 1 ? "show" : "hide";

                    rows.push([
                        (index + 1),
                        item.SubSubMenuName,
                        menuSubMenu,
                        visibility,
                        item.SubSubMenuLink || '-',
                        updatedByDate,
                        editBtn,
                        deleteBtn
                    ]);
                });
            }
        }
        setData(rows);
    };

    const onHandleMemberBtn = async (sub_sub_menu_id, group_id, type, perm_id) => {
        createItem.group_id = group_id;
        const sendData = {
            group_id: group_id,
            sub_sub_menu_id: sub_sub_menu_id,
            inserted_by: createItem.inserted_by
        };

        if (type === 'add') {
            const { success, data } = await api.post("staff/settings/group/permission/add", sendData);
            if (success && data?.message === 'success') {
                toast.success("Permission Added Successfully");
                getRecords(group_id);
            } else if (success && data?.message === 'exist') {
                toast.info("Permission Already Exist");
            } else if (success) {
                toast.error("Something went wrong. Please try again!");
            }
        } else {
            const { success, data } = await api.delete(`staff/settings/group/permission/delete/${perm_id}`);
            if (success && data?.message === 'success') {
                toast.success("Permission Removed Successfully");
                getRecords(group_id);
            } else if (success) {
                toast.error("Something went wrong. Please try again!");
            }
        }
    };

    useEffect(() => {
        getRecords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body p-0 w-100">
                        <div className="d-flex pb-5" data-kt-customer-table-toolbar="base">
                            <SearchSelect
                                id="select_group_name"
                                value={groupOptions.find(opt => opt.value === createItem.group_id) || null}
                                options={groupOptions}
                                onChange={(selected) => handleGroupChange({ target: { value: selected?.value || '' } })}
                                placeholder="Select Group"
                                isClearable={false}
                            />
                        </div>
                        <ReportTable title={`Permission Page`} columns={column} data={data} height={"800px"} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(PermissionPermission);