import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";

function StaffListByModule(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [moduleList, setModuleList] = useState([]);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [module, setModule] = useState({ moduleCode: "", staffID: props.login[0].StaffID });
  const columns = ["S/N", "Staff ID", "Staff Name", "Module Type", "Module Code", "Faculty Name", "Department Name", "OfficialEmailAddress", "Designation", "Phone Number", "Gender"];
  const staffID = props.login[0].StaffID;

  useEffect(() => {
    const fetchData = async () => {
      const { success, data } = await api.get(`staff/staff-report/get-modules-by-staff/${staffID}`);
      if (success && data?.length > 0) {
        let rows = [];
        data.forEach((row) => { rows.push({ value: row.ModuleCode, label: row.ModuleName + " -- " + row.ModuleCode }); });
        setModuleList(rows);
      } else { toast.error("There are no Dean's available"); }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = async (e) => {
    setModule({ ...module, [e.target.id]: e.target.value });
    const { success, data: result } = await api.get(`staff/staff-report/staff-by-modules?moduleCode=${e.target.value}&staffID=${module.staffID}`);
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item, index) => { rows.push([index + 1, item.StaffID, item.StaffName, item.ModuleType, item.ModuleCode, item.FacultyName, item.DepartmentName, item.OfficialEmailAddress, item.DesignationName, item.PhoneNumber, item.Gender]); });
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else { toast.error("There is no report for this modules"); }
    setIsLoading(false);
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Staff List By Module"} items={["Users", "Staff Report", "Staff List By Module"]} />
      <div className="flex-column-fluid"><div className="card"><div className="card-body pt-2"><div className="col-md-12"><div className="row"><form><div className="row fv-row"><div className="col-md-12 fv-row"><label className="required fs-6 fw-bold mb-2">Select Module</label><SearchSelect id="moduleCode" label="Select Module" value={moduleList.find(m => m.value === module.moduleCode) || null} options={moduleList} onChange={(selected) => { handleChange({ target: { id: 'moduleCode', value: selected?.value || '' }, preventDefault: () => { } }); }} placeholder="Search Course" required /></div></div></form></div></div>{canSeeReport && (<div className="row"><div className="col-md-12 mt-5"><ReportTable title={`List of Modules by Staff`} columns={columns} data={data} height={tableHeight} /></div></div>)}</div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(StaffListByModule);
