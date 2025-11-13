import React, {useEffect, useState} from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import axios from "axios";
import {serverLink} from "../../../resources/url";
import Loader from "../../common/loader/loader";
import {showAlert} from "../../common/sweetalert/sweetalert";
import {toast} from "react-toastify";
import {connect} from "react-redux";
import {ModulesForm} from "./modulesform";
import ModulePrerequisites from "./prerequisites";
import ModuleTemplate from "../../../images/Module Templates.csv?url";
import swal from "sweetalert";

function Modules(props) {
    const current = new Date();
    const date = `${current.getDate()}/${
        current.getMonth() + 1
    }/${current.getFullYear()}`;

    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState("off");
    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Module Code",
                field: "ModuleCode",
            },
            {
                label: "Module Name",
                field: "ModuleName",
            },
            {
                label: "ModuleType",
                field: "ModuleType",
            },
            {
                label: "Course Name",
                field: "CourseName",
            },
            {
                label: "CreditUnit",
                field: "CreditUnit",
            },
            {
                label: "CAPerCon",
                field: "CAPerCon",
            },
            {
                label: "ExamPerCon",
                field: "ExamPerCon",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });

    const initializeUpdateModuleCode = {old_module_code: '', new_module_code: ''}
    const [updateModuleCode, setUpdateModuleCode] = useState(initializeUpdateModuleCode);

    const [departmentsList, setDepartments] = useState(props.DepartmentList);
    const [departmentOptions, setDepartmentsOptions] = useState([]);

    const getDepartments = async () => {
        await axios
            .get(`${serverLink}staff/academics/course/list`, token)
            .then((result) => {
                let rows = [];
                if (result.data.length > 0) {
                    result.data.map((row) => {
                        rows.push({value: row.CourseCode, label: row.CourseName})
                    });
                    setDepartmentsOptions(rows)
                    setDepartments(result.data);
                }
            });
    };

    const [upload, setUpload] = useState({
        file: "",
        InsertedBy: props.LoginDetails[0].StaffID,
    });

    const [createModule, setcreateModule] = useState({
        EntryID: "",
        ModuleCode: "",
        ModuleName: "",
        ModuleType: "",
        CreditUnit: "",
        CAPerCon: "",
        ExamPerCon: "",
        DepartmentCode: "",
        DepartmentCode2: "",
        InsertedBy: props.LoginDetails[0].StaffID,
        UpdateDate: "",
    });

    const onDepartmentChange = (e) => {
        setcreateModule({
            ...createModule,
            DepartmentCode: e.value,
            DepartmentCode2: e,
        })
    }


    const [modulesList, setModulesList] = useState([]);
    const getModules = async () => {
        getDepartments();
        await axios
            .get(`${serverLink}staff/academics/modules/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setModulesList(result.data);
                    let rows = [];
                    result.data.map((modules, index) => {
                        rows.push({
                            sn: index + 1,
                            EntryID: modules.EntryID,
                            ModuleCode: modules.ModuleCode,
                            ModuleName: modules.ModuleName,
                            CourseName: modules.CourseName,
                            ModuleType: modules.ModuleType,
                            DepartmentCode: modules.CourseCode,
                            CreditUnit: modules.CreditUnit,
                            CAPerCon: modules.CAPerCon,
                            ExamPerCon: modules.ExamPerCon,
                            action: (
                                <>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() => {
                                            setcreateModule({
                                                ...createModule,
                                                EntryID: modules.EntryID,
                                                ModuleCode: modules.ModuleCode,
                                                ModuleName: modules.ModuleName,
                                                ModuleType: modules.ModuleType,
                                                DepartmentCode: modules.DepartmentCode,
                                                DepartmentCode2: {value: modules.CourseCode, label: modules.CourseName},
                                                CreditUnit: modules.CreditUnit,
                                                CAPerCon: modules.CAPerCon,
                                                ExamPerCon: modules.ExamPerCon,
                                                UpdatedBy: props.LoginDetails[0].StaffID,
                                                action: "update",
                                            });
                                        }}
                                    >
                                        <i className="fa fa-pen"/>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => {
                                            swal({
                                                title: "Are you sure?",
                                                text: "Once deleted, you will not be able to recover it!",
                                                icon: "warning",
                                                buttons: true,
                                                dangerMode: true,
                                            }).then((willDelete) => {
                                                if (willDelete) {
                                                    deleteModule(modules.ModuleCode);
                                                }
                                            });
                                        }}
                                    >
                                        <i className="fa fa-trash"/>
                                    </button>
                                </>
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
        setcreateModule({
            ...createModule,
            [e.target.id]: e.target.value,
        });
    };

    const onEditFile = (e) => {
        const id = e.target.id;
        const value = id === "file" ? e.target.files[0] : e.target.value;
        setUpload({
            ...upload,
            [id]: value,
        });
    };

    const onUploadFile = async () => {
        await axios
            .get(`${serverLink}staff/academics/modules/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let existing_modules = [];
                    result.data.map((modules, index) => {
                        existing_modules.push(modules.ModuleCode);
                    });

                    const formData = new FormData();
                    formData.append("file", upload.file);
                    formData.append("modules", existing_modules);
                    formData.append("InsertedBy", upload.InsertedBy);
                    axios
                        .post(`${serverLink}staff/academics/modules/bulk`, formData, token)
                        .then((result) => {
                            let duplicate = result.data.duplicate;
                            let contribution = result.data.contribution;
                            if (result.data.message === "success") {
                                document.getElementById("closeModal").click();
                                toast.success("Modules Uploaded Successfully");
                                showAlert(
                                    "MODULE UPLOADED",
                                    `Modules Uploaded Successfully! \n   ${
                                        duplicate.length > 0
                                            ? ` However, the following modules exist in the database: ${duplicate}`
                                            : ""
                                    } \n  ${
                                        contribution.length > 0
                                            ? `Contribution Limit Exceeded 100% for: ${contribution}`
                                            : ""
                                    } `,
                                    "success"
                                );
                                getModules();
                                setisFormLoading("off");
                            } else if (result.data.message === "all exist") {
                                showAlert(
                                    "MODULE EXIST",
                                    `All the Uploaded modules exist in the database, Please check and try again! \n ${
                                        duplicate.length > 0 ? duplicate : ""
                                    }  \n  ${
                                        contribution.length > 0
                                            ? `Contribution Limit Exceeded 100% for: ${contribution}`
                                            : ""
                                    } `,
                                    "error"
                                );
                            } else if (result.data.message === "limit exceeded") {
                                showAlert(
                                    "CONTRIBUTION LIMIT EXCEEDED",
                                    `All the Uploaded modules have exceeded contribution limit, Please check and try again! \n  ${
                                        contribution.length > 0 ? contribution : ""
                                    }`,
                                    "error"
                                );
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
            });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (createModule.EntryID === "") {
            if (
                parseInt(createModule.CAPerCon) + parseInt(createModule.ExamPerCon) >
                100
            ) {
                showAlert(
                    "CONTRIBUTION LIMIT EXCEEDED",
                    "CA and Exam contribution cannot exceed 100%!",
                    "error"
                );
            } else {
                setisFormLoading("on");
                await axios
                    .post(`${serverLink}staff/academics/modules/add`, createModule, token)
                    .then((result) => {
                        if (result.data.message === "success") {
                            toast.success("modules Added Successfully");
                            getModules();
                            setcreateModule({
                                ...createModule,
                                EntryID: "",
                                ModuleCode: "",
                                ModuleName: "",
                                ModuleType: "",
                                CreditUnit: "",
                                CAPerCon: "",
                                ExamPerCon: "",
                            });
                            setisFormLoading("off");
                            document.getElementById("closeModal").click();
                        } else if (result.data.message === "exist") {
                            showAlert("MODULE EXIST", "Module already exist!", "error");
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
        } else {
            if (
                parseInt(createModule.CAPerCon) + parseInt(createModule.ExamPerCon) >
                100
            ) {
                showAlert(
                    "CONTRIBUTION LIMIT EXCEEDED",
                    "CA and Exam contribution cannot exceed 100%!",
                    "error"
                );
            } else {
                setisFormLoading("on");
                await axios
                    .patch(`${serverLink}staff/academics/modules/update`, createModule, token)
                    .then((result) => {
                        if (result.data.message === "success") {
                            toast.success("Module Updated Successfully");
                            getModules();
                            setcreateModule({
                                ...createModule,
                                EntryID: "",
                                ModuleCode: "",
                                ModuleName: "",
                                ModuleType: "",
                                CreditUnit: "",
                                CAPerCon: "",
                                ExamPerCon: "",
                            });
                            setisFormLoading("off");
                            document.getElementById("closeModal").click();
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
        }
    };

    async function deleteModule(moduleCode_ln) {
        await axios
            .post(`${serverLink}staff/academics/department/deleteModule`, {
                moduleCode: moduleCode_ln,
            }, token)
            .then((res) => {
                if (res.data.message === "success") {
                    toast.success("Deleted Successfully");
                } else {
                    toast.error(res.data.whatToShow);
                }
            })
            .catch((err) => {
                console.log(err);
                toast.error("NETWORK ERROR. Please try again!");
            });
    }

    const handleSubmitModuleCodeUpdate = async () => {
        if (updateModuleCode.old_module_code.trim() === '') {
            toast.error("Please Enter the Old Module Code");
            return false
        }
        if (updateModuleCode.new_module_code.trim() === '') {
            toast.error("Please Enter the New Module Code");
            return false
        }
        toast.info("Processing... Please wait!");

        await axios.patch(`${serverLink}staff/academics/modules/update-module-code`, updateModuleCode, token)
            .then(res => {
                if (res.data.message === 'success') {
                    toast.success("Module Code Updated Successfully");
                    document.getElementById("closeModal").click();
                    getModules();
                } else {
                    toast.error(res.data.message)
                }
            })
            .catch(e => {
                console.log(e)
                toast.error("Network/Server Error. Please refresh your browser and try again!")
            })

    }

    useEffect(() => {
        getModules();
    }, []);

    return isLoading ? (
        <Loader/>
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Modules"}
                items={["Academics", "Modules", "Manage modules"]}
            />

            <div
                id="kt_content_container"
                className="container-custom container-xxl d-flex flex-column-fluid"
            >
                <div className="pt-0 pb-0">
                    <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder">
                        <li className="nav-item mt-2">
                            <a
                                className="nav-link text-active-primary ms-0 me-10 py-5 active"
                                data-bs-toggle="tab"
                                href="#kt_tabs_tab_1"
                            >
                                Modules
                            </a>
                        </li>
                        <li className="nav-item mt-2">
                            <a
                                className="nav-link text-active-primary ms-0 me-10 py-5"
                                data-bs-toggle="tab"
                                href="#kt_tabs_tab_2"
                            >
                                Prerequisites
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex-column-fluid">
                <div
                    className="tab-content"
                    data-kt-scroll="true"
                    data-kt-scroll-activate="{default: true, lg: false}"
                    data-kt-scroll-height="auto"
                    data-kt-scroll-offset="70px"
                >
                    <div className="tab-pane fade active show" id="kt_tabs_tab_1">
                        <div className="flex-column-fluid">
                            <div className="card">
                                <div className="card-header border-0 pt-6">
                                    <div className="card-title"/>
                                    <div className="card-toolbar">
                                        <div className="d-flex justify-content-end"
                                             data-kt-customer-table-toolbar="base">
                                            <button type="button" className="btn btn-primary" data-bs-toggle="modal"
                                                    data-bs-target="#bulk_modal" style={{marginRight: "5px"}}>Bulk
                                                Upload
                                            </button>
                                            <button type="button" className="btn btn-primary" data-bs-toggle="modal"
                                                    data-bs-target="#kt_modal_general" style={{marginRight: "5px"}}
                                                    onClick={() => setcreateModule({
                                                        ...createModule,
                                                        EntryID: "",
                                                        ModuleCode: "",
                                                        ModuleName: "",
                                                        ModuleType: "",
                                                        CreditUnit: "",
                                                        CAPerCon: "",
                                                        ExamPerCon: "",
                                                        InsertedBy: props.LoginDetails[0].StaffID,
                                                    })}>Add a Module
                                            </button>
                                            <button type="button" className="btn btn-primary" data-bs-toggle="modal"
                                                    data-bs-target="#kt_modal_general_module_code" onClick={() => {
                                                setUpdateModuleCode(initializeUpdateModuleCode)
                                            }}>
                                                Update Module Code
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body pt-0">
                                    <div className="col-md-12" style={{overflowX: "auto"}}>
                                        <Table data={datatable}/>
                                    </div>
                                </div>
                            </div>
                            <Modal title={createModule.EntryID === "" ? "Create Module" : "Edit Module"}>
                                <ModulesForm
                                    onEdit={onEdit}
                                    createModule={createModule}
                                    onSubmit={onSubmit}
                                    departmentsList={departmentsList}
                                    isFormLoading={isFormLoading}
                                    onDepartmentChange={onDepartmentChange}
                                    departmentOptions={departmentOptions}
                                />
                            </Modal>

                            <Modal title={"Modules Bulk Upload"} id={"bulk_modal"}>
                                <div className="row">
                                    <div className="form-group">
                                        <a href={ModuleTemplate} className="float-end">
                                            Click here to download the bulk upload template
                                        </a>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="Designation">File </label>
                                        <input type="file" accept=".csv" id="file" name="file" className="form-control"
                                               placeholder="File Name" required onChange={onEditFile}/>
                                        <span className="badge bg-danger mt-1">
                      Only .csv is allowed
                    </span>
                                    </div>
                                    <div className="form-group pt-4">
                                        <button type="submit" className="btn btn-primary w-100"
                                                id="kt_modal_new_address_submit" onClick={onUploadFile}
                                                data-kt-indicator={props.isFormLoading}>
                                            <span className="indicator-label">Upload</span>
                                            <span className="indicator-progress">
                        Please wait...
                        <span className="spinner-border spinner-border-sm align-middle ms-2"/>
                      </span>
                                        </button>
                                    </div>
                                </div>
                            </Modal>

                            <Modal title={"UPDATE MODULE CODE"} id={"kt_modal_general_module_code"}>
                                <div className="row">

                                    <div className="col-md-6 mb-3">
                                        <div className="form-group">
                                            <label htmlFor="old_module_code"> Enter Old Module Code</label>
                                            <input type="text" className="form-control" id="old_module_code"
                                                   value={updateModuleCode.old_module_code} onChange={(e) => {
                                                setUpdateModuleCode({
                                                    ...updateModuleCode,
                                                    old_module_code: e.target.value
                                                })
                                            }}/>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="form-group">
                                            <label htmlFor="new_module_code"> Enter New Module Code</label>
                                            <input type="text" className="form-control" id="new_module_code"
                                                   value={updateModuleCode.new_module_code} onChange={(e) => {
                                                setUpdateModuleCode({
                                                    ...updateModuleCode,
                                                    new_module_code: e.target.value
                                                })
                                            }}/>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary w-100"
                                            onClick={handleSubmitModuleCodeUpdate}>Submit
                                    </button>
                                </div>
                            </Modal>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="kt_tabs_tab_2">
                        <ModulePrerequisites
                            InsertedBy={props.LoginDetails[0].StaffID}
                            modulesList={modulesList}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        DepartmentList: state.DepartmentList,
    };
};
export default connect(mapStateToProps, null)(Modules);
