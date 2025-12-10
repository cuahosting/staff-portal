import React from "react";
import SearchSelect from "../../../common/select/SearchSelect";

export default function InventoryItemForm(props) {
    return (
        <form onSubmit={props.onSubmit}>
            <div className="row">
                <div className="col-md-12 pb-3">
                    <div className="form-group">
                        <label htmlFor="item_name">Item Name</label>
                        <input type="text" id="item_name" className="form-control" value={props.value.item_name} onChange={props.onChange} />
                    </div>
                </div>
                <div className="col-md-12 pb-3">
                    <label htmlFor="manufacturer_id">Select Manufacturer</label>
                    <SearchSelect
                        id="manufacturer_id"
                        name="manufacturer_id"
                        value={props.value.manufacturer_id2}
                        onChange={props.onManufacturerChange}
                        options={props.manufacturer}
                        placeholder="Select Manufacturer"
                    />
                </div>
                <div className="col-md-12 pb-3">
                    <label htmlFor="vendor_id">Select Vendor</label>
                    <SearchSelect
                        id="vendor_id"
                        name="vendor_id"
                        value={props.value.vendor_id2}
                        onChange={props.onVendorChange}
                        options={props.vendor}
                        placeholder="Select Vendor"
                    />
                </div>
                <div className="col-md-12 pb-3">
                    <label htmlFor="category_id">Select Category</label>
                    <SearchSelect
                        id="category_id"
                        name="category_id"
                        value={props.value.category_id2}
                        onChange={props.onCategoryChange}
                        options={props.category}
                        placeholder="Select Category"
                    />
                </div>

                <div className="col-md-12 pb-3">
                    <label htmlFor="sub_category_id">Select Sub Category</label>
                    <SearchSelect
                        id="sub_category_id"
                        name="sub_category_id"
                        value={props.value.sub_category_id2}
                        onChange={props.onSubCategoryChange}
                        options={props.subCategory}
                        placeholder="Select Sub Category"
                    />
                </div>

                {
                    props.isFormLoading ?
                        <button id="kt_docs_formvalidation_text_submit" type="button" className="btn btn-primary">
                            <span> Please wait... <span className="spinner-border spinner-border-sm align-middle ms-2" /> </span>
                        </button>
                        :
                        <button type="submit" className="btn btn-lg btn-block btn-primary">Submit</button>
                }            </div>
        </form>
    )
}