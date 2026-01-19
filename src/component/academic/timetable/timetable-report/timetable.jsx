import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import AGReportTable from "../../../common/table/AGReportTable";
import SearchSelect from "../../../common/select/SearchSelect";

function TimetableReport(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [semesterList, setSemesterList] = useState([]);
    const [schoolSemester, setSchoolSemester] = useState("");
    const [semesterOptions, setSemesterOptions] = useState([]);
    const columns = ["Action", "Day", "Module", "Type", "Block", "Venue", "Start Time", "End Time", "Staff", "Group"];
    const [tableData, setTableData] = useState([]);
    const navigate = useNavigate();
    const [selectedSemester, setSelectedSemester] = useState("");
    const [groupList, setGroupList] = useState([]);
    const [venueList, setVenueList] = useState([]);

    const getSemesterList = async () => {
        const [semRes, grpRes, venRes] = await Promise.all([
            api.get("staff/timetable/timetable/semester"),
            api.get("staff/timetable/timetable/student/group/list"),
            api.get("staff/timetable/timetable/venue/view")
        ]);
        if (semRes.success && semRes.data?.length > 0) { let rows = []; semRes.data.forEach((row) => { rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode }); }); setSemesterList(semRes.data); setSemesterOptions(rows); }
        if (grpRes.success) { setGroupList(grpRes.data || []); }
        if (venRes.success) { setVenueList(venRes.data || []); }
        setIsLoading(false);
    };

    const onSemesterChange = async (e) => {
        setIsLoading(true);
        const semester = e.value;
        setSelectedSemester(semester);
        setSchoolSemester(e);
        if (semester !== '') {
            const { success, data: res } = await api.get(`staff/timetable/timetable/list/${semester}`);
            if (success && res?.timetable?.length > 0) {
                let rows = [];
                res.timetable.forEach((data) => {
                    const venue_filter = venueList.filter(i => i.VenueID === parseInt(data.VenueID));
                    const venue_name = venue_filter.length > 0 ? venue_filter[0]['VenueName'] : '--';
                    const block = venue_filter.length > 0 ? venue_filter[0]['BlockName'] : '--';
                    const filter_staff = res.staff.filter(i => i.TimetableID === data.EntryID);
                    let staff_list = "";
                    if (filter_staff.length > 0) { filter_staff.forEach(staff => { staff_list += staff.StaffID + ', '; }); }
                    const filter_group = res.group.filter(i => i.TimetableID === data.EntryID);
                    // Create stacked group display instead of comma-separated string
                    const groupNames = filter_group.map(group => {
                        const matchedGroup = groupList.find(i => i.EntryID === parseInt(group.GroupID));
                        return matchedGroup?.GroupName || '';
                    }).filter(Boolean);

                    const groupDisplay = groupNames.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {groupNames.map((name, idx) => (
                                <span key={idx} className="badge badge-light-primary" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                                    {name}
                                </span>
                            ))}
                        </div>
                    ) : '--';

                    // Combined Action buttons (Edit + Delete)
                    const actionButtons = (
                        <div key={`action-${data.EntryID}`} className="d-flex gap-2" style={{ whiteSpace: 'nowrap' }}>
                            <button className="btn btn-sm btn-icon btn-info" title="Edit" onClick={() => navigate(`/academics/timetable/update-schedule/${data.EntryID}`)}>
                                <i className="fa fa-pen" />
                            </button>
                            <button className="btn btn-sm btn-icon btn-danger" title="Delete" onClick={() => delete_timetable(data.EntryID)}>
                                <i className="fa fa-trash-alt" />
                            </button>
                        </div>
                    );

                    rows.push([actionButtons, data.DayName, data.ModuleCode, data.ModuleType, block, venue_name, data.StartTime + ':00', data.EndTime + ':00', staff_list.replace(/,(\s+)?$/, ''), groupDisplay]);
                });
                setTableData(rows);
            } else { setTableData([]); toast.error('No timetable data for the selected semester'); }
            setIsLoading(false);
        } else { toast.error('Please select semester'); setIsLoading(false); }
    };

    const delete_timetable = async (id) => {
        toast.info("please wait...");
        const { success, data } = await api.delete(`staff/timetable/delete/timetable/${id}`);
        if (success && data?.message === "success") { toast.success("Deleted Successfully"); } else { toast.error("NETWORK ERROR. Please try again!"); }
    };

    useEffect(() => { getSemesterList(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Timetable Report"} items={["Academics", "Timetable", "Timetable Report"]} />
            <div className="flex-column-fluid">
                <div className="fv-row mb-6 enhanced-form-group"><label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="SemesterCode">Select Semester</label><SearchSelect name="SemesterCode" className="form-select w-100" value={schoolSemester} onChange={onSemesterChange} options={semesterOptions} placeholder="select Semester" /></div>
                {tableData.length > 0 && <AGReportTable title={`Timetable Report for ${selectedSemester} Semester`} columns={columns} data={tableData} height={"800px"} />}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(TimetableReport);
