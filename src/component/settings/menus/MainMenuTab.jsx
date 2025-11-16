import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { formatDateAndTime } from "../../../resources/constants";
import { toast } from "react-toastify";
import { showAlert } from "../../common/sweetalert/sweetalert";
import swal from "sweetalert";
import Table from "../../common/table/table";
import Modal from "../../common/modal/modal";
import { Input } from "../../common/form";
import PageHeader from "../../common/pageheader/pageheader";

/**
 * MainMenuTab Component
 *
 * Manages the main menu items with full CRUD operations
 * - Create new main menu items
 * - Read/Display all main menu items in a table
 * - Update existing main menu items
 * - Delete main menu items with confirmation
 */
function MainMenuTab({ token, staffID }) {
    const [isLoading, setIsLoading] = useState(true);
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
                label: "Updated By",
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

    const [formData, setFormData] = useState({
        menu_name: "",
        inserted_by: staffID,
        entry_id: "",
    });

    const [menuList, setMenuList] = useState([]);

    /**
     * Fetch all main menu records from the server
     */
    const getRecords = async () => {
        try {
            const result = await axios.get(`${serverLink}staff/settings/menu/main/list`, token);
            const data = result.data;
            setMenuList(data);

            if (data.length > 0) {
                const rows = data.map((item, index) => ({
                    sn: index + 1,
                    menu_name: item.MenuName,
                    inserted_by: item.InsertedBy,
                    inserted_date: formatDateAndTime(item.InsertedDate, "date"),
                    action: (
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_main_menu"
                                onClick={() => handleEdit(item)}
                                title="Edit menu"
                            >
                                <i className="fa fa-pen" />
                            </button>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(item.MenuName)}
                                title="Delete menu"
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
            console.error("Error fetching main menu:", err);
            toast.error("Failed to load main menu items");
            setIsLoading(false);
        }
    };

    /**
     * Handle edit button click - populate form with menu data
     */
    const handleEdit = (item) => {
        setFormData({
            menu_name: item.MenuName,
            entry_id: item.EntryID,
            inserted_by: staffID,
        });
    };

    /**
     * Handle delete button click - show confirmation and delete
     */
    const handleDelete = (menuName) => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover it! All sub-menus and sub-sub-menus would not be mapped any longer.",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    const response = await axios.post(
                        `${serverLink}staff/settings/menu/delete-menu`,
                        { menu_name: menuName, menu_type: 'main_menu' },
                        token
                    );

                    if (response.data.message === "success") {
                        toast.success("Deleted Successfully");
                        getRecords();
                    } else {
                        toast.error(response.data.whatToShow || "Failed to delete menu");
                    }
                } catch (err) {
                    console.error("Error deleting menu:", err);
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
        if (formData.menu_name.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the menu name", "error");
            return false;
        }

        try {
            if (formData.entry_id === "") {
                // Create new menu
                const result = await axios.post(
                    `${serverLink}staff/settings/menu/main/add`,
                    formData,
                    token
                );

                if (result.data.message === "success") {
                    toast.success("Main Menu Added Successfully");
                    document.getElementById("closeMainMenuModal")?.click();
                    getRecords();
                    resetForm();
                } else if (result.data.message === "exist") {
                    showAlert("MENU EXIST", "Menu already exists!", "error");
                } else {
                    showAlert("ERROR", "Something went wrong. Please try again!", "error");
                }
            } else {
                // Update existing menu
                const result = await axios.patch(
                    `${serverLink}staff/settings/menu/main/update`,
                    formData,
                    token
                );

                if (result.data.message === "success") {
                    toast.success("Menu Updated Successfully");
                    document.getElementById("closeMainMenuModal")?.click();
                    getRecords();
                    resetForm();
                } else {
                    showAlert("ERROR", "Something went wrong. Please try again!", "error");
                }
            }
        } catch (error) {
            console.error("Error saving menu:", error);
            showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
        }
    };

    /**
     * Reset form to initial state
     */
    const resetForm = () => {
        setFormData({
            menu_name: "",
            inserted_by: staffID,
            entry_id: "",
        });
    };

    useEffect(() => {
        getRecords();
    }, []);

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Permission Menus"}
                items={["Settings", "Permission", "Menus"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="d-flex justify-content-end mb-4" data-kt-customer-table-toolbar="base">
                        <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#kt_modal_main_menu"
                            onClick={resetForm}
                        >
                            <i className="fa fa-plus me-2" />
                            Add Main Menu
                        </button>
                    </div>

                    <Table data={datatable} />

                    <Modal title={"Main Menu Form"} id="kt_modal_main_menu">
                        <Input
                            id="menu_name"
                            type="text"
                            value={formData.menu_name}
                            onChange={handleChange}
                            label="Menu Name"
                            placeholder="Enter the Main Menu Name"
                            required
                        />

                        <button
                            onClick={handleSubmit}
                            className="btn btn-primary w-100"
                        >
                            <i className="fa fa-check me-2" />
                            {formData.entry_id === "" ? "Add" : "Update"} Menu
                        </button>
                        <button
                            id="closeMainMenuModal"
                            type="button"
                            className="d-none"
                            data-bs-dismiss="modal"
                        />
                    </Modal>
                </div>
            </div>
        </div>
    );
}

export default MainMenuTab;
