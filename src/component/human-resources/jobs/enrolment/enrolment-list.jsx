import React, { useEffect, useState } from "react";
import { api } from "../../../../resources/api";
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
        const designRes = await api.get("jobs/designation/list");
        if (designRes.success && designRes.data.length > 0) {
            setDesignations(designRes.data);
        }

        let title_ = [];
        const titleRes = await api.get("jobs/title/list");
        if (titleRes.success && titleRes.data.length > 0) {
            title_.push(titleRes.data);
            setTitleList(titleRes.data);
        }

        const staffRes = await api.get("jobs/staff/list");
        if (staffRes.success && staffRes.data.length > 0) {
            setStaffList(staffRes.data);
        }

        const courseRes = await api.get("jobs/course/list");
        if (courseRes.success && courseRes.data.length > 0) {
            setCourseList(courseRes.data);
        }

        const facultyRes = await api.get("staff/academics/faculty/list");
        if (facultyRes.success && facultyRes.data.length > 0) {
            setFacultyList(facultyRes.data);
        }

        const deptRes = await api.get("staff/academics/department/list");
        if (deptRes.success && deptRes.data.length > 0) {
            setDepartmentList(deptRes.data);
        }

        const countryRes = await api.get("jobs/country/list");
        if (countryRes.success && countryRes.data.length > 0) {
            setCountryList(countryRes.data);
        }

        const stateRes = await api.get("jobs/state/list");
        if (stateRes.success && stateRes.data.length > 0) {
            setStateList(stateRes.data);
        }

        const lgaRes = await api.get("jobs/lga/list");
        if (lgaRes.success && lgaRes.data.length > 0) {
            setLgaList(lgaRes.data);
        }

        getData2(title_)
    }

    const getStaffID = async () => {
        let new_id_
        const { success, data } = await api.get("jobs/last_staff/list");
        if (success && data.length > 0) {
            const lastId = data[0].StaffID;
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
        return new_id_
    }

    const getData2 = (titlelist = []) => {
        api.get("jobs/enrolment/list")
            .then(({ success, data }) => {
                if (success && data.length > 0) {
                    let rows = [];
                    data.map((item, index) => {
                        rows.push([
                            index + 1,
                            <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#enrolment"
                                onClick={async () => {
                                    setDetails(data);
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
            const { success, data } = await api.post("jobs/add/staff", createStaff);
            if (success && data.message === "success") {
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
            } else {
                toast.error("Error adding staff, try again...")
            }
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
