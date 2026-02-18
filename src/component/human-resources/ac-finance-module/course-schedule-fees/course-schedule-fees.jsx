import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import DataTable from "../../../common/table/DataTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import CourseScheduleFeeForm from "./CourseScheduleFeeForm";
import swal from "sweetalert";

function CourseScheduleFees(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState("off");
    const [courses, setCourses] = useState([]);
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Course Name", field: "CourseName" },
            { label: "Course Code", field: "CourseCode" },
            { label: "Level", field: "Level" },
            { label: "Semester", field: "Semester" },
            { label: "Type", field: "typeName" },
            { label: "Action", field: "action" },
        ],
        rows: [],
    });

    const initialSchedule = {
        CourseCode: "",
        Level: "",
        Semester: "",
        ScheduleType: "0",
        EntryID: "",
        InsertedBy: props.loginData[0].EntryID,
    };

    const [createSchedule, setCreateSchedule] = useState(initialSchedule);

    const buildRows = (data) => {
        return data.map((item, index) => ({
            sn: index + 1,
            CourseName: item.CourseName ?? "N/A",
            CourseCode: item.CourseCode ?? "N/A",
            Level: item.Level ?? "N/A",
            Semester: item.Semester ?? "N/A",
            typeName: item.ScheduleType === 1 ? "RETURNING" : "NEW",
            action: (
                <>
                    <button className="btn btn-link p-0 text-primary" style={{ marginRight: 15 }} title="Edit" data-bs-toggle="modal" data-bs-target="#kt_modal_general"
                        onClick={() => setCreateSchedule({
                            CourseCode: item.CourseCode,
                            Level: item.Level,
                            Semester: item.Semester,
                            ScheduleType: item.ScheduleType.toString(),
                            EntryID: item.EntryID,
                            UpdatedBy: props.loginData[0].EntryID
                        })}>
                        <i style={{ fontSize: '15px', color: "blue" }} className="fa fa-pen color-blue" />
                    </button>
                    <button className="btn btn-link p-0 text-danger" title="Delete"
                        onClick={() => { swal({ title: "Are you sure?", text: "Once deleted, you will not be able to recover it!", icon: "warning", buttons: true, dangerMode: true }).then((willDelete) => { if (willDelete) { deleteSchedule(item.EntryID); } }); }}>
                        <i style={{ fontSize: '15px', color: "red" }} className="fa fa-trash" />
                    </button>
                </>
            ),
        }));
    };

    const getCourses = async () => {
        const { success, data } = await api.get("staff/academics/course/list");
        if (success) {
            setCourses(data);
        }
    };

    const getSchedules = async () => {
        const { success, data } = await api.get("staff/ac-finance/course-schedules/list");
        if (success && data?.length > 0) {
            setDatatable((prev) => ({ ...prev, rows: buildRows(data) }));
        } else {
            setDatatable((prev) => ({ ...prev, rows: [] }));
        }
    };

    const onEdit = (e) => { setCreateSchedule({ ...createSchedule, [e.target.id]: e.target.value }); };
    const onSelectChange = (id, value) => { setCreateSchedule({ ...createSchedule, [id]: value }); };

    const onSubmit = async () => {
        if (createSchedule.CourseCode === "") { showAlert("EMPTY FIELD", "Please select a course", "error"); return; }
        if (createSchedule.Level === "") { showAlert("EMPTY FIELD", "Please select a level", "error"); return; }
        if (createSchedule.Semester === "") { showAlert("EMPTY FIELD", "Please select a semester", "error"); return; }

        setIsFormLoading("on");
        if (createSchedule.EntryID === "") {
            const { success, data } = await api.post("staff/ac-finance/course-schedules/add", createSchedule);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Schedule Added Successfully");
                    getSchedules();
                    document.getElementById("closeModal").click();
                    setCreateSchedule(initialSchedule);
                }
                else if (data?.message === "exist") { showAlert("SCHEDULE EXISTS", "This schedule already exists!", "error"); }
                else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            }
        } else {
            const { success, data } = await api.patch("staff/ac-finance/course-schedules/update", createSchedule);
            if (success) {
                if (data?.message === "success") {
                    toast.success("Schedule Updated Successfully");
                    getSchedules();
                    document.getElementById("closeModal").click();
                    setCreateSchedule(initialSchedule);
                }
                else { showAlert("ERROR", "Something went wrong. Please try again!", "error"); }
            }
        }
        setIsFormLoading("off");
    };

    async function deleteSchedule(id) {
        const { success, data } = await api.delete(`staff/ac-finance/course-schedules/delete/${id}`);
        if (success) {
            if (data?.message === "success") { toast.success("Deleted Successfully"); getSchedules(); }
            else { toast.error(data?.whatToShow || "Error deleting item"); }
        }
    }

    useEffect(() => {
        const init = async () => {
            await Promise.all([getCourses(), getSchedules()]);
            setIsLoading(false);
        };
        init();
    }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Course Schedule Fees"} items={["Finance", "Course Schedules"]}
                buttons={<><button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setCreateSchedule(initialSchedule)}>Add Schedule</button></>} />
            <div className="flex-column-fluid">
                <div className="card card-no-border"><div className="card-body p-0"><DataTable data={datatable} /></div></div>
                <Modal title={"Manage Course Schedule"}><CourseScheduleFeeForm data={createSchedule} courses={courses} isFormLoading={isFormLoading} onSelectChange={onSelectChange} onSubmit={onSubmit} /></Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails }; };
export default connect(mapStateToProps, null)(CourseScheduleFees);
