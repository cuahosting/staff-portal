import React, { useState, useEffect } from "react";
import { connect } from "react-redux/es/exports";
import Loader from "../../../../common/loader/loader";
import PageHeader from "../../../../common/pageheader/pageheader";
import { api } from "../../../../../resources/api";
import SearchSelect from "../../../../common/select/SearchSelect";
import TimetableView from "../../timetable-view/timetable-view";

const ViewTimeTableGrid = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [facultyList] = useState(props.FacultyList);
    const [departmentList] = useState(props.DepartmentList);
    const [groupList, setGroupList] = useState([]);
    const [courseList, setCoursesList] = useState([]);
    const [selectedType, setSelectedType] = useState([]);
    const [moduleList, setModuleList] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [venueList, setVenueList] = useState([]);
    const [semester, setSemester] = useState('');
    const [viewType, setViewType] = useState('');
    const [ViewByValue, setViewByValue] = useState('');

    const getData = async () => {
        setIsLoading(true);
        const [semRes, grpRes, courseRes, modRes, staffRes, studentRes, venueRes] = await Promise.all([
            api.get("staff/timetable/timetable/semester"),
            api.get("staff/academics/timetable/student_group/list"),
            api.get("staff/academics/course/list"),
            api.get("staff/academics/module/list"),
            api.get("staff/hr/staff-management/staff/list"),
            api.get("staff/student-manager/student/active"),
            api.get("staff/timetable/timetable/venue/view")
        ]);
        if (semRes.success && semRes.data?.length > 0) { let rows = []; semRes.data.forEach((item) => { rows.push({ value: item.SemesterCode, label: item.SemesterName }); }); setSemesterList(rows); }
        if (grpRes.success) { setGroupList(grpRes.data || []); }
        if (courseRes.success) { setCoursesList(courseRes.data || []); }
        if (modRes.success) { setModuleList(modRes.data || []); }
        if (staffRes.success) { setStaffList(staffRes.data || []); }
        if (studentRes.success) { setStudentList(studentRes.data || []); }
        if (venueRes.success) { setVenueList(venueRes.data || []); }
        setIsLoading(false);
    };

    const onEdit = (e) => {
        if (e.target.id === "Semester") { setSemester(e.target.value); setViewType(""); setViewByValue(""); }
        if (e.target.id === "ViewBy") {
            setViewType(e.target.value); setViewByValue("");
            let rows = [];
            if (e.target.value === "faculty") { if (facultyList.length > 0) { facultyList.forEach(x => { rows.push({ value: x.FacultyCode, label: x.FacultyName }); }); } }
            else if (e.target.value === "department") { if (departmentList.length > 0) { departmentList.forEach(x => { rows.push({ value: x.DepartmentCode, label: x.DepartmentName }); }); } }
            else if (e.target.value === "course") { if (courseList.length > 0) { courseList.forEach(x => { rows.push({ value: x.CourseCode, label: x.CourseName }); }); } }
            else if (e.target.value === "group") { if (groupList.length > 0) { groupList.forEach(x => { rows.push({ value: x.EntryID, label: x.GroupName }); }); } }
            else if (e.target.value === "campus") { if (venueList.length > 0) { venueList.forEach(x => { const filter = rows.filter(y => y.value === x.CampusID); if (filter.length < 1) rows.push({ value: x.CampusID, label: x.CampusName }); }); } }
            else if (e.target.value === "block") { if (venueList.length > 0) { venueList.forEach(x => { const filter = rows.filter(y => y.value === x.BlockID); if (filter.length < 1) rows.push({ value: x.BlockID, label: `${x.CampusName} => ${x.BlockName}` }); }); } }
            else if (e.target.value === "venue") { if (venueList.length > 0) { venueList.forEach(x => { const filter = rows.filter(y => y.value === x.VenueID); if (filter.length < 1) rows.push({ value: x.VenueID, label: `${x.CampusName} => ${x.BlockName} => ${x.VenueName}` }); }); } }
            else if (e.target.value === "module") { if (moduleList.length > 0) { moduleList.forEach(x => { rows.push({ value: x.ModuleCode, label: x.ModuleName }); }); } }
            else if (e.target.value === "staff") { if (staffList.length > 0) { staffList.forEach(x => { rows.push({ value: x.StaffID, label: `${x.FirstName} ${x.MiddleName} ${x.Surname} (${x.StaffID})` }); }); } }
            else if (e.target.value === "student") { if (studentList.length > 0) { studentList.forEach(x => { rows.push({ value: x.StudentID, label: `${x.FirstName} ${x.MiddleName} ${x.Surname} (${x.StudentID})` }); }); } }
            setSelectedType(rows);
        } else if (e.target.id === "ViewByValue") { setViewByValue(e.target.value); }
    };

    useEffect(() => { getData(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"View Timetable"} items={["Academics", "View Timetable"]} />
            <div className="flex-column-fluid">
                <div className="row col-md-12 mb-3">
                    <div className="col-md-4"><SearchSelect id="Semester" label="Select Semester" value={semesterList.find(op => op.value === semester) || null} options={semesterList} onChange={(selected) => onEdit({ target: { id: 'Semester', value: selected?.value || '' } })} placeholder="Search Semester" /></div>
                    <div className="col-md-4"><SearchSelect id="ViewBy" label="Select View Option" disabled={semester === ""} options={[{ value: 'faculty', label: 'Faculty' }, { value: 'department', label: 'Department' }, { value: 'course', label: 'Course' }, { value: 'group', label: 'Group' }, { value: 'campus', label: 'Campus' }, { value: 'block', label: 'Block' }, { value: 'venue', label: 'Venue' }, { value: 'module', label: 'Module' }, { value: 'staff', label: 'Staff' }, { value: 'student', label: 'Student' }]} value={[{ value: 'faculty', label: 'Faculty' }, { value: 'department', label: 'Department' }, { value: 'course', label: 'Course' }, { value: 'group', label: 'Group' }, { value: 'campus', label: 'Campus' }, { value: 'block', label: 'Block' }, { value: 'venue', label: 'Venue' }, { value: 'module', label: 'Module' }, { value: 'staff', label: 'Staff' }, { value: 'student', label: 'Student' }].find(op => op.value === viewType) || null} onChange={(selected) => onEdit({ target: { id: 'ViewBy', value: selected?.value || '' } })} placeholder="Search View Option" /></div>
                    <div className="col-md-4"><SearchSelect id="ViewByValue" label="Select Report Item" disabled={semester === "" || viewType === ""} options={selectedType} value={selectedType.find(op => op.value === ViewByValue) || null} onChange={(selected) => onEdit({ target: { id: 'ViewByValue', value: selected?.value || '' } })} placeholder="Search Report Item" /></div>
                </div>
                {semester !== "" && viewType !== "" && ViewByValue !== "" && <TimetableView type={viewType} item_id={ViewByValue} semester={semester} show_key={true} />}
            </div>
        </div>
    );
};

const mapStateToProps = (state) => { return { FacultyList: state.FacultyList, DepartmentList: state.DepartmentList, loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(ViewTimeTableGrid);
