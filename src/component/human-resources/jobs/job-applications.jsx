import React, { useEffect, useState } from "react";
import { api } from "../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import ReportTable from "../../common/table/ReportTable";
import { encryptData, formatDate, formatDateAndTime } from "../../../resources/constants";
import { Link } from "react-router-dom";


function JobApplications(props) {

    const [isFormLoading, setIsFormLoading] = useState('off');

    const [facultyList, setFacultyList] = useState(
        props.FacultyList.length > 0 ? props.FacultyList : []
    )
    const [departmentList, setDepartmentList] = useState(
        props.DepartmentList.length > 0 ? props.DepartmentList : []
    )
    const [department, setDepartment] = useState(props.DepartmentList.length > 0 ? props.DepartmentList : [])
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["SN", "Action", "Name", "Email", "Position", "Department", "Faculty", "Applied On", "Status"]

    const [data, setData] = useState([])
    const [createApplicant, setApplicant] = useState({
        EntryID: "",
        Position: "",
        Faculty: "",
        Department: "",
        DateApplied: "",
        Status: "",
        InsertedBy: props.LoginDetails[0].StaffID,
    });

    const getMetaData = async () => {
        let faculties_ = []
        const facultyResult = await api.get("staff/academics/faculty/list");
        if (facultyResult.success && facultyResult.data.length > 0) {
            faculties_ = facultyResult.data;
            setFacultyList(facultyResult.data)
        }

        let depts_ = []
        const deptResult = await api.get("staff/academics/department/list");
        if (deptResult.success && deptResult.data.length > 0) {
            depts_ = deptResult.data;
            setDepartmentList(deptResult.data)
            setDepartment(deptResult.data)
        }
    }

    const getData = async () => {
        if (departmentList.length > 0) {
            const { success, data } = await api.get("jobs/job-applications/all/list");
            if (success && data.length > 0) {
                let rows = [];
                data.map((item, index) => {
                    const _depts = departmentList?.filter(x => x.DepartmentCode.toLowerCase() === item.Department.toLowerCase());
                    const _facs = facultyList?.filter(x => x.FacultyCode.toLowerCase() === item.Faculty.toLowerCase());
                    rows.push([
                        index + 1,
                        <Link className="btn btn-sm btn-primary" to={`/human-resources/jobs/applications/${encryptData(item.EntryID.toString())}`}><i className="fa fa-pen" /></Link>,
                        item.FirstName + " " + item.MiddleName + " " + item.Surname,
                        item.EmailAddress,
                        item.Position,
                        _depts.length > 0 ? _depts[0].DepartmentName : "No Department",
                        _facs.length > 0 ? _facs[0].FacultyName : "No Faculty",
                        formatDateAndTime(item.InsertDate, "date"),
                        <label className={
                            item.Status === "0" ? "badge badge-secondary" :
                                item.Status === "1" ? "badge badge-info" :
                                    item.Status === "2" ? "badge badge-danger" : "badge badge-success"
                        }>{
                                item.Status === "0" ? "Pending" :
                                    item.Status === "1" ? "Invited" :
                                        item.Status === "2" ? "Rejected" : "Accepted"
                            }</label>
                    ])
                })
                setData(rows)
            }
            setIsLoading(false);
        }
    }


    useEffect(() => {
        getMetaData();
        getData()
    }, []);

    return isLoading ? (
        <Loader />
    ) :
        (
            <>
                <div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width: '100%' }}>
                    <div className="">
                        <div className="row col-md-12" style={{ width: '100%' }}>
                            <ReportTable columns={columns} data={data} title={"Job Openings"} />
                            {/* <Table data={datatable} /> */}
                        </div>
                    </div>

                </div>
            </>
        )
}


const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        FacultyList: state.FacultyList,
        DepartmentList: state.DepartmentList
    };
};
export default connect(mapStateToProps, null)(JobApplications);
