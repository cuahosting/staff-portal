import React, { useEffect, useState, useMemo } from "react";
import AGTable from "../../../common/table/AGTable";
import Modal from "../../../common/modal/modal";
import { api } from "../../../../resources/api";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";

function BlockSettings(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off');
    const [datatable, setDatatable] = useState({ columns: [{ label: "Block ID", field: "BlockID" }, { label: "Action", field: "action" }, { label: "Block Name", field: "BlockName" }, { label: "Campus", field: "CampusID" }], rows: [] });
    const [campusList, setCampus] = useState(props.campusList);
    const [createBlock, setcreateBlock] = useState({ BlockName: "", CampusID: "", EntryID: "" });

    const campusOptions = useMemo(() => { return props.campusList.map(x => ({ value: x.EntryID, label: x.CampusName })); }, [props.campusList]);

    const getBlock = async () => {
        const { success, data } = await api.get("staff/academics/block/list");
        if (success && data?.length > 0) {
            let rows = [];
            data.forEach((Block) => {
                const campus_name = props.campusList.length > 0 ? props.campusList.filter(x => x.EntryID === Block.CampusID)[0]?.CampusName : '';
                rows.push({
                    BlockID: Block.EntryID, BlockName: Block.BlockName, CampusID: campus_name,
                    action: (<button className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }} title="Edit" data-bs-toggle="modal" data-bs-target="#block" onClick={() => { setcreateBlock({ BlockName: Block.BlockName, CampusID: Block.CampusID, EntryID: Block.EntryID, action: "update" }); }}><i style={{ fontSize: '15px', color: "blue" }} className="fa fa-pen color-blue" /></button>),
                });
            });
            setDatatable({ ...datatable, rows: rows });
        }
        setIsLoading(false);
    };

    const onEdit = (e) => { setcreateBlock({ ...createBlock, [e.target.id]: e.target.value }); };

    const onSubmit = async () => {
        if (createBlock.BlockName.trim() === "") { showAlert("EMPTY FIELD", "Please enter the Block name", "error"); return false; }
        if (createBlock.CampusID.toString().trim() === "") { showAlert("EMPTY FIELD", "Please select the campus", "error"); return false; }

        if (createBlock.EntryID === "") {
            setisFormLoading('on');
            const { success, data } = await api.post("staff/academics/block/add", createBlock);
            if (success) {
                if (data?.message === "success") { toast.success("Block Added Successfully"); getBlock(); props.getData(); setcreateBlock({ ...createBlock, BlockName: "", CampusID: "" }); document.getElementById("closeModal").click(); }
                else if (data?.message === "exist") { showAlert("Block EXIST", "Block already exist!", "error"); }
                else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            }
            setisFormLoading('off');
        } else {
            setisFormLoading('on');
            const { success, data } = await api.patch("staff/academics/block/update", createBlock);
            if (success) {
                if (data?.message === "success") { toast.success("Block Updated Successfully"); getBlock(); props.getData(); setcreateBlock({ ...createBlock, BlockName: "", CampusID: "", EntryID: "" }); document.getElementById("closeModal").click(); }
                else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            }
            setisFormLoading('off');
        }
    };

    useEffect(() => { getBlock(); }, [campusList]);

    return (
        <div className="card card-no-border">
            <div className="card-header border-0 pt-6"><div className="card-title" /><div className="card-toolbar"><div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base"><button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#block" onClick={() => setcreateBlock({ ...createBlock, EntryID: "", BlockName: "", CampusID: "" })}><i className="fa fa-plus me-2"></i>Add Block</button></div></div></div>
            <div className="card-body p-0"><div className="col-md-12" style={{ overflowX: 'auto' }}><AGTable data={datatable} /></div></div>
            <Modal title={"Manage Block"} id={"block"} close={"block"}>
                <div className="fv-row mb-6 enhanced-form-group"><label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CampusID">Campus</label><div className="enhanced-input-wrapper"><SearchSelect id="CampusID" value={campusOptions.find(opt => opt.value === createBlock.CampusID) || null} options={campusOptions} onChange={(selected) => onEdit({ target: { id: 'CampusID', value: selected?.value || '' } })} placeholder="-select Campus-" isClearable={false} /></div></div>
                <div className="fv-row mb-6 enhanced-form-group"><label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="BlockName">Block Name</label><div className="enhanced-input-wrapper"><input type="text" id="BlockName" onChange={onEdit} value={createBlock.BlockName} className="form-control form-control-lg form-control-solid enhanced-input" placeholder="Enter the Block Name" autoComplete="off" /></div></div>
                <div className="form-group pt-2"><button onClick={onSubmit} className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={isFormLoading}><span className="indicator-label">Submit</span><span className="indicator-progress">Please wait...<span className="spinner-border spinner-border-sm align-middle ms-2" /></span></button></div>
            </Modal>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(BlockSettings);
