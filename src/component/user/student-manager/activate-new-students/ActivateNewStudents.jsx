import React, { useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";

function ActivateNewStudents(props) {
  const [isLoading, setIsLoading] = useState(false);

  const activateNewStudents = async (e) => {
    e.preventDefault();
    const { success } = await api.get("staff/users/student-manager/activate-new-students");
    if (success) { toast.success("All New Students Activated"); }
    else { toast.error("An error has occurred. Please try again!"); }
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Activate New Students"} items={["Users", "Student Manager", "Activate New Students"]} />
      <div className="flex-column-fluid"><div className="card"><div className="card-body p-0"><div className="form-group pt-2"><button onClick={activateNewStudents} className="btn btn-primary w-100">Activate New Students</button></div></div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(ActivateNewStudents);
