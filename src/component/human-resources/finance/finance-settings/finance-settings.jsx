import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import Table from "../../../common/table/table";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";
import Select from "react-select";

function FinanceSettings(props) {
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(true);
    const [courseList, setCourseList] = useState([]);
    const [scholarshipList, setScholarshipList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [studentOptions, setStudentOptions] = useState([]);
    const [tuitionDatatable, setTuitionDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Course Name",
                field: "CourseCode",
            },
            {
                label: "Tuition Fee",
                field: "TuitionAmount",
            },
            {
                label: "Tuition Fee (Int'l)",
                field: "TuitionAmountIntl"
            },
            {
                label: "Level",
                field: "Level",
            },
            {
                label: "Semester",
                field: "Semester",
            },

            {
                label: "Added By",
                field: "InsertedBy",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [tuitionFormData, setTuitionFormData] = useState({
        CourseCode: "",
        TuitionAmount: "",
        TuitionAmountIntl: "",
        Level: "",
        Semester: "",
        InsertedBy: props.loginData[0].StaffID,
        EntryID: "",
    });

    const [otherFeeDatatable, setOtherFeeDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Title",
                field: "Title",
            },
            {
                label: "Amount",
                field: "Amount",
            },
            {
                label: "Paid By",
                field: "PaidBy",
            },
            {
                label: "Is Required",
                field: "IsRequired",
            },
            {
                label: "Inserted By",
                field: "InsertedBy",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [otherFeeFormData, setOtherFeeFormData] = useState({
        Title: "",
        Amount: "",
        PaidBy: "",
        IsRequired: "",
        InsertedBy: props.loginData[0].StaffID,
        EntryID: "",
    });

    const [scholarshipDatatable, setScholarshipDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Scholarship Name",
                field: "ScholarshipName",
            },
            {
                label: "Tuition Percentage",
                field: "TuitionPercentage",
            },
            {
                label: "Hostel Percentage",
                field: "HostelPercentage",
            },
            {
                label: "Feeding Percentage",
                field: "FeedingPercentage",
            },
            {
                label: "Inserted By",
                field: "InsertedBy",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [scholarshipFormData, setScholarshipFormData] = useState({
        ScholarshipName: "",
        TuitionPercentage: "",
        HostelPercentage: "",
        FeedingPercentage: "",
        EntryID: "",
        InsertedBy: `${props.loginData[0].StaffID}`,
    });

    const [enrolmentDatatable, setEnrolmentDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Student ID",
                field: "StudentID",
            },
            {
                label: "Student Name",
                field: "StudentName",
            },
            {
                label: "Scholarship",
                field: "Scholarship",
            },
            {
                label: "Status",
                field: "Status",
            },
            {
                label: "Enrolled By",
                field: "InsertedBy",
            },
            {
                label: "Date Enrolled",
                field: "InsertedDate",
            },
            {
                label: "Action",
                field: "action",
            },
        ],
        rows: [],
    });
    const [enrolmentFormData, setEnrolmentFormData] = useState({
        StudentID: "",
        ScholarshipID: "",
        EntryID: "",
        InsertedBy: `${props.loginData[0].FirstName} ${props.loginData[0].MiddleName} ${props.loginData[0].Surname}`,
    });

    const Reset = () => {
        setTuitionFormData({
            CourseCode: "",
            TuitionAmount: "",
            TuitionAmountIntl: "",
            Level: "",
            Semester: "",
            EntryID: "",
        })
    }


    const getRecords = async () => {
        await axios.get(`${serverLink}staff/finance/tuition/list`, token)
            .then((result) => {
                const data = result.data;
                if (data.length > 0) {
                    let rows = [];
                    data.map((item, index) => {
                        rows.push({
                            sn: index + 1,
                            CourseCode: item.CourseCode,
                            TuitionAmount: currencyConverter(item.TuitionAmount),
                            TuitionAmountIntl: item.TuitionAmountIntl,
                            Level: item.Level,
                            Semester: item.Semester,
                            InsertedBy: item.InsertedBy,
                            EntryID: item.EntryID,
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#kt_modal_general"
                                    onClick={() => {
                                        Reset();
                                        setTuitionFormData({
                                            CourseCode: item.CourseCode,
                                            TuitionAmount: item.TuitionAmount,
                                            TuitionAmountIntl: item.TuitionAmountIntl,
                                            Level: item.Level,
                                            Semester: item.Semester,
                                            InsertedBy: item.InsertedBy,
                                            EntryID: item.EntryID,
                                        })
                                    }
                                    }
                                >
                                    <i className="fa fa-pen" />
                                </button>
                            ),
                        });
                    });
                    setTuitionDatatable({
                        ...tuitionDatatable,
                        columns: tuitionDatatable.columns,
                        rows: rows,
                    });
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("NETWORK ERROR");
            });

        await axios.get(`${serverLink}staff/finance/other-fee/list`, token)
            .then((result) => {
                const data = result.data;
                if (data.length > 0) {
                    let rows = [];
                    data.map((item, index) => {
                        rows.push({
                            sn: index + 1,
                            Title: item.Title,
                            Amount: currencyConverter(item.Amount),
                            PaidBy: item.PaidBy,
                            IsRequired: item.IsRequired.toString() === '1' ? 'Yes' : 'No',
                            InsertedBy: item.InsertedBy,
                            EntryID: item.EntryID,
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#other_fee"
                                    onClick={() =>
                                        setOtherFeeFormData({
                                            Title: item.Title,
                                            Amount: item.Amount,
                                            PaidBy: item.PaidBy,
                                            IsRequired: item.IsRequired,
                                            InsertedBy: item.InsertedBy,
                                            EntryID: item.EntryID,
                                        })
                                    }
                                >
                                    <i className="fa fa-pen" />
                                </button>
                            ),
                        });
                    });
                    setOtherFeeDatatable({
                        ...otherFeeDatatable,
                        columns: otherFeeDatatable.columns,
                        rows: rows,
                    });
                }
            })
            .catch((err) => {
                console.log("NETWORK ERROR STATE");
            });

        await axios.get(`${serverLink}staff/finance/scholarship/list`, token)
            .then((result) => {
                const data = result.data;
                if (data.length > 0) {
                    setScholarshipList(data)
                    let rows = [];
                    data.map((item, index) => {
                        rows.push({
                            sn: index + 1,
                            ScholarshipName: item.ScholarshipName,
                            TuitionPercentage: item.TuitionPercentage,
                            HostelPercentage: item.HostelPercentage,
                            FeedingPercentage: item.FeedingPercentage,
                            InsertedBy: item.InsertedBy,
                            EntryID: item.EntryID,
                            action: (
                                <button
                                    className="btn btn-sm btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#scholarship"
                                    onClick={() =>
                                        setScholarshipFormData({
                                            ScholarshipName: item.ScholarshipName,
                                            TuitionPercentage: item.TuitionPercentage,
                                            HostelPercentage: item.HostelPercentage,
                                            FeedingPercentage: item.FeedingPercentage,
                                            InsertedBy: item.InsertedBy,
                                            EntryID: item.EntryID,
                                        })
                                    }
                                >
                                    <i className="fa fa-pen" />
                                </button>
                            ),
                        });
                    });
                    setScholarshipDatatable({
                        ...scholarshipDatatable,
                        columns: scholarshipDatatable.columns,
                        rows: rows,
                    });
                }
            })
            .catch((err) => {
                console.log("NETWORK ERROR STATE");
            });

        await axios.get(`${serverLink}staff/finance/scholarship-enrolment/list`, token)
            .then((result) => {
                const data = result.data;
                if (data.length > 0) {
                    let rows = [];
                    data.map((item, index) => {
                        rows.push({
                            sn: index + 1,
                            StudentID: item.StudentID,
                            StudentName: item.StudentName,
                            Scholarship: item.Scholarship,
                            Status: item.Status,
                            InsertedBy: item.InsertedBy,
                            InsertedDate: formatDateAndTime(item.InsertedDate, 'date'),
                            EntryID: item.EntryID,
                            action: item.Status !== 'Active' ? (
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => {
                                        setEnrolmentFormData({
                                            ...enrolmentFormData,
                                            StudentID: item.StudentID,
                                            ScholarshipID: item.ScholarshipID,
                                            Status: item.Status,
                                            EntryID: item.EntryID,
                                        })
                                        onActivate(item);
                                    }
                                    }
                                >
                                    <i className="fa fa-check-circle" />
                                </button>
                            ) :
                                (
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => {
                                            setEnrolmentFormData({
                                                ...enrolmentFormData,
                                                StudentID: item.StudentID,
                                                ScholarshipID: item.ScholarshipID,
                                                Status: item.Status,
                                                EntryID: item.EntryID,
                                            })
                                            onActivate(item);
                                        }

                                        }
                                    >
                                        <i className="fa fa-trash" />
                                    </button>
                                ),
                        });
                    });
                    setEnrolmentDatatable({
                        ...enrolmentDatatable,
                        columns: enrolmentDatatable.columns,
                        rows: rows,
                    });
                }
            })
            .catch((err) => {
                console.log("NETWORK ERROR STATE");
            });

        await axios.get(`${serverLink}staff/academics/course/list`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    setCourseList(result.data)
                }
            }).catch((err) => {
                console.log("NETWORK ERROR");
            });

        await axios.get(`${serverLink}staff/student-manager/student/active`, token)
            .then((result) => {
                if (result.data.length > 0) {
                    // Sort students alphabetically by full name
                    const sortedStudents = result.data.sort((a, b) => {
                        const nameA = `${a.FirstName} ${a.MiddleName} ${a.Surname}`.toUpperCase();
                        const nameB = `${b.FirstName} ${b.MiddleName} ${b.Surname}`.toUpperCase();
                        return nameA.localeCompare(nameB);
                    });

                    // Create options for react-select
                    const options = sortedStudents.map((student, index) => ({
                        value: student.StudentID,
                        label: `${index + 1}. ${student.FirstName} ${student.MiddleName} ${student.Surname} (${student.StudentID})`
                    }));

                    setStudentList(sortedStudents);
                    setStudentOptions(options);
                }
            }).catch((err) => {
                console.log("NETWORK ERROR");
            });
    };

    const onTuitionEdit = (e) => {
        setTuitionFormData({
            ...tuitionFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onOtherFeeEdit = (e) => {
        setOtherFeeFormData({
            ...otherFeeFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onScholarshipEdit = (e) => {
        setScholarshipFormData({
            ...scholarshipFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onEnrolmentEdit = (e) => {
        setEnrolmentFormData({
            ...enrolmentFormData,
            [e.target.id]: e.target.value,
        });
    };

    const onStudentSelect = (selectedOption) => {
        setEnrolmentFormData({
            ...enrolmentFormData,
            StudentID: selectedOption ? selectedOption.value : "",
        });
    };

    const onSubmitTuition = async () => {
        if (tuitionFormData.CourseCode.trim() === "") {
            showAlert("EMPTY FIELD", "Please select the course", "error");
            return false;
        }
        if (tuitionFormData.TuitionAmount.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the tuition amount", "error");
            return false;
        }
        if (tuitionFormData.Level.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select the level", "error");
            return false;
        }
        if (tuitionFormData.Semester.trim() === "") {
            showAlert("EMPTY FIELD", "Please select the semester", "error");
            return false;
        }

        if (tuitionFormData.EntryID === "") {
            await axios
                .post(`${serverLink}staff/finance/tuition/add`, tuitionFormData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Tuition Fee Added Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setTuitionFormData({
                            ...tuitionFormData,
                            CourseCode: "",
                            TuitionAmount: "",
                            TuitionAmountIntl: "",
                            Level: "",
                            Semester: "",
                            EntryID: "",
                        });
                    } else if (result.data.message === "exist") {
                        showAlert("TUITION EXIST", "Tuition Fee already exist!", "error");
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else {
            await axios
                .patch(`${serverLink}staff/finance/tuition/update`, tuitionFormData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Tuition Fee Updated Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setTuitionFormData({
                            ...tuitionFormData,
                            CourseCode: "",
                            TuitionAmount: "",
                            TuitionAmountIntl: "",
                            Level: "",
                            Semester: "",
                            EntryID: "",
                        });
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };

    const onSubmitOtherFee = async () => {
        if (otherFeeFormData.Title.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the title", "error");
            return false;
        }
        if (otherFeeFormData.Amount.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the amount", "error");
            return false;
        }
        if (otherFeeFormData.PaidBy.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select paid by option", "error");
            return false;
        }
        if (otherFeeFormData.IsRequired.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select is required option", "error");
            return false;
        }

        if (otherFeeFormData.EntryID === "") {
            await axios
                .post(`${serverLink}staff/finance/other-fee/add`, otherFeeFormData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Other Fee Added Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setOtherFeeFormData({
                            ...otherFeeFormData,
                            Title: "",
                            Amount: "",
                            PaidBy: "",
                            IsRequired: "",
                            EntryID: "",
                        });
                    } else if (result.data.message === "exist") {
                        showAlert("OTHER FEE EXIST", "Other Fee already exist!", "error");
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else {
            await axios
                .patch(`${serverLink}staff/finance/other-fee/update`, otherFeeFormData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Other Fee Updated Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setOtherFeeFormData({
                            ...otherFeeFormData,
                            Title: "",
                            Amount: "",
                            PaidBy: "",
                            IsRequired: "",
                            EntryID: "",
                        });
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };

    const onSubmitScholarship = async () => {
        if (scholarshipFormData.ScholarshipName.trim() === "") {
            showAlert("EMPTY FIELD", "Please enter scholarship name", "error");
            return false;
        }
        if (scholarshipFormData.TuitionPercentage.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please enter tuition percentage", "error");
            return false;
        }
        if (scholarshipFormData.HostelPercentage.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please enter hostel percentage", "error");
            return false;
        }
        if (scholarshipFormData.FeedingPercentage.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please enter feeding percentage", "error");
            return false;
        }

        if (scholarshipFormData.EntryID === "") {
            await axios
                .post(`${serverLink}staff/finance/scholarship/add`, scholarshipFormData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Scholarship Added Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setScholarshipFormData({
                            ...scholarshipFormData,
                            ScholarshipName: "",
                            TuitionPercentage: "",
                            HostelPercentage: "",
                            FeedingPercentage: "",
                            EntryID: "",
                        });
                    } else if (result.data.message === "exist") {
                        showAlert("SCHOLARSHIP EXIST", "Scholarship already exist!", "error");
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else {
            await axios
                .patch(`${serverLink}staff/finance/scholarship/update`, scholarshipFormData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Scholarship Updated Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setScholarshipFormData({
                            ...scholarshipFormData,
                            ScholarshipName: "",
                            TuitionPercentage: "",
                            HostelPercentage: "",
                            FeedingPercentage: "",
                            EntryID: "",
                        });
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };

    const onSubmitEnrolment = async () => {
        if (enrolmentFormData.StudentID.trim() === "") {
            showAlert("EMPTY FIELD", "Please select the student", "error");
            return false;
        }
        if (enrolmentFormData.ScholarshipID.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select the scholarship", "error");
            return false;
        }

        if (enrolmentFormData.EntryID === "") {
            await axios
                .post(`${serverLink}staff/finance/scholarship-enrolment/add`, enrolmentFormData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Student Enroled Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setEnrolmentFormData({
                            ...enrolmentFormData,
                            StudentID: "",
                            ScholarshipID: "",
                            EntryID: "",
                        });
                    } else if (result.data.message === "exist") {
                        showAlert("ENROLMENT EXIST", "This student has been enroled for scholarship !", "error");
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else {
            await axios
                .patch(`${serverLink}staff/finance/scholarship-enrolment/update`, enrolmentFormData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Scholarship Updated Successfully");
                        document.getElementById("closeModal").click()
                        getRecords();
                        setEnrolmentFormData({
                            ...enrolmentFormData,
                            ScholarshipName: "",
                            TuitionPercentage: "",
                            HostelPercentage: "",
                            FeedingPercentage: "",
                            EntryID: "",
                        });
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };

    const onActivate = async (item) =>  {
        const sendData = {
            ...enrolmentFormData,
            StudentID: item.StudentID,
            ScholarshipID: item.ScholarshipID,
            EntryID: item.EntryID,
            Status: item.Status,
            StudentName: item.StudentName
        }
        if (sendData.Status === "Active") {
            await axios
                .patch(`${serverLink}staff/finance/scholarship-enrolment/deactivate`, sendData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Scholarship Removed Successfully");
                        getRecords();
                        setEnrolmentFormData({
                            ...sendData,
                            StudentID: "",
                            ScholarshipID: "",
                            EntryID: "",
                        });
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
        else {
            await axios
                .patch(`${serverLink}staff/finance/scholarship-enrolment/activate`, sendData, token)
                .then((result) => {
                    if (result.data.message === "success") {
                        toast.success("Scholarship Removed Successfully");
                        getRecords();
                        setEnrolmentFormData({
                            ...sendData,
                            StudentID: "",
                            ScholarshipID: "",
                            EntryID: "",
                        });
                    } else {
                        showAlert(
                            "ERROR",
                            "Something went wrong. Please try again!",
                            "error"
                        );
                    }
                })
                .catch((error) => {
                    showAlert(
                        "NETWORK ERROR",
                        "Please check your connection and try again!",
                        "error"
                    );
                });
        }
    };


    useEffect(() => {
        getRecords();
    }, []);

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Finance Settings"} items={["Human Resources", "Finance", "Finance Settings"]} />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body p-0">
                        <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-8">

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4 active" data-bs-toggle="tab" href="#tuition_fee">Tuition Fee</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-kt-countup-tabs="true" data-bs-toggle="tab" href="#other_fee_tab">Other Fee</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-bs-toggle="tab" href="#scholarship_tab">Scholarship</a>
                            </li>

                            <li className="nav-item">
                                <a className="nav-link text-active-primary pb-4" data-bs-toggle="tab" href="#enrol_scholarship_tab">Enrol Scholarship</a>
                            </li>

                        </ul>

                        <div className="tab-content" id="myTabContent">

                            <div className="tab-pane fade active show" id="tuition_fee" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() =>
                                            setTuitionFormData({
                                                ...tuitionFormData,
                                                CourseCode: "",
                                                TuitionAmount: "",
                                                Level: "",
                                                Semester: "",
                                                EntryID: "",
                                            })
                                        }
                                    >
                                        Add Tuition Fee
                                    </button>
                                </div>
                                <Table data={tuitionDatatable} />
                            </div>
                            <div className="tab-pane fade" id="other_fee_tab" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#other_fee"
                                        onClick={() =>
                                            setOtherFeeFormData({
                                                ...otherFeeFormData,
                                                Title: "",
                                                Amount: "",
                                                PaidBy: "",
                                                IsRequired: "",
                                                EntryID: "",
                                            })
                                        }
                                    >
                                        Add Other Fee
                                    </button>
                                </div>
                                <Table data={otherFeeDatatable} />
                            </div>
                            <div className="tab-pane fade" id="scholarship_tab" role="tabpanel">
                                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#scholarship"
                                        onClick={() =>
                                            setScholarshipFormData({
                                                ...scholarshipFormData,
                                                ScholarshipName: "",
                                                TuitionPercentage: "",
                                                HostelPercentage: "",
                                                FeedingPercentage: "",
                                                EntryID: "",
                                            })
                                        }
                                    >
                                        Add Scholarship
                                    </button>
                                </div>
                                <Table data={scholarshipDatatable} />
                            </div>
                            <div className="tab-pane fade" id="enrol_scholarship_tab" role="tabpanel">
                                <div className={"row"}>
                                    <div className="form-group col-md-5 mb-4">
                                        <label htmlFor="StudentID">Student</label>
                                        <Select
                                            options={studentOptions}
                                            onChange={onStudentSelect}
                                            value={studentOptions.find(option => option.value === enrolmentFormData.StudentID) || null}
                                            placeholder="Search and select student..."
                                            isClearable
                                            isSearchable
                                        />
                                    </div>
                                    <div className="form-group col-md-5 mb-4">
                                        <label htmlFor="ScholarshipID">Scholarship</label>
                                        <select
                                            id={"ScholarshipID"}
                                            onChange={onEnrolmentEdit}
                                            value={enrolmentFormData.ScholarshipID}
                                            className={"form-control"}
                                        >
                                            <option>Select Scholarship</option>
                                            {
                                                scholarshipList.length > 0 && scholarshipList.map((item, index) => {
                                                    return <option key={index} value={item.EntryID}>{item.ScholarshipName}</option>
                                                })
                                            }

                                        </select>
                                    </div>
                                    <div className="form-group  col-md-2 pt-6 ">
                                        <button onClick={onSubmitEnrolment} className="btn btn-primary w-100">
                                            Enrol
                                        </button>
                                    </div>
                                </div>
                                <Table data={enrolmentDatatable} />
                            </div>
                        </div>
                    </div>
                </div>

                <Modal title={"Tuition Fee Form"}>
                    <div className={"row"}>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="CourseCode">Course</label>
                            <select
                                id={"CourseCode"}
                                onChange={onTuitionEdit}
                                value={tuitionFormData.CourseCode}
                                className={"form-control"}
                            >
                                <option>Select Course</option>
                                {
                                    courseList.length > 0 && courseList.map((course, index) => {
                                        return <option key={index} value={course.CourseCode}>{course.CourseName}</option>
                                    })
                                }

                            </select>
                        </div>

                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="Level">Level</label>
                            <select
                                id={"Level"}
                                onChange={onTuitionEdit}
                                value={tuitionFormData.Level}
                                className={"form-control"}
                            >
                                <option>Select Level</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                                <option value="300">300</option>
                                <option value="400">400</option>
                                <option value="500">500</option>
                                <option value="600">600</option>
                                <option value="700">700</option>
                                <option value="800">800</option>
                                <option value="900">900</option>
                            </select>
                        </div>
                        <div className="form-group col-md-12 mb-4">
                            <label htmlFor="Semester">Semester</label>
                            <select
                                id={"Semester"}
                                onChange={onTuitionEdit}
                                value={tuitionFormData.Semester}
                                className={"form-control"}
                            >
                                <option value="">Select Semester</option>
                                <option value="All">All</option>
                                <option value="First">First</option>
                                <option value="Second">Second</option>
                                <option value="Third">Third</option>
                                <option value="Forth">Forth</option>
                            </select>
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="TuitionAmount">Tuition Fee(Local)</label>
                            <input
                                type="number"
                                id={"TuitionAmount"}
                                onChange={onTuitionEdit}
                                value={tuitionFormData.TuitionAmount}
                                className={"form-control"}
                                placeholder={"Please enter the amount"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="TuitionAmountIntl">Tuition Fee(Int'l in USD)</label>
                            <input
                                type="number"
                                id={"TuitionAmountIntl"}
                                onChange={onTuitionEdit}
                                value={tuitionFormData.TuitionAmountIntl}
                                className={"form-control"}
                                placeholder={"Please enter the amount"}
                            />
                        </div>
                    </div>

                    <div className="form-group pt-4">
                        <button onClick={onSubmitTuition} className="btn btn-primary w-100">
                            Submit
                        </button>
                    </div>
                </Modal>
                <Modal title={"Other Fee Form"} id="other_fee">
                    <div className={"row"}>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="Title">Title</label>
                            <input
                                type="text"
                                id={"Title"}
                                onChange={onOtherFeeEdit}
                                value={otherFeeFormData.Title}
                                className={"form-control"}
                                placeholder={"Please enter the title"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="Amount">Amount</label>
                            <input
                                type="number"
                                id={"Amount"}
                                onChange={onOtherFeeEdit}
                                value={otherFeeFormData.Amount}
                                className={"form-control"}
                                placeholder={"Please enter the amount"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="PaidBy">Paid By</label>
                            <select
                                id={"PaidBy"}
                                onChange={onOtherFeeEdit}
                                value={otherFeeFormData.PaidBy}
                                className={"form-control"}
                            >
                                <option>Select an option</option>
                                <option value="Both">Both</option>
                                <option value="Returning Student">Returning Student</option>
                                <option value="New Student">New Student</option>
                            </select>
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="IsRequired">Is Required</label>
                            <select
                                id={"IsRequired"}
                                onChange={onOtherFeeEdit}
                                value={otherFeeFormData.IsRequired}
                                className={"form-control"}
                            >
                                <option value="">Select an option</option>
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group pt-4">
                        <button onClick={onSubmitOtherFee} className="btn btn-primary w-100">
                            Submit
                        </button>
                    </div>
                </Modal>
                <Modal title={"Scholarship Form"} id="scholarship">
                    <div className={"row"}>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="ScholarshipName">Scholarship Name</label>
                            <input
                                type="text"
                                id={"ScholarshipName"}
                                onChange={onScholarshipEdit}
                                value={scholarshipFormData.ScholarshipName}
                                className={"form-control"}
                                placeholder={"Please enter the scholarship name"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="TuitionPercentage">Tuition Percentage</label>
                            <input
                                type="number"
                                id={"TuitionPercentage"}
                                onChange={onScholarshipEdit}
                                value={scholarshipFormData.TuitionPercentage}
                                className={"form-control"}
                                placeholder={"Please enter tuition percentage"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="HostelPercentage">Hostel Percentage</label>
                            <input
                                type="number"
                                id={"HostelPercentage"}
                                onChange={onScholarshipEdit}
                                value={scholarshipFormData.HostelPercentage}
                                className={"form-control"}
                                placeholder={"Please enter hostel percentage"}
                            />
                        </div>
                        <div className="form-group col-md-6 mb-4">
                            <label htmlFor="FeedingPercentage">Feeding Percentage</label>
                            <input
                                type="number"
                                id={"FeedingPercentage"}
                                onChange={onScholarshipEdit}
                                value={scholarshipFormData.FeedingPercentage}
                                className={"form-control"}
                                placeholder={"Please enter feeding percentage"}
                            />
                        </div>

                    </div>

                    <div className="form-group pt-4">
                        <button onClick={onSubmitScholarship} className="btn btn-primary w-100">
                            Submit
                        </button>
                    </div>
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

export default connect(mapStateToProps, null)(FinanceSettings);