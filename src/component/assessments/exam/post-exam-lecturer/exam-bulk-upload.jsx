import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { useLocation } from "react-router";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Select2 from "react-select2-wrapper";
import { toast } from "react-toastify";
import ExamTemplate from "./Exam_template.csv"
import papa from 'papaparse'
import AGTable from "../../../common/table/AGTable";


const randomToken = require('random-token');

function ExamResultBulkUpload(props) {
    const token = props.loginData.token;

    const [isLoading, setIsLoading] = useState(true);
    const [pageName, setPageName] = useState("Post Exam Result");
    const location = useLocation();
    const [semesterList, setSemesterList] = useState([]);
    const [moduleListSelect, setModuleListSelect] = useState([]);
    const [moduleList, setModuleList] = useState([]);
    const [selectedModule, setSelectedModule] = useState({
        ModuleCode: "", ModuleName: "", ModuleType: "", CreditUnit: "", CAPerCon: "", ExamPerCon: ""
    })
    const [chosenModule, setChosenModule] = useState()
    const [notProcessed, setNotProcessed] = useState([])
    const [datatable, setDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Student ID", field: "StudentID" },
            { label: "Comment", field: "Comment" }
        ],
        rows: []
    });
    const [searchItem, setSearchItem] = useState({
        SemesterCode: '',
        ModuleCode: '',
        ExamFile: ''
    });
    const [processing, setProcessing] = useState(0)
    const [studentResult, setStudentResult] = useState({
        ExamMarkedScore: '70',
        CAMarkedScore: '30',
    });

    const resetItem = () => {
        setProcessing(0);
        setDatatable({
            ...datatable,
            rows: []
        });
    }

    const getRecord = async () => {
        resetItem();
        await axios.get(`${serverLink}staff/timetable/timetable/semester`, token)
            .then(res => {
                const data = res.data;
                let rows = [];
                if (data.length > 0) {
                    data.map(item => {
                        rows.push({ id: item.SemesterCode, text: item.SemesterName })
                    })
                }
                setSemesterList(rows);
            })
            .catch(err => {
                console.log("NETWORK ERROR")
            });

        setIsLoading(false)
    }

    const onEdit = (e) => {
        const id = e.target.id;
        const value = e.target.value;
        setSearchItem({
            ...searchItem,
            [id]: value
        })

        if (id === "SemesterCode") {
            onFindModules(value)
        }

        if (id === 'ModuleCode') {
            set_module_parameter(value)
        }
    }

    const onFindModules = async (semester_code) => {
        setIsLoading(true)
        //
        await axios.get(`${serverLink}staff/assessments/staff/running/module/list-plus/${semester_code}`, token)
            .then(res => {
                const data = res.data;
                let rows = [];
                if (data.length > 0) {
                    data.map(item => {
                        rows.push({ id: item.ModuleCode, text: `${item.ModuleName} (${item.ModuleCode})` })
                    })
                }
                setModuleListSelect(rows);
                setModuleList(data);
            })
            .catch(err => {
                console.log("NETWORK ERROR")
            }).finally(() => {
                setIsLoading(false)
            })

    }


    const onPostResult = async () => {
        if (searchItem.SemesterCode === '') {
            toast.error("Please select semester");
            return false;
        }

        if (searchItem.ModuleCode === '') {
            toast.error("Please select module");
            return false;
        }
        if (studentResult.CAMarkedScore === '') {
            toast.error("Please enter ca marked score");
            return false;
        }
        if (studentResult.ExamMarkedScore === '') {
            toast.error("Please exam marked score");
            return false;
        }


        toast.info("Please wait...");

        let request_for = 'default'

        const sendData = {
            ...searchItem,
            ...studentResult,
            ...chosenModule,
            request_for: request_for,
            selected_module: chosenModule,
            InsertedBy: props.loginData.StaffID,
            tokenCode: randomToken(16)
        }

        const fdt = new FormData();
        fdt.append("ExamFile", searchItem.ExamFile)
        fdt.append("sendData", sendData)

        setProcessing(1);
        await axios.post(`${serverLink}staff/assessment/exam/exam/bulk-upload`, fdt, token)
            .then(res => {
                const data = { ...sendData, file: res.data.file }

                axios.post(`${serverLink}staff/assessment/exam/exam/bulk-upload/post`, data, token)
                    .then((res) => {
                        const data = res.data;
                        if (data.message === 'success' && data.to_score > 0) {
                            setNotProcessed(data.issues)

                            // Update table with issues
                            let rows = [];
                            if (data.issues && data.issues.length > 0) {
                                data.issues.forEach((issue, index) => {
                                    rows.push({
                                        sn: index + 1,
                                        StudentID: issue.StudentID || 'N/A',
                                        Comment: issue.Comment || 'N/A'
                                    });
                                });
                            }
                            setDatatable({
                                ...datatable,
                                rows: rows
                            });

                            setTimeout(() => {
                                toast.success('processed successfully')
                                setProcessing(2)
                            }, 5000);
                        } else if (data.to_score === 0) {
                            setProcessing(0)
                            toast.error("All results for this module have already been uploaded")
                        }
                        else {
                            setProcessing(3)
                            toast.error("Something went wrong on the server. Please try again!");
                        }
                    }).catch(err => {
                        setProcessing(3)
                        toast.error("Network error. Please try again!");
                        console.log("NETWORK ERROR")
                    });
            })

    }

    const set_module_parameter = (module_code) => {
        const selected_module = moduleList.filter(i => i.ModuleCode === module_code)[0];
        setChosenModule(selected_module)
    }

    const handleScoreChange = (e) => {
        if (e.target.value !== '') {
            setStudentResult({
                ...studentResult,
                [e.target.id]: parseFloat(e.target.value)
            })
        } else {
            setStudentResult({
                ...studentResult,
                [e.target.id]: e.target.value
            })
        }
    }


    useEffect(() => {
        if (location.pathname.includes('barcode'))
            setPageName('Post Exam Result (Barcode)');
        else if (location.pathname.includes('default'))
            setPageName('Post Exam Result (Lecturer)');
        else
            setPageName('Update Exam Result');

        getRecord();

    }, [location]);

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file.type !== "text/csv") {
            toast.error("Only .csv files are allowed")
            setSearchItem({
                ...searchItem,
                ExamFile: ""
            })
        } else {
            setSearchItem({
                ...searchItem,
                ExamFile: file
            })
        }
    }


    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={pageName}
                items={["Assessment", "Exams & Records", pageName]}
            />

            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body p-0">
                        <div className="row pt-5">
                            <div className="col-md-6">
                                <div className="row pt-5">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="SemesterCode">Select Semester</label>
                                            <Select2
                                                id="SemesterCode"
                                                name="SemesterCode"
                                                data={semesterList}
                                                value={searchItem.SemesterCode}
                                                className={"form-control"}
                                                onSelect={onEdit}
                                                options={{
                                                    placeholder: "Search Semester",
                                                }}
                                            />

                                        </div>


                                        <div className="form-group pt-5">
                                            <label htmlFor="ModuleCode">Select Module</label>
                                            <Select2
                                                id="ModuleCode"
                                                name="ModuleCode"
                                                data={moduleListSelect}
                                                value={searchItem.ModuleCode}
                                                className={"form-control"}
                                                onSelect={onEdit}
                                                options={{
                                                    placeholder: "Search Module",
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group pb-5">
                                            <label htmlFor="ExamMarkedScore">Exam Marked Score</label>
                                            <input type="number" step={0.01} id="ExamMarkedScore"
                                                className="form-control"
                                                value={studentResult.ExamMarkedScore}
                                                onChange={handleScoreChange}
                                                placeholder={"Enter Exam Marked Score"} />
                                        </div>
                                        <div className="form-group pb-5">
                                            <label htmlFor="CAMarkedScore">CA Marked Score</label>
                                            <input type="number" step={0.01} id="CAMarkedScore"
                                                className="form-control"
                                                value={studentResult.CAMarkedScore}
                                                onChange={handleScoreChange}
                                                placeholder={"Enter CA Marked Score"} />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group pb-5">
                                            <label htmlFor="ModuleCode">Upload File (<small><a className="text-primary italic" target="_blank" download href={ExamTemplate}>Click to donwload template</a></small>)</label>
                                            <input className="form-control" type="file" id="ExamFile" onChange={onFileChange} />
                                        </div>
                                        <div className="form-group pt-5 pb-5">
                                            <button disabled={processing === 1 ? true : false} className="btn btn-primary w-100" onClick={onPostResult}>Post Result</button>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="col-md-6">

                                {
                                    processing === 1 ?
                                        <div className={`notice d-flex bg-light-primary rounded border-primary border border-dashed p-6`}>
                                            <div className="d-flex flex-stack flex-grow-2">
                                                <div className="fw-bold">
                                                    <h4 className="text-gray-900 fw-bolder">Processing note</h4>
                                                    <div className="fs-6 text-gray-700">Result processing on-going, please wait while the system process the results. This may take a while.</div>
                                                    <div class="d-flex justify-content-center">
                                                        <div class="spinner-grow text-primary" role="status">
                                                            <span class="sr-only">Loading...</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> :
                                        processing === 2 ?
                                            <div className={`notice d-flex bg-light-success rounded border-success border border-dashed p-6`}>
                                                <div className="d-flex flex-stack flex-grow-2">
                                                    <div className="fw-bold">
                                                        <h4 className="text-gray-900 fw-bolder">Processing note</h4>
                                                        <div className="fs-6 text-gray-700">
                                                            Result upload completed successfully
                                                            {
                                                                datatable.rows.length > 0 &&
                                                                <div className="row col-md-12 pt-5">
                                                                    However, the following issues were found.
                                                                    <AGTable data={datatable} />
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div> :
                                            processing === 3 ?
                                                <div className={`notice d-flex bg-light-danger rounded border-danger border border-dashed p-6`}>
                                                    <div className="d-flex flex-stack flex-grow-2">
                                                        <div className="fw-bold">
                                                            <h4 className="text-gray-900 fw-bolder">Processing note</h4>
                                                            <div className="fs-6 text-gray-700">An error occured while processing result, please check your network and try again. If it persists contact IT support</div>
                                                        </div>
                                                    </div>
                                                </div> :
                                                <>
                                                </>
                                }

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div >
    )

}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails[0],
    };
};

export default connect(mapStateToProps, null)(ExamResultBulkUpload);
