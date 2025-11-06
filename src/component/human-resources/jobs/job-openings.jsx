import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/report_table";
import JobOpeningsForm from "./job-openings-form";
import { encryptData, formatDate, formatDateAndTime, projectJobsURL } from "../../../resources/constants";


function JobOpenings(props)
{
    const token = props.LoginDetails[0].token;

    const [isFormLoading, setIsFormLoading] = useState('off');

    const [facultyList, setFacultyList] = useState(
        props.FacultyList.length > 0 ? props.FacultyList : []
    )
    const [departmentList, setDepartmentList] = useState(props.DepartmentList.length > 0 ? props.DepartmentList : [])
    const [department, setDepartment] = useState(
        props.DepartmentList.length > 0 ? props.DepartmentList : []
    )
    const [isLoading, setIsLoading] = useState(false);
    const columns = ["Position", "Department", "Faculty", "OpeningDate", "Closing Date", "Urgent", "Status", "Type", "ViewCount", "Applicants", "Action"]

    const [data, setData] = useState([])
    const [createJob, setCreateJob] = useState({
        EntryID: "",
        Position: "",
        Faculty: "",
        Department: "",
        OpeningDate: "",
        ClosingDate: "",
        Type: "",
        Urgent: "",
        Status: "",
        Description: "",
        Requirements: "",
        InterviewDate: "",
        InterviewTime: "",
        InterviewVenue: "",
        ViewCount: "",
        Applicants: "",
        InsertedBy: props.LoginDetails[0].StaffID,
    });

    const getMetaData = async () =>
    {
        let faculties_ = []
        await axios.get(`${serverLink}staff/academics/faculty/list`, token)
            .then((result) =>
            {
                if (result.data.length > 0)
                {
                    faculties_ = result.data;
                    setFacultyList(result.data)
                }
            })

        let depts_ = []
        await axios.get(`${serverLink}staff/academics/department/list`, token)
            .then((result) =>
            {
                if (result.data.length > 0)
                {
                    depts_ = result.data;
                    setDepartmentList(result.data)
                    setDepartment(result.data)
                }
            })
    }

    const getData = async () =>
    {
        await axios.get(`${serverLink}jobs/job-openings/all/list`, token)
            .then((result) =>
            {
                if (result.data.length > 0)
                {
                    let rows = [];
                    result.data.map((item, index) =>
                    {
                        rows.push([
                            item.Position,
                            departmentList.filter(x => x.DepartmentCode.toLowerCase() === item.Department.toLowerCase())[0]?.DepartmentName,
                            facultyList.filter(x => x.FacultyCode.toLowerCase() === item.Faculty.toLowerCase())[0]?.FacultyName,
                            formatDateAndTime(item.OpeningDate, 'date'),
                            formatDateAndTime(item.ClosingDate, 'date'),
                            item.Urgent === '1' ? 'Urgent' : 'Normal',
                            item.Status === '1' ? 'Open' : 'Closed',
                            item.Type,
                            item.ViewCount,
                            item.Applicants,
                            <button
                                className="btn btn-sm btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#jobs"
                                onClick={() =>
                                {
                                    setIsLoading(true)
                                    setDepartmentList(department.filter(x => x.FacultyCode.toLowerCase() === item.Faculty.toLowerCase()))
                                    setCreateJob({
                                        EntryID: item.EntryID,
                                        Position: item.Position,
                                        Department: item.Department,
                                        Faculty: item.Faculty,
                                        OpeningDate: formatDate(item.OpeningDate).toString(),
                                        ClosingDate: formatDate(item.ClosingDate).toString(),
                                        Urgent: item.Urgent,
                                        Status: item.Status,
                                        Type: item.Type,
                                        ViewCount: item.ViewCount,
                                        Applicants: item.Applicants,
                                        Description: item.Description,
                                        Requirements: item.Requirements,
                                        InterviewDate: item.InterViewDate,
                                        InterviewTime: item.InterviewTime,
                                        InterviewVenue: item.InterviewVenue,
                                        action: "update",
                                    });
                                    setIsLoading(false)
                                }
                                }
                            >
                                <i className="fa fa-pen" />
                            </button>
                        ])
                    })
                    setData(rows)
                }
                setIsLoading(false);
            })
            .catch((err) =>
            {
                console.log(err)
                console.log('NETWORK ERROR');
            });
    }

    const onEdit = (e) =>
    {
        if (e.target.id === "Faculty")
        {
            const dept = department?.filter(x => x.FacultyCode.toLowerCase() === e.target.value.toLowerCase())
            setDepartmentList(dept)
            setCreateJob({
                ...createJob,
                [e.target.id]: e.target.value,
            });
            return;
        }
        setCreateJob({
            ...createJob,
            [e.target.id]: e.target.value,
        });

    };

    const onDescriptionChange = (e) =>
    {
        setCreateJob({
            ...createJob,
            "Description": e
        })
    }
    const onRequiremnetChange = (e) =>
    {
        setCreateJob({
            ...createJob,
            "Requirements": e
        })
    }

    const onSubmit = async () =>
    {
        for (let key in createJob)
        {
            if (
                createJob.hasOwnProperty(key) &&
                key !== "ViewCount" &&
                key !== "Applicants" &&
                key !== "EntryID" &&
                key !== "InsertedBy"
            )
            {
                if (createJob[key] === "")
                {
                    await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
                    return false;
                }
            }

        }

        if (createJob.EntryID === "")
        {
            setIsFormLoading('on')
            await axios
                .post(`${serverLink}jobs/job-openings/staff/add_job`, createJob, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
                        toast.success("Job Added Successfully");
                        getData()
                        setCreateJob({
                            ...createJob,
                            EntryID: "",
                            Position: "",
                            Department: "",
                            Faculty: "",
                            OpeningDate: "",
                            ClosingDate: "",
                            Urgent: "",
                            Status: "",
                            Type: "",
                            ViewCount: "",
                            Applicants: "",
                            Description: "",
                            Requirements: "",
                            InterviewDate: "",
                            InterviewTime: "",
                            InterviewVenue: "",
                        });
                        setIsFormLoading('off')
                        document.getElementById("closeModal").click();
                    }
                    else if (result.data.message === "exist")
                    {
                        showAlert("OPENING EXIST", "Job already exist!", "error");
                    }
                    else
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
        } else
        {
            setIsFormLoading('on')
            await axios
                .patch(`${serverLink}jobs/job-openings/staff/update_job/${createJob.EntryID}`, createJob, token)
                .then((result) =>
                {
                    if (result.data.message === "success")
                    {
                        toast.success("Venue Updated Successfully");
                        getData();
                        setCreateJob({
                            ...createJob,
                            EntryID: "",
                            Position: "",
                            Department: "",
                            Faculty: "",
                            OpeningDate: "",
                            ClosingDate: "",
                            Urgent: "",
                            Status: "",
                            Type: "",
                            ViewCount: "",
                            Applicants: "",
                            Description: "",
                            Requirements: "",
                            InterviewDate: "",
                            InterviewTime: "",
                            InterviewVenue: "",
                        });
                        setIsFormLoading('off')
                        document.getElementById("closeModal").click();
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
                    console.log(error)
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };

    useEffect(() =>
    {
        // getMetaData();

        // getData()
    }, []);

    const GoToPortal = () =>
    {
        window.location.href = `${projectJobsURL}/admin/login/${encryptData(props.LoginDetails[0].StaffID)}`
    }

    return isLoading ? (
        <Loader />
    ) :
        (
            <>
                <div className="container p-20">
                    <div className="card bg-dark">
                        <div className="container d-flex justify-content-center p-20">
                            <button className="btn btn-lg btn-secondary" onClick={GoToPortal}>
                                Go To Careers Portal
                            </button>
                        </div>

                    </div>
                </div>


                {/* <div className="flex-column-fluid">
                    <div className="card">
                        <div className="card-header border-0 pt-6">
                            <div className="card-title" />
                            <div className="card-toolbar">
                                <div
                                    className="d-flex justify-content-end"
                                    data-kt-customer-table-toolbar="base"
                                >
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#jobs"
                                        onClick={() =>
                                            setCreateJob({
                                                ...createJob,
                                                EntryID: "",
                                                Position: "",
                                                Department: "",
                                                Faculty: "",
                                                OpeningDate: "",
                                                ClosingDate: "",
                                                Urgent: "",
                                                Status: "",
                                                Type: "",
                                                ViewCount: "",
                                                Applicants: "",
                                                Description: "",
                                                Requirements: "",
                                                InterviewDate: "",
                                                InterviewTime: "",
                                                InterviewVenue: "",
                                                InsertedBy: props.LoginDetails[0].StaffID
                                            })
                                        }>
                                        Add Opening
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="card-body pt-0">
                            <div className="col-md-12" style={{ overflowX: 'auto' }}>
                                <ReportTable columns={columns} data={data} title={"Job Openings"} />
                            </div>
                        </div>
                    </div>
                </div>

                <Modal title={"Manage Jobs"} id={"jobs"} close={"jobs"} large={true} style={{ width: '500px' }}>
                    <JobOpeningsForm onEdit={onEdit}
                        onSubmit={onSubmit}
                        createJob={createJob}
                        FacultyList={facultyList}
                        DepartmentList={departmentList}
                        onDescriptionChange={onDescriptionChange}
                        onRequiremnetChange={onRequiremnetChange}
                        isFormLoading={isFormLoading}
                    />
                </Modal> */}

            </>
        )
}
const mapStateToProps = (state) =>
{
    return {
        LoginDetails: state.LoginDetails,
        FacultyList: state.FacultyList,
        DepartmentList: state.DepartmentList
    };
};
export default connect(mapStateToProps, null)(JobOpenings);
