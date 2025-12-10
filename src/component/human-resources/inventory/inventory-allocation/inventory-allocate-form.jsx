import React, { useEffect, useState } from "react";
import SearchSelect from "../../../common/select/SearchSelect";
import { toast } from "react-toastify";
import ReportTable from "../../../common/table/ReportTable";
import AGTable from "../../../common/table/AGTable";

export default function InventoryAllocateForm(props) {
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Item", field: "item_name" },
            { label: "Quantity", field: "quantity" },
            { label: "Action", field: "action" }
        ],
        rows: [],
    });

    useEffect(() => {
        if (props.cart && props.cart.length > 0) {
            const rows = props.cart.map((item, index) => ({
                sn: index + 1,
                item_name: item.item_name,
                quantity: item.quantity,
                action: (
                    <button className="btn btn-link p-0 text-danger" title="Delete" onClick={() => handleDelete(item)}>
                        <i style={{ fontSize: '15px', color: "red" }} className="fa fa-trash" />
                    </button>
                )
            }));
            setDatatable({
                ...datatable,
                rows: rows,
            });
        } else {
            setDatatable({
                ...datatable,
                rows: [],
            });
        }
    }, [props.cart]);

    useEffect(() => {
        if (props.value.employee_id !== "") {
            props.setCart([])
            document.getElementById('show_table').style.display = "block";
        } else {
            props.setCart([])
            document.getElementById('show_table').style.display = "none";
        }
    }, [props.value.employee_id]);

    useEffect(() => {
        if (props.value.location_id !== "") {
            document.getElementById('guest_details').style.display = "block";
        } else {
            document.getElementById('guest_details').style.display = "none";
        }
    }, [props.value.location_id]);

    useEffect(() => {

    }, [props.value.guest_id]);

    const handleIncrement = (item) => {
        let qty = document.getElementById(`qty-${item.item_id}`).value;
        let newQty = parseInt(qty) + 1;
        document.getElementById(`qty-${item.item_id}`).value = newQty;

        let cartData = props.cart;
        for (let i in cartData) {
            if (cartData[i].item_id.toString() === item.item_id.toString()) {
                cartData[i].quantity = newQty;
                break;
            }
        }
        props.setCart([...cartData])
    }

    const handleDecrement = (item) => {
        let qty = document.getElementById(`qty-${item.item_id}`).value;
        let newQty = parseInt(qty) - 1;
        if (newQty < 1) {
            toast.error("Quantity cannot be less than 1");
            return false;
        }
        document.getElementById(`qty-${item.item_id}`).value = newQty;

        let cartData = props.cart;
        for (let i in cartData) {
            if (cartData[i].item_id.toString() === item.item_id.toString()) {
                cartData[i].quantity = newQty;
                break;
            }
        }
        props.setCart([...cartData])
    }

    const handleDelete = async (item) => {

        let cartData = props.cart;
        let filteredItem = cartData.filter(e => e.item_id.toString() !== item.item_id.toString())
        props.setCart([...filteredItem])

    }
    return (
        <form onSubmit={props.onSubmit}>
            <div className="row">
                <div id="kt_ecommerce_edit_order_form" className="form d-flex flex-column flex-lg-row">
                    <div className="w-100 flex-lg-row-auto w-lg-450px mb-7 me-7 me-lg-10">
                        <div className="card card-flush py-4">
                            <div className="card-header">
                                <div className="card-title">
                                    <h2>Allocated Items</h2>
                                </div>
                            </div>
                            <hr />
                            <div className="card-body p-0">
                                <div className="d-flex flex-column gap-10">

                                    <div className="table-responsive-md">
                                        <AGTable data={datatable} paging={false} />
                                    </div>

                                    {
                                        props.cart.length > 0 ?
                                            <div className="col-md-12 ">
                                                <label htmlFor="location_id">Select Storage Location</label>
                                                <SearchSelect
                                                    id="location_id"
                                                    name="location_id"
                                                    value={props.value.location_id2}
                                                    onChange={props.onLocationChange}
                                                    options={props.location}
                                                    placeholder="Select Location"
                                                />
                                            </div>
                                            : <></>
                                    }

                                    <hr style={{ margin: '0px' }} />

                                    <div className="alert alert-primary" id="guest_details" style={{ display: "none" }}>
                                        <h2>Staff Details</h2>
                                        <hr style={{ margin: '5px', width: '130px' }} />
                                        <table className="table table-striped table-bordered">
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #cccccc' }}>
                                                    <th><b>Name</b></th>
                                                    <td>{props.value.full_name}</td>
                                                </tr>
                                            </thead>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #cccccc' }}>
                                                    <th><b>Email Address</b></th>
                                                    <td>{props.value.email_address}</td>
                                                </tr>
                                            </thead>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #cccccc' }}>
                                                    <th><b>Phone Number</b></th>
                                                    <td>{props.value.phone_number}</td>
                                                </tr>
                                            </thead>
                                            <thead>
                                                <tr>
                                                    <th><b>Department</b></th>
                                                    <td>{props.value.department_name}</td>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>

                                    {
                                        props.isFormLoading ?
                                            <button id="kt_docs_formvalidation_text_submit" type="button" className="btn btn-primary">
                                                <span> Please wait... <span className="spinner-border spinner-border-sm align-middle ms-2" /> </span>
                                            </button>
                                            :
                                            <button type="submit" className="btn btn-lg btn-block btn-primary">Allocate Item(s)</button>
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex flex-column flex-lg-row-fluid gap-7 gap-lg-10">
                        <div className="card card-flush py-4">
                            <div className="card-header">
                                <div className="card-title">
                                    <h2>Select Staff</h2>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <div className="d-flex flex-column gap-10">
                                    <div className="col-md-12 pb-3">
                                        <label htmlFor="employee_id">Select Staff</label>
                                        <SearchSelect
                                            id="employee_id"
                                            name="employee_id"
                                            value={props.value.employee_id2}
                                            onChange={props.onGuestChange}
                                            options={props.guest}
                                            placeholder="Select Employee"
                                        />
                                    </div>
                                    <div id="show_table" style={{ display: "none" }}>
                                        <ReportTable title={"Inventory Items"} columns={props.columns} data={props.tableData} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </form>
    )
}
