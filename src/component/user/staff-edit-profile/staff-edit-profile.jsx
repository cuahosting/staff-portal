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
    const [qualifications, setQualifications] = useState([]);


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


    const [addStaffQualifications, setAddStaffQualifications] = useState({
        StaffID: staffId,
        QualificationID: "",
        Discipline: "",
        InstitutionName: "",
        Year: "",
      });

    const [addStaffNOK, setAddStaffNOK] = useState({
        StaffID: staffId,
        FirstName: "",
        Surname: "",
        MiddleName: "",
        Relationship: "",
        PhoneNumber: "",
        Address: "",
        EmailAddress: "",
        InsertBy: staffId,
        InsertDate: "",
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

    const [toggleChangePassword, setToggleChangePassword] = useState(true);

    const [addStaffDocument, setAddStaffDocument] = useState({
        StaffID: props.loginData[0]?.StaffID,
        file: "",
        UpdatedBy: props.loginData[0]?.StaffID,
        UpdatedDate: "",
    });

    const [isDragging, setIsDragging] = useState(false);

    const getQualification = async () => {
        await axios
          .get(`${serverLink}staff/hr/staff-management/qualifications/`, token)
          .then((response) => {
            setQualifications(response.data);
          })
          .catch((err) => {
            console.log("NETWORK ERROR");
          });
      };

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
        getQualification().then((r) => { });
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

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];

            // Validate file type
            if (file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg") {
                // Validate file size (1MB)
                if (file.size > 1000000) {
                    toast.error("max file size is 1mb");
                    return;
                }

                setEditStaffInformation({
                    ...editStaffInformation,
                    file: file,
                    update_passport: true
                });
            } else {
                toast.error("Only .png, .jpg and .jpeg format allowed!");
            }
        }
    };

    const onEditStaffQualifications = (e) => {
        const id = e.target.id;
        const value = id === "file" ? e.target.files[0] : e.target.value;
    
    setAddStaffQualifications({
        ...addStaffQualifications,
        [id]: value,
      });
  
      getQualification().then((r) => { });
    };
  
    const handleStaffEdit = (e) => {
      setAddStaffQualifications({
        ...addStaffQualifications,
        [e.target.id]: e.target.value,
      });
    }

    const onSubmitStaffQualifications = async (e) => {
        e.preventDefault();
        for (let key in addStaffQualifications) {
          if (
            addStaffQualifications.hasOwnProperty(key) &&
            key !== "InsertBy" &&
            key !== "InsertDate"
          ) {
            if (addStaffQualifications[key] === "") {
              await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
              return false;
            }
          }
        }

        // console.log("Staff Documents", addStaffQualifications);
        // return false;
        toast.info(`Submitting... Please wait!`);
        await axios
          .post(
            `${serverLink}staff/hr/staff-management/staff/qualifications`,
            addStaffQualifications, token
          )
          .then((res) => {
            if (res.data.message === "success") {
              console.log("Response Type", res.data);
              toast.success("Qualification Added Successfully");
                setAddStaffQualifications({
                    ...addStaffQualifications,
                    QualificationID: "",
                    Discipline: "",
                    InstitutionName: "",
                    Year: "",
                });
                // Refresh data and close modal
                getStaffRelatedData();
                document.getElementById("closeQualificationModal").click();
            } else {
              console.log("error", res);
              toast.error(`Something went wrong. Please try again!`);
            }
          })
          .catch((error) => {
            console.log("NETWORK ERROR", error);
          });
      };

    const onDeleteStaffQualification = async (qualificationId) => {
        const confirmDelete = await showAlert(
            "DELETE QUALIFICATION",
            "Are you sure you want to delete this qualification?",
            "warning",
            true
        );

        if (confirmDelete) {
            toast.info("Deleting qualification... Please wait!");
            await axios
                .delete(
                    `${serverLink}staff/hr/staff-management/staff/delete/qualifications/${qualificationId}`,
                    token
                )
                .then((res) => {
                    if (res.data.message === "success") {
                        toast.success("Qualification Deleted Successfully");
                        getStaffRelatedData();
                    } else {
                        toast.error("Something went wrong. Please try again!");
                    }
                })
                .catch((error) => {
                    console.log("NETWORK ERROR", error);
                    toast.error("Failed to delete qualification. Please try again!");
                });
        }
    };

    // NOK Functions
    const onEditStaffNOK = (e) => {
        const id = e.target.id;
        const value = e.target.value;

        setAddStaffNOK({
            ...addStaffNOK,
            [id]: value,
        });
    };

    const onSubmitStaffNOK = async (e) => {
        e.preventDefault();
        for (let key in addStaffNOK) {
            if (
                addStaffNOK.hasOwnProperty(key) &&
                key !== "InsertBy" &&
                key !== "InsertDate" &&
                key !== "MiddleName"
            ) {
                if (addStaffNOK[key] === "") {
                    await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
                    return false;
                }
            }
        }

        toast.info(`Submitting... Please wait!`);
        await axios
            .post(
                `${serverLink}staff/hr/staff-management/attach/staff/nok`,
                addStaffNOK,
                token
            )
            .then((res) => {
                if (res.data.message === "success") {
                    toast.success("Next of Kin Added Successfully");
                    setAddStaffNOK({
                        ...addStaffNOK,
                        FirstName: "",
                        Surname: "",
                        MiddleName: "",
                        Relationship: "",
                        PhoneNumber: "",
                        Address: "",
                        EmailAddress: "",
                    });
                    // Refresh data and close modal
                    getStaffRelatedData();
                    document.getElementById("closeNOKModal").click();
                } else if (res.data.message === "exist") {
                    toast.warning("Next of Kin already exists. Please update or delete the existing record.");
                } else {
                    console.log("error", res);
                    toast.error(`Something went wrong. Please try again!`);
                }
            })
            .catch((error) => {
                console.log("NETWORK ERROR", error);
                toast.error("Network error. Please check your connection!");
            });
    };

    const onDeleteStaffNOK = async (nokId) => {
        const confirmDelete = await showAlert(
            "DELETE NEXT OF KIN",
            "Are you sure you want to delete this next of kin record?",
            "warning",
            true
        );

        if (confirmDelete) {
            toast.info("Deleting next of kin... Please wait!");
            await axios
                .delete(
                    `${serverLink}staff/hr/staff-management/staff/delete/nok/${nokId}`,
                    token
                )
                .then((res) => {
                    if (res.data.message === "success") {
                        toast.success("Next of Kin Deleted Successfully");
                        getStaffRelatedData();
                    } else {
                        toast.error("Something went wrong. Please try again!");
                    }
                })
                .catch((error) => {
                    console.log("NETWORK ERROR", error);
                    toast.error("Failed to delete next of kin. Please try again!");
                });
        }
    };



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
                                <div className="card-body pt-0">

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
                                                to="#qualifications"
                                            >
                                                Qualification
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link text-active-primary pb-4"
                                                data-bs-toggle="tab"
                                                to="#next-of-kin"
                                            >
                                                Next of Kin
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


                                        <div className="tab-pane fade" id="qualifications" role="tabpanel">
    <div className="card shadow-sm">
        <div className="card-header bg-light border-0 pt-5">
            <div className="d-flex justify-content-between align-items-center">
                <h3 className="card-title fw-bold">My Qualifications</h3>
                <button
                    style={{ float: "right" }}
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#kt_modal_add_qualification"
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Qualification
                </button>
            </div>
        </div>
        <div className="card-body">
            {staffInformation.qualifications && staffInformation.qualifications.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-hover table-row-bordered table-row-gray-100 align-middle gs-0 gy-3">
                        <thead>
                            <tr className="fw-bold text-muted bg-light">
                                <th className="ps-4 min-w-50px rounded-start">#</th>
                                <th className="min-w-200px">Qualification</th>
                                <th className="min-w-200px">Discipline</th>
                                <th className="min-w-200px">Institution</th>
                                <th className="min-w-100px">Year</th>
                                <th className="min-w-100px text-end rounded-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffInformation.qualifications.map((qualification, index) => (
                                <tr key={index}>
                                    <td className="ps-4">
                                        <span className="text-dark fw-bold d-block fs-6">
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-dark fw-bold d-block fs-6">
                                            {qualification.QualificationTitle || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-gray-800 d-block fs-6">
                                            {qualification.Discipline || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-gray-800 d-block fs-6">
                                            {qualification.InstitutionName || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-light-primary fs-7 fw-bold">
                                            {qualification.Year || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button
                                            className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                                            onClick={() => onDeleteStaffQualification(qualification.EntryID)}
                                            title="Delete Qualification"
                                        >
                                            <i className="bi bi-trash fs-4"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10">
                    <div className="mb-5">
                        <i className="bi bi-journal-bookmark fs-3x text-muted"></i>
                    </div>
                    <h4 className="text-gray-800 mb-3">No Qualifications Added</h4>
                    <p className="text-gray-600 mb-5">
                        You haven't added any qualifications yet. Click the button above to add your first qualification.
                    </p>
                    <button
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_modal_add_qualification"
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Your First Qualification
                    </button>
                </div>
            )}
        </div>
    </div>
</div>


                                        <div className="tab-pane fade" id="next-of-kin" role="tabpanel">
    <div className="card shadow-sm">
        <div className="card-header bg-light border-0 pt-5">
            <div className="d-flex justify-content-between align-items-center">
                <h3 className="card-title fw-bold">Next of Kin</h3>
                <button
                    style={{ float: "right" }}
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#kt_modal_add_nok"
                >
                    <i className="bi bi-person-plus me-2"></i>
                    Add Next of Kin
                </button>
            </div>
        </div>
        <div className="card-body">
            {staffInformation.nok && staffInformation.nok.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-hover table-row-bordered table-row-gray-100 align-middle gs-0 gy-3">
                        <thead>
                            <tr className="fw-bold text-muted bg-light">
                                <th className="ps-4 min-w-50px rounded-start">#</th>
                                <th className="min-w-150px">Full Name</th>
                                <th className="min-w-120px">Relationship</th>
                                <th className="min-w-120px">Phone Number</th>
                                <th className="min-w-150px">Email</th>
                                <th className="min-w-200px">Address</th>
                                <th className="min-w-100px text-end rounded-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffInformation.nok.map((nok, index) => (
                                <tr key={index}>
                                    <td className="ps-4">
                                        <span className="text-dark fw-bold d-block fs-6">
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <span className="text-dark fw-bold d-block fs-6">
                                                {`${nok.FirstName} ${nok.MiddleName ? nok.MiddleName + ' ' : ''}${nok.Surname}`}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-light-info fs-7 fw-bold">
                                            {nok.Relationship || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-gray-800 d-block fs-6">
                                            {nok.PhoneNumber || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-gray-800 d-block fs-6">
                                            {nok.EmailAddress || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-gray-600 d-block fs-7" title={nok.Address}>
                                            {nok.Address ? (nok.Address.length > 40 ? nok.Address.substring(0, 40) + '...' : nok.Address) : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button
                                            className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                                            onClick={() => onDeleteStaffNOK(nok.EntryID)}
                                            title="Delete Next of Kin"
                                        >
                                            <i className="bi bi-trash fs-4"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10">
                    <div className="mb-5">
                        <i className="bi bi-people fs-3x text-muted"></i>
                    </div>
                    <h4 className="text-gray-800 mb-3">No Next of Kin Added</h4>
                    <p className="text-gray-600 mb-5">
                        You haven't added any next of kin information yet. Click the button above to add your emergency contact.
                    </p>
                    <button
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_modal_add_nok"
                    >
                        <i className="bi bi-person-plus me-2"></i>
                        Add Next of Kin
                    </button>
                </div>
            )}
        </div>
    </div>
</div>


                                        <div className="tab-pane fade" id="nok" role="tabpanel">
                                            <div className="row">
                                                <div className="col-lg-6 col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="Designation">Upload Passport</label>

                                                        {/* Drag and Drop Zone */}
                                                        <div
                                                            onDragEnter={handleDragEnter}
                                                            onDragLeave={handleDragLeave}
                                                            onDragOver={handleDragOver}
                                                            onDrop={handleDrop}
                                                            style={{
                                                                border: isDragging ? '3px dashed #007bff' : '2px dashed #ccc',
                                                                borderRadius: '8px',
                                                                padding: '30px',
                                                                textAlign: 'center',
                                                                backgroundColor: isDragging ? '#f0f8ff' : '#fafafa',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s ease',
                                                                marginBottom: '10px'
                                                            }}
                                                            onClick={() => document.getElementById('file').click()}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="48"
                                                                height="48"
                                                                fill={isDragging ? '#007bff' : '#6c757d'}
                                                                viewBox="0 0 16 16"
                                                                style={{ marginBottom: '10px' }}
                                                            >
                                                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                                                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                                                            </svg>
                                                            <p style={{ margin: '10px 0', fontWeight: 'bold', color: isDragging ? '#007bff' : '#333' }}>
                                                                {editStaffInformation.file
                                                                    ? editStaffInformation.file.name
                                                                    : isDragging
                                                                        ? 'Drop your image here'
                                                                        : 'Drag & drop your image here'}
                                                            </p>
                                                            <p style={{ margin: '5px 0', fontSize: '14px', color: '#6c757d' }}>
                                                                or click to browse
                                                            </p>
                                                        </div>

                                                        <input
                                                            type="file"
                                                            accept=".jpg, .png, .jpeg"
                                                            id="file"
                                                            name="file"
                                                            style={{ display: 'none' }}
                                                            onChange={onEdit}
                                                        />

                                                        <span className="badge bg-primary">
                                                            Only .jpg, .png, .jpeg are allowed, Max of 1MB
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col-lg-12 col-md-12">
                                                    <div className="form-group mt-5">
                                                        <label htmlFor="Designation"></label>
                                                        <button className="btn btn-md btn-primary" type="button" onClick={handlePassportUpload}>
                                                            Update Passport
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                        
                                        <div className="tab-pane fade" id="documents" role="tabpanel">
    <div className="card-body p-0 tab-pane fade active show" id="kt_referrals_2" role="tabpanel">

        {/* Header */}
        <div className="col-12">
            <h5 className="pt-10 fw-bold">Update Password</h5>
            <hr />
        </div>

        {/* Vertical Form */}
        <div className="col-8 pt-3">

            <div className="form-group mb-4">
                <label htmlFor="OldPassword" className="fw-semibold">Old Password</label>
                <input
                    type="password"
                    id="OldPassword"
                    className="form-control"
                    placeholder="Enter old password"
                    required
                    value={changeStaffPassword.OldPassword}
                    onChange={onEditPassword}
                />
            </div>

            <div className="form-group mb-4">
                <label htmlFor="NewPassword" className="fw-semibold">New Password</label>
                <input
                    type="password"
                    id="NewPassword"
                    className="form-control"
                    placeholder="Enter new password"
                    required
                    value={changeStaffPassword.NewPassword}
                    onChange={onEditPassword}
                />
            </div>

            <div className="form-group mb-4">
                <label htmlFor="ConfirmPassword" className="fw-semibold">Confirm Password</label>
                <input
                    type="password"
                    id="ConfirmPassword"
                    className="form-control"
                    placeholder="Re-enter new password"
                    value={changeStaffPassword.ConfirmPassword}
                    onChange={onEditPassword}
                />
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-3 pt-2">
                

                <button
                    className="btn btn-primary btn-sm w-100"
                    onClick={onSubmitStaffChangePassword}
                >
                    Save Changes
                </button>
            </div>
        </div>

        {/* Security Tips */}
        <div className="mt-10 p-5 bg-light-primary rounded">
            <h6 className="fw-bold mb-3">🔒 Security Tips</h6>
            <ul className="m-0 ps-4">
                <li>Use at least 8 characters, including uppercase, lowercase, numbers, and symbols.</li>
                <li>Do not reuse old passwords.</li>
                <li>Avoid using personal information such as name or date of birth.</li>
                <li>Never share your password with anyone.</li>
                <li>Change your password regularly to enhance security.</li>
                <li>Log out of your account after completing sensitive tasks.</li>
            </ul>
        </div>

    </div>
</div>

                                    </div>
                                    {/*NAV APPEARANCE(ENDS)*/}
                                </div>
                            </div>
                        </div>
                        {/*NAV (END)*/}

                    </div>

                    {/* Add Qualification Modal */}
                    <Modal id="kt_modal_add_qualification" title="Add Qualification" close="closeQualificationModal">
                        <form onSubmit={onSubmitStaffQualifications}>
                            <div className="row">
                                {/* Qualification Title */}
                                <div className="col-12 mb-5">
                                    <label htmlFor="QualificationID" className="required form-label fw-semibold">
                                        Qualification Title
                                    </label>
                                    <select
                                        id="QualificationID"
                                        name="QualificationID"
                                        value={addStaffQualifications.QualificationID}
                                        className="form-select form-select-solid"
                                        onChange={onEditStaffQualifications}
                                        required
                                    >
                                        <option value="">Select Qualification</option>
                                        {qualifications &&
                                            qualifications.map((item, index) => (
                                                <option key={index} value={item.EntryID}>
                                                    {item.QualificationTitle}
                                                </option>
                                            ))}
                                    </select>
                                    <div className="form-text">Choose your qualification type (e.g., BSc, MSc, PhD)</div>
                                </div>

                                {/* Discipline */}
                                <div className="col-12 mb-5">
                                    <label htmlFor="Discipline" className="required form-label fw-semibold">
                                        Discipline
                                    </label>
                                    <input
                                        type="text"
                                        id="Discipline"
                                        className="form-control form-control-solid"
                                        placeholder="e.g., Computer Science, Business Administration"
                                        value={addStaffQualifications.Discipline}
                                        onChange={onEditStaffQualifications}
                                        required
                                    />
                                    <div className="form-text">Enter your field of study</div>
                                </div>

                                {/* Institution */}
                                <div className="col-12 mb-5">
                                    <label htmlFor="InstitutionName" className="required form-label fw-semibold">
                                        Institution Name
                                    </label>
                                    <input
                                        type="text"
                                        id="InstitutionName"
                                        className="form-control form-control-solid"
                                        placeholder="e.g., University of Lagos"
                                        value={addStaffQualifications.InstitutionName}
                                        onChange={onEditStaffQualifications}
                                        required
                                    />
                                    <div className="form-text">Enter the name of the institution</div>
                                </div>

                                {/* Year */}
                                <div className="col-12 mb-5">
                                    <label htmlFor="Year" className="required form-label fw-semibold">
                                        Year of Completion
                                    </label>
                                    <input
                                        type="number"
                                        id="Year"
                                        className="form-control form-control-solid"
                                        placeholder="e.g., 2020"
                                        min="1950"
                                        max={currentYear}
                                        value={addStaffQualifications.Year}
                                        onChange={onEditStaffQualifications}
                                        required
                                    />
                                    <div className="form-text">Enter the year you completed this qualification</div>
                                </div>

                                {/* Action Buttons */}
                                <div className="col-12 d-flex justify-content-end gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        data-bs-dismiss="modal"
                                        id="closeQualificationModal"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        <i className="bi bi-check-circle me-2"></i>
                                        Save Qualification
                                    </button>
                                </div>
                            </div>
                        </form>
                    </Modal>

                    {/* Add Next of Kin Modal */}
                    <Modal id="kt_modal_add_nok" title="Add Next of Kin" close="closeNOKModal" large={true}>
                        <form onSubmit={onSubmitStaffNOK}>
                            <div className="row">
                                {/* First Name */}
                                <div className="col-md-6 mb-5">
                                    <label htmlFor="FirstName" className="required form-label fw-semibold">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="FirstName"
                                        className="form-control form-control-solid"
                                        placeholder="Enter first name"
                                        value={addStaffNOK.FirstName}
                                        onChange={onEditStaffNOK}
                                        required
                                    />
                                </div>

                                {/* Surname */}
                                <div className="col-md-6 mb-5">
                                    <label htmlFor="Surname" className="required form-label fw-semibold">
                                        Surname
                                    </label>
                                    <input
                                        type="text"
                                        id="Surname"
                                        className="form-control form-control-solid"
                                        placeholder="Enter surname"
                                        value={addStaffNOK.Surname}
                                        onChange={onEditStaffNOK}
                                        required
                                    />
                                </div>

                                {/* Middle Name */}
                                <div className="col-md-6 mb-5">
                                    <label htmlFor="MiddleName" className="form-label fw-semibold">
                                        Middle Name <span className="text-muted">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="MiddleName"
                                        className="form-control form-control-solid"
                                        placeholder="Enter middle name"
                                        value={addStaffNOK.MiddleName}
                                        onChange={onEditStaffNOK}
                                    />
                                </div>

                                {/* Relationship */}
                                <div className="col-md-6 mb-5">
                                    <label htmlFor="Relationship" className="required form-label fw-semibold">
                                        Relationship
                                    </label>
                                    <select
                                        id="Relationship"
                                        className="form-select form-select-solid"
                                        value={addStaffNOK.Relationship}
                                        onChange={onEditStaffNOK}
                                        required
                                    >
                                        <option value="">Select Relationship</option>
                                        <option value="Wife">Wife</option>
                                        <option value="Husband">Husband</option>
                                        <option value="Mother">Mother</option>
                                        <option value="Father">Father</option>
                                        <option value="Sister">Sister</option>
                                        <option value="Brother">Brother</option>
                                        <option value="Son">Son</option>
                                        <option value="Daughter">Daughter</option>
                                        <option value="Uncle">Uncle</option>
                                        <option value="Aunty">Aunty</option>
                                        <option value="Cousin">Cousin</option>
                                        <option value="Friend">Friend</option>
                                    </select>
                                </div>

                                {/* Phone Number */}
                                <div className="col-md-6 mb-5">
                                    <label htmlFor="PhoneNumber" className="required form-label fw-semibold">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="PhoneNumber"
                                        className="form-control form-control-solid"
                                        placeholder="e.g., +234 801 234 5678"
                                        value={addStaffNOK.PhoneNumber}
                                        onChange={onEditStaffNOK}
                                        required
                                    />
                                    <div className="form-text">Include country code for better reach</div>
                                </div>

                                {/* Email Address */}
                                <div className="col-md-6 mb-5">
                                    <label htmlFor="EmailAddress" className="required form-label fw-semibold">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="EmailAddress"
                                        className="form-control form-control-solid"
                                        placeholder="e.g., john.doe@example.com"
                                        value={addStaffNOK.EmailAddress}
                                        onChange={onEditStaffNOK}
                                        required
                                    />
                                </div>

                                {/* Address */}
                                <div className="col-12 mb-5">
                                    <label htmlFor="Address" className="required form-label fw-semibold">
                                        Contact Address
                                    </label>
                                    <textarea
                                        id="Address"
                                        className="form-control form-control-solid"
                                        rows="3"
                                        placeholder="Enter complete contact address"
                                        value={addStaffNOK.Address}
                                        onChange={onEditStaffNOK}
                                        required
                                    />
                                    <div className="form-text">Provide a detailed address for emergency contact</div>
                                </div>

                                {/* Action Buttons */}
                                <div className="col-12 d-flex justify-content-end gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        data-bs-dismiss="modal"
                                        id="closeNOKModal"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        <i className="bi bi-check-circle me-2"></i>
                                        Save Next of Kin
                                    </button>
                                </div>
                            </div>
                        </form>
                    </Modal>
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
