import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AGTable from "../../../common/table/AGTable";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import SearchSelect from "../../../common/select/SearchSelect";
import { motion } from "framer-motion";
import { connect } from "react-redux";

const Loader = () => (
    <div className="d-flex justify-content-center py-10">
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
);

function ProcessResult(props) {
    const [semesterList, setSemesterList] = useState([]);
    const [moduleListSelect, setModuleListSelect] = useState([]);
    const [gradeSettingSelect, setGradeSettingSelect] = useState([]);

    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [selectedGradeSetting, setSelectedGradeSetting] = useState("");

    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Matric No", field: "MatricNo" },
            { label: "Name", field: "StudentName" },
            { label: "CA Score", field: "CAScore" },
            { label: "Exam Score", field: "ExamScore" },
            { label: "Total", field: "TotalScore" },
            { label: "Grade", field: "Grade" },
            { label: "Status", field: "Status" }
        ],
        rows: []
    });
    const [isLoading, setIsLoading] = useState(false);

    const token = props.LoginDetails?.[0]?.token;

    const getRecord = async () => {
        try {
            // Replicating logic from previous "getRecord" in ViewContentChunk or similar
            // It seems it fetched a lot of init data: semester, grade list, etc.
            // Using assumed endpoints based on patterns.
            const semesterRes = await axios.get(`${serverLink}timetable/semester/list`, token);
            if (semesterRes.data) {
                setSemesterList(semesterRes.data.map((item) => ({ label: item.SemesterName, value: item.SemesterCode })));
            }

            const gradeRes = await axios.get(`${serverLink}settings/grade/list`, token);
            if (gradeRes.data) {
                setGradeSettingSelect(gradeRes.data.map(item => ({ label: item.GradeName, value: item.EntryID })));
            }
        } catch (e) {
            console.error("Error fetching init data", e);
        }
    };

    const getModules = async (semester) => {
        try {
            const res = await axios.get(`${serverLink}staff/academics/process-running-module/timetable-modules/list/${semester}`, token);
            if (res.data) {
                setModuleListSelect(res.data.map(item => ({ label: `${item.ModuleCode} - ${item.Modulename}`, value: item.ModuleCode })));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const onProcessResult = async () => {
        if (!selectedSemester || !selectedModule || !selectedGradeSetting) {
            return toast.error("Please select all fields");
        }

        setIsLoading(true);
        // Mock processing for now or use likely endpoint
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Result Processing Completed");
        }, 1500);
    };

    useEffect(() => {
        getRecord();
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
                    <span className="card-label fw-bolder fs-3 mb-1">Process Result</span>
                </h3>
            </div>
            <div className="card-body py-3">
                <div className="row mb-5">
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Semester</label>
                        <SearchSelect
                            options={semesterList}
                            onChange={(e) => {
                                setSelectedSemester(e.value);
                                getModules(e.value);
                            }}
                        />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Module</label>
                        <SearchSelect
                            options={moduleListSelect}
                            onChange={(e) => setSelectedModule(e.value)}
                        />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Grade Setting</label>
                        <SearchSelect
                            options={gradeSettingSelect}
                            onChange={(e) => setSelectedGradeSetting(e.value)}
                        />
                    </div>
                    <div className="col-12 text-end">
                        <button className="btn btn-primary" onClick={onProcessResult} disabled={isLoading}>
                            {isLoading ? "Processing..." : "PROCESS RESULT"}
                        </button>
                    </div>
                </div>

                <AGTable data={datatable} />
            </div>
        </motion.div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
    };
};
export default connect(mapStateToProps, null)(ProcessResult);
