import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";

function InventorySettings(props)
{
    const token = props.loginData[0].token;

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
                field: "ManufacturerName",
            },
            {
                label: "Address",
                field: "Address",
            },
            {
                label: "Phone Number",
                field: "PhoneNumber",
            },
            {
                label: "Email Address",
                field: "EmailAddress",
            },
            {
                label: "Description",
                field: "Description",
            },
            {
                label: "Added By",
                field: "SubmittedBy",
            },
        ],
        rows: [],
    });
    const [manufacturerFormData, setManufacturerFormData] = useState({
        ManufacturerName: "",
        Description: "",
        Address: "",
        PhoneNumber: "",
        EmailAddress: "",
        SubmittedBy: props.loginData[0].StaffID,
        EntryID: "",
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
                field: "VendorName",
            },
            {
                label: "Email Address",
                field: "EmailAddress",
            },
            {
                label: "Phone Number",
                field: "PhoneNumber",
            },
            {
                label: "Address",
                field: "Address",
            },
            {
                label: "Description",
                field: "Description",
            },
            {
                label: "Added By",
                field: "SubmittedBy",
            },
        ],
        rows: [],
    });
    const [vendorFormData, setVendorFormData] = useState({
        CategoryName: "",
        EmailAddress: "",
        PhoneNumber: "",
        Address: "",
        Description: "",
        SubmittedBy: props.loginData[0].StaffID,
        EntryID: "",
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
                field: "CategoryName",
            },
            {
                label: "Description",
                field: "Description",
            },
            {
                label: "Added By",
                field: "SubmittedBy",
            },
        ],
        rows: [],
    });
    const [categoryFormData, setCategoryFormData] = useState({
        CategoryName: "",
        Description: "",
        SubmittedBy: props.loginData[0].StaffID,
        EntryID: "",
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
                field: "CategoryID",
            },
            {
                label: "SubCategory Name",
                field: "SubCategoryName",
            },
            {
                label: "Description",
                field: "Description",
            },
            {
                label: "Added By",
                field: "SubmittedBy",
            },
        ],
        rows: [],
    });
    const [subCategoryFormData, setSubCategoryFormData] = useState({
        CategoryID: "",
        SubCategoryName: "",
        Description: "",
        SubmittedBy: props.loginData[0].StaffID,
        EntryID: "",
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
                field: "LocationName",
            },
            {
                label: "Description",
                field: "Description",
            },
            {
                label: "Inserted By",
                field: "SubmittedBy",
            },
        ],
        rows: [],
    });
    const [locationFormData, setLocationFormData] = useState({
        LocationName: "",
        Description: "",
        EntryID: "",
        SubmittedBy: `${props.loginData[0].StaffID}`,
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
                field: "ItemName",
            },
            {
                label: "Manufacturer Name",
                field: "ManufacturerName",
            },
            {
                label: "VendorName",
                field: "VendorName",
            },
            {
                label: "Category Name",
                field: "CategoryName",
            },
            {
                label: "SubCategory Name",
                field: "SubCategoryName",
            },
            {
                label: "Quantity Available",
                field: "QuantityAvailable",
            },
        ],
        rows: [],
    });
    const [itemFormData, setItemFormData] = useState({
        ItemName: "",
        ManufacturerName: "",
        VendorName: "",
        CategoryName: "",
        SubCategoryName: "",
        QuantityAvailable: "",
        EntryID: "",
        SubmittedBy: `${props.loginData[0].StaffID}`,
    });


    const getRecords = async () =>
    {
        await axios.get(`${serverLink}staff/inventory/manufacturer/list`, token)
            .then((result) =>
            {
                const data = result.data;
                if (data.length > 0)
                {
                    setManufacturerList(result.data)
                    let rows = [];
                    data.map((item, index) =>
                    {
                        rows.push({
                            sn: index + 1,
                            ManufacturerName: item.ManufacturerName,
                            Description: item.Description,
                            Address: item.Address,
                            PhoneNumber: item.PhoneNumber,
                            EmailAddress: item.EmailAddress,
                            SubmittedBy: item.SubmittedBy,
                            EntryID: item.EntryID,
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                        setManufacturerFormData({
                                            ManufacturerName: item.ManufacturerName,
                                            Description: item.Description,
                                            Address: item.Address,
                                            PhoneNumber: item.PhoneNumber,
                                            EmailAddress: item.EmailAddress,
                                            SubmittedBy: item.SubmittedBy,
                                            EntryID: item.EntryID,
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
            })
            .catch((err) =>
            {
                console.log("NETWORK ERROR");
            });

        await axios.get(`${serverLink}staff/inventory/vendor/list`, token)
            .then((result) =>
            {
                const data = result.data;
                if (data.length > 0)
                {
                    setVendorList(result.data)
                    let rows = [];
                    data.map((item, index) =>
                    {
                        rows.push({
                            sn: index + 1,
                            VendorName: item.VendorName,
                            EmailAddress: item.EmailAddress,
                            PhoneNumber: item.PhoneNumber,
                            Address: item.Address,
                            Description: item.Description,
                            SubmittedBy: item.SubmittedBy,
                            EntryID: item.EntryID,
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#vendor"
                                    onClick={() =>
                                        setVendorFormData({
                                            VendorName: item.VendorName,
                                            EmailAddress: item.EmailAddress,
                                            PhoneNumber: item.PhoneNumber,
                                            Address: item.Address,
                                            Description: item.Description,
                                            SubmittedBy: item.SubmittedBy,
                                            EntryID: item.EntryID,
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
            })
            .catch((err) =>
            {
                console.log("NETWORK ERROR STATE");
            });

        await axios.get(`${serverLink}staff/inventory/category/list`, token)
            .then((result) =>
            {
                const data = result.data;
                if (data.length > 0)
                {
                    setCategoryList(result.data)
                    let rows = [];
                    data.map((item, index) =>
                    {
                        rows.push({
                            sn: index + 1,
                            CategoryName: item.CategoryName,
                            Description: item.Description,
                            SubmittedBy: item.SubmittedBy,
                            EntryID: item.EntryID,
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#category"
                                    onClick={() =>
                                        setCategoryFormData({
                                            CategoryName: item.CategoryName,
                                            Description: item.Description,
                                            SubmittedBy: item.SubmittedBy,
                                            EntryID: item.EntryID,
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
            })
            .catch((err) =>
            {
                console.log("NETWORK ERROR STATE");
            });

        await axios.get(`${serverLink}staff/inventory/sub_category/list`, token)
            .then((result) =>
            {
                const data = result.data;
                if (data.length > 0)
                {
                    setSubCategoryList(result.data)
                    let rows = [];
                    data.map((item, index) =>
                    {
                        rows.push({
                            sn: index + 1,
                            CategoryID: item.CategoryID,
                            SubCategoryName: item.SubCategoryName,
                            Description: item.Description,
                            SubmittedBy: item.SubmittedBy,
                            EntryID: item.EntryID,
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#sub_category"
                                    onClick={() =>
                                        setSubCategoryFormData({
                                            CategoryID: item.CategoryID,
                                            SubCategoryName: item.SubCategoryName,
                                            Description: item.Description,
                                            SubmittedBy: item.SubmittedBy,
                                            EntryID: item.EntryID,
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
            })
            .catch((err) =>
            {
                console.log("NETWORK ERROR STATE");
            });

        await axios.get(`${serverLink}staff/inventory/location/list`, token)
            .then((result) =>
            {
                const data = result.data;
                if (data.length > 0)
                {
                    let rows = [];
                    data.map((item, index) =>
                    {
                        rows.push({
                            sn: index + 1,
                            LocationName: item.LocationName,
                            Description: item.Description,
                            SubmittedBy: item.SubmittedBy,
                            EntryID: item.EntryID,
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#location"
                                    onClick={() =>
                                        setLocationFormData({
                                            LocationName: item.LocationName,
                                            Description: item.Description,
                                            SubmittedBy: item.SubmittedBy,
                                            EntryID: item.EntryID,
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
            })
            .catch((err) =>
            {
                console.log("NETWORK ERROR STATE");
            });

        await axios.get(`${serverLink}staff/inventory/item/list`, token)
            .then((result) =>
            {
                const data = result.data;
                if (data.length > 0)
                {
                    let rows = [];
                    data.map((item, index) =>
                    {
                        rows.push({
                            sn: index + 1,
                            ItemName: item.ItemName,
                            ManufacturerName: item.ManufacturerName,
                            VendorName: item.VendorName,
                            CategoryName: item.CategoryName,
                            SubCategoryName: item.SubCategoryName,
                            QuantityAvailable: item.QuantityAvailable,
                            SubmittedBy: item.SubmittedBy,
                            EntryID: item.EntryID,
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#item"
                                    onClick={() =>
                                        setItemFormData({
                                            ItemName: item.ItemName,
                                            ManufacturerName: item.ManufacturerName,
                                            VendorName: item.VendorName,
                                            CategoryName: item.CategoryName,
                                            SubCategoryName: item.SubCategoryName,
                                            QuantityAvailable: item.QuantityAvailable,
                                            SubmittedBy: item.SubmittedBy,
                                            EntryID: item.EntryID,
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
            })
            .catch((err) =>
            {
                console.log("NETWORK ERROR STATE");
            });
    };

    const onManufacturerEdit = (e) =>
    {
        setManufacturerFormData({
            ...manufacturerFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onVendorEdit = (e) =>
    {
        setVendorFormData({
            ...vendorFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onCategoryEdit = (e) =>
    {
        setCategoryFormData({
            ...categoryFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onSubCategoryEdit = (e) =>
    {
        setSubCategoryFormData({
            ...subCategoryFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onLocationEdit = (e) =>
    {
        setLocationFormData({
            ...locationFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onItemEdit = (e) =>
    {
        setItemFormData({
            ...itemFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmitManufacturer = async () =>
    {
        if (manufacturerFormData.ManufacturerName.trim() === "")
        {
            showAlert("EMPTY FIELD", "Please enter ManufacturerName", "error");
            return false;
        }
        if (manufacturerFormData.Address.trim() === "")
        {
            showAlert("EMPTY FIELD", "Please enter the Address", "error");
            return false;
        }
        if (manufacturerFormData.PhoneNumber.trim() === "")
        {
            showAlert("EMPTY FIELD", "Please enter Phone Number", "error");
            return false;
        }
        if (manufacturerFormData.EmailAddress.trim() === "")
        {
            showAlert("EMPTY FIELD", "Please enter Email Address", "error");
            return false;
        }
        if (manufacturerFormData.Description.trim() === "")
        {
            showAlert("EMPTY FIELD", "Please enter Description", "error");
            return false;
        }

        if (manufacturerFormData.EntryID === "")
        {
            await axios
                .post(`${serverLink}staff/inventory/manufacturer/add`, manufacturerFormData, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
                        toast.success("Manufacturer Data Added Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setManufacturerFormData({
                            ...manufacturerFormData,
                            ManufacturerName: "",
                            Description: "",
                            Address: "",
                            PhoneNumber: "",
                            EmailAddress: "",
                            EntryID: "",
                        });
                    } else if (result.data.message === "exist")
                    {
                        showAlert("MANUFACTURER EXIST", "Manufacturer already exist!", "error");
                    } else
                    {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) =>
                {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else
        {
            await axios
                .patch(`${serverLink}staff/inventory/manufacturer/update`, manufacturerFormData, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
                        toast.success("Manufacturer Data Updated Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setManufacturerFormData({
                            ...manufacturerFormData,
                            ManufacturerName: "",
                            Description: "",
                            Address: "",
                            PhoneNumber: "",
                            EmailAddress: "",
                            EntryID: "",
                        });
                    } else
                    {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) =>
                {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };

    const onSubmitVendor = async () =>
    {
        if (vendorFormData.VendorName.trim() === "")
        {
            showAlert("EMPTY FIELD", "enter Vendor Name", "error");
            return false;
        }
        if (vendorFormData.EmailAddress.trim() === "")
        {
            showAlert("EMPTY FIELD", "Please enter Email Address", "error");
            return false;
        }
        if (vendorFormData.PhoneNumber.trim() === "")
        {
            showAlert("EMPTY FIELD", "Please enter Phone Number", "error");
            return false;
        }
        if (vendorFormData.Address.trim() === "")
        {
            showAlert("EMPTY FIELD", "Please enter Address", "error");
            return false;
        }
        if (vendorFormData.Description.trim() === "")
        {
            showAlert("EMPTY FIELD", "Please enter Description", "error");
            return false;
        }

        if (vendorFormData.EntryID === "")
        {
            await axios
                .post(`${serverLink}staff/inventory/vendor/add`, vendorFormData, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
                        toast.success("Vendor Data Added Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setVendorFormData({
                            ...vendorFormData,
                            VendorName: "",
                            EmailAddress: "",
                            PhoneNumber: "",
                            Address: "",
                            Description: "",
                            EntryID: "",
                        });
                    } else if (result.data.message === "exist")
                    {
                        showAlert("VENDOR EXIST", "Vendor already exist!", "error");
                    } else
                    {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) =>
                {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else
        {
            await axios
                .patch(`${serverLink}staff/inventory/vendor/update`, vendorFormData, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
                        toast.success("Vendor Data Updated Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setVendorFormData({
                            ...vendorFormData,
                            VendorName: "",
                            EmailAddress: "",
                            PhoneNumber: "",
                            Address: "",
                            Description: "",
                            EntryID: "",
                        });
                    } else
                    {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) =>
                {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };

    const onSubmitCategory = async () =>
    {
        if (categoryFormData.CategoryName.trim() === "")
        {
            showAlert("EMPTY FIELD", "enter Vendor Name", "error");
            return false;
        }
        if (categoryFormData.Description.trim() === "")
        {
            showAlert("EMPTY FIELD", "Please enter Email Address", "error");
            return false;
        }
        if (categoryFormData.EntryID === "")
        {
            await axios
                .post(`${serverLink}staff/inventory/category/add`, categoryFormData, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
                        toast.success("Category Data Added Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setCategoryFormData({
                            ...categoryFormData,
                            CategoryName: "",
                            Description: "",
                            EntryID: "",
                        });
                    } else if (result.data.message === "exist")
                    {
                        showAlert("CATEGORY EXIST", "Category already exist!", "error");
                    } else
                    {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) =>
                {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else
        {
            await axios
                .patch(`${serverLink}staff/inventory/category/update`, categoryFormData, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
                        toast.success("Category Data Updated Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setCategoryFormData({
                            ...categoryFormData,
                            CategoryName: "",
                            Description: "",
                            EntryID: "",
                        });
                    } else
                    {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) =>
                {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };

    const onSubmitSubCategory = async () =>
    {
        if (subCategoryFormData.CategoryID.toString().trim() === "")
        {
            showAlert("EMPTY FIELD", "enter Category Name", "error");
            return false;
        }
        if (subCategoryFormData.SubCategoryName.trim() === "")
        {
            showAlert("EMPTY FIELD", "enter Sub Category Name", "error");
            return false;
        }
        if (subCategoryFormData.Description.trim() === "")
        {
            showAlert("EMPTY FIELD", "Please enter Description", "error");
            return false;
        }
        if (subCategoryFormData.EntryID === "")
        {
            await axios
                .post(`${serverLink}staff/inventory/sub_category/add`, subCategoryFormData, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
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
                    } else if (result.data.message === "exist")
                    {
                        showAlert("SUB CATEGORY EXIST", "Sub Category already exist!", "error");
                    } else
                    {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) =>
                {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else
        {
            await axios
                .patch(`${serverLink}staff/inventory/sub_category/update`, subCategoryFormData, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
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
                    } else
                    {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) =>
                {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };

    const onSubmitLocation = async () =>
    {
        if (locationFormData.LocationName.trim() === "")
        {
            showAlert("EMPTY FIELD", "enter Location Name", "error");
            return false;
        }
        if (locationFormData.Description.trim() === "")
        {
            showAlert("EMPTY FIELD", "Please enter Description", "error");
            return false;
        }
        if (locationFormData.EntryID === "")
        {
            await axios
                .post(`${serverLink}staff/inventory/location/add`, locationFormData, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
                        toast.success("Location Data Added Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setLocationFormData({
                            ...locationFormData,
                            LocationName: "",
                            Description: "",
                            EntryID: "",
                        });
                    } else if (result.data.message === "exist")
                    {
                        showAlert("THIS LOCATION EXIST", "Location already exist!", "error");
                    } else
                    {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) =>
                {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else
        {
            await axios
                .patch(`${serverLink}staff/inventory/location/update`, locationFormData, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
                        toast.success("Location Data Updated Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setLocationFormData({
                            ...locationFormData,
                            LocationName: "",
                            Description: "",
                            EntryID: "",
                        });
                    } else
                    {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) =>
                {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };

    const onSubmitItem = async () =>
    {
        if (itemFormData.ItemName.trim() === "")
        {
            showAlert("EMPTY FIELD", "enter Item Name", "error");
            return false;
        }
        if (itemFormData.ManufacturerID.toString().trim() === "")
        {
            showAlert("EMPTY FIELD", "Please select Manufacturer", "error");
            return false;
        }
        if (itemFormData.VendorID.toString().trim() === "")
        {
            showAlert("EMPTY FIELD", "Please select VendorID", "error");
            return false;
        }
        if (itemFormData.CategoryID.toString().trim() === "")
        {
            showAlert("EMPTY FIELD", "Please select Category", "error");
            return false;
        }
        if (itemFormData.SubCategoryID.toString().trim() === "")
        {
            showAlert("EMPTY FIELD", "Please select SubCategory", "error");
            return false;
        }
        if (itemFormData.EntryID === "")
        {
            await axios
                .post(`${serverLink}staff/inventory/item/add`, itemFormData, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
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
                    } else if (result.data.message === "exist")
                    {
                        showAlert("ITEM EXIST", "item already exist!", "error");
                    } else
                    {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) =>
                {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else
        {
            await axios
                .patch(`${serverLink}staff/inventory/item/update`, itemFormData, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
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
                    } else
                    {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) =>
                {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };




    useEffect(() =>
    {
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
                                                ManufacturerName: "",
                                                Description: "",
                                                Address: "",
                                                PhoneNumber: "",
                                                EmailAddress: "",
                                                EntryID: "",
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
                                                VendorName: "",
                                                EmailAddress: "",
                                                PhoneNumber: "",
                                                Address: "",
                                                Description: "",
                                                EntryID: "",
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
                                                CategoryName: "",
                                                Description: "",
                                                EntryID: "",
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
                                                CategoryID: "",
                                                SubCategoryName: "",
                                                Description: "",
                                                EntryID: "",
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
                                                LocationName: "",
                                                Description: "",
                                                EntryID: "",
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
                                                ItemName: "",
                                                ManufacturerID: "",
                                                VendorID: "",
                                                CategoryID: "",
                                                SubCategoryID: "",
                                                QuantityAvailable: "",
                                                EntryID: "",
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
                                id={"ManufacturerName"}
                                onChange={onManufacturerEdit}
                                value={manufacturerFormData.ManufacturerName}
                                className={"form-control"}
                                placeholder={"enter Manufacturer Name"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="EmailAddress">Email Address</label>
                            <input
                                type="text"
                                id={"EmailAddress"}
                                onChange={onManufacturerEdit}
                                value={manufacturerFormData.EmailAddress}
                                className={"form-control"}
                                placeholder={"Please enter the EmailAddress"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="PhoneNumber">Phone Number</label>
                            <input
                                type="number"
                                id={"PhoneNumber"}
                                onChange={onManufacturerEdit}
                                value={manufacturerFormData.PhoneNumber}
                                className={"form-control"}
                                placeholder={"Please enter Phone Number"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="Address">Address</label>
                            <input
                                type="text"
                                id={"Address"}
                                onChange={onManufacturerEdit}
                                value={manufacturerFormData.Address}
                                className={"form-control"}
                                placeholder={"Please enter the Address"}
                            />
                        </div>

                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="Semester">Description</label>
                            <input
                                type="text"
                                id={"Description"}
                                onChange={onManufacturerEdit}
                                value={manufacturerFormData.Description}
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
                                id={"VendorName"}
                                onChange={onVendorEdit}
                                value={vendorFormData.VendorName}
                                className={"form-control"}
                                placeholder={"Please enter Vendor Name"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="Amount">PhoneNumber</label>
                            <input
                                type="number"
                                id={"PhoneNumber"}
                                onChange={onVendorEdit}
                                value={vendorFormData.PhoneNumber}
                                className={"form-control"}
                                placeholder={"Please enter PhoneNumber"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="Amount">EmailAddress</label>
                            <input
                                type="text"
                                id={"EmailAddress"}
                                onChange={onVendorEdit}
                                value={vendorFormData.EmailAddress}
                                className={"form-control"}
                                placeholder={"Please enter EmailAddress"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="Address">Address</label>
                            <input
                                type="text"
                                id={"Address"}
                                onChange={onVendorEdit}
                                value={vendorFormData.Address}
                                className={"form-control"}
                                placeholder={"Please enter Address"}
                            />
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="Description">Description</label>
                            <input
                                type="text"
                                id={"Description"}
                                onChange={onVendorEdit}
                                value={vendorFormData.Description}
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
                                id={"CategoryName"}
                                onChange={onCategoryEdit}
                                value={categoryFormData.CategoryName}
                                className={"form-control"}
                                placeholder={"Please enter Category Name"}
                            />
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="Description">Description</label>
                            <input
                                type="text"
                                id={"Description"}
                                onChange={onCategoryEdit}
                                value={categoryFormData.Description}
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
                            <select
                                id={"CategoryID"}
                                onChange={onSubCategoryEdit}
                                value={subCategoryFormData.CategoryID}
                                className={"form-control"}
                            >
                                <option>Select Category Name</option>
                                {
                                    categoryList.length > 0 && categoryList.map((category, index) =>
                                    {
                                        return <option key={index} value={category.EntryID}>{category.CategoryName}</option>
                                    })
                                }

                            </select>
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="SubCategoryName">Sub Category Name</label>
                            <input
                                type="text"
                                id={"SubCategoryName"}
                                onChange={onSubCategoryEdit}
                                value={subCategoryFormData.SubCategoryName}
                                className={"form-control"}
                                placeholder={"Please enter Sub Category Name"}
                            />
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="Description">Description</label>
                            <input
                                type="text"
                                id={"Description"}
                                onChange={onSubCategoryEdit}
                                value={subCategoryFormData.Description}
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
                                id={"LocationName"}
                                onChange={onLocationEdit}
                                value={locationFormData.LocationName}
                                className={"form-control"}
                                placeholder={"Please enter Location Name"}
                            />
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="Description">Description</label>
                            <input
                                type="text"
                                id={"Description"}
                                onChange={onLocationEdit}
                                value={locationFormData.Description}
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
                                id={"ItemName"}
                                onChange={onItemEdit}
                                value={itemFormData.ItemName}
                                className={"form-control"}
                                placeholder={"Please enter Item Name"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="ManufacturerName">Manufacturer Name</label>
                            <select
                                id={"ManufacturerName"}
                                onChange={onItemEdit}
                                value={itemFormData.ManufacturerName}
                                className={"form-control"}
                            >
                                <option>Select Category Name</option>
                                {
                                    manufacturerList.length > 0 && manufacturerList.map((manufacturer, index) =>
                                    {
                                        return <option key={index} value={manufacturer.EntryID}>{manufacturer.ManufacturerName}</option>
                                    })
                                }

                            </select>
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="VendorName">Vendor Name</label>
                            <select
                                id={"VendorName"}
                                onChange={onItemEdit}
                                value={itemFormData.VendorName}
                                className={"form-control"}
                            >
                                <option>Select Vendor Name</option>
                                {
                                    vendorList.length > 0 && vendorList.map((vendor, index) =>
                                    {
                                        return <option key={index} value={vendor.EntryID}>{vendor.VendorName}</option>
                                    })
                                }

                            </select>
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="CategoryName">Category Name</label>
                            <select
                                id={"CategoryName"}
                                onChange={onItemEdit}
                                value={itemFormData.CategoryName}
                                className={"form-control"}
                            >
                                <option>Select Category Name</option>
                                {
                                    categoryList.length > 0 && categoryList.map((category, index) =>
                                    {
                                        return <option key={index} value={category.EntryID}>{category.CategoryName}</option>
                                    })
                                }

                            </select>
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="SubCategoryID">SubCategory Name</label>
                            <select
                                id={"SubCategoryName"}
                                onChange={onItemEdit}
                                value={itemFormData.SubCategoryName}
                                className={"form-control"}
                            >
                                <option>Select SubCategory Name</option>
                                {
                                    subCategoryList.length > 0 && subCategoryList.map((subCategory, index) =>
                                    {
                                        return <option key={index} value={subCategory.EntryID}>{subCategory.SubCategoryName}</option>
                                    })
                                }

                            </select>
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
const mapStateToProps = (state) =>
{
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(InventorySettings);