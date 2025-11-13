import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { showAlert, showConfirm } from "../../common/sweetalert/sweetalert";
import { connect } from "react-redux";
import Table from "../../common/table/table";
import Select from "react-select";

function OfficerAssignment(props) {
  const token = props.login[0].token;

  const [staffList, setStaffList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [item, setItem] = useState({
    StaffID: "",
    StaffName: "",
    CourseCode: "",
  })

  const [data, setData] = useState({
    staffID: "",
    courseCode: "",
    insertedBy: props.login[0].StaffID,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [officerData, setOfficerData] = useState([]);
  const [datatable, setDatatable] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "StaffID",
        field: "staffID",
      },
      {
        label: "Staff Name",
        field: "staffName",
      },

      {
        label: "Course Code",
        field: "courseCode",
      },
      {
        label: "Course Name",
        field: "courseName",
      },
      {
        label: "",
        field: "action",
      },
    ],
    rows: [],
  });

  useEffect(() => {
    const getStaffList = async () => {
      axios
        .get(`${serverLink}staff/academics/timetable-planner/staff/list`, token)
        .then((response) => {
          let rows = [];
          response.data.length > 0 &&
            response.data.map((row) => {
              rows.push({ text: row.FirstName + " " + row.MiddleName + " " + row.Surname, id: row.StaffID });
            });
          //setStaff(rows)
          setStaffList(rows)
          //setStaffList(response.data);
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getStaffList();
  }, []);

  useEffect(() => {
    const getAllModulesByCourse = async () => {
      axios
        .get(`${serverLink}staff/academics/timetable-planner/course/list`, token)
        .then((response) => {
          let rows = [];
          response.data.length > 0 &&
            response.data.map((row) => {
              rows.push({ text: row.CourseName, id: row.CourseCode });
            });
          //setCourses(rows)
          setCourseList(rows)
          //setCourseList(response.data);
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getAllModulesByCourse();
  }, []);

  const getOfficers = async () => {
    await axios
      .get(`${serverLink}staff/academics/timetable-planner/officer/list`, token)
      .then((response) => {
        let rows = [];
        if (response.data.length > 0) {
          setOfficerData(response.data);
          response.data.map((course, index) => {
            rows.push({
              sn: index + 1,
              staffID: course.StaffID,
              staffName: course.StaffName,
              courseCode: course.CourseCode,
              courseName: course.CourseName,
              action: (
                <button
                  onClick={() => handleDelete(course.EntryID)}
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              ),
            });
          });

        }
        setDatatable({
          ...datatable,
          columns: datatable.columns,
          rows: rows,
        });
        setIsLoading(false);
      })
      .catch((error) => {
        showAlert(
          "NETWORK ERROR",
          "Please check your connection and try again!",
          "error"
        );
      });
  };

  useEffect(() => {
    getOfficers();
  }, []);


  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.id]: e.target.value,
    });


  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios
      .post(
        `${serverLink}staff/academics/timetable-planner/officer-assignment/`, data, token)
      .then((response) => {
        if (response.data.message === "success") {
          getOfficers();
          toast.success("Course Assign successfully");
        } else {
          toast.warn("This course has already been assigned to this staff");
        }
      })
      .catch((ex) => {
        console.error(ex);
      });
  };

  const handleDelete = async (EntryID) => {
    showConfirm("warning", "Are you sure?", "warning").then(async(confirm) => {
      if (confirm) {
        await axios
          .delete(`${serverLink}staff/academics/timetable-planner/officer-assignment/${EntryID}`, token)
          .then((response) => {
            if (response.data.message === "success") {
              getOfficers();
              toast.error("Deleted successfully");
            } else {
              toast.warn("Staff already deleted");
            }
            setIsLoading(false);
          })
          .catch((error) => {
            showAlert(
              "NETWORK ERROR",
              "Please check your connection and try again!",
              "error"
            );
          });
      }
    })
  };

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Officer Assignment"}
        items={["Academics", "Timetable Planner", "Officer Assignment"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-header border-0 pt-6">
            <div className="card-title" />
            <div className="card-toolbar">
              <div
                className="d-flex justify-content-end"
                data-kt-customer-table-toolbar="base"
              ></div>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="col-md-12">
              <div className="row">
                <form onSubmit={handleSubmit}>
                  <div className="row fv-row">
                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select Programme/Course
                      </label>
                      {/* <select
                        className="form-select"
                        data-placeholder="Select a programme"
                        id="courseCode"
                        required
                        value={data.courseCode}
                        onChange={handleChange}
                      >
                        <option value="">Select option</option>

                        {courseList.map((course, index) => (
                          <option key={index} value={course.CourseCode}>
                            {course.CourseName}
                          </option>
                        ))}
                      </select> */}
                      <Select
                        id="courseCode"
                        //disabled={item.SemesterCode === ""}

                        value={data.courseCode}
                        data={courseList}
                        onSelect={handleChange}
                        options={{
                          placeholder: "Search Course",
                        }}
                      />
                    </div>
                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select Staff
                      </label>
                      {/* <select
                        className="form-select"
                        data-placeholder="Select a staff"
                        id="staffID"
                        required
                        value={data.staffID}
                        onChange={handleChange}
                      >
                        <option value="">Select option</option>
                        {staffList.map((staff, index) => (
                          <option key={index} value={staff.StaffID}>
                            {`${staff.FirstName} ${staff.MiddleName} ${staff.Surname}`}
                          </option>
                        ))}
                      </select> */}
                      <Select
                        id="staffID"
                        //disabled={item.SemesterCode === ""}
                        value={data.staffID}
                        data={staffList}
                        onSelect={handleChange}
                        options={{
                          placeholder: "Search staff",
                        }}
                      />
                    </div>
                    <div className="col-md-4">
                      <div className="row ">
                        <button type="submit" className="btn btn-primary mt-8">
                          Assign
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {officerData.length > 0 ? (
              <div className="col-12 mt-9">
                <div className="card-body pt-0">
                  <div className="row">
                    <div className="col-md-12">
                      <h2>Staff Assigned to Course </h2>
                      <Table data={datatable} />
                    </div>
                  </div>
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

export default connect(mapStateToProps, null)(OfficerAssignment);
