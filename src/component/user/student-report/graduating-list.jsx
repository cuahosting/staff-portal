import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";
import { connect } from "react-redux";

function GraduatingList(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [allSemester, setAllSemester] = useState([]);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [semester, setSemester] = useState({ code: "" });
  const columns = ["S/N", "Staff ID", "Staff Name", "Module Type", "Module Code", "Faculty Name", "Department Name", "OfficialEmailAddress", "Designation", "Phone Number", "Gender"];

  useEffect(() => {
    const fetchData = async () => {
      const { success, data } = await api.get("staff/timetable/timetable/semester");
      if (success) { setAllSemester(data || []); }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = async (e) => {
    setSemester({ ...semester, [e.target.id]: e.target.value });
    const { success, data: result } = await api.get(`staff/student-report/graduating-list/${e.target.value}`);
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
      <PageHeader title={"Graduating List"} items={["Users", "Students Report", "Graduating List"]} />
      <div className="flex-column-fluid"><div className="card"><div className="card-body pt-2"><div className="col-md-12"><div className="row"><form><div className="row fv-row"><div className="col-md-12 fv-row"><label className="required fs-6 fw-bold mb-2">Select School Semester</label><SearchSelect id="code" label="Select School Semester" value={allSemester.map(s => ({ value: s.SemesterCode, label: s.SemesterName })).find(s => s.value === semester.code) || null} options={allSemester.map(s => ({ value: s.SemesterCode, label: s.SemesterName }))} onChange={(selected) => handleChange({ target: { id: 'code', value: selected?.value || '' }, preventDefault: () => { } })} placeholder="Select school semester" required /></div></div></form></div></div>{canSeeReport && (<div className="row"><div className="col-md-12 mt-5"><ReportTable title={`Graduating List`} columns={columns} data={data} height={tableHeight} /></div></div>)}</div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(GraduatingList);
