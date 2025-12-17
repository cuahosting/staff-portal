import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import ReportTable from "../../../common/table/ReportTable";
import AGTable from "../../../common/table/AGTable";

function ExamClearance(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [clearanceData, setClearanceData] = useState(false);
  const columns = ["S/N", "Student ID", "Student Name", "Course", "Level", "Semester", "Status", "Action By", "Action"];
  const [datatable, setDatatable] = useState({ columns: [{ label: "S/N", field: "sn" }, { label: "Module Code", field: "code" }, { label: "Module Title", field: "title" }, { label: "Module Credit", field: "credit" }, { label: "Student Grade", field: "grade" }], rows: [] });

  async function TakeDecision(decision, id) {
    const dataTo = { decision, id, Cleared: "ExamsCleared", ClearedBy: "ExamsClearedBy", insertedBy: props.loginData.StaffID, ClearedDate: "ExamsClearedDate" };
    const { success } = await api.patch("staff/users/graduation-clearance", dataTo);
    if (success) { toast.success(decision + " Successfully"); getClearance(); }
    else { toast.error("An error has occurred. Please try again!"); }
  }

  async function getStudentPerformance(id) {
    let last4digits = id.slice(id.length - 4);
    const { success, data } = await api.get(`staff/users/graduation-clearance/academic-performance/${last4digits}`);
    if (success && data?.data?.length > 0) {
      let rows = [];
      data.data.forEach((item, index) => { rows.push({ sn: index + 1, code: item.ModuleCode, title: item.ModuleTitle, credit: "3", grade: item.StudentGrade }); });
      setDatatable({ ...datatable, columns: datatable.columns, rows: rows });
    } else { toast.error("An error has occurred. Please try again!"); }
  }

  const getClearance = async () => {
    const { success, data } = await api.get("staff/users/graduation-clearance/exam");
    let rows = [];
    if (success && data?.data?.length > 0) {
      data.data.forEach((item, index) => {
        rows.push([
          index + 1, item.StudentID, item.Name, item.CourseCode, item.StudentLevel, item.StudentSemester, item.ExamsCleared, item.ExamsClearedBy,
          <><button type="button" id="ApproveBtn" data-toggle="tooltip" data-placement="right" title="Cleared" onClick={() => { if (item.ExamsCleared !== "Cleared") { TakeDecision("Cleared", item.StudentID); } }} className="btn btn-sm btn-success "><i className={"fa fa-check"} /></button><button style={{ marginLeft: "2px" }} type="button" id="RejectBtn" data-toggle="tooltip" onClick={() => { setName(item.Name); getStudentPerformance(item.StudentID); }} data-placement="right" data-bs-toggle="modal" data-bs-target="#modal_academic" title="View" className="btn btn-sm btn-primary "><i className={"fa fa-eye"} /></button></>
        ]);
      });
    }
    setClearanceData(rows);
  };

  useEffect(() => { getClearance(); }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Exam Clearance"} items={["Users", "Graduation Clearance", "Exam Clearacne"]} />
      <div className="flex-column-fluid"><div className="card"><div className="card-body p-0">{clearanceData.length > 0 ? (<ReportTable columns={columns} data={clearanceData} />) : (<></>)}</div></div><div className="modal fade" id="modal_academic" tabIndex="-1" aria-labelledby="bedForm" aria-hidden="true"><div className="modal-dialog modal-xl"><div className="modal-content"><div className="modal-header"><h3 className="modal-title" id="bedForm">{`${name} Academic Performance`}</h3><button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div className="modal-body"><AGTable data={datatable} /></div></div></div></div></div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(ExamClearance);
