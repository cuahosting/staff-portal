import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import {currencyConverter, formatDateAndTime} from "../../../resources/constants";
import {connect} from "react-redux";

function Inventory(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [courseList, setCourseList] = useState([]);


    const [inventoryDatatable, setInventoryDatatable] = useState({
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
                label: "Quantity",
                field: "Quantity",
            },
            {
                label: "Quantity Used",
                field: "QuantityUsed",
            },
            {
                label: "Available Quantity",
                field: "AvailableQuantity",
            },
            {
                label: "Amount",
                field: "Amount",
            },

            {
                label: "ReceiptNo",
                field: "ReceiptNo",
            },
            {
                label: "Added By",
                field: "InsertedBy",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [inventoryFormData, setInventoryFormData] = useState({
        ItemName: "",
        Description: "",
        Quantity: 0,
        QuantityUsed: 0,
        Amount: "",
        ReceiptNo: "",
        InsertedBy: props.loginData[0].StaffID,
        EntryID: "",
    });

    const [inventoryUsageDatatable, setInventoryUsageDatatable] = useState({
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
                label: "Quantity User",
                field: "Quantity",
            },
            {
                label: "Used For",
                field: "Reason",
            },
            {
                label: "Used By",
                field: "InsertedBy",
            },

        ],
        rows: [],
    });
    const [inventoryUsageFormData, setInventoryUsageFormData] = useState({
        ItemName: "",
        InventoryID: "",
        MainQuantity: 0,
        MainQuantityUsed: 0,
        Quantity: 0,
        Reason: "",
        InsertedBy: props.loginData[0].StaffID,
        EntryID: "",
    });


    const getRecords = async () => {
        await axios.get(`${serverLink}staff/hr/inventory/list`, token)
            .then((result) => {
                const data = result.data;
                if (data.length > 0) {
                    let rows = [];
                    data.map((item, index) => {
                        rows.push({
                            sn: index + 1,
                            ItemName: item.ItemName,
                            Quantity: item.Quantity,
                            QuantityUsed: item.QuantityUsed,
                            AvailableQuantity: parseInt(item.Quantity) - parseInt(item.QuantityUsed),
                            Amount: currencyConverter(item.Amount),
                            ReceiptNo: item.ReceiptNo,
                            InsertedBy: item.InsertedBy,
                            action: (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#inventory_usage_modal"
                                    onClick={() =>
                                        setInventoryUsageFormData({
                                            ...inventoryUsageFormData,
                                            ItemName: item.ItemName,
                                            MainQuantity: parseInt(item.Quantity) - parseInt(item.QuantityUsed),
                                            MainQuantityUsed: item.QuantityUsed,
                                            Quantity: "",
                                            InventoryID: item.EntryID,
                                        })
                                    }
                                >
                                    <i className="fa fa-check-square" />
                                </button>
                            ),
                        });
                    });
                    setInventoryDatatable({
                        ...inventoryDatatable,
                        columns: inventoryDatatable.columns,
                        rows: rows,
                    });
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });

        await axios.get(`${serverLink}staff/hr/inventory/usage/list`, token)
            .then((result) => {
                const data = result.data;
                if (data.length > 0) {
                    let rows = [];
                    data.map((item, index) => {
                        rows.push({
                            sn: index + 1,
                            ItemName: item.ItemName,
                            Quantity: item.Quantity,
                            Reason: item.Reason,
                            InsertedBy: item.InsertedBy,
                            EntryID: item.EntryID,
                        });
                    });
                    setInventoryUsageDatatable({
                        ...inventoryUsageDatatable,
                        columns: inventoryUsageDatatable.columns,
                        rows: rows,
                    });
                }
            })
            .catch((err) => {
                console.log("NETWORK ERROR STATE");
            });


    };

    const onInventoryEdit = (e) => {
        setInventoryFormData({
            ...inventoryFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onInventoryUsedEdit = (e) => {
        setInventoryUsageFormData({
            ...inventoryUsageFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmitInventory = async () => {
        if (inventoryFormData.ItemName.trim() === "") {
            showAlert("EMPTY FIELD", "Please select the item name", "error");
            return false;
        }
        if (inventoryFormData.Quantity.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the quantity", "error");
            return false;
        }


        if (inventoryFormData.EntryID === "") {
            await axios
                .post(`${serverLink}staff/hr/inventory/add`, inventoryFormData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Item Added Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setInventoryFormData({
                            ...inventoryFormData,
                            ItemName: "",
                            Description: "",
                            Quantity: "",
                            Amount: "",
                            ReceiptNo: "",
                            InsertedBy: props.loginData[0].StaffID,
                            EntryID: "",
                        });
                    } else if (result.data.message === "exist") {
                        showAlert("ITEM EXIST", "Item already exist!", "error");
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

    const onSubmitInventoryUsed = async () => {
        if (inventoryUsageFormData.Quantity.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the quantity", "error");
            return false;
        }

        if (inventoryUsageFormData.MainQuantity.toString() === "0") {
            showAlert("NO ITEM", "The selected item has 0 quantity", "error");
            return false;
        }

        if (inventoryUsageFormData.Quantity >  inventoryUsageFormData.MainQuantity) {
            showAlert("QUANTITY ERROR", "Quantity cannot be more than the selected item quantity", "error");
            return false;
        }

            await axios
                .post(`${serverLink}staff/hr/inventory/usage/add`, inventoryUsageFormData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Inventory Usage Added Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setInventoryUsageFormData({
                            ...inventoryUsageFormData,
                            ItemName: "",
                            InventoryID: "",
                            MainQuantity: 0,
                            MainQuantityUsed: 0,
                            Quantity: 0,
                            Reason: "",
                            InsertedBy: props.loginData[0].StaffID,
                            EntryID: "",
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


    };



    useEffect(() => {
        getRecords();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Inventory"} items={["Human Resource", "Others", "Inventory"]}/>
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body p-0">
                        <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-8">

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4 active" data-bs-toggle="tab" href="#inventory">Inventory</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-kt-countup-tabs="true" data-bs-toggle="tab" href="#inventory_usage">Inventory Usage</a>
                            </li>
                        </ul>

                        <div className="tab-content" id="myTabContent">

                            <div className="tab-pane fade active show" id="inventory" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() =>
                                            setInventoryFormData({
                                                ...inventoryFormData,
                                                ItemName: "",
                                                Description: "",
                                                Quantity: 0,
                                                Amount: "",
                                                ReceiptNo: "",
                                                InsertedBy: props.loginData[0].StaffID,
                                                EntryID: "",
                                            })
                                        }
                                    >
                                        Add Item
                                    </button>
                                </div>
                                <AGTable data={inventoryDatatable} />
                            </div>
                            <div className="tab-pane fade" id="inventory_usage" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    {/*<button*/}
                                    {/*    type="button"*/}
                                    {/*    className="btn btn-primary"*/}
                                    {/*    data-bs-toggle="modal"*/}
                                    {/*    data-bs-target="#inventory_usage_modal"*/}
                                    {/*    onClick={() =>*/}
                                    {/*        setOtherFeeFormData({*/}
                                    {/*            ...otherFeeFormData,*/}
                                    {/*            InventoryID: "",*/}
                                    {/*            Quantity: "",*/}
                                    {/*            Reason: "",*/}
                                    {/*            InsertedBy: props.loginData[0].StaffID,*/}
                                    {/*            EntryID: "",*/}
                                    {/*        })*/}
                                    {/*    }*/}
                                    {/*>*/}
                                    {/*    Add Usage*/}
                                    {/*</button>*/}
                                </div>
                                <AGTable data={inventoryUsageDatatable} />
                            </div>
                        </div>
                    </div>
                </div>

                <Modal title={"Inventory Form"}>
                    <div className={"row"}>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="ItemName">Item Name</label>
                            <input
                                type="text"
                                id={"ItemName"}
                                onChange={onInventoryEdit}
                                value={inventoryFormData.ItemName}
                                className={"form-control"}
                                placeholder={"Please enter the Item Name"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="Quantity">Quantity</label>
                            <input
                                type="number"
                                id={"Quantity"}
                                onChange={onInventoryEdit}
                                value={inventoryFormData.Quantity}
                                className={"form-control"}
                                min={1}
                                placeholder={"Please enter the quantity"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="Amount">Amount</label>
                            <input
                                type="number"
                                id={"Amount"}
                                onChange={onInventoryEdit}
                                value={inventoryFormData.Amount}
                                className={"form-control"}
                                min={0}
                                placeholder={"Please enter the Amount"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="ReceiptNo">Receipt Number</label>
                            <input
                                type="text"
                                id={"ReceiptNo"}
                                onChange={onInventoryEdit}
                                value={inventoryFormData.ReceiptNo}
                                className={"form-control"}
                                placeholder={"Please enter the ReceiptNo"}
                            />
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="Description">Description</label>
                            <textarea
                                id={"Description"}
                                onChange={onInventoryEdit}
                                value={inventoryFormData.Description}
                                className={"form-control"}
                                rows={3}
                                cols={3}
                                >

                            </textarea>
                        </div>
                    </div>

                    <div className="form-group pt-4">
                        <button onClick={onSubmitInventory} className="btn btn-primary w-100">
                            Submit
                        </button>
                    </div>
                </Modal>
                <Modal title={"Inventory Usage"} id="inventory_usage_modal">
                    <div className={"row"}>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="ItemName">Item Name</label>
                            <input
                                type="text"
                                id={"ItemName"}
                                onChange={onInventoryUsedEdit}
                                value={inventoryUsageFormData.ItemName}
                                className={"form-control"}
                                readOnly
                                placeholder={"Please enter the Item Name"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="MainQuantity">Main Quantity</label>
                            <input
                                type="number"
                                id={"MainQuantity"}
                                onChange={onInventoryUsedEdit}
                                value={inventoryUsageFormData.MainQuantity}
                                className={"form-control"}
                                min={0}
                                readOnly
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="Quantity">Quantity</label>
                            <input
                                type="number"
                                id={"Quantity"}
                                onChange={onInventoryUsedEdit}
                                value={inventoryUsageFormData.Quantity}
                                className={"form-control"}
                                placeholder={"Please enter the quantity"}
                                min={1}
                            />
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="Reason">Used For?</label>
                            <textarea
                                id={"Reason"}
                                onChange={onInventoryUsedEdit}
                                value={inventoryUsageFormData.Reason}
                                className={"form-control"}
                                rows={3}
                                cols={3}
                            >
                            </textarea>
                        </div>

                    </div>

                    <div className="form-group pt-4">
                        <button onClick={onSubmitInventoryUsed} className="btn btn-primary w-100">
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

export default connect(mapStateToProps, null)(Inventory);