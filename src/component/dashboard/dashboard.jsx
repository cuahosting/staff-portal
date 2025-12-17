import React from "react";
import { connect } from "react-redux/es/exports";
import Academic_Staff_Dashboard from "./academic-dashboard";
import Non_Academic_Staff_Dashboard from "./non-academic-dashboard"
import { useState } from "react";
import Loader from "../common/loader/loader";
import { useEffect } from "react";
import { api } from "../../resources/api";
import { setDashboardData } from "../../actions/setactiondetails";
import { decryptData } from "../../resources/constants";


function Dashboard(props) {
  const current_user = props.loginData[0];
  const dash_ = props.DashBoardData;
  const dashboard = props.DashBoardData[0]
  const [isLoading, setisLoading] = useState(true)
  const semester = props.semester;
  const [modules, setModules] = useState(dash_.length > 0 ? dashboard.modules_[0] : []);
  const [students, setStudents] = useState(dash_.length > 0 ? dashboard.students_ : []);
  const designation = props.loginData[0].DesignationName;
  const [timetable, setTimetable] = useState(dash_.length > 0 ? dashboard.timetable_ : []);
  const [staffLogin, setStaffLogin] = useState([]);
  const [today, setToday] = useState('');
  const [tomorrow, setTomorrow] = useState('');
  const [departmentList, setDepartmentList] = useState(props.Departments.length > 0 ? props.Departments : []);
  const [facultyList, setFacultyList] = useState(props.Faculties.length > 0 ? props.Faculties : []);
  const [monthDays, setMonthDays] = useState([])
  const [activities, setActivities] = useState(dash_.length > 0 ? dashboard.activities_ : []);
  const [activitiesCount, setActivitiesCount] = useState(dash_.length > 0 ? dashboard.activties_count : []);
  const days = [
    { id: 0, dayName: 'Sunday' },
    { id: 1, dayName: 'Monday' },
    { id: 2, dayName: 'Tuesday' },
    { id: 3, dayName: 'Wednesday' },
    { id: 4, dayName: 'Thursday' },
    { id: 5, dayName: 'Friday' },
    { id: 6, dayName: 'Saturday' },
  ]

  const getData = async () => {
    try {
      const [modulesRes, studentsRes, timetableRes, activitiesRes, activitiesCountRes] = await Promise.all([
        api.get(`staff/settings/dashboard/modules/list/${current_user.StaffID}`),
        api.post(`staff/settings/dashboard/students/list/${current_user.StaffID}`, { SemesterCode: semester }),
        api.get(`staff/settings/dashboard/timetable/list/${current_user.StaffID}/`),
        api.get(`staff/settings/dashboard/activities/list/${current_user.StaffID}`),
        api.get(`staff/settings/dashboard/activities/count/${current_user.StaffID}`)
      ]);

      let modules_ = [];
      if (modulesRes.success && modulesRes.data?.length > 0) {
        modules_ = modulesRes.data;
        setModules(modulesRes.data[0]);
      }

      let students_ = [];
      if (studentsRes.success && studentsRes.data?.length > 0) {
        students_ = studentsRes.data;
        setStudents(studentsRes.data[0]);
      }

      let timetable_ = [];
      if (timetableRes.success && timetableRes.data?.length > 0) {
        timetable_ = timetableRes.data;
        setTimetable(timetableRes.data);
      }

      let activities_ = [];
      if (activitiesRes.success && activitiesRes.data?.length > 0) {
        activities_ = activitiesRes.data;
        setActivities(activitiesRes.data);
      }

      let activties_count = [];
      if (activitiesCountRes.success && activitiesCountRes.data?.length > 0) {
        activties_count = activitiesCountRes.data;
        setActivitiesCount(activitiesCountRes.data);
      }

      props.setOnDashboardData([
        {
          modules_: modules_,
          students_: students_,
          timetable_: timetable_,
          login_: [],
          activities_: activities_,
          activties_count: activties_count,
        }
      ]);

      const month = parseInt(new Date().getMonth());
      const year = parseInt(new Date().getFullYear());
      const getAllDaysInMonth = (month, year) =>
        Array.from(
          { length: new Date(year, month, 0).getDate() },
          (_, i) => new Date(year, month - 1, i + 1)
        );

      const allDaysinaMonth = getAllDaysInMonth(month + 1, year);
      const daysOfAMonth = allDaysinaMonth.map(x => x.toLocaleDateString([], { day: "numeric", weekday: "short" }));
      setMonthDays(daysOfAMonth);

      const t_id = parseInt(new Date().getDay());
      if (t_id === 6) {
        setToday(days.filter(x => x.id === 6)[0].dayName);
        setTomorrow(days.filter(x => x.id === 0)[0].dayName);
      } else {
        const to_day = days.filter(x => x.id === t_id)[0].dayName;
        setToday(to_day);
        setTomorrow(days.filter(x => x.id === t_id + 1)[0].dayName);
      }
      setisLoading(false);

    } catch (e) {
      console.log(e);
      console.log('NETWORK ERROR ');
    }
  }

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return props.DashBoardData.length === 0 ? (
    <Loader />
  ) : (
    <>
      {
        <Academic_Staff_Dashboard
          modules={modules}
          students={students}
          semester={semester}
          facultyList={facultyList}
          departmentList={departmentList}
          current_user={current_user}
          designations={designation}
          tomorrow={tomorrow}
          today={today}
          timetable={timetable}
          staffLogin={staffLogin}
          monthDays={monthDays}
          activities={activities}
          activitiesCount={activitiesCount}
        />
      }
    </>
  )
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails,
    semester: state.currentSemester,
    Departments: state.DepartmentList,
    Faculties: state.FacultyList,
    DashBoardData: state.DashBoardData
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setOnDashboardData: (p) => {
      dispatch(setDashboardData(p));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
