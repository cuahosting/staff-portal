import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";

const ActiveStudentListByModeOfEntry = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [entry, setEntry] = useState({ type: "" });
  const [mode, setMode] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [canSeeReport, setCanSeeReport] = useState(false);
  const columns = ["S/N", "StudentID", "Student Name", "Course", "Level", "Semester", "EmailAddress", "Phone Number"];
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleChange = async (e) => {
    setEntry({ ...entry, [e.target.id]: e.target.value });
    setIsLoading(true);
    const { success, data: result } = await api.get(`student/student-report/student-list-by-mode/${e.target.value}`);
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item, index) => { rows.push([index + 1, item.StudentID, item.StudentName, capitalize(item.Course), item.Level, capitalize(item.Semester), item.EmailAddress, item.PhoneNumber]); });
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else { toast.error("There are no student with this mode of entry"); }
    setIsLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { success, data } = await api.get("student/student-report/mode-of-entry/");
      if (success) { setMode(data || []); }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Active Student List By Mode Of Entry"} items={["Users", "Student Report", "Active Student List By Mode Of Entry"]} />
      <div className="flex-column-fluid"><div className="card"><div className="card-body p-0"><div className="col-md-12"><div className="row"><form><div className="row fv-row"><div className="col-md-12 fv-row"><label className="required fs-6 fw-bold mb-2">Select Mode of Entry</label><SearchSelect id="type" label="Select Mode of Entry" value={mode.map(m => ({ value: m.ModeOfEntry, label: m.ModeOfEntry })).find(s => s.value === entry.type) || null} options={mode.map(m => ({ value: m.ModeOfEntry, label: m.ModeOfEntry }))} onChange={(selected) => handleChange({ target: { id: 'type', value: selected?.value || '' }, preventDefault: () => { } })} placeholder="Select Mode Of Entry" required /></div></div></form></div></div>{canSeeReport && (<div className="row"><div className="col-md-12 mt-5"><ReportTable title={`Active Student List By Mode Of Entry`} columns={columns} data={data} height={tableHeight} /></div></div>)}</div></div></div>
    </div>
  );
};

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(ActiveStudentListByModeOfEntry);
