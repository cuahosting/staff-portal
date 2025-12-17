import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import { connect } from "react-redux";
import SearchSelect from "../../common/select/SearchSelect";

function StudentsConstactByModule(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [moduleList, setModuleList] = useState([]);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [module, setModule] = useState({ moduleCode: "", schoolSemester: "" });
  const columns = ["S/N", "StudentID", "Student Name", "Phone Number", "Email Address", "Phone Number"];

  useEffect(() => {
    const fetchData = async () => {
      const { success, data: result } = await api.get("student/student-report/module-list/");
      if (success && result?.length > 0) {
        let rows = [];
        result.forEach((row) => { rows.push({ value: row.ModuleCode, label: row.ModuleName + " -- " + row.ModuleCode }); });
        setModuleList(rows);
      } else { toast.error("There are no Modules available"); }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = async (e) => {
    setModule({ ...module, [e.target.id]: e.target.value });
    const { success, data: result } = await api.get(`student/student-report/contact-list/${e.target.value}`);
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item, index) => { rows.push([index + 1, item.StudentID, item.Name, item.PhoneNumber, item.EmailAddress, item.ParentPhoneNumber]); });
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else { toast.error("There is no student for this module"); setCanSeeReport(false); }
    setIsLoading(false);
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Students Contact By Module (All)"} items={["Users", "Student Report", "Students Contact By Module (All)"]} />
      <div className="flex-column-fluid"><div className="card"><div className="card-body pt-2"><div className="col-md-12"><div className="row"><form><div className="row fv-row"><div className="col-md-12 fv-row"><SearchSelect id="moduleCode" label="Select Module" value={moduleList.find(m => m.value === module.moduleCode) || null} options={moduleList} onChange={(selected) => { handleChange({ target: { id: 'moduleCode', value: selected?.value || '' }, preventDefault: () => { } }); }} placeholder="Search Module" required /></div></div></form></div></div>{canSeeReport && (<div className="row"><div className="col-md-12 mt-5"><ReportTable title={`Student Contact By Module (All)`} columns={columns} data={data} height={tableHeight} /></div></div>)}</div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(StudentsConstactByModule);
