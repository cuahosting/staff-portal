import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { connect } from "react-redux";
import { encryptData } from "../../../resources/constants";
import SearchSelect from "../../common/select/SearchSelect";
import { toast } from "react-toastify";

function UpdateStaffPassword(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [staff, setStaff] = useState([]);

    const [formData, setFormData] = useState({
        FirstName: "", MiddleName: "", Surname: "", StaffID: "", StaffID2: "", ConfirmPassword: "", Password: "", InsertedBy: `${props.loginData[0].StaffID}`
    });

    const getData = async () => {
        setIsLoading(true);
        const { success, data: result } = await api.get("staff/staff-report/update/get-all-staff");
        if (success && result?.length > 0) {
            const _row = [];
            result.forEach((row) => { _row.push({ value: row.StaffID, FirstName: row.FirstName, MiddleName: row.MiddleName, Surname: row.Surname, label: `${row.FirstName} ${row.MiddleName} ${row.Surname} (${row.StaffID})` }); });
            setStaff(_row);
        } else { showAlert("NOT FOUND", "Record not found. Please try again!", "error"); }
        setIsLoading(false);
    };

    const onEdit = (e) => { setFormData({ ...formData, [e.target.id]: e.target.value }); };

    const onStaffChange = (e) => {
        if (!e) return;
        setFormData({ ...formData, StaffID: e.value, StaffID2: e, FirstName: e.FirstName, MiddleName: e.MiddleName, Surname: e.Surname });
    };

    const onSubmit = async () => {
        for (let key in formData) { if (formData.hasOwnProperty(key) && key !== "MiddleName") { if (formData[key] === "") { await showAlert("EMPTY FIELD", `Please enter ${key}`, "error"); return false; } } }
        if (formData.Password.toString().toLowerCase() !== formData.ConfirmPassword.toString().toLowerCase()) { showAlert("ERROR", `Password did not match`, "error"); return false; }
        setIsFormLoading('on');
        let sendData = { ...formData, Password: encryptData(formData.Password) };
        const { success } = await api.patch("staff/staff-report/update-staff-password", sendData);
        if (success) {
            toast.success("Staff Password Updated Successfully");
            setFormData({ ...formData, FirstName: "", MiddleName: "", Surname: "", StaffID: "", StaffID2: "", ConfirmPassword: "", Password: "" });
            getData();
        } else { toast.error("An error has occurred. Please try again!"); }
        setIsFormLoading('off');
    };

    useEffect(() => { getData(); }, []);
    useEffect(() => { setShowForm(formData.StaffID !== ""); }, [formData.StaffID]);

    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Update Staff Password"} items={["User", "Staff Report", "Update Staff Password"]} />
            <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-header border-0 pt-6"><div className="card-title" /><div className="card-toolbar"></div><div className="d-flex col-md-12"><div className="col-md-12 pb-3"><label htmlFor="StaffID">Select Staff</label><SearchSelect id="StaffID" label="Select Staff" value={formData.StaffID2} onChange={onStaffChange} options={staff} placeholder="Select Staff" /></div></div>{isLoading ? <Loader /> : showForm ? <div className="col-md-12 "><p>&nbsp;</p><h5>Update Password</h5><hr /><div className="row"><div className="form-group col-md-6 mb-4"><label htmlFor="ConfirmPassword">New Password</label><input type="password" id="Password" className="form-control" placeholder="Password" onChange={onEdit} value={formData.Password} /></div><div className="form-group col-md-6 mb-4"><label htmlFor="ConfirmPassword">Confirm Password</label><input type="password" id="ConfirmPassword" className="form-control" placeholder="Confirm Password" onChange={onEdit} value={formData.ConfirmPassword} /></div></div><div className="form-group pt-2 mb-3"><button onClick={onSubmit} id="kt_modal_new_address_submit" data-kt-indicator={isFormLoading} className="btn btn-primary w-100"><span className="indicator-label">Update</span><span className="indicator-progress">Please wait...<span className="spinner-border spinner-border-sm align-middle ms-2" /></span></button></div></div> : ""}</div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(UpdateStaffPassword);
