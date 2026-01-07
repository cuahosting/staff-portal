import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import SearchSelect from "../../../common/select/SearchSelect";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function EXAMSCASettings(props) {
    const [isLoading, setIsLoading] = useState(true);
    const customSelectStyles = {
        control: (provided, state) => ({ ...provided, border: '2px solid #e8e8e8', backgroundColor: state.isFocused ? '#ffffff' : '#f8f9fa', padding: '0.25rem 0.5rem', fontSize: '1rem', borderRadius: '0.5rem', boxShadow: state.isFocused ? '0 6px 20px rgba(13, 110, 253, 0.15)' : provided.boxShadow, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: state.isFocused ? 'translateY(-2px)' : 'none', '&:hover': { borderColor: '#0d6efd', transform: 'translateY(-1px)' } }),
        option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#e7f3ff' : 'white', color: state.isSelected ? 'white' : '#212529', padding: '0.75rem 1rem', cursor: 'pointer', transition: 'all 0.2s ease', '&:active': { backgroundColor: '#0d6efd' } }),
        menu: (provided) => ({ ...provided, zIndex: 9999, borderRadius: '0.5rem', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }),
        menuList: (provided) => ({ ...provided, padding: 0 }),
        placeholder: (provided) => ({ ...provided, color: '#6c757d' }),
        singleValue: (provided) => ({ ...provided, color: '#212529' })
    };

    const [caSettingsRecordDatatable, setEXAMSCASettingsRecordDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Action", field: "action" },
            { label: "CA Name", field: "CAName" },
            { label: "CA Description", field: "CADescription" },
            { label: "Module Code", field: "ModuleCode" },
            { label: "Module Name", field: "ModuleName" },
            { label: "Semester Code", field: "SemesterCode" },
            { label: "CA Marked", field: "CAMarked" },
            { label: "CA PerCon", field: "CAPerCon" }
        ],
        rows: []
    });

    const [moduleOptions, setModuleOptions] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [isModulesLoading, setIsModulesLoading] = useState(false);

    const [createEXAMSCASettings, setCreateEXAMSCASettings] = useState({
        EntryID: "",
        CAName: "",
        CADescription: "",
        ModuleCode: "",
        ModuleCode2: null,
        SemesterCode: "",
        SemesterCode2: null,
        CAMarked: "",
        CAPerCon: "",
        InsertedOn: "",
        InsertedBy: props.loginData[0].StaffID
    });

    // Fetch semesters list
    const getSemesters = async () => {
        const { success, data } = await api.get(`staff/assessments/semesters/list`);
        if (success && data) {
            const options = data.map(item => ({
                value: item.SemesterCode,
                label: `${item.SemesterName} ${item.Status === 'active' ? '(Active)' : ''}`
            }));
            setSemesterOptions(options);
        }
    };

    // Fetch modules by semester from timetable
    const getModulesBySemester = async (semesterCode) => {
        if (!semesterCode) {
            setModuleOptions([]);
            return;
        }
        setIsModulesLoading(true);
        const { success, data } = await api.get(`staff/assessments/timetable/modules/${semesterCode}`);
        if (success && data) {
            const options = data.map(item => ({
                value: item.ModuleCode,
                label: `${item.ModuleName} (${item.ModuleCode})`
            }));
            setModuleOptions(options);
        } else {
            setModuleOptions([]);
        }
        setIsModulesLoading(false);
    };

    const getEXAMSCASettingsRecords = async () => {
        const { success, data: result } = await api.get(`staff/assessments/settings/${props.loginData[0].StaffID}/`);
        if (success && result?.length > 0) {
            let rows = [];
            result.forEach((settings, index) => {
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
                                onClick={() => handleEdit(settings)}
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
                    )
                });
            });
            setEXAMSCASettingsRecordDatatable({ ...caSettingsRecordDatatable, columns: caSettingsRecordDatatable.columns, rows: rows });
        }
        setIsLoading(false);
    };

    const handleEdit = async (settings) => {
        // First load modules for the semester
        await getModulesBySemester(settings.SemesterCode);

        // Find semester option
        const semOption = semesterOptions.find(s => s.value === settings.SemesterCode);

        setCreateEXAMSCASettings({
            EntryID: settings.EntryID,
            CAName: settings.CAName,
            CADescription: settings.CADescription,
            ModuleCode: settings.ModuleCode,
            ModuleCode2: { value: settings.ModuleCode, label: `${settings.ModuleName} (${settings.ModuleCode})` },
            SemesterCode: settings.SemesterCode,
            SemesterCode2: semOption || { value: settings.SemesterCode, label: settings.SemesterCode },
            CAMarked: settings.CAMarked,
            CAPerCon: settings.CAPerCon,
            InsertedOn: settings.InsertedOn,
            InsertedBy: `${props.loginData[0].StaffID}`
        });
        setSelectedSemester(semOption || { value: settings.SemesterCode, label: settings.SemesterCode });
    };

    const handleDelete = async (entryID) => {
        const result = await showAlert("DELETE CONFIRMATION", "Are you sure you want to delete this CA Setting?", "warning", true);
        if (result.isConfirmed) {
            toast.info("Deleting. Please wait...");
            const { success } = await api.delete(`staff/assessments/delete/settings/${entryID}`);
            if (success) {
                toast.success("CA Setting deleted successfully");
                getEXAMSCASettingsRecords();
            } else {
                showAlert("ERROR", "Something went wrong. Please try again!", "error");
            }
        }
    };

    const onEdit = (e) => {
        setCreateEXAMSCASettings({ ...createEXAMSCASettings, [e.target.id]: e.target.value });
    };

    const onSemesterChange = async (selectedOption) => {
        setSelectedSemester(selectedOption);
        setCreateEXAMSCASettings({
            ...createEXAMSCASettings,
            SemesterCode: selectedOption ? selectedOption.value : "",
            SemesterCode2: selectedOption,
            ModuleCode: "",
            ModuleCode2: null
        });
        // Fetch modules for the selected semester
        await getModulesBySemester(selectedOption ? selectedOption.value : null);
    };

    const onModuleChange = (selectedOption) => {
        setCreateEXAMSCASettings({
            ...createEXAMSCASettings,
            ModuleCode: selectedOption ? selectedOption.value : "",
            ModuleCode2: selectedOption
        });
    };

    const onSubmit = async () => {
        // Validate semester
        if (!createEXAMSCASettings.SemesterCode) {
            await showAlert("EMPTY FIELD", "Please select a Semester", "error");
            return false;
        }
        // Validate module
        if (!createEXAMSCASettings.ModuleCode) {
            await showAlert("EMPTY FIELD", "Please select a Module", "error");
            return false;
        }
        // Validate other fields
        for (let key in createEXAMSCASettings) {
            if (createEXAMSCASettings.hasOwnProperty(key) && key !== "EntryID" && key !== "InsertedOn" && key !== "SemesterCode" && key !== "SemesterCode2" && key !== "CAPerCon" && key !== "InsertedBy" && key !== "ModuleCode2" && key !== "ModuleCode") {
                if (createEXAMSCASettings[key] === "") {
                    await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
                    return false;
                }
            }
        }

        const cASettingsSubmission = {
            EntryID: createEXAMSCASettings.EntryID,
            CAName: createEXAMSCASettings.CAName,
            CADescription: createEXAMSCASettings.CADescription,
            ModuleCode: createEXAMSCASettings.ModuleCode,
            SemesterCode: createEXAMSCASettings.SemesterCode,
            CAMarked: createEXAMSCASettings.CAMarked,
            InsertedBy: props.loginData[0].StaffID
        };

        if (createEXAMSCASettings.EntryID === "") {
            toast.info("Submitting. Please wait...");
            const { success, message } = await api.post("staff/assessments/add/settings/", cASettingsSubmission);
            if (success) {
                toast.success("Settings submitted successfully");
                getEXAMSCASettingsRecords();
                document.getElementById("closeModal").click();
                resetForm();
            } else if (message === "exist") {
                showAlert("RECORD EXIST", "Record already exist!", "error");
            } else {
                showAlert("ERROR", "Something went wrong. Please try again!", "error");
            }
        } else {
            toast.info("Updating. Please wait...");
            const { success } = await api.patch("staff/assessments/update/settings/", cASettingsSubmission);
            if (success) {
                toast.success("Settings updated successfully");
                getEXAMSCASettingsRecords();
                document.getElementById("closeModal").click();
                resetForm();
            } else {
                showAlert("ERROR", "Something went wrong. Please try again!", "error");
            }
        }
    };

    const resetForm = () => {
        setCreateEXAMSCASettings({
            EntryID: "",
            CAName: "",
            CADescription: "",
            ModuleCode: "",
            ModuleCode2: null,
            SemesterCode: "",
            SemesterCode2: null,
            CAMarked: "",
            CAPerCon: "",
            InsertedOn: "",
            InsertedBy: props.loginData[0].StaffID
        });
        setSelectedSemester(null);
        setModuleOptions([]);
    };

    useEffect(() => {
        getEXAMSCASettingsRecords();
        getSemesters();
    }, []);

    return isLoading ? (<Loader />) : (
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
                        onClick={() => resetForm()}
                    >
                        Add CA Settings
                    </button>
                }
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body p-0">
                        <AGTable data={caSettingsRecordDatatable} />
                    </div>
                </div>
                <Modal title={"Continuous Assessment Settings"}>
                    <div className="col-lg-12 col-md-12 pt-5">
                        <div className="form-group">
                            <label htmlFor="SemesterCode">Semester <span className="text-danger">*</span></label>
                            <SearchSelect
                                options={semesterOptions}
                                value={createEXAMSCASettings.SemesterCode2}
                                onChange={onSemesterChange}
                                styles={customSelectStyles}
                                placeholder="Select Semester First"
                                isSearchable
                                isClearable
                            />
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 pt-5">
                        <div className="form-group">
                            <label htmlFor="ModuleCode">Module <span className="text-danger">*</span></label>
                            <SearchSelect
                                options={moduleOptions}
                                value={createEXAMSCASettings.ModuleCode2}
                                onChange={onModuleChange}
                                styles={customSelectStyles}
                                placeholder={isModulesLoading ? "Loading modules..." : (selectedSemester ? "Select Module" : "Select Semester First")}
                                isSearchable
                                isClearable
                                isDisabled={!selectedSemester || isModulesLoading}
                                isLoading={isModulesLoading}
                            />
                            {selectedSemester && moduleOptions.length === 0 && !isModulesLoading && (
                                <small className="text-muted">No modules found on the timetable for this semester</small>
                            )}
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 pt-5">
                        <div className="form-group">
                            <label htmlFor="CAName">CA Name <span className="text-danger">*</span></label>
                            <input type="text" id="CAName" className="form-control" placeholder="e.g. 1st CA" value={createEXAMSCASettings.CAName} onChange={onEdit} />
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 pt-5">
                        <div className="form-group">
                            <label htmlFor="CADescription">CA Description <span className="text-danger">*</span></label>
                            <input type="text" id="CADescription" className="form-control" placeholder="e.g. First Continuous Assessment" value={createEXAMSCASettings.CADescription} onChange={onEdit} />
                        </div>
                    </div>
                    <div className="col-lg-12 col-md-12 pt-5">
                        <div className="form-group">
                            <label htmlFor="CAMarked">CA Marked <span className="text-danger">*</span></label>
                            <input type="number" id="CAMarked" className="form-control" placeholder="e.g. 20" value={createEXAMSCASettings.CAMarked} onChange={onEdit} />
                        </div>
                    </div>
                    <div className="form-group pt-5">
                        <button onClick={onSubmit} className="btn btn-primary w-100">Submit</button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails, currentSemester: state.currentSemester }; };
export default connect(mapStateToProps, null)(EXAMSCASettings);
