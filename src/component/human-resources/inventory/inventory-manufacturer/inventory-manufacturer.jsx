import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import CourseForm from "./inventory-manufacturer-form";
import swal from "sweetalert";
import ReportTable from "../../../common/table/ReportTable";
import InventoryManufacturerForm from "./inventory-manufacturer-form";
function InventoryManufacturer(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const initialValue = {
        manufacturer_id: '', manufacturer_name: '', description: '', address: '',
        phone_number: '', email_address: '', submitted_by: '', updated_by: ''
    }
    const [formData, setFormData] = useState(initialValue);

    const [manufacturerList, setManufacturerList] = useState([]);

    const columns = ["S/N", "Action", "Manufacturer Name", "Email Address", "Phone", "Address", "Description", "Updated By"];
    const [tableData, setTableData] = useState([]);

    const fetchData = async () => {
        try {
            const { success, data } = await api.get("staff/inventory/manufacturer/list");
            if (success && data.message === 'success') {
                const row = [];
                if (data.response.length > 0) {
                    data.response.map((r, i) => {
                        row.push([i + 1,
                        (
                            <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_general"
                                onClick={() => {
                                    onOpenModal();
                                    setFormData({
                                        ...formData,
                                        manufacturer_name: r.manufacturer_name,
                                        description: r.description,
                                        address: r.address,
                                        phone_number: r.phone_number,
                                        email_address: r.email_address,
                                        submitted_by: r.submitted_by,
                                        updated_by: r.updated_by,
                                        manufacturer_id: r.manufacturer_id,
                                    })
                                }
                                }
                            >
                                <i className="fa fa-pen" />
                            </button>
                        ),
                        r.manufacturer_name, r.email_address, r.phone_number, r.address, r.description, r.updated_by
                        ])
                    })
                    setTableData(row)
                }
                setManufacturerList(data.response)
            } else {
                toast.info("Something went wrong. Please try again!")
            }
            setIsLoading(false)
        } catch (e) {
            toast.error("NETWORK ERROR")
        }
    }
    useEffect(() => {
        fetchData()
    }, [formData])

    const onOpenModal = () => {
        setFormData(initialValue)
    }
    const handleFormValueChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        })
    }

    const onFormSubmit = async (e) => {
        e.preventDefault();
        if (formData.manufacturer_name.toString().trim() === "") {
            toast.error("Please Enter the Manufacturer Name");
            return false;
        }

        if (formData.phone_number.toString().trim() === "") {
            toast.error("Please Enter Phone Number");
            return false;
        }
        if (formData.address.toString().trim() === "") {
            toast.error("Please Manufacturer address");
            return false;
        }

        let sendData = {
            ...formData,
            submitted_by: props.loginData[0].StaffID,
            updated_by: props.loginData[0].StaffID
        }
        setIsFormLoading(true)
        if (formData.manufacturer_id === '') {
            try {
                const { success, data } = await api.post("staff/inventory/manufacturer/add", sendData);
                if (success) {
                    if (data.message === "success") {
                        toast.success("Manufacturer Added Successfully");
                        fetchData();
                        setFormData({ ...formData, ...initialValue })
                        setIsFormLoading(false)
                        document.getElementById("closeModal").click();
                    } else if (data.message === "exist") {
                        setIsFormLoading(false)
                        showAlert("MANUFACTURER EXIST", "Manufacturer already exist!", "error");
                    } else {
                        setIsFormLoading(false)
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                }
            } catch (error) {
                setIsFormLoading(false)
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            }
        } else {
            try {
                const { success, data } = await api.patch("staff/inventory/manufacturer/update", sendData);
                if (success) {
                    if (data.message === "success") {
                        toast.success("Manufacturer Updated Successfully");
                        fetchData();
                        setFormData({ ...formData, ...initialValue })
                        setIsFormLoading(false)
                        document.getElementById("closeModal").click();
                    } else {
                        setIsFormLoading(false)
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                }
            } catch (error) {
                setIsFormLoading(false)
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            }
        }
    }


    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Inventory Manufacturer"}
                items={["Inventory", "Inventory Manufacturer"]}
                buttons={
                    <button
                        type="button"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_modal_general"
                        onClick={() =>
                            setFormData(initialValue)
                        }
                    >
                        <i className="fa fa-plus me-2"></i>
                        Add Manufacturer
                    </button>
                }
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                    </div>
                    <div className="card-body p-0">
                        <ReportTable title={"Inventory Manufacturer"} columns={columns} data={tableData} />
                    </div>
                </div>
                <Modal title={"Manage Manufacturer"}>
                    <InventoryManufacturerForm value={formData} isFormLoading={isFormLoading} onChange={handleFormValueChange} onSubmit={onFormSubmit} />
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

export default connect(mapStateToProps, null)(InventoryManufacturer);
