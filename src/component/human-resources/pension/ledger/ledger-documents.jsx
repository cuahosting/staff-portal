import React, { useEffect, useState } from "react";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import Loader from "../../../common/loader/loader";
import Modal from "../../../common/modal/modal";
import { connect } from "react-redux";
import AGReportTable from "../../../common/table/AGReportTable";
import { formatDateAndTime } from "../../../../resources/constants";

function LedgerDocuments(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState("off");
    const columns = ["SN", "Action", "Document Type", "Inserted By", "Inserted Date"]
    const [data, setData] = useState([])

    const [documentTypes, setCreateDocumentType] = useState({
        EntryID: "",
        DocumentType: "",
        InsertedBy: props.LoginDetails[0].StaffID,
    });

    const getDocumentTypes = async () => {
        const { success, data } = await api.get("ledger/document-types/list");
        if (success && data && data.length > 0) {
            let rows = []
            data.map((x, i) => {
                rows.push([
                    i + 1,
                    <button
                        className="btn btn-sm btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_modal_general"
                        onClick={() => {
                            setCreateDocumentType({
                                ...documentTypes,
                                EntryID: x.EntryID,
                                DocumentType: x.DocumentType
                            })
                        }} >
                        <i className="fa fa-pen-alt" /> Edit
                    </button>,
                    x.DocumentType,
                    x.InsertedBy,
                    formatDateAndTime(x.InsertedDate, "date")
                ])
            })
            setData(rows)
        }
        setIsLoading(false)
    };

    useEffect(() => {
        getDocumentTypes();
    }, []);

    const onEdit = (e) => {
        setCreateDocumentType({
            ...documentTypes,
            [e.target.id]: e.target.value,
        });
    };

    const Reset = () => {
        setCreateDocumentType({
            ...documentTypes,
            EntryID: "",
            DocumentType: ""
        });
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        if (documentTypes.DocumentType === "") {
            toast.error("please enter document type!")
            return false
        };

        if (documentTypes.EntryID === "") {
            setisFormLoading("on");
            const { success, data } = await api.post("ledger/document-types/add", documentTypes);
            if (success) {
                if (data.message === "success") {
                    toast.success("Document Type Added Successfully");
                    getDocumentTypes();
                    Reset();
                    document.getElementById("closeModal").click();
                } else if (data.message === "exists") {
                    toast.error("Document Type already exists");
                } else {
                    toast.error("error adding document type");
                }
            } else {
                showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
            }
            setisFormLoading("off");
        } else {
            setisFormLoading("on");
            const { success, data } = await api.patch("ledger/document-types/update", documentTypes);
            if (success) {
                if (data.message === "success") {
                    toast.success("Document Type Updated Successfully");
                    getDocumentTypes();
                    Reset();
                    document.getElementById("closeModal").click();
                } else {
                    toast.error("Something went wrong. Please try again!");
                }
            } else {
                showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
            }
            setisFormLoading("off");
        }
    };


    return isLoading ? (
        <Loader />
    ) : (
        <div style={{ width: '100%' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Ledger Document Types</h3>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><a href="/">Home</a></li>
                            <li className="breadcrumb-item">Human Resources</li>
                            <li className="breadcrumb-item">Payroll</li>
                            <li className="breadcrumb-item active">Document Types</li>
                        </ol>
                    </nav>
                </div>
                <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#kt_modal_general"
                    onClick={() => Reset()}
                >
                    <i className="fa fa-plus me-2"></i>Add Document Type
                </button>
            </div>

            <div className="card shadow-sm" style={{ width: '100%' }}>
                <div className="card-body p-0" style={{ width: '100%' }}>
                    <AGReportTable columns={columns} data={data} height="600px" />
                </div>
            </div>

            <Modal title={"Ledger Documents"}>
                <form onSubmit={onSubmit}>
                    <div className="row">
                        <div className="form-group mt-4">
                            <label htmlFor="DocumentType">Document Type</label>
                            <input
                                type="text"
                                id={"DocumentType"}
                                onChange={onEdit}
                                required
                                value={documentTypes.DocumentType}
                                className={"form-control mt-2 mb-3"}
                                placeholder={"Enter the Document Type"}
                            />
                        </div>
                    </div>
                    <div className="form-group pt-2">
                        <button
                            className="btn btn-primary w-100"
                            id="kt_modal_new_address_submit"
                            data-kt-indicator={isFormLoading}
                        >
                            <span className="indicator-label">Submit</span>
                            <span className="indicator-progress">
                                Please wait...
                                <span className="spinner-border spinner-border-sm align-middle ms-2" />
                            </span>
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        FacultyList: state.FacultyList,
    };
};
export default connect(mapStateToProps, null)(LedgerDocuments);
