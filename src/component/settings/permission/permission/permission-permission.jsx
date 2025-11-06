import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import Table from "../../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import {formatDateAndTime} from "../../../../resources/constants";
import {connect} from "react-redux";
import ReportTable from "../../../common/table/report_table";

function PermissionPermission(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const column = ["S/N", "Menu Name", "Sub Menu Name", "Page Name", "Added By", "Added On", "Action"];
    const [data, setData] = useState([]);
    const [createItem, setCreateItem] = useState({
        group_id: "",
        inserted_by: props.loginData[0].StaffID,
        entry_id: "",
    });
    const [permissionList, setPermissionList] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [groupPermission, setGroupPermission] = useState([]);

    const getRecords = async (group_id = '') => {
        await axios.get(`${serverLink}staff/settings/group/list`, token)
            .then((result) => {
                setGroupList(result.data)
            })
            .catch((err) => {
                console.log("NETWORK NATIONALITY ERROR");
            });

        await axios.get(`${serverLink}staff/settings/menu/view/list`, token)
            .then((result) => {
                setPermissionList(result.data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK NATIONALITY ERROR");
            });

        if (group_id !== '') {
            await populatePermission(group_id);
        }
    };

    const handleGroupChange = async (e) => {
        const value = e.target.value;
        setCreateItem({
            ...createItem,
            group_id: value
        });

        await populatePermission(value)
    }

    const populatePermission = async (group_id) => {
        let rows = [];
        if (group_id !== '') {
            await axios.get(`${serverLink}staff/settings/group/permission/${group_id}`, token)
                .then((result) => {
                    const group_permission = result.data;
                    permissionList.length > 0 &&
                    permissionList.map((item, index) => {
                        let inserted_by = '';
                        let inserted_date = '';
                        let action = (<button className="btn btn-sm btn-success" onClick={() => onHandleMemberBtn(item.SubSubMenuID, group_id, 'add', '')} ><i className="fa fa-check" /></button>);

                        const check = group_permission.filter(i => i.SubSubMenuID === item.SubSubMenuID);

                        if (check.length > 0) {
                            inserted_by = check[0].InsertedBy;
                            inserted_date = formatDateAndTime(check[0].InsertedDate, 'date');
                            action = (<button className="btn btn-sm btn-danger" onClick={() => onHandleMemberBtn(item.SubSubMenuID, group_id, 'remove', check[0].EntryID)} ><i className="fa fa-trash" /></button>);
                        }
                        rows.push([(index+1), item.MenuName, item.SubMenuName, item.SubSubMenuName, inserted_by, inserted_date, action])
                    })
                    setData(rows);
                })
                .catch((err) => {
                    console.log("NETWORK NATIONALITY ERROR");
                });
        } else {
            setData(rows);
        }
    }

    const onHandleMemberBtn = async (sub_sub_menu_id, group_id, type, perm_id) => {
        createItem.group_id = group_id;
        const sendData = {
            group_id: group_id,
            sub_sub_menu_id: sub_sub_menu_id,
            inserted_by: createItem.inserted_by
        }

        if (type === 'add') {
            await axios.post(`${serverLink}staff/settings/group/permission/add`, sendData, token)
                .then(result => {
                    const message = result.data.message;
                    if (message === 'success') {
                        toast.success("Permission Added Successfully")
                        getRecords(group_id);
                    } else if (message === 'exist') {
                        toast.info("Permission Already Exist")
                    } else {
                        toast.error("Something went wrong. Please try again!")
                    }
                })
                .catch(error => {
                    toast.success("Network error. Please check your connection and try again!")
                })
        } else {
            await axios.delete(`${serverLink}staff/settings/group/permission/delete/${perm_id}`, token)
                .then(result => {
                    const message = result.data.message;
                    if (message === 'success') {
                        toast.success("Permission Removed Successfully")
                        getRecords(group_id);
                    } else {
                        toast.error("Something went wrong. Please try again!")
                    }
                })
                .catch(error => {
                    toast.success("Network error. Please check your connection and try again!")
                })
        }
    }

    useEffect(() => {
        getRecords();
    }, []);

    // useEffect(() => {
    //     populateGroupMembers(createGroupMember.group_id);
    // }, [groupMemberList])

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body pt-0 w-100">
                        <div className="d-flex pb-5" data-kt-customer-table-toolbar="base">
                            <select id="select_group_name" onChange={handleGroupChange} value={createItem.group_id} className="form-select w-100">
                                <option value="">Select Group</option>
                                {
                                    groupList.length > 0 &&
                                    groupList.map((group, index) => {
                                        return <option key={index} value={group.EntryID}>{group.GroupName}</option>
                                    })
                                }
                            </select>
                        </div>

                        <ReportTable title={`Permission Page`} columns={column} data={data} height={"800px"}/>
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