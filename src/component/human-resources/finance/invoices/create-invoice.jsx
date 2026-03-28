import React, { useState, useRef, useCallback } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import Loader from "../../../common/loader/loader";
import { api } from "../../../../resources/api";
import { currencyConverter } from "../../../../resources/constants";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";

function CreateInvoice(props) {
    const [studentOptions, setStudentOptions] = useState([]);
    const [selectedStudentOption, setSelectedStudentOption] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [feeSchedule, setFeeSchedule] = useState(null);
    const [semesterCode, setSemesterCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New item form
    const [newItem, setNewItem] = useState({ FeeType: "", Description: "", Amount: "" });

    const staffName = `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName || ""} ${props.loginData[0].Surname}`.trim();

    // Debounced student search
    const searchTimeout = useRef(null);

    const handleStudentSearch = useCallback((inputValue, { action }) => {
        if (action !== "input-change") return;

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (inputValue.trim().length < 2) {
            setStudentOptions([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            setIsSearching(true);
            const { success, data } = await api.post("payment/staff/search-student", { search: inputValue });
            if (success && data) {
                const options = (data || []).map(s => ({
                    value: s.StudentID,
                    label: `${s.StudentID} - ${s.Surname} ${s.FirstName} ${s.MiddleName || ""} (${s.CourseCode}, Level ${s.StudentLevel})`.trim(),
                    student: s,
                }));
                setStudentOptions(options);
            }
            setIsSearching(false);
        }, 300);
    }, []);

    const handleStudentSelect = async (selected) => {
        if (!selected) {
            // Cleared
            setSelectedStudentOption(null);
            setSelectedStudent(null);
            setInvoice(null);
            setInvoiceItems([]);
            setFeeSchedule(null);
            setSemesterCode("");
            setStudentOptions([]);
            return;
        }

        setSelectedStudentOption(selected);
        await selectStudent(selected.student);
    };

    const selectStudent = async (student) => {
        setSelectedStudent(student);
        setIsLoading(true);

        const { success, data } = await api.post("payment/staff/student-invoice", { studentId: student.StudentID });
        if (success) {
            setInvoice(data.invoice || null);
            setInvoiceItems(data.items || []);
            setFeeSchedule(data.feeSchedule || null);
            setSemesterCode(data.semesterCode || "");
        }
        setIsLoading(false);
    };

    const addItem = async () => {
        if (!newItem.FeeType.trim()) { toast.error("Please enter a fee type"); return; }
        if (!newItem.Description.trim()) { toast.error("Please enter a description"); return; }
        if (!newItem.Amount || parseFloat(newItem.Amount) <= 0) { toast.error("Please enter a valid amount"); return; }

        if (invoice) {
            // Add to existing invoice
            setIsSubmitting(true);
            const { success, data } = await api.post("payment/staff/add-invoice-item", {
                invoiceId: invoice.EntryID,
                FeeType: newItem.FeeType,
                Description: newItem.Description,
                Amount: parseFloat(newItem.Amount),
                insertedBy: staffName,
            });
            if (success && data?.message === "success") {
                toast.success("Item added to invoice");
                // Reload invoice
                await selectStudent(selectedStudent);
            } else {
                toast.error(data?.error || "Failed to add item");
            }
            setIsSubmitting(false);
        } else {
            // Add to local list (will create invoice on submit)
            setInvoiceItems(prev => [...prev, {
                FeeType: newItem.FeeType,
                Description: newItem.Description,
                Amount: parseFloat(newItem.Amount),
                isNew: true,
            }]);
        }
        setNewItem({ FeeType: "", Description: "", Amount: "" });
    };

    const removeItem = async (item, index) => {
        if (item.EntryID) {
            // Remove from existing invoice
            const confirm = await showAlert("CONFIRM", `Remove "${item.Description}" (${currencyConverter(item.Amount)}) from this invoice?`, "warning");
            if (!confirm) return;

            setIsSubmitting(true);
            const { success, data } = await api.post("payment/staff/remove-invoice-item", {
                itemId: item.EntryID,
                insertedBy: staffName,
            });
            if (success && data?.message === "success") {
                toast.success("Item removed from invoice");
                await selectStudent(selectedStudent);
            } else {
                toast.error(data?.error || "Failed to remove item");
            }
            setIsSubmitting(false);
        } else {
            // Remove from local list
            setInvoiceItems(prev => prev.filter((_, i) => i !== index));
        }
    };

    const createInvoice = async () => {
        if (invoiceItems.length === 0) { toast.error("Please add at least one item"); return; }

        setIsSubmitting(true);
        const { success, data } = await api.post("payment/staff/create-invoice", {
            studentId: selectedStudent.StudentID,
            items: invoiceItems,
            insertedBy: staffName,
        });
        if (success) {
            if (data?.message === "success") {
                showAlert("SUCCESS", "Invoice created successfully", "success");
                await selectStudent(selectedStudent);
            } else if (data?.message === "exist") {
                toast.error("Student already has an invoice for this semester. Reload to manage it.");
                await selectStudent(selectedStudent);
            } else {
                toast.error("Failed to create invoice");
            }
        }
        setIsSubmitting(false);
    };

    // Quick add from fee schedule
    const addFromSchedule = (feeType, description, amount) => {
        if (amount <= 0) return;
        setNewItem({ FeeType: feeType, Description: description, Amount: amount.toString() });
    };

    const totalAmount = invoiceItems.reduce((sum, item) => sum + parseFloat(item.Amount || 0), 0);

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Create / Manage Invoice"} items={["Human Resources", "Finance", "Invoices", "Create Invoice"]} />

            <div className="row">
                {/* Left: Search & Student Info */}
                <div className="col-lg-4">
                    {/* Search */}
                    <div className="card mb-4">
                        <div className="card-header"><h6 className="card-title mb-0">Search Student</h6></div>
                        <div className="card-body">
                            <SearchSelect
                                id="studentSearch"
                                value={selectedStudentOption}
                                options={studentOptions}
                                onChange={handleStudentSelect}
                                onInputChange={handleStudentSearch}
                                filterOption={() => true}
                                isLoading={isSearching}
                                placeholder="Type student ID or name..."
                                isClearable={true}
                                noOptionsMessage="Type at least 2 characters to search"
                            />
                        </div>
                    </div>

                    {/* Student Info */}
                    {selectedStudent && (
                        <div className="card mb-4">
                            <div className="card-header bg-primary text-white"><h6 className="card-title mb-0 text-white">Student Information</h6></div>
                            <div className="card-body">
                                <table className="table table-sm mb-0" style={{ fontSize: 13 }}>
                                    <tbody>
                                        <tr><td className="text-muted">ID</td><td className="fw-bold">{selectedStudent.StudentID}</td></tr>
                                        <tr><td className="text-muted">Name</td><td>{selectedStudent.Surname} {selectedStudent.FirstName}</td></tr>
                                        <tr><td className="text-muted">Programme</td><td>{selectedStudent.CourseCode}</td></tr>
                                        <tr><td className="text-muted">Level</td><td>{selectedStudent.StudentLevel}</td></tr>
                                        <tr><td className="text-muted">Semester</td><td>{semesterCode}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Quick Add from Fee Schedule */}
                    {feeSchedule && !invoice && (
                        <div className="card mb-4">
                            <div className="card-header"><h6 className="card-title mb-0">Fee Schedule</h6></div>
                            <div className="card-body p-0">
                                <div className="list-group list-group-flush" style={{ fontSize: 13 }}>
                                    {[
                                        { type: "Tuition", desc: "Tuition (New)", amount: feeSchedule.NewTuition },
                                        { type: "Tuition", desc: "Tuition (Returning)", amount: feeSchedule.ReturningTuition },
                                        { type: "Accommodation", desc: "Accommodation", amount: feeSchedule.Accommodation },
                                        { type: "Feeding", desc: "Feeding", amount: feeSchedule.Feeding },
                                        { type: "Laundry", desc: "Laundry", amount: feeSchedule.Laundry },
                                    ].filter(f => parseFloat(f.amount) > 0).map((f, i) => (
                                        <button key={i} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                            onClick={() => addFromSchedule(f.type, f.desc, parseFloat(f.amount))}>
                                            <span>{f.desc}</span>
                                            <span className="badge bg-primary">{currencyConverter(f.amount)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Invoice */}
                <div className="col-lg-8">
                    {!selectedStudent ? (
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <i className="fa fa-file-invoice fa-3x text-muted mb-3"></i>
                                <h5 className="text-muted">Search and select a student to manage their invoice</h5>
                            </div>
                        </div>
                    ) : isLoading ? <Loader /> : (
                        <>
                            {/* Invoice Status */}
                            {invoice && (
                                <div className={`alert ${invoice.Status === 'FullyPaid' ? 'alert-success' : invoice.Status === 'PartiallyPaid' ? 'alert-warning' : 'alert-info'} d-flex justify-content-between align-items-center`}>
                                    <div>
                                        <strong>Existing Invoice: {invoice.InvoiceNumber}</strong>
                                        <span className={`badge ms-2 ${invoice.Status === 'FullyPaid' ? 'bg-success' : invoice.Status === 'PartiallyPaid' ? 'bg-warning' : 'bg-info'}`}>{invoice.Status}</span>
                                    </div>
                                    <div style={{ fontSize: 13 }}>
                                        Paid: {currencyConverter(invoice.AmountPaid || 0)} | Balance: {currencyConverter(invoice.BalanceDue || 0)}
                                    </div>
                                </div>
                            )}

                            {/* Invoice Items */}
                            <div className="card mb-4">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h6 className="card-title mb-0">Invoice Items</h6>
                                    <span className="badge bg-dark">Total: {currencyConverter(totalAmount)}</span>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th>Fee Type</th>
                                                <th>Description</th>
                                                <th className="text-end">Amount</th>
                                                <th style={{ width: 60 }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceItems.length === 0 ? (
                                                <tr><td colSpan={4} className="text-center text-muted py-4">No items yet. Add items below or click from the fee schedule.</td></tr>
                                            ) : invoiceItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.FeeType}</td>
                                                    <td>{item.Description}</td>
                                                    <td className="text-end fw-bold">{currencyConverter(item.Amount)}</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(item, index)} disabled={isSubmitting}>
                                                            <i className="fa fa-trash" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {invoiceItems.length > 0 && (
                                                <tr className="table-dark">
                                                    <td colSpan={2} className="fw-bold">Total</td>
                                                    <td className="text-end fw-bold">{currencyConverter(totalAmount)}</td>
                                                    <td></td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Add Item Form */}
                            <div className="card mb-4">
                                <div className="card-header"><h6 className="card-title mb-0">Add Item</h6></div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-3">
                                            <label className="form-label" style={{ fontSize: 12 }}>Fee Type</label>
                                            <select className="form-select form-select-sm" value={newItem.FeeType}
                                                onChange={e => setNewItem({ ...newItem, FeeType: e.target.value })}>
                                                <option value="">Select...</option>
                                                <option value="Tuition">Tuition</option>
                                                <option value="Accommodation">Accommodation</option>
                                                <option value="Feeding">Feeding</option>
                                                <option value="Laundry">Laundry</option>
                                                <option value="Laboratory">Laboratory</option>
                                                <option value="Library">Library</option>
                                                <option value="ICT">ICT</option>
                                                <option value="Medical">Medical</option>
                                                <option value="Administrative">Administrative</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-md-5">
                                            <label className="form-label" style={{ fontSize: 12 }}>Description</label>
                                            <input type="text" className="form-control form-control-sm" placeholder="e.g. Late Registration Fee"
                                                value={newItem.Description} onChange={e => setNewItem({ ...newItem, Description: e.target.value })} />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label" style={{ fontSize: 12 }}>Amount</label>
                                            <input type="number" className="form-control form-control-sm" placeholder="0.00" min="0" step="100"
                                                value={newItem.Amount} onChange={e => setNewItem({ ...newItem, Amount: e.target.value })} />
                                        </div>
                                        <div className="col-md-2 d-flex align-items-end">
                                            <button className="btn btn-primary btn-sm w-100" onClick={addItem} disabled={isSubmitting}>
                                                {isSubmitting ? <span className="spinner-border spinner-border-sm" /> : <><i className="fa fa-plus me-1"></i> Add</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Create Invoice Button (only for new invoices) */}
                            {!invoice && invoiceItems.length > 0 && (
                                <div className="d-flex justify-content-end">
                                    <button className="btn btn-success btn-lg" onClick={createInvoice} disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <><span className="spinner-border spinner-border-sm me-2" /> Creating...</>
                                        ) : (
                                            <><i className="fa fa-check me-2"></i> Create Invoice ({currencyConverter(totalAmount)})</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(CreateInvoice);
