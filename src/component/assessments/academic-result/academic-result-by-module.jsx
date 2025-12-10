import React, { useEffect, useState } from "react";
import { connect } from "react-redux/es/exports";
import { serverLink } from "../../../resources/url";
import axios from "axios";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import AgReportTable from "../../common/table/ReportTable";
import { toast } from "react-toastify";
import SearchSelect from "../../common/select/SearchSelect";

function AcademicResultByModule(props) {
    const token = props.LoginDetails[0].token;
    const staff = props.LoginDetails[0].StaffID;

    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "StudentID", "Student", "Module", "Level", "Semester", "Grade", "CAs", "Exams", "Total"];
    const [data, setData] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [semesterList, setSemesterList] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [semesterOptions, setSemesterOptions] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [moduleList, setModules] = useState([]);
    const [moduleOptions, setModulesOptions] = useState([]);
    const [moduleCode, setModuleCode] = useState({
        ModuleCode: "",
        ModuleCode2: "",
    })

    const getModules = async () => {
        await axios
            .get(`${serverLink}staff/assessment/exam/module/${staff}`, token)
            .then((result) => {
                let rows = [];
                if (result.data.length > 0) {
                    const mapFromRes = new Map(result.data.map(c => [c.ModuleCode, c]));

                    const uniqueModules = [...mapFromRes.values()];

                    uniqueModules.forEach((row) => {
                        rows.push({ value: row.ModuleCode, label: row.ModuleName + ` (${row.ModuleCode})` })
                    });
                    setModulesOptions(rows)
                    setModules(uniqueModules);
                }
                setIsLoading(false)
            });


    };

    const getData = async (module) => {
        setIsLoading(true)
        await axios.get(`${serverLink}staff/assessment/exam/result/by/module/${module}`, token)
            .then((result) => {
                let rows = [];
                if (result.data.length > 0) {
                    result.data.forEach((exam, index) => {
                        rows.push([
                            index + 1,
                            exam.StudentID,
                            exam.StudentName,
                            exam.ModuleCode,
                            exam.StudentLevel,
                            exam.StudentSemester,
                            exam.StudentGrade,
                            exam.CAScore,
                            exam.ExamScore,
                            exam.Total
                        ]);
                    });
                    setIsLoading(false)
                }
                else {
                    toast.error('no record');
                    setIsLoading(false)
                }
                setIsLoading(false);
                setData(rows)
            })
            .catch((err) => {
                console.log(err)
                console.log("NETWORK ERROR");
            });
    }



    const onDepartmentChange = (e) => {
        setModuleCode({
            ...moduleCode,
            ModuleCode: e.value,
            ModuleCode2: e,
        })
        getData(e.value);
    }


    useEffect(() => {
        getModules();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"ACADEMIC RESULT BY MODULE"}
                items={["Assessment", "ACADEMIC RESULT", " BY MODULE"]}
            />
            <div className="row">
                {
                    <div className="col-md-12 mb-4">
                        <SearchSelect
                            name="ModuleCode"
                            label="Select Module"
                            value={moduleCode.ModuleCode2}
                            onChange={onDepartmentChange}
                            options={moduleOptions}
                            placeholder="Select Module"
                        />
                    </div>
                }

            </div>
            <div className="flex-column-fluid mb-2">
                <div className="row">
                    {
                        <div className="mt-4">
                            {data.length > 0 &&
                                <AgReportTable columns={columns} data={data} title={"ACADEMIC RESULT BY MODULE"} />
                            }
                        </div>
                    }
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
export default connect(mapStateToProps, null)(AcademicResultByModule);
