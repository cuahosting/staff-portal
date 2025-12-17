import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import Modal from "../../../common/modal/modal";
import ReportTable from "../../../common/table/ReportTable";
import { formatDateAndTime } from "../../../../resources/constants";
import { CommentsDisabledOutlined } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import SearchSelect from "../../../common/select/SearchSelect";

function HostelRooms(props) {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [hostelRoomBeds, setHostelRoomBeds] = useState([]);
  const [hostelRooms, setHostelRooms] = useState([]);
  const [hostelList, setHostelList] = useState([]);
  const [bedNumber, setBedNumber] = useState([]);
  const [readyToShow, setreadyToShow] = useState(true);
  const [roomBedDets, setRoomBedDets] = useState({ floor: "", roomId: "", Capacity: "", roomNo: "", hosteFor: "" });
  const [entry_id, setEntryId] = useState("");
  const columns = ["S/N", "Hostel Name", "Room Number", "Floor Name", "Hostel", "Capacity", "Action"];
  const columns2 = ["S/N", "Bed Number", "Occupied By", "Status"];

  const getRoomBed = async (roomId) => {
    const { success, data } = await api.get(`staff/registration/hostels/room-beds/${roomId}`);
    if (success && data?.message === "success" && data.data?.length > 0) {
      const rows = data.data.map((item, index) => [index + 1, item.BedNo, item.OccupantID, item.status]);
      setHostelRoomBeds(rows);
    } else { setHostelRoomBeds([]); }
  };

  const getHostelRooms = async () => {
    const { success, data } = await api.get("staff/registration/hostels/hostel-rooms");
    if (success && data?.message === "success" && data.data?.length > 0) {
      const rows = data.data.map((item, index) => [
        index + 1, item.HostelName, item.RoomNo, item.FloorName, item.HostelFor + " Hostel", item.Capacity + " Bed(s)",
        <>
          <button onClick={() => { setEntryId(item.EntryID); setValue("hostelId", item.HostelID); setValue("roomNumber", item.RoomNo); setValue("floorName", item.FloorName); setValue("capacity", item.Capacity); setValue("price", item.Price); }} type="button" data-toggle="tooltip" data-placement="right" title="Edit Room" className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_general"><i className={"fa fa-pen"} /></button>
          <button style={{ marginLeft: "30px" }} type="button" data-toggle="tooltip" data-placement="right" title="Add Bed to Room" onClick={(e) => { setEntryId(item.EntryID); setreadyToShow(true); setRoomBedDets({ floor: item.FloorName, roomId: item.EntryID, Capacity: item.Capacity, hostelId: item.HostelID, roomNo: item.RoomNo, hosteFor: item.HostelFor }); setBedNumber(""); getRoomBed(item.EntryID); }} className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#bedForm"><i className={"fa fa-plus"} /></button>
        </>,
      ]);
      setHostelRooms(rows);
    }
  };

  const clearItems = () => { setEntryId(""); setValue("hostelId", ""); setValue("roomNumber", ""); setValue("floorName", ""); setValue("capacity", ""); setValue("price", ""); };

  const addBedToRoom = async (e) => {
    e.preventDefault();
    if (roomBedDets.Capacity - hostelRoomBeds.length === 0) { toast.error("Room is Filled Up"); setreadyToShow(false); return false; }
    if (bedNumber === "") { toast.error("Please Provide Bed Number"); return false; }
    const dataTo = { roomID: roomBedDets.roomId, bedNo: bedNumber };
    const { success, data } = await api.post("staff/registration/hostels/room-beds", dataTo);
    if (success && data?.message === "success") { toast.success("Bed Added to Room Successfully"); getRoomBed(roomBedDets.roomId); setBedNumber(""); }
    else if (success) { toast.error("An error has occurred. Please try again!"); }
  };

  const addHostelRoom = async (data) => {
    if (data.hostelId === "") { toast.error("Please select Hostel Name"); return false; }
    if (data.roomNumber === "") { toast.error("Please Provide Room Number"); return false; }
    if (data.floorName === "") { toast.error("Please Select Floor Name"); return false; }
    if (data.capacity === "") { toast.error("Please Provide Room Capacity"); return false; }
    if (data.price === "") { toast.error("Please Provide Room Price"); return false; }

    if (entry_id === "") {
      const dataTo = { roomNumber: data.roomNumber, hostelId: data.hostelId, floorName: data.floorName, capacity: data.capacity, price: data.price };
      const { success, data: result } = await api.post("staff/registration/hostels/hostel-rooms", dataTo);
      if (success && result?.message === "success") { toast.success("Hostel Room Added Successfully"); document.getElementById("closeModal").click(); clearItems(); getHostelRooms(); }
      else if (success) { toast.error("An error has occurred. Please try again!"); }
    } else {
      const dataTo = { entry_id: entry_id, roomNumber: data.roomNumber, floorName: data.floorName, capacity: data.capacity, price: data.price };
      const { success, data: result } = await api.patch("staff/registration/hostels/hostel-rooms", dataTo);
      if (success && result?.message === "success") { toast.success("Hostel Room Edited Successfully"); document.getElementById("closeModal").click(); clearItems(); getHostelRooms(); }
      else if (success) { toast.error("An error has occurred. Please try again!"); }
    }
  };

  const getListOfHostels = async () => {
    const { success, data } = await api.get("staff/registration/hostels");
    if (success && data?.data) setHostelList(data.data);
  };

  useEffect(() => { getListOfHostels(); getHostelRooms(); }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Hostel Rooms"} items={["Registraion", "Hostel", "Hostel Rooms"]} />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-header border-0 pt-6">
            <div className="card-title" />
            <div className="card-toolbar">
              <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                <button type="button" onClick={clearItems} className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general">Add Hostel Room</button>
              </div>
            </div>
          </div>
          <div className="card-body p-0"><ReportTable columns={columns} data={hostelRooms} /></div>
        </div>
        <div className="modal fade" id="bedForm" tabIndex="-1" aria-labelledby="bedForm" aria-hidden="true">
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title" id="bedForm"></h5><button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
              <div className="modal-body">
                <h2>Add a bed to Room {roomBedDets.roomNo} | Room Capcity:{roomBedDets.Capacity} | Slot Available :{roomBedDets.Capacity - hostelRoomBeds.length}</h2>
                <div className="row g-3">
                  <div className="col-sm-3"><label htmlFor="hostelId">Room No.</label><input id="roomNumber" value={roomBedDets.roomNo} disabled required placeholder="Enter Room Number" className="form-control" /></div>
                  <div className="col-sm-3"><label htmlFor="hostelId">Hostel For</label><input id="roomNumber" value={roomBedDets.hosteFor} disabled required placeholder="Enter Room Number" className="form-control" /></div>
                  <div className="col-sm-3"><label htmlFor="hostelId">Bed Number</label><input type="text" required value={bedNumber} onChange={(e) => setBedNumber(e.target.value)} className="form-control" placeholder="Enter Bed Number" /></div>
                  <div className="col-sm-3"><br />{readyToShow ? (<button type="button" onClick={addBedToRoom} className="btn btn-primary">Add to Room</button>) : (<button type="button" disabled className="btn btn-primary">Room is Filled Up</button>)}</div>
                  <div style={{ marginTop: "50px" }} className="row"><h2>Bed(s) in Room {roomBedDets.roomNo}</h2><ReportTable columns={columns2} data={hostelRoomBeds} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Modal title={"Hostel Room Form"}>
          <form onSubmit={handleSubmit(addHostelRoom)} noValidate>
            <div className="form-group">
              <label htmlFor="hostelId">Hostel Name</label>
              <SearchSelect id="hostelId" label="Hostel Name" value={hostelList.map((item) => ({ value: `${item.EntryID}`, label: item.HostelName })).find(op => op.value === watch("hostelId")) || null} options={hostelList.map((item) => ({ value: `${item.EntryID}`, label: item.HostelName }))} onChange={(selected) => setValue("hostelId", selected?.value)} placeholder="Select Hostel Name" required />
            </div>
            <div className="form-group pt-5"><label htmlFor="roomNumber">Room Number</label><input {...register("roomNumber")} id="roomNumber" required placeholder="Enter Room Number" className="form-control" /></div>
            <div className="form-group pt-5"><label htmlFor="roomNumber">Floor Name</label><SearchSelect id="floorName" label="Floor Name" value={[{ value: "Ground", label: "Ground" }, { value: "First", label: "First" }, { value: "Second", label: "Second" }].find(op => op.value === watch("floorName")) || null} options={[{ value: "Ground", label: "Ground" }, { value: "First", label: "First" }, { value: "Second", label: "Second" }]} onChange={(selected) => setValue("floorName", selected?.value)} placeholder="Select Floor Name" required /></div>
            <div className="form-group pt-5"><label htmlFor="capacity">Room Capacity(<small>Number of beds in the room</small>)</label><input {...register("capacity")} id="capacity" required type="number" placeholder="Enter Number of beds in the room" className="form-control" /></div>
            <div className="form-group pt-5"><label htmlFor="roomNumber">Price</label><input {...register("price")} id="price" required type="number" placeholder="Enter Price" className="form-control" /></div>
            <div className="form-group pt-5"><button className="btn btn-primary w-100">Save</button></div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(HostelRooms);
