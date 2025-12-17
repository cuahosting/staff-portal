import React from "react";

export default function JournalForm(props) {
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
                            value={"7"}
                            className={"form-control"}
                            disabled
                            hidden
                            placeholder={"Publication Type"}
                        />
                        <input
                            type="text"
                            value={"Journal"}
                            className={"form-control"}
                            disabled
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="WorkTitle">Journal Title</label>
                        <input
                            type="text"
                            id={"WorkTitle"}
                            onChange={props.onEdit}
                            value={props.data.WorkTitle}
                            className={"form-control"}
                            placeholder={"Journal Title"}
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
                        />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="ArticleTitle">Article Title</label>
                        <input
                            type="text"
                            id={"ArticleTitle"}
                            onChange={props.onEdit}
                            value={props.data.ArticleTitle}
                            className={"form-control"}
                            placeholder={"Article Title"}
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="JournalIssueNumber">Journal Issue Number</label>
                        <input
                            type="number"
                            id={"JournalIssueNumber"}
                            onChange={props.onEdit}
                            value={props.data.JournalIssueNumber}
                            className={"form-control"}
                            placeholder={"Journal Issue Number"}
                        />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="VolumeNumber">Volume Number</label>
                        <input
                            type="number"
                            id={"VolumeNumber"}
                            onChange={props.onEdit}
                            value={props.data.VolumeNumber}
                            className={"form-control"}
                            placeholder={"Volume Number"}
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="PageRange">Page Range</label>
                        <input
                            type="text"
                            id={"PageRange"}
                            onChange={props.onEdit}
                            value={props.data.PageRange}
                            className={"form-control"}
                            placeholder={"Page Range"}
                        />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="DOI">DOI</label>
                        <input
                            type="text"
                            id={"DOI"}
                            onChange={props.onEdit}
                            value={props.data.DOI}
                            className={"form-control"}
                            placeholder={"E.g. 10.1002/pbc.22645"}
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="DatabaseName">Database</label>
                        <input
                            type="text"
                            id={"DatabaseName"}
                            onChange={props.onEdit}
                            value={props.data.DatabaseName}
                            className={"form-control"}
                            placeholder={"The online database you published the journal"}
                        />
                    </div>
                </div>
            </div>
            <div className="row">
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
                <div className="col-md-6">
                    <div className="form-group mb-4">
                        <label htmlFor="UploadFile">Attachment (if any)</label>
                        <input
                            type="file"
                            id={"UploadFile"}
                            onChange={props.onEdit}
                            className={"form-control"}
                            placeholder={"Upload File"}
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