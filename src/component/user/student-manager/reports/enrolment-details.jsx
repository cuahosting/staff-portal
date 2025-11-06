import React, { useState } from "react";
import { serverLink } from "../../../../resources/url";
import { Link } from "react-router-dom";
import axios from "axios"
import { decryptData, formatDateAndTime, shortCode } from "../../../../resources/constants";
import { connect } from "react-redux/es/exports";
import { useParams } from "react-router";
import { useEffect } from "react";
import Loader from "../../../common/loader/loader";
import ReportTable from "../../../common/table/report_table";



const NewStudentEnrolmentDetails = (props) => {
    const token = props.LoginDetails[0].token;

    const params = useParams();
    const studentID = decryptData(params.id);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["ModuleCode", "Module Title", "Semester", "Session", "Level", "Status", "Passed?"]

    const [facultyList, setFacultyList] = useState(
        props.FacultyList.length > 0 ? props.FacultyList : []
    )
    const [departmentList, setDepartmentList] = useState(
        props.DepartmentList.length > 0 ? props.DepartmentList : []
    )
    const [coursesList, setCourseList] = useState([]);

    const [data, setData] = useState([])
    const [faculty, setFaculty] = useState('')
    const [moduleList, setModuleList] = useState([])
    const [modules, setModules] = useState([])
    const [levels, setLevels] = useState([])
    const [documents, setDocuments] = useState([])
    const [passport, setPassport] = useState('')

    const getData = async () => {
        let departments = [];
        let course = [];
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
                    departments = result.data
                }
            })

        await axios.get(`${serverLink}staff/student-manager/course/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setCourseList(result.data)
                    course = result.data
                }
            })

        await axios.post(`${serverLink}staff/student-manager/registered-modules`, { studentID: studentID }, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((x, y) => {
                        rows.push([
                            x.ModuleCode,
                            x.ModuleTitle,
                            x.Semester,
                            x.Session,
                            x.StudentLevel,
                            x.Status,
                            x.IsModulePass === 0 ? 'Failed' : 'Passed'
                        ])
                    })
                    setModuleList(rows)
                }
            })

        await axios.post(`${serverLink}staff/student-manager/enrolment-details`, { studentID: studentID }, token)
            .then((result) => {
                if (result.data.length > 0) {
                    const data = result.data[0]
                    setData(result.data[0]);
                    setFaculty(departments.filter(x => x.DepartmentCode === data.CourseCode)[0].FacultyCode)
                    let ApplicationID = data.ApplicationID
                    axios.get(`${serverLink}staff/student-manager/document/details/${ApplicationID}`, token)
                        .then((result) => {
                            const data = result.data;
                            setPassport(data.filter(x => x.DocumentType === 'Passport Photograph')[0].FileName)
                            setDocuments(data)
                        })

                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err)
                console.log('NETWORK ERROR');
            });
    }

    const color = data.Status === "active" ? 'success' : 'danger'
    const status = data.Status === "active" ? 'Student is active' : 'Student is not active'

    const fname = data.FirstName !== "" ? data.FirstName : ""
    const mname = data.MiddleName !== "" ? data.MiddleName : ""
    const sname = data.Surname !== "" ? data.Surname : ""

    useEffect(() => {
        getData()
    }, []);


    return isLoading ?
        (
            <Loader />
        )
        : (
            <div className="col-md-12">
                <div className="card mb-5 mb-xl-10">
                    <div className="card-body pt-9 pb-0">
                        <div className={`d-flex justify-content-end p-6`}>
                            <div className="d-flex flex-stack">
                                <Link className='' style={{ float: 'right' }} to='/user/student-manager/enrolment/report'>Enrolment List</Link>
                            </div>
                        </div>
                        <div className={`notice d-flex bg-light-${color} rounded border-${color} border border-dashed p-6`}>
                            <div className="d-flex flex-stack flex-grow-1">
                                <div className="fw-bold">
                                    <h4 className="text-gray-900 fw-bolder">Status</h4>
                                    <div className="fs-6 text-gray-700">{status}</div>
                                </div>
                            </div>
                        </div>
                        <br />
                        {/*begin::Details*/}
                        <div className="d-flex flex-wrap flex-sm-nowrap mb-3">
                            <div className="me-7 mb-4">
                                <div className="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">
                                    {passport !== '' && <img src={`${serverLink}public/uploads/${shortCode}/application/document/${passport}`} alt="image" />}
                                </div>
                            </div>
                            <div className="flex-grow-1">

                                <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                                    <div className="d-flex flex-column">
                                        <div className="d-flex align-items-center mb-2">
                                            <span className="text-gray-900 text-hover-primary fs-2 fw-bolder me-1">
                                                {fname + " " + mname + " " + sname}
                                            </span>
                                        </div>
                                        <div className="d-flex flex-wrap fw-bold fs-6 mb-4 pe-2">
                                            <span className="d-flex align-items-center text-gray-400 text-hover-primary me-5 mb-2">
                                                <span className="svg-icon svg-icon-4 me-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"> <path opacity="0.3" d="M10,2h0V1.5a.5.5,0,0,0-1,0V2H5A1,1,0,0,0,4,3V13a1,1,0,0,0,1,1h5a1,1,0,0,0,1-1V3A1,1,0,0,0,10,2ZM6,13H5V12H6Zm0-2H5V10H6ZM6,9H5V8H6Zm2,4H7V12H8Zm0-2H7V10H8ZM8,9H7V8H8Zm2,4H9V12h1Zm0-2H9V10h1Zm0-2H9V8h1Zm0-2.5a.5.5,0,0,1-.5.5h-4A.5.5,0,0,1,5,6.5v-3A.5.5,0,0,1,5.5,3h4a.5.5,0,0,1,.5.5Z" />
                                                    </svg>
                                                </span>
                                                {data.PhoneNumber}</span>
                                            <span className="d-flex align-items-center text-gray-400 text-hover-primary mb-2">
                                                <span className="svg-icon svg-icon-4 me-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
                                                        <path opacity="0.3" d="M21 19H3C2.4 19 2 18.6 2 18V6C2 5.4 2.4 5 3 5H21C21.6 5 22 5.4 22 6V18C22 18.6 21.6 19 21 19Z" fill="currentColor" />
                                                        <path d="M21 5H2.99999C2.69999 5 2.49999 5.10005 2.29999 5.30005L11.2 13.3C11.7 13.7 12.4 13.7 12.8 13.3L21.7 5.30005C21.5 5.10005 21.3 5 21 5Z" fill="currentColor" />
                                                    </svg>
                                                </span>
                                                {data.EmailAddress}</span>
                                        </div>
                                    </div>
                                    <div className="d-flex my-4">
                                        <div
                                            className="d-flex justify-content-end"
                                            data-kt-customer-table-toolbar="base">
                                            {/* <button
                                                type="button"
                                                className="btn btn-primary"
                                                data-bs-toggle="modal"
                                                data-bs-target="#applicant">
                                                Make Decision
                                            </button> */}

                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex flex-wrap flex-stack">
                                    <div className="d-flex flex-column flex-grow-1 pe-8">
                                        <div className="d-flex flex-wrap">
                                            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                <div className="fw-bold fs-6 text-gray-400">Student ID</div>
                                                <div className="d-flex align-items-center">
                                                    <div className="fs-2 fw-bolder">{data.StudentID}</div>
                                                </div>
                                            </div>
                                            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                <div className="fw-bold fs-6 text-gray-400">Department</div>
                                                <div className="d-flex align-items-center">
                                                    <div className="fs-2 fw-bolder">
                                                        {
                                                            departmentList.filter(
                                                                x => x.DepartmentCode.toLowerCase() === data.CourseCode.toLowerCase())[0].DepartmentName
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                <div className="fw-bold fs-6 text-gray-400">Faculty</div>
                                                <div className="d-flex align-items-center">
                                                    <div className="fs-2 fw-bolder">
                                                        {
                                                            facultyList.filter(x => x.FacultyCode.toLowerCase() === faculty.toLowerCase())[0].FacultyName
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder">
                            <li className="nav-item mt-2">
                                <a className="nav-link text-active-primary ms-0 me-10 py-5 active" data-bs-toggle="tab" href="#perosnal">Personal Info</a>
                            </li>
                            <li className="nav-item mt-2">
                                <a className="nav-link text-active-primary ms-0 me-10 py-5" data-bs-toggle="tab" href="#academics">Academics</a>
                            </li>
                            <li className="nav-item mt-2">
                                <a className="nav-link text-active-primary ms-0 me-10 py-5" data-bs-toggle="tab" href="#modules">Modules</a>
                            </li>
                            <li className="nav-item mt-2">
                                <a className="nav-link text-active-primary ms-0 me-10 py-5" data-bs-toggle="tab" href="#results">Result</a>
                            </li>
                            <li className="nav-item mt-2">
                                <a className="nav-link text-active-primary ms-0 me-10 py-5" data-bs-toggle="tab" href="#documents">Documents</a>
                            </li>
                            <li className="nav-item mt-2">
                                <a className="nav-link text-active-primary ms-0 me-10 py-5" data-bs-toggle="tab" href="#nextOfKin">Next of Kin</a>
                            </li>

                        </ul>

                    </div>
                </div>
                <div className="row col-md-12 flex-column-fluid">
                    <div
                        className="tab-content"
                        data-kt-scroll="true"
                        data-kt-scroll-activate="{default: true, lg: false}"
                        data-kt-scroll-height="auto"
                        data-kt-scroll-offset="70px"
                    >
                        <div
                            className="tab-pane fade active show"
                            id="perosnal"
                        >
                            <div className="flex-column-fluid">
                                <div className="card mb-5 mb-xl-10" id="kt_profile_details_view">
                                    <div className="card-header cursor-pointer">
                                        <div className="card-title m-0">
                                            <h3 className="fw-bolder m-0">Personal Information</h3>
                                        </div>
                                    </div>
                                    <div className="card-body p-9">
                                        <div className="row mb-7">
                                            <label className="col-lg-3 fw-bold text-muted">First Name</label>
                                            <div className="col-lg-9">
                                                <span className="fw-bolder fs-6 text-gray-800">{data.FirstName}</span>
                                            </div>
                                        </div>
                                        <div className="row mb-7">
                                            <label className="col-lg-3 fw-bold text-muted">Middle Name</label>
                                            <div className="col-lg-9">
                                                <span className="fw-bolder fs-6 text-gray-800">{data.MiddleName}</span>
                                            </div>
                                        </div>
                                        <div className="row mb-7">
                                            <label className="col-lg-3 fw-bold text-muted">Surname</label>
                                            <div className="col-lg-9">
                                                <span className="fw-bolder fs-6 text-gray-800">{data.Surname}</span>
                                            </div>
                                        </div>
                                        <div className="row mb-7">
                                            <label className="col-lg-3 fw-bold text-muted">Gender</label>
                                            <div className="col-lg-9">
                                                <span className="fw-bolder fs-6 text-gray-800">{data.Gender}</span>
                                            </div>
                                        </div>
                                        <div className="row mb-7">
                                            <label className="col-lg-3 fw-bold text-muted">Date of Birth</label>
                                            <div className="col-lg-9">
                                                <span className="fw-bolder fs-6 text-gray-800">{formatDateAndTime(data.DateOfBirth, 'date')}</span>
                                            </div>
                                        </div>
                                        <div className="row mb-7">
                                            <label className="col-lg-3 fw-bold text-muted">Nationality</label>
                                            <div className="col-lg-9">
                                                <span className="fw-bolder fs-6 text-gray-800">{data.Nationality}</span>
                                            </div>
                                        </div>

                                        <div className="row mb-7">
                                            <label className="col-lg-3 fw-bold text-muted">Local Government</label>
                                            <div className="col-lg-9">
                                                <span className="fw-bolder fs-6 text-gray-800">{data.Lga}</span>
                                            </div>
                                        </div>
                                        <div className="row mb-7">
                                            <label className="col-lg-3 fw-bold text-muted">Address</label>
                                            <div className="col-lg-9">
                                                <span className="fw-bolder fs-6 text-gray-800">{data.Address}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>
                        <div
                            className="tab-pane fade"
                            id="academics">
                            <div className="flex-column-fluid">
                                <div className="card mb-5 mb-xl-10" id="kt_profile_details_view">
                                    <div className="card-header cursor-pointer">
                                        <div className="card-title m-0">
                                            <h3 className="fw-bolder m-0">Academic Information</h3>
                                        </div>
                                    </div>
                                    <div className="card-body p-9">
                                        <div className="d-flex flex-wrap flex-stack">
                                            <div className="d-flex flex-column flex-grow-1 pe-8">
                                                <div className="d-flex flex-wrap">
                                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                        <div className="fw-bold fs-6 text-gray-400">Level</div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="fs-2 fw-bolder">{data.StudentLevel}</div>
                                                        </div>
                                                    </div>
                                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                        <div className="fw-bold fs-6 text-gray-400">Department</div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="fs-2 fw-bolder">
                                                                {
                                                                    departmentList.filter(
                                                                        x => x.DepartmentCode.toLowerCase() === data.CourseCode.toLowerCase())[0].DepartmentName
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                        <div className="fw-bold fs-6 text-gray-400">Faculty</div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="fs-2 fw-bolder">
                                                                {
                                                                    facultyList.filter(x => x.FacultyCode.toLowerCase() === faculty.toLowerCase())[0].FacultyName
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="d-flex flex-wrap flex-stack">
                                            <div className="d-flex flex-column flex-grow-1 pe-8">
                                                <div className="d-flex flex-wrap">
                                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                        <div className="fw-bold fs-6 text-gray-400">Semester</div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="fs-2 fw-bolder">{data.StudentSemester}</div>
                                                        </div>
                                                    </div>
                                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                        <div className="fw-bold fs-6 text-gray-400">ModeOfEntry</div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="fs-2 fw-bolder">
                                                                {data.ModeOfEntry}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                        <div className="fw-bold fs-6 text-gray-400">Year Of Admission</div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="fs-2 fw-bolder">
                                                                {data.YearOfAdmission}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="d-flex flex-wrap flex-stack">
                                            <div className="d-flex flex-column flex-grow-1 pe-8">
                                                <div className="d-flex flex-wrap">
                                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                        <div className="fw-bold fs-6 text-gray-400">AdmissionSemester</div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="fs-2 fw-bolder">{data.AdmissionSemester}</div>
                                                        </div>
                                                    </div>
                                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                        <div className="fw-bold fs-6 text-gray-400">GraduationSemester</div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="fs-2 fw-bolder">
                                                                {data.GraduationSemester}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                        <div className="fw-bold fs-6 text-gray-400">GraduationDate</div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="fs-2 fw-bolder">
                                                                {data.GraduationDate}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="d-flex flex-wrap flex-stack">
                                            <div className="d-flex flex-column flex-grow-1 pe-8">
                                                <div className="d-flex flex-wrap">
                                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                        <div className="fw-bold fs-6 text-gray-400">Has Jamb Admission Deficiency</div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="fs-2 fw-bolder">{data.JambAdmissionDeficiency === 0 ? "Yes" : "No"}</div>
                                                        </div>
                                                    </div>
                                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                        <div className="fw-bold fs-6 text-gray-400">Has Medical Certificate Of Fitness</div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="fs-2 fw-bolder">
                                                                {data.MedicalCertificateOfFitness === 0 ? "Yes" : "No"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                        <div className="fw-bold fs-6 text-gray-400">Has Guarantor Letter</div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="fs-2 fw-bolder">
                                                                {data.GuarantorLetter === 0 ? "Yes" : "No"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                        <div className="fw-bold fs-6 text-gray-400">Has Complete Passport</div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="fs-2 fw-bolder">
                                                                {data.CompletePassport === 0 ? "Yes" : "No"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                                        <div className="fw-bold fs-6 text-gray-400">Has O'level Deficiency</div>
                                                        <div className="d-flex align-items-center">
                                                            <div className="fs-2 fw-bolder">
                                                                {data.OlevelDeficiency === 0 ? "Yes" : "No"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>

                        <div
                            className="tab-pane fade"
                            id="modules">
                            <div className="flex-column-fluid">
                                <div className="card mb-5 mb-xl-10" id="kt_profile_details_view">
                                    <div className="card-header card-header-stretch">
                                        <div className="card-title">
                                            <h3 className="m-0 text-gray-800">Registered Modules</h3>
                                        </div>
                                    </div>
                                    <div className="col-md-12" style={{ width: '100%' }}>
                                        <div className="card-body p-9">
                                            <div className="col-md-12" >
                                                <div className="row" style={{ width: '100%' }}>
                                                    <ReportTable columns={columns} data={moduleList} title={'Registered Modules'} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>
                        <div className="tab-pane fade"
                            id="documents">
                            <div className="flex-column-fluid">
                                <div className="card mb-5 mb-xl-10" id="kt_profile_details_view">
                                    <div className="card-header cursor-pointer">
                                        <div className="card-title m-0">
                                            <h3 className="fw-bolder m-0">Documents</h3>
                                        </div>
                                    </div>
                                    <div className="card-body p-9">
                                        {documents.length > 0 ?
                                            <>
                                                {documents.map((x, y) => {
                                                    return (
                                                        <div className="row mb-7" key={y}>
                                                            <label className="col-lg-3 fw-bold text-muted">{x.DocumentType}</label>
                                                            <div className="col-lg-9">
                                                                <a target={'_blank'} href={`${serverLink}public/uploads/${shortCode}/application/document/${x.FileName}`}>View Document</a>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </>
                                            : <></>}
                                    </div>
                                </div>

                            </div>

                        </div>
                        <div className="tab-pane fade"
                            id="nextOfKin">
                            <div className="flex-column-fluid">
                                <div className="card mb-5 mb-xl-10" id="kt_profile_details_view">
                                    <div className="card-header cursor-pointer">
                                        <div className="card-title m-0">
                                            <h3 className="fw-bolder m-0">Parent Information</h3>
                                        </div>
                                    </div>
                                    <div className="card-body p-9">
                                        <div className="row mb-7">
                                            <label className="col-lg-3 fw-bold text-muted">Parent Name</label>
                                            <div className="col-lg-9">
                                                <span className="fw-bolder fs-6 text-gray-800">{data.ParentName}</span>
                                            </div>
                                        </div>
                                        <div className="row mb-7">
                                            <label className="col-lg-3 fw-bold text-muted">Parent PhoneNumber</label>
                                            <div className="col-lg-9">
                                                <span className="fw-bolder fs-6 text-gray-800">{data.ParentPhoneNumber}</span>
                                            </div>
                                        </div>
                                        <div className="row mb-7">
                                            <label className="col-lg-3 fw-bold text-muted">Parent Address</label>
                                            <div className="col-lg-9">
                                                <span className="fw-bolder fs-6 text-gray-800">{data.ParentAddress}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>



            </div>
        )

}
const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        FacultyList: state.FacultyList,
        DepartmentList: state.DepartmentList
    };
};
export default connect(mapStateToProps, null)(NewStudentEnrolmentDetails);
