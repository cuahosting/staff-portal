import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ReportTable from "../../common/table/report_table";

function AllPaymentReport(props) {
  const token = props.login[0].token;

  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [allSemester, setAllSemester] = useState([]);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const columns = [
    "S/N",
    "StudentID",
    "Name",
    "Course",
    "Accomodation",
    "Prev OutStanding",
    "Amount Paid",
    "Balance",
  ];

  useEffect(() => {
    const getSchoolSemester = async () => {
      axios
        .get(`${serverLink}staff/timetable/timetable/semester`, token)
        .then((response) => {
          setAllSemester(response.data);
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getSchoolSemester();
  }, []);

  const handleChange = async (e) => {
    e.preventDefault();
    await axios
      .get(
        `${serverLink}staff/human-resources/finance-report/payment-all/${e.target.value}`, token
      )
      .then((res) => {
        setIsLoading(true);
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.StudentID,
              item.Name,
              item.CourseName,
              item.IsHostelRequired === 0 ? "No" : "Yes",
              item.TotalExpectedAmount,
              item.AmountPaid,
              item.OutStandingAmount,
            ]);
          });
          setTableHeight(result.length > 100 ? "1000px" : "600px");
          setData(rows);
          setCanSeeReport(true);
        } else {
          toast.error("There is no payment for this semester");
          setCanSeeReport(false);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("NETWORK ERROR");
      });
  };

  const handleSubmit = async (e) => {};

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"All Payment Report"}
        items={["Human Resources", "Finance Report", "All Payment Report"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-2">
            <div className="col-md-12">
              <div className="row">
                <form onSubmit={handleSubmit}>
                  <div className="row fv-row">
                    <div className="col-md-12 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select School Semester
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select school semester"
                        id="schoolSemester"
                        required
                        onChange={handleChange}
                        value={module.schoolSemester}
                      >
                        <option value="">Select option</option>
                        {allSemester.map((semester, index) => (
                          <option key={index} value={semester.SemesterCode}>
                            {semester.SemesterName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {canSeeReport ? (
              <div className="row">
                <div className="col-md-12 mt-5">
                  {
                    <ReportTable
                      title={`All Payment Report"`}
                      columns={columns}
                      data={data}
                      height={tableHeight}
                    />
                  }
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
const mapStateToProps = (state) => {
  return {
    login: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(AllPaymentReport);
