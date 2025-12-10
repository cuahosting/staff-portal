import React, { useState, useEffect } from "react";
import SearchSelect from "../../../common/select/SearchSelect";
import { currencyConverter } from "../../../../resources/constants";
import AGTable from "../../../common/table/AGTable";

export default function InventoryPurchaseOrderProcessing(props) {
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Item", field: "item_name" },
            { label: "Quantity Expected", field: "quantity_expected" },
            { label: "Quantity Received", field: "quantity_received" },
            { label: "Unit Price", field: "unit_price" },
            { label: "Total", field: "total" },
            { label: "Action", field: "action" }
        ],
        rows: [],
    });

    useEffect(() => {
        if (props.selectedOrderItems && props.selectedOrderItems.length > 0) {
            const rows = props.selectedOrderItems.map((item, index) => ({
                sn: index + 1,
                item_name: item.item_name,
                quantity_expected: item.quantity,
                quantity_received: <input type="number" id={`quantity-${item.item_id}`} item_id={item.item_id} request_id={item.request_id} amount={item.amount} item_name={item.item_name} className="quantity form-control" name="quantity" min={1} defaultValue={item.quantity} style={{ width: '90px', height: '30px' }} />,
                unit_price: <span style={{ color: '#888888' }}>{currencyConverter(item.amount)}</span>,
                total: <input id={`total-${item.item_id}`} className="form-control" value={currencyConverter(item.amount * +item.quantity)} total={item.amount} disabled style={{ width: '150px', height: '30px', backgroundColor: 'transparent', border: 'none' }} />,
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

        let cartData = props.cart;
        let filteredItem = cartData.filter(e => e.item_id.toString() !== item.item_id.toString())
        props.setCart([...filteredItem])

    }

    return (
        <form onSubmit={props.onReceiveItems}>
            <div className="row">
                <div className="col-md-12 table-responsive mb-3">
                    <a href="#" className="d-flex align-items-center text-gray-400 text-hover-primary me-5 mb-2">
                        <span className="svg-icon svg-icon-4 me-1">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.3" d="M16.5 9C16.5 13.125 13.125 16.5 9 16.5C4.875 16.5 1.5 13.125 1.5 9C1.5 4.875 4.875 1.5 9 1.5C13.125 1.5 16.5 4.875 16.5 9Z" fill="currentColor" />
                                <path d="M9 16.5C10.95 16.5 12.75 15.75 14.025 14.55C13.425 12.675 11.4 11.25 9 11.25C6.6 11.25 4.57499 12.675 3.97499 14.55C5.24999 15.75 7.05 16.5 9 16.5Z" fill="currentColor" />
                                <rect x="7" y="6" width="4" height="4" rx="2" fill="currentColor" />
                            </svg>
                        </span>
                        Order From => {props.selectedOrder.request_type}</a>
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
                                        data-kt-initialized="1">{props.selectedOrder.payment_status === "paid" ? <span className="text-success">Paid</span> : <span className="text-danger">Unpaid</span>}
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
                <div className="col-md-12 mb-5">
                    <label htmlFor="location_id">Select Storage Location</label>
                    <SearchSelect
                        id="location_id"
                        value={props.selectedOrder.location_id2}
                        onChange={props.onLocationChange}
                        options={props.location}
                        placeholder="Select Location"
                    />
                </div>

                <div className="col-md-12 fv-row">
                    <label className="required fs-5 fw-bold mb-2">Image</label>
                    {/*<SimpleFileUpload*/}
                    {/*    apiKey={simpleFileUploadAPIKey}*/}
                    {/*    maxFileSize={1}*/}
                    {/*    tag={simpleFileUploadFolderName + `-news`}*/}
                    {/*    onSuccess={this.props.onImageChange}*/}
                    {/*    preview="false"*/}
                    {/*    width="100%"*/}
                    {/*    height="100"*/}
                    {/*/>*/}
                    <div className="mb-3">
                        <div className="fv-row mb-2">
                            <div className="dropzone" id="kt_ecommerce_add_product_media" onClick={() => {
                                document.getElementById("photo").click()
                            }}>
                                <div className="dz-message needsclick">
                                    <i className="bi bi-image text-primary fs-3x" />
                                    <div className="ms-4 col-md-9">
                                        <h3 className="fs-5 fw-bold text-gray-900 mb-1">Click to upload.</h3>
                                        <span className="fs-7 fw-semibold text-gray-400 text-info"> {props.selectedOrder.image_name !== "" ? props.selectedOrder.image_name : "Only .jpg, .png, .jpeg are allowed"}</span>
                                    </div>
                                    <div className="col-md-2">{props.image !== "" ? <img className="img-thumbnail" width={120} height={100} srcSet={props.image !== "" ? props.image : ""} /> : ""}</div>
                                </div>
                            </div>
                        </div>
                        <span className="alert-danger"> Max of 2MB file is allowed!</span>
                    </div>
                    <input type="file" id="photo" name={"photo"} accept={"image/*"} onChange={props.onImageChange} hidden />
                </div>

                <div className="form-group mb-4 col-md-12 alert alert-danger">
                    <h2>Warning!</h2>
                    <p>Are you sure you want to receive the above items?</p>
                    <p>
                        <b> FROM => <span className="text-uppercase">{props.selectedOrder.request_type}</span>:  </b> {props.selectedOrder.requested_from_name} <br />
                        <b> TO => STORE LOCATION:  </b> {props.selectedOrder.location_name} <br />

                    </p>
                </div>

                {
                    props.selectedOrderItems.length > 0 ?
                        props.isFormLoading ?
                            <button id="kt_docs_formvalidation_text_submit" type="button" className="btn btn-primary">
                                <span> Please wait... <span className="spinner-border spinner-border-sm align-middle ms-2" /> </span>
                            </button>
                            :
                            <button type="submit" className="btn btn-lg btn-block btn-primary">Process</button> : <></>
                }




            </div>
        </form>
    )
}