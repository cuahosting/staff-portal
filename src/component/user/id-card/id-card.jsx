import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import SearchSelect from "../../common/select/SearchSelect";
import { useQRCode } from 'next-qrcode';
import { useReactToPrint } from "react-to-print";
import { shortCode } from "../../../resources/constants";
import AUMStaffIdCard from "./aum/staff-id-card";
import BAUStaffIdCard from "./bau/staff-id-card";
import AUMStudentIdCard from "./aum/student-id-card";
import BAUStudentIdCard from "./bau/student-id-card";
import CUStaffIdCard from "./cu/staff-id-card";
import CUStudentIdCard from "./cu/student-id-card";

function GenerateIDCard(props) {
    const [isLoading] = useState(false);
    useQRCode();
    const componentRef = useRef();
    const [data, setData] = useState({ students: [], staff: [], biometric: [], designation: [], statics: [], courses: [] });
    const [studentsList, setStudentsList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState({ studentInfo: [], studentBiometric: [], signature: "", logo: "" });
    const [selectedStaff, setSelectedStaff] = useState({ staffInfo: [], staffBiometric: [], signature: "", logo: "" });
    const [contentToRender, setContentToRender] = useState(false);
    const [renderIDCard, setRenderIDCard] = useState(false);
    const [canPrintIDCard, setCanPrintIDCard] = useState(false);
    const [createRequest, setCreateRequest] = useState({ UserID: "", CardType: "" });

    const onEdit = async (e) => {
        setCreateRequest({ ...createRequest, [e.target.id]: e.target.value });
        if (e.target.value === "Staff") {
            setStudentsList([]);
            const { success, data: result } = await api.get("staff/biometric-devices/id/card/data");
            if (success && result) {
                setData(result);
                if (result.staff?.length > 0) {
                    let rows = [];
                    result.staff.forEach(item => { rows.push({ value: item.StaffID, label: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StaffID})` }); });
                    setStaffList(rows);
                    setContentToRender(true);
                }
            }
        }
        if (e.target.value === "Student") {
            setStaffList([]);
            const { success, data: result } = await api.get("staff/biometric-devices/id/card/data");
            if (success && result) {
                setData(result);
                if (result.students?.length > 0) {
                    let rows = [];
                    result.students.forEach(item => { rows.push({ value: item.StudentID, label: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})` }); });
                    setStudentsList(rows);
                    setContentToRender(true);
                }
            }
        }
        setRenderIDCard(false);
    };

    const onSearch = async () => {
        if (createRequest.CardType === "Staff" && createRequest.UserID !== "") {
            const filteredStaff = data.staff.filter(i => i.StaffID === createRequest.UserID);
            const staffBiometric = data.biometric.filter(i => i.UserID === createRequest.UserID);
            const signature = data.statics.filter(i => i.OwnerID === "E0001");
            const logo = data.statics.filter(i => i.ContentType === "logo");
            setSelectedStaff({ staffInfo: filteredStaff, staffBiometric: staffBiometric, signature: signature, logo: logo });
            setRenderIDCard(true); setCanPrintIDCard(true); setSelectedStudent([]);
        }
        if (createRequest.CardType === "Student" && createRequest.UserID !== "") {
            const filteredStudent = data.students.filter(i => i.StudentID === createRequest.UserID);
            const studentBiometric = data.biometric.filter(i => i.UserID === createRequest.UserID);
            const signature = data.statics.filter(i => i.OwnerID === "E0001");
            const logo = data.statics.filter(i => i.ContentType === "logo");
            setSelectedStudent({ studentInfo: filteredStudent, studentBiometric: studentBiometric, signature: signature, logo: logo });
            setRenderIDCard(true); setCanPrintIDCard(true); setSelectedStaff([]);
        }
    };

    const printIDCard = useReactToPrint({ content: () => componentRef.current });

    useEffect(() => { }, []);

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Generate Staff and Students Identity Card"} items={["User", "Biometric & Devices", "Generate ID Card"]} />
            <div className="flex-column-fluid h-500px"><div className="card"><div className="card-body p-0 h-500px"><div className="col-md-12"><div className="row col-md-12"><div className="col-md-3"><div className="form-group pt-3"><label htmlFor="CardType">Select Card Type</label><SearchSelect id="CardType" value={[{ value: "Staff", label: "Staff" }, { value: "Student", label: "Student" }].find(op => op.value === createRequest.CardType) || null} onChange={(selected) => onEdit({ target: { id: 'CardType', value: selected?.value || '' } })} options={[{ value: "Staff", label: "Staff" }, { value: "Student", label: "Student" }]} placeholder="Select Option" /></div>{contentToRender === true && createRequest.CardType === "Staff" && (<>{studentsList.length < 1 && (<><div className="form-group pt-3"><label htmlFor="UserID">Select Staff</label><SearchSelect id="UserID" name="UserID" options={staffList} value={staffList.find(op => op.value === createRequest.UserID) || null} className={"form-control"} onChange={(selected) => onEdit({ target: { id: "UserID", value: selected?.value || "" } })} placeholder="Search Staff" /></div></>)}</>)}{contentToRender === true && createRequest.CardType === "Student" && (<>{staffList.length < 1 && (<><div className="form-group pt-3"><label htmlFor="UserID">Select Student</label><SearchSelect id="UserID" name="UserID" options={studentsList} value={studentsList.find(op => op.value === createRequest.UserID) || null} className={"form-control"} onChange={(selected) => onEdit({ target: { id: "UserID", value: selected?.value || "" } })} placeholder="Search Student" /></div></>)}</>)}<div className="pt-3"><button className="btn btn-primary w-100" onClick={onSearch}>Generate</button></div>{renderIDCard && createRequest.CardType === "Staff" && (<>{selectedStaff.staffInfo !== "undefined" && selectedStaff.staffInfo !== "" && selectedStaff.staffBiometric !== "undefined" && selectedStaff.staffBiometric !== "" && selectedStaff.staffInfo.length > 0 && selectedStaff.staffBiometric.length > 0 && canPrintIDCard === true && (<div className="pt-3"><button className="btn btn-primary w-100" onClick={printIDCard}>Print</button></div>)}</>)}{renderIDCard && createRequest.CardType === "Student" && (<>{selectedStudent.studentInfo !== "undefined" && selectedStudent.studentInfo !== "" && selectedStudent.studentBiometric !== "undefined" && selectedStudent.studentBiometric !== "" && selectedStudent.studentInfo.length > 0 && selectedStudent.studentBiometric.length > 0 && canPrintIDCard === true && (<div className="pt-3"><button className="btn btn-primary w-100" onClick={printIDCard}>Print</button></div>)}</>)}<br /></div><div className="col-md-6">{shortCode === "AUM" ? <AUMStaffIdCard renderIDCard={renderIDCard} createRequest={createRequest} selectedStaff={selectedStaff} componentRef={componentRef} data={data} /> : shortCode === "CU" ? <CUStaffIdCard renderIDCard={renderIDCard} createRequest={createRequest} selectedStaff={selectedStaff} componentRef={componentRef} data={data} /> : <BAUStaffIdCard renderIDCard={renderIDCard} createRequest={createRequest} selectedStaff={selectedStaff} componentRef={componentRef} data={data} />}{shortCode === "AUM" ? <AUMStudentIdCard renderIDCard={renderIDCard} createRequest={createRequest} selectedStudent={selectedStudent} componentRef={componentRef} data={data} /> : shortCode === "CU" ? <CUStudentIdCard renderIDCard={renderIDCard} createRequest={createRequest} selectedStudent={selectedStudent} componentRef={componentRef} data={data} /> : <BAUStudentIdCard renderIDCard={renderIDCard} createRequest={createRequest} selectedStudent={selectedStudent} componentRef={componentRef} data={data} />}</div></div></div></div></div></div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(GenerateIDCard);
