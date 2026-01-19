import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { showConfirm } from "../../common/sweetalert/sweetalert";
import SearchSelect from "../../common/select/SearchSelect";
import { toast } from "react-toastify";
import AGReportTable from "../../common/table/AGReportTable";

const ModuleAssignment = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [allModules, setAllModules] = useState([]);
    const [departmentalModules, setDepartmentalModules] = useState([]);
    const [universityModules, setUniversityModules] = useState([]);
    const [selectedModules, setSelectedModules] = useState([]);
    const [activeTab, setActiveTab] = useState("selected");
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const columns = ["Action", "Module Code", "Module Name", "Level", "Semester", "Type", "Sch. Semester", "Approved"];
    const [assignedModulesData, setAssignedModulesData] = useState([]);
    const currentUser = props.loginDetails[0].StaffID;

    const [filter, setFilter] = useState({
        Level: "", ModuleSemester: "", ModuleType: "", SchoolSemester: "",
        CourseCode: "", CourseName: "", Course: null, InsertedBy: currentUser
    });

    const levelOptions = [
        { value: "100", label: "100 Level" }, { value: "200", label: "200 Level" },
        { value: "300", label: "300 Level" }, { value: "400", label: "400 Level" },
        { value: "500", label: "500 Level" }, { value: "600", label: "600 Level" },
        { value: "700", label: "700 Level" }, { value: "800", label: "800 Level" }
    ];
    const semesterOptions = [{ value: "First", label: "First Semester" }, { value: "Second", label: "Second Semester" }];
    const typeOptions = [
        { value: "Lecture", label: "Lecture" }, { value: "Interactive", label: "Interactive" },
        { value: "Class", label: "Class" }, { value: "Workshop", label: "Workshop" },
        { value: "Online", label: "Online" }, { value: "Seminar", label: "Seminar" }, { value: "Core", label: "Core" }
    ];

    const getData = async () => {
        const [courseRes, semRes, modRes] = await Promise.all([
            api.get(`staff/academics/timetable-planner-2/course-list/${currentUser}`),
            api.get("staff/timetable/timetable/semester"),
            api.get("staff/academics/timetable-planner-2/modules")
        ]);
        if (courseRes.success && courseRes.data?.length > 0) {
            setCourses(courseRes.data.map(x => ({ value: x.CourseCode, label: x.CourseName })));
        }
        if (semRes.success) setSemesterList(semRes.data || []);
        if (modRes.success && modRes.data?.length > 0) setAllModules(modRes.data);
        setIsLoading(false);
    };

    // Filter modules based on selected criteria
    const filterModules = () => {
        if (!filter.CourseCode) return;

        // Departmental modules: match course/department
        const deptMods = allModules.filter(m => m.CourseCode === filter.CourseCode);

        // University modules: all other modules from different departments
        const uniMods = allModules.filter(m => m.CourseCode !== filter.CourseCode);

        setDepartmentalModules(deptMods);
        setUniversityModules(uniMods);
    };

    useEffect(() => { filterModules(); }, [filter.CourseCode, allModules]);
    useEffect(() => { getData(); }, []);

    const onFilterChange = (field, value) => {
        setFilter(prev => ({ ...prev, [field]: value }));
    };

    const onCourseChange = (e) => {
        if (!e) return;
        setFilter(prev => ({ ...prev, Course: e, CourseCode: e.value, CourseName: e.label }));
    };

    const openModuleSelector = () => {
        if (!filter.Level || !filter.ModuleSemester || !filter.SchoolSemester || !filter.ModuleType || !filter.CourseCode) {
            toast.warning("Please select Level, Semester, Type, School Semester, and Course first");
            return;
        }
        setShowModal(true);
        setActiveTab("departmental");
    };

    const addToSelected = (module) => {
        if (selectedModules.find(m => m.ModuleCode === module.ModuleCode)) {
            toast.warning("Module already selected");
            return;
        }
        setSelectedModules(prev => [...prev, module]);
        toast.success(`Added: ${module.ModuleCode}`);
    };

    const removeFromSelected = (moduleCode) => {
        setSelectedModules(prev => prev.filter(m => m.ModuleCode !== moduleCode));
    };

    const processModules = async () => {
        if (selectedModules.length === 0) {
            toast.warning("No modules selected");
            return;
        }
        setProcessing(true);

        let successCount = 0;
        let existCount = 0;

        for (const mod of selectedModules) {
            const payload = {
                ...filter,
                ModuleCode: mod.ModuleCode,
                ModuleName: mod.ModuleName,
                CreditUnit: mod.CreditLoad || mod.CreditUnit || 0
            };

            const { success, data } = await api.post("staff/academics/timetable-planner-2/assigned-modules/add", payload);
            if (success) {
                if (data?.message === "success") successCount++;
                else if (data?.message === "exist") existCount++;
            }
        }

        if (successCount > 0) toast.success(`${successCount} module(s) assigned successfully`);
        if (existCount > 0) toast.info(`${existCount} module(s) already assigned`);

        setSelectedModules([]);
        setShowModal(false);
        viewAssigned();
        setProcessing(false);
    };

    const viewAssigned = async () => {
        toast.info("Loading assigned modules...");
        const { success, data } = await api.post("staff/academics/timetable-planner-2/assigned-modules/list", filter);
        if (success && data?.length > 0) {
            const rows = data.map(item => [
                <button className="btn btn-sm btn-danger" onClick={() => removeCourse(item.EntryID)}>
                    <i className="fa fa-trash" />
                </button>,
                item.ModuleCode, item.ModuleName, item.ModuleLevel, item.ModuleSemester,
                item.ModuleType, item.SchoolSemester,
                <span className={`badge ${item.isApproved === 1 ? "bg-success" : "bg-warning"}`}>
                    {item.isApproved === 1 ? "Approved" : "Pending"}
                </span>
            ]);
            setAssignedModulesData(rows);
        } else {
            setAssignedModulesData([]);
            toast.info("No modules assigned yet");
        }
    };

    const removeCourse = async (EntryID) => {
        showConfirm("Warning", "Are you sure you want to remove this module?", "warning").then(async (isConfirmed) => {
            if (isConfirmed) {
                const { success, data } = await api.delete(`staff/academics/timetable-planner-2/assigned-modules/delete/${EntryID}`);
                if (success && data?.message === "success") {
                    viewAssigned();
                    toast.success("Module removed");
                }
            }
        });
    };

    // Filter modules by search term
    const filterBySearch = (modules) => {
        if (!searchTerm) return modules;
        const term = searchTerm.toLowerCase();
        return modules.filter(m =>
            m.ModuleCode?.toLowerCase().includes(term) ||
            m.ModuleName?.toLowerCase().includes(term)
        );
    };

    const isFiltersComplete = filter.Level && filter.ModuleSemester && filter.SchoolSemester && filter.ModuleType && filter.CourseCode;

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title="Module Assignment" items={["Academics", "Timetable Planner", "Module Assignment"]} />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    {/* Row 1: Filters */}
                    <div className="row g-3 p-4">
                        <div className="col-md-3">
                            <SearchSelect id="Level" label="Module Level" required
                                value={levelOptions.find(op => op.value === filter.Level) || null}
                                options={levelOptions}
                                onChange={(sel) => onFilterChange('Level', sel?.value || '')}
                                placeholder="Select Level" />
                        </div>
                        <div className="col-md-3">
                            <SearchSelect id="ModuleSemester" label="Module Semester" required
                                value={semesterOptions.find(op => op.value === filter.ModuleSemester) || null}
                                options={semesterOptions}
                                onChange={(sel) => onFilterChange('ModuleSemester', sel?.value || '')}
                                placeholder="Select Semester" />
                        </div>
                        <div className="col-md-3">
                            <SearchSelect id="ModuleType" label="Module Type" required
                                value={typeOptions.find(op => op.value === filter.ModuleType) || null}
                                options={typeOptions}
                                onChange={(sel) => onFilterChange('ModuleType', sel?.value || '')}
                                placeholder="Select Type" />
                        </div>
                        <div className="col-md-3">
                            <SearchSelect id="SchoolSemester" label="School Semester" required
                                value={semesterList.map(x => ({ value: x.SemesterCode, label: x.SemesterName })).find(op => op.value === filter.SchoolSemester) || null}
                                options={semesterList.map(x => ({ value: x.SemesterCode, label: x.SemesterName }))}
                                onChange={(sel) => onFilterChange('SchoolSemester', sel?.value || '')}
                                placeholder="Select Semester" />
                        </div>
                    </div>

                    {/* Row 2: Course & Actions */}
                    <div className="row g-3 p-4 pt-0">
                        <div className="col-md-4">
                            <SearchSelect id="CourseCode" label="Course" required
                                options={courses} onChange={onCourseChange} value={filter.Course}
                                placeholder="Select Course"
                                isDisabled={!filter.Level || !filter.ModuleSemester} />
                        </div>
                        <div className="col-md-4 d-flex align-items-end gap-2">
                            <button className="btn btn-primary flex-grow-1" onClick={openModuleSelector} disabled={!isFiltersComplete}>
                                <i className="fa fa-plus me-2"></i>Select Modules
                            </button>
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                            <button className="btn btn-dark w-100" onClick={viewAssigned}>
                                <i className="fa fa-list me-2"></i>View Assigned Modules
                            </button>
                        </div>
                    </div>
                </div>

                {/* Assigned Modules Table */}
                {assignedModulesData.length > 0 && (
                    <div className="mt-4">
                        <h5><i className="fa fa-book me-2"></i>{filter.Level} Level {filter.ModuleSemester} - {filter.CourseName}</h5>
                        <AGReportTable columns={columns} data={assignedModulesData} />
                    </div>
                )}
            </div>

            {/* Module Selector Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    <i className="fa fa-th-list me-2"></i>
                                    {filter.CourseName} | {filter.Level} Level | {filter.ModuleSemester} Semester
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-0">
                                {/* Tabs */}
                                <ul className="nav nav-tabs nav-fill">
                                    <li className="nav-item">
                                        <button className={`nav-link ${activeTab === 'selected' ? 'active' : ''}`} onClick={() => setActiveTab('selected')}>
                                            <i className="fa fa-check-circle me-1"></i>Selected
                                            <span className="badge bg-success ms-2">{selectedModules.length}</span>
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link ${activeTab === 'departmental' ? 'active' : ''}`} onClick={() => setActiveTab('departmental')}>
                                            <i className="fa fa-building me-1"></i>Departmental
                                            <span className="badge bg-info ms-2">{departmentalModules.length}</span>
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link ${activeTab === 'university' ? 'active' : ''}`} onClick={() => setActiveTab('university')}>
                                            <i className="fa fa-globe me-1"></i>University-Wide
                                            <span className="badge bg-secondary ms-2">{universityModules.length}</span>
                                        </button>
                                    </li>
                                </ul>

                                {/* Search */}
                                {(activeTab === 'departmental' || activeTab === 'university') && (
                                    <div className="p-3 border-bottom">
                                        <input type="text" className="form-control" placeholder="Search modules..."
                                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    </div>
                                )}

                                {/* Tab Content */}
                                <div className="p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {/* Selected Tab */}
                                    {activeTab === 'selected' && (
                                        selectedModules.length === 0 ? (
                                            <div className="alert alert-info text-center">
                                                <i className="fa fa-info-circle me-2"></i>
                                                No modules selected. Go to Departmental or University-Wide tabs to add modules.
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead className="table-light">
                                                        <tr><th>Module Code</th><th>Module Name</th><th>Credits</th><th>Action</th></tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedModules.map((mod, idx) => (
                                                            <tr key={idx}>
                                                                <td><span className="badge bg-primary">{mod.ModuleCode}</span></td>
                                                                <td>{mod.ModuleName}</td>
                                                                <td>{mod.CreditLoad || mod.CreditUnit || 0}</td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-danger" onClick={() => removeFromSelected(mod.ModuleCode)}>
                                                                        <i className="fa fa-times"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    )}

                                    {/* Departmental Tab */}
                                    {activeTab === 'departmental' && (
                                        filterBySearch(departmentalModules).length === 0 ? (
                                            <div className="alert alert-warning text-center">No departmental modules found for the selected criteria.</div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead className="table-light">
                                                        <tr><th>Module Code</th><th>Module Name</th><th>Credits</th><th>Action</th></tr>
                                                    </thead>
                                                    <tbody>
                                                        {filterBySearch(departmentalModules).map((mod, idx) => {
                                                            const isSelected = selectedModules.find(m => m.ModuleCode === mod.ModuleCode);
                                                            return (
                                                                <tr key={idx} className={isSelected ? 'table-success' : ''}>
                                                                    <td><span className="badge bg-info">{mod.ModuleCode}</span></td>
                                                                    <td>{mod.ModuleName}</td>
                                                                    <td>{mod.CreditLoad || mod.CreditUnit || 0}</td>
                                                                    <td>
                                                                        {isSelected ? (
                                                                            <span className="badge bg-success"><i className="fa fa-check me-1"></i>Selected</span>
                                                                        ) : (
                                                                            <button className="btn btn-sm btn-success" onClick={() => addToSelected(mod)}>
                                                                                <i className="fa fa-plus"></i> Add
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    )}

                                    {/* University-Wide Tab */}
                                    {activeTab === 'university' && (
                                        filterBySearch(universityModules).length === 0 ? (
                                            <div className="alert alert-warning text-center">No university-wide modules found for the selected criteria.</div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead className="table-light">
                                                        <tr><th>Module Code</th><th>Module Name</th><th>Course</th><th>Credits</th><th>Action</th></tr>
                                                    </thead>
                                                    <tbody>
                                                        {filterBySearch(universityModules).map((mod, idx) => {
                                                            const isSelected = selectedModules.find(m => m.ModuleCode === mod.ModuleCode);
                                                            return (
                                                                <tr key={idx} className={isSelected ? 'table-success' : ''}>
                                                                    <td><span className="badge bg-secondary">{mod.ModuleCode}</span></td>
                                                                    <td>{mod.ModuleName}</td>
                                                                    <td><small className="text-muted">{mod.CourseCode}</small></td>
                                                                    <td>{mod.CreditLoad || mod.CreditUnit || 0}</td>
                                                                    <td>
                                                                        {isSelected ? (
                                                                            <span className="badge bg-success"><i className="fa fa-check me-1"></i>Selected</span>
                                                                        ) : (
                                                                            <button className="btn btn-sm btn-success" onClick={() => addToSelected(mod)}>
                                                                                <i className="fa fa-plus"></i> Add
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="d-flex justify-content-between w-100">
                                    <span className="text-muted">
                                        <i className="fa fa-info-circle me-1"></i>
                                        {selectedModules.length} module(s) selected
                                    </span>
                                    <div>
                                        <button className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button className="btn btn-primary" onClick={processModules} disabled={selectedModules.length === 0 || processing}>
                                            {processing ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa fa-cogs me-2"></i>}
                                            Process {selectedModules.length} Module(s)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const mapStateToProps = (state) => ({ loginDetails: state.LoginDetails });
export default connect(mapStateToProps, null)(ModuleAssignment);