import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import axios from "axios";
import {
    serverLink
} from "../../../resources/url";
import Select from "react-select";
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
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(false);
    const { Image } = useQRCode();
    const componentRef = useRef();
    const [data, setData] = useState({
        students: [],
        staff: [],
        biometric: [],
        designation: [],
        statics: [],
        courses: [],
    });
    const [studentsList, setStudentsList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState({
        studentInfo: [],
        studentBiometric: [],
        signature: "",
        logo: "",
    })
    const [selectedStaff, setSelectedStaff] = useState({
        staffInfo: [],
        staffBiometric: [],
        signature: "",
        logo: "",
    })
    const [contentToRender, setContentToRender] = useState(false)
    const [renderIDCard, setRenderIDCard] = useState(false)
    const [canPrintIDCard, setCanPrintIDCard] = useState(false)
    const [createRequest, setCreateRequest] = useState({
        UserID: "",
        CardType: "",
    });

    const onEdit = (e) => {
        setCreateRequest({
            ...createRequest,
            [e.target.id]: e.target.value,
        });

        if (e.target.value === "Staff") {
            setStudentsList([]);
            axios.get(`${serverLink}staff/biometric-devices/id/card/data`, token)
                .then((res) => {
                    setData(res.data)
                    if (res.data.staff.length > 0) {
                        let rows = [];
                        res.data.staff.map(item => {
                            rows.push({
                                id: item.StaffID,
                                text: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StaffID})`
                            })
                        })
                        setStaffList(rows);
                        setContentToRender(true);
                    }
                })
                .catch((err) => {
                    console.log("NETWORK ERROR");
                });
        }

        if (e.target.value === "Student") {
            setStaffList([]);
            axios.get(`${serverLink}staff/biometric-devices/id/card/data`, token)
                .then((res) => {
                    setData(res.data)
                    if (res.data.students.length > 0) {
                        let rows = [];
                        res.data.students.map(item => {
                            rows.push({
                                id: item.StudentID,
                                text: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})`
                            })
                        })
                        setStudentsList(rows);
                        setContentToRender(true);
                    }
                })
                .catch((err) => {
                    console.log("NETWORK ERROR");
                });
        }

        setRenderIDCard(false);
    }

    const onSearch = async () => {
        if (createRequest.CardType === "Staff") {
            if (createRequest.UserID !== "") {
                const filteredStaff = data.staff.filter(i => i.StaffID === createRequest.UserID);
                const staffBiometric = data.biometric.filter(i => i.UserID === createRequest.UserID);
                const signature = data.statics.filter(i => i.OwnerID === "E0001");
                const logo = data.statics.filter(i => i.ContentType === "logo");
                setSelectedStaff({
                    staffInfo: filteredStaff,
                    staffBiometric: staffBiometric,
                    signature: signature,
                    logo: logo,
                })
                setRenderIDCard(true)
                setCanPrintIDCard(true)
                setSelectedStudent([])
            }
        }

        if (createRequest.CardType === "Student") {
            if (createRequest.UserID !== "") {
                const filteredStudent = data.students.filter(i => i.StudentID === createRequest.UserID);
                const studentBiometric = data.biometric.filter(i => i.UserID === createRequest.UserID);
                const signature = data.statics.filter(i => i.OwnerID === "E0001");
                const logo = data.statics.filter(i => i.ContentType === "logo");

                setSelectedStudent({
                    studentInfo: filteredStudent,
                    studentBiometric: studentBiometric,
                    signature: signature,
                    logo: logo,
                })
                setRenderIDCard(true)
                setCanPrintIDCard(true)
                setSelectedStaff([])
            }
        }
    }

    const printIDCard = useReactToPrint({
        content: () => componentRef.current,
    })

    useEffect(() => {
        // getData().then();
    }, [])

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Generate Staff and Students Identity Card"}
                items={["User", "Biometric & Devices", "Generate ID Card"]}
            />

            <div className="flex-column-fluid h-500px">
                <div className="card">
                    <div className="card-body pt-0 h-500px">
                        <div className="col-md-12">
                            <div className="row col-md-12">
                                <div className="col-md-3">

                                    <div className="form-group pt-3">
                                        <label htmlFor="CardType">Select Card Type</label>
                                        <select
                                            className="form-control"
                                            id="CardType"
                                            name="CardType"
                                            value={createRequest.CardType}
                                            onChange={onEdit}
                                        >
                                            <option value="">Select Option</option>
                                            <option value="Staff">Staff</option>
                                            <option value="Student">Student</option>
                                        </select>
                                    </div>

                                    {contentToRender === true && createRequest.CardType === "Staff" && (
                                        <>
                                            {studentsList.length < 1 &&
                                                <>
                                                    <div className="form-group pt-3">
                                                        <label htmlFor="UserID">Select Staff</label>
                                                        <Select
                                                            id="UserID"
                                                            name="UserID"
                                                            data={staffList}
                                                            value={createRequest.UserID}
                                                            className={"form-control"}
                                                            onSelect={onEdit}
                                                            options={{
                                                                placeholder: "Search Staff",
                                                            }}
                                                        />
                                                    </div >
                                                </>
                                            }
                                        </>
                                    )}

                                    {contentToRender === true && createRequest.CardType === "Student" && (
                                        <>
                                            {staffList.length < 1 && (
                                                <>

                                                    <div className="form-group pt-3">
                                                        <label htmlFor="UserID">Select Student</label>
                                                        <Select
                                                            id="UserID"
                                                            name="UserID"
                                                            data={studentsList}
                                                            value={createRequest.UserID}
                                                            className={"form-control"}
                                                            onSelect={onEdit}
                                                            options={{
                                                                placeholder: "Search Student",
                                                            }}
                                                        />

                                                    </div>

                                                </>
                                            )}
                                        </>

                                    )}

                                    <div className="pt-3"> <button className="btn btn-primary w-100" onClick={onSearch}>Generate</button></div>

                                    {renderIDCard && createRequest.CardType === "Staff" && (
                                        <>
                                            {selectedStaff.staffInfo !== "undefined" && selectedStaff.staffInfo !== "" &&
                                                selectedStaff.staffBiometric !== "undefined" && selectedStaff.staffBiometric !== ""
                                                && selectedStaff.staffInfo.length > 0 && selectedStaff.staffBiometric.length > 0 &&
                                                canPrintIDCard === true && (
                                                    <div className="pt-3"> <button className="btn btn-primary w-100" onClick={printIDCard}>Print</button></div>
                                                )}

                                        </>
                                    )}


                                    {renderIDCard && createRequest.CardType === "Student" && (
                                        <>
                                            {selectedStudent.studentInfo !== "undefined" && selectedStudent.studentInfo !== "" &&
                                                selectedStudent.studentBiometric !== "undefined" && selectedStudent.studentBiometric !== ""
                                                && selectedStudent.studentInfo.length > 0 && selectedStudent.studentBiometric.length > 0 &&
                                                canPrintIDCard === true && (
                                                    <div className="pt-3"> <button className="btn btn-primary w-100" onClick={printIDCard}>Print</button></div>
                                                )}

                                        </>
                                    )}
                                    <br />
                                </div>
                                

                                <div className="col-md-6">

                                    {shortCode === "AUM" ?
                                        <AUMStaffIdCard
                                            renderIDCard={renderIDCard}
                                            createRequest={createRequest}
                                            selectedStaff={selectedStaff}
                                            componentRef={componentRef}
                                            data={data}
                                        />
                                        : shortCode === "CU" ?
                                            <CUStaffIdCard
                                                renderIDCard={renderIDCard}
                                                createRequest={createRequest}
                                                selectedStaff={selectedStaff}
                                                componentRef={componentRef}
                                                data={data}
                                            />
                                            :
                                        <BAUStaffIdCard
                                            renderIDCard={renderIDCard}
                                            createRequest={createRequest}
                                            selectedStaff={selectedStaff}
                                            componentRef={componentRef}
                                            data={data}
                                        />

                                    }

                                    {
                                        shortCode === "AUM" ?
                                            <AUMStudentIdCard
                                                renderIDCard={renderIDCard}
                                                createRequest={createRequest}
                                                selectedStudent={selectedStudent}
                                                componentRef={componentRef}
                                                data={data}
                                            />

                                            : shortCode === "CU" ?
                                                <CUStudentIdCard
                                                    renderIDCard={renderIDCard}
                                                    createRequest={createRequest}
                                                    selectedStudent={selectedStudent}
                                                    componentRef={componentRef}
                                                    data={data}
                                                />
                                                :
                                            <BAUStudentIdCard
                                                renderIDCard={renderIDCard}
                                                createRequest={createRequest}
                                                selectedStudent={selectedStudent}
                                                componentRef={componentRef}
                                                data={data}
                                            />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )

}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(GenerateIDCard);
