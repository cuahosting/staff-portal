import React, { useEffect, useState } from "react";
import { api } from "../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import Modal from "../../common/modal/modal";
import { currencyConverter, formatDateAndTime } from "../../../resources/constants";
import { useParams, useNavigate } from "react-router-dom";
import swal from "sweetalert";

function GLJournalDetail(props) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [journal, setJournal] = useState(null);
    const [reverseReason, setReverseReason] = useState("");
    const [editForm, setEditForm] = useState({ description: "", transactionDate: "" });

    const getJournal = async () => {
        const { success, data } = await api.get(`staff/finance/gl/journals/${id}`);
        if (success && data.success) {
            setJournal(data.data);
            setEditForm({
                description: data.data.Description,
                transactionDate: data.data.TransactionDate ? data.data.TransactionDate.split("T")[0] : "",
            });
        } else {
            toast.error("Journal not found");
            navigate("/human-resources/general-ledger/journal-entries");
        }
        setIsLoading(false);
    };

    const handleApprove = async () => {
        toast.info("Approving...");
        const { success, data } = await api.post(`staff/finance/gl/journals/approve/${id}`);
        if (success && data.success) {
            toast.success("Journal approved");
            getJournal();
        }
    };

    const handlePost = async () => {
        toast.info("Posting...");
        const { success, data } = await api.post(`staff/finance/gl/journals/post/${id}`);
        if (success && data.success) {
            toast.success("Journal posted successfully");
            getJournal();
        }
    };

    const handleReverse = async (e) => {
        e.preventDefault();
        if (!reverseReason.trim()) {
            toast.error("Please enter a reason for reversal");
            return;
        }
        toast.info("Reversing...");
        const { success, data } = await api.post(`staff/finance/gl/journals/reverse/${id}`, { reason: reverseReason.trim() });
        if (success && data.success) {
            toast.success("Journal reversed");
            document.getElementById("closeModal").click();
            setReverseReason("");
            getJournal();
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        toast.info("Updating...");
        const { success, data } = await api.patch(`staff/finance/gl/journals/update/${id}`, {
            description: editForm.description.trim(),
            transactionDate: editForm.transactionDate,
        });
        if (success && data.success) {
            toast.success("Journal updated");
            document.getElementById("close_edit_modal").click();
            getJournal();
        }
    };

    const handleDelete = () => {
        swal({
            title: "Delete Journal?",
            text: "This action cannot be undone. Are you sure?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                toast.info("Deleting...");
                const { success, data } = await api.delete(`staff/finance/gl/journals/delete/${id}`);
                if (success && data.success) {
                    toast.success("Journal deleted");
                    navigate("/human-resources/general-ledger/journal-entries");
                }
            }
        });
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case "Draft": return <span className="badge badge-secondary fs-6">Draft</span>;
            case "Pending": return <span className="badge badge-warning fs-6">Pending</span>;
            case "Posted": return <span className="badge badge-success fs-6">Posted</span>;
            case "Reversed": return <span className="badge badge-danger fs-6">Reversed</span>;
            default: return <span className="badge badge-secondary fs-6">{status}</span>;
        }
    };

    useEffect(() => {
        getJournal();
    }, [id]);

    if (isLoading) return <Loader />;
    if (!journal) return null;

    const totalDebit = (journal.lines || []).reduce((s, l) => s + (l.DebitAmount || 0), 0);
    const totalCredit = (journal.lines || []).reduce((s, l) => s + (l.CreditAmount || 0), 0);

    return (
        <>
            {/* Reverse Modal */}
            <Modal title="Reverse Journal" id="reverse_modal">
                <form onSubmit={handleReverse}>
                    <div className="mb-3">
                        <label htmlFor="reverseReason">Reason for Reversal</label>
                        <textarea
                            id="reverseReason"
                            className="form-control"
                            rows={3}
                            value={reverseReason}
                            onChange={(e) => setReverseReason(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-danger w-100">Reverse Journal</button>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal title="Edit Journal" id="edit_modal" close="close_edit_modal">
                <form onSubmit={handleEdit}>
                    <div className="mb-3">
                        <label htmlFor="editDate">Transaction Date</label>
                        <input
                            type="date"
                            id="editDate"
                            className="form-control"
                            value={editForm.transactionDate}
                            onChange={(e) => setEditForm({ ...editForm, transactionDate: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="editDesc">Description</label>
                        <input
                            type="text"
                            id="editDesc"
                            className="form-control"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                    </div>
                    <button className="btn btn-primary w-100">Update</button>
                </form>
            </Modal>

            <div className="card" style={{ borderStyle: "none", borderWidth: "0px", width: "100%" }}>
                <div className="">
                    <PageHeader
                        title={"JOURNAL DETAIL"}
                        items={["Human-Resources", "General Ledger", "Journal Detail"]}
                        buttons={
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/human-resources/general-ledger/journal-entries")}>
                                <i className="fa fa-arrow-left me-2"></i>Back to Journals
                            </button>
                        }
                    />

                    {/* Info Card */}
                    <div className="card shadow-sm mb-5 mx-3">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <strong>Journal Number:</strong>
                                    <div>{journal.JournalNumber}</div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <strong>Transaction Date:</strong>
                                    <div>{formatDateAndTime(journal.TransactionDate, "date")}</div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <strong>Status:</strong>
                                    <div>{renderStatusBadge(journal.Status)}</div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <strong>Description:</strong>
                                    <div>{journal.Description}</div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <strong>Source:</strong>
                                    <div>{journal.SourceModule || "MANUAL"}</div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <strong>Period:</strong>
                                    <div>{journal.PeriodName || "--"}</div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <strong>Created By:</strong>
                                    <div>{journal.InsertedBy} - {formatDateAndTime(journal.InsertedDate, "date")}</div>
                                </div>
                                {journal.ApprovedBy && (
                                    <div className="col-md-4 mb-3">
                                        <strong>Approved By:</strong>
                                        <div>{journal.ApprovedBy} - {formatDateAndTime(journal.ApprovedDate, "date")}</div>
                                    </div>
                                )}
                                {journal.PostedBy && (
                                    <div className="col-md-4 mb-3">
                                        <strong>Posted By:</strong>
                                        <div>{journal.PostedBy} - {formatDateAndTime(journal.PostedDate, "date")}</div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex gap-2 mt-3">
                                {journal.Status === "Draft" && (
                                    <>
                                        <button className="btn btn-success btn-sm" onClick={handleApprove}>
                                            <i className="fa fa-check me-1" /> Approve
                                        </button>
                                        <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#edit_modal">
                                            <i className="fa fa-pen me-1" /> Edit
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                                            <i className="fa fa-trash me-1" /> Delete
                                        </button>
                                    </>
                                )}
                                {journal.Status === "Pending" && (
                                    <button className="btn btn-success btn-sm" onClick={handlePost}>
                                        <i className="fa fa-paper-plane me-1" /> Post
                                    </button>
                                )}
                                {journal.Status === "Posted" && (
                                    <button className="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#reverse_modal">
                                        <i className="fa fa-undo me-1" /> Reverse
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lines Table */}
                    <div className="mx-3">
                        <div className="table-responsive">
                            <table className="table table-row-bordered table-row-gray-300 align-middle gs-3 gy-3">
                                <thead>
                                    <tr className="fw-bolder text-muted bg-light">
                                        <th>Line #</th>
                                        <th>Account Code</th>
                                        <th>Account Name</th>
                                        <th className="text-end">Debit</th>
                                        <th className="text-end">Credit</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(journal.lines || []).map((line, idx) => (
                                        <tr key={idx}>
                                            <td>{line.LineNumber}</td>
                                            <td>{line.AccountCode}</td>
                                            <td>{line.AccountName}</td>
                                            <td className="text-end">{line.DebitAmount ? currencyConverter(line.DebitAmount) : "--"}</td>
                                            <td className="text-end">{line.CreditAmount ? currencyConverter(line.CreditAmount) : "--"}</td>
                                            <td>{line.Description || "--"}</td>
                                        </tr>
                                    ))}
                                    <tr className="fw-bolder bg-light">
                                        <td colSpan={3} className="text-end">
                                            Totals:
                                        </td>
                                        <td className="text-end">{currencyConverter(totalDebit)}</td>
                                        <td className="text-end">{currencyConverter(totalCredit)}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
    };
};
export default connect(mapStateToProps, null)(GLJournalDetail);
