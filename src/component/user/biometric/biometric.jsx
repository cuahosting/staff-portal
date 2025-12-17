import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import SearchSelect from "../../common/select/SearchSelect";
import { toast } from "react-toastify";
import { showAlert } from "../../common/sweetalert/sweetalert";

function CaptureBiometric(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState({ students: [], staff: [] });
    const [studentsList, setStudentsList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [createRequest, setCreateRequest] = useState({ UserID: "", BloodGroup: "", NOKPhoneNumber: "", CardType: "", file: "", BiometricRight: "", BiometricLeft: "", InsertedBy: props.loginData.StaffID });

    const resetSubmission = () => { setCreateRequest({ CardType: "", BloodGroup: "", NOKPhoneNumber: "", file: "", BiometricRight: "", BiometricLeft: "", InsertedBy: props.loginData.StaffID }); };

    const onEdit = async (e) => {
        const id = e.target.id;
        const value = id === "file" ? e.target.files[0] : e.target.value;
        setCreateRequest({ ...createRequest, [id]: value });

        if (e.target.value === "Staff" || e.target.value === "Student") {
            const { success, data: result } = await api.get("staff/biometric-devices/id/card/data");
            if (success && result) {
                if (e.target.value === "Staff" && result.staff?.length > 0) {
                    let staff_rows = [];
                    result.staff.forEach((item) => { staff_rows.push({ value: item.StaffID, label: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StaffID})` }); });
                    setStaffList(staff_rows); setStudentsList([]);
                }
                if (e.target.value === "Student" && result.students?.length > 0) {
                    let students_rows = [];
                    result.students.forEach((item) => { students_rows.push({ value: item.StudentID, label: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})` }); });
                    setStudentsList(students_rows); setStaffList([]);
                }
            }
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        for (let key in createRequest) { if (createRequest.hasOwnProperty(key) && key !== "InsertedBy" && key !== "InsertedDate" && key !== "BiometricRight" && key !== "BiometricLeft" && key !== "file" && key !== "UpdatedBy") { if (createRequest[key] === "") { await showAlert("EMPTY FIELD", `Please enter ${key}`, "error"); return false; } } }
        if (createRequest.file === "") { toast.error(`File Can't be empty`); return false; }
        toast.info(`Submitting... Please wait!`);
        try {
            const sendData = { UserID: createRequest.UserID, UserType: createRequest.CardType, Passport: createRequest.file, NOKPhoneNumber: createRequest.NOKPhoneNumber, BloodGroup: createRequest.BloodGroup, BiometricRight: createRequest.BiometricRight, BiometricLeft: createRequest.BiometricLeft, InsertedBy: createRequest.InsertedBy };
            const { success } = await api.post("staff/biometric-devices/save/biometric/data", sendData);
            if (success) {
                toast.success(`Record Captured Successfully.`);
                if (createRequest.file !== "") { const fdt = new FormData(); fdt.append("file", createRequest.file); fdt.append("UserID", createRequest.UserID); await api.post("staff/biometric-devices/uploadDocument", fdt, { headers: { "Content-Type": "multipart/form-data" } }); }
                resetSubmission();
            } else { toast.error(`Something went wrong submitting your document!`); }
        } catch (error) { console.log("error", error); toast.error(`Something went wrong uploading your document. Please try again!`); }
    };

    useEffect(() => { }, []);

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Capture Biometric"} items={["User", "Biometric & Devices", "Capture Biometric"]} />
            <div className="row"><div className="card"><div className="col-md-12"><div className="row"><div className="col-lg-6 pt-5"><label htmlFor="CardType">Card Type</label><SearchSelect id="CardType" value={[{ value: "Staff", label: "Staff" }, { value: "Student", label: "Student" }].find(op => op.value === createRequest.CardType) || null} onChange={(selected) => onEdit({ target: { id: 'CardType', value: selected?.value || '' } })} options={[{ value: "Staff", label: "Staff" }, { value: "Student", label: "Student" }]} placeholder="Select Option" /></div>{createRequest.CardType === "Staff" && (<div className="col-lg-6 pt-5"><label htmlFor="UserID">Select Staff</label><SearchSelect id="UserID" name="UserID" options={staffList} value={staffList.find(op => op.value === createRequest.UserID) || null} onChange={(selected) => onEdit({ target: { id: "UserID", value: selected?.value || "" } })} placeholder="Search Staff" /></div>)}{createRequest.CardType === "Student" && (<div className="col-lg-6 pt-5"><label htmlFor="UserID">Select Student</label><SearchSelect id="UserID" name="UserID" options={studentsList} value={studentsList.find(op => op.value === createRequest.UserID) || null} onChange={(selected) => onEdit({ target: { id: "UserID", value: selected?.value || "" } })} placeholder="Search Student" /></div>)}</div>{(createRequest.CardType === "Staff" || createRequest.CardType === "Student") && createRequest.UserID !== "" && createRequest.UserID !== "undefined" && (<><div className="row"><h4 className="pt-5">Update Biometric Record</h4><div className="col-lg-4 pt-5"><div className="form-group"><label htmlFor="NOKPhoneNumber">NOK Phone Number</label><input type="text" id="NOKPhoneNumber" className="form-control" placeholder="NOK Phone Number" value={createRequest.NOKPhoneNumber} onChange={onEdit} /></div></div><div className="col-lg-4 pt-5"><div className="form-group"><label htmlFor="BloodGroup">Blood Group</label><SearchSelect id="BloodGroup" name="BloodGroup" value={[{ value: "A+", label: "A+" }, { value: "A-", label: "A-" }, { value: "B+", label: "B+" }, { value: "B-", label: "B-" }, { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" }, { value: "O+", label: "O+" }, { value: "O-", label: "O-" }].find(op => op.value === createRequest.BloodGroup) || null} onChange={(selected) => onEdit({ target: { id: "BloodGroup", value: selected?.value || "" } })} options={[{ value: "A+", label: "A+" }, { value: "A-", label: "A-" }, { value: "B+", label: "B+" }, { value: "B-", label: "B-" }, { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" }, { value: "O+", label: "O+" }, { value: "O-", label: "O-" }]} placeholder="Select Option" /></div></div><div className="col-lg-4 pt-5"><div className="form-group"><label htmlFor="file">Passport</label><input type="file" accept=".jpg, .png, .jpeg" id="file" name="file" className="form-control" placeholder="File" required onChange={onEdit} /><span className="badge bg-primary">Only .jpg, .png, .jpeg are allowed</span></div></div></div><div className="d-flex pt-10 align-items-center"><div className="card-body"><div className="mt-n14"><div className="row pt-10 py-15 p-5"><div className="col-lg-2 w-225px"><div className="bg-gray-100 bg-primary px-20 py-12">Right Thumb</div></div><div className="col-lg-2 w-225px"><div className="bg-gray-100 bg-primary px-20 py-15">Left Thumb</div></div><div className="pt-5"><button className="btn btn-primary w-100" onClick={onSubmit}>Save</button></div></div></div></div></div></>)}</div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(CaptureBiometric);
