import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { showAlert, showConfirm } from "../../common/sweetalert/sweetalert";
import SearchSelect from "../../common/select/SearchSelect";
import { toast } from "react-toastify";
import AGReportTable from "../../common/table/AGReportTable";

const ModuleAssignment = (props) => {
    const token = props.loginDetails[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [modules, setModules] = useState([]);
    const [semesterList, setsemesterList] = useState([]);
    const columns = ["SN", "action", "ModuleCode", "Module Name", "ModuleLevel", "Module Semester", "ModuleType", "SchoolSemester", "IsApproved?"];
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
        CreditUnit: "",
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
                        result.data.forEach((x) => {
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
            allModules.forEach((item) => {
                rows.push({ value: item.ModuleCode + "-" + item.CreditUnit, label: item.ModuleCode + " -- " + item.ModuleName })
            })
        } else {
            setAssignedModulesData([])
            toast.error('no modules for this course...')
        }
        setModules(rows);
    }

    const onCourseChange = (e) => {
        if (!e) return;
        setAssign({
            ...assign,
            Course: e,
            CourseCode: e.value,
            CourseName: e.label
        })
        getModules(e.value);
    }

    const onModuleChnage = (e) => {
        if (!e) return;
        setAssign({
            ...assign,
            Module: e,
            ModuleName: e.label.split(" -- ")[1],
            ModuleCode: e.value.split("-")[0],
            CreditUnit: e.value.split("-")[1]
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

    const viewAssignedModules = () => {
        toast.info("please wait...");
        setAssignedModulesData([]);
        viewAssigned().then((res) => {

        });

    }
    const viewAssigned = async () => {
        try {
            await axios.post(`${serverLink}staff/academics/timetable-planner-2/assigned-modules/list`, assign, token)
                .then((result) => {
                    let rows = [];
                    if (result.data.length > 0) {
                        result.data.forEach((item, index) => {
                            rows.push([
                                index + 1,
                                (<button className="btn btns-m btn-danger" onClick={() => { removeCourse(item.EntryID) }}>
                                    <i style={{ fontSize: '15px', color: "red" }} className="fa fa-trash" />
                                </button>),
                                item.ModuleCode,
                                item.ModuleName,
                                item.ModuleLevel,
                                item.ModuleSemester,
                                item.ModuleType,
                                item.SchoolSemester,
                                <label className={item.isApproved === 1 ? "badge badge-success" : "badge badge-primary"}>
                                    {item.isApproved === 1 ? "Approved" : "Not Approved"}

                                </label>
                            ])
                        })
                    }
                    else {
                        toast.error('no modules assigned yet')
                    }
                    setAssignedModulesData(rows)
                })
        } catch (e) {

        }

    }

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                            <SearchSelect
                                id="Level"
                                label="Module Level"
                                value={[{ value: "100", label: "100 Level" }, { value: "200", label: "200 Level" }, { value: "300", label: "300 Level" }, { value: "400", label: "400 Level" }, { value: "500", label: "500 Level" }, { value: "600", label: "600 Level" }, { value: "700", label: "700 Level" }, { value: "800", label: "800 Level" }, { value: "900", label: "900 Level" }].find(op => op.value === assign.Level) || null}
                                options={[{ value: "100", label: "100 Level" }, { value: "200", label: "200 Level" }, { value: "300", label: "300 Level" }, { value: "400", label: "400 Level" }, { value: "500", label: "500 Level" }, { value: "600", label: "600 Level" }, { value: "700", label: "700 Level" }, { value: "800", label: "800 Level" }, { value: "900", label: "900 Level" }]}
                                onChange={(selected) => onEdit({ target: { id: 'Level', value: selected?.value || '' }, preventDefault: () => { } })}
                                placeholder="Select option"
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <SearchSelect
                                id="ModuleSemester"
                                label="Module Semester"
                                value={[{ value: "First", label: "First Semester" }, { value: "Second", label: "Second Semester" }].find(op => op.value === assign.ModuleSemester) || null}
                                options={[{ value: "First", label: "First Semester" }, { value: "Second", label: "Second Semester" }]}
                                onChange={(selected) => onEdit({ target: { id: 'ModuleSemester', value: selected?.value || '' }, preventDefault: () => { } })}
                                placeholder="Select Semester"
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <SearchSelect
                                id="ModuleType"
                                label="Module Type"
                                value={[{ value: "Lecture", label: "Lecture" }, { value: "Interactive", label: "Interactive" }, { value: "Class", label: "Class" }, { value: "Workshop", label: "Workshop" }, { value: "Online", label: "Online" }, { value: "Seminar", label: "Seminar" }, { value: "Core", label: "Core" }].find(op => op.value === assign.ModuleType) || null}
                                options={[{ value: "Lecture", label: "Lecture" }, { value: "Interactive", label: "Interactive" }, { value: "Class", label: "Class" }, { value: "Workshop", label: "Workshop" }, { value: "Online", label: "Online" }, { value: "Seminar", label: "Seminar" }, { value: "Core", label: "Core" }]}
                                onChange={(selected) => onEdit({ target: { id: 'ModuleType', value: selected?.value || '' }, preventDefault: () => { } })}
                                placeholder="Select Semester"
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <SearchSelect
                                id="SchoolSemester"
                                label="School Semester"
                                value={semesterList.map(x => ({ value: x.SemesterCode, label: `${x.SemesterName} -- ${x.SemesterCode}` })).find(op => op.value === assign.SchoolSemester) || null}
                                options={semesterList.map(x => ({ value: x.SemesterCode, label: `${x.SemesterName} -- ${x.SemesterCode}` }))}
                                onChange={(selected) => onEdit({ target: { id: 'SchoolSemester', value: selected?.value || '' }, preventDefault: () => { } })}
                                placeholder="Select Semester"
                                required
                            />
                        </div>
                    </div>

                    <div className="row col-md-12 m-3 p-3">
                        <div className="col-md-12">
                            <SearchSelect
                                id="CourseCode"
                                label="Course"
                                isDisabled={assign.Level === "" || assign.ModuleSemester === "" || assign.SchoolSemester === "" || assign.ModuleType === "" ? true : false}
                                options={courses}
                                onChange={onCourseChange}
                                value={assign.Course}
                                placeholder="Select Course"
                                required
                            />
                        </div>
                    </div>

                    {
                        modules.length > 0 &&
                        <div className="row col-md-12 m-3 p-3">
                            <div className="col-md-6">
                                <SearchSelect
                                    options={modules}
                                    onChange={onModuleChnage}
                                    value={assign.Module}
                                    placeholder="Select Module"
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
        </div >
    )
}

const mapStateToProps = (state) => {
    return {
        loginDetails: state.LoginDetails
    }
}

export default connect(mapStateToProps, null)(ModuleAssignment);