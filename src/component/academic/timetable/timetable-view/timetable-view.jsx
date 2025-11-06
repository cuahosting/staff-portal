import React, { useEffect, useState, useRef } from "react";
import Loader from "../../../common/loader/loader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import TimetableViewContainer from "./section/timetable-view-container";
import { toast } from "react-toastify";
import { useReactToPrint } from 'react-to-print'
import { connect } from "react-redux";

function TimetableView(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [studentGroupList, setStudentGroupList] = useState([]);
    const [venueList, setVenueList] = useState([]);
    const [timetableData, setTimetableData] = useState([]);
    const [title, setTitle] = useState("");
    const [groupList, setGroupList] = useState([]);
    const [selectedGroupList, setSelectedGroupList] = useState([]);
    const componentRef = useRef();
    const token = props.loginData[0].token


    const getRecords = async () => {
        await axios
            .get(`${serverLink}staff/timetable/timetable/venue/view`, token)
            .then((res) => {
                setVenueList(res.data);
            })
            .catch((err) => {
                console.log("NETWORK ERROR FETCHING VENUE LIST");
            });

        await axios
            .get(`${serverLink}staff/timetable/timetable/student/group/list`, token)
            .then((res) => {
                setStudentGroupList(res.data);
            })
            .catch((err) => {
                console.log("NETWORK ERROR FETCHING GROUP LIST");
            });
    }


    const fetchTimetableData = async () => {
        const sendData = {
            type: props.type,
            item_id: props.item_id,
            semester_code: props.semester
        }
        setTimetableData([])

        await axios.post(`${serverLink}staff/timetable/timetable/report/view`, sendData, token)
            .then(res => {
                const data = res.data;

                if (data.message === 'success') {
                    const timetable = data.timetable;
                    const group = data.group;
                    const staff = data.staff;
                    const group_list = data.group_list;

                    if (timetable.length > 0) {
                        let timetable_row = [];
                        let group_record = [];
                        timetable.map(tt => {
                            tt.HallID = parseInt(tt.VenueID);
                            tt.StaffList = staff.filter(i => i.TimetableID === tt.EntryID);
                            tt.VenueID = venueList.filter(f => f.VenueID === parseInt(tt.VenueID)).length > 0 ?
                                venueList.filter(f => f.VenueID === parseInt(tt.VenueID))[0]['VenueName'] : '';
                            tt.Color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

                            const filter_group = group.filter(t => t.TimetableID === tt.EntryID)
                            if (filter_group.length > 0) {
                                let group_list = [];
                                filter_group.map(g => {
                                    group_list.push({ groupID: parseInt(g.GroupID), groupName: studentGroupList.filter(b => b.EntryID === parseInt(g.GroupID))[0]['GroupName'] })
                                    group_record.push(parseInt(g.GroupID))
                                })
                                tt.GroupList = group_list
                            }
                            timetable_row.push(tt)
                        })
                        setGroupList([...new Set(group_record)].sort())
                        setTimetableData(timetable_row)
                        setSelectedGroupList(group_list)
                    } else {
                        toast.error('No Record Found for the selected entries')
                    }
                    setTitle(data.title)
                } else {
                    toast.error("ERROR FETCHING RECORD. PLEASE TRY AGAIN!")
                }
            })
            .catch(error => {
                toast.error("NETWORK ERROR!")
            })
        setIsLoading(false)
    }

    useEffect(() => {
        getRecords()
    }, [props.item_id])

    useEffect(() => {
        getRecords()
    }, [])

    useEffect(() => {
        if (venueList.length > 0 && studentGroupList.length > 0) {
            fetchTimetableData();
        }
    }, [studentGroupList])

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return isLoading ? (
        <Loader />
    ) : (
        <>
            {
                timetableData.length > 0 &&
                <>
                    {
                        !props.hidePrint && <button className="btn btn-primary btn-sm" onClick={handlePrint}>Print</button>
                    }
                    <div id="printContainer" ref={componentRef}>
                        {
                            props.type === 'staff' || props.type === 'group' || props.type === 'module' || props.type === 'student' || props.type === 'venue' ?
                                <TimetableViewContainer title={`${title}`} type={props.type} sub_title={`Timetable for: ${title} - Semester: ${props.semester}`} data={timetableData} show_key={props.show_key} /> : ''
                        }

                        {
                            props.type === 'faculty' || props.type === 'department' || props.type === 'course' ?
                                selectedGroupList.length > 0 ?
                                    selectedGroupList.map(item => {
                                        let group_timetable = [];
                                        if (timetableData.length > 0) {
                                            timetableData.map(tt => {
                                                const filter = tt.GroupList.filter(i => i.groupID === item.EntryID)
                                                if (filter.length > 0) {
                                                    group_timetable.push(tt)
                                                }
                                            })
                                        }
                                        return <TimetableViewContainer key={item.EntryID} type={props.type} title={`${item.GroupName}`} sub_title={`Timetable for: ${item.GroupName} - Semester: ${props.semester}`} data={group_timetable} show_key={props.show_key} />
                                    }) : <p className="alert alert-danger">No Schedule Found</p>
                                : ""
                        }

                        {
                            props.type === 'campus' ?
                                venueList.length > 0 ?
                                    venueList.map(item => {
                                        if (item.CampusID === parseInt(props.item_id)) {
                                            const filter = timetableData.filter(i => i.HallID === item.VenueID)
                                            if (filter.length > 0) {
                                                return <TimetableViewContainer key={item.EntryID} type={props.type} title={`${item.VenueName}`} sub_title={`Timetable for: ${item.VenueName} - Semester: ${props.semester}`} data={filter} show_key={props.show_key} />
                                            } else {
                                                return <p className={"alert alert-danger"}>No Schedule in {item.VenueName}</p>
                                            }
                                        }
                                    }) : <p className="alert alert-danger">No Schedule Found</p>
                                : ""
                        }

                        {
                            props.type === 'block' ?
                                venueList.length > 0 ?
                                    venueList.map(item => {
                                        if (item.BlockID === parseInt(props.item_id)) {
                                            const filter = timetableData.filter(i => i.HallID === item.VenueID)
                                            if (filter.length > 0) {
                                                return <TimetableViewContainer key={item.EntryID} type={props.type} title={`${item.VenueName}`} sub_title={`Timetable for: ${item.VenueName} - Semester: ${props.semester}`} data={filter} show_key={props.show_key} />
                                            } else {
                                                return <p className={"alert alert-danger"}>No Schedule in {item.VenueName}</p>
                                            }
                                        }
                                    }) : <p className="alert alert-danger">No Schedule Found</p>
                                : ""
                        }
                    </div>

                </>
            }
        </>
    )
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(TimetableView);
