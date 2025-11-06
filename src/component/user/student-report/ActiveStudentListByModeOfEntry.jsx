import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/report_table";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";

const ActiveStudentListByModeOfEntry = (props) => {
  const token = props.login[0].token;

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [entry, setEntry] = useState({
    type: "",
  });
  const [mode, setMode] = useState([]);
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

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleChange = async (e) => {
    setEntry({
      ...entry,
      [e.target.id]: e.target.value,
    });

    setIsLoading(true);
    e.preventDefault();
    await axios
      .get(
        `${serverLink}student/student-report/student-list-by-mode/${e.target.value}`, token)
      .then((res) => {
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.StudentID,
              item.StudentName,
              capitalize(item.Course),
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
          toast.error("There are no student with this mode of entry");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("NETWORK ERROR");
      });
  };

  useEffect(() => {
    const getModeOfEntry = async () => {
      axios
        .get(`${serverLink}student/student-report/mode-of-entry/`, token)
        .then((response) => {
          setMode(response.data);
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getModeOfEntry();
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Active Student List By Mode Of Entry"}
        items={[
          "Users",
          "Student Report",
          "Active Student List By Mode Of Entry",
        ]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-0">
            <div className="col-md-12">
              <div className="row">
                <form>
                  <div className="row fv-row">
                    <div className="col-md-12 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select Mode of Entry
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select Mode Of Entry"
                        id="type"
                        onChange={handleChange}
                        value={entry.type}
                        required
                      >
                        <option value="">Select option</option>
                        {mode.map((m, i) => (
                          <option key={i} value={m.ModeOfEntry}>
                            {m.ModeOfEntry}
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
                      title={`Active Student List By Mode Of Entry`}
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

export default connect(mapStateToProps, null)(ActiveStudentListByModeOfEntry);
