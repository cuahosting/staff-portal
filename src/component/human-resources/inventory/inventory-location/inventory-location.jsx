import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import ReportTable from "../../../common/table/ReportTable";
import InventoryLocationForm from "./inventory-location-form";
function InventoryLocation(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const initialValue = {
        location_id: '', location_name: '', description: '', submitted_by: '', updated_by: ''
    }
    const [formData, setFormData] = useState(initialValue);

    const columns = ["S/N", "Action", "Location Name", "Description", "Updated By"];
    const [tableData, setTableData] = useState([]);

    const fetchData = async () => {
        try {
            const { success, data } = await api.get("staff/inventory/location/data/list");
            if (success && data.message === 'success') {
                const row = [];
                if (data.Location.length > 0) {
                    data.Location.map((r, i) => {
                        row.push([i + 1,
                        (
                            <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_general"
                                onClick={() => {
                                    setFormData({
                                        ...formData,
                                        location_name: r.location_name,
                                        description: r.description,
                                        address: r.address,
                                        location_id: r.location_id,
                                    })
                                }
                                }
                            >
                                <i className="fa fa-pen" />
                            </button>
                        ),
                        r.location_name, r.description, r.updated_by
                        ])
                    })
                    setTableData(row)
                } else {
                    setTableData([])
                }
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
    }, [""])

    const handleFormValueChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        })
    }

    const onFormSubmit = async (e) => {
        e.preventDefault();
        if (formData.location_name.toString().trim() === "") {
            toast.error("Please Enter the Location Name");
            return false;
        }

        let sendData = {
            ...formData,
            submitted_by: props.loginData[0].StaffID,
            updated_by: props.loginData[0].StaffID
        }

        setIsFormLoading(true)
        if (formData.location_id === '') {
            try {
                const { success, data } = await api.post("staff/inventory/location/add", sendData);
                if (success) {
                    if (data.message === "success") {
                        toast.success("Location Added Successfully");
                        fetchData();
                        setFormData({ ...formData, ...initialValue })
                        setIsFormLoading(false)
                        document.getElementById("closeModal").click();
                    } else if (data.message === "exist") {
                        setIsFormLoading(false)
                        showAlert("LOCATION EXIST", "Location already exist!", "error");
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
                const { success, data } = await api.patch("staff/inventory/location/update", sendData);
                if (success) {
                    if (data.message === "success") {
                        toast.success("Location Updated Successfully");
                        fetchData();
                        setFormData({
                            ...formData,
                            location_id: '', location_name: '', description: '', submitted_by: '', updated_by: '',
                        })
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
                title={"Inventory Location"}
                items={["Inventory", "Inventory Location"]}
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
                        Add Location
                    </button>
                }
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                    </div>
                    <div className="card-body p-0">
                        <ReportTable title={"Inventory Location"} columns={columns} data={tableData} />
                    </div>
                </div>
                <Modal title={"Manage Location"}>
                    <InventoryLocationForm value={formData} isFormLoading={isFormLoading} onChange={handleFormValueChange} onSubmit={onFormSubmit} />
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

export default connect(mapStateToProps, null)(InventoryLocation);
