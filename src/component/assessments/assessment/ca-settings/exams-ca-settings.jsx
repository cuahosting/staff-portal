import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import Select from "react-select";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function EXAMSEXAMSCASettings(props) {
    const token = props.loginData[0].token;
    const [isLoading, setIsLoading] = useState(true);

    // Custom Select Styles
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            border: '2px solid #e8e8e8',
            backgroundColor: state.isFocused ? '#ffffff' : '#f8f9fa',
            padding: '0.25rem 0.5rem',
            fontSize: '1rem',
            borderRadius: '0.5rem',
            boxShadow: state.isFocused ? '0 6px 20px rgba(13, 110, 253, 0.15)' : provided.boxShadow,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: state.isFocused ? 'translateY(-2px)' : 'none',
            '&:hover': {
                borderColor: '#0d6efd',
                transform: 'translateY(-1px)',
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#e7f3ff' : 'white',
            color: state.isSelected ? 'white' : '#212529',
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:active': {
                backgroundColor: '#0d6efd',
            }
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
            borderRadius: '0.5rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
        }),
        menuList: (provided) => ({
            ...provided,
            padding: 0,
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#6c757d',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#212529',
        }),
    };

    const [caSettingsRecordDatatable,
        setEXAMSCASettingsRecordDatatable,
    ] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Action",
                field: "action",
            },
            {
                label: "CA Name",
                field: "CAName",
            },
            {
                label: "CA Description",
                field: "CADescription",
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
                label: "Semester Code",
                field: "SemesterCode",
            },
            {
                label: "CA Marked",
                field: "CAMarked",
            },
            {
                label: "CA PerCon",
                field: "CAPerCon",
            },
        ],
        rows: [],
    });
    const [runningModule, setRunningModule] = useState([]);
    const [moduleOptions, setModuleOptions] = useState([]);

    const getRunningModule = async () => {
        await axios
            .get(`${serverLink}staff/assessments/staff/running/module/list/${props.loginData[0].StaffID}`, token)
            .then((response) => {
                setRunningModule(response.data);
                // Convert to React-Select options
                const options = response.data.map(item => ({
                    value: item.ModuleCode,
                    label: `${item.ModuleName} (${item.ModuleCode})`
                }));
                setModuleOptions(options);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    };


    const [createEXAMSCASettings, setCreateEXAMSCASettings] =
        useState({
            EntryID: "",
            CAName: "",
            CADescription: "",
            ModuleCode: "",
            ModuleCode2: null,
            SemesterCode: props.currentSemester,
            CAMarked: "",
            CAPerCon: "",
            InsertedOn: "",
            InsertedBy: props.loginData[0].StaffID,
        });

    const getEXAMSCASettingsRecords = async () => {
        await axios
            .get(`${serverLink}staff/assessments/settings/${props.loginData[0].StaffID}/`, token)
            .then((result) => {

                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((settings, index) => {
                        rows.push({
                            sn: index + 1,
                            EntryID: settings.EntryID,
                            CAName: settings.CAName,
                            CADescription: settings.CADescription,
                            ModuleCode: settings.ModuleCode,
                            ModuleName: settings.ModuleName,
                            SemesterCode: settings.SemesterCode,
                            CAMarked: settings.CAMarked,
                            CAPerCon: settings.CAPerCon,
                            InsertedOn: settings.InsertedOn,
                            InsertedBy: `${props.loginData[0].StaffID}`,

                            action: (
                                <>
                                    <button
                                        className="btn btn-link p-0 text-primary"
                                        style={{ marginRight: 15 }}
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        disabled={settings.CAPerCon > 0 && true}
                                        onClick={() =>
                                            setCreateEXAMSCASettings({
                                                EntryID: settings.EntryID,
                                                CAName: settings.CAName,
                                                CADescription: settings.CADescription,
                                                ModuleCode: settings.ModuleCode,
                                                ModuleCode2: {
                                                    value: settings.ModuleCode,
                                                    label: `${settings.ModuleName} (${settings.ModuleCode})`
                                                },
                                                SemesterCode: settings.SemesterCode,
                                                CAMarked: settings.CAMarked,
                                                CAPerCon: settings.CAPerCon,
                                                InsertedOn: settings.InsertedOn,
                                                InsertedBy: `${props.loginData[0].StaffID}`,
                                            })
                                        }
                                        title="Edit"
                                    >
                                        <i style={{ fontSize: '15px', color: "blue" }} className="fa fa-pen" />
                                    </button>
                                    <button
                                        className="btn btn-link p-0 text-danger"
                                        disabled={settings.CAPerCon > 0 && true}
                                        onClick={() => handleDelete(settings.EntryID)}
                                        title="Delete"
                                    >
                                        <i style={{ fontSize: '15px', color: "red" }} className="fa fa-trash" />
                                    </button>
                                </>
                            ),
                        });
                    });

                    setEXAMSCASettingsRecordDatatable({
                        ...caSettingsRecordDatatable,
                        columns: caSettingsRecordDatatable.columns,
                        rows: rows,
                    });
                }

                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    };

    const handleDelete = async (entryID) => {
        const result = await showAlert(
            "DELETE CONFIRMATION",
            "Are you sure you want to delete this CA Setting?",
            "warning",
            true
        );

        if (result.isConfirmed) {
            toast.info("Deleting. Please wait...");
            await axios
                .delete(`${serverLink}staff/assessments/delete/settings/${entryID}`, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("CA Setting deleted successfully");
                        getEXAMSCASettingsRecords();
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

    const onEdit = (e) => {
        setCreateEXAMSCASettings({
            ...createEXAMSCASettings,
            [e.target.id]: e.target.value,
        });
    };

    const onModuleChange = (selectedOption) => {
        setCreateEXAMSCASettings({
            ...createEXAMSCASettings,
            ModuleCode: selectedOption ? selectedOption.value : "",
            ModuleCode2: selectedOption,
        });
    };

    const onSubmit = async () => {
        for (let key in createEXAMSCASettings) {
            if (
                createEXAMSCASettings.hasOwnProperty(key) &&
                key !== "EntryID" &&
                key !== "InsertedOn" &&
                key !== "SemesterCode" &&
                key !== "CAPerCon" &&
                key !== "InsertedBy" &&
                key !== "ModuleCode2"
            ) {
                if (createEXAMSCASettings[key] === "") {
                    await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
                    return false;
                }
            }
        }

        if (createEXAMSCASettings.EntryID === "") {
            toast.info("Submitting. Please wait...");

            const cASettingsSubmission = {
                EntryID: createEXAMSCASettings.EntryID,
                CAName: createEXAMSCASettings.CAName,
                CADescription: createEXAMSCASettings.CADescription,
                ModuleCode: createEXAMSCASettings.ModuleCode,
                SemesterCode: props.currentSemester,
                CAMarked: createEXAMSCASettings.CAMarked,
                InsertedBy: props.loginData[0].StaffID,
            }
            await axios
                .post(
                    `${serverLink}staff/assessments/add/settings/`,
                    cASettingsSubmission, token
                )
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Settings submitted successfully");
                        getEXAMSCASettingsRecords();
                        getRunningModule();
                        document.getElementById("closeModal").click()
                        setCreateEXAMSCASettings({
                            ...createEXAMSCASettings,
                            EntryID: "",
                            CAName: "",
                            CADescription: "",
                            ModuleCode: "",
                            ModuleCode2: null,
                            SemesterCode: "",
                            CAMarked: "",
                            CAPerCon: "",
                            InsertedOn: "",
                            InsertedBy: "",
                        });
                    } else if (result.data.message === "exist") {
                        showAlert("RECORD EXIST", "Record already exist!", "error");
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
            toast.info("Updating. Please wait...");
            const cASettingsSubmission = {
                EntryID: createEXAMSCASettings.EntryID,
                CAName: createEXAMSCASettings.CAName,
                CADescription: createEXAMSCASettings.CADescription,
                ModuleCode: createEXAMSCASettings.ModuleCode,
                SemesterCode: props.currentSemester,
                CAMarked: createEXAMSCASettings.CAMarked,
                InsertedBy: props.loginData[0].StaffID,
            }

            await axios
                .patch(
                    `${serverLink}staff/assessments/update/settings/`,
                    cASettingsSubmission, token
                )
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Settings updated successfully");
                        getEXAMSCASettingsRecords();
                        getRunningModule();
                        document.getElementById("closeModal").click()
                        setCreateEXAMSCASettings({
                            ...createEXAMSCASettings,
                            EntryID: "",
                            CAName: "",
                            CADescription: "",
                            ModuleCode: "",
                            ModuleCode2: null,
                            SemesterCode: "",
                            CAMarked: "",
                            CAPerCon: "",
                            InsertedOn: "",
                            InsertedBy: "",
                        });
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
        getEXAMSCASettingsRecords().then((r) => {});
        getRunningModule().then((r) => {});
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Lecturer CA Settings"}
                items={["Assessment", "Assessment", "Lecturer CA Settings"]}
                buttons={
                    <button
                        type="button"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_modal_general"
                        onClick={() =>
                            setCreateEXAMSCASettings({
                                ...createEXAMSCASettings,
                                EntryID: "",
                                CAName: "",
                                CADescription: "",
                                ModuleCode: "",
                                ModuleCode2: null,
                                SemesterCode: "",
                                CAMarked: "",
                                CAPerCon: "",
                                InsertedOn: "",
                                InsertedBy: "",
                            })
                        }
                    >
                        Add CA Settings
                    </button>
                }
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body pt-0">
                        <AGTable data={caSettingsRecordDatatable} />
                    </div>
                </div>
                <Modal title={"Continuous Assessment Settings"}>
                    <div className="col-lg-12 col-md-12 pt-5">
                        <div className="form-group">
                            <label htmlFor="ModuleCode">Module</label>
                            <Select
                                options={moduleOptions}
                                value={createEXAMSCASettings.ModuleCode2}
                                onChange={onModuleChange}
                                styles={customSelectStyles}
                                placeholder="Select Module"
                                isSearchable
                                isClearable
                            />
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 pt-5">
                        <div className="form-group">
                            <label htmlFor="CAName">CA Name</label>
                            <input
                                type="text"
                                id="CAName"
                                className="form-control"
                                placeholder="CAName"
                                value={createEXAMSCASettings.CAName}
                                onChange={onEdit}
                            />
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 pt-5">
                        <div className="form-group">
                            <label htmlFor="CADescription">CA Description</label>
                            <input
                                type="text"
                                id="CADescription"
                                className="form-control"
                                placeholder="CADescription"
                                value={createEXAMSCASettings.CADescription}
                                onChange={onEdit}
                            />
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 pt-5">
                        <div className="form-group">
                            <label htmlFor="CAMarked">CA Marked</label>
                            <input
                                type="number"
                                id="CAMarked"
                                className="form-control"
                                placeholder="CAMarked"
                                value={createEXAMSCASettings.CAMarked}
                                onChange={onEdit}
                            />
                        </div>
                    </div>

                    <div className="form-group pt-5">
                        <button onClick={onSubmit} className="btn btn-primary w-100">
                            Submit
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
        currentSemester: state.currentSemester,
    };
};

export default connect(mapStateToProps, null)(EXAMSCASettings);
