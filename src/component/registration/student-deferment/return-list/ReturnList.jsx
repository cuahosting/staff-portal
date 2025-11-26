import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { serverLink } from "../../../../resources/url";
import {
  formatDateAndTime,
  projectLogo,
} from "../../../../resources/constants";
import { useReactToPrint } from "react-to-print";
import {
  projectName,
  projectEmail,
  projectPhone,
} from "../../../../resources/url";
import ReportTable from "../../../common/table/report_table";

function ReturnList(props) {
  const token = props.loginData.token;

  const [isLoading, setIsLoading] = useState(false);
  const [isApproved, setisApproved] = useState(false);
  const [generalDatatable, setGeneralDatatable] = useState([]);
  const columns = [
    "S/N",
    "Student ID",
    "Student Name",
    "Reason",
    "Semesters Off",
    "Guardian Name",
    "Guardian Contact",
    "Applied On"
  ];
 const getDeferments = async()=>{
    await axios
        .get(
          `${serverLink}staff/users/student-manager/student-return-list`, token
        )
        .then((res) => {
          const data = res.data;
          let rows = [];
          if (data.message === "success") {
            data.data.length > 0 &&
              data.data.map((item, index) => {
                rows.push([
                  index + 1,
                  item.StudentID,
                  item.Name,
                  item.Reason,
                  item.NumberOfSemesters,
                  item.ParentName,
                  item.ParentPhoneNumber,
                  formatDateAndTime(
                    item.InsertedOn,
                    "date_and_time"
                  )
                    ]);
              });
          }
          setGeneralDatatable(rows);
        })
        .catch((err) => {
          toast.error("NETWORK ERROR. Please try again!");
        });
 }

  useEffect(() => {
    getDeferments().then((r) => {});
  }, []);



  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Return List"}
        items={["Registration", "Student Deferment", "Return List"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body p-0">

 
            <ReportTable columns={columns} data={generalDatatable} />
            {/* <Table data={generalDatatable} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails[0],
  };
};

export default connect(mapStateToProps, null)(ReturnList);
