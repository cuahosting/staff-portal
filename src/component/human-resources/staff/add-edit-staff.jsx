import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import axios from "axios";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { showAlert, showConfirm } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { serverLink } from "../../../resources/url";
import { formatDate, formatDateAndTime, encryptData, projectDomain, removeSpace } from "../../../resources/constants";
import { Link } from "react-router-dom";
import SearchSelect from "../../common/select/SearchSelect";
// import { projectName, simpleFileUploadAPIKey } from "../../../resources/url";
// import SimpleFileUpload from "react-simple-file-upload";


function AddEditStaff(props) {
  const token = props.loginData[0].token;
  const isAdmin = String(props.loginData?.[0]?.IsAdmin || "0") === "1";

  const [isLoading, setIsLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [editSettings, setEditSettings] = useState({
    EntryID: "",
    StaffID: "",
    IsDeductions: "0",
    IsPension: "0",
    IsWebsite: "0",
  });

  const [datatable, setDatatable] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Action",
        field: "action",
      },
      {
        label: "StaffID",
        field: "StaffID",
      },
      {
        label: "First Name",
        field: "FirstName",
      },
      {
        label: "Middle Name",
        field: "MiddleName",
      },
      {
        label: "Surname",
        field: "Surname",
      },
      {
        label: "Gender",
        field: "Gender",
      },
      {
        label: "Phone Number",
        field: "PhoneNumber",
      },
      {
        label: "Official EmailAddress",
        field: "OfficialEmailAddress",
      },
    ],
    rows: [],
  });

  const [lastId, setLastId] = useState("");
  const password = encryptData("123456789");
  const [insertUser, setInsertUser] = useState("");

  const [createStaff, setCreateStaff] = useState({
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
    IsDeduction: "",
    IsPension: "",
    IsWebsite: "",
    DepartmentCode: "",
    IsActive: "",
    IsAcademicStaff: "",
    DateOfFirstEmployment: "",
    DateOfCurrentEmployment: "",
    ContractStartDate: "",
    ContractEndDate: "",
    LineManagerID: "",
    CourseCode: "",
    Password: encryptData("123456789"),
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
    file2: "",
    update_passport: ""
  });
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
  const [nationalities, setNaytionalities] = useState([])
  const [stateList, setStateList] = useState([]);
  const [lgaList, setLgaList] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Personal Details", fields: ["TitleID", "StaffID", "DateOfBirth", "FirstName", "MiddleName", "Surname", "Religion", "Gender", "MaritalStatus", "IsAcademicStaff", "IsActive"] },
    { title: "Contact & Origin", fields: ["NationalityID", "StateID", "LgaID", "PhoneNumber", "EmailAddress", "ContactAddress"] },
    { title: "Administrative Details", fields: ["StaffType", "DesignationID", "DepartmentCode", "CourseCode", "LineManagerID", "DateOfFirstEmployment", "DateOfCurrentEmployment", "ContractStartDate", "ContractEndDate"] },
    { title: "Salary Information", fields: ["GrossPay"] },
    { title: "Social Networks", fields: [] }
  ];

  const validateStep = (stepIndex) => {
    const fields = steps[stepIndex].fields;
    for (const field of fields) {
      if (!createStaff[field] || createStaff[field] === "") {
        showAlert("EMPTY FIELD", `Please enter ${field.replace(/([A-Z])/g, ' $1').trim()}`, "error");
        return false;
      }
    }
    return true;
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = (e) => {
    e.preventDefault();
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const getData = async () => {
    try {
      const { success, data } = await api.get("staff/hr/staff-management/staff/data");
      if (success) {
        setData(data);
        let nat = [];
        data.country.length > 0 &&
          data.country.map((row) => {
            nat.push({ value: row.EntryID, label: row.Country })
          })
        setNaytionalities(nat)
      }
    } catch (error) {
      console.log("NETWORK ERROR", error);
    }
  };

  const handleDisable = async (id) => {
    try {
      const payload = {
        EntryID: id,
        UpdatedBy: props.loginData[0].StaffID,
      };
      const { success, data } = await api.patch("staff/hr/staff-management/disable/staff/", payload);
      if (success) {
        toast.success("Staff Disabed Successfully");
        getStaff();
      } else {
        toast.error("An error occurred while disabling staff");
      }
    } catch (error) {
      console.error("Error disabling staff:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const getStaff = async () => {
    try {
      const { success, data } = await api.get("staff/hr/staff-management/staff/list");
      if (success && data.length > 0) {
        let rows = [];
        data.map((staff, index) => {
          rows.push({
            sn: index + 1,
            EntryID: staff.EntryID,
            StaffID: staff.StaffID,
            FirstName: staff.FirstName,
            MiddleName: staff.MiddleName,
            Surname: staff.Surname,
            TitleID: staff.TitleID,
            Gender: staff.Gender,
            DateOfBirth:
              formatDateAndTime(staff.DateOfBirth, "date") ?? "N/A",
            MaritalStatus: staff.MaritalStatus,
            NationalityID: staff.NationalityID,
            StateID: staff.StateID,
            LgaID: staff.LgaID,
            Religion: staff.Religion,
            PhoneNumber: staff.PhoneNumber,
            AltPhoneNumber: staff.AltPhoneNumber,
            EmailAddress: staff.EmailAddress,
            OfficialEmailAddress: staff.OfficialEmailAddress,
            ContactAddress: staff.ContactAddress,
            StaffType: staff.StaffType,
            DesignationID: staff.DesignationID,
            GrossPay: staff.GrossPay,
            DepartmentCode: staff.DepartmentCode,
            IsActive: staff.IsActive,
            IsAcademicStaff: staff.IsAcademicStaff,
            DateOfFirstEmployment:
              formatDateAndTime(staff.DateOfFirstEmployment, "date") ?? "N/A",
            DateOfCurrentEmployment:
              formatDateAndTime(staff.DateOfCurrentEmployment, "date") ??
              "N/A",
            ContractStartDate:
              formatDateAndTime(staff.ContractStartDate, "date") ?? "N/A",
            ContractEndDate:
              formatDateAndTime(staff.ContractEndDate, "date") ?? "N/A",
            LineManagerID: staff.LineManagerID,
            CourseCode: staff.CourseCode,
            AddedBy: staff.AddedBy,
            UpdatedBy: staff.UpdatedBy,
            UpdatedDate: staff.UpdatedDate,
            BankID: staff.BankID,
            AccountNumber: staff.AccountNumber,
            BVN: staff.BVN,
            AccountType: staff.AccountType,
            NFirstName: staff.NFirstName,
            NSurname: staff.NSurname,
            NMiddleName: staff.NMiddleName,
            Relationship: staff.Relationship,
            NPhoneNumber: staff.NPhoneNumber,
            NEmailAddress: staff.NEmailAddress,
            NContactAddress: staff.NContactAddress,
            Biography: staff.Biography,
            file: staff.file,
            Research: staff.Research,
            Facebook: staff.Facebook,
            Linkedin: staff.Linkedin,
            Twitter: staff.Twitter,
            Scholar: staff.Scholar,
            Researchgate: staff.Researchgate,
            Academia: staff.Academia,
            Orcid: staff.Orcid,
            action: (
              <div className="d-flex gap-1">
                <button
                  className="btn btn-sm btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_general"
                  onClick={() => {
                    const nat = nationalities.filter(x => x.value === staff.NationalityID)[0];
                    setCreateStaff({
                      EntryID: staff.EntryID,
                      StaffID: staff.StaffID,
                      FirstName: staff.FirstName,
                      MiddleName: staff.MiddleName,
                      Surname: staff.Surname,
                      TitleID: staff.TitleID,
                      Gender: staff.Gender,
                      DateOfBirth:
                        formatDateAndTime(staff.DateOfBirth, "date") ?? "N/A",
                      MaritalStatus: staff.MaritalStatus,
                      NationalityID: { value: nat?.EntryID, label: nat?.Country },
                      StateID: staff.StateID,
                      LgaID: staff.LgaID,
                      Religion: staff.Religion,
                      PhoneNumber: staff.PhoneNumber,
                      AltPhoneNumber: staff.AltPhoneNumber,
                      EmailAddress: staff.EmailAddress,
                      OfficialEmailAddress: staff.OfficialEmailAddress,
                      ContactAddress: staff.ContactAddress,
                      StaffType: staff.StaffType,
                      DesignationID: staff.DesignationID,
                      GrossPay: staff.GrossPay,
                      DepartmentCode: staff.DepartmentCode,
                      IsActive: staff.IsActive,
                      IsAcademicStaff: staff.IsAcademicStaff,
                      DateOfFirstEmployment:
                        formatDateAndTime(staff.DateOfFirstEmployment, "date") ?? "N/A",
                      DateOfCurrentEmployment:
                        formatDateAndTime(staff.DateOfCurrentEmployment, "date") ?? "N/A",
                      ContractStartDate:
                        formatDateAndTime(staff.ContractStartDate, "date") ?? "N/A",
                      ContractEndDate:
                        formatDateAndTime(staff.ContractEndDate, "date") ?? "N/A",
                      LineManagerID: staff.LineManagerID,
                      CourseCode: staff.CourseCode,
                      AddedBy: staff.AddedBy,
                      UpdatedBy: props.loginData[0].StaffID,
                      UpdatedDate: props.loginData[0].StaffID,
                      BankID: staff.BankID,
                      AccountNumber: staff.AccountNumber,
                      BVN: staff.BVN,
                      AccountType: staff.AccountType,
                      NFirstName: staff.NFirstName,
                      NSurname: staff.NSurname,
                      NMiddleName: staff.NMiddleName,
                      Relationship: staff.Relationship,
                      NPhoneNumber: staff.NPhoneNumber,
                      NEmailAddress: staff.NEmailAddress,
                      NContactAddress: staff.NContactAddress,
                      Biography: staff.Biography,
                      file: staff.file,
                      Research: staff.Research,
                      Facebook: staff.Facebook,
                      Linkedin: staff.Linkedin,
                      Twitter: staff.Twitter,
                      Scholar: staff.Scholar,
                      Researchgate: staff.Researchgate,
                      Academia: staff.Academia,
                      Orcid: staff.Orcid,
                      update_passport: false,
                      file2: staff.Image,
                      action: "update",
                    });
                  }}
                  title="Edit Staff"
                >
                  <i className="fa fa-pen" />
                </button>
                <button
                  className="btn btn-sm btn-warning"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_settings"
                  onClick={() => {
                    setEditSettings({
                      EntryID: staff.EntryID,
                      StaffID: staff.StaffID,
                      IsDeductions: staff.IsDeductions || "0",
                      IsPension: staff.IsPension || "0",
                      IsWebsite: staff.IsWebsite || "0",
                    });
                  }}
                  title="Edit Settings"
                >
                  <i className="fa fa-cog" />
                </button>
                <Link
                  to={`/human-resources/staff/profile/${staff.StaffID}`.toLowerCase()}
                >
                  <button
                    className="btn btn-sm btn-info"
                    title="View Profile"
                  >
                    <i className="fa fa-eye" />
                  </button>
                </Link>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    showConfirm(
                      "Disable Staff",
                      "Are you sure you want to disable this staff member?",
                      "warning",
                      null,
                      ["No", "Yes"]
                    ).then((res) => {
                      if (res) {
                        handleDisable(staff.EntryID);
                      }
                    });
                  }}
                  title="Disable Staff"
                >
                  <i className="fa fa-ban" />
                </button>
              </div>
            ),
          });
        });

        setDatatable({
          ...datatable,
          columns: datatable.columns,
          rows: rows,
        });
      }
      setIsLoading(false);
    } catch (err) {
      console.log("NETWORK ERROR", err);
    }
  };
  const handleNationalityChange = (e) => {
    console.log(e)
    if (e.id === "NationalityID") {
      setStateList(
        data.state.filter((item) => item.NationalityID === parseInt(e.value))
      );
      setLgaList([]);
    }

    if (e.id === "StateID") {
      setLgaList(data.lga.filter((item) => item.StateID === parseInt(e.value)));
    }

    setCreateStaff({
      ...createStaff,
      NationalityID: e.value,
      NationalityID2: e
    })
  }

  const onEdit = (e) => {
    const id = e.target.id;
    const value = id === "file" ? e.target.files[0] : e.target.value;
    if (e.target.id === "file") {
      const file = e.target.files[0]
      if (file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg") {

      } else {
        toast.error("Only .png, .jpg and .jpeg format allowed!");
        return;
      }
      if (file.size > 1000000) {
        toast.error("max file size is 1mb")
        return;

      }
      setCreateStaff({
        ...createStaff,
        [id]: value,
        update_passport: true
      });
      return;
    }

    if (id === "NationalityID") {
      setStateList(
        data.state.filter((item) => item.NationalityID === parseInt(value))
      );
      setLgaList([]);
    }

    if (id === "StateID") {
      setLgaList(data.lga.filter((item) => item.StateID === parseInt(value)));
    }

    setCreateStaff({
      ...createStaff,
      [id]: value,
    });

    getLastStaffID().then(r => { });
  };

  /**
   * Builds a FormData object from staff data for multipart submission
   * @param {Object} staffData - The staff data object
   * @param {File|null} file - The passport file (if any)
   * @returns {FormData} - The constructed FormData object
   */
  const buildFormData = (staffData, file = null) => {
    const formData = new FormData();

    // List of all text fields to append
    const textFields = [
      'EntryID', 'StaffID', 'FirstName', 'MiddleName', 'Surname', 'TitleID',
      'Gender', 'DateOfBirth', 'MaritalStatus', 'NationalityID', 'StateID',
      'LgaID', 'Religion', 'PhoneNumber', 'AltPhoneNumber', 'EmailAddress',
      'OfficialEmailAddress', 'ContactAddress', 'StaffType', 'DesignationID',
      'GrossPay', 'DepartmentCode', 'IsActive', 'IsAcademicStaff',
      'DateOfFirstEmployment', 'DateOfCurrentEmployment', 'ContractStartDate',
      'ContractEndDate', 'LineManagerID', 'CourseCode', 'Password', 'AddedBy',
      'UpdatedBy', 'Biography', 'Research', 'Facebook', 'Linkedin', 'Twitter',
      'Scholar', 'Researchgate', 'Academia', 'Orcid', 'IsDeduction', 'IsPension', 'IsWebsite'
    ];

    textFields.forEach(field => {
      const value = staffData[field];
      if (value !== undefined && value !== null && value !== '') {
        formData.append(field, value);
      }
    });

    // Append file only if it exists
    if (file) {
      formData.append('passport', file);
    }

    return formData;
  };

  const getInsertedUserID = async () => {
    setInsertUser(
      props.loginData[0].StaffID.length > 0
        ? props.loginData[0].StaffID
        : "System Generated"
    );
  };

  const getLastStaffID = async () => {
    try {
      const { success, data } = await api.get("staff/hr/staff-management/staff/data");
      if (success) {
        setLastId(data.lastId[0].StaffID);
        const indexOfId = data.lastId[0].StaffID.split("E")[1];
        const lastIndex = Number(indexOfId) + 1;

        const padStaffID = (lastIndex, places) =>
          String(lastIndex).padStart(places, "0");
        // setNewId(`E${padStaffID(lastIndex, 4)}`);
      }
    } catch (error) {
      console.log("NETWORK ERROR", error);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Non-admins can only edit social info on their own profile
    if (!isAdmin) {
      if (!createStaff.EntryID || createStaff.StaffID !== props.loginData[0].StaffID) {
        showAlert("UNAUTHORIZED", "You can only update your social profile.", "error");
        return;
      }

      toast.info("Updating profile. Please wait..");
      const socialPayload = {
        EntryID: createStaff.EntryID,
        Biography: createStaff.Biography,
        Research: createStaff.Research,
        Facebook: createStaff.Facebook,
        Linkedin: createStaff.Linkedin,
        Twitter: createStaff.Twitter,
        Scholar: createStaff.Scholar,
        Researchgate: createStaff.Researchgate,
        Academia: createStaff.Academia,
        Orcid: createStaff.Orcid,
        EmailAddress: createStaff.EmailAddress,
        UpdatedBy: props.loginData[0].StaffID,
      };

      try {
        const { success, data: result } = await api.patch("staff/hr/staff-management/update/staff/profile/", socialPayload);
        if (success && result.message === "success") {
          toast.success("Profile updated");
          getStaff();
        } else {
          showAlert("ERROR", "Unable to update profile. Please try again!", "error");
        }
      } catch {
        showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
      }

      return;
    }
    for (let key in createStaff) {
      if (
        createStaff.hasOwnProperty(key) &&
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
        key !== "Relationship" &&
        key !== "LineManagerID" &&
        key !== "StateID" &&
        key !== "LgaID" &&
        key !== "file2" &&
        key !== "file" &&
        key !== "file" &&
        key !== "update_passport" &&
        key !== "IsDeduction" &&
        key !== "IsPension" &&
        key !== "IsWebsite"
      ) {
        if (createStaff[key] === "") {
          await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
          return false;
        }
      }
    }

    // if (createStaff.file.size / 1024 > 2048) {
    //   toast.error(`File Size Can't be more than 2MB`);
    //   return false;
    // }


    if (createStaff.EntryID === "") {
      toast.info("Adding new staff. Please wait..");


      if (createStaff.EmailAddress !== "") {
        const sendData = {
          EntryID: createStaff.EntryID,
          StaffID: createStaff.StaffID,
          FirstName: createStaff.FirstName,
          MiddleName: createStaff.MiddleName,
          Surname: createStaff.Surname,
          TitleID: createStaff.TitleID,
          Gender: createStaff.Gender,
          DateOfBirth: createStaff.DateOfBirth,
          MaritalStatus: createStaff.MaritalStatus,
          NationalityID: createStaff.NationalityID,
          StateID: createStaff.StateID,
          LgaID: createStaff.LgaID,
          Religion: createStaff.Religion,
          PhoneNumber: createStaff.PhoneNumber,
          AltPhoneNumber: createStaff.AltPhoneNumber,
          EmailAddress: createStaff.EmailAddress,
          OfficialEmailAddress: `${removeSpace(createStaff.FirstName.toString().trim())}.${removeSpace(createStaff.Surname.toString().trim())}${projectDomain}`,
          ContactAddress: createStaff.ContactAddress,
          StaffType: createStaff.StaffType,
          DesignationID: createStaff.DesignationID,
          GrossPay: createStaff.GrossPay,
          DepartmentCode: createStaff.DepartmentCode,
          IsActive: createStaff.IsActive,
          IsAcademicStaff: createStaff.IsAcademicStaff,
          DateOfFirstEmployment: createStaff.DateOfFirstEmployment,
          DateOfCurrentEmployment: createStaff.DateOfCurrentEmployment,
          ContractStartDate: createStaff.ContractStartDate,
          ContractEndDate: createStaff.ContractEndDate,
          LineManagerID: createStaff.LineManagerID,
          CourseCode: createStaff.CourseCode,
          AddedBy: props.loginData[0].StaffID,
          UpdatedBy: createStaff.UpdatedBy,
          UpdatedDate: createStaff.UpdatedDate,
          BankID: createStaff.BankID,
          AccountNumber: createStaff.AccountNumber,
          Password: createStaff.Password,
          BVN: createStaff.BVN,
          AccountType: createStaff.AccountType,
          NFirstName: createStaff.NFirstName,
          NSurname: createStaff.NSurname,
          NMiddleName: createStaff.NMiddleName,
          Relationship: createStaff.Relationship,
          NPhoneNumber: createStaff.NPhoneNumber,
          NEmailAddress: createStaff.NEmailAddress,
          NContactAddress: createStaff.NContactAddress,
          Biography: createStaff.Biography,
          file: createStaff.file2,
          Research: createStaff.Research,
          Facebook: createStaff.Facebook,
          Linkedin: createStaff.Linkedin,
          Twitter: createStaff.Twitter,
          Scholar: createStaff.Scholar,
          Researchgate: createStaff.Researchgate,
          Academia: createStaff.Academia,
          Orcid: createStaff.Orcid,
          //file2: createStaff.file2
        };

        // Build multipart form data for single request submission
        const formData = buildFormData(sendData, createStaff.update_passport ? createStaff.file : null);

        axios
          .post(
            `${serverLink}staff/hr/staff-management/add/staff/multipart/${createStaff.StaffID}`,
            formData,
            {
              headers: {
                ...token.headers,
                'Content-Type': 'multipart/form-data'
              }
            }
          )
          .then(async (res) => {
            if (res.data.message === "success") {
              toast.success("Staff Added Successfully");
              getLastStaffID();
              getData();
              getStaff();
              getInsertedUserID();
              setCreateStaff({
                ...createStaff,
                EntryID: "",
                StaffID: "",
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
                Password: createStaff.Password,
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
                update_passport: false
              });
              getLastStaffID();
            } else if (res.data.message === "exist") {
              toast.error("Staff ID already exists!");
            } else {
              console.log("Error from insert", res);
              toast.error(`Something went wrong submitting your document!`);
            }
          })
          .catch((error) => {
            console.log("Error", error);
            if (error.response && error.response.data) {
              if (error.response.data.error === "File size exceeds 1MB limit") {
                toast.error("Passport file is too large. Maximum size is 1MB.");
              } else if (error.response.data.error && error.response.data.error.includes("format")) {
                toast.error("Invalid file format. Only PNG, JPG, and JPEG are allowed.");
              } else {
                toast.error("An error occurred. Please try again.");
              }
            } else {
              toast.error("Network error. Please check your connection.");
            }
          });
      } else {
        toast.error(
          `Image format not supported. Kindly format and try again!`
        );
      }

    } else {
      if (createStaff.DateOfBirth === "2008-12-30T23:00:00.000Z") {
        await showAlert(
          "ERROR",
          "DateOfBirth Can't be empty and other related date fields",
          "error"
        );
        return false;
      }

      toast.info("Updating staff. Please wait..");

      // Build multipart form data for single request submission
      const updateData = {
        ...createStaff,
        UpdatedBy: props.loginData[0].StaffID
      };
      const formData = buildFormData(updateData, createStaff.update_passport ? createStaff.file : null);

      await axios
        .patch(
          `${serverLink}staff/hr/staff-management/update/staff/multipart`,
          formData,
          {
            headers: {
              ...token.headers,
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        .then(async (result) => {
          if (result.data.message === "success") {
            toast.success("Staff Updated Successfully");
            getStaff();
            getLastStaffID();
            getData();
            getInsertedUserID();
          } else {
            showAlert(
              "ERROR",
              "Something went wrong. Please try again!",
              "error"
            );
          }
        })
        .catch((error) => {
          console.log("Error", error);
          if (error.response && error.response.data) {
            if (error.response.data.error === "File size exceeds 1MB limit") {
              toast.error("Passport file is too large. Maximum size is 1MB.");
            } else if (error.response.data.error && error.response.data.error.includes("format")) {
              toast.error("Invalid file format. Only PNG, JPG, and JPEG are allowed.");
            } else {
              showAlert("ERROR", "Something went wrong. Please try again!", "error");
            }
          } else {
            showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
          }
        });
    }
  };

  /*
  useEffect(() => {
    getLastStaffID().then((r) => { });
    getStaff().then((r) => { });
    getData().then((r) => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  */

  useEffect(() => {
    getStaff().then((r) => { });
    getData().then((r) => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
  useEffect(() => {
    if (newId && !createStaff.StaffID) {
      setCreateStaff(prev => ({ ...prev, StaffID: newId }));
    }
  }, [newId]);
  */

  const handlePassportUpload = (url) => {
    console.log(url)
    if (url !== '') {
      setCreateStaff({
        ...createStaff,
        file2: url
      })

    }
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.add('drag-active');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.remove('drag-active');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.remove('drag-active');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const event = { target: { id: 'file', files: [file] } };
      onEdit(event);
    }
  };

  const onUpdateSettings = async (e) => {
    e.preventDefault();

    if (!editSettings.StaffID) {
      toast.error("Staff ID is required");
      return;
    }

    toast.info("Updating staff settings. Please wait..");

    try {
      const { success, data: result } = await api.patch("staff/hr/staff-management/update/staff/settings/", {
        EntryID: editSettings.EntryID,
        StaffID: editSettings.StaffID,
        IsDeductions: editSettings.IsDeductions,
        IsPension: editSettings.IsPension,
        IsWebsite: editSettings.IsWebsite,
        UpdatedBy: props.loginData[0].StaffID,
      });

      if (success && result.message === "success") {
        toast.success("Staff settings updated successfully");
        getStaff();
        // Close modal
        document.querySelector('[data-bs-dismiss="modal"]')?.click();
      } else {
        toast.error("Unable to update settings. Please try again!");
      }
    } catch (error) {
      console.log("NETWORK ERROR", error);
      toast.error("Network error. Please check your connection.");
    }
  };

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Add Staff"}
        items={["Human Resource", "Staff Management", "Add Staff"]}
        buttons={
          <button
            type="button"
            className="btn btn-primary"
            disabled={!isAdmin}
            data-bs-toggle="modal"
            data-bs-target="#kt_modal_general"
            onClick={() =>
              setCreateStaff({
                ...createStaff,
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
                Password: createStaff.Password,
                AddedDate: "",
                AddedBy: insertUser,
                UpdatedBy: insertUser,
                UpdatedDate: "",
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
              })
            }
          >
            Add Staff
          </button>
        }
      />
      <div className="flex-column-fluid">
        <div className="card">

          <div className="card-body p-0">
            <AGTable data={datatable} />
          </div>
        </div>
        <Modal
          large={true}
          title={"Add and Edit Staff Form"}
          style={{
            width: "500px",
          }}
        >
          <form onSubmit={onSubmit}>
            {/* Progress Stepper */}
            <div className="d-flex justify-content-between mb-10">
              {steps.map((step, index) => (
                <div key={index} className={`d-flex flex-column align-items-center ${index === currentStep ? 'text-primary' : 'text-muted'}`}>
                  <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${index === currentStep ? 'bg-primary text-white' : 'bg-light'}`}
                    style={{ width: '30px', height: '30px', fontWeight: 'bold' }}>
                    {index + 1}
                  </div>
                  <small className="d-none d-md-block" style={{ fontSize: '10px' }}>{step.title}</small>
                </div>
              ))}
            </div>

            <fieldset disabled={!isAdmin}>
              {currentStep === 0 && (
                <>
                  <h5 className="fw-bold">Personal Details</h5>
                  <hr />
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-group">
                        <label htmlFor="file">Passport (optional) <strong className="text-danger"><small>File must not exceed 1mb</small></strong></label>
                        <div
                          className={`upload-drop-zone ${createStaff.file ? 'has-file' : ''}`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById('file').click()}
                          style={{
                            border: '2px dashed #009ef7',
                            borderRadius: '0.475rem',
                            padding: '2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#f8f9fa',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <i className="fa fa-cloud-upload-alt fs-3x text-primary mb-2"></i>
                          <div className="fs-5 fw-bold text-gray-800 mb-1">
                            {createStaff.file ? createStaff.file.name : "Drag & drop your file here"}
                          </div>
                          <div className="fs-7 fw-bold text-gray-500">
                            or click to upload
                          </div>
                        </div>
                        <input
                          type="file"
                          accept=".pdf, .jpg, .png, .jpeg"
                          id="file"
                          name="file"
                          className="d-none"
                          onChange={onEdit}
                        />
                        <span className="alert-info mt-2 d-block">
                          Only .pdf, .jpg, .png, .jpeg are allowed
                        </span>
                      </div>
                    </div>

                    <div className="col-lg-4 pt-5">
                      <div className="form-group">
                        <label htmlFor="TitleID">Title</label>
                        <SearchSelect
                          id="TitleID"
                          value={data.title ? data.title.map(item => ({ label: item.TitleName, value: item.EntryID })).find(op => op.value === createStaff.TitleID) || null : null}
                          onChange={(selected) => onEdit({ target: { id: 'TitleID', value: selected?.value || '' } })}
                          options={data.title ? data.title.map(item => ({ label: item.TitleName, value: item.EntryID })) : []}
                          placeholder="Select Option"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 pt-5">
                      <div className="form-group">
                        <label htmlFor="StaffID">Staff ID <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          id="StaffID"
                          className="form-control"
                          placeholder="Staff ID"
                          required
                          value={createStaff.StaffID}
                          onChange={onEdit}
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 pt-5">
                      <div className="form-group">
                        <label htmlFor="DateOfBirth">Date of Birth</label>
                        <input
                          type="date"
                          id="DateOfBirth"
                          className="form-control"
                          placeholder="Date of Birth*"
                          required
                          max={`${currentYear - 13}-01-01`}
                          value={formatDate(createStaff.DateOfBirth)}
                          onChange={onEdit}
                        />
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
                          value={createStaff.FirstName}
                          onChange={onEdit}
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
                          value={createStaff.MiddleName}
                          onChange={onEdit}
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
                          value={createStaff.Surname}
                          onChange={onEdit}
                        />
                      </div>
                    </div>

                    <div className="col-lg-4 pt-5">
                      <div className="form-group">
                        <label htmlFor="Religion">Religion</label>
                        <SearchSelect
                          id="Religion"
                          value={[{ label: 'Islam', value: 'Islam' }, { label: 'Christianity', value: 'Christianity' }, { label: 'Others', value: 'Others' }].find(op => op.value === createStaff.Religion) || null}
                          onChange={(selected) => onEdit({ target: { id: 'Religion', value: selected?.value || '' } })}
                          options={[{ label: 'Islam', value: 'Islam' }, { label: 'Christianity', value: 'Christianity' }, { label: 'Others', value: 'Others' }]}
                          placeholder="Select Option"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 pt-5">
                      <div className="form-group">
                        <label htmlFor="Gender">Gender</label>
                        <SearchSelect
                          id="Gender"
                          value={[{ label: 'Female', value: 'Female' }, { label: 'Male', value: 'Male' }, { label: 'N/A', value: 'N/A' }].find(op => op.value === createStaff.Gender) || null}
                          onChange={(selected) => onEdit({ target: { id: 'Gender', value: selected?.value || '' } })}
                          options={[{ label: 'Female', value: 'Female' }, { label: 'Male', value: 'Male' }, { label: 'N/A', value: 'N/A' }]}
                          placeholder="Select Option"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-lg-4 pt-5">
                      <div className="form-group">
                        <label htmlFor="MaritalStatus">Marital Status</label>
                        <SearchSelect
                          id="MaritalStatus"
                          value={[{ label: 'Married', value: 'Married' }, { label: 'Single', value: 'Single' }, { label: 'N/A', value: 'N/A' }].find(op => op.value === createStaff.MaritalStatus) || null}
                          onChange={(selected) => onEdit({ target: { id: 'MaritalStatus', value: selected?.value || '' } })}
                          options={[{ label: 'Married', value: 'Married' }, { label: 'Single', value: 'Single' }, { label: 'N/A', value: 'N/A' }]}
                          placeholder="Select Option"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 pt-5">
                      <div className="form-group">
                        <label htmlFor="IsAcademicStaff">Is Academic Staff?</label>
                        <SearchSelect
                          id="IsAcademicStaff"
                          value={[{ label: 'Yes', value: '1' }, { label: 'No', value: '0' }].find(op => op.value === createStaff.IsAcademicStaff?.toString()) || null}
                          onChange={(selected) => onEdit({ target: { id: 'IsAcademicStaff', value: selected?.value || '' } })}
                          options={[{ label: 'Yes', value: '1' }, { label: 'No', value: '0' }]}
                          placeholder="Select Option"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 pt-5">
                      <div className="form-group">
                        <label htmlFor="IsActive">Is Staff Active?</label>
                        <SearchSelect
                          id="IsActive"
                          value={[{ label: 'Yes', value: '1' }, { label: 'No', value: '0' }].find(op => op.value === createStaff.IsActive?.toString()) || null}
                          onChange={(selected) => onEdit({ target: { id: 'IsActive', value: selected?.value || '' } })}
                          options={[{ label: 'Yes', value: '1' }, { label: 'No', value: '0' }]}
                          placeholder="Select Option"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 1 && (
                <>
                  <h5 className="fw-bold">Contact & Origin Details</h5>
                  <hr />
                  <div className="row">
                    <div className="col-lg-6 col-md-6 pt-5">
                      <div className="form-group">
                        <label htmlFor="NationalityID">Nationality</label>
                        <SearchSelect
                          id="NationalityID"
                          value={data.country ? data.country.map(item => ({ label: item.Country, value: item.EntryID })).find(op => op.value === createStaff.NationalityID) || null : null}
                          onChange={(selected) => onEdit({ target: { id: 'NationalityID', value: selected?.value || '' } })}
                          options={data.country ? data.country.map(item => ({ label: item.Country, value: item.EntryID })) : []}
                          placeholder="Select Option"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 pt-5">
                      <div className="form-group">
                        <label htmlFor="StateID">State of Origin</label>
                        <SearchSelect
                          id="StateID"
                          value={stateList ? stateList.map(item => ({ label: item.StateName, value: item.EntryID })).find(op => op.value === createStaff.StateID) || null : null}
                          onChange={(selected) => onEdit({ target: { id: 'StateID', value: selected?.value || '' } })}
                          options={stateList ? stateList.map(item => ({ label: item.StateName, value: item.EntryID })) : []}
                          placeholder="Select Option"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 pt-5">
                      <div className="form-group">
                        <label htmlFor="LgaID">Local Government</label>
                        <SearchSelect
                          id="LgaID"
                          value={lgaList ? lgaList.map(item => ({ label: item.LgaName, value: item.EntryID })).find(op => op.value === createStaff.LgaID) || null : null}
                          onChange={(selected) => onEdit({ target: { id: 'LgaID', value: selected?.value || '' } })}
                          options={lgaList ? lgaList.map(item => ({ label: item.LgaName, value: item.EntryID })) : []}
                          placeholder="Select Option"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 pt-5">
                      <div className="form-group">
                        <label htmlFor="PhoneNumber">Phone Number</label>
                        <input
                          type="tel"
                          id="PhoneNumber"
                          className="form-control"
                          placeholder="Phone Number*"
                          required
                          value={createStaff.PhoneNumber}
                          onChange={onEdit}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 pt-5">
                      <div className="form-group">
                        <label htmlFor="EmailAddress">Email Address</label>
                        <input
                          type="email"
                          id="EmailAddress"
                          className="form-control"
                          placeholder="Email Address"
                          value={createStaff.EmailAddress}
                          onChange={onEdit}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-12 col-md-12 pt-5">
                      <div className="form-group">
                        <label htmlFor="ContactAddress">Contact Address</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          id="ContactAddress"
                          placeholder="Contact Address"
                          required
                          value={createStaff.ContactAddress}
                          onChange={onEdit}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <h5 className="fw-bold">Administrative Details</h5>
                  <hr />
                  <div className="row">
                    <div className="col-lg-4 pt-5">
                      <div className="form-group">
                        <label htmlFor="StaffType">Staff Type</label>
                        <SearchSelect
                          id="StaffType"
                          value={data.stafftype ? data.stafftype.map(item => ({ label: item.TypeName, value: item.TypeName })).find(op => op.value === createStaff.StaffType) || null : null}
                          onChange={(selected) => onEdit({ target: { id: 'StaffType', value: selected?.value || '' } })}
                          options={data.stafftype ? data.stafftype.map(item => ({ label: item.TypeName, value: item.TypeName })) : []}
                          placeholder="Select Option"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-lg-4 pt-5">
                      <div className="form-group">
                        <label htmlFor="DesignationID">Designation</label>
                        <SearchSelect
                          id="DesignationID"
                          value={data.designation ? data.designation.map(item => ({ label: item.DesignationName, value: item.EntryID })).find(op => op.value === createStaff.DesignationID) || null : null}
                          onChange={(selected) => onEdit({ target: { id: 'DesignationID', value: selected?.value || '' } })}
                          options={data.designation ? data.designation.map(item => ({ label: item.DesignationName, value: item.EntryID })) : []}
                          placeholder="Select Option"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-4 pt-5">
                      <div className="form-group">
                        <label htmlFor="DepartmentCode">Department</label>
                        <SearchSelect
                          id="DepartmentCode"
                          value={data.department ? data.department.map(item => ({ label: item.DepartmentName, value: item.DepartmentCode })).find(op => op.value === createStaff.DepartmentCode) || null : null}
                          onChange={(selected) => onEdit({ target: { id: 'DepartmentCode', value: selected?.value || '' } })}
                          options={data.department ? data.department.map(item => ({ label: item.DepartmentName, value: item.DepartmentCode })) : []}
                          placeholder="Select Option"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-4 pt-5">
                      <div className="form-group">
                        <label htmlFor="CourseCode">Course</label>
                        <SearchSelect
                          id="CourseCode"
                          value={data.course ? [...data.course.map(item => ({ label: item.CourseName, value: item.CourseCode })), { label: 'N/A', value: 'N/A' }].find(op => op.value === createStaff.CourseCode) || null : null}
                          onChange={(selected) => onEdit({ target: { id: 'CourseCode', value: selected?.value || '' } })}
                          options={data.course ? [...data.course.map(item => ({ label: item.CourseName, value: item.CourseCode })), { label: 'N/A', value: 'N/A' }] : [{ label: 'N/A', value: 'N/A' }]}
                          placeholder="Select Option"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 pt-5">
                      <div className="form-group">
                        <label htmlFor="LineManagerID">Line Manager</label>
                        <SearchSelect
                          id="LineManagerID"
                          value={data.linemanager ? data.linemanager.map(item => ({ label: `${item.StaffID} -- ${item.FirstName} ${item.MiddleName} ${item.Surname}`, value: item.StaffID })).find(op => op.value === createStaff.LineManagerID) || null : null}
                          onChange={(selected) => onEdit({ target: { id: 'LineManagerID', value: selected?.value || '' } })}
                          options={data.linemanager ? data.linemanager.map(item => ({ label: `${item.StaffID} -- ${item.FirstName} ${item.MiddleName} ${item.Surname}`, value: item.StaffID })) : []}
                          placeholder="Select Option"
                          required
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
                          value={formatDate(createStaff.DateOfFirstEmployment)}
                          onChange={onEdit}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 col-md-6 pt-5">
                      <div className="form-group">
                        <label htmlFor="DateOfCurrentEmployment">
                          Date Of Current Employment
                        </label>
                        <input
                          type="date"
                          id="DateOfCurrentEmployment"
                          className="form-control"
                          placeholder="Date Of Current Employment"
                          value={formatDate(createStaff.DateOfCurrentEmployment)}
                          onChange={onEdit}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 col-md-6 pt-5">
                      <div className="form-group">
                        <label htmlFor="ContractStartDate">Contract Start Date</label>
                        <input
                          type="date"
                          id="ContractStartDate"
                          required
                          className="form-control"
                          placeholder="Contract Start Date"
                          value={formatDate(createStaff.ContractStartDate)}
                          onChange={onEdit}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 col-md-6 pt-5">
                      <div className="form-group">
                        <label htmlFor="ContractEndDate">Contract End Date</label>
                        <input
                          type="date"
                          required
                          id="ContractEndDate"
                          className="form-control"
                          placeholder="Contract End Date"
                          value={createStaff.ContractEndDate}
                          onChange={onEdit}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="col-lg-12 pt-10">
                    <h5 className="fw-bold">Salary Information</h5>
                    <hr />
                  </div>
                  <div className="row">
                    <div className="col-lg-3 pt-5">
                      <div className="form-group">
                        <label htmlFor="GrossPay">Gross Pay</label>
                        <input
                          type="number"
                          id="GrossPay"
                          className="form-control"
                          placeholder="Gross Pay"
                          value={createStaff.GrossPay}
                          onChange={onEdit}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-lg-3 pt-5">
                      <div className="form-group">
                        <label htmlFor="IsDeduction">Is Deduction?</label>
                        <SearchSelect
                          id="IsDeduction"
                          value={[{ label: 'Yes', value: '1' }, { label: 'No', value: '0' }].find(op => op.value === createStaff.IsDeduction?.toString()) || null}
                          onChange={(selected) => onEdit({ target: { id: 'IsDeduction', value: selected?.value || '' } })}
                          options={[{ label: 'Yes', value: '1' }, { label: 'No', value: '0' }]}
                          placeholder="Select Option"
                        />
                      </div>
                    </div>

                    <div className="col-lg-3 pt-5">
                      <div className="form-group">
                        <label htmlFor="IsPension">Is Pension?</label>
                        <SearchSelect
                          id="IsPension"
                          value={[{ label: 'Yes', value: '1' }, { label: 'No', value: '0' }].find(op => op.value === createStaff.IsPension?.toString()) || null}
                          onChange={(selected) => onEdit({ target: { id: 'IsPension', value: selected?.value || '' } })}
                          options={[{ label: 'Yes', value: '1' }, { label: 'No', value: '0' }]}
                          placeholder="Select Option"
                        />
                      </div>
                    </div>

                    <div className="col-lg-3 pt-5">
                      <div className="form-group">
                        <label htmlFor="IsWebsite">Is Website?</label>
                        <SearchSelect
                          id="IsWebsite"
                          value={[{ label: 'Yes', value: '1' }, { label: 'No', value: '0' }].find(op => op.value === createStaff.IsWebsite?.toString()) || null}
                          onChange={(selected) => onEdit({ target: { id: 'IsWebsite', value: selected?.value || '' } })}
                          options={[{ label: 'Yes', value: '1' }, { label: 'No', value: '0' }]}
                          placeholder="Select Option"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <h5 className="fw-bold">Social Networks (optional)</h5>
                  <hr />
                  <div className="row">
                    <div className="col-lg-4 pt-5">
                      <div className="form-group">
                        <label htmlFor="Facebook">Facebook</label>
                        <input type="text" id="Facebook" className="form-control" placeholder="Facebook" value={createStaff.Facebook} onChange={onEdit} />
                      </div>
                    </div>
                    <div className="col-lg-4 pt-5">
                      <div className="form-group">
                        <label htmlFor="Twitter">Twitter</label>
                        <input type="text" id="Twitter" className="form-control" placeholder="Twitter" value={createStaff.Twitter} onChange={onEdit} />
                      </div>
                    </div>
                    <div className="col-lg-4 pt-5">
                      <div className="form-group">
                        <label htmlFor="Linkedin">LinkedIn</label>
                        <input type="text" id="Linkedin" className="form-control" placeholder="LinkedIn" value={createStaff.Linkedin} onChange={onEdit} />
                      </div>
                    </div>
                    <div className="col-lg-6 pt-5">
                      <div className="form-group">
                        <label htmlFor="Scholar">Scholar</label>
                        <input type="text" id="Scholar" className="form-control" placeholder="Scholar" value={createStaff.Scholar} onChange={onEdit} />
                      </div>
                    </div>
                    <div className="col-lg-6 pt-5">
                      <div className="form-group">
                        <label htmlFor="Researchgate">Researchgate</label>
                        <input type="text" id="Researchgate" className="form-control" placeholder="Researchgate" value={createStaff.Researchgate} onChange={onEdit} />
                      </div>
                    </div>
                    <div className="col-lg-6 pt-5">
                      <div className="form-group">
                        <label htmlFor="Academia">Academia</label>
                        <input type="text" id="Academia" className="form-control" placeholder="Academia" value={createStaff.Academia} onChange={onEdit} />
                      </div>
                    </div>
                    <div className="col-lg-6 pt-5">
                      <div className="form-group">
                        <label htmlFor="Orcid">Orcid</label>
                        <input type="text" id="Orcid" className="form-control" placeholder="Orcid" value={createStaff.Orcid} onChange={onEdit} />
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-12 pt-5">
                      <div className="form-group">
                        <label htmlFor="Biography">Biography</label>
                        <textarea className="form-control" rows="3" id="Biography" placeholder="Biography" value={createStaff.Biography} onChange={onEdit} />
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-12 pt-5">
                      <div className="form-group">
                        <label htmlFor="Research">Research</label>
                        <textarea className="form-control" rows="3" id="Research" placeholder="Research" value={createStaff.Research} onChange={onEdit} />
                      </div>
                    </div>
                  </div>
                </>
              )}

            </fieldset>
            {/*    />*/}
            {/*  </div>*/}
            {/*</div>*/}
            {/*<div className="col-lg-4 pt-5">*/}
            {/*  <div className="form-group">*/}
            {/*    <label htmlFor="Relationship">Relationship</label>*/}
            {/*    <select*/}
            {/*      id="Relationship"*/}
            {/*      className="form-control"*/}
            {/*      */}
            {/*      value={createStaff.Relationship}*/}
            {/*      onChange={onEdit}*/}
            {/*    >*/}
            {/*      <option value="">Select Option</option>*/}
            {/*      <option value="Wife">Wife</option>*/}
            {/*      <option value="Husband">Husband</option>*/}
            {/*      <option value="Mother">Mother</option>*/}
            {/*      <option value="Sister">Sister</option>*/}
            {/*      <option value="Son">Son</option>*/}
            {/*      <option value="Brother">Brother</option>*/}
            {/*      <option value="Father">Father</option>*/}
            {/*      <option value="Daughter">Daughter</option>*/}
            {/*      <option value="Uncle">Uncle</option>*/}
            {/*      <option value="Aunty">Aunty</option>*/}
            {/*      <option value="N/A">N/A</option>*/}
            {/*    </select>*/}
            {/*  </div>*/}
            {/*</div>*/}
            {/*<div className="col-lg-4 pt-5">*/}
            {/*  <div className="form-group">*/}
            {/*    <label htmlFor="NPhoneNumber">PhoneNumber</label>*/}
            {/*    <input*/}
            {/*      type="number"*/}
            {/*      id="NPhoneNumber"*/}
            {/*      className="form-control"*/}
            {/*      placeholder="Phone Number"*/}
            {/*      value={createStaff.NPhoneNumber}*/}
            {/*      onChange={onEdit}*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*</div>*/}
            {/*<div className="col-lg-4 pt-5">*/}
            {/*  <div className="form-group">*/}
            {/*    <label htmlFor="NEmailAddress">Email Address</label>*/}
            {/*    <input*/}
            {/*      type="email"*/}
            {/*      id="NEmailAddress"*/}
            {/*      className="form-control"*/}
            {/*      placeholder="Email Address"*/}
            {/*      value={createStaff.NEmailAddress}*/}
            {/*      onChange={onEdit}*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*</div>*/}
            {/*<div className="col-lg-12 col-md-12 pt-5">*/}
            {/*  <div className="form-group">*/}
            {/*    <label htmlFor="NContactAddress">Contact Address</label>*/}
            {/*    <textarea*/}
            {/*      className="form-control"*/}
            {/*      rows="3"*/}
            {/*      id="NContactAddress"*/}
            {/*      placeholder="Contact Address"*/}
            {/*      required*/}
            {/*      value={createStaff.NContactAddress}*/}
            {/*      onChange={onEdit}*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*</div>*/}

            <div className="d-flex justify-content-between pt-10">
              <button
                type="button"
                className="btn btn-light-primary"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={nextStep}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Submit
                </button>
              )}
            </div>
          </form>
        </Modal>

        {/* Settings Edit Modal */}
        <div className="modal fade" id="kt_modal_settings" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Staff Settings</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={onUpdateSettings}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="settingsStaffID" className="form-label fw-bold">Staff ID</label>
                    <input
                      type="text"
                      id="settingsStaffID"
                      className="form-control"
                      value={editSettings.StaffID}
                      onChange={(e) => setEditSettings({ ...editSettings, StaffID: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="settingsIsDeductions" className="form-label fw-bold">Is Deductions</label>
                    <select
                      id="settingsIsDeductions"
                      className="form-select"
                      value={editSettings.IsDeductions}
                      onChange={(e) => setEditSettings({ ...editSettings, IsDeductions: e.target.value })}
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="settingsIsPension" className="form-label fw-bold">Is Pension</label>
                    <select
                      id="settingsIsPension"
                      className="form-select"
                      value={editSettings.IsPension}
                      onChange={(e) => setEditSettings({ ...editSettings, IsPension: e.target.value })}
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="settingsIsWebsite" className="form-label fw-bold">Is Website</label>
                    <select
                      id="settingsIsWebsite"
                      className="form-select"
                      value={editSettings.IsWebsite}
                      onChange={(e) => setEditSettings({ ...editSettings, IsWebsite: e.target.value })}
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-primary">Update Settings</button>
                </div>
              </form>
            </div>
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

export default connect(mapStateToProps, null)(AddEditStaff);
