import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
import { showAlert, showConfirm } from "../../common/sweetalert/sweetalert";

function GuardianApprovalForm(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({});
    const [formData, setFormData] = useState({ GuardianName: "", AdditionalMessage: "" });
    const _id = window.location.href.split("/")[5];

    const getChangeofCourse = async () => {
        const { success, data: result } = await api.get(`staff/registration/change-of-course/applications/list/${_id}`);
        if (success && result?.length > 0) setData(result[0]);
        setIsLoading(false);
    };

    const onEdit = (e) => { setFormData({ ...formData, [e.target.id]: e.target.value }); };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (formData.GuardianName === "") { showAlert('EMPTY FIELD', 'Please enter your name', 'error'); return; }
        showConfirm("CONFIRM APPROVAL", "Are you sure you want to approve change of course", "warning").then(async (IsConfirmed) => {
            if (IsConfirmed) {
                const { success, data: result } = await api.patch("staff/registration/change-of-course/guardian-approval", { EntryID: _id, GuardianApprovedBy: formData.GuardianName });
                if (success && result?.message === "success") { toast.success('Course change approved successfully'); getChangeofCourse(); }
                else if (success) { toast.error('please try again'); }
            }
        });
    };

    useEffect(() => { getChangeofCourse(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Change of course"} items={["Registration", "Change of Course", "Guardian Approval"]} />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body p-0 mt-10">
                        <div className=" row col-md-12">
                            <h4>Welcome!</h4>
                            <h5>Your ward have indicated interes to change his course from <span className="text-success">{data.CourseName}</span> to <span className="text-danger">{data.RequestedCourseName}</span>. <br /><span className="mt-5">I f you are aware and do approve of his/decision, kindly confirm below.</span></h5>
                            <div className="form-group">
                                <div className="col-md-12 m-4"><input className="form-control" id="GuardianName" onChange={onEdit} placeholder="Enter your name" /></div>
                                <div className="col-md-12 m-4"><textarea className="form-control" id="AdditionalMessage" rows={"5"} onChange={onEdit} placeholder="Additional notes" /></div>
                                <div className="col-md-12 mt-10 m-4">{data.GuardianApprovedBy === null ? <button className="btn btn-lg btn-primary" onClick={onSubmit}>Approve Change of Course</button> : <label className="alert alert-info">Thank you for responding to this request.</label>}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails }; };
export default connect(mapStateToProps, null)(GuardianApprovalForm);
