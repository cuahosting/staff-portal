import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";

function StaffListByModuleAndSemester(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [moduleList, setModuleList] = useState([]);
  const [allSemester, setAllSemester] = useState([]);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [module, setModule] = useState({ moduleCode: "", schoolSemester: "", staffID: props.login[0].StaffID });
  const columns = ["S/N", "Staff ID", "Staff Name", "Module Type", "Module Code", "Faculty Name", "Department Name", "OfficialEmailAddress", "Designation", "Phone Number", "Gender"];
  const staffID = props.login[0].StaffID;

  useEffect(() => {
    const fetchData = async () => {
      const [modRes, semRes] = await Promise.all([
        api.get(`staff/staff-report/get-modules-by-staff/${staffID}`),
        api.get("staff/timetable/timetable/semester")
      ]);
      if (modRes.success && modRes.data?.length > 0) {
        let rows = [];
        modRes.data.forEach((row) => { rows.push({ label: row.ModuleName + "--" + row.ModuleCode, value: row.ModuleCode }); });
        setModuleList(rows);
      } else { toast.error("There are no Dean's available"); }
      if (semRes.success) { setAllSemester(semRes.data || []); }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e) => { setModule({ ...module, [e.target.id]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success, data: result } = await api.get(`staff/staff-report/staff-by-modules-and-semester?moduleCode=${module.moduleCode}&staffID=${module.staffID}&schoolSemester=${module.schoolSemester}`);
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item, index) => { rows.push([index + 1, item.StaffID, item.StaffName, item.ModuleType, item.ModuleCode, item.FacultyName, item.DepartmentName, item.OfficialEmailAddress, item.DesignationName, item.PhoneNumber, item.Gender]); });
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else { toast.error("There is no staff for this modules"); setCanSeeReport(false); }
    setIsLoading(false);
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Staff List By Module And Semester"} items={["Users", "Staff Report", "Staff List By Module And Semester"]} />
      <div className="flex-column-fluid"><div className="card"><div className="card-body pt-2"><div className="col-md-12"><div className="row"><form onSubmit={handleSubmit}><div className="row fv-row"><div className="col-md-4 fv-row"><label className="required fs-6 fw-bold mb-2">Select Module</label><SearchSelect id="moduleCode" label="Select Module" value={moduleList.find(op => op.value === module.moduleCode) || null} options={moduleList} onChange={(selected) => handleChange({ target: { id: 'moduleCode', value: selected?.value || '' } })} placeholder="Search Module" required /></div><div className="col-md-4 fv-row"><label className="required fs-6 fw-bold mb-2">Select School Semester</label><SearchSelect id="schoolSemester" label="Select School Semester" value={allSemester.map(s => ({ value: s.SemesterCode, label: s.SemesterName })).find(s => s.value === module.schoolSemester) || null} options={allSemester.map(s => ({ value: s.SemesterCode, label: s.SemesterName }))} onChange={(selected) => handleChange({ target: { id: 'schoolSemester', value: selected?.value || '' }, preventDefault: () => { } })} placeholder="Select school semester" required /></div><div className="col-md-4"><div className="row "><button type="submit" className="btn btn-primary mt-8">Submit</button></div></div></div></form></div></div>{canSeeReport && (<div className="row"><div className="col-md-12 mt-5"><ReportTable title={`List of Modules by Module and Semester`} columns={columns} data={data} height={tableHeight} /></div></div>)}</div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(StaffListByModuleAndSemester);
