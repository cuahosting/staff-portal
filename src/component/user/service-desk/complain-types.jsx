import React, { useState } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import axios from 'axios'
import { toast } from "react-toastify";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { serverLink } from "../../../resources/url";
import { useEffect } from "react";
import JoditEditor from "jodit-react";
import ReportTable from "../../common/table/report_table";


const ComplainTypes = (props) => {
    const token = props.LoginDetails[0].token;
    const [isLoading, setisLoading] = useState(true);
    const [complainTypes, setComplainTypes] = useState([]);
    const [isFormLoading, setIsFormLoading] = useState('off')
    const [complain, setComplain] = useState({
        ComplainType: "",
        InsertedBy: props.LoginDetails[0].StaffID,
        currentSemester: props.currentSemester,
    })

    const columns = ["SN", "COMPLAIN TYPE", "ACTION"]

    const getData = async () => {
        try {
            await axios.get(`${serverLink}staff/service-desk/complain-types/list`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        let rows = []
                        result.data.map((item, index) => {
                            rows.push([
                                index + 1,
                                item.ComplainType,
                                <button className="btn btn-sm btn-danger" onClick={() => onRemoveType(item.EntryID)} >
                                    Delete
                                </button>
                            ])
                        })
                        setComplainTypes(rows)
                    }
                    setisLoading(false);
                })
        }
        catch (e) {
        }
    }

    const onRemoveType = async(id) => {
        await axios.delete(`${serverLink}staff/service-desk/complain-types/delete/${id}`, token)
            .then(async (result) => {
                if (result.data.message === "success") {
                    setIsFormLoading('off');
                    getData();
                    toast.success("complain type deleted successfully")
                    setComplain({
                        ...complain,
                        ComplainType: "",
                    })

                }
            })
    }

    const onSubmit = async () => {
        if (complain.ComplainType === "") {
            toast.error("please enter complain type");
        }
        setIsFormLoading('on');
        try {
            await axios.post(`${serverLink}staff/service-desk/complain-types/add`, complain, token)
                .then(async (result) => {
                    if (result.data.message === "success") {
                        setIsFormLoading('off');
                        getData();
                        toast.success("complain type added successfully")
                        setComplain({
                            ...complain,
                            ComplainType: "",
                        })

                    }
                })
        } catch (e) {
            console.log(e)
            showAlert("ERROR", "network error, please try again", 'error');
        }
        // }

    }

    const onEdit = (e) => {

        setComplain({
            ...complain,
            [e.target.id]: e.target.value
        })
    }

    useEffect(() => {
        getData();
    }, [])

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Service Desk"}
                items={["Users", "Service Desk", "Complain Types"]}
            />
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
                                setComplain({
                                    ...complain,
                                    ComplainType: "",
                                })
                            }
                        >
                            Add Complain Type
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-body pt-5">
                        <ReportTable columns={columns} data={complainTypes} />
                        <Modal >
                            <div className="row col-md-12" >
                                <div className="col-md-12 mb-5">
                                    <div className="form-group">
                                        <label htmlFor="ComplainType">Complain Type</label>
                                        <input type="text" id="ComplainType" onChange={onEdit}
                                            className="form-control" placeholder=""
                                        />
                                    </div>
                                </div>

                                <div className="col-md-12 mb-5">
                                    <button type="button" onClick={onSubmit} className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={isFormLoading}>
                                        <span className="indicator-label">Submit</span>
                                        <span className="indicator-progress">Please wait...
                                            <span className="spinner-border spinner-border-sm align-middle ms-2" />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    </div>
                </div>
            </div>
        </div>

    )
}
const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        currentSemester: state.currentSemester
    };
};
export default connect(mapStateToProps, null)(ComplainTypes);