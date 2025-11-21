import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { showAlert, showConfirm } from "../../common/sweetalert/sweetalert";
import Select from 'react-select'
import { toast } from "react-toastify";
import AGReportTable from "../../common/table/AGReportTable";

const ModuleAssignment = (props) => {
    const token = props.loginDetails[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [modules, setModules] = useState([]);
    const [semesterList, setsemesterList] = useState([]);
    const columns = ["SN", "ModuleCode", "Module Name", "ModuleLevel", "Module Semester", "ModuleType", "SchoolSemester", "IsApproved?", "action"];
    const [assignedModulesData, setAssignedModulesData] = useState([]);
    const [allModules, setAllModules] = useState([]);

    const currentUser = props.loginDetails[0].StaffID;
    const [assign, setAssign] = useState({
        EntryID: "",
        Course: "",
        CourseCode: "",
        CourseName: "",
        Level: "",
        SchoolSemester: "",
        ModuleSemester: "",
        ModuleCode: "",
        CreditUnit:"",
        ModuleName: "",
        ModuleType: "",
        Module: "",
        InsertedBy: currentUser,
    })

    const getData = async () => {
        try {
            await axios.get(`${serverLink}staff/academics/timetable-planner-2/course-list/${currentUser}`, token)
                .then((result) => {
                    let rows = []
                    if (result.data.length > 0) {
                        result.data.map((x) => {
                            rows.push({ value: x.CourseCode, label: x.CourseName })
                        })
                    }
                    setCourses(rows);
                })
            await axios.get(`${serverLink}staff/timetable/timetable/semester`, token)
                .then((result) => {
                    setsemesterList(result.data)
                    setIsLoading(false)
                })

            await axios.get(`${serverLink}staff/academics/timetable-planner-2/modules`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        setAllModules(result.data)
                    }
                })
        } catch (e) {
            showAlert("Error", "Network error, please check your connection", "error");
        }
    }

    const getModules = async (course) => {
        let rows = [];
        // if (allModules.filter(x => x.CourseCode === course).length > 0) {
        //     allModules.filter(x => x.CourseCode === course).map((item, index) => {
        //         rows.push({ value: item.ModuleCode+"-"+item.CreditUnit, label: item.ModuleCode + " -- " + item.ModuleName })
        //     })
        // } else {
        //     setAssignedModulesData([])
        //     toast.error('no modules for this course...')
        // }
        if (allModules.length > 0) {
            allModules.map((item, index) => {
                rows.push({ value: item.ModuleCode+"-"+item.CreditUnit, label: item.ModuleCode + " -- " + item.ModuleName })
            })
        } else {
            setAssignedModulesData([])
            toast.error('no modules for this course...')
        }
        setModules(rows);
    }

    const onCourseChange = (e) => {
        setAssign({
            ...assign,
            Course: e,
            CourseCode: e.value,
            CourseName: e.label
        })
        getModules(e.value);
    }

    const onModuleChnage = (e) => {
        setAssign({
            ...assign,
            Module: e,
            ModuleName: e.label.split(" -- ")[1],
            ModuleCode: e.value.split("-")[0],
            CreditUnit : e.value.split("-")[1]
        })
    }

    const onEdit = (e) => {
        setAssign({
            ...assign,
            [e.target.id]: e.target.value
        })
    }

    const addModule = async () => {
        try {
            await axios.post(`${serverLink}staff/academics/timetable-planner-2/assigned-modules/add`, assign, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        viewAssigned();
                        toast.success("module assigned successfully");
                    } else if (result.data.message === "exist") {
                        toast.warning("module already assigned...")
                    } else {
                        toast.error("please try agaian...")
                    }
                })
        } catch (e) {
            showAlert(
                "NETWORK ERROR",
                "Please check your connection and try again!",
                "error"
            );
        }
    }

    const removeCourse = async (EntryID) => {
        showConfirm("Warning", "Are you sure you want to remove module", "warning")
            .then(async (isConfirmed) => {
                if (isConfirmed) {
                    try {
                        await axios.delete(`${serverLink}staff/academics/timetable-planner-2/assigned-modules/delete/${EntryID}`, token)
                            .then((result) => {
                                if (result.data.message === "success") {
                                    viewAssigned();
                                    toast.success("Module removed successfully");
                                }
                            })
                    } catch (e) {
                        showAlert(
                            "NETWORK ERROR",
                            "Please check your connection and try again!",
                            "error"
                        );
                    }
                }
            })
    }

    const viewAssignedModules=()=>{
        toast.info("please wait...");
        setAssignedModulesData([]);
        viewAssigned().then((res)=>{
           
        });
        
    }
    const viewAssigned = async () => {
        try {
            await axios.post(`${serverLink}staff/academics/timetable-planner-2/assigned-modules/list`, assign, token)
                .then((result) => {
                    let rows = [];
                    if (result.data.length > 0) {
                        result.data.map((item, index) => {
                            rows.push([
                                index + 1,
                                item.ModuleCode,
                                item.ModuleName,
                                item.ModuleLevel,
                                item.ModuleSemester,
                                item.ModuleType,
                                item.SchoolSemester,
                                <label className={item.isApproved===1 ? "badge badge-success": "badge badge-primary"}>
                                    {item.isApproved===1 ? "Approved": "Not Approved"}

                                </label>,
                                (<button className="btn btns-m btn-danger" onClick={() => { removeCourse(item.EntryID) }}>
                                    <i className="fa fa-trash" />
                                </button>)
                            ])
                        })
                    }
                    else{
                        toast.error('no modules assigned yet')
                    }
                    setAssignedModulesData(rows)
                })
        } catch (e) {

        }

    }

    useEffect(() => {
        getData();
    }, [])

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Module Assignment"}
                items={["Academics", "Timetable Planner", "Module Assignment"]}
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="row col-md-12 m-3 p-3">
                        <div className="col-md-3">
                            <div className="fv-row mb-6 enhanced-form-group">
                                <label className="form-label fs-6 fw-bolder text-dark enhanced-label required" htmlFor="Level">
                                    Module Level
                                </label>
                                <div className="enhanced-input-wrapper">
                                    <select
                                        className="form-control form-control-lg form-control-solid enhanced-input"
                                        id="Level"
                                        data-placeholder="Select option"
                                        onChange={onEdit}
                                    >
                                        <option value="">Select option</option>
                                        <option value="100">100 Level</option>
                                        <option value="200">200 Level</option>
                                        <option value="300">300 Level</option>
                                        <option value="400">400 Level</option>
                                        <option value="500">500 Level</option>
                                        <option value="600">600 Level</option>
                                        <option value="700">700 Level</option>
                                        <option value="800">800 Level</option>
                                        <option value="900">900 Level</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="fv-row mb-6 enhanced-form-group">
                                <label className="form-label fs-6 fw-bolder text-dark enhanced-label required" htmlFor="ModuleSemester">
                                    Module Semester
                                </label>
                                <div className="enhanced-input-wrapper">
                                    <select
                                        className="form-control form-control-lg form-control-solid enhanced-input"
                                        data-placeholder="Select Semester"
                                        id="ModuleSemester"
                                        onChange={onEdit}
                                    >
                                        <option value="">Select option</option>
                                        <option value="First">First Semester</option>
                                        <option value="Second">Second Semester</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="fv-row mb-6 enhanced-form-group">
                                <label className="form-label fs-6 fw-bolder text-dark enhanced-label required" htmlFor="ModuleType">
                                    Module Type
                                </label>
                                <div className="enhanced-input-wrapper">
                                    <select
                                        className="form-control form-control-lg form-control-solid enhanced-input"
                                        data-placeholder="Select Semester"
                                        id="ModuleType"
                                        onChange={onEdit}
                                    >
                                        <option value="">Select option</option>
                                        <option value="Lecture">Lecture</option>
                                        <option value="Interactive">Interactive</option>
                                        <option value="Class">Class</option>
                                        <option value="Workshop">Workshop</option>
                                        <option value="Online">Online</option>
                                        <option value="Seminar">Seminar</option>
                                        <option value="Core">Core</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="fv-row mb-6 enhanced-form-group">
                                <label className="form-label fs-6 fw-bolder text-dark enhanced-label required" htmlFor="SchoolSemester">
                                    School Semester
                                </label>
                                <div className="enhanced-input-wrapper">
                                    <select
                                        className="form-control form-control-lg form-control-solid enhanced-input"
                                        data-placeholder="Select Semester"
                                        id="SchoolSemester"
                                        onChange={onEdit}
                                    >
                                        <option value="">Select option</option>
                                        {
                                            semesterList.length > 0 &&
                                            semesterList.map((x, y) => {
                                                return (
                                                    <option value={x.SemesterCode} key={y}>{x.SemesterName} -- {x.SemesterCode}</option>
                                                )
                                            })
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        <div className="fv-row mb-6 enhanced-form-group">
                            <label className="form-label fs-6 fw-bolder text-dark enhanced-label required" htmlFor="CourseCode">
                                Course
                            </label>
                            <div className="col-md-12">
                                <Select
                                isDisabled={assign.Level === "" || assign.ModuleSemester === "" || assign.SchoolSemester === "" || assign.ModuleType === "" ? true : false}
                                    options={courses}
                                    onChange={onCourseChange}
                                    value={assign.Course}
                                />
                            </div>
                        </div>

                        {
                            modules.length > 0 &&
                            <div className="row col-md-12 mt-5 pt-5">
                                <div className="col-md-6">
                                    <Select
                                        options={modules}
                                        onChange={onModuleChnage}
                                        value={assign.Module}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <button className="btn btn-sm btn-primary" onClick={addModule}>Add Module</button>
                                </div>
                                <div className="col-md-3">
                                    <button className="btn btn-sm btn-dark" onClick={viewAssignedModules}>View Assigned Modules</button>
                                </div>
                            </div>
                        }
                    </div>


                </div>
            </div>
            <div className="row col-md-12 mt-5">
                {
                    assignedModulesData.length > 0 &&
                    <>
                        <h2 className="mt-2 mb-2">
                            {assign.Level} Level {assign.ModuleSemester} {assign.CourseName} Modules
                        </h2>
                        <AGReportTable columns={columns} data={assignedModulesData} /></>
                }
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        loginDetails: state.LoginDetails
    }
}

export default connect(mapStateToProps, null)(ModuleAssignment);