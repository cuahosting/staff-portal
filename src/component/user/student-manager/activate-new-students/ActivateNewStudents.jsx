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

function ActivateNewStudents(props) {
  const token = props.loginData.token;

  const [isLoading, setIsLoading] = useState(false);
  const activateNewStudents = async (e) => {
    e.preventDefault();
    await axios
      .get(`${serverLink}staff/users/student-manager/activate-new-students`, token)
      .then((res) => {
        if (res.data.message === "success") {
          toast.success("All New Students Activated");
        } else {
          toast.error("An error has occurred. Please try again!");
        }
      })
      .catch((err) => {
        toast.error("NETWORK ERROR. Please try again!");
      });
  };
  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Activate New Students"}
        items={["Users", "Student Manager", "Activate New Students"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body p-0">
            <div className="form-group pt-2">
              <button
                onClick={activateNewStudents}
                className="btn btn-primary w-100"
              >
                Activate New Students
              </button>
            </div>
            {/* <ReportTable columns={columns} data={progressionSteps} /> */}
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

export default connect(mapStateToProps, null)(ActivateNewStudents);
