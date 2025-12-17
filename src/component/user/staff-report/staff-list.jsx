import React, { useEffect, useState } from "react";
import ReportTable from "../../common/table/ReportTable";
import Loader from "../../common/loader/loader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function StaffList(props) {
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Staff ID", "Staff Name", "Email Address", "Phone Number", "Department", "Faculty", "Designation", "Gender", "Is Academic", "Status"];
    const [data, setData] = useState([]);
    const [tableHeight, setTableHeight] = useState("600px");

    const getStaffList = async () => {
        const { success, data: result } = await api.get("staff/staff-report/staff-list");
        if (success && result?.length > 0) {
            let rows = [];
            result.forEach((item, index) => { rows.push([index + 1, item.StaffID, item.StaffName, item.OfficialEmailAddress, item.PhoneNumber, item.DepartmentName, item.FacultyName, item.DesignationName, item.Gender, item.IsAcademicStaff === 1 ? 'Academic' : 'Non-Academic', item.IsActive === 1 ? 'Active' : 'Inactive']); });
            setTableHeight(result.length > 100 ? "1000px" : "600px");
            setData(rows);
        }
        setIsLoading(false);
    };

    useEffect(() => { getStaffList(); }, []);

    return isLoading ? (<Loader />) : (<ReportTable title={`Staff List`} columns={columns} data={data} height={tableHeight} />);
}

const mapStateToProps = (state) => { return { login: state.LoginDetails }; };
export default connect(mapStateToProps, null)(StaffList);
