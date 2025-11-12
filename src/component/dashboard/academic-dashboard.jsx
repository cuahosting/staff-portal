import React, { useLayoutEffect } from "react";
import { connect } from "react-redux";
import { formatDateAndTime } from "../../resources/constants";
import PictureCard from "./sections/picture-card";
import OverviewCard from "./sections/overview-card";
import ScheduleCard from "./sections/schedule-card";
import TimeTableCard from "./sections/timetable-card";
import ScheduleCharts from "./sections/schedule-charts";
import LoginHistory from "./sections/login-records";
import { Chart } from "react-google-charts";


const Academic_Staff_Dashboard = (props) => {
  const current_user = props.loginData[0];
  const semester = props.semester;
  return (
    <div className="d-flex flex-column flex-row-fluid">
      <div className="flex-column-fluid">
        <div className="row g-5 g-xl-10">
          <div className="col-xl-4 mb-xl-10">
            <div id="chartdiv"></div>
            <PictureCard
              current_user={current_user}
              modules={props.modules}
              students={props.students}
              semester={props.semester}
            />
          </div>

          <div className="col-xl-8 mb-5 mb-xl-10">
            <div className="row g-5 g-xl-10" >
              <div className="col-xl-6 mb-xl-10">
                <OverviewCard
                  facultyList={props.facultyList}
                  departmentList={props.departmentList}
                  current_user={props.current_user}
                  designations={props.designations}
                />
              </div>
              <div className="col-xl-6 mb-5 mb-xl-10">
                <ScheduleCard
                  tomorrow={props.tomorrow}
                  today={props.today}
                  timetable={props.timetable}
                  current_user={current_user}
                  designations={props.designations}
                  monthDays={props.monthDays}
                />
              </div>
            </div>

          </div>
        </div>

        <div className="row g-5 g-xl-10">
          <div className="col-xl-4 mb-xl-10">
            <LoginHistory
              staffLogin={props.staffLogin}
              activities={props.activities}
            />
          </div>
          
            <div className="col-xl-8 mb-xl-10">
              <div id="kt_sliders_widget_1_slider" className="card card-flush carousel carousel-custom carousel-stretch slide h-xl-100" data-bs-ride="carousel" data-bs-interval={5000}>
                <div className="card-body pt-6">
                  <div className="me-md-2 w-100">
                    <ScheduleCharts timetable={props.timetable} activitiesCount={props.activitiesCount} activities={props.activities} />

                  </div>
                </div>
              </div>
            </div>
          
        </div>

        <div>
          {
            props.timetable.length > 0 &&
            <div className="col-xl-12 mb-5 mb-xl-10" id="timetable">
              <TimeTableCard
                hidePrint="1"
                current_user={current_user}
                semester={semester}
              />
            </div>
          }
        </div>


      </div>
    </div>

  );
}
const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails,
    semester: state.currentSemester,
  };
};

export default connect(mapStateToProps, null)(Academic_Staff_Dashboard);
