import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import Table from "../../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function CASettings(props) {
    const token = props.loginData[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const [caSettingsRecordDatatable, 
        setCASettingsRecordDatatable,
    ] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
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
            },{
                label: "CA PerCon",
                field: "CAPerCon",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [runningModule, setRunningModule] = useState([]);

    const getRunningModule = async () => {
        await axios
            .get(`${serverLink}staff/assessments/staff/running/module/list/${props.loginData[0].StaffID}`, token)
            .then((response) => {
                setRunningModule(response.data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    };


    const [createCASettings, setCreateCASettings] =
        useState({
            EntryID: "",
            CAName: "",
            CADescription: "",
            ModuleCode: "",
            SemesterCode: props.currentSemester,
            CAMarked: "",
            CAPerCon: "",
            InsertedOn: "",
            InsertedBy: props.loginData[0].StaffID,
        });

    const getCASettingsRecords = async () => {
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
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    disabled={settings.CAPerCon > 0 && true}
                                    onClick={() =>
                                        setCreateCASettings({
                                            EntryID: settings.EntryID,
                                            CAName: settings.CAName,
                                            CADescription: settings.CADescription,
                                            ModuleCode: settings.ModuleCode,
                                            SemesterCode: settings.SemesterCode,
                                            CAMarked: settings.CAMarked,
                                            CAPerCon: settings.CAPerCon,
                                            InsertedOn: settings.InsertedOn,
                                            InsertedBy: `${props.loginData[0].StaffID}`,
                                        })
                                    }
                                >
                                    <i className="fa fa-pen" />
                                </button>
                            ),
                        });
                    });

                    setCASettingsRecordDatatable({
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

    const onEdit = (e) => {
        setCreateCASettings({
            ...createCASettings,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmit = async () => {
        for (let key in createCASettings) {
            if (
                createCASettings.hasOwnProperty(key) &&
                key !== "EntryID" &&
                key !== "InsertedOn" &&
                key !== "SemesterCode" &&
                key !== "CAPerCon" &&
                key !== "InsertedBy"
            ) {
                if (createCASettings[key] === "") {
                    await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
                    return false;
                }
            }
        }

        if (createCASettings.EntryID === "") {
            toast.info("Submitting. Please wait...");

            const cASettingsSubmission = {
                EntryID: createCASettings.EntryID,
                CAName: createCASettings.CAName,
                CADescription: createCASettings.CADescription,
                ModuleCode: createCASettings.ModuleCode,
                SemesterCode: props.currentSemester,
                CAMarked: createCASettings.CAMarked,
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
                        getCASettingsRecords();
                        getRunningModule();
                        document.getElementById("closeModal").click()
                        setCreateCASettings({
                            ...createCASettings,
                            EntryID: "",
                            CAName: "",
                            CADescription: "",
                            ModuleCode: "",
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
                EntryID: createCASettings.EntryID,
                CAName: createCASettings.CAName,
                CADescription: createCASettings.CADescription,
                ModuleCode: createCASettings.ModuleCode,
                SemesterCode: props.currentSemester,
                CAMarked: createCASettings.CAMarked,
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
                        getCASettingsRecords();
                        getRunningModule();
                        document.getElementById("closeModal").click()
                        setCreateCASettings({
                            ...createCASettings,
                            EntryID: "",
                            CAName: "",
                            CADescription: "",
                            ModuleCode: "",
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
        getCASettingsRecords().then((r) => {});
        getRunningModule().then((r) => {});
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Lecturer CA Settings"}
                items={["Assessment", "Assessment", "Lecturer CA Settings"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
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
                                    onClick={() =>
                                        setCreateCASettings({
                                            ...createCASettings,
                                            EntryID: "",
                                            CAName: "",
                                            CADescription: "",
                                            ModuleCode: "",
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
                            </div>
                        </div>
                    </div>
                    <div className="card-body pt-0">
                        <Table data={caSettingsRecordDatatable} />
                    </div>
                </div>
                <Modal title={"Continuous Assessment Settings"}>
                    <div className="col-lg-12 col-md-12 pt-5">
                        <div className="form-group">
                            <label htmlFor="ModuleCode">Module</label>
                            <select
                                id="ModuleCode"
                                className="form-control"
                                required
                                value={createCASettings.ModuleCode}
                                onChange={onEdit}
                            >
                                <option value="">Select Option</option>
                                {runningModule.length > 0 ? (
                                    <>
                                        {runningModule.map((item, index) => {
                                            return (
                                                <option key={index} value={item.ModuleCode}>
                                                    {`${item.ModuleName} (${item.ModuleCode}) `}
                                                </option>
                                            );
                                        })}
                                    </>
                                ) : (
                                    ""
                                )}
                            </select>
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
                                value={createCASettings.CAName}
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
                                value={createCASettings.CADescription}
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
                                value={createCASettings.CAMarked}
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

export default connect(mapStateToProps, null)(CASettings);
