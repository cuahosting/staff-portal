import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import PageHeader from "../../../common/pageheader/pageheader";
import Loader from "../../../common/loader/loader";
import { api } from "../../../../resources/api";
import SearchSelect from "../../../common/select/SearchSelect";
import AGReportTable from "../../../common/table/AGReportTable";

function TimeTableByBlock(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [canSeeReport, setCanSeeReport] = useState(false);
  const [blockOptions, setBlockOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [data, setData] = useState([]);
  const [tableHeight, setTableHeight] = useState("600px");
  const columns = ["Day", "Module", "Type", "Block", "Venue", "Start Time", "End Time", "Staff Name"];

  useEffect(() => {
    const fetchData = async () => {
      const [semRes, blkRes] = await Promise.all([
        api.get("staff/timetable/timetable/semester"),
        api.get("staff/academics/block/list")
      ]);

      if (semRes.success && semRes.data?.length > 0) {
        const semOptions = semRes.data.map(row => ({
          value: row.SemesterCode,
          label: `${row.SemesterCode} - ${row.SemesterName}`
        }));
        setSemesterOptions(semOptions);
      }

      if (blkRes.success && blkRes.data?.length > 0) {
        const blkOptions = blkRes.data.map(b => ({
          value: b.EntryID,
          label: b.BlockName
        }));
        setBlockOptions(blkOptions);
      }

      setIsLoading(false);
    };
    fetchData();
  }, []);

  const onBlockChange = (selected) => {
    setSelectedBlock(selected);
  };

  const onSemesterChange = (selected) => {
    setSelectedSemester(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBlock?.value || !selectedSemester?.value) {
      toast.error("Please select both block and semester");
      return;
    }

    setIsLoading(true);
    const { success, data: result } = await api.post("staff/academics/timetable/module-by-block", {
      block: selectedBlock.value,
      semester: selectedSemester.value
    });

    if (success && result?.length > 0) {
      const rows = result.map(item => [
        item.DayName,
        item.ModuleCode,
        item.ModuleType,
        item.BlockName,
        item.VenueName,
        item.StartTime,
        item.EndTime,
        item.StaffName
      ]);
      setTableHeight(result.length > 100 ? "1000px" : "600px");
      setData(rows);
      setCanSeeReport(true);
    } else {
      toast.error("No timetable found for this block");
    }
    setIsLoading(false);
  };

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Timetable By Block"} items={["Academic", "Timetable", "Timetable By Block"]} />
      <div className="flex-column-fluid">
        <div className="card card-no-border">
          <div className="card-header border-0 pt-6">
            <div className="card-title" />
          </div>
          <div className="card-body p-0">
            <div className="col-md-12">
              <div className="row">
                <form onSubmit={handleSubmit}>
                  <div className="row fv-row">
                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">Select Block</label>
                      <SearchSelect
                        name="block"
                        value={selectedBlock}
                        onChange={onBlockChange}
                        options={blockOptions}
                        placeholder="Search and select block..."
                      />
                    </div>
                    <div className="col-md-4 fv-row">
                      <label className="required fs-6 fw-bold mb-2">Select School Semester</label>
                      <SearchSelect
                        name="schoolSemester"
                        value={selectedSemester}
                        onChange={onSemesterChange}
                        options={semesterOptions}
                        placeholder="Select semester..."
                      />
                    </div>
                    <div className="col-md-4">
                      <div className="row">
                        <button type="submit" className="btn btn-primary mt-8">Submit</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {canSeeReport && (
              <div className="row">
                <div className="col-md-12 mt-5">
                  <AGReportTable title={`Timetable By Block`} columns={columns} data={data} height={tableHeight} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(TimeTableByBlock);
