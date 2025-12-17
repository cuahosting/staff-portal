import React, { useEffect, useState, useMemo } from "react";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import { connect } from "react-redux";
import SearchSelect from "../../common/select/SearchSelect";

function TuitionFeePaymentReport(props) {

  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [allSemester, setAllSemester] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const columns = [
    "S/N",
    "StudentID",
    "Name",
    "Course",
    "Amount Expected",
    "Date",
    "Inserted By",
  ];

  // Options for SearchSelect
  const semesterOptions = useMemo(() => {
    return allSemester.map(s => ({
      value: s.SemesterCode,
      label: s.SemesterName
    }));
  }, [allSemester]);

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

  function formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }

  const handleChange = async (e) => {
    e.preventDefault();
    try {
      const { success, data: result } = await api.get(
        `staff/human-resources/finance-report/tuition/${e.target.value}`
      );
      if (success) {
        setIsLoading(true);
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.StudentID,
              item.Name,
              item.CourseName,
              new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGR",
              }).format(item.TotalExpectedAmount),
              formatDate(item.InsertedDate),
              item.InsertedBy,
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
        title={"Tuition Fee Payment Report"}
        items={[
          "Human Resources",
          "Finance Report",
          "Tuition Fee Payment Report",
        ]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-2">
            <div className="col-md-12">
              <div className="row">
                <form>
                  <div className="row fv-row">
                    <div className="col-md-12 fv-row">
                      <label className="required fs-6 fw-bold mb-2">
                        Select School Semester
                      </label>
                      <SearchSelect
                        id="schoolSemester"
                        value={semesterOptions.find(opt => opt.value === selectedSemester) || null}
                        options={semesterOptions}
                        onChange={(selected) => {
                          setSelectedSemester(selected?.value || '');
                          if (selected?.value) {
                            handleChange({ target: { value: selected.value }, preventDefault: () => { } });
                          }
                        }}
                        placeholder="Select option"
                        isClearable={false}
                      />
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
                      title={`Tuition Fee Payment Report"`}
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

export default connect(mapStateToProps, null)(TuitionFeePaymentReport);
