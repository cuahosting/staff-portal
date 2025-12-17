import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import StudentGroupForm from "./timetable-student-group-form";

function TimetableStudentGroup(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [courseList, setCourseList] = useState([]);
    const [datatable, setDatatable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Action", field: "action" }, { label: "Group Name", field: "GroupName" }, { label: "Group Code", field: "GroupCode" }, { label: "Course Code", field: "CourseCode" }, { label: "Course Level", field: "CourseLevel" }, { label: "Course Semester", field: "CourseSemester" }], rows: [] });
    const [formData, setFormData] = useState({ GroupName: "", GroupCode: "", CourseCode: "", CourseLevel: "", CourseSemester: "", EntryID: "", InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}` });

    const getCourses = async () => {
        const { success, data } = await api.get("staff/academics/course/list");
        if (success && data?.length > 0) { setCourseList(data); }
    };

    const getStudentGroup = async () => {
        const { success, data } = await api.get("staff/academics/timetable/student_group/list");
        if (success && data?.length > 0) {
            let rows = [];
            data.forEach((group, index) => {
                rows.push({
                    sn: index + 1, GroupName: group.GroupName ?? "N/A", GroupCode: group.GroupCode ?? "N/A", CourseCode: group.CourseCode ?? "N/A", CourseLevel: group.CourseLevel ?? "N/A", CourseSemester: group.CourseSemester ?? "N/A",
                    action: (<button className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }} title="Edit" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setFormData({ GroupName: group.GroupName, GroupCode: group.GroupCode, CourseCode: group.CourseCode, CourseLevel: group.CourseLevel, CourseSemester: group.CourseSemester, EntryID: group.EntryID, InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}` })}><i style={{ fontSize: '15px', color: "blue" }} className="fa fa-pen color-blue" /></button>),
                });
            });
            setDatatable({ ...datatable, rows: rows });
        }
        setIsLoading(false);
    };

    const onEdit = (e) => { setFormData({ ...formData, [e.target.id]: e.target.value }); };

    const onSubmit = async () => {
        if (formData.GroupName.trim() === "") { showAlert("EMPTY FIELD", "Please enter the group name", "error"); return false; }
        if (formData.GroupCode.trim() === "") { showAlert("EMPTY FIELD", "Please enter the group code", "error"); return false; }
        if (formData.CourseCode.trim() === "") { showAlert("EMPTY FIELD", "Please enter the course code", "error"); return false; }
        if (formData.CourseLevel.toString().trim() === "") { showAlert("EMPTY FIELD", "Please enter the course level", "error"); return false; }
        if (formData.CourseSemester.trim() === "") { showAlert("EMPTY FIELD", "Please select the course semester", "error"); return false; }

        if (formData.EntryID === "") {
            setIsFormLoading('on');
            const { success, data } = await api.post("staff/academics/timetable/student_group/add", formData);
            if (success) {
                if (data?.message === "success") { toast.success("Student Group Added Successfully"); getStudentGroup(); document.getElementById("closeModal").click(); setFormData({ ...formData, GroupName: "", GroupCode: "", CourseCode: "", CourseLevel: "", CourseSemester: "", EntryID: "" }); }
                else if (data?.message === "exist") { showAlert("STUDENT GROUP EXIST", "Student group already exist!", "error"); }
                else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            }
            setIsFormLoading('off');
        } else {
            setIsFormLoading('on');
            const { success, data } = await api.patch("staff/academics/timetable/student_group/update", formData);
            if (success) {
                if (data?.message === "success") { toast.success("Student Group Updated Successfully"); getStudentGroup(); document.getElementById("closeModal").click(); setFormData({ ...formData, GroupName: "", GroupCode: "", CourseCode: "", CourseLevel: "", CourseSemester: "", EntryID: "" }); }
                else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            }
            setIsFormLoading('off');
        }
    };

    useEffect(() => { getCourses(); getStudentGroup(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Timetable Student Group"} items={["Academics", "Timetable", "Student Group"]} buttons={<button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setFormData({ ...formData, GroupName: "", GroupCode: "", CourseCode: "", CourseLevel: "", CourseSemester: "", EntryID: "" })}><i className="fa fa-plus me-2"></i>Add Student Group</button>} />
            <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-body p-0"><AGTable data={datatable} /></div></div><Modal title={"Manage Student Group"}><StudentGroupForm data={formData} courseList={courseList} isFormLoading={isFormLoading} onEdit={onEdit} onSubmit={onSubmit} /></Modal></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(TimetableStudentGroup);
