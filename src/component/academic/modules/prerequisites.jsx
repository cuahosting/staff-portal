import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import AGTable from "../../common/table/AGTable";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import SearchSelect from "../../common/select/SearchSelect";

function ModulePrerequisites(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off');
    const [moduleOptions, setModuleOptions] = useState([]);
    const [modulePreOptions, setModulePreOptions] = useState([]);
    const [datatable, setDatatable] = useState({
        columns: [{ label: "S/N", field: "sn" }, { label: "Action", field: "action" }, { label: "Module Name", field: "ModuleCode" }, { label: "Module PreRequisite", field: "PreModuleCode" }],
        rows: [],
    });

    const [createPreRequisite, setcreatePreRequisite] = useState({ ModuleCode: "", ModuleCode2: "", PreModuleCode: "", PreModuleCode2: "", InsertedBy: props.InsertedBy });

    const getPrerequisite = async () => {
        const { success, data } = await api.get("staff/academics/module/prerequisite/list");
        if (success && data?.length > 0) {
            let rows = [];
            data.forEach((preq, index) => {
                let mName = props.modulesList.length > 0 ? props.modulesList.filter(x => x.ModuleCode === preq.ModuleCode)[0]?.ModuleName : "";
                let preqmName = props.modulesList.length > 0 ? props.modulesList.filter(x => x.ModuleCode === preq.PreModuleCode)[0]?.ModuleName : "";
                rows.push({
                    sn: index + 1,
                    action: (
                        <button className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }} title="Edit" data-bs-toggle="modal" data-bs-target="#preqModule"
                            onClick={() => setcreatePreRequisite({ ModuleCode: preq.ModuleCode, ModuleCode2: { value: preq.ModuleCode, label: preq.ModuleCode + "-" + mName }, PreModuleCode: preq.PreModuleCode, PreModuleCode2: { value: preq.PreModuleCode, label: preq.PreModuleCode + "-" + preqmName }, EntryID: preq.EntryID, UpdatedBy: props.InsertedBy })}>
                            <i style={{ fontSize: '15px', color: "blue" }} className="fa fa-pen color-blue" />
                        </button>
                    ),
                    ModuleCode: preq.ModuleCode + "-" + mName, PreModuleCode: preq.PreModuleCode + "-" + preqmName,
                });
            });
            setDatatable({ ...datatable, rows: rows });
        }
        setIsLoading(false);
    };

    const onEdit = (e) => { setcreatePreRequisite({ ...createPreRequisite, [e.target.id]: e.target.value }); };
    const onModuleChange = (e) => { setcreatePreRequisite({ ...createPreRequisite, ModuleCode: e.value, ModuleCode2: e }); };
    const onModulePreRequisiteChange = (e) => { setcreatePreRequisite({ ...createPreRequisite, PreModuleCode: e.value, PreModuleCode2: e }); };

    const onSubmit = async () => {
        if (createPreRequisite.ModuleCode.trim() === "") { showAlert("EMPTY FIELD", "Please select the Module Code", "error"); return false; }
        if (createPreRequisite.PreModuleCode.trim() === "") { showAlert("EMPTY FIELD", "Please select Preqrequisiste", "error"); return false; }
        if (createPreRequisite.ModuleCode.trim() === createPreRequisite.PreModuleCode.trim()) { showAlert("INCORRECT COMBINATION", "Module cannot be prerequiste of itself", "error"); return false; }

        if (createPreRequisite.EntryID === "") {
            setisFormLoading('on');
            const { success, data } = await api.post("staff/academics/module/prerequisite/add", createPreRequisite);
            if (success) {
                if (data?.message === "success") { toast.success("Prerequisite Added Successfully"); getPrerequisite(); setcreatePreRequisite({ ...createPreRequisite, ModuleCode: "", PreModuleCode: "", EntryID: "" }); }
                else if (data?.message === "exist") { showAlert("MODULE EXIST", "Prerequisite Module already exist!", "error"); }
                else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            }
            setisFormLoading('off');
        } else {
            setisFormLoading('on');
            const { success, data } = await api.patch("staff/academics/module/prerequisite/update", createPreRequisite);
            if (success) {
                if (data?.message === "success") { toast.success("Prerequisite Updated Successfully"); getPrerequisite(); setcreatePreRequisite({ ...createPreRequisite, ModuleCode: "", PreModuleCode: "", EntryID: "" }); }
                else if (data?.message === "exist") { showAlert("MODULE EXIST", "Prerequisite Module already exist!", "error"); }
                else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            }
            setisFormLoading('off');
        }
    };

    useEffect(() => {
        getPrerequisite();
        let rows = [];
        props.modulesList.length > 0 && props.modulesList.forEach((x) => { rows.push({ value: x.ModuleCode, label: x.ModuleCode + "-" + x.ModuleName }); });
        setModuleOptions(rows);
    }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                        <div className="card-toolbar"><div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base"><button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#preqModule" onClick={() => setcreatePreRequisite({ ...createPreRequisite, ModuleCode: "", PreModuleCode: "", EntryID: "", InsertedBy: props.InsertedBy })}><i className="fa fa-plus me-2"></i>Add Module Prerquisite</button></div></div>
                    </div>
                    <div className="card-body p-0"><AGTable data={datatable} /></div>
                </div>
                <Modal title={"Module Prerquisite"} id={"preqModule"}>
                    <div className="fv-row mb-6 enhanced-form-group"><label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="ModuleCode">Module Name</label><SearchSelect name="ModuleCode" value={createPreRequisite.ModuleCode2} onChange={onModuleChange} options={moduleOptions} placeholder="select Module" /></div>
                    <div className="fv-row mb-6 enhanced-form-group"><label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="PreModuleCode">Module PreRequisite</label><SearchSelect name="ModuleCode" value={createPreRequisite.PreModuleCode2} onChange={onModulePreRequisiteChange} options={moduleOptions} placeholder="select Module PreRequisite" /></div>
                    <br />
                    <div className="form-group pt-2"><button onClick={onSubmit} className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={isFormLoading}><span className="indicator-label">Submit</span><span className="indicator-progress">Please wait...<span className="spinner-border spinner-border-sm align-middle ms-2" /></span></button></div>
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails }; };
export default connect(mapStateToProps, null)(ModulePrerequisites);
