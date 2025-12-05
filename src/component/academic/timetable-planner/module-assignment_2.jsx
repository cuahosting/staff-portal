import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
// eslint-disable-next-line no-unused-vars
import Select2 from "react-select2-wrapper";
import "react-select2-wrapper/css/select2.css";
import Select from 'react-select';

function ModuleAssignment2(props) {
  const token = props.LoginDetails[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemeterList] = useState([]);
  const [showAssignedModules, setShowAssignedModules] = useState(false);
  const [moduleList, setModuleList] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Module Name",
        field: "ModuleName",
      },
      {
        label: "Module Code",
        field: "ModuleCode",
      },
      {
        label: "",
        field: "action",
      },
    ],
    rows: [],
  })
  const [assignedModuleList, setassignedModuleList] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Module Name",
        field: "ModuleName",
      },
      {
        label: "Module Code",
        field: "ModuleCode",
      },
      {
        label: "",
        field: "action",
      },
    ],
    rows: [],
  })
  const [fdata, setfData] = useState({
    CourseCode: "",
    ModuleCode: "",
    ModuleName: "",
    Level: "",
    SchoolSemester: "",
    ModuleSemester: "",
    ModuleType: "",
    CourseName: "",
    Courses: ""
  })

  const getData = async () => {
    try {
      await axios.get(`${serverLink}staff/academics/timetable-planner/course/list/${props.LoginDetails[0].CourseCode}`, token)
        .then((response) => {
          let rows = [];
          response.data.length > 0 &&
            response.data.forEach((item) => {
              rows.push({ value: item.CourseCode, label: item.CourseName })
            })
          setCourseList(response.data);
          setfData({
            ...fdata,
            Courses: rows
          })
        })

      await axios.get(`${serverLink}staff/timetable/timetable/semester`, token)
        .then((result) => {
          setSemeterList(result.data)
          setIsLoading(false)
        })
    } catch (error) {
      console.log('NETWORK ERROR')
    }

  }

  const getModules = async (course) => {
    toast.info('please wait...')
    await axios.get(`${serverLink}staff/academics/timetable-planner/module_assignment/modules/${course}`, token)
      .then((result) => {
        let rows = [];
        if (result.data.length > 0) {
          result.data.forEach((item, index) => {
            rows.push({
              sn: index + 1,
              ModuleName: item.ModuleName,
              ModuleCode: item.ModuleCode,
              action: (
                <button type="submit"
                  onClick={() => {
                    handleAdd(item, fdata)
                  }}
                  className="btn btn-link p-0 text-primary" style={{ fontSize: '22px' }} title="Edit"
                >
                  Add
                </button>
              ),
            });
          });
          setIsLoading(false);
        } else {
          // setModuleList([])
          toast.error('no modules')
        }
        setModuleList({
          ...moduleList,
          columns: moduleList.columns,
          rows: rows,
        });
      })
  }

  const onEdit = async (e) => {
    setfData({
      ...fdata,
      [e.target.id]: e.target.value
    })
    if(e.target.id==="CourseCode"){
      setfData({
        ...fdata,
        CourseCode: e.target.value,
        CourseName: courseList.filter(x => x.CourseCode === e.target.value)[0].CourseName
      })
      getModules(e.target.value)
    }
  };

  const onCourseCodeChange=(e)=>{
    setfData({
      ...fdata,
      CourseCode: e,
      CourseName: courseList.filter(x => x.CourseCode === e.value)[0].CourseName
    })
    getModules(e.value)
  }

  const fetchAssignedModules = async () => {
    if (fdata.CourseCode === "" || fdata.Level === "" || fdata.SchoolSemester === "" || fdata.ModuleSemester === "" || fdata.ModuleType === "") {
      toast.error('please select a combination');
      return;
    }
    toast.info('please wait...')

    await axios.post(`${serverLink}staff/academics/timetable-planner/assigned_modules/list`, {
      CourseCode: fdata.CourseCode,
      Level: fdata.Level,
      SchoolSemester: fdata.SchoolSemester,
      ModuleSemester: fdata.ModuleSemester,
      ModuleType: fdata.ModuleType
    }, token)
      .then((result) => {
        let rows = [];
        if (result.data.length > 0) {
          setShowAssignedModules(true);
          result.data.forEach((module, index) => {
            rows.push({
              sn: index + 1,
              ModuleName: module.ModuleName,
              ModuleCode: module.ModuleCode,
              action: (
                <button type="submit"
                  id="RemoveButton"
                  onClick={() => {
                    handleRemove({ EntryID: module.EntryID })
                  }}
                  className="btn btn-link p-0 text-danger" style={{ fontSize: '22px' }} title="Delete"
                >
                  Remove
                </button>
              ),
            });
          });
        }
        else {
          toast.error('no assigned modules')
        }
        setassignedModuleList({
          ...moduleList,
          columns: moduleList.columns,
          rows: rows,
        });
      })
  }


  const handleAdd = async (module, data) => {
    // toast.info('please wait...')
    // console.log(data)
    // await axios.post(`${serverLink}staff/academics/timetable-planner/module-assignment/add`, 
    //       {module: module, data:data, InsertedBy: props.LoginDetails[0].StaffID})
    //   .then((response) => {
    //     if (response.data.message === "success") {
    //       toast.success("Module added successfully");
    //       fetchAssignedModules();

    //     }
    //     else {
    //       toast.warn("Module already added");
    //     }
    //     setIsLoading(false);
    //   })
    //   .catch((error) => {
    //     console.log(error)
    //     showAlert(
    //       "NETWORK ERROR",
    //       "Please check your connection and try again!",
    //       "error"
    //     );
    //   });
  };

  const handleRemove = async (module) => {
    await axios.post(`${serverLink}staff/academics/timetable-planner/module-assignment/delete`, { EntryID: module.EntryID }, token)
      .then((response) => {
        if (response.data.message === "success") {
          toast.success("Module removed successfully");
        }
        fetchAssignedModules();
      })
      .catch((error) => {
        console.log(error)
        showAlert(
          "NETWORK ERROR",
          "Please check your connection and try again!",
          "error"
        );
      });
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Module Assignment"}
        items={["Academics", "Timetable Planner", "Module Assignment"]}
      />
      <div className="flex-column-fluid">
        <div className="card card-no-border">
          <div className="card-body p-0">
            <form>
              <div className="row col-md-12 mb-5">

                {
                  courseList.length > 0 &&
                  <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label required" htmlFor="CourseCode">
                      Course
                    </label>
                    <Select
                      id="CourseCode"
                      value={fdata.CourseCode}
                      onChange={onCourseCodeChange}
                      options={fdata.Courses}
                    />
                  </div>
                }
                <h3 className="mt-10"> <p>Select settings for module assignments</p></h3>
                <div className="col-md-3">
                  <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label required" htmlFor="Level">
                      Course Level
                    </label>
                    <div className="enhanced-input-wrapper">
                      <select
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        id="Level"
                        data-placeholder="Select option"
                        onChange={onEdit}
                      >
                        <option value="">Select option</option>
                        <option value="100">100 Level</option>
                        <option value="200">200 Level</option>
                        <option value="300">300 Level</option>
                        <option value="400">400 Level</option>
                        <option value="500">500 Level</option>
                        <option value="600">600 Level</option>
                        <option value="700">700 Level</option>
                        <option value="800">800 Level</option>
                        <option value="900">900 Level</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label required" htmlFor="ModuleSemester">
                      Module Semester
                    </label>
                    <div className="enhanced-input-wrapper">
                      <select
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        data-placeholder="Select Semester"
                        id="ModuleSemester"
                        onChange={onEdit}
                      >
                        <option value="">Select option</option>
                        <option value="First">First Semester</option>
                        <option value="Second">Second Semester</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label required" htmlFor="SchoolSemester">
                      School Semester
                    </label>
                    <div className="enhanced-input-wrapper">
                      <select
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        data-placeholder="Select Semester"
                        id="SchoolSemester"
                        onChange={onEdit}
                      >
                        <option value="">Select option</option>
                        {
                          semesterList.length > 0 &&
                          semesterList.map((x, y) => {
                            return (
                              <option value={x.SemesterCode} key={y}>{x.SemesterName}</option>
                            )
                          })
                        }
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="fv-row mb-6 enhanced-form-group">
                    <label className="form-label fs-6 fw-bolder text-dark enhanced-label required" htmlFor="ModuleType">
                      Module Type
                    </label>
                    <div className="enhanced-input-wrapper">
                      <select
                        className="form-control form-control-lg form-control-solid enhanced-input"
                        data-placeholder="Select Semester"
                        id="ModuleType"
                        onChange={onEdit}
                      >
                        <option value="">Select option</option>
                        <option value="Lecture">Lecture</option>
                        <option value="Interactive">Interactive</option>
                        <option value="Class">Class</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Online">Online</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Core">Core</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="col-md-12 mt-5">
                  <button type="button" onClick={fetchAssignedModules} className="btn btn-primary">
                    View Modules
                  </button>
                </div>
              </div>
            </form>
            <div className="col-12 mt-9">
              <div className="card-body p-0">
                <div className="row">
                  <div className="col-md-6">
                    <h3>All Modules</h3>
                    <AGTable data={moduleList} />
                  </div>
                  <div className="col-md-6">

                    {
                      showAssignedModules === true &&
                      <>
                        <h3>Assigned Modules</h3>
                        <AGTable data={assignedModuleList} />
                      </>

                    }

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    LoginDetails: state.LoginDetails,
    FacultyList: state.FacultyList
  };
};
export default connect(mapStateToProps, null)(ModuleAssignment2);
