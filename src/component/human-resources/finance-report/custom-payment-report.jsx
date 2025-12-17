import React, { useEffect, useState, useMemo } from "react";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import { connect } from "react-redux";
import SearchSelect from "../../common/select/SearchSelect";

function CustomPaymentReport(props) {

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

  // Options for SearchSelect
  const paymentTypeOptions = useMemo(() => {
    return paymentType.map(t => ({
      value: t.Description,
      label: t.Description
    }));
  }, [paymentType]);

  const semesterOptions = useMemo(() => {
    return allSemester.map(s => ({
      value: s.SemesterCode,
      label: s.SemesterName
    }));
  }, [allSemester]);

  useEffect(() => {
    const getPaymentType = async () => {
      try {
        const { success, data } = await api.get("staff/human-resources/finance-report/custom-list");
        if (success) {
          setPaymentType(data);
        }
        setIsLoading(false);
      } catch (ex) {
        console.error(ex);
      }
    };
    getPaymentType();
  }, []);

  useEffect(() => {
    const getSchoolSemester = async () => {
      try {
        const { success, data } = await api.get("staff/timetable/timetable/semester");
        if (success) {
          setAllSemester(data);
        }
        setIsLoading(false);
      } catch (ex) {
        console.error(ex);
      }
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
    try {
      const { success, data: result } = await api.get(
        `staff/human-resources/finance-report/custom-payment/?semester=${values.semesterCode}&type=${values.type}`
      );
      if (success) {
        setIsLoading(true);
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
      }
    } catch (err) {
      toast.error("NETWORK ERROR");
    }
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
                      <SearchSelect
                        id="type"
                        value={paymentTypeOptions.find(opt => opt.value === values.type) || null}
                        options={paymentTypeOptions}
                        onChange={(selected) => handleChange({ target: { id: 'type', value: selected?.value || '' } })}
                        placeholder="Select option"
                        isClearable={false}
                      />
                    </div>

                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select School Semester
                      </label>
                      <SearchSelect
                        id="semesterCode"
                        value={semesterOptions.find(opt => opt.value === values.semesterCode) || null}
                        options={semesterOptions}
                        onChange={(selected) => handleChange({ target: { id: 'semesterCode', value: selected?.value || '' } })}
                        placeholder="Select option"
                        isClearable={false}
                      />
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
