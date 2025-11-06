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
import { CommentsDisabledOutlined } from "@mui/icons-material";

import { useForm } from "react-hook-form";

function HostelRooms(props) {
  const token = props.loginData.token;

  const { register, handleSubmit, setValue } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [hostelRoomBeds, setHostelRoomBeds] = useState([]);
  const [hostelRooms, setHostelRooms] = useState([]);
  const [hostelList, setHostelList] = useState([]);
  const [bedNumber, setBedNumber] = useState([]);
  const [readyToShow, setreadyToShow] = useState(true);
  const [roomBedDets, setRoomBedDets] = useState({
    floor: "",
    roomId: "",
    Capacity:"",
    roomNo: "",
    hosteFor: "",
  });
  const [entry_id, setEntryId] = useState("");
  const columns = [
    "S/N",
    "Hostel Name",
    "Room Number",
    "Floor Name",
    "Hostel",
    "Capacity",
    "Action",
  ];
  const columns2 = [
    "S/N",
    "Bed Number",
    "Occupied By",
    "Status",
  ];
  const getRoomBed = async (roomId) => {
    await axios
      .get(`${serverLink}staff/registration/hostels/room-beds/${roomId}`, token)
      .then((res) => {
        const data = res.data;
        let rows = [];
        if (data.message === "success") {
          data.data.length > 0 &&
            data.data.map((item, index) => {
              rows.push([
                index + 1,
                item.BedNo,
                item.OccupantID,
                item.status,
              ]);
            });
        }
        setHostelRoomBeds(rows);
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  };

  const getHostelRooms = async () => {
    await axios
      .get(`${serverLink}staff/registration/hostels/hostel-rooms`, token)
      .then((res) => {
        const data = res.data;
        let rows = [];
        if (data.message === "success") {
          data.data.length > 0 &&
            data.data.map((item, index) => {
              rows.push([
                index + 1,
                item.HostelName,
                item.RoomNo,
                item.FloorName,
                item.HostelFor+" Hostel",
                item.Capacity+" Bed(s)",
                <>
                  <button
                    onClick={() => {
                      setEntryId(item.EntryID);
                      setValue("hostelId", item.HostelID);
                      setValue("roomNumber", item.RoomNo);
                      setValue("floorName", item.FloorName);
                      setValue("capacity", item.Capacity);
                      setValue("price", item.Price);
                    }}
                    type="button"
                    data-toggle="tooltip"
                    data-placement="right"
                    title="Edit Room"
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#kt_modal_general"
                  >
                    <i className={"fa fa-pen"} />
                  </button>
                  <button
                    style={{ marginLeft: "30px" }}
                    type="button"
                    data-toggle="tooltip"
                    data-placement="right"
                    title="Add Bed to Room"
                    onClick={(e) => {
                      setEntryId(item.EntryID);
                      setreadyToShow(true);
                      setRoomBedDets({
                        floor: item.FloorName,
                        roomId: item.EntryID, //HostelID
                        Capacity: item.Capacity,
                        hostelId: item.HostelID,
                        roomNo:item.RoomNo,
                        hosteFor: item.HostelFor,
                      });
                      setBedNumber("");
                      getRoomBed(item.EntryID);
                    }}
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#bedForm"
                  >
                    <i className={"fa fa-plus"} />
                  </button>
                </>,
              ]);
            });
        }
        setHostelRooms(rows);
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  };

  const clearItems = () => {
    setEntryId("");
    setValue("hostelId", "");
    setValue("roomNumber", "");
    setValue("floorName", "");
    setValue("capacity", "");
    setValue("price", "");
  };

  const addBedToRoom = async (e) => {
    e.preventDefault();
    if(roomBedDets.Capacity-hostelRoomBeds.length==0){
      toast.error("Room is Filled Up");
      setreadyToShow(false);
      return false;
    }
    if (bedNumber === "") {
      toast.error("Please Provide Bed Number");
      return false;
    }
    let dataTo = {
      //roomNo: roomBedDets.hostelId,
      roomID: roomBedDets.roomId,
      bedNo: bedNumber,
    };
    await axios
      .post(`${serverLink}staff/registration/hostels/room-beds`, dataTo, token)
      .then((res) => {
        if (res.data.message === "success") {
          toast.success("Bed Added to Room Successfully");
          getRoomBed(roomBedDets.roomId);
          setBedNumber("");
        } else {
          toast.error("An error has occurred. Please try again!");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  };
  const addHostelRoom = async (data) => {
    if (data.hostelId === "") {
      toast.error("Please select Hostel Name");
      return false;
    }
    if (data.roomNumber === "") {
      toast.error("Please Provide Room Number");
      return false;
    }
    if (data.floorName === "") {
      toast.error("Please Select Floor Name");
      return false;
    }
    if (data.capacity === "") {
      toast.error("Please Provide Room Capacity");
      return false;
    }
    if (data.price === "") {
      toast.error("Please Provide Room Price");
      return false;
    }
    if (entry_id == "") {
      let dataTo = {
        roomNumber: data.roomNumber,
        hostelId: data.hostelId,
        floorName: data.floorName,
        capacity: data.capacity,
        price: data.price,
      };
      await axios
        .post(`${serverLink}staff/registration/hostels/hostel-rooms`, dataTo, token)
        .then((res) => {
          if (res.data.message === "success") {
            toast.success("Hostel Room Added Successfully");
            document.getElementById("closeModal").click();
            clearItems();

            getHostelRooms();
          } else {
            toast.error("An error has occurred. Please try again!");
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("NETWORK ERROR. Please try again!");
        });
    } else {
      let dataTo = {
        entry_id: entry_id,
        roomNumber: data.roomNumber,
        floorName: data.floorName,
        capacity: data.capacity,
        price: data.price,
      };
      await axios
        .patch(`${serverLink}staff/registration/hostels/hostel-rooms`, dataTo, token)
        .then((res) => {
          if (res.data.message === "success") {
            toast.success("Hostel Room Edited Successfully");
            document.getElementById("closeModal").click();
            clearItems();

            getHostelRooms();
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
  const getListOfHostels = async () => {
    await axios
      .get(`${serverLink}staff/registration/hostels`, token)
      .then((res) => {
        setHostelList(res.data.data);
      })
      .catch();
  };

  useEffect(() => {
    getListOfHostels();
    getHostelRooms();
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Hostel Rooms"}
        items={["Registraion", "Hostel", "Hostel Rooms"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-header border-0 pt-6">
            <div className="card-title" />
            <div className="card-toolbar">
              <div
                className="d-flex justify-content-end"
                data-kt-customer-table-toolbar="base"
              >
                <button
                  type="button"
                  onClick={clearItems}
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_general"
                >
                  Add Hostel Room
                </button>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <ReportTable columns={columns} data={hostelRooms} />
          </div>
        </div>

        <div
          class="modal fade"
          id="bedForm"
          tabindex="-1"
          aria-labelledby="bedForm"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-xl">
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
                <h2>Add a bed to Room {roomBedDets.roomNo} | Room Capcity:{roomBedDets.Capacity} | Slot Available :{roomBedDets.Capacity-hostelRoomBeds.length}</h2>
                <div class="row g-3">
                  <div class="col-sm-3">
                    <label htmlFor="hostelId">Room No.</label>
                    <input
                      id="roomNumber"
                      value={roomBedDets.roomNo}
                      disabled
                      required
                      placeholder="Enter Room Number"
                      className="form-control"
                    />
                  </div>
                  <div class="col-sm-3">
                    <label htmlFor="hostelId">Hostel For</label>
                    <input
                      id="roomNumber"
                      value={roomBedDets.hosteFor}
                      disabled
                      required
                      placeholder="Enter Room Number"
                      className="form-control"
                    />
                  </div>
                  <div class="col-sm-3">
                    <label htmlFor="hostelId">Bed Number</label>
                    <input
                      type="text"
                      required
                      value={bedNumber}
                      onChange={(e) => setBedNumber(e.target.value)}
                      class="form-control"
                      placeholder="Enter Bed Number"
                    />
                  </div>
                  <div class="col-sm-3">
                    <br />
                    {readyToShow?(
                    <button
                      type="button"
                      onClick={addBedToRoom}
                      class="btn btn-primary"
                    >
                      Add to Room
                    </button>):(
                      <button
                      type="button"
                      disabled
                      class="btn btn-primary"
                    >
                      Room is Filled Up
                    </button>
                    )}
                  </div>
                  <div style={{ marginTop: "50px" }} className="row">
                    <h2>Bed(s) in Room {roomBedDets.roomNo}</h2>
                    <ReportTable columns={columns2} data={hostelRoomBeds} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal title={"Hostel Room Form"}>
          <form onSubmit={handleSubmit(addHostelRoom)} novalidate>
            <div className="form-group">
              <label htmlFor="hostelId">Hostel Name</label>
              <select
                {...register("hostelId")}
                id="hostelId"
                required
                className="form-control"
              >
                <option value="">Select Hostel Name</option>
                {hostelList.map((item) => (
                  <option value={`${item.EntryID}`} key={item.EntryID}>
                    {item.HostelName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group pt-5">
              <label htmlFor="roomNumber">Room Number</label>
              <input
                {...register("roomNumber")}
                id="roomNumber"
                required
                placeholder="Enter Room Number"
                className="form-control"
              />
            </div>

            <div className="form-group pt-5">
              <label htmlFor="roomNumber">Floor Name</label>
              <select
                {...register("floorName")}
                id="floorName"
                required
                className="form-control"
              >
                <option value="">Select Floor Name</option>
                <option value="Ground">Ground</option>
                <option value="First">First</option>
                <option value="Second">Second</option>
              </select>
            </div>

            <div className="form-group pt-5">
              <label htmlFor="capacity">
                Room Capacity(
                <small>Number of beds in the room</small>)
              </label>
              <input
                {...register("capacity")}
                id="capacity"
                required
                type="number"
                placeholder="Enter Number of beds in the room"
                className="form-control"
              />
            </div>
            <div className="form-group pt-5">
              <label htmlFor="roomNumber">Price</label>
              <input
                {...register("price")}
                id="price"
                required
                type="number"
                placeholder="Enter Price"
                className="form-control"
              />
            </div>
            <div className="form-group pt-5">
              <button className="btn btn-primary w-100">Save</button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails[0],
  };
};

export default connect(mapStateToProps, null)(HostelRooms);
