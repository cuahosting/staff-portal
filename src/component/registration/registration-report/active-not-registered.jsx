import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/ReportTable";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import SearchSelect from "../../common/select/SearchSelect";

const ActiveNotRegistered = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [semester, setSemester] = useState({ code: "" });
  const [semesterList, setSemesterList] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [canSeeReport, setCanSeeReport] = useState(false);
  const columns = ["S/N", "StudentID", "Student Name", "Course", "Student Level", "Student Semester"];

  const semesterOptions = useMemo(() => {
    return semesterList.map(s => ({ value: s.SemesterCode, label: s.Description }));
  }, [semesterList]);

  const handleChange = (e) => {
    setSemester({ ...semester, [e.target.id]: e.target.value });
  };

  useEffect(() => {
    const getSemesters = async () => {
      const { success, data } = await api.get("registration/registration-report/semester-list/");
      if (success && data) {
        setSemesterList(data);
      }
      setIsLoading(false);
    };
    getSemesters();
  }, []);

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const { success, data: result } = await api.get(`registration/registration-report/active-not-registered/${semester.code}`);
    if (success && result?.length > 0) {
      const rows = result.map((item, index) => [
        index + 1, item.StudentID, item.StudentName, item.Course, item.StudentLevel, item.StudentSemester
      ]);
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else if (success) {
      toast.error("There are no student in this department");
      setCanSeeReport(false);
    }
    setIsLoading(false);
  };

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Active Student Not Registered"} items={["Registration", "Registration Report", "Active Students Not Registered"]} />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-2">
            <div className="col-md-12">
              <div className="row">
                <form onSubmit={handleSubmit}>
                  <div className="row fv-row">
                    <div className="col-md-9 fv-row">
                      <label className="required fs-6 fw-bold mb-2">Select Semester</label>
                      <SearchSelect
                        id="code"
                        value={semesterOptions.find(opt => opt.value === semester.code) || null}
                        options={semesterOptions}
                        onChange={(selected) => handleChange({ target: { id: 'code', value: selected?.value || '' } })}
                        placeholder="Select option"
                        isClearable={false}
                      />
                    </div>
                    <div className="col-md-3">
                      <div className="row ">
                        <button type="submit" className="btn btn-primary mt-8">Submit</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {canSeeReport ? (
              <div className="row">
                <div className="col-md-12 mt-5">
                  <ReportTable title={`Active Not Registered`} columns={columns} data={data} height={tableHeight} />
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
  return { loginData: state.LoginDetails };
};

export default connect(mapStateToProps, null)(ActiveNotRegistered);
