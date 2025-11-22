import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import swal from "sweetalert";
import Select from "react-select";
import { serverLink } from "../../../../resources/url";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import Table from "../../../common/table/table";
import Modal from "../../../common/modal/modal";
import { connect } from "react-redux";
import ReportTable from "../../../common/table/report_table";
import { formatDateAndTime } from "../../../../resources/constants";

function LedgerDocuments(props) {
    const token = props.LoginDetails[0].token
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState("off");
    const columns = ["SN", "Document Type", "Inserted By", "Inserted Date", "Action"]
    const [data, setData] = useState([])

    const [documentTypes, setCreateDocumentType] = useState({
        EntryID: "",
        DocumentType: "",
        InsertedBy: props.LoginDetails[0].StaffID,
    });

    const getDocumentTypes = async () => {
        await axios.get(`${serverLink}ledger/document-types/list`, token).then((res) => {
            if (res.data.length > 0) {
                let rows = []
                res.data.map((x, i) => {
                    rows.push([
                        i + 1,
                        x.DocumentType,
                        x.InsertedBy,
                        formatDateAndTime(x.InsertedDate, "date"),
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
                        </button>
                    ])
                })
                setData(rows)
            }
            setIsLoading(false)
        }).catch((e) => { console.log(e) })

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
            await axios.post(`${serverLink}ledger/document-types/add`, documentTypes, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Document Type Added Successfully");
                        getDocumentTypes();
                        Reset();
                        document.getElementById("closeModal").click();
                    } else if (result.data.message === "exists") {
                        toast.error("Document Type already exists");
                    } else {
                        toast.error("error adding document type");
                    }
                    setisFormLoading("off");
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        } else {
            setisFormLoading("on");
            await axios
                .patch(`${serverLink}ledger/document-types/update`, documentTypes, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Document Type Updated Successfully");
                        getDocumentTypes();
                        Reset();
                        document.getElementById("closeModal").click();
                    } else {
                        toast.error("Something went wrong. Please try again!");
                    }
                    setisFormLoading("off");
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };


    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Payroll"}
                items={["Human Resources", "Payroll", "Ledger Document Types"]}
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                        <div className="card-toolbar">
                            <div
                                className="d-flex justify-content-end"
                                data-kt-customer-table-toolbar="base"
                            >
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() => Reset()}
                                >
                                    Add Document Type
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <div className="col-md-12" style={{ overflowX: "auto" }}>
                            <ReportTable data={data} columns={columns} title="Document Types" />
                        </div>
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
                                    className={"form-control mt-4 mb-5"}
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
