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

function ResetHostelRooms(props) {
  const [isLoading, setIsLoading] = useState(false);

  const resetHostelRooms = async (e) => {
    e.preventDefault();
    const { success, data } = await api.get("staff/registration/hostels/reset-hostel-rooms");
    if (success && data?.message === "success") { toast.success("Hostel Rooms Reset Succesfully"); }
    else if (success) { toast.error("An error has occurred. Please try again!"); }
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Reset Hostel Rooms"} items={["Registration", "Hostels", "Reset Hostel Rooms"]} />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body p-0">
            <div className="form-group pt-2">
              <button onClick={resetHostelRooms} className="btn btn-primary w-100">Reset Hostel Rooms</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(ResetHostelRooms);
