import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/report_table";
import { connect } from "react-redux";

function CustomPaymentReport(props) {
  const token = props.login[0].token;

  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [allSemester, setAllSemester] = useState([]);
  const [values, setValues] = useState({
    type: "",
    semesterCode: "",
  });
  const [paymentType, setPaymentType] = useState([]);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const columns = ["S/N", "PaymentID", "StudentID", "Name", "Course", "Amount"];

  useEffect(() => {
    const getPaymentType = async () => {
      axios
        .get(`${serverLink}staff/human-resources/finance-report/custom-list`, token)
        .then((response) => {
          setPaymentType(response.data);
          setIsLoading(false);
        })
        .catch((ex) => {
          console.error(ex);
        });
    };
    getPaymentType();
  }, []);

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

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios
      .get(
        `${serverLink}staff/human-resources/finance-report/custom-payment/`, token,
        {
          params: {
            semester: values.semesterCode,
            type: values.type,
          },
        }
      )
      .then((res) => {
        setIsLoading(true);
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.PaymentID,
              item.StudentID,
              item.Name,
              item.CourseName,
              item.Amount,
            ]);
          });
          setTableHeight(result.length > 100 ? "1000px" : "600px");
          setData(rows);
          setCanSeeReport(true);
        } else {
          toast.error("There is no payment type for " + values.type);
          setCanSeeReport(false);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("NETWORK ERROR");
      });
  };

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Custom Payment Report"}
        items={["Human Resources", "Finance Report", "Custom Payment Report"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-2">
            <div className="col-md-12">
              <div className="row">
                <form onSubmit={handleSubmit}>
                  <div className="row fv-row">
                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select Payment Type
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select payment type"
                        id="type"
                        onChange={handleChange}
                        required
                        value={values.type}
                      >
                        <option value="">Select option</option>
                        {paymentType.map((t, i) => (
                          <option key={i} value={t.Description}>
                            {t.Description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select School Semester
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select school semester"
                        id="semesterCode"
                        required
                        onChange={handleChange}
                        value={values.semesterCode}
                      >
                        <option value="">Select option</option>
                        {allSemester.map((semester, index) => (
                          <option key={index} value={semester.SemesterCode}>
                            {semester.SemesterName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <div className="row ">
                        <button type="submit" className="btn btn-primary mt-8">
                          Submit
                        </button>
                      </div>
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
                      title={`Custom Payment Report`}
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

export default connect(mapStateToProps, null)(CustomPaymentReport);
