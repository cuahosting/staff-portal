import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import SearchSelect from "../../../common/select/SearchSelect";
import AgReportTable from "../../../common/table/AGReportTable";
import CATemplate from "./CA_template.csv"

function ExamCAEntry(props) {
    const token = props.loginData[0].token;
    const [isLoading, setIsLoading] = useState(false);
    const [runningModules, setRunningModules] = useState([]);
    const [caRecord, setCARecord] = useState([]);
    const [students, setStudents] = useState([]);
    const [createFindCARecord, setCreateFindCARecord] = useState({ ModuleCode: "", SettingsID: "" });
    const columns = ["S/N", "Student ID", "Student Name", "Max Score", "CA Score"];
    const [markScore, setMarkScore] = useState({
        StudentID: '',
        SettingsID: '',
        CAScore: 0,
        MarkScore: 0,
        InsertedBy: props.loginData[0].StaffID,
        CAFile: "",
    })

    const getRunningModules = async () => {
        await axios
            .get(`${serverLink}staff/assessments/staff/running/module/list`, token)
            .then((response) => {
                let rows = [];
                response.data.length > 0 &&
                    response.data.forEach((row) => {
                        rows.push({ value: row.ModuleCode, label: `${row.ModuleName} (${row.ModuleCode})` });
                    });
                setRunningModules(rows);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    };

    const findCA = async (e) => {
        setCreateFindCARecord({
            ...createFindCARecord,
            [e.target.id]: e.target.value,
        });

        const selectedCAFields = {
            ModuleCode: e.target.value,
            SemesterCode: props.currentSemester
        }

        if (selectedCAFields.ModuleCode !== '') {
            await axios
                .get(`${serverLink}staff/assessments/ca/${selectedCAFields.ModuleCode}/${selectedCAFields.SemesterCode}`, token)
                .then((response) => {
                    setCARecord(response.data);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.log("NETWORK ERROR");
                });
        }
    };

    const findStudentsRegisteredModules = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        const ca_id = e.target.value;
        const ca_marked = caRecord.filter(i => i.EntryID === parseInt(ca_id))[0]['CAMarked'];

        const sendData = {
            ...createFindCARecord,
            SettingsID: e.target.value,
            CAScore: ca_marked
        }

        setCreateFindCARecord(sendData);

        if (sendData.SettingsID === "" || sendData.ModuleCode === "") {
            await showAlert("EMPTY FIELD", `Please select Module and CA`, "error");
            return false;
        }


        const selectedCAFields = {
            ModuleCode: sendData.ModuleCode,
            SemesterCode: props.currentSemester,
            SettingsID: sendData.SettingsID,
        }
        await axios
            .get(`${serverLink}staff/assessments/registered/modules/${selectedCAFields.ModuleCode}/${selectedCAFields.SemesterCode}/${selectedCAFields.SettingsID}`, token)
            .then((response) => {
                const data = response.data;
                let rows = [];
                if (data.student_list.length > 0) {
                    data.student_list.forEach((item, index) => {
                        let ca_score_field = <input type="number" step={0.01} className="form-control"
                            placeholder="Enter the score and press enter" max={ca_marked}
                            onKeyDown={markCA} onChange={handleMarkScore}
                            student_id={item.StudentID}
                            mark_score={ca_marked}
                            settings_id={selectedCAFields.SettingsID} />;
                        if (data.ca_score.length > 0) {
                            const student_score = data.ca_score.filter(i => i.StudentID === item.StudentID);
                            if (student_score.length > 0) {
                                ca_score_field = <input type="number" step={0.01} className="form-control"
                                    defaultValue={student_score[0].CAScore} max={ca_marked}
                                    placeholder="Enter the score and press enter"
                                    onKeyDown={markCA} onChange={handleMarkScore}
                                    student_id={item.StudentID}
                                    mark_score={ca_marked}
                                    settings_id={selectedCAFields.SettingsID}
                                />
                            }
                        }
                        rows.push([(index + 1), item.StudentID, item.StudentName, ca_marked, ca_score_field])
                    })
                    setStudents(rows)

                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    };

    const handleMarkScore = (e) => {
        markScore.StudentID = e.target.getAttribute('student_id')
        markScore.SettingsID = parseInt(e.target.getAttribute('settings_id'))
        markScore.CAScore = parseFloat(e.target.value)
        markScore.MarkScore = parseFloat(e.target.getAttribute('mark_score'))
    }

    const markCA = async (e) => {
        if (e.key === 'Enter') {

            if (markScore.CAScore > markScore.MarkScore) {
                toast.error("Student score can't be more than the maximum CA score");
                return false
            }

            await axios.post(`${serverLink}staff/assessments/ca/score/entry`, markScore, token)
                .then(res => {
                    const message = res.data.message;
                    if (message === 'added') {
                        toast.success('CA Score added successfully');
                    } else if (message === 'updated') {
                        toast.success('CA Score updated successfully');
                    } else {
                        toast.error('Something went wrong adding CA score. Please try again!');
                    }
                })
                .catch(err => {
                    toast.err("NETWORK ERROR")
                })

        }
    };

    useEffect(() => {
        getRunningModules().then(() => {
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file.type !== "text/csv") {
            toast.error("Only .csv files are allowed")
            setMarkScore({
                ...markScore,
                CAFile: ""
            })
        } else {
            setMarkScore({
                ...markScore,
                CAFile: file
            })
        }
    }

    const onUploadCA = async () => {
        const caSetting = caRecord.filter(x => x.EntryID === parseInt(createFindCARecord.SettingsID))

        if (createFindCARecord.ModuleCode === "") {
            toast.error("please select module")
            return
        }
        if (createFindCARecord.SettingsID === "") {
            toast.error("please select ca settings")
            return false
        }
        if (markScore.CAFile === "") {
            toast.error("please upload ca file")
            return
        }
        if (caSetting.length === 0) {
            toast.error("please select ca settings")
            return false
        }

        try {
            const fdt = new FormData();
            fdt.append("SettingsID", createFindCARecord.SettingsID)
            fdt.append("ModuleCode", createFindCARecord.ModuleCode)
            fdt.append("CAFile", markScore.CAFile)
            fdt.append("InsertedBy", markScore.InsertedBy)
            fdt.append("CAMarked", caSetting[0]?.CAMarked)
            await axios.post(`${serverLink}staff/assessments/ca/score/bulk-entry`, fdt, token)
                .then(res => {
                    const message = res.data.message;
                    if (message === 'success') {
                        findStudentsRegisteredModules({ target: { value: createFindCARecord.SettingsID } })
                        toast.success('CA Score added successfully');
                        showAlert(
                            'Success',
                            `CA Uploaded successfully, 
                            ${res.data.unregistered_students.length > 0 ?
                                `However the following students did not registered for this course \n ${res.data.unregistered_students.join("\n")}.` : ''} \n
                            ${res.data.over_scored.length > 0 ?
                                `The following students has scores more than maximum score \n ${res.data.over_scored.join("\n")}.` : ''} 
                                `,
                            `success`
                        )
                    } else if (message === "no reg students") {
                        toast.error("no students from the list you uploaded registered for this module")
                    } else {
                        toast.error('Something went wrong adding CA score. Please try again!');
                    }
                })
                .catch(err => {
                    toast.err("NETWORK ERROR")
                })

        } catch (e) {
            toast.error("NETWROK ERROR")
        } finally {
            setMarkScore({
                ...markScore,
                CAFile: ""
            })
        }
    }

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Exam Mark Assessment"}
                items={["Assessment", "Assessment", "Exam Mark Assessment"]}
            />
            <div className="row">
                <div className="row pt-5">
                    <div className="col-lg-6 col-md-4 pt-5">
                        <SearchSelect
                            id="ModuleCode"
                            label="Select Module"
                            value={runningModules.find(m => m.value === createFindCARecord.ModuleCode) || null}
                            options={runningModules}
                            onChange={(selected) => {
                                findCA({ target: { id: 'ModuleCode', value: selected?.value || '' } });
                            }}
                            placeholder="Search Module"
                        />
                    </div>

                    <div className="col-lg-6 col-md-4 pt-5">
                        <SearchSelect
                            id="SettingsID"
                            label="Select CA"
                            value={caRecord.length > 0 ? caRecord.filter(c => c.EntryID === parseInt(createFindCARecord.SettingsID)).map(c => ({ value: c.EntryID.toString(), label: c.CAName }))[0] : null}
                            options={caRecord.map(item => ({ value: item.EntryID.toString(), label: item.CAName }))}
                            onChange={(selected) => {
                                findStudentsRegisteredModules({ target: { value: selected?.value || '' }, preventDefault: () => { } });
                            }}
                            placeholder="Select CA"
                        />
                    </div>
                    <div className="col-lg-6 col-md-4 pt-5">
                        <label htmlFor="ModuleCode">Upload File (<small><a className="text-primary italic" target="_blank" rel="noopener noreferrer" href={CATemplate}>Click to donwload template</a></small>)</label>
                        <input className="form-control" type="file" id="CAFile" onChange={onFileChange} />
                    </div>
                    <div className="col-lg-6 col-md-4 pt-5">
                        <button type="button" className="btn btn-md btn-primary mt-5 w-50" onClick={onUploadCA}>Upload</button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <Loader />
            ) : (
                <div className="table-responsive pt-10">
                    <AgReportTable columns={columns} data={students} />
                </div>

            )}
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
        currentSemester: state.currentSemester,
    };
};

export default connect(mapStateToProps, null)(ExamCAEntry);
