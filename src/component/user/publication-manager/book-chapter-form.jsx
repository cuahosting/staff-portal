import React from "react";

export default function BookChapterForm(props) {
    return (
        <>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="PublicationTypeID">Publication Type</label>
                        <input
                            type="number"
                            id={"PublicationTypeID"}
                            onChange={props.onEdit}
                            value={"2"}
                            className={"form-control"}
                            disabled
                            hidden
                        />
                        <input
                            type="text"
                            value={"Book Chapter"}
                            className={"form-control"}
                            disabled
                        />
                    </div>
                </div>
                <div className="col-md-6">
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
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
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
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="PublishedYear">Publication Date</label>
                        <input
                            type="date"
                            id={"PublishedYear"}
                            onChange={props.onEdit}
                            value={props.data.PublishedYear}
                            className={"form-control"}
                            placeholder={"Published Year"}
                        />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="Publisher">Publisher</label>
                        <input
                            type="text"
                            id={"Publisher"}
                            onChange={props.onEdit}
                            value={props.data.Publisher}
                            className={"form-control"}
                            placeholder={"Publisher"}
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="PlaceOfPublication">Place Of Publication</label>
                        <input
                            type="text"
                            id={"PlaceOfPublication"}
                            onChange={props.onEdit}
                            value={props.data.PlaceOfPublication}
                            className={"form-control"}
                            placeholder={"Place Of Publication"}
                        />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="ChapterTitle">Chapter Title</label>
                        <input
                            type="text"
                            id={"ChapterTitle"}
                            onChange={props.onEdit}
                            value={props.data.ChapterTitle}
                            className={"form-control"}
                            placeholder={"Chapter Title"}
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="ChapterNumber">Chapter Number</label>
                        <input
                            type="number"
                            id={"ChapterNumber"}
                            onChange={props.onEdit}
                            value={props.data.ChapterNumber}
                            className={"form-control"}
                            placeholder={"Chapter Number"}
                        />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="Edition">Edition</label>
                        <input
                            type="text"
                            id={"Edition"}
                            onChange={props.onEdit}
                            value={props.data.Edition}
                            className={"form-control"}
                            placeholder={"Edition"}
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="OnlineURL">Online Link</label>
                        <input
                            type="text"
                            id={"OnlineURL"}
                            onChange={props.onEdit}
                            value={props.data.OnlineURL}
                            className={"form-control"}
                            placeholder={"Online URL"}
                        />
                    </div>
                </div>
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