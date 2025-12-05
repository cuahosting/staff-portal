import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import { encryptData } from "../../common/cryptography/cryptography";
import { formatDate, formatDateAndTime, shortCode } from "../../../resources/constants";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { simpleFileUploadAPIKey } from "../../../resources/url";
import SimpleFileUpload from 'react-simple-file-upload';
import { Link } from "react-router-dom";
import NewStudentEnrolmentReport from "../student-manager/reports/enrolment-report";

// Stats Card Component
const StatCard = ({ count, label, color, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      backgroundColor: active ? color : '#fff',
      border: `2px solid ${color}`,
      borderRadius: '12px',
      padding: '16px 12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'center',
      boxShadow: active ? `0 4px 12px ${color}40` : '0 2px 8px rgba(0,0,0,0.08)',
      transform: active ? 'translateY(-2px)' : 'none',
    }}
  >
    <div style={{
      fontSize: '24px',
      fontWeight: '700',
      color: active ? '#fff' : color,
      lineHeight: '1.2'
    }}>
      {typeof count === 'number' ? count.toLocaleString() : count}
    </div>
    <div style={{
      fontSize: '12px',
      color: active ? 'rgba(255,255,255,0.9)' : '#666',
      marginTop: '4px',
      fontWeight: '500'
    }}>
      {label}
    </div>
  </div>
);

// Color scheme
const colors = {
  total: '#3b82f6',      // Blue
  ug: '#f59e0b',         // Amber
  pg: '#8b5cf6',         // Purple
  notSubmitted: '#6b7280', // Gray
  pending: '#f97316',    // Orange
  approved: '#22c55e',   // Green
  allowed: '#14b8a6',    // Teal
  enrolled: '#10b981',   // Emerald
  notEnrolled: '#f43f5e', // Rose
  rejected: '#ef4444',   // Red
};

function RegistrationDashboard(props) {
  const token = props.login[0].token
  const [appList, setAppList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("total");
  const [showForm, setshowForm] = useState(true);
  const [AppDocuments, setAppDocuments] = useState([]);
  const [documentList, setDocumentsList] = useState([]);
  const [applicantDet, setApplicantDet] = useState([]);
  const [showSubmitForm, setShowSubmitForm] = useState(true);
  const [pageName, setpageName] = useState('All Applications');
  const [enrolledCounts, setEnrolledCounts] = useState(0);
  const [enrolData, setEnrolData] = useState([]);
  const [enrolledData2, setEnrolledData2] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMoreStats, setShowMoreStats] = useState(false);

  const [datatable, setDatatable] = useState({
    columns: [
      { label: "S/N", field: "sn" },
      { label: "Name", field: "name" },
      { label: "Phone Number", field: "phone" },
      { label: "Email Address", field: "email" },
      { label: "Application Type", field: "type" },
      { label: "ApplicationID", field: "appID" },
      { label: "Course", field: "course" },
      { label: "Date Applied", field: "date" },
      { label: "", field: "action" },
    ],
    rows: [],
  });

  const [app, setApp] = useState({
    applicantionid: "",
    File: "",
    DocumentName: "",
    FilePath: "",
    disableInput: false,
  });

  useEffect(() => {
    getDocumentsList();
    getApplicationList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              name: applicant.FirstName + " " + applicant.MiddleName + " " + applicant.Surname,
              phone: applicant.PhoneNumber,
              email: applicant.EmailAddress,
              type: applicant.ApplicationType,
              date: formatDate(applicant.InsertedDate),
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
            <label className={item.Status === "inactive" ? "badge badge-secondary" : "badge badge-success"}>
              {item.Status === "inactive" ? "InActive" : "Active"}
            </label>,
          ])
        })
        setEnrolData(rows)
      }
    })
  }

  const buildTableRows = (list) => {
    let rows = [];
    list.map((applicant, index) => {
      rows.push({
        sn: index + 1,
        name: applicant.FirstName + " " + applicant.MiddleName + " " + applicant.Surname,
        phone: applicant.PhoneNumber,
        email: applicant.EmailAddress,
        type: applicant.ApplicationType,
        date: formatDate(applicant.InsertedDate),
        appID: applicant.AppID,
        course: applicant.CourseName,
        action: parseInt(applicant.Status) === 0 ? (
          <>--</>
        ) : (
          applicant.ApplicationType === "undergraduate" ? (
            <Link to={`/application-processing-ug/${applicant.EntryID}`} className="btn btn-sm btn-primary">
              View
            </Link>
          ) : (
            <Link to={`/application-processing-pg/${applicant.EntryID}`} className="btn btn-sm btn-primary">
              View
            </Link>
          )
        ),
      });
    });
    return rows;
  };

  const handleFilterClick = (filterType, filterValue, filterName) => {
    setActiveFilter(filterType);
    setApp({ ...app, applicantionid: '', disableInput: false });
    setAppDocuments([]);
    setshowForm(true);
    setpageName(filterName);
    setIsLoading(true);

    let filteredList = [];

    if (filterType === 'total') {
      filteredList = appList;
    } else if (filterType === 'ug') {
      filteredList = appList.filter((app) => app.ApplicationType === "undergraduate");
    } else if (filterType === 'pg') {
      filteredList = appList.filter((app) => app.ApplicationType === "postgraduate");
    } else if (filterType === 'notSubmitted') {
      filteredList = appList.filter((app) => parseInt(app.Status) === 0);
    } else if (filterType === 'pending') {
      filteredList = appList.filter((app) => parseInt(app.Status) === 1);
    } else if (filterType === 'approved') {
      filteredList = appList.filter((app) => parseInt(app.Status) === 2);
    } else if (filterType === 'allowed') {
      filteredList = appList.filter((app) => parseInt(app.Status) === 4);
    } else if (filterType === 'rejected') {
      filteredList = appList.filter((app) => parseInt(app.Status) === 3);
    } else if (filterType === 'notEnrolled') {
      const approvedList = appList.filter((app) => parseInt(app.Status) === 2);
      const recordsById = enrolledData2.reduce((ac, record) => {
        return record.ApplicationID ? { ...ac, [record.ApplicationID]: record } : ac;
      }, {});
      filteredList = approvedList.filter(item => !recordsById[parseInt(item.AppID)]);
    }

    const rows = buildTableRows(filteredList);
    setDatatable({ ...datatable, rows: rows });
    setIsLoading(false);
  };

  const handleEnrolledClick = () => {
    setActiveFilter('enrolled');
    setpageName('Enrolled Students');
    setshowForm(1);
  };

  const handleDocumentsClick = () => {
    setActiveFilter('documents');
    setpageName('');
    setshowForm(false);
  };

  const getAppDocuments = async (e) => {
    if (e) e.preventDefault();
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
            setApp({ ...app, disableInput: true })
          } else {
            toast.error('no application documents')
            setAppDocuments([])
          }
        })
    } catch (e) { }
  }

  const getDocumentsList = async () => {
    try {
      await axios.get(`${serverLink}registration/admissions/staff/documents/list`, token)
        .then((res) => { setDocumentsList(res.data) })
    } catch (e) { }
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
    } catch (e) { }
  }

  const handleFile = (url) => {
    setApp({ ...app, FilePath: url })
  }

  // Calculate counts
  const ugCount = appList.length > 0 ? appList.filter((app) => app.ApplicationType === "undergraduate").length : 0;
  const pgCount = appList.length > 0 ? appList.filter((app) => app.ApplicationType === "postgraduate").length : 0;
  const notSubmittedCount = appList.length > 0 ? appList.filter((type) => parseInt(type.Status) === 0).length : 0;
  const pendingCount = appList.length > 0 ? appList.filter((type) => parseInt(type.Status) === 1).length : 0;
  const rejectedCount = appList.length > 0 ? appList.filter((type) => type.Status === 3).length : 0;
  const approvedCount = appList.length > 0 ? appList.filter((type) => type.Status === 2).length : 0;
  const allowedCount = appList.length > 0 ? appList.filter((type) => type.Status === 4).length : 0;
  const notEnrolledCount = approvedCount - enrolledCounts;

  // Stats data for cards
  const primaryStats = [
    { key: 'total', count: totalCount, label: 'Total', color: colors.total, name: 'All Applications' },
    { key: 'ug', count: ugCount, label: 'Undergraduate', color: colors.ug, name: 'Undergraduate' },
    { key: 'pg', count: pgCount, label: 'Postgraduate', color: colors.pg, name: 'Postgraduate' },
    { key: 'notSubmitted', count: notSubmittedCount, label: 'Not Submitted', color: colors.notSubmitted, name: 'Not Submitted' },
    { key: 'pending', count: pendingCount, label: 'Pending', color: colors.pending, name: 'Pending' },
    { key: 'approved', count: approvedCount, label: 'Approved', color: colors.approved, name: 'Approved' },
  ];

  const secondaryStats = [
    ...(shortCode !== "BAUK" ? [{ key: 'allowed', count: allowedCount, label: 'Allowed to Enrol', color: colors.allowed, name: 'Approved & Allowed to Enrol' }] : []),
    { key: 'enrolled', count: enrolledCounts, label: 'Enrolled', color: colors.enrolled, name: 'Enrolled Students', isEnrolled: true },
    { key: 'notEnrolled', count: notEnrolledCount, label: 'Not Enrolled', color: colors.notEnrolled, name: 'Not Enrolled' },
    { key: 'rejected', count: rejectedCount, label: 'Rejected', color: colors.rejected, name: 'Rejected' },
  ];

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Admissions"} items={["Registration", "Admissions"]} />

      <div className="flex-column-fluid">
        {/* Stats Cards Section */}
        <div style={{ marginBottom: '24px' }}>
          {/* Primary Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '12px'
          }}>
            {primaryStats.map((stat) => (
              <StatCard
                key={stat.key}
                count={stat.count}
                label={stat.label}
                color={stat.color}
                active={activeFilter === stat.key}
                onClick={() => handleFilterClick(stat.key, null, stat.name)}
              />
            ))}
          </div>

          {/* Secondary Stats - Collapsible on Mobile */}
          <div style={{ display: showMoreStats ? 'block' : 'none' }} className="d-block d-md-none">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '12px',
            }}>
              {secondaryStats.map((stat) => (
                <StatCard
                  key={stat.key}
                  count={stat.count}
                  label={stat.label}
                  color={stat.color}
                  active={activeFilter === stat.key}
                  onClick={() => stat.isEnrolled ? handleEnrolledClick() : handleFilterClick(stat.key, null, stat.name)}
                />
              ))}
            </div>
          </div>

          {/* Always visible on Desktop */}
          <div className="d-none d-md-block">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '12px',
            }}>
              {secondaryStats.map((stat) => (
                <StatCard
                  key={stat.key}
                  count={stat.count}
                  label={stat.label}
                  color={stat.color}
                  active={activeFilter === stat.key}
                  onClick={() => stat.isEnrolled ? handleEnrolledClick() : handleFilterClick(stat.key, null, stat.name)}
                />
              ))}
            </div>
          </div>

          {/* Show More Button - Mobile Only */}
          <div className="d-block d-md-none text-center mt-2">
            <button
              className="btn btn-link text-muted"
              onClick={() => setShowMoreStats(!showMoreStats)}
              style={{ fontSize: '13px' }}
            >
              {showMoreStats ? 'Show Less' : 'Show More Stats'} {showMoreStats ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                className="btn btn-sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
                style={{
                  backgroundColor: filtersOpen ? '#e2e8f0' : 'transparent',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                {filtersOpen ? '▼' : '▶'} Filters
              </button>
              <span style={{ color: '#64748b', fontSize: '14px' }}>
                Currently showing: <strong style={{ color: '#1e293b' }}>{pageName}</strong>
                {showForm === true && <span style={{ marginLeft: '4px' }}>({datatable.rows.length})</span>}
              </span>
            </div>
            <button
              className="btn btn-sm"
              onClick={handleDocumentsClick}
              style={{
                backgroundColor: activeFilter === 'documents' ? '#3b82f6' : '#fff',
                color: activeFilter === 'documents' ? '#fff' : '#3b82f6',
                border: '1px solid #3b82f6',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <i className="fa fa-folder-open" style={{ marginRight: '6px' }}></i>
              Manage Documents
            </button>
          </div>

          {/* Collapsible Filter Options */}
          {filtersOpen && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Application Type
                </span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {['total', 'ug', 'pg'].map((key) => {
                    const stat = [...primaryStats, ...secondaryStats].find(s => s.key === key);
                    return (
                      <button
                        key={key}
                        className="btn btn-sm"
                        onClick={() => handleFilterClick(key, null, stat?.name || '')}
                        style={{
                          backgroundColor: activeFilter === key ? stat?.color : '#fff',
                          color: activeFilter === key ? '#fff' : stat?.color,
                          border: `1px solid ${stat?.color}`,
                          borderRadius: '20px',
                          padding: '4px 14px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {stat?.label} ({stat?.count})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Status
                </span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {['notSubmitted', 'pending', 'approved', 'allowed', 'enrolled', 'notEnrolled', 'rejected']
                    .filter(key => key !== 'allowed' || shortCode !== "BAUK")
                    .map((key) => {
                      const stat = [...primaryStats, ...secondaryStats].find(s => s.key === key);
                      if (!stat) return null;
                      return (
                        <button
                          key={key}
                          className="btn btn-sm"
                          onClick={() => stat.isEnrolled ? handleEnrolledClick() : handleFilterClick(key, null, stat.name)}
                          style={{
                            backgroundColor: activeFilter === key ? stat.color : '#fff',
                            color: activeFilter === key ? '#fff' : stat.color,
                            border: `1px solid ${stat.color}`,
                            borderRadius: '20px',
                            padding: '4px 14px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {stat.label} ({stat.count})
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alert for Not Submitted */}
        {pageName === "Not Submitted" && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            color: '#991b1b',
            fontSize: '14px'
          }}>
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            You have <strong>{datatable.rows.length}</strong> unsubmitted applications. Endeavour to reach out to the applicants via their emails or phone number.
          </div>
        )}

        {/* Main Content */}
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div className="card-body p-0">
            {showForm === true ? (
              <AGTable data={datatable} />
            ) : showForm === 1 ? (
              <NewStudentEnrolmentReport enrolData={enrolData} />
            ) : (
              <div style={{ padding: '24px' }}>
                {/* Document Search Form */}
                <form onSubmit={getAppDocuments}>
                  <div className="row align-items-end">
                    <div className="col-md-8 col-12 mb-3 mb-md-0">
                      <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                        Application ID
                      </label>
                      <input
                        disabled={app.disableInput}
                        value={app.applicantionid}
                        className="form-control"
                        onChange={(e) => setApp({ ...app, applicantionid: e.target.value })}
                        placeholder="Enter application ID to search"
                        style={{ borderRadius: '8px', padding: '10px 14px' }}
                      />
                    </div>
                    <div className="col-md-4 col-12">
                      <button type="submit" className="btn btn-primary w-100" style={{ borderRadius: '8px', padding: '10px 14px' }}>
                        <i className="fa fa-search" style={{ marginRight: '8px' }}></i>
                        Search Application
                      </button>
                    </div>
                  </div>
                </form>

                {/* Documents Table */}
                {AppDocuments.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h5 style={{ marginBottom: '16px', fontWeight: '600', color: '#1e293b' }}>
                      Uploaded Documents
                    </h5>
                    <div className="table-responsive">
                      <table className="table table-hover" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                          <tr>
                            <th style={{ fontWeight: '600', fontSize: '13px', color: '#64748b', padding: '12px 16px' }}>S/N</th>
                            <th style={{ fontWeight: '600', fontSize: '13px', color: '#64748b', padding: '12px 16px' }}>Document Title</th>
                            <th style={{ fontWeight: '600', fontSize: '13px', color: '#64748b', padding: '12px 16px' }}>Link</th>
                            <th style={{ fontWeight: '600', fontSize: '13px', color: '#64748b', padding: '12px 16px' }}>Uploaded On</th>
                          </tr>
                        </thead>
                        <tbody>
                          {AppDocuments.map((x, y) => (
                            <tr key={y}>
                              <td style={{ padding: '12px 16px', fontSize: '14px' }}>{y + 1}</td>
                              <td style={{ padding: '12px 16px', fontSize: '14px' }}>{x.DocumentType}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <a
                                  target="_blank"
                                  rel="noreferrer"
                                  href={x.FilePath !== undefined ? x.FilePath.includes("simplefileupload.com") ?
                                    x.FilePath :
                                    `${serverLink}public/uploads/${shortCode}/application/document/${x.FilePath}`
                                    : ''}
                                  className="btn btn-sm btn-outline-primary"
                                  style={{ borderRadius: '6px', fontSize: '12px' }}
                                >
                                  <i className="fa fa-external-link-alt" style={{ marginRight: '4px' }}></i>
                                  View
                                </a>
                              </td>
                              <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>
                                {formatDateAndTime(x.InsertedOn, "date")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Upload New Document */}
                    {app.applicantionid !== "" && (
                      <div style={{
                        marginTop: '24px',
                        padding: '20px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <h6 style={{ marginBottom: '16px', fontWeight: '600', color: '#1e293b' }}>
                          <i className="fa fa-upload" style={{ marginRight: '8px', color: '#3b82f6' }}></i>
                          Add New Document
                          <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '400', marginLeft: '8px' }}>
                            (File must not exceed 1MB)
                          </span>
                        </h6>
                        <form onSubmit={UploadFile}>
                          <div className="row align-items-end">
                            <div className="col-md-4 col-12 mb-3">
                              <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                                Choose File
                              </label>
                              <SimpleFileUpload
                                maxFileSize={1}
                                apiKey={simpleFileUploadAPIKey}
                                tag={`${shortCode}-application`}
                                onSuccess={handleFile}
                                width={"100%"}
                                height="100"
                              />
                            </div>
                            <div className="col-md-4 col-12 mb-3">
                              <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px', display: 'block' }}>
                                Document Type
                              </label>
                              <select
                                className="form-control"
                                onChange={(e) => setApp({ ...app, DocumentName: e.target.value })}
                                style={{ borderRadius: '8px', padding: '10px 14px' }}
                              >
                                <option value="">Select document type</option>
                                {documentList.length > 0 && documentList.map((x, y) => (
                                  <option key={y} value={x.DocumentName}>{x.DocumentName}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-4 col-12 mb-3">
                              <button type="submit" className="btn btn-success w-100" style={{ borderRadius: '8px', padding: '10px 14px' }}>
                                <i className="fa fa-cloud-upload-alt" style={{ marginRight: '8px' }}></i>
                                Upload Document
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {AppDocuments.length === 0 && app.disableInput && (
                  <div style={{
                    marginTop: '24px',
                    padding: '40px',
                    textAlign: 'center',
                    backgroundColor: '#fffbeb',
                    borderRadius: '12px',
                    border: '1px solid #fcd34d'
                  }}>
                    <i className="fa fa-folder-open" style={{ fontSize: '48px', color: '#f59e0b', marginBottom: '16px' }}></i>
                    <p style={{ color: '#92400e', fontSize: '16px', margin: 0 }}>No documents uploaded for this application.</p>
                  </div>
                )}
              </div>
            )}
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
