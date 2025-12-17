import React, { useEffect, useState } from "react";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import ReportTable from "../../../common/table/ReportTable";
import { currencyConverter } from "../../../../resources/constants";
import Modal from "../../../common/modal/modal";
import { connect } from "react-redux";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { ProgressBar } from "react-bootstrap";

function HRPayrollRunAllowanceAndDeduction(props) {
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["Staff ID", "Staff Name", "Post Type", "Ledger Account", "Start Date", "End Date", "Frequency", "Amount"];
    const [data, setData] = useState([]);
    const [recordList, setRecordList] = useState([]);
    const [createItem, setCreateItem] = useState({
        salary_id: '',
        staff_id: '',
        allowance_amount: 0,
        deduction_amount: 0,
        salary_date: '',
        gl_account: '',
        inserted_by: props.loginData[0].StaffID
    });
    const [progress, setProgress] = useState({
        percentage: 0,
        variant: 'danger'
    });
    const [canSubmit, setCanSubmit] = useState(false);

    const getRecord = async () => {
        const { success, data: resultData } = await api.get("staff/hr/payroll/entry/active/list");

        if (success && resultData?.length > 0) {
            setRecordList(resultData);
            const rows = resultData.map(item => [
                item.StaffID,
                item.StaffName,
                item.PostType,
                item.Description,
                item.StartDate,
                item.EndDate,
                item.Frequency,
                currencyConverter(item.Amount)
            ]);
            setData(rows);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        getRecord();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onOpenModal = () => {
        setProgress({ ...progress, percentage: 0, variant: 'danger' });
        setCanSubmit(false);
        setCreateItem({ ...createItem, salary_date: "" });
    };

    const onEdit = async (e) => {
        setCreateItem({ ...createItem, [e.target.id]: e.target.value });
        setCanSubmit(false);

        const { success, data } = await api.post("staff/hr/payroll/entry/check_if_ran", { salary_date: e.target.value });

        if (success) {
            if (data > 0) {
                toast.error(`Allowance and deduction already ran for ${e.target.value}`);
                setCanSubmit(false);
            } else {
                setCanSubmit(true);
            }
        }
    };

    const onSubmit = async () => {
        setCanSubmit(false);
        setProgress({ ...progress, percentage: 0, variant: 'danger' });

        for (let index = 0; index < recordList.length; index++) {
            const item = recordList[index];
            const sendData = {
                salary_id: item.EntryID,
                staff_id: item.StaffID,
                allowance_amount: item.PostType === 'Allowance' ? item.Amount : 0,
                deduction_amount: item.PostType === "Deduction" ? item.Amount : 0,
                gl_account_name: item.Description,
                salary_date: createItem.salary_date,
                inserted_by: createItem.inserted_by,
                gl_account: item.LedgerAccount
            };

            const { success, data } = await api.post("staff/hr/payroll/add/allowance", sendData);

            if (success && data?.message === "success") {
                const percentage = ((index + 1) / recordList.length) * 100;
                let variant = "";
                if (percentage <= 25) variant = 'danger';
                else if (percentage > 25 && percentage <= 50) variant = 'warning';
                else if (percentage > 50 && percentage <= 75) variant = 'info';
                else variant = 'success';

                setProgress({
                    ...progress,
                    percentage: Math.round(percentage),
                    variant: variant
                });

                if (index + 1 === recordList.length) {
                    toast.success("Allowance and deduction saved successful");
                    document.getElementById("closeModal").click();
                    getRecord();
                }
            } else if (!success) {
                showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
                break;
            }
        }
    };

    return isLoading ? (
        <Loader />
    ) : (
        <>
            <div style={{ width: '100%' }}>
                {recordList.length > 0 && (
                    <div className="d-flex justify-content-end">
                        <button
                            type="button"
                            className="btn btn-primary btn-sm float-end"
                            data-bs-toggle="modal"
                            data-bs-target="#kt_modal_general"
                            onClick={onOpenModal}
                        >
                            RUN
                        </button>
                    </div>
                )}

                <ReportTable title={`Run Allowances and Deductions`} columns={columns} data={data} />
            </div>

            <Modal title={"Manage Allowance and Deduction Form"} large={true}>
                <h4 className="alert alert-danger">You can only run allowance and deduction once per month</h4>
                <div className="form-group mb-5">
                    <label htmlFor="salary_date">Select Month & Year</label>
                    <input
                        type="month"
                        id="salary_date"
                        max={`${new Date().getFullYear()}-${new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1}`}
                        onChange={onEdit}
                        value={createItem.salary_date}
                        className="form-control"
                    />
                </div>

                <ProgressBar now={progress.percentage} label={`${progress.percentage}%`} variant={progress.variant} striped />

                <div className="form-group pt-2">
                    {canSubmit && <button onClick={onSubmit} className="btn btn-primary w-100">Run</button>}
                </div>
            </Modal>
        </>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(HRPayrollRunAllowanceAndDeduction);
