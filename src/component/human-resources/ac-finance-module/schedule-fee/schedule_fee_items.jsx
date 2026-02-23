import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import DataTable from "../../../common/table/DataTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import FeeItemForm from "./FeeItemForm";
import swal from "sweetalert";

function ScheduleFeeItems(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState("off");
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Action", field: "action" },
            { label: "Name", field: "Name" },
            { label: "Description", field: "Description" },
            { label: "Amount", field: "Amount" },
        ],
        rows: [],
    });

    const initialFeeItem = {
        Name: "",
        Description: "",
        Amount: "",
        EntryID: "",
        InsertedBy: props.loginData[0].EntryID,
    };

    const [createFeeItem, setCreateFeeItem] = useState(initialFeeItem);

    const buildRows = (data) => {
        return data.map((item, index) => ({
            sn: index + 1,
            Name: item.Name ?? "N/A",
            Description: item.Description ?? "N/A",
            Amount: item.Amount ? parseFloat(item.Amount).toLocaleString() : "0.00",
            action: (
                <>
                    <button className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }} title="Edit" data-bs-toggle="modal" data-bs-target="#kt_modal_general"
                        onClick={() => setCreateFeeItem({
                            Name: item.Name,
                            Description: item.Description,
                            Amount: item.Amount,
                            EntryID: item.EntryID,
                            UpdatedBy: props.loginData[0].EntryID
                        })}>
                        <i style={{ fontSize: '15px', color: "blue" }} className="fa fa-pen color-blue" />
                    </button>
                    <button className="btn btn-link p-0 text-danger" title="Delete"
                        onClick={() => { swal({ title: "Are you sure?", text: "Once deleted, you will not be able to recover it!", icon: "warning", buttons: true, dangerMode: true }).then((willDelete) => { if (willDelete) { deleteFeeItem(item.EntryID); } }); }}>
                        <i style={{ fontSize: '15px', color: "red" }} className="fa fa-trash" />
                    </button>
                </>
            ),
        }));
    };

    const getFeeItems = async () => {
        const { success, data } = await api.get("staff/ac-finance/fee-items/list");
        if (success && data?.length > 0) {
            setDatatable((prev) => ({ ...prev, rows: buildRows(data) }));
        } else {
            setDatatable((prev) => ({ ...prev, rows: [] }));
        }
        setIsLoading(false);
    };

    const onEdit = (e) => { setCreateFeeItem({ ...createFeeItem, [e.target.id]: e.target.value }); };

    const onSubmit = async () => {
        if (createFeeItem.Name.trim() === "") { showAlert("EMPTY FIELD", "Please enter the item name", "error"); return; }
        if (createFeeItem.Amount === "") { showAlert("EMPTY FIELD", "Please enter the amount", "error"); return; }

        setIsFormLoading("on");
        if (createFeeItem.EntryID === "") {
            const { success, data } = await api.post("staff/ac-finance/fee-items/add", createFeeItem);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Fee Item Added Successfully");
                    getFeeItems();
                    document.getElementById("closeModal").click();
                    setCreateFeeItem(initialFeeItem);
                }
                else if (data?.message === "exist") { showAlert("ITEM EXISTS", "Item already exists!", "error"); }
                else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            }
        } else {
            const { success, data } = await api.patch("staff/ac-finance/fee-items/update", createFeeItem);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Fee Item Updated Successfully");
                    getFeeItems();
                    document.getElementById("closeModal").click();
                    setCreateFeeItem(initialFeeItem);
                }
                else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            }
        }
        setIsFormLoading("off");
    };

    async function deleteFeeItem(id) {
        const { success, data } = await api.delete(`staff/ac-finance/fee-items/delete/${id}`);
        if (success) {
            if (data?.message === "success") { toast.success("Deleted Successfully"); getFeeItems(); }
            else { toast.error(data?.whatToShow || "Error deleting item"); }
        }
    }

    useEffect(() => { getFeeItems(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Manage Fee Items"} items={["Finance", "Fee Items"]}
                buttons={<><button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setCreateFeeItem(initialFeeItem)}>Add Fee Item</button></>} />
            <div className="flex-column-fluid">
                <div className="card card-no-border"><div className="card-body p-0"><DataTable data={datatable} /></div></div>
                <Modal title={"Manage Fee Item"}><FeeItemForm data={createFeeItem} isFormLoading={isFormLoading} onEdit={onEdit} onSubmit={onSubmit} /></Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(ScheduleFeeItems);
