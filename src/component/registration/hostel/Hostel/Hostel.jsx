import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import Modal from "../../../common/modal/modal";
import ReportTable from "../../../common/table/ReportTable";
import { formatDateAndTime } from "../../../../resources/constants";
import SearchSelect from "../../../common/select/SearchSelect";
import { useForm } from "react-hook-form";

function Hostel(props) {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [entry_id, setEntryId] = useState("");
  const [hostels, setHostels] = useState([]);
  const [manager, setManager] = useState("");
  const [staffList, setStaffList] = useState([]);
  const columns = ["S/N", "Hostel For", "Hostel Name", "Hostel Location", "Manager Name", "Manager Phone", "Added By", "Added Date", "Action"];

  const getHostels = async () => {
    const { success, data } = await api.get("staff/registration/hostels");
    if (success && data?.message === "success" && data.data?.length > 0) {
      const rows = data.data.map((item, index) => [
        index + 1, item.HostelFor, item.HostelName, item.Location,
        `${item.FirstName}    ${item.Surname}`, item.ManagerPhone, item.InsertedBy,
        formatDateAndTime(item.InsertedDate, "date_and_time"),
        <button onClick={() => {
          let man3 = { value: `${item.ManagerID}?${item.ManagerEmail}?${item.ManagerPhone}`, label: `${item.ManagerID}--${item.FirstName + " " + item.Surname}`, key: item.ManagerID };
          setEntryId(item.EntryID); setValue("hostelLocation", item.Location); setValue("hostelName", item.HostelName); setValue("hostelFor", item.HostelFor); setValue("manager", man3); setManager(man3);
        }} type="button" className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_general"><i className={"fa fa-pen"} /></button>,
      ]);
      setHostels(rows);
    }
  };

  const clearItems = () => { setEntryId(""); setValue("hostelLocation", ""); setValue("hostelName", ""); setValue("manager", ""); setValue("hostelFor", ""); };

  useEffect(() => { getListOfStaff(); getHostels(); }, []);

  const addHostel = async (data) => {
    if (data.hostelFor === "") { toast.error("Please select Male or Female"); return false; }
    if (manager === "") { toast.error("Please select Hostel Manager"); return false; }
    if (data.hostelName === "") { toast.error("Please Provide Name of Hostel"); return false; }
    if (data.hostelLocation === "") { toast.error("Please select Hostel Location"); return false; }

    const dataTo = {
      entry_id: entry_id || "", hostelFor: data.hostelFor, hostelName: data.hostelName,
      managerId: manager.value.split("?")[0], managerEmail: manager.value.split("?")[1], managerPhone: manager.value.split("?")[2],
      location: data.hostelLocation, insertedBy: props.loginData.StaffID, updatedBy: props.loginData.StaffID,
    };

    if (entry_id === "") {
      const { success, data: result } = await api.post("staff/registration/hostels", dataTo);
      if (success && result?.message === "success") { toast.success("Hostel Added Successfully"); document.getElementById("closeModal").click(); clearItems(); getHostels(); }
      else if (success) { toast.error(result?.message || "An error occurred"); }
    } else {
      const { success, data: result } = await api.patch("staff/registration/hostels", dataTo);
      if (success && result?.message === "success") { toast.success("Hostel Updated Successfully"); document.getElementById("closeModal").click(); clearItems(); getHostels(); }
      else if (success) { toast.error("An error has occurred. Please try again!"); }
    }
  };

  const getListOfStaff = async () => {
    const { success, data } = await api.get("staff/staff-report/staff-list");
    if (success && data) {
      const rows = data.map((row) => ({ value: `${row.StaffID}?${row.EmailAddress}?${row.PhoneNumber}`, label: `${row.StaffID}--${row.StaffName}`, key: row.StaffID }));
      setStaffList(rows);
    }
  };

  const getStaffEmailAndPhone = (e) => { setManager(e); };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Hostel"} items={["Registraion", "Hostel", "Hostels"]} />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-header border-0 pt-6">
            <div className="card-title" />
            <div className="card-toolbar">
              <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                <button type="button" onClick={() => clearItems()} className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general">Add Hostel</button>
              </div>
            </div>
          </div>
          <div className="card-body p-0"><ReportTable columns={columns} data={hostels} /></div>
        </div>
        <Modal title={"Add Hostel Form"}>
          <form onSubmit={handleSubmit(addHostel)} noValidate>
            <div className="form-group">
              <label htmlFor="hostelFor">Hostel For</label>
              <SearchSelect id="hostelFor" label="Hostel For" value={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }].find(op => op.value === watch("hostelFor")) || null} options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]} onChange={(selected) => setValue("hostelFor", selected?.value)} placeholder="Select Hostel For" required />
            </div>
            <div className="form-group pt-5">
              <label htmlFor="hostelName">Hostel Name</label>
              <input id="hostelName" {...register("hostelName")} required placeholder="Enter Hostel Name" className="form-control" />
            </div>
            <div className="form-group pt-5">
              <label htmlFor="manager">Manager</label>
              <SearchSelect id="manager" label="Manager" value={manager} options={staffList} onChange={getStaffEmailAndPhone} placeholder="select staff" />
            </div>
            <div className="form-group pt-5">
              <label htmlFor="hostelLocation">Hostel Location</label>
              <input id="hostelLocation" {...register("hostelLocation")} required placeholder="Enter Hostel Location" className="form-control" />
            </div>
            <div className="form-group pt-5"><button className="btn btn-primary w-100">Save</button></div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(Hostel);
