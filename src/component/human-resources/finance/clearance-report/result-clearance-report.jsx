import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { connect } from "react-redux";
import ReportTable from "../../../common/table/ReportTable";
import PageHeader from "../../../common/pageheader/pageheader";
import SearchSelect from "../../../common/select/SearchSelect";
import { formatDateAndTime } from "../../../../resources/constants";

const ResultClearanceReport = (props) => {
    const token = props.login[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [semesterCode, setSemesterCode] = useState({
        semesterCode: "",
    });
    const [tableHeight, setTableHeight] = useState("600px");
    const [canSeeReport, setCanSeeReport] = useState(false);
    const columns = [
        "S/N",
        "StudentID",
        "IsResult",
        "Cleared By",
        "Cleared Date",
        "Updated By",
        "Updated Date"
    ];
    // const staffID = props.login[0].StaffID;

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const handleChange = async (e) => {
        setSemesterCode({
            ...semesterCode,
            [e.target.id]: e.target.value,
        });
        setIsLoading(true);
        e.preventDefault();
        await axios
            .get(
                `${serverLink}staff/student-manager/result/clearance/report/${e.target.value}`, token
            )
            .then((res) => {
                const result = res.data;
                if (result.length > 0) {
                    let rows = [];
                    result.map((item, index) => {
                        rows.push([
                            index + 1,
                            item.StudentID,
                            item.IsResult,
                            item.InsertedBy,
                            formatDateAndTime(item.InsertedDate, "date"),
                            item.UpdatedBy,
                            // capitalize(item.Semester),
                            formatDateAndTime(item.UpdatedDate, "date"),
                        ]);
                    });
                    setTableHeight(result.length > 100 ? "1000px" : "600px");
                    setData(rows);
                    setCanSeeReport(true);
                } else {
                    toast.error("No student cleared for the selected semester.");
                    setCanSeeReport(false);
                }
                setIsLoading(false);
            })
            .catch((err) => {
                toast.error("NETWORK ERROR");
                setIsLoading(false);
            });
    };

    const getSemesters = async () => {
        axios
            .get(`${serverLink}registration/registration-report/semester-list/`, token)
            .then((response) => {
                let rows = [];
                response.data.length > 0 &&
                    response.data.map((row) => {
                        rows.push({ label: row.Description + " " + "(" + row.SemesterCode + ")", value: row.SemesterCode });
                    });
                setSemesterList(rows);
                setIsLoading(false);
            })
            .catch((ex) => {
                console.error(ex);
            });
    }
    useEffect(() => {
        getSemesters().then((r) => { });
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Result clearance by semester"}
                items={["Users", "Finance Report", "Result clearance by semester"]}
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body pt-2">
                        <div className="col-md-12">
                            <div className="row">
                                <form>
                                    <div className="row fv-row">
                                        <div className="col-md-12 fv-row">
                                            <label className="required fs-6 fw-bold mb-2">
                                                Select Semester
                                            </label>
                                            <SearchSelect
                                                id="semesterCode"
                                                label="Select Semester"
                                                value={semesterList.find(op => op.value === semesterCode.semesterCode) || null}
                                                options={semesterList}
                                                onChange={(selected) => handleChange({ target: { id: 'semesterCode', value: selected?.value || '' }, preventDefault: () => { } })}
                                                placeholder="Search Semester Code"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        {canSeeReport ? (
                            <div className="row">
                                <div className="col-md-12 mt-5">
                                    {
                                        <ReportTable
                                            title={`Result clearance by semester`}
                                            columns={columns}
                                            data={data}
                                            height={tableHeight}
                                        />
                                    }
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        login: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(ResultClearanceReport);
