import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { encryptData, formatDate, formatDateAndTime, removeSpace, shortCode } from "../../../resources/constants";
import { connect } from "react-redux";
import { Button } from "@mui/material";

function StaffProfile(props)
{
  const token = props.loginData[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const { staffId } = useParams();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [data, setData] = useState({
    country: [],
    state: [],
    lga: [],
    designation: [],
    stafftype: [],
    linemanager: [],
    department: [],
    course: [],
    bank: [],
    lastId: {},
    title: [],
  });
  const [stateList, setStateList] = useState([]);
  const [lgaList, setLgaList] = useState([]);
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

  const [editStaffInfo, setEditStaffInfo] = useState({
    EntryID: "",
    FirstName: "",
    MiddleName: "",
    Surname: "",
    TitleID: "",
    Gender: "",
    DateOfBirth: "",
    MaritalStatus: "",
    NationalityID: "",
    StateID: "",
    LgaID: "",
    Religion: "",
    PhoneNumber: "",
    AltPhoneNumber: "",
    EmailAddress: "",
    OfficialEmailAddress: "",
    ContactAddress: "",
    StaffType: "",
    DesignationID: "",
    GrossPay: "",
    DepartmentCode: "",
    IsActive: "",
    IsAcademicStaff: "",
    DateOfFirstEmployment: "",
    DateOfCurrentEmployment: "",
    ContractStartDate: "",
    ContractEndDate: "",
    LineManagerID: "",
    CourseCode: "",
    Password: "",
    AddedBy: "",
    AddedDate: "",
    UpdatedBy: props.loginData[0].StaffID,
    UpdatedDate: Date.now(),
  });

  // STAFF BANK
  const [editStaffBank, setEditStaffBank] = useState({
    EntryID: "",
    StaffID: "",
    AccountNumber: "",
    AccountType: "",
    BankID: "",
    BVN: "",
    InsertedBy: "",
    InsertedDate: "",
  });
  const [toggleBank, setToggleBank] = useState(false);
  const staffBankForm = () =>
  {
    setEditStaffBank({
      EntryID: staffInformation.staff_bank[0]?.EntryID,
      StaffID: staffInformation.staff_bank[0]?.StaffID,
      AccountNumber: staffInformation.staff_bank[0]?.AccountNumber,
      AccountType: staffInformation.staff_bank[0]?.AccountType,
      BankID: staffInformation.staff_bank[0]?.BankID,
      BVN: staffInformation.staff_bank[0]?.BVN,
      InsertedBy: props.loginData[0]?.StaffID,
      InsertedDate: "",
    });
    setToggleBank(true);
  };

  // STAFF NOK
  const [editStaffNOK, setEditStaffNOK] = useState({
    EntryID: "",
    StaffID: "",
    FirstName: "",
    Surname: "",
    MiddleName: "",
    Relationship: "",
    PhoneNumber: "",
    Address: "",
    EmailAddress: "",
    InsertBy: "",
    InsertDate: "",
  });
  const [toggleNOK, setToggleNOK] = useState(false);
  const staffNOKForm = async (id) =>
  {
    await axios
      .get(`${serverLink}staff/hr/staff-management/get/staff/nok/${id}`, token)
      .then((response) =>
      {
        // setSelectedStaffData(response.data[0]);
        setEditStaffNOK({
          EntryID: response.data[0]?.EntryID,
          StaffID: response.data[0]?.StaffID,
          FirstName: response.data[0]?.FirstName,
          Surname: response.data[0]?.Surname,
          MiddleName: response.data[0]?.MiddleName,
          Relationship: response.data[0]?.Relationship,
          PhoneNumber: response.data[0]?.PhoneNumber,
          Address: response.data[0]?.Address,
          EmailAddress: response.data[0]?.EmailAddress,
          InsertBy: props.loginData[0]?.StaffID,
          InsertDate: "",
        });
        setToggleNOK(true);
      })
      .catch((error) =>
      {
        console.log("NETWORK ERROR", error);
      });
  };

  // STAFF QUALIFICATION
  const [editStaffQualification, setEditStaffQualification] = useState({
    EntryID: "",
    StaffID: "",
    QualificationID: "",
    Discipline: "",
    InstitutionName: "",
    Year: "",
  });
  const [toggleQualification, setToggleQualification] = useState(false);

  // STAFF PASSPORT
  const [uploadStaffPassport, setUploadStaffPassport] = useState({
    StaffID: staffId,
    file: "",
    update_passport: false,
  });

  const staffQualificationForm = async (id) =>
  {

    if (staffInformation.qualifications.length > 0 && staffInformation.qualifications[0]?.EntryID === id)
    {
      setEditStaffQualification({
        EntryID: staffInformation.qualifications[0]?.EntryID,
        StaffID: staffInformation.qualifications[0]?.StaffID,
        QualificationID: staffInformation.qualifications[0]?.QualificationID,
        Discipline: staffInformation.qualifications[0]?.Discipline,
        InstitutionName: staffInformation.qualifications[0]?.InstitutionName,
        Year: staffInformation.qualifications[0]?.Year,
      });
      setToggleQualification(true);
    }
  };

  // STAFF INFORMATION
  const [editStaffInformation, setEditStaffInformation] = useState({
    EntryID: "",
    FirstName: "",
    MiddleName: "",
    Surname: "",
    TitleID: "",
    Gender: "",
    DateOfBirth: "",
    MaritalStatus: "",
    NationalityID: "",
    StateID: "",
    LgaID: "",
    Religion: "",
    PhoneNumber: "",
    AltPhoneNumber: "",
    EmailAddress: "",
    OfficialEmailAddress: "",
    ContactAddress: "",
    StaffType: "",
    DesignationID: "",
    GrossPay: "",
    DepartmentCode: "",
    IsActive: "",
    IsAcademicStaff: "",
    DateOfFirstEmployment: "",
    DateOfCurrentEmployment: "",
    ContractStartDate: "",
    ContractEndDate: "",
    LineManagerID: "",
    CourseCode: "",
    Password: "",
    AddedBy: "",
    AddedDate: "",
    UpdatedBy: "",
    UpdatedDate: "",
    BankID: "",
    AccountNumber: "",
    BVN: "",
    AccountType: "",
    NFirstName: "",
    NSurname: "",
    NMiddleName: "",
    Relationship: "",
    NPhoneNumber: "",
    NEmailAddress: "",
    NContactAddress: "",
    Biography: "",
    file: "",
    Research: "",
    Facebook: "",
    Linkedin: "",
    Twitter: "",
    Scholar: "",
    Researchgate: "",
    Academia: "",
    Orcid: "",
  });
  const [toggleInformation, setToggleInformation] = useState(false);
  const staffInformationForm = () =>
  {

    setStateList(
      data.state.filter((item) => item.NationalityID === staffInformation.staff[0].NationalityID)
    );

    setLgaList(data.lga.filter((item) => item.StateID === staffInformation.staff[0].StateID));

    setStaff(staffInformation.staff);
    setToggleInformation(true);
  };

  const setStaff = (stf) =>
  {
    setEditStaffInformation({
      EntryID: stf[0].EntryID,
      FirstName: stf[0].FirstName,
      MiddleName: stf[0].MiddleName,
      Surname: stf[0].Surname,
      TitleID: stf[0].TitleID,
      Gender: stf[0].Gender,
      DateOfBirth: stf[0].DateOfBirth,
      MaritalStatus: stf[0].MaritalStatus,
      NationalityID: stf[0].NationalityID,
      StateID: stf[0].StateID,
      LgaID: stf[0].LgaID,
      Religion: stf[0].Religion,
      PhoneNumber: stf[0].PhoneNumber,
      AltPhoneNumber: stf[0].AltPhoneNumber,
      EmailAddress: stf[0].EmailAddress,
      OfficialEmailAddress: stf[0].OfficialEmailAddress,
      ContactAddress: stf[0].ContactAddress,
      StaffType: stf[0].StaffType,
      DesignationID: stf[0].DesignationID,
      GrossPay: stf[0].GrossPay,
      DepartmentCode: stf[0].DepartmentCode,
      IsActive: stf[0].IsActive,
      IsAcademicStaff: stf[0].IsAcademicStaff,
      DateOfFirstEmployment: stf[0].DateOfFirstEmployment,
      DateOfCurrentEmployment:
        stf[0].DateOfCurrentEmployment,
      ContractStartDate: stf[0].ContractStartDate,
      ContractEndDate: stf[0].ContractEndDate,
      LineManagerID: stf[0].LineManagerID,
      CourseCode: stf[0].CourseCode,
      Password: stf[0].Password,
      AddedBy: stf[0].AddedBy,
      AddedDate: stf[0].AddedDate,
      UpdatedBy: stf[0].UpdatedBy,
      UpdatedDate: stf[0].UpdatedDate,
      BankID: stf[0].BankID,
      AccountNumber: stf[0].AccountNumber,
      BVN: stf[0].BVN,
      AccountType: stf[0].AccountType,
      NFirstName: stf[0].NFirstName,
      NSurname: stf[0].NSurname,
      NMiddleName: stf[0].NMiddleName,
      Relationship: stf[0].Relationship,
      NPhoneNumber: stf[0].NPhoneNumber,
      NEmailAddress: stf[0].NEmailAddress,
      NContactAddress: stf[0].NContactAddress,
      Biography: stf[0].Biography,
      file: stf[0].file,
      Research: stf[0].Research,
      Facebook: stf[0].Facebook,
      Linkedin: stf[0].Linkedin,
      Twitter: stf[0].Twitter,
      Scholar: stf[0].Scholar,
      Researchgate: stf[0].Researchgate,
      Academia: stf[0].Academia,
      Orcid: stf[0].Orcid,
    });
  }

  const getStaff = async () =>
  {
    if (staffInformation !== undefined)
    {
      await axios
        .get(`${serverLink}staff/hr/staff-management/staff/${staffInformation.staff[0]?.StaffID}`, token)
        .then((result) =>
        {
          if (result.data.length > 0)
          {
            let rows = [];

            action: <button
              onClick={() =>
              {
                setEditStaffInfo({
                  EntryID: result[0]?.EntryID,
                  FirstName: result[0]?.FirstName,
                  MiddleName: result[0]?.MiddleName,
                  Surname: result[0]?.Surname,
                  TitleID: result[0]?.TitleID,
                  Gender: result[0]?.Gender,
                  DateOfBirth: formatDate(result[0]?.DateOfBirth).toString(),
                  MaritalStatus: result[0]?.MaritalStatus,
                  NationalityID: result[0]?.NationalityID,
                  StateID: result[0]?.StateID,
                  LgaID: result[0]?.LgaID,
                  Religion: result[0]?.Religion,
                  PhoneNumber: result[0]?.PhoneNumber,
                  AltPhoneNumber: result[0]?.AltPhoneNumber,
                  EmailAddress: result[0]?.EmailAddress,
                  OfficialEmailAddress: result[0]?.OfficialEmailAddress,
                  ContactAddress: result[0]?.ContactAddress,
                  StaffType: result[0]?.StaffType,
                  DesignationID: result[0]?.DesignationID,
                  GrossPay: result[0]?.GrossPay,
                  DepartmentCode: result[0]?.DepartmentCode,
                  IsActive: result[0]?.IsActive,
                  IsAcademicStaff: result[0]?.IsAcademicStaff,
                  DateOfFirstEmployment:
                    formatDateAndTime(result[0]?.DateOfFirstEmployment, "date") ??
                    "N/A",
                  DateOfCurrentEmployment:
                    formatDateAndTime(
                      result[0]?.DateOfCurrentEmployment,
                      "date"
                    ) ?? "N/A",
                  ContractStartDate:
                    formatDateAndTime(result[0]?.ContractStartDate, "date") ??
                    "N/A",
                  ContractEndDate:
                    formatDateAndTime(result[0]?.ContractEndDate, "date") ?? "N/A",
                  LineManagerID: result[0]?.LineManagerID,
                  CourseCode: result[0]?.CourseCode,
                  AddedBy: result[0]?.AddedBy,
                  UpdatedBy: result[0]?.UpdatedBy,
                  UpdatedDate: result[0]?.UpdatedDate,

                  action: "update",
                })
              }
              }
            >
              <i className="fa fa-pen" />
            </button>;
          }
        })
        .catch((err) =>
        {
          console.log("NETWORK ERROR");
        });

      setToggleInformation(false);
    }
  };

  useEffect(() =>
  {
    if (!staffInformation)
    {
      navigate("/");
    }

    getData()
    getQualification()
    getStaff()
    getStaffRelatedData()

  }, []);

  let staffDepartment = staffInformation.department.length > 0 && staffInformation.department.filter(
    (item) => item.DepartmentCode === staffInformation.staff[0].DepartmentCode
  );

  let staffCountry = staffInformation.country.length > 0 && staffInformation.country.filter(
    (item) => item.EntryID === staffInformation.staff[0].NationalityID
  );

  let staffState = staffInformation.state.length > 0 && staffInformation.state.filter(
    (item) => item.EntryID === staffInformation.staff[0].StateID
  );

  let staffLGA = staffInformation.lga.length > 0 && staffInformation.lga.filter(
    (item) => item.EntryID === staffInformation.staff[0].LgaID
  );

  const getStaffRelatedData = async () =>
  {
    await axios
      .get(`${serverLink}staff/hr/staff-management/staff/${staffId}`, token)
      .then((response) =>
      {
        setStaffInformation(response.data);
        setStaff(response.data.staff);
        setIsLoading(false);
      })
      .catch((error) =>
      {
        console.log("NETWORK ERROR", error);
      });
  };

  const getData = async () =>
  {
    await axios
      .get(`${serverLink}staff/hr/staff-management/staff/data`, token)
      .then((response) =>
      {
        setData(response.data);
      })
      .catch((error) =>
      {
        console.log("NETWORK ERROR", error);
      });
  };

  const onEditBank = (e) =>
  {
    const id = e.target.id;
    const value = e.target.value;

    setEditStaffBank({
      ...editStaffBank,
      [id]: value,
    });
  };

  const onEditInformation = (e) =>
  {
    const id = e.target.id;
    const value = e.target.value;

    if (id === "NationalityID")
    {
      setStateList(
        data.state.filter((item) => item.NationalityID === parseInt(value))
      );
      setLgaList([]);
    }

    if (id === "StateID")
    {
      setLgaList(data.lga.filter((item) => item.StateID === parseInt(value)));
    }

    setEditStaffInformation({
      ...editStaffInformation,
      [id]: value,
    });
  };

  const onSubmitStaffInformation = async (e) =>
  {
    e.preventDefault();

    for (let key in editStaffInformation)
    {
      if (
        editStaffInformation.hasOwnProperty(key) &&
        key !== "AddedDate" &&
        key !== "MiddleName" &&
        key !== "EntryID" &&
        key !== "AddedBy" &&
        key !== "UpdatedBy" &&
        key !== "UpdatedDate" &&
        key !== "AltPhoneNumber" &&
        key !== "OfficialEmailAddress" &&
        key !== "StaffID" &&
        key !== "IsActive" &&
        key !== "IsAcademicStaff" &&
        key !== "Password" &&
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
        key !== "BankID" &&
        key !== "AccountNumber" &&
        key !== "BVN" &&
        key !== "AccountType" &&
        key !== "NFirstName" &&
        key !== "NSurname" &&
        key !== "NMiddleName" &&
        key !== "NPhoneNumber" &&
        key !== "NEmailAddress" &&
        key !== "NContactAddress" &&
        key !== "NContactAddress" &&
        key !== "Relationship"
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
        `${serverLink}staff/hr/staff-management/update/staff/information/`,
        editStaffInformation, token
      )
      .then((result) =>
      {
        if (result.data.message === "success")
        {
          toast.success("Staff Updated Successfully");
          getStaff();
          getData();
          getStaff();
          window.location.reload();

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

  const onEditNOK = (e) =>
  {
    const id = e.target.id;
    const value = e.target.value;

    setEditStaffNOK({
      ...editStaffNOK,
      [id]: value,
    });
  };

  const onEditQualification = (e) =>
  {
    const id = e.target.id;
    const value = e.target.value;

    setEditStaffQualification({
      ...editStaffQualification,
      [id]: value,
    });
  };

  const closeHandler = () =>
  {
    setEditStaffBank({
      EntryID: "",
      StaffID: "",
      AccountNumber: "",
      AccountType: "",
      BankID: "",
      BVN: "",
      InsertedBy: "",
      InsertedDate: "",
    });
    setToggleBank(false);

    setEditStaffNOK({
      StaffID: "",
      FirstName: "",
      Surname: "",
      MiddleName: "",
      Relationship: "",
      PhoneNumber: "",
      Address: "",
      EmailAddress: "",
      InsertBy: "",
      InsertDate: "",
    });
    setToggleNOK(false);

    setEditStaffQualification({
      EntryID: "",
      StaffID: "",
      QualificationID: "",
      Discipline: "",
      InstitutionName: "",
      Year: "",
    });
    setToggleQualification(false);

    setEditStaffInformation({
      EntryID: "",
      FirstName: "",
      MiddleName: "",
      Surname: "",
      TitleID: "",
      Gender: "",
      DateOfBirth: "",
      MaritalStatus: "",
      NationalityID: "",
      StateID: "",
      LgaID: "",
      Religion: "",
      PhoneNumber: "",
      AltPhoneNumber: "",
      EmailAddress: "",
      OfficialEmailAddress: "",
      ContactAddress: "",
      StaffType: "",
      DesignationID: "",
      GrossPay: "",
      DepartmentCode: "",
      IsActive: "",
      IsAcademicStaff: "",
      DateOfFirstEmployment: "",
      DateOfCurrentEmployment: "",
      ContractStartDate: "",
      ContractEndDate: "",
      LineManagerID: "",
      CourseCode: "",
      Password: "",
      AddedBy: "",
      AddedDate: "",
      UpdatedBy: "",
      UpdatedDate: "",
      BankID: "",
      AccountNumber: "",
      BVN: "",
      AccountType: "",
      NFirstName: "",
      NSurname: "",
      NMiddleName: "",
      Relationship: "",
      NPhoneNumber: "",
      NEmailAddress: "",
      NContactAddress: "",
      Biography: "",
      file: "",
      Research: "",
      Facebook: "",
      Linkedin: "",
      Twitter: "",
      Scholar: "",
      Researchgate: "",
      Academia: "",
      Orcid: "",
    });
    setToggleInformation(false);
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

  const onSubmitStaffBank = async (e) =>
  {
    e.preventDefault();
    for (let key in editStaffBank)
    {
      if (
        editStaffBank.hasOwnProperty(key) &&
        key !== "InsertedBy" &&
        key !== "InsertedDate" &&
        key !== "EntryID"
      )
      {
        if (editStaffBank[key] === "")
        {
          await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
          return false;
        }
      }
    }
    toast.info(`Updating... Please wait!`);

    // return false;
    axios
      .patch(
        `${serverLink}staff/hr/staff-management/update/staff/bank/`,
        editStaffBank, token
      )
      .then((result) =>
      {
        if (result.data.message === "success")
        {
          toast.success("Bank Updated Successfully");
          getStaffRelatedData().then((r) => { });
          getData().then((r) => { });
          getStaff().then((r) => { });
          closeHandler();
        }
      });

    setEditStaffBank({
      ...editStaffBank,
      EntryID: "",
      StaffID: "",
      AccountNumber: "",
      AccountType: "",
      BankID: "",
      BVN: "",
      InsertedBy: "",
      InsertedDate: "",
    });
  };

  const onSubmitStaffNOK = async (e) =>
  {
    e.preventDefault();

    for (let key in editStaffNOK)
    {
      if (
        editStaffNOK.hasOwnProperty(key) &&
        key !== "EntryID" &&
        key !== "InsertBy" &&
        key !== "InsertDate"
      )
      {
        if (editStaffNOK[key] === "")
        {
          await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
          return false;
        }
      }
    }
    toast.info(`Updating... Please wait!`);
    axios
      .patch(
        `${serverLink}staff/hr/staff-management/update/staff/nok/`,
        editStaffNOK, token
      )
      .then((result) =>
      {
        if (result.data.message === "success")
        {
          toast.success("NOK Updated Successfully");
          getStaffRelatedData().then((r) => { });
          getData().then((r) => { });
          getStaff().then((r) => { });
          closeHandler();
        }
      });

    setEditStaffNOK({
      ...editStaffNOK,
      StaffID: "",
      FirstName: "",
      Surname: "",
      MiddleName: "",
      Relationship: "",
      PhoneNumber: "",
      Address: "",
      EmailAddress: "",
      InsertBy: "",
      InsertDate: "",
    });
    return false;
  };

  const onSubmitStaffQualification = async (e) =>
  {
    e.preventDefault();
    for (let key in editStaffQualification)
    {
      if (editStaffQualification.hasOwnProperty(key) && key !== "EntryID")
      {
        if (editStaffQualification[key] === "")
        {
          await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
          return false;
        }
      }
    }

    toast.info(`Updating... Please wait!`);
    axios
      .patch(
        `${serverLink}staff/hr/staff-management/update/staff/qualification/`,
        editStaffQualification, token
      )
      .then((result) =>
      {
        if (result.data.message === "success")
        {
          toast.success("Qualification Updated Successfully");
          getStaffRelatedData().then((r) => { });
          getData().then((r) => { });
          getStaff().then((r) => { });
          closeHandler();
        }
      });

    setEditStaffQualification({
      ...editStaffQualification,
      EntryID: "",
      StaffID: "",
      QualificationID: "",
      Discipline: "",
      InstitutionName: "",
      Year: "",
    });
  };

  const getQualification = async () =>
  {
    await axios
      .get(`${serverLink}staff/hr/staff-management/qualifications/`, token)
      .then((response) =>
      {
        setQualifications(response.data);
      })
      .catch((err) =>
      {
        console.log("NETWORK ERROR");
      });
  };

  const onEditPassport = (e) =>
  {
    if (e.target.id === "file")
    {
      const file = e.target.files[0];
      
      if (!file)
      {
        toast.error("Please select a file");
        return;
      }
      
      if (file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg")
      {

      } else
      {
        toast.error("Only .png, .jpg and .jpeg format allowed!");
        return;
      }
      
      if (file.size > 1000000)
      {
        toast.error("max file size is 1mb");
        return;
      }
      
      setUploadStaffPassport({
        ...uploadStaffPassport,
        file: file,
        update_passport: true
      });
      
      toast.success("File selected successfully");
      return;
    }
  };

  const handlePassportUpload = async () =>
  {
    if (uploadStaffPassport.update_passport === true)
    {
      toast.info("please wait...")
      let formData = new FormData();
      formData.append("file", uploadStaffPassport.file);
      formData.append("StaffID", staffId)
      await axios.post(`${serverLink}staff/hr/staff-management/upload/staff/passport`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((res) =>
      {
        if (res.data.type === "success")
        {
          toast.success(`Passport Updated Successfully`);
          getStaffRelatedData();
          setUploadStaffPassport({
            StaffID: staffId,
            file: "",
            update_passport: false,
          });
        } else
        {
          toast.error(`Something went wrong submitting your document!`);
        }
      }).catch((err) =>
      {
        console.error("Upload error:", err);
        toast.error(`Error uploading passport: ${err.message}`);
      })
    } else
    {
      toast.error("please select passport")
    }
  };

  return isLoading ? (
    <Loader />
  ) : (
    <>
      {staffInformation.staff.length > 0 ? (
        <>
          <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
              // title={"Nationality"}
              items={["Human Resources", "Staff", "Staff Profile"]}
            />
            <div className="d-flex flex-wrap flex-sm-nowrap mb-3">
              <div className="me-7 mb-4">
                <div className="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">

                  <img
                    src={
                      staffInformation.staff.length > 0
                        ? staffInformation.staff[0].Image.includes("simplefileupload.com") ? staffInformation.staff[0].Image :
                          staffInformation.staff[0].Image !== "" ?
                            `${serverLink}public/uploads/${shortCode}/hr/document/${staffInformation.staff[0].Image}` :
                            require('./avatar-male.jpg') : require('./avatar-male.jpg')
                    }
                    alt="Staff Picture"
                  />

                  {/*<img*/}
                  {/*  src={*/}
                  {/*    staffInformation.staff.length > 0*/}
                  {/*      ? `${serverLink}public/uploads/hr/document/${staffInformation.staff[0].Image}`*/}
                  {/*      : "https://via.placeholder.com/150"*/}
                  {/*  }*/}
                  {/*  alt="Staff Picture"*/}
                  {/*/>*/}
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
                        className="d-flex align-items-center text-gray-400 text-hover-primary me-5 mb-2"
                      >
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
                        {editStaffInformation.EmailAddress}
                      </Link>

                      <Link
                        to="#"
                        className="d-flex align-items-center text-gray-400 text-hover-primary mb-2 ms-10"
                      >
                        | {editStaffInformation.PhoneNumber}
                      </Link>

                      <Link
                        to="#"
                        className="d-flex align-items-center text-gray-400 text-hover-primary mb-2 ms-10"
                      >
                        | {editStaffInformation.ContactAddress}
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
                            {staffInformation.staff[0].StaffID}
                          </div>
                        </div>
                        <div className="fw-bold fs-6 text-gray-400">
                          Staff ID
                        </div>
                      </div>


                      <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                        <div className="d-flex align-items-center">
                          <div className="fs-2 fw-bolder counted">

                            {
                              props.DepartmentList?.filter(x => x.DepartmentCode === staffInformation.staff[0].DepartmentCode)[0]?.DepartmentName +
                              ` (${staffInformation.staff[0].DepartmentCode})`
                            }
                          </div>
                        </div>
                        <div className="fw-bold fs-6 text-gray-400">
                          Department
                        </div>
                      </div>

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
                      <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                        <div className="d-flex align-items-center">
                          <div className="fs-2 fw-bolder counted">
                            {staffInformation.staff[0].StaffType}
                          </div>
                        </div>
                        <div className="fw-bold fs-6 text-gray-400">
                          Staff Type
                        </div>
                      </div>

                      <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                        <div className="d-flex align-items-center">
                          <div className="fs-2 fw-bolder counted">
                            {staffInformation.staff[0].Religion}
                          </div>
                        </div>
                        <div className="fw-bold fs-6 text-gray-400">
                          Profile Religion
                        </div>
                      </div>

                    </div>
                  </div>
                </div>


              </div>
            </div>
            <div className="flex-column-fluid">
              <div className="card">
                <div className="card-body pt-0">
                  <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-8">
                    <li className="nav-item">
                      <Link
                        className="nav-link text-active-primary pb-4 active"
                        data-bs-toggle="tab"
                        to="#biography"
                      >
                        Biography
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link text-active-primary pb-4"
                        data-kt-countup-tabs="true"
                        data-bs-toggle="tab"
                        to="#education"
                      >
                        Education
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
                        to="#course"
                      >
                        Course(s) Taken
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link text-active-primary pb-4"
                        data-bs-toggle="tab"
                        to="#bank"
                      >
                        Bank Information
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link text-active-primary pb-4"
                        data-bs-toggle="tab"
                        to="#nok"
                      >
                        Next of Kin
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link text-active-primary pb-4"
                        data-bs-toggle="tab"
                        to="#passport"
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
                        Documents
                      </Link>
                    </li>
                  </ul>

                  <div className="tab-content w-100" id="myTabContent">
                    <div
                      className="tab-pane fade active show"
                      id="biography"
                      role="tabpanel"
                    >
                      <div
                        className="d-flex justify-content-end"
                        data-kt-customer-table-toolbar="base"
                      >
                        <button
                          type="button"
                          className="btn btn-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#kt_modal_general"
                          onClick={staffInformationForm}
                        >
                          Edit Record
                        </button>
                      </div>

                      {toggleInformation && (
                        <form onSubmit={onSubmitStaffInformation} >
                          <div className="row">
                            <div className="row">
                              <h5>Basic Information</h5>
                              <hr />

                              <div className="row">
                                <div className="col-lg-4 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="TitleID">Title</label>
                                    <select
                                      id="TitleID"
                                      className="form-control"
                                      required
                                      value={editStaffInformation.TitleID}
                                      onChange={onEditInformation}
                                    >
                                      <option value="">Select Option</option>
                                      {data.title ? (
                                        <>
                                          {data.title.map((item, index) =>
                                          {
                                            return (
                                              <option
                                                key={index}
                                                value={item.EntryID}
                                              >
                                                {item.TitleName}
                                              </option>
                                            );
                                          })}
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </select>
                                  </div>
                                </div>
                                <div className="col-lg-4 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="FirstName">First Name</label>
                                    <input
                                      type="text"
                                      id="FirstName"
                                      className="form-control"
                                      placeholder="First Name*"
                                      required
                                      value={editStaffInformation.FirstName}
                                      onChange={onEditInformation}
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-4 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="MiddleName">
                                      Middle Name
                                    </label>
                                    <input
                                      type="text"
                                      id="MiddleName"
                                      className="form-control"
                                      placeholder="Middle Name"
                                      value={editStaffInformation.MiddleName}
                                      onChange={onEditInformation}
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-3 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="Surname">Surname</label>
                                    <input
                                      type="text"
                                      id="Surname"
                                      className="form-control"
                                      placeholder="Surname"
                                      value={editStaffInformation.Surname}
                                      onChange={onEditInformation}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-3 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="PhoneNumber">
                                      Phone Number
                                    </label>
                                    <input
                                      type="tel"
                                      id="PhoneNumber"
                                      className="form-control"
                                      placeholder="Phone Number*"
                                      required
                                      value={editStaffInformation.PhoneNumber}
                                      onChange={onEditInformation}
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-3 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="EmailAddress">
                                      Email Address
                                    </label>
                                    <input
                                      type="email"
                                      id="EmailAddress"
                                      className="form-control"
                                      placeholder="Email Address"
                                      value={editStaffInformation.EmailAddress}
                                      onChange={onEditInformation}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-3 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="EmailAddress">
                                      Official Email Address
                                    </label>
                                    <input
                                      type="email"
                                      id="OfficialEmailAddress"
                                      className="form-control"
                                      placeholder="Email Address"
                                      value={editStaffInformation.OfficialEmailAddress}
                                      onChange={onEditInformation}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-4 col-md-6 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="DateOfBirth">
                                      Date of Birth
                                    </label>
                                    <input
                                      type="date"
                                      id="DateOfBirth"
                                      className="form-control"
                                      placeholder="Date of Birth*"
                                      required
                                      max={`${currentYear - 13}-01-01`}
                                      value={formatDate(
                                        editStaffInformation.DateOfBirth
                                      )}
                                      onChange={onEditInformation}
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-4 col-md-6 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="Religion">Religion</label>
                                    <select
                                      id="Religion"
                                      required
                                      className="form-control"
                                      value={editStaffInformation.Religion}
                                      onChange={onEditInformation}
                                    >
                                      <option value="">Select Option</option>
                                      <option value="Islam">Islam</option>
                                      <option value="Christianity">
                                        Christianity
                                      </option>
                                      <option value="Others">Others</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="col-lg-4 col-md-6 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="Gender">Gender</label>
                                    <select
                                      id="Gender"
                                      className="form-control"
                                      required
                                      value={editStaffInformation.Gender}
                                      onChange={onEditInformation}
                                    >
                                      <option value="">Select Option</option>
                                      <option value="Female">Female</option>
                                      <option value="Male">Male</option>
                                      <option value="N/A">N/A</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="col-lg-6 col-md-6 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="NationalityID">
                                      Nationality
                                    </label>
                                    <select
                                      id="NationalityID"
                                      className="form-control"
                                      required
                                      value={editStaffInformation.NationalityID}
                                      onChange={onEditInformation}
                                    >
                                      <option value="">Select Option</option>
                                      {data.country ? (
                                        <>
                                          {data.country.map((item, index) =>
                                          {
                                            return (
                                              <option
                                                key={index}
                                                value={item.EntryID}
                                              >
                                                {item.Country}
                                              </option>
                                            );
                                          })}
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </select>
                                  </div>
                                </div>
                                <div className="col-lg-6 col-md-6 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="StateID">
                                      State of Origin
                                    </label>
                                    <select
                                      id="StateID"
                                      className="form-control"
                                      required
                                      value={editStaffInformation.StateID}
                                      onChange={onEditInformation}
                                    >
                                      <option value="">Select Option</option>
                                      {stateList ? (
                                        <>
                                          {stateList.map((item, index) =>
                                          {
                                            return (
                                              <option
                                                key={index}
                                                value={item.EntryID}
                                              >
                                                {item.StateName}
                                              </option>
                                            );
                                          })}
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </select>
                                  </div>
                                </div>
                                <div className="col-lg-6 col-md-6 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="LgaID">
                                      Local Government
                                    </label>
                                    <select
                                      id="LgaID"
                                      className="form-control"
                                      required
                                      value={editStaffInformation.LgaID}
                                      onChange={onEditInformation}
                                    >
                                      <option value="">Select Option</option>
                                      {lgaList ? (
                                        <>
                                          {lgaList.map((item, index) =>
                                          {
                                            return (
                                              <option
                                                key={index}
                                                value={item.EntryID}
                                              >
                                                {item.LgaName}
                                              </option>
                                            );
                                          })}
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </select>
                                  </div>
                                </div>
                                <div className="col-lg-6 col-md-6 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="MaritalStatus">
                                      Marital Status
                                    </label>
                                    <select
                                      id="MaritalStatus"
                                      className="form-control"
                                      required
                                      value={editStaffInformation.MaritalStatus}
                                      onChange={onEditInformation}
                                    >
                                      <option value="">Select Option</option>
                                      <option value="Married">Married</option>
                                      <option value="Single">Single</option>
                                      <option value="N/A">N/A</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-12 col-md-12 pt-5">
                                <div className="form-group">
                                  <label htmlFor="ContactAddress">
                                    Contact Address
                                  </label>
                                  <textarea
                                    className="form-control"
                                    rows="3"
                                    id="ContactAddress"
                                    placeholder="Contact Address"
                                    required
                                    value={editStaffInformation.ContactAddress}
                                    onChange={onEditInformation}
                                  />
                                </div>
                              </div>
                              <h5 className="pt-10">Administrative Details</h5>
                              <hr />
                              <div className="row">
                                <div className="col-lg-4 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="StaffType">Staff Type</label>
                                    <select
                                      id="StaffType"
                                      className="form-control"
                                      required
                                      value={editStaffInformation.StaffType}
                                      onChange={onEditInformation}
                                    >
                                      <option value="">Select Option</option>
                                      {data.stafftype ? (
                                        <>
                                          {data.stafftype.map((item, index) =>
                                          {
                                            return (
                                              <option
                                                key={index}
                                                value={item.TypeName}
                                              >
                                                {item.TypeName}
                                              </option>
                                            );
                                          })}
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </select>
                                  </div>
                                </div>

                                <div className="col-lg-4 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="DesignationID">
                                      Designation
                                    </label>
                                    <select
                                      id="DesignationID"
                                      className="form-control"
                                      required
                                      value={editStaffInformation.DesignationID}
                                      onChange={onEditInformation}
                                    >
                                      <option value="">Select Option</option>
                                      {data.designation ? (
                                        <>
                                          {data.designation.map((item, index) =>
                                          {
                                            return (
                                              <option
                                                key={index}
                                                value={item.EntryID}
                                              >
                                                {item.DesignationName}
                                              </option>
                                            );
                                          })}
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </select>
                                  </div>
                                </div>

                                <div className="col-lg-4 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="GrossPay">Gross Pay</label>
                                    <input
                                      type="float"
                                      id="GrossPay"
                                      required
                                      className="form-control"
                                      placeholder="Gross Pay"
                                      value={editStaffInformation.GrossPay}
                                      onChange={onEditInformation}
                                    />
                                  </div>
                                </div>

                                <div className="col-lg-6 col-md-6 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="DateOfFirstEmployment">
                                      Date Of First Employment
                                    </label>
                                    <input
                                      type="date"
                                      id="DateOfFirstEmployment"
                                      className="form-control"
                                      placeholder="Date Of First Employment"
                                      required
                                      value={formatDate(
                                        editStaffInformation.DateOfFirstEmployment
                                      )}
                                      onChange={onEditInformation}
                                    />
                                  </div>
                                </div>

                                <div className="col-lg-6 col-md-6 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="DateOfCurrentEmployment">
                                      Date Of Current Employment
                                    </label>
                                    <input
                                      required
                                      type="date"
                                      id="DateOfCurrentEmployment"
                                      className="form-control"
                                      placeholder="Date Of Current Employment"
                                      value={formatDate(
                                        editStaffInformation.DateOfCurrentEmployment
                                      )}
                                      onChange={onEditInformation}
                                    />
                                  </div>
                                </div>

                                <div className="col-lg-6 col-md-6 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="ContractStartDate">
                                      Contract Start Date
                                    </label>
                                    <input
                                      required
                                      type="date"
                                      id="ContractStartDate"
                                      className="form-control"
                                      placeholder="Contract Start Date"
                                      value={formatDate(
                                        editStaffInformation.ContractStartDate
                                      )}
                                      onChange={onEditInformation}
                                    />
                                  </div>
                                </div>

                                <div className="col-lg-6 col-md-6 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="ContractEndDate">
                                      Contract End Date
                                    </label>
                                    <input
                                      type="date"
                                      id="ContractEndDate"
                                      className="form-control"
                                      placeholder="Contract End Date"
                                      // value={editStaffInformation.ContractEndDate}
                                      value={formatDate(
                                        editStaffInformation.ContractEndDate
                                      )}
                                      onChange={onEditInformation}
                                    />
                                  </div>
                                </div>

                                <div className="col-lg-4 col-md-4 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="LineManagerID">
                                      Line Manager
                                    </label>
                                    <select
                                      id="LineManagerID"
                                      className="form-control"
                                      required
                                      value={editStaffInformation.LineManagerID}
                                      onChange={onEditInformation}
                                    >
                                      <option value="">Select Option</option>
                                      {data.linemanager ? (
                                        <>
                                          {data.linemanager.map((item, index) =>
                                          {
                                            return (
                                              <option
                                                key={index}
                                                value={item.StaffID}
                                              >
                                                {item.StaffID}
                                              </option>
                                            );
                                          })}
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </select>
                                  </div>
                                </div>

                                <div className="col-lg-4 col-md-4 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="DepartmentCode">
                                      Department
                                    </label>
                                    <select
                                      id="DepartmentCode"
                                      className="form-control"
                                      required
                                      value={editStaffInformation.DepartmentCode}
                                      onChange={onEditInformation}
                                    >
                                      <option value="">Select Option</option>
                                      {data.department ? (
                                        <>
                                          {data.department.map((item, index) =>
                                          {
                                            return (
                                              <option
                                                key={index}
                                                value={item.DepartmentCode}
                                              >
                                                {item.DepartmentName}
                                              </option>
                                            );
                                          })}
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </select>
                                  </div>
                                </div>

                                <div className="col-lg-4 col-md-4 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="CourseCode">Course</label>
                                    <select
                                      id="CourseCode"
                                      className="form-control"
                                      required
                                      value={editStaffInformation.CourseCode}
                                      onChange={onEditInformation}
                                    >
                                      <option value="">Select Option</option>
                                      {data.course ? (
                                        <>
                                          {data.course.map((item, index) =>
                                          {
                                            return (
                                              <option
                                                key={index}
                                                value={item.CourseCode}
                                              >
                                                {item.CourseName}
                                              </option>
                                            );
                                          })}
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </select>
                                  </div>
                                </div>

                                <h5 className="pt-10">
                                  Social Networks (optional section)
                                </h5>
                                <hr />

                                <div className="col-lg-4 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="Facebook">Facebook</label>
                                    <input
                                      type="text"
                                      id="Facebook"
                                      className="form-control"
                                      placeholder="Facebook"
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
                                <div className="col-lg-12 col-md-12 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="Biography"> Biography</label>
                                    <textarea
                                      className="form-control"
                                      rows="7"
                                      id="Biography"
                                      placeholder="Biography"
                                      value={editStaffInformation.Biography}
                                      onChange={onEditInformation}
                                    />
                                  </div>
                                </div>
                                <div className="col-lg-12 col-md-12 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="Research">Research</label>
                                    <textarea
                                      className="form-control"
                                      rows="7"
                                      id="Research"
                                      placeholder="Research"
                                      value={editStaffInformation.Research}
                                      onChange={onEditInformation}
                                    />
                                  </div>
                                </div>

                                <h5 className="pt-10">Account Status</h5>
                                <hr />
                                <div className="col-lg-6 col-md-6 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="IsAcademicStaff">
                                      Is Academic Staff?
                                    </label>
                                    <select
                                      required
                                      id="IsAcademicStaff"
                                      className="form-control"
                                      value={editStaffInformation.IsAcademicStaff}
                                      onChange={onEditInformation}
                                    >
                                      <option value="">Select Option</option>
                                      <option value="1">Yes</option>
                                      <option value="0">No</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="col-lg-6 col-md-6 pt-5">
                                  <div className="form-group">
                                    <label htmlFor="IsActive">
                                      Is Staff Active?
                                    </label>
                                    <select
                                      required
                                      id="IsActive"
                                      className="form-control"
                                      value={editStaffInformation.IsActive}
                                      onChange={onEditInformation}
                                    >
                                      <option value="">Select Option</option>
                                      <option value="1">Yes</option>
                                      <option value="0">No</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                              <div className="pt-5">
                                <button
                                  className="btn btn-danger w-50 btn-sm"
                                  onClick={closeHandler}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="btn btn-primary w-50 btn-sm"
                                  type="submit"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
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
                                {staffDepartment[0]?.DepartmentName}
                              </span>
                            </div>
                          </div>
                          <div className="row mb-7">
                            <label className="col-lg-4 fw-bold text-muted">
                              Contact Phone
                              <i
                                className="fas fa-exclamation-circle ms-1 fs-7"
                                data-bs-toggle="tooltip"
                                title=""
                                data-bs-original-title="Phone number must be active"
                                aria-label="Phone number must be active"
                              ></i>
                            </label>
                            <div className="col-lg-8 d-flex align-items-center">
                              <span className="fw-bolder fs-6 text-gray-800 me-2">
                                {staffInformation.staff[0]?.PhoneNumber}
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
                                {staffCountry[0]?.Country}
                              </span>
                            </div>
                          </div>
                          <div className="row mb-7">
                            <label className="col-lg-4 fw-bold text-muted">
                              State
                            </label>
                            <div className="col-lg-8">
                              <span className="fw-bolder fs-6 text-gray-800">
                                {staffState[0]?.StateName}
                              </span>
                            </div>
                          </div>
                          <div className="row mb-10">
                            <label className="col-lg-4 fw-bold text-muted">
                              LGA
                            </label>
                            <div className="col-lg-8">
                              <span className="fw-bold fs-6 text-gray-800">
                                {staffLGA[0]?.LgaName}
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

                                  <div dangerouslySetInnerHTML={{ __html: staffInformation.staff[0]?.Biography }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="tab-pane fade"
                      id="education"
                      role="tabpanel"
                    >
                      {toggleQualification && (
                        <div className="row">
                          <div className="row">
                            <h3>Update Qualification</h3>
                          </div>
                          <div className="col-lg-6 pt-5">
                            <div className="form-group">
                              <label htmlFor="QualificationID">
                                Qualification Title
                              </label>
                              <select
                                id="QualificationID"
                                name="QualificationID"
                                value={editStaffQualification.QualificationID}
                                className="form-control"
                                onChange={onEditQualification}
                              >
                                <option value="">Select Option</option>
                                {qualifications.length > 0 ? (
                                  <>
                                    {qualifications.map((item, index) =>
                                    {
                                      return (
                                        <option
                                          key={index}
                                          value={item.EntryID}
                                        >
                                          {item.QualificationTitle}
                                        </option>
                                      );
                                    })}
                                  </>
                                ) : (
                                  ""
                                )}
                              </select>
                            </div>
                          </div>
                          <div className="col-lg-6 pt-5">
                            <div className="form-group">
                              <label htmlFor="Discipline">Discipline</label>
                              <input
                                type="text"
                                id="Discipline"
                                className="form-control"
                                placeholder="Discipline"
                                value={editStaffQualification.Discipline}
                                onChange={onEditQualification}
                              />
                            </div>
                          </div>
                          <div className="col-lg-6 pt-5">
                            <div className="form-group">
                              <label htmlFor="InstitutionName">
                                InstitutionName
                              </label>
                              <input
                                type="text"
                                id="InstitutionName"
                                className="form-control"
                                placeholder="InstitutionName"
                                value={editStaffQualification.InstitutionName}
                                onChange={onEditQualification}
                              />
                            </div>
                          </div>
                          <div className="col-lg-6 pt-5">
                            <div className="form-group">
                              <label htmlFor="InstitutionName">Year</label>
                              <input
                                type="number"
                                id="Year"
                                className="form-control"
                                placeholder="Year"
                                value={editStaffQualification.Year}
                                onChange={onEditQualification}
                              />
                            </div>
                          </div>

                          <div className="pt-5">
                            <button
                              className="btn btn-danger w-50 btn-sm"
                              onClick={closeHandler}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn btn-primary w-50 btn-sm"
                              onClick={onSubmitStaffQualification}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="table-responsive">
                        {staffInformation.qualifications.length > 0 ? (
                          <table className="table table-flush align-middle table-row-bordered table-row-solid gy-4 gs-9">
                            <thead className="border-gray-200 fs-5 fw-bold bg-lighten">
                              <tr>
                                <th className="min-w-100px px-0">Degree</th>
                                <th className="min-w-100px px-0">
                                  Institution
                                </th>
                                <th className="min-w-100px px-0">
                                  Graduation Year
                                </th>
                                <th className="min-w-100px px-0">Action</th>
                              </tr>
                            </thead>
                            <tbody className="fs-6 fw-bold text-gray-600">
                              <>
                                {staffInformation.qualifications.map(
                                  (b, index) => (
                                    <tr key={index}>
                                      <td className="ps-0">
                                        {staffInformation.degree.length > 0 &&
                                          staffInformation.degree
                                            .filter(
                                              (i) =>
                                                i.EntryID === b.QualificationID
                                            )
                                            .map(
                                              (r) => r.QualificationTitle
                                            )}{" "}
                                        {b.Discipline}
                                      </td>
                                      <td className="ps-0">
                                        {b.InstitutionName}
                                      </td>
                                      <td className="ps-0">{b.Year}</td>

                                      <td>
                                        <button
                                          onClick={() =>
                                            staffQualificationForm(b.EntryID)
                                          }
                                          className="btn btn-sm btn-primary"
                                        >
                                          <i className="fa fa-pen" />
                                        </button>
                                      </td>
                                    </tr>
                                  )
                                )}
                              </>
                            </tbody>
                          </table>
                        ) : (
                          <div className="alert alert-info">
                            There is no record added.{" "}
                            <Link to="/human-resources/add/staff/qualifications">
                              Click to Add Qualification
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="tab-pane fade"
                      id="publications"
                      role="tabpanel"
                    >
                      <div className="card">
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
                                  <a href={`/users/publication-manager?st=${encryptData(staffId)}`}>
                                    Click to Add Publication
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="tab-pane fade" id="course" role="tabpanel">
                      <div
                        className="d-flex justify-content-end"
                        data-kt-customer-table-toolbar="base"
                      ></div>
                      <div
                        id="kt_referrals_2"
                        className="card-body p-0 tab-pane fade active show"
                        role="tabpanel"
                      >
                        <div className="table-responsive">
                          {staffInformation.modules.length > 0 ? (
                            <table className="table table-flush align-middle table-row-bordered table-row-solid gy-4 gs-9">
                              <thead className="border-gray-200 fs-5 fw-bold bg-lighten">
                                <tr>
                                  <th className="min-w-50px ps-9">
                                    Module Code
                                  </th>
                                  <th className="min-w-100px px-0">
                                    Module Title
                                  </th>
                                  <th className="min-w-100px px-0">
                                    Credit Unit
                                  </th>
                                  <th className="min-w-100px px-0">
                                    Semester
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="fs-6 fw-bold text-gray-600">
                                {staffInformation.modules.map(
                                  (module, index) => (
                                    <tr key={index}>
                                      <td className="ps-9">
                                        {module.ModuleCode}
                                      </td>
                                      <td className="ps-0">
                                        {staffInformation.running_modules
                                          .length > 0 &&
                                          staffInformation.running_modules
                                            .filter((i) => i.ModuleCode === module.ModuleCode)[0]?.ModuleName
                                        }
                                      </td>
                                      <td className="ps-0">
                                        {staffInformation.running_modules
                                          .length > 0 &&
                                          staffInformation.running_modules
                                            .filter((i) => i.ModuleCode === module.ModuleCode)[0]?.CreditLoad
                                        }
                                      </td>

                                      <td className="ps-0">
                                        {module.SemesterCode}{" "}
                                      </td>

                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          ) : (
                            <div className="alert alert-info">
                              There is modules taken records
                              {/* <Link to="/human-resources/add/staff/modules">
                                Click to Add Modules
                              </Link> */}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="tab-pane fade" id="bank" role="tabpanel">
                      <div
                        className="d-flex justify-content-end"
                        data-kt-customer-table-toolbar="base"
                      ></div>
                      <div
                        id="kt_referrals_2"
                        className="card-body p-0 tab-pane fade active show"
                        role="tabpanel"
                      >
                        {toggleBank && (
                          <div className="row">
                            <div className="row">
                              <h3>Update Bank Details</h3>
                            </div>
                            <div className="col-lg-6 col-md-6 pt-5">
                              <div className="form-group">
                                <label htmlFor="AccountType">
                                  Account Type
                                </label>
                                <select
                                  id="AccountType"
                                  className="form-control"
                                  required
                                  value={editStaffBank.AccountType}
                                  onChange={onEditBank}
                                >
                                  <option value="">Select Option</option>
                                  <option value="Savings">Savings</option>
                                  <option value="Current">Current</option>
                                  <option value="Domiciliary">
                                    Domiciliary
                                  </option>
                                  <option value="N/A">N/A</option>
                                </select>
                              </div>
                            </div>
                            <div className="col-lg-6 col-md-6 pt-5">
                              <div className="form-group">
                                <label htmlFor="BVN">BVN</label>
                                <input
                                  type="tel"
                                  id="BVN"
                                  className="form-control"
                                  placeholder="BVN"
                                  required
                                  value={editStaffBank.BVN}
                                  onChange={onEditBank}
                                />
                              </div>
                            </div>
                            <div className="col-lg-6 col-md-6 pt-5">
                              <div className="form-group">
                                <label htmlFor="BankID">Bank Name</label>
                                <select
                                  id="BankID"
                                  className="form-control"
                                  required
                                  value={editStaffBank.BankID}
                                  onChange={onEditBank}
                                >
                                  <option value="">Select Option</option>
                                  {data.bank ? (
                                    <>
                                      {data.bank.map((item, index) =>
                                      {
                                        return (
                                          <option
                                            key={index}
                                            value={item.EntryID}
                                          >
                                            {item.BankName}
                                          </option>
                                        );
                                      })}
                                    </>
                                  ) : (
                                    ""
                                  )}
                                </select>
                              </div>
                            </div>
                            <div className="col-lg-6 col-md-6 pt-5">
                              <div className="form-group">
                                <label htmlFor="AccountNumber">
                                  Account Number
                                </label>
                                <input
                                  type="number"
                                  id="AccountNumber"
                                  className="form-control"
                                  placeholder="AccountNumber"
                                  value={editStaffBank.AccountNumber}
                                  onChange={onEditBank}
                                />
                              </div>
                            </div>
                            <div className="pt-5">
                              <button
                                className="btn btn-danger w-50 btn-sm"
                                onClick={closeHandler}
                              >
                                Cancel
                              </button>
                              <button
                                className="btn btn-primary w-50 btn-sm"
                                onClick={onSubmitStaffBank}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="table-responsive pt-5">
                          {staffInformation.staff_bank.length > 0 ? (
                            <table className="table table-flush align-middle table-row-bordered table-row-solid gy-4 gs-9">
                              <thead className="border-gray-200 fs-5 fw-bold bg-lighten">
                                <tr>
                                  <th className="min-w-50px ps-9">
                                    Account Number
                                  </th>
                                  <th className="min-w-100px px-0">
                                    Account Type
                                  </th>
                                  <th className="min-w-100px px-0">
                                    Bank Name
                                  </th>
                                  <th className="min-w-100px px-0">Action</th>
                                </tr>
                              </thead>
                              <tbody className="fs-6 fw-bold text-gray-600">
                                <>
                                  {staffInformation.staff_bank.map(
                                    (b, index) => (
                                      <tr key={index}>
                                        <td className="ps-9">
                                          {b.AccountNumber}
                                        </td>
                                        <td className="ps-0">
                                          {b.AccountType}
                                        </td>
                                        <td className="ps-0">
                                          {staffInformation.banks.length > 0 &&
                                            staffInformation.banks
                                              .filter(
                                                (i) => i.EntryID === b.BankID
                                              )
                                              .map((r) => r.BankName)}{" "}
                                        </td>
                                        <td>
                                          <button
                                            onClick={staffBankForm}
                                            className="btn btn-sm btn-primary"
                                          >
                                            <i className="fa fa-pen" />
                                          </button>
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </>
                              </tbody>
                            </table>
                          ) : (
                            <div className="alert alert-info">
                              There is no record added.{" "}
                              <Link to="/human-resources/add/staff/bank">
                                Click to Add Bank
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="tab-pane fade" id="nok" role="tabpanel">
                      <div
                        className="d-flex justify-content-end"
                        data-kt-customer-table-toolbar="base"
                      ></div>
                      <div
                        id="kt_referrals_2"
                        className="card-body p-0 tab-pane fade active show"
                        role="tabpanel"
                      >
                        {toggleNOK && (
                          <div className="row">
                            <div className="row">
                              <h3>Update NOK Details</h3>
                            </div>
                            <div className="col-lg-4 pt-5">
                              <div className="form-group">
                                <label htmlFor="FirstName">First Name</label>
                                <input
                                  type="text"
                                  id="FirstName"
                                  className="form-control"
                                  placeholder="First Name"
                                  value={editStaffNOK.FirstName}
                                  onChange={onEditNOK}
                                />
                              </div>
                            </div>
                            <div className="col-lg-4 pt-5">
                              <div className="form-group">
                                <label htmlFor="Surname">Surname</label>
                                <input
                                  type="text"
                                  id="Surname"
                                  className="form-control"
                                  placeholder="Surname"
                                  value={editStaffNOK.Surname}
                                  onChange={onEditNOK}
                                />
                              </div>
                            </div>
                            <div className="col-lg-4 pt-5">
                              <div className="form-group">
                                <label htmlFor="MiddleName">Middle Name</label>
                                <input
                                  type="text"
                                  id="MiddleName"
                                  className="form-control"
                                  placeholder="Middle Name"
                                  value={editStaffNOK.MiddleName}
                                  onChange={onEditNOK}
                                />
                              </div>
                            </div>
                            <div className="col-lg-4 pt-5">
                              <div className="form-group">
                                <label htmlFor="Relationship">
                                  Relationship
                                </label>
                                <select
                                  id="Relationship"
                                  className="form-control"
                                  required
                                  value={editStaffNOK.Relationship}
                                  onChange={onEditNOK}
                                >
                                  <option value="">Select Option</option>
                                  <option value="Wife">Wife</option>
                                  <option value="Husband">Husband</option>
                                  <option value="Mother">Mother</option>
                                  <option value="Sister">Sister</option>
                                  <option value="Son">Son</option>
                                  <option value="Brother">Brother</option>
                                  <option value="Father">Father</option>
                                  <option value="Daughter">Daughter</option>
                                  <option value="Uncle">Uncle</option>
                                  <option value="Aunty">Aunty</option>
                                  <option value="N/A">N/A</option>
                                </select>
                              </div>
                            </div>
                            <div className="col-lg-4 pt-5">
                              <div className="form-group">
                                <label htmlFor="PhoneNumber">PhoneNumber</label>
                                <input
                                  type="number"
                                  id="PhoneNumber"
                                  className="form-control"
                                  placeholder="Phone Number"
                                  value={editStaffNOK.PhoneNumber}
                                  onChange={onEditNOK}
                                />
                              </div>
                            </div>
                            <div className="col-lg-4 pt-5">
                              <div className="form-group">
                                <label htmlFor="EmailAddress">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  id="EmailAddress"
                                  className="form-control"
                                  placeholder="Email Address"
                                  value={editStaffNOK.EmailAddress}
                                  onChange={onEditNOK}
                                />
                              </div>
                            </div>
                            <div className="col-lg-12 col-md-12 pt-5">
                              <div className="form-group">
                                <label htmlFor="Address">Contact Address</label>
                                <textarea
                                  className="form-control"
                                  rows="3"
                                  id="Address"
                                  placeholder="Contact Address"
                                  required
                                  value={editStaffNOK.Address}
                                  onChange={onEditNOK}
                                />
                              </div>
                            </div>

                            <div className="pt-5">
                              <button
                                className="btn btn-danger w-50 btn-sm"
                                onClick={closeHandler}
                              >
                                Cancel
                              </button>
                              <button
                                className="btn btn-primary w-50 btn-sm"
                                onClick={onSubmitStaffNOK}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="table-responsive">
                          {staffInformation.nok.length > 0 ? (
                            <table className="table table-flush align-middle table-row-bordered table-row-solid gy-4 gs-9">
                              <thead className="border-gray-200 fs-5 fw-bold bg-lighten">
                                <tr>
                                  <th className="min-w-50px ps-9">
                                    First Name
                                  </th>
                                  <th className="min-w-100px px-0">Surname</th>
                                  <th className="min-w-100px px-0">
                                    Middle Name
                                  </th>
                                  <th className="min-w-100px px-0">
                                    Relationship
                                  </th>
                                  <th className="min-w-100px px-0">
                                    Phone Number
                                  </th>
                                  <th className="min-w-100px px-0">Address</th>
                                  <th className="min-w-100px px-0">Action</th>
                                </tr>
                              </thead>
                              <tbody className="fs-6 fw-bold text-gray-600">
                                <>
                                  {staffInformation.nok.map((b, index) => (
                                    <tr key={index}>
                                      <td className="ps-9">{b.FirstName}</td>
                                      <td className="ps-9">{b.Surname}</td>
                                      <td className="ps-0">{b.MiddleName}</td>
                                      <td className="ps-0">{b.Relationship}</td>
                                      <td className="ps-0">{b.PhoneNumber}</td>
                                      <td className="ps-0">{b.Address}</td>

                                      <td>
                                        <button
                                          onClick={() =>
                                            staffNOKForm(b.EntryID)
                                          }
                                          className="btn btn-sm btn-primary"
                                        >
                                          <i className="fa fa-pen" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </>
                              </tbody>
                            </table>
                          ) : (
                            <div className="alert alert-info">
                              There is no record added.{" "}
                              <Link to="/human-resources/add/staff/nok">
                                Click to Add NOK
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="tab-pane fade" id="passport" role="tabpanel">
                      <div className="row">
                        <div className="col-lg-4 col-md-4">
                          <div className="form-group">
                            <label htmlFor="Designation">Upload Passport</label>
                            <input
                              type="file"
                              accept=".pdf, .jpg, .png, .jpeg"
                              id="file"
                              name="file"
                              className="form-control"
                              placeholder="file"
                              onChange={onEditPassport}
                            />
                            <span className="badge bg-primary">
                              Only .jpg, .png, .jpeg are allowed, Max of 1MB
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

                    <div
                      className="tab-pane fade"
                      id="documents"
                      role="tabpanel"
                    >
                      <div
                        className="d-flex justify-content-end"
                        data-kt-customer-table-toolbar="base"
                      ></div>
                      <div
                        id="kt_referrals_2"
                        className="card-body p-0 tab-pane fade active show"
                        role="tabpanel"
                      >
                        <div className="table-responsive">
                          {staffInformation.documents.length > 0 ? (
                            <table className="table table-flush align-middle table-row-bordered table-row-solid gy-4 gs-9">
                              <thead className="border-gray-200 fs-5 fw-bold bg-lighten">
                                <tr>
                                  <th className="min-w-100px px-9">
                                    Document Type
                                  </th>
                                  <th className="min-w-100px px-0">File</th>
                                  <th className="min-w-100px px-0">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {staffInformation.documents.map(
                                  (item, index) => (
                                    <tr key={index}>
                                      <td>{item.DocumentType}</td>
                                      <td>

                                        {item.Document.includes("simplefileupload.com") ?
                                          <a
                                            target="_blank"
                                            referrerPolicy="no-referrer"
                                            href={item.Document}
                                          ><i className="fa fa-file-pdf w-3px" />
                                          </a> : <a
                                            target="_blank"
                                            referrerPolicy="no-referrer"
                                            href={`${serverLink}public/uploads/${shortCode}/hr/document/${item.Document}`}
                                          ><i className="fa fa-file-pdf w-3px" />
                                          </a>
                                        }

                                      </td>
                                      <td>
                                        <button
                                          className="btn btn-sm btn-danger"
                                          variant="danger"
                                          onClick={() =>
                                            deleteItem(
                                              item.EntryID,
                                              item.Document
                                            )
                                          }
                                        >
                                          <i
                                            className="fa fa-trash"
                                            style={{ fontsize: "30px" }}
                                          ></i>
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
                              <Link to="/human-resources/upload/staff/document">
                                Click to Add Document
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
    DepartmentList: state.DepartmentList,
  };
};

export default connect(mapStateToProps, null)(StaffProfile);
