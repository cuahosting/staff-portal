import React, { useEffect, useState } from "react";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { connect } from "react-redux";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import SearchSelect from "../../../common/select/SearchSelect";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";

function ManageTimetableSchedule(props) {
  const token = props.loginData[0].token;

  const navigation = useNavigate();
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [item, setItem] = useState({
    SemesterCode: "",
    SemesterCode2: null,
    ModuleCode: "",
    ModuleCode2: null,
    StartTime: "",
    StartTime2: null,
    EndTime: "",
    EndTime2: null,
    ModuleType: "",
    ModuleType2: null,
    DayName: "",
    DayName2: null,
    VenueID: "",
    VenueID2: null,
    EntryID: "",
    InsertedBy: props.loginData[0].StaffID
  });
  const schedule_time = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  // eslint-disable-next-line no-unused-vars
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
  const [conflictCheck, setConflictCheck] = useState({
    bypass: false,
    venue: false,
    venue_id: '',
    staff: false,
    staff_id: '',
    group: false,
    group_id: ''
  })
  const [canSubmit, setCanSubmit] = useState(false)

  // Static options for dropdowns
  const moduleTypeOptions = [
    { value: 'Lecture', label: 'Lecture' },
    { value: 'Interactive', label: 'Interactive' },
    { value: 'Class', label: 'Class' },
    { value: 'Workshop', label: 'Workshop' },
    { value: 'Online', label: 'Online' },
    { value: 'Seminar', label: 'Seminar' },
  ];

  const dayOptions = [
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
  ];

  const timeOptions = schedule_time.map(t => ({ value: t, label: `${t}:00` }));

  const resetItem = () => {
    setItem({
      SemesterCode: "",
      SemesterCode2: null,
      ModuleCode: "",
      ModuleCode2: null,
      StartTime: "",
      StartTime2: null,
      EndTime: "",
      EndTime2: null,
      ModuleType: "",
      ModuleType2: null,
      DayName: "",
      DayName2: null,
      VenueID: "",
      VenueID2: null,
      EntryID: "",
      InsertedBy: props.loginData[0].StaffID
    })
  }

  const getRecords = async () => {
    await axios
      .get(`${serverLink}staff/timetable/timetable/semester`, token)
      .then((res) => {
        let rows = []
        if (res.data.length > 0) {
          res.data.forEach((row) => {
            rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode })
          });
          setTimetableSemester(res.data);
          setSemesterOptions(rows)
        }
      })
      .catch((err) => {
        console.log("NETWORK ERROR FETCHING TIMETABLE SEMESTER");
      });

    await axios
      .get(`${serverLink}staff/academics/module/list`, token)
      .then((res) => {
        let rows = [];
        res.data.length > 0 &&
          res.data.forEach((row) => {
            rows.push({ value: row.ModuleCode, label: `${row.ModuleName} (${row.ModuleCode})` });
          });
        setModuleList(rows);
      })
      .catch((err) => {
        console.log("NETWORK ERROR FETCHING MODULE LIST");
      });

    await axios
      .get(`${serverLink}staff/timetable/timetable/venue/view`, token)
      .then((res) => {
        let rows = [];

        res.data.length > 0 &&
          res.data.forEach((row) => {
            rows.push({
              value: row.VenueID,
              label: `${row.CampusName} => ${row.BlockName} => ${row.VenueName}`,
            });
          });

        setVenueList(rows);
      })
      .catch((err) => {
        console.log("NETWORK ERROR FETCHING VENUE LIST");
      });

    await axios
      .get(`${serverLink}staff/timetable/timetable/student/group/list`, token)
      .then((res) => {
        setStudentGroupList(res.data);
        let rows = [];
        res.data.length > 0 &&
          res.data.forEach((row) => {
            rows.push({ value: row.EntryID, label: row.GroupName });
          });
        setGroupList(rows);
      })
      .catch((err) => {
        console.log("NETWORK ERROR FETCHING VENUE LIST");
      });

    await axios
      .get(`${serverLink}staff/report/staff/list/status/1`, token)
      .then((res) => {
        let rows = [];
        res.data.length > 0 &&
          res.data.forEach((row) => {
            rows.push({
              value: row.StaffID,
              label: `${row.StaffName} (${row.StaffID})`,
            });
          });
        setStaffList(rows);
      })
      .catch((err) => {
        console.log("NETWORK ERROR FETCHING STAFF LIST");
      });

    await axios
      .get(`${serverLink}staff/academics/module/running/list`, token)
      .then((res) => {
        setRunningModuleList(res.data);
      })
      .catch((err) => {
        console.log("NETWORK ERROR FETCHING RUNNING MODULE");
      });

    if (typeof slug === 'undefined') {
      setIsLoading(false);
    }
    else {
      await axios
        .get(`${serverLink}staff/timetable/timetable/single/${slug}`, token)
        .then((res) => {
          const data = res.data;
          if (data.timetable.length > 0) {
            const tt = data.timetable[0];
            setItem({
              SemesterCode: tt.SemesterCode,
              SemesterCode2: { value: tt.SemesterCode, label: tt.SemesterCode },
              ModuleCode: tt.ModuleCode,
              ModuleCode2: { value: tt.ModuleCode, label: tt.ModuleCode },
              StartTime: tt.StartTime,
              StartTime2: { value: tt.StartTime, label: `${tt.StartTime}:00` },
              EndTime: tt.EndTime,
              EndTime2: { value: tt.EndTime, label: `${tt.EndTime}:00` },
              ModuleType: tt.ModuleType,
              ModuleType2: { value: tt.ModuleType, label: tt.ModuleType },
              DayName: tt.DayName,
              DayName2: { value: tt.DayName, label: tt.DayName },
              VenueID: tt.VenueID,
              VenueID2: { value: tt.VenueID, label: tt.VenueID },
              EntryID: tt.EntryID,
            })
          }

          const staff = data.staff;
          if (staff.length > 0) {
            const staffValues = staff.map(st => ({
              value: st.StaffID,
              label: st.StaffID
            }));
            setTimetableStaff(staffValues);
          }

          const group = data.group;
          if (group.length > 0) {
            const groupValues = group.map(st => ({
              value: parseInt(st.GroupID),
              label: st.GroupID
            }));
            setTimetableGroup(groupValues);
          }

          setIsLoading(false);
        })
        .catch((err) => {
          console.log("NETWORK ERROR FETCHING RUNNING MODULE");
        });
    }
  };

  const onSubmit = async () => {
    setConflictCheck({
      ...conflictCheck,
      venue: false,
      venue_id: '',
      staff: false,
      staff_id: '',
      group: false,
      group_id: '',
    });
    setCanSubmit(false)

    if (item.SemesterCode === '') {
      toast.error('Please select school semester');
      return false
    }
    if (item.ModuleCode === '') {
      toast.error('Please select module');
      return false
    }
    if (item.ModuleType === '') {
      toast.error('Please select module type');
      return false
    }
    if (item.DayName === '') {
      toast.error('Please select schedule day');
      return false
    }
    if (item.StartTime === '') {
      toast.error('Please select start time');
      return false
    }
    if (item.EndTime === '') {
      toast.error('Please select end time');
      return false
    }
    if (item.VenueID === '') {
      toast.error('Please select venue');
      return false
    }

    const staffIds = timetableStaff.map(s => s.value);
    const groupIds = timetableGroup.map(g => g.value);

    if (staffIds.length < 1) {
      toast.error('Please select schedule lecturer(s)');
      return false
    }
    if (groupIds.length < 1) {
      toast.error("Please select schedule student group(s)");
      return false
    }
    toast.info('Submitting... Please wait!');

    staffIds.forEach(async (staff, index) => {
      const sendRecord = {
        schedule: item,
        group: groupIds,
        staff: staff,
      }

      await axios.post(`${serverLink}staff/timetable/schedule/check/conflict/staff`, sendRecord, token)
        .then(res => {
          const data = res.data
          if (data.message === 'failed') {
            toast.error(`STAFF CONFLICT: ${data.data}`);
            setConflictCheck({
              ...conflictCheck,
              staff: true,
              staff_id: data.data
            })
          }
          if (index + 1 === staffIds.length) {
            if (conflictCheck.bypass) {
              setCanSubmit(true)
            }
          }

        })
        .catch(err => {
          toast.error("NETWORK ERROR. PLEASE CHECK YOUR CONNECTION")
        })
    });

    if (conflictCheck.bypass === false) {
      groupIds.forEach(async (group_id, index) => {
        const sendRecord = {
          schedule: item,
          group: groupIds,
          group_id: group_id,
        }
        await axios.post(`${serverLink}staff/timetable/schedule/check/conflict/group`, sendRecord, token)
          .then(res => {
            const data = res.data
            if (data.message === 'failed') {
              const groupLabel = groupList.find(i => i.value === data.data)?.label || data.data;
              toast.error(`GROUP CONFLICT: ${groupLabel}`);
              setConflictCheck({
                ...conflictCheck,
                group: true,
                group_id: data.data
              })
            }

            if (index + 1 === groupIds.length) {
              setCanSubmit(true)
            }

          })
          .catch(err => {
            toast.error("NETWORK ERROR. PLEASE CHECK YOUR CONNECTION")
          })
      })
    }

  };

  const handleSubmit = async () => {
    item.InsertedBy = props.loginData[0].StaffID
    const staffIds = timetableStaff.map(s => s.value);
    const groupIds = timetableGroup.map(g => g.value);

    const sendData = {
      schedule: item,
      group: groupIds,
      staff: staffIds
    }
    if (item.EntryID === '') {
      await axios.post(`${serverLink}staff/timetable/schedule/add`, sendData, token)
        .then(res => {
          const data = res.data
          const message = data.message;
          if (message === 'failed_hall_conflict') {
            const venueLabel = venueList.find(i => i.value === parseInt(data.data))?.label || data.data;
            toast.error(`${venueLabel} has a schedule class`);
            setConflictCheck({
              ...conflictCheck,
              venue: true,
              venue_id: data.data
            })
          } else if (message === 'success') {
            toast.success(`Timetable schedule added successfully`);
            resetItem();
            setTimetableStaff([]);
            setTimetableGroup([]);

          } else {
            toast.error('Something went wrong. Please check your network and try again!');
          }

        })
        .catch(err => {
          toast.error("NETWORK ERROR. PLEASE CHECK YOUR CONNECTION")
        })
    } else {
      await axios.patch(`${serverLink}staff/timetable/schedule/update`, sendData, token)
        .then(res => {
          const data = res.data
          const message = data.message;
          if (message === 'failed_hall_conflict') {
            const venueLabel = venueList.find(i => i.value === parseInt(data.data))?.label || data.data;
            toast.error(`${venueLabel} has a schedule class`);
            setConflictCheck({
              ...conflictCheck,
              venue: true,
              venue_id: data.data
            })
          } else if (message === 'success') {
            toast.success(`Timetable schedule updated successfully`);
            navigation('/academics/timetable/timetable-report')

          } else {
            toast.error('Something went wrong. Please check your network and try again!');
          }
        })
        .catch((err) => {
          console.log("NETWORK ERROR UPDATING TIMETABLE");
        });
    }
  }

  useEffect(() => {
    if (canSubmit) {
      if (!conflictCheck.staff && !conflictCheck.group) {
        handleSubmit();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSubmit])

  const onLoadModuleGroupData = async (module_code) => {
    setIsLoading(true);
    let list = [];
    studentGroupList.length > 0 &&
      studentGroupList.forEach((ii) => {
        let filter = runningModuleList.filter(
          (i) =>
            i.CourseCode === ii.CourseCode &&
            i.CourseLevel === ii.CourseLevel &&
            i.CourseSemester === ii.CourseSemester &&
            i.ModuleCode === module_code
        );
        if (filter.length > 0) {
          const groupOption = groupList.find(g => g.value === ii.EntryID);
          if (groupOption) {
            list.push(groupOption);
          }
        }
      });
    setTimetableGroup(list);

    await axios.post(`${serverLink}staff/timetable/schedule/check/conflict/bypass`, { ModuleCode: module_code }, token)
      .then(res => {
        const data = res.data
        if (data.message === 'true') {
          setConflictCheck({
            ...conflictCheck,
            bypass: true,
          })
        } else {
          setConflictCheck({
            ...conflictCheck,
            bypass: false,
          })
        }
      })
      .catch(err => {
        toast.error("NETWORK ERROR. PLEASE CHECK YOUR CONNECTION")
      })

    setIsLoading(false);
  };

  useEffect(() => {
    getRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Manage Timetable"}
        items={["Academics", "Manage Timetable"]}
      />
      <div className="flex-column-fluid">
        <div className="card card-no-border">
          <div className="card-body p-0">
            <div className="row pt-5">
              <div className="col-md-4">
                <SearchSelect
                  id="SemesterCode"
                  label="Select School Semester"
                  value={item.SemesterCode2}
                  options={semesterOptions}
                  onChange={(selected) => {
                    setItem({
                      ...item,
                      SemesterCode: selected?.value || '',
                      SemesterCode2: selected,
                    });
                  }}
                  placeholder="Select Semester"
                />
              </div>

              <div className="col-md-4">
                <SearchSelect
                  id="ModuleCode"
                  label="Select Module"
                  value={item.ModuleCode2}
                  options={moduleList}
                  onChange={(selected) => {
                    setItem({
                      ...item,
                      ModuleCode: selected?.value || '',
                      ModuleCode2: selected,
                      EndTime: '',
                      EndTime2: null,
                    });
                    if (selected?.value) {
                      onLoadModuleGroupData(selected.value);
                    }
                  }}
                  isDisabled={item.SemesterCode === ""}
                  placeholder="Search Module"
                />
              </div>

              <div className="col-md-4">
                <SearchSelect
                  id="ModuleType"
                  label="Module Type"
                  value={item.ModuleType2}
                  options={moduleTypeOptions}
                  onChange={(selected) => {
                    setItem({
                      ...item,
                      ModuleType: selected?.value || '',
                      ModuleType2: selected,
                    });
                  }}
                  placeholder="Select Option"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <SearchSelect
                  id="DayName"
                  label="Day"
                  value={item.DayName2}
                  options={dayOptions}
                  onChange={(selected) => {
                    setItem({
                      ...item,
                      DayName: selected?.value || '',
                      DayName2: selected,
                    });
                  }}
                  placeholder="Select Option"
                />
              </div>

              <div className="col-md-4">
                <SearchSelect
                  id="StartTime"
                  label="Start Time"
                  value={item.StartTime2}
                  options={timeOptions}
                  onChange={(selected) => {
                    setItem({
                      ...item,
                      StartTime: selected?.value || '',
                      StartTime2: selected,
                      EndTime: '',
                      EndTime2: null,
                    });
                  }}
                  placeholder="Select Option"
                />
              </div>

              <div className="col-md-4">
                <SearchSelect
                  id="EndTime"
                  label="End Time"
                  value={item.EndTime2}
                  options={item.StartTime !== ""
                    ? timeOptions.filter(t => t.value > item.StartTime && t.value <= item.StartTime + 4)
                    : []
                  }
                  onChange={(selected) => {
                    setItem({
                      ...item,
                      EndTime: selected?.value || '',
                      EndTime2: selected,
                    });
                  }}
                  placeholder="Select Option"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <SearchSelect
                  id="VenueID"
                  label="Select Venue"
                  value={item.VenueID2}
                  options={venueList}
                  onChange={(selected) => {
                    setItem({
                      ...item,
                      VenueID: selected?.value || '',
                      VenueID2: selected,
                    });
                  }}
                  placeholder="Search Venue"
                />
              </div>

              <div className="col-md-6">
                <SearchSelect
                  id="StaffID"
                  label="Select Staff"
                  value={timetableStaff}
                  options={staffList}
                  onChange={(selected) => setTimetableStaff(selected || [])}
                  isMulti
                  placeholder="Search Staff"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <SearchSelect
                  id="StudentGroup"
                  label="Select Groups"
                  value={timetableGroup}
                  options={groupList}
                  onChange={(selected) => setTimetableGroup(selected || [])}
                  isMulti
                  placeholder="Search Group"
                />
              </div>
            </div>

            <div className="pt-10">
              <button className="btn btn-primary w-100" onClick={onSubmit}>
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(ManageTimetableSchedule);
