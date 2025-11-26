import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { serverLink } from "../../../../resources/url";
import Modal from "../../../common/modal/modal";
import ReportTable from "../../../common/table/report_table";
import { formatDateAndTime } from "../../../../resources/constants";
import {
  CommentsDisabledOutlined,
  RestaurantRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Select2 from "react-select2-wrapper";
import "react-select2-wrapper/css/select2.css";

function HostelAllocationForm(props) {
  const token = props.loginData.token;

  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue } = useForm();
  const [readyToShow, setreadyToShow] = useState(false);
  const [entry_id, setentry_id] = useState("");
  const [StudentName, setStudentName] = useState("");
  const [id, setId] = useState("");
  const [floor, setFloor] = useState("");
  const [bedAndRoom, setBedandRoom] = useState({ bedID: "", roomID: "" });
  const [semester, setSemester] = useState("");
  const [hostelId, setHostelID] = useState("");
  const [readyToShow2, setreadyToShow2] = useState(false);
  const [hostelFloorList, setHostelFloorList] = useState([]);
  const [bedList, setbedList] = useState([]);
  const [studentSelectList, setStudentSelectList] = useState([]);
  const [gender, setgender] = useState("");
  let navigate = useNavigate();
  const getBedOnChange = async (e) => {
    setreadyToShow2(false);
    let val = e.target.value;
    let roomID = val.split("?")[0];
    let floor = val.split("?")[1];
    let hostelId = val.split("?")[2];
    setFloor(floor);
    setHostelID(hostelId);
    await axios
      .get(`${serverLink}staff/registration/hostels/hostel-bed/${roomID}/${floor}`, token)
      .then((res) => {
        const data = res.data;
        if (data.data.length > 0) {
          setbedList(res.data.data);
          setreadyToShow2(true);
        }
      })
      .catch((err) => {});
  };
  const getStudentList = async () => {
    await axios
      .get(`${serverLink}student/student-report/student-list-active2`, token)
      .then((response) => {
        const result = response.data;

        if (result.length > 0) {
          let rows = [];
          result.map((item) => {
            rows.push({
              id: `${item.StudentID}?${item.Gender}?${item.StudentName}`,
              text: `${item.StudentName} (${item.StudentID})`,
            });
          });

          setStudentSelectList(rows);
          console.log(studentSelectList);
          return;
        } else {
        }
      })
      .catch((err) => {
        console.log("NETWORK ERROR");
      });
  };

  const getHostelFor = async (e) => {
    setreadyToShow(false);
    let val = e.target.value;
    setId(val.split("?")[0]);
    setStudentName(val.split("?")[2]);
    let gender = val.split("?")[1];
    await axios
      .get(`${serverLink}staff/registration/hostels/hostel-rooms/${gender}`, token)
      .then((res) => {
        const data = res.data;
        if (data.data.length > 0) {
          setHostelFloorList(res.data.data);
          setreadyToShow(true);
          setgender(gender);
          setId(val.split("?")[0]);
        }
      })
      .catch((err) => {});
  };
  const clearItems = () => {
    setreadyToShow(false);
    setreadyToShow2(false);
    setValue("student", "");
    setValue("floor", "");
    setValue("bed", "");
    setValue("semester", "");
  };
  const allocateBed = async (e) => {
    e.preventDefault();
    if (entry_id == "") {
      let dataTo = {
        studentId: id,
        semester: semester,
        hostelid: hostelId,
        bedid: bedAndRoom.bedID,
        roomid: bedAndRoom.roomID,
        insertedBy: props.loginData.StaffID,
      };
      await axios
        .post(`${serverLink}staff/registration/hostels/allocate-bed`, dataTo, token)
        .then((res) => {
          if (res.data.message === "success") {
            toast.success("Bed Allocated Successfully");
            navigate(-1);
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
  useEffect(() => {
    getStudentList();
  }, []);
  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Hostel Allocation Form"}
        items={["Registraion", "Hostel", "Hostel Allocation Form"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-header border-0 pt-6">
            <div className="card-title" />
            <div className="card-toolbar">
              <div
                className="d-flex justify-content-end"
                data-kt-customer-table-toolbar="base"
              ></div>
            </div>
          </div>
          <div className="card-body p-0">
            <div>
              <div className="form-gdroup">
                <label htmlFor="hostelFor">Select Student</label>
                <br />
                <h3>
                  {StudentName} {id}
                </h3>
                <Select2
                  id="StudentID"
                  value={studentSelectList.id}
                  data={studentSelectList}
                  onSelect={getHostelFor}
                  options={{
                    placeholder: "Search Student",
                  }}
                />
                {/* <select
                  id="hostelFor"
                  {...register("student")}
                  required
                  onChange={getHostelFor}
                  className="form-control"
                >
                  <option value="">Select Student</option>
                  {studentList.map((item) => (
                    <option
                      value={`${item.StudentID}?${item.Gender}`}
                      key={item.StudentID}
                    >
                      {`${item.StudentName} - (${item.StudentID})`}
                    </option>
                  ))}
                </select> */}
              </div>
              {readyToShow && (
                <div className="form-group pt-5">
                  <label htmlFor="hostelFor">
                    Hostel for {`${gender}`} students
                  </label>
                  <select
                    id="hostelFor"
                    onChange={getBedOnChange}
                    required
                    className="form-control"
                  >
                    <option value="">Select Hostel</option>
                    {hostelFloorList.map((item) => (
                      <option
                        //roomid?floor?hostelid
                        value={`${item.EntryID}?${item.FloorName}?${item.HostelID}`}
                        key={item.EntryID}
                      >
                        {`${item.HostelName} (${item.FloorName} Floor) `}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {readyToShow2 && (
                <>
                  <div className="form-group pt-5">
                    <label htmlFor="hostelFor">Select Bed</label>
                    <select
                      id="hostelFor"
                      onChange={(e) =>
                        setBedandRoom({
                          bedID: e.target.value.split("?")[0],
                          roomID: e.target.value.split("?")[1],
                        })
                      }
                      required
                      className="form-control"
                    >
                      <option value="">Select Bed</option>
                      {bedList.map((item) => (
                        <option
                          value={`${item.EntryID}?${item.RoomID}?${item.RoomNo}?${item.BedNo}`}
                          key={item.RoomBed}
                        >
                          {`${item.RoomBed}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* <div className="form-group pt-5">
                    <label htmlFor="hostelFor">Semester</label>
                    <select
                      id="hostelFor"
                      onChange={(e) => setSemester(e.target.value)}
                      required
                      className="form-control"
                    >
                      <option value="">Select Semester</option>
                      <option value="First">First Semester </option>
                      <option value="Second">Second Semester</option>
                    </select>
                  </div> */}
                </>
              )}

              <div className="form-group pt-5">
                <button onClick={allocateBed} className="btn btn-primary w-100">
                  Allocate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails[0],
  };
};

export default connect(mapStateToProps, null)(HostelAllocationForm);
