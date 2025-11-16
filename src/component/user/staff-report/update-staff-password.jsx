import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink} from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import {connect} from "react-redux";
import { encryptData
} from "../../../resources/constants";
import {formatDate} from "../../../resources/constants";
import {toast} from "react-toastify";
import { Input, SearchSelect } from "../../common/form";

function UpdateStaffPassword(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [staff, setStaff] = useState([])

    const [formData, setFormData] = useState({
        FirstName: "",
        MiddleName: "",
        Surname: "",
        StaffID: "",
        StaffID2: "",
        ConfirmPassword: "",
        Password: "",
        InsertedBy: `${props.loginData[0].StaffID}`
    });



    const getData = async () => {
        setIsLoading(true)
        await axios.get(`${serverLink}staff/staff-report/update/get-all-staff`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let data = result.data;
                    const _row = [];
                    //Set staff Dropdown
                    data.map((row) => {
                        _row.push({
                            value: row.StaffID,
                            FirstName: row.FirstName,
                            MiddleName: row.MiddleName,
                            Surname: row.Surname,
                            label: `${row.FirstName} ${row.MiddleName} ${row.Surname} (${row.StaffID})`})
                    });
                    setStaff(_row)
                }else{
                    showAlert(
                        "NOT FOUND",
                        "Record not found. Please try again!",
                        "error"
                    );
                    setIsLoading(false);
                }
                setIsLoading(false);
            }).catch((err) => {
                console.log("NETWORK ERROR");
            });
    }


    const onEdit = (e) => {
        let value = e.target.value;
        setFormData({
            ...formData,
            [e.target.id]: value,
        });
    };

    const onStaffChange = (e) => {
        setFormData({
            ...formData,
            StaffID: e.value,
            StaffID2: e,
            FirstName: e.FirstName,
            MiddleName: e.MiddleName,
            Surname: e.Surname,
        })
    }

    const onSubmit = async () => {

        for (let key in formData) {
            if (
                formData.hasOwnProperty(key) &&
                key !== "MiddleName"
            ) {
                if (formData[key] === "") {
                    await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
                    return false;
                }
            }

        }

        if (formData.Password.toString().toLowerCase() !== formData.ConfirmPassword.toString().toLowerCase()){
            showAlert("ERROR", `Password did not match`, "error");
            return false;
        }

        setIsFormLoading('on')

      let  sendData = {
            ...formData,
            Password: encryptData(formData.Password)
        }

        await axios.patch( `${serverLink}staff/staff-report/update-staff-password`, sendData, token ).then((res) => {
            if (res.data.message === "success") {
                toast.success("Staff Password Updated Successfully");
                setFormData({
                    ...formData,
                    FirstName: "",
                    MiddleName: "",
                    Surname: "",
                    StaffID: "",
                    StaffID2: "",
                    ConfirmPassword: "",
                    Password: "",
                })
                getData();
                setIsFormLoading('off')
            } else {
                toast.error("An error has occurred. Please try again!");
                setIsFormLoading('off')
            }
        })
            .catch((err) => {
                console.log(err);
                toast.error("NETWORK ERROR. Please try again!");
                setIsFormLoading('off')
            });

    };


    useEffect(()=> {
        getData();
    }, [])


    useEffect(()=> {
        if (formData.StaffID !== ""){
            setShowForm(true)
        }else{
            setShowForm(false)
        }
    }, [formData.StaffID])


    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Update Staff Password"}
                items={["User", "Staff Report", "Update Staff Password"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                        <div className="card-toolbar">
                        </div>
                        <div className="d-flex col-md-12">
                            <div className="col-md-12 pb-3">
                                <SearchSelect
                                    id="StaffID"
                                    name="StaffID"
                                    value={formData.StaffID2}
                                    onChange={onStaffChange}
                                    options={staff}
                                    label="Select Staff"
                                    placeholder="Select Staff"
                                    required
                                />
                            </div>
                        </div>

                        {
                            isLoading ? <Loader /> :
                                showForm ?
                                    <div className="col-md-12 ">
                                        <p>&nbsp;</p>
                                        <h5>Update Password</h5>
                                        <hr />
                                        <div className="row">
                                            <div className="col-md-6">
                                                <Input
                                                    id="Password"
                                                    type="password"
                                                    value={formData.Password}
                                                    onChange={onEdit}
                                                    label="New Password"
                                                    placeholder="Enter new password"
                                                    autoComplete="new-password"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <Input
                                                    id="ConfirmPassword"
                                                    type="password"
                                                    value={formData.ConfirmPassword}
                                                    onChange={onEdit}
                                                    label="Confirm Password"
                                                    placeholder="Re-enter new password"
                                                    autoComplete="new-password"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group pt-2 mb-3">
                                            <button onClick={onSubmit} id="kt_modal_new_address_submit" data-kt-indicator={isFormLoading} className="btn btn-primary w-100">
                                                <span className="indicator-label">Update</span>
                                                <span className="indicator-progress">Please wait...
                                                        <span className="spinner-border spinner-border-sm align-middle ms-2"/>
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                    : ""
                        }



                    </div>

                </div>

            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(UpdateStaffPassword);

