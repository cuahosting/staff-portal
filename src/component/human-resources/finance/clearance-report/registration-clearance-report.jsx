import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { connect } from "react-redux";
import ReportTable from "../../../common/table/report_table";
import PageHeader from "../../../common/pageheader/pageheader";
import Select2 from "react-select2-wrapper";
import "react-select2-wrapper/css/select2.css";
import {formatDateAndTime} from "../../../../resources/constants";

const RegistrationClearanceReport = (props) => {
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
        "IsRegistration",
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
                `${serverLink}staff/student-manager/registration/clearance/report/${e.target.value}`, token
            )
            .then((res) => {
                const result = res.data;
                if (result.length > 0) {
                    let rows = [];
                    result.map((item, index) => {
                        rows.push([
                            index + 1,
                            item.StudentID,
                            item.IsRegistration,
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
                    toast.error("No student for the selected semester.");
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
                    rows.push({ text: row.Description + " " + "(" + row.SemesterCode + ")", id: row.SemesterCode });
                });
                setSemesterList(rows);
                setIsLoading(false);
            })
            .catch((ex) => {
                console.error(ex);
            });
    }
    useEffect(() => {
        getSemesters().then((r) => {});
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Registration clearance by semester"}
                items={["Users", "Finance Report", "Registration clearance by semester"]}
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
                                            <Select2
                                                id="semesterCode"
                                                data={semesterList}
                                                value={semesterCode.semesterCode}
                                                onSelect={handleChange}
                                                options={{
                                                    placeholder: "Search Semester Code",
                                                }}
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
                                            title={`Registration clearance by semester`}
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

export default connect(mapStateToProps, null)(RegistrationClearanceReport);
