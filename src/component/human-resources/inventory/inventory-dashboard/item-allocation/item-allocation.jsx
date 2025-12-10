import React, { useEffect, useState } from "react";
import Modal from "../../../../common/modal/modal";
import PageHeader from "../../../../common/pageheader/pageheader";
import AGTable from "../../../../common/table/AGTable";
import axios from "axios";
import { serverLink } from "../../../../../resources/url";
import Loader from "../../../../common/loader/loader";
import { showAlert } from "../../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import ItemAllocationForm from "./item-allocation-form";
import {useLocation, useParams} from "react-router-dom";
function ItemAllocation(props) {
    const { slug } = useParams();
    if (slug === "") window.location.href = '/';
    let urlLocation = useLocation();

    const token = props.loginData[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState("off");
    const [datatable, setDatatable] = useState({
        columns: [
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
                label: "Quantity Taken",
                field: "QuantityTaken",
            },
            {
                label: "Quantity Available",
                field: "Quantity",
            },
        ],
        rows: [],
    });
    const [datatable2, setDatatable2] = useState({
        columns: [
            {
                label: "UserID",
                field: "UserID",
            },
            {
                label: "Name",
                field: "UserName",
            },
            {
                label: "Department",
                field: "Department",
            },
            {
                label: "Location",
                field: "Location",
            },
            {
                label: "QTY",
                field: "Quantity",
            },
            {
                label: "Allocated By",
                field: "AllocatedBy",
            },
        ],
        rows: [],
    });
    const [formData, setFormData] = useState({
        InventoryID: "",
        ItemID: "",
        ManufacturerID: "",
        VendorID: "",
        VendorID2: "",
        CategoryID: "",
        SubCategoryID: "",
        LocationID: "",
        LocationID2: "",
        UserID: "",
        UserID2: "",
        UserName: "",
        DepartmentCode: "",
        DepartmentCode2: "",
        DepartmentName: "",
        Quantity: 0,
        EntryID: "",
        ItemName: "",
        ManufacturerName: "",
        VendorName: "",
        VendorName2: "",
        CategoryName: "",
        SubCategoryName: "",
        LocationName: "",
        QuantityRemaining: 0,
        QuantityAvailable: 0,
        show: 0,
        AllocatedBy: `${props.loginData[0].StaffID}`,
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
    const [inventoryList, setInventoryList] = useState([]);
    const [staff, setStaff] = useState({
        StaffName: "",
        StaffID: ""
    })

    const [department, setDepartment] = useState({
        DepartmentName: "",
        DepartmentCode: ""
    })

    const [location, setLocation] = useState({
        LocationName: "",
        EntryID: ""
    })

    const [inventory, setInventory] = useState({
        LocationName: "",
        EntryID: ""
    })

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

                //Set Inventory List
                setInventoryList(inventoryData)

                //Set Staff Dropdown Items
                if (result.data.Staff.length > 0) {
                    result.data.Staff.map((row) => {
                        rows.push({ value: row.StaffID, label: row.StaffName })
                    });
                    setStaff(rows)
                }

                //Set Location Dropdown Items
                if (result.data.Location.length > 0) {
                    result.data.Location.map((row) => {
                        rowData.push({ value: row.EntryID, label: row.LocationName })
                    });
                    setLocation(rowData)
                }

                //Set Department Dropdown Items
                if (result.data.Department.length > 0) {
                    result.data.Department.map((row) => {
                        deptRow.push({ value: row.DepartmentCode, label: row.DepartmentName })
                    });
                    setDepartment(deptRow)
                }

                //Set inventory Dropdown Items
                if (inventoryData.length > 0) {
                    inventoryData.map((row) => {
                        inventoryRow.push({ value: row.EntryID, label: row.ItemName +" ("+(row.Quantity - row.QuantityTaken)+") ", inventoryID: row.EntryID })
                    });
                    setInventory(inventoryRow)
                }

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
                        ManufacturerName: item.ManufacturerName ?? "N/A",
                        VendorName: item.VendorName ?? "N/A",
                        CategoryName: item.CategoryName ?? "N/A",
                        SubCategoryName: item.SubCategoryName ?? "N/A",
                        Quantity: item.Quantity - item.QuantityTaken ?? 0,
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

                setDatatable2({
                    ...datatable2,
                    columns: datatable2.columns,
                    rows: dataSet,
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

    const onStaffChange = (e) => {
        setFormData({
            ...formData,
            UserID: e.value,
            UserName: e.label,
            UserID2: e,
        })
    }

    const onDepartmentChange = (e) => {
        setFormData({
            ...formData,
            DepartmentCode: e.value,
            DepartmentName: e.label,
            DepartmentCode2: e,
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

    const onItemChange = (e) => {
        let inventory =  inventoryList.filter(element => element.EntryID.toString() === e.value.toString());
        if (inventory.length > 0){
            setFormData({
                ...formData,
                ItemID: inventory[0].ItemID,
                ItemName: e.label,
                ItemID2: e,
                InventoryID: inventory[0].EntryID,
                ManufacturerName: inventory[0].ManufacturerName,
                VendorName: inventory[0].VendorName,
                CategoryName: inventory[0].CategoryName,
                SubCategoryName: inventory[0].SubCategoryName,
                QuantityAvailable: inventory[0].Quantity - inventory[0].QuantityTaken,
                Photo: inventory[0].Photo,
                show: 1,
            })
        }
    }

    const onSubmit = async () => {
        if (formData.ItemID.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select the item", "error");
            return false;
        }
        if (formData.UserID.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select a staff", "error");
            return false;
        }
        if (formData.DepartmentCode.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select the staff department", "error");
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
        if (parseInt(formData.Quantity) > parseInt(formData.QuantityAvailable)) {
            showAlert("EMPTY FIELD", "Quantity given is more than the stock available", "error");
            return false;
        }

        if (formData.LocationID.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select storage location", "error");
            return false;
        }

        setIsFormLoading("on");
        await axios
            .post(`${serverLink}staff/inventory/item/allocation`, formData, token)
            .then((result) => {
                if (result.data.message === "success") {
                    toast.success("Item Received Successful");
                    setIsFormLoading("off");
                    getData();
                    setFormData({
                        ...formData,
                        InventoryID: "",
                        ItemID: "",
                        ManufacturerID: "",
                        VendorID: "",
                        VendorID2: "",
                        CategoryID: "",
                        SubCategoryID: "",
                        LocationID: "",
                        LocationID2: "",
                        UserID: "",
                        UserID2: "",
                        UserName: "",
                        DepartmentCode: "",
                        DepartmentCode2: "",
                        DepartmentName: "",
                        Quantity: 0,
                        EntryID: "",
                        ItemName: "",
                        ManufacturerName: "",
                        VendorName: "",
                        VendorName2: "",
                        CategoryName: "",
                        SubCategoryName: "",
                        LocationName: "",
                        Photo: "",
                        QuantityRemaining: 0,
                        QuantityAvailable: 0,
                        show: 0,
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
                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-md-9 mb-5">
                                <div className="card">
                                    <div className="card-body">
                                        <h2> {itemData?.ItemName} ({itemData?.QuantityAvailable})</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3  mb-5 btn pt-0" >
                                <div className="card shadow" style={{backgroundColor: '#425b5e'}}>
                                    <div className="card-body"
                                         data-bs-toggle="modal"
                                         data-bs-target="#kt_modal_general"
                                         onClick={()=> {
                                             setFormData({
                                                 ...formData,
                                                 InventoryID: "",
                                                 ItemID: "",
                                                 ManufacturerID: "",
                                                 VendorID: "",
                                                 VendorID2: "",
                                                 CategoryID: "",
                                                 SubCategoryID: "",
                                                 LocationID: "",
                                                 LocationID2: "",
                                                 UserID: "",
                                                 UserID2: "",
                                                 UserName: "",
                                                 DepartmentCode: "",
                                                 DepartmentCode2: "",
                                                 DepartmentName: "",
                                                 Quantity: 0,
                                                 EntryID: "",
                                                 ItemName: "",
                                                 ManufacturerName: "",
                                                 VendorName: "",
                                                 VendorName2: "",
                                                 CategoryName: "",
                                                 SubCategoryName: "",
                                                 LocationName: "",
                                                 Photo: "",
                                                 QuantityRemaining: 0,
                                                 QuantityAvailable: 0,
                                                 show: 0,
                                             });
                                         }}
                                    >
                                        <h3 className="text-white"> Allocate Item</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-md-6">
                                <h3>Inventory Item List</h3>
                                <div className="card">
                                    <div className="card-body pt-1 mt-2">
                                        <AGTable data={datatable} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <h3>Item Allocations</h3>
                                <div className="card">
                                    <div className="card-body pt-1 mt-2">
                                        <AGTable data={datatable2} />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                <Modal large title={"Item Receive Form"}>
                    <ItemAllocationForm
                        data={formData}
                        isFormLoading={isFormLoading}
                        onEdit={onEdit}
                        onSubmit={onSubmit}
                        staff={staff}
                        department={department}
                        location={location}
                        inventoryList={inventoryList}
                        inventory={inventory}
                        onStaffChange={onStaffChange}
                        onItemChange={onItemChange}
                        onLocationChange={onLocationChange}
                        onDepartmentChange={onDepartmentChange}
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

export default connect(mapStateToProps, null)(ItemAllocation);
