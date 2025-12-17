import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import PageHeader from "../../../common/pageheader/pageheader";
import Loader from "../../../common/loader/loader";
import { api } from "../../../../resources/api";
import SearchSelect from "../../../common/select/SearchSelect";
import AGReportTable from "../../../common/table/AGReportTable";

function TimeTableByBlock(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [allSemester, setAllSemester] = useState([]);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [timetable, setTimetable] = useState({ block: "", schoolSemester: "", schoolSemester2: "" });
  const columns = ["Day", "Module", "Type", "Block", "Venue", "Start Time", "End Time", "Staff Name"];

  useEffect(() => {
    const fetchData = async () => {
      const [semRes, blkRes] = await Promise.all([
        api.get("staff/timetable/timetable/semester"),
        api.get("staff/academics/block/list")
      ]);
      if (semRes.success && semRes.data?.length > 0) { let rows = []; semRes.data.forEach((row) => { rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode }); }); setAllSemester(semRes.data); setSemesterOptions(rows); }
      if (blkRes.success) { setBlocks(blkRes.data || []); }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const onSemesterChange = (e) => { setTimetable({ ...timetable, schoolSemester: e.value, schoolSemester2: e }); };
  const handleChange = (e) => { setTimetable({ ...timetable, [e.target.id]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success, data: result } = await api.post("staff/academics/timetable/module-by-block", { block: timetable.block, semester: timetable.schoolSemester });
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item) => { rows.push([item.DayName, item.ModuleCode, item.ModuleType, item.BlockName, item.VenueName, item.StartTime, item.EndTime, item.StaffName]); });
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else { toast.error("There is no this block"); }
    setIsLoading(false);
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Timetable By Block"} items={["Academic", "Timetable", "Timetable By Block"]} />
      <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-header border-0 pt-6"><div className="card-title" /></div><div className="card-body p-0"><div className="col-md-12"><div className="row"><form onSubmit={handleSubmit}><div className="row fv-row"><div className="col-md-4 fv-row"><label className="required fs-6 fw-bold mb-2">Select Block</label><select className="form-select" data-placeholder="Select Blocks" id="block" onChange={handleChange} value={timetable.block} required><option value="">Select option</option>{blocks.map((b, i) => (<option key={i} value={b.EntryID}>{b.BlockName}</option>))}</select></div><div className="col-md-4 fv-row"><label className="required fs-6 fw-bold mb-2">Select School Semester</label><SearchSelect name="schoolSemester" value={timetable.schoolSemester2} onChange={onSemesterChange} options={semesterOptions} placeholder="select Semester" /></div><div className="col-md-4"><div className="row"><button type="submit" className="btn btn-primary mt-8">Submit</button></div></div></div></form></div></div>{canSeeReport && (<div className="row"><div className="col-md-12 mt-5"><AGReportTable title={`Timetable By Block`} columns={columns} data={data} height={tableHeight} /></div></div>)}</div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(TimeTableByBlock);
