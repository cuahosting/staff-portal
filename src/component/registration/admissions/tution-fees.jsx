import axios from 'axios';
import React, { Component, useEffect, useState } from 'react'
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { currencyConverter } from '../../../resources/constants';
import { serverLink } from '../../../resources/url';
import Loader from '../../common/loader/loader';
import Modal from '../../common/modal/modal';
import PageHeader from '../../common/pageheader/pageheader';
import { showAlert } from '../../common/sweetalert/sweetalert';
import ReportTable from '../../common/table/report_table';

function TuitionFee(props)
{
    const token = props.login[0]?.token;
    const [isLoading, setIsLoading] = useState(true);
    const [tuitionList, setTuitionList] = useState([]);
    const [courseList, setCourseList] = useState([]);
    const [formData, setFormData] = useState({
        id: "",
        CourseCode: "",
        Amount: "",
        Level: "",
        Semester: "",
        InsertedBy: props.login[0]?.StaffID
    })
    const [semesterList, setSemesterList] = useState([])

    const columns = ["SN", "Course Code", "Course Name", "Amount", "Level", "Semester", "Added By", "Update"];
    const [data, setData] = useState([])

    const getData = async (abortcont) =>
    {
        let cList;
        try
        {
            await axios.get(`${serverLink}registration/admissions/semester`, token).then((res) =>
            {
                setSemesterList(res.data);
            });

            await axios.get(`${serverLink}staff/academics/course/list`, token).then((res) =>
            {
                if (res.data.length > 0)
                {
                    cList = res.data;
                    setCourseList(res.data)
                }
            })
            await axios.get(`${serverLink}registration/admissions/tuition-fee/list`).then((res) =>
            {
                if (res.data.length > 0)
                {
                    setTuitionList(res.data);
                    let rows = [];
                    res.data.map((x, i) =>
                    {
                        let course = cList?.filter(j => j.CourseCode === x.CourseCode)
                        rows.push([
                            i + 1,
                            x.CourseCode,
                            course.length > 0 ? course[0]?.CourseName : 'N/A',
                            currencyConverter(x.TuitionAmount),
                            x.Level,
                            x.Semester,
                            x.InsertedBy,
                            <span>
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() =>
                                    {
                                        setFormData({
                                            ...formData,
                                            id: x.EntryID,
                                            CourseCode: x.CourseCode,
                                            Amount: x.TuitionAmount,
                                            Level: x.Level,
                                            Semester: x.Semester,
                                        })
                                    }
                                    }
                                >
                                    <i className="fa fa-pen" />
                                </button>
                            </span>
                        ])
                    });
                    setData(rows);
                }
                setIsLoading(false);
            })
        } catch (e)
        {
            showAlert("error", "Network Error", "Error");
        }

    }

    useEffect(() =>
    {
        const abortController = new AbortController();
        getData();

        return () =>
        {
            abortController.abort();
        }
    }, [])

    const onEdit = (e) =>
    {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        })
    }

    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        try
        {
            if (formData.id === "")
            {
                await axios.post(`${serverLink}registration/admissions/tuition-fee/add`, formData).then((res) =>
                {
                    if (res.data.message === "success")
                    {
                        toast.success("tution fee addedd successfully");
                        document.getElementById("tuition_modal_close").click();
                        Reset();
                        getData();
                    }
                }).catch(() =>
                {
                    toast.error("please try again...");
                })
            } else
            {
                await axios.put(`${serverLink}registration/admissions/tuition-fee/update`, formData).then((res) =>
                {
                    if (res.data.message === "success")
                    {
                        toast.success("tution fee updated successfully");
                        document.getElementById("tuition_modal_close").click();
                        Reset();
                        getData();
                    }
                }).catch(() =>
                {
                    toast.error("please try again...");
                })
            }
        } catch (e)
        {

        }
    }

    const Reset = () =>
    {
        setFormData({
            ...formData,
            id: "",
            CourseCode: "",
            Amount: "",
            Level: "",
            Semester: "",
        })
    }

    return isLoading ? (<Loader />) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Registration"}
                items={["Registraion", "Admissions", "Tuition Fees"]}
            />
            <div className="flex-column-fluid">
                <div className="card">
                    <div className="card-header border-0 pt-6 mb-4">
                        <div className="card-title" >
                            <h2>Tuition Fees</h2>
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
                                    Add Tuition
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <ReportTable columns={columns} data={data} />
                    </div>
                </div>

                <Modal title={"Tution Fees"} close="tuition_modal_close">
                    <form onSubmit={handleSubmit} >

                        <div className="form-group">
                            <label htmlFor="CourseCode">Course</label>
                            <select className="form-select" id="CourseCode" value={formData.CourseCode} onChange={onEdit}  >
                                <option value={""}>-select course -</option>
                                {
                                    courseList.length > 0 &&
                                    courseList.map((x, i) =>
                                    {
                                        return (
                                            <option key={i} value={x.CourseCode}>{x.CourseCode + " -- " + x.CourseName}</option>
                                        )
                                    })
                                }
                                <option value="All">All</option>
                            </select>
                        </div>
                        <div className="form-group pt-5">
                            <label htmlFor="Level">Level</label>
                            <select className="form-select" id="Level" value={formData.Level} onChange={onEdit}  >
                                <option value={""}>-select level-</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                                <option value="300">300</option>
                                <option value="400">400</option>
                                <option value="500">500</option>
                                <option value="600">600</option>
                                <option value="700">700</option>
                                <option value="800">800</option>
                                <option value="900">900</option>
                                <option value="All">All</option>
                            </select>
                        </div>
                        <div className="form-group pt-5">
                            <label htmlFor="Semester">Semester</label>
                            <select className="form-select" id="Semester" value={formData.Semester} onChange={onEdit}  >
                                <option value={""}>-select semester-</option>
                                {
                                    semesterList.length > 0 &&
                                    semesterList.map((x, i) =>
                                    {
                                        return (
                                            <option value={x.SemesterCode} key={i}>{x.SemesterName}</option>
                                        )
                                    })
                                }
                                <option value="All">All</option>
                            </select>
                        </div>
                        <div className="form-group pt-5">
                            <label htmlFor="hostelName">Tuition Amount</label>
                            <input
                                value={formData.Amount}
                                onChange={onEdit}
                                min={0}
                                type={"number"}
                                id="Amount"
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="form-group pt-5">
                            <button className="btn btn-primary w-100">Save</button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    )
}

const mapStateToProps = (state) =>
{
    return {
        login: state.LoginDetails,
        currentSemester: state.currentSemester
    };
};

export default connect(mapStateToProps, null)(TuitionFee);
