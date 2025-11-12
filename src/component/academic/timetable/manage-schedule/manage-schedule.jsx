import React, { useEffect, useState } from "react";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { connect } from "react-redux";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Select from "react-select";
import {toast} from "react-toastify";
import {useParams} from "react-router-dom";
import {useNavigate} from "react-router";
import Select from "react-select";

function ManageTimetableSchedule(props) {
  const token = props.loginData[0].token;

  const navigation = useNavigate();
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [item, setItem] = useState({
    SemesterCode: "",
    SemesterCode2: "",
    ModuleCode: "",
    StartTime: "",
    EndTime: "",
    ModuleType: "",
    DayName: "",
    VenueID: "",
    EntryID: "",
    InsertedBy: props.loginData[0].StaffID
  });
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

  const resetItem = () => {
    setItem({
      SemesterCode: "",
      ModuleCode: "",
      StartTime: "",
      EndTime: "",
      ModuleType: "",
      DayName: "",
      VenueID: "",
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
          res.data.map((row) => {
            rows.push({ value: row.SemesterCode, label: row.SemesterName +"- "+row.SemesterCode })
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
          res.data.map((row) => {
            rows.push({ text: `${row.ModuleName} (${row.ModuleCode})`, id: row.ModuleCode });
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
          res.data.map((row) => {
            rows.push({
              text: `${row.CampusName} => ${row.BlockName} => ${row.VenueName}`,
              id: row.VenueID,
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
          res.data.map((row) => {
            rows.push({ text: row.GroupName, id: row.EntryID });
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
          res.data.map((row) => {
            rows.push({
              text: `${row.StaffName} (${row.StaffID})`,
              id: row.StaffID,
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
              setItem({
                SemesterCode: data.timetable[0].SemesterCode,
                ModuleCode: data.timetable[0].ModuleCode,
                StartTime: data.timetable[0].StartTime,
                EndTime: data.timetable[0].EndTime,
                ModuleType: data.timetable[0].ModuleType,
                DayName: data.timetable[0].DayName,
                VenueID: data.timetable[0].VenueID,
                EntryID: data.timetable[0].EntryID,
              })
            }

            const staff = data.staff;
            if (staff.length > 0) {
              staff.map(st => {
                timetableStaff.push(st.StaffID)
              })
            }

            const group = data.group;
            if (group.length > 0) {
              group.map(st => {
                timetableGroup.push(parseInt(st.GroupID))
              })
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
    if (timetableStaff.length < 1) {
      toast.error('Please select schedule lecturer(s)');
      return false
    }
    if (timetableGroup.length < 1) {
      toast.error("Please select schedule student group(s)");
      return false
    }
    toast.info('Submitting... Please wait!');

    timetableStaff.map(async (staff, index) => {
      const sendRecord = {
        schedule: item,
        group: timetableGroup,
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
            if (index+1 === timetableStaff.length) {
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
      timetableGroup.map(async (group_id, index) => {
        const sendRecord = {
          schedule: item,
          group: timetableGroup,
          group_id: group_id,
        }
        await axios.post(`${serverLink}staff/timetable/schedule/check/conflict/group`, sendRecord, token)
            .then(res => {
              const data = res.data
              if (data.message === 'failed') {
                toast.error(`GROUP CONFLICT: ${groupList.filter(i=>i.id === data.data)[0]['text']}`);
                setConflictCheck({
                  ...conflictCheck,
                  group: true,
                  group_id: data.data
                })
              }

              if (index+1 === timetableGroup.length) {
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
    const sendData = {
      schedule: item,
      group: timetableGroup,
      staff: timetableStaff
    }
    if (item.EntryID === '') {
      await axios.post(`${serverLink}staff/timetable/schedule/add`, sendData, token)
          .then(res => {
            const data = res.data
            const message = data.message;
            if (message === 'failed_hall_conflict') {
              toast.error(`${venueList.filter(i=>i.id === parseInt(data.data))[0]['text']} has a schedule class`);
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
              toast.error(`${venueList.filter(i=>i.id === parseInt(data.data))[0]['text']} has a schedule class`);
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
    if(canSubmit) {
      if (!conflictCheck.staff && !conflictCheck.group) {
        handleSubmit();
      }
    }
  },[canSubmit])

  const onSemesterChange = (e) => {
    setItem({
      ...item,
      SemesterCode: e.value,
      SemesterCode2: e,
    })
  }

  const onEdit = (e) => {
    const id = e.target.id;
    let value = e.target.value;
    if (value !== "") {
      if (id === "StartTime" || id === "EndTime") {
        value = parseInt(value);
      }

      if (id === "StartTime") {
        setItem({
          ...item,
          EndTime: "",
        });
      }
    }

    setItem({
      ...item,
      [id]: value,
    });

    if (id === "SemesterCode" && value === "") {
      onResetItem();
    }

    if (id === "ModuleCode") {
      onLoadModuleGroupData(value);
    }
  };

  const onMultiEdit = (e) => {
    const options = e.target.options;
    const value = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        if (e.target.id === "StudentGroup")
          value.push(parseInt(options[i].value));
        else value.push(options[i].value);
      }
    }

    if (e.target.id === "StudentGroup") setTimetableGroup(value);
    else setTimetableStaff(value);
  };

  const onResetItem = () => {
    setItem({
      SemesterCode: "",
      ModuleCode: "",
      StaffID: "",
      StartTime: "",
      EndTime: "",
      ModuleType: "",
      DayName: "",
      VenueID: "",
    });
  };

  const onLoadModuleGroupData = async (module_code) => {
    setIsLoading(true);
    let list = [];
    studentGroupList.length > 0 &&
      studentGroupList.map((ii) => {
        let filter = runningModuleList.filter(
          (i) =>
            i.CourseCode === ii.CourseCode &&
            i.CourseLevel === ii.CourseLevel &&
            i.CourseSemester === ii.CourseSemester &&
            i.ModuleCode === module_code
        );
        if (filter.length > 0) {
          list.push(ii.EntryID);
        }
      });
    setTimetableGroup(list);

    await axios.post(`${serverLink}staff/timetable/schedule/check/conflict/bypass`, {ModuleCode: module_code}, token)
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
        <div className="card">
          <div className="card-body pt-0">
            <div className="row pt-5">
              <div className="col-md-4">
                <label htmlFor="SemesterCode">Select School Semester</label>
                <Select
                    name="SemesterCode"
                    value={item.SemesterCode2}
                    onChange={onSemesterChange}
                    options={semesterOptions}
                    placeholder="select Semester"
                />
                {/*<select*/}
                {/*  name="SemesterCode"*/}
                {/*  id="SemesterCode"*/}
                {/*  className="form-select"*/}
                {/*  onChange={onEdit}*/}
                {/*  value={item.SemesterCode}*/}
                {/*>*/}
                {/*  <option value="">Select Option</option>*/}
                {/*  {timetableSemester.length > 0 &&*/}
                {/*    timetableSemester.map((timetable, index) => {*/}
                {/*      return (*/}
                {/*        <option key={index} value={timetable.SemesterCode}>*/}
                {/*          {timetable.SemesterName}*/}
                {/*        </option>*/}
                {/*      );*/}
                {/*    })}*/}
                {/*</select>*/}
              </div>

              <div className="col-md-4">
                <label htmlFor="ModuleCode">Select Module</label>
                <Select
                  id="ModuleCode"
                  disabled={item.SemesterCode === ""}
                  defaultValue={item.ModuleCode}
                  data={moduleList}
                  onSelect={onEdit}
                  options={{
                    placeholder: "Search Module",
                  }}
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="ModuleType">Module Type</label>
                <select
                  name="ModuleType"
                  id="ModuleType"
                  className="form-select"
                  onChange={onEdit}
                  value={item.ModuleType}
                >
                  <option value="">Select Option</option>
                  <option value="Lecture">Lecture</option>
                  <option value="Interactive">Interactive</option>
                  <option value="Class">Class</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Online">Online</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>
            </div>

            <div className="row pt-5">
              <div className="col-md-4">
                <label htmlFor="DayName">Day</label>
                <select
                  name="DayName"
                  id="DayName"
                  className="form-select"
                  onChange={onEdit}
                  value={item.DayName}
                >
                  <option value="">Select Option</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="StartTime">Start Time</label>
                <select
                  name="StartTime"
                  id="StartTime"
                  className="form-select"
                  onChange={onEdit}
                  value={item.StartTime}
                >
                  <option value="">Select Option</option>
                  {schedule_time.map((start) => {
                    return (
                      <option key={start} value={start}>
                        {start}:00
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="EndTime">End Time</label>
                <select
                  name="EndTime"
                  id="EndTime"
                  className="form-select"
                  onChange={onEdit}
                  value={item.EndTime}
                >
                  <option value="">Select Option</option>
                  {item.StartTime !== "" &&
                    schedule_time.map((end) => {
                      if (end > item.StartTime && end <= item.StartTime + 4) {
                        return (
                          <option key={end} value={end}>
                            {end}:00
                          </option>
                        );
                      }
                    })}
                </select>
              </div>
            </div>

            <div className="row pt-5">
              <div className="col-md-6">
                <label htmlFor="VenueID">Select Venue</label>
                <Select
                  id="VenueID"
                  defaultValue={item.VenueID}
                  data={venueList}
                  onSelect={onEdit}
                  options={{
                    placeholder: "Search Venue",
                  }}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="StaffID">Select Staff</label>
                <Select
                  id="StaffID"
                  multiple
                  defaultValue={timetableStaff}
                  data={staffList}
                  onChange={onMultiEdit}
                  options={{
                    placeholder: "Search Staff",
                  }}
                />
              </div>
            </div>

            <div className="row pt-5">
              <div className="col-md-12">
                <label htmlFor="StudentGroup">Select Groups</label>
                <Select
                  id="StudentGroup"
                  multiple
                  defaultValue={timetableGroup}
                  data={groupList}
                  onChange={onMultiEdit}
                  options={{
                    placeholder: "Search Group",
                  }}
                />
              </div>
              <div className="col-md-6"></div>
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
