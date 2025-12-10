import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
import SearchSelect from "../../common/select/SearchSelect";

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
        label: "",
        field: "action",
      },
      {
        label: "Module Name",
        field: "ModuleName",
      },
      {
        label: "Module Code",
        field: "ModuleCode",
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
        label: "",
        field: "action",
      },
      {
        label: "Module Name",
        field: "ModuleName",
      },
      {
        label: "Module Code",
        field: "ModuleCode",
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
              ModuleName: item.ModuleName,
              ModuleCode: item.ModuleCode,
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
    if (e.target.id === "CourseCode") {
      setfData({
        ...fdata,
        CourseCode: e.target.value,
        CourseName: courseList.filter(x => x.CourseCode === e.target.value)[0].CourseName
      })
      getModules(e.target.value)
    }
  };

  const onCourseCodeChange = (e) => {
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
              ModuleName: module.ModuleName,
              ModuleCode: module.ModuleCode,
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
                    <SearchSelect
                      id="CourseCode"
                      label="Course"
                      value={fdata.CourseCode}
                      onChange={onCourseCodeChange}
                      options={fdata.Courses}
                      required
                    />
                  </div>
                }
                <h3 className="mt-10"> <p>Select settings for module assignments</p></h3>
                <div className="col-md-3">
                  <div className="fv-row mb-6 enhanced-form-group">
                    <SearchSelect
                      id="Level"
                      label="Course Level"
                      value={fdata.Level ? { value: fdata.Level, label: fdata.Level + " Level" } : null}
                      options={[
                        { value: "100", label: "100 Level" },
                        { value: "200", label: "200 Level" },
                        { value: "300", label: "300 Level" },
                        { value: "400", label: "400 Level" },
                        { value: "500", label: "500 Level" },
                        { value: "600", label: "600 Level" },
                        { value: "700", label: "700 Level" },
                        { value: "800", label: "800 Level" },
                        { value: "900", label: "900 Level" }
                      ]}
                      onChange={(selected) => onEdit({ target: { id: "Level", value: selected?.value || "" } })}
                      placeholder="Select option"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="fv-row mb-6 enhanced-form-group">
                    <SearchSelect
                      id="ModuleSemester"
                      label="Module Semester"
                      value={fdata.ModuleSemester ? { value: fdata.ModuleSemester, label: fdata.ModuleSemester + " Semester" } : null}
                      options={[
                        { value: "First", label: "First Semester" },
                        { value: "Second", label: "Second Semester" }
                      ]}
                      onChange={(selected) => onEdit({ target: { id: "ModuleSemester", value: selected?.value || "" } })}
                      placeholder="Select Semester"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="fv-row mb-6 enhanced-form-group">
                    <SearchSelect
                      id="SchoolSemester"
                      label="School Semester"
                      value={semesterList.find(s => s.SemesterCode === fdata.SchoolSemester) ? { value: fdata.SchoolSemester, label: semesterList.find(s => s.SemesterCode === fdata.SchoolSemester).SemesterName } : null}
                      options={semesterList.map(s => ({ value: s.SemesterCode, label: s.SemesterName }))}
                      onChange={(selected) => onEdit({ target: { id: "SchoolSemester", value: selected?.value || "" } })}
                      placeholder="Select Semester"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="fv-row mb-6 enhanced-form-group">
                    <SearchSelect
                      id="ModuleType"
                      label="Module Type"
                      value={fdata.ModuleType ? { value: fdata.ModuleType, label: fdata.ModuleType } : null}
                      options={[
                        { value: "Lecture", label: "Lecture" },
                        { value: "Interactive", label: "Interactive" },
                        { value: "Class", label: "Class" },
                        { value: "Workshop", label: "Workshop" },
                        { value: "Online", label: "Online" },
                        { value: "Seminar", label: "Seminar" },
                        { value: "Core", label: "Core" }
                      ]}
                      onChange={(selected) => onEdit({ target: { id: "ModuleType", value: selected?.value || "" } })}
                      placeholder="Select Module Type"
                      required
                    />
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
