import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { showAlert, showConfirm, showConfirmAndContinue } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux/es/exports";
import Select2 from "react-select2-wrapper";
import "react-select2-wrapper/css/select2.css";
import AGReportTable from "../../common/table/AGReportTable";
import { showContentAlert } from "../../common/sweetalert/sweetalert";

function ProcessRunningModules(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off')
    const [showTable, setshowTable] = useState(false);
    const columns = ["sn", "ModuleCode", "Modulename", "ModuleLevel", "ModuleSemester", "SchoolSemester", "CourseName", "CreditLoad", "Status", "IsApproved"]
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
                    res.data.map((row) => {
                        rows.push({ text: row.SemesterName, id: row.SemesterCode });
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
                    result.data.map((item, index) => {
                        rows.push([
                            index + 1,
                            item.ModuleCode,
                            item.Modulename,
                            item.ModuleLevel + " Level",
                            item.ModuleSemester,
                            item.SchoolSemester,
                            item.CourseName,
                            item.CreditLoad,
                            <span className={item.Status.toString() === "1" ? "badge badge-primary" : item.Status.toString() === "2"? "badge badge-success" : "badge badge-secondary"}>
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
            existingModules.map((item, index) => {
                existing.push(item.ModuleCode)
            });
        }
        let newrecords = [];
        if (moduleList.length > 0) {
            moduleList.map((item, index) => {
                newrecords.push(item.ModuleCode)
            })
        }

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
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Registration"}
                items={["Registration", "Modules", "Missing Modules"]}
            />
            <div className="flex-column-fluid">

                <div className="card card-no-border">
                    <div className="card-header border-0 pt-0">
                        <div className="card-title" />
                        <div className="card-toolbar">
                            <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() => {
                                        showConfirm(
                                            "CONFIRM CLEARING",
                                            `Are you sure you want to clear running modules?, this will clear all modules running for this semester`,
                                            "warning"
                                        ).then(async (IsConfirmed) => {
                                            if (IsConfirmed) {
                                                handleClearRunningModules()
                                            } else {

                                            }
                                        });
                                    }}
                                >
                                    Clear Running Modules
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <div className="row col-md 12 mt-4">
                            <div className="col-md-12 mt-2 mb-2">
                                <label htmlFor="SemesterCode">School Semester</label>
                                <Select2
                                    id="SemesterCode"
                                    value={data.SemesterCode}
                                    data={semesterList}
                                    onSelect={onEdit}
                                    options={{
                                        placeholder: "Search semester",
                                    }}
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

                        <div className="col-md-12 mt-3 mb-3" style={{ overflowX: 'auto' }}>

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
