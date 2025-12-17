import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function HRQualifications(props) {

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
                label: "Qualification Title",
                field: "name",
            },
        ],
        rows: [],
    });

    const [create, setCreate] = useState({
        qualification_title: "",
        entry_id: "",
    });

    const getRecords = async () => {
        const { success, data } = await api.get("staff/hr/qualification/list");
        if (success && data.length > 0) {
            let rows = [];
            data.map((qualification, index) => {
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
            const { success, data } = await api.post("staff/hr/qualification/add", create);
            if (success) {
                if (data.message === "success") {
                    toast.success("Qualification Added Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setCreate({
                        ...create,
                        qualification_title: "",
                        entry_id: "",
                    });
                } else if (data.message === "exist") {
                    showAlert("QUALIFICATION EXIST", "Qualification already exist!", "error");
                } else {
                    showAlert("ERROR", "Something went wrong. Please try again!", "error");
                }
            } else {
                showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
            }
        } else {
            const { success, data } = await api.patch("staff/hr/qualification/update", create);
            if (success) {
                if (data.message === "success") {
                    toast.success("Qualification Updated Successfully");
                    document.getElementById("closeModal").click()
                    getRecords();
                    setCreate({
                        ...create,
                        qualification_title: "",
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
                title={"Qualifications"}
                items={["Human Resources", "Others", "Qualifications"]}
                buttons={
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
                        <i className="fa fa-plus me-2"></i>
                        Add Qualification
                    </button>
                }
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                    </div>
                    <div className="card-body p-0">
                        <AGTable data={datatable} />
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
