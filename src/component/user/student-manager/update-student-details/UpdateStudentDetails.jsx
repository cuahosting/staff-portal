import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {toast} from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import {serverLink} from "../../../../resources/url";
import Modal from "../../../common/modal/modal";
import ReportTable from "../../../common/table/report_table";
import {decryptData, encryptData, formatDateAndTime} from "../../../../resources/constants";
import {CommentsDisabledOutlined} from "@mui/icons-material";
import Select2 from "react-select2-wrapper";
import "react-select2-wrapper/css/select2.css";
import {useForm} from "react-hook-form";

function UpdateStudentDetails(props) {
    const token = props.loginData.token;

    const [isLoading, setIsLoading] = useState(false);
    const [isCheckedEmail, setIsCheckedEmail] = useState(false);
    const [isCheckedStatus, setIsCheckedStatus] = useState(false);
    const [isCheckedPassword, setIsCheckedPassword] = useState(false);
    const {register, handleSubmit, setValue} = useForm();
    const [studentSelectList, setStudentSelectList] = useState([]);
    const [formData, setFormData] = useState({
        FirstName: "",
        MiddleName: "",
        Surname: "",
    });
    const [selectedStudent, setSelectedStudent] = useState({
        StudentID: "",
        FirstName: "",
        EmailAddress: "",
    });
    const [studentList, setStudentList] = useState([]);
    const handleCheckedStatus = () => {
        setIsCheckedStatus(!isCheckedStatus);
        setValue("status", "");
    };
    const handleCheckedEmail = () => {
        setIsCheckedEmail(!isCheckedEmail);
        setValue("Email", "");
        setValue("Email2", "");
    };
    const handleCheckedPass = () => {
      setIsCheckedPassword(!isCheckedPassword);
        setValue("Password", "");
    };
    const updateStudentDetail = async (data) => {
        if (selectedStudent.StudentID === "") {
            toast.error("Please specify student ID");
            return;
        }
        if (!isCheckedEmail && !isCheckedStatus && !isCheckedPassword) {
            toast.error("Please Specify Action");
            return;
        }
        if (isCheckedStatus && data.status === "") {
            toast.error("Please specify Student Status");
            return;
        }
        if (isCheckedPassword && data.Password === "") {
            toast.error("Please specify new password");
            return;
        }
        if (isCheckedEmail) {
            if (data.Email === "") {
                toast.error("Please specify New School Email");
                return;
            }
            if (data.Email2 === "") {
                toast.error("Please specify New Private Email");
                return;
            }
        }
        console.log(data)
        const dataTo = {
            ...data,
            Password: encryptData(data.Password),
            id: selectedStudent.StudentID,
        };
        if (isCheckedEmail) {
            updateEmail(dataTo);
        }
        if (isCheckedPassword) {
            updatePassword(dataTo);
        }
        if (isCheckedStatus) {
            updateStatus(dataTo);
        }
    };

    async function updateEmail(data) {
        await axios
            .patch(
                `${serverLink}staff/users/student-manager/update-student-email`,
                data, token
            )
            .then((res) => {
                if (res.data.message === "success") {
                    toast.success("Email Updated");
                } else {
                    toast.error("An error has occurred. Please try again!");
                }
            })
            .catch((err) => {
                console.log(err);
                toast.error("NETWORK ERROR. Please try again!");
            });
    }

    async function updatePassword(data) {
        console.log(data)
        await axios.patch(`${serverLink}staff/users/student-manager/update-student-password`, data, token).then((res) => {
                if (res.data.message === "success") {
                    toast.success("Password Updated");
                } else {
                    toast.error("An error has occurred. Please try again!");
                }
            })
            .catch((err) => {
                console.log(err);
                toast.error("NETWORK ERROR. Please try again!");
            });
    }

    async function updateStatus(data) {
        await axios
            .patch(
                `${serverLink}staff/users/student-manager/update-student-status`,
                data, token
            )
            .then((res) => {
                if (res.data.message === "success") {
                    toast.success("Status Updated");
                } else {
                    toast.error("An error has occurred. Please try again!");
                }
            })
            .catch((err) => {
                console.log(err);
                toast.error("NETWORK ERROR. Please try again!");
            });
    }

    const getStudentDetails = async () => {
        await axios
            .get(`${serverLink}staff/student-manager/student/active`, token)
            .then((response) => {
                const result = response.data;
                if (result.length > 0) {
                    let rows = [];
                    result.map((item) => {
                        rows.push({
                            id: item.StudentID,
                            text: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})`,
                        });
                    });
                    setStudentSelectList(rows);
                }
                setStudentList(result);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    };

    const handleChange = (e) => {
        const filter_student = studentList.filter(
            (i) => i.StudentID === e.target.value
        );
        if (filter_student.length > 0) {
            selectedStudent.StudentID = filter_student[0].StudentID;
        }
    };

    const onEdit = (e) => {
        const id = e.target.id;
        const value = e.target.value;
        setFormData({
            ...formData,
            [id]: value
        })

    }

    useEffect(() => {
        getStudentDetails();
    }, []);
    return isLoading ? (
        <Loader/>
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Update Student Details"}
                items={["Users", "Student Manager", "Update Student Details"]}
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body p-0">
                        <form onSubmit={handleSubmit(updateStudentDetail)}>
                            <div className="form-group">
                                <label htmlFor="roomNumber">Student ID</label>
                                <Select2
                                    defaultValue={selectedStudent.StudentID}
                                    data={studentSelectList}
                                    onChange={handleChange}
                                    options={{
                                        placeholder: "Search Student",
                                    }}
                                />
                            </div>
                            <p className="pt-5">
                                <input
                                    type="checkbox"
                                    checked={isCheckedEmail}
                                    onChange={handleCheckedEmail}
                                    className="form-check-input"
                                    id="exampleCheck2"
                                />
                                <label className="form-check-label" for="exampleCheck2">
                                    Update Email?
                                </label>
                                <input
                                    style={{marginLeft: "20px"}}
                                    type="checkbox"
                                    checked={isCheckedStatus}
                                    onChange={handleCheckedStatus}
                                    className="form-check-input"
                                    id="exampleCheck1"
                                />
                                <label className="form-check-label" for="exampleCheck1">
                                    Update Status?
                                </label>
                                <input
                                    style={{marginLeft: "20px"}}
                                    type="checkbox"
                                    checked={isCheckedPassword}
                                    onChange={handleCheckedPass}
                                    className="form-check-input"
                                    id="exampleCheck5"
                                />
                                <label className="form-check-label" for="exampleCheck5">
                                    Update Password?
                                </label>
                            </p>
                            {isCheckedEmail && (
                                <>
                                    <div class="form-group pt-5">
                                        <label htmlFor="roomNumber">School Email</label>
                                        <input
                                            type="text"
                                            {...register("Email")}
                                            required
                                            className="form-control"
                                            placeholder="School Email"
                                        />
                                    </div>
                                    <div class="form-group pt-5">
                                        <label htmlFor="roomNumber">Private Email</label>
                                        <input
                                            type="text"
                                            {...register("Email2")}
                                            required
                                            className="form-control"
                                            placeholder="Private Email"
                                        />
                                    </div>
                                </>
                            )}

                            {isCheckedStatus && (
                                <div class="col pt-5">
                                    <label htmlFor="roomNumber">Status</label>
                                    <select
                                        className="form-control"
                                        required
                                        {...register("status")}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Dead">Dead</option>
                                        <option value="Deferred">Deferred</option>
                                        <option value="Expelled">Expelled</option>
                                        <option value="Rusticated">Rusticated</option>
                                    </select>
                                </div>
                            )}
                            {isCheckedPassword && (
                                <>
                                    <div className="form-group pt-5 mb-3">
                                        <label htmlFor="roomNumber">New Password</label>
                                        <input
                                            type="text"
                                            {...register("Password")}
                                            required
                                            className="form-control"
                                            placeholder="New Password"
                                        />
                                    </div>
                                </>
                            )}
                            <button className="btn btn-primary w-100">Update</button>
                        </form>

                        {/* <ReportTable columns={columns} data={progressionSteps} /> */}
                    </div>
                </div>

                <Modal title={"Progression Settings Form"}>
                    <form>
                        <div className="form-group pt-2">
                            <button className="btn btn-primary w-100">Save</button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails[0],
    };
};

export default connect(mapStateToProps, null)(UpdateStudentDetails);
