import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import DataTable from "../../../common/table/DataTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import ScholarshipForm from "./ScholarshipForm";
import swal from "sweetalert";

function ScholarshipDefinitions(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState("off");
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Name", field: "Name" },
            { label: "Description", field: "Description" },
            { label: "Start Date", field: "startDateFormatted" },
            { label: "End Date", field: "endDateFormatted" },
            { label: "Admission", field: "admissionPct" },
            { label: "Tuition", field: "tuitionPct" },
            { label: "Feeding", field: "feedingPct" },
            { label: "Trans", field: "transPct" },
            { label: "Accom", field: "accomPct" },
            { label: "Action", field: "action" },
        ],
        rows: [],
    });

    const initialData = {
        Name: "",
        Description: "",
        StartDate: "",
        EndDate: "",
        Admission: "0",
        Tuition: "0",
        Feeding: "0",
        Transportation: "0",
        Accommodation: "0",
        EntryID: "",
        InsertedBy: props.loginData[0].StaffID,
    };

    const [formState, setFormState] = useState(initialData);

    const buildRows = (data) => {
        return data.map((item, index) => ({
            sn: index + 1,
            Name: item.Name,
            Description: item.Description || "N/A",
            startDateFormatted: item.StartDate ? new Date(item.StartDate).toLocaleDateString() : "N/A",
            endDateFormatted: item.EndDate ? new Date(item.EndDate).toLocaleDateString() : "N/A",
            admissionPct: `${item.Admission}%`,
            tuitionPct: `${item.Tuition}%`,
            feedingPct: `${item.Feeding}%`,
            transPct: `${item.Transportation}%`,
            accomPct: `${item.Accommodation}%`,
            action: (
                <>
                    <button className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }} title="Edit" data-bs-toggle="modal" data-bs-target="#kt_modal_general"
                        onClick={() => setFormState({
                            ...item,
                            Admission: item.Admission.toString(),
                            Tuition: item.Tuition.toString(),
                            Feeding: item.Feeding.toString(),
                            Transportation: item.Transportation.toString(),
                            Accommodation: item.Accommodation.toString(),
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

    const getScholarships = async () => {
        const { success, data } = await api.get("staff/ac-finance/scholarship/list");
        if (success) {
            setDatatable((prev) => ({ ...prev, rows: buildRows(data) }));
        }
        setIsLoading(false);
    };

    const onEdit = (e) => {
        setFormState({ ...formState, [e.target.id]: e.target.value });
    };

    const onSubmit = async () => {
        if (!formState.Name) {
            showAlert("EMPTY FIELD", "Please enter scholarship name", "warning");
            return;
        }

        setIsFormLoading("on");
        if (formState.EntryID === "") {
            const { success, data } = await api.post("staff/ac-finance/scholarship/add", formState);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Scholarship Added Successfully");
                    getScholarships();
                    document.getElementById("closeModal").click();
                } else if (data?.message === "exist") {
                    showAlert("EXISTS", "This scholarship name already exists!", "error");
                }
            }
        } else {
            const { success, data } = await api.patch("staff/ac-finance/scholarship/update", formState);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Scholarship Updated Successfully");
                    getScholarships();
                    document.getElementById("closeModal").click();
                }
            }
        }
        setIsFormLoading("off");
    };

    const handleDelete = async (id) => {
        const { success } = await api.delete(`staff/ac-finance/scholarship/delete/${id}`);
        if (success) {
            toast.success("Deleted Successfully");
            getScholarships();
        }
    };

    useEffect(() => {
        getScholarships();
    }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Scholarship Management"} items={["Finance", "Scholarship Definitions"]}
                buttons={<><button type="button" className="btn btn-primary shadow-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setFormState(initialData)}>Create Scholarship</button></>} />
            <div className="flex-column-fluid">
                <div className="card card-no-border shadow-sm">
                    <div className="card-body p-5">
                        <DataTable data={datatable} />
                    </div>
                </div>
                <Modal title={"Scholarship Definition Detail"} large onClose={() => setFormState(initialData)}>
                    <ScholarshipForm data={formState} onEdit={onEdit} onSubmit={onSubmit} isFormLoading={isFormLoading} />
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails });
export default connect(mapStateToProps, null)(ScholarshipDefinitions);
