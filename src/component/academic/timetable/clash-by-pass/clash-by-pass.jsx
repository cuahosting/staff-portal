import React, { useEffect, useState } from "react";
import AGTable from "../../../common/table/AGTable";
import Modal from "../../../common/modal/modal";
import { api } from "../../../../resources/api";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import PageHeader from "../../../common/pageheader/pageheader";

function ClashByPass(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off');
    const [facultyList, setFacultyList] = useState(props.FacultyList.length > 0 ? props.FacultyList : []);
    const [datatable, setDatatable] = useState({ columns: [{ label: "Faculty Code", field: "FacultyCode" }, { label: "Action", field: "action" }, { label: "Faculty Name", field: "FacultyName" }], rows: [] });
    const [clash, setClash] = useState({ FacultyCode: "", InsertedBy: props.LoginDetails[0].StaffID, EntryID: "" });

    const getClashes = async () => {
        const { success, data } = await api.get("staff/academics/timetable/clashbypass/list");
        if (success && data?.length > 0) {
            let rows = [];
            data.forEach((val) => {
                rows.push({
                    FacultyCode: val.FacultyCode,
                    FacultyName: facultyList.filter(x => x.FacultyCode.toString().toLowerCase() === val.FacultyCode.toString().toLowerCase())[0]?.FacultyName,
                    action: (<button className="btn btn-link p-0 text-danger" title="Delete" onClick={() => { removebyPass(val.FacultyCode); }}><i style={{ fontSize: '15px', color: "red" }} className="fa fa-trash" /></button>),
                });
            });
            setDatatable({ ...datatable, rows: rows });
        }
        setIsLoading(false);
    };

    const onEdit = (e) => { setClash({ ...clash, [e.target.id]: e.target.value }); };

    const onSubmit = async () => {
        if (clash.FacultyCode.toString().trim() === "") { showAlert("EMPTY FIELD", "Please select the campus", "error"); return false; }
        if (clash.EntryID === "") {
            setisFormLoading('on');
            const { success, data } = await api.post("staff/academics/timetable/clashbypass/add", clash);
            if (success) {
                if (data?.message === "success") { toast.success("Bypass Added Successfully"); getClashes(); setClash({ ...clash, FacultyCode: "", EntryID: "" }); document.getElementById("closeModal").click(); }
                else if (data?.message === "exist") { showAlert("EXISTS", "Clash bypass already allowed!", "error"); }
                else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            }
            setisFormLoading('off');
        }
    };

    const removebyPass = async (e) => {
        const { success, data } = await api.delete(`staff/academics/timetable/clashbypass/remove/${e}`);
        if (success && data?.message === "deleted") { toast.success("Bypass removed"); }
        getClashes();
    };

    useEffect(() => { getClashes(); }, []);

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Timetable Clash Bypass"} items={["Academics", " Timetable bypass"]} buttons={<button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#bypass" onClick={() => setClash({ ...clash, EntryID: "", FacultyCode: "" })}><i className="fa fa-plus me-2"></i>Add Clash</button>} />
            <div className="card card-no-border" style={{ width: '100%' }}>
                <div className="card-body p-0"><div className="col-md-12"><AGTable data={datatable} /></div></div>
                <Modal title={"Manage bypass"} id={"bypass"} close={"bypass"}>
                    <div className="form-group"><label htmlFor="FacultyCode">Faculty</label><select id="FacultyCode" onChange={onEdit} value={clash.FacultyCode} className="form-select form-select-solid" data-kt-select2="true" data-placeholder="Select option" data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true"><option value={""}>-select Faculty-</option>{facultyList.length > 0 && facultyList.map((x, y) => (<option key={y} value={x.FacultyCode}>{x.FacultyCode} {x.FacultyName}</option>))}</select></div>
                    <div className="form-group pt-2 mt-3"><button onClick={onSubmit} className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={isFormLoading}><span className="indicator-label">Submit</span><span className="indicator-progress">Please wait...<span className="spinner-border spinner-border-sm align-middle ms-2" /></span></button></div>
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails, FacultyList: state.FacultyList }; };
export default connect(mapStateToProps, null)(ClashByPass);