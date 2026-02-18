import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import DataTable from "../../../common/table/DataTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import OtherFeeForm from "./OtherFeeForm";
import swal from "sweetalert";

function OtherFees(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState("off");
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Name", field: "Name" },
            { label: "Category", field: "Category" },
            { label: "Amount", field: "amountFormatted" },
            { label: "Status", field: "statusBadge" },
            { label: "Action", field: "action" },
        ],
        rows: [],
    });

    const initialData = {
        Name: "",
        Description: "",
        DefaultAmount: "",
        Category: "",
        IsActive: "1",
        EntryID: "",
        InsertedBy: props.loginData[0].StaffID,
    };

    const [formState, setFormState] = useState(initialData);

    const buildRows = (data) => {
        return data.map((item, index) => ({
            sn: index + 1,
            Name: item.Name,
            Category: item.Category || "N/A",
            amountFormatted: `₦${parseFloat(item.DefaultAmount).toLocaleString()}`,
            statusBadge: (
                <span className={`badge badge-light-${item.IsActive === 1 ? "success" : "danger"}`}>
                    {item.IsActive === 1 ? "Active" : "Inactive"}
                </span>
            ),
            action: (
                <>
                    <button className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }} title="Edit" data-bs-toggle="modal" data-bs-target="#kt_modal_general"
                        onClick={() => setFormState({
                            ...item,
                            DefaultAmount: item.DefaultAmount.toString(),
                            UpdatedBy: props.loginData[0].StaffID
                        })}>
                        <i style={{ fontSize: '15px' }} className="fa fa-pen" />
                    </button>
                    <button className="btn btn-link p-0 text-danger" title="Delete"
                        onClick={() => { swal({ title: "Are you sure?", text: "Once deleted, you will not be able to recover it!", icon: "warning", buttons: true, dangerMode: true }).then((willDelete) => { if (willDelete) { handleDelete(item.EntryID); } }); }}>
                        <i style={{ fontSize: '15px' }} className="fa fa-trash" />
                    </button>
                </>
            ),
        }));
    };

    const getFees = async () => {
        const { success, data } = await api.get("staff/ac-finance/other-fee/list");
        if (success) {
            setDatatable((prev) => ({ ...prev, rows: buildRows(data) }));
        }
        setIsLoading(false);
    };

    const onEdit = (e) => {
        setFormState({ ...formState, [e.target.id]: e.target.value });
    };

    const onSelectChange = (id, value) => {
        setFormState({ ...formState, [id]: value });
    };

    const onSubmit = async () => {
        if (!formState.Name || !formState.Category || !formState.DefaultAmount) {
            showAlert("EMPTY FIELDS", "Please fill all required fields", "warning");
            return;
        }

        setIsFormLoading("on");
        if (formState.EntryID === "") {
            const { success, data } = await api.post("staff/ac-finance/other-fee/add", formState);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Fee Added Successfully");
                    getFees();
                    document.getElementById("closeModal").click();
                } else if (data?.message === "exist") {
                    showAlert("EXISTS", "This fee name already exists in this category!", "error");
                }
            }
        } else {
            const { success, data } = await api.patch("staff/ac-finance/other-fee/update", formState);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Fee Updated Successfully");
                    getFees();
                    document.getElementById("closeModal").click();
                }
            }
        }
        setIsFormLoading("off");
    };

    const handleDelete = async (id) => {
        const { success } = await api.delete(`staff/ac-finance/other-fee/delete/${id}`);
        if (success) {
            toast.success("Deleted Successfully");
            getFees();
        }
    };

    useEffect(() => {
        getFees();
    }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Other Fee Management"} items={["Finance", "Other Fees"]}
                buttons={<><button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setFormState(initialData)}>Add Fee Item</button></>} />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body p-0">
                        <DataTable data={datatable} />
                    </div>
                </div>
                <Modal title={"Manage Other Fee"} onClose={() => setFormState(initialData)}>
                    <OtherFeeForm data={formState} onEdit={onEdit} onSelectChange={onSelectChange} onSubmit={onSubmit} isFormLoading={isFormLoading} />
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails });
export default connect(mapStateToProps, null)(OtherFees);
