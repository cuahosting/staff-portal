import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import {connect} from "react-redux";
import ReportTable from "../../../common/table/report_table";
import InventoryCategoryForm from "./inventory-category-form";
import InventorySubCategoryForm from "./inventory-sub-category-form";

function InventoryCategory(props) {
    const token = props.loginData[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openModal2, setOpenModal2] = useState(false);
    const initialCategoryValue = {  category_id: '', category_name: '', description: '', submitted_by: '', updated_by: ''}
    const initialSubCategoryValue = {  sub_category_id: '', category_id: '', category_name: '', sub_category_name: '', description: '', submitted_by: '', updated_by: ''}
    const [formData, setFormData] = useState(initialCategoryValue);
    const [formData2, setFormData2] = useState(initialSubCategoryValue);

    const [categoryList, setCategoryList] = useState([]);
    const columns = ["S/N", "Category Name", "Description", "Inserted By", "Action"];
    const columns2 = ["S/N", "Category Name", "Sub Category Name", "Description", "Inserted By", "Action"];
    const [tableData,setTableData] = useState([]);
    const [tableData2,setTableData2] = useState([]);

    const fetchCategoryData = async () => {
        await axios.get(`${serverLink}staff/inventory/category/data/list`, props.loginData[0].token)
            .then(res => {
                if (res.data.message === 'success') {
                    const categories = [];
                    const sub_categories = [];

                    if (res.data.Category.length > 0) {
                        res.data.Category.map((r, i) => {
                            categories.push([i+1, r.category_name, r.description, r.InsertedBy,
                                (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                category_name: r.category_name,
                                                description: r.description,
                                                submitted_date: r.submitted_date,
                                                submitted_by: r.submitted_by,
                                                category_id: r.category_id,
                                            })
                                        }
                                        }
                                    >
                                        <i className="fa fa-pen" />
                                    </button>
                                )
                            ])
                        })
                        setTableData(categories)
                    }

                    if (res.data.SubCategory.length > 0) {
                        res.data.SubCategory.map((r, i) => {
                            sub_categories.push([i+1, r.category_name, r.sub_category_name, r.description, r.InsertedBy,
                                (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#sub_cat"
                                        onClick={() => {
                                            onOpenModal2();
                                            setFormData2({
                                                ...formData2,
                                                category_id: r.category_id,
                                                category_name: r.category_name,
                                                sub_category_name: r.sub_category_name,
                                                description: r.description,
                                                submitted_date: r.submitted_date,
                                                submitted_by: r.submitted_by,
                                                sub_category_id: r.sub_category_id,
                                            })
                                        }
                                        }
                                    >
                                        <i className="fa fa-pen" />
                                    </button>
                                )
                            ])
                        })
                        setTableData2(sub_categories)
                    }

                    setCategoryList(res.data.Category)
                } else {
                    toast.info("Something went wrong. Please try again!")
                }
                setIsLoading(false)
            })
            .catch(e => {
                toast.error(`${e.response.statusText}: ${e.response.data}`)
            })
    }

    useEffect(() => {
        fetchCategoryData()
    },[formData])

    const onOpenModal = () => {
        setFormData(initialCategoryValue)
    }

    const onOpenModal2 = () => {
        setFormData2(initialSubCategoryValue)
    }
    const handleFormValueChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id] : e.target.value
        })
    }
    const handleFormValueChange2 = (e) => {
        setFormData2({
            ...formData2,
            [e.target.id] : e.target.value
        })
    }

    const onFormSubmit = async (e) => {
        e.preventDefault();
        if (formData.category_name.toString().trim() === "") {
            toast.error("Please Enter the Category Name");
            return false;
        }
        setIsFormLoading(true)
        if (formData.category_id === '') {
            let sendData = {
                ...formData,
                submitted_by: props.loginData[0].StaffID
            }

            await axios
                .post(`${serverLink}staff/inventory/category/add`, sendData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Category Data Added Successfully");
                        fetchCategoryData();
                        setFormData({
                            ...formData,
                            ...initialCategoryValue
                        })
                        setIsFormLoading(false)
                        document.getElementById("closeModal").click();
                    } else if (result.data.message === "exist") {
                        setIsFormLoading(false)
                        showAlert("CATEGORY EXIST", "Category already exist!", "error");
                    } else {
                        setIsFormLoading(false)
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    setIsFormLoading(false)
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });

        } else {
            let sendData = {
                ...formData,
                updated_by: props.loginData[0].StaffID
            }
            await axios
                .patch(`${serverLink}staff/inventory/category/update`, sendData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Category Data Updated Successfully");
                        fetchCategoryData();
                        setFormData({
                            ...formData,
                            ...initialCategoryValue
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
                })
                .catch((error) => {
                    setIsFormLoading(false)
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }

    }

    const onFormSubmit2 = async (e) => {
        e.preventDefault();
        if (formData2.category_id.toString().trim() === "") {
            toast.error("Please Select Category");
            return false;
        }

        if (formData2.sub_category_name.toString().trim() === "") {
            toast.error("Please Enter Sub Category Name");
            return false;
        }
        setIsFormLoading(true)
        if (formData2.sub_category_id === '') {
            let sendData = {
                ...formData2,
                submitted_by: props.loginData[0].StaffID
            }

            await axios
                .post(`${serverLink}staff/inventory/sub_category/add`, sendData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Sub Category Added Successfully");
                        fetchCategoryData();
                        setFormData2({
                            ...formData2,
                            ...initialSubCategoryValue
                        })
                        setIsFormLoading(false)
                        document.getElementById("closeModal").click();
                    } else if (result.data.message === "exist") {
                        setIsFormLoading(false)
                        showAlert("SUB CATEGORY EXIST", "Sub Category already exist!", "error");
                    } else {
                        setIsFormLoading(false)
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    setIsFormLoading(false)
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });

        } else {
            let sendData = {
                ...formData2,
                updated_by: props.loginData[0].StaffID
            }
            await axios
                .patch(`${serverLink}staff/inventory/sub_category/update`, sendData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Category Data Updated Successfully");
                        fetchCategoryData();
                        setFormData2({
                            ...formData2,
                            ...initialSubCategoryValue
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
                })
                .catch((error) => {
                    setIsFormLoading(false)
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }

    }

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Inventory Categories"} items={["Human Resources", "Inventory", "Inventory Categories"]}/>
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body pt-0">
                        <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-8">

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4 active" data-bs-toggle="tab" href="#category">Category</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-kt-countup-tabs="true" data-bs-toggle="tab" href="#sub_category">Sub Category</a>
                            </li>
                        </ul>

                        <div className="tab-content" id="myTabContent">
                            <div className="tab-pane fade active show" id="category" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary mb-3"
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() =>
                                            setFormData(initialCategoryValue)
                                        }
                                    >
                                        Add Category
                                    </button>
                                </div>
                                <ReportTable title={"Inventory Category"} columns={columns} data={tableData} />
                            </div>
                            <div className="tab-pane fade" id="sub_category" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary mb-3"
                                        data-bs-toggle="modal"
                                        data-bs-target="#sub_cat"
                                        onClick={() => setFormData2(initialSubCategoryValue)
                                        }
                                    >
                                        Add Sub Category
                                    </button>
                                </div>
                                <ReportTable title={"Inventory Sub Category"} columns={columns2} data={tableData2} />
                            </div>
                        </div>
                    </div>
                </div>

                <Modal title={"Add Category"}>
                    <InventoryCategoryForm value = {formData}  isFormLoading={isFormLoading} onChange={handleFormValueChange} onSubmit={onFormSubmit} />
                </Modal>
                <Modal title={"Other Fee Form"} id="sub_cat">
                    <InventorySubCategoryForm value = {formData2} categoryList={categoryList}  isFormLoading={isFormLoading} onChange={handleFormValueChange2} onSubmit={onFormSubmit2} />
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

export default connect(mapStateToProps, null)(InventoryCategory);