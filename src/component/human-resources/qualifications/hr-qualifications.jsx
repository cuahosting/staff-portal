import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function HRQualifications(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Qualification Title",
                field: "name",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });

    const [create, setCreate] = useState({
        qualification_title: "",
        entry_id: "",
    });

    const getRecords = async () => {
        await axios
            .get(`${serverLink}staff/hr/qualification/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((qualification, index) => {
                        rows.push({
                            sn: index + 1,
                            name: qualification.QualificationTitle,
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                        setCreate({
                                            qualification_title: qualification.QualificationTitle,
                                            entry_id: qualification.EntryID
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
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    };

    const onEdit = (e) => {
        setCreate({
            ...create,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmit = async () => {
        if (create.qualification_title.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the qualification title", "error");
            return false;
        }

        if (create.entry_id === "") {
            await axios
                .post(`${serverLink}staff/hr/qualification/add`, create, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Qualification Added Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setCreate({
                            ...create,
                            qualification_title: "",
                            entry_id: "",
                        });
                    } else if (result.data.message === "exist") {
                        showAlert("QUALIFICATION EXIST", "Qualification already exist!", "error");
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        } else {
            await axios
                .patch(`${serverLink}staff/hr/qualification/update`, create, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Qualification Updated Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setCreate({
                            ...create,
                            qualification_title: "",
                            entry_id: "",
                        });
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
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

    useEffect(() => {
        axios
            .get(`${serverLink}staff/hr/qualification/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((qualification, index) => {
                        rows.push({
                            sn: index + 1,
                            name: qualification.QualificationTitle,
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                        setCreate({
                                            qualification_title: qualification.QualificationTitle,
                                            entry_id: qualification.EntryID,
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
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Qualifications"}
                items={["Human Resources", "Others", "Qualifications"]}
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
                                    onClick={() =>
                                        setCreate({
                                            ...create,
                                            qualification_title: "",
                                            entry_id: "",
                                        })
                                    }
                                >
                                    Add Qualification
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <Table data={datatable} />
                    </div>
                </div>
                <Modal title={"Bank Form"}>
                    <div className="form-group">
                        <label htmlFor="qualification_title">Qualification Title</label>
                        <input
                            type="text"
                            id={"qualification_title"}
                            onChange={onEdit}
                            value={create.qualification_title}
                            className={"form-control"}
                            placeholder={"Enter the Qualification Title"}
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
  
  export default connect(mapStateToProps, null)(HRQualifications);
