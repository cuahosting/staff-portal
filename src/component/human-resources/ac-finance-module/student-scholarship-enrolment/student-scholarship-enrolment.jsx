import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import DataTable from "../../../common/table/DataTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import ScholarshipStudentForm from "./ScholarshipStudentForm";
import swal from "sweetalert";

function StudentScholarshipEnrolment(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState("off");
    const [scholarships, setScholarships] = useState([]);
    const [students, setStudents] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Action", field: "action" },
            { label: "Student ID", field: "StudentID" },
            { label: "Full Name", field: "FullName" },
            { label: "Scholarship", field: "ScholarshipName" },
            { label: "Semester", field: "Semester" },
            { label: "Status", field: "statusBadge" },
        ],
        rows: [],
    });

    const initialData = {
        ScholarshipID: "",
        StudentID: "",
        FullName: "",
        EmailAddress: "",
        Semester: "",
        IsActive: "1",
        EntryID: "",
        InsertedBy: props.loginData[0].StaffID,
    };

    const [formState, setFormState] = useState(initialData);

    const buildRows = (data) => {
        return data.map((item, index) => ({
            sn: index + 1,
            StudentID: item.StudentID,
            FullName: item.FullName,
            ScholarshipName: item.ScholarshipName,
            Semester: item.Semester,
            statusBadge: (
                <span className={`badge badge-light-${item.IsActive === 1 ? "success" : "danger"}`}>
                    {item.IsActive === 1 ? "Active" : "Inactive"}
                </span>
            ),
            action: (
                <>
                    <button className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }} title="Edit" data-bs-toggle="modal" data-bs-target="#kt_modal_general"
                        onClick={() => setFormState({
                            ...item,
                            ScholarshipID: item.ScholarshipID,
                            IsActive: item.IsActive.toString(),
                            UpdatedBy: props.loginData[0].StaffID
                        })}>
                        <i style={{ fontSize: '15px' }} className="fa fa-pen" />
                    </button>
                    <button className="btn btn-link p-0 text-danger" title="Delete"
                        onClick={() => { swal({ title: "Are you sure?", text: "Once deleted, you will not be able to recover it!", icon: "warning", buttons: true, dangerMode: true }).then((willDelete) => { if (willDelete) { handleDelete(item.EntryID); } }); }}>
                        <i style={{ fontSize: '15px' }} className="fa fa-trash" />
                    </button>
                </>
            ),
        }));
    };

    const getData = async () => {
        const [enrolmentRes, scholarshipRes, semesterRes, studentRes] = await Promise.all([
            api.get("staff/ac-finance/scholarship/student/list"),
            api.get("staff/ac-finance/scholarship/list"),
            api.get("staff/ac-finance/scholarship/semesters"),
            api.get("staff/ac-finance/scholarship/students/active")
        ]);

        if (scholarshipRes.success) {
            setScholarships(scholarshipRes.data);
        }

        if (semesterRes.success) {
            setSemesters(semesterRes.data);
        }

        if (studentRes.success) {
            setStudents(studentRes.data);
        }

        if (enrolmentRes.success) {
            setDatatable((prev) => ({ ...prev, rows: buildRows(enrolmentRes.data) }));
        }
        setIsLoading(false);
    };

    const onEdit = (e) => {
        setFormState({ ...formState, [e.target.id]: e.target.value });
    };

    const onSelectChange = (id, value) => {
        if (id === "StudentID") {
            const student = students.find(s => s.StudentID === value);
            if (student) {
                setFormState(prev => ({
                    ...prev,
                    StudentID: value,
                    FullName: student.Name,
                    EmailAddress: student.EmailAddress
                }));
            } else {
                setFormState(prev => ({ ...prev, [id]: value }));
            }
        } else {
            setFormState(prev => ({ ...prev, [id]: value }));
        }
    };

    const onSubmit = async () => {
        if (!formState.StudentID || !formState.FullName || !formState.ScholarshipID || !formState.Semester) {
            showAlert("EMPTY FIELDS", "Please fill all required fields", "warning");
            return;
        }

        setIsFormLoading("on");
        if (formState.EntryID === "") {
            const { success, data } = await api.post("staff/ac-finance/scholarship/student/add", formState);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Student Enrolled Successfully");
                    getData();
                    document.getElementById("closeModal").click();
                } else if (data?.message === "exist") {
                    showAlert("EXISTS", "This student is already enrolled for this scholarship and semester!", "error");
                }
            }
        } else {
            const { success, data } = await api.patch("staff/ac-finance/scholarship/student/update", formState);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Enrolment Updated Successfully");
                    getData();
                    document.getElementById("closeModal").click();
                }
            }
        }
        setIsFormLoading("off");
    };

    const handleDelete = async (id) => {
        const { success } = await api.delete(`staff/ac-finance/scholarship/student/delete/${id}`);
        if (success) {
            toast.success("Deleted Successfully");
            getData();
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Student Scholarship Enrolment"} items={["Finance", "Scholarships", "Student Enrolment"]}
                buttons={<><button type="button" className="btn btn-primary shadow-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setFormState(initialData)}>Enrol Student</button></>} />
            <div className="flex-column-fluid">
                <div className="card card-no-border shadow-sm">
                    <div className="card-body p-5">
                        <DataTable data={datatable} />
                    </div>
                </div>
                <Modal title={"Manage Student Scholarship"} large onClose={() => setFormState(initialData)}>
                    <ScholarshipStudentForm
                        data={formState}
                        scholarships={scholarships}
                        semesters={semesters}
                        students={students}
                        onEdit={onEdit}
                        onSelectChange={onSelectChange}
                        onSubmit={onSubmit}
                        isFormLoading={isFormLoading}
                    />
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({ loginData: state.LoginDetails });
export default connect(mapStateToProps, null)(StudentScholarshipEnrolment);
