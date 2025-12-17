import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import ReportTable from "../../common/table/ReportTable";
import StaffActivityReport from "./staff-activity-details";
function StaffActivity(props) {
    const [isLoading, setIsLoading] = useState(true);
    const initialValue = { StaffID: '', StaffName: '', SubmittedBy: '', UpdatedBy: '' }
    const [formData, setFormData] = useState(initialValue);
    const columns = ["S/N", "StaffID", "Staff Name", "Designation", "Department", "Activities Count", "Portal Usage"];
    const [tableData, setTableData] = useState([]);

    const fetchData = async () => {
        try {
            const { success, data: res } = await api.get("staff/settings/dashboard/staff-activity");
            if (success && res.message === 'success') {

                const row = [];
                if (res.data.length > 0) {
                    res.data.forEach((r, i) => {
                        row.push([i + 1, r.StaffID, r.StaffName, r.Designation, r.Department, r.PageVisited,
                        (
                            <button
                                className="btn btn-sm"
                                data-bs-toggle="modal"
                                data-bs-target="#kt_modal_general"
                                style={{ backgroundColor: '#425b5e' }}
                                onClick={() => {
                                    setFormData({
                                        ...formData,
                                        slug: r.StaffID,
                                        StaffName: r.StaffName,
                                    })
                                }
                                }
                            >
                                <i className="fa fa-list-alt text-white" /> </button>
                        )
                        ])
                    })
                    setTableData(row)
                } else {
                    setTableData([])
                }
            } else {
                toast.info("Something went wrong. Please try again!")
            }
            setIsLoading(false)
        } catch (e) {
            toast.error("NETWORK ERROR")
        }
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Staff Activity Report (Portal Usage)"} items={["Staff", "Staff Activity Report"]} />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                    </div>
                    <div className="card-body p-0">
                        <ReportTable height="700px" title={"Staff Activity Report (Portal Usage)"} columns={columns} data={tableData} />
                    </div>
                </div>
                <Modal large title={<h1>{formData.StaffName} - Staff Portal Usage Report</h1>}>
                    <StaffActivityReport
                        value={formData}
                    />
                </Modal>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(StaffActivity);
