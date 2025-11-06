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

function PermissionGroup(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [groupDatatable, setGroupDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Group Name",
                field: "group_name",
            },
            {
                label: "Added By",
                field: "inserted_by",
            },
            {
                label: "Added On",
                field: "inserted_date",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [createGroup, setCreateGroup] = useState({
        group_name: "",
        inserted_by: props.loginData[0].StaffID,
        entry_id: "",
    });
    const [groupList, setGroupList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [groupMemberList, setGroupMemberList] = useState([]);
    const [groupMemberDatatable, setGroupMemberDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Staff ID",
                field: "staff_id",
            },
            {
                label: "Staff Name",
                field: "staff_name",
            },
            {
                label: "Added By",
                field: "inserted_by",
            },
            {
                label: "Added Date",
                field: "inserted_date",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [createGroupMember, setCreateGroupMember] = useState({
        group_id: "",
        staff_id: "",
        inserted_by: props.loginData[0].StaffID,
        entry_id: "",
    });

    const getRecords = async () => {
        await axios.get(`${serverLink}staff/settings/group/list`, token)
            .then((result) => {
                const data = result.data;
                setGroupList(data)
                if (data.length > 0) {
                    let rows = [];
                    data.map((item, index) => {
                        rows.push({
                            sn: index + 1,
                            group_name: item.GroupName,
                            inserted_by: item.InsertedBy,
                            inserted_date: formatDateAndTime(item.InsertedDate, 'date'),
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                        setCreateGroup({
                                            group_name: item.GroupName,
                                            inserted_by: props.loginData[0].StaffID,
                                            entry_id: item.EntryID,
                                        })
                                    }
                                >
                                    <i className="fa fa-pen" />
                                </button>
                            ),
                        });
                    });
                    setGroupDatatable({
                        ...groupDatatable,
                        columns: groupDatatable.columns,
                        rows: rows,
                    });
                }
            })
            .catch((err) => {
                console.log("NETWORK NATIONALITY ERROR");
            });

        await axios.get(`${serverLink}staff/report/staff/list/status/1`, token)
            .then((result) => {
                setStaffList(result.data)
            })
            .catch((err) => {
                console.log("NETWORK ERROR STATE");
            });

        await axios.get(`${serverLink}staff/settings/group/member/list`, token)
            .then((result) => {
                setGroupMemberList(result.data)
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR GROUP MEMBER LIST");
            });
    };

    const onGroupEdit = (e) => {
        setCreateGroup({
            ...createGroup,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmitGroup = async () => {
        if (createGroup.group_name.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the group name", "error");
            return false;
        }

        if (createGroup.entry_id === "") {
            await axios
                .post(`${serverLink}staff/settings/group/add`, createGroup, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Group Added Successfully");
                        getRecords();
                        setCreateGroup({
                            ...createGroup,
                            group_name: "",
                            entry_id: "",
                        });
                    } else if (result.data.message === "exist") {
                        showAlert("GROUP EXIST", "Group already exist!", "error");
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else {
            await axios
                .patch(`${serverLink}staff/settings/group/update`, createGroup, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Group Updated Successfully");
                        getRecords();
                        setCreateGroup({
                            ...createGroup,
                            group_name: "",
                            entry_id: "",
                        });
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };

    const populateGroupMembers = (group_id) => {
        let rows = [];
        if (group_id !== '') {
            staffList.length > 0 &&
            staffList.map((staff, index) => {
                const check = groupMemberList.filter(i => i.GroupID === parseInt(group_id) && i.StaffID === staff.StaffID);
                let inserted_by = '';
                let inserted_date = '';
                let action = (<button type="button" className="btn btn-sm btn-primary" name="group_member_checkbox" onClick={onHandleMemberBtn} data={""} staff_id={staff.StaffID}> <i className="fa fa-check"  data={""} staff_id={staff.StaffID}/> </button>);
                if (check.length > 0) {
                    inserted_by = check[0].InsertedBy;
                    inserted_date = formatDateAndTime(check[0].InsertedDate, 'date');
                    action = (<button type="button" className="btn btn-sm btn-danger" name="group_member_checkbox" onClick={onHandleMemberBtn} data={check[0].EntryID} staff_id={staff.StaffID}> <i className="fa fa-trash"  data={check[0].EntryID} staff_id={staff.StaffID} /> </button>);
                }
                rows.push({
                    sn: index+1,
                    staff_id: staff.StaffID,
                    staff_name: staff.StaffName,
                    inserted_by: inserted_by,
                    inserted_date: inserted_date,
                    action: action
                })
            })

        }
        setGroupMemberDatatable({
            ...groupMemberDatatable,
            columns: groupMemberDatatable.columns,
            rows: rows,
        });
    }

    const onSubmitGroupMember = async () => {
        if (createGroupMember.group_id === "") {
            showAlert("EMPTY FIELD", "Please select the group", "error");
            return false;
        }
        if (createGroupMember.staff_id === "") {
            showAlert("EMPTY FIELD", "Please select the staff", "error");
            return false;
        }

        if (createGroupMember.entry_id === "") {
            await axios
                .post(`${serverLink}staff/settings/group/member/add`, createGroupMember, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Group Member Added Successfully");
                        getRecords();
                        setCreateGroupMember({
                            ...createGroupMember,
                            staff_id: "",
                            entry_id: "",
                        });
                    } else if (result.data.message === "exist") {
                        showAlert("GROUP MEMBER EXIST", "Group Member already exist!", "error");
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    console.log(error)
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else {
            await axios
                .delete(`${serverLink}staff/settings/group/member/delete/${createGroupMember.entry_id}`, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.error("Group Member Removed Successfully");
                        getRecords();
                        setCreateGroupMember({
                            ...createGroupMember,
                            staff_id: "",
                            entry_id: "",
                        });
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    console.log(error)
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    }

    const onHandleMemberBtn = (e) => {
        createGroupMember.entry_id = e.target.getAttribute('data');
        createGroupMember.staff_id = e.target.getAttribute('staff_id');
        onSubmitGroupMember();
    }

    const onGroupMemberEdit = (e) => {
        const id = e.target.id;
        const name = e.target.name;
        const value = e.target.value;
        let rows = [];

        if (id === 'select_group_name') {
            createGroupMember.group_id = value
            populateGroupMembers(value)
        }

    };

    useEffect(() => {
        getRecords();
    }, []);

    useEffect(() => {
        populateGroupMembers(createGroupMember.group_id);
    }, [groupMemberList])

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Permission Group"}
                items={["Settings", "Permission", "Group"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body pt-0">
                        <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-8">

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4 active" data-bs-toggle="tab" href="#group">Group</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-kt-countup-tabs="true" data-bs-toggle="tab" href="#group_members">Group Members</a>
                            </li>

                        </ul>

                        <div className="tab-content" id="myTabContent">
                            
                            <div className="tab-pane fade active show" id="group" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() =>
                                            setCreateGroup({
                                                ...createGroup,
                                                group_name: "",
                                                entry_id: "",
                                            })
                                        }
                                    >
                                        Add Group
                                    </button>
                                </div>
                                <Table data={groupDatatable} />
                            </div>
                            
                            
                            <div className="tab-pane fade" id="group_members" role="tabpanel">
                                <div className="d-flex pb-5" data-kt-customer-table-toolbar="base">
                                    <select id="select_group_name" onChange={onGroupMemberEdit} value={createGroupMember.group_id} className="form-select w-100">
                                        <option value="">Select Group</option>
                                        {
                                            groupList.length > 0 &&
                                                groupList.map((group, index) => {
                                                    return <option key={index} value={group.EntryID}>{group.GroupName}</option>
                                                })
                                        }
                                    </select>
                                </div>

                                {
                                    groupMemberDatatable.rows.length > 0 && <Table data={groupMemberDatatable} />
                                }

                            </div>

                        </div>
                    </div>
                </div>

                <Modal title={"Group Form"}>
                    <div className="form-group">
                        <label htmlFor="group_name">Group Name</label>
                        <input
                            type="text"
                            id={"group_name"}
                            onChange={onGroupEdit}
                            value={createGroup.group_name}
                            className={"form-control"}
                            placeholder={"Enter the Group Name"}
                        />
                    </div>

                    <div className="form-group pt-2">
                        <button onClick={onSubmitGroup} className="btn btn-primary w-100">
                            Submit
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(PermissionGroup);