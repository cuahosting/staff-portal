import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { formatDate, formatDateAndTime } from "../../../../resources/constants";
import {useNavigate} from "react-router";
import ReportTable from "../../../common/table/report_table";
import Select from "react-select";

function TimetableReport(props) {
  const token = props.loginData[0].token
  const [isLoading, setIsLoading] = useState(true);
  const [timetableList, setTimetableList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const [schoolSemester, setSchoolSemester] = useState("");
  const [semesterOptions, setSemesterOptions] = useState([]);
  const columns = ["Day", "Module", "Type", "Block", "Venue", "Start Time", "End Time", "Staff", "Group", "Action", "Delete"]
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();
  const [selectedSemester, setSelectedSemester] = useState("");
  const [groupList, setGroupList] = useState([]);
  const [venueList, setVenueList] = useState([]);



  const getSemesterList = async () => {
    await axios
        .get(`${serverLink}staff/timetable/timetable/semester`, token)
        .then((res) => {
            let rows = []
            if (res.data.length > 0) {
                res.data.map((row) => {
                    rows.push({value: row.SemesterCode, label: row.SemesterName +"- "+row.SemesterCode})
                });
                setSemesterList(res.data);
                setSemesterOptions(rows)
            }
        })
        .catch((err) => {
          console.log("NETWORK ERROR FETCHING TIMETABLE SEMESTER");
        });

      await axios
          .get(`${serverLink}staff/timetable/timetable/student/group/list`, token)
          .then((res) => {
              setGroupList(res.data);
          })
          .catch((err) => {
              console.log("NETWORK ERROR FETCHING VENUE LIST");
          });

      await axios
          .get(`${serverLink}staff/timetable/timetable/venue/view`, token)
          .then((res) => {
              setVenueList(res.data);
          })
          .catch((err) => {
              console.log("NETWORK ERROR FETCHING VENUE LIST");
          });

      setIsLoading(false)
  }

    const onSemesterChange = async (e) => {
        setIsLoading(true)
        const semester = e.value;
        setSelectedSemester(semester)
        setSchoolSemester(e)

        if (semester !== '') {
            await axios.get(`${serverLink}staff/timetable/timetable/list/${semester}`, token)
                .then(res => {
                    if (res.data.timetable.length > 0) {
                        let rows = [];
                        res.data.timetable.map((data, index) => {
                            const venue_filter = venueList.filter(i => i.VenueID === parseInt(data.VenueID));
                            const venue_name = venue_filter.length > 0 ? venue_filter[0]['VenueName'] : '--';
                            const block = venue_filter.length > 0 ? venue_filter[0]['BlockName'] : '--';

                            const filter_staff = res.data.staff.filter(i => i.TimetableID === data.EntryID);
                            let staff_list = "";
                            if (filter_staff.length > 0) {
                                filter_staff.map(staff => {
                                    // staff_list += staff.StaffID +'<br/>'
                                    staff_list += staff.StaffID +', '
                                })
                            }

                            const filter_group = res.data.group.filter(i => i.TimetableID === data.EntryID);
                            let group_list = "";
                            if (filter_group.length > 0) {
                                filter_group.map(group => {
                                    // group_list += groupList.filter(i => i.EntryID === parseInt(group.GroupID))[0]['GroupName'] +'<br/>'
                                    group_list += groupList.filter(i => i.EntryID === parseInt(group.GroupID))[0]['GroupName'] +', '
                                })
                            }
                            rows.push(
                                [
                                    data.DayName, data.ModuleCode,
                                    data.ModuleType, block, venue_name,
                                    data.StartTime + ':00', data.EndTime + ':00',
                                    staff_list.replace(/,(\s+)?$/, ''),
                                    group_list.replace(/,(\s+)?$/, ''),
                                    // <span dangerouslySetInnerHTML={{__html: staff_list}} />,
                                    // <span dangerouslySetInnerHTML={{__html: group_list}} />,
                                    <button
                                        className={"btn btn-sm btn-info"}
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() => navigate(`/academics/timetable/update-schedule/${data.EntryID}`)}
                                    ><i className="fa fa-pen" /></button>,
                                    <button
                                        className={"btn btn-sm btn-danger"}
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() => delete_timetable(data.EntryID)}
                                    ><i className="fa fa-trash-alt" /></button>
                                ]
                            )
                        })
                        setTableData(rows)
                    } else {
                        setTableData([])
                        toast.error('No timetable data for the selected semester')
                    }
                    setIsLoading(false)
                })
                .catch(e => {console.log("NETWORK ERROR")})
        } else {
            toast.error('Please select semester')
            setIsLoading(false)
        }
    }

    const delete_timetable = async (id) => {
        toast.info("please wait...");
        await axios
            .delete(`${serverLink}staff/timetable/delete/timetable/${id}`, token)
            .then((res) => {
                if (res.data.message === "success") {
                    toast.success("Deleted Successfully");
                } else {
                    toast.error("NETWORK ERROR. Please try again!");
                }
            })
            .catch((err) => {
                console.log(err);
                toast.error("NETWORK ERROR. Please try again!");
            });
    }


    //
  //   const onEdit = async (e) => {
  //     setIsLoading(true)
  //   setTableData([]);
  //   const semester = e.target.value;
  //   setSelectedSemester(semester)
  //
  //   if (semester !== '') {
  //     await axios.get(`${serverLink}staff/timetable/timetable/list/${semester}`, token)
  //         .then(res => {
  //             if (res.data.timetable.length > 0) {
  //                 let rows = [];
  //                 res.data.timetable.map((data, index) => {
  //                     const venue_filter = venueList.filter(i => i.VenueID === parseInt(data.VenueID));
  //                     const venue_name = venue_filter.length > 0 ? venue_filter[0]['VenueName'] : '--';
  //                     const block = venue_filter.length > 0 ? venue_filter[0]['BlockName'] : '--';
  //
  //                     const filter_staff = res.data.staff.filter(i => i.TimetableID === data.EntryID);
  //                     let staff_list = "";
  //                     if (filter_staff.length > 0) {
  //                         filter_staff.map(staff => {
  //                             // staff_list += staff.StaffID +'<br/>'
  //                             staff_list += staff.StaffID +', '
  //                         })
  //                     }
  //
  //                     const filter_group = res.data.group.filter(i => i.TimetableID === data.EntryID);
  //                     let group_list = "";
  //                     if (filter_group.length > 0) {
  //                         filter_group.map(group => {
  //                             // group_list += groupList.filter(i => i.EntryID === parseInt(group.GroupID))[0]['GroupName'] +'<br/>'
  //                             group_list += groupList.filter(i => i.EntryID === parseInt(group.GroupID))[0]['GroupName'] +', '
  //                         })
  //                     }
  //                     rows.push(
  //                         [
  //                             data.DayName, data.ModuleCode,
  //                             data.ModuleType, block, venue_name,
  //                             data.StartTime + ':00', data.EndTime + ':00',
  //                             staff_list.replace(/,(\s+)?$/, ''),
  //                             group_list.replace(/,(\s+)?$/, ''),
  //                             // <span dangerouslySetInnerHTML={{__html: staff_list}} />,
  //                             // <span dangerouslySetInnerHTML={{__html: group_list}} />,
  //                             <button
  //                                 className={"btn btn-sm btn-info"}
  //                                 data-bs-toggle="modal"
  //                                 data-bs-target="#kt_modal_general"
  //                                 onClick={() => navigate(`/academics/timetable/update-schedule/${data.EntryID}`)}
  //                             ><i className="fa fa-pen" /></button>
  //                         ]
  //                     )
  //                 })
  //                 setTableData(rows)
  //             } else {
  //                 toast.error('No timetable data for the selected semester')
  //             }
  //             setIsLoading(false)
  //         })
  //         .catch(e => {console.log("NETWORK ERROR")})
  //   } else {
  //       toast.error('Please select semester')
  //       setIsLoading(false)
  //   }
  //
  // }

  useEffect(() => {
    getSemesterList()
  },[])


  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Timetable Report"}
        items={["Academics", "Timetable", "Timetable Report"]}
      />
      <div className="flex-column-fluid">
        <label htmlFor="SemesterCode">Select Semester</label>
          <Select
              name="SemesterCode"
              className="form-select w-100"
              value={schoolSemester}
              onChange={onSemesterChange}
              options={semesterOptions}
              placeholder="select Semester"
          />
        {/*<select id="SemesterCode" className="form-select w-100" onChange={onEdit} value={selectedSemester}>*/}
        {/*  <option value="">Select Semester</option>*/}
        {/*  {*/}
        {/*    semesterList.length > 0 &&*/}
        {/*        semesterList.map((semester, index) => {*/}
        {/*          return <option key={index} value={semester.SemesterCode}>{semester.SemesterName}</option>*/}
        {/*        })*/}
        {/*  }*/}
        {/*</select>*/}
        {
          tableData.length > 0 &&
          <ReportTable title={`Timetable Report for ${selectedSemester} Semester`} columns={columns} data={tableData} height={"800px"}/>
        }

      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(TimetableReport);
