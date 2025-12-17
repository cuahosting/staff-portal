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
import SearchSelect from "../../../common/select/SearchSelect";

function PermissionGroup(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [groupDatatable, setGroupDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Group Name", field: "group_name" },
            { label: "Added By", field: "inserted_by" },
            { label: "Added On", field: "inserted_date" },
            { label: "Action", field: "action" },
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
            { label: "S/N", field: "sn" },
            { label: "Staff ID", field: "staff_id" },
            { label: "Staff Name", field: "staff_name" },
            { label: "Added By", field: "inserted_by" },
            { label: "Added Date", field: "inserted_date" },
            { label: "Action", field: "action" },
        ],
        rows: [],
    });
    const [createGroupMember, setCreateGroupMember] = useState({
        group_id: "",
        staff_id: "",
        inserted_by: props.loginData[0].StaffID,
        entry_id: "",
    });

    const groupOptions = useMemo(() => {
        return groupList.map(group => ({
            value: group.EntryID,
            label: group.GroupName
        }));
    }, [groupList]);

    const getRecords = async () => {
        const [groupRes, staffRes, memberRes] = await Promise.all([
            api.get("staff/settings/group/list"),
            api.get("staff/report/staff/list/status/1"),
            api.get("staff/settings/group/member/list")
        ]);

        if (groupRes.success && groupRes.data) {
            setGroupList(groupRes.data);
            if (groupRes.data.length > 0) {
                const rows = groupRes.data.map((item, index) => ({
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
                }));
                setGroupDatatable({ ...groupDatatable, rows });
            }
        }

        if (staffRes.success && staffRes.data) {
            setStaffList(staffRes.data);
        }

        if (memberRes.success && memberRes.data) {
            setGroupMemberList(memberRes.data);
        }

        setIsLoading(false);
    };

    const onGroupEdit = (e) => {
        setCreateGroup({ ...createGroup, [e.target.id]: e.target.value });
    };

    const onSubmitGroup = async () => {
        if (createGroup.group_name.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the group name", "error");
            return false;
        }

        if (createGroup.entry_id === "") {
            const { success, data } = await api.post("staff/settings/group/add", createGroup);
            if (success && data?.message === "success") {
                toast.success("Group Added Successfully");
                getRecords();
                setCreateGroup({ ...createGroup, group_name: "", entry_id: "" });
            } else if (success && data?.message === "exist") {
                showAlert("GROUP EXIST", "Group already exist!", "error");
            } else if (success) {
                showAlert("ERROR", "Something went wrong. Please try again!", "error");
            }
        } else {
            const { success, data } = await api.patch("staff/settings/group/update", createGroup);
            if (success && data?.message === "success") {
                toast.success("Group Updated Successfully");
                getRecords();
                setCreateGroup({ ...createGroup, group_name: "", entry_id: "" });
            } else if (success) {
                showAlert("ERROR", "Something went wrong. Please try again!", "error");
            }
        }
    };

    const populateGroupMembers = (group_id) => {
        let rows = [];
        if (group_id !== '') {
            staffList.forEach((staff, index) => {
                const check = groupMemberList.filter(i => i.GroupID === parseInt(group_id) && i.StaffID === staff.StaffID);
                let inserted_by = '';
                let inserted_date = '';
                let action = (
                    <button type="button" className="btn btn-sm btn-primary" onClick={onHandleMemberBtn} data={""} staff_id={staff.StaffID}>
                        <i className="fa fa-check" data={""} staff_id={staff.StaffID} />
                    </button>
                );
                if (check.length > 0) {
                    inserted_by = check[0].InsertedBy;
                    inserted_date = formatDateAndTime(check[0].InsertedDate, 'date');
                    action = (
                        <button type="button" className="btn btn-sm btn-danger" onClick={onHandleMemberBtn} data={check[0].EntryID} staff_id={staff.StaffID}>
                            <i className="fa fa-trash" data={check[0].EntryID} staff_id={staff.StaffID} />
                        </button>
                    );
                }
                rows.push({
                    sn: index + 1,
                    staff_id: staff.StaffID,
                    staff_name: staff.StaffName,
                    inserted_by,
                    inserted_date,
                    action
                });
            });
        }
        setGroupMemberDatatable({ ...groupMemberDatatable, rows });
    };

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
            const { success, data } = await api.post("staff/settings/group/member/add", createGroupMember);
            if (success && data?.message === "success") {
                toast.success("Group Member Added Successfully");
                getRecords();
                setCreateGroupMember({ ...createGroupMember, staff_id: "", entry_id: "" });
            } else if (success && data?.message === "exist") {
                showAlert("GROUP MEMBER EXIST", "Group Member already exist!", "error");
            } else if (success) {
                showAlert("ERROR", "Something went wrong. Please try again!", "error");
            }
        } else {
            const { success, data } = await api.delete(`staff/settings/group/member/delete/${createGroupMember.entry_id}`);
            if (success && data?.message === "success") {
                toast.error("Group Member Removed Successfully");
                getRecords();
                setCreateGroupMember({ ...createGroupMember, staff_id: "", entry_id: "" });
            } else if (success) {
                showAlert("ERROR", "Something went wrong. Please try again!", "error");
            }
        }
    };

    const onHandleMemberBtn = (e) => {
        createGroupMember.entry_id = e.target.getAttribute('data');
        createGroupMember.staff_id = e.target.getAttribute('staff_id');
        onSubmitGroupMember();
    };

    const onGroupMemberEdit = (e) => {
        const value = e.target.value;
        if (e.target.id === 'select_group_name') {
            createGroupMember.group_id = value;
            populateGroupMembers(value);
        }
    };

    useEffect(() => {
        getRecords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        populateGroupMembers(createGroupMember.group_id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupMemberList]);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Permission Group"}
                items={["Settings", "Permission", "Group"]}
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body p-0">
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
                                        onClick={() => setCreateGroup({ ...createGroup, group_name: "", entry_id: "" })}
                                    >
                                        Add Group
                                    </button>
                                </div>
                                <AGTable data={groupDatatable} />
                            </div>

                            <div className="tab-pane fade" id="group_members" role="tabpanel">
                                <div className="d-flex pb-5" data-kt-customer-table-toolbar="base">
                                    <SearchSelect
                                        id="select_group_name"
                                        value={groupOptions.find(opt => opt.value === createGroupMember.group_id) || null}
                                        options={groupOptions}
                                        onChange={(selected) => onGroupMemberEdit({ target: { id: 'select_group_name', value: selected?.value || '' } })}
                                        placeholder="Select Group"
                                        isClearable={false}
                                    />
                                </div>
                                {groupMemberDatatable.rows.length > 0 && <AGTable data={groupMemberDatatable} />}
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