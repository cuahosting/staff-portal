import React from "react";

export default function PatentForm(props) {
    return (
        <>
            <div className="form-group mb-4">
                <label htmlFor="PublicationTypeID">Publication Type</label>
                <input
                    type="number"
                    id={"PublicationTypeID"}
                    onChange={props.onEdit}
                    value={"6"}
                    className={"form-control"}
                    disabled
                    hidden
                />
                <input
                    type="text"
                    value={"Patent/Creative Work/Invention"}
                    className={"form-control"}
                    disabled
                />
            </div>
            <div className="form-group mb-4">
                <label htmlFor="WorkTitle">Publication Title</label>
                <input
                    type="text"
                    id={"WorkTitle"}
                    onChange={props.onEdit}
                    value={props.data.WorkTitle}
                    className={"form-control"}
                    placeholder={"Publication Title"}
                />
            </div>
            <div className="form-group mb-4">
                <label htmlFor="Authors">Author</label>
                <input
                    type="text"
                    id={"Authors"}
                    onChange={props.onEdit}
                    value={props.data.Authors}
                    className={"form-control"}
                    placeholder={"Authors"}
                />
            </div>
            <div className="form-group mb-4">
                <label htmlFor="PublishedYear">Date Granted</label>
                <input
                    type="date"
                    id={"PublishedYear"}
                    onChange={props.onEdit}
                    value={props.data.PublishedYear}
                    className={"form-control"}
                />
            </div>
            <div className="form-group mb-4">
                <label htmlFor="PlaceOfPublication">Locale</label>
                <input
                    type="text"
                    id={"PlaceOfPublication"}
                    onChange={props.onEdit}
                    value={props.data.PlaceOfPublication}
                    className={"form-control"}
                    placeholder={"Locale"}
                />
            </div>
            <div className="form-group mb-4">
                <label htmlFor="Assignee">Assignee</label>
                <input
                    type="text"
                    id={"Assignee"}
                    onChange={props.onEdit}
                    value={props.data.Assignee}
                    className={"form-control"}
                    placeholder={"Andy Carol"}
                />
            </div>

            <div className="form-group mb-4">
                <label htmlFor="PatentNumber">Patent Number</label>
                <input
                    type="number"
                    id={"PatentNumber"}
                    onChange={props.onEdit}
                    value={props.data.PatentNumber}
                    className={"form-control"}
                    placeholder={"Patent Number"}
                />
            </div>

            <div className="form-group mb-4">
                <label htmlFor="DatabaseName">Database</label>
                <input
                    type="text"
                    id={"DatabaseName"}
                    onChange={props.onEdit}
                    value={props.data.DatabaseName}
                    className={"form-control"}
                    placeholder={""}
                />
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