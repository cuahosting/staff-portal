import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/report_table";
import { connect } from "react-redux";

function JambReport(props) {
  const token = props.login[0].token;

  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [allSemester, setAllSemester] = useState([]);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [semester, setSemester] = useState({
    code: "",
  });
  const columns = [
    "S/N",
    "StudentID",
    "First Name",
    "Middle Name",
    "Surname",
    "Date of Birth",
    "Gender",
    "Nationality",
    "State of Origin",
    "Phone",
    "Email Address",
    "Course",
    "Mode Of Entry",
  ];

  useEffect(() => {
    const getSchoolSemester = async () => {
      axios
        .get(`${serverLink}staff/timetable/timetable/semester`, token)
        .then((response) => {
          setAllSemester(response.data);
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getSchoolSemester();
  }, []);

  const handleChange = async (e) => {
    setSemester({
      ...semester,
      [e.target.id]: e.target.value,
    });

    e.preventDefault();
    await axios
      .get(`${serverLink}student/student-report/jamb-report/${e.target.value}`, token)
      .then((res) => {
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.StudentID,
              item.FirstName,
              item.Surname,
              item.LastName,
              item.DateOfBirth,
              item.Gender,
              item.Nationality,
              item.StateOfOrigin,
              item.EmailAddress,
              item.Course,
              item.ModeOfEntry,
            ]);
          });
          setTableHeight(result.length > 100 ? "1000px" : "600px");
          setData(rows);
          setCanSeeReport(true);
        } else {
          toast.error("There is no report for this semester");
          setCanSeeReport(false);
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
        title={"Jamb Report"}
        items={["Users", "Student Report", "Jamb Report"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-2">
            <div className="col-md-12">
              <div className="row">
                <form>
                  <div className="row fv-row">
                    <div className="col-md-12 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select School Semester
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select school semester"
                        id="code"
                        required
                        onChange={handleChange}
                        value={semester.code}
                      >
                        <option value="">Select option</option>
                        {allSemester.map((semester, index) => (
                          <option key={index} value={semester.SemesterCode}>
                            {semester.SemesterName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {canSeeReport ? (
              <div className="row">
                <div className="col-md-12 mt-5">
                  {
                    <ReportTable
                      title={`Jamb Report`}
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

export default connect(mapStateToProps, null)(JambReport);
