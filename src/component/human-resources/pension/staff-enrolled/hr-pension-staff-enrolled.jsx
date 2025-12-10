import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import ReportTable from "../../../common/table/ReportTable";
import { connect } from "react-redux";

function HRPensionStaffEnrolledReport(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const columns = ["Staff ID", "Staff Name", "Phone Number", "Email Address", "RSA PIN", "Administrator"]
    const [data, setData] = useState([]);

    const getRecord = async () => {
        await axios
            .get(`${serverLink}staff/hr/pension/report/enrolled`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    let rows = [];
                    result.data.map((item, index) => {
                            rows.push([item.StaffID, item.StaffName, item.PhoneNumber, item.OfficialEmailAddress, item.RSAPin, item.AdminName]
                        )
                    });
                    setData(rows)
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });
    };

    useEffect(() => {
        getRecord();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <ReportTable title={"Pension Report (Enrolled)"} columns={columns} data={data} />
    );
}

const mapStateToProps = (state) => {
    return {
      loginData: state.LoginDetails,
    };
  };
  
  export default connect(mapStateToProps, null)(HRPensionStaffEnrolledReport);
