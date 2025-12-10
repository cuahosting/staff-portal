import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/ReportTable";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import SearchSelect from "../../common/select/SearchSelect";

const StudentListByLecturerModule = (props) => {
  const token = props.login[0].token;

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [moduleList, setModuleList] = useState([]);
  const [moduleCode, setModuleCode] = useState({
    code: "",
  });
  const [tableHeight, setTableHeight] = useState("600px");
  const [canSeeReport, setCanSeeReport] = useState(false);
  const columns = [
    "S/N",
    "StudentID",
    "Student Name",
    "Course",
    "Level",
    "Semester",
    "EmailAddress",
    "Phone Number",
  ];
  const staffID = props.login[0].StaffID;
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleChange = async (e) => {
    setModuleCode({
      ...moduleCode,
      [e.target.id]: e.target.value,
    });

    setIsLoading(true);
    e.preventDefault();
    await axios
      .get(`${serverLink}student/student-report/student-list-by-lecturer-module/${e.target.value}`, token)
      .then((res) => {
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.StudentID,
              item.StudentName,
              capitalize(item.CourseName),
              item.Level,
              capitalize(item.Semester),
              item.EmailAddress,
              item.PhoneNumber,
            ]);
          });
          setTableHeight(result.length > 100 ? "1000px" : "600px");
          setData(rows);
          setCanSeeReport(true);
        } else {
          toast.error("There are no student for this module");
          setCanSeeReport(false);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("NETWORK ERROR");
      });
  };

  useEffect(() => {
    const getModuleListByLecturer = async () => {
      axios
        .get(`${serverLink}student/student-report/lecturer-module-list/${staffID}`, token)
        .then((response) => {
          let rows = [];
          response.data.length > 0 &&
            response.data.map((row) => {
              rows.push({ value: row.ModuleCode, label: row.ModuleName + " -- " + row.ModuleCode });
            });
          setModuleList(rows);
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getModuleListByLecturer();
  }, []);

  const handleSubmit = async (e) => { };
  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Student List By Lecturer Module"}
        items={["Users", "Student Report", "Student List By Lecturer Module"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-2">
            <div className="col-md-12">
              <div className="row">
                <form>
                  <div className="row fv-row">
                    <div className="col-md-12 fv-row">
                      <SearchSelect
                        id="code"
                        label="Select Module"
                        value={moduleList.find(m => m.value === moduleCode.code) || null}
                        options={moduleList}
                        onChange={(selected) => {
                          handleChange({ target: { id: 'code', value: selected?.value || '' }, preventDefault: () => { } });
                        }}
                        placeholder="Search Module"
                        required
                      />
                      {/* <select
                        className="form-select"
                        data-placeholder="Select Module"
                        id="code"
                        onChange={handleChange}
                        value={moduleCode.code}
                        required
                      >
                        <option value="">Select option</option>
                        {moduleList.map((m, i) => (
                          <option key={i} value={m.ModuleCode}>
                            {m.ModuleName}
                          </option>
                        ))}
                      </select> */}
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

export default connect(mapStateToProps, null)(StudentListByLecturerModule);
