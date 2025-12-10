import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { serverLink } from "../../../../resources/url";
import Modal from "../../../common/modal/modal";
import { Link } from 'react-router-dom'
import ReportTable from "../../../common/table/ReportTable";
import { formatDateAndTime } from "../../../../resources/constants";
import {
  CommentsDisabledOutlined,
  ConnectingAirportsOutlined,
} from "@mui/icons-material";
import SearchSelect from "../../../common/select/SearchSelect";


import { useForm } from "react-hook-form";

function HostelAllocations(props) {
  const token = props.loginData.token;

  const { register, handleSubmit, setValue, watch } = useForm();
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    setValue: setValue2,
    watch: watch2,
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [readyToShow, setreadyToShow] = useState(false);
  const [readyToShow2, setreadyToShow2] = useState(false);
  const [readyToShow3, setreadyToShow3] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [studentSelectList, setStudentSelectList] = useState([]);
  const [hostelFloorList, setHostelFloorList] = useState([]);
  const [hostelFloorList2, setHostelFloorList2] = useState([]);
  const [bedList, setbedList] = useState([]);
  const [entryIdForRelocation, setEntryIdForRelocation] = useState([]);
  const [bedList2, setbedList2] = useState([]);
  const [gender, setgender] = useState("");
  const [hostelAllocationLists, sethostelAllocationLists] = useState([]);
  const [hostelAllocationTracker, sethostelAllocationTracker] = useState([]);
  const [entry_id, setentry_id] = useState("");
  const columns = [
    "ID",
    "Name",
    "Phone",
    "Hostel Name",
    "Hostel For",
    "Floor",
    "Room",
    "Applied On",
    "Status",
    "Action",
  ];

  const columns2 = ["Action", "Action By", "Action Date"];
  const [semester, setSemester] = useState({
    code: "",
    desc: "",
  });
  const handleChange = async (e) => {
    setSemester({
      ...semester,
      [e.target.id]: e.target.value,
    });
    getRoomAllocations(e.target.value);
  }
  const getStudentList2 = async () => {
    await axios.get(`${serverLink}staff/student-manager/student/active`, token)
      .then((response) => {
        const result = response.data;
        if (result.length > 0) {
          let rows = [];
          result.map(item => {
            rows.push({
              value: `${item.StudentID}?${item.Gender}?${item.FirstName} ${item.MiddleName} ${item.Surname}`,
              label: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})`
            })
          })
          setStudentSelectList(rows);
        }
      })
      .catch((err) => {
        console.log("NETWORK ERROR");
      });
  }
  const getStudentList = async () => {
    await axios
      .get(`${serverLink}student/student-report/student-list-active2`, token)
      .then((res) => {
        if (res.data.length > 0) {
          setStudentList(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const TakeDecision = async (decision, allocationId) => {
    let dataTo = {
      status: decision,
      id: allocationId,
      insertedBy: props.loginData.StaffID,
    };
    await axios
      .post(
        `${serverLink}staff/registration/hostels/allocation-decision`,
        dataTo, token
      )
      .then((res) => {
        if (res.data.message === "success") {
          toast.success("Application was " + decision);
          getRoomAllocations();
        } else {
          toast.error("An error has occurred. Please try again!");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  };
  const getSemesters = async () => {
    axios
      .get(`${serverLink}registration/registration-report/semester-list/`, token)
      .then((response) => {
        setSemesterList(response.data);
      })
      .catch((ex) => {
        console.error(ex);
      });
  };
  const getAllocationTracker = async (id) => {
    await axios
      .get(`${serverLink}staff/registration/hostels/allocation-tracker/${id}`, token)
      .then((res) => {
        const data = res.data;
        let rows = [];
        if (data.message === "success") {
          data.data.length > 0 &&
            data.data.map((item, index) => {
              rows.push([item.Action, item.StaffName, item.InsertedDate]);
            });
        }
        sethostelAllocationTracker(rows);
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  };
  const getRoomAllocations = async (sem) => {
    await axios
      .get(`${serverLink}staff/registration/hostels/hostel-allocations/${sem}`, token)
      .then((res) => {
        const data = res.data;
        let rows = [];
        if (data.message === "success") {
          data.data.length > 0 &&
            data.data.map((item, index) => {
              let status;
              if (item.Status == "Approve") {
                status = <span className="badge badge-success">Approved  </span>
              }
              else if (item.Status == "Reject") {
                status = <span className="badge badge-danger">Rejected</span>
              }
              else if (item.Status == "Relocated") {
                status = <span className="badge badge-success">Relocated</span>
              }
              else {
                status = <span className="badge badge-primary">Applied</span>

              }
              rows.push([
                item.StudentID,
                item.StudentName,
                item.PhoneNumber,
                item.HostelName,
                item.Gender,
                item.FloorName,
                item.RoomBed,
                formatDateAndTime(item.InsertedDate, "date_and_time"),
                status,
                <>
                  <button
                    type="button"
                    id="ApproveBtn"
                    data-toggle="tooltip"
                    data-placement="right"
                    title="Approve"
                    onClick={() => {
                      if (item.Status != "Approve") {
                        TakeDecision("Approve", item.EntryID)
                      }
                    }
                    }
                    className="btn btn-sm btn-success "
                  >
                    <i className={"fa fa-check"} />
                  </button>
                  <button
                    type="button"
                    data-toggle="tooltip"
                    data-placement="right"
                    title="Relocate"
                    data-bs-toggle="modal"
                    data-bs-target="#RelocateStudentForm"
                    onClick={() => {
                      setreadyToShow3(false);
                      setValue2("relocationStudentName", item.StudentName);
                      setValue2("relocationStudentID", item.StudentID);
                      setValue2("relocationRoomBed", item.RoomBed);
                      setValue2("floor2", "");
                      setEntryIdForRelocation(item.EntryID);
                      getHostelFor2(item.Gender);
                    }}
                    className="btn btn-sm btn-warning "
                  >
                    <i className={"fa fa-car"} />
                  </button>
                  <button
                    style={{ marginLeft: "2px" }}
                    type="button"
                    id="RejectBtn"
                    data-toggle="tooltip"
                    onClick={() => {
                      if (item.Status != "Reject") {
                        TakeDecision("Reject", item.EntryID)
                      }
                    }
                    }
                    data-placement="right"
                    title="Reject"
                    className="btn btn-sm btn-danger "
                  >
                    <i className={"fa fa-times"} />
                  </button>
                  <button
                    style={{ marginLeft: "2px" }}
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target="#allocationTrackerForm"
                    data-toggle="tooltip"
                    onClick={() => getAllocationTracker(item.EntryID)}
                    data-placement="right"
                    title="View Progress"
                    className="btn btn-sm btn-primary "
                  >
                    <i className={"fa fa-eye"} />
                  </button>
                </>,
              ]);
            });
        }
        sethostelAllocationLists(rows);
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  };
  const clearItems = () => {
    setreadyToShow(false);
    setreadyToShow2(false);
    setValue("student", "");
    setValue("floor", "");
    setValue("bed", "");
    setValue("semester", "");
  };
  const allocateBed = async (data) => {
    if (data.student === "") {
      toast.error("Please select Student");
      return false;
    }
    if (data.floor === "") {
      toast.error("Please Select Floor");
      return false;
    }
    if (data.bed === "") {
      toast.error("Please Select Bed");
      return false;
    }
    if (data.semester === "") {
      toast.error("Please select Semester");
      return false;
    }
    if (entry_id == "") {
      let dataTo = {
        studentId: data.student.split("?")[0],
        semester: data.semester,
        hostelid: data.floor.split("?")[2],
        bedid: data.bed.split("?")[0],
        roomid: data.bed.split("?")[1],
        insertedBy: props.loginData.StaffID,
      };
      await axios
        .post(`${serverLink}staff/registration/hostels/allocate-bed`, dataTo, token)
        .then((res) => {
          if (res.data.message === "success") {
            toast.success("Bed Allocated Successfully");
            document.getElementById("closeModal").click();
            clearItems();
            getRoomAllocations();
          } else {
            toast.error("An error has occurred. Please try again!");
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("NETWORK ERROR. Please try again!");
        });
    }
  };
  const relocateStudent = async (data) => {
    if (data.floor2 == "") {
      toast.error("Please Specify Hostel");
      return false;
    }
    let val = data.roombed2;
    let val2 = data.floor2;
    let roomNum = val.split("?")[1];
    let bedNum = val.split("?")[0];
    let hostelID = val2.split("?")[2];
    if (
      data.roombed2.split("?")[2] + "==>" + data.roombed2.split("?")[3] ==
      data.relocationRoomBed
    ) {
      toast.error("Please Specify Different Room and/or Bed");
      return false;
    }
    let dataTo = {
      roomNum: roomNum,
      id: entryIdForRelocation,
      hostelID: hostelID,
      bedNum: bedNum,
      insertedBy: props.loginData.StaffID,
    };
    await axios
      .post(`${serverLink}staff/registration/hostels/relocation`, dataTo, token)
      .then((res) => {
        if (res.data.message === "success") {
          toast.success("Student was Relocated");
          document.getElementById("RelocateStudentForm").click();
          getRoomAllocations();
        } else {
          toast.error("An error has occurred. Please try again!");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  };
  const getHostelFor = async (e) => {
    setreadyToShow(false);
    let val = e.target.value;
    let gender = val.split("?")[1];
    await axios
      .get(`${serverLink}staff/registration/hostels/hostel-rooms/${gender}`, token)
      .then((res) => {
        const data = res.data;
        if (data.data.length > 0) {
          setHostelFloorList(res.data.data);
          setreadyToShow(true);
          setgender(gender);
        }
      })
      .catch((err) => { });
  };

  const getHostelFor2 = async (gender) => {
    await axios
      .get(`${serverLink}staff/registration/hostels/hostel-rooms/${gender}`, token)
      .then((res) => {
        const data = res.data;
        if (data.data.length > 0) {
          setHostelFloorList2(res.data.data);
          setgender(gender);
        }
      })
      .catch((err) => { });
  };

  const getBedOnChange = async (e) => {
    setreadyToShow2(false);
    let val = e.target.value;
    let roomID = val.split("?")[0];
    let floor = val.split("?")[1];
    await axios
      .get(
        `${serverLink}staff/registration/hostels/hostel-bed/${roomID}/${floor}`, token
      )
      .then((res) => {
        const data = res.data;
        if (data.data.length > 0) {
          setbedList(res.data.data);
          setreadyToShow2(true);
        }
      })
      .catch((err) => { });
  };

  const getBedOnChange2 = async (e) => {
    setreadyToShow3(false);
    setValue2("roombed2", "");
    let val = e.target.value;
    let roomID = val.split("?")[0];
    let floor = val.split("?")[1];
    await axios
      .get(
        `${serverLink}staff/registration/hostels/hostel-bed/${roomID}/${floor}`, token
      )
      .then((res) => {
        const data = res.data;
        if (data.data.length > 0) {
          setbedList2(res.data.data);

          setreadyToShow3(true);
        }
      })
      .catch((err) => { });
  };

  useEffect(() => {
    getSemesters();
    getStudentList2();
  }, []);
  return isLoading ? (
    <Loader />
  ) : (
    <>
      <div
        class="modal fade"
        id="allocationTrackerForm"
        tabindex="-1"
        aria-labelledby="bedForm"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="bedForm"></h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <ReportTable
                height={"200px"}
                columns={columns2}
                data={hostelAllocationTracker}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        class="modal fade"
        id="RelocateStudentForm"
        tabindex="-1"
        aria-labelledby="bedForm"
        aria-hidden="true"
      >
        <div class="modal-dialog  modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="bedForm">
                Relocation Form
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <form onSubmit={handleSubmit2(relocateStudent)} novalidate>
                <div className="form-group">
                  <div class="row g-3">
                    <div class="col-sm-6">
                      <label htmlFor="hostelId">Student ID.</label>
                      <input
                        id="hostelFor"
                        disabled
                        {...register2("relocationStudentID")}
                        className="form-control"
                      />
                    </div>
                    <div class="col-sm-4">
                      <label htmlFor="hostelId">Student Name.</label>
                      <input
                        id="hostelFor"
                        disabled
                        {...register2("relocationStudentName")}
                        className="form-control"
                      />
                    </div>
                    <div class="col-sm-2">
                      <label htmlFor="hostelId">Room/Bed</label>
                      <input
                        id="hostelFor"
                        disabled
                        {...register2("relocationRoomBed")}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="form-group pt-5">
                    <label htmlFor="hostelFor">
                      Hostel for {`${gender}`} students
                    </label>
                    <SearchSelect
                      id="floor2"
                      label={`Hostel for ${gender} students`}
                      value={hostelFloorList2.map((item) => ({
                        value: `${item.EntryID}?${item.FloorName}?${item.HostelID}`,
                        label: `${item.HostelName} (${item.FloorName} Floor) `
                      })).find(op => op.value === watch2("floor2")) || null}
                      options={hostelFloorList2.map((item) => ({
                        value: `${item.EntryID}?${item.FloorName}?${item.HostelID}`,
                        label: `${item.HostelName} (${item.FloorName} Floor) `
                      }))}
                      onChange={(selected) => {
                        setValue2("floor2", selected?.value);
                        getBedOnChange2({ target: { value: selected?.value || '' } });
                      }}
                      placeholder="Select Hostel"
                      required
                    />
                  </div>
                  {readyToShow3 && (
                    <div className="form-group pt-5">
                      <label htmlFor="hostelFor">Select Bed</label>
                      <SearchSelect
                        id="roombed2"
                        label="Select Bed"
                        value={bedList2.map((item) => ({
                          value: `${item.EntryID}?${item.RoomID}?${item.RoomNo}?${item.BedNo}`,
                          label: `${item.RoomBed}`
                        })).find(op => op.value === watch2("roombed2")) || null}
                        options={bedList2.map((item) => ({
                          value: `${item.EntryID}?${item.RoomID}?${item.RoomNo}?${item.BedNo}`,
                          label: `${item.RoomBed}`
                        }))}
                        onChange={(selected) => setValue2("roombed2", selected?.value)}
                        placeholder="Select Bed"
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="form-group pt-5">
                  <button className="btn btn-primary w-100">
                    Relocate Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column flex-row-fluid">
        <PageHeader
          title={"Hostel Allocations"}
          items={["Registraion", "Hostel", "Hostel Allocations"]}
        />
        <div className="flex-column-fluid">
          <div className="card">
            <div className="col-md-12 fv-row pt-10">
              <label className="required fs-6 fw-bold mb-2">
                Select Semester
              </label>
              <SearchSelect
                id="code"
                label="Select Semester"
                value={semesterList.map((s) => ({ value: s.SemesterCode, label: s.Description })).find(op => op.value === semester.code) || null}
                options={semesterList.map((s) => ({
                  value: s.SemesterCode,
                  label: s.Description
                }))}
                onChange={(selected) => handleChange({ target: { id: 'code', value: selected?.value || '' } })}
                placeholder="Select Semester"
                required
              />
            </div>

            <div className="card-header border-0 pt-6">
              <div className="card-title" />
              <div className="card-toolbar">
                <div
                  className="d-flex justify-content-end"
                  data-kt-customer-table-toolbar="base"
                >
                  <Link to="/registration/hostel/hostel-allocation-form">
                    <button
                      type="button"
                      className="btn btn-primary"
                    // data-bs-toggle="modal"
                    // data-bs-target="#kt_modal_general"
                    >
                      Allocate Hostel
                    </button>
                  </Link>

                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <h3>Hostel Applications</h3>
              <ReportTable columns={columns} data={hostelAllocationLists} />
            </div>
          </div>

          <Modal title={"Hostel Allocation Form"}>
            <form onSubmit={handleSubmit(allocateBed)} novalidate>
              <div className="form-group">
                <label htmlFor="hostelFor">Select Student</label>
                <SearchSelect
                  id="StudentID"
                  label="Select Student"
                  value={studentSelectList.find(s => s.value === watch("student")) || null} // Assuming student uses simple ID, but Select2 might have used complex
                  // Actually Select2 used default value "" and onSelect.
                  // The old code had commented out select using register("student") with complex value.
                  // The Select2 logic used getHostelFor which sets internal state but doesn't explicitly set "student" in form?
                  // Wait, allocateBed uses data.student.
                  // OnSelect2 select, it triggered getHostelFor.
                  // getHostelFor receives event, uses val = e.target.value.
                  // I will replicate the behavior: on Change -> setValue("student", val) and getHostelFor.
                  options={studentSelectList}
                  onChange={(selected) => {
                    setValue("student", selected?.value); // We need to match what allocateBed expects.
                    // However, studentSelectList uses simple StudentID in my previous replacement?
                    // No, in HostelAllocationForm I used complex value.
                    // Here in `getStudentList2` I used just StudentID as value.
                    // BUT `allocateBed` (line 292) does `data.student.split("?")[0]`.
                    // This implies `data.student` should be complex?
                    // Let's check getStudentList2 in detail.
                    // I replaced it to use item.StudentID as value.
                    // BUT `allocateBed` splits it. This suggests I should have used complex value in getStudentList2.
                    // I will fix getStudentList2 in this chunk too or relying on previous chunk.
                    // I need to use complex value here if allocateBed expects it.
                    // Let's correct getStudentList2 logic in my thought trace.

                    getHostelFor({ target: { value: selected?.value || '' } });
                  }}
                  placeholder="Search Student"
                />
              </div>
              {readyToShow && (
                <div className="form-group">
                  <label htmlFor="hostelFor">
                    Hostel Floor for {`${gender}`} students
                  </label>
                  <SearchSelect
                    id="floor"
                    label={`Hostel Floor for ${gender} students`}
                    value={hostelFloorList.map((item) => ({
                      value: `${item.EntryID}?${item.FloorName}?${item.HostelID}`,
                      label: `${item.FloorName}`
                    })).find(op => op.value === watch("floor")) || null}
                    options={hostelFloorList.map((item) => ({
                      value: `${item.EntryID}?${item.FloorName}?${item.HostelID}`,
                      label: `${item.FloorName}`
                    }))}
                    onChange={(selected) => {
                      setValue("floor", selected?.value);
                      getBedOnChange({ target: { value: selected?.value || '' } });
                    }}
                    placeholder="Select Floor"
                    required
                  />
                </div>
              )}

              {readyToShow2 && (
                <>
                  <div className="form-group">
                    <label htmlFor="hostelFor">Select Bed</label>
                    <SearchSelect
                      id="bed"
                      label="Select Bed"
                      value={bedList.map((item) => ({
                        value: `${item.EntryID}?${item.RoomID}?${item.RoomNo}?${item.BedNo}`,
                        label: `${item.RoomBed}`
                      })).find(op => op.value === watch("bed")) || null}
                      options={bedList.map((item) => ({
                        value: `${item.EntryID}?${item.RoomID}?${item.RoomNo}?${item.BedNo}`,
                        label: `${item.RoomBed}`
                      }))}
                      onChange={(selected) => setValue("bed", selected?.value)}
                      placeholder="Select Bed"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="hostelFor">Semester</label>
                    <SearchSelect
                      id="semester"
                      label="Semester"
                      value={[
                        { value: "First", label: "First Semester" },
                        { value: "Second", label: "Second Semester" }
                      ].find(op => op.value === watch("semester")) || null}
                      options={[
                        { value: "First", label: "First Semester" },
                        { value: "Second", label: "Second Semester" }
                      ]}
                      onChange={(selected) => setValue("semester", selected?.value)}
                      placeholder="Select Semester"
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-group pt-2">
                <button className="btn btn-primary w-100">Allocate</button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails[0],
  };
};

export default connect(mapStateToProps, null)(HostelAllocations);
