import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";

function StaffListByDesignation(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [designationList, setDesignationList] = useState([]);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [designation, setDesignation] = useState({ designationID: "" });
  const columns = ["S/N", "Staff ID", "Staff Name", "Official Email Address", "Faculty Name", "Department Name", "Designation", "Phone Number", "Gender"];

  useEffect(() => {
    const fetchData = async () => {
      const { success, data: result } = await api.get("staff/staff-report/designation-list");
      if (success && result?.length > 0) { setDesignationList(result); }
      else { toast.error("Unable to load designation"); }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = async (e) => {
    setDesignation({ ...designation, [e.target.id]: e.target.value });
    const { success, data: result } = await api.get(`staff/staff-report/staff-list-by-designation/${e.target.value}`);
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item, index) => { rows.push([index + 1, item.StaffID, item.StaffName, item.OfficialEmailAddress, item.FacultyName, item.DepartmentName, item.DesignationName, item.PhoneNumber, item.Gender]); });
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else { toast.error("There are no staff for this designation"); setCanSeeReport(false); }
    setIsLoading(false);
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Staff List By Designation"} items={["Users", "Staff Report", "Staff List By Designation"]} />
      <div className="flex-column-fluid"><div className="card"><div className="card-body pt-2"><div className="col-md-12"><div className="row"><form><div className="row fv-row"><div className="col-md-12 fv-row"><label className="required fs-6 fw-bold mb-2">Select Designation</label><SearchSelect id="designationID" label="Select Designation" value={designationList.map(d => ({ value: d.EntryID, label: d.DesignationName })).find(s => s.value === designation.designationID) || null} options={designationList.map(d => ({ value: d.EntryID, label: d.DesignationName }))} onChange={(selected) => handleChange({ target: { id: 'designationID', value: selected?.value || '' }, preventDefault: () => { } })} placeholder="Select Designation" required /></div></div></form></div></div>{canSeeReport && (<div className="row"><div className="col-md-12 mt-5"><ReportTable title={`List of Staff by Designation`} columns={columns} data={data} height={tableHeight} /></div></div>)}</div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(StaffListByDesignation);
