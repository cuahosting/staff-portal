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


const LogComplain = (props) => {
    const token = props.LoginDetails[0].token;

    const editorRef = React.createRef();
    const [isLoading, setisLoading] = useState(true);
    const [complainTypes, setComplainTypes] = useState([]);
    const [isFormLoading, setIsFormLoading] = useState('off')
    const [complain, setComplain] = useState({
        ComplainTitle: "",
        ComplainType: "",
        FilePath: "",
        UserType: "staff",
        Description: "",
        InsertedBy: props.LoginDetails[0].StaffID,
        currentSemester: props.currentSemester,
    })

    const getData = async () => {
        try {
            await axios.get(`${serverLink}staff/service-desk/complain-types/list`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        setComplainTypes(result.data)
                    }
                    setisLoading(false);
                })
        }
        catch (e) {
        }
    }

    const onSubmit = async () => {
        // if (complain.ComplainTitle === "" || complain.ComplainType === "" || complain.UserType || complain.Description === "") {
        //     toast.error("please fill all required fields");
        // }else{
        setIsFormLoading('on');
        try {
            await axios.post(`${serverLink}staff/service-desk/post-complain`, complain, token)
                .then(async (result) => {
                    if (result.data.message === "success") {
                        setIsFormLoading('off');
                        if (complain.FilePath !== "") {
                            const formData = new FormData();
                            formData.append("File", complain.FilePath);
                            formData.append("EntryID", result.data.EntryID);
                            await axios.patch(`${serverLink}staff/service-desk/post-complain-file`, formData)
                                .then((res) => {
                                    if (res.data.message === "success") {

                                    }
                                })
                        }
                        toast.success("complain logged successfully, kindly check back to track progress")
                        setComplain({
                            ...complain,
                            ComplainTitle: "",
                            ComplainType: "",
                            FilePath: "",
                            UserType: "",
                            Description: "",
                        })

                    } else {
                        setIsFormLoading('off');
                        showAlert("ERROR", "complaint have already been submitted", 'error');
                    }
                })
        } catch (e) {
            console.log(e)
            showAlert("ERROR", "network error, please try again", 'error');
        }
   // }

    }

    const onEdit = (e) => {
        if (e.target.id === "FilePath") {
            setComplain({
                ...complain,
                [e.target.id]: e.target.files[0]
            })
            return;
        }

        setComplain({
            ...complain,
            [e.target.id]: e.target.value
        })
    }

    const onDescriptionChange = (e) => {
        setComplain({
            ...complain,
            "Description": e
        })
    }
    useEffect(() => {
        getData();
    }, [])

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Service Desk"}
                items={["Users", "Service Desk", "Log Complain"]}
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body pt-5">
                        <div className="row col-md-12" >
                            <div className="col-md-6 mb-5">
                                <div className="form-group">
                                    <label htmlFor="ComplainTitle">Complain Title</label>
                                    <input type="text" id="ComplainTitle" onChange={onEdit} value={complain.ComplainTitle}
                                        className="form-control" placeholder=""
                                    />
                                </div>
                            </div>
                            <div className="col-md-6 mb-5">
                                <div className="form-group">
                                    <label htmlFor="ComplainType">Complain Type</label>
                                    <select id="ComplainType" onChange={onEdit}
                                        value={complain.ComplainType} className="form-select" >
                                        <option value={""}>-select type-</option>
                                        {
                                            complainTypes.length > 0 &&
                                            complainTypes.map((x, i) => {
                                                return (
                                                    <option key={i} value={x.EntryID} >{x.ComplainType} </option>
                                                )
                                            })
                                        }
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-12 mb-5">
                                <div className="form-group">
                                    <label htmlFor="FilePath">Attachment (optional)</label>
                                    <input type="file" id="FilePath" onChange={onEdit}
                                        className="form-control" placeholder=""
                                    />
                                </div>
                            </div>
                            <div className="col-md-12 mb-5">
                                <div className="form-group">
                                    <label htmlFor="Description">Comments</label>
                                    <JoditEditor
                                        value={complain.Description}
                                        ref={editorRef}
                                        tabIndex={1}
                                        onChange={onDescriptionChange}
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
export default connect(mapStateToProps, null)(LogComplain);