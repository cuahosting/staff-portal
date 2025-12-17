import React, { useState, useMemo, useEffect } from "react";
import { connect } from "react-redux";
import Loader from "../../common/loader/loader";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import { api } from "../../../resources/api";
import { toast } from "react-toastify";
import { serverLink } from "../../../resources/url";
import ReportTable from "../../common/table/ReportTable";
import { formatDateAndTime, shortCode } from "../../../resources/constants";
import * as DOMPurify from 'dompurify';
import SearchSelect from "../../common/select/SearchSelect";

const MyComplainList = (props) => {
    const color = ['success', 'danger', 'info', 'secondary', 'primary', 'warning'];
    const [isLoading, setisLoading] = useState(true);
    const [complainTypes, setComplainTypes] = useState([]);
    const columns = ["SN", "FullName", "User Type", "Complain Type", "Title", "Description", "File", "Status", "Action"];
    const [complain, setComplain] = useState({
        StaffID: "",
        Stage: "",
        StageDescription: "",
        InsertedBy: props.LoginDetails[0].StaffID,
        currentSemester: props.currentSemester,
        EntryID: "",
    });
    const [semesterList, setSemesterList] = useState([]);
    const [data, setData] = useState([]);
    const [trackingList, setTrackingList] = useState([]);

    // Options for SearchSelect
    const semesterOptions = useMemo(() => {
        return semesterList.map(x => ({
            value: x.SemesterCode,
            label: x.SemesterName
        }));
    }, [semesterList]);

    const getData = async () => {
        const [typesRes, semesterRes] = await Promise.all([
            api.get("staff/service-desk/complain-types/list"),
            api.get("staff/service-desk/timetable_semester")
        ]);

        if (typesRes.success && typesRes.data?.length > 0) {
            setComplainTypes(typesRes.data);
        }

        if (semesterRes.success && semesterRes.data?.length > 0) {
            setSemesterList(semesterRes.data);
        }

        setisLoading(false);
    };

    const getComplainst = async (semester) => {
        if (semester === "") {
            toast.error("Please select semester");
            setData([]);
            return;
        }

        const { success, data: resultData } = await api.get(
            `staff/service-desk/complain-list/${semester}/${complain.InsertedBy}`
        );

        if (success && resultData?.length > 0) {
            const rows = resultData.map((item, index) => [
                index + 1,
                item.UserType === "staff" ? item.StaffName : item.StudentName,
                item.UserType,
                complainTypes.find(x => x.EntryID.toString() === item.ComplainType.toString())?.ComplainType || '',
                item.ComplainTitle,
                <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#description"
                    onClick={() => setComplain(prev => ({ ...prev, Description: item.Description }))}
                >
                    Description
                </button>,
                <a
                    className="btn btn-link"
                    target={"_blank"}
                    rel="noreferrer"
                    href={`${serverLink}public/uploads/${shortCode}/service-desk/${item.FilePath}`}
                >
                    View File
                </a>,
                <span className={
                    item.Status === "Submitted" ? "badge badge-secondary"
                        : item.Status === "1" ? "badge badge-info"
                            : item.Status === "2" ? "badge badge-info"
                                : item.Status === "3" ? "badge badge-primary"
                                    : "badge badge-success"
                }>
                    {item.Status === "Submitted" ? "Submitted"
                        : item.Status === "1" ? "Assigned to staff"
                            : item.Status === "2" ? "Escalated"
                                : item.Status === "3" ? "In-progress"
                                    : "Resolved"}
                </span>,
                <button
                    className="btn btn-sm btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#resolve"
                    onClick={() => {
                        setComplain(prev => ({
                            ...prev,
                            EntryID: item.EntryID,
                            Status: item.Status
                        }));
                        setTrackingList([]);
                        getTracking(item.EntryID);
                    }}
                >
                    <i className="fa fa-pen" />
                </button>
            ]);
            setData(rows);
        } else {
            toast.error('No records');
            setData([]);
        }
    };

    const getTracking = async (complain_id) => {
        const { success, data } = await api.get(`staff/service-desk/tracking-list/${complain_id}`);

        if (success && data?.length > 0) {
            setTrackingList(data);
        }
    };

    const onEdit = (e) => {
        if (e.target.id === "SemesterCode") {
            getComplainst(e.target.value);
        }
        setComplain({
            ...complain,
            [e.target.id]: e.target.value
        });
    };

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Service Desk"}
                items={["Users", "Service Desk", "Complain List"]}
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body pt-5">
                        <div className="row col-md-12 mb-5 mt-5">
                            <div className="form-group">
                                <label htmlFor="SemesterCode">Semester </label>
                                <SearchSelect
                                    id="SemesterCode"
                                    value={semesterOptions.find(opt => opt.value === complain.SemesterCode) || null}
                                    options={semesterOptions}
                                    onChange={(selected) => onEdit({ target: { id: 'SemesterCode', value: selected?.value || '' } })}
                                    placeholder="-select type-"
                                    isClearable={false}
                                />
                            </div>
                            <div className="col-md-12 mt-5">
                                {data.length > 0 && <ReportTable columns={columns} data={data} height="700px" />}
                            </div>

                            <Modal title={"Complaint description"} id="description" width={"500px"}>
                                <div className="col-md-12">
                                    <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(complain.Description) }}></p>
                                </div>
                            </Modal>

                            <Modal title={"Tracking"} id="resolve" large={true} style={{ width: '500px' }}>
                                <div className="row col-md-12">
                                    <div className="card-body">
                                        <div className="timeline-label mb-5">
                                            {trackingList.length > 0 ? (
                                                <>
                                                    <div className="timeline-item">
                                                        <div className="timeline-label fw-bold text-gray-800 fs-6">time</div>
                                                        <div className="timeline-badge">
                                                            <i className="fa fa-genderless text-success fs-1" />
                                                        </div>
                                                        <div className="timeline-content d-flex">
                                                            <span className="fw-bold text-gray-800 ps-3">Complain Tracking timeline</span>
                                                        </div>
                                                    </div>
                                                    {trackingList.map((x, y) => {
                                                        const color_ = color[Math.floor(Math.random() * color.length)];
                                                        const date_ = new Date(x.InsertedDate);
                                                        const date = formatDateAndTime(x.InsertedDate, "date");
                                                        let hrs = date_.getHours();
                                                        let mins = date_.getMinutes();
                                                        if (hrs <= 9) hrs = '0' + hrs;
                                                        if (mins < 10) mins = '0' + mins;
                                                        const postTime = hrs + ':' + mins;

                                                        return (
                                                            <div className="timeline-item" key={y}>
                                                                <div className="timeline-label fw-bolder text-gray-800 fs-6">{postTime}</div>
                                                                <div className="timeline-badge">
                                                                    <i className={`fa fa-genderless text-${color_} fs-1`} />
                                                                </div>
                                                                <div className="fw-mormal timeline-content ps-3">
                                                                    <span className="fw-bolder text-gray-400 fs-8">{date} : {postTime}</span><br />
                                                                    <span className="fw-bold">
                                                                        {x.ActionBy}:
                                                                    </span>
                                                                    <span style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(x.Description) }} />
                                                                    {x.AssignedTo !== "" && (
                                                                        <p>Action Assigned To: <span className="fw-bold">{x.AssignedTo} {x.StaffName}</span></p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </>
                                            ) : (
                                                <label className="alert alert-info badge-lg">
                                                    No Tracking Record Found
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        LoginDetails: state.LoginDetails,
        currentSemester: state.currentSemester
    };
};

export default connect(mapStateToProps, null)(MyComplainList);