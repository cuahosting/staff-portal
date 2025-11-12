import React, { useState } from "react";
import axios from 'axios';
import { connect } from "react-redux";
import Loader from "../../../../common/loader/loader";
import PageHeader from "../../../../common/pageheader/pageheader";
import { serverLink } from "../../../../../resources/url";
import { useEffect } from "react";
import Select from "react-select";
import TimetableView from "../../timetable-view/timetable-view";

const ViewTimeTableGrid = (props) => {
    const token = props.loginData[0].token;
    const [isLoading, setIsLoading] = useState(false);
    const [facultyList, setFacultyList] = useState(props.FacultyList)
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
                            rows.push({id: item.SemesterCode, text: item.SemesterName})
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
        if (e.target.id ==="Semester"){
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
                        rows.push({ id: x.FacultyCode, text: x.FacultyName })
                    })
                }
            } else if (e.target.value === "department") {
                if (departmentList.length > 0) {
                    departmentList.map(x => {
                        rows.push({ id: x.DepartmentCode, text: x.DepartmentName })
                    })
                }
            } else if (e.target.value === "course") {
                if (courseList.length > 0) {
                    courseList.map(x => {
                        rows.push({ id: x.CourseCode, text: x.CourseName })
                    })
                }
            } else if (e.target.value === "group") {
                if (groupList.length > 0) {
                    groupList.map(x => {
                        rows.push({ id: x.EntryID, text: x.GroupName })
                    })
                }
            } else if (e.target.value === "campus") {
                if (venueList.length > 0) {
                    venueList.map(x => {
                        const filter = rows.filter(y => y.id === x.CampusID)
                        if (filter.length < 1)
                            rows.push({id: x.CampusID, text: x.CampusName})
                    })
                }
            } else if (e.target.value === "block") {
                if (venueList.length > 0) {
                    venueList.map(x => {
                        const filter = rows.filter(y => y.id === x.BlockID)
                        if (filter.length < 1)
                            rows.push({id: x.BlockID, text: `${x.CampusName} => ${x.BlockName}`})
                    })
                }
            } else if (e.target.value === "venue") {
                if (venueList.length > 0) {
                    venueList.map(x => {
                        const filter = rows.filter(y => y.id === x.VenueID)
                        if (filter.length < 1)
                            rows.push({id: x.VenueID, text: `${x.CampusName} => ${x.BlockName} => ${x.VenueName}`})
                    })
                }
            } else if (e.target.value === "module") {
                if (moduleList.length > 0) {
                    moduleList.map(x => {
                        rows.push({ id: x.ModuleCode, text: x.ModuleName })
                    })
                }
            } else if (e.target.value === "staff") {
                if (staffList.length > 0) {
                    staffList.map(x => {
                        rows.push({ id: x.StaffID, text: `${x.FirstName} ${x.MiddleName} ${x.Surname} (${x.StaffID})` })
                    })
                }
            } else if (e.target.value === "student") {
                if (studentList.length > 0) {
                    studentList.map(x => {
                        rows.push({ id: x.StudentID, text: `${x.FirstName} ${x.MiddleName} ${x.Surname} (${x.StudentID})` })
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
                        <Select
                            id="Semester"
                            data={semesterList}
                            defaultValue={semester}
                            onSelect={onEdit}
                            options={{
                                placeholder: "Search Semester",
                            }}
                        />
                    </div>
                    <div className="col-md-4">
                        <Select
                            id="ViewBy"
                            disabled={semester === ""}
                            data={[
                                {id: 'faculty', text: 'Faculty'},
                                {id: 'department', text: 'Department'},
                                {id: 'course', text: 'Course'},
                                {id: 'group', text: 'Group'},
                                {id: 'campus', text: 'Campus'},
                                {id: 'block', text: 'Block'},
                                {id: 'venue', text: 'Venue'},
                                {id: 'module', text: 'Module'},
                                {id: 'staff', text: 'Staff'},
                                {id: 'student', text: 'Student'}
                            ]}
                            defaultValue={viewType}
                            onSelect={onEdit}
                            options={{
                                placeholder: "Search View Option",
                            }}
                        />
                    </div>
                    <div className="col-md-4">
                        <Select
                            id="ViewByValue"
                            disabled={semester === "" || viewType === ""}
                            data={selectedType}
                            defaultValue={ViewByValue}
                            onSelect={onEdit}
                            options={{
                                placeholder: "Search Report Item",
                            }}
                        />
                    </div>
                </div>


                    {
                        semester !== "" && viewType !=="" && ViewByValue !== "" &&
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
