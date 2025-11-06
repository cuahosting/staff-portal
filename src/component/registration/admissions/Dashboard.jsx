import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { projectName, serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import Moment from "react-moment";
import { encryptData } from "../../common/cryptography/cryptography";
import {formatDate, formatDateAndTime, shortCode} from "../../../resources/constants";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { simpleFileUploadAPIKey } from "../../../resources/url";
import SimpleFileUpload from 'react-simple-file-upload';
import { Link } from "react-router-dom";
import NewStudentEnrolmentReport from "../student-manager/reports/enrolment-report";


function RegistrationDashboard(props) {
  const token = props.login[0].token
  const [appList, setAppList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [active, setActive] = useState("menu-link");
  const [showForm, setshowForm] = useState(true);
  const [AppDocuments, setAppDocuments] = useState([]);
  const [documentList, setDocumentsList] = useState([]);
  const [applicantDet, setApplicantDet] = useState([]);
  const [showSubmitForm, setShowSubmitForm] = useState(true);
  const [pageName, setpageName] = useState('All Applications');
  const [enrolledCounts, setEnrolledCounts] = useState(0);
  const [enrolData, setEnrolData] = useState([]);
  const [enrolledData2, setEnrolledData2] = useState([])

  const [datatable, setDatatable] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Name",
        field: "name",
      },
      {
        label: "Phone Number",
        field: "phone",
      },
      {
        label: "Email Address",
        field: "email",
      },
      {
        label: "Application Type",
        field: "type",
      },
      {
        label: "ApplicationID",
        field: "appID",
      },
      {
        label: "Course",
        field: "course",
      },
      {
        label: "Date Applied",
        field: "date",
      },
      {
        label: "",
        field: "action",
      },
    ],
    rows: [],
  });


  const [app, setApp] = useState({
    applicantionid: "",
    File: "",
    DocumentName: "",
    FilePath: "",
    disableInput: false,
  })

  useEffect(() => {
    getDocumentsList();
    getApplicationList();
  }, []);

  async function getApplicationList() {
    await axios
      .get(`${serverLink}registration/admissions/list/`, token)
      .then((response) => {
        setTotalCount(response.data.length);
        setAppList(response.data);
        if (response.data.length > 0) {
          let rows = [];
          response.data.map((applicant, index) => {
            rows.push({
              sn: index + 1,
              name:
                applicant.FirstName +
                " " +
                applicant.MiddleName +
                " " +
                applicant.Surname,
              phone: applicant.PhoneNumber,
              email: applicant.EmailAddress,
              type: applicant.ApplicationType,
              date: formatDate(applicant.InsertedDate),
              // date: formatDateAndTime(applicant.InsertedDate, 'date'),
              // date: (
              //   <Moment format="YYYY-MM-DD" date={applicant.InsertedDate} />
              // ),
              appID: applicant.AppID,
              course: applicant.CourseName,
              action:
                applicant.ApplicationType === "undergraduate" ? (
                  <Link to={`/application-processing-ug/${applicant.EntryID}`} className="btn btn-sm btn-primary">
                    View
                  </Link>

                ) : (
                  <Link to={`/application-processing-pg/${applicant.EntryID}`} className="btn btn-sm btn-primary">
                    View
                  </Link>

                ),
            });
          });
          setDatatable({
            ...datatable,
            columns: datatable.columns,
            rows: rows,
          });
        }
        setIsLoading(false);
        setActive("menu-link active");
      })
      .catch((ex) => {
        console.error(ex);
      });

    await axios.get(`${serverLink}staff/student-manager/enrolment/list`, token).then((res) => {
      if (res.data.length > 0) {
        setEnrolledCounts(res.data.length);
        setEnrolledData2(res.data);
        let rows = [];
        res.data.map((item, index) => {
          rows.push([
            <Link className="btn btn-sm btn-primary" to={`/registration/student-manager/enrolment/${encryptData(item.StudentID.toString())}`}><i className="fa fa-eye" /></Link>,
            item.ApplicationID,
            item.StudentID,
            item.FirstName + " " + item.MiddleName + " " + item.Surname,
            item.Gender,
            item.EmailAddress,
            item.PhoneNumber,
            item.StudentLevel + " Level",
            item.CourseName,
            item.ModeOfEntry,
            item.StateOfOrigin,
            item.Lga,
            item.Nationality,
            <label className={
              item.Status === "inactive" ? "badge badge-secondary" : "badge badge-success"
            }>{
                item.Status === "inactive" ? "InActive" : "Active"
              }</label>,
          ])
        })
        setEnrolData(rows)
      }
    })
  }



  const getFilteredApp = async (val) => {
    setpageName(
      val === 'undergraduate' ? 'Undergraduate' : 'Postgraduate'
    )
    setApp({
      ...app,
      applicantionid: '',
      disableInput: false,
    })
    setAppDocuments([]);
    setshowForm(true)
    setIsLoading(true);
    const pgApplicationsList = appList.length > 0 && appList.filter((app) => app.ApplicationType === val);
    if (pgApplicationsList.length > 0) {
      let rows = [];
      pgApplicationsList.map((applicant, index) => {
        rows.push({
          sn: index + 1,
          name:
            applicant.FirstName +
            " " +
            applicant.MiddleName +
            " " +
            applicant.Surname,
          phone: applicant.PhoneNumber,
          email: applicant.EmailAddress,
          type: applicant.ApplicationType,
          date: formatDate(applicant.InsertedDate),
          // date: formatDateAndTime(applicant.InsertedDate, 'date'),
          // date: (
          //   <Moment format="YYYY-MM-DD" date={applicant.InsertedDate} />
          // ),
          appID: applicant.AppID,
          course: applicant.CourseName,
          action:
            applicant.ApplicationType === "undergraduate" ? (
              <Link to={`/application-processing-ug/${applicant.EntryID}`} className="btn btn-sm btn-primary">
                View
              </Link>

            ) : (
              <Link to={`/application-processing-pg/${applicant.EntryID}`} className="btn btn-sm btn-primary">
                View
              </Link>
            ),
        });
      });
      setDatatable({
        ...datatable,
        columns: datatable.columns,
        rows: rows,
      });
    } else {
      setDatatable({
        ...datatable,
        columns: datatable.columns,
        rows: [],
      });
    }
    setIsLoading(false);
  };

  const getFilteredByStatus = async (val) => {
    setApp({
      ...app,
      applicantionid: '',
      disableInput: false,
    })
    setpageName(
      val === 0 ? 'Not Submitted' : val === 1 ? 'Pending' : val === 2 ? 'Approved' : val === 3 ? 'Rejected' : val === 4 ? 'Approved and Allowed to Enrol' : val === 'ne' ? "Not Enrolled" : ""
    )
    setAppDocuments([]);
    setshowForm(true)
    setIsLoading(true);

    const approvedList = appList.length > 0 && appList.filter((app) => parseInt(app.Status) === 2);
    const enrolled = enrolledData2;

    const recordsById = enrolled.reduce((ac, record) => {
      return record.ApplicationID ? { ...ac, [record.ApplicationID]: record } : ac;
    }, {});

    const not_enrolled = approvedList.filter(item => !recordsById[parseInt(item.AppID)]);

    const filteredAppList = val !== "ne" ? appList.length > 0 && appList.filter((app) => parseInt(app.Status) === val) : not_enrolled

    //setUgApproveCount(response.data);
    if (filteredAppList.length > 0) {
      let rows = [];
      filteredAppList.map((applicant, index) => {
        rows.push({
          sn: index + 1,
          name:
            applicant.FirstName +
            " " +
            applicant.MiddleName +
            " " +
            applicant.Surname,
          phone: applicant.PhoneNumber,
          email: applicant.EmailAddress,
          type: applicant.ApplicationType,
          date: formatDate(applicant.InsertedDate),
          // date: formatDateAndTime(applicant.InsertedDate, 'date'),
          // date: (
          //   <Moment format="YYYY-MM-DD" date={applicant.InsertedDate} />
          // ),
          appID: applicant.AppID,
          course: applicant.CourseName,
          action: parseInt(applicant.Status) === 0 ?
            <>
              --
            </> :
            <>
              {
                applicant.ApplicationType === "undergraduate" ? (
                  <Link to={`/application-processing-ug/${applicant.EntryID}`} className="btn btn-sm btn-primary">
                    View
                  </Link>

                ) : (
                  <Link to={`/application-processing-pg/${applicant.EntryID}`} className="btn btn-sm btn-primary">
                    View
                  </Link>
                )
              }
            </>

        });
      });
      setDatatable({
        ...datatable,
        columns: datatable.columns,
        rows: rows,
      });
    } else {
      setDatatable({
        ...datatable,
        columns: datatable.columns,
        rows: [],
      });
    }
    setIsLoading(false);
  }

  const getAppDocuments = async (e) => {
    if (e) {
      e.preventDefault();
    }
    if (app.applicantionid === "") {
      setAppDocuments([]);
      showAlert("Error", "please enter application id", "error");
      return;
    }
    try {
      await axios.get(`${serverLink}registration/admissions/application-documents/${app.applicantionid}`, token)
        .then((res) => {
          if (res.data.length > 0) {
            setAppDocuments(res.data);
            const applicant = appList.filter(x => parseInt(x.AppID) === parseInt(app.applicantionid))
            setApplicantDet(applicant)
            setApp({
              ...app,
              disableInput: true
            })
          }
          else {
            toast.error('no application documents')
            setAppDocuments([])
          }
        })
    } catch (e) {

    }
  }

  const getDocumentsList = async () => {
    try {
      await axios.get(`${serverLink}registration/admissions/staff/documents/list`, token)
        .then((res) => {
          setDocumentsList(res.data)
        })
    } catch (e) {

    }
  }

  const UploadFile = async (e) => {
    e.preventDefault();
    if (app.applicantionid === "" || app.DocumentName === "") {
      toast.error('please fill all fields');
      return;
    }
    try {
      await axios.post(`${serverLink}registration/admissions/upload-doc`, app, token).then((res) => {
        if (res.data.message === "uploaded") {
          getAppDocuments('');
          showAlert("SUCCESS", "document uploaded", "success");
        } else {
          toast.error("please try again...")
        }
      })
    } catch (e) {
    }
  }

  const handleFile = (url) => {
    setApp({
      ...app,
      FilePath: url
    })
  }
  //ug list of applicants
  const ugCount = appList.length > 0 ? appList.filter(
    (app) => app.ApplicationType === "undergraduate"
  ) : 0

  //pg list of applicants
  const pgCount = appList.length > 0 ? appList.filter(
    (app) => app.ApplicationType === "postgraduate"
  ) : 0
  const notSubmittedList = appList.length > 0 ? appList.filter((type) => parseInt(type.Status) === 0) : 0
  const pendingList = appList.length > 0 ? appList.filter((type) => parseInt(type.Status) === 1) : 0
  const rejectList = appList.length > 0 ? appList.filter((type) => type.Status === 3) : 0
  const approveList = appList.length > 0 ? appList.filter((type) => type.Status === 2) : 0
  const approveListandAllowedToEnrol = appList.length > 0 ? appList.filter((type) => type.Status === 4) : 0

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Admissions"} items={["Registration", "Admissions"]} />
      <div className="flex-column-fluid">
        <div className="row">
          <div className="col-md-2">
            <div className="menu menu-column menu-rounded menu-state-bg menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary mb-10 m-grid-col-md-3">
              <div className="menu-item mb-3">
                <span className={active}>
                  <span
                    className="menu-title fw-bolder"
                    onClick={() => {
                      setshowForm(true)
                    }}
                  >
                    Total Applications
                  </span>
                  <span className="badge badge-success">{totalCount}</span>
                </span>
              </div>
              <div className="menu-item mb-3">
                <span className="menu-link " onClick={() => { getFilteredApp("undergraduate") }}>
                  <span className="menu-title fw-bolder">Undergraguate</span>

                  <span className="badge badge-warning">{ugCount.length}</span>
                </span>
              </div>
              <div className="menu-item mb-3">
                <span className="menu-link " onClick={() => { getFilteredApp("postgraduate") }}>
                  <span className="menu-title fw-bolder">Postgraduate</span>
                  <span className="badge badge-primary">{pgCount.length}</span>
                </span>
              </div>
              <hr />
              <div className="menu-item mb-3">
                <span className="menu-link ">
                  <span
                    className="menu-title fw-bolder"
                    onClick={() => { getFilteredByStatus(0) }}
                  >
                    Not Submitted
                  </span>
                  <span className="badge badge-info">
                    {notSubmittedList.length}
                  </span>
                </span>
              </div>
              <div className="menu-item mb-3">
                <span className="menu-link ">
                  <span
                    className="menu-title fw-bolder"
                    onClick={() => { getFilteredByStatus(1) }}
                  >
                    Pending
                  </span>
                  <span className="badge badge-info">
                    {pendingList.length}
                  </span>
                </span>
              </div>

              <div className="menu-item mb-3">
                <span className="menu-link ">
                  <span
                    className="menu-title fw-bolder"
                    onClick={() => { getFilteredByStatus(2) }}
                  >
                    Approved
                  </span>
                  <span className="badge badge-success">
                    {approveList.length}
                  </span>
                </span>
              </div>

              {
                shortCode !== "BAUK" &&
                <div className="menu-item mb-3">
                  <span className="menu-link ">
                    <span
                      className="menu-title fw-bolder"
                      onClick={() => { getFilteredByStatus(4) }}
                    >
                      Approved & Allowed to Enrol
                    </span>
                    <span className="badge badge-success">
                      {approveListandAllowedToEnrol.length}
                    </span>
                  </span>
                </div>
              }

              <div className="menu-item mb-3">
                <span className="menu-link ">
                  <span
                    className="menu-title fw-bolder"
                    onClick={() => {
                      getFilteredByStatus('')
                      setshowForm(1)
                    }}
                  >
                    Enrolled Students
                  </span>
                  <span className="badge badge-success">
                    {enrolledCounts}
                  </span>
                </span>
              </div>

              <div className="menu-item mb-3">
                <span className="menu-link ">
                  <span
                    className="menu-title fw-bolder"
                    onClick={() => {
                      getFilteredByStatus('ne')
                    }}
                  >
                    Not Enrolled Students
                  </span>
                  <span className="badge badge-success">
                    {approveList.length - enrolledCounts}
                  </span>
                </span>
              </div>

              <div className="menu-item mb-3">
                <span className="menu-link ">
                  <span
                    className="menu-title fw-bolder"
                    onClick={() => { getFilteredByStatus(3) }}
                  >
                    Rejected
                  </span>
                  <span className="badge badge-danger">
                    {rejectList.length}
                  </span>
                </span>
              </div>

              <div className="menu-item mb-3">
                <span className="menu-link ">
                  <span
                    className="menu-title fw-bolder"
                    onClick={() => {
                      getFilteredByStatus('')
                      setshowForm(false)
                    }}
                  >
                    Manage Applicants Documents
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-10">
            {
              pageName !== '' &&
              <>
                <h3>{pageName} Applications</h3>
                {
                  pageName === "Not Submitted" &&
                  <label className="alert alert-danger">
                    You have {datatable.rows.length} unsubmitted applications. Endeavour to reach out to the applicants via their emails or phone number
                  </label>
                }
              </>

            }
            <div className="card-body pt-0">
              {
                showForm === true ? <Table data={datatable} />
                  :
                  showForm === 1 ? <NewStudentEnrolmentReport enrolData={enrolData} />

                    :
                    <>
                      <div className="row col-md-12">
                        {
                          showSubmitForm === true &&
                          <form onSubmit={getAppDocuments}>
                            <div className="row">
                              <div className="col-md-8">
                                <input disabled={app.disableInput === true ? true : false} value={app.applicantionid} className="form-control" onChange={(e) => {
                                  setApp({
                                    ...app,
                                    applicantionid: e.target.value
                                  })
                                }} placeholder="enter applicantion id" />
                              </div>
                              <div className="col-md-4">
                                <button type="submit" className="btn btn-sm btn-primary" >Search Applicantion</button>
                              </div>
                            </div>
                          </form>
                        }
                      </div>
                      <div className="table table-responsive">
                        {
                          AppDocuments.length > 0 &&
                          <>
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <td>SN</td>
                                  <td>Title</td>
                                  <td>Link</td>
                                  <td>Inserted On</td>
                                </tr>
                              </thead>
                              {
                                AppDocuments.length > 0 ?
                                  <tbody>
                                    {
                                      AppDocuments.map((x, y) => {
                                        return (
                                          <tr key={y}>
                                            <td>{y + 1}</td>
                                            <td>{x.DocumentType}</td>
                                            <td>
                                              <a target={"_blank"}
                                                href={x.FilePath !== undefined ? x.FilePath.includes("simplefileupload.com") ?
                                                  x.FilePath :
                                                  `${serverLink}public/uploads/${shortCode}/application/document/${x.FilePath}`
                                                  : ''}>
                                                View Document
                                              </a>
                                            </td>
                                            <td>{formatDateAndTime(x.InsertedOn, "date")}</td>
                                          </tr>
                                        )
                                      })
                                    }
                                  </tbody>
                                  :
                                  <tbody>
                                    <tr>
                                      <td><label className="alert alert-lg alert-warning">NO DOCUMENTS UPLOADED</label></td>
                                    </tr>
                                  </tbody>
                              }
                            </table></>
                        }

                        {
                          AppDocuments.length > 0 && app.applicantionid !== "" &&

                          <form onSubmit={UploadFile}>
                            <div className="row col-md-12 mt-3">
                              <h4>Add Documents <strong className="text-danger"><small>File must not exceed 1mb</small></strong> </h4>
                              <div className="col-md-4">
                                <SimpleFileUpload
                                  maxFileSize={1}
                                  apiKey={simpleFileUploadAPIKey}
                                  tag={`${shortCode}-application`}
                                  onSuccess={handleFile}
                                  width={"100%"}
                                  height="100"
                                />
                                {/* <input type={"file"} className="form-control" onChange={(e) => {
                              setApp({
                                ...app,
                                File: e.target.files[0]
                              })
                            }} /> */}
                              </div>
                              <div className="col-md-4">

                                <select className="form-control" onChange={(e) => {
                                  setApp({
                                    ...app,
                                    DocumentName: e.target.value
                                  })
                                }} >
                                  <option value={""}>Select document type</option>
                                  {
                                    documentList.length > 0 &&
                                    documentList.map((x, y) => {
                                      return (
                                        <option key={y} value={x.DocumentName}>{x.DocumentName}</option>
                                      )
                                    })
                                  }
                                </select>
                              </div>
                              <div className="col-md-4">
                                <button type="submit" className="btn btn-sm btn-primary" >Upload</button>
                              </div>

                            </div>
                          </form>
                        }
                      </div>
                    </>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    login: state.LoginDetails,
    currentSemester: state.currentSemester
  };
};

export default connect(mapStateToProps, null)(RegistrationDashboard);

