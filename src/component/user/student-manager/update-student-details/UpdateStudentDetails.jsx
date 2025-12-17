import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import Modal from "../../../common/modal/modal";
import { encryptData } from "../../../../resources/constants";
import SearchSelect from "../../../common/select/SearchSelect";
import { useForm } from "react-hook-form";

function UpdateStudentDetails(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckedEmail, setIsCheckedEmail] = useState(false);
    const [isCheckedStatus, setIsCheckedStatus] = useState(false);
    const [isCheckedPassword, setIsCheckedPassword] = useState(false);
    const { register, handleSubmit, setValue } = useForm();
    const [studentSelectList, setStudentSelectList] = useState([]);
    const [formData, setFormData] = useState({ FirstName: "", MiddleName: "", Surname: "" });
    const [selectedStudent, setSelectedStudent] = useState({ StudentID: "", FirstName: "", EmailAddress: "" });
    const [studentList, setStudentList] = useState([]);

    const handleCheckedStatus = () => { setIsCheckedStatus(!isCheckedStatus); setValue("status", ""); };
    const handleCheckedEmail = () => { setIsCheckedEmail(!isCheckedEmail); setValue("Email", ""); setValue("Email2", ""); };
    const handleCheckedPass = () => { setIsCheckedPassword(!isCheckedPassword); setValue("Password", ""); };

    const updateStudentDetail = async (data) => {
        if (selectedStudent.StudentID === "") { toast.error("Please specify student ID"); return; }
        if (!isCheckedEmail && !isCheckedStatus && !isCheckedPassword) { toast.error("Please Specify Action"); return; }
        if (isCheckedStatus && data.status === "") { toast.error("Please specify Student Status"); return; }
        if (isCheckedPassword && data.Password === "") { toast.error("Please specify new password"); return; }
        if (isCheckedEmail) { if (data.Email === "") { toast.error("Please specify New School Email"); return; } if (data.Email2 === "") { toast.error("Please specify New Private Email"); return; } }
        const dataTo = { ...data, Password: encryptData(data.Password), id: selectedStudent.StudentID };
        if (isCheckedEmail) { updateEmail(dataTo); }
        if (isCheckedPassword) { updatePassword(dataTo); }
        if (isCheckedStatus) { updateStatus(dataTo); }
    };

    async function updateEmail(data) {
        const { success } = await api.patch("staff/users/student-manager/update-student-email", data);
        if (success) { toast.success("Email Updated"); } else { toast.error("An error has occurred. Please try again!"); }
    }

    async function updatePassword(data) {
        const { success } = await api.patch("staff/users/student-manager/update-student-password", data);
        if (success) { toast.success("Password Updated"); } else { toast.error("An error has occurred. Please try again!"); }
    }

    async function updateStatus(data) {
        const { success } = await api.patch("staff/users/student-manager/update-student-status", data);
        if (success) { toast.success("Status Updated"); } else { toast.error("An error has occurred. Please try again!"); }
    }

    const getStudentDetails = async () => {
        const { success, data: result } = await api.get("staff/student-manager/student/active");
        if (success && result?.length > 0) {
            let rows = [];
            result.forEach((item) => { rows.push({ value: item.StudentID, label: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})` }); });
            setStudentSelectList(rows);
            setStudentList(result);
        }
    };

    const handleChange = (e) => {
        const filter_student = studentList.filter((i) => i.StudentID === e.value);
        if (filter_student.length > 0) { setSelectedStudent({ ...selectedStudent, StudentID: filter_student[0].StudentID }); }
    };

    const onEdit = (e) => { setFormData({ ...formData, [e.target.id]: e.target.value }); };

    useEffect(() => { getStudentDetails(); }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Update Student Details"} items={["Users", "Student Manager", "Update Student Details"]} />
            <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-body p-0"><form onSubmit={handleSubmit(updateStudentDetail)}><div className="form-group"><label htmlFor="roomNumber">Student ID</label><SearchSelect value={studentSelectList.find(op => op.value === selectedStudent.StudentID) || null} onChange={handleChange} options={studentSelectList} placeholder="Search Student" /></div><p className="pt-5"><input type="checkbox" checked={isCheckedEmail} onChange={handleCheckedEmail} className="form-check-input" id="exampleCheck2" /><label className="form-check-label" htmlFor="exampleCheck2">Update Email?</label><input style={{ marginLeft: "20px" }} type="checkbox" checked={isCheckedStatus} onChange={handleCheckedStatus} className="form-check-input" id="exampleCheck1" /><label className="form-check-label" htmlFor="exampleCheck1">Update Status?</label><input style={{ marginLeft: "20px" }} type="checkbox" checked={isCheckedPassword} onChange={handleCheckedPass} className="form-check-input" id="exampleCheck5" /><label className="form-check-label" htmlFor="exampleCheck5">Update Password?</label></p>{isCheckedEmail && (<><div className="form-group pt-5"><label htmlFor="roomNumber">School Email</label><input type="text" {...register("Email")} required className="form-control" placeholder="School Email" /></div><div className="form-group pt-5"><label htmlFor="roomNumber">Private Email</label><input type="text" {...register("Email2")} required className="form-control" placeholder="Private Email" /></div></>)}{isCheckedStatus && (<div className="col pt-5"><label htmlFor="roomNumber">Status</label><SearchSelect required onChange={(selected) => setValue("status", selected?.value || "")} options={[{ value: "Active", label: "Active" }, { value: "Dead", label: "Dead" }, { value: "Deferred", label: "Deferred" }, { value: "Expelled", label: "Expelled" }, { value: "Rusticated", label: "Rusticated" }]} placeholder="Select Status" /></div>)}{isCheckedPassword && (<><div className="form-group pt-5 mb-3"><label htmlFor="roomNumber">New Password</label><input type="text" {...register("Password")} required className="form-control" placeholder="New Password" /></div></>)}<button className="btn btn-primary w-100">Update</button></form></div></div><Modal title={"Progression Settings Form"}><form><div className="form-group pt-2"><button className="btn btn-primary w-100">Save</button></div></form></Modal></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(UpdateStudentDetails);
