import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { currencyConverter } from "../../../../resources/constants";
import AGTable from "../../../common/table/AGTable";


export default function InventoryPurchaseOrderUpdate(props) {
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Item", field: "item_name" },
            { label: "Relevant Budget Item", field: "budget_item_name" },
            { label: "Quantity", field: "quantity" },
            { label: "Unit Price", field: "unit_price" },
            { label: "Action", field: "action" }
        ],
        rows: [],
    });

    useEffect(() => {
        if (props.selectedOrderItems && props.selectedOrderItems.length > 0) {
            const rows = props.selectedOrderItems.map((item, index) => ({
                sn: index + 1,
                item_name: item.item_name,
                budget_item_name: item.budget_item_name,
                quantity: (
                    <>
                        <input type="number" hidden id={`budget-${item.budget_item_id}`} item_id={item.item_id} request_id={item.request_id} amount_paid={item.request_id} className="budget form-control" name="budget" min={1} defaultValue={item.budget_item_id} style={{ width: '80px', height: '30px' }} />
                        <input type="number" id={`quantity-${item.item_id}`} item_id={item.item_id} request_id={item.request_id} amount_paid={item.request_id} className="quantity form-control" name="quantity" min={1} defaultValue={item.quantity} style={{ width: '80px', height: '30px' }} />
                        <input type="text" hidden id={`budget_name-${item.budget_item_name}`} item_id={item.item_id} request_id={item.request_id} amount_paid={item.request_id} className="budget_name form-control" name="budget_name" min={1} defaultValue={item.budget_item_name} style={{ width: '80px', height: '30px' }} />
                    </>
                ),
                unit_price: <input type="number" id={`amount-${item.item_id}`} item_id={item.item_id} request_id={item.request_id} quantity={item.quantity} quantity_received={item.quantity_received} className="amount form-control" name="amount" min={1} defaultValue={item.amount} style={{ width: '150px', height: '30px' }} />,
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
    }, [props.selectedOrderItems]);

    const handleDelete = async (item) => {

        let cartData = props.selectedOrderItems;
        let filteredItem = cartData.filter(e => e.item_id.toString() !== item.item_id.toString())
        props.setSelectedOrderItems([...filteredItem])

    }


    return (
        <form>
            <div className="row">
                <div className="col-md-12 table-responsive mb-3">
                    <a href="#" className="d-flex align-items-center text-gray-800 fs-2 text-hover-primary me-5 mb-2" style={{ marginTop: '-5px' }}>
                        <span className="svg-icon svg-icon-1 me-1">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.3" d="M16.5 9C16.5 13.125 13.125 16.5 9 16.5C4.875 16.5 1.5 13.125 1.5 9C1.5 4.875 4.875 1.5 9 1.5C13.125 1.5 16.5 4.875 16.5 9Z" fill="currentColor" />
                                <path d="M9 16.5C10.95 16.5 12.75 15.75 14.025 14.55C13.425 12.675 11.4 11.25 9 11.25C6.6 11.25 4.57499 12.675 3.97499 14.55C5.24999 15.75 7.05 16.5 9 16.5Z" fill="currentColor" />
                                <rect x="7" y="6" width="4" height="4" rx="2" fill="currentColor" />
                            </svg>
                        </span>
                        Order From → {props.selectedOrder.request_type}</a>
                    <div className="d-flex flex-column flex-grow-1 pe-8">
                        <div className="d-flex flex-wrap">
                            <div
                                className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                <div className="d-flex align-items-center">

                                    <div className="fs-2 fw-bold counted" data-kt-countup="true"
                                        data-kt-countup-value="4500" data-kt-countup-prefix="$"
                                        data-kt-initialized="1">{currencyConverter(props.selectedOrder.amount_expected)}
                                    </div>
                                </div>
                                <div className="fw-semibold fs-6 text-gray-400">Amount Expected</div>
                            </div>
                            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                <div className="d-flex align-items-center">
                                    <div className="fs-2 fw-bold counted" data-kt-countup="true"
                                        data-kt-countup-value="80" data-kt-initialized="1">{currencyConverter(props.selectedOrder.amount_paid)}
                                    </div>
                                </div>
                                <div className="fw-semibold fs-6 text-gray-400">Amount Paid</div>
                            </div>
                            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                <div className="d-flex align-items-center">
                                    <div className="fs-2 fw-bold counted" data-kt-countup="true"
                                        data-kt-countup-value="60" data-kt-countup-prefix="%"
                                        data-kt-initialized="1">{currencyConverter(props.selectedOrder.balance)}
                                    </div>
                                </div>
                                <div className="fw-semibold fs-6 text-gray-400">Balance</div>
                            </div>
                            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                <div className="d-flex align-items-center">
                                    <div className="fs-2 fw-bold counted" data-kt-countup="true"
                                        data-kt-countup-value="60" data-kt-countup-prefix="%"
                                        data-kt-initialized="1">{props.selectedOrder.payment_status === "paid" ? <span className="text-success">Paid</span> : <span className="text-danger">UnPaid</span>}
                                    </div>
                                </div>
                                <div className="fw-semibold fs-6 text-gray-400">Payment Status</div>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <h2>Purchase Order Items</h2>
                    <hr />
                    <AGTable data={datatable} paging={false} />
                    <input type="hidden" id="amount_paid" value={+props.selectedOrder.amount_paid} hidden />
                </div>
                <hr />

                <div className="col-md-6">
                    {
                        props.selectedOrderItems.length > 0 ?
                            props.isFormLoading ?
                                <button id="kt_docs_formvalidation_text_submit" type="button" className="btn btn-primary form-control">
                                    <span> Please wait... <span className="spinner-border spinner-border-sm align-middle ms-2" /> </span>
                                </button>
                                :
                                <button type="button" onClick={props.onUpdate} className="btn btn-lg btn-block btn-primary form-control">Update Request</button> : <></>
                    }
                </div>


                <div className="col-md-6">
                    {
                        props.selectedOrderItems.length > 0 ?
                            props.isFormLoading ?
                                <button id="kt_docs_formvalidation_text_submit" type="button" className="btn btn-danger form-control">
                                    <span> Please wait... <span className="spinner-border spinner-border-sm align-middle ms-2" /> </span>
                                </button>
                                :
                                <button type="button" onClick={props.onCancel} className="btn btn-lg btn-block btn-danger form-control">Cancel Request</button> : <></>
                    }
                </div>






            </div>
        </form>
    )
}