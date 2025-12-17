import React, { useEffect, useState } from "react";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import ReportTable from "../../../common/table/ReportTable";
import { connect } from "react-redux";

function HRPensionStaffNotEnrolledReport(props) {

    const [isLoading, setIsLoading] = useState(true);
    const columns = ["Staff ID", "Staff Name", "Phone Number", "Email Address"]
    const [data, setData] = useState([]);

    const getRecord = async () => {
        const { success, data } = await api.get("staff/hr/pension/report/not-enrolled");
        if (success && data.length > 0) {
            let rows = [];
            data.map((item, index) => {
                rows.push([item.StaffID, item.StaffName, item.PhoneNumber, item.OfficialEmailAddress, item.RSAPin, item.AdminName])
            });
            setData(rows)
        }
        setIsLoading(false);
    };

    useEffect(() => {
        getRecord();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <ReportTable title={"Pension Report (Not Enrolled)"} columns={columns} data={data} />
    );
}
const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(HRPensionStaffNotEnrolledReport);

