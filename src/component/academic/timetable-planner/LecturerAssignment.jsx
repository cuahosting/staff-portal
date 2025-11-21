import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux/es/exports";
import Select2 from "react-select2-wrapper";
import "react-select2-wrapper/css/select2.css";
import AGReportTable from "../../common/table/AGReportTable";
import Select from 'react-select';


function LecturerAssignment(props) {
  const token = props.LoginDetails[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [staff, setStaff] = useState({
    StaffId: "",
    StaffName: ""
  })

  const [modules, setModules] = useState([])
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [selectedModule, setSelectedModule] = useState({
    EntryID: "",
    ModuleCode: "",
    ModuleName: "",
    ModuleLevel: "",
    ModuleSemester: "",
    ModuleType: "",
    SchoolSemester: "",
    MainLecturer: "",
    AlternateLecturer: "",
    AlternateLecturer2: "",
    _Semester: "",
    _Semester2: ""
  })
  const columns = ["ModuleCode", "ModuleName", "ModuleLevel", "ModuleSemester", "ModuleType", "SchoolSemester", "Action", "MainLecturer", "AlternateLecturer", "AlternateLecturer2",]
  const [data, setData] = useState([])
  const [semesterList, setSemesterList] = useState([]);

  const geSemesters = async () => {
    try {
      await axios.get(`${serverLink}staff/timetable/timetable/semester`, token)
        .then((result) => {
          let rows = []
          if (result.data.length > 0) {
            result.data.map((row) => {
              rows.push({ value: row.SemesterCode, label: row.SemesterName +"- "+row.SemesterCode })
            });
            setSemesterList(result.data);
            setSemesterOptions(rows)
          }
          setIsLoading(false)
        })
    } catch (error) {
      console.log(error)
    }

  }
  const getData = async (e) => {
    toast.info('please wait...')
    let staff = [];
    axios.get(`${serverLink}staff/academics/timetable-planner/staff/list`, token)
      .then((response) => {
        staff.push(response.data)
        let rows_ = [];
        response.data.length > 0 &&
          response.data.map((row) => {
            rows_.push({ value: row.StaffID, label: row.FirstName + " " + row.MiddleName + "" + row.Surname },)
          });
        setStaffList(rows_);
        setStaff(rows_);
      })
      .catch((ex) => {
        console.error(ex);
      });

    axios.get(`${serverLink}staff/academics/timetable-planner/module-assignment/officer-modules/${props.LoginDetails[0].StaffID}/${e}`, token)
      .then((response) => {
        let rows = [];
        if (response.data.length > 0) {
          response.data.map((item, index) => {
            rows.push([
              item.ModuleCode,
              item.ModuleName,
              item.ModuleLevel,
              item.ModuleSemester,
              item.ModuleType,
              item.SchoolSemester,
              <button
                className="btn btn-sm btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#lecturer"
                onClick={() => {
                  setSelectedModule({
                    ...selectedModule,
                    EntryID: item.EntryID,
                    ModuleCode: item.ModuleCode,
                    ModuleName: item.ModuleName,
                    ModuleLevel: item.ModuleLevel,
                    ModuleSemester: item.ModuleSemester,
                    ModuleType: item.ModuleType,
                    SchoolSemester: item.SchoolSemester,
                    MainLecturer: { value: item.MainLecturer, label: item.MainLecturerName },
                    AlternateLecturer: { value: item.AlternateLecturer, label: item.AlternateLecturerName },
                    AlternateLecturer2: { value: item.AlternateLecturer2, label: item.AlternateLecturer2Name },
                    action: "update",
                  });
                }
                }
              >
                <i className="fa fa-pen" />
              </button>,
              item.MainLecturerName,
              item.AlternateLecturerName,
              item.AlternateLecturer2Name
            ])
          })
          setData(rows)
          setModules(rows)
          setIsLoading(false);
        }
        else {
          toast.error('no record');
          setData(rows)
         // setIsLoading(false)
        }

      })
      .catch((ex) => {
        console.error(ex);
      });

  };

  useEffect(() => {
    geSemesters();
  }, []);

  const onSemesterChange = async (e) => {
    if (e.value !== "") {
      getData(e.value);
      setSelectedModule({
        ...selectedModule,
        _Semester: e.value,
        _Semester2: e
      })
    } else {
      setSelectedModule({
        ...selectedModule,
        _Semester: "",
        _Semester2: ""
      })
      setData([])
    }
  }
  const handleAssignStaff = async (e) => {
    e.preventDefault();
    const senData = {
      EntryID: selectedModule.EntryID,
      ModuleCode: selectedModule.ModuleCode,
      ModuleName: selectedModule.ModuleName,
      ModuleLevel: selectedModule.ModuleLevel,
      ModuleSemester: selectedModule.ModuleSemester,
      ModuleType: selectedModule.ModuleType,
      SchoolSemester: selectedModule.SchoolSemester,
      MainLecturer: selectedModule.MainLecturer.value,
      AlternateLecturer: selectedModule.AlternateLecturer.value,
      AlternateLecturer2: selectedModule.AlternateLecturer2.value,
    }

    axios.patch(`${serverLink}staff/academics/timetable-planner/module-assignment/assign-lecturers`, senData, token)
      .then((response) => {
        if (response.data.message === "success") {
          getData(selectedModule.SchoolSemester);
          toast.success("Staff added to the module successfully");
          document.getElementById("closeModal").click();
        } else {
          toast.error("try again...");
        }
      })
      .catch((ex) => {
        console.error(ex);
      });
  };
  const onMainLecturerChange = (e) => {
    setSelectedModule({
      ...selectedModule,
      MainLecturer: e
    })
  }
  const onAltLecturer1Change = (e) => {
    setSelectedModule({
      ...selectedModule,
      AlternateLecturer: e
    })
  }
  const onAltLecturer2Change = (e) => {
    setSelectedModule({
      ...selectedModule,
      AlternateLecturer2: e
    })
  }
  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Lecturer Assignment"}
        items={["Academics", "Timetable Planner", "Lecturer Assignment"]}
      />
      <div className="flex-column-fluid">
        <div className="col-md-12">
          {semesterList.length > 0 &&
            <div className="fv-row mb-6 enhanced-form-group">
              <label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="_Semester">Select Semester</label>
              <Select
                  id="_Semester"
                  className="form-select form-select"
                  value={selectedModule._Semester2}
                  onChange={onSemesterChange}
                  options={semesterOptions}
                  placeholder="select Semester"
              />
              {/*<select id="_Semester" onChange={onSemesterChange}*/}
              {/*  value={selectedModule._Semester}*/}
              {/*  className="form-select form-select"*/}
              {/*  data-kt-select2="true"*/}
              {/*  data-placeholder="Select option"*/}
              {/*  data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">*/}
              {/*  <option value={""}>-select semester-</option>*/}
              {/*  {semesterList.length > 0 ?*/}
              {/*    <>*/}
              {/*      {semesterList.map((x, y) => {*/}
              {/*        return (*/}
              {/*          <option key={y} value={x.SemesterCode}>{x.SemesterName}</option>*/}
              {/*        )*/}
              {/*      })}*/}
              {/*    </>*/}
              {/*    :*/}
              {/*    <></>}*/}
              {/*</select>*/}
            </div>}
        </div>
        {
          data.length > 0 ?
            <> <AGReportTable columns={columns} data={data} title={"Modules to Lecturer Assignment"} />
            </>
            : <></>
        }
        <Modal title={selectedModule.ModuleCode} id={"lecturer"} close={"lecturer"} >
          <div className="col-md-12">
            <form onSubmit={handleAssignStaff}>
              <div className="row">
                <div className="col-md-12">
                  <label className="fs-6 fw-bold mb-2">{selectedModule.ModuleCode}: {selectedModule.ModuleName}</label><br />
                  <label className="fs-6 fw-bold mb-2">{selectedModule.SchoolSemester}</label><br />
                  <label className="fs-6 fw-bold mb-2">{selectedModule.ModuleSemester} Semester</label><br />
                  <label className="fs-6 fw-bold mb-2">{selectedModule.ModuleType}</label>
                </div>
                {
                  staffList.length > 0 &&
                  <>
                    <div className="fv-row mb-6 enhanced-form-group mt-5">
                      <label className="form-label fs-6 fw-bolder text-dark enhanced-label required">
                        Main Lecturer
                      </label>
                      <Select
                        name="MainLecturer"
                        value={selectedModule.MainLecturer}
                        onChange={onMainLecturerChange}
                        options={staff}
                      />
                    </div>
                    <div className="fv-row mb-6 enhanced-form-group">
                      <label className="form-label fs-6 fw-bolder text-dark enhanced-label required">Supporting Lecturer 1</label>
                      <Select
                        name="AlternateLecturer"
                        value={selectedModule.AlternateLecturer}
                        onChange={onAltLecturer1Change}
                        options={staff}
                      />
                    </div>
                    <div className="fv-row mb-6 enhanced-form-group">
                      <label className="form-label fs-6 fw-bolder text-dark enhanced-label required">Supporting Lecturer 2</label>
                      <Select
                        name="AlternateLecturer2"
                        value={selectedModule.AlternateLecturer2}
                        onChange={onAltLecturer2Change}
                        options={staff}
                      />
                    </div>
                  </>
                }
                <div className="col-md-3">
                  <div className="row ">
                    <button type="submit" className="btn btn-primary mt-8">
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    LoginDetails: state.LoginDetails,
  };
};
export default connect(mapStateToProps, null)(LecturerAssignment);

