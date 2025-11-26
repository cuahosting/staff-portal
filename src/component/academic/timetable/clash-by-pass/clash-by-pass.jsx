import React, { useEffect, useState } from "react";
import AGTable from "../../../common/table/AGTable";
import Modal from "../../../common/modal/modal";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import PageHeader from "../../../common/pageheader/pageheader";

function ClashByPass(props) {
    const token = props.LoginDetails[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off')
    const [facultyList, setFacultyList] = useState(
        props.FacultyList.length > 0 ? props.FacultyList : []
    )
    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "Faculty Code",
                field: "FacultyCode",
            },
            {
                label: "Faculty Name",
                field: "FacultyName",
            },
            {
                label: "Action",
                field: "action",
            }
        ],
        rows: [],
    });
    const [clash, setClash] = useState({
        FacultyCode: "",
        InsertedBy: props.LoginDetails[0].StaffID,
        EntryID: ""
    });

    const getClashes = async () => {
        await axios
            .get(`${serverLink}staff/academics/timetable/clashbypass/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((val, index) => {
                        rows.push({
                            FacultyCode: val.FacultyCode,
                            FacultyName: facultyList.filter(x => x.FacultyCode.toString().toLowerCase() === val.FacultyCode.toString().toLowerCase())[0].FacultyName,
                            action: (
                                <button
                                    className="btn btn-link p-0 text-danger" title="Delete"
                                    onClick={() => {
                                        removebyPass(val.FacultyCode)
                                    }
                                    }
                                >
                                    <i style={{ fontSize: '15px', color:"red" }} className="fa fa-trash" />
                                </button>
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
        setClash({
            ...clash,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmit = async () => {

        if (clash.FacultyCode.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select the campus", "error");
            return false;
        }

        if (clash.EntryID === "") {
            setisFormLoading('on')
            await axios
                .post(`${serverLink}staff/academics/timetable/clashbypass/add`, clash, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Bypass Added Successfully");
                        getClashes();
                        setClash({
                            ...clash,
                            FacultyCode: "",
                            EntryID: "",
                        });
                        setisFormLoading('off')
                        document.getElementById("closeModal").click();
                    } else if (result.data.message === "exist") {
                        setisFormLoading('off')
                        showAlert("EXISTS", "Clash bypass already allowed!", "error");
                    } else {
                        setisFormLoading('off')
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

    const removebyPass = async (e) => {
        await axios.delete(`${serverLink}staff/academics/timetable/clashbypass/remove/${e}`, token)
            .then((result) => {
                if (result.data.message === "deleted") {
                    toast.success("Bypass Added removed");
                }
                getClashes();
            })
    }

    useEffect(() => {
        getClashes();
    }, []);

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Timetable Clash Bypass"}
                items={["Academics", " Timetable bypass"]}
            />
        <div className="card card-no-border" style={{ width: '100%' }}>
            <div className="card-header border-0 pt-6">
                <div className="card-title" />
                <div className="card-toolbar">
                    <div
                        className="d-flex justify-content-end"
                        data-kt-customer-table-toolbar="base">
                        <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#bypass"
                            onClick={() =>
                                setClash({
                                    ...clash,
                                    EntryID: "",
                                    FacultyCode: ""
                                })
                            }>
                            Add Clash
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body p-0" >
                <div className="col-md-12" >
                    <AGTable data={datatable} />
                </div>
            </div>

            <Modal title={"Manage bypass"} id={"bypass"} close={"bypass"}>
                <div className="form-group">
                    <label htmlFor="FacultyCode">Faculty</label>
                    <select id="FacultyCode" onChange={onEdit}
                        value={clash.FacultyCode}
                        className="form-select form-select-solid"
                        data-kt-select2="true"
                        data-placeholder="Select option"
                        data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">
                        <option value={""}>-select Faculty-</option>
                        {facultyList.length > 0 ?
                            <>
                                {facultyList.map((x, y) => {
                                    return (
                                        <option key={y} value={x.FacultyCode}>{x.FacultyCode} {x.FacultyName}</option>
                                    )
                                })}
                            </>
                            :
                            <></>}
                    </select>
                </div>

                <div className="form-group pt-2 mt-3">
                    <button onClick={onSubmit} className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={isFormLoading}>
                        <span className="indicator-label">Submit</span>
                        <span className="indicator-progress">Please wait...
                            <span className="spinner-border spinner-border-sm align-middle ms-2" />
                        </span>
                    </button>
                </div>
            </Modal>
        </div>
        </div>
    )
}
const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        FacultyList: state.FacultyList
    };
};
export default connect(mapStateToProps, null)(ClashByPass);