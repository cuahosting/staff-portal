import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {toast} from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import {serverLink} from "../../../../resources/url";
import Modal from "../../../common/modal/modal";
import AgReportTable from "../../../common/table/ReportTable";
import {formatDateAndTime} from "../../../../resources/constants";

function ExamGradeSettings(props) {
    const token = props.loginData.token;

    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Grade", "Range", "Decision", "Type", "Added By", "Added Date", "Action"];
    const [gradeList, setGradeList] = useState([]);
    const [createItem, setCreateItem] = useState({
        entry_id: '',
        grade_type: '',
        grade: '',
        min_range: '',
        max_range: '',
        decision: '',
        inserted_by: props.loginData.StaffID
    });
    const clearItems = () => {
        setCreateItem({
            entry_id: '',
            grade_type: '',
            grade: '',
            min_range: '',
            max_range: '',
            decision: '',
            inserted_by: props.loginData.StaffID
        })
    }

    const getGradeRecords = async () => {
        await axios.get(`${serverLink}staff/assessment/exam/grade/settings/list`, token)
            .then(res => {
                const data = res.data;
                let rows = [];
                if (data.message === 'success') {
                    data.data.length > 0 &&
                    data.data.map((item, index) => {
                        rows.push([(index + 1), item.Grade,
                            `${item.MinRange}-${item.MaxRange}`,
                            item.Decision, item.GradeType, item.InsertedBy,
                            formatDateAndTime(item.InsertedDate, 'date_and_time'),
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_general"
                                onClick={() => setCreateItem({
                                    entry_id: item.EntryID,
                                    grade_type: item.GradeType,
                                    grade: item.Grade,
                                    max_range: item.MaxRange,
                                    min_range: item.MinRange,
                                    decision: item.Decision,
                                    inserted_by: props.loginData.StaffID
                                })}
                            >
                                <i className={"fa fa-pen"}/>
                            </button>])
                    })
                }
                setIsLoading(false)
                setGradeList(rows)
            })
            .catch(err => {
                console.log(err)
                toast.error("NETWORK ERROR. Please try again!")
            })
    }

    const onEdit = (e) => {
        const id = e.target.id;
        const value = e.target.value;

        if (id === 'min_range' || id === 'max_range') {
            if (value !== '') {
                setCreateItem({
                    ...createItem,
                    [id]: parseFloat(value)
                })
            } else {
                setCreateItem({
                    ...createItem,
                    [id]: value
                })
            }

        } else {
            setCreateItem({
                ...createItem,
                [id]: value
            })
        }
    }

    const onSubmit = async () => {
        if (createItem.grade_type === '') {
            toast.error("Please select a grade type");
            return false;
        }
        if (createItem.grade === '') {
            toast.error("Please select a grade");
            return false;
        }
        if (createItem.min_range === '') {
            toast.error("Please enter the grade min range");
            return false;
        }
        if (createItem.max_range === '') {
            toast.error("Please enter the grade max range");
            return false;
        }
        if (createItem.min_range >= createItem.max_range) {
            toast.error("Min range can't => max range");
            return false;
        }
        if (createItem.decision === '') {
            toast.error("Please select a grade decision");
            return false;
        }

        if (createItem.entry_id === '') {
            await axios.post(`${serverLink}staff/assessment/exam/grade/settings/add`, createItem, token)
                .then(res => {
                    if (res.data.message === 'success') {
                        toast.success("Grade Settings Added Successfully");
                        document.getElementById('closeModal').click();
                        getGradeRecords();
                    } else {
                        toast.error("An error has occurred. Please try again!");
                    }
                })
                .catch(err => {
                    console.log(err)
                    toast.error("NETWORK ERROR. Please try again!")
                })
        } else {
            await axios.patch(`${serverLink}staff/assessment/exam/grade/settings/update`, createItem, token)
                .then(res => {
                    if (res.data.message === 'success') {
                        toast.success("Grade Settings Updated Successfully");
                        document.getElementById('closeModal').click();
                        getGradeRecords();
                    } else {
                        toast.error("An error has occurred. Please try again!");
                    }
                })
                .catch(err => {
                    console.log(err)
                    toast.error("NETWORK ERROR. Please try again!")
                })
        }

    }

    useEffect(() => {
        getGradeRecords()
    }, [])

    return isLoading ? <Loader/> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Grade Settings"} items={["Assessment", "Exams & Records", "Grade Settings"]}/>
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title"/>
                        <div className="card-toolbar">
                            <div
                                className="d-flex justify-content-end"
                                data-kt-customer-table-toolbar="base"
                            >
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() => clearItems()}
                                >
                                    Add Grade Settings
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <AgReportTable columns={columns} data={gradeList}/>
                    </div>
                </div>

                <Modal title={"Grade Settings Form"}>
                    <div className="form-group">
                        <label htmlFor="grade_type">Grade Type</label>
                        <select id="grade_type" className="form-control" onChange={onEdit}
                                value ={createItem.grade_type}>
                            <option value="">Select Grade Type</option>
                            <option value="undergraduate">Undergraduate</option>
                            <option value="postgraduate">Postgraduate</option>
                        </select>
                    </div>

                    <div className="form-group pt-2">
                        <label htmlFor="grade">Select Grade</label>
                        <input type="text" id={"grade"} className="form-control" onChange={onEdit} value={createItem.grade}
                               placeholder={"A"}/>
                    </div>

                    <div className="form-group pt-2">
                        <label htmlFor="min_range">Min Range</label>
                        <input type="number" id={"min_range"} step={0.01} className="form-control" onChange={onEdit}
                               value={createItem.min_range}/>
                    </div>

                    <div className="form-group pt-2">
                        <label htmlFor="max_range">Max Range</label>
                        <input type="number" id="max_range" step={0.01} className="form-control" onChange={onEdit}
                               value={createItem.max_range}/>
                    </div>

                    <div className="form-group pt-2">
                        <label htmlFor="decision">Select Decision</label>
                        <select id="decision" className="form-control" value={createItem.decision} onChange={onEdit}>
                            <option value="">Select Decision</option>
                            <option value="Pass">Pass</option>
                            <option value="Fail">Fail</option>
                        </select>
                    </div>

                    <div className="form-group pt-2">
                        <button onClick={onSubmit} className="btn btn-primary w-100">
                            Save
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails[0],
    };
};

export default connect(mapStateToProps, null)(ExamGradeSettings);

