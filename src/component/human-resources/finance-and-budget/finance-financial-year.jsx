import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import {toast} from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import {formatDate, formatDateAndTime} from "../../../resources/constants";
import Modal from "../../common/modal/modal";
import ReportTable from "../../common/table/ReportTable";

function FinanceFinancialYear(props) {
    const token = props.LoginDetails[0].token;
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Action", "Year Start Date", "Year End Date", "Is Active", "Updated By", "Updated Date"];
    const [dataTable, setDataTable] = useState([]);
    const formDataVariable = {entry_id:'', start_date:'', end_date:'', inserted_by:props.LoginDetails[0].StaffID, is_active:0}
    const [formData, setFormData] = useState(formDataVariable);

    const getData = async () => {
        await axios.get(`${serverLink}staff/finance/finance-and-budget/financial-year`, token)
            .then((result) => {
                if (result.data.message === 'success') {
                    if (result.data.data.length > 0) {
                        let rows = [];
                        result.data.data.map((item, index) => {
                            rows.push([index+1,
                                <>
                                    <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_general"
                                            onClick={()=>setFormData({
                                                ...formData,
                                                entry_id: item.EntryID, start_date: formatDate(item.StartDate), end_date: formatDate(item.EndDate)
                                            })}
                                    ><i className="fa fa-pen" /></button>
                                    <button className={`btn btn-sm ${item.IsActive===0?'btn-info':'btn-danger'}`}
                                            onClick={()=>handleStatusChange(item.EntryID, item.IsActive, result.data.data)}
                                    >{item.IsActive===0?'Activate':'Deactivate'}</button>
                                </>,
                                formatDateAndTime(item.StartDate, 'date'), formatDateAndTime(item.EndDate, 'date'), item.IsActive === 0 ? 'Not Active' : 'Active', item.InsertedBy, formatDateAndTime(item.InsertedDate, 'date_and_time')
                            ]);
                        });
                        setDataTable(rows)
                    }
                }
                setIsLoading(false);
            })
            .catch((err) => {
                toast.error("NETWORK ERROR")
            });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.start_date === '') {
            toast.error("Please enter the financial year start date");
            return false;
        }
        if (formData.end_date === '') {
            toast.error("Please enter the financial year end date");
            return false;
        }
        toast.info("Submitting...");
        if (formData.entry_id === '') {
            await axios.post(`${serverLink}staff/finance/finance-and-budget/financial-year`, formData, token)
                .then(res => {
                    if (res.data.message === 'success') {
                        toast.success("Year Added Successfully");
                        document.getElementById("closeModal").click();
                        getData();
                    } else {
                        toast.error(res.data.message)
                    }
                })
                .catch((err) => {
                    toast.error("NETWORK ERROR")
                })
        } else {
            await axios.patch(`${serverLink}staff/finance/finance-and-budget/financial-year`, formData, token)
                .then(res => {
                    if (res.data.message === 'success') {
                        toast.success("Year Updated Successfully");
                        getData();
                        document.getElementById("closeModal").click();
                    } else {
                        toast.error(res.data.message)
                    }
                })
                .catch((err) => {
                    toast.error("NETWORK ERROR")
                })
        }
    }

    const handleStatusChange = async (entry_id, is_active, financialYearList) => {
        const sendData = {
            entry_id: entry_id,
            is_active: is_active === 0 ? 1 : 0
        }
        if (is_active === 0) {
            const checker = financialYearList.filter(e=>e.IsActive===1).length;
            if (checker > 0) {
                toast.error("Please deactivate the current active year first");
                return false;
            }
        }

        toast.info("Submitting...");
        await axios.patch(`${serverLink}staff/finance/finance-and-budget/financial-year/change-status`, sendData, token)
            .then(res => {
                if (res.data.message === 'success') {
                    getData();
                } else {
                    toast.error(res.data.message)
                }
            })
            .catch((err) => {
                toast.error("NETWORK ERROR")
            })
    }

    useEffect(() => {
        getData()
    }, []);

    return isLoading ? (
            <Loader />
        ) :
        (
            <>
                <Modal title={formData.entry_id === '' ? 'Add Financial Year' : 'Update Financial Year'}>
                    <form onSubmit={handleSubmit}>
                        <div className="col-md-12 mb-3">
                            <div className="form-group">
                                <label htmlFor="start_date">Financial Year Start Date</label>
                                <input type="date" id="start_date" className="form-control" value={formData.start_date} onChange={(e)=>setFormData({...formData, [e.target.id]: e.target.value})}/>
                            </div>
                        </div>
                        <div className="col-md-12 mb-3">
                            <div className="form-group">
                                <label htmlFor="end_date">Financial Year End Date</label>
                                <input type="date" id="end_date" className="form-control" value={formData.end_date} onChange={(e)=>setFormData({...formData, [e.target.id]: e.target.value})}/>
                            </div>
                        </div>

                        <button className="btn btn-primary w-100">Submit</button>
                    </form>
                </Modal>
                <div className="card" style={{ borderStyle: 'none', borderWidth: '0px', width:'100%' }}>
                    <div className="">
                        <PageHeader
                            title={"Financial Year"}
                            items={["Human-Resources", "Finance & Budget", "Financial Year"]}
                            buttons={
                                <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_general"  onClick={()=>setFormData(formDataVariable)}>
                                    <i className="fa fa-plus me-2"></i>
                                    Add Financial Year
                                </button>
                            }
                        />
                        <div className="row col-md-12" style={{width:'100%'}}>
                            <ReportTable
                                title={`Financial Year`}
                                columns={columns}
                                data={dataTable}
                                height={"600px"}
                            />
                        </div>
                    </div>

                </div>
            </>
        )
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
    };
};
export default connect(mapStateToProps, null)(FinanceFinancialYear);
