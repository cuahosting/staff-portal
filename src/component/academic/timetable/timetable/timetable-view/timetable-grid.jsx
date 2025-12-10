import React, { useState } from "react";
import axios from 'axios';
import { connect } from "react-redux/es/exports";
import Loader from "../../../../common/loader/loader";
import PageHeader from "../../../../common/pageheader/pageheader";
import { serverLink } from "../../../../../resources/url";
import { useEffect } from "react";
import SearchSelect from "../../../../common/select/SearchSelect";
import TimetableView from "../../timetable-view/timetable-view";

const ViewTimeTableGrid = (props) => {
    const token = props.loginData[0].token;
    const [isLoading, setIsLoading] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [facultyList, setFacultyList] = useState(props.FacultyList)
    // eslint-disable-next-line no-unused-vars
    const [departmentList, setDepartmentList] = useState(props.DepartmentList);
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
        try {
            await axios.get(`${serverLink}staff/timetable/timetable/semester`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        let rows = [];
                        result.data.map((item => {
                            rows.push({ value: item.SemesterCode, label: item.SemesterName })
                        }))
                        setSemesterList(rows)
                    }
                })
            await axios.get(`${serverLink}staff/academics/timetable/student_group/list`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        setGroupList(result.data)
                    }
                })
            await axios.get(`${serverLink}staff/academics/course/list`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        setCoursesList(result.data)
                    }
                })
            await axios.get(`${serverLink}staff/academics/module/list`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        setModuleList(result.data)
                    }
                })

            await axios.get(`${serverLink}staff/hr/staff-management/staff/list`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        setStaffList(result.data)
                    }
                })
            await axios.get(`${serverLink}staff/student-manager/student/active`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        setStudentList(result.data)
                    }
                })
            await axios.get(`${serverLink}staff/timetable/timetable/venue/view`, token)
                .then((result) => {
                    if (result.data.length > 0) {
                        setVenueList(result.data)
                    }
                })
            setIsLoading(false)

        } catch (e) {
            console.log('NETWORK ERROR')
        }
    }

    const onEdit = (e) => {
        if (e.target.id === "Semester") {
            setSemester(e.target.value);
            setViewType("")
            setViewByValue("")
        }
        if (e.target.id === "ViewBy") {
            setViewType(e.target.value)
            setViewByValue("")
            let rows = [];
            if (e.target.value === "faculty") {
                if (facultyList.length > 0) {
                    facultyList.map(x => {
                        rows.push({ value: x.FacultyCode, label: x.FacultyName })
                    })
                }
            } else if (e.target.value === "department") {
                if (departmentList.length > 0) {
                    departmentList.map(x => {
                        rows.push({ value: x.DepartmentCode, label: x.DepartmentName })
                    })
                }
            } else if (e.target.value === "course") {
                if (courseList.length > 0) {
                    courseList.map(x => {
                        rows.push({ value: x.CourseCode, label: x.CourseName })
                    })
                }
            } else if (e.target.value === "group") {
                if (groupList.length > 0) {
                    groupList.map(x => {
                        rows.push({ value: x.EntryID, label: x.GroupName })
                    })
                }
            } else if (e.target.value === "campus") {
                if (venueList.length > 0) {
                    venueList.map(x => {
                        const filter = rows.filter(y => y.value === x.CampusID)
                        if (filter.length < 1)
                            rows.push({ value: x.CampusID, label: x.CampusName })
                    })
                }
            } else if (e.target.value === "block") {
                if (venueList.length > 0) {
                    venueList.map(x => {
                        const filter = rows.filter(y => y.value === x.BlockID)
                        if (filter.length < 1)
                            rows.push({ value: x.BlockID, label: `${x.CampusName} => ${x.BlockName}` })
                    })
                }
            } else if (e.target.value === "venue") {
                if (venueList.length > 0) {
                    venueList.map(x => {
                        const filter = rows.filter(y => y.value === x.VenueID)
                        if (filter.length < 1)
                            rows.push({ value: x.VenueID, label: `${x.CampusName} => ${x.BlockName} => ${x.VenueName}` })
                    })
                }
            } else if (e.target.value === "module") {
                if (moduleList.length > 0) {
                    moduleList.map(x => {
                        rows.push({ value: x.ModuleCode, label: x.ModuleName })
                    })
                }
            } else if (e.target.value === "staff") {
                if (staffList.length > 0) {
                    staffList.map(x => {
                        rows.push({ value: x.StaffID, label: `${x.FirstName} ${x.MiddleName} ${x.Surname} (${x.StaffID})` })
                    })
                }
            } else if (e.target.value === "student") {
                if (studentList.length > 0) {
                    studentList.map(x => {
                        rows.push({ value: x.StudentID, label: `${x.FirstName} ${x.MiddleName} ${x.Surname} (${x.StudentID})` })
                    })
                }
            }
            setSelectedType(rows)
        }
        else if (e.target.id === "ViewByValue") {
            setViewByValue(e.target.value)
        }


    }

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"View Timetable"}
                items={["Academics", "View Timetable"]}
            />
            <div className="flex-column-fluid">
                <div className="row col-md-12 mb-3">
                    <div className="col-md-4">
                        <SearchSelect
                            id="Semester"
                            label="Select Semester"
                            value={semesterList.find(op => op.value === semester) || null}
                            options={semesterList}
                            onChange={(selected) => onEdit({ target: { id: 'Semester', value: selected?.value || '' } })}
                            placeholder="Search Semester"
                        />
                    </div>
                    <div className="col-md-4">
                        <SearchSelect
                            id="ViewBy"
                            label="Select View Option"
                            disabled={semester === ""}
                            options={[
                                { value: 'faculty', label: 'Faculty' },
                                { value: 'department', label: 'Department' },
                                { value: 'course', label: 'Course' },
                                { value: 'group', label: 'Group' },
                                { value: 'campus', label: 'Campus' },
                                { value: 'block', label: 'Block' },
                                { value: 'venue', label: 'Venue' },
                                { value: 'module', label: 'Module' },
                                { value: 'staff', label: 'Staff' },
                                { value: 'student', label: 'Student' }
                            ]}
                            value={[
                                { value: 'faculty', label: 'Faculty' },
                                { value: 'department', label: 'Department' },
                                { value: 'course', label: 'Course' },
                                { value: 'group', label: 'Group' },
                                { value: 'campus', label: 'Campus' },
                                { value: 'block', label: 'Block' },
                                { value: 'venue', label: 'Venue' },
                                { value: 'module', label: 'Module' },
                                { value: 'staff', label: 'Staff' },
                                { value: 'student', label: 'Student' }
                            ].find(op => op.value === viewType) || null}
                            onChange={(selected) => onEdit({ target: { id: 'ViewBy', value: selected?.value || '' } })}
                            placeholder="Search View Option"
                        />
                    </div>
                    <div className="col-md-4">
                        <SearchSelect
                            id="ViewByValue"
                            label="Select Report Item"
                            disabled={semester === "" || viewType === ""}
                            options={selectedType}
                            value={selectedType.find(op => op.value === ViewByValue) || null}
                            onChange={(selected) => onEdit({ target: { id: 'ViewByValue', value: selected?.value || '' } })}
                            placeholder="Search Report Item"
                        />
                    </div>
                </div>


                {
                    semester !== "" && viewType !== "" && ViewByValue !== "" &&
                    <TimetableView type={viewType} item_id={ViewByValue} semester={semester} show_key={true} />
                }
            </div>
        </div>


    )
}
const mapStateToProps = (state) => {
    return {
        FacultyList: state.FacultyList,
        DepartmentList: state.DepartmentList,
        loginData: state.LoginDetails,
    };
};
export default connect(mapStateToProps, null)(ViewTimeTableGrid);
