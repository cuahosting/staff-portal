import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AGReportTable from "../../common/table/AGReportTable";
import { api } from "../../../resources/api";
import SearchSelect from "../../common/select/SearchSelect";
import { motion } from "framer-motion";
import { connect } from "react-redux";

const Loader = () => (
    <div className="d-flex justify-content-center py-10">
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
);

function ProcessRunningModules(props) {
    const [semesterList, setSemesterList] = useState([]);
    const [t_data, setT_data] = useState([]);
    const [columns] = useState(["Code", "Name", "Level", "Semester", "School Semester", "Course", "Credit Load", "Status", "Is Approved"]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState("");
    const staffID = props.LoginDetails?.[0]?.StaffID;

    const getSemester = async () => {
        const { success, data } = await api.get("staff/registration/missing-reg-module/semester/list");
        if (success && data) { setSemesterList(data.map((item) => ({ label: item.SemesterName, value: item.SemesterCode }))); }
    };

    const getTimetableModules = async (semester) => {
        setIsLoading(true);
        const { success, data } = await api.get(`staff/academics/process-running-module/timetable-modules/list/${semester}`);
        setIsLoading(false);
        if (success && data) {
            setT_data(data.map((item) => [item.ModuleCode, item.Modulename, item.ModuleLevel, item.ModuleSemester, item.SchoolSemester, item.CourseCode, item.CreditLoad, item.Status === "2" ? "Approved" : "Pending", item.IsApproved === "1" ? "Yes" : "No"]));
        }
    };

    const onProcessModules = async () => {
        if (!selectedSemester) return toast.error("Please select a semester");
        setIsLoading(true);
        const { success: tSuccess, data: tData } = await api.get(`staff/academics/process-running-module/timetable-modules/list/${selectedSemester}`);
        if (tSuccess && tData) {
            const { success: pSuccess, data: pData } = await api.get(`staff/academics/process-running-module/running-modules/list/${selectedSemester}`);
            const processedCodes = pSuccess && pData ? pData.map(p => p.ModuleCode) : [];
            const { success, data } = await api.post("staff/academics/process-running-module/add", { moduleList: tData, exists_: processedCodes, InsertedBy: staffID });
            if (success && data?.message === "success") { toast.success("Modules processed successfully"); } else { toast.error("Failed to process modules"); }
        }
        setIsLoading(false);
    };

    const clearProcessedModules = async () => {
        if (window.confirm("Are you sure you want to clear processed modules? This action cannot be undone.")) {
            setIsLoading(true);
            const { success, data } = await api.post("staff/academics/process-running-module/running-modules/clear", {});
            if (success && data?.message === "success") { toast.success("Cleared successfully"); }
            setIsLoading(false);
        }
    };

    useEffect(() => { getSemester(); }, []);

    return (
        <div className="container-fluid px-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card card-xxl-stretch mb-5 mb-xl-8">
                <div className="card-header border-0 pt-5"><h3 className="card-title align-items-start flex-column"><span className="card-label fw-bolder fs-3 mb-1">Process Running Modules</span><span className="text-muted mt-1 fw-bold fs-7">Manage and process modules for the semester</span></h3></div>
                <div className="card-body py-3">
                    <div className="row mb-5"><div className="col-md-4"><label className="form-label">Select Semester</label><SearchSelect options={semesterList} onChange={(e) => { setSelectedSemester(e.value); getTimetableModules(e.value); }} placeholder="Select Semester" /></div><div className="col-md-8 d-flex align-items-end justify-content-end gap-2"><button className="btn btn-primary" onClick={onProcessModules} disabled={isLoading}>{isLoading ? "Processing..." : "Process Modules"}</button><button className="btn btn-danger" onClick={clearProcessedModules} disabled={isLoading}>Clear Processed</button></div></div>
                    {isLoading ? (<Loader />) : (<AGReportTable columns={columns} data={t_data} title={`Timetable Modules - ${selectedSemester}`} />)}
                </div>
            </motion.div>
        </div>
    );
}

const mapStateToProps = (state) => { return { LoginDetails: state.LoginDetails }; };
export default connect(mapStateToProps, null)(ProcessRunningModules);
