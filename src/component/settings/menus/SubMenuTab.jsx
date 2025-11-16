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
 * SubMenuTab Component
 *
 * Manages the sub menu items with full CRUD operations
 * - Create new sub menu items
 * - Read/Display all sub menu items in a table
 * - Update existing sub menu items
 * - Delete sub menu items with confirmation
 */
function SubMenuTab({ token, staffID }) {
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
        sub_menu_name: "",
        main_menu_id: "",
        inserted_by: staffID,
        entry_id: "",
    });

    const [mainMenuList, setMainMenuList] = useState([]);
    const [subMenuList, setSubMenuList] = useState([]);

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
     * Fetch all sub menu records from the server
     */
    const getRecords = async () => {
        try {
            const result = await axios.get(`${serverLink}staff/settings/menu/sub/list`, token);
            const data = result.data;
            setSubMenuList(data);

            if (data.length > 0) {
                const rows = data.map((item, index) => ({
                    sn: index + 1,
                    menu_name: item.MenuName,
                    sub_menu_name: item.SubMenuName,
                    inserted_by: item.InsertedBy,
                    inserted_date: formatDateAndTime(item.InsertedDate, "date"),
                    action: (
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEdit(item)}
                                title="Edit sub menu"
                            >
                                <i className="fa fa-pen" />
                            </button>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(item.SubMenuName)}
                                title="Delete sub menu"
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
            console.error("Error fetching sub menu:", err);
            toast.error("Failed to load sub menu items");
            setIsLoading(false);
        }
    };

    /**
     * Handle edit button click - populate form with sub menu data
     */
    const handleEdit = (item) => {
        setFormData({
            sub_menu_name: item.SubMenuName,
            main_menu_id: item.MainMenuID,
            entry_id: item.EntryID,
            inserted_by: staffID,
        });
        setShowForm(true);
    };

    /**
     * Handle delete button click - show confirmation and delete
     */
    const handleDelete = (subMenuName) => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover it! All sub-sub-menus would not be mapped any longer.",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    const response = await axios.post(
                        `${serverLink}staff/settings/menu/delete-menu`,
                        { menu_name: subMenuName, menu_type: 'sub_menu' },
                        token
                    );

                    if (response.data.message === "success") {
                        toast.success("Deleted Successfully");
                        getRecords();
                    } else {
                        toast.error(response.data.whatToShow || "Failed to delete sub menu");
                    }
                } catch (err) {
                    console.error("Error deleting sub menu:", err);
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
        setFormData({
            ...formData,
            [fieldName]: e.target.value,
        });
    };

    /**
     * Handle form submission (Create or Update)
     */
    const handleSubmit = async () => {
        // Validation
        if (formData.main_menu_id === "") {
            showAlert("EMPTY FIELD", "Please select the main menu", "error");
            return false;
        }
        if (formData.sub_menu_name.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the sub menu name", "error");
            return false;
        }

        try {
            if (formData.entry_id === "") {
                // Create new sub menu
                const result = await axios.post(
                    `${serverLink}staff/settings/menu/sub/add`,
                    formData,
                    token
                );

                if (result.data.message === "success") {
                    toast.success("Sub Menu Added Successfully");
                    getRecords();
                    resetForm();
                } else if (result.data.message === "exist") {
                    showAlert("SUB MENU EXIST", "Sub Menu already exists!", "error");
                } else {
                    showAlert("ERROR", "Something went wrong. Please try again!", "error");
                }
            } else {
                // Update existing sub menu
                const result = await axios.patch(
                    `${serverLink}staff/settings/menu/sub/update`,
                    formData,
                    token
                );

                if (result.data.message === "success") {
                    toast.success("Sub Menu Updated Successfully");
                    getRecords();
                    resetForm();
                } else {
                    showAlert("ERROR", "Something went wrong. Please try again!", "error");
                }
            }
        } catch (error) {
            console.error("Error saving sub menu:", error);
            showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
        }
    };

    /**
     * Reset form to initial state
     */
    const resetForm = () => {
        setFormData({
            sub_menu_name: "",
            main_menu_id: "",
            inserted_by: staffID,
            entry_id: "",
        });
        setShowForm(false);
    };

    /**
     * Toggle form visibility for adding new sub menu
     */
    const toggleAddForm = () => {
        resetForm();
        setShowForm(true);
    };

    useEffect(() => {
        getMainMenus();
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
                    Add Sub Menu
                </button>
            </div>

            {showForm && (
                <div className="card mb-5">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-8 offset-md-2">
                                <h3 className="mb-5">
                                    {formData.entry_id === "" ? "Add" : "Update"} Sub Menu
                                </h3>

                                <div className="row">
                                    <div className="col-md-12">
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

                                    <div className="col-md-12">
                                        <Input
                                            id="sub_menu_name"
                                            type="text"
                                            value={formData.sub_menu_name}
                                            onChange={handleChange}
                                            label="Sub Menu Name"
                                            placeholder="Enter the Sub Menu Name"
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

export default SubMenuTab;
