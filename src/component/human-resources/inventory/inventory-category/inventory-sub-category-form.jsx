import React from "react";
import SearchSelect from "../../../common/select/SearchSelect";

export default function InventorySubCategoryForm(props) {
    return (
        <form onSubmit={props.onSubmit}>
            <div className="row">
                <div className={"row"}>
                    <div className="form-group col-md-12 mb-4">
                        <label htmlFor="category_id">Category Name</label>
                        <SearchSelect
                            id="category_id"
                            value={props.categoryList.map(category => ({ value: category.category_id.toString(), label: category.category_name })).find(opt => opt.value === props.value.category_id?.toString()) || null}
                            options={props.categoryList.map(category => ({ value: category.category_id.toString(), label: category.category_name }))}
                            onChange={(selected) => props.onChange({ target: { id: 'category_id', value: selected?.value || '' } })}
                            placeholder="Select Category Name"
                            isClearable={false}
                        />
                    </div>

                    <div className="form-group col-md-12 mb-4">
                        <label htmlFor="sub_category_name">Sub Category Name</label>
                        <input
                            type="text"
                            id={"sub_category_name"}
                            onChange={props.onChange}
                            value={props.value.sub_category_name}
                            className={"form-control"}
                            placeholder={"Please Enter Sub Category Name"}
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
                            placeholder={"Please Enter Description"}
                        />
                    </div>
                </div>
                {
                    props.isFormLoading ?
                        <button id="kt_docs_formvalidation_text_submit" type="button" className="btn btn-primary">
                            <span> Please wait... <span className="spinner-border spinner-border-sm align-middle ms-2" /> </span>
                        </button>
                        :
                        <button type="submit" className="btn btn-lg btn-block btn-primary">Submit</button>
                }
            </div>
        </form>
    )
}