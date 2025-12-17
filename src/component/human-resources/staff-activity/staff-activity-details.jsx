import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import ReportTable from "../../common/table/ReportTable";
import { formatDateAndTime } from "../../../resources/constants";

function StaffActivityReport(props) {
    let slug = props.value?.slug;
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Action", "Date and Time"];
    const [tableData, setTableData] = useState([]);

    const fetchData = async () => {
        try {
            const { success, data: res } = await api.get(`staff/settings/dashboard/staff-activity/${slug}`);
            if (success && res.message === 'success') {
                let activityData = res.data

                let rowSet = [];
                activityData.map((item, index) => {
                    rowSet.push([index + 1, item.Action, formatDateAndTime(item.InsertedDate, 'date_and_time')]);
                });
                setTableData(rowSet)

            } else {
                toast.info("Something went wrong. Please try again!")
            }
            setIsLoading(false)
        } catch (e) {
            toast.error("NETWORK ERROR")
        }
    }

    useEffect(() => {
        if (slug) {
            fetchData()
        }
    }, [slug])


    return isLoading ? <div style={{ height: '400px' }}>
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            margin: '-25px 0 0 -25px'
        }}>
            <span className="spinner-border text-primary m-lg-5" role="status" /><br />
            <span className="text-muted fs-6 fw-semibold mt-5">Loading...</span>
        </div>

    </div> :
        (<>
            <div className="card-body p-2">
                <ReportTable title={"Received Item List"} columns={columns} data={tableData} />
            </div>
        </>)

}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(StaffActivityReport);