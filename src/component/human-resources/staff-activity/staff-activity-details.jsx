import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {toast} from "react-toastify";
import {serverLink} from "../../../resources/url";
import ReportTable from "../../common/table/report_table";
import {currencyConverter, formatDateAndTime} from "../../../resources/constants";

function StaffActivityReport(props) {
    let token = props.loginData[0].token;
    let slug = props.value?.slug;
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Action", "Date and Time"];
    const [tableData,setTableData] = useState([]);

    const fetchData = async () => {
        await axios.get(`${serverLink}staff/settings/dashboard/staff-activity/${slug}`, token)
            .then(res => {
                if (res.data.message === 'success') {
                    let activityData = res.data.data

                    let rowSet = [];
                    activityData.map((item, index) => {
                        rowSet.push([index+1, item.Action, formatDateAndTime(item.InsertedDate, 'date_and_time')]);
                    });
                    setTableData(rowSet)

                } else {
                    toast.info("Something went wrong. Please try again!")
                }
                setIsLoading(false)
            })
            .catch(e => {
                toast.error(`${e.response.statusText}: ${e.response.data}`)
            })
    }

    useEffect(() => {
        if (slug){
            fetchData()
        }
    },[slug])


    return isLoading ? <div style={{height: '400px'}}>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                margin: '-25px 0 0 -25px'
            }}>
                <span className="spinner-border text-primary m-lg-5" role="status"/><br/>
                <span className="text-muted fs-6 fw-semibold mt-5">Loading...</span>
            </div>

        </div> :
        (<>
            <div className="card-body p-2">
                <ReportTable title={"Received Item List"} columns={columns} data={tableData} />
            </div>
        </> )

}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(StaffActivityReport);