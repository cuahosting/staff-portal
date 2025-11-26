import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import Table from "../../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import InventoryForm from "./inventory-form";
import {Link} from "react-router-dom";
function InventoryDashboard(props) {
    const token = props.loginData[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState("off");
    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Item Name",
                field: "ItemName",
            },
            {
                label: "Manufacturer",
                field: "ManufacturerName",
            },
            {
                label: "Vendor",
                field: "VendorName",
            },
            {
                label: "Category",
                field: "CategoryName",
            },
            {
                label: "Sub Category",
                field: "SubCategoryName",
            },
            {
                label: "Quantity",
                field: "QuantityAvailable",
            },
            {
                label: "Receive",
                field: "Receive",
            },
            {
                label: "Allocate",
                field: "Allocate",
            },
            {
                label: "Report",
                field: "Report",
            },
        ],
        rows: [],
    });
    const [formData, setFormData] = useState({
        ItemID: "",
        ManufacturerID: "",
        VendorID: "",
        VendorID2: "",
        CategoryID: "",
        SubCategoryID: "",
        LocationID: "",
        LocationID2: "",
        Photo: "",
        UnitPrice: 0,
        Quantity: 0,
        Description: "",
        EntryID: "",
        ItemName: "",
        ManufacturerName: "",
        VendorName: "",
        VendorName2: "",
        CategoryName: "",
        SubCategoryName: "",
        LocationName: "",
        QuantityAvailable: 0,
        SubmittedBy: `${props.loginData[0].StaffID}`,
    });

    const [vendor, setVendor] = useState({
        VendorName: "",
        EntryID: ""
    })

    const [location, setLocation] = useState({
        LocationName: "",
        EntryID: ""
    })

    const getData = async () => {
        await axios
            .get(`${serverLink}staff/inventory/item/view`, token)
            .then((result) => {
                let rows = []
                let rowData = []
                let itemData = result.data.Item;

                //Set Vendor Dropdown Items
                if (result.data.Vendor.length > 0) {
                    result.data.Vendor.map((row) => {
                        rows.push({ value: row.EntryID, label: row.VendorName })
                    });
                    setVendor(rows)
                }

                //Set Location Dropdown Items
                if (result.data.Location.length > 0) {
                    result.data.Location.map((row) => {
                        rowData.push({ value: row.EntryID, label: row.LocationName })
                    });
                    setLocation(rowData)
                }

                let rowSet = [];
                itemData.map((item, index) => {
                    rowSet.push({
                        sn: index + 1,
                        ItemName: item.ItemName ?? "N/A",
                        ManufacturerName: item.ManufacturerName ?? "N/A",
                        VendorName: item.VendorName ?? "N/A",
                        CategoryName: item.CategoryName ?? "N/A",
                        SubCategoryName: item.SubCategoryName ?? "N/A",
                        QuantityAvailable: item.QuantityAvailable ?? 0,
                        Receive: (
                            <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_general"
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        ItemName: item.ItemName,
                                        ManufacturerName: item.ManufacturerName,
                                        VendorName: item.VendorName,
                                        CategoryName: item.CategoryName,
                                        SubCategoryName: item.SubCategoryName,
                                        QuantityAvailable: item.QuantityAvailable ?? 0,
                                        ManufacturerID: item.ManufacturerID,
                                        VendorID: item.VendorID,
                                        CategoryID: item.CategoryID,
                                        SubCategoryID: item.SubCategoryID,
                                        ItemID: item.EntryID,
                                        EntryID: item.EntryID,

                                        VendorID2: "",
                                        LocationID: "",
                                        LocationID2: "",
                                        Photo: "",
                                        UnitPrice: 0,
                                        Quantity: 0,
                                        Description: "",
                                        VendorName2: "",
                                        LocationName: "",
                                    })
                                }
                            >
                                <i className="fa fa-download" />
                            </button>
                        ),
                        Allocate: (
                            <Link to={`/human-resources/inventory/item/allocation/${btoa(item.EntryID)}`} className="btn btn-sm btn-success">
                                <i className="fa fa-exchange-alt" />
                            </Link>
                        ),
                        Report: (
                            <Link to={`/human-resources/inventory/item/report/${btoa(item.EntryID)}`} className="btn btn-sm" style={{backgroundColor: '#425b5e'}}>
                                <i className="fa fa-list-alt text-white" />
                            </Link>
                        ),
                    });
                });

                setDatatable({
                    ...datatable,
                    columns: datatable.columns,
                    rows: rowSet,
                });
            setIsLoading(false)
            });
    };

    const onEdit = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const onVendorChange = (e) => {
        setFormData({
            ...formData,
            VendorID: e.value,
            VendorName2: e.label,
            VendorID2: e,
        })
    }

    const onLocationChange = (e) => {
        setFormData({
            ...formData,
            LocationID: e.value,
            LocationName: e.label,
            LocationID2: e,
        })
    }

    const handleUpload = (url) => {
        if (url !== '') {
            setFormData({
                ...formData,
                Photo: url
            })

        }
    }

    const onSubmit = async () => {
        if (formData.VendorID.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select the vendor", "error");
            return false;
        }
        if (formData.Quantity.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please enter quantity", "error");
            return false;
        }
        if (formData.Quantity <= 0) {
            showAlert("EMPTY FIELD", "Item quantity cannot be 0", "error");
            return false;
        }
        if (formData.UnitPrice.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please enter unit price", "error");
            return false;
        }
        if (formData.LocationID.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select storage location", "error");
            return false;
        }

            setIsFormLoading("on");
            await axios
                .post(`${serverLink}staff/inventory/item/receive`, formData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Item Received Successful");
                        setIsFormLoading("off");
                        getData();
                        setFormData({
                            ...formData,
                            ItemID: "",
                            ManufacturerID: "",
                            VendorID: "",
                            VendorID2: "",
                            CategoryID: "",
                            SubCategoryID: "",
                            LocationID: "",
                            LocationID2: "",
                            Photo: "",
                            UnitPrice: 0,
                            Quantity: 0,
                            Description: "",
                            EntryID: "",
                            ItemName: "",
                            ManufacturerName: "",
                            VendorName: "",
                            VendorName2: "",
                            CategoryName: "",
                            SubCategoryName: "",
                            LocationName: "",
                            QuantityAvailable: 0,
                        });
                        document.getElementById("closeModal").click();
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

    };

    useEffect(() => {
        getData();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Inventory Dashboard"} items={["Inventory", "Dashboard"]} />
            <div className="flex-column-fluid">
                <div className="card card-no-border">

                    <div className="card-body pt-1 mt-2">
                        <Table data={datatable} />
                    </div>
                </div>
                <Modal title={"Item Receive Form"}>
                    <InventoryForm
                        data={formData}
                        isFormLoading={isFormLoading}
                        onEdit={onEdit}
                        onSubmit={onSubmit}
                        vendor={vendor}
                        location={location}
                        handleUpload={handleUpload}
                        onLocationChange={onLocationChange}
                        onVendorChange={onVendorChange}
                    />
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

export default connect(mapStateToProps, null)(InventoryDashboard);
