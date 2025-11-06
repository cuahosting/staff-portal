import React from "react";

export default function InventoryCategoryForm(props) {
    return (
        <form onSubmit={props.onSubmit}>
            <div className="row">
                <div className={"row"}>
                    <div className="form-group col-md-12 mb-4">
                        <label htmlFor="category_name">Category Name</label>
                        <input
                            type="text"
                            id={"category_name"}
                            onChange={props.onChange}
                            value={props.value.category_name}
                            className={"form-control"}
                            placeholder={"Please enter Category Name"}
                        />
                    </div>
                    <div className="form-group col-md-12 mb-4">
                        <label htmlFor="description">Description</label>
                        <input
                            type="text"
                            id={"description"}
                            onChange={props.onChange}
                            value={props.value.description}
                            className={"form-control"}
                            placeholder={"Please enter Description"}
                        />
                    </div>
                </div>
                {
                    props.isFormLoading ?
                        <button id="kt_docs_formvalidation_text_submit" type="button" className="btn btn-primary">
                            <span> Please wait... <span className="spinner-border spinner-border-sm align-middle ms-2"/> </span>
                        </button>
                        :
                        <button type="submit" className="btn btn-lg btn-block btn-primary">Submit</button>
                }
            </div>
        </form>
    )
}