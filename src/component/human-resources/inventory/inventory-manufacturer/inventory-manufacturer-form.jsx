import React from "react";

export default function InventoryManufacturerForm(props) {
    return (
        <form onSubmit={props.onSubmit}>
            <div className="row">
                <div className="col-md-6 pb-3">
                    <div className="form-group">
                        <label htmlFor="manufacturer_name">Manufacturer Name</label>
                        <input type="text" id="manufacturer_name" className="form-control" value={props.value.manufacturer_name} onChange={props.onChange}/>
                    </div>
                </div>
                <div className="col-md-6 pb-3">
                    <div className="form-group">
                        <label htmlFor="email_address">Email Address</label>
                        <input type="email" id="email_address" className="form-control" value={props.value.email_address} onChange={props.onChange}/>
                    </div>
                </div>
                <div className="col-md-6 pb-3">
                    <div className="form-group">
                        <label htmlFor="phone_number">Phone Number</label>
                        <input type="text" id="phone_number" className="form-control" value={props.value.phone_number} onChange={props.onChange}/>
                    </div>
                </div>
                <div className="col-md-6 pb-3">
                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input type="text" id="address" className="form-control" value={props.value.address} onChange={props.onChange}/>
                    </div>
                </div>
                <div className="col-md-12 pb-3">
                    <div className="form-group">
                        <label htmlFor="Description">Description</label>
                        <textarea rows={3} cols={3} id="description" className="form-control" value={props.value.description} onChange={props.onChange}/>
                    </div>
                </div>

                {
                    props.isFormLoading ?
                        <button id="kt_docs_formvalidation_text_submit" type="button" className="btn btn-primary">
                            <span> Please wait... <span className="spinner-border spinner-border-sm align-middle ms-2"/> </span>
                        </button>
                        :
                        <button type="submit" className="btn btn-lg btn-block btn-primary">Submit</button>
                }            </div>
        </form>
    )
}