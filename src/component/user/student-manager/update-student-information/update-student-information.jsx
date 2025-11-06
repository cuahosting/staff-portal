import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink} from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import {connect} from "react-redux";
import { encryptData
} from "../../../../resources/constants";
import {formatDate} from "../../../../resources/constants";
import Select from "react-select";
import {toast} from "react-toastify";
function UpdateStudentInformation(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [student, setStudent] = useState([])

    const [formData, setFormData] = useState({
        FirstName: "",
        MiddleName: "",
        Surname: "",
        Gender: "",
        EmailAddress: "",
        PhoneNumber: "",
        Address: "",
        StateOfOrigin: "",
        Lga: "",
        Nationality: "",
        DateOfBirth: "",
        StudentID: "",
        StudentID2: "",
        InsertedBy: `${props.loginData[0].StaffID}`
    });



    const getData = async () => {
        setIsLoading(true)
        await axios.get(`${serverLink}staff/users/student-manager/update/get-all-student`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let data = result.data;
                    const _row = [];
                    //Set student Dropdown
                    data.map((row) => {
                        _row.push({
                            value: row.StudentID,
                            FirstName: row.FirstName,
                            MiddleName: row.MiddleName,
                            Surname: row.Surname,
                            Gender: row.Gender,
                            EmailAddress: row.EmailAddress.toString(),
                            PhoneNumber: row.PhoneNumber,
                            Address: row.Address,
                            StateOfOrigin: row.StateOfOrigin,
                            Lga: row.LGA,
                            Nationality: row.Nationality,
                            DateOfBirth: formatDate(row.DateOfBirth),
                            label: `${row.FirstName} ${row.MiddleName} ${row.Surname} (${row.StudentID})`})
                    });
                    setStudent(_row)
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

    const onStudentChange = (e) => {
        setFormData({
            ...formData,
            StudentID: e.value,
            StudentID2: e,
            FirstName: e.FirstName,
            MiddleName: e.MiddleName,
            Surname: e.Surname,
            Gender: e.Gender,
            EmailAddress: e.EmailAddress.toString(),
            PhoneNumber: e.PhoneNumber,
            Address: e.Address,
            StateOfOrigin: e.StateOfOrigin,
            Lga: e.LGA,
            Nationality: e.Nationality,
            DateOfBirth: formatDate(e.DateOfBirth),
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

        setIsFormLoading('on')

        await axios.patch( `${serverLink}staff/users/student-manager/update-student-information`, formData, token ).then((res) => {
                if (res.data.message === "success") {
                    toast.success("Student Information Updated Successfully");
                    setFormData({
                        ...formData,
                        FirstName: "",
                        MiddleName: "",
                        Surname: "",
                        Gender: "",
                        EmailAddress: "",
                        PhoneNumber: "",
                        Address: "",
                        StateOfOrigin: "",
                        Lga: "",
                        Nationality: "",
                        DateOfBirth: "",
                        StudentID: "",
                        StudentID2: "",
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
        if (formData.StudentID !== ""){
            setShowForm(true)
        }else{
            setShowForm(false)
        }
    }, [formData.StudentID])


    return (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Update Student Information"}
                items={["User", "Student Manager", "Update Student Information"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                        <div className="card-toolbar">
                        </div>
                        <div className="d-flex col-md-12">
                            <div className="col-md-12 pb-3">
                                <label htmlFor="StudentID">Select Student</label>
                                <Select
                                    id="StudentID"
                                    name="StudentID"
                                    value={formData.StudentID2}
                                    onChange={onStudentChange}
                                    options={student}
                                    placeholder="Select Student"
                                />
                            </div>
                        </div>

                            {
                                isLoading ? <Loader /> :
                                    showForm ?
                                        <div className="col-md-12 ">
                                            <p>&nbsp;</p>
                                            <h5>Basic Information</h5>
                                            <hr />
                                            <div className="row">
                                                <div className="form-group col-md-4 mb-4">
                                                    <label htmlFor="FirstName">First Name</label>
                                                    <input
                                                        type="text"
                                                        id="FirstName"
                                                        className="form-control"
                                                        placeholder="First Name"
                                                        onChange={onEdit}
                                                        value={formData.FirstName}
                                                    />
                                                </div>
                                                <div className="form-group col-md-4 mb-4">
                                                    <label htmlFor="MiddleName">Middle Name</label>
                                                    <input
                                                        type="text"
                                                        id="MiddleName"
                                                        className="form-control"
                                                        placeholder="Middle Name"
                                                        onChange={onEdit}
                                                        value={formData.MiddleName}
                                                    />
                                                </div>
                                                <div className="form-group col-md-4 mb-4">
                                                    <label htmlFor="Surname">Surname</label>
                                                    <input
                                                        type="text"
                                                        id="Surname"
                                                        className="form-control"
                                                        placeholder="Surname"
                                                        onChange={onEdit}
                                                        value={formData.Surname}
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

export default connect(mapStateToProps, null)(UpdateStudentInformation);

