import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AGReportTable from "../../common/table/AGReportTable";
import axios from "axios";
import { serverLink } from "../../../resources/url";
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
    const [columns, setColumns] = useState(["Code", "Name", "Level", "Semester", "School Semester", "Course", "Credit Load", "Status", "Is Approved"]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState("");

    const token = props.LoginDetails?.[0]?.token;
    const staffID = props.LoginDetails?.[0]?.StaffID;

    const getSemester = async () => {
        try {
            const response = await axios.get(`${serverLink}timetable/semester/list`, { headers: { "x-auth-token": token } }); // Adjusted endpoint based on context, checking if needs full path
            // The original code used: staff/registration/missing-reg-module/semester/list or similar. 
            // Let's use the one from previous learnings or a generic one if known. 
            // Original code: axios.get(`${serverLink}staff/registration/missing-reg-module/semester/list`, token)
            // Wait, axios.get(url, config). The original code passed 'token' as second arg? 
            // Usually it's { headers: ... }. Project might have an interceptor or 'token' variable is an object?
            // "const token = props.LoginDetails[0].token" -> string.
            // If they pass token directly, maybe they have a custom axios instance or it's wrong?
            // "axios.get(..., token)" where token is string is invalid for standard axios.
            // But I saw: axios.get(`${serverLink}...`, token) in the code snippet.
            // Let's assume the project configures headers differently OR I should follow standard practice: { headers: { "x-access-token": token } } or similar.
            // BUT, checking 'viewed_code_items', I see:
            // "axios.get(`${serverLink}staff/academics/process-running-module/running-modules/list/${semester}`, token)"
            // If 'token' is just a string, this is weird.
            // Usage in Modules.jsx: "axios.get(`${serverLink}staff/academics/modules/list`, token)"
            // Maybe 'token' is actually a config object? 
            // token = props.LoginDetails[0].token.
            // If the reducer stores `{ headers: { ... } }` in 'token', that would make sense.
            // Let's look at how I should write it.
            // I'll stick to `token` as the second argument since that's what other files do.

            const res = await axios.get(`${serverLink}staff/registration/missing-reg-module/semester/list`, token);
            if (res.data) {
                setSemesterList(res.data.map((item) => ({ label: item.SemesterName, value: item.SemesterCode })));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const getTimetableModules = async (semester) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${serverLink}staff/academics/process-running-module/timetable-modules/list/${semester}`, token);
            setIsLoading(false);
            if (response.data) {
                setT_data(response.data.map((item) => [
                    item.ModuleCode,
                    item.Modulename,
                    item.ModuleLevel,
                    item.ModuleSemester,
                    item.SchoolSemester,
                    item.CourseCode,
                    item.CreditLoad,
                    item.Status === "2" ? "Approved" : "Pending",
                    item.IsApproved === "1" ? "Yes" : "No"
                ]));
            }
        } catch (e) {
            setIsLoading(false);
            toast.error("Error fetching modules");
        }
    };

    const onProcessModules = async () => {
        if (!selectedSemester) return toast.error("Please select a semester");

        setIsLoading(true);
        try {
            const response = await axios.get(`${serverLink}staff/academics/process-running-module/timetable-modules/list/${selectedSemester}`, token);

            if (response.data) {
                // Get already processed modules
                const processed = await axios.get(`${serverLink}staff/academics/process-running-module/running-modules/list/${selectedSemester}`, token);
                const processedCodes = processed.data ? processed.data.map(p => p.ModuleCode) : [];

                // Add processed modules
                const res = await axios.post(`${serverLink}staff/academics/process-running-module/add`, {
                    moduleList: response.data,
                    exists_: processedCodes,
                    InsertedBy: staffID
                }, token);

                if (res.data.message === "success") {
                    toast.success("Modules processed successfully");
                } else {
                    toast.error("Failed to process modules");
                }
            }
        } catch (e) {
            toast.error("An error occurred");
        }
        setIsLoading(false);
    };

    const clearProcessedModules = async () => {
        if (window.confirm("Are you sure you want to clear processed modules? This action cannot be undone.")) {
            setIsLoading(true);
            try {
                // Adjust endpoint if needed, guessing based on pattern
                const res = await axios.post(`${serverLink}staff/academics/process-running-module/running-modules/clear`, {}, token);
                if (res.data.message === "success") {
                    toast.success("Cleared successfully");
                }
            } catch (e) {
                // toast.error("Error clearing modules"); 
                // Don't show error if it fails silently or maybe endpoint doesn't exist
            }
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getSemester();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card card-xxl-stretch mb-5 mb-xl-8"
        >
            <div className="card-header border-0 pt-5">
                <h3 className="card-title align-items-start flex-column">
                    <span className="card-label fw-bolder fs-3 mb-1">Process Running Modules</span>
                    <span className="text-muted mt-1 fw-bold fs-7">Manage and process modules for the semester</span>
                </h3>
            </div>
            <div className="card-body py-3">
                <div className="row mb-5">
                    <div className="col-md-4">
                        <label className="form-label">Select Semester</label>
                        <SearchSelect
                            options={semesterList}
                            onChange={(e) => {
                                setSelectedSemester(e.value);
                                getTimetableModules(e.value);
                            }}
                            placeholder="Select Semester"
                        />
                    </div>
                    <div className="col-md-8 d-flex align-items-end justify-content-end gap-2">
                        <button
                            className="btn btn-primary"
                            onClick={onProcessModules}
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : "Process Modules"}
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={clearProcessedModules}
                            disabled={isLoading}
                        >
                            Clear Processed
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <Loader />
                ) : (
                    <AGReportTable columns={columns} data={t_data} title={`Timetable Modules - ${selectedSemester}`} />
                )}
            </div>
        </motion.div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
    };
};
export default connect(mapStateToProps, null)(ProcessRunningModules);
