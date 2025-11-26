import React, { useEffect, useState } from "react";
import AGTable from "../../../common/table/AGTable";
import Modal from "../../../common/modal/modal";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function BlockSettings(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off')
    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "Block ID",
                field: "BlockID",
            },
            {
                label: "Block Name",
                field: "BlockName",
            },
            {
                label: "Campus",
                field: "CampusID",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [campusList, setCampus] = useState(props.campusList)
    const [createBlock, setcreateBlock] = useState({
        BlockName: "",
        CampusID: "",
        EntryID: ""
    });

    const getBlockName = (campusID)=>{
         if (campusID !== "" ){
            const blockname = props.campusList.length > 0 && props.campusList.filter(x => x.EntryID.toString() === campusID.toString())[0].CampusName;
            return blockname
        }
        
    }

    const getBlock = async () => {
        await axios
            .get(`${serverLink}staff/academics/block/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((Block, index) => {
                        const campus_name  = props.campusList.length > 0 ? props.campusList.filter(x => x.EntryID === Block.CampusID)[0].CampusName : ''
                        rows.push({
                            BlockID: Block.EntryID,
                            BlockName: Block.BlockName,
                            CampusID: campus_name, //getBlockName(Block.CampusID),
                            action: (
                                <button
                                    className="btn btn-link p-0 text-primary" style={{marginRight:15}} title="Edit"
                                    data-bs-toggle="modal"
                                    data-bs-target="#block"
                                    onClick={() =>
                                        {
                                        setcreateBlock({
                                            BlockName: Block.BlockName,
                                            CampusID: Block.CampusID,
                                            EntryID: Block.EntryID,
                                            action: "update",
                                        });
                                        }
                                    }
                                >
                                    <i style={{ fontSize: '15px', color:"blue" }} className="fa fa-pen color-blue" />
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
                console.log(err)
                console.log("NETWORK ERROR");
            });
    };

    const onEdit = (e) => {
        setcreateBlock({
            ...createBlock,
            [e.target.id]: e.target.value,
        });
    };

    const onSubmit = async () => {
        if (createBlock.BlockName.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the Block name", "error");
            return false;
        }
        if (createBlock.CampusID.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select the campus", "error");
            return false;
        }

        if (createBlock.EntryID === "") {
            setisFormLoading('on')
            await axios
                .post(`${serverLink}staff/academics/block/add`, createBlock, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Block Added Successfully");
                        getBlock();
                        props.getData();
                        setcreateBlock({
                            ...createBlock,
                            BlockName: "",
                            CampusID: "",
                        });
                        setisFormLoading('off')
                        document.getElementById("closeModal").click();
                    } else if (result.data.message === "exist") {
                        showAlert("Block EXIST", "Block already exist!", "error");
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
            setisFormLoading('on')
            await axios
                .patch(`${serverLink}staff/academics/block/update`, createBlock, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Block Updated Successfully");
                        getBlock();
                        props.getData();
                        setcreateBlock({
                            ...createBlock,
                            BlockName: "",
                            CampusID: "",
                            EntryID: ""
                        });
                        setisFormLoading('off')
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
    };

    useEffect(() => {
        getBlock();
    }, [campusList]);

    return (
        <div className="card card-no-border">
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
                            data-bs-target="#block"
                            onClick={() =>
                                setcreateBlock({
                                    ...createBlock,
                                    EntryID: "",
                                    BlockName: "",
                                    CampusID: "",
                                })
                            }>
                            Add Block
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body p-0">
                <div className="col-md-12" style={{ overflowX: 'auto' }}>
                    <AGTable data={datatable} />
                </div>
            </div>

            <Modal title={"Manage Block"} id={"block"} close={"block"}>
                <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="CampusID">
                        Campus
                    </label>
                    <div className="enhanced-input-wrapper">
                        <select
                            id="CampusID"
                            onChange={onEdit}
                            value={createBlock.CampusID}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            data-kt-select2="true"
                            data-placeholder="Select option"
                            data-dropdown-parent="#kt_menu_624456606a84b"
                            data-allow-clear="true"
                        >
                            <option value="">-select Campus-</option>
                            {props.campusList.length > 0 ?
                                <>
                                    {props.campusList.map((x, y) => {
                                        return (
                                            <option key={y} value={x.EntryID}>{x.CampusName}</option>
                                        )
                                    })}
                                </>
                                :
                                <></>}
                        </select>
                    </div>
                </div>

                <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="BlockName">
                        Block Name
                    </label>
                    <div className="enhanced-input-wrapper">
                        <input
                            type="text"
                            id="BlockName"
                            onChange={onEdit}
                            value={createBlock.BlockName}
                            className="form-control form-control-lg form-control-solid enhanced-input"
                            placeholder="Enter the Block Name"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="form-group pt-2">
                    <button onClick={onSubmit} className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={isFormLoading}>
                    <span className="indicator-label">Submit</span>
                        <span className="indicator-progress">Please wait...
                            <span className="spinner-border spinner-border-sm align-middle ms-2" />
                        </span>
                    </button>
                </div>
            </Modal>
        </div>
    )
}
const mapStateToProps = (state) => {
    return {
      loginData: state.LoginDetails,
    };
  };
  
  export default connect(mapStateToProps, null)(BlockSettings);
  

