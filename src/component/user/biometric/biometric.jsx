import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import axios from "axios";
import { projectName, serverLink, simpleFileUploadAPIKey } from "../../../resources/url";
import Select2 from "react-select2-wrapper";
import { toast } from "react-toastify";
import { showAlert } from "../../common/sweetalert/sweetalert";
import SimpleFileUpload from "react-simple-file-upload";


function CaptureBiometric(props) {
    const token = props.loginData.token;
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState({
        students: [],
        staff: [],
    });
    const [studentsList, setStudentsList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState([])
    const [selectedStaff, setSelectedStaff] = useState([])
    const [contentToRender, setContentToRender] = useState(false)
    const [createRequest, setCreateRequest] = useState({
        UserID: "",
        BloodGroup: "",
        NOKPhoneNumber: "",
        CardType: "",
        file: "",
        BiometricRight: "",
        BiometricLeft: "",
        InsertedBy: props.loginData.StaffID
    });

    const resetSubmission = () => {
        setCreateRequest({
            CardType: "",
            BloodGroup: "",
            NOKPhoneNumber: "",
            file: "",
            BiometricRight: "",
            BiometricLeft: "",
            InsertedBy: props.loginData.StaffID
        })
    }

    const onEdit = (e) => {
        const id = e.target.id;
        const value = id === "file" ? e.target.files[0] : e.target.value;

        setCreateRequest({
            ...createRequest,
            [id]: value,
        });

        if (e.target.value === "Staff") {
            axios.get(`${serverLink}staff/biometric-devices/id/card/data`, token)
                .then((res) => {
                    if (res.data) {
                        if (res.data.staff.length > 0) {
                            let staff_rows = [];
                            res.data.staff.map((item) => {
                                staff_rows.push({
                                    id: item.StaffID,
                                    text: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StaffID})`
                                })
                            })
                            setStaffList(staff_rows);
                            setStudentsList([]);
                        }
                    }
                })
                .catch((err) => {
                    console.log("NETWORK ERROR");
                });
        }

        if (e.target.value === "Student") {
            axios.get(`${serverLink}staff/biometric-devices/id/card/data`, token)
                .then((res) => {
                    if (res.data) {
                        if (res.data.students.length > 0) {
                            let students_rows = [];
                            res.data.students.map((item) => {
                                students_rows.push({
                                    id: item.StudentID,
                                    text: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})`
                                })
                            })
                            setStudentsList(students_rows);
                            setStaffList([]);
                        }
                    }
                })
                .catch((err) => {
                    console.log("NETWORK ERROR");
                });
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        for (let key in createRequest) {
            if (
                createRequest.hasOwnProperty(key) &&
                key !== "InsertedBy" &&
                key !== "InsertedDate" &&
                key !== "BiometricRight" &&
                key !== "BiometricLeft" &&
                key !== "file" &&
                key !== "UpdatedBy"
            ) {
                if (createRequest[key] === "") {
                    await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
                    return false;
                }
            }
        }

        if (createRequest.file === "") {
            toast.error(`File Can't be empty`);
            return false;
        }

        toast.info(`Submitting... Please wait!`);
        try {
            const sendData = {
                UserID: createRequest.UserID,
                UserType: createRequest.CardType,
                Passport: createRequest.file,
                NOKPhoneNumber: createRequest.NOKPhoneNumber,
                BloodGroup: createRequest.BloodGroup,
                BiometricRight: createRequest.BiometricRight,
                BiometricLeft: createRequest.BiometricLeft,
                InsertedBy: createRequest.InsertedBy,
            };
            axios
                .post(`${serverLink}staff/biometric-devices/save/biometric/data`, sendData, token)
                .then(async (res) => {
                    if (res.data.message === "success") {
                        toast.success(`Record Captured Successfully.`);

                        if (createRequest.file !== "") {
                            const fdt = new FormData();
                            fdt.append("file", createRequest.file)
                            fdt.append("UserID", createRequest.UserID)
                            await axios.post(`${serverLink}staff/biometric-devices/uploadDocument`, fdt)
                        }


                        resetSubmission();
                    }
                    else {
                        toast.error(`Something went wrong submitting your document!`);

                        // if (res.data.file.filename) {
                        //     const file = res.data.file.filename;
                        //     axios
                        //         .delete(
                        //             `${serverLink}staff/biometric-devices/delete/biometric/data/${file}`, token
                        //         )
                        //         .then((res) => {
                        //             if (res.data.message === "success") {

                        //                 toast.success(`Deleted`);
                        //             } else {
                        //                 toast.error(
                        //                     `Something went wrong. Please check your connection and try again!`
                        //                 );
                        //             }
                        //         })
                        //         .catch((error) => {
                        //             console.log("NETWORK ERROR", error);
                        //         });
                        // }
                    }
                })
                .catch((error) => {
                    console.log("Error", error);
                });
        } catch (error) {
            console.log("error", error);
            toast.error(`Something went wrong uploading your document. Please try again!`);
        }
    };

    const onSearch = async () => {
        if (createRequest.CardType === "Staff") {
            if (createRequest.UserID.length > 0) {
                const id = createRequest.UserID;
                const filteredStaff = staffList.filter(i => i.UserID === id);
                setSelectedStaff(filteredStaff)
            }
        }

        if (createRequest.CardType === "Student") {
            if (createRequest.UserID.length > 0) {
                const id = createRequest.UserID;
                const filteredStudent = studentsList.filter(i => i.UserID === id);
                setSelectedStudent(filteredStudent)
            }
        }
    }


    const onCaptureBiometric = async () => {

    }


    useEffect(() => {
        // getData().then();
    }, [])

    const handlePassportUpload = async (url) => {
        if (url !== '') {
            setCreateRequest({
                ...createRequest,
                file: url
            })
        }
    }


    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Capture Biometric"}
                items={["User", "Biometric & Devices", "Capture Biometric"]}
            />

            <div className="row">
                <div className="card">
                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-lg-6 pt-5">
                                <label htmlFor="CardType">Card Type</label>
                                <select
                                    className="form-control"
                                    id="CardType"
                                    name="CardType"
                                    value={createRequest.CardType}
                                    onChange={onEdit}
                                >
                                    <option value="">Select Option</option>
                                    <option value="Staff">Staff</option>
                                    <option value="Student">Student</option>
                                </select>
                            </div>

                            {createRequest.CardType === "Staff" && (
                                <div className="col-lg-6 pt-5">
                                    <label htmlFor="UserID">Select Staff</label>
                                    <Select2
                                        id="UserID"
                                        name="UserID"
                                        data={staffList}
                                        value={createRequest.UserID}
                                        className={"form-control"}
                                        onSelect={onEdit}
                                        options={{
                                            placeholder: "Search Staff",
                                        }}
                                    />
                                </div >
                            )}

                            {createRequest.CardType === "Student" && (
                                <div className="col-lg-6 pt-5">
                                    <label htmlFor="UserID">Select Student</label>
                                    <Select2
                                        id="UserID"
                                        name="UserID"
                                        data={studentsList}
                                        value={createRequest.UserID}
                                        className={"form-control"}
                                        onSelect={onEdit}
                                        options={{
                                            placeholder: "Search Student",
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {createRequest.CardType === "Staff" && (
                            <>
                                {createRequest.UserID !== "" && createRequest.UserID !== "undefined" && (
                                    <>
                                        <div className="row">
                                            <h4 className="pt-5">Update Biometric Record</h4>

                                            <div className="col-lg-4 pt-5">
                                                <div className="form-group">
                                                    <label htmlFor="NOKPhoneNumber">NOK Phone Number</label>
                                                    <input
                                                        type="text"
                                                        id="NOKPhoneNumber"
                                                        className="form-control"
                                                        placeholder="NOK Phone Number"
                                                        value={createRequest.NOKPhoneNumber}
                                                        onChange={onEdit}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-4 pt-5">
                                                <div className="form-group">
                                                    <label htmlFor="BloodGroup">Blood Group</label>
                                                    <select
                                                        className="form-control"
                                                        id="BloodGroup"
                                                        name="BloodGroup"
                                                        value={createRequest.BloodGroup}
                                                        onChange={onEdit}
                                                    >
                                                        <option value="">Select Option</option>
                                                        <option value="A+">A+</option>
                                                        <option value="A-">A-</option>
                                                        <option value="B+">B+</option>
                                                        <option value="B-">B-</option>
                                                        <option value="AB+">AB+</option>
                                                        <option value="AB-">AB-</option>
                                                        <option value="O+">O+</option>
                                                        <option value="O-">O-</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 pt-5">
                                                <div className="form-group">
                                                    <label htmlFor="file">Passport</label>
                                                    {/* <SimpleFileUpload
                                                        apiKey={simpleFileUploadAPIKey}
                                                        tag={`${projectName}-biometrics`}
                                                        onSuccess={handlePassportUpload}
                                                        accepted={"image/*"}
                                                        maxFileSize={2}
                                                        preview="false"
                                                        width="100%"
                                                        height="100"
                                                    /> */}
                                                    <input
                                                        type="file"
                                                        accept=".jpg, .png, .jpeg"
                                                        id="file"
                                                        name="file"
                                                        className="form-control"
                                                        placeholder="File"
                                                        required
                                                        onChange={onEdit}
                                                    />
                                                    <span className="badge bg-primary">
                                                        Only .jpg, .png, .jpeg are allowed
                                                    </span>
                                                </div>
                                            </div>

                                        </div>

                                        <div className="d-flex pt-10 align-items-center">
                                            <div className="card-body">
                                                <div className="mt-n14">
                                                    <div className="row pt-10 py-15 p-5">
                                                        <div className="col-lg-2 w-225px">
                                                            <div className="bg-gray-100 bg-primary px-20 py-12">
                                                                Right Thumb
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-2 w-225px">
                                                            <div className="bg-gray-100 bg-primary px-20 py-15">
                                                                Left Thumb
                                                            </div>
                                                        </div>

                                                        <div className="pt-5"> <button className="btn btn-primary w-100" onClick={onSubmit}>Save</button></div>
                                                    </div>


                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {createRequest.CardType === "Student" && (
                            <>
                                {createRequest.UserID !== "" && createRequest.UserID !== "undefined" && (
                                    <>
                                        <div className="row">
                                            <h4 className="pt-5">Update Biometric Record</h4>

                                            <div className="col-lg-4 pt-5">
                                                <div className="form-group">
                                                    <label htmlFor="NOKPhoneNumber">NOK Phone Number</label>
                                                    <input
                                                        type="text"
                                                        id="NOKPhoneNumber"
                                                        className="form-control"
                                                        placeholder="NOK Phone Number"
                                                        value={createRequest.NOKPhoneNumber}
                                                        onChange={onEdit}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-4 pt-5">
                                                <div className="form-group">
                                                    <label htmlFor="BloodGroup">Blood Group</label>
                                                    <select
                                                        className="form-control"
                                                        id="BloodGroup"
                                                        name="BloodGroup"
                                                        value={createRequest.BloodGroup}
                                                        onChange={onEdit}
                                                    >
                                                        <option value="">Select Option</option>
                                                        <option value="A+">A+</option>
                                                        <option value="A-">A-</option>
                                                        <option value="B+">B+</option>
                                                        <option value="B-">B-</option>
                                                        <option value="AB+">AB+</option>
                                                        <option value="AB-">AB-</option>
                                                        <option value="O+">O+</option>
                                                        <option value="O-">O-</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 pt-5">
                                                <div className="form-group">
                                                    <label htmlFor="file">Passport</label>
                                                    <input
                                                        type="file"
                                                        accept=".jpg, .png, .jpeg"
                                                        id="file"
                                                        name="file"
                                                        className="form-control"
                                                        placeholder="File"
                                                        required
                                                        onChange={onEdit}
                                                    />
                                                    {/* <SimpleFileUpload
                                                        apiKey={simpleFileUploadAPIKey}
                                                        tag={`${projectName}-biometrics`}
                                                        onSuccess={handlePassportUpload}
                                                        accepted={"image/*"}
                                                        maxFileSize={2}
                                                        preview="false"
                                                        width="100%"
                                                        height="100"
                                                    /> */}
                                                    <span className="badge bg-primary">
                                                        Only .jpg, .png, .jpeg are allowed
                                                    </span>
                                                </div>
                                            </div>

                                        </div>

                                        <div className="d-flex pt-10 align-items-center">
                                            <div className="card-body">
                                                <div className="mt-n14">
                                                    <div className="row pt-10 py-15 p-5">
                                                        <div className="col-lg-2 w-225px">
                                                            <div className="bg-gray-100 bg-primary px-20 py-12">
                                                                Right Thumb
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-2 w-225px">
                                                            <div className="bg-gray-100 bg-primary px-20 py-15">
                                                                Left Thumb
                                                            </div>
                                                        </div>

                                                        <div className="pt-5"> <button className="btn btn-primary w-100" onClick={onSubmit}>Save</button></div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                    </div>
                </div>

            </div>
        </div>
    )

}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails[0],
    };
};

export default connect(mapStateToProps, null)(CaptureBiometric);
