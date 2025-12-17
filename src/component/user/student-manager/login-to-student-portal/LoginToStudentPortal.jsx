import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { serverStatus } from "../../../../resources/url";
import SearchSelect from "../../../common/select/SearchSelect";
import { useForm } from "react-hook-form";
import { encryptData, projectStudentURL } from "../../../../resources/constants";

function LoginToStudentPortal(props) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue } = useForm();
  const [studentSelectList, setStudentSelectList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState({ StudentID: "", FirstName: "", EmailAddress: "" });
  const [studentList, setStudentList] = useState([]);

  const loginToPortal = async (data) => {
    if (selectedStudent.StudentID === "") { toast.error("Please specify student ID"); return; }
    let encryptedId = encryptData(selectedStudent.StudentID);
    let newWindow;
    if (serverStatus === "Dev") { newWindow = window.open(`http://localhost:3001/login-from-staff/${encryptedId}`, '_blank', 'noopener,noreferrer'); }
    else { newWindow = window.open(`${projectStudentURL}/login-from-staff/${encryptedId}`, '_blank', 'noopener,noreferrer'); }
    if (newWindow) newWindow.opener = null;
  };

  const getStudentDetails = async () => {
    const { success, data: result } = await api.get("staff/student-manager/student/active");
    if (success && result?.length > 0) {
      let rows = [];
      result.forEach((item) => { rows.push({ value: item.StudentID, label: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})` }); });
      setStudentSelectList(rows);
      setStudentList(result);
    }
  };

  const handleChange = (e) => {
    const filter_student = studentList.filter((i) => i.StudentID === e.value);
    if (filter_student.length > 0) { setSelectedStudent({ ...selectedStudent, StudentID: filter_student[0].StudentID }); }
  };

  useEffect(() => { getStudentDetails(); }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Login To Student Portal"} items={["Users", "Student Manager", "Login To Student Portal"]} />
      <div className="flex-column-fluid"><div className="card"><div className="card-body p-0"><form onSubmit={handleSubmit(loginToPortal)}><div className="row"><div className="col"><label htmlFor="roomNumber">Student ID</label><SearchSelect value={studentSelectList.find(op => op.value === selectedStudent.StudentID) || null} onChange={handleChange} options={studentSelectList} placeholder="Search Student" /></div><div className="col"><div className="form-group pt-5"><button className="btn btn-primary w-100">Login</button></div></div></div></form></div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(LoginToStudentPortal);
