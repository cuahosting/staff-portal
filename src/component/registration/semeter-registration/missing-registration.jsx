import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
import SearchSelect from "../../common/select/SearchSelect";

function MissingRegistrationModule(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [regModules, setRegModules] = useState([]);
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Module Code", field: "ModuleCode" },
            { label: "Module Name", field: "ModuleName" },
            { label: "StudentLevel", field: "StudentLevel" },
            { label: "StudentSemester", field: "StudentSemester" },
            { label: "Status", field: "Status" },
            { label: "Action", field: "action" },
        ],
        rows: [],
    });
    const [studentsList, setStudentsList] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [moduleList, setModuleList] = useState([]);
    const [showForm, setshowForm] = useState(false);
    const [data, setData] = useState({ StudentID: "", SemesterCode: "", ModuleCode: "", StudentLevel: "", StudentSemester: "", ModuleStatus: "" });

    const getData = async () => {
        const [studentsRes, semesterRes, moduleRes] = await Promise.all([
            api.get("staff/registration/missing-reg-module/student-list"),
            api.get("staff/registration/missing-reg-module/semester/list"),
            api.get("staff/registration/missing-reg-module/modules/list")
        ]);

        if (studentsRes.success && studentsRes.data?.length > 0) {
            setStudentsList(studentsRes.data.map(row => ({ label: row.StudentName + "(" + row.StudentID + ")", value: row.StudentID })));
        }
        if (semesterRes.success && semesterRes.data?.length > 0) {
            setSemesterList(semesterRes.data.map(row => ({ label: row.SemesterName, value: row.SemesterCode })));
        }
        if (moduleRes.success && moduleRes.data?.length > 0) {
            setModuleList(moduleRes.data.map(row => ({ label: row.ModuleCode + " - " + row.ModuleName, value: row.ModuleCode })));
        }
        setIsLoading(false);
    };

    const getModules = async (student, semester) => {
        const { success, data: result } = await api.post("staff/registration/missing-reg-module/registered-modules/list", { StudentID: student, SemesterCode: semester });
        if (success && result) {
            setRegModules(result);
            if (result.length > 0) {
                const rows = result.map((item, index) => ({
                    sn: index + 1,
                    ModuleCode: item.ModuleCode,
                    ModuleName: item.ModuleName,
                    StudentLevel: item.StudentLevel + " Level",
                    StudentSemester: item.StudentSemester,
                    Status: item.Status,
                    action: (<button className="btn btn-sm btn-danger" type="submit" onClick={() => handleRemove(item.EntryID)}>Drop</button>),
                }));
                setDatatable({ ...datatable, columns: datatable.columns, rows: rows });
            }
        }
    };

    const onEdit = async (e) => {
        setData({ ...data, [e.target.id]: e.target.value });
        if (e.target.id === "StudentID") {
            setshowForm(true);
            return;
        }
        if (e.target.id === "SemesterCode") {
            getModules(data.StudentID, e.target.value);
            return;
        }
    };

    const handleSubmit = async () => {
        if (data.ModuleCode === "" || data.SemesterCode === "" || data.StudentLevel === "" || data.StudentSemester === "" || data.ModuleStatus === "") {
            toast.error('Please select all fields...');
        } else {
            toast.info('please wait ...');
            const { success, data: result } = await api.post("staff/registration/missing-reg-module/modules/add", data);
            if (success && result?.message === "success") {
                toast.success('module registered successfully');
                getModules(data.StudentID, data.SemesterCode);
            } else if (success) {
                toast.error('module already registered');
            }
        }
    };

    const handleRemove = async (e) => {
        toast.info('please wait ...');
        const { success, data: result } = await api.delete(`staff/registration/missing-reg-module/modules/remove/${e}`);
        if (success && result?.message === "success") {
            toast.success('module removed successfully');
            getModules(data.StudentID, data.SemesterCode);
        } else if (success) {
            toast.error('please try again...');
        }
    };

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Registration"} items={["Registration", "Modules", "Missing Modules"]} />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body p-0">
                        <div className="row col-md 12 mt-4">
                            <div className="col-md-4 mt-2 mb-2">
                                <SearchSelect id="StudentID" label="Student" value={studentsList.find(s => s.value === data.StudentID) || null} options={studentsList} onChange={(selected) => { onEdit({ target: { id: 'StudentID', value: selected?.value || '' } }); }} placeholder="Search student" />
                            </div>
                            {showForm && (
                                <>
                                    <div className="col-md-4 mt-2 mb-2">
                                        <SearchSelect id="SemesterCode" label="School Semester" value={semesterList.find(s => s.value === data.SemesterCode) || null} options={semesterList} onChange={(selected) => { onEdit({ target: { id: 'SemesterCode', value: selected?.value || '' } }); }} placeholder="Search semester" />
                                    </div>
                                    <div className="col-md-4 mt-2 mb-2">
                                        <SearchSelect id="ModuleCode" label="Module" value={moduleList.find(m => m.value === data.ModuleCode) || null} options={moduleList} onChange={(selected) => { onEdit({ target: { id: 'ModuleCode', value: selected?.value || '' } }); }} placeholder="Search Module" />
                                    </div>
                                    <div className="col-md-4 mt-2 mb-2">
                                        <SearchSelect id="StudentLevel" label="Student Level" value={data.StudentLevel ? { value: data.StudentLevel, label: data.StudentLevel + " Level" } : null} options={[{ value: "100", label: "100 Level" }, { value: "200", label: "200 Level" }, { value: "300", label: "300 Level" }, { value: "400", label: "400 Level" }, { value: "500", label: "500 Level" }, { value: "600", label: "600 Level" }, { value: "700", label: "700 Level" }, { value: "800", label: "800 Level" }]} onChange={(selected) => onEdit({ target: { id: 'StudentLevel', value: selected?.value || '' } })} placeholder="Select StudentLevel" />
                                    </div>
                                    <div className="col-md-4 mt-2 mb-2">
                                        <SearchSelect id="StudentSemester" label="Student Semester" value={data.StudentSemester ? { value: data.StudentSemester, label: data.StudentSemester + " Semester" } : null} options={[{ value: "First", label: "First Semester" }, { value: "Second", label: "Second Semester" }]} onChange={(selected) => onEdit({ target: { id: 'StudentSemester', value: selected?.value || '' } })} placeholder="Select StudentSemester" />
                                    </div>
                                    <div className="col-md-4 mt-2 mb-2">
                                        <SearchSelect id="ModuleStatus" label="Module Status" value={data.ModuleStatus ? { value: data.ModuleStatus, label: data.ModuleStatus } : null} options={[{ value: "Fresh", label: "Fresh" }, { value: "Resit", label: "Resit" }]} onChange={(selected) => onEdit({ target: { id: 'ModuleStatus', value: selected?.value || '' } })} placeholder="Select ModuleStatus" />
                                    </div>
                                    <div className="col-md-12">
                                        <button className="btn btn-primary" type="submit" onClick={handleSubmit}> Add Module</button>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="col-md-12 mt-3 mb-3" style={{ overflowX: 'auto' }}>
                            {regModules.length > 0 && <AGTable data={datatable} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return { LoginDetails: state.LoginDetails, FacultyList: state.FacultyList };
};

export default connect(mapStateToProps, null)(MissingRegistrationModule);
