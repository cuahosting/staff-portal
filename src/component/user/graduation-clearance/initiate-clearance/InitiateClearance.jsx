import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import Modal from "../../../common/modal/modal";
import SearchSelect from "../../../common/select/SearchSelect";

function InitiateClearance(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [studentSelectList, setStudentSelectList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState({ StudentID: "" });

  async function clearStudent() {
    const dataTo = { id: selectedStudent.StudentID };
    const { success, message } = await api.post("staff/users/graduation-clearance/", dataTo);
    if (success) { toast.success("Clearance Initiated!"); }
    else { toast.error(message || "An error has occurred. Please try again!"); }
  }

  const getStudentDetails = async () => {
    const { success, data: result } = await api.get("staff/student-manager/student/active");
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item) => { rows.push({ value: item.StudentID, label: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})` }); });
      setStudentSelectList(rows);
      setStudentList(result);
    }
  };

  useEffect(() => { getStudentDetails(); }, []);

  const handleChange = (e) => {
    const filter_student = studentList.filter((i) => i.StudentID === e.value);
    if (filter_student.length > 0) { setSelectedStudent({ StudentID: filter_student[0].StudentID }); }
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Initiate Clearance"} items={["Users", "Graduation Clearance", "Initiate Clearance"]} />
      <div className="flex-column-fluid"><div className="card"><div className="card-body p-0"><div className="row g-3"><div className="col-sm-3"><label htmlFor="hostelId">Select Student</label><SearchSelect value={studentSelectList.find(op => op.value === selectedStudent.StudentID) || null} onChange={handleChange} options={studentSelectList} placeholder="Search Student" /></div><div className="col-sm-3"><br /><button type="button" onClick={clearStudent} className="btn btn-primary">Initiate Clearance</button></div></div></div></div><Modal title={"Progression Settings Form"}><form><div className="form-group pt-2"><button className="btn btn-primary w-100">Save</button></div></form></Modal></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(InitiateClearance);
