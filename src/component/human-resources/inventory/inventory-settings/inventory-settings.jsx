import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";

function InventorySettings(props) {

    const [isLoading, setIsLoading] = useState(true);
    const [categoryList, setCategoryList] = useState([]);
    const [manufacturerList, setManufacturerList] = useState([]);
    const [vendorList, setVendorList] = useState([]);
    const [subCategoryList, setSubCategoryList] = useState([]);
    const [manufacturerDatatable, setManufacturerDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Action",
                field: "action",
            },
            {
                label: "Manufacturer Name",
                field: "manufacturer_name",
            },
            {
                label: "Address",
                field: "address",
            },
            {
                label: "Phone Number",
                field: "phone_number",
            },
            {
                label: "Email Address",
                field: "email_address",
            },
            {
                label: "Description",
                field: "description",
            },
            {
                label: "Added By",
                field: "updated_by",
            },
        ],
        rows: [],
    });
    const [manufacturerFormData, setManufacturerFormData] = useState({
        manufacturer_name: "",
        description: "",
        address: "",
        phone_number: "",
        email_address: "",
        submitted_by: props.loginData[0].StaffID,
        manufacturer_id: "",
    });

    const [vendorDatatable, setVendorDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Action",
                field: "action",
            },
            {
                label: "Vendor Name",
                field: "vendor_name",
            },
            {
                label: "Email Address",
                field: "email_address",
            },
            {
                label: "Phone Number",
                field: "phone_number",
            },
            {
                label: "Address",
                field: "address",
            },
            {
                label: "Description",
                field: "description",
            },
            {
                label: "Added By",
                field: "updated_by",
            },
        ],
        rows: [],
    });
    const [vendorFormData, setVendorFormData] = useState({
        vendor_name: "",
        email_address: "",
        phone_number: "",
        address: "",
        description: "",
        submitted_by: props.loginData[0].StaffID,
        vendor_id: "",
    });

    const [categoryDatatable, setCategoryDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Action",
                field: "action",
            },
            {
                label: "Category Name",
                field: "category_name",
            },
            {
                label: "Description",
                field: "description",
            },
            {
                label: "Added By",
                field: "submitted_by",
            },
        ],
        rows: [],
    });
    const [categoryFormData, setCategoryFormData] = useState({
        category_name: "",
        description: "",
        submitted_by: props.loginData[0].StaffID,
        category_id: "",
    });

    const [subCategoryDatatable, setSubCategoryDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Action",
                field: "action",
            },
            {
                label: "Category Name",
                field: "category_name",
            },
            {
                label: "SubCategory Name",
                field: "sub_category_name",
            },
            {
                label: "Description",
                field: "description",
            },
            {
                label: "Added By",
                field: "inserted_by",
            },
        ],
        rows: [],
    });
    const [subCategoryFormData, setSubCategoryFormData] = useState({
        category_id: "",
        sub_category_name: "",
        description: "",
        submitted_by: props.loginData[0].StaffID,
        sub_category_id: "",
    });

    const [locationDatatable, setLocationDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Action",
                field: "action",
            },
            {
                label: "Location Name",
                field: "location_name",
            },
            {
                label: "Description",
                field: "description",
            },
            {
                label: "Inserted By",
                field: "updated_by",
            },
        ],
        rows: [],
    });
    const [locationFormData, setLocationFormData] = useState({
        location_name: "",
        description: "",
        location_id: "",
        submitted_by: `${props.loginData[0].StaffID}`,
    });

    const [itemDatatable, setItemDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Action",
                field: "action",
            },
            {
                label: "Item Name",
                field: "item_name",
            },
            {
                label: "Manufacturer Name",
                field: "manufacturer_name",
            },
            {
                label: "Vendor Name",
                field: "vendor_name",
            },
            {
                label: "Category Name",
                field: "category_name",
            },
            {
                label: "SubCategory Name",
                field: "sub_category_name",
            },
            {
                label: "Quantity Available",
                field: "quantity_available",
            },
        ],
        rows: [],
    });
    const [itemFormData, setItemFormData] = useState({
        item_name: "",
        manufacturer_id: "",
        vendor_id: "",
        category_id: "",
        sub_category_id: "",
        quantity_available: "",
        item_id: "",
        submitted_by: `${props.loginData[0].StaffID}`,
    });


    const getRecords = async () => {
        try {
            const { success, data } = await api.get("staff/inventory/manufacturer/list");
            if (success && data.length > 0) {
                setManufacturerList(data)
                let rows = [];
                data.map((item, index) => {
                    rows.push({
                        ...item,
                        sn: index + 1,
                        manufacturer_name: item.manufacturer_name,
                        description: item.description,
                        address: item.address,
                        phone_number: item.phone_number,
                        email_address: item.email_address,
                        submitted_by: item.submitted_by,
                        manufacturer_id: item.manufacturer_id,
                        action: (
                            <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_general"
                                onClick={() =>
                                    setManufacturerFormData({
                                        manufacturer_name: item.manufacturer_name,
                                        description: item.description,
                                        address: item.address,
                                        phone_number: item.phone_number,
                                        email_address: item.email_address,
                                        submitted_by: item.submitted_by,
                                        manufacturer_id: item.manufacturer_id,
                                    })
                                }
                            >
                                <i className="fa fa-pen" />
                            </button>
                        ),
                    });
                });
                setManufacturerDatatable({
                    ...manufacturerDatatable,
                    columns: manufacturerDatatable.columns,
                    rows: rows,
                });
            }
            setIsLoading(false);
        } catch (err) {
            console.log("NETWORK ERROR");
        }

        try {
            const { success, data } = await api.get("staff/inventory/vendor/list");
            if (success && data.length > 0) {
                setVendorList(data)
                let rows = [];
                data.map((item, index) => {
                    rows.push({
                        ...item,
                        sn: index + 1,
                        vendor_name: item.vendor_name,
                        email_address: item.email_address,
                        phone_number: item.phone_number,
                        address: item.address,
                        description: item.description,
                        submitted_by: item.submitted_by,
                        vendor_id: item.vendor_id,
                        action: (
                            <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#vendor"
                                onClick={() =>
                                    setVendorFormData({
                                        vendor_name: item.vendor_name,
                                        email_address: item.email_address,
                                        phone_number: item.phone_number,
                                        address: item.address,
                                        description: item.description,
                                        submitted_by: item.submitted_by,
                                        vendor_id: item.vendor_id,
                                    })
                                }
                            >
                                <i className="fa fa-pen" />
                            </button>
                        ),
                    });
                });
                setVendorDatatable({
                    ...vendorDatatable,
                    columns: vendorDatatable.columns,
                    rows: rows,
                });
            }
        } catch (err) {
            console.log("NETWORK ERROR STATE");
        }

        try {
            const { success, data } = await api.get("staff/inventory/category/list");
            if (success && data.length > 0) {
                setCategoryList(data)
                let rows = [];
                data.map((item, index) => {
                    rows.push({
                        ...item,
                        sn: index + 1,
                        category_name: item.category_name,
                        description: item.description,
                        submitted_by: item.submitted_by,
                        category_id: item.category_id,
                        action: (
                            <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#category"
                                onClick={() =>
                                    setCategoryFormData({
                                        category_name: item.category_name,
                                        description: item.description,
                                        submitted_by: item.submitted_by,
                                        category_id: item.category_id,
                                    })
                                }
                            >
                                <i className="fa fa-pen" />
                            </button>
                        ),
                    });
                });
                setCategoryDatatable({
                    ...categoryDatatable,
                    columns: categoryDatatable.columns,
                    rows: rows,
                });
            }
        } catch (err) {
            console.log("NETWORK ERROR STATE");
        }

        try {
            const { success, data } = await api.get("staff/inventory/sub_category/list");
            if (success && data.length > 0) {
                setSubCategoryList(data)
                let rows = [];
                data.map((item, index) => {
                    rows.push({
                        ...item,
                        sn: index + 1,
                        category_id: item.category_id,
                        category_name: item.category_name,
                        sub_category_name: item.sub_category_name,
                        description: item.description,
                        submitted_by: item.submitted_by,
                        sub_category_id: item.sub_category_id,
                        action: (
                            <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#sub_category"
                                onClick={() =>
                                    setSubCategoryFormData({
                                        category_id: item.category_id,
                                        sub_category_name: item.sub_category_name,
                                        description: item.description,
                                        submitted_by: item.submitted_by,
                                        sub_category_id: item.sub_category_id,
                                    })
                                }
                            >
                                <i className="fa fa-pen" />
                            </button>
                        ),
                    });
                });
                setSubCategoryDatatable({
                    ...subCategoryDatatable,
                    columns: subCategoryDatatable.columns,
                    rows: rows,
                });
            }
        } catch (err) {
            console.log("NETWORK ERROR STATE");
        }

        try {
            const { success, data } = await api.get("staff/inventory/location/list");
            if (success && data.length > 0) {
                let rows = [];
                data.map((item, index) => {
                    rows.push({
                        ...item,
                        sn: index + 1,
                        location_name: item.location_name,
                        description: item.description,
                        submitted_by: item.submitted_by,
                        location_id: item.location_id,
                        action: (
                            <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#location"
                                onClick={() =>
                                    setLocationFormData({
                                        location_name: item.location_name,
                                        description: item.description,
                                        submitted_by: item.submitted_by,
                                        location_id: item.location_id,
                                    })
                                }
                            >
                                <i className="fa fa-pen" />
                            </button>
                        ),
                    });
                });
                setLocationDatatable({
                    ...locationDatatable,
                    columns: locationDatatable.columns,
                    rows: rows,
                });
            }
        } catch (err) {
            console.log("NETWORK ERROR STATE");
        }

        try {
            const { success, data } = await api.get("staff/inventory/item/list");
            if (success && data.length > 0) {
                let rows = [];
                data.map((item, index) => {
                    rows.push({
                        ...item,
                        sn: index + 1,
                        item_name: item.item_name,
                        manufacturer_name: item.manufacturer_name,
                        vendor_name: item.vendor_name,
                        category_name: item.category_name,
                        sub_category_name: item.sub_category_name,
                        quantity_available: item.quantity_available,
                        submitted_by: item.submitted_by,
                        item_id: item.item_id,
                        manufacturer_id: item.manufacturer_id,
                        vendor_id: item.vendor_id,
                        category_id: item.category_id,
                        sub_category_id: item.sub_category_id,
                        action: (
                            <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#item"
                                onClick={() =>
                                    setItemFormData({
                                        item_name: item.item_name,
                                        manufacturer_id: item.manufacturer_id,
                                        vendor_id: item.vendor_id,
                                        category_id: item.category_id,
                                        sub_category_id: item.sub_category_id,
                                        quantity_available: item.quantity_available,
                                        submitted_by: item.submitted_by,
                                        item_id: item.item_id,
                                    })
                                }
                            >
                                <i className="fa fa-pen" />
                            </button>
                        ),
                    });
                });
                setItemDatatable({
                    ...itemDatatable,
                    columns: itemDatatable.columns,
                    rows: rows,
                });
            }
        } catch (err) {
            console.log("NETWORK ERROR STATE");
        }
    };

    const onManufacturerEdit = (e) => {
        setManufacturerFormData({
            ...manufacturerFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onVendorEdit = (e) => {
        setVendorFormData({
            ...vendorFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onCategoryEdit = (e) => {
        setCategoryFormData({
            ...categoryFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onSubCategoryEdit = (e) => {
        setSubCategoryFormData({
            ...subCategoryFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onLocationEdit = (e) => {
        setLocationFormData({
            ...locationFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onItemEdit = (e) => {
        setItemFormData({
            ...itemFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmitManufacturer = async () => {
        if (manufacturerFormData.manufacturer_name.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter Manufacturer Name", "error");
            return false;
        }
        if (manufacturerFormData.address.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the Address", "error");
            return false;
        }
        if (manufacturerFormData.phone_number.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter Phone Number", "error");
            return false;
        }
        if (manufacturerFormData.email_address.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter Email Address", "error");
            return false;
        }
        if (manufacturerFormData.description.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter Description", "error");
            return false;
        }

        if (manufacturerFormData.manufacturer_id === "") {
            try {
                const { success, data } = await api.post("staff/inventory/manufacturer/add", manufacturerFormData);
                if (success && data.message === "success") {
                    toast.success("Manufacturer Data Added Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setManufacturerFormData({
                        ...manufacturerFormData,
                        manufacturer_name: "",
                        description: "",
                        address: "",
                        phone_number: "",
                        email_address: "",
                        manufacturer_id: "",
                    });
                } else if (success && data.message === "exist") {
                    showAlert("MANUFACTURER EXIST", "Manufacturer already exist!", "error");
                } else {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            } catch (error) {
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            }
        }
        else {
            try {
                const { success, data } = await api.patch("staff/inventory/manufacturer/update", manufacturerFormData);
                if (success && data.message === "success") {
                    toast.success("Manufacturer Data Updated Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setManufacturerFormData({
                        ...manufacturerFormData,
                        manufacturer_name: "",
                        description: "",
                        address: "",
                        phone_number: "",
                        email_address: "",
                        manufacturer_id: "",
                    });
                } else {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            } catch (error) {
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            }
        }
    };

    const onSubmitVendor = async () => {
        if (vendorFormData.vendor_name.trim() === "") {
            showAlert("EMPTY FIELD", "enter Vendor Name", "error");
            return false;
        }
        if (vendorFormData.email_address.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter Email Address", "error");
            return false;
        }
        if (vendorFormData.phone_number.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter Phone Number", "error");
            return false;
        }
        if (vendorFormData.address.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter Address", "error");
            return false;
        }
        if (vendorFormData.description.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter Description", "error");
            return false;
        }

        if (vendorFormData.vendor_id === "") {
            try {
                const { success, data } = await api.post("staff/inventory/vendor/add", vendorFormData);
                if (success && data.message === "success") {
                    toast.success("Vendor Data Added Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setVendorFormData({
                        ...vendorFormData,
                        vendor_name: "",
                        email_address: "",
                        phone_number: "",
                        address: "",
                        description: "",
                        vendor_id: "",
                    });
                } else if (success && data.message === "exist") {
                    showAlert("VENDOR EXIST", "Vendor already exist!", "error");
                } else {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            } catch (error) {
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            }
        }
        else {
            try {
                const { success, data } = await api.patch("staff/inventory/vendor/update", vendorFormData);
                if (success && data.message === "success") {
                    toast.success("Vendor Data Updated Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setVendorFormData({
                        ...vendorFormData,
                        vendor_name: "",
                        email_address: "",
                        phone_number: "",
                        address: "",
                        description: "",
                        vendor_id: "",
                    });
                } else {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            } catch (error) {
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            }
        }
    };

    const onSubmitCategory = async () => {
        if (categoryFormData.CategoryName.trim() === "") {
            showAlert("EMPTY FIELD", "enter Vendor Name", "error");
            return false;
        }
        if (categoryFormData.Description.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter Email Address", "error");
            return false;
        }
        if (categoryFormData.EntryID === "") {
            try {
                const { success, data } = await api.post("staff/inventory/category/add", categoryFormData);
                if (success && data.message === "success") {
                    toast.success("Category Data Added Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setCategoryFormData({
                        ...categoryFormData,
                        CategoryName: "",
                        Description: "",
                        EntryID: "",
                    });
                } else if (success && data.message === "exist") {
                    showAlert("CATEGORY EXIST", "Category already exist!", "error");
                } else {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            } catch (error) {
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            }
        }
        else {
            try {
                const { success, data } = await api.patch("staff/inventory/category/update", categoryFormData);
                if (success && data.message === "success") {
                    toast.success("Category Data Updated Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setCategoryFormData({
                        ...categoryFormData,
                        CategoryName: "",
                        Description: "",
                        EntryID: "",
                    });
                } else {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            } catch (error) {
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            }
        }
    };

    const onSubmitSubCategory = async () => {
        if (subCategoryFormData.CategoryID.toString().trim() === "") {
            showAlert("EMPTY FIELD", "enter Category Name", "error");
            return false;
        }
        if (subCategoryFormData.SubCategoryName.trim() === "") {
            showAlert("EMPTY FIELD", "enter Sub Category Name", "error");
            return false;
        }
        if (subCategoryFormData.Description.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter Description", "error");
            return false;
        }
        if (subCategoryFormData.EntryID === "") {
            try {
                const { success, data } = await api.post("staff/inventory/sub_category/add", subCategoryFormData);
                if (success && data.message === "success") {
                    toast.success("Sub Category Data Added Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setSubCategoryFormData({
                        ...subCategoryFormData,
                        CategoryID: "",
                        SubCategoryName: "",
                        Description: "",
                        EntryID: "",
                    });
                } else if (success && data.message === "exist") {
                    showAlert("SUB CATEGORY EXIST", "Sub Category already exist!", "error");
                } else {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            } catch (error) {
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            }
        }
        else {
            try {
                const { success, data } = await api.patch("staff/inventory/sub_category/update", subCategoryFormData);
                if (success && data.message === "success") {
                    toast.success("Sub Category Data Updated Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setSubCategoryFormData({
                        ...subCategoryFormData,
                        CategoryID: "",
                        SubCategoryName: "",
                        Description: "",
                        EntryID: "",
                    });
                } else {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            } catch (error) {
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            }
        }
    };

    const onSubmitLocation = async () => {
        if (locationFormData.LocationName.trim() === "") {
            showAlert("EMPTY FIELD", "enter Location Name", "error");
            return false;
        }
        if (locationFormData.Description.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter Description", "error");
            return false;
        }
        if (locationFormData.EntryID === "") {
            try {
                const { success, data } = await api.post("staff/inventory/location/add", locationFormData);
                if (success && data.message === "success") {
                    toast.success("Location Data Added Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setLocationFormData({
                        ...locationFormData,
                        LocationName: "",
                        Description: "",
                        EntryID: "",
                    });
                } else if (success && data.message === "exist") {
                    showAlert("THIS LOCATION EXIST", "Location already exist!", "error");
                } else {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            } catch (error) {
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            }
        }
        else {
            try {
                const { success, data } = await api.patch("staff/inventory/location/update", locationFormData);
                if (success && data.message === "success") {
                    toast.success("Location Data Updated Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setLocationFormData({
                        ...locationFormData,
                        LocationName: "",
                        Description: "",
                        EntryID: "",
                    });
                } else {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            } catch (error) {
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            }
        }
    };

    const onSubmitItem = async () => {
        if (itemFormData.ItemName.trim() === "") {
            showAlert("EMPTY FIELD", "enter Item Name", "error");
            return false;
        }
        if (itemFormData.ManufacturerID.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select Manufacturer", "error");
            return false;
        }
        if (itemFormData.VendorID.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select VendorID", "error");
            return false;
        }
        if (itemFormData.CategoryID.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select Category", "error");
            return false;
        }
        if (itemFormData.SubCategoryID.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select SubCategory", "error");
            return false;
        }
        if (itemFormData.EntryID === "") {
            try {
                const { success, data } = await api.post("staff/inventory/item/add", itemFormData);
                if (success && data.message === "success") {
                    toast.success("Item Data Added Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setItemFormData({
                        ...itemFormData,
                        ItemName: "",
                        ManufacturerID: "",
                        VendorID: "",
                        CategoryID: "",
                        SubCategoryID: "",
                        QuantityAvailable: "",
                        EntryID: "",
                    });
                } else if (success && data.message === "exist") {
                    showAlert("ITEM EXIST", "item already exist!", "error");
                } else {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            } catch (error) {
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            }
        }
        else {
            try {
                const { success, data } = await api.patch("staff/inventory/item/update", itemFormData);
                if (success && data.message === "success") {
                    toast.success("Item Data Updated Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setItemFormData({
                        ...itemFormData,
                        ItemName: "",
                        ManufacturerID: "",
                        VendorID: "",
                        CategoryID: "",
                        SubCategoryID: "",
                        QuantityAvailable: "",
                        EntryID: "",
                    });
                } else {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            } catch (error) {
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            }
        }
    };




    useEffect(() => {
        getRecords();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Inventory Settings"} items={["Human Resources", "Inventory", "Inventory Settings"]} />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body p-0">
                        <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-8">

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4 active" data-bs-toggle="tab" href="#manufacturer_tab">Manufacturer</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-kt-countup-tabs="true" data-bs-toggle="tab" href="#vendor_tab">Vendor</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-bs-toggle="tab" href="#category_tab">Category</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-bs-toggle="tab" href="#sub_category_tab">Sub  Category</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-bs-toggle="tab" href="#item_tab">Item</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-bs-toggle="tab" href="#location_tab">Location</a>
                            </li>

                        </ul>

                        <div className="tab-content" id="myTabContent">

                            <div className="tab-pane fade active show" id="manufacturer_tab" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() =>
                                            setManufacturerFormData({
                                                ...manufacturerFormData,
                                                manufacturer_name: "",
                                                description: "",
                                                address: "",
                                                phone_number: "",
                                                email_address: "",
                                                manufacturer_id: "",
                                            })
                                        }
                                    >
                                        Add Manufacturer
                                    </button>
                                </div>
                                <AGTable data={manufacturerDatatable} />
                            </div>
                            <div className="tab-pane fade" id="vendor_tab" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#vendor"
                                        onClick={() =>
                                            setVendorFormData({
                                                ...vendorFormData,
                                                vendor_name: "",
                                                email_address: "",
                                                phone_number: "",
                                                address: "",
                                                description: "",
                                                vendor_id: "",
                                            })
                                        }
                                    >
                                        Add Vendor
                                    </button>
                                </div>
                                <AGTable data={vendorDatatable} />
                            </div>
                            <div className="tab-pane fade" id="category_tab" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#category"
                                        onClick={() =>
                                            setCategoryFormData({
                                                ...categoryFormData,
                                                category_name: "",
                                                description: "",
                                                category_id: "",
                                            })
                                        }
                                    >
                                        Add Category
                                    </button>
                                </div>
                                <AGTable data={categoryDatatable} />
                            </div>
                            <div className="tab-pane fade" id="sub_category_tab" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#sub_category"
                                        onClick={() =>
                                            setSubCategoryFormData({
                                                ...subCategoryFormData,
                                                category_id: "",
                                                sub_category_name: "",
                                                description: "",
                                                sub_category_id: "",
                                            })
                                        }
                                    >
                                        Add Sub Category
                                    </button>
                                </div>
                                <AGTable data={subCategoryDatatable} />
                            </div>
                            <div className="tab-pane fade" id="location_tab" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#location"
                                        onClick={() =>
                                            setLocationFormData({
                                                ...locationFormData,
                                                location_name: "",
                                                description: "",
                                                location_id: "",
                                            })
                                        }
                                    >
                                        Add Location
                                    </button>
                                </div>
                                <AGTable data={locationDatatable} />
                            </div>
                            <div className="tab-pane fade" id="item_tab" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#item"
                                        onClick={() =>
                                            setItemFormData({
                                                ...itemFormData,
                                                item_name: "",
                                                manufacturer_id: "",
                                                vendor_id: "",
                                                category_id: "",
                                                sub_category_id: "",
                                                quantity_available: "",
                                                item_id: "",
                                            })
                                        }
                                    >
                                        Add Item
                                    </button>
                                </div>
                                <AGTable data={itemDatatable} />
                            </div>

                        </div>
                    </div>
                </div>

                <Modal title={"Manufacturer Form"}>
                    <div className={"row"}>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="CourseCode">Manufacturer Name</label>
                            <input
                                type="text"
                                id={"manufacturer_name"}
                                onChange={onManufacturerEdit}
                                value={manufacturerFormData.manufacturer_name}
                                className={"form-control"}
                                placeholder={"enter Manufacturer Name"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="EmailAddress">Email Address</label>
                            <input
                                type="text"
                                id={"email_address"}
                                onChange={onManufacturerEdit}
                                value={manufacturerFormData.email_address}
                                className={"form-control"}
                                placeholder={"Please enter the EmailAddress"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="PhoneNumber">Phone Number</label>
                            <input
                                type="number"
                                id={"phone_number"}
                                onChange={onManufacturerEdit}
                                value={manufacturerFormData.phone_number}
                                className={"form-control"}
                                placeholder={"Please enter Phone Number"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="Address">Address</label>
                            <input
                                type="text"
                                id={"address"}
                                onChange={onManufacturerEdit}
                                value={manufacturerFormData.address}
                                className={"form-control"}
                                placeholder={"Please enter the Address"}
                            />
                        </div>

                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="Semester">Description</label>
                            <input
                                type="text"
                                id={"description"}
                                onChange={onManufacturerEdit}
                                value={manufacturerFormData.description}
                                className={"form-control"}
                                placeholder={"Please enter Description"}
                            />
                        </div>
                    </div>

                    <div className="form-group pt-4">
                        <button onClick={onSubmitManufacturer} className="btn btn-primary w-100">
                            Submit
                        </button>
                    </div>
                </Modal>
                <Modal title={"Vendor Form"} id="vendor">
                    <div className={"row"}>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="VendorName">Vendor Name</label>
                            <input
                                type="text"
                                id={"vendor_name"}
                                onChange={onVendorEdit}
                                value={vendorFormData.vendor_name}
                                className={"form-control"}
                                placeholder={"Please enter Vendor Name"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="Amount">PhoneNumber</label>
                            <input
                                type="number"
                                id={"phone_number"}
                                onChange={onVendorEdit}
                                value={vendorFormData.phone_number}
                                className={"form-control"}
                                placeholder={"Please enter PhoneNumber"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="Amount">EmailAddress</label>
                            <input
                                type="text"
                                id={"email_address"}
                                onChange={onVendorEdit}
                                value={vendorFormData.email_address}
                                className={"form-control"}
                                placeholder={"Please enter EmailAddress"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="Address">Address</label>
                            <input
                                type="text"
                                id={"address"}
                                onChange={onVendorEdit}
                                value={vendorFormData.address}
                                className={"form-control"}
                                placeholder={"Please enter Address"}
                            />
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="Description">Description</label>
                            <input
                                type="text"
                                id={"description"}
                                onChange={onVendorEdit}
                                value={vendorFormData.description}
                                className={"form-control"}
                                placeholder={"Please enter Description"}
                            />
                        </div>
                    </div>

                    <div className="form-group pt-4">
                        <button onClick={onSubmitVendor} className="btn btn-primary w-100">
                            Submit
                        </button>
                    </div>
                </Modal>
                <Modal title={"Category Form"} id="category">
                    <div className={"row"}>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="CategoryName">Category Name</label>
                            <input
                                type="text"
                                id={"category_name"}
                                onChange={onCategoryEdit}
                                value={categoryFormData.category_name}
                                className={"form-control"}
                                placeholder={"Please enter Category Name"}
                            />
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="Description">Description</label>
                            <input
                                type="text"
                                id={"description"}
                                onChange={onCategoryEdit}
                                value={categoryFormData.description}
                                className={"form-control"}
                                placeholder={"Please enter Description"}
                            />
                        </div>
                    </div>

                    <div className="form-group pt-4">
                        <button onClick={onSubmitCategory} className="btn btn-primary w-100">
                            Submit
                        </button>
                    </div>
                </Modal>
                <Modal title={"Sub Category Form"} id="sub_category">
                    <div className={"row"}>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="CategoryName">Category Name</label>
                            <SearchSelect
                                id="category_id"
                                onChange={(selected) => onSubCategoryEdit({ target: { id: "category_id", value: selected?.value || "" } })}
                                value={
                                    categoryList.length > 0
                                        ? categoryList
                                            .map((r) => ({ label: r.category_name, value: r.category_id }))
                                            .find((r) => r.value === subCategoryFormData.category_id)
                                        : null
                                }
                                options={
                                    categoryList.length > 0
                                        ? categoryList.map((r) => ({ label: r.category_name, value: r.category_id }))
                                        : []
                                }
                                className={"form-control"}
                                placeholder={"Select Category Name"}
                            />
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="SubCategoryName">Sub Category Name</label>
                            <input
                                type="text"
                                id={"sub_category_name"}
                                onChange={onSubCategoryEdit}
                                value={subCategoryFormData.sub_category_name}
                                className={"form-control"}
                                placeholder={"Please enter Sub Category Name"}
                            />
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="Description">Description</label>
                            <input
                                type="text"
                                id={"description"}
                                onChange={onSubCategoryEdit}
                                value={subCategoryFormData.description}
                                className={"form-control"}
                                placeholder={"Please enter Description"}
                            />
                        </div>
                    </div>

                    <div className="form-group pt-4">
                        <button onClick={onSubmitSubCategory} className="btn btn-primary w-100">
                            Submit
                        </button>
                    </div>
                </Modal>
                <Modal title={"Location Form"} id="location">
                    <div className={"row"}>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="LocationName">Location Name</label>
                            <input
                                type="text"
                                id={"location_name"}
                                onChange={onLocationEdit}
                                value={locationFormData.location_name}
                                className={"form-control"}
                                placeholder={"Please enter Location Name"}
                            />
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="Description">Description</label>
                            <input
                                type="text"
                                id={"description"}
                                onChange={onLocationEdit}
                                value={locationFormData.description}
                                className={"form-control"}
                                placeholder={"Please enter Description"}
                            />
                        </div>
                    </div>

                    <div className="form-group pt-4">
                        <button onClick={onSubmitLocation} className="btn btn-primary w-100">
                            Submit
                        </button>
                    </div>
                </Modal>
                <Modal title={"Item Form"} id="item">
                    <div className={"row"}>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="ItemName">Item Name</label>
                            <input
                                type="text"
                                id={"item_name"}
                                onChange={onItemEdit}
                                value={itemFormData.item_name}
                                className={"form-control"}
                                placeholder={"Please enter Item Name"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="ManufacturerName">Manufacturer Name</label>
                            <SearchSelect
                                id="manufacturer_id"
                                onChange={(selected) => onItemEdit({ target: { id: "manufacturer_id", value: selected?.value || "" } })}
                                value={
                                    manufacturerList.length > 0
                                        ? manufacturerList
                                            .map((r) => ({ label: r.manufacturer_name, value: r.manufacturer_id }))
                                            .find((r) => r.value === itemFormData.manufacturer_id)
                                        : null
                                }
                                options={
                                    manufacturerList.length > 0
                                        ? manufacturerList.map((r) => ({ label: r.manufacturer_name, value: r.manufacturer_id }))
                                        : []
                                }
                                className={"form-control"}
                                placeholder={"Select Manufacturer"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="VendorName">Vendor Name</label>
                            <SearchSelect
                                id="vendor_id"
                                onChange={(selected) => onItemEdit({ target: { id: "vendor_id", value: selected?.value || "" } })}
                                value={
                                    vendorList.length > 0
                                        ? vendorList
                                            .map((r) => ({ label: r.vendor_name, value: r.vendor_id }))
                                            .find((r) => r.value === itemFormData.vendor_id)
                                        : null
                                }
                                options={
                                    vendorList.length > 0
                                        ? vendorList.map((r) => ({ label: r.vendor_name, value: r.vendor_id }))
                                        : []
                                }
                                className={"form-control"}
                                placeholder={"Select Vendor"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="CategoryName">Category Name</label>
                            <SearchSelect
                                id="category_id"
                                onChange={(selected) => onItemEdit({ target: { id: "category_id", value: selected?.value || "" } })}
                                value={
                                    categoryList.length > 0
                                        ? categoryList
                                            .map((r) => ({ label: r.category_name, value: r.category_id }))
                                            .find((r) => r.value === itemFormData.category_id)
                                        : null
                                }
                                options={
                                    categoryList.length > 0
                                        ? categoryList.map((r) => ({ label: r.category_name, value: r.category_id }))
                                        : []
                                }
                                className={"form-control"}
                                placeholder={"Select Category"}
                            />
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="SubCategoryID">SubCategory Name</label>
                            <SearchSelect
                                id="sub_category_id"
                                onChange={(selected) => onItemEdit({ target: { id: "sub_category_id", value: selected?.value || "" } })}
                                value={
                                    subCategoryList.length > 0
                                        ? subCategoryList
                                            .filter(sc => sc.category_id === itemFormData.category_id) // Filter by selected category if desired, but for now just map all
                                            .map((r) => ({ label: r.sub_category_name, value: r.sub_category_id }))
                                            .find((r) => r.value === itemFormData.sub_category_id)
                                        : null
                                }
                                options={
                                    subCategoryList.length > 0
                                        ? subCategoryList
                                            .filter(sc => itemFormData.category_id ? sc.category_id == itemFormData.category_id : true)
                                            .map((r) => ({ label: r.sub_category_name, value: r.sub_category_id }))
                                        : []
                                }
                                className={"form-control"}
                                placeholder={"Select SubCategory"}
                            />
                        </div>
                    </div>

                    <div className="form-group pt-4">
                        <button onClick={onSubmitItem} className="btn btn-primary w-100">
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

export default connect(mapStateToProps, null)(InventorySettings);