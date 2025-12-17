import React, { useEffect, useState } from "react";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import SearchSelect from "../../../common/select/SearchSelect";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";

function ManageTimetableSchedule(props) {
  const navigation = useNavigate();
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [item, setItem] = useState({ SemesterCode: "", SemesterCode2: null, ModuleCode: "", ModuleCode2: null, StartTime: "", StartTime2: null, EndTime: "", EndTime2: null, ModuleType: "", ModuleType2: null, DayName: "", DayName2: null, VenueID: "", VenueID2: null, EntryID: "", InsertedBy: props.loginData[0].StaffID });
  const schedule_time = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const [timetableSemester, setTimetableSemester] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [moduleList, setModuleList] = useState([]);
  const [venueList, setVenueList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [timetableStaff, setTimetableStaff] = useState([]);
  const [timetableGroup, setTimetableGroup] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [runningModuleList, setRunningModuleList] = useState([]);
  const [studentGroupList, setStudentGroupList] = useState([]);
  const [conflictCheck, setConflictCheck] = useState({ bypass: false, venue: false, venue_id: '', staff: false, staff_id: '', group: false, group_id: '' });
  const [canSubmit, setCanSubmit] = useState(false);

  const moduleTypeOptions = [{ value: 'Lecture', label: 'Lecture' }, { value: 'Interactive', label: 'Interactive' }, { value: 'Class', label: 'Class' }, { value: 'Workshop', label: 'Workshop' }, { value: 'Online', label: 'Online' }, { value: 'Seminar', label: 'Seminar' }];
  const dayOptions = [{ value: 'Monday', label: 'Monday' }, { value: 'Tuesday', label: 'Tuesday' }, { value: 'Wednesday', label: 'Wednesday' }, { value: 'Thursday', label: 'Thursday' }, { value: 'Friday', label: 'Friday' }, { value: 'Saturday', label: 'Saturday' }];
  const timeOptions = schedule_time.map(t => ({ value: t, label: `${t}:00` }));

  const resetItem = () => { setItem({ SemesterCode: "", SemesterCode2: null, ModuleCode: "", ModuleCode2: null, StartTime: "", StartTime2: null, EndTime: "", EndTime2: null, ModuleType: "", ModuleType2: null, DayName: "", DayName2: null, VenueID: "", VenueID2: null, EntryID: "", InsertedBy: props.loginData[0].StaffID }); };

  const getRecords = async () => {
    const [semRes, modRes, venRes, grpRes, staffRes, runRes] = await Promise.all([
      api.get("staff/timetable/timetable/semester"),
      api.get("staff/academics/module/list"),
      api.get("staff/timetable/timetable/venue/view"),
      api.get("staff/timetable/timetable/student/group/list"),
      api.get("staff/report/staff/list/status/1"),
      api.get("staff/academics/module/running/list")
    ]);

    if (semRes.success && semRes.data?.length > 0) { let rows = []; semRes.data.forEach((row) => { rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode }); }); setTimetableSemester(semRes.data); setSemesterOptions(rows); }
    if (modRes.success && modRes.data?.length > 0) { let rows = []; modRes.data.forEach((row) => { rows.push({ value: row.ModuleCode, label: `${row.ModuleName} (${row.ModuleCode})` }); }); setModuleList(rows); }
    if (venRes.success && venRes.data?.length > 0) { let rows = []; venRes.data.forEach((row) => { rows.push({ value: row.VenueID, label: `${row.CampusName} => ${row.BlockName} => ${row.VenueName}` }); }); setVenueList(rows); }
    if (grpRes.success) { setStudentGroupList(grpRes.data || []); let rows = []; grpRes.data?.forEach((row) => { rows.push({ value: row.EntryID, label: row.GroupName }); }); setGroupList(rows); }
    if (staffRes.success && staffRes.data?.length > 0) { let rows = []; staffRes.data.forEach((row) => { rows.push({ value: row.StaffID, label: `${row.StaffName} (${row.StaffID})` }); }); setStaffList(rows); }
    if (runRes.success) { setRunningModuleList(runRes.data || []); }

    if (typeof slug === 'undefined') { setIsLoading(false); }
    else {
      const { success, data } = await api.get(`staff/timetable/timetable/single/${slug}`);
      if (success && data?.timetable?.length > 0) {
        const tt = data.timetable[0];
        setItem({ SemesterCode: tt.SemesterCode, SemesterCode2: { value: tt.SemesterCode, label: tt.SemesterCode }, ModuleCode: tt.ModuleCode, ModuleCode2: { value: tt.ModuleCode, label: tt.ModuleCode }, StartTime: tt.StartTime, StartTime2: { value: tt.StartTime, label: `${tt.StartTime}:00` }, EndTime: tt.EndTime, EndTime2: { value: tt.EndTime, label: `${tt.EndTime}:00` }, ModuleType: tt.ModuleType, ModuleType2: { value: tt.ModuleType, label: tt.ModuleType }, DayName: tt.DayName, DayName2: { value: tt.DayName, label: tt.DayName }, VenueID: tt.VenueID, VenueID2: { value: tt.VenueID, label: tt.VenueID }, EntryID: tt.EntryID });
        if (data.staff?.length > 0) { setTimetableStaff(data.staff.map(st => ({ value: st.StaffID, label: st.StaffID }))); }
        if (data.group?.length > 0) { setTimetableGroup(data.group.map(st => ({ value: parseInt(st.GroupID), label: st.GroupID }))); }
      }
      setIsLoading(false);
    }
  };

  const onSubmit = async () => {
    setConflictCheck({ ...conflictCheck, venue: false, venue_id: '', staff: false, staff_id: '', group: false, group_id: '' }); setCanSubmit(false);
    if (item.SemesterCode === '') { toast.error('Please select school semester'); return false; }
    if (item.ModuleCode === '') { toast.error('Please select module'); return false; }
    if (item.ModuleType === '') { toast.error('Please select module type'); return false; }
    if (item.DayName === '') { toast.error('Please select schedule day'); return false; }
    if (item.StartTime === '') { toast.error('Please select start time'); return false; }
    if (item.EndTime === '') { toast.error('Please select end time'); return false; }
    if (item.VenueID === '') { toast.error('Please select venue'); return false; }

    const staffIds = timetableStaff.map(s => s.value);
    const groupIds = timetableGroup.map(g => g.value);
    if (staffIds.length < 1) { toast.error('Please select schedule lecturer(s)'); return false; }
    if (groupIds.length < 1) { toast.error("Please select schedule student group(s)"); return false; }
    toast.info('Submitting... Please wait!');

    for (let index = 0; index < staffIds.length; index++) {
      const staff = staffIds[index];
      const sendRecord = { schedule: item, group: groupIds, staff: staff };
      const { success, data } = await api.post("staff/timetable/schedule/check/conflict/staff", sendRecord);
      if (success && data?.message === 'failed') { toast.error(`STAFF CONFLICT: ${data.data}`); setConflictCheck({ ...conflictCheck, staff: true, staff_id: data.data }); }
      if (index + 1 === staffIds.length && conflictCheck.bypass) { setCanSubmit(true); }
    }

    if (!conflictCheck.bypass) {
      for (let index = 0; index < groupIds.length; index++) {
        const group_id = groupIds[index];
        const sendRecord = { schedule: item, group: groupIds, group_id: group_id };
        const { success, data } = await api.post("staff/timetable/schedule/check/conflict/group", sendRecord);
        if (success && data?.message === 'failed') { const groupLabel = groupList.find(i => i.value === data.data)?.label || data.data; toast.error(`GROUP CONFLICT: ${groupLabel}`); setConflictCheck({ ...conflictCheck, group: true, group_id: data.data }); }
        if (index + 1 === groupIds.length) { setCanSubmit(true); }
      }
    }
  };

  const handleSubmit = async () => {
    item.InsertedBy = props.loginData[0].StaffID;
    const staffIds = timetableStaff.map(s => s.value);
    const groupIds = timetableGroup.map(g => g.value);
    const sendData = { schedule: item, group: groupIds, staff: staffIds };

    if (item.EntryID === '') {
      const { success, data } = await api.post("staff/timetable/schedule/add", sendData);
      if (success) {
        if (data?.message === 'failed_hall_conflict') { const venueLabel = venueList.find(i => i.value === parseInt(data.data))?.label || data.data; toast.error(`${venueLabel} has a schedule class`); setConflictCheck({ ...conflictCheck, venue: true, venue_id: data.data }); }
        else if (data?.message === 'success') { toast.success(`Timetable schedule added successfully`); resetItem(); setTimetableStaff([]); setTimetableGroup([]); }
        else { toast.error('Something went wrong. Please check your network and try again!'); }
      }
    } else {
      const { success, data } = await api.patch("staff/timetable/schedule/update", sendData);
      if (success) {
        if (data?.message === 'failed_hall_conflict') { const venueLabel = venueList.find(i => i.value === parseInt(data.data))?.label || data.data; toast.error(`${venueLabel} has a schedule class`); setConflictCheck({ ...conflictCheck, venue: true, venue_id: data.data }); }
        else if (data?.message === 'success') { toast.success(`Timetable schedule updated successfully`); navigation('/academics/timetable/timetable-report'); }
        else { toast.error('Something went wrong. Please check your network and try again!'); }
      }
    }
  };

  useEffect(() => { if (canSubmit && !conflictCheck.staff && !conflictCheck.group) { handleSubmit(); } }, [canSubmit]);

  const onLoadModuleGroupData = async (module_code) => {
    setIsLoading(true);
    let list = [];
    studentGroupList.length > 0 && studentGroupList.forEach((ii) => { let filter = runningModuleList.filter((i) => i.CourseCode === ii.CourseCode && i.CourseLevel === ii.CourseLevel && i.CourseSemester === ii.CourseSemester && i.ModuleCode === module_code); if (filter.length > 0) { const groupOption = groupList.find(g => g.value === ii.EntryID); if (groupOption) { list.push(groupOption); } } });
    setTimetableGroup(list);
    const { success, data } = await api.post("staff/timetable/schedule/check/conflict/bypass", { ModuleCode: module_code });
    if (success) { setConflictCheck({ ...conflictCheck, bypass: data?.message === 'true' }); }
    setIsLoading(false);
  };

  useEffect(() => { getRecords(); }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Manage Timetable"} items={["Academics", "Manage Timetable"]} />
      <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-body p-0">
        <div className="row pt-5"><div className="col-md-4"><SearchSelect id="SemesterCode" label="Select School Semester" value={item.SemesterCode2} options={semesterOptions} onChange={(selected) => { setItem({ ...item, SemesterCode: selected?.value || '', SemesterCode2: selected }); }} placeholder="Select Semester" /></div><div className="col-md-4"><SearchSelect id="ModuleCode" label="Select Module" value={item.ModuleCode2} options={moduleList} onChange={(selected) => { setItem({ ...item, ModuleCode: selected?.value || '', ModuleCode2: selected, EndTime: '', EndTime2: null }); if (selected?.value) { onLoadModuleGroupData(selected.value); } }} isDisabled={item.SemesterCode === ""} placeholder="Search Module" /></div><div className="col-md-4"><SearchSelect id="ModuleType" label="Module Type" value={item.ModuleType2} options={moduleTypeOptions} onChange={(selected) => { setItem({ ...item, ModuleType: selected?.value || '', ModuleType2: selected }); }} placeholder="Select Option" /></div></div>
        <div className="row"><div className="col-md-4"><SearchSelect id="DayName" label="Day" value={item.DayName2} options={dayOptions} onChange={(selected) => { setItem({ ...item, DayName: selected?.value || '', DayName2: selected }); }} placeholder="Select Option" /></div><div className="col-md-4"><SearchSelect id="StartTime" label="Start Time" value={item.StartTime2} options={timeOptions} onChange={(selected) => { setItem({ ...item, StartTime: selected?.value || '', StartTime2: selected, EndTime: '', EndTime2: null }); }} placeholder="Select Option" /></div><div className="col-md-4"><SearchSelect id="EndTime" label="End Time" value={item.EndTime2} options={item.StartTime !== "" ? timeOptions.filter(t => t.value > item.StartTime && t.value <= item.StartTime + 4) : []} onChange={(selected) => { setItem({ ...item, EndTime: selected?.value || '', EndTime2: selected }); }} placeholder="Select Option" /></div></div>
        <div className="row"><div className="col-md-6"><SearchSelect id="VenueID" label="Select Venue" value={item.VenueID2} options={venueList} onChange={(selected) => { setItem({ ...item, VenueID: selected?.value || '', VenueID2: selected }); }} placeholder="Search Venue" /></div><div className="col-md-6"><SearchSelect id="StaffID" label="Select Staff" value={timetableStaff} options={staffList} onChange={(selected) => setTimetableStaff(selected || [])} isMulti placeholder="Search Staff" /></div></div>
        <div className="row"><div className="col-md-12"><SearchSelect id="StudentGroup" label="Select Groups" value={timetableGroup} options={groupList} onChange={(selected) => setTimetableGroup(selected || [])} isMulti placeholder="Search Group" /></div></div>
        <div className="pt-10"><button className="btn btn-primary w-100" onClick={onSubmit}>SUBMIT</button></div>
      </div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(ManageTimetableSchedule);
