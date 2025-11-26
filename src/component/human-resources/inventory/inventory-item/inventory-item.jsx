import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import ReportTable from "../../../common/table/report_table";
import InventoryItemForm from "./inventory-item-form";
function InventoryItem(props) {
    let token = props.loginData[0].token
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const initialValue = { item_id: '', item_name: '', manufacturer_id: '', manufacturer_id2: '', vendor_id: '', vendor_id2: '', category_id: '', category_id2: '', sub_category_id: '', sub_category_id2: '', quantity_available: 0, SubmittedBy: '', UpdatedBy: '' }
    const [formData, setFormData] = useState(initialValue);
    const [manufacturer, setManufacturer] = useState({  manufacturer_name: "", manufacturer_id: "" })
    const [vendor, setVendor] = useState({  vendor_name: "", vendor_id: "" })
    const [category, setCategory] = useState({  category_name: "", category_id: "" })
    const [subCategory, setSubCategory] = useState({  sub_category_name: "", sub_category_id: "" })

    const columns = ["S/N", "Item Name", "Manufacturer", "Vendor", "Category", "SubCategory", "Quantity Available", "Edit", "Allocate"];
    const [tableData,setTableData] = useState([]);

    const fetchData = async () => {
        toast.info("Please wait...")
        await axios.get(`${serverLink}staff/inventory/item/data/list`, token)
            .then(res => {
                if (res.data.message === 'success') {
                    const rowData = []; const vendorData = [];  const categoryData = [];   const subCategoryData = [];
                    const _manufacturer = res.data.Manufacturer; const _vendor = res.data.Vendor;  const _category = res.data.Category;   const _subCategory = res.data.SubCategory;

                    //Set Manufacturer Dropdown Items
                    if (res.data.Manufacturer.length > 0) {
                        res.data.Manufacturer.map((row) => {
                            rowData.push({ value: row.manufacturer_id, label: row.manufacturer_name })
                        });
                        setManufacturer(rowData)
                    }

                    //Set vendor Dropdown Items
                    if (res.data.Vendor.length > 0) {
                        res.data.Vendor.map((row) => {
                            vendorData.push({ value: row.vendor_id, label: row.vendor_name })
                        });
                        setVendor(vendorData)
                    }

                    //Set Category Dropdown Items
                    if (res.data.Category.length > 0) {
                        res.data.Category.map((row) => {
                            categoryData.push({ value: row.category_id, label: row.category_name })
                        });
                        setCategory(categoryData)
                    }

                    //Set Sub Category Dropdown Items
                    if (res.data.SubCategory.length > 0) {
                        res.data.SubCategory.map((row) => {
                            subCategoryData.push({ value: row.sub_category_id, label: row.sub_category_name })
                        });
                        setSubCategory(subCategoryData)
                    }

                    const row = [];
                    if (res.data.ItemView.length > 0) {
                        res.data.ItemView.map((r, i) => {
                            row.push([i+1, r.item_name, getItemName(_manufacturer, "manufacturer", r.manufacturer_id), getItemName(_vendor, "vendor", r.vendor_id), getItemName(_category, "category", r.category_id), getItemName(_subCategory, "sub_category", r.sub_category_id), r.quantity_available,
                                (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => {
                                            let manufacture = _manufacturer.length > 0 && _manufacturer.filter(e=>e.manufacturer_id === r.manufacturer_id);
                                            let vendor = _vendor.length > 0 && _vendor.filter(e=>e.vendor_id === r.vendor_id);
                                            let category = _category.length > 0 && _category.filter(e=>e.category_id === r.category_id);
                                            let sub_category = _subCategory.length > 0 && _subCategory.filter(e=>e.sub_category_id === r.sub_category_id);

                                            setFormData({
                                                ...formData,
                                                manufacturer_name: r.manufacturer_name,
                                                item_name: r.item_name,
                                                manufacturer_id: r.manufacturer_id,
                                                manufacturer_id2: { value: manufacture[0]?.manufacturer_id, label: manufacture[0]?.manufacturer_name},
                                                vendor_id: r.vendor_id,
                                                vendor_id2: { value: vendor[0]?.vendor_id, label: vendor[0]?.vendor_name},
                                                category_id: r.category_id,
                                                category_id2: { value: category[0]?.category_id, label: category[0]?.category_name},
                                                sub_category_id: r.sub_category_id,
                                                sub_category_id2: { value: sub_category[0]?.sub_category_id, label: sub_category[0]?.sub_category_name},
                                                item_id: r.item_id,
                                            })
                                        }
                                        }
                                    >
                                        <i className="fa fa-pen" />
                                    </button>
                                ),
                                (
                                    <Link to={`/human-resources/inventory/allocate`} className="btn btn-sm btn-primary" >
                                        <i className="fa fa-exchange-alt" />
                                    </Link>
                                )
                            ])
                        })
                        setTableData(row)
                    }else {
                        setTableData([])
                    }
                } else {
                    toast.info("Something went wrong. Please try again!")
                }
                setIsLoading(false)
            })
            .catch(e => {
                toast.error(`Error: ${e}`)
            })
    }

    const getItemName = (item = [], type, id) => {
        if (item.length > 0){
            if (type === "manufacturer"){
                let item_name = item.filter(e=>e.manufacturer_id.toString() === id.toString());
                if (item_name.length > 0){
                    return item_name[0].manufacturer_name;
                }else{
                    return "";
                }
            }else if (type === "vendor"){
                let item_name = item.filter(e=>e.vendor_id.toString() === id.toString());
                if (item_name.length > 0){
                    return item_name[0].vendor_name;
                }else{
                    return "";
                }
            }else if (type === "category"){
                let item_name = item.filter(e=>e.category_id.toString() === id.toString());
                if (item_name.length > 0){
                    return item_name[0].category_name;
                }else{
                    return "";
                }
            }else if (type === "sub_category"){
                let item_name = item.filter(e=>e.sub_category_id.toString() === id.toString());
                if (item_name.length > 0){
                    return item_name[0].sub_category_name;
                }else{
                    return "";
                }
            }

        }
    }

    useEffect(() => {
        fetchData()
    },[])

    const handleFormValueChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id] : e.target.value
        })
    }

    const onManufacturerChange = (e) => {
        setFormData({
            ...formData,
            manufacturer_id: e.value,
            manufacturer_id2: e,
        })
    }

    const onVendorChange = (e) => {
        setFormData({
            ...formData,
            vendor_id: e.value,
            vendor_id2: e,
        })
    }

    const onCategoryChange = (e) => {
        setFormData({
            ...formData,
            category_id: e.value,
            category_id2: e,
        })
    }

    const onSubCategoryChange = (e) => {
        setFormData({
            ...formData,
            sub_category_id: e.value,
            sub_category_id2: e,
        })
    }

    const onFormSubmit = async (e) => {
        e.preventDefault();
        if (formData.item_name.toString().trim() === "") {
            toast.error("Please Enter the Item Name");
            return false;
        }

        if (formData.category_id.toString().trim() === "") {
            toast.error("Please Select Category");
            return false;
        }
        // if (formData.sub_category_id.toString().trim() === "") {
        //     toast.error("Please Select Sub Category");
        //     return false;
        // }

        let sendData = {
            ...formData,
            submitted_by: props.loginData[0].StaffID,
            updated_by: props.loginData[0].StaffID
        }
        setIsFormLoading(true)
        if (formData.item_id === '') {
            await axios
                .post(`${serverLink}staff/inventory/item/add`, sendData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Item Added Successfully");
                        fetchData();
                        setFormData({ ...formData, ...initialValue })
                        setIsFormLoading(false)
                        document.getElementById("closeModal").click();
                    } else if (result.data.message === "exist") {
                        setIsFormLoading(false)
                        showAlert("ITEM EXIST", "Item already exist!", "error");
                    } else {
                        setIsFormLoading(false)
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    setIsFormLoading(false)
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        } else {

            await axios
                .patch(`${serverLink}staff/inventory/item/update`, sendData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Item Updated Successfully");
                        fetchData();
                        setFormData({ ...formData, ...initialValue })
                        setIsFormLoading(false)
                        document.getElementById("closeModal").click();
                    } else {
                        setIsFormLoading(false)
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    setIsFormLoading(false)
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    }

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Inventory Item"} items={["Inventory", "Inventory Item"]} />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                        <div className="card-toolbar">
                            <div
                                className="d-flex justify-content-end"
                                data-kt-customer-table-toolbar="base"
                            >
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                        setFormData(initialValue)
                                    }
                                >
                                    Add Item
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body pt-0">
                        <ReportTable title={"Inventory Item"} columns={columns} data={tableData} />
                    </div>
                </div>
                <Modal title={"Manage Item"}>
                    <InventoryItemForm
                        value={formData}
                        manufacturer={manufacturer}
                        vendor={vendor}
                        category={category}
                        subCategory={subCategory}
                        isFormLoading={isFormLoading}
                        onManufacturerChange={onManufacturerChange}
                        onVendorChange={onVendorChange}
                        onCategoryChange={onCategoryChange}
                        onSubCategoryChange={onSubCategoryChange}
                        onChange={handleFormValueChange}
                        onSubmit={onFormSubmit}
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

export default connect(mapStateToProps, null)(InventoryItem);
