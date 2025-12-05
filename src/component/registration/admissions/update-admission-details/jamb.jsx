import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { SSCESubjects as subjects } from "../../../../resources/subjects";
import { serverLink } from "../../../../resources/url";
import axios from "axios";
import AGTable from "../../../common/table/AGTable";

function Jamb(props)
{
    const [loading, setLoading] = useState(false);
    const [jambResult, setJambResult] = useState({
        matricNumber: "",
        examYear: "",
        subject1: "",
        jambScore1: 0,
        subject2: "",
        jambScore2: 0,
        subject3: "",
        jambScore3: 0,
        subject4: "",
        jambScore4: 0,
        AppID: props.AppId,
    });

    // Datatable state for AG Grid
    const [jambTable, setJambTable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Subject", field: "SubjectName" },
            { label: "Score", field: "SubjectScore" },
        ],
        rows: [],
    });


    // Populate JAMB table when props.jambData changes
    useEffect(() => {
        if (props.jambData && props.jambData.length > 0) {
            let rows = [];
            props.jambData.forEach((item, index) => {
                rows.push({
                    sn: index + 1,
                    SubjectName: item.SubjectName,
                    SubjectScore: item.SubjectScore,
                });
            });
            setJambTable({
                ...jambTable,
                rows: rows,
            });
        }
    }, [props.jambData]);

    const handleChange = (e) =>
    {
        if (e.target.id.includes("jambScore"))
            setJambResult({ ...jambResult, [e.target.id]: parseInt(e.target.value) });
        else setJambResult({ ...jambResult, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (event) =>
    {
        event.preventDefault();

        for (let value in jambResult)
        {
            if (jambResult[value] === "")
            {
                toast.error(`${value} can't be empty`);
                return false;
            }
        }


        if (jambResult.matricNumber === "" || jambResult.examYear === "")
        {
            toast.error("please fill all fields");
            return false;
        }
        toast.warning("please wait...")
        await axios.delete(`${serverLink}application/jamb/delete/${props.AppId}`)
            .then(async (res) =>
            {
                if (res.data.message === "success")
                {
                    await axios
                        .post(`${serverLink}application/jamb/result`, jambResult)
                        .then((response) =>
                        {
                            if (response.data.message === "success")
                            {
                                toast.success(`Jamb Result Updated`);
                                props.getApplicantData();
                            } else
                            {
                                toast.error(
                                    `Something went wrong uploading jamb result. Please try again!`
                                );
                            }
                        })
                        .catch((error) =>
                        {
                            toast.error(
                                `Something went wrong. Please check your connection and try again!`
                            );
                        });
                }
            })
            .catch((err) =>
            {
                console.log("NETWORK ERROR", err);
            });

    };



    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-xl-8 text-center">
                    <div className="section-title">
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col 9">
                    {
                        props.jambData.length > 0 &&
                        <div className="">
                            <table className="table table-sm">
                                <tr>
                                    <td>Matric Number</td>
                                    <td>{props.jambData[0]?.MatricNumber}</td>
                                </tr>
                                <tr>
                                    <td> Examination Year</td>
                                    <td>{props.jambData[0]?.ExaminationYear}</td>
                                </tr>
                            </table>
                            <AGTable data={jambTable} />
                        </div>
                    }



                    <form className="login bg-white  shadow p-5 mb-6" id="jamb_form" onSubmit={handleSubmit}>
                        <h5 className="mb-3">JAMB Details</h5>
                        <div className="row">
                            <div className="col-lg-6 col-md-6">
                                <div className="form-group">
                                    <label htmlFor="matricNumber">
                                        Matric Number <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="matricNumber"
                                        className="form-control"
                                        placeholder="Matric Number"
                                        // required
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6">
                                <div className="form-group">
                                    <label htmlFor="examYear">
                                        Examination Year{" "}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="examYear"
                                        min={1980}
                                        max={new Date().getFullYear()}
                                        className="form-control"
                                        placeholder="Examination Year"
                                        // required
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <>
                                <div className="col-8 ">
                                    <div className="form-group">
                                        <label htmlFor="subject1">
                                            Subject <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            id="subject1"
                                            name="subject"
                                            className="form-control"
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Option</option>
                                            {subjects.map((s, i) => (
                                                <option key={i} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-4 ">
                                    <div className="form-group">
                                        <label htmlFor="jambScore1">
                                            Score <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="jambScore1"
                                            name="score"
                                            min={0}
                                            max={100}
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>
                                </div>

                                <div className="col-8 ">
                                    <div className="form-group">
                                        <label htmlFor="subject2">
                                            Subject <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            id="subject2"
                                            name="subject"
                                            className="form-control"
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Option</option>
                                            {subjects.map((s, i) => (
                                                <option key={i} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-4 ">
                                    <div className="form-group">
                                        <label htmlFor="jambScore2">
                                            Score <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            id="jambScore2"
                                            name="score"
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>
                                </div>

                                <div className="col-8">
                                    <div className="form-group">
                                        <label htmlFor="subject3">
                                            Subject <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            id="subject3"
                                            name="subject"
                                            className="form-control"
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Option</option>
                                            {subjects.map((s, i) => (
                                                <option key={i} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="form-group">
                                        <label htmlFor="jambScore3">
                                            Score <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="jambScore3"
                                            min={0}
                                            max={100}
                                            name="score"
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>
                                </div>

                                <div className="col-8">
                                    <div className="form-group">
                                        <label htmlFor="subject4">
                                            Subject <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            id="subject4"
                                            name="subject"
                                            className="form-control"
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Option</option>
                                            {subjects.map((s, i) => (
                                                <option key={i} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-4 ">
                                    <div className="form-group">
                                        <label htmlFor="jambScore4">
                                            Score <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="jambScore4"
                                            min={0}
                                            max={100}
                                            name="score"
                                            className="form-control"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className={"alert alert-info col-md-12 mt-3"}>
                                    TOTAL:{" "}
                                    {jambResult.jambScore1 +
                                        jambResult.jambScore2 +
                                        jambResult.jambScore3 +
                                        jambResult.jambScore4}
                                </div>
                            </>
                        </div>
                        <div className="col-md-12 mt-3 mb-2">
                            <div className="filters-group mb-lg-4 text-center">
                                <button className="btn btn-dark w-50  active" type="submit">  SUBMIT</button>
                            </div>
                        </div>

                    </form>

                </div>
            </div>
        </div>
    )

}


export default Jamb;
