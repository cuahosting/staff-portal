import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/ReportTable";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";

const RegisteredStudentsCountByModule = (props) => {
  const token = props.loginData[0].token;

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [semester, setSemester] = useState({
    code: "",
  });
  const [semesterList, setSemesterList] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [canSeeReport, setCanSeeReport] = useState(false);
  const columns = [
    "S/N",
    "ModuleCode",
    "Module Name",
    "Course Name",
    "Student Level",
    "Student Semester",
    "Department",
    "Student Count",
  ];

  const handleChange = (e) => {
    setSemester({
      ...semester,
      [e.target.id]: e.target.value,
    });
  };

  useEffect(() => {
    const getSemesters = async () => {
      axios
        .get(`${serverLink}registration/registration-report/semester-list/`, token)
        .then((response) => {
          setSemesterList(response.data);
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getSemesters();
  }, []);

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    await axios
      .get(
        `${serverLink}registration/registration-report/registered-student-count-by-module/${semester.code}`, token
      )
      .then((res) => {
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.ModuleCode,
              item.ModuleName,
              item.CourseName,
              item.StudentLevel,
              item.StudentSemester,
              item.DepartmentName,
              item.StudentCount,
            ]);
          });
          setTableHeight(result.length > 100 ? "1000px" : "600px");
          setData(rows);
          setCanSeeReport(true);
        } else {
          toast.error("There are no student in this department");
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
        title={"Registered Student Count By Module"}
        items={[
          "Registration",
          "Registration Report",
          "ARegistered Student Count By Module",
        ]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-2">
            <div className="col-md-12">
              <div className="row">
                <form onSubmit={handleSubmit}>
                  <div className="row fv-row">
                    <div className="col-md-9 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select Semester
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select Semester"
                        id="code"
                        onChange={handleChange}
                        value={semester.code}
                        required
                      >
                        <option value="">Select option</option>
                        {semesterList.map((s, i) => (
                          <option key={i} value={s.SemesterCode}>
                            {s.Description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
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
                    <ReportTable
                      title={`Registered Student Count By Module`}
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
};
const mapStateToProps = (state) => {
  return {
      loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(RegisteredStudentsCountByModule);

