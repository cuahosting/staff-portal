import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/report_table";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";

const ActiveStudentListByDepartment = (props) => {
  const token = props.login[0].token;

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [departmentCode, setDepartmentCode] = useState({
    code: "",
  });
  const [tableHeight, setTableHeight] = useState("600px");
  const [canSeeReport, setCanSeeReport] = useState(false);
  const columns = [
    "S/N",
    "StudentID",
    "Student Name",
    "Level",
    "Semester",
    "EmailAddress",
    "Phone Number",
  ];

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleChange = async (e) => {
    setDepartmentCode({
      ...departmentCode,
      [e.target.id]: e.target.value,
    });

    setIsLoading(true);
    e.preventDefault();
    await axios
      .get(`${serverLink}student/student-report/student-list-by-department/${e.target.value}`, token)
      .then((res) => {
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.StudentID,
              item.StudentName,
              item.Level,
              capitalize(item.Semester),
              item.EmailAddress,
              item.PhoneNumber,
            ]);
          });
          setTableHeight(result.length > 100 ? "1000px" : "600px");
          setData(rows);
          setIsLoading(false);
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

  useEffect(() => {
    const getDepartments = async () => {
      axios
        .get(`${serverLink}student/student-report/department-list/`, token)
        .then((response) => {
          setDepartmentList(response.data);
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getDepartments();
  }, []);

  const handleSubmit = async (e) => {};

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Active Student List By Department"}
        items={["Users", "Student Report", "Active Student List By Department"]}
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
                        Select Department
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select Department"
                        id="code"
                        onChange={handleChange}
                        value={departmentCode.code}
                        required
                      >
                        <option value="">Select option</option>
                        {departmentList.map((d, i) => (
                          <option key={i} value={d.DepartmentCode}>
                            {" "}
                            {d.DepartmentName}
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
                      title={`Active Student List By Department`}
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
    login: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(ActiveStudentListByDepartment);

