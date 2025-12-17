import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import { api } from "../../../resources/api";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/ReportTable";
import JobOpeningsForm from "./job-openings-form";
import { encryptData, formatDate, formatDateAndTime, projectJobsURL } from "../../../resources/constants";


function JobOpenings(props) {

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

    const getMetaData = async () => {
        let faculties_ = []
        const facultyResult = await api.get("staff/academics/faculty/list");
        if (facultyResult.success && facultyResult.data.length > 0) {
            faculties_ = facultyResult.data;
            setFacultyList(facultyResult.data)
        }

        let depts_ = []
        const deptResult = await api.get("staff/academics/department/list");
        if (deptResult.success && deptResult.data.length > 0) {
            depts_ = deptResult.data;
            setDepartmentList(deptResult.data)
            setDepartment(deptResult.data)
        }
    }

    const getData = async () => {
        const { success, data } = await api.get("jobs/job-openings/all/list");
        if (success && data.length > 0) {
            let rows = [];
            data.map((item, index) => {
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
                        onClick={() => {
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
    }

    const onEdit = (e) => {
        if (e.target.id === "Faculty") {
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

    const onDescriptionChange = (e) => {
        setCreateJob({
            ...createJob,
            "Description": e
        })
    }
    const onRequiremnetChange = (e) => {
        setCreateJob({
            ...createJob,
            "Requirements": e
        })
    }

    const onSubmit = async () => {
        for (let key in createJob) {
            if (
                createJob.hasOwnProperty(key) &&
                key !== "ViewCount" &&
                key !== "Applicants" &&
                key !== "EntryID" &&
                key !== "InsertedBy"
            ) {
                if (createJob[key] === "") {
                    await showAlert("EMPTY FIELD", `Please enter ${key}`, "error");
                    return false;
                }
            }

        }

        if (createJob.EntryID === "") {
            setIsFormLoading('on')
            const { success, data } = await api.post("jobs/job-openings/staff/add_job", createJob);
            if (success) {
                if (data.message === "success") {
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
                else if (data.message === "exist") {
                    showAlert("OPENING EXIST", "Job already exist!", "error");
                }
                else {
                    showAlert("ERROR", "Something went wrong. Please try again!", "error");
                }
            } else {
                showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
            }
        } else {
            setIsFormLoading('on')
            const { success, data } = await api.patch(`jobs/job-openings/staff/update_job/${createJob.EntryID}`, createJob);
            if (success) {
                if (data.message === "success") {
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
                } else {
                    showAlert("ERROR", "Something went wrong. Please try again!", "error");
                }
            } else {
                showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
            }
        }
    };

    useEffect(() => {
        // getMetaData();

        // getData()
    }, []);

    const GoToPortal = () => {
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
                        <div className="card-body p-0">
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
const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        FacultyList: state.FacultyList,
        DepartmentList: state.DepartmentList
    };
};
export default connect(mapStateToProps, null)(JobOpenings);
