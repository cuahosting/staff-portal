import React, {useEffect, useState} from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import {serverLink} from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import {connect} from "react-redux";
import Select2 from "react-select2-wrapper";
import ReportTable from "../../../common/table/report_table";
import {toast} from "react-toastify";
import {showAlert} from "../../../common/sweetalert/sweetalert";

function CAFinalSubmission(props) {
    const token = props.loginData[0].token;
    const [isLoading, setIsLoading] = useState(false);
    const [runningModules, setRunningModules] = useState([]);
    const [caSubmissionDataTable, setCASubmissionDataTable] = useState([]);
    const [createFindCARecord, setCreateFindCARecord] = useState({ModuleCode: ""});
    const columns = ["S/N", "Module Code", "Module Name", "CA Name", "CA Contribution (100%)"];
    const [tableHeight, setTableHeight] = useState("200px");
    const [caSettingsList, setCASettingList] = useState([]);
    const [onSubmitItem, setOnSubmitItem] = useState([]);

    const getRunningModules = async () => {
        await axios
            .get(`${serverLink}staff/assessments/staff/running/module/list/${props.loginData[0].StaffID}`, token)
            .then((response) => {
                let rows = [];
                response.data.length > 0 &&
                response.data.map((row) => {
                    rows.push({text: `${row.ModuleName} (${row.ModuleCode})`, id: row.ModuleCode});
                });

                setRunningModules(rows);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    };

    const findStudentsRegisteredModules = async (e) => {
        e.preventDefault();
        setCreateFindCARecord({
            ...createFindCARecord,
            [e.target.id]: e.target.value,
        });

        setIsLoading(true)

        const sendData = {
            ...createFindCARecord,
            ModuleCode: e.target.value,
        }

        if (sendData.ModuleCode !== ""){
            await axios
                .get(`${serverLink}staff/assessments/get/ca/settings/${sendData.ModuleCode}/`, token)
                .then((response) => {
                    const data = response.data;
                    let rows = [];
                    if (data.length > 0) {
                        setCASettingList(data)
                        data.map((item, index) => {
                            let ca_score_field = <input type="number" step={0.01} className="form-control"
                                                        placeholder="Enter CA Contribution"
                                                        onChange={onEdit}
                                                        module_code={item.ModuleCode}
                                                        entry_id = {item.EntryID}
                            />;

                            rows.push([(index + 1), item.ModuleCode, item.ModuleName, item.CAName, ca_score_field])
                        })
                        if (rows.length < 10) {
                            setTableHeight(`${rows.length}00`);
                        } else
                            setTableHeight(`800px`);
                        setCASubmissionDataTable(rows)
                    }
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.log("NETWORK ERROR");
                });
        }

        setIsLoading(false);

    };

    const onEdit = (e) => {
        const entry_id = e.target.getAttribute("entry_id");
        const value = e.target.value;
        if (value !== '') {
            let sendData = onSubmitItem;
            sendData.push(
                {
                    entry_id: parseFloat(entry_id),
                    score: parseFloat(value)
                })
            setOnSubmitItem(sendData)
        }

    }

    const handleSubmit = async () => {
        const output = Object.values(onSubmitItem.reduce((a, item) => {
            a[item.entry_id] = item;
            return a;
        }, {}));

        if (output.length < 1) {
            toast.error("Please enter the CA Contribution before submitting");
            return false;
        }

        let setting_data = [];
        caSettingsList.map(item => {
            const filter_record = output.filter(i => i.entry_id === item.EntryID);
            if (filter_record.length > 0) {
                setting_data.push(filter_record[0])
            }
        });

        if (setting_data.length < 1) {
            toast.error("Please enter all the CA Contribution before submitting");
            return false;
        }

        if (setting_data.length !== caSettingsList.length) {
            toast.error("Please enter all the CA Contribution before submitting");
            return false;
        }

        let total_contribution = 0;
        setting_data.map(item => {
            total_contribution += item.score
        });

        if (total_contribution !== 100) {
            toast.error("CA Contribution must be equal to 100");
            return false;
        }
        setIsLoading(true)
        const sendData = {
            records: setting_data
        }

        await axios.patch(`${serverLink}staff/assessments/update/ca/percentage`, sendData, token)
            .then((result) => {
                if (result.data.message === "success") {
                    toast.success("Final CA Submission is Saved successfully.");
                    setCASubmissionDataTable([])
                    setCreateFindCARecord([])
                    getRunningModules()
                    setIsLoading(false)
                } else {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            })
            .catch((error) => {
                setIsLoading(false)
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            });

    }

    useEffect(() => {
        getRunningModules().then((r) => {
        });
    }, []);


    return isLoading ? (
        <Loader/>
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Lecturer's Final CA Submission"}
                items={["Assessment", "Assessment", "Lecturer's Final CA Submission"]}
            />
            <div className="row">
                <div className="row pt-5">
                    <div className="col-lg-12 col-md-4 pt-5">
                        <label htmlFor="ModuleCode">Select Module</label>
                        <Select2
                            id="ModuleCode"
                            name="ModuleCode"
                            value={createFindCARecord.ModuleCode}
                            data={runningModules}
                            onChange={findStudentsRegisteredModules}
                            options={{placeholder: "Search Module",}}
                        />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <Loader/>
            ) : (
                <>
                    <div className="table-responsive pt-10">
                        <ReportTable columns={columns} data={caSubmissionDataTable} height={tableHeight} pagination={false} />
                    </div>
                    {caSubmissionDataTable.length > 0 && <button className="btn btn-primary w-100" onClick={handleSubmit}>Submit</button>}
                </>
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

export default connect(mapStateToProps, null)(CAFinalSubmission);
