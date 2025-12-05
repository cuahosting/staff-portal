import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import PageHeader from "../../../common/pageheader/pageheader";
import Loader from "../../../common/loader/loader";
import { serverLink } from "../../../../resources/url";
import AGReportTable from "../../../common/table/AGReportTable";
import Select from "react-select";

function TimeTableByCourse(props) {
  const token = props.login[0].token;
  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [course, setCourse] = useState([]);
  const [courseData, setCourseData] = useState({
    courseCode: "",
    schoolSemester: "",
  });
  // eslint-disable-next-line no-unused-vars
  const [allSemester, setAllSemester] = useState([]);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [timetable, setTimetable] = useState({
    block: "",
    schoolSemester: "",
  });
  const columns = [
    "Day",
    "Module",
    "Type",
    "Block",
    "Venue",
    "Start Time",
    "End Time",
    "Staff Name",
  ];
  const staffID = props.login[0].StaffID;

  useEffect(() => {
    const getSchoolSemester = async () => {
      axios
        .get(`${serverLink}staff/timetable/timetable/semester`, token)
        .then((response) => {
          let rows = []
          if (response.data.length > 0) {
            response.data.forEach((row) => {
              rows.push({value: row.SemesterCode, label: row.SemesterName +"- "+row.SemesterCode})
            });
            setAllSemester(response.data);
            setSemesterOptions(rows)
          }
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getSchoolSemester();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getCourseByStaff = async () => {
      axios
        .get(
          `${serverLink}staff/academics/timetable/modules-by-staff/${staffID}`, token
        )
        .then((response) => {
          setCourse(response.data);
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getCourseByStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.id]: e.target.value,
    });
  };

  const onSemesterChange = (e) => {
    setTimetable({
      ...timetable,
      schoolSemester: e.value,
      schoolSemester2: e,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios
      .get(`${serverLink}staff/academics/timetable/module-by-block`, token, {
        params: {
          block: timetable.block,
          semester: timetable.schoolSemester,
        },
      })
      .then((res) => {
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.forEach((item) => {
            rows.push([
              item.DayName,
              item.ModuleCode,
              item.ModuleType,
              item.BlockName,
              item.VenueName,
              item.StartTime,
              item.EndTime,
              item.StaffName,
            ]);
          });
          setTableHeight(result.length > 100 ? "1000px" : "600px");
          setData(rows);
          setCanSeeReport(true);
        } else {
          toast.error("There is no this block");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("NETWORK ERROR");
      });
  };

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Timetable By Course"}
        items={["Academic", "Timetable", "Timetable By Block"]}
      />
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
                      <label className="required fs-6 fw-bold mb-2">
                        Select Course
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select course"
                        id="courseCode"
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select option</option>
                        {course.map((c, i) => (
                          <option key={i} value={c.CourseCode}>
                            {c.CourseName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select School Semester
                      </label>
                      <Select
                          name="schoolSemester"
                          value={timetable.schoolSemester2}
                          onChange={onSemesterChange}
                          options={semesterOptions}
                          placeholder="select Semester"
                      />
                      {/*<select*/}
                      {/*  className="form-select"*/}
                      {/*  data-placeholder="Select school semester"*/}
                      {/*  id="schoolSemester"*/}
                      {/*  required*/}
                      {/*  onChange={handleChange}*/}
                      {/*  value={timetable.schoolSemester}*/}
                      {/*>*/}
                      {/*  <option value="">Select option</option>*/}
                      {/*  {allSemester.map((semester, index) => (*/}
                      {/*    <option key={index} value={semester.SemesterCode}>*/}
                      {/*      {semester.SemesterName}*/}
                      {/*    </option>*/}
                      {/*  ))}*/}
                      {/*</select>*/}
                    </div>
                    <div className="col-md-4">
                      <div className="row ">
                        <button type="submit" className="btn btn-primary mt-8">
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {canSeeReport ? (
              <div className="row">
                <div className="col-md-12 mt-5">
                  {
                    <AGReportTable
                      title={`Timetable By Course`}
                      columns={columns}
                      data={data}
                      height={tableHeight}
                    />
                  }
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    login: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(TimeTableByCourse);
