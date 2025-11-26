import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { serverLink } from "../../../../resources/url";
import Modal from "../../../common/modal/modal";
import Select2 from "react-select2-wrapper";

function InitiateClearance(props) {
  const token = props.loginData.token;

  const [isLoading, setIsLoading] = useState(false);
  const [studentSelectList, setStudentSelectList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState({
    StudentID: "",
  });
  async function clearStudent() {
    const dataTo = {
      id: selectedStudent.StudentID,
    };
    await axios
      .post(`${serverLink}staff/users/graduation-clearance/`, dataTo, token)
      .then((res) => {
        if (res.data.message === "success") {
          toast.success("Clearance Initiated!");
        } else {
          toast.error(res.data.whatToShow);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  }
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
  useEffect(() => {
    getStudentDetails();
  }, []);
  const handleChange = (e) => {
    const filter_student = studentList.filter(
      (i) => i.StudentID === e.target.value
    );
    if (filter_student.length > 0) {
      selectedStudent.StudentID = filter_student[0].StudentID;
    }
  };
  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Initiate Clearance"}
        items={["Users", "Graduation Clearance", "Initiate Clearance"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body p-0">
            <div className="row g-3">
              <div className="col-sm-3">
                <label htmlFor="hostelId">Select Student</label>
                <Select2
                  defaultValue={selectedStudent.StudentID}
                  data={studentSelectList}
                  onChange={handleChange}
                  options={{
                    placeholder: "Search Student",
                  }}
                />
              </div>
              <div class="col-sm-3">
                <br />
                <button
                  type="button"
                  onClick={clearStudent}
                  class="btn btn-primary"
                >
                  Initiate Clearance
                </button>
              </div>
            </div>
          </div>
        </div>

        <Modal title={"Progression Settings Form"}>
          <form>
            <div className="form-group pt-2">
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

export default connect(mapStateToProps, null)(InitiateClearance);
