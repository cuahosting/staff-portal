import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import {useNavigate} from "react-router";
// eslint-disable-next-line no-unused-vars
import AGReportTable from "../../../common/table/AGReportTable";
import Select from "react-select";
// eslint-disable-next-line no-unused-vars
import {showAlert} from "../../../common/sweetalert/sweetalert";

function TimetableMigration(props) {
    const token = props.loginData[0].token
    const [isLoading, setIsLoading] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [timetableList, setTimetableList] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [semesterList, setSemesterList] = useState([]);
    const [schoolSemester, setSchoolSemester] = useState("");
    const [schoolSemester2, setSchoolSemester2] = useState("");
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [semesterOptions2, setSemesterOptions2] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const columns = ["Day", "Module", "Type", "Block", "Venue", "Start Time", "End Time", "Staff", "Group", "Action", "Delete"]
    // eslint-disable-next-line no-unused-vars
    const [tableData, setTableData] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const navigate = useNavigate();
    // eslint-disable-next-line no-unused-vars
    const [selectedSemester, setSelectedSemester] = useState("");
    // eslint-disable-next-line no-unused-vars
    const [selectedSemester2, setSelectedSemester2] = useState("");
    // eslint-disable-next-line no-unused-vars
    const [groupList, setGroupList] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [venueList, setVenueList] = useState([]);

    const [formData, setFormData] = useState({
        timetableData: [],
        from: '',
        to: '',
        InsertedBy: props.loginData[0].StaffID
    })



    const getSemesterList = async () => {
        await axios
            .get(`${serverLink}staff/timetable/timetable/semester`, token)
            .then((res) => {
                let rows = []
                if (res.data.length > 0) {
                    res.data.forEach((row) => {
                        rows.push({value: row.SemesterCode, label: row.SemesterName +"- "+row.SemesterCode})
                    });
                    setSemesterList(res.data);
                    setSemesterOptions(rows)
                    setSemesterOptions2(rows)
                }
            })
            .catch((err) => {
                console.log("NETWORK ERROR FETCHING TIMETABLE SEMESTER");
            });

        setIsLoading(false)
    }

    const onSemesterChange = async (e) => {
        const semester = e.value;
        setSelectedSemester(semester)
        setSchoolSemester(e)
        toast.info('Please wait...')

        if (semester !== '') {
            await axios.get(`${serverLink}staff/timetable/migration/availability/${semester}`, token)
                .then(res => {
                    if (res.data.length > 0) {
                        setFormData({
                            ...formData,
                            timetableData: res.data,
                            from: semester
                        })
                    } else {
                        toast.error(`Sorry, no timetable found for the selected trimester => (${semester}).`);
                        setFormData({
                            ...formData,
                            timetableData: [],
                            from: ""
                        })
                    }
                    setIsLoading(false)
                })
                .catch(e => {console.log("NETWORK ERROR")})
        } else {
            toast.error('Please select semester')
            setIsLoading(false)
        }
    }


    const onSemesterChange2 = async (e) => {
        const semester = e.value;
        setSelectedSemester2(semester)
        setSchoolSemester2(e)
        toast.info('Please wait...')
        if (semester !== '') {
            await axios.get(`${serverLink}staff/timetable/migration/check/${semester}`, token)
                .then(res => {
                    if (res.data.length > 0) {
                        toast.error(`Sorry, timetable already added for the selected trimester => (${semester}).`);
                        setFormData({
                            ...formData,
                            to: ""
                        })
                    } else {
                        setFormData({
                            ...formData,
                            to: semester
                        })
                    }
                    setIsLoading(false)
                })
                .catch(e => {console.log("NETWORK ERROR")})
        } else {
            toast.error('Please select semester')
            setIsLoading(false)
        }
    }

    const run_migration = async (e) => {
        e.preventDefault();
        if (formData.from.toString().trim() === "") {
            toast.error('Please select from semester form field');
            return false;
        }

        if (formData.to.toString().trim() === "") {
            toast.error('Please select to semester form field');
            return false;
        }

        if (formData.timetableData.length < 1) {
            toast.error('Timetable data can not be empty; Please select to semester form field to get timetable data');
            return false;
        }
        toast.info("please wait while system is running migration...");
        await axios.post(`${serverLink}staff/timetable/migration`, formData, token)
            .then((res) => {
                if(res.data.message === "exist"){
                    toast.error(`Sorry, timetable already added for the selected trimester => (${formData.to}).`);
                } else if (res.data.message === "success") {
                    toast.success("Timetable Migration Completed");
                } else {
                    toast.error("NETWORK ERROR. Please try again!");
                }
            })
            .catch((err) => {
                console.log(err);
                toast.error("NETWORK ERROR. Please try again!");
            });
    }


    useEffect(() => {
        getSemesterList()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])


    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Timetable Migration"}
                items={["Academics", "Timetable", "Timetable Migration"]}
            />
           <div className="row">
               <div className="col-md-5">
                   <label htmlFor="SemesterCode">From </label>
                   <Select
                       name="SemesterCode"
                       className="form-select w-100"
                       value={schoolSemester}
                       onChange={onSemesterChange}
                       options={semesterOptions}
                       placeholder="select Semester"
                   />

               </div>
               <div className="col-md-5">
                   <label htmlFor="SemesterCode">To</label>
                   <Select
                       name="SemesterCode"
                       className="form-select w-100"
                       value={schoolSemester2}
                       onChange={onSemesterChange2}
                       options={semesterOptions2}
                       placeholder="select Semester"
                   />

               </div>
               <div className="col-md-2">
                   <br/>
                   <button className="btn btn-primary form-control" type="button" onClick={run_migration} style={{marginTop: '10px'}}>Run Migration</button>
                   <br/>
               </div>
           </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(TimetableMigration);
