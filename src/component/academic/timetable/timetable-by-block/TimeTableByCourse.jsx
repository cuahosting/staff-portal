import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import PageHeader from "../../../common/pageheader/pageheader";
import Loader from "../../../common/loader/loader";
import { api } from "../../../../resources/api";
import AGReportTable from "../../../common/table/AGReportTable";
import SearchSelect from "../../../common/select/SearchSelect";

function TimeTableByCourse(props) {
  const staffID = props.login[0].StaffID;
  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [courseOptions, setCourseOptions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const columns = ["Day", "Module", "Type", "Block", "Venue", "Start Time", "End Time", "Staff Name"];

  useEffect(() => {
    const fetchData = async () => {
      const [semRes, courseRes] = await Promise.all([
        api.get("staff/timetable/timetable/semester"),
        api.get(`staff/academics/timetable/modules-by-staff/${staffID}`)
      ]);

      if (semRes.success && semRes.data?.length > 0) {
        const semOptions = semRes.data.map(row => ({
          value: row.SemesterCode,
          label: `${row.SemesterCode} - ${row.SemesterName}`
        }));
        setSemesterOptions(semOptions);
      }

      if (courseRes.success && courseRes.data?.length > 0) {
        const courses = courseRes.data.map(c => ({
          value: c.CourseCode,
          label: `${c.CourseCode} - ${c.CourseName}`
        }));
        setCourseOptions(courses);
      }

      setIsLoading(false);
    };
    fetchData();
  }, []);

  const onCourseChange = (selected) => {
    setSelectedCourse(selected);
  };

  const onSemesterChange = (selected) => {
    setSelectedSemester(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourse?.value || !selectedSemester?.value) {
      toast.error("Please select both course and semester");
      return;
    }

    setIsLoading(true);
    const { success, data: result } = await api.post("staff/academics/timetable/module-by-block", {
      block: selectedCourse.value,
      semester: selectedSemester.value
    });

    if (success && result?.length > 0) {
      const rows = result.map(item => [
        item.DayName,
        item.ModuleCode,
        item.ModuleType,
        item.BlockName,
        item.VenueName,
        item.StartTime,
        item.EndTime,
        item.StaffName
      ]);
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else {
      toast.error("No timetable found for this course");
    }
    setIsLoading(false);
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Timetable By Course"} items={["Academic", "Timetable", "Timetable By Course"]} />
      <div className="flex-column-fluid">
        <div className="card card-no-border">
          <div className="card-header border-0 pt-6">
            <div className="card-title" />
          </div>
          <div className="card-body p-0">
            <div className="col-md-12">
              <div className="row">
                <form onSubmit={handleSubmit}>
                  <div className="row fv-row">
                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">Select Course</label>
                      <SearchSelect
                        name="courseCode"
                        value={selectedCourse}
                        onChange={onCourseChange}
                        options={courseOptions}
                        placeholder="Search and select course..."
                      />
                    </div>
                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">Select School Semester</label>
                      <SearchSelect
                        name="schoolSemester"
                        value={selectedSemester}
                        onChange={onSemesterChange}
                        options={semesterOptions}
                        placeholder="Select semester..."
                      />
                    </div>
                    <div className="col-md-4">
                      <div className="row">
                        <button type="submit" className="btn btn-primary mt-8">Submit</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {canSeeReport && (
              <div className="row">
                <div className="col-md-12 mt-5">
                  <AGReportTable title={`Timetable By Course`} columns={columns} data={data} height={tableHeight} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(TimeTableByCourse);
