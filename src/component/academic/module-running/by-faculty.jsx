import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import AGReportTable from "../../common/table/AGReportTable";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";
import SearchSelect from "../../common/select/SearchSelect";

const ByFaculty = (props) => {
  const staffId = props.login[0].StaffID;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [canSeeReport, setCanSeeReport] = useState(false);

  const columns = ["S/N", "Faculty Name", "Department Name", "ModuleCode", "Module Name", "Course Code", "Course Name", "Course Level", "Course Semester", "CreditLoad", "Module Type"];

  const [faculty, setFaculty] = useState({ code: "", code2: "" });
  const onfacultyChange = (e) => { setFaculty({ ...faculty, code: e.value, code2: e }); };

  const [facultyList, setFacultyList] = useState([]);

  useEffect(() => {
    const getFaculty = async () => {
      const { success, data } = await api.get(`academics/module-running/faculty-list/${staffId}`);
      if (success && data?.length > 0) {
        let rows = [];
        data.forEach((row) => { rows.push({ value: row.FacultyCode, label: row.FacultyName }); });
        setFacultyList(rows);
      }
      setIsLoading(false);
    };
    getFaculty();
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    const { success, data: result } = await api.get(`academics/module-running/by-faculty/${faculty.code}`);
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item, index) => { rows.push([index + 1, item.FacultyName, item.DepartmentName, item.ModuleCode, item.ModuleName, item.CourseCode, item.CourseName, item.CourseLevel, item.CourseSemester, item.CreditLoad, item.ModuleType]); });
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else { setCanSeeReport(false); toast.error("There are no modules running for this Faculty."); }
    setIsLoading(false);
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Module Running By Faculty"} items={["Academics", "Module Running", "Module Running By Faculty"]} />
      <div className="flex-column-fluid">
        <div className="card card-no-border">
          <div className="card-body p-0">
            <form onSubmit={handleSubmit}><div className="row fv-row"><div className="col-md-9 fv-row"><label className="required fs-6 fw-bold mb-2">Select Faculty</label><SearchSelect name="code" value={faculty.code2} onChange={onfacultyChange} options={facultyList} placeholder="select faculty" /></div><div className="col-md-3"><div className="row"><button type="submit" className="btn btn-primary mt-8">Submit</button></div></div></div></form>
            {canSeeReport && (<div className="row"><div className="col-md-12 mt-5"><AGReportTable title={`Module Running By Faculty`} columns={columns} data={data} height={tableHeight} /></div></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(ByFaculty);
