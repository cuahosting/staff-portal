import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
// eslint-disable-next-line no-unused-vars
import { showAlert, showConfirm, showConfirmAndContinue } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
import SearchSelect from "../../common/select/SearchSelect";
import AGReportTable from "../../common/table/AGReportTable";
// eslint-disable-next-line no-unused-vars
import { showContentAlert } from "../../common/sweetalert/sweetalert";

function ProcessRunningModules(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off')
    const [showTable, setshowTable] = useState(false);
    const columns = ["Code", "Name", "Level", "Semester", "School Semester", "Course", "Credit Load", "Status", "Is Approved"]
    const [t_data, set_T_Data] = useState([])
    const [semesterList, setSemesterList] = useState([]);
    const [moduleList, setModuleList] = useState([]);
    const [existingModules, setExistingModules] = useState([]);

    const [data, setData] = useState({
        StudentID: "",
        SemesterCode: "",
        ModuleCode: "",
    })
    const getData = async () => {
        await axios.get(`${serverLink}staff/registration/missing-reg-module/semester/list`, token)
            .then((res) => {
                let rows = [];
                res.data.length > 0 &&
                    res.data.forEach((row) => {
                        rows.push({ label: row.SemesterName, value: row.SemesterCode });
                    });
                setSemesterList(rows);
            })
            .catch((err) => {
                console.log("NETWORK ERROR FETCHING MODULE LIST");
            });
        setIsLoading(false)
    }

    const getTimetableModules = (semester) => {
        axios.get(`${serverLink}staff/academics/process-running-module/running-modules/list/${semester}`, token)
            .then((result) => {
                setExistingModules(result.data)
            })
        axios.get(`${serverLink}staff/academics/process-running-module/timetable-modules/list/${semester}`, token)
            .then((result) => {
                setModuleList(result.data)
                setIsLoading(false)
                let rows = [];
                if (result.data.length > 0) {
                    result.data.forEach((item, index) => {
                        rows.push([
                            item.ModuleCode,
                            item.Modulename,
                            item.ModuleLevel + " Level",
                            item.ModuleSemester,
                            item.SchoolSemester,
                            item.CourseName,
                            item.CreditLoad,
                            <span className={item.Status.toString() === "1" ? "badge badge-primary" : item.Status.toString() === "2" ? "badge badge-success" : "badge badge-secondary"}>
                                {item.Status.toString() === "1" ? "Submitted by HOD" : item.Status.toString() === "2" ? "Approved by Dean" : "Not submitted"}
                            </span>,
                            <span className={item.IsApproved.toString() === "1" ? "badge badge-success" : "badge badge-danger"}>
                                {item.IsApproved.toString() === "1" ? "Approved" : "Not Approved"}
                            </span>
                        ]);

                    });
                    set_T_Data(rows)
                    setshowTable(true)
                }
                else {
                    set_T_Data(rows)
                }
            })
    }

    const handleProcessRunningModules = async () => {
        setisFormLoading('on')
        let existing = [];
        if (existingModules.length > 0) {
            existingModules.forEach((item) => {
                existing.push(item.ModuleCode)
            });
        }
        let newrecords = [];
        if (moduleList.length > 0) {
            moduleList.forEach((item) => {
                newrecords.push(item.ModuleCode)
            })
        }

        // eslint-disable-next-line no-unused-vars
        let send_to_db = [];
        let pop_display = [];
        if (newrecords.some(item => existing.includes(item))) {
            let not_exist = newrecords.filter((el) => !existing.includes(el));
            send_to_db = not_exist;

            let exist_ = newrecords.filter((el) => existing.includes(el))
            pop_display = exist_;
        } else {
            // console.log('none')
        }

        const sendData = {
            moduleList: moduleList,
            InsertedBy: props.LoginDetails[0].StaffID,
            exists_: pop_display,
        }

        await axios.post(`${serverLink}staff/academics/process-running-module/add`, sendData, token)
            .then((result) => {
                getTimetableModules(data.SemesterCode);
                if (result.data.message === "success") {
                    showAlert("MODULE UPLOADED", `Modules added successfully! \n   ${result.data.duplicate.length > 0 ? ` However, the following modules exist in the database: ${pop_display.join(", ")}` : ""} `, "success");
                    setisFormLoading('off')

                } else if (result.data.message === "empty") {
                    toast.error('All modules already processed')
                    setisFormLoading('off')
                }
            })

    }

    const onEdit = (e) => {
        setData({
            ...data,
            [e.target.id]: e.target.value
        })
        if (e.target.id === "SemesterCode") {
            getTimetableModules(e.target.value)
            return;
        }
    };

    const handleClearRunningModules = async () => {
        toast.info('please wait ...')
        try {
            await axios.post(`${serverLink}staff/academics/process-running-module/running-modules/clear`, token, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        setExistingModules([]);
                        toast.success('running modules cleared successfully');
                    } else {
                        toast.error('error clearing, try again!');
                    }
                })
        } catch (error) {
            console.log('NETWORK ERROR')
        }
    }

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Registration"}
                items={["Registration", "Modules", "Missing Modules"]}
                buttons={
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => {
                            showConfirm(
                                "CONFIRM CLEARING",
                                `Are you sure you want to clear running modules?, this will clear all modules running for this semester`,
                                "warning"
                            ).then(async (IsConfirmed) => {
                                if (IsConfirmed) {
                                    handleClearRunningModules()
                                }
                            });
                        }}
                    >
                        Clear Running Modules
                    </button>
                }
            />
            <div className="flex-column-fluid">

                <div className="card card-no-border">
                    <div className="card-body p-0">
                        <div className="row col-md 12 mt-4">
                            <div className="col-md-12 mt-2 mb-2">
                                <SearchSelect
                                    id="SemesterCode"
                                    label="School Semester"
                                    value={semesterList.find(op => op.value === data.SemesterCode) || null}
                                    options={semesterList}
                                    onChange={(selected) => onEdit({ target: { id: 'SemesterCode', value: selected?.value || '' }, preventDefault: () => { } })}
                                    placeholder="Search semester"
                                />
                            </div>
                        </div>
                        <div className="col-md-12 mt-3 mb-3" style={{ overflowX: 'auto' }}>
                            {
                                showTable === true &&
                                // <Table data={datatable} />
                                <>
                                    <AGReportTable columns={columns} data={t_data} title={"Approved Timetable Modules"} />
                                    <button disabled={data.SemesterCode === "" ? true : false} onClick={handleProcessRunningModules} className="btn btn-primary w-100" id="kt_modal_new_address_submit" data-kt-indicator={isFormLoading} >
                                        <span className="indicator-label">Process Running Modules</span>
                                        <span className="indicator-progress">Please wait...
                                            <span className="spinner-border spinner-border-sm align-middle ms-2" />
                                        </span>
                                    </button>
                                </>

                            }
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
    };
};
export default connect(mapStateToProps, null)(ProcessRunningModules);
