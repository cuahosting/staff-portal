import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { formatDateAndTime } from "../../../resources/constants";
import { toast } from "react-toastify";
import { showAlert } from "../../common/sweetalert/sweetalert";
import swal from "sweetalert";
import Table from "../../common/table/table";
import { Input, Select } from "../../common/form";

/**
 * SubSubMenuTab Component
 *
 * Manages the sub-sub menu items with full CRUD operations
 * - Create new sub-sub menu items with visibility control
 * - Read/Display all sub-sub menu items in a table
 * - Update existing sub-sub menu items
 * - Delete sub-sub menu items with confirmation
 */
function SubSubMenuTab({ token, staffID }) {
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Menu Name",
                field: "menu_name",
            },
            {
                label: "Sub Menu Name",
                field: "sub_menu_name",
            },
            {
                label: "Sub Sub Menu Name",
                field: "sub_sub_menu_name",
            },
            {
                label: "Menu Link",
                field: "sub_sub_menu_link",
            },
            {
                label: "Visibility",
                field: "visibility",
            },
            {
                label: "Updated By",
                field: "inserted_by",
            },
            {
                label: "Updated Date",
                field: "inserted_date",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });

    const [formData, setFormData] = useState({
        sub_sub_menu_name: "",
        sub_sub_menu_link: "",
        sub_menu_id: "",
        main_menu_id: "",
        visibility: 1,
        inserted_by: staffID,
        entry_id: "",
    });

    const [mainMenuList, setMainMenuList] = useState([]);
    const [subMenuList, setSubMenuList] = useState([]);
    const [filteredSubMenuList, setFilteredSubMenuList] = useState([]);

    /**
     * Fetch all main menu items for the dropdown
     */
    const getMainMenus = async () => {
        try {
            const result = await axios.get(`${serverLink}staff/settings/menu/main/list`, token);
            setMainMenuList(result.data);
        } catch (err) {
            console.error("Error fetching main menus:", err);
        }
    };

    /**
     * Fetch all sub menu items for the dropdown
     */
    const getSubMenus = async () => {
        try {
            const result = await axios.get(`${serverLink}staff/settings/menu/sub/list`, token);
            setSubMenuList(result.data);
        } catch (err) {
            console.error("Error fetching sub menus:", err);
        }
    };

    /**
     * Fetch all sub-sub menu records from the server
     */
    const getRecords = async () => {
        try {
            const result = await axios.get(`${serverLink}staff/settings/menu/sub/sub/list`, token);
            const data = result.data;

            if (data.length > 0) {
                const rows = data.map((item, index) => ({
                    sn: index + 1,
                    menu_name: item.MenuName,
                    sub_menu_name: item.SubMenuName,
                    sub_sub_menu_name: item.SubSubMenuName,
                    sub_sub_menu_link: item.SubSubMenuLink,
                    visibility: item.Visibility === 1 ? (
                        <span className="badge badge-success">Show</span>
                    ) : (
                        <span className="badge badge-secondary">Hide</span>
                    ),
                    inserted_by: item.InsertedBy,
                    inserted_date: formatDateAndTime(item.InsertedDate, "date"),
                    action: (
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEdit(item)}
                                title="Edit sub-sub menu"
                            >
                                <i className="fa fa-pen" />
                            </button>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(item.SubSubMenuName)}
                                title="Delete sub-sub menu"
                            >
                                <i className="fa fa-trash" />
                            </button>
                        </div>
                    ),
                }));

                setDatatable({
                    ...datatable,
                    rows: rows,
                });
            }
            setIsLoading(false);
        } catch (err) {
            console.error("Error fetching sub-sub menu:", err);
            toast.error("Failed to load sub-sub menu items");
            setIsLoading(false);
        }
    };

    /**
     * Handle edit button click - populate form with sub-sub menu data
     */
    const handleEdit = (item) => {
        // Find the main menu ID from the sub menu
        const subMenuItem = subMenuList.find(sub => sub.EntryID === item.SubMenuID);
        const mainMenuId = subMenuItem ? subMenuItem.MainMenuID : "";

        // Filter sub menus for this main menu
        if (mainMenuId) {
            setFilteredSubMenuList(subMenuList.filter(sub => sub.MainMenuID === mainMenuId));
        }

        setFormData({
            sub_sub_menu_name: item.SubSubMenuName,
            sub_sub_menu_link: item.SubSubMenuLink,
            sub_menu_id: item.SubMenuID,
            main_menu_id: mainMenuId,
            visibility: item.Visibility,
            entry_id: item.EntryID,
            inserted_by: staffID,
        });
        setShowForm(true);
    };

    /**
     * Handle delete button click - show confirmation and delete
     */
    const handleDelete = (subSubMenuName) => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover it!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    const response = await axios.post(
                        `${serverLink}staff/settings/menu/delete-menu`,
                        { menu_name: subSubMenuName, menu_type: 'sub_sub_menu' },
                        token
                    );

                    if (response.data.message === "success") {
                        toast.success("Deleted Successfully");
                        getRecords();
                    } else {
                        toast.error(response.data.whatToShow || "Failed to delete sub-sub menu");
                    }
                } catch (err) {
                    console.error("Error deleting sub-sub menu:", err);
                    toast.error("NETWORK ERROR. Please try again!");
                }
            }
        });
    };

    /**
     * Handle form input changes
     */
    const handleChange = (e) => {
        // MUI TextField uses name, regular inputs use id
        const fieldName = e.target.name || e.target.id;
        const { value } = e.target;

        // If main menu changes, filter sub menus
        if (fieldName === "main_menu_id") {
            if (value !== "") {
                setFilteredSubMenuList(
                    subMenuList.filter(item => item.MainMenuID === parseInt(value))
                );
            } else {
                setFilteredSubMenuList([]);
            }
            // Reset sub menu selection when main menu changes
            setFormData({
                ...formData,
                main_menu_id: value,
                sub_menu_id: "",
            });
        } else {
            setFormData({
                ...formData,
                [fieldName]: value,
            });
        }
    };

    /**
     * Handle form submission (Create or Update)
     */
    const handleSubmit = async () => {
        // Validation
        if (formData.sub_menu_id === "") {
            showAlert("EMPTY FIELD", "Please select the sub menu name", "error");
            return false;
        }
        if (formData.sub_sub_menu_name === "") {
            showAlert("EMPTY FIELD", "Please enter the sub sub menu name", "error");
            return false;
        }
        if (formData.sub_sub_menu_link === "") {
            showAlert("EMPTY FIELD", "Please enter the sub sub menu link", "error");
            return false;
        }
        if (formData.visibility === "") {
            showAlert("EMPTY FIELD", "Please select visibility", "error");
            return false;
        }

        try {
            if (formData.entry_id === "") {
                // Create new sub-sub menu
                const result = await axios.post(
                    `${serverLink}staff/settings/menu/sub/sub/add`,
                    formData,
                    token
                );

                if (result.data.message === "success") {
                    toast.success("Sub Sub Menu Added Successfully");
                    getRecords();
                    resetForm();
                } else if (result.data.message === "exist") {
                    showAlert("SUB SUB MENU EXIST", "Sub Sub Menu already exists!", "error");
                } else {
                    showAlert("ERROR", "Something went wrong. Please try again!", "error");
                }
            } else {
                // Update existing sub-sub menu
                const result = await axios.patch(
                    `${serverLink}staff/settings/menu/sub/sub/update`,
                    formData,
                    token
                );

                if (result.data.message === "success") {
                    toast.success("Sub Sub Menu Updated Successfully");
                    getRecords();
                    resetForm();
                } else {
                    showAlert("ERROR", "Something went wrong. Please try again!", "error");
                }
            }
        } catch (error) {
            console.error("Error saving sub-sub menu:", error);
            showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
        }
    };

    /**
     * Reset form to initial state
     */
    const resetForm = () => {
        setFormData({
            sub_sub_menu_name: "",
            sub_sub_menu_link: "",
            sub_menu_id: "",
            main_menu_id: "",
            visibility: 1,
            inserted_by: staffID,
            entry_id: "",
        });
        setFilteredSubMenuList([]);
        setShowForm(false);
    };

    /**
     * Toggle form visibility for adding new sub-sub menu
     */
    const toggleAddForm = () => {
        resetForm();
        setShowForm(true);
    };

    useEffect(() => {
        getMainMenus();
        getSubMenus();
        getRecords();
    }, []);

    return (
        <div>
            <div className="d-flex justify-content-end mb-4" data-kt-customer-table-toolbar="base">
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={toggleAddForm}
                >
                    <i className="fa fa-plus me-2" />
                    Add Sub Sub Menu
                </button>
            </div>

            {showForm && (
                <div className="card mb-5">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-8 offset-md-2">
                                <h3 className="mb-5">
                                    {formData.entry_id === "" ? "Add" : "Update"} Sub Sub Menu
                                </h3>

                                <div className="row">
                                    <div className="col-md-6">
                                        <Select
                                            id="main_menu_id"
                                            value={formData.main_menu_id}
                                            onChange={handleChange}
                                            label="Select Main Menu"
                                            options={mainMenuList.map(item => ({
                                                value: item.EntryID,
                                                label: item.MenuName
                                            }))}
                                            placeholder="Select Main Menu"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <Select
                                            id="sub_menu_id"
                                            value={formData.sub_menu_id}
                                            onChange={handleChange}
                                            label="Select Sub Menu"
                                            options={filteredSubMenuList.map(item => ({
                                                value: item.EntryID,
                                                label: item.SubMenuName
                                            }))}
                                            placeholder="Select Sub Menu"
                                            required
                                            disabled={!formData.main_menu_id}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <Input
                                            id="sub_sub_menu_name"
                                            type="text"
                                            value={formData.sub_sub_menu_name}
                                            onChange={handleChange}
                                            label="Sub Sub Menu Name"
                                            placeholder="Enter the Sub Sub Menu Name"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <Input
                                            id="sub_sub_menu_link"
                                            type="text"
                                            value={formData.sub_sub_menu_link}
                                            onChange={handleChange}
                                            label="Sub Sub Menu Link"
                                            placeholder="Enter the Sub Sub Menu Link"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-12">
                                        <Select
                                            id="visibility"
                                            value={formData.visibility}
                                            onChange={handleChange}
                                            label="Visibility"
                                            options={[
                                                { value: 1, label: "Show" },
                                                { value: 0, label: "Hide" }
                                            ]}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-danger flex-fill"
                                        onClick={resetForm}
                                    >
                                        <i className="fa fa-times me-2" />
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary flex-fill"
                                        onClick={handleSubmit}
                                    >
                                        <i className="fa fa-check me-2" />
                                        {formData.entry_id === "" ? "Add" : "Update"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Table data={datatable} />
        </div>
    );
}

export default SubSubMenuTab;
