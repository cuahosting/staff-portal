import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { serverLink } from "../../../../resources/url";
import Modal from "../../../common/modal/modal";
import Select2 from "react-select2-wrapper";
import "react-select2-wrapper/css/select2.css";
import { useForm } from "react-hook-form";
import { encryptData, projectDomain } from "../../../../resources/constants";
function AddStudentPortal(props) {
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
  const addStudentPortalClick = async (data) => {
    if (data.ID === "") {
      toast.error("Please specify student ID");
      return;
    }
    if (data.email2 === "") {
      toast.error("Please specify student private email");
      return;
    }
    const dataTo = {
      ...data,
      ID: selectedStudent.StudentID,
      password: encryptData("123456789"),
    };
    await axios
      .post(
        `${serverLink}staff/users/student-manager/add-student-portal`,
        dataTo, token
      )
      .then((res) => {
        if (res.data.message === "success") {
          toast.success(res.data.whatToShow);
        } else {
          toast.error("An error has occurred. Please try again!");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  };
  const getStudentDetails = async () => {
    await axios
      .get(`${serverLink}staff/student-manager/student/active`, token)
      .then((response) => {
        const result = response.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item) => {
            rows.push({
              id: item.StudentID,
              text: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})`,
            });
          });
          setStudentSelectList(rows);
        }
        setStudentList(result);
      })
      .catch((err) => {
        console.log("NETWORK ERROR");
      });
  };

  const handleChange = (e) => {
    const filter_student = studentList.filter(
      (i) => i.StudentID === e.target.value
    );
    if (filter_student.length > 0) {
      selectedStudent.StudentID = filter_student[0].StudentID;
      selectedStudent.FirstName = filter_student[0].FirstName;
      selectedStudent.EmailAddress = filter_student[0].EmailAddress;
      setValue(
        "username",
        (selectedStudent.FirstName +
          "" +
          selectedStudent.StudentID.slice(selectedStudent.StudentID.length - 4)).toLowerCase()
      );
      setValue("email2", selectedStudent.EmailAddress.toLowerCase());
      setValue(
        "email",
        (selectedStudent.FirstName +
          "" +
          selectedStudent.StudentID.slice(
            selectedStudent.StudentID.length - 4
          ) +
          projectDomain).toLowerCase()
      );
    }
  };

  useEffect(() => {
    getStudentDetails();
  }, []);
  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Add Student Portal"}
        items={["Users", "Student Manager", "Add Student Portal"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-0">
            <form onSubmit={handleSubmit(addStudentPortalClick)}>
              <div className="form-group pt-5">
                <label htmlFor="roomNumber">Student ID</label>
                {/* <input
                  {...register("ID")}
                  id="ID"
                  required
                  placeholder="Enter Student ID"
                  className="form-control"
                /> */}
                <Select2
                  defaultValue={selectedStudent.StudentID}
                  data={studentSelectList}
                  onChange={handleChange}
                  options={{
                    placeholder: "Search Student",
                  }}
                />
              </div>

              <div className="form-group pt-5">
                <label htmlFor="roomNumber">Username</label>
                <input
                  {...register("username")}
                  id="username"
                  required
                  disabled
                  placeholder="Enter Username"
                  className="form-control"
                />
              </div>

              <div className="form-group pt-5">
                <label htmlFor="email">Email Address</label>
                <input
                  {...register("email")}
                  disabled
                  id="email"
                  required
                  type="email"
                  placeholder="Enter Email Address"
                  className="form-control"
                />
              </div>
              <div className="form-group pt-5">
                <label htmlFor="email2">Private Email Address</label>
                <input
                  {...register("email2")}
                  id="email2"
                  required
                  disabled
                  type="email"
                  placeholder="Enter Private Email Address"
                  className="form-control"
                />
              </div>
              <div className="form-group pt-5">
                <button className="btn btn-primary w-100">Save</button>
              </div>
            </form>
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

export default connect(mapStateToProps, null)(AddStudentPortal);
