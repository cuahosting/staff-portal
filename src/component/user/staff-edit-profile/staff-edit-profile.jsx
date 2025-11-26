import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import axios from "axios";
import { projectName, serverLink, simpleFileUploadAPIKey } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { encryptData, formatDate, formatDateAndTime, projectCode, shortCode } from "../../../resources/constants";
import { connect } from "react-redux";
import { Button } from "@mui/material";
import
{
    setLoginDetails,
    setPermissionDetails
} from "../../../actions/setactiondetails";
import JoditEditor from "jodit-react";
import SimpleFileUpload from "react-simple-file-upload";
import DOMPurify, { sanitize } from "dompurify";

function EditStaffProfile(props)
{
    const token = props.loginData[0].token;

    const editorRef = React.createRef();
    const [isLoading, setIsLoading] = useState(true);
    const staffId = props.loginData[0].StaffID;
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const [staffInformation, setStaffInformation] = useState({
        qualifications: [],
        modules: [],
        publications: [],
        staff: [],
        staff_bank: [],
        department: [],
        country: [],
        state: [],
        lga: [],
        degree: [],
        banks: [],
        nok: [],
        documents: [],
        running_modules: [],
    });


    // STAFF INFORMATION
    const [editStaffInformation, setEditStaffInformation] = useState({
        EntryID: "",
        UpdatedBy: "",
        UpdatedDate: "",
        Biography: "",
        Research: "",
        Facebook: "",
        Linkedin: "",
        Twitter: "",
        Scholar: "",
        Researchgate: "",
        Academia: "",
        Orcid: "",
        EmailAddress: "",
        file: "",
        update_passport: false,
    });

    const [changeStaffPassword, setChangeStaffPassword] = useState({
        StaffID: props.loginData[0]?.StaffID,
        Password: props.loginData[0]?.Password,
        OldPassword: "",
        NewPassword: "",
        ConfirmPassword: "",
        UpdatedBy: props.loginData[0]?.StaffID,
        UpdatedDate: "",
    });

    const [toggleInformation, setToggleInformation] = useState(false);

    const [toggleChangePassword, setToggleChangePassword] = useState(false);

    const [addStaffDocument, setAddStaffDocument] = useState({
        StaffID: props.loginData[0]?.StaffID,
        file: "",
        UpdatedBy: props.loginData[0]?.StaffID,
        UpdatedDate: "",
    });

    const staffInformationForm = () =>
    {
        setEditStaffInformation({
            EntryID: staffInformation.staff[0]?.EntryID,
            UpdatedBy: props.loginData[0]?.StaffID,
            UpdatedDate: staffInformation.staff[0]?.UpdatedDate,
            Biography: staffInformation.staff[0]?.Biography,
            Research: staffInformation.staff[0]?.Research,
            Facebook: staffInformation.staff[0]?.Facebook,
            Linkedin: staffInformation.staff[0]?.Linkedin,
            Twitter: staffInformation.staff[0]?.Twitter,
            Scholar: staffInformation.staff[0]?.Scholar,
            Researchgate: staffInformation.staff[0]?.Researchgate,
            Academia: staffInformation.staff[0]?.Academia,
            Orcid: staffInformation.staff[0]?.Orcid,
            EmailAddress: staffInformation.staff[0]?.EmailAddress
        });
        setToggleInformation(true);
    };


    const changeStaffPasswordForm = () =>
    {
        setChangeStaffPassword({
            StaffID: staffInformation.staff[0].StaffID,
            Password: staffInformation.staff[0].Password,
        });
        setToggleChangePassword(true);
    };

    useEffect(() =>
    {
        if (!staffInformation)
        {
            navigate("/");
        }
        getStaffRelatedData().then((r) => { });
    }, []);

    const getStaffRelatedData = async () =>
    {
        await axios
            .get(`${serverLink}staff/hr/staff-management/staff/${staffId}`, token)
            .then((response) =>
            {
                setStaffInformation(response.data);
            })
            .catch((error) =>
            {
                console.log("NETWORK ERROR", error);
            });
        setIsLoading(false);
    };

    const onEditInformation = (e) =>
    {
        const id = e.target.id;
        const value = e.target.value;

        setEditStaffInformation({
            ...editStaffInformation,
            [id]: value,
        });
    };

    const onBiographyChanged = (e) =>
    {
        setEditStaffInformation({
            ...editStaffInformation,
            "Biography": e
        })
    }
    const onResearchChanged = (e) =>
    {
        setEditStaffInformation({
            ...editStaffInformation,
            "Research": e
        })
    }

    const onEditPassword = (e) =>
    {
        const id = e.target.id;
        const value = e.target.value;

        setChangeStaffPassword({
            ...changeStaffPassword,
            [id]: value,
        });
    };

    const onSubmitStaffInformation = async () =>
    {
        for (let key in editStaffInformation)
        {
            if (
                editStaffInformation.hasOwnProperty(key) &&
                key !== "Biography" &&
                key !== "file" &&
                key !== "Research" &&
                key !== "Facebook" &&
                key !== "Linkedin" &&
                key !== "Twitter" &&
                key !== "Scholar" &&
                key !== "Researchgate" &&
                key !== "Academia" &&
                key !== "Orcid" &&
                key !== "EmailAddress"
            )
            {
                if (editStaffInformation[key] === "")
                {
                    await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
                    return false;
                }
            }
        }

        toast.info("Updating staff. Please wait..");
        await axios
            .patch(
                `${serverLink}staff/hr/staff-management/update/staff/profile/`,
                editStaffInformation, token
            )
            .then((result) =>
            {
                if (result.data.message === "success")
                {
                    toast.success("Staff Updated Successfully");
                    getStaffRelatedData();
                    closeHandler();
                } else
                {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            })
            .catch((error) =>
            {
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            });
    };

    const closeHandler = () =>
    {
        setChangeStaffPassword({
            OldPassword: "",
            NewPassword: "",
            ConfirmPassword: "",
            UpdatedBy: "",
            UpdatedDate: "",
        });
        setToggleChangePassword(false);
        setEditStaffInformation({
            EntryID: "",
            UpdatedBy: "",
            UpdatedDate: "",
            Biography: "",
            Research: "",
            Facebook: "",
            Linkedin: "",
            Twitter: "",
            Scholar: "",
            Researchgate: "",
            Academia: "",
            Orcid: ""
        });
        setToggleInformation(false);
    };

    const signOut = () =>
    {
        props.setOnLoginDetails([]);
        props.setOnPermissionDetails([]);
    };

    const onUpdateStaffPassport = async (e) =>
    {
        e.preventDefault();
        for (let key in addStaffDocument)
        {
            if (
                addStaffDocument.hasOwnProperty(key) &&
                key !== "UpdatedBy" &&
                key !== "UpdatedDate"
            )
            {
                if (addStaffDocument[key] === "")
                {
                    await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
                    return false;
                }
            }
        }

        if (addStaffDocument.file.size / 1024 > 2048)
        {
            toast.error(`File Size Can't be more than 2MB`);
            return false;
        }

        toast.info(`Submitting... Please wait!`);

        let formData = new FormData();
        formData.append("file", addStaffDocument.file);

        await axios
            .post(`${serverLink}staff/hr/staff-management/update/staff/passport/profile`, formData, token)
            .then((res) =>
            {
                if (res.data.type === "success")
                {
                    const sendData = {
                        StaffID: addStaffDocument.StaffID,
                        Image: res.data.file.filename,
                        UpdatedBy: props.loginData[0].StaffID,
                        UpdatedDate: addStaffDocument.UpdatedDate,
                    };

                    axios.patch(`${serverLink}staff/hr/staff-management/update/staff/passport`, sendData, token)
                        .then((res) =>
                        {
                            if (res.data.message === "success")
                            {
                                toast.success(`Passport Updated Successfully`);
                                getStaffRelatedData();
                            } else
                            {
                                toast.error(`Something went wrong submitting your document!`);
                                // DELETE IMAGE FROM PATH
                            }
                        })
                        .catch((error) =>
                        {
                            console.log("Error", error);
                        });
                } else
                {
                    console.log("error", res);
                    toast.error(
                        `Something went wrong uploading your document. Please try again!`
                    );
                }
            })
            .catch((error) =>
            {
                console.log("NETWORK ERROR", error);
            });
    };

    const onEditUpdateStaffPassport = (e) =>
    {
        const id = e.target.id;
        const value = id === "file" ? e.target.files[0] : e.target.value;

        setAddStaffDocument({
            ...addStaffDocument,
            [id]: value,
        });
    };

    const onSubmitStaffChangePassword = async () =>
    {
        for (let key in changeStaffPassword)
        {
            if (
                changeStaffPassword.hasOwnProperty(key) &&
                key !== "UpdatedBy" &&
                key !== "UpdatedDate" &&
                key !== "StaffID"
            )
            {
                if (changeStaffPassword[key] === "")
                {
                    await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
                    return false;
                }
            }
        }

        toast.info("Updating staff password. Please wait..");

        if (changeStaffPassword.NewPassword !== changeStaffPassword.ConfirmPassword)
        {
            await showAlert("Password Does Not Matched", `Please try again.`, "error");
            return false;
        }

        if (changeStaffPassword.Password !== encryptData(changeStaffPassword.OldPassword))
        {
            await showAlert("Wrong Password", `Old Password is Wrong.`, "error");
            return false;
        }

        const sendData = {
            UpdatedBy: props.loginData[0].StaffID,
            UpdatedDate: "",
            StaffID: props.loginData[0].StaffID,
            Password: encryptData(changeStaffPassword.NewPassword),
        };

        await axios
            .patch(
                `${serverLink}staff/hr/staff-management/update/staff/password`,
                sendData, token
            )
            .then((result) =>
            {
                if (result.data.message === "success")
                {
                    toast.success("Staff Password Changed Successfully");
                    signOut();
                } else
                {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            })
            .catch((error) =>
            {
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            });
    };

    const deleteItem = async (id, image) =>
    {
        if (id)
        {
            toast.info(`Deleting... Please wait!`);
            await axios
                .delete(
                    `${serverLink}staff/hr/staff-management/delete/staff/document/${id}/${image}`, token
                )
                .then((res) =>
                {
                    if (res.data.message === "success")
                    {
                        // props.update_app_data();
                        getStaffRelatedData().then((r) => { });
                        toast.success(`Deleted`);
                    } else
                    {
                        toast.error(
                            `Something went wrong. Please check your connection and try again!`
                        );
                    }
                })
                .catch((error) =>
                {
                    console.log("NETWORK ERROR", error);
                });
        }
    };

    const handlePassportUpload = async () =>
    {
        if (editStaffInformation.update_passport === true)
        {
            toast.info("please wait...")
            let formData = new FormData();
            formData.append("file", editStaffInformation.file);
            formData.append("StaffID", props.loginData[0]?.StaffID)
            await axios.post(`${serverLink}staff/hr/staff-management/upload/staff/passport`, formData).then((res) =>
            {
                if (res.data.type === "success")
                {
                    toast.success(`Passport Updated Successfully`);
                    getStaffRelatedData();
                } else
                {
                    toast.error(`Something went wrong submitting your document!`);
                }
            })
        } else
        {
            toast.error("please select passport")
        }

        // if (url !== '') {
        //     const sendData = {
        //         StaffID: addStaffDocument.StaffID,
        //         Image: url,
        //         UpdatedBy: props.loginData[0].StaffID,
        //         UpdatedDate: addStaffDocument.UpdatedDate,
        //     };

        //     axios
        //         .patch(
        //             `${serverLink}staff/hr/staff-management/update/staff/passport`,
        //             sendData, token
        //         )
        //         .then((res) => {
        //             if (res.data.message === "success") {
        //                 toast.success(`Passport Updated Successfully`);
        //                 getStaffRelatedData();
        //             } else {
        //                 toast.error(`Something went wrong submitting your document!`);
        //                 // DELETE IMAGE FROM PATH
        //             }
        //         })
        //         .catch((error) => {
        //             console.log("Error", error);
        //         });
        // }

    }

    const onEdit = (e) =>
    {
        if (e.target.id === "file")
        {
            const file = e.target.files[0]
            if (file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg")
            {

            } else
            {
                toast.error("Only .png, .jpg and .jpeg format allowed!");
                return;
            }
            if (file.size > 1000000)
            {
                toast.error("max file size is 1mb")
                return;

            }
            setEditStaffInformation({
                ...editStaffInformation,
                [e.target.id]: file,
                update_passport: true
            });
            return;
        }
    }

    return isLoading ? (
        <Loader />
    ) : (
        <>
            {staffInformation.staff.length > 0 ? (
                <>
                    <div className="d-flex flex-column flex-row-fluid">

                        {/*PROFILE HEADER (START)*/}
                        <div className="d-flex flex-wrap flex-sm-nowrap mb-3">
                            <div className="me-7 mb-4">
                                <div className="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">
                                    <img
                                        src={
                                            staffInformation.staff.length > 0
                                                ? staffInformation.staff[0].Image.includes("simplefileupload.com") ? staffInformation.staff[0].Image : `${serverLink}public/uploads/${shortCode}/hr/document/${staffInformation.staff[0].Image}`
                                                : "https://via.placeholder.com/150"
                                        }
                                        alt="Staff Picture"
                                    />
                                    <div className="position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border border-4 border-white h-20px w-20px"></div>
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                                    <div className="d-flex flex-column">
                                        <div className="d-flex align-items-center mb-2">
                                            <Link
                                                to="#"
                                                className="text-gray-900 text-hover-primary fs-2 fw-bolder me-1"
                                            >
                                                {staffInformation.staff[0].FirstName}{" "}
                                                {staffInformation.staff[0].MiddleName}{" "}
                                                {staffInformation.staff[0].Surname}{" "}
                                            </Link>
                                            {staffInformation.staff[0].IsActive === 1 ? (
                                                <>
                                                    <Link
                                                        to="#"
                                                        className="btn btn-sm btn-success fw-bolder ms-2 fs-8 py-1 px-3"
                                                    >
                                                        Active
                                                    </Link>
                                                </>
                                            ) : (
                                                <>
                                                    <Link
                                                        to="#"
                                                        className="btn btn-sm btn-danger fw-bolder ms-2 fs-8 py-1 px-3"
                                                    >
                                                        Inactive
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                        <div className="d-flex flex-wrap fw-bold fs-6 mb-4 pe-2">
                                            <Link
                                                to="#"
                                                className="d-flex align-items-center text-gray-400 text-hover-primary me-5 mb-2">
                                                <span className="svg-icon svg-icon-4 me-1">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                    >
                                                        <path
                                                            opacity="0.3"
                                                            d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12ZM12 7C10.3 7 9 8.3 9 10C9 11.7 10.3 13 12 13C13.7 13 15 11.7 15 10C15 8.3 13.7 7 12 7Z"
                                                            fill="currentColor"
                                                        ></path>
                                                        <path
                                                            d="M12 22C14.6 22 17 21 18.7 19.4C17.9 16.9 15.2 15 12 15C8.8 15 6.09999 16.9 5.29999 19.4C6.99999 21 9.4 22 12 22Z"
                                                            fill="currentColor"
                                                        ></path>
                                                    </svg>
                                                </span>
                                                {staffInformation.staff[0].RoleTitle}
                                            </Link>
                                            <Link
                                                to="#"
                                                className="d-flex align-items-center text-gray-400 text-hover-primary mb-2"
                                            >
                                                {staffInformation.staff[0].OfficialEmailAddress}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex flex-wrap flex-stack">
                                    <div className="d-flex flex-column flex-grow-1 pe-8">
                                        <div className="d-flex flex-wrap">
                                            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="fs-2 fw-bolder counted">
                                                        {staffInformation.staff[0].Hits}
                                                    </div>
                                                </div>
                                                <div className="fw-bold fs-6 text-gray-400">
                                                    Profile Hit
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*PROFILE HEADER (END)*/}

                        {/*NAV (START)*/}
                        <div className="flex-column-fluid">
                            <div className="card">
                                <div className="card-body p-0">

                                    {/*NAV HOLDER(START)*/}
                                    <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-8">
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-active-primary pb-4 active"
                                                data-bs-toggle="tab"
                                                to="#biography">
                                                Personal Information
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-active-primary pb-4"
                                                data-bs-toggle="tab"
                                                to="#publications"
                                            >
                                                Publications
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-active-primary pb-4"
                                                data-bs-toggle="tab"
                                                to="#nok"
                                            >
                                                Passport
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-active-primary pb-4"
                                                data-bs-toggle="tab"
                                                to="#documents"
                                            >
                                                Login Details
                                            </Link>
                                        </li>
                                    </ul>
                                    {/*NAV HOLDER(ENDS)*/}

                                    {/*NAV APPEARANCE(START)*/}
                                    <div className="tab-content w-100" id="myTabContent">
                                        <div className="tab-pane fade active show" id="biography" role="tabpanel">
                                            <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                                <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={staffInformationForm}>
                                                    Edit Profile
                                                </button>
                                            </div>

                                            {toggleInformation && (
                                                <div className="row">
                                                    <div className="row">


                                                        <h5 className="pt-10">Web Profile</h5>
                                                        <hr />
                                                        <div className="row">
                                                            <div className="col-lg-4 pt-5">
                                                                <div className="form-group">
                                                                    <label htmlFor="Email Address   ">Email Address    </label>
                                                                    <input
                                                                        type="text"
                                                                        id="EmailAddress"
                                                                        className="form-control"
                                                                        placeholder="EmailAddress"
                                                                        value={editStaffInformation.EmailAddress}
                                                                        onChange={onEditInformation}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-lg-4 pt-5">
                                                                <div className="form-group">
                                                                    <label htmlFor="Facebook">Facebook</label>
                                                                    <input
                                                                        type="text"
                                                                        id="Facebook"
                                                                        className="form-control"
                                                                        placeholder="Facebook"
                                                                        required
                                                                        value={editStaffInformation.Facebook}
                                                                        onChange={onEditInformation}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-lg-4 pt-5">
                                                                <div className="form-group">
                                                                    <label htmlFor="Twitter">Twitter</label>
                                                                    <input
                                                                        type="text"
                                                                        id="Twitter"
                                                                        className="form-control"
                                                                        placeholder="Twitter"
                                                                        required
                                                                        value={editStaffInformation.Twitter}
                                                                        onChange={onEditInformation}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-lg-4 pt-5">
                                                                <div className="form-group">
                                                                    <label htmlFor="Linkedin">Linkedin</label>
                                                                    <input
                                                                        type="text"
                                                                        id="Linkedin"
                                                                        className="form-control"
                                                                        placeholder="Linkedin"
                                                                        value={editStaffInformation.Linkedin}
                                                                        onChange={onEditInformation}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-lg-6 pt-5">
                                                                <div className="form-group">
                                                                    <label htmlFor="Scholar">Scholar</label>
                                                                    <input
                                                                        type="text"
                                                                        id="Scholar"
                                                                        className="form-control"
                                                                        placeholder="Scholar"
                                                                        value={editStaffInformation.Scholar}
                                                                        onChange={onEditInformation}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-lg-6 pt-5">
                                                                <div className="form-group">
                                                                    <label htmlFor="Researchgate">
                                                                        Researchgate
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        id="Researchgate"
                                                                        className="form-control"
                                                                        placeholder="Researchgate"
                                                                        value={editStaffInformation.Researchgate}
                                                                        onChange={onEditInformation}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-lg-6 pt-5">
                                                                <div className="form-group">
                                                                    <label htmlFor="Academia">Academia</label>
                                                                    <input
                                                                        type="text"
                                                                        id="Academia"
                                                                        className="form-control"
                                                                        placeholder="Academia"
                                                                        value={editStaffInformation.Academia}
                                                                        onChange={onEditInformation}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-lg-6 pt-5">
                                                                <div className="form-group">
                                                                    <label htmlFor="Orcid">Orcid</label>
                                                                    <input
                                                                        type="text"
                                                                        id="Orcid"
                                                                        className="form-control"
                                                                        placeholder="Orcid"
                                                                        value={editStaffInformation.Orcid}
                                                                        onChange={onEditInformation}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-12 pt-5">
                                                                <div className="form-group">
                                                                    <label htmlFor="">Biography</label>
                                                                    <JoditEditor
                                                                        value={editStaffInformation.Biography}
                                                                        ref={editorRef}
                                                                        tabIndex={1}
                                                                        onChange={onBiographyChanged}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-12 pt-5">
                                                                <div className="form-group">
                                                                    <label htmlFor="">Research</label>
                                                                    <JoditEditor
                                                                        value={editStaffInformation.Research}
                                                                        ref={editorRef}
                                                                        tabIndex={1}
                                                                        onChange={onResearchChanged}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="pt-5">
                                                            <button
                                                                className="btn btn-danger w-50 btn-sm"
                                                                onClick={closeHandler}>
                                                                Cancel
                                                            </button>
                                                            <button
                                                                className="btn btn-primary w-50 btn-sm"
                                                                onClick={onSubmitStaffInformation}>
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="row">
                                                <div className="card-body p-9">
                                                    <div className="row mb-7">
                                                        <label className="col-lg-4 fw-bold text-muted">
                                                            Full Name
                                                        </label>
                                                        <div className="col-lg-8">
                                                            <span className="fw-bolder fs-6 text-gray-800">
                                                                {staffInformation.staff[0].FirstName}{" "}
                                                                {staffInformation.staff[0].MiddleName}{" "}
                                                                {staffInformation.staff[0].Surname}{" "}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="row mb-7">
                                                        <label className="col-lg-4 fw-bold text-muted">
                                                            Department
                                                        </label>
                                                        <div className="col-lg-8 fv-row">
                                                            <span className="fw-bold text-gray-800 fs-6">
                                                                {staffInformation.department.length > 0 &&
                                                                    staffInformation.department.filter(
                                                                        (i) =>
                                                                            i.DepartmentCode === staffInformation.staff[0].DepartmentCode
                                                                    ).map(
                                                                        (r) => r.DepartmentName
                                                                    )
                                                                }
                                                                {/*{staffDepartment[0].DepartmentCode}*/}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="row mb-7">
                                                        <label className="col-lg-4 fw-bold text-muted">
                                                            Contact Phone
                                                            <i className="fas fa-exclamation-circle ms-1 fs-7" data-bs-toggle="tooltip" title="" data-bs-original-title="Phone number must be active" aria-label="Phone number must be active"></i>
                                                        </label>
                                                        <div className="col-lg-8 d-flex align-items-center">
                                                            <span className="fw-bolder fs-6 text-gray-800 me-2">
                                                                {staffInformation.staff[0].PhoneNumber}
                                                            </span>
                                                            {/*<span className="badge badge-success">*/}
                                                            {/*  Verified*/}
                                                            {/*</span>*/}
                                                        </div>
                                                    </div>
                                                    <div className="row mb-7">
                                                        <label className="col-lg-4 fw-bold text-muted">
                                                            Country
                                                            <i
                                                                className="fas fa-exclamation-circle ms-1 fs-7"
                                                                data-bs-toggle="tooltip"
                                                                title=""
                                                                data-bs-original-title="Country of origination"
                                                                aria-label="Country of origination"
                                                            ></i>
                                                        </label>
                                                        <div className="col-lg-8">
                                                            <span className="fw-bolder fs-6 text-gray-800">
                                                                <span className="fw-bold text-gray-800 fs-6">
                                                                    {staffInformation.country.length > 0 &&
                                                                        staffInformation.country.filter((i) =>
                                                                            i.EntryID === staffInformation.staff[0].NationalityID
                                                                        ).map((r) => r.Country)}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="row mb-7">
                                                        <label className="col-lg-4 fw-bold text-muted">
                                                            State
                                                        </label>
                                                        <div className="col-lg-8">
                                                            <span className="fw-bolder fs-6 text-gray-800">
                                                                {staffInformation.state.length > 0 &&
                                                                    staffInformation.state.filter((i) =>
                                                                        i.EntryID === staffInformation.staff[0].StateID
                                                                    ).map((r) => r.StateName)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="row mb-10">
                                                        <label className="col-lg-4 fw-bold text-muted">
                                                            LGA
                                                        </label>
                                                        <div className="col-lg-8">
                                                            <span className="fw-bolder fs-6 text-gray-800">
                                                                {staffInformation.lga.length > 0 &&
                                                                    staffInformation.lga.filter((i) =>
                                                                        i.EntryID === staffInformation.staff[0].LgaID
                                                                    ).map((r) => r.LgaName)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="notice d-flex bg-light-info rounded border border-2 p-6">
                                                        <div className="d-flex flex-stack flex-grow-1">
                                                            <div className="fw-bold">
                                                                <h4 className="text-gray-900 fw-bolder">
                                                                    Biography
                                                                </h4>
                                                                <div className="fs-6 text-gray-700">
                                                                    <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(staffInformation.staff[0].Biography) }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="tab-pane fade" id="publications" role="tabpanel"><div className="card">
                                            <div
                                                id="kt_referred_users_tab_content"
                                                className="tab-content"
                                            >
                                                <div
                                                    id="kt_referrals_2"
                                                    className="card-body p-0 tab-pane fade active show"
                                                    role="tabpanel"
                                                >
                                                    <div className="table-responsive">
                                                        {staffInformation.publications.length > 0 ? (
                                                            <table className="table table-flush align-middle table-row-bordered table-row-solid gy-4 gs-9">
                                                                <thead className="border-gray-200 fs-5 fw-bold bg-lighten">
                                                                    <tr>
                                                                        <th className="min-w-175px ps-9">
                                                                            Paper Title
                                                                        </th>
                                                                        <th className="min-w-150px px-0">
                                                                            Author(s)
                                                                        </th>
                                                                        <th className="min-w-50px px-0">
                                                                            Work Title
                                                                        </th>
                                                                        <th className="min-w-150px px-0">Year</th>
                                                                        <th className="min-w-50px px-0">View</th>
                                                                        <th className="min-w-50px px-0">
                                                                            Download
                                                                        </th>
                                                                        <th className="min-w-150px px-5">
                                                                            Action
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="fs-6 fw-bold text-gray-600">
                                                                    {staffInformation.publications.map(
                                                                        (publication, index) => (
                                                                            <tr key={index}>
                                                                                <td className="ps-9">
                                                                                    {publication.PaperTitle}
                                                                                </td>
                                                                                <td className="ps-0">
                                                                                    {publication.Authors}
                                                                                </td>
                                                                                <td className="ps-0">
                                                                                    {publication.WorkTitle}
                                                                                </td>
                                                                                <td className="ps-0">
                                                                                    {publication.PublishedYear}
                                                                                </td>
                                                                                <td className="ps-0">
                                                                                    {publication.ViewCount}
                                                                                </td>
                                                                                <td className="ps-0">
                                                                                    {publication.DownloadCount}
                                                                                </td>
                                                                                <td>
                                                                                    <button className="btn btn-light btn-sm btn-active-light-primary">
                                                                                        Download
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        ) : (
                                                            <div className="alert alert-info">
                                                                There is no record added.{" "}
                                                                <Link to="/users/publication-manager">
                                                                    Click to Add Publication
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div></div>
                                        <div className="tab-pane fade" id="nok" role="tabpanel">
                                            <div className="row">
                                                <div className="col-lg-4 col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="Designation">Upload Passport</label>
                                                        {/* <SimpleFileUpload
                                                            apiKey={simpleFileUploadAPIKey}
                                                            tag={`${projectName}-passport`}
                                                            onSuccess={handlePassportUpload}
                                                            accepted={"image/*"}
                                                            maxFileSize={2}
                                                            preview="false"
                                                            width="100%"
                                                            height="100"
                                                        /> */}

                                                        <input
                                                            type="file"
                                                            accept=".pdf, .jpg, .png, .jpeg"
                                                            id="file"
                                                            name="file"
                                                            className="form-control"
                                                            placeholder="file"
                                                            onChange={onEdit}
                                                        />

                                                        <span className="badge bg-primary">
                                                            Only .jpg, .png, .jpeg are allowed, Max of 2MB
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 col-md-4">
                                                    <div className="form-group mt-5">
                                                        <label htmlFor="Designation"></label>
                                                        <button className="btn btn-md btn-primary" type="button" onClick={handlePassportUpload}>
                                                            Update Passport
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                        <div className="tab-pane fade" id="documents" role="tabpanel"><div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base"></div>
                                            <div id="kt_referrals_2" className="card-body p-0 tab-pane fade active show" role="tabpanel">
                                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={changeStaffPasswordForm}>
                                                        Change Password
                                                    </button>
                                                </div>

                                                {toggleChangePassword && (
                                                    <div className="row">
                                                        <div className="row">
                                                            <h5 className="pt-10">Update Password</h5>
                                                            <hr />
                                                            <div className="row">
                                                                <div className="col-lg-4 pt-5">
                                                                    <div className="form-group">
                                                                        <label htmlFor="OldPassword">Old Password</label>
                                                                        <input
                                                                            type="password"
                                                                            id="OldPassword"
                                                                            className="form-control"
                                                                            placeholder="Old Password"
                                                                            required
                                                                            value={changeStaffPassword.OldPassword}
                                                                            onChange={onEditPassword}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-4 pt-5">
                                                                    <div className="form-group">
                                                                        <label htmlFor="NewPassword">New Password</label>
                                                                        <input
                                                                            type="password"
                                                                            id="NewPassword"
                                                                            className="form-control"
                                                                            placeholder="New Password"
                                                                            required
                                                                            value={changeStaffPassword.NewPassword}
                                                                            onChange={onEditPassword}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-4 pt-5">
                                                                    <div className="form-group">
                                                                        <label htmlFor="ConfirmPassword">Confirm Password</label>
                                                                        <input
                                                                            type="password"
                                                                            id="ConfirmPassword"
                                                                            className="form-control"
                                                                            placeholder="Confirm Password"
                                                                            value={changeStaffPassword.ConfirmPassword}
                                                                            onChange={onEditPassword}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="pt-5">
                                                                <button
                                                                    className="btn btn-danger w-50 btn-sm"
                                                                    onClick={closeHandler}>
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    className="btn btn-primary w-50 btn-sm"
                                                                    onClick={onSubmitStaffChangePassword}>
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/*NAV APPEARANCE(ENDS)*/}
                                </div>
                            </div>
                        </div>
                        {/*NAV (END)*/}

                    </div>
                </>
            ) : (
                <>
                    <p></p>
                </>
            )}
        </>
    );
}

const mapStateToProps = (state) =>
{
    return {
        loginData: state.LoginDetails,
    };
};
const mapDispatchToProps = (dispatch) =>
{
    return {
        setOnLoginDetails: (p) =>
        {
            dispatch(setLoginDetails(p));
        },
        setOnPermissionDetails: (p) =>
        {
            dispatch(setPermissionDetails(p));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditStaffProfile);
