import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import DataTable from "../../../common/table/DataTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import AdmissionScholarshipForm from "./AdmissionScholarshipForm";
import swal from "sweetalert";

function AdmissionScholarshipEnrolment(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState("off");
    const [scholarships, setScholarships] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Action", field: "action" },
            { label: "Full Name", field: "FullName" },
            { label: "Email", field: "EmailAddress" },
            { label: "Scholarship", field: "ScholarshipName" },
            { label: "Semester", field: "SchoolSemester" },
            { label: "Status", field: "statusBadge" },
        ],
        rows: [],
    });

    const initialData = {
        FullName: "",
        EmailAddress: "",
        ScholarshipID: "",
        SchoolSemester: "",
        IsUsed: "0",
        EntryID: "",
        InsertedBy: props.loginData[0].StaffID,
    };

    const [formState, setFormState] = useState(initialData);

    const buildRows = (data) => {
        return data.map((item, index) => ({
            sn: index + 1,
            FullName: item.FullName,
            EmailAddress: item.EmailAddress,
            ScholarshipName: item.ScholarshipName,
            SchoolSemester: item.SchoolSemester,
            statusBadge: (
                <span className={`badge badge-light-${item.IsUsed === 1 ? "success" : "warning"}`}>
                    {item.IsUsed === 1 ? "Used" : "Not Used"}
                </span>
            ),
            action: (
                <>
                    <button className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }} title="Edit" data-bs-toggle="modal" data-bs-target="#kt_modal_general"
                        onClick={() => setFormState({
                            ...item,
                            ScholarshipID: item.ScholarshipID,
                            IsUsed: item.IsUsed.toString(),
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
        const [enrolmentRes, scholarshipRes, semesterRes] = await Promise.all([
            api.get("staff/ac-finance/scholarship/admission/list"),
            api.get("staff/ac-finance/scholarship/list"),
            api.get("staff/ac-finance/scholarship/semesters")
        ]);

        if (scholarshipRes.success) {
            setScholarships(scholarshipRes.data);
        }

        if (semesterRes.success) {
            setSemesters(semesterRes.data);
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
        setFormState({ ...formState, [id]: value });
    };

    const onSubmit = async () => {
        if (!formState.FullName || !formState.EmailAddress || !formState.ScholarshipID || !formState.SchoolSemester) {
            showAlert("EMPTY FIELDS", "Please fill all required fields", "warning");
            return;
        }

        setIsFormLoading("on");
        if (formState.EntryID === "") {
            const { success, data } = await api.post("staff/ac-finance/scholarship/admission/add", formState);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Enrolment Successful");
                    getData();
                    document.getElementById("closeModal").click();
                } else if (data?.message === "exist") {
                    showAlert("EXISTS", "This email is already enrolled for this semester!", "error");
                }
            }
        } else {
            const { success, data } = await api.patch("staff/ac-finance/scholarship/admission/update", formState);
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
        const { success } = await api.delete(`staff/ac-finance/scholarship/admission/delete/${id}`);
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
            <PageHeader title={"Admission Scholarship Enrolment"} items={["Finance", "Scholarships", "Admission Enrolment"]}
                buttons={<><button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setFormState(initialData)}>Enrol Applicant</button></>} />
            <div className="flex-column-fluid">
                <div className="card card-no-border shadow-sm">
                    <div className="card-body p-5">
                        <DataTable data={datatable} />
                    </div>
                </div>
                <Modal title={"Manage Admission Scholarship"} large onClose={() => setFormState(initialData)}>
                    <AdmissionScholarshipForm
                        data={formState}
                        scholarships={scholarships}
                        semesters={semesters}
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
export default connect(mapStateToProps, null)(AdmissionScholarshipEnrolment);
