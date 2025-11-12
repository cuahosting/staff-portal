import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ReportTable from "../../common/table/report_table";
import Select from "react-select";

function StudentsConstactByLecturerModule(props) {
  const token = props.login[0].token;

  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [moduleList, setModuleList] = useState([]);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [module, setModule] = useState({
    moduleCode: "",
    schoolSemester: "",
  });
  const columns = [
    "S/N",
    "StudentID",
    "Student Name",
    "Phone Number",
    "Email Address",
    "Phone Number",
  ];
  const staffID = props.login[0].StaffID;

  useEffect(() => {
    const getModuleListByLecturer = async () => {
      axios
        .get(`${serverLink}student/student-report/lecturer-module-list/${staffID}`, token)
        .then((response) => {
          let rows = [];
          response.data.length > 0 &&
          response.data.map((row) => {
            rows.push({ text: row.ModuleName + "--" + row.ModuleCode, id: row.ModuleCode});
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

  const handleChange = async (e) => {
    setModule({
      ...module,
      [e.target.id]: e.target.value,
    });

    e.preventDefault();
    await axios.get(`${serverLink}student/student-report/contact-list/${e.target.value}`, token)
      .then((res) => {
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.StudentID,
              item.Name,
              item.PhoneNumber,
              item.EmailAddress,
              item.ParentPhoneNumber,
            ]);
          });
          setTableHeight(result.length > 100 ? "1000px" : "600px");
          setData(rows);
          setCanSeeReport(true);
        } else {
          toast.error("There is no student for this module");
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
        title={"Student Contact By Lecturer Module"}
        items={[
          "Users",
          "Student Report",
          "Student Contact By Lecturer Module",
        ]}
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
                        Select Module
                      </label>
                      <Select
                    id="moduleCode"
                    data={moduleList}
                    value={module.moduleCode}
                    onSelect={handleChange}
                    options={{
                      placeholder: "Search Module",
                    }}
                  />
                      {/* <select
                        className="form-select"
                        data-placeholder="Select Module"
                        id="moduleCode"
                        onChange={handleChange}
                        required
                        value={module.moduleCode}
                      >
                        <option value="">Select option</option>
                        {moduleList.map((m, i) => (
                          <option key={i} value={m.ModuleCode}>
                            {` ${m.ModuleName} (${m.ModuleCode}) `}
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
                      title={`Student Contact By Lecturer Module`}
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

export default connect(mapStateToProps, null)(StudentsConstactByLecturerModule);
