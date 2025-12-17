import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import Loader from "../../../common/loader/loader";
import Modal from "../../../common/modal/modal";
import { connect } from "react-redux";
import AGReportTable from "../../../common/table/AGReportTable";
import { currencyConverter, currentDate, formatDate, formatDateAndTime } from "../../../../resources/constants";
import SearchSelect from "../../../common/select/SearchSelect";

function LedgerEntries(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState("off");
    const columns = ["SN", "Account Number", "Amount", "Posting Type", "Posting Date", "Value Date", "Transaction Date", "Description", "Document Type", "Branch", "Account Balance", "Inserted By"]
    const [data, setData] = useState([])

    const [ledger, setledger] = useState({
        EntryID: "",
        AccountNumber: "",
        Amount: "",
        PostingType: "",
        PostingDate: formatDate(currentDate),
        ValueDate: "",
        TransactionDate: "",
        Description: "aa",
        DocumentID: "",
        BranchID: "",
        AccountBalance: "",
        IsLastEntry: "",
        InsertedBy: props.LoginDetails[0]?.StaffID,
    });

    const [ledgerAccounts, setLedgerAccounts] = useState([]);
    const [DocumentTypes, setDocumentTypes] = useState([]);
    const [branchList, setBranchList] = useState([])


    const getData = async () => {
        let doc_types = [];
        let branch_list = [];

        const ledgerAccountsRes = await api.get("ledger/ledger-accounts/list");
        if (ledgerAccountsRes.success) setLedgerAccounts(ledgerAccountsRes.data);

        const docTypesRes = await api.get("ledger/document-types/list");
        if (docTypesRes.success) {
            setDocumentTypes(docTypesRes.data);
            doc_types = docTypesRes.data;
        }

        const branchRes = await api.get("ledger/branch/list");
        if (branchRes.success) {
            setBranchList(branchRes.data);
            branch_list = branchRes.data;
        }

        await getledger(doc_types, branch_list);
    }

    const getledger = async (doc_types, branch_list) => {
        const { success, data } = await api.get("ledger/ledger-entry/list");
        if (success && data && data.length > 0) {
            let rows = []
            data.map((x, i) => {
                rows.push([
                    i + 1,
                    x.AccountNumber,
                    currencyConverter(x.Amount),
                    x.PostingType,
                    formatDateAndTime(x.PostingDate, "date"),
                    formatDateAndTime(x.ValueDate, "date"),
                    formatDateAndTime(x.TransactionDate, "date"),
                    x.Description,
                    doc_types?.filter(j => parseInt(j.EntryID) === parseInt(x.DocumentID))[0]?.DocumentType,
                    branch_list?.filter(j => parseInt(j.EntryID) === parseInt(x.BranchID))[0]?.BranchName,
                    currencyConverter(x.AccountBalance),
                    x.InsertedBy,
                    <button
                        className="btn btn-sm btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_modal_general"
                        onClick={() => {
                            setledger({
                                ...ledger,
                                EntryID: x.EntryID,
                                AccountNumber: x.AccountNumber,
                                Amount: x.Amount,
                                PostingType: x.PostingType,
                                PostingDate: x.PostingDate,
                                ValueDate: x.ValueDate,
                                TransactionDate: x.TransactionDate,
                                Description: x.Description,
                                DocumentID: x.DocumentID,
                                BranchID: x.BranchID,
                                AccountBalance: x.AccountBalance,
                                IsLastEntry: x.IsLastEntry,
                            })
                        }} >
                        <i className="fa fa-pen-alt" /> Edit
                    </button>
                ])
            })
            setData(rows)
        }
        setIsLoading(false)
    };

    useEffect(() => {
        getData();

    }, []);

    const onEdit = (e) => {
        setledger({
            ...ledger,
            [e.target.id]: e.target.value,
        });
    };

    const accountOptions = useMemo(() => {
        return ledgerAccounts.map(x => ({
            value: x.AccountNumber,
            label: `${x.AccountNumber} -- ${x.Description}`
        }));
    }, [ledgerAccounts]);

    const postingTypeOptions = [
        { value: 'Debit', label: 'Debit' },
        { value: 'Credit', label: 'Credit' }
    ];

    const branchOptions = useMemo(() => {
        return branchList.map(x => ({
            value: x.EntryID.toString(),
            label: `${x.BranchCode} -- ${x.BranchName}`
        }));
    }, [branchList]);

    const documentOptions = useMemo(() => {
        return DocumentTypes.map(x => ({
            value: x.EntryID.toString(),
            label: `${x.EntryID} -- ${x.DocumentType}`
        }));
    }, [DocumentTypes]);

    const Reset = () => {
        setledger({
            ...ledger,
            EntryID: "",
            AccountNumber: "",
            Amount: "",
            PostingType: "",
            ValueDate: "",
            TransactionDate: "",
            Description: "",
            DocumentID: "",
            BranchID: "",
            AccountBalance: "",
            IsLastEntry: "",
        });
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        setisFormLoading("on");
        const { success, data } = await api.post("ledger/ledger-entry/add", ledger);
        if (success) {
            if (data.message === "success") {
                toast.success("ledger entry Added Successfully");
                getledger();
                Reset();
                document.getElementById("closeModal").click();
            } else if (data.message === "exists") {
                toast.error("ledger entry already exists");
            } else {
                toast.error("error adding ledger entry");
            }
        } else {
            showAlert(
                "NETWORK ERROR",
                "Please check your connection and try again!",
                "error"
            );
        }
        setisFormLoading("off");
    };


    return isLoading ? (
        <Loader />
    ) : (
        <div style={{ width: '100%' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Ledger Account Entries</h3>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><a href="/">Home</a></li>
                            <li className="breadcrumb-item">Human Resources</li>
                            <li className="breadcrumb-item">Payroll</li>
                            <li className="breadcrumb-item active">Ledger Entries</li>
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
                    <i className="fa fa-plus me-2"></i>Add Entry
                </button>
            </div>

            <div className="card shadow-sm" style={{ width: '100%' }}>
                <div className="card-body p-0" style={{ width: '100%' }}>
                    <AGReportTable columns={columns} data={data} height="600px" />
                </div>
            </div>

            <Modal title={"Ledger Entry Form"} large >
                <form onSubmit={onSubmit}>
                    <div className="row">

                        <div className="col-md-8">
                            <div className="form-group mt-10 ">
                                <label htmlFor="PostingDate">Posting Date</label>
                                <SearchSelect
                                    id="AccountNumber"
                                    value={accountOptions.find(opt => opt.value === ledger.AccountNumber) || null}
                                    options={accountOptions}
                                    onChange={(selected) => onEdit({ target: { id: 'AccountNumber', value: selected?.value || '' } })}
                                    placeholder="-select account-"
                                    isClearable={false}
                                />
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="form-group mt-10 ">
                                <label htmlFor="PostingType">Posting Type</label>
                                <SearchSelect
                                    id="PostingType"
                                    value={postingTypeOptions.find(opt => opt.value === ledger.PostingType) || null}
                                    options={postingTypeOptions}
                                    onChange={(selected) => onEdit({ target: { id: 'PostingType', value: selected?.value || '' } })}
                                    placeholder="-select account-"
                                    isClearable={false}
                                />
                            </div>
                        </div>


                        <div className="col-md-4">
                            <div className="form-group mt-10 ">
                                <label htmlFor="PostingDate">Posting Date</label>
                                <input
                                    type="date"
                                    disabled
                                    required
                                    id={"PostingDate"}
                                    onChange={onEdit}
                                    value={formatDate(currentDate)}
                                    className={"form-control mt-1 mb-5"}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group mt-10">
                                <label htmlFor="ValueDate">Value Date</label>
                                <input
                                    type="date"
                                    id={"ValueDate"}
                                    onChange={onEdit}
                                    min={formatDate(currentDate)}
                                    required
                                    value={ledger.ValueDate}
                                    className={"form-control mt-1 mb-5"}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group mt-10">
                                <label htmlFor="TransactionDate">Transaction Date</label>
                                <input
                                    type="date"
                                    id={"TransactionDate"}
                                    onChange={onEdit}
                                    disabled={ledger.ValueDate === ""}
                                    required
                                    min={formatDate(ledger.ValueDate)}
                                    value={ledger.TransactionDate}
                                    className={"form-control mt-1 mb-5"}
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group mt-4">
                                <label htmlFor="Amount">Amount</label>
                                <input
                                    type="text"
                                    id={"Amount"}
                                    onChange={onEdit}
                                    required
                                    value={ledger.Amount}
                                    className={"form-control mt-1 mb-5"}
                                    placeholder={"Enter amount"}
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group mt-4" >
                                <label htmlFor="BranchID">Branch Code</label>
                                <SearchSelect
                                    id="BranchID"
                                    value={branchOptions.find(opt => opt.value === ledger.BranchID?.toString()) || null}
                                    options={branchOptions}
                                    onChange={(selected) => onEdit({ target: { id: 'BranchID', value: selected?.value || '' } })}
                                    placeholder="-select branch-"
                                    isClearable={false}
                                />
                            </div>
                        </div>

                        <div className="col-md-12">
                            <div className="form-group mt-4" >
                                <label htmlFor="DocumentID">Document ID</label>
                                <SearchSelect
                                    id="DocumentID"
                                    value={documentOptions.find(opt => opt.value === ledger.DocumentID?.toString()) || null}
                                    options={documentOptions}
                                    onChange={(selected) => onEdit({ target: { id: 'DocumentID', value: selected?.value || '' } })}
                                    placeholder="-select document-"
                                    isClearable={false}
                                />
                            </div>
                        </div>

                        <div className="col-md-12">
                            <div className="form-group mt-4">
                                <label htmlFor="Description">Description</label>
                                <textarea
                                    type="text"
                                    id={"Description"}
                                    required
                                    onChange={onEdit}
                                    value={ledger.Description}
                                    className={"form-control mt-1 mb-5"}
                                    placeholder={"Enter Description"}
                                    rows={"5"}
                                ></textarea>
                            </div>
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
export default connect(mapStateToProps, null)(LedgerEntries);
