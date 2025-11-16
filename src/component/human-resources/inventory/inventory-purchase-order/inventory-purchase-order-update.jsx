import React from "react";
import {toast} from "react-toastify";
import {currencyConverter} from "../../../../resources/constants";


export default function InventoryPurchaseOrderUpdate(props) {

    const onItemChange = (itemData) => {
        const row = [];
        if (itemData.length > 0) {
            return  itemData.map((r, i) => {
                return (
                    <tr  key={i}>
                        <td>{i+1}</td>
                        <td>{r.item_name}</td>
                        <td><input type="number" id={`quantity-${r.item_id}`} item_id={r.item_id} className="quantity form-control" name="quantity" min={1} defaultValue={1}  style={{width: '90px', height: '30px'}}/></td>
                        <td><input type="button" id="checkItem" item_id={r.item_id}  data={JSON.stringify(r)} className="btn btn-sm btn-primary checkItem" name="checkItem" value={"Add"} onClick={(e)=>{ onCheck(e)  }} /></td>
                    </tr>
                )
            })
        }else{
            return (
                <tr>
                    <td className="text-center" colSpan={4}>No Record Found</td>
                </tr>
            )
        }
    }

    const onCheck = (e) => {
        let itemString = e.target.getAttribute("data");
        let itemSet = JSON.parse(itemString);
        let item_id = e.target.getAttribute("item_id");
        let quantity = document.getElementById(`quantity-${item_id}`).value;
        let itemData = {item_id: itemSet.item_id,  item_name: itemSet.item_name, quantity: parseInt(quantity) }

        if (quantity === "" || parseInt(quantity) === 0) {
            e.target.checked = false;
            toast.error("Quantity cannot be less than 1");
            return false;
        }

        props.setCart(prevState => [...prevState.filter(e=>e.item_id.toString() !== item_id.toString()), itemData])
        props._cart2.filter(e=>e.item_id.toString() !== item_id.toString()).push(itemData)
    }

    const handleDelete = async (item) => {

        let cartData = props.selectedOrderItems;
        let filteredItem = cartData.filter(e=>e.item_id.toString() !== item.item_id.toString())
        props.setSelectedOrderItems([...filteredItem])

    }


    return (
        <form>
            <div className="row">
                <div className="col-md-12 table-responsive mb-3">
                    <a href="#" className="d-flex align-items-center text-gray-800 fs-2 text-hover-primary me-5 mb-2" style={{marginTop: '-5px'}}>
                        <span className="svg-icon svg-icon-1 me-1">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.3"  d="M16.5 9C16.5 13.125 13.125 16.5 9 16.5C4.875 16.5 1.5 13.125 1.5 9C1.5 4.875 4.875 1.5 9 1.5C13.125 1.5 16.5 4.875 16.5 9Z" fill="currentColor"/>
                                <path d="M9 16.5C10.95 16.5 12.75 15.75 14.025 14.55C13.425 12.675 11.4 11.25 9 11.25C6.6 11.25 4.57499 12.675 3.97499 14.55C5.24999 15.75 7.05 16.5 9 16.5Z"  fill="currentColor"/>
                                <rect x="7" y="6" width="4" height="4" rx="2"  fill="currentColor"/>
                            </svg>
                        </span>
                        Order From {'=>'} {props.selectedOrder.request_type}</a>
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
                            <div  className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                <div className="d-flex align-items-center">
                                    <div className="fs-2 fw-bold counted" data-kt-countup="true"
                                         data-kt-countup-value="60" data-kt-countup-prefix="%"
                                         data-kt-initialized="1">{currencyConverter(props.selectedOrder.balance)}
                                    </div>
                                </div>
                                <div className="fw-semibold fs-6 text-gray-400">Balance</div>
                            </div>
                            <div  className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                <div className="d-flex align-items-center">
                                    <div className="fs-2 fw-bold counted" data-kt-countup="true"
                                         data-kt-countup-value="60" data-kt-countup-prefix="%"
                                         data-kt-initialized="1">{props.selectedOrder.payment_status === "paid" ? <span className="text-success">Paid</span> :  <span className="text-danger">UnPaid</span>}
                                    </div>
                                </div>
                                <div className="fw-semibold fs-6 text-gray-400">Payment Status</div>
                            </div>
                        </div>
                    </div>
                    <hr/>
                    <h2>Purchase Order Items</h2>
                    <hr/>
                    <table className="table table-striped ">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Item</th>
                            <th>Relevant Budget Item</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Active</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            props.selectedOrderItems.length > 0 ?
                                props.selectedOrderItems.map((item, index)=> {
                                    return(
                                        <tr key={index}>
                                            <td>{index+1}</td>
                                            <td>{item.item_name}</td>
                                            <td>{item.budget_item_name}</td>
                                            <td><input type="number" id={`quantity-${item.item_id}`} item_id={item.item_id} request_id={item.request_id}   amount_paid={item.request_id}  className="quantity form-control" name="quantity" min={1} defaultValue={item.quantity} style={{width: '80px', height: '30px'}}/></td>
                                            <td><input type="number" id={`amount-${item.item_id}`} item_id={item.item_id} request_id={item.request_id} quantity={item.quantity}  quantity_received={item.quantity_received} className="amount form-control" name="amount" min={1} defaultValue={item.amount} style={{width: '150px', height: '30px'}}/></td>
                                            <td>
                                                <i className="fa fa-trash-alt text-danger" onClick={()=>handleDelete(item)}/>
                                            </td>
                                        </tr>
                                    )
                                })
                                :
                                <tr>
                                    <td colSpan={6} className="text-center alert alert-danger"><b>No item selected, please select item.</b></td>
                                </tr>

                        }

                        </tbody>
                    </table>
                    <input type="hidden" id="amount_paid" value={+props.selectedOrder.amount_paid} hidden/>
                </div>
                <hr/>

                <div className="col-md-6">
                    {
                        props.selectedOrderItems.length > 0 ?
                            props.isFormLoading ?
                                <button id="kt_docs_formvalidation_text_submit" type="button" className="btn btn-primary form-control">
                                    <span> Please wait... <span className="spinner-border spinner-border-sm align-middle ms-2"/> </span>
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
                                    <span> Please wait... <span className="spinner-border spinner-border-sm align-middle ms-2"/> </span>
                                </button>
                                :
                                <button type="button" onClick={props.onCancel}  className="btn btn-lg btn-block btn-danger form-control">Cancel Request</button> : <></>
                    }
                </div>






            </div>
        </form>
    )
}