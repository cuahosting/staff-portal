import React, { useState, useEffect } from "react";
import SearchSelect from "../../../../common/select/SearchSelect";
import AGTable from "../../../../common/table/AGTable";


export default function ItemAllocationForm(props) {
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "Field", field: "field" },
            { label: "Value", field: "value" }
        ],
        rows: [],
    });

    useEffect(() => {
        if (props.data.show === 1) {
            const rows = [
                { field: "ITEM NAME", value: props.data.ItemName || "N/A" },
                { field: "Manufacturer", value: props.data.ManufacturerName || "N/A" },
                { field: "Category", value: props.data.CategoryName || "N/A" },
                { field: "Sub Category", value: props.data.SubCategoryName || "N/A" },
                { field: "AVAILABLE QUANTITY", value: props.data.QuantityAvailable || "N/A" },
                {
                    field: "Photo",
                    value: props.data.Photo ? <img src={props.data.Photo} width={100} height={100} alt="Item" /> : "N/A"
                }
            ];
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
    }, [props.data]);

    return (
        <>
            {
                props.data.show === 1 ?
                    <div className="form-group mb-4 col-md-12">
                        <AGTable data={datatable} paging={false} />
                        <hr />
                    </div>
                    : <></>
            }
            <div className="form-group mb-4 col-md-12">
                <label htmlFor="VendorID">Select Inventory Item</label>
                <SearchSelect
                    id="InventoryID"
                    value={props.data.ItemID2}
                    onChange={props.onItemChange}
                    options={props.inventory}
                    placeholder="Select Inventory Item"
                />
            </div>
            <div className="form-group mb-4 col-md-12">
                <label htmlFor="UserID">Select Staff</label>
                <SearchSelect
                    id="UserID"
                    value={props.data.UserID2}
                    onChange={props.onStaffChange}
                    options={props.staff}
                    placeholder="Select Staff"
                />
            </div>
            <div className="form-group mb-4 col-md-12">
                <label htmlFor="DepartmentCode">Select Department</label>
                <SearchSelect
                    id="DepartmentCode"
                    value={props.data.DepartmentCode2}
                    onChange={props.onDepartmentChange}
                    options={props.department}
                    placeholder="Select Department"
                />
            </div>
            <div className="form-group mb-4">
                <label htmlFor="Quantity">Enter Quantity Given</label>
                <input
                    type="number"
                    id={"Quantity"}
                    onChange={props.onEdit}
                    value={props.data.Quantity}
                    className={"form-control"}
                    min={0}
                    placeholder={"Enter Quantity Given"}
                />
            </div>
            <div className="form-group mb-4 col-md-12">
                <label htmlFor="DepartmentCode">Select Storage Location</label>
                <SearchSelect
                    id="LocationID"
                    value={props.data.LocationID2}
                    onChange={props.onLocationChange}
                    options={props.location}
                    placeholder="Select Storage Location"
                />
            </div>

            <div className="form-group mb-4 col-md-12 alert alert-danger">
                <h2>Warning!</h2>
                <p>Are you sure you want to allocate the following item to <b>{props.data.UserName}</b> ?</p>
                <p>
                    <b> ITEM NAME: </b> {props.data.ItemName} <br />
                    <b> QUANTITY:  </b> {props.data.Quantity} <br />
                    <b> STORE LOCATION:  </b> {props.data.LocationName} <br />
                </p>
                <p> Please note that once submitted, you can't delete or alter this record!</p>
            </div>

            <div className="form-group pt-2">
                <button onClick={props.onSubmit} id="kt_modal_new_address_submit" data-kt-indicator={props.isFormLoading} className="btn btn-primary w-100">
                    <span className="indicator-label">Submit</span>
                    <span className="indicator-progress">Please wait...
                        <span className="spinner-border spinner-border-sm align-middle ms-2" />
                    </span>
                </button>
            </div>
        </>
    )
}