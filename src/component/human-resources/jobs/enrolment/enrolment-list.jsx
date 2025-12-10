import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import { connect } from "react-redux/es/exports";
import Loader from "../../../common/loader/loader";
import ReportTable from "../../../common/table/ReportTable";
import { EmailTemplates, formatDateAndTime, sendEmail } from "../../../../resources/constants";
import { Link } from "react-router-dom";
import Modal from "../../../common/modal/modal";
import StaffEnrolmentModal from "./enrolment-modal";
import { encryptData } from "../../../common/cryptography/cryptography";
import { toast } from "react-toastify";
import { showAlert } from "../../../common/sweetalert/sweetalert";

const EnrolmentList = (props) => {
    const token = props.LoginDetails[0].token;

    const [isFormLoading, setIsFormLoading] = useState('off');
    const [isLoading, setIsLoading] = useState(true);

    const [facultyList, setFacultyList] = useState(
        props.FacultyList.length > 0 ? props.FacultyList : []
    )
    const [departmentList, setDepartmentList] = useState(
        props.DepartmentList.length > 0 ? props.DepartmentList : []
    )
    const columns = ["SN", "Action", "Name", "Email", "Position", "Department", "Faculty", "Applied On", "Status", "ConfirmationStatus"]
    const [data, setData] = useState([])
    const [designations, setDesignations] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [courseList, setCourseList] = useState([]);
    const [details, setDetails] = useState([])
    const [title, setTitle] = useState({})
    const [countryList, setCountryList] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [lgaList, setLgaList] = useState([]);
    const [createStaff, setCreateStaff] = useState({
        ApplicationID: "",
        StaffID: "",
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
        IsAdmin: "",
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
        LastID: ""
    });
    const [newStaffId, setNewStaffID] = useState('');
    const [titleList, setTitleList] = useState([]);

    const getData = async () => {
        await axios.get(`${serverLink}jobs/designation/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setDesignations(result.data)
                }
            })
        let title_ = [];
        await axios.get(`${serverLink}jobs/title/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    title_.push(result.data);
                    setTitleList(result.data);
                }
            })

        await axios.get(`${serverLink}jobs/staff/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setStaffList(result.data)
                }
            })

        await axios.get(`${serverLink}jobs/course/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setCourseList(result.data)
                }
            })

        await axios.get(`${serverLink}staff/academics/faculty/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setFacultyList(result.data)
                }
            })

        await axios.get(`${serverLink}staff/academics/department/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setDepartmentList(result.data)
                }
            })



        let countries = [];
        await axios.get(`${serverLink}jobs/country/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    countries.push(result.data)
                    setCountryList(result.data)
                }
            })

        let states = [];
        await axios.get(`${serverLink}jobs/state/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    states.push(result.data)
                    setStateList(result.data)
                }
            })
        let lgas = [];
        await axios.get(`${serverLink}jobs/lga/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    lgas.push(result.data)
                    setLgaList(result.data)
                }
            })

        getData2(title_)
    }

    const getStaffID = async () => {
        let new_id_
        await axios.get(`${serverLink}jobs/last_staff/list`, token)
            .then((response) => {
                if (response.data.length > 0) {
                    const lastId = response.data[0].StaffID;
                    const indexOfId = lastId.split("E")[1];
                    const lastIndex = Number(indexOfId) + 1;
                    const padStaffID = (lastIndex, places) =>
                        String(lastIndex).padStart(places, "0");
                    const new_id = `E${padStaffID(lastIndex, 4)}`;
                    new_id_ = new_id;
                } else {
                    const new_id = `E0001`;
                    new_id_ = new_id
                }
            })
        return new_id_
    }

    const getData2 = (titlelist = []) => {
        axios.get(`${serverLink}jobs/enrolment/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((item, index) => {
                        rows.push([
                            index + 1,
                            <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#enrolment"
                                onClick={async () => {
                                    setDetails(result.data);
                                   let staff_id = await getStaffID();
                                    setCreateStaff({
                                        ...createStaff,
                                        StaffID: staff_id,
                                        ApplicationID: item.ApplicationID,
                                        Position: item.Position,
                                        FirstName: item.FirstName,
                                        MiddleName: item.MiddleName,
                                        Surname: item.Surname,
                                        Department: item.Department,
                                        EmailAddress: item.EmailAddress,
                                        TitleID: item.TitleID,
                                        Gender: item.Gender,
                                        DateOfBirth: item.DateOfBirth.split('T')[0],
                                        MaritalStatus: item.MaritalStatus,
                                        NationalityID: item.NationalityID,
                                        StateID: item.StateID,
                                        LgaID: item.LgaID,
                                        Religion: item.Religion,
                                        PhoneNumber: item.PhoneNumber,
                                        AltPhoneNumber: item.AltPhoneNumber,
                                        ContactAddress: item.ContactAddress,
                                        Password: encryptData(item.PhoneNumber),
                                        AddedBy: props.LoginDetails[0].StaffID,
                                        Biography: item.Biography,
                                        Research: item.Research,
                                        Facebook: item.Facebook,
                                        Linkedin: item.Linkedin,
                                        Twitter: item.Twitter,
                                        Scholar: item.Scholar,
                                        Researchgate: item.Researchgate,
                                        Academia: item.Academia,
                                        Orcid: item.Orcid,
                                        Image: item.Image,
                                        OfficialEmailAddress: "",
                                        GrossPay: ""
                                    })
                                    let tit_ = titleList.length > 0 ? titleList : titlelist;
                                    let title = tit_?.filter(x => parseInt(x.EntryID) === parseInt(item.TitleID))[0]?.TitleName;
                                    setTitle({
                                        ...title,
                                        Title: staff_id + " " + item.FirstName + " " + item.MiddleName + " " + item.Surname,
                                        Position: item.Position
                                    })
                                }

                                }
                            >
                                <i className="fa fa-pen" />
                            </button>,
                            item.FirstName + " " + item.MiddleName + " " + item.Surname,
                            item.EmailAddress,
                            item.Position,
                            departmentList?.filter(x => x.DepartmentCode.toLowerCase() === item.Department?.toLowerCase())[0]?.DepartmentName,
                            facultyList?.filter(x => x.FacultyCode.toLowerCase() === item.Faculty?.toLowerCase())[0]?.FacultyName,
                            formatDateAndTime(item.InsertDate, "date"),
                            <label className={
                                item.Status === "0" ? "badge badge-secondary" :
                                    item.Status === "1" ? "badge badge-info" :
                                        item.Status === "2" ? "badge badge-danger" : "badge badge-success"
                            }>{
                                    item.Status === "0" ? "Pending" :
                                        item.Status === "1" ? "Invited" :
                                            item.Status === "2" ? "Rejected" : "Accepted"
                                }</label>,
                            <label className={
                                item.ConfirmationStatus === "0" ? "badge badge-secondary" : "badge badge-success"
                            }>{
                                    item.ConfirmationStatus === "0" ? "Not Confirmed" : "Confirmed"
                                }</label>
                        ])
                    })
                    setData(rows)
                } else {
                    setData([])
                }
                setIsLoading(false)
            })
            .catch((err) => {
                console.log(err)
                console.log('NETWORK ERROR');
            });

    }
    const onEdit = (e) => {
        setCreateStaff({
            ...createStaff,
            [e.target.id]: e.target.value
        })
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        let email = EmailTemplates('4', createStaff)
        
        if (createStaff.DesignationID === "" || createStaff.DateOfFirstEmployment === "" || createStaff.DateOfCurrentEmployment === "" || createStaff.ContractStartDate === "" || createStaff.ContractEndDate === "" || createStaff.LineManagerID === "" || createStaff.DepartmentCode === "" || createStaff.CourseCode === "" || createStaff.IsActive === "" || createStaff.IsAcademicStaff === "" || createStaff.IsAdmin === "" || createStaff.StaffType === "" || createStaff.GrossPay === "" || createStaff.OfficialEmailAddress === "") {
            showAlert("EMPTY FIELD", `Please enter all fields`, "error");
            return;
        }
        else {
            await axios.post(`${serverLink}jobs/add/staff`, createStaff, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        getData2(titleList);
                        sendEmail(
                            createStaff.EmailAddress,
                            email.subject,
                            email.title,
                            createStaff.FirstName.charAt(0).toUpperCase() + createStaff.FirstName.slice(1),
                            email.body, '')

                        toast.success("Staff confirmed successfully")
                        setCreateStaff({
                            ...createStaff,
                            ApplicationID: "",
                            StaffID: "",
                            EntryID: "",
                            AltPhoneNumber: "",
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
                            Facebook: "",
                            Linkedin: "",
                            Twitter: "",
                            Scholar: "",
                            Researchgate: "",
                            Academia: "",
                            Orcid: "",
                        })
                        document.getElementById("closeModal").click();
                        // window.location.reload(true);
                    } else {
                        toast.error("Error adding staff, try again...")
                    }
                }).catch((e) => {
                    console.log('NETWROK ERROR')
                })

        }
    }

    useEffect(() => {
        getData();

    }, []);

    return isLoading ? (
        <Loader />
    ) :
        (
            <>
                <div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width: '100%' }}>
                    <div className="">
                        <div className="row col-md-12" style={{ width: '100%' }}>
                            <ReportTable columns={columns} data={data} title={"Enrolment Records"} />
                            {/* <Table data={datatable} /> */}
                        </div>
                    </div>

                </div>

                <Modal title={`${title.Title}`} id={"enrolment"} close={"enrolment"} large={true} style={{ width: '700px' }}>
                    <StaffEnrolmentModal
                        details={details}
                        title={title}
                        departmentList={departmentList}
                        designations={designations}
                        staffList={staffList}
                        courseList={courseList}
                        onEdit={onEdit}
                        onSubmit={onSubmit}
                        createStaff={createStaff}
                        countries={countryList}
                        stateList={stateList}
                        lgaList={lgaList}

                    />
                </Modal>
            </>
        )
}


const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        FacultyList: state.FacultyList,
        DepartmentList: state.DepartmentList
    };
};
export default connect(mapStateToProps, null)(EnrolmentList);
