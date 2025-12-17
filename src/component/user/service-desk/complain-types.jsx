import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import { showAlert } from "../../common/sweetalert/sweetalert";
import ReportTable from "../../common/table/ReportTable";

const ComplainTypes = (props) => {
    const [isLoading, setisLoading] = useState(true);
    const [complainTypes, setComplainTypes] = useState([]);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [complain, setComplain] = useState({
        ComplainType: "",
        InsertedBy: props.LoginDetails[0].StaffID,
        currentSemester: props.currentSemester,
    });

    const columns = ["SN", "COMPLAIN TYPE", "ACTION"];

    const getData = async () => {
        const { success, data } = await api.get("staff/service-desk/complain-types/list");

        if (success && data?.length > 0) {
            const rows = data.map((item, index) => [
                index + 1,
                item.ComplainType,
                <button className="btn btn-sm btn-danger" onClick={() => onRemoveType(item.EntryID)}>
                    Delete
                </button>
            ]);
            setComplainTypes(rows);
        }
        setisLoading(false);
    };

    const onRemoveType = async (id) => {
        const { success, data } = await api.delete(`staff/service-desk/complain-types/delete/${id}`);

        if (success && data?.message === "success") {
            setIsFormLoading('off');
            getData();
            toast.success("Complain type deleted successfully");
            resetForm();
        }
    };

    const resetForm = () => {
        setComplain({
            ...complain,
            ComplainType: "",
        });
    };

    const onSubmit = async () => {
        if (complain.ComplainType === "") {
            toast.error("Please enter complain type");
            return;
        }

        setIsFormLoading('on');

        const { success, data } = await api.post("staff/service-desk/complain-types/add", complain);

        if (success && data?.message === "success") {
            setIsFormLoading('off');
            getData();
            toast.success("Complain type added successfully");
            resetForm();
        } else if (!success) {
            setIsFormLoading('off');
            showAlert("ERROR", "Network error, please try again", 'error');
        }
    };

    const onEdit = (e) => {
        setComplain({
            ...complain,
            [e.target.id]: e.target.value
        });
    };

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Service Desk"}
                items={["Users", "Service Desk", "Complain Types"]}
            />
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
                            onClick={resetForm}
                        >
                            Add Complain Type
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body pt-5">
                        <ReportTable columns={columns} data={complainTypes} />
                        <Modal>
                            <div className="row col-md-12">
                                <div className="col-md-12 mb-5">
                                    <div className="form-group">
                                        <label htmlFor="ComplainType">Complain Type</label>
                                        <input
                                            type="text"
                                            id="ComplainType"
                                            onChange={onEdit}
                                            className="form-control"
                                            placeholder=""
                                        />
                                    </div>
                                </div>

                                <div className="col-md-12 mb-5">
                                    <button
                                        type="button"
                                        onClick={onSubmit}
                                        className="btn btn-primary w-100"
                                        id="kt_modal_new_address_submit"
                                        data-kt-indicator={isFormLoading}
                                    >
                                        <span className="indicator-label">Submit</span>
                                        <span className="indicator-progress">Please wait...
                                            <span className="spinner-border spinner-border-sm align-middle ms-2" />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        currentSemester: state.currentSemester
    };
};

export default connect(mapStateToProps, null)(ComplainTypes);