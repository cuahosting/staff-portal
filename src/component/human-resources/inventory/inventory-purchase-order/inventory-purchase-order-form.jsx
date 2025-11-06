import React, {useEffect} from "react";
import Select from "react-select";
import {toast} from "react-toastify";

export default function InventoryPurchaseOrderForm(props) {

    useEffect(() => {
        if (props.value.purchase_from !== ""){
            if (props.value.purchase_from === "Manufacturer" && props.value.manufacturer_id !==""){
                props.setCart([])
                document.getElementById('selected_items_section').style.display = "block";
                document.getElementById('items_section').style.display = "block";
                let searchData = props.items2;
                let filteredItems = searchData.filter(e=>e.manufacturer_id.toString() ===  props.value.manufacturer_id.toString())
                props.setItems([...filteredItems])
            }
        }
    },[props.value.manufacturer_id])

    useEffect(() => {
        if (props.value.purchase_from !== ""){
            if (props.value.purchase_from === "Vendor" && props.value.vendor_id !==""){
                props.setCart([])
                document.getElementById('selected_items_section').style.display = "block";
                document.getElementById('items_section').style.display = "block";
                let searchData = props.items2;
                let filteredItems = searchData.filter(e=>e.vendor_id.toString() ===  props.value.vendor_id.toString())
                props.setItems(filteredItems)
            }
        }
    },[props.value.vendor_id])

    useEffect(() => {props.setCart([])},[])

    const onItemChange = (itemData, budgetItems) => {
        if (itemData.length > 0) {
            return  itemData.map((r, i) => {
                return (
                    <tr  key={i}>
                        <td>{i+1}</td>
                        <td>{r.item_name}</td>
                        <td><select id="budget_items" className="form-control"  style={{width: '250px', height: '37px', fontSize: '12px'}}>
                            <option value="">Select Relevant Items</option>
                            {
                                budgetItems.map((item, index) => {
                                    return(
                                        <option key={index} budget_Item_id={item.EntryID} budget_amount={item.Amount} budget_quantity={item.Quantity} value={item.ItemName}>{item.ItemName} => ({item.Quantity})</option>
                                    )
                                })
                            }
                        </select></td>
                        <td><input type="number" id={`quantity-${r.item_id}`} item_id={r.item_id} className="quantity form-control" name="quantity" min={1} defaultValue={1}  style={{width: '90px', height: '35px'}}/></td>
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
        let selectElement = document.getElementById('budget_items');
        let selectedOption = selectElement.selectedOptions[0];
        let budget_Item = selectElement.value;
        let budget_Item_id = selectedOption.getAttribute('budget_Item_id');
        let budget_quantity = selectedOption.getAttribute('budget_quantity');
        let itemData = {item_id: itemSet.item_id,  item_name: itemSet.item_name, quantity: parseInt(quantity), budget_item_id: budget_Item_id,  budget_Item: budget_Item, budget_quantity: budget_quantity }

        if (budget_Item === "") {
            e.target.checked = false;
            toast.error("Please select relevant budget item");
            return false;
        }

        if (parseInt(quantity) > parseInt(budget_quantity)) {
            e.target.checked = false;
            toast.error("Quantity cannot be more than budget quantity");
            return false;
        }

        if (quantity === "" || parseInt(quantity) === 0) {
            e.target.checked = false;
            toast.error("Quantity cannot be less than 1");
            return false;
        }

        props.setCart(prevState => [...prevState.filter(e=>e.item_id.toString() !== item_id.toString()), itemData])
        props._cart2.filter(e=>e.item_id.toString() !== item_id.toString()).push(itemData)
    }

    const handleDelete = async (item) => {

        let cartData = props.cart;
        let filteredItem = cartData.filter(e=>e.item_id.toString() !== item.item_id.toString())
        props.setCart([...filteredItem])

    }

    const onSearch = (item) => {
        let value = item.target.value;
        let searchData = props.items2;
        let filteredItems = searchData.filter(e=>e.item_name.toString().toLowerCase().includes(value.toString().toLowerCase()))
        props.setItems(filteredItems)
    }


    return (
        <form onSubmit={props.onSubmit}>
            <div className="row">
                <div className="col-md-12 pb-3">
                    <div className="form-group">
                        <label htmlFor="item_name">You are purchasing from?</label>
                        <select className="form-control" name="purchase_from" id="purchase_from" value={props.value.purchase_from} onChange={props.onChange}>
                            <option value="">Select Option</option>
                            <option value="Manufacturer">Manufacturer</option>
                            <option value="Vendor">Vendor</option>
                        </select>
                    </div>
                </div>

                <div className="col-md-12 pb-4" id="vendor_select" style={{display: 'none'}}>
                    <label htmlFor="vendor_id">Select Vendor</label>
                    <Select
                        id="vendor_id"
                        name="vendor_id"
                        value={props.value.vendor_id2}
                        onChange={props.onVendorChange}
                        options={props.vendor}
                        placeholder="Select Vendor"
                    />
                </div>
                <div className="col-md-12 pb-3" id="manufacturer_select" style={{display: 'none'}}>
                    <label htmlFor="manufacturer_id">Select Manufacturer</label>
                    <Select
                        id="manufacturer_id"
                        name="manufacturer_id"
                        value={props.value.manufacturer_id2}
                        onChange={props.onManufacturerChange}
                        options={props.manufacturer}
                        placeholder="Select Manufacturer"
                    />
                </div>
                <hr/>
                <div className="col-md-12 pb-3 table-responsive" style={{maxHeight: "300px", display: 'none'}}  id="items_section">
                    <div className="form-group">
                        {/*<input type="text" id="item_name" className=" " value={props.value.item_name} onChange={props.onChange}/>*/}
                        <div className="position-relative my-1 float-end">
                                        <span  className="svg-icon svg-icon-2 position-absolute top-50 translate-middle-y ms-4">
															<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                                 xmlns="http://www.w3.org/2000/svg">
																<rect opacity="0.5" x="17.0365" y="15.1223"
                                                                      width="8.15546" height="2" rx="1"
                                                                      transform="rotate(45 17.0365 15.1223)"
                                                                      fill="currentColor"/>
																<path
                                                                    d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z"
                                                                    fill="currentColor"/>
															</svg>
														</span>
                            <input type="text" id="search" onChange={onSearch} data-kt-table-widget-4="search" className="form-control w-150px fs-7 ps-12" placeholder="Search"/>
                        </div>
                    </div>
                    <table className="table table-striped ">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Item</th>
                            <th>Budget Items</th>
                            <th>Quantity</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            onItemChange(props.items, props.budgetItems)
                        }
                        </tbody>
                    </table>

                </div>
                <div  style={{display: 'none'}}  id="selected_items_section">
                    <hr/>
                    <h2>Selected Items</h2>
                    <hr/>
                    <div className="col-md-12 table-responsive" style={{maxHeight: "300px"}}>

                        <table className="table table-striped ">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Item</th>
                                <th>Relevant Budget Items</th>
                                <th>Quantity</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                props.cart.length > 0 ?
                                    props.cart.map((item, index)=> {
                                        return(
                                            <tr key={index}>
                                                <td>{index+1}</td>
                                                <td>{item.item_name}</td>
                                                <td>{item.budget_Item}</td>
                                                <td>{item.quantity}</td>
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
                    </div>
                    {
                        props.isFormLoading ?
                            <button id="kt_docs_formvalidation_text_submit" type="button" className="btn btn-primary w-100">
                                <span> Please wait... <span className="spinner-border spinner-border-sm align-middle ms-2"/> </span>
                            </button>
                            :
                            <button type="submit" className="btn btn-lg btn-block btn-primary w-100">Submit</button>
                    }


                </div>
            </div>
        </form>
    )
}