import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import ReportTable from "../../../common/table/report_table";
import InventoryTrackStockMovementReport from "./inventory-track-stock-movement-report";
function InventoryTrackStock(props) {
    let token = props.loginData[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const initialValue = {
        item_id: '', item_name: '', manufacturer_id: '', manufacturer_id2: '', vendor_id: '', vendor_id2: '', vendor_name: '',
        category_id: '', category_id2: '', sub_category_id: '', sub_category_id2: '', branch_id: '', branch_id2: '',
        location_id: '', location_id2: '', image_name: '', view: "", photo: "", slug: "",
        description: "", vendor_name2: "", location_name: "",unit_price: 0, quantity: 0, SubmittedBy: '', UpdatedBy: ''}
    const [formData, setFormData] = useState(initialValue);
    const columns = ["S/N", "Item", "Manufacturer", "Vendor", "Category", "SubCategory", "Quantity", "Details"];
    const [tableData,setTableData] = useState([]);

    const fetchData = async () => {
        await axios.get(`${serverLink}staff/inventory/item/view`, token)
            .then(res => {
                if (res.data.message === 'success') {

                    const row = [];
                    if (res.data.ItemView.length > 0) {
                        res.data.ItemView.map((r, i) => {
                            const _manufacturer = res.data.Manufacturer; const _vendor = res.data.Vendor;  const _category = res.data.Category;   const _subCategory = res.data.SubCategory;
                            row.push([i+1, r.item_name, getItemName(_manufacturer, "manufacturer", r.manufacturer_id), getItemName(_vendor, "vendor", r.vendor_id), getItemName(_category, "category", r.category_id), getItemName(_subCategory, "sub_category", r.sub_category_id), r.quantity_available,
                                (
                                    <button
                                        className="btn btn-sm"
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        style={{backgroundColor: '#425b5e'}}
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                manufacturer_name: r.manufacturer_name,
                                                item_name: r.item_name,
                                                category_name: r.category_name,
                                                sub_category_name: r.sub_category_name,
                                                manufacturer_id: r.manufacturer_id,
                                                category_id: r.category_id,
                                                sub_category_id: r.sub_category_id,
                                                item_id: r.item_id,
                                                slug: r.item_id,

                                                vendor_id2: "",
                                                vendor_id: "",
                                                location_id: "",
                                                location_id2: "",
                                                photo: "",
                                                view: "",
                                                image_name: "",
                                                unit_price: 0,
                                                quantity: 0,
                                                description: "",
                                                vendor_name: "",
                                                location_name: "",
                                            })
                                        }
                                        }
                                    >
                                        <i className="fa fa-list-alt text-white" /> </button>
                                )
                            ])
                        })
                        setTableData(row)
                    }else{
                        setTableData([])
                    }
                } else {
                    toast.info("Something went wrong. Please try again!")
                }
                setIsLoading(false)
            })
            .catch(e => {
                toast.error(`${e.response.statusText}: ${e.response.data}`)
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


    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Inventory Track Stock Movement"} items={["Inventory", "Inventory Track Stock Movement"]} />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                    </div>
                    <div className="card-body pt-0">
                        <ReportTable title={"Inventory Items"} columns={columns} data={tableData} />
                    </div>
                </div>
                <Modal large title={<h1>{formData.item_name}</h1>}>
                    <InventoryTrackStockMovementReport
                        value={formData}
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

export default connect(mapStateToProps, null)(InventoryTrackStock);
