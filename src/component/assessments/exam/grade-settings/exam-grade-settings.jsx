import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import Modal from "../../../common/modal/modal";
import AgReportTable from "../../../common/table/ReportTable";
import { formatDateAndTime } from "../../../../resources/constants";
import SearchSelect from "../../../common/select/SearchSelect";

function ExamGradeSettings(props) {
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Grade", "Range", "Decision", "Type", "Added By", "Added Date", "Action"];
    const [gradeList, setGradeList] = useState([]);
    const [createItem, setCreateItem] = useState({ entry_id: '', grade_type: '', grade: '', min_range: '', max_range: '', decision: '', inserted_by: props.loginData.StaffID });

    const clearItems = () => { setCreateItem({ entry_id: '', grade_type: '', grade: '', min_range: '', max_range: '', decision: '', inserted_by: props.loginData.StaffID }); };

    const getGradeRecords = async () => {
        const { success, data } = await api.get("staff/assessment/exam/grade/settings/list");
        if (success && data?.message === 'success' && data.data?.length > 0) {
            let rows = [];
            data.data.forEach((item, index) => {
                rows.push([(index + 1), item.Grade, `${item.MinRange}-${item.MaxRange}`, item.Decision, item.GradeType, item.InsertedBy, formatDateAndTime(item.InsertedDate, 'date_and_time'),
                <button type="button" className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => setCreateItem({ entry_id: item.EntryID, grade_type: item.GradeType, grade: item.Grade, max_range: item.MaxRange, min_range: item.MinRange, decision: item.Decision, inserted_by: props.loginData.StaffID })}><i className={"fa fa-pen"} /></button>
                ]);
            });
            setGradeList(rows);
        }
        setIsLoading(false);
    };

    const onEdit = (e) => {
        const id = e.target.id; const value = e.target.value;
        if (id === 'min_range' || id === 'max_range') { if (value !== '') { setCreateItem({ ...createItem, [id]: parseFloat(value) }); } else { setCreateItem({ ...createItem, [id]: value }); } }
        else { setCreateItem({ ...createItem, [id]: value }); }
    };

    const onSubmit = async () => {
        if (createItem.grade_type === '') { toast.error("Please select a grade type"); return false; }
        if (createItem.grade === '') { toast.error("Please select a grade"); return false; }
        if (createItem.min_range === '') { toast.error("Please enter the grade min range"); return false; }
        if (createItem.max_range === '') { toast.error("Please enter the grade max range"); return false; }
        if (createItem.min_range >= createItem.max_range) { toast.error("Min range can't => max range"); return false; }
        if (createItem.decision === '') { toast.error("Please select a grade decision"); return false; }

        if (createItem.entry_id === '') {
            const { success } = await api.post("staff/assessment/exam/grade/settings/add", createItem);
            if (success) { toast.success("Grade Settings Added Successfully"); document.getElementById('closeModal').click(); getGradeRecords(); }
            else { toast.error("An error has occurred. Please try again!"); }
        } else {
            const { success } = await api.patch("staff/assessment/exam/grade/settings/update", createItem);
            if (success) { toast.success("Grade Settings Updated Successfully"); document.getElementById('closeModal').click(); getGradeRecords(); }
            else { toast.error("An error has occurred. Please try again!"); }
        }
    };

    useEffect(() => { getGradeRecords(); }, []);

    return isLoading ? <Loader /> : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Grade Settings"} items={["Assessment", "Exams & Records", "Grade Settings"]} />
            <div className="flex-column-fluid"><div className="card card-no-border"><div className="card-header border-0 pt-6"><div className="card-title" /><div className="card-toolbar"><div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base"><button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#kt_modal_general" onClick={() => clearItems()}>Add Grade Settings</button></div></div></div><div className="card-body p-0"><AgReportTable columns={columns} data={gradeList} /></div></div>
                <Modal title={"Grade Settings Form"}>
                    <div className="form-group"><label htmlFor="grade_type">Grade Type</label><SearchSelect id="grade_type" value={[{ value: "undergraduate", label: "Undergraduate" }, { value: "postgraduate", label: "Postgraduate" }].find(opt => opt.value === createItem.grade_type) || null} options={[{ value: "undergraduate", label: "Undergraduate" }, { value: "postgraduate", label: "Postgraduate" }]} onChange={(selected) => onEdit({ target: { id: 'grade_type', value: selected?.value || '' } })} placeholder="Select Grade Type" isClearable={false} /></div>
                    <div className="form-group pt-2"><label htmlFor="grade">Select Grade</label><input type="text" id={"grade"} className="form-control" onChange={onEdit} value={createItem.grade} placeholder={"A"} /></div>
                    <div className="form-group pt-2"><label htmlFor="min_range">Min Range</label><input type="number" id={"min_range"} step={0.01} className="form-control" onChange={onEdit} value={createItem.min_range} /></div>
                    <div className="form-group pt-2"><label htmlFor="max_range">Max Range</label><input type="number" id="max_range" step={0.01} className="form-control" onChange={onEdit} value={createItem.max_range} /></div>
                    <div className="form-group pt-2"><label htmlFor="decision">Select Decision</label><SearchSelect id="decision" value={[{ value: "Pass", label: "Pass" }, { value: "Fail", label: "Fail" }].find(opt => opt.value === createItem.decision) || null} options={[{ value: "Pass", label: "Pass" }, { value: "Fail", label: "Fail" }]} onChange={(selected) => onEdit({ target: { id: 'decision', value: selected?.value || '' } })} placeholder="Select Decision" isClearable={false} /></div>
                    <div className="form-group pt-2"><button onClick={onSubmit} className="btn btn-primary w-100">Save</button></div>
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => { return { loginData: state.LoginDetails[0] }; };
export default connect(mapStateToProps, null)(ExamGradeSettings);
