import React, { useEffect, useState } from "react";
import PageHeader from "../../common/pageheader/pageheader";
import Table from "../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import Select2 from "react-select2-wrapper";
import "react-select2-wrapper/css/select2.css";

function MissingRegistrationModule(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setisFormLoading] = useState('off')
    const [regModules, setRegModules] = useState([])
    const [datatable, setDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Module Code",
                field: "ModuleCode",
            },
            {
                label: "Module Name",
                field: "ModuleName",
            },
            {
                label: "StudentLevel",
                field: "StudentLevel",
            },
            {
                label: "StudentSemester",
                field: "StudentSemester",
            },
            {
                label: "Status",
                field: "Status",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [studentsList, setStudentsList] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [moduleList, setModuleList] = useState([]);
    const [showForm, setshowForm] = useState(false);

    const [data, setData] = useState({
        StudentID: "",
        SemesterCode: "",
        ModuleCode: "",
        StudentLevel:"",
        StudentSemester:"",
        ModuleStatus:""
    })
    const getData = async () => {
        await axios.get(`${serverLink}staff/registration/missing-reg-module/student-list`, token)
            .then((res) => {
                let rows = [];
                res.data.length > 0 &&
                    res.data.map((row) => {
                        rows.push({ text: row.StudentName+"("+row.StudentID+")", id: row.StudentID });
                    });
                setStudentsList(rows);
            })
            .catch((err) => {
                console.log("NETWORK ERROR FETCHING MODULE LIST");
            });

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

        await axios.get(`${serverLink}staff/registration/missing-reg-module/modules/list`, token)
            .then((res) => {
                let rows = [];
                res.data.length > 0 &&
                    res.data.map((row) => {
                        rows.push({ text: row.ModuleCode + " - " + row.ModuleName, id: row.ModuleCode });
                    });
                setModuleList(rows);
            })
            .catch((err) => {
                console.log("NETWORK ERROR FETCHING MODULE LIST");
            });
        setIsLoading(false)
    }

    const getModules = (student, semester) => {
        axios.post(`${serverLink}staff/registration/missing-reg-module/registered-modules/list`, {
            StudentID: student,
            SemesterCode: semester
        }, token).then((result) => {
            setRegModules(result.data)
            let rows = [];
            if (result.data.length > 0) {
                result.data.map((item, index) => {
                    rows.push({
                        sn: index + 1,
                        ModuleCode: item.ModuleCode,
                        ModuleName: item.ModuleName,
                        StudentLevel: item.StudentLevel + " Level",
                        StudentSemester: item.StudentSemester,
                        Status: item.Status,
                        action: (
                            <button
                                className="btn btn-sm btn-danger"
                                type="submit"
                                onClick={() => {
                                    handleRemove(item.EntryID)
                                }
                                }
                            >
                                Drop
                            </button>
                        ),
                    });

                    setDatatable({
                        ...datatable,
                        columns: datatable.columns,
                        rows: rows,
                    });
                });
            }
        })
    }

    const onEdit = (e) => {
        setData({
            ...data,
            [e.target.id]: e.target.value
        })
        if (e.target.id === "StudentID") {
            setshowForm(true)
            return;
        }
        if (e.target.id === "SemesterCode") {
            axios.post(`${serverLink}staff/registration/missing-reg-module/registered-modules/list`, {
                StudentID: data.StudentID,
                SemesterCode: e.target.value
            }, token).then((result) => {
                setRegModules(result.data)
                let rows = [];
                if (result.data.length > 0) {
                    result.data.map((item, index) => {
                        rows.push({
                            sn: index + 1,
                            ModuleCode: item.ModuleCode,
                            ModuleName: item.ModuleName,
                            StudentLevel: item.StudentLevel + " Level",
                            StudentSemester: item.StudentSemester,
                            Status: item.Status,
                            action: (
                                <button
                                    className="btn btn-sm btn-danger"
                                    type="submit"
                                    onClick={() => {
                                        handleRemove(item.EntryID)
                                    }}
                                >
                                    Drop
                                </button>
                            ),
                        });

                        setDatatable({
                            ...datatable,
                            columns: datatable.columns,
                            rows: rows,
                        });
                    });
                }

            })

            return;
        }
    };

    const handleSubmit = async () => {
        console.log(data)
        if(data.ModuleCode === "" || data.SemesterCode === "" || data.StudentLevel === "" || data.StudentSemester ==="" || data.ModuleStatus ===""){
            toast.error('Please select all fields...')
        }else{
            try {
                toast.info('please wait ...')
                await axios.post(`${serverLink}staff/registration/missing-reg-module/modules/add`, data, token)
                    .then((result) => {
                        if (result.data.message === "success") {
                            toast.success('module registered successfully');
                            getModules(data.StudentID, data.SemesterCode);
                        } else {
                            toast.error('module already registered');
                        }
                    })
            } catch (error) {
                console.log('NETWORK ERROR')
            } 
        }
       
    }

    const handleRemove = async (e) => {
        toast.info('please wait ...')
        try {
            await axios.delete(`${serverLink}staff/registration/missing-reg-module/modules/remove/${e}`, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success('module removed successfully');
                        getModules(data.StudentID, data.SemesterCode);
                    } else {
                        toast.error('please try again...')
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
                <div className="card">
                    <div className="card-body pt-0">
                        <div className="row col-md 12 mt-4">
                            <div className="col-md-4 mt-2 mb-2">
                                <label htmlFor="StudentID">Student</label>
                                <Select2
                                    id="StudentID"
                                    value={data.StudentID}
                                    data={studentsList}
                                    onSelect={onEdit}
                                    options={{
                                        placeholder: "Search student",
                                    }}
                                />
                            </div>
                            {
                                showForm &&
                                <>
                                    <div className="col-md-4 mt-2 mb-2">
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
                                    <div className="col-md-4 mt-2 mb-2">
                                        <label htmlFor="ModuleCode">Module</label>
                                        <Select2
                                            id="ModuleCode"
                                            value={data.ModuleCode}
                                            data={moduleList}
                                            onSelect={onEdit}
                                            options={{
                                                placeholder: "Search Module",
                                            }}
                                        />
                                    </div>

                                    <div className="col-md-4 mt-2 mb-2">
                                        <label htmlFor="StudentLevel">Student Level</label>
                                        <select id="StudentLevel" onChange={onEdit}
                                            value={data.StudentLevel}
                                            className="form-select"
                                            data-kt-select2="true"
                                            data-placeholder="Select option"
                                            data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">
                                            <option value={""}>-select StudentLevel-</option>
                                            <option value={"100"}>100 Level</option>
                                            <option value={"200"}>200 Level</option>
                                            <option value={"300"}>300 Level</option>
                                            <option value={"400"}>400 Level</option>
                                            <option value={"500"}>500 Level</option>
                                            <option value={"600"}>600 Level</option>
                                            <option value={"700"}>700 Level</option>
                                            <option value={"800"}>800 Level</option>
                                        </select>
                                    </div>

                                    <div className="col-md-4 mt-2 mb-2">
                                        <label htmlFor="StudentSemester">Student Semester</label>
                                        <select id="StudentSemester" onChange={onEdit}
                                            value={data.StudentSemester}
                                            className="form-select"
                                            data-kt-select2="true"
                                            data-placeholder="Select option"
                                            data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">
                                            <option value={""}>-select StudentLevel-</option>
                                            <option value={"First"}>First Semester</option>
                                            <option value={"Second"}>Second Semester</option>
                                        </select>
                                    </div>

                                    <div className="col-md-4 mt-2 mb-2">
                                        <label htmlFor="ModuleStatus">Module Status</label>
                                        <select id="ModuleStatus" onChange={onEdit}
                                            value={data.ModuleStatus}
                                            className="form-select"
                                            data-kt-select2="true"
                                            data-placeholder="Select option"
                                            data-dropdown-parent="#kt_menu_624456606a84b" data-allow-clear="true">
                                            <option value={""}>-select ModuleStatus-</option>
                                            <option value={"Fresh"}>Fresh</option>
                                            <option value={"Resit"}>Resit</option>
                                        </select>
                                    </div>
                                    <div className="col-md-12">
                                        <button className="btn btn-primary" type="submit" onClick={handleSubmit}> Add Module</button>
                                    </div>
                                </>
                            }

                        </div>

                        <div className="col-md-12 mt-3 mb-3" style={{ overflowX: 'auto' }}>
                            {
                                regModules.length > 0 &&
                                <Table data={datatable} />
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
        FacultyList: state.FacultyList
    };
};
export default connect(mapStateToProps, null)(MissingRegistrationModule);
