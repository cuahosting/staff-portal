import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import AGReportTable from "../../common/table/AGReportTable";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";
import SearchSelect from "../../common/select/SearchSelect";

const ByDepartment = (props) => {
  const staffId = props.login[0].StaffID;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [canSeeReport, setCanSeeReport] = useState(false);

  const columns = ["S/N", "Faculty Name", "Department Name", "ModuleCode", "Module Name", "Course Code", "Course Name", "Course Level", "Course Semester", "CreditLoad", "Module Type"];

  const [departments, setDepartment] = useState({ code: "", code2: "" });
  const ondepartmentsChange = (e) => { setDepartment({ ...departments, code: e.value, code2: e }); };

  const [departmentList, setDepartmentsList] = useState([]);

  useEffect(() => {
    const getDepartments = async () => {
      const { success, data } = await api.get(`academics/module-running/department-list/${staffId}`);
      if (success && data?.length > 0) {
        let rows = [];
        data.forEach((row) => { rows.push({ value: row.DepartmentCode, label: row.DepartmentName }); });
        setDepartmentsList(rows);
      }
      setIsLoading(false);
    };
    getDepartments();
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    const { success, data: result } = await api.get(`academics/module-running/by-department/${departments.code}`);
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item, index) => { rows.push([index + 1, item.FacultyName, item.DepartmentName, item.ModuleCode, item.ModuleName, item.CourseCode, item.CourseName, item.CourseLevel, item.CourseSemester, item.CreditLoad, item.ModuleType]); });
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else { setCanSeeReport(false); toast.error("There are no modules running for this Department."); }
    setIsLoading(false);
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Module Running By Department"} items={["Academics", "Module Running", "Module Running By Department"]} />
      <div className="flex-column-fluid">
        <div className="card card-no-border">
          <div className="card-body p-0">
            <div className="col-md-12"><div className="row"><form onSubmit={handleSubmit}><div className="row fv-row"><div className="col-md-9 fv-row"><label className="required fs-6 fw-bold mb-2">Select Course</label><SearchSelect name="code" value={departments.code2} onChange={ondepartmentsChange} options={departmentList} placeholder="select departments" /></div><div className="col-md-3"><div className="row"><button type="submit" className="btn btn-primary mt-8">Submit</button></div></div></div></form></div></div>
            {canSeeReport && (<div className="row"><div className="col-md-12 mt-5"><AGReportTable title={`Module Running By Department`} columns={columns} data={data} height={tableHeight} /></div></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(ByDepartment);
