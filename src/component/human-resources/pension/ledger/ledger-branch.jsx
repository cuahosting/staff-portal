import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { serverLink } from "../../../../resources/url";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import Loader from "../../../common/loader/loader";
import Modal from "../../../common/modal/modal";
import { connect } from "react-redux";
import AGReportTable from "../../../common/table/AGReportTable";
import { formatDateAndTime } from "../../../../resources/constants";

function LedgerBranch(props) {
    const token = props.LoginDetails[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState("off");
    const columns = ["SN", "Action", "Branch Code", "Branch Name", "Inserted By", "Inserted Date"];
    const [data, setData] = useState([]);

    const [branches, setBranches] = useState({
        EntryID: "",
        BranchCode: "",
        BranchName: "",
        InsertedBy: props.LoginDetails[0].StaffID,
    });

    const getbranches = async () => {
        await axios.get(`${serverLink}ledger/branch/list`, token).then((res) => {
            if (res.data.length > 0) {
                let rows = [];
                res.data.map((x, i) => {
                    rows.push([
                        i + 1,
                        <button
                            className="btn btn-sm btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#kt_modal_general"
                            onClick={() => {
                                setBranches({
                                    ...branches,
                                    EntryID: x.EntryID,
                                    BranchCode: x.BranchCode,
                                    BranchName: x.BranchName
                                });
                            }}
                        >
                            <i className="fa fa-pen" />
                        </button>,
                        x.BranchCode,
                        x.BranchName,
                        x.InsertedBy,
                        formatDateAndTime(x.InsertedDate, "date")
                    ]);
                });
                setData(rows);
            }
            setIsLoading(false);
        }).catch((e) => { console.log(e); });
    };

    useEffect(() => {
        getbranches();
    }, []);

    const onEdit = (e) => {
        setBranches({
            ...branches,
            [e.target.id]: e.target.value,
        });
    };

    const Reset = () => {
        setBranches({
            ...branches,
            EntryID: "",
            BranchCode: "",
            BranchName: ""
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (branches.BranchCode === "") {
            toast.error("Please enter branch code!");
            return false;
        }
        if (branches.BranchName === "") {
            toast.error("Please enter branch name!");
            return false;
        }

        if (branches.EntryID === "") {
            setisFormLoading("on");
            await axios.post(`${serverLink}ledger/branch/add`, branches, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Branch Added Successfully");
                        getbranches();
                        Reset();
                        document.getElementById("closeModal").click();
                    } else if (result.data.message === "exists") {
                        toast.error("Branch already exists");
                    } else {
                        toast.error("Error adding branch");
                    }
                    setisFormLoading("off");
                })
                .catch((error) => {
                    showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
                });
        } else {
            setisFormLoading("on");
            await axios
                .patch(`${serverLink}ledger/branch/update`, branches, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Branch Updated Successfully");
                        getbranches();
                        Reset();
                        document.getElementById("closeModal").click();
                    } else {
                        toast.error("Something went wrong. Please try again!");
                    }
                    setisFormLoading("off");
                })
                .catch((error) => {
                    showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
                });
        }
    };

    return isLoading ? (
        <Loader />
    ) : (
        <div style={{ width: '100%' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Ledger Account Branches</h3>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><a href="/">Home</a></li>
                            <li className="breadcrumb-item">Human Resources</li>
                            <li className="breadcrumb-item">Payroll</li>
                            <li className="breadcrumb-item active">Ledger Branches</li>
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
                    <i className="fa fa-plus me-2"></i>Add Branch
                </button>
            </div>

            <div className="card shadow-sm" style={{ width: '100%' }}>
                <div className="card-body p-0" style={{ width: '100%' }}>
                    <AGReportTable columns={columns} data={data} height="600px" />
                </div>
            </div>

            <Modal title={"Ledger Branch"}>
                <form onSubmit={onSubmit}>
                    <div className="row">
                        <div className="form-group mt-4">
                            <label htmlFor="BranchCode">Branch Code</label>
                            <input
                                type="text"
                                disabled={branches.EntryID !== ""}
                                id={"BranchCode"}
                                onChange={onEdit}
                                required
                                value={branches.BranchCode}
                                className={"form-control mt-2 mb-3"}
                                placeholder={"Enter the branch code"}
                            />
                        </div>
                        <div className="form-group mt-2">
                            <label htmlFor="BranchName">Branch Name</label>
                            <input
                                type="text"
                                id={"BranchName"}
                                onChange={onEdit}
                                required
                                value={branches.BranchName}
                                className={"form-control mt-2 mb-3"}
                                placeholder={"Enter the branch name"}
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

export default connect(mapStateToProps, null)(LedgerBranch);
