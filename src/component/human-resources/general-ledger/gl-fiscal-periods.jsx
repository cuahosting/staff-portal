import React, { useEffect, useState } from "react";
import { api } from "../../../resources/api";
import { connect } from "react-redux/es/exports";
import Loader from "../../common/loader/loader";
import { toast } from "react-toastify";
import PageHeader from "../../common/pageheader/pageheader";
import ReportTable from "../../common/table/ReportTable";
import SearchSelect from "../../common/select/SearchSelect";
import swal from "sweetalert";
import { formatDateAndTime } from "../../../resources/constants";

function GLFiscalPeriods(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [yearList, setYearList] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [periods, setPeriods] = useState([]);
    const [yearInfo, setYearInfo] = useState(null);
    const [dataTable, setDataTable] = useState([]);

    const columns = ["S/N", "Action", "Period Name", "Start Date", "End Date", "Status", "Journals", "Posted"];

    const getYears = async () => {
        const { success, data } = await api.get("staff/finance/finance-and-budget/financial-year");
        if (success && data.message === "success") {
            const years = data.data || [];
            setYearList(years.map((y) => ({ value: y.EntryID, label: `${formatDateAndTime(y.StartDate, "date")} to ${formatDateAndTime(y.EndDate, "date")}` })));
            const active = years.find((y) => y.IsActive === 1);
            if (active) setSelectedYear({ value: active.EntryID, label: `${formatDateAndTime(active.StartDate, "date")} to ${formatDateAndTime(active.EndDate, "date")}` });
        }
        setIsLoading(false);
    };

    const getPeriods = async (yearId) => {
        const { success, data } = await api.get(`staff/finance/gl/periods/list/${yearId}`);
        if (success && data.success) {
            setYearInfo(data.data.year);
            const p = data.data.periods || [];
            setPeriods(p);
            buildTable(p);
        }
    };

    const buildTable = (periodsArr) => {
        const rows = periodsArr.map((item, index) => [
            index + 1,
            <div className="btn-group">
                {item.Status === "Open" && (
                    <button className="btn btn-warning btn-sm" onClick={() => handleClose(item.EntryID)} title="Close Period">
                        <i className="fa fa-lock-open" /> Close
                    </button>
                )}
                {item.Status === "Closed" && (
                    <>
                        <button className="btn btn-success btn-sm" onClick={() => handleReopen(item.EntryID)} title="Reopen Period">
                            <i className="fa fa-unlock" /> Reopen
                        </button>
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                                swal({
                                    title: "Lock Period?",
                                    text: "Once locked, this period cannot be reopened. Are you sure?",
                                    icon: "warning",
                                    buttons: true,
                                    dangerMode: true,
                                }).then((willLock) => {
                                    if (willLock) handleLock(item.EntryID);
                                });
                            }}
                            title="Lock Period"
                        >
                            <i className="fa fa-lock" /> Lock
                        </button>
                    </>
                )}
                {item.Status === "Locked" && (
                    <span className="text-muted">
                        <i className="fa fa-lock" /> Locked
                    </span>
                )}
            </div>,
            item.PeriodName,
            formatDateAndTime(item.StartDate, "date"),
            formatDateAndTime(item.EndDate, "date"),
            item.Status === "Open" ? (
                <span className="badge badge-success">Open</span>
            ) : item.Status === "Closed" ? (
                <span className="badge badge-warning">Closed</span>
            ) : (
                <span className="badge badge-danger">Locked</span>
            ),
            item.JournalCount || 0,
            item.PostedCount || 0,
        ]);
        setDataTable(rows);
    };

    const handleGenerate = async () => {
        if (!selectedYear) return;
        toast.info("Generating periods...");
        const { success, data } = await api.post(`staff/finance/gl/periods/generate/${selectedYear.value}`);
        if (success && data.success) {
            toast.success(`${data.data.periodsGenerated} periods generated`);
            getPeriods(selectedYear.value);
        } else if (data) {
            toast.error(data.message || "Failed to generate periods");
        }
    };

    const handleClose = async (id) => {
        toast.info("Closing period...");
        const { success, data } = await api.patch(`staff/finance/gl/periods/close/${id}`);
        if (success && data.success) {
            toast.success("Period closed");
            getPeriods(selectedYear.value);
        }
    };

    const handleReopen = async (id) => {
        toast.info("Reopening period...");
        const { success, data } = await api.patch(`staff/finance/gl/periods/reopen/${id}`);
        if (success && data.success) {
            toast.success("Period reopened");
            getPeriods(selectedYear.value);
        }
    };

    const handleLock = async (id) => {
        toast.info("Locking period...");
        const { success, data } = await api.patch(`staff/finance/gl/periods/lock/${id}`);
        if (success && data.success) {
            toast.success("Period locked permanently");
            getPeriods(selectedYear.value);
        }
    };

    useEffect(() => {
        getYears();
    }, []);

    useEffect(() => {
        if (selectedYear) {
            getPeriods(selectedYear.value);
        } else {
            setPeriods([]);
            setDataTable([]);
        }
    }, [selectedYear]);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="card" style={{ borderStyle: "none", borderWidth: "0px", width: "100%" }}>
            <div className="">
                <PageHeader
                    title={"FISCAL PERIODS"}
                    items={["Human-Resources", "General Ledger", "Fiscal Periods"]}
                    buttons={
                        periods.length === 0 && selectedYear ? (
                            <button className="btn btn-primary btn-sm" onClick={handleGenerate}>
                                <i className="fa fa-plus me-2"></i>
                                Generate Periods
                            </button>
                        ) : null
                    }
                />

                <div className="row mb-4 px-3">
                    <div className="col-md-4">
                        <label className="form-label fw-bold">Financial Year</label>
                        <SearchSelect
                            value={selectedYear}
                            onChange={(s) => setSelectedYear(s)}
                            options={yearList}
                            isClearable
                            placeholder="Select Financial Year"
                        />
                    </div>
                    {yearInfo && (
                        <div className="col-md-8 d-flex align-items-end">
                            <span className="text-muted">
                                Year: {formatDateAndTime(yearInfo.StartDate, "date")} - {formatDateAndTime(yearInfo.EndDate, "date")} | Periods: {periods.length}
                            </span>
                        </div>
                    )}
                </div>

                <div className="row col-md-12" style={{ width: "100%" }}>
                    <ReportTable title="Fiscal Periods" columns={columns} data={dataTable} height="600px" />
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
    };
};
export default connect(mapStateToProps, null)(GLFiscalPeriods);
