import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
import swal from "sweetalert";
import SearchSelect from "../../common/select/SearchSelect";

const yesNoOptions = [{ value: '1', label: 'YES' }, { value: '0', label: 'NO' }];

function Department(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setisFormLoading] = useState("off");
  const [department, setDepartment] = useState([]);
  const [staff, setStaff] = useState([]);
  const [datatable, setDatatable] = useState({
    columns: [{ label: "S/N", field: "sn" }, { label: "Department Code", field: "DepartmentCode" }, { label: "Department Name", field: "DepartmentName" }, { label: "Faculty", field: "FacultyCode" }, { label: "Is Academic", field: "IsAcademic" }, { label: "IsAwardDegree", field: "IsAwardDegree" }, { label: "HOD", field: "DepartmentHead" }, { label: "Action", field: "action" }],
    rows: [],
  });

  const [createDepartment, setCreateDepartment] = useState({ EntryID: "", DepartmentCode: "", DepartmentName: "", FacultyCode: "", FacultyCode2: "", IsAwardDegree: "", IsAcademic: "", DepartmentHead: "", DepartmentHead2: "", InsertedBy: props.LoginDetails[0].StaffID });
  const [facultyList, setFacultyList] = useState([]);
  const [academicStaff, setAcademicStaff] = useState([]);

  async function deleteDepartment(departmentCode_ln) {
    const { success, data } = await api.post("staff/academics/department/deleteDepartment", { departmentCode: departmentCode_ln });
    if (success) {
      if (data?.message === "success") { toast.success("Deleted Successfully"); getDepartments(); }
      else { toast.error(data?.whatToShow || "Error deleting department"); }
    }
  }

  useEffect(() => {
    let rows = [];
    props.FacultyList.length > 0 && props.FacultyList.forEach((x) => { rows.push({ label: x.FacultyName, value: x.FacultyCode }); });
    setFacultyList(rows);
  }, []);

  const getDepartments = async () => {
    let staffData = [];
    const { success: staffSuccess, data: staffRes } = await api.get("staff/academics/department/academic-staff/list");
    if (staffSuccess && staffRes?.length > 0) {
      staffData = staffRes;
      setAcademicStaff(staffRes);
      let rows = [];
      staffRes.forEach((row) => { rows.push({ value: row.StaffID, label: row.StaffName + " - (" + row.StaffID + ")" }); });
      setStaff(rows);
    }

    const { success, data } = await api.get("staff/academics/department/list");
    if (success && data?.length > 0) {
      let rows = [];
      data.forEach((department, index) => {
        rows.push({
          sn: index + 1, EntryID: department.EntryID, DepartmentCode: department.DepartmentCode, DepartmentName: department.DepartmentName,
          FacultyCode: props.FacultyList.filter((x) => x.FacultyCode === department.FacultyCode)[0]?.FacultyName || department.FacultyCode,
          IsAwardDegree: department.IsAwardDegree === 1 ? "YES" : "NO", IsAcademic: department.IsAcademic === 1 ? "YES" : "NO", DepartmentHead: department.DepartmentHead,
          action: (
            <>
              <button className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }} title="Edit" data-bs-toggle="modal" data-bs-target="#kt_modal_general"
                onClick={() => { const faculty = facultyList.length > 0 && facultyList.filter(x => x.FacultyCode === department.FacultyCode); const deptHead = staffData.length > 0 && staffData.filter(x => x.StaffID === department.DepartmentHead); setCreateDepartment({ EntryID: department.EntryID, DepartmentCode: department.DepartmentCode, DepartmentName: department.DepartmentName, FacultyCode2: { value: faculty[0]?.FacultyCode, label: faculty[0]?.FacultyName }, FacultyCode: department.FacultyCode, IsAwardDegree: department.IsAwardDegree, IsAcademic: department.IsAcademic, DepartmentHead: department.DepartmentHead, DepartmentHead2: deptHead.length > 0 ? { value: deptHead[0]?.StaffID, label: deptHead[0]?.StaffName + " - (" + deptHead[0]?.StaffID + ")" } : { value: '', label: '' }, UpdatedBy: props.LoginDetails[0].StaffID }); }}>
                <i style={{ fontSize: '15px', color: "blue" }} className="fa fa-pen color-blue" />
              </button>
              <button className="btn btn-link p-0 text-danger" title="Delete" onClick={() => { swal({ title: "Are you sure?", text: "Once deleted, you will not be able to recover it!", icon: "warning", buttons: true, dangerMode: true }).then((willDelete) => { if (willDelete) { deleteDepartment(department.DepartmentCode); } }); }}>
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

  const onEdit = (e) => { setCreateDepartment({ ...createDepartment, [e.target.id]: e.target.value }); };
  const onFacultyChange = (e) => { setCreateDepartment({ ...createDepartment, FacultyCode: e.value, FacultyCode2: e }); };
  const onStaffChange = (e) => { setCreateDepartment({ ...createDepartment, DepartmentHead: e.value, DepartmentHead2: e }); };

  const onSubmit = async () => {
    if (createDepartment.DepartmentName.trim() === "") { showAlert("EMPTY FIELD", "Please enter the department name", "error"); return false; }
    if (createDepartment.DepartmentCode.trim() === "") { showAlert("EMPTY FIELD", "Please enter the department code", "error"); return false; }
    if (createDepartment.FacultyCode.trim() === "") { showAlert("EMPTY FIELD", "Please select the faculty", "error"); return false; }
    if (createDepartment.IsAcademic.toString().trim() === "") { showAlert("EMPTY FIELD", "Please select the Academic type", "error"); return false; }
    if (createDepartment.IsAwardDegree.toString().trim() === "") { showAlert("EMPTY FIELD", "Please select the award type", "error"); return false; }
    if (createDepartment.DepartmentHead.trim() === "") { showAlert("EMPTY FIELD", "Please select the Head of Department", "error"); return false; }

    if (createDepartment.EntryID === "") {
      setisFormLoading("on");
      const { success, data } = await api.post("staff/academics/department/add", createDepartment);
      if (success) {
        if (data?.message === "success") { toast.success("Department Added Successfully"); getDepartments(); setCreateDepartment({ ...createDepartment, EntryID: "", DepartmentCode: "", DepartmentName: "", FacultyCode: "", FacultyDean2: { value: '', label: '' }, DepartmentHead2: { value: '', label: '' }, FacultyCode2: { value: '', label: '' }, IsAwardDegree: "", IsAcademic: "", DepartmentHead: "" }); document.getElementById("closeModal").click(); }
        else if (data?.message === "exist") { showAlert("DEPARTMENT EXIST", "Department already exist!", "error"); }
        else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
      }
      setisFormLoading("off");
    } else {
      setisFormLoading("on");
      const { success, data } = await api.patch("staff/academics/department/update", createDepartment);
      if (success) {
        if (data?.message === "success") { toast.success("Department Updated Successfully"); getDepartments(); setCreateDepartment({ ...createDepartment, EntryID: "", DepartmentCode: "", DepartmentName: "", FacultyCode: "", FacultyDean2: { value: '', label: '' }, DepartmentHead2: { value: '', label: '' }, FacultyCode2: { value: '', label: '' }, IsAwardDegree: "", IsAcademic: "", DepartmentHead: "" }); document.getElementById("closeModal").click(); }
        else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
      }
      setisFormLoading("off");
    }
  };

  useEffect(() => { getDepartments(); }, []);

  return isLoading ? (<Loader />) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Department"} items={["Academics", "Department", "Manage department"]}
        buttons={<button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setCreateDepartment({ ...createDepartment, EntryID: "", DepartmentCode: "", DepartmentName: "", FacultyCode: "", FacultyDean2: { value: '', label: '' }, DepartmentHead2: { value: '', label: '' }, FacultyCode2: { value: '', label: '' }, IsAwardDegree: "", IsAcademic: "", DepartmentHead: "", InsertedBy: props.LoginDetails[0].StaffID })}>Add Department</button>} />
      <div className="flex-column-fluid">
        <div className="card card-no-border"><div className="card-body p-0"><div className="col-md-12" style={{ overflowX: "auto" }}><AGTable data={datatable} /></div></div></div>
        <Modal title={"Department Form"}>
          <div className="row">
            <SearchSelect id="FacultyCode" label="Faculty" value={createDepartment.FacultyCode2} options={facultyList} onChange={onFacultyChange} placeholder="Select Faculty" />
            <div className="fv-row mb-6 enhanced-form-group"><label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="DepartmentName">Department Name</label><div className="enhanced-input-wrapper"><input type="text" id="DepartmentName" onChange={onEdit} value={createDepartment.DepartmentName} className="form-control form-control-lg form-control-solid enhanced-input" placeholder="Enter the Department Name" autoComplete="off" /></div></div>
            <div className="fv-row mb-6 enhanced-form-group"><label className="form-label fs-6 fw-bolder text-dark enhanced-label" htmlFor="DepartmentCode">Department Code</label><div className="enhanced-input-wrapper"><input type="text" id="DepartmentCode" disabled={createDepartment.EntryID !== ""} onChange={onEdit} value={createDepartment.DepartmentCode} className="form-control form-control-lg form-control-solid enhanced-input" style={{ textTransform: "uppercase" }} placeholder="Enter the Department Code" autoComplete="off" /></div></div>
            <div className="col-md-6"><SearchSelect id="IsAcademic" label="Is Academic?" value={createDepartment.IsAcademic !== '' ? yesNoOptions.find(o => o.value === createDepartment.IsAcademic.toString()) : null} options={yesNoOptions} onChange={(selected) => { setCreateDepartment({ ...createDepartment, IsAcademic: selected?.value || '' }); }} placeholder="Select type" /></div>
            <div className="col-md-6"><SearchSelect id="IsAwardDegree" label="Is Awarding Degree?" value={createDepartment.IsAwardDegree !== '' ? yesNoOptions.find(o => o.value === createDepartment.IsAwardDegree.toString()) : null} options={yesNoOptions} onChange={(selected) => { setCreateDepartment({ ...createDepartment, IsAwardDegree: selected?.value || '' }); }} placeholder="Select type" /></div>
            <SearchSelect id="DepartmentHead" label="Department Head" value={createDepartment.DepartmentHead2} options={staff} onChange={onStaffChange} placeholder="Select Department Head" />
          </div>
          <div className="form-group pt-2"><button onClick={onSubmit} className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={isFormLoading}><span className="indicator-label">Submit</span><span className="indicator-progress">Please wait...<span className="spinner-border spinner-border-sm align-middle ms-2" /></span></button></div>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails, FacultyList: state.FacultyList }; };
export default connect(mapStateToProps, null)(Department);
