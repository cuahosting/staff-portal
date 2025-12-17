import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import AddFacultyForm from "./addfacultyform";
import { connect } from "react-redux";
import swal from "sweetalert";

function Faculty(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState("off");
  const [datatable, setDatatable] = useState({
    columns: [{ label: "S/N", field: "sn" }, { label: "Faculty Name", field: "FacultyName" }, { label: "Faculty Code", field: "FacultyCode" }, { label: "Faculty Dean", field: "FacultyDean" }, { label: "Deputy Dean", field: "FacultyDeputyDean" }, { label: "IsAcademic", field: "IsAcademic" }, { label: "IsAwardDegree", field: "IsAwardDegree" }, { label: "Action", field: "action" }],
    rows: [],
  });
  const [academicStaff, setAcademicStaff] = useState([]);
  const [createFaculty, setCreateFaculty] = useState({ FacultyName: "", FacultyCode: "", FacultyDean: "", FacultyDean2: "", FacultyDeputyDean: "", FacultyDeputyDean2: "", IsAcademic: 1, IsEdit: "0", IsAwardDegree: 1, EntryID: "", InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}` });
  const [staff, setStaff] = useState({ StaffName: "", StaffID: "" });

  async function deleteFaculty(facultyCode_ln) {
    const { success, data } = await api.post("staff/academics/department/deleteFaculty", { facultyCode: facultyCode_ln });
    if (success) {
      if (data?.message === "success") { toast.success("Deleted Successfully"); getFaculty(); }
      else { toast.error(data?.whatToShow || "Error deleting faculty"); }
    }
  }

  const getFaculty = async () => {
    let staffData = [];
    const { success: staffSuccess, data: staffRes } = await api.get("staff/academics/department/academic-staff/list");
    if (staffSuccess && staffRes?.length > 0) {
      staffData = staffRes;
      let rows = [];
      staffRes.forEach((row) => { rows.push({ value: row.StaffID, label: row.StaffName + " - (" + row.StaffID + ")" }); });
      setStaff(rows);
      setAcademicStaff(staffRes);
    }

    const { success, data } = await api.get("staff/academics/faculty/list");
    if (success && data?.length > 0) {
      let rows = [];
      data.forEach((faculty, index) => {
        rows.push({
          sn: index + 1, FacultyName: faculty.FacultyName ?? "N/A", FacultyCode: faculty.FacultyCode ?? "N/A", FacultyDean: faculty.FacultyDean ?? "N/A", FacultyDeputyDean: faculty.FacultyDeputyDean ?? "N/A",
          IsAcademic: faculty.IsAcademic === 1 ? "Academic" : "Non-Academic", IsAwardDegree: faculty.IsAwardDegree === 1 ? "Yes" : "No",
          action: (
            <>
              <button className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }} title="Edit" data-bs-toggle="modal" data-bs-target="#kt_modal_general"
                onClick={() => { const facDean = staffData.length > 0 && staffData.filter(x => x.StaffID === faculty.FacultyDean); const facDepDean = staffData.length > 0 && staffData.filter(x => x.StaffID === faculty.FacultyDeputyDean); setCreateFaculty({ FacultyName: faculty.FacultyName, FacultyCode: faculty.FacultyCode, FacultyDean2: facDean.length > 0 ? { value: facDean[0]?.StaffID, label: facDean[0]?.StaffName + " - (" + facDean[0]?.StaffID + ")" } : { value: '', label: '' }, FacultyDean: faculty.FacultyDean, FacultyDeputyDean2: facDepDean.length > 0 ? { value: facDepDean[0]?.StaffID, label: facDepDean[0]?.StaffName + " - (" + facDepDean[0]?.StaffID + ")" } : { value: '', label: '' }, FacultyDeputyDean: faculty.FacultyDeputyDean, IsAcademic: faculty.IsAcademic, IsAwardDegree: faculty.IsAwardDegree, EntryID: faculty.EntryID, IsEdit: "1", InsertedBy: props.loginData[0]?.StaffID }); }}>
                <i style={{ fontSize: '15px', color: "blue" }} className="fa fa-pen color-blue" />
              </button>
              <button className="btn btn-link p-0 text-danger" title="Delete" onClick={() => { swal({ title: "Are you sure?", text: "Once deleted, you will not be able to recover it!", icon: "warning", buttons: true, dangerMode: true }).then((willDelete) => { if (willDelete) { deleteFaculty(faculty.FacultyCode); } }); }}>
                <i style={{ fontSize: '15px', color: "red" }} className="fa fa-trash" />
              </button>
            </>
          ),
        });
      });
      setDatatable({ ...datatable, rows: rows });
    }
    setIsLoading(false);
  };

  const onEdit = (e) => { setCreateFaculty({ ...createFaculty, [e.target.id]: e.target.value }); };
  const onStaffChange = (e) => { setCreateFaculty({ ...createFaculty, FacultyDean: e.value, FacultyDean2: e }); };
  const onDeputyChange = (e) => { setCreateFaculty({ ...createFaculty, FacultyDeputyDean: e.value, FacultyDeputyDean2: e }); };

  const onSubmit = async () => {
    if (createFaculty.FacultyName.trim() === "") { showAlert("EMPTY FIELD", "Please enter the faculty name", "error"); return false; }
    if (createFaculty.FacultyCode.trim() === "") { showAlert("EMPTY FIELD", "Please enter the faculty code", "error"); return false; }
    if (createFaculty.FacultyDean.trim() === "") { showAlert("EMPTY FIELD", "Please enter the faculty dean", "error"); return false; }

    if (createFaculty.EntryID === "") {
      setIsFormLoading("on");
      const { success, data } = await api.post("staff/academics/faculty/add", createFaculty);
      if (success) {
        if (data?.message === "success") { toast.success("Faculty Added Successfully"); getFaculty(); document.getElementById("closeModal").click(); setCreateFaculty({ ...createFaculty, FacultyName: "", FacultyCode: "", FacultyDean: "", FacultyDean2: { value: '', label: '' }, FacultyDeputyDean: "", FacultyDeputyDean2: { value: '', label: '' }, IsAcademic: 1, EntryID: 1, IsEdit: "0" }); }
        else if (data?.message === "exist") { showAlert("FACULTY EXIST", "Faculty already exist!", "error"); }
        else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
      }
      setIsFormLoading("off");
    } else {
      setIsFormLoading("on");
      const { success, data } = await api.patch("staff/academics/faculty/update", createFaculty);
      if (success) {
        if (data?.message === "success") { toast.success("Faculty Updated Successfully"); getFaculty(); document.getElementById("closeModal").click(); setCreateFaculty({ ...createFaculty, FacultyName: "", FacultyCode: "", FacultyDean: "", FacultyDean2: { value: '', label: '' }, FacultyDeputyDean2: { value: '', label: '' }, FacultyDeputyDean: "", IsAcademic: 1, IsAwardDegree: 1, EntryID: "", IsEdit: "0" }); }
        else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
      }
      setIsFormLoading("off");
    }
  };

  useEffect(() => { getFaculty(); }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Manage Faculty"} items={["Academics", "Faculty"]}
        buttons={<button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setCreateFaculty({ ...createFaculty, FacultyName: "", FacultyCode: "", FacultyDean: "", FacultyDeputyDean: "", FacultyDean2: { value: '', label: '' }, FacultyDeputyDean2: { value: '', label: '' }, IsAcademic: 1, IsAwardDegree: 1, EntryID: "", IsEdit: "0" })}>Add Faculty</button>} />
      <div className="flex-column-fluid">
        <div className="card card-no-border"><div className="card-body p-0"><AGTable data={datatable} /></div></div>
        <Modal title={createFaculty.EntryID === "" ? "Add Faculty" : "Edit Faculty"}><AddFacultyForm data={createFaculty} isFormLoading={isFormLoading} onEdit={onEdit} staffList={academicStaff} onSubmit={onSubmit} staff={staff} onStaffChange={onStaffChange} onDeputyChange={onDeputyChange} /></Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(Faculty);
