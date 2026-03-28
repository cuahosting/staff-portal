import React, { useEffect, useState } from "react";
import { api } from "../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import Modal from "../../common/modal/modal";
import SearchSelect from "../../common/select/SearchSelect";
import { currencyConverter, formatDateAndTime } from "../../../resources/constants";
import { useNavigate } from "react-router-dom";

const statusOptions = [
    { value: "Draft", label: "Draft" },
    { value: "Pending", label: "Pending" },
    { value: "Posted", label: "Posted" },
    { value: "Reversed", label: "Reversed" },
];

const emptyLine = { accountId: "", debitAmount: "", creditAmount: "", description: "" };

function GLJournalEntries(props) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [dataTable, setDataTable] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);
    const [filterStatus, setFilterStatus] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");

    const [journalForm, setJournalForm] = useState({
        transactionDate: "",
        description: "",
        lines: [{ ...emptyLine }, { ...emptyLine }],
    });

    const columns = ["S/N", "Action", "Journal #", "Date", "Description", "Source", "Status", "Total Amount", "Created By"];

    const getAccounts = async () => {
        const { success, data } = await api.get("staff/finance/gl/accounts/list", { postable: "1", active: "1" });
        if (success && data.success) {
            setAccountOptions((data.data || []).map((a) => ({ value: a.EntryID, label: `${a.AccountCode} - ${a.AccountName}` })));
        }
    };

    const getData = async () => {
        const params = {};
        if (filterStatus) params.status = filterStatus;
        if (filterStartDate) params.startDate = filterStartDate;
        if (filterEndDate) params.endDate = filterEndDate;

        const { success, data } = await api.get("staff/finance/gl/journals/list", params);
        if (success && data.success) {
            const journals = data.data || [];
            const rows = journals.map((item, index) => [
                index + 1,
                <button className="btn btn-info btn-sm" onClick={() => navigate(`/human-resources/general-ledger/journal-detail/${item.EntryID}`)}>
                    <i className="fa fa-eye" /> View
                </button>,
                item.JournalNumber,
                formatDateAndTime(item.TransactionDate, "date"),
                item.Description,
                item.SourceModule || "MANUAL",
                renderStatusBadge(item.Status),
                currencyConverter(item.TotalAmount),
                item.InsertedBy,
            ]);
            setDataTable(rows);
        }
        setIsLoading(false);
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case "Draft":
                return <span className="badge badge-secondary">Draft</span>;
            case "Pending":
                return <span className="badge badge-warning">Pending</span>;
            case "Posted":
                return <span className="badge badge-success">Posted</span>;
            case "Reversed":
                return <span className="badge badge-danger">Reversed</span>;
            default:
                return <span className="badge badge-secondary">{status}</span>;
        }
    };

    const updateLine = (index, field, value) => {
        const newLines = [...journalForm.lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setJournalForm({ ...journalForm, lines: newLines });
    };

    const addLine = () => {
        setJournalForm({ ...journalForm, lines: [...journalForm.lines, { ...emptyLine }] });
    };

    const removeLine = (index) => {
        if (journalForm.lines.length <= 2) {
            toast.error("Minimum 2 lines required");
            return;
        }
        const newLines = journalForm.lines.filter((_, i) => i !== index);
        setJournalForm({ ...journalForm, lines: newLines });
    };

    const totalDebit = journalForm.lines.reduce((sum, l) => sum + (parseFloat(l.debitAmount) || 0), 0);
    const totalCredit = journalForm.lines.reduce((sum, l) => sum + (parseFloat(l.creditAmount) || 0), 0);
    const isBalanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!journalForm.transactionDate) {
            toast.error("Please select a transaction date");
            return;
        }
        if (!journalForm.description.trim()) {
            toast.error("Please enter a description");
            return;
        }
        for (let i = 0; i < journalForm.lines.length; i++) {
            const line = journalForm.lines[i];
            if (!line.accountId) {
                toast.error(`Line ${i + 1}: Please select an account`);
                return;
            }
            if (!line.debitAmount && !line.creditAmount) {
                toast.error(`Line ${i + 1}: Please enter a debit or credit amount`);
                return;
            }
        }
        if (!isBalanced) {
            toast.error("Debit and Credit totals must match");
            return;
        }

        toast.info("Submitting...");
        const sendData = {
            transactionDate: journalForm.transactionDate,
            description: journalForm.description.trim(),
            lines: journalForm.lines.map((l) => ({
                accountId: typeof l.accountId === "object" ? l.accountId.value : l.accountId,
                debitAmount: parseFloat(l.debitAmount) || 0,
                creditAmount: parseFloat(l.creditAmount) || 0,
                description: l.description || "",
            })),
        };

        const { success, data } = await api.post("staff/finance/gl/journals/create", sendData);
        if (success && data.success) {
            toast.success("Journal created successfully");
            document.getElementById("closeModal").click();
            setJournalForm({ transactionDate: "", description: "", lines: [{ ...emptyLine }, { ...emptyLine }] });
            getData();
        } else if (data) {
            toast.error(data.message || "Failed to create journal");
        }
    };

    useEffect(() => {
        getAccounts();
        getData();
    }, []);

    useEffect(() => {
        if (!isLoading) getData();
    }, [filterStatus, filterStartDate, filterEndDate]);

    return isLoading ? (
        <Loader />
    ) : (
        <>
            <Modal title="Create Journal Entry" large>
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label htmlFor="transactionDate">Transaction Date</label>
                            <input
                                type="date"
                                id="transactionDate"
                                className="form-control"
                                value={journalForm.transactionDate}
                                onChange={(e) => setJournalForm({ ...journalForm, transactionDate: e.target.value })}
                            />
                        </div>
                        <div className="col-md-8">
                            <label htmlFor="jDescription">Description</label>
                            <input
                                type="text"
                                id="jDescription"
                                className="form-control"
                                value={journalForm.description}
                                onChange={(e) => setJournalForm({ ...journalForm, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="table-responsive mb-3">
                        <table className="table table-bordered align-middle">
                            <thead>
                                <tr className="fw-bolder bg-light">
                                    <th style={{ width: "5%" }}>#</th>
                                    <th style={{ width: "35%" }}>Account</th>
                                    <th style={{ width: "18%" }}>Debit</th>
                                    <th style={{ width: "18%" }}>Credit</th>
                                    <th style={{ width: "18%" }}>Description</th>
                                    <th style={{ width: "6%" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {journalForm.lines.map((line, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <SearchSelect
                                                value={line.accountId ? (typeof line.accountId === "object" ? line.accountId : accountOptions.find((o) => o.value === line.accountId)) : null}
                                                onChange={(s) => updateLine(index, "accountId", s)}
                                                options={accountOptions}
                                                placeholder="Select Account"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-control form-control-sm"
                                                value={line.debitAmount}
                                                onChange={(e) => {
                                                    updateLine(index, "debitAmount", e.target.value);
                                                    if (e.target.value) updateLine(index, "creditAmount", "");
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-control form-control-sm"
                                                value={line.creditAmount}
                                                onChange={(e) => {
                                                    updateLine(index, "creditAmount", e.target.value);
                                                    if (e.target.value) updateLine(index, "debitAmount", "");
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={line.description}
                                                onChange={(e) => updateLine(index, "description", e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <button type="button" className="btn btn-danger btn-sm" onClick={() => removeLine(index)}>
                                                <i className="fa fa-trash" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="fw-bolder bg-light">
                                    <td colSpan={2} className="text-end">
                                        Totals:
                                    </td>
                                    <td>{currencyConverter(totalDebit)}</td>
                                    <td>{currencyConverter(totalCredit)}</td>
                                    <td colSpan={2}>
                                        {isBalanced ? (
                                            <span className="text-success fw-bold">Balanced</span>
                                        ) : (
                                            <span className="text-danger fw-bold">Unbalanced</span>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="d-flex justify-content-between mb-3">
                        <button type="button" className="btn btn-light btn-sm" onClick={addLine}>
                            <i className="fa fa-plus me-1" /> Add Line
                        </button>
                    </div>

                    <button className="btn btn-primary w-100" disabled={!isBalanced}>
                        Submit Journal
                    </button>
                </form>
            </Modal>

            <div className="card" style={{ borderStyle: "none", borderWidth: "0px", width: "100%" }}>
                <div className="">
                    <PageHeader
                        title={"JOURNAL ENTRIES"}
                        items={["Human-Resources", "General Ledger", "Journal Entries"]}
                        buttons={
                            <button
                                className="btn btn-primary btn-sm"
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_general"
                                onClick={() => setJournalForm({ transactionDate: "", description: "", lines: [{ ...emptyLine }, { ...emptyLine }] })}
                            >
                                <i className="fa fa-plus me-2"></i>
                                Create Journal
                            </button>
                        }
                    />

                    <div className="row mb-4 px-3">
                        <div className="col-md-2">
                            <SearchSelect
                                value={filterStatus ? { value: filterStatus, label: filterStatus } : null}
                                onChange={(s) => setFilterStatus(s ? s.value : "")}
                                options={statusOptions}
                                isClearable
                                placeholder="Filter Status"
                            />
                        </div>
                        <div className="col-md-2">
                            <input type="date" className="form-control" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} placeholder="Start Date" />
                        </div>
                        <div className="col-md-2">
                            <input type="date" className="form-control" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} placeholder="End Date" />
                        </div>
                    </div>

                    <div className="row col-md-12" style={{ width: "100%" }}>
                        <ReportTable title="Journal Entries" columns={columns} data={dataTable} height="600px" />
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
export default connect(mapStateToProps, null)(GLJournalEntries);
