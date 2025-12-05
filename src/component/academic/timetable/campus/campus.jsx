import React, { useEffect, useState } from "react";
import AGTable from "../../../common/table/AGTable";
import Modal from "../../../common/modal/modal";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function CampusSettings(props) {
    const token = props.loginData[0].token;

    // eslint-disable-next-line no-unused-vars
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off')
    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "Campus ID",
                field: "CampusID",
            },
            {
                label: "Campus Name",
                field: "CampusName",
            },
            {
                label: "Location",
                field: "Location",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [createCampus, setcreateCampus] = useState({
        CampusName: "",
        Location: "",
        entry_id: ""
    });

    const getCampus = async () => {
        await axios
            .get(`${serverLink}staff/academics/campus/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.forEach((campus, index) => {
                        rows.push({
                            CampusID: campus.EntryID,
                            CampusName: campus.CampusName,
                            Location: campus.Location,
                            action: (
                                <button
                                    className="btn btn-link p-0 text-primary" style={{marginRight:15}} title="Edit"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                        setcreateCampus({
                                            EntryID: campus.EntryID,
                                            CampusName: campus.CampusName,
                                            Location: campus.Location,
                                            action: "update",
                                        })
                                    }
                                >
                                    <i style={{ fontSize: '15px', color:"blue" }} className="fa fa-pen color-blue" />
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
        setcreateCampus({
            ...createCampus,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmit = async () => {
        if (createCampus.CampusName.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the campus name", "error");
            return false;
        }
        if (createCampus.Location.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the location", "error");
            return false;
        }

        if (createCampus.entry_id === "") {
            setisFormLoading('on')
            await axios
                .post(`${serverLink}staff/academics/campus/add`, createCampus, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Campus Added Successfully");
                        getCampus();
                        props.getData();
                        setcreateCampus({
                            ...createCampus,
                            CampusName: "",
                            Location: "",
                        });
                        setisFormLoading('off')
                    } else if (result.data.message === "exist") {
                        showAlert("CAMPUS EXIST", "Campus already exist!", "error");
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
            setisFormLoading('on')
            await axios
                .patch(`${serverLink}staff/academics/campus/update`, createCampus, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Campus Updated Successfully");
                        getCampus();
                        props.getData();
                        setcreateCampus({
                            ...createCampus,
                            CampusName: "",
                            Location: "",
                            EntryID: ""
                        });
                        setisFormLoading('off')
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
        getCampus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="card card-no-border">
            <div className="card-header border-0 pt-6">
                <div className="card-title" />
                <div className="card-toolbar">
                    <div
                        className="d-flex justify-content-end"
                        data-kt-customer-table-toolbar="base">
                        <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#kt_modal_general"
                            onClick={() =>
                                setcreateCampus({
                                    ...createCampus,
                                    EntryID: "",
                                    CampusName: "",
                                    Location: "",
                                })
                            }>
                            Add Campus
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body p-0">
                <div className="col-md-12" style={{ overflowX: 'auto' }}>
                    <AGTable data={datatable} />
                </div>
            </div>

            <Modal title={"Manage Campus"} id={"kt_modal_general"}>
                <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CampusName">
                        Campus Name
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="text"
                            id="CampusName"
                            onChange={onEdit}
                            value={createCampus.CampusName}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Campus Name"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="Location">
                        Campus Location
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="text"
                            id="Location"
                            onChange={onEdit}
                            value={createCampus.Location}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Campus Location"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="form-group pt-2">
                    <button onClick={onSubmit} className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={isFormLoading}>
                    <span className="indicator-label">Submit</span>
                    <span className="indicator-progress">Please wait...
                            <span className="spinner-border spinner-border-sm align-middle ms-2" />
                        </span>
                    </button>
                </div>
            </Modal>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
      loginData: state.LoginDetails,
    };
  };
  
  export default connect(mapStateToProps, null)(CampusSettings);
