import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ReportTable from "../../common/table/report_table";

function StaffListByDesignation(props) {
  const token = props.login[0].token;

  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [designationList, setDesignationList] = useState([]);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [designation, setDesignation] = useState({
    designationID: "",
  });
  const columns = [
    "S/N",
    "Staff ID",
    "Staff Name",
    "Official Email Address",
    "Faculty Name",
    "Department Name",
    "Designation",
    "Phone Number",
    "Gender",
  ];

  useEffect(() => {
    async function getAllModules() {
      await axios
        .get(`${serverLink}staff/staff-report/designation-list`, token)
        .then((res) => {
          const result = res.data;
          setDesignationList(res.data);
          if (result.length > 0) {
          } else {
            toast.error("Unable to load designation");
          }
          setIsLoading(false);
        })
        .catch((err) => {
          toast.error("NETWORK ERROR");
        });
    }

    getAllModules();
  }, []);

  const handleChange = async (e) => {
    setDesignation({
      ...designation,
      [e.target.id]: e.target.value,
    });

    e.preventDefault();
    await axios
      .get(
        `${serverLink}staff/staff-report/staff-list-by-designation/${e.target.value}`, token
      )
      .then((res) => {
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.StaffID,
              item.StaffName,
              item.OfficialEmailAddress,
              item.FacultyName,
              item.DepartmentName,
              item.DesignationName,
              item.PhoneNumber,
              item.Gender,
            ]);
          });
          setTableHeight(result.length > 100 ? "1000px" : "600px");
          setData(rows);
          setCanSeeReport(true);
        } else {
          toast.error("There are no staff for this designation");
          setCanSeeReport(false);
          return;
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
        title={"Staff List By Designation"}
        items={["Users", "Staff Report", "Staff List By Designation"]}
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
                        Select Designation
                      </label>
                      <select
                        className="form-select"
                        data-placeholder="Select Designation"
                        id="designationID"
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select option</option>
                        {designationList.map((d, i) => (
                          <option key={i} value={d.EntryID}>
                            {d.DesignationName}
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
                      title={`List of Staff by Designation`}
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

export default connect(mapStateToProps, null)(StaffListByDesignation);
