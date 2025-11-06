import React from "react";
import Select from "react-select";


export default function ItemAllocationForm(props) {
    return (
        <>
            {
                props.data.show === 1 ?
                    <div className="form-group mb-4 col-md-12">
                        <table className="table table-bordered table-striped fs-xl-4">
                            <thead>
                            <tr>
                                <th className="fw-bold text-uppercase" style={{width: '50%'}}>ITEM NAME</th>
                                <td>{props.data.ItemName}</td>
                            </tr>
                            <tr>
                                <th className="fw-bold text-uppercase">Manufacturer</th>
                                <td>{props.data.ManufacturerName}</td>
                            </tr>
                            <tr>
                                <th className="fw-bold text-uppercase">Category</th>
                                <td>{props.data.CategoryName}</td>
                            </tr>
                            <tr>
                                <th className="fw-bold text-uppercase">Sub Category</th>
                                <td>{props.data.SubCategoryName}</td>
                            </tr>
                            <tr>
                                <th className="fw-bold text-uppercase">AVAILABLE QUANTITY</th>
                                <td>{props.data.QuantityAvailable}</td>
                            </tr>
                            <tr>
                                <th className="fw-bold text-uppercase">Photo</th>
                                <td><img src={props.data.Photo} width={100} height={100}/></td>
                            </tr>
                            </thead>
                        </table>
                        <hr/>
                    </div>
                    : <></>
            }
            <div className="form-group mb-4 col-md-12">
                <label htmlFor="VendorID">Select Inventory Item</label>
                <Select
                    id="InventoryID"
                    name="InventoryID"
                    value={props.data.ItemID2}
                    onChange={props.onItemChange}
                    options={props.inventory}
                    placeholder="Select Inventory Item"
                />
            </div>
            <div className="form-group mb-4 col-md-12">
                <label htmlFor="UserID">Select Staff</label>
                <Select
                    id="UserID"
                    name="UserID"
                    value={props.data.UserID2}
                    onChange={props.onStaffChange}
                    options={props.staff}
                    placeholder="Select Staff"
                />
            </div>
            <div className="form-group mb-4 col-md-12">
                <label htmlFor="DepartmentCode">Select Department</label>
                <Select
                    id="DepartmentCode"
                    name="DepartmentCode"
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
                <Select
                    id="LocationID"
                    name="LocationID"
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
                    <b> ITEM NAME: </b> {props.data.ItemName} <br/>
                    <b> QUANTITY:  </b> {props.data.Quantity} <br/>
                    <b> STORE LOCATION:  </b> {props.data.LocationName} <br/>
                </p>
                <p> Please note that once submitted, you can't delete or alter this record!</p>
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