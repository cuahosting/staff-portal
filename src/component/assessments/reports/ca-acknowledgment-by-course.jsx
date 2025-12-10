import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux/es/exports";
import { serverLink } from "../../../resources/url";
import axios from "axios";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import SearchSelect from "../../common/select/SearchSelect";
import { useReactToPrint } from "react-to-print";
import './style.css';

const headerStyle = {
    textAlign: "center",
    padding: "10px",
};

const hrStyle = {
    borderTop: "4px solid #333", // Darker color
    margin: "auto",
    color: "black",
    marginBottom: "20px", // Adjusted margin
};

const logoStyle = {
    width: "120px",
    height: "110px",
    marginBottom: "20px", // Adjusted margin for logo
};

const titleStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "black",
    marginBottom: "0", // Removed margin between the titles
};

// Helper function to convert names to Title Case
const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};


function CAAcknowledgementByCourse(props) {
    const token = props.LoginDetails[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const componentRef = useRef();
    const columns = ["S/N", "StudentID", "Student", "Scores", "Total Score"];
    const [data, setData] = useState([]);
    const [semesterList, setSemesterList] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [assessmentSettings, setAssessmentSettings] = useState([]);
    const [departmentsList, setDepartments] = useState([]);
    const [moduleDetails, setModuleDetails] = useState([]);
    const [departmentOptions, setDepartmentsOptions] = useState([]);
    const [semester, setSemeter] = useState({
        SemesterCode: "",
        SemesterCode2: "",
        DepartmentCode: "",
        DepartmentCode2: "",
    })

    const getSemesters = async () => {
        try {
            await axios.get(`${serverLink}staff/timetable/timetable/semester`, token)
                .then((result) => {
                    let rows = []
                    if (result.data.length > 0) {
                        result.data.map((row) => {
                            rows.push({ value: row.SemesterCode, label: row.SemesterName + "- " + row.SemesterCode })
                        });
                        setSemesterList(result.data);
                        setSemesterOptions(rows)
                    }
                    setIsLoading(false)
                })
        } catch (error) {
            console.log(error)
        }

    }

    const getCourses = async () => {
        await axios
            .get(`${serverLink}staff/assessment/exam/module/all`, token)
            .then((result) => {
                let rows = [];
                if (result.data.length > 0) {
                    result.data.map((row) => {
                        rows.push({ value: row.ModuleCode, label: row.ModuleName + (` (${row.ModuleCode})`) })
                    });
                    setDepartmentsOptions(rows)
                    setDepartments(result.data);
                }

            });
    };

    const getData = async (semester, course) => {
        setIsLoading(true)
        await axios.get(`${serverLink}staff/assessment/exam/get-student-scores/${semester}/${course}`, token)
            .then((result) => {
                let rows = [];
                setAssessmentSettings(result.data.settings)
                setModuleDetails(result.data.module)

                setIsLoading(false);
                setData(result.data.data)
            })
            .catch((err) => {
                console.log(err)
                console.log("NETWORK ERROR");
            });
    }

    const onSemesterChange = async (e) => {
        if (e.value !== "") {
            setSemeter({
                ...semester,
                SemesterCode: e.value,
                SemesterCode2: e
            })
            if (semester.DepartmentCode !== "") {
                getData(e.value, semester.DepartmentCode);
            }
        } else {
            setSemeter({
                ...semester,
                SemesterCode: "",
                SemesterCode2: ""
            })
            setData([])
        }
    }

    const onDepartmentChange = (e) => {
        setSemeter({
            ...semester,
            DepartmentCode: e.value,
            DepartmentCode2: e,
        })

        getData(semester.SemesterCode, e.value);
    }


    useEffect(() => {
        getSemesters();
        getCourses();
    }, [""]);

    const onPrintPage = () => {
        setTimeout(() => {
            handlePrint();
        }, 1000);
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"CA SUMMARY BY MODULE"}
                items={["Assessment", "CA SUMMARY ", " BY MODULE"]}
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body p-4">
                        <div className="row">
                            {semesterList.length > 0 &&
                                <div className="col-md-6 mb-4">
                                    <SearchSelect
                                        id="_Semester"
                                        label="Select Semester"
                                        value={semester.SemesterCode2}
                                        onChange={onSemesterChange}
                                        options={semesterOptions}
                                        placeholder="select Semester"
                                    />
                                </div>}
                            {
                                semester.SemesterCode !== "" ?
                                    <div className="col-md-6 mb-4">
                                        <SearchSelect
                                            id="DepartmentCode"
                                            label="Select Module"
                                            value={semester.DepartmentCode2}
                                            onChange={onDepartmentChange}
                                            options={departmentOptions}
                                            placeholder="select Module"
                                        />
                                    </div>
                                    : <></>
                            }
                        </div>
                    </div>
                </div>

                <div className="row mt-4">
                    {
                        data.length > 0 ?
                            <>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary "
                                    style={{ marginBottom: "15px" }}
                                    onClick={onPrintPage}
                                >
                                    Print
                                </button>
                                <div className="card" ref={componentRef}>
                                    <div
                                        className="card-body"

                                    >
                                        <div>
                                            <div style={headerStyle}>
                                                <img
                                                    src="https://cosmopolitan.edu.ng/logo.png"
                                                    alt="Logo"
                                                    style={logoStyle}
                                                />
                                                <div style={titleStyle}>
                                                    <h1 className="text-uppercase" style={{ fontSize: '20px' }}>Cosmopolitan University</h1>
                                                    <h4> LECTURER ASSESSMENT HARD COPY </h4>
                                                    <h5> [ Print 3 copies for Self, Department, Exams & Records ]</h5>
                                                    <hr style={hrStyle} />

                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: '50px', marginTop: '50px', fontSize: '16px' }}>
                                            <div className="row">
                                                <div className="col-3"><b>Faculty:</b></div>
                                                <div className="col-8 text-upper">{moduleDetails[0]?.FacultyName}</div>
                                            </div>
                                            <div className="row">
                                                <div className="col-3"><b>Department:</b></div>
                                                <div className="col-8 text-upper">{moduleDetails[0]?.DepartmentName}</div>
                                            </div>
                                            <div className="row">
                                                <div className="col-3"><b>Program:</b></div>
                                                <div className="col-8 text-upper">{moduleDetails[0]?.DegreeInView}</div>
                                            </div>

                                            <div className="row">
                                                <div className="col-3"><b>Module:</b></div>
                                                <div className="col-8 text-upper">{moduleDetails[0]?.ModuleName}</div>
                                            </div>
                                            <div className="row">
                                                <div className="col-3"><b>School Semester:</b></div>
                                                <div className="col-8 text-upper">{semester.SemesterCode} School Semester</div>
                                            </div>
                                            <div className="row">
                                                <div className="col-3"><b>Number Of Pages:</b></div>
                                                <div className="col-9">___________ Assessment Page(s) Submitted by the lecturer</div>
                                            </div>
                                            <div><h1>&nbsp;</h1></div>
                                        </div>
                                        <div className="header break-page" style={{ marginTop: '150px' }}>
                                            <div className="row">
                                                <div className="col-6 text-center">
                                                    ---------------------------------<br />[LECTURER SIGNATURE & DATE]
                                                </div>
                                                <div className="col-6 text-center">
                                                    ---------------------------------<br />[HOD SIGNATURE & DATE]
                                                </div>
                                            </div>
                                            <p>
                                                <br /> <br /> <br />
                                                <center>   [<em>Please staple the assessment page behind this page </em>]</center>
                                            </p>
                                        </div>
                                        <div className="mt-4">
                                            <table className="table table-bordered table-striped table-hover" style={{ fontSize: '14px' }}>
                                                <thead>
                                                    <tr className="bg-primary text-white" style={{ backgroundColor: '#4e73df' }}>
                                                        <th width="5%" align="center" style={{ padding: '12px', fontWeight: 'bold' }}>SN</th>
                                                        <th width="15%" align="left" style={{ padding: '12px', fontWeight: 'bold' }}>Student ID</th>
                                                        <th width="25%" align="left" style={{ padding: '12px', fontWeight: 'bold' }}>Student Name</th>
                                                        {assessmentSettings.map((r, index) => (
                                                            <th key={index} align="center" style={{ padding: '12px', fontWeight: 'bold' }}>
                                                                {r.CAName}<br />
                                                                <small style={{ fontWeight: 'normal' }}>{r.CAMarked} | {r.CAPerCon}%</small>
                                                            </th>
                                                        ))}
                                                        <th width="10%" align="center" style={{ padding: '12px', fontWeight: 'bold' }}>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        data.map((item, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td style={{ padding: '10px', textAlign: 'center' }}>{index + 1}</td>
                                                                    <td style={{ padding: '10px' }}>{item.StudentID}</td>
                                                                    <td style={{ padding: '10px' }}>{toTitleCase(item.StudentName)}</td>
                                                                    {item.Scores.map((e, i) => <td key={i} style={{ padding: '10px', textAlign: 'center' }}>{e}</td>)}
                                                                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{item.TotalScore}</td>
                                                                </tr>
                                                            )
                                                        })
                                                    }

                                                </tbody>
                                            </table>

                                        </div>
                                        <hr />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary "
                                    style={{ marginBottom: "15px" }}
                                    onClick={onPrintPage}
                                >
                                    Print
                                </button>
                            </> : <></>
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
export default connect(mapStateToProps, null)(CAAcknowledgementByCourse);
