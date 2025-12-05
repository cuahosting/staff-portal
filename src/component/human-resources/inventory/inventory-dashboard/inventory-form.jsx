import React, {useState, useEffect} from "react";
import Select from "react-select";
import SimpleFileUpload from "react-simple-file-upload";
import {projectName, simpleFileUploadAPIKey} from "../../../../resources/url";
import {currencyConverter} from "../../../../resources/constants";
import AGTable from "../../../common/table/AGTable";

export default function InventoryForm(props) {
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "Field", field: "field" },
            { label: "Value", field: "value" }
        ],
        rows: [],
    });

    useEffect(() => {
        const rows = [
            { field: "ITEM NAME", value: props.data.ItemName || "N/A" },
            { field: "Manufacturer", value: props.data.ManufacturerName || "N/A" },
            { field: "Category", value: props.data.CategoryName || "N/A" },
            { field: "Sub Category", value: props.data.SubCategoryName || "N/A" }
        ];
        setDatatable({
            ...datatable,
            rows: rows,
        });
    }, [props.data]);

    return (
        <>
            <div className="form-group mb-4 col-md-12">
                <AGTable data={datatable} paging={false} />
                <hr/>
            </div>
            <div className="form-group mb-4 col-md-12">
                <label htmlFor="VendorID">Select Vendor</label>
                <Select
                    id="VendorID"
                    name="VendorID"
                    value={props.data.VendorID2}
                    onChange={props.onVendorChange}
                    options={props.vendor}
                    placeholder="Select Vendor"
                />
            </div>
            <div className="form-group mb-4">
                <label htmlFor="Quantity">Enter Item Quantity</label>
                <input
                    type="number"
                    id={"Quantity"}
                    onChange={props.onEdit}
                    value={props.data.Quantity}
                    className={"form-control"}
                    min={0}
                    placeholder={"Enter Item Quantity"}
                />
            </div>
            <div className="form-group mb-4">
                <label htmlFor="UnitPrice">Enter Item Unit Price</label>
                <input
                    type="number"
                    id={"UnitPrice"}
                    onChange={props.onEdit}
                    value={props.data.UnitPrice}
                    className={"form-control"}
                    min={0}
                    placeholder={"Enter Unit Price"}
                />
            </div>
            <div className="form-group mb-4 col-md-12">
                <label htmlFor="LocationID">Select Storage Location</label>
                <Select
                    id="LocationID"
                    name="LocationID"
                    value={props.data.LocationID2}
                    onChange={props.onLocationChange}
                    options={props.location}
                    placeholder="Select Location"
                />
            </div>

            <div className="form-group mb-4">
                <label htmlFor="Description">Enter Description</label>
                <textarea
                    id={"Description"}
                    onChange={props.onEdit}
                    value={props.data.Description}
                    rows={3}
                    cols={3}
                    className={"form-control"}
                    placeholder={"Enter Description"}
                />
            </div>

            <div className="form-group mb-4 col-md-12">
                <label htmlFor="file">Item Image (optional) <strong className="text-danger"><small>File must not exceed 1mb</small></strong> </label>
                <SimpleFileUpload
                    apiKey={simpleFileUploadAPIKey}
                    tag={`${projectName}-inventory-items-photo`}
                    onSuccess={props.handleUpload}
                    accepted={"image/*"}
                    maxFileSize={1}
                    preview="true"
                    width="100%"
                    height="100"
                />

                <span className="alert-info">
                    Only .jpg, .png, .jpeg are allowed
                  </span>
            </div>

            <div className="form-group mb-4 col-md-12 alert alert-danger">
                <h2>Warning!</h2>
                <p>Are you sure you want to receive the following item?</p>
                <p>
                   <b> ITEM NAME: </b> {props.data.ItemName} <br/>
                    <b> QUANTITY:  </b> {props.data.Quantity} <br/>
                    <b> UNIT PRICE:  </b> {currencyConverter(props.data.UnitPrice)} <br/>
                    <b> STORE LOCATION:  </b> {props.data.LocationName} <br/>
                    <b> VENDOR:  </b> {props.data.VendorName2} <br/>
                    <b> TOTAL:  </b> {currencyConverter(parseFloat(props.data.UnitPrice) * parseInt(props.data.Quantity))} <br/>
                </p>
            </div>

            <div className="form-group pt-2">
                <button onClick={props.onSubmit} id="kt_modal_new_address_submit" data-kt-indicator={props.isFormLoading} className="btn btn-primary w-100">
                    <span className="indicator-label">Submit</span>
                    <span className="indicator-progress">Please wait...
                            <span className="spinner-border spinner-border-sm align-middle ms-2"/>
                    </span>
                </button>
            </div>
        </>
    )
}