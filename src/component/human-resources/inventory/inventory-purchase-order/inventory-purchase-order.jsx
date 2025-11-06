import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import ReportTable from "../../../common/table/report_table";
import InventoryPurchaseOrderForm from "./inventory-purchase-order-form";
import InventoryPurchaseOrderProcessing from "./inventory-purchase-order-processing";
import InventoryPurchaseOrderUpdate from "./inventory-purchase-order-update";
import { currencyConverter } from "../../../../resources/constants";
import { serverLink } from "../../../../resources/url";
function InventoryPurchaseOrder(props)
{
    let token = props.loginData[0].token
    let DepartmentCode = props.loginData[0].DepartmentCode
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [formType, setFormType] = useState('')
    const [location, setLocation] = useState([])
    const initialValue = {
        item_id: '', request_id: '', request_type: '', requested_from: '', item_name: '', manufacturer_id: '', manufacturer_id2: '', purchase_from: '', vendor_id: '', vendor_id2: '', vendor_name: '',
        quantity: '', subject: '', body: '', phone_number: '', email_address: '', address: '', SubmittedBy: '', UpdatedBy: ''
    }
    const [formData, setFormData] = useState(initialValue);

    const [items, setItems] = useState([])
    const [items2, setItems2] = useState([])
    const [selectedOrder, setSelectedOrder] = useState({
        request_id: '',
        request_type: '',
        requested_from: '',
        requested_from_name: '',
        amount_expected: '',
        location_id: "",
        location_id2: "",
        amount_paid: '',
        balance: '',
        imagefile: "",
        htmlelement: "",
        ImagePath: "",
        image_name: "",
        view: '',
        status: '',
        inserted_by: props.loginData[0].StaffID,
    })
    const [selectedOrderItems, setSelectedOrderItems] = useState([])
    const [selectedOrderItems2, setSelectedOrderItems2] = useState([])
    const [budgetItems, setBudgetItems] = useState([])
    const [manufacturer, setManufacturer] = useState({ manufacturer_name: "", manufacturer_id: "" })
    const [vendor, setVendor] = useState({ vendor_name: "", vendor_id: "" })

    const columns = ["S/N", "Request From", "Request From ID", "Amount Expected", "Amount Paid", "Balance", "Status", "Payment", "Items", "Update", "Received Item"];
    const [tableData, setTableData] = useState([]);
    const [cart, setCart] = useState([])
    let _items2 = [];
    let _cart2 = [];

    const fetchData = async () =>
    {
        await axios.get(`${serverLink}staff/inventory/purchase-request/data/list/${DepartmentCode}`, token)
            .then(res =>
            {
                if (res.data.message === 'success')
                {
                    const rowData = []; const vendorData = []; const itemData = []; const locationData = []; let requested_from_name = "";
                    const _manufacturer = res.data.Manufacturer; const _vendor = res.data.Vendor; const _items = res.data.Items; const purchase_request_item = res.data.RequestItems; const budget_item = res.data.BudgetItem;

                    setItems(_items)
                    setItems2(_items)
                    setBudgetItems(budget_item)

                    //Set Manufacturer Dropdown Items
                    if (res.data.Manufacturer.length > 0)
                    {
                        res.data.Manufacturer.map((row) =>
                        {
                            rowData.push({ value: row.manufacturer_id, label: row.manufacturer_name })
                        });
                        setManufacturer(rowData)
                    }

                    //Set vendor Dropdown Items
                    if (res.data.Vendor.length > 0)
                    {
                        res.data.Vendor.map((row) =>
                        {
                            vendorData.push({ value: row.vendor_id, label: row.vendor_name, phone: row.phone_number, email: row.email_address, address: row.address })
                        });
                        setVendor(vendorData)
                    }

                    //Set Location Dropdown Items
                    if (res.data.Location.length > 0)
                    {
                        res.data.Location.map((row) =>
                        {
                            locationData.push({ value: row.location_id, label: row.location_name })
                        });
                        setLocation(locationData)
                    }


                    const row = [];
                    if (res.data.ItemView.length > 0)
                    {
                        res.data.ItemView.map((r, i) =>
                        {
                            let selected_order = purchase_request_item.filter(e => e.request_id.toString() === r.request_id.toString());
                            row.push([i + 1, r.request_type, r.requested_from, currencyConverter(r.amount_expected), currencyConverter(r.amount_paid), currencyConverter(r.balance), r.status, r.payment_status,
                            (
                                purchase_request_item.filter(e => e.request_id.toString() === r.request_id.toString()).length === 0 ? '--' :
                                    <table className={"table table-bordered table-row-bordered table-striped"} style={{ border: '1px solid #eeeeee' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ border: '1px solid #cccccc' }}>Item</th>
                                                <th style={{ border: '1px solid #cccccc' }}>Relevant Budget Item</th>
                                                <th style={{ border: '1px solid #cccccc' }}>Unit Price</th>
                                                <th style={{ border: '1px solid #cccccc' }}>Qty</th>
                                                <th style={{ border: '1px solid #cccccc' }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                purchase_request_item.filter(e => e.request_id.toString() === r.request_id.toString()).map((d, p) =>
                                                {
                                                    return (
                                                        <tr key={p}>
                                                            <td style={{ border: '1px solid #cccccc' }}>{d.item_name}</td>
                                                            <td style={{ border: '1px solid #cccccc' }}>{d.budget_item_name}</td>
                                                            <td style={{ border: '1px solid #cccccc' }}>{currencyConverter(d.amount)}</td>
                                                            <td style={{ border: '1px solid #cccccc' }}>{d.quantity}</td>
                                                            <td style={{ border: '1px solid #cccccc' }}>{currencyConverter(d.total)}</td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                            ),
                            r.status === "pending" ? (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                    {
                                        if (r.request_type === "Manufacturer")
                                        {
                                            if (_manufacturer.length > 0)
                                            {
                                                requested_from_name = _manufacturer.filter(e => e.manufacturer_id.toString() === r.requested_from.toString())[0]?.manufacturer_name;
                                            }
                                        } else
                                        {
                                            if (_vendor.length > 0)
                                            {
                                                requested_from_name = _vendor.filter(e => e.vendor_id.toString() === r.requested_from.toString())[0]?.vendor_name;
                                            }
                                        }
                                        setFormType("Update Inventory Purchase Order Form");
                                        setSelectedOrderItems(selected_order)
                                        setSelectedOrderItems2(selected_order)
                                        setSelectedOrder({
                                            ...selectedOrder,
                                            request_id: r.request_id,
                                            request_type: r.request_type,
                                            requested_from: r.requested_from,
                                            requested_from_name: requested_from_name,
                                            amount_expected: r.amount_expected,
                                            amount_paid: r.amount_paid,
                                            balance: r.balance,
                                            status: r.status,
                                        })
                                    }
                                    }
                                >
                                    <i className="fa fa-pen" />
                                </button>
                            ) : "--",
                            r.status === "pending" ? (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                    {
                                        if (r.request_type === "Manufacturer")
                                        {
                                            if (_manufacturer.length > 0)
                                            {
                                                requested_from_name = _manufacturer.filter(e => e.manufacturer_id.toString() === r.requested_from.toString())[0]?.manufacturer_name;
                                            }
                                        } else
                                        {
                                            if (_vendor.length > 0)
                                            {
                                                requested_from_name = _vendor.filter(e => e.vendor_id.toString() === r.requested_from.toString())[0]?.vendor_name;
                                            }
                                        }
                                        setFormType("Receive Inventory Purchase Order Form");
                                        setSelectedOrderItems(selected_order)
                                        setSelectedOrder({
                                            ...selectedOrder,
                                            request_id: r.request_id,
                                            request_type: r.request_type,
                                            requested_from: r.requested_from,
                                            amount_expected: r.amount_expected,
                                            requested_from_name: requested_from_name,
                                            amount_paid: r.amount_paid,
                                            balance: r.balance,
                                            status: r.status,
                                        })
                                    }
                                    }
                                >
                                    <i className="fa fa-arrow-circle-down" />
                                </button>
                            ) : "--"
                            ])
                        })
                        setTableData(row)
                    }
                } else
                {
                    toast.info("Something went wrong. Please try again!")
                }
                setIsLoading(false)
            })
            .catch(e =>
            {
                toast.error(`${e.response.statusText}: ${e.response.data}`)
            })
    }

    useEffect(() =>
    {
        fetchData()
    }, [])

    const handleFormValueChange = (e) =>
    {
        if (e.target.id === "purchase_from")
        {
            document.getElementById('vendor_select').style.display = "none";
            document.getElementById('manufacturer_select').style.display = "none";
            document.getElementById('items_section').style.display = "none";
            document.getElementById('selected_items_section').style.display = "none";
            if (e.target.value === "Manufacturer")
            {
                document.getElementById('manufacturer_select').style.display = "block";
            } else if (e.target.value === "Vendor")
            {
                document.getElementById('vendor_select').style.display = "block";
            } else
            {
                document.getElementById('vendor_select').style.display = "none";
                document.getElementById('manufacturer_select').style.display = "none";
            }
            setFormData({
                ...formData,
                [e.target.id]: e.target.value,
                manufacturer_id: "",
                manufacturer_id2: "",
                vendor_id: "",
                vendor_id2: "",
            })
        } else
        {
            setFormData({
                ...formData,
                [e.target.id]: e.target.value
            })
        }

    }

    const onManufacturerChange = (e) =>
    {
        setFormData({
            ...formData,
            manufacturer_id: e.value,
            manufacturer_id2: e,
        })
    }

    const onVendorChange = (e) =>
    {
        setFormData({
            ...formData,
            vendor_id: e.value,
            vendor_name: e.label,
            vendor_id2: e,
            phone_number: e.phone,
            email_address: e.email,
            address: e.address,
        })
    }

    const onLocationChange = (e) =>
    {
        setSelectedOrder({
            ...selectedOrder,
            location_id: e.value,
            location_id2: e,
            location_name: e.label,
        })
    }

    const onFormSubmit = async (e) =>
    {
        e.preventDefault();
        let request_type = "";
        let requested_from = "";

        if (cart.length < 1)
        {
            toast.error("Please select at least 1 item");
            return false;
        }
        if (formData.purchase_from.toString().trim() === "")
        {
            toast.error("Please select where you are purchasing from");
            return false;
        }

        if (formData.purchase_from.toString().trim() === "Manufacturer")
        {
            if (formData.manufacturer_id.toString().trim() === "")
            {
                toast.error("Please Select the Manufacturer");
                return false;
            }
            request_type = "Manufacturer";
            requested_from = formData.manufacturer_id;
        } else
        {
            if (formData.vendor_id.toString().trim() === "")
            {
                toast.error("Please Select the Vendor");
                return false;
            }
            request_type = "Vendor";
            requested_from = formData.vendor_id;
        }


        let sendData = {
            ...formData,
            cart: cart,
            request_type: request_type,
            requested_from: requested_from,
            inserted_by: props.loginData[0].StaffID,
            updated_by: props.loginData[0].StaffID
        }
        setIsFormLoading(true)
        if (formData.request_id === '')
        {
            await axios
                .post(`${serverLink}staff/inventory/purchase_request/add`, sendData, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
                        toast.success("Form Submitted Successfully");
                        fetchData();
                        setFormData({ ...formData, ...initialValue })
                        setCart([])
                        setIsFormLoading(false)
                        document.getElementById("closeModal").click();
                    } else
                    {
                        setIsFormLoading(false)
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) =>
                {
                    setIsFormLoading(false)
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });

        } else
        {

            await axios
                .patch(`${serverLink}staff/inventory/item/update`, sendData, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
                        toast.success("Item Updated Successfully");
                        fetchData();
                        setFormData({ ...formData, ...initialValue })
                        setIsFormLoading(false)
                        document.getElementById("closeModal").click();
                    } else
                    {
                        setIsFormLoading(false)
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) =>
                {
                    setIsFormLoading(false)
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    }

    const onUpdate = async (e) =>
    {
        e.preventDefault();
        let send_data = [];
        let total_amount_paid = 0;
        let request_order = selectedOrder;
        let amount_paid = document.getElementById("amount_paid").value;
        let input = document.getElementsByClassName("amount");
        let qtr_input = document.getElementsByClassName("quantity");
        for (let i = 0; i < input.length; i++)
        {
            if (input[i].value.toString() === "")
            {
                showAlert("Empty Field", "Item amount cannot be empty, use 0 instead", "error");
                return false;
                break;
            }

            let request_id = +input[i].getAttribute("request_id");
            let item_id = +input[i].getAttribute("item_id");
            let quantity_received = +input[i].getAttribute("quantity_received");
            let quantity2 = +qtr_input[i].value;
            let amount_paid = parseFloat(input[i].value);
            let total_amount = amount_paid * quantity2;
            total_amount_paid += +total_amount;

            // let payment_status = balance < 1 ? "paid" : "unpaid";
            send_data.push({ amount: amount_paid, total: total_amount, request_id: request_id, quantity: quantity2, quantity_received: quantity_received, item_id: item_id })
        }
        let balance = total_amount_paid - amount_paid;
        let sendData = {
            ...selectedOrder,
            data: send_data,
            balance: balance,
            amount_expected: total_amount_paid,
            request_id: request_order?.request_id,
            inserted_by: props.loginData[0].StaffID,
            updated_by: props.loginData[0].StaffID
        }

        setIsFormLoading(true)

        await axios
            .post(`${serverLink}staff/inventory/purchase_request/update`, sendData, token)
            .then((result) =>
            {
                if (result.data.message === "success")
                {
                    toast.success("Purchase Order Updated Successfully");
                    fetchData();
                    setSelectedOrder({
                        ...selectedOrder,
                        request_id: '',
                        request_type: '',
                        requested_from: '',
                        amount_expected: '',
                        amount_paid: '',
                        balance: '',
                        status: '',
                    })
                    setIsFormLoading(false)
                    document.getElementById("closeModal").click();
                } else
                {
                    setIsFormLoading(false)
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            })
            .catch((error) =>
            {
                setIsFormLoading(false)
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            });
    }

    const onReceiveItems = async (e) =>
    {
        e.preventDefault();
        let send_data = [];
        let total_amount_paid = 0;
        let request_order = selectedOrder;
        let amount_paid = document.getElementById("amount_paid").value;
        let input = document.getElementsByClassName("amount");
        let qtr_input = document.getElementsByClassName("quantity");
        for (let i = 0; i < qtr_input.length; i++)
        {
            if (qtr_input[i].value.toString() === "")
            {
                showAlert("Empty Field", "Item amount cannot be empty, use 0 instead", "error");
                return false;
                break;
            }

            let request_id = +qtr_input[i].getAttribute("request_id");
            let item_id = +qtr_input[i].getAttribute("item_id");
            let amount = +qtr_input[i].getAttribute("amount");
            let item_name = qtr_input[i].getAttribute("item_name");
            let quantity2 = +qtr_input[i].value;
            let total_amount = amount * quantity2;
            total_amount_paid += +total_amount;

            let status = quantity2 < 1 ? "pending" : "received";
            send_data.push({ amount: amount, total: total_amount, request_id: request_id, quantity: quantity2, item_id: item_id, item_name: item_name, status: status })
        }

        if (selectedOrder.location_id.toString().trim() === "")
        {
            toast.error("Please select storage location");
            return false;
        }

        let balance = total_amount_paid - amount_paid;
        let sendData = {
            ...selectedOrder,
            data: send_data,
            balance: balance,
            status: "received",
            amount_expected: total_amount_paid,
            request_id: request_order?.request_id,
            inserted_by: props.loginData[0].StaffID,
            updated_by: props.loginData[0].StaffID
        }

        setIsFormLoading(true)
        // return false;

        await axios
            .post(`${serverLink}staff/inventory/purchase_request/received`, sendData, token)
            .then((result) =>
            {
                if (result.data.message === "success")
                {
                    if (sendData.imagefile !== "")
                    {
                        const formData = new FormData();
                        formData.append('photo', sendData.imagefile);
                        formData.append('entry_id', result.data.entry_id)
                        axios.patch(`${serverLink}staff/inventory/uploadItemsPhoto`, formData)
                            .then(res =>
                            {
                                if (res.data.message === "uploaded")
                                {
                                    toast.success("Purchase Order Received Successfully");
                                    fetchData();
                                    setSelectedOrder({
                                        ...selectedOrder,
                                        request_id: '',
                                        request_type: '',
                                        requested_from_name: '',
                                        amount_expected: '',
                                        amount_paid: '',
                                        location_id: '',
                                        location_id2: '',
                                        location_name: '',
                                        balance: '',
                                        status: '',
                                    })
                                    setIsFormLoading(false)
                                    document.getElementById("closeModal").click();
                                } else
                                {
                                    setIsFormLoading(false)
                                    showAlert(
                                        "ERROR",
                                        "Something went wrong uploading image. Please try again!",
                                        "error"
                                    );
                                }
                            })
                            .catch(err =>
                            {
                                setIsFormLoading(false)
                                showAlert(
                                    "ERROR",
                                    "Something went wrong. Please try again!",
                                    "error"
                                );
                                console.error('ERROR', err);
                            });
                    } else
                    {
                        toast.success("Purchase Order Received Successfully");
                        fetchData();
                        setSelectedOrder({
                            ...selectedOrder,
                            request_id: '',
                            request_type: '',
                            requested_from_name: '',
                            amount_expected: '',
                            amount_paid: '',
                            location_id: '',
                            location_id2: '',
                            location_name: '',
                            balance: '',
                            status: '',
                        })
                        setIsFormLoading(false)
                        document.getElementById("closeModal").click();
                    }

                } else
                {
                    setIsFormLoading(false)
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            })
            .catch((error) =>
            {
                setIsFormLoading(false)
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            });
    }

    const onCancel = async (e) =>
    {
        e.preventDefault();
        let send_data = [];
        let request_order = selectedOrder;
        let input = document.getElementsByClassName("amount");
        for (let i = 0; i < input.length; i++)
        {
            let request_id = +input[i].getAttribute("request_id");
            let item_id = +input[i].getAttribute("item_id");
            send_data.push({ request_id: request_id, status: "canceled", item_id: item_id })
        }
        let sendData = {
            ...selectedOrder,
            data: send_data,
            status: "canceled",
            request_id: request_order?.request_id,
            inserted_by: props.loginData[0].StaffID,
            updated_by: props.loginData[0].StaffID
        }

        setIsFormLoading(true)

        await axios
            .post(`${serverLink}staff/inventory/purchase_request/cancel`, sendData, token)
            .then((result) =>
            {
                if (result.data.message === "success")
                {
                    toast.success("Purchase Order Canceled Successfully");
                    fetchData();
                    setSelectedOrder({
                        ...selectedOrder,
                        request_id: '',
                        request_type: '',
                        requested_from: '',
                        amount_expected: '',
                        amount_paid: '',
                        balance: '',
                        status: '',
                    })
                    setIsFormLoading(false)
                    document.getElementById("closeModal").click();
                } else
                {
                    setIsFormLoading(false)
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            })
            .catch((error) =>
            {
                setIsFormLoading(false)
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            });
    }

    const onImageChange = (event) =>
    {
        if (event.target.files && event.target.files[0])
        {
            const file = event.target.files[0]
            if (file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg")
            {
            } else
            {
                showAlert("Oops!", "Only .png, .jpg and .jpeg format allowed!", "error")
                return false;
            }
            if (file.size > 2000000)
            {
                showAlert("Oops!", "max file size is 2mb", "error")
                return false;
            }

            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) =>
            {
                setSelectedOrder({
                    ...selectedOrder,
                    imagefile: event.target.files[0],
                    htmlelement: e.target.result,
                    image_name: file.name,
                    view: file.mozFullPath,
                })
            };
        }
    };


    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Inventory Purchase Order"} items={["Inventory", "Inventory Purchase Order"]} />
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
                                    {
                                        setFormType("Inventory Purchase Order Form");
                                        setFormData(initialValue);
                                    }
                                    }
                                >
                                    Generate Purchase Order
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body pt-0">
                        <ReportTable title={"Inventory Purchase Order"} columns={columns} data={tableData} />
                    </div>
                </div>
                <Modal large title={formType}>
                    {
                        formType === "Inventory Purchase Order Form" ?
                            <InventoryPurchaseOrderForm
                                value={formData}
                                manufacturer={manufacturer}
                                vendor={vendor}
                                isFormLoading={isFormLoading}
                                onManufacturerChange={onManufacturerChange}
                                onVendorChange={onVendorChange}
                                onChange={handleFormValueChange}
                                onSubmit={onFormSubmit}
                                budgetItems={budgetItems}
                                setItems={setItems}
                                items={items}
                                items2={items2}
                                cart={cart}
                                _cart2={_cart2}
                                setCart={setCart}
                            />
                            :
                            formType === "Update Inventory Purchase Order Form" ?
                                <InventoryPurchaseOrderUpdate
                                    onUpdate={onUpdate}
                                    onCancel={onCancel}
                                    isFormLoading={isFormLoading}
                                    selectedOrder={selectedOrder}
                                    setSelectedOrder={setSelectedOrder}
                                    selectedOrderItems={selectedOrderItems}
                                    selectedOrderItems2={selectedOrderItems2}
                                    setSelectedOrderItems={setSelectedOrderItems}
                                />
                                :
                                <InventoryPurchaseOrderProcessing
                                    onReceiveItems={onReceiveItems}
                                    onLocationChange={onLocationChange}
                                    onImageChange={onImageChange}
                                    isFormLoading={isFormLoading}
                                    location={location}
                                    selectedOrder={selectedOrder}
                                    setSelectedOrder={setSelectedOrder}
                                    selectedOrderItems={selectedOrderItems}
                                    setSelectedOrderItems={setSelectedOrderItems}
                                    image={selectedOrder.htmlelement}
                                />
                    }

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

export default connect(mapStateToProps, null)(InventoryPurchaseOrder);
