import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../common/loader/loader";
import PageHeader from "../../common/pageheader/pageheader";
import { serverLink } from "../../../resources/url";
import Modal from "../../common/modal/modal";
import ReportTable from "../../common/table/report_table";
import { formatDate, formatDateAndTime } from "../../../resources/constants";
import { showAlert } from "../../common/sweetalert/sweetalert";

function AdmissionDateLine(props) {
    const token = props.loginDetails[0].token;

    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([])
    const columns = ["SN", "StartDate", "EndDate", "Status", "action"];
    const [dateline, setDateLine] = useState({
        EntryID: "",
        StartDate: "",
        EndDate: "",
        IsAlwaysOpen: "",
        InsertedBy: props.loginDetails[0].StaffID
    })

    const getData = async () => {
        await axios.get(`${serverLink}registration/admissions/admission-dateline/list`, token)
            .then((result) => {
                let rows = []
                if (result.data.length > 0) {
                    result.data.map((item, index) => {
                        rows.push([
                            index + 1,
                            formatDateAndTime(item.StartDate,"date"),
                            formatDateAndTime(item.EndDate, "date"),
                            <label className={item.IsAlwaysOpen === 0 ? "badge badge-info" :"badge badge-success"}>
                                {item.IsAlwaysOpen === 0 ? "Yes" :"No"}
                            </label>,
                            <button className="btn btn-sm btn-primary" data-bs-toggle="modal"
                            data-bs-target="#kt_modal_general" onClick={() => {
                                setDateLine({
                                    ...dateline,
                                    EntryID: item.EntryID,
                                    StartDate: formatDate(item.StartDate),
                                    EndDate: formatDate(item.EndDate),
                                    IsAlwaysOpen: item.IsAlwaysOpen,
                                })
                            }}>
                                <i className="fa fa-pen" />
                            </button>
                        ])
                    })
                }
                setData(rows)
            })
            .catch((err) => {
                toast.error("NETWORK ERROR. Please try again!");
            });
    };

    const onEdit =(e)=>{
        setDateLine({
            ...dateline,
            [e.target.id]: e.target.value
        })
    }

    useEffect(() => {
        getData();
    }, []);

    const Reset = () => {
        setDateLine({
            ...dateline,
            EntryID: "",
            StartDate: "",
            EndDate: "",
            IsAlwaysOpen: "",
        })
    }

    const handleSubmit=async(e)=>{
        e.preventDefault();
       try {
            if(dateline.EntryID === ""){
                await axios.post(`${serverLink}registration/admissions/dateline/add`, dateline, token)
                .then((result)=>{
                    if(result.data.message==="success"){
                        getData();
                        document.getElementById("closeModal").click();
                        toast.success("dateline added successfullyy");
                    }
                })
            }else{
                await axios.patch(`${serverLink}registration/admissions/dateline/update`, dateline, token)
                .then((result)=>{
                    if(result.data.message==="success"){
                        getData();
                        document.getElementById("closeModal").click();
                        toast.success("dateline updated successfullyy");
                    }
                })
            }
       } catch (e) {
        showAlert("Error","Network error, please check your connection", "error")
       }
    }

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Registration"}
                items={["Registraion", "Admissions", "Admission Deadline"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-header border-0 pt-6 mb-4">
                        <div className="card-title" >
                            <h2>Admission Deadline</h2>
                        </div>
                        <div className="card-toolbar">
                            <div
                                className="d-flex justify-content-end"
                                data-kt-customer-table-toolbar="base"
                            >
                                <button
                                    type="button"
                                    onClick={() => Reset()}
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                >
                                    Add Dateline
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <ReportTable columns={columns} data={data} />
                    </div>
                </div>

                <Modal title={"Dateline Form"}>
                    <form onSubmit={handleSubmit} >

                        <div className="form-group pt-5">
                            <label htmlFor="hostelName">Start Date</label>
                            <input
                                value={dateline.StartDate}
                                onChange={onEdit}
                                type={"date"}
                                id="StartDate"
                                required
                                className="form-control"
                            />
                        </div>
                        <div className="form-group pt-5">
                            <label htmlFor="manager">End Date</label>
                            <input
                                value={dateline.EndDate}
                                onChange={onEdit}
                                id="EndDate"
                                type="date"
                                min=""
                                required
                                className="form-control"
                            />
                        </div>
                        <div className="form-group pt-5">
                            <label htmlFor="IsAlwaysOpen">End Date</label>
                            <select className="form-select" id="IsAlwaysOpen" value={dateline.IsAlwaysOpen} onChange={onEdit}  >
                                <option value={""}>-select status-</option>
                                <option value={1}>True</option>
                                <option value={0}>False</option>
                            </select>
                        </div>
                        <div className="form-group pt-5">
                            <button className="btn btn-primary w-100">Save</button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginDetails: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(AdmissionDateLine);
