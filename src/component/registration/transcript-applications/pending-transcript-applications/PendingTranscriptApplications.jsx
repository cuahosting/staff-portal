import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../../common/loader/loader";
import PageHeader from "../../../common/pageheader/pageheader";
import { serverLink } from "../../../../resources/url";
import Modal from "../../../common/modal/modal";
import ReportTable from "../../../common/table/ReportTable";
import { formatDateAndTime, shortCode } from "../../../../resources/constants";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";

function AllTranscriptApplications(props) {
  const token = props.loginData.token;

  const [isLoading, setIsLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [studentName, setStudentName] = useState("");
  const [tableData, setTableData] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }
  const columns = [
    "S/N",
    "Student ID",
    "Student Name",
    "Student Phone",
    "Student Email",
    "Inst. Name",
    "Inst. Phone",
    "Inst. Email",
    "Inst. Address",
    "Action",
  ];
  const getTranscripts = async () => {
    await axios
      .get(`${serverLink}staff/registration/transcripts/pending`, token)
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
                item.PhoneNumber,
                item.EmailAddress,
                item.InstitutionName,
                item.InstitutionPhoneNo,
                item.InstitutionEmail,
                item.InstitutionAddress,
                <>
                  <button
                    type="button"
                    id="ApproveBtn"
                    data-toggle="tooltip"
                    data-placement="right"
                    title="Cleared"
                    onClick={() => {
                      TakeDecision("1", item.StudentID);
                    }}
                    className="btn btn-sm btn-success "
                  >
                    <i className={"fa fa-check"} />
                  </button>
                  <button
                    type="button"
                    id="ApproveBtn"
                    data-toggle="tooltip"
                    data-placement="right"
                    title="View Payment"
                    // data-bs-toggle="modal"
                    // data-bs-target="#kt_modal_general"
                    onClick={() => {
                      setStudentName(item.Name);
                      setFileUrl(
                        `${serverLink}public/uploads/${shortCode}/student_uploads/transcript_uploads/${item.ReceiptFile}`
                      );
                    }}
                    className="btn btn-sm btn-primary "
                  >
                    <i className={"fa fa-eye"} />
                  </button>
                </>,
              ]);
            });
        }
        setTableData(rows);
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  };
  async function TakeDecision(decision, id) {
    const dataTo = {
      decision,
      id,
    };
    await axios
      .patch(`${serverLink}staff/registration/transcripts/accept`, dataTo, token)
      .then((res) => {
        if (res.data.message === "success") {
          toast.success("Accepted Successfully");
          getTranscripts();
        } else {
          toast.error("An error has occurred. Please try again!");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  }
  useEffect(() => {
    getTranscripts().then();
  }, []);
  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Pending Transcript Applications"}
        items={[
          "Registraion",
          "Transcript Applications",
          "Pending Transcript Applications",
        ]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body p-0">
            {" "}
            {tableData.length > 0 ? (
              <ReportTable columns={columns} data={tableData} />
            ) : (
              <></>
            )}
          </div>
        </div>

        <Modal title={"Payment Evidence for " + studentName}>
          <form>
            <div className="form-group pt-2">
              <Document
                file={`${fileUrl}`}
                onLoadSuccess={onDocumentLoadSuccess}
              >
                <Page pageNumber={pageNumber} />
              </Document>
              <p>
                Page {pageNumber} of {numPages}
              </p>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails[0],
  };
};

export default connect(mapStateToProps, null)(AllTranscriptApplications);
