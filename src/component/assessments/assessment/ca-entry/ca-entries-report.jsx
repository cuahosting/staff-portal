import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
// eslint-disable-next-line no-unused-vars
import { toast } from "react-toastify";
import { connect } from "react-redux";
import ReportTable from "../../../common/table/ReportTable";
import SearchSelect from "../../../common/select/SearchSelect";

function CAEntryReport(props)
{
    const token = props.loginData[0].token
    const [isLoading, setIsLoading] = useState(false);
    const [CASettingsList, setCASettingsList] = useState([{ label: '--select CA setting--', value: '', marked: '' }]);
    const [CARecord, setCARecord] = useState([]);
    const columns = ["S/N", "Student ID", "Student Name", "CA Score", "Max Score", "Marked By",];

    const staff_id = props.loginData[0].StaffID;
    const [isFecthing, setIsFetching] = useState('settings')

    const getCASettings = async () =>
    {
        await axios
            .get(`${serverLink}staff/assessments/settings/${staff_id}`, token)
            .then((response) =>
            {
                let rows = [];
                response.data.length > 0 &&
                    response.data.forEach((row) =>
                    {
                        rows.push({ label: `${row.CAName} (${row.ModuleCode} -- ${row.SemesterCode})`, value: row.EntryID, marked: row.CAMarked });
                    });
                setCASettingsList(rows);
                setIsLoading(false);
                setIsFetching('')
            })
            .catch((err) =>
            {
                console.log("NETWORK ERROR");
            });
    };

    const findCA = async (setting) =>
    {
        const setting_id = setting.value;
        setIsFetching('data')
        await axios.get(`${serverLink}staff/assessments/ca-entries/report/${staff_id}/${setting_id}`, token)
            .then((response) =>
            {
                const data = response.data;
                let rows = [];
                if (data.length > 0)
                {
                    data.forEach((item, index) =>
                    {
                        rows.push([(index + 1), item.StudentID, item.StudentName, item.CAScore, setting.marked, item.InsertedBy])
                    })
                }
                setCARecord(rows);
                setIsLoading(false);
                setIsFetching('')
            })
            .catch((err) =>
            {
                console.log("NETWORK ERROR");
            });
    };



    useEffect(() =>
    {
        getCASettings().then(() =>
        {
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Lecturer Mark CA"}
                items={["Assessment", "Assessment", "Lecturer CA Report"]}
            />
            <div className="row">
                <div className="row pt-0">
                    <div className="col-lg-6 col-md-4 pt-0">
                        <label htmlFor="ModuleCode">Select Module {isFecthing === 'settings' && <span className="fw-bold"><i>&emsp;loading settings...</i></span>} </label>

                        <SearchSelect
                            name="ModuleCode"
                            // value={createFindCARecord.ModuleCode}
                            onChange={findCA}
                            options={CASettingsList}
                            placeholder="Search Module"
                        />
                    </div>

                </div>
            </div>

            {isLoading ? (
                <Loader />
            ) : (
                <div className="table-responsive pt-10">
                    {isFecthing === 'data' && <span className="fw-bold"><i>&emsp;loading entries...</i></span>}
                    <ReportTable columns={columns} data={CARecord} />
                </div>

            )}
        </div>
    );
}

const mapStateToProps = (state) =>
{
    return {
        loginData: state.LoginDetails,
        currentSemester: state.currentSemester,
    };
};

export default connect(mapStateToProps, null)(CAEntryReport);
