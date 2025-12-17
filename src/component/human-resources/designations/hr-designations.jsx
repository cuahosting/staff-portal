import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function HRDesignations(props) {

    const [isLoading, setIsLoading] = useState(true);
    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Action",
                field: "action",
            },
            {
                label: "Designation Name",
                field: "name",
            },
        ],
        rows: [],
    });

    const [create, setCreate] = useState({
        designation_name: "",
        entry_id: "",
    });

    const getRecords = async () => {
        const { success, data } = await api.get("staff/hr/designation/list");
        if (success && data.length > 0) {
            let rows = [];
            data.map((designation, index) => {
                rows.push({
                    sn: index + 1,
                    name: designation.DesignationName,
                    action: (
                        <button
                            className="btn btn-sm btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#kt_modal_general"
                            onClick={() =>
                                setCreate({
                                    designation_name: designation.DesignationName,
                                    entry_id: designation.EntryID
                                })
                            }
                        >
                            <i className="fa fa-pen" />
                        </button>
                    ),
                });
            });
            setDatatable({
                ...datatable,
                columns: datatable.columns,
                rows: rows,
            });
        }
        setIsLoading(false);
    };

    const onEdit = (e) => {
        setCreate({
            ...create,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmit = async () => {
        if (create.designation_name.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the designation name", "error");
            return false;
        }

        if (create.entry_id === "") {
            const { success, data } = await api.post("staff/hr/designation/add", create);
            if (success) {
                if (data.message === "success") {
                    toast.success("Designation Added Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setCreate({
                        ...create,
                        designation_name: "",
                        entry_id: "",
                    });
                } else if (data.message === "exist") {
                    showAlert("DESIGNATION EXIST", "Designation already exist!", "error");
                } else {
                    showAlert("ERROR", "Something went wrong. Please try again!", "error");
                }
            } else {
                showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
            }
        } else {
            const { success, data } = await api.patch("staff/hr/designation/update", create);
            if (success) {
                if (data.message === "success") {
                    toast.success("Designation Updated Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setCreate({
                        ...create,
                        designation_name: "",
                        entry_id: "",
                    });
                } else {
                    showAlert("ERROR", "Something went wrong. Please try again!", "error");
                }
            } else {
                showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
            }
        }
    };

    useEffect(() => {
        getRecords();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Designations"}
                items={["Human Resources", "Others", "Designations"]}
                buttons={
                    <button
                        type="button"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_modal_general"
                        onClick={() =>
                            setCreate({
                                ...create,
                                designation_name: "",
                                entry_id: "",
                            })
                        }
                    >
                        <i className="fa fa-plus me-2"></i>
                        Add Designation
                    </button>
                }
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body pt-5">
                        <AGTable data={datatable} />
                    </div>
                </div>
                <Modal title={"Designation Form"}>
                    <div className="form-group">
                        <label htmlFor="designation_name">Designation Name</label>
                        <input
                            type="text"
                            id={"designation_name"}
                            onChange={onEdit}
                            value={create.designation_name}
                            className={"form-control"}
                            placeholder={"Enter the Designation Name"}
                        />
                    </div>

                    <div className="form-group pt-2">
                        <button onClick={onSubmit} className="btn btn-primary w-100">
                            Submit
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};


export default connect(mapStateToProps, null)(HRDesignations);
