import React, { useEffect, useState } from "react";
import Loader from "../../common/loader/loader";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import ReportTable from "../../common/table/report_table";
import Select from "react-select";

function StaffListByModule(props) {
  const token = props.login[0].token;

  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [moduleList, setModuleList] = useState([]);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const [module, setModule] = useState({
    moduleCode: "",
    staffID: props.login[0].StaffID,
  });
  const columns = [
    "S/N",
    "Staff ID",
    "Staff Name",
    "Module Type",
    "Module Code",
    "Faculty Name",
    "Department Name",
    "OfficialEmailAddress",
    "Designation",
    "Phone Number",
    "Gender",
  ];
  const staffID = props.login[0].StaffID;

  useEffect(() => {
    async function getAllModules() {
      await axios
        .get(`${serverLink}staff/staff-report/get-modules-by-staff/${staffID}`, token)
        .then((res) => {
          let rows = [];
          res.data.length > 0 &&
          res.data.map((row) => {
            rows.push({ text: row.ModuleName + "--" + row.ModuleCode, id: row.ModuleCode});
          });
          const result = rows;
          setModuleList(result);
          if (result.length > 0) {
          } else {
            toast.error("There are no Dean's available");
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
    setModule({
      ...module,
      [e.target.id]: e.target.value,
    });
    e.preventDefault();
    await axios
      .get(`${serverLink}staff/staff-report/staff-by-modules`, token, {
        params: {
          moduleCode: e.target.value,
          staffID: module.staffID,
        },
      })
      .then((res) => {
        const result = res.data;
        if (result.length > 0) {
          let rows = [];
          result.map((item, index) => {
            rows.push([
              index + 1,
              item.StaffID,
              item.StaffName,
              item.ModuleType,
              item.ModuleCode,
              item.FacultyName,
              item.DepartmentName,
              item.OfficialEmailAddress,
              item.DesignationName,
              item.PhoneNumber,
              item.Gender,
            ]);
          });
          setTableHeight(result.length > 100 ? "1000px" : "600px");
          setData(rows);
          setCanSeeReport(true);
        } else {
          toast.error("There is no report for this modules");
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
        title={"Staff List By Module"}
        items={["Users", "Staff Report", "Staff List By Module"]}
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
                        Select Module
                      </label>

                      <Select
                    id="moduleCode"
                    data={moduleList}
                    onSelect={handleChange}
                    options={{
                      placeholder: "Search Course",
                    }}
                  />
                      
                      {/* <select
                        className="form-select"
                        data-placeholder="Select Module"
                        id="moduleCode"
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select option</option>
                        {moduleList.map((m, i) => (
                          <option key={i} value={m.ModuleCode}>
                            {`${m.ModuleName} (${m.ModuleCode})`}
                          </option>
                        ))}
                      </select> */}
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
                      title={`List of Modules by Staff`}
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

export default connect(mapStateToProps, null)(StaffListByModule);
