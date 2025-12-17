import React, { useEffect, useState, useMemo } from "react";
import AGTable from "../../../common/table/AGTable";
import Modal from "../../../common/modal/modal";
import { api } from "../../../../resources/api";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";

function VenueSettings(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off');
    const [datatable, setDatatable] = useState({ columns: [{ label: "Venue ID", field: "VenueID" }, { label: "Action", field: "action" }, { label: "Venue Name", field: "VenueName" }, { label: "Campus", field: "CampusID" }, { label: "Block", field: "BlockID" }, { label: "Capacity", field: "Capacity" }], rows: [] });
    const [BlockList, setBlockList] = useState([]);
    const [Blocks, setBlocks] = useState(props.BlockList);
    const [CampustList, setCampusList] = useState(props.campusList);
    const [createVenue, setcreateVenue] = useState({ CampusID: "", VenueName: "", BlockID: "", Capacity: "", InsertedBy: props.LoginDetails[0].StaffID, EntryID: "" });

    const campusOptions = useMemo(() => { return props.campusList.map(x => ({ value: x.EntryID, label: x.CampusName })); }, [props.campusList]);
    const blockOptions = useMemo(() => { return BlockList.map(x => ({ value: x.EntryID, label: x.BlockName })); }, [BlockList]);

    const getVenue = async () => {
        const { success, data } = await api.get("staff/academics/venue/list");
        if (success && data?.length > 0) {
            let rows = [];
            data.forEach((venue) => {
                rows.push({
                    CampusID: props.campusList.filter(x => x.EntryID.toString() === venue.CampusID.toString())[0]?.CampusName,
                    VenueID: venue.EntryID, VenueName: venue.VenueName,
                    BlockID: props.BlockList.filter(x => x.EntryID.toString() === venue.BlockID.toString())[0]?.BlockName,
                    Capacity: venue.Capacity,
                    action: (<button className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }} title="Edit" data-bs-toggle="modal" data-bs-target="#Venue" onClick={() => { setBlockList(Blocks.filter(x => x.CampusID.toString().toLowerCase() === venue.CampusID.toString().toLowerCase())); setcreateVenue({ EntryID: venue.EntryID, VenueName: venue.VenueName, BlockID: venue.BlockID, CampusID: venue.CampusID, Capacity: venue.Capacity, UpdatedBy: props.LoginDetails[0].StaffID, action: "update" }); }}><i style={{ fontSize: '15px', color: "blue" }} className="fa fa-pen color-blue" /></button>),
                });
            });
            setDatatable({ ...datatable, rows: rows });
        }
        setIsLoading(false);
    };

    const onEdit = (e) => { setcreateVenue({ ...createVenue, [e.target.id]: e.target.value }); if (e.target.id === "CampusID") { setBlockList(props.BlockList.filter(x => x.CampusID.toString() === e.target.value.toString())); } };

    const onSubmit = async () => {
        if (createVenue.VenueName.trim() === "") { showAlert("EMPTY FIELD", "Please enter the Venue name", "error"); return false; }
        if (createVenue.BlockID.toString().trim() === "") { showAlert("EMPTY FIELD", "Please select the campus", "error"); return false; }

        if (createVenue.EntryID === "") {
            setisFormLoading('on');
            const { success, data } = await api.post("staff/academics/venue/add", createVenue);
            if (success) {
                if (data?.message === "success") { toast.success("Venue Added Successfully"); getVenue(); props.getData(); setcreateVenue({ ...createVenue, CampusID: "", VenueName: "", BlockID: "", Capacity: "", EntryID: "" }); document.getElementById("closeModal").click(); }
                else if (data?.message === "exist") { showAlert("Venue EXIST", "Venue already exist!", "error"); }
                else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            }
            setisFormLoading('off');
        } else {
            setisFormLoading('on');
            const { success, data } = await api.patch("staff/academics/venue/update", createVenue);
            if (success) {
                if (data?.message === "success") { toast.success("Venue Updated Successfully"); getVenue(); props.getData(); setcreateVenue({ ...createVenue, CampusID: "", VenueName: "", BlockID: "", Capacity: "", EntryID: "" }); document.getElementById("closeModal").click(); }
                else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            }
            setisFormLoading('off');
        }
    };

    useEffect(() => { getVenue(); }, []);

    return isLoading ? (<Loader />) : (
        <>
            <div className="card card-no-border">
                <div className="card-header border-0 pt-6"><div className="card-title" /><div className="card-toolbar"><div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base"><button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#Venue" onClick={() => setcreateVenue({ ...createVenue, CampusID: "", VenueName: "", BlockID: "", Capacity: "", EntryID: "", InsertedBy: props.LoginDetails[0].StaffID })}><i className="fa fa-plus me-2"></i>Add Venue</button></div></div></div>
                <div className="card-body p-0"><div className="col-md-12" style={{ overflowX: 'auto' }}><AGTable data={datatable} /></div></div>
                <Modal title={"Manage Venue"} id={"Venue"} close={"Venue"}>
                    <div className="fv-row mb-6 enhanced-form-group"><label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CampusID">Campus</label><div className="enhanced-input-wrapper"><SearchSelect id="CampusID" value={campusOptions.find(opt => opt.value === createVenue.CampusID) || null} options={campusOptions} onChange={(selected) => onEdit({ target: { id: 'CampusID', value: selected?.value || '' } })} placeholder="-select Campus-" isClearable={false} /></div></div>
                    <div className="fv-row mb-6 enhanced-form-group"><label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="BlockID">Block</label><div className="enhanced-input-wrapper"><SearchSelect id="BlockID" value={blockOptions.find(opt => opt.value === createVenue.BlockID) || null} options={blockOptions} onChange={(selected) => onEdit({ target: { id: 'BlockID', value: selected?.value || '' } })} placeholder="-select Block-" isClearable={false} /></div></div>
                    <div className="fv-row mb-6 enhanced-form-group"><label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="VenueName">Venue Name</label><div className="enhanced-input-wrapper"><input type="text" id="VenueName" onChange={onEdit} value={createVenue.VenueName} className="form-control form-control-lg form-control-solid enhanced-input" placeholder="Enter the Venue Name" autoComplete="off" /></div></div>
                    <div className="fv-row mb-6 enhanced-form-group"><label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="Capacity">Capacity</label><div className="enhanced-input-wrapper"><input type="text" id="Capacity" onChange={onEdit} value={createVenue.Capacity} className="form-control form-control-lg form-control-solid enhanced-input" placeholder="Enter the Venue Capacity" autoComplete="off" /></div></div>
                    <div className="form-group pt-2"><button onClick={onSubmit} className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={isFormLoading}><span className="indicator-label">Submit</span><span className="indicator-progress">Please wait...<span className="spinner-border spinner-border-sm align-middle ms-2" /></span></button></div>
                </Modal>
            </div>
        </>
    );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails }; };
export default connect(mapStateToProps, null)(VenueSettings);
