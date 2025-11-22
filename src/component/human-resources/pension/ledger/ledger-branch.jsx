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

function LedgerBranch(props) {
    const token = props.LoginDetails[0].token
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState("off");
    const columns = ["SN", "Branch Code", "Branch Name", "Inserted By", "Inserted Date", "Action"]
    const [data, setData] = useState([])

    const [branches, setBranches] = useState({
        EntryID: "",
        BranchCode: "",
        BranchName: "",
        InsertedBy: props.LoginDetails[0].StaffID,
    });

    const getbranches = async () => {
        await axios.get(`${serverLink}ledger/branch/list`, token).then((res) => {
            if (res.data.length > 0) {
                let rows = []
                res.data.map((x, i) => {
                    rows.push([
                        i + 1,
                        x.BranchCode,
                        x.BranchName,
                        x.InsertedBy,
                        formatDateAndTime(x.InsertedDate, "date"),
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
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        if (branches.BranchCode === "") {
            toast.error("please enter branch code!")
            return false
        };
        if (branches.BranchName === "") {
            toast.error("please enter branch name!")
            return false
        };

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
                        toast.error("branch already exists");
                    } else {
                        toast.error("error adding branch");
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
                .patch(`${serverLink}ledger/branch/update`, branches, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("branch Updated Successfully");
                        getbranches();
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
                items={["Human Resources", "Payroll", "Ledger Branches"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
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
                                    Add Branch
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <div className="col-md-12" style={{ overflowX: "auto" }}>
                            <ReportTable data={data} columns={columns} title="Ledger Account Branches" />
                        </div>
                    </div>
                </div>
                <Modal title={"Ledger Branch"}>
                    <form onSubmit={onSubmit}>
                        <div className="row">

                            <div className="form-group mt-4">
                                <label htmlFor="BranchCode">Branch Code</label>
                                <input
                                    type="text"
                                    disabled={branches.EntryID !== "" ? true : false}
                                    id={"BranchCode"}
                                    onChange={onEdit}
                                    required
                                    value={branches.BranchCode}
                                    className={"form-control mt-4 mb-5"}
                                    placeholder={"Enter the branch"}
                                />
                            </div>

                            <div className="form-group mt-4">
                                <label htmlFor="BranchName">Branch Name</label>
                                <input
                                    type="text"
                                    id={"BranchName"}
                                    onChange={onEdit}
                                    required
                                    value={branches.BranchName}
                                    className={"form-control mt-4 mb-5"}
                                    placeholder={"Enter the branch"}
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
export default connect(mapStateToProps, null)(LedgerBranch);
