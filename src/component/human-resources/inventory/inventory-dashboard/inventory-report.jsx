import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import {useLocation, useParams} from "react-router-dom";
function InventoryReport(props) {
    const { slug } = useParams();
    if (slug === "") window.location.href = '/';
    let urlLocation = useLocation();

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
                label: "Quantity ",
                field: "Quantity",
            },
            {
                label: "Quantity Taken",
                field: "QuantityTaken",
            },
            {
                label: "Quantity Available",
                field: "QuantityAvailable",
            },
        ],
        rows: [],
    });
    const [itemData, setItemData] = useState({
        InventoryID: "",
        ItemID: "",
        ManufacturerID: "",
        VendorID: "",
        VendorID2: "",
        CategoryID: "",
        SubCategoryID: "",
        QuantityAvailable: 0,
        EntryID: "",
        ItemName: "",
        ManufacturerName: "",
        VendorName: "",
        VendorName2: "",
        CategoryName: "",
        SubCategoryName: "",
    });

    const getData = async () => {
        await axios
            .get(`${serverLink}staff/inventory/allocation/view/${atob(slug)}`, token)
            .then((result) => {
                let rows = []
                let rowData = []
                let deptRow = []
                let inventoryRow = []
                let itemData = result.data.Item;
                let inventoryData = result.data.Inventory;
                let allocatedData = result.data.Allocation

                if (itemData.length > 0) {
                    //Set Item Data
                    setItemData({
                        ...itemData,
                        ItemID: itemData[0].ItemID,
                        ManufacturerID: itemData[0].ManufacturerID,
                        VendorID: itemData[0].VendorID,
                        CategoryID: itemData[0].CategoryID,
                        SubCategoryID: itemData[0].SubCategoryID,
                        QuantityAvailable: itemData[0].QuantityAvailable,
                        EntryID: itemData[0].EntryID,
                        ItemName: itemData[0].ItemName,
                        ManufacturerName: itemData[0].ManufacturerName,
                        VendorName: itemData[0].VendorName,
                        CategoryName: itemData[0].CategoryName,
                        SubCategoryName: itemData[0].SubCategoryName,
                    })
                }

                let rowSet = [];
                inventoryData.map((item, index) => {
                    rowSet.push({
                        sn: index + 1,
                        ManufacturerName: item.ManufacturerName ?? "N/A",
                        VendorName: item.VendorName ?? "N/A",
                        CategoryName: item.CategoryName ?? "N/A",
                        SubCategoryName: item.SubCategoryName ?? "N/A",
                        Quantity: item.Quantity ?? 0,
                        QuantityAvailable: item.Quantity - item.QuantityTaken ?? 0,
                        QuantityTaken: item.QuantityTaken ?? 0,
                    });
                });

                let dataSet = [];
                allocatedData.map((item, index) => {
                    dataSet.push({
                        UserID: item.UserID ?? "N/A",
                        UserName: item.UserName ?? "N/A",
                        Department: item.Department ?? "N/A",
                        Location: item.Location ?? "N/A",
                        Quantity: item.Quantity ?? 0,
                        AllocatedBy: item.AllocatedBy,
                    });
                });

                setDatatable({
                    ...datatable,
                    columns: datatable.columns,
                    rows: rowSet,
                });

                // setDatatable2({
                //     ...datatable2,
                //     columns: datatable2.columns,
                //     rows: dataSet,
                // });

                setIsLoading(false)
            });
    };

    // const onEdit = (e) => {
    //     setFormData({
    //         ...formData,
    //         [e.target.id]: e.target.value,
    //     });
    // };

    useEffect(() => {
        getData();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Inventory Report"} items={["Inventory", "Report"]} />
            <div className="flex-column-fluid">
                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-12 mb-5">
                            <div className="card">
                                <div className="card-body">
                                    <h2> {itemData?.ItemName} ({itemData?.QuantityAvailable})</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-12">
                            <h3>Inventory Item List</h3>
                            <div className="card">
                                <div className="card-body pt-1 mt-2">
                                    <AGTable data={datatable} />
                                </div>
                            </div>
                        </div>
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

export default connect(mapStateToProps, null)(InventoryReport);
