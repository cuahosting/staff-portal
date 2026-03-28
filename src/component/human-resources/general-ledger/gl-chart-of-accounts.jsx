import React, { useEffect, useState } from "react";
import { api } from "../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import Modal from "../../common/modal/modal";
import SearchSelect from "../../common/select/SearchSelect";

const accountTypeOptions = [
    { value: "Asset", label: "Asset" },
    { value: "Liability", label: "Liability" },
    { value: "Equity", label: "Equity" },
    { value: "Revenue", label: "Revenue" },
    { value: "Expense", label: "Expense" },
    { value: "Contra", label: "Contra" },
];

const normalBalanceOptions = [
    { value: "Debit", label: "Debit" },
    { value: "Credit", label: "Credit" },
];

const reportMappingOptions = [
    { value: "SOFP", label: "SOFP (Balance Sheet)" },
    { value: "SOPL", label: "SOPL (Income Statement)" },
];

const cashFlowOptions = [
    { value: "Operating", label: "Operating" },
    { value: "Investing", label: "Investing" },
    { value: "Financing", label: "Financing" },
];

function GLChartOfAccounts(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState("list");
    const [accountList, setAccountList] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [dataTable, setDataTable] = useState([]);
    const [filterType, setFilterType] = useState("");
    const [filterPostable, setFilterPostable] = useState("");
    const [filterActive, setFilterActive] = useState("");
    const [parentOptions, setParentOptions] = useState([]);

    const formDataVariable = {
        entry_id: "",
        AccountCode: "",
        AccountName: "",
        AccountType: "",
        ParentAccountID: "",
        IsPostable: 1,
        IFRSClassification: "",
        CashFlowCategory: "",
        ReportMapping: "",
        NormalBalance: "",
        DisplayOrder: 0,
    };
    const [formData, setFormData] = useState(formDataVariable);

    const columns = ["S/N", "Action", "Code", "Account Name", "Type", "IFRS Classification", "Parent", "Postable", "Active"];

    const getData = async () => {
        const params = {};
        if (filterType) params.type = filterType;
        if (filterPostable !== "") params.postable = filterPostable;
        if (filterActive !== "") params.active = filterActive;

        const { success, data } = await api.get("staff/finance/gl/accounts/list", params);
        if (success && data.success) {
            const accounts = data.data || [];
            setAccountList(accounts);
            setParentOptions(accounts.map((a) => ({ value: a.EntryID, label: `${a.AccountCode} - ${a.AccountName}` })));
            buildTable(accounts);
        }
        setIsLoading(false);
    };

    const getTreeData = async () => {
        const { success, data } = await api.get("staff/finance/gl/accounts/tree");
        if (success && data.success) {
            setTreeData(data.data || []);
        }
    };

    const buildTable = (accounts) => {
        const rows = accounts.map((item, index) => [
            index + 1,
            <div className="btn-group">
                <button
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#kt_modal_general"
                    onClick={() =>
                        setFormData({
                            entry_id: item.EntryID,
                            AccountCode: item.AccountCode,
                            AccountName: item.AccountName,
                            AccountType: item.AccountType,
                            ParentAccountID: item.ParentAccountID || "",
                            IsPostable: item.IsPostable,
                            IFRSClassification: item.IFRSClassification || "",
                            CashFlowCategory: item.CashFlowCategory || "",
                            ReportMapping: item.ReportMapping || "",
                            NormalBalance: item.NormalBalance || "",
                            DisplayOrder: item.DisplayOrder || 0,
                        })
                    }
                >
                    <i className="fa fa-pen" />
                </button>
                <button
                    className={`btn btn-sm ${item.IsActive ? "btn-warning" : "btn-success"}`}
                    onClick={() => handleToggleActive(item.EntryID)}
                >
                    <i className={`fa ${item.IsActive ? "fa-ban" : "fa-check"}`} />
                </button>
            </div>,
            item.AccountCode,
            item.AccountName,
            item.AccountType,
            item.IFRSClassification || "--",
            item.ParentAccountName ? `${item.ParentAccountCode} - ${item.ParentAccountName}` : "--",
            item.IsPostable ? <span className="badge badge-success">Yes</span> : <span className="badge badge-secondary">No</span>,
            item.IsActive ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Inactive</span>,
        ]);
        setDataTable(rows);
    };

    const flattenTree = (nodes, depth = 0) => {
        let rows = [];
        nodes.forEach((node) => {
            rows.push({ ...node, depth });
            if (node.children && node.children.length > 0) {
                rows = rows.concat(flattenTree(node.children, depth + 1));
            }
        });
        return rows;
    };

    const handleToggleActive = async (id) => {
        toast.info("Updating...");
        const { success, data } = await api.patch(`staff/finance/gl/accounts/toggle-active/${id}`);
        if (success && data.success) {
            toast.success("Account status updated");
            getData();
            getTreeData();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.AccountCode || formData.AccountCode.length !== 4) {
            toast.error("Account code must be 4 digits");
            return;
        }
        if (!formData.AccountName.trim()) {
            toast.error("Please enter the account name");
            return;
        }
        if (!formData.AccountType) {
            toast.error("Please select the account type");
            return;
        }

        toast.info("Submitting...");
        const sendData = {
            AccountCode: formData.AccountCode,
            AccountName: formData.AccountName.trim(),
            AccountType: formData.AccountType,
            ParentAccountID: formData.ParentAccountID || null,
            IsPostable: formData.IsPostable ? 1 : 0,
            IFRSClassification: formData.IFRSClassification || null,
            CashFlowCategory: formData.CashFlowCategory || null,
            ReportMapping: formData.ReportMapping || null,
            NormalBalance: formData.NormalBalance || null,
            DisplayOrder: parseInt(formData.DisplayOrder) || 0,
        };

        if (formData.entry_id === "") {
            const { success, data } = await api.post("staff/finance/gl/accounts/add", sendData);
            if (success && data.success) {
                toast.success("Account added successfully");
                document.getElementById("closeModal").click();
                getData();
                getTreeData();
            } else if (data) {
                toast.error(data.message || "Failed to add account");
            }
        } else {
            const { success, data } = await api.patch(`staff/finance/gl/accounts/update/${formData.entry_id}`, sendData);
            if (success && data.success) {
                toast.success("Account updated successfully");
                document.getElementById("closeModal").click();
                getData();
                getTreeData();
            } else if (data) {
                toast.error(data.message || "Failed to update account");
            }
        }
    };

    useEffect(() => {
        getData();
        getTreeData();
    }, []);

    useEffect(() => {
        if (!isLoading) getData();
    }, [filterType, filterPostable, filterActive]);

    const treeRows = flattenTree(treeData);

    return isLoading ? (
        <Loader />
    ) : (
        <>
            <Modal title={formData.entry_id === "" ? "Add Account" : "Update Account"} large>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <div className="form-group">
                                <label htmlFor="AccountCode">Account Code (4 digits)</label>
                                <input
                                    type="text"
                                    id="AccountCode"
                                    className="form-control"
                                    maxLength={4}
                                    value={formData.AccountCode}
                                    onChange={(e) => setFormData({ ...formData, AccountCode: e.target.value.replace(/\D/g, "") })}
                                />
                            </div>
                        </div>
                        <div className="col-md-8 mb-3">
                            <div className="form-group">
                                <label htmlFor="AccountName">Account Name</label>
                                <input
                                    type="text"
                                    id="AccountName"
                                    className="form-control"
                                    value={formData.AccountName}
                                    onChange={(e) => setFormData({ ...formData, AccountName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <div className="form-group">
                                <label>Account Type</label>
                                <SearchSelect
                                    value={formData.AccountType ? { value: formData.AccountType, label: formData.AccountType } : null}
                                    onChange={(selected) => setFormData({ ...formData, AccountType: selected ? selected.value : "" })}
                                    options={accountTypeOptions}
                                    placeholder="Select Account Type"
                                />
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <div className="form-group">
                                <label>Parent Account</label>
                                <SearchSelect
                                    value={
                                        formData.ParentAccountID
                                            ? parentOptions.find((o) => o.value === formData.ParentAccountID) || null
                                            : null
                                    }
                                    onChange={(selected) => setFormData({ ...formData, ParentAccountID: selected ? selected.value : "" })}
                                    options={parentOptions}
                                    isClearable
                                    placeholder="Select Parent (optional)"
                                />
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="form-group">
                                <label>Normal Balance</label>
                                <SearchSelect
                                    value={formData.NormalBalance ? { value: formData.NormalBalance, label: formData.NormalBalance } : null}
                                    onChange={(selected) => setFormData({ ...formData, NormalBalance: selected ? selected.value : "" })}
                                    options={normalBalanceOptions}
                                    isClearable
                                    placeholder="Select Normal Balance"
                                />
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="form-group">
                                <label>Report Mapping</label>
                                <SearchSelect
                                    value={formData.ReportMapping ? { value: formData.ReportMapping, label: formData.ReportMapping } : null}
                                    onChange={(selected) => setFormData({ ...formData, ReportMapping: selected ? selected.value : "" })}
                                    options={reportMappingOptions}
                                    isClearable
                                    placeholder="Select Mapping"
                                />
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="form-group">
                                <label>Cash Flow Category</label>
                                <SearchSelect
                                    value={formData.CashFlowCategory ? { value: formData.CashFlowCategory, label: formData.CashFlowCategory } : null}
                                    onChange={(selected) => setFormData({ ...formData, CashFlowCategory: selected ? selected.value : "" })}
                                    options={cashFlowOptions}
                                    isClearable
                                    placeholder="Select Category"
                                />
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <div className="form-group">
                                <label htmlFor="IFRSClassification">IFRS Classification</label>
                                <input
                                    type="text"
                                    id="IFRSClassification"
                                    className="form-control"
                                    value={formData.IFRSClassification}
                                    onChange={(e) => setFormData({ ...formData, IFRSClassification: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-md-3 mb-3">
                            <div className="form-group">
                                <label htmlFor="DisplayOrder">Display Order</label>
                                <input
                                    type="number"
                                    id="DisplayOrder"
                                    className="form-control"
                                    value={formData.DisplayOrder}
                                    onChange={(e) => setFormData({ ...formData, DisplayOrder: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-md-3 mb-3 d-flex align-items-end">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    id="IsPostable"
                                    className="form-check-input"
                                    checked={formData.IsPostable}
                                    onChange={(e) => setFormData({ ...formData, IsPostable: e.target.checked ? 1 : 0 })}
                                />
                                <label className="form-check-label" htmlFor="IsPostable">
                                    Is Postable
                                </label>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-primary w-100">Submit</button>
                </form>
            </Modal>

            <div className="card" style={{ borderStyle: "none", borderWidth: "0px", width: "100%" }}>
                <div className="">
                    <PageHeader
                        title={"CHART OF ACCOUNTS"}
                        items={["Human-Resources", "General Ledger", "Chart of Accounts"]}
                        buttons={
                            <button
                                className="btn btn-primary btn-sm"
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_general"
                                onClick={() => setFormData(formDataVariable)}
                            >
                                <i className="fa fa-plus me-2"></i>
                                Add Account
                            </button>
                        }
                    />

                    <div className="row mb-4 px-3">
                        <div className="col-md-2">
                            <SearchSelect
                                value={filterType ? { value: filterType, label: filterType } : null}
                                onChange={(s) => setFilterType(s ? s.value : "")}
                                options={accountTypeOptions}
                                isClearable
                                placeholder="Filter by Type"
                            />
                        </div>
                        <div className="col-md-2">
                            <SearchSelect
                                value={filterPostable !== "" ? { value: filterPostable, label: filterPostable === "1" ? "Postable" : "Non-Postable" } : null}
                                onChange={(s) => setFilterPostable(s ? s.value : "")}
                                options={[
                                    { value: "1", label: "Postable" },
                                    { value: "0", label: "Non-Postable" },
                                ]}
                                isClearable
                                placeholder="Postable?"
                            />
                        </div>
                        <div className="col-md-2">
                            <SearchSelect
                                value={filterActive !== "" ? { value: filterActive, label: filterActive === "1" ? "Active" : "Inactive" } : null}
                                onChange={(s) => setFilterActive(s ? s.value : "")}
                                options={[
                                    { value: "1", label: "Active" },
                                    { value: "0", label: "Inactive" },
                                ]}
                                isClearable
                                placeholder="Status?"
                            />
                        </div>
                        <div className="col-md-6 d-flex justify-content-end">
                            <div className="btn-group">
                                <button className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setViewMode("list")}>
                                    <i className="fa fa-list me-1" /> List
                                </button>
                                <button className={`btn btn-sm ${viewMode === "tree" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setViewMode("tree")}>
                                    <i className="fa fa-sitemap me-1" /> Tree
                                </button>
                            </div>
                        </div>
                    </div>

                    {viewMode === "list" ? (
                        <div className="row col-md-12" style={{ width: "100%" }}>
                            <ReportTable title="Chart of Accounts" columns={columns} data={dataTable} height="600px" />
                        </div>
                    ) : (
                        <div className="row col-md-12 px-3" style={{ width: "100%" }}>
                            <div className="table-responsive" style={{ maxHeight: "600px", overflowY: "auto" }}>
                                <table className="table table-row-bordered table-row-gray-300 align-middle gs-3 gy-3">
                                    <thead>
                                        <tr className="fw-bolder text-muted">
                                            <th>Code</th>
                                            <th>Account Name</th>
                                            <th>Type</th>
                                            <th>Normal Balance</th>
                                            <th>Postable</th>
                                            <th>Active</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {treeRows.map((node, idx) => (
                                            <tr key={idx}>
                                                <td>{node.AccountCode}</td>
                                                <td style={{ paddingLeft: `${node.depth * 24 + 8}px` }}>
                                                    {node.depth > 0 && <span className="text-muted me-1">{"--".repeat(node.depth)}</span>}
                                                    {node.AccountName}
                                                </td>
                                                <td>{node.AccountType}</td>
                                                <td>{node.NormalBalance || "--"}</td>
                                                <td>
                                                    {node.IsPostable ? (
                                                        <span className="badge badge-success">Yes</span>
                                                    ) : (
                                                        <span className="badge badge-secondary">No</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {node.IsActive ? (
                                                        <span className="badge badge-success">Active</span>
                                                    ) : (
                                                        <span className="badge badge-danger">Inactive</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
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
export default connect(mapStateToProps, null)(GLChartOfAccounts);
