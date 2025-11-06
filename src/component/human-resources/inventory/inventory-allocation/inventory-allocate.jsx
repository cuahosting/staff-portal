import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";

import ReportTable from "../../../common/table/report_table";
import {useParams} from "react-router-dom";
import InventoryAllocateForm from "./inventory-allocate-form";
function InventoryAllocation(props) {
    let token = props.loginData[0].token
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const { slug } = useParams();
    if (slug === "") window.location.href = '/';

    const initialValue = {
        request_id: '',  location_id: "", branch_id: "", branch_id2: '', location_id2: "", allocated_to_id: "", allocated_department_id: "",
        department_id: "", department_id2: "", booking_code: "", employee_id: '', employee_id2: '', full_name: '', department_name: '', phone_number: '', email_address: '', inserted_by: '', isUpdate: false}
    const [formData, setFormData] = useState(initialValue);
    const [departmentList, setDepartmentList] = useState([])
    const [department, setDepartment] = useState([])
    const [location, setLocation] = useState([])
    const [guest, setGuest] = useState([])
    const [items, setItems] = useState([])
    const [cart, setCart] = useState([])
    let _cart2 = [];
    let _room = [];

    const columns = ["S/N", "Item Name", "Available Quantity", "Quantity", "Check"];
    const [tableData,setTableData] = useState([]);

    const fetchData = async () => {
        toast.info("Please wait...")
        await axios.get(`${serverLink}staff/inventory/allocation/data`, token)
            .then(res => {
                if (res.data.message === 'success') {
                    const departmentRow = []; const locationData = [];

                    setItems(res.data.Items)
                    setDepartmentList(res.data.Department)
                    //Set Department Dropdown
                    if (res.data.Department.length > 0) {
                        res.data.Department.map((row) => {
                            departmentRow.push({value: row.department_id, label: row.department_name})
                        });
                        setDepartment(departmentRow)
                    }

                    //Set Location Dropdown Items
                    if (res.data.Location.length > 0) {
                        res.data.Location.map((row) => {
                            locationData.push({ value: row.location_id, label: row.location_name })
                        });
                        setLocation(locationData)
                    }

                    onItemChange(res.data.Items)

                    const guestRow = [];
                    //Set Guest Dropdown
                    if (res.data.Employee.length > 0) {
                        res.data.Employee.map((row) => {
                            guestRow.push({value: row.employee_id, label: row.full_name, department_id: row.department_id, department_name: row.department_name, phone_number: row.phone_number, email_address: row.email_address})
                        });
                        setGuest(guestRow)
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

    useEffect(() => {
        fetchData()
    },[])

    const onQuantityChange = (e) => {
        let quantity_available = e.target.getAttribute("quantity_available");
        if (e.target.value > parseInt(quantity_available)){
            toast.error("Quantity cannot be greater than the available quantity");
            e.target.value = 1;
            return false;
        }
    }


    const onLocationChange = (e) => {
        setFormData({
            ...formData,
            location_id: e.value,
            location_id2: e,
            location_name: e.label,
        })
    }


    const onDepartmentChange = (e) => {
        setFormData({
            ...formData,
            department_id: e.value,
            department_id2: e,
            department_name: e.label,
        })
    }


    const onGuestChange = (e) => {
        let quantity = document.getElementsByClassName('quantity');
        for (let i = 0; i < quantity.length; i++) {
            quantity[i].value = 1;
        }
        setFormData({
            ...formData,
            employee_id: e.value,
            full_name: e.label,
            email_address: e.email_address,
            phone_number: e.phone_number,
            department_id: e.department_id,
            department_name: e.department_name,
            employee_id2: e,
        })
    }

    const onItemChange = (itemData) => {
        const row = [];
        if (itemData.length > 0) {
            itemData.map((r, i) => {
                row.push([i+1, r.item_name, r.quantity_available,
                    (
                        <input
                            type="number"
                            id={`quantity-${r.item_id}`}
                            quantity_available={r.quantity_available}
                            item_id={r.item_id}
                            className="quantity form-control"
                            name="quantity"
                            min={1}
                            defaultValue={1}
                            onChange={onQuantityChange}
                            style={{width: '90px', height: '30px'}}
                        />
                    ),
                    (
                        <input
                            type="button"
                            id="checkItem"
                            item_id={r.item_id}
                            data={JSON.stringify(r)}
                            className="btn btn-sm btn-primary checkItem"
                            name="checkItem"
                            value={"Add"}
                            onClick={(e)=>{
                                onCheck(e)
                            }}
                        />
                    )
                ])
            })
            setTableData(row)
        }else{
            setTableData([])
        }
    }

    const onCheck = (e) => {
        let itemString = e.target.getAttribute("data");
        let itemSet = JSON.parse(itemString);
        let item_id = e.target.getAttribute("item_id");
        let quantity = document.getElementById(`quantity-${item_id}`).value
        let itemData = {item_id: itemSet.item_id, item_name: itemSet.item_name, quantity: parseInt(quantity), branch_id: formData.branch_id, allocated_to_id: formData.employee_id, allocated_department_id: formData.department_id, inserted_by: formData.inserted_by }
        let quantity_available = itemSet.quantity_available;

        if (parseInt(quantity_available) < 1){
            toast.error("The selected item is out of stock");
            return false;
        }
        if (quantity === "" || parseInt(quantity) === 0) {
            e.target.checked = false;
            toast.error("Quantity cannot be less than 1");
            return false;
        }

        setCart(prevState => [...prevState.filter(e=>e.item_id.toString() !== item_id.toString()), itemData])
        _cart2.filter(e=>e.item_id.toString() !== item_id.toString()).push(itemData)
    }

    const handleFormValueChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id] : e.target.value
        })
    }

    const onFormSubmit = async (e) => {
        e.preventDefault();

        if (cart.length < 1) {
            toast.error("Please select at least 1 item");
            return false;
        }

        if (formData.employee_id.toString().trim() === "") {
            toast.error("Please Select Employee");
            return false;
        }

        if (formData.location_id.toString().trim() === "") {
            toast.error("Please Select Storage Location");
            return false;
        }

        let sendData = {
            ...formData,
            cart: cart,
            inserted_by: props.loginData[0].StaffID,
        }

        setIsFormLoading(true)
        if (formData.request_id === '') {
            await axios
                .post(`${serverLink}staff/inventory/allocation/request/post`, sendData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Item(s) Allocated Successfully");
                        setFormData({ ...initialValue })
                        fetchData();
                        setCart([])
                        setIsFormLoading(false)
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
                .patch(`${serverLink}staff/services/request/update`, sendData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Service Request Updated Successfully");
                        fetchData();
                        setFormData({ ...formData, ...initialValue })
                        setIsFormLoading(false)
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
            <PageHeader title={"Inventory Allocation"} items={["Inventory", "Inventory Allocation"]} />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                    </div>
                    <div className="card-body pt-0">
                        <InventoryAllocateForm
                            value = {formData}
                            setFormData = {setFormData}
                            isFormLoading={isFormLoading}
                            onDepartmentChange={onDepartmentChange}
                            onLocationChange={onLocationChange}
                            onGuestChange={onGuestChange}
                            department={department}
                            location={location}
                            guest={guest}
                            cart={cart}
                            setCart={setCart}
                            columns={columns}
                            tableData={tableData}
                            onChange={handleFormValueChange}
                            onSubmit={onFormSubmit}
                        />
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

export default connect(mapStateToProps, null)(InventoryAllocation);
