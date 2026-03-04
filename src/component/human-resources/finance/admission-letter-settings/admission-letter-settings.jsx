import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert, showConfirm } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";

function AdmissionLetterSettings(props) {

    const [isLoading, setIsLoading] = useState(true);
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Accommodation Fee", field: "AccommodationFee" },
            { label: "Application Fee", field: "ApplicationFee" },
            { label: "Status", field: "Status" },
            { label: "Added By", field: "InsertedBy" },
            { label: "Date", field: "InsertedDate" },
            { label: "Action", field: "action" },
        ],
        rows: [],
    });
    const [formData, setFormData] = useState({
        AccommodationFee: "",
        ApplicationFee: "",
        InsertedBy: props.loginData[0].StaffID,
        EntryID: "",
    });

    const Reset = () => {
        setFormData({
            AccommodationFee: "",
            ApplicationFee: "",
            InsertedBy: props.loginData[0].StaffID,
            EntryID: "",
        });
    };

    const getRecords = async () => {
        try {
            const { success, data } = await api.get("staff/ac-finance/admission-letter-settings/list");
            if (success && data.data?.length > 0) {
                let rows = [];
                data.data.map((item, index) => {
                    rows.push({
                        sn: index + 1,
                        AccommodationFee: currencyConverter(item.AccommodationFee),
                        ApplicationFee: currencyConverter(item.ApplicationFee),
                        Status: item.IsActive ?
                            <span className="badge badge-light-success">Active</span> :
                            <span className="badge badge-light-danger">Inactive</span>,
                        InsertedBy: item.InsertedBy,
                        InsertedDate: formatDateAndTime(item.InsertedDate, 'date'),
                        EntryID: item.EntryID,
                        action: (
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() => {
                                        setFormData({
                                            AccommodationFee: item.AccommodationFee,
                                            ApplicationFee: item.ApplicationFee,
                                            InsertedBy: props.loginData[0].StaffID,
                                            EntryID: item.EntryID,
                                        });
                                    }}
                                >
                                    <i className="fa fa-pen" />
                                </button>
                                <button
                                    className={`btn btn-sm ${item.IsActive ? 'btn-danger' : 'btn-success'}`}
                                    onClick={() => onToggle(item)}
                                >
                                    <i className={`fa ${item.IsActive ? 'fa-times-circle' : 'fa-check-circle'}`} />
                                </button>
                            </div>
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
        } catch (err) {
            console.log("NETWORK ERROR");
            setIsLoading(false);
        }
    };

    const onEdit = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmit = async () => {
        if (formData.AccommodationFee.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the accommodation fee", "error");
            return false;
        }
        if (formData.ApplicationFee.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the application fee", "error");
            return false;
        }

        if (formData.EntryID === "") {
            try {
                const { success, data } = await api.post("staff/ac-finance/admission-letter-settings/add", formData);
                if (success && data.message === "success") {
                    toast.success("Settings Added Successfully");
                    document.getElementById("closeModal").click();
                    getRecords();
                    Reset();
                } else {
                    showAlert("ERROR", "Something went wrong. Please try again!", "error");
                }
            } catch (error) {
                showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
            }
        } else {
            try {
                const { success, data } = await api.patch(`staff/ac-finance/admission-letter-settings/update/${formData.EntryID}`, {
                    AccommodationFee: formData.AccommodationFee,
                    ApplicationFee: formData.ApplicationFee,
                    UpdatedBy: props.loginData[0].StaffID,
                });
                if (success && data.message === "success") {
                    toast.success("Settings Updated Successfully");
                    document.getElementById("closeModal").click();
                    getRecords();
                    Reset();
                } else {
                    showAlert("ERROR", "Something went wrong. Please try again!", "error");
                }
            } catch (error) {
                showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
            }
        }
    };

    const onToggle = async (item) => {
        const action = item.IsActive ? "deactivate" : "activate";
        showConfirm(
            "Confirm",
            `Are you sure you want to ${action} this settings record?${!item.IsActive ? ' This will deactivate the current active record.' : ''}`,
            "warning"
        ).then(async (confirm) => {
            if (confirm) {
                try {
                    const { success, data } = await api.patch(`staff/ac-finance/admission-letter-settings/toggle/${item.EntryID}`, {
                        UpdatedBy: props.loginData[0].StaffID,
                    });
                    if (success && data.message === "success") {
                        toast.success(`Settings ${action}d successfully`);
                        getRecords();
                    } else {
                        showAlert("ERROR", "Something went wrong. Please try again!", "error");
                    }
                } catch (error) {
                    showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
                }
            }
        });
    };

    useEffect(() => {
        getRecords();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Admission Letter Settings"}
                items={["Human Resources", "Finance", "Admission Letter Settings"]}
                buttons={
                    <button
                        type="button"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_modal_general"
                        onClick={Reset}
                    >
                        Add Settings
                    </button>
                }
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body pt-0">
                        <AGTable data={datatable} />
                    </div>
                </div>
            </div>

            <Modal id="kt_modal_general" title={formData.EntryID === "" ? "Add Admission Letter Settings" : "Update Admission Letter Settings"}>
                <div className="form-group mb-4">
                    <label htmlFor="AccommodationFee">Accommodation Fee</label>
                    <input
                        type="number"
                        id="AccommodationFee"
                        className="form-control"
                        placeholder="Enter accommodation fee"
                        value={formData.AccommodationFee}
                        onChange={onEdit}
                    />
                </div>
                <div className="form-group mb-4">
                    <label htmlFor="ApplicationFee">Application Processing Fee</label>
                    <input
                        type="number"
                        id="ApplicationFee"
                        className="form-control"
                        placeholder="Enter application processing fee"
                        value={formData.ApplicationFee}
                        onChange={onEdit}
                    />
                </div>
                <div className="form-group mb-4">
                    <button className="btn btn-primary w-100" onClick={onSubmit}>
                        {formData.EntryID === "" ? "Submit" : "Update"}
                    </button>
                </div>
            </Modal>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};
export default connect(mapStateToProps, null)(AdmissionLetterSettings);
