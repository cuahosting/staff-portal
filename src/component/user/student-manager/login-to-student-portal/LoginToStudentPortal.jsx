import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { serverLink, serverStatus } from "../../../../resources/url";
import Modal from "../../../common/modal/modal";
import Select2 from "react-select2-wrapper";
import "react-select2-wrapper/css/select2.css";
import { useForm } from "react-hook-form";
import
  {
    encryptData,
    projectStudentURL,
  } from "../../../../resources/constants";
function LoginToStudentPortal(props)
{
  const token = props.loginData.token;

  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue } = useForm();
  const [studentSelectList, setStudentSelectList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState({
    StudentID: "",
    FirstName: "",
    EmailAddress: "",
  });
  const [studentList, setStudentList] = useState([]);
  const loginToPortal = async (data) =>
  {
    if (selectedStudent.StudentID === "")
    {
      toast.error("Please specify student ID");
      return;
    }
    let encryptedId = encryptData(selectedStudent.StudentID);
    let newWindow;
    if (serverStatus === "Dev")
    {
      newWindow = window.open(`http://localhost:3001/login-from-staff/${encryptedId}`, '_blank', 'noopener,noreferrer')
    } else
    {
      newWindow = window.open(`${projectStudentURL}/login-from-staff/${encryptedId}`, '_blank', 'noopener,noreferrer')
    }

    if (newWindow) newWindow.opener = null

  };
  const getStudentDetails = async () =>
  {
    await axios
      .get(`${serverLink}staff/student-manager/student/active`, token)
      .then((response) =>
      {
        const result = response.data;
        if (result.length > 0)
        {
          let rows = [];
          result.map((item) =>
          {
            rows.push({
              id: item.StudentID,
              text: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})`,
            });
          });
          setStudentSelectList(rows);
        }
        setStudentList(result);
      })
      .catch((err) =>
      {
        console.log("NETWORK ERROR");
      });
  };

  const handleChange = (e) =>
  {
    const filter_student = studentList.filter(
      (i) => i.StudentID === e.target.value
    );
    if (filter_student.length > 0)
    {
      selectedStudent.StudentID = filter_student[0].StudentID;
    }
  };

  useEffect(() =>
  {
    getStudentDetails();
  }, []);
  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Login To Student Portal"}
        items={["Users", "Student Manager", "Login To Student Portal"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body p-0">
            <form onSubmit={handleSubmit(loginToPortal)}>
              <div className="row">
                <div className="col">
                  <label htmlFor="roomNumber">Student ID</label>
                  <Select2
                    defaultValue={selectedStudent.StudentID}
                    data={studentSelectList}
                    onChange={handleChange}
                    options={{
                      placeholder: "Search Student",
                    }}
                  />
                </div>
                <div className="col">
                  <div className="form-group pt-5">
                    <button className="btn btn-primary w-100">Login</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) =>
{
  return {
    loginData: state.LoginDetails[0],
  };
};

export default connect(mapStateToProps, null)(LoginToStudentPortal);
