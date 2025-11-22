import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import Select2 from "react-select2-wrapper";
import "react-select2-wrapper/css/select2.css";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert, showConfirm } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import Table from "../../../common/table/table";
import { currencyConverter, encryptData, projectCode } from "../../../../resources/constants";
import { Link } from "react-router-dom";

function PostPayment(props)
{
    const token = props.loginData[0].token;

    const [isLoading, setIsLoading] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);
    const [semesterList, setSemesterList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [amountDue, setAmountDue] = useState(0);
    const [showOutStanding, setShowOutStanding] = useState(0);
    const [totalCheckedItems, setTotalCheckedItems] = useState(0);
    const [amountPaid, setAmountPaid] = useState(0);
    const [paymentRefID, setPaymentRefID] = useState("");
    const [cart, setCart] = useState([]);
    const [showAmountPaid, setShowAmountPaid] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [change, setChange] = useState("");
    const [studentSelectList, setStudentSelectList] = useState([]);
    let itemArray = [];
    let outStandingAmount = 0;

    const [selectedStudent, setSelectedStudent] = useState({
        StudentID: "",
        FirstName: "",
        EmailAddress: "",
    });

    let [formData, setFormData] = useState({
        SemesterCode: "",
        UserType: "",
        StudentID: "",
        ApplicationID: "",
        PaymentRef: "",
        AdmissionType: "",
        AppID: "",
        FirstName: "",
        MiddleName: "",
        Surname: "",
        CourseCode: "",
        Course: "",
        StudentLevel: "",
        StudentSemester: "",
        EmailAddress: "",
        ItemTotal: 0,
        TotalExpectedAmount: 0,
        AmountDue: 0,
        AmountPaid: 0,
        OutStandingAmount: 0,
        PaymentMethod: "",
        PaymentID: "",
        cartItems: [],
        EntryID: "",
        InsertedBy: `${props.loginData[0].StaffID}`
    });

    const [tuitionDatatable, setTuitionDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Description",
                field: "Description",
            },
            {
                label: "Amount",
                field: "SemesterTuition",
            }
        ],
        rows: [],
    });

    const [otherFeeDatatable, setOtherFeeDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Description",
                field: "Title",
            },
            {
                label: "Amount",
                field: "Amount",
            }
        ],
        rows: [],
    });

    const [paymentHistoryDatatable, setPaymentHistoryDatatable] = useState({
        columns: [
            {
                label: "S/N",
                field: "sn",
            },
            {
                label: "Payment ID",
                field: "PaymentID",
            },
            {
                label: "Payment Method",
                field: "PaymentMethod",
            },
            {
                label: "Description",
                field: "Description",
            },
            {
                label: "Amount Paid",
                field: "AmountPaid",
            },
            {
                label: "Amount Expected",
                field: "TotalExpectedAmount",
            },
            {
                label: "Outstanding",
                field: "OutStandingAmount",
            },
            {
                label: "Payment Semester",
                field: "SemesterCode",
            },
            {
                label: "Paid On",
                field: "InsertedDate",
            },
            {
                label: "Received By",
                field: "InsertedBy",
            },
            {
                label: "Print",
                field: "action",
            },

        ],
        rows: [],
    });

    const getData = async () =>
    {
        await axios.get(`${serverLink}staff/academics/timetable/semester/list`, token)
            .then((result) =>
            {
                if (result.data.length > 0)
                {
                    setSemesterList(result.data)
                }
            }).catch((err) =>
            {
                console.log("NETWORK ERROR");
            });

        await axios.get(`${serverLink}staff/student-manager/student/active`, token)
            .then((result) =>
            {
                if (result.data.length > 0)
                {
                    let rows = [];
                    result.data.map((item) =>
                    {
                        rows.push({
                            id: item.StudentID,
                            text: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})`,
                        });
                    });
                    setStudentSelectList(rows);

                    setStudentList(result.data)
                }
            }).catch((err) =>
            {
                console.log("NETWORK ERROR");
            });

    }

    const getApplicantData = async (id) =>
    {
        setShowOutStanding(0)
        await axios.get(`${serverLink}staff/finance/applicant/details/${btoa(id)}`, token)
            .then((result) =>
            {
                if (result.data.studentData.length > 0)
                {
                    const data = result.data.studentData[0];
                    const other_fee = result.data.otherFee;
                    const payment_history = result.data.paymentHistory;
                    const studentScholarshipData = result.data.scholarship;
                    const studentOutstanding = result.data.OutStandingAmount;
                    setAmountDue(parseFloat(studentOutstanding))
                    setShowOutStanding(prevState => prevState + studentOutstanding)
                    outStandingAmount += studentOutstanding;

                    setFormData({
                        ...formData,
                        ApplicationID: data.ApplicationID,
                        StudentID: data.ApplicationID,
                        AppID: data.ApplicationID,
                        FirstName: data.FirstName,
                        MiddleName: data.MiddleName,
                        Surname: data.Surname,
                        CourseCode: data.CourseCode,
                        Course: data.CourseName,
                        StudentLevel: data.DecisionLevel,
                        StudentSemester: data.DecisionSemester,
                        EmailAddress: data.EmailAddress,
                    })
                    setChange('First Data')

                    const dataSet = { CourseCode: data.CourseCode, Level: data.DecisionLevel, Semester: data.DecisionSemester }
                    axios.post(`${serverLink}staff/finance/tuition/details`, dataSet, token)
                        .then((result) =>
                        {
                            if (result.data.length > 0)
                            {
                                const res = result.data[0];
                                let desc, session_desc = '';
                                let amt, session_amt = 0;
                                if (studentScholarshipData.length > 0)
                                {
                                    desc = `Semester Tuition (${studentScholarshipData[0].ScholarshipName})`;
                                    session_desc = `Session Tuition (${studentScholarshipData[0].ScholarshipName})`;
                                    amt = parseFloat(res.SemesterTuition) - (parseFloat(res.SemesterTuition) / 100) * parseFloat(studentScholarshipData[0].TuitionPercentage);
                                    session_amt = parseFloat(res.SessionTuition) - (parseFloat(res.SessionTuition) / 100) * parseFloat(studentScholarshipData[0].TuitionPercentage);
                                } else
                                {
                                    desc = `Semester Tuition`;
                                    session_desc = `Session Tuition`;
                                    amt = res.SemesterTuition;
                                    session_amt = res.SessionTuition;
                                }
                                let rows = [{
                                    sn: '1',
                                    Description: desc,
                                    SemesterTuition: (
                                        <div className="form-group">
                                            <input
                                                type="radio"
                                                id="tuitionCheck"
                                                name="tuitionCheck"
                                                className="form-check-input"
                                                onChange={() => onTuitionSelect(amt, desc)}
                                                value={amt}
                                            /> <span>{currencyConverter(amt)}</span>

                                        </div>
                                    ),
                                }, {
                                    sn: '2',
                                    Description: session_desc,
                                    SemesterTuition: (
                                        <div className="form-group">
                                            <input
                                                type="radio"
                                                id="tuitionCheck"
                                                name="tuitionCheck"
                                                className="form-check-input"
                                                onChange={() => onTuitionSelect(session_amt, session_desc)}
                                                value={session_amt}
                                            /> <span>{currencyConverter(session_amt)}</span>

                                        </div>
                                    ),
                                }];

                                setTuitionDatatable({
                                    ...tuitionDatatable,
                                    columns: tuitionDatatable.columns,
                                    rows: rows,
                                });
                            }

                            document.getElementById("student_details").style.display = 'block';
                            document.getElementById("tab_content").style.display = 'block';
                            document.getElementById("payment_content").style.display = 'block';
                        }).catch((err) =>
                        {
                            console.log("NETWORK ERROR");
                        });

                    if (other_fee.length > 0)
                    {
                        let rows = [];
                        other_fee.map((item, index) =>
                        {
                            let title = item.Title;
                            let amount = parseFloat(item.Amount);
                            let feeding_discount, hostel_discount = 0;

                            if (title.includes('Feeding'))
                            {
                                if (studentScholarshipData.length > 0)
                                {
                                    feeding_discount = parseFloat(studentScholarshipData[0].FeedingPercentage);
                                    if (feeding_discount > 0)
                                    {
                                        title += ` ${studentScholarshipData[0].ScholarshipName}`
                                        amount -= (parseFloat(item.Amount) / 100) * parseFloat(studentScholarshipData[0].FeedingPercentage)
                                    }
                                }
                            }

                            if (title.includes('Hostel'))
                            {
                                if (studentScholarshipData.length > 0)
                                {
                                    hostel_discount = parseFloat(studentScholarshipData[0].HostelPercentage);
                                    if (hostel_discount > 0)
                                    {
                                        title += ` ${studentScholarshipData[0].ScholarshipName}`
                                        amount -= (parseFloat(item.Amount) / 100) * parseFloat(studentScholarshipData[0].HostelPercentage)
                                    }
                                }
                            }

                            rows.push({
                                sn: index + 1,
                                Title: title,
                                Amount: (
                                    <div className="form-group">
                                        <input
                                            type="checkbox"
                                            id="checkItem"
                                            name="checkItem"
                                            className="form-check-input checkItem"
                                            data={title}
                                            onChange={(e) => onOtherFeeChecked(amount, title, e)}
                                            value={amount}
                                        /> <span>{currencyConverter(amount)}</span>
                                    </div>
                                ),
                            });
                        });
                        setOtherFeeDatatable({
                            ...otherFeeDatatable,
                            columns: otherFeeDatatable.columns,
                            rows: rows,
                        });
                    }

                    if (payment_history.length > 0)
                    {
                        let rows = [];
                        payment_history.map((item, index) =>
                        {
                            rows.push({
                                sn: index + 1,
                                PaymentID: item.PaymentID,
                                PaymentMethod: item.PaymentMethod,
                                Description: item.Description,
                                AmountPaid: item.AmountPaid,
                                TotalExpectedAmount: item.TotalExpectedAmount,
                                OutStandingAmount: item.OutStandingAmount,
                                SemesterCode: item.SemesterCode,
                                InsertedDate: item.InsertedDate,
                                InsertedBy: item.InsertedBy,
                                action: (
                                    <a href={`/human-resources/finance/payment-receipt/${encryptData(item.PaymentID)}`} target="_blank" className="btn btn-primary btn-sm"> <i className="fa fa-print" /></a>
                                ),
                            });
                        });
                        setPaymentHistoryDatatable({
                            ...paymentHistoryDatatable,
                            columns: paymentHistoryDatatable.columns,
                            rows: rows,
                        });
                    }
                    const PaymentID = formData.SemesterCode + generate_token(6) + data.ApplicationID.slice(-4);
                    setPaymentRefID(PaymentID)
                }
            }).catch((err) =>
            {
                console.log("NETWORK ERROR");
            });
    }

    const getStudentData = async (id) =>
    {
        setShowOutStanding(0)
        await axios.get(`${serverLink}staff/finance/student/details/${btoa(id)}`, token)
            .then((result) =>
            {
                if (result.data.studentData.length > 0)
                {
                    const data = result.data.studentData[0];
                    const other_fee = result.data.otherFee;
                    const payment_history = result.data.paymentHistory;
                    const studentScholarshipData = result.data.scholarship;
                    const studentOutstanding = result.data.OutStandingAmount;
                    setAmountDue(parseFloat(studentOutstanding))
                    setShowOutStanding(prevState => prevState + studentOutstanding)
                    outStandingAmount += studentOutstanding;

                    setFormData({
                        ...formData,
                        StudentID: data.StudentID,
                        AppID: data.StudentID,
                        FirstName: data.FirstName,
                        MiddleName: data.MiddleName,
                        Surname: data.Surname,
                        CourseCode: data.CourseCode,
                        Course: data.CourseName,
                        StudentLevel: data.StudentLevel,
                        StudentSemester: data.StudentSemester,
                        EmailAddress: data.EmailAddress,
                    })
                    setChange('First Data')

                    const dataSet = { CourseCode: data.CourseCode, StudentID: data.StudentID, Level: data.StudentLevel, Semester: data.StudentSemester }
                    axios.post(`${serverLink}staff/finance/tuition/details`, dataSet, token)
                        .then((result) =>
                        {
                            if (result.data.length > 0)
                            {
                                const res = result.data[0];
                                let desc, session_desc = '';
                                let amt, session_amt = 0;
                                if (studentScholarshipData.length > 0)
                                {
                                    desc = `${projectCode === "ALANSAR_UNIVERSITY_STAFF_PORTAL" ? "Tuition" : "Semester Tuition"} (${studentScholarshipData[0].ScholarshipName})`;
                                    session_desc = `Session Tuition (${studentScholarshipData[0].ScholarshipName})`;
                                    amt = parseFloat(res.SemesterTuition) - (parseFloat(res.SemesterTuition) / 100) * parseFloat(studentScholarshipData[0].TuitionPercentage);
                                    session_amt = parseFloat(res.SessionTuition) - (parseFloat(res.SessionTuition) / 100) * parseFloat(studentScholarshipData[0].TuitionPercentage);
                                } else
                                {
                                    desc = `${projectCode === "ALANSAR_UNIVERSITY_STAFF_PORTAL" ? "Tuition" : "Semester Tuition"} `;
                                    session_desc = `Session Tuition`;
                                    amt = res.SemesterTuition;
                                    session_amt = res.SessionTuition;
                                }
                                let rows = [{
                                    sn: '1',
                                    Description: desc,
                                    SemesterTuition: (
                                        <div className="form-group">
                                            <input
                                                type="radio"
                                                id="tuitionCheck"
                                                name="tuitionCheck"
                                                className="form-check-input"
                                                onChange={() => onTuitionSelect(amt, desc)}
                                                value={amt}
                                            /> <span>{currencyConverter(amt)}</span>

                                        </div>
                                    ),
                                },

                                projectCode === "ALANSAR_UNIVERSITY_STAFF_PORTAL" ?
                                    <></>
                                    :
                                    {
                                        sn: '2',
                                        Description: session_desc,
                                        SemesterTuition: (
                                            <div className="form-group">
                                                <input
                                                    type="radio"
                                                    id="tuitionCheck"
                                                    name="tuitionCheck"
                                                    className="form-check-input"
                                                    onChange={() => onTuitionSelect(session_amt, session_desc)}
                                                    value={session_amt}
                                                /> <span>{currencyConverter(session_amt)}</span>

                                            </div>
                                        ),
                                    }
                                ];

                                setTuitionDatatable({
                                    ...tuitionDatatable,
                                    columns: tuitionDatatable.columns,
                                    rows: rows,
                                });
                            } else
                            {
                                setTuitionDatatable({
                                    ...tuitionDatatable,
                                    columns: tuitionDatatable.columns,
                                    rows: [],
                                });
                            }

                            document.getElementById("student_details").style.display = 'block';
                            document.getElementById("tab_content").style.display = 'block';
                            document.getElementById("payment_content").style.display = 'block';
                        }).catch((err) =>
                        {
                            console.log("NETWORK ERROR");
                        });

                    if (other_fee.length > 0)
                    {
                        let rows = [];
                        other_fee.map((item, index) =>
                        {
                            let title = item.Title;
                            let amount = parseFloat(item.Amount);
                            let feeding_discount, hostel_discount = 0;

                            if (title.includes('Feeding'))
                            {
                                if (studentScholarshipData.length > 0)
                                {
                                    feeding_discount = parseFloat(studentScholarshipData[0].FeedingPercentage);
                                    if (feeding_discount > 0)
                                    {
                                        title += ` ${studentScholarshipData[0].ScholarshipName}`
                                        amount -= (parseFloat(item.Amount) / 100) * parseFloat(studentScholarshipData[0].FeedingPercentage)
                                    }
                                }
                            }

                            if (title.includes('Hostel'))
                            {
                                if (studentScholarshipData.length > 0)
                                {
                                    hostel_discount = parseFloat(studentScholarshipData[0].HostelPercentage);
                                    if (hostel_discount > 0)
                                    {
                                        title += ` ${studentScholarshipData[0].ScholarshipName}`
                                        amount -= (parseFloat(item.Amount) / 100) * parseFloat(studentScholarshipData[0].HostelPercentage)
                                    }
                                }
                            }

                            rows.push({
                                sn: index + 1,
                                Title: title,
                                Amount: (
                                    <div className="form-group">
                                        <input
                                            type="checkbox"
                                            id="checkItem"
                                            name="checkItem"
                                            className="form-check-input checkItem"
                                            data={title}
                                            onChange={(e) => onOtherFeeChecked(amount, title, e)}
                                            value={amount}
                                        /> <span>{currencyConverter(amount)}</span>
                                    </div>
                                ),
                            });
                        });
                        setOtherFeeDatatable({
                            ...otherFeeDatatable,
                            columns: otherFeeDatatable.columns,
                            rows: rows,
                        });
                    } else
                    {
                        setOtherFeeDatatable({
                            ...otherFeeDatatable,
                            columns: otherFeeDatatable.columns,
                            rows: [],
                        });
                    }

                    if (payment_history.length > 0)
                    {
                        let rows = [];
                        payment_history.map((item, index) =>
                        {
                            rows.push({
                                sn: index + 1,
                                PaymentID: item.PaymentID,
                                PaymentMethod: item.PaymentMethod,
                                Description: item.Description,
                                AmountPaid: item.AmountPaid,
                                TotalExpectedAmount: item.TotalExpectedAmount,
                                OutStandingAmount: item.OutStandingAmount,
                                SemesterCode: item.SemesterCode,
                                InsertedDate: item.InsertedDate,
                                InsertedBy: item.InsertedBy,
                                action: (
                                    <a href={`/human-resources/finance/payment-receipt/${encryptData(item.PaymentID)}`} target="_blank" className="btn btn-primary btn-sm"> <i className="fa fa-print" /></a>
                                ),
                            });
                        });
                        setPaymentHistoryDatatable({
                            ...paymentHistoryDatatable,
                            columns: paymentHistoryDatatable.columns,
                            rows: rows,
                        });
                    } else
                    {
                        setPaymentHistoryDatatable({
                            ...paymentHistoryDatatable,
                            columns: paymentHistoryDatatable.columns,
                            rows: [],
                        });
                    }

                    const PaymentID = formData.SemesterCode + generate_token(6) + data.StudentID.slice(-4);
                    setPaymentRefID(PaymentID)
                }
            }).catch((err) =>
            {
                console.log("NETWORK ERROR");
            });
    }


    useEffect(() =>
    {
        getData();
        document.getElementById("student_id").style.display = 'none';
        document.getElementById("new_student").style.display = 'none';
        document.getElementById("student_details").style.display = 'none';
        document.getElementById("tab_content").style.display = 'none';
        document.getElementById("payment_content").style.display = 'none';
        document.getElementById("AmountDue").value = outStandingAmount;
    }, [""])
    useEffect(() => { setFormData(formData) }, [change])
    // useEffect(()=>{setPaymentRefID(paymentRefID)}, [change])

    const onTuitionSelect = (amount, name) =>
    {
        setChange('onTuitionSelect')
        let itemTotal = 0;
        const item_value = parseFloat(amount);
        const item_name = name;
        const tuitionData = { item_name: item_name, item_amount: item_value }

        itemArray = itemArray.filter(item =>
            !item.item_name.includes('Tuition')
        )

        itemArray.push(tuitionData);
        setCart(prevState => [...prevState.filter(e => !e.item_name.includes('Tuition')), tuitionData])
        for (let i = 0; i < itemArray.length; i++)
        {
            itemTotal += itemArray[i].item_amount
        }

        let newAmountDue = outStandingAmount < 1 ? outStandingAmount + itemTotal : itemTotal + outStandingAmount;
        setAmountDue(newAmountDue)
        setTotalCheckedItems(itemTotal)
    }

    const onOtherFeeChecked = (amount, name, e) =>
    {
        setChange('onOtherFeeChecked')
        const item_value = parseFloat(amount);
        const item_name = name;
        let itemTotal = 0;
        if (e.target.checked)
        {
            const tuitionData = { item_name: item_name, item_amount: item_value }
            itemArray.push(tuitionData)
            for (let i = 0; i < itemArray.length; i++)
            {
                itemTotal += itemArray[i].item_amount
            }
            setCart(prevState => [...prevState, tuitionData])
        } else
        {
            const newItem = itemArray.filter((item) =>
            {
                return item.item_name !== item_name
            });
            itemArray.length = 0;
            itemArray.push(...newItem)
            setCart(prevState => [...prevState.filter(e => e.item_name !== item_name)])
            for (let i = 0; i < itemArray.length; i++)
            {
                itemTotal += itemArray[i].item_amount
            }
            // setAmountDue(amountDue => amountDue - item_value)
        }

        let newAmountDue = outStandingAmount < 1 ? outStandingAmount + itemTotal : itemTotal + outStandingAmount;
        setAmountDue(newAmountDue)
        setTotalCheckedItems(itemTotal)
    }

    const onEdit = (e) =>
    {

        if (e.target.name === 'UserType')
        {
            setFormData({
                ...formData,
                ApplicationID: "",
                StudentID: "",
                AppID: "",
                UserType: "",
            })
            if (e.target.value === 'Returning Student')
            {
                document.getElementById("student_id").style.display = 'block';
                document.getElementById("new_student").style.display = 'none';
                document.getElementById("student_details").style.display = 'none';
                document.getElementById("tab_content").style.display = 'none';
                document.getElementById("payment_content").style.display = 'none';
            } else if (e.target.value === 'New Student')
            {
                document.getElementById("new_student").style.display = 'block';
                document.getElementById("student_id").style.display = 'none';
                document.getElementById("student_details").style.display = 'none';
                document.getElementById("tab_content").style.display = 'none';
                document.getElementById("payment_content").style.display = 'none';
            } else
            {

            }
        }


        // if (e.target.name === 'StudentID') {
        //
        //     if (e.target.value !== '') {
        //         const filter_student = studentList.filter(
        //             (i) => i.StudentID === e.target.value
        //         );
        //         if (filter_student.length > 0) {
        //             selectedStudent.StudentID = filter_student[0].StudentID;
        //             const id = filter_student[0].StudentID;
        //             getStudentData(id);
        //         }
        //
        //     }
        // }

        if (e.target.name === 'AmountPaid')
        {
            if (e.target.value !== '')
            {
                let formatter = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'NGN',
                });

                setTimeout(() =>
                {
                    const amount_paid = e.target.value;
                    let amount_due = amountDue.toString();

                    let outstanding = outStandingAmount;

                    if (parseFloat(amount_due) < 0)
                        outstanding = parseFloat(amount_due) + (-parseFloat(amount_paid));
                    else
                        outstanding = parseFloat(amount_due) - parseFloat(amount_paid);
                    setShowAmountPaid(` Amount Paid: ${formatter.format(amount_paid)}  Balance: ${formatter.format(outstanding)}`)
                    setAmountPaid(parseFloat(amount_paid))
                }, 0)
            }
        }

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setChange(e.target.value)

    };

    const handleStudentChange = (e) =>
    {
        document.getElementById("student_details").style.display = 'none';
        document.getElementById("tab_content").style.display = 'none';
        document.getElementById("payment_content").style.display = 'none';
        if (e.target.value !== '')
        {
            const filter_student = studentList.filter(
                (i) => i.StudentID === e.target.value
            );
            if (filter_student.length > 0)
            {
                selectedStudent.StudentID = filter_student[0].StudentID;
                const id = filter_student[0].StudentID;
                getStudentData(id);
                setChange(id)
            }
        }

    };

    const handleApplicantChange = (e) =>
    {
        document.getElementById("student_details").style.display = 'none';
        document.getElementById("tab_content").style.display = 'none';
        document.getElementById("payment_content").style.display = 'none';
        if (e.target.value !== '')
        {
            const id = formData.ApplicationID;
            getApplicantData(id);
            setChange(id)
        }
    };

    const generate_token = (length) =>
    {
        //edit the token allowed characters
        let a = "1234567890".split("");
        let b = [];
        for (let i = 0; i < length; i++)
        {
            let j = (Math.random() * (a.length - 1)).toFixed(0);
            b[i] = a[j];
        }
        return b.join("");
    }

    const onTriggerSubmit = async () =>
    {
        setIsSubmitLoading(true)
        onSubmit();
    }

    const onSubmit = async () =>
    {
        let outstanding = outStandingAmount;
        let check_outstanding = outStandingAmount;
        let amount_due = amountDue.toString();
        const amount_paid = amountPaid;
        let amount_expected = totalCheckedItems;

        if (parseFloat(amount_due) < 0)
            outstanding = parseFloat(amount_due) + (-parseFloat(amount_paid));
        else
            outstanding = parseFloat(amount_due) - parseFloat(amount_paid);

        setFormData({
            ...formData,
            TotalExpectedAmount: totalCheckedItems,
            AmountDue: amountDue,
            AmountPaid: amount_paid,
            OutStandingAmount: outstanding,
            cartItems: [...itemArray],
            PaymentID: paymentRefID,
        });
        setChange("UpdateMyState");
        setFormData((state) =>
        {
            return state;
        }
        )

        if (formData.SemesterCode.toString().trim() === "")
        {
            showAlert("EMPTY FIELD", "Please select the payment semester", "error");
            return false;
        }

        if (formData.AmountPaid.toString().trim() === "")
        {
            showAlert("EMPTY FIELD", "Please enter the amount paid", "error");
            return false;
        }

        if (formData.PaymentMethod.toString().trim() === "")
        {
            showAlert("EMPTY FIELD", "Please select the payment method", "error");
            return false;
        }

        if (paymentRefID.toString().trim() === "")
        {
            showAlert("EMPTY FIELD", "Payment reference cannot be empty, please reload the page and try again!", "error");
            return false;
        }

        if (parseFloat(amount_due) < 0)
            outstanding = parseFloat(amount_due) + (-parseFloat(amount_paid));
        else
            outstanding = parseFloat(amount_due) - parseFloat(amount_paid);

        if (parseFloat(amount_paid) > check_outstanding)
        {
            if (check_outstanding < 0)
            {
                if (itemArray.length < 1)
                {
                    let append_data = {
                        item_name: 'Account Credit',
                        item_amount: amount_paid
                    }
                    itemArray.push(append_data);
                    amount_expected = amount_paid;
                }
            }
        }

        if (check_outstanding > 0)
        {
            let newArray = itemArray.filter(function (item)
            {
                return item.item_name !== 'Outstanding'
            });
            itemArray.length = 0;
            itemArray.push(...newArray)
            let append_data = {
                item_name: 'Outstanding',
                item_amount: check_outstanding
            }
            itemArray.push(append_data);
            setCart(prevState => [...prevState, append_data])
            amount_expected += check_outstanding;
        }

        let sendData = { ...formData, TotalExpectedAmount: amount_expected, AmountDue: amountDue, OutStandingAmount: outstanding, PaymentID: paymentRefID, cartItems: [...cart] };
        await axios
            .post(`${serverLink}staff/finance/post-payment`, sendData, token)
            .then((result) =>
            {
                if (result.data.message === "success")
                {
                    axios.post(`${serverLink}staff/finance/post-payment-details`, sendData, token)
                        .then(result =>
                        {
                            if (result.data.message === "success")
                            {
                                toast.success("Payment Posted Successfully");
                                setShowSuccess(true)
                                setChange("UpdateNewData");
                            } else
                            {
                                showAlert(
                                    "ERROR",
                                    "Something went wrong. Please try again!",
                                    "error"
                                );
                            }
                        })
                        .catch(err =>
                        {
                            console.error('ERROR', err);
                        });

                } else
                {
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
                setIsSubmitLoading(false)
            })
            .catch((error) =>
            {
                setIsSubmitLoading(false)
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            });
    }

    const onAllowResult = async () =>
    {
        let sendData = { StudentID: formData.StudentID, InsertedBy: formData.InsertedBy }
        let studentName = `${formData.FirstName} ${formData.MiddleName} ${formData.Surname}`
        showConfirm(
            "CONFIRM UNBLOCKING",
            `Are you sure you want to unblock ${studentName} for Result?`,
            "warning"
        ).then(async (IsConfirmed) =>
        {
            if (IsConfirmed)
            {
                await axios.post(`${serverLink}staff/finance/allow-student-result`, sendData, token)
                    .then(result =>
                    {
                        if (result.data.message === "success")
                        {
                            toast.success("Result Access Granted Successfully");
                        } else
                        {
                            showAlert(
                                "ERROR",
                                "Something went wrong. Please try again!",
                                "error"
                            );
                        }
                    })
                    .catch(err =>
                    {
                        console.error('ERROR', err);
                    })
            } else
            {

            }
        });
    }

    const onAllowRegistration = async () =>
    {
        let sendData = { StudentID: formData.StudentID, InsertedBy: formData.InsertedBy };
        let studentName = `${formData.FirstName} ${formData.MiddleName} ${formData.Surname}`
        showConfirm(
            "CONFIRM UNBLOCKING",
            `Are you sure you want to unblock ${studentName} for Registration?`,
            "warning"
        ).then(async (IsConfirmed) =>
        {
            if (IsConfirmed)
            {
                await axios.post(`${serverLink}staff/finance/allow-student-registration`, sendData, token)
                    .then(result =>
                    {
                        if (result.data.message === "success")
                        {
                            toast.success("Registration Access Granted Successfully");
                        } else
                        {
                            showAlert(
                                "ERROR",
                                "Something went wrong. Please try again!",
                                "error"
                            );
                        }
                    })
                    .catch(err =>
                    {
                        console.error('ERROR', err);
                    })
            } else
            {

            }
        });
    }

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader
                title={"Post Payment"}
                items={["Human-Resources", "Finance", "Post Payment"]}
            />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-body pt-1">
                        <div className="row mt-1">
                            <div className="col-md-3">
                                <div className="form-group mb-4">
                                    <label htmlFor="SemesterCode">Select Semester</label>
                                    <select
                                        id={"SemesterCode"}
                                        name={"SemesterCode"}
                                        onChange={onEdit}
                                        value={formData.SemesterCode}
                                        className={"form-control"}
                                    >
                                        <option>Select Semester</option>
                                        {
                                            semesterList.length > 0 && semesterList.map((semester, index) =>
                                            {
                                                return <option key={index} value={semester.SemesterCode}>{semester.Description}</option>
                                            })
                                        }

                                    </select>
                                </div>
                                <div className="form-group mb-4">
                                    <label htmlFor="UserType">Select User Type</label>
                                    <select
                                        id={"UserType"}
                                        name={"UserType"}
                                        onChange={onEdit}
                                        value={formData.UserType}
                                        className={"form-control"}
                                    >
                                        <option value="">Select User Type</option>
                                        <option value="Returning Student">Returning Student</option>
                                        <option value="New Student">New Student</option>
                                    </select>
                                </div>
                                <div className="form-group mb-4" id="student_id">
                                    <label htmlFor="StudentID">Select Student</label>
                                    <Select2
                                        defaultValue={selectedStudent.StudentID}
                                        data={studentSelectList}
                                        onChange={handleStudentChange}
                                        options={{
                                            placeholder: "Search Student",
                                        }}
                                    />
                                    {/*<select*/}
                                    {/*    id={"StudentID"}*/}
                                    {/*    name={"StudentID"}*/}
                                    {/*    onChange={onEdit}*/}
                                    {/*    value={formData.StudentID}*/}
                                    {/*    className={"form-control"}*/}
                                    {/*>*/}
                                    {/*    <option value=''>Select Student</option>*/}
                                    {/*    {*/}
                                    {/*        studentList.length > 0 && studentList.map((item, index) => {*/}
                                    {/*            return <option key={index} value={item.StudentID}>{item.FirstName} {item.MiddleName} {item.Surname} ({item.StudentID})</option>*/}
                                    {/*        })*/}
                                    {/*    }*/}

                                    {/*</select>*/}
                                </div>
                                <div id="new_student">
                                    <div className="form-group mb-4">
                                        <label htmlFor="ApplicationID">Application ID</label>
                                        <input
                                            type="text"
                                            id={"ApplicationID"}
                                            name={"ApplicationID"}
                                            onChange={onEdit}
                                            value={formData.ApplicationID}
                                            className={"form-control"}
                                            placeholder={"Enter the Application ID"}
                                        />
                                    </div>
                                    <div className="form-group mb-4">
                                        <label htmlFor="UserType">Select Admission Type</label>
                                        <select
                                            id={"AdmissionType"}
                                            name={"AdmissionType"}
                                            onChange={handleApplicantChange}
                                            value={formData.AdmissionType}
                                            className={"form-control"}
                                        >
                                            <option value="">Select Admission Type</option>
                                            <option value="undergraduate">Undergraduate</option>
                                            <option value="postgraduate">Postgraduate</option>
                                        </select>
                                    </div>
                                </div>
                                <div id="student_details">
                                    {
                                        formData.UserType === "Returning Student" && formData.StudentID !== "" ? <div className="form-group mb-4">
                                            <a href={`/registration/student-manager/enrolment/${encryptData(formData.StudentID)}`} target="_blank" className="btn btn-sm btn-circle btn-primary w-100">
                                                Student Dashboard
                                            </a>
                                        </div> : <></>
                                    }
                                    <div className="form-group mb-4">
                                        <label htmlFor="AppID">Application ID</label>
                                        <input
                                            type="text"
                                            name={"AppID"}
                                            onChange={onEdit}
                                            value={formData.AppID}
                                            className={"form-control"}
                                            readOnly
                                        />
                                    </div>
                                    <div className="form-group mb-4">
                                        <label htmlFor="FirstName">FirstName</label>
                                        <input
                                            type="FirstName"
                                            name={"FirstName"}
                                            onChange={onEdit}
                                            value={formData.FirstName}
                                            className={"form-control"}
                                            readOnly
                                        />
                                    </div>
                                    <div className="form-group mb-4">
                                        <label htmlFor="MiddleName">MiddleName</label>
                                        <input
                                            type="text"
                                            name={"MiddleName"}
                                            onChange={onEdit}
                                            value={formData.MiddleName}
                                            className={"form-control"}
                                            readOnly
                                        />
                                    </div>
                                    <div className="form-group mb-4">
                                        <label htmlFor="Surname">Surname</label>
                                        <input
                                            type="text"
                                            name={"Surname"}
                                            onChange={onEdit}
                                            value={formData.Surname}
                                            className={"form-control"}
                                            readOnly
                                        />
                                    </div>
                                    <div className="form-group mb-4">
                                        <label htmlFor="Course">Course</label>
                                        <input
                                            type="text"
                                            name={"Course"}
                                            onChange={onEdit}
                                            value={formData.Course}
                                            className={"form-control"}
                                            readOnly
                                        />
                                    </div>
                                    <div className="form-group mb-4">
                                        <label htmlFor="StudentLevel">Level</label>
                                        <input
                                            type="text"
                                            name={"StudentLevel"}
                                            onChange={onEdit}
                                            value={formData.StudentLevel}
                                            className={"form-control"}
                                            readOnly
                                        />
                                    </div>
                                    <div className="form-group mb-4">
                                        <label htmlFor="StudentSemester">Semester</label>
                                        <input
                                            type="text"
                                            name={"StudentSemester"}
                                            onChange={onEdit}
                                            value={formData.StudentSemester}
                                            className={"form-control"}
                                            readOnly
                                        />
                                    </div>
                                    <div className="form-group mb-4">
                                        <label htmlFor="EmailAddress">Email</label>
                                        <input
                                            type="text"
                                            name={"EmailAddress"}
                                            onChange={onEdit}
                                            value={formData.EmailAddress}
                                            className={"form-control"}
                                            readOnly
                                        />
                                    </div>

                                </div>
                            </div>
                            <div className="col-md-6" id="tab_content">
                                <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-8">

                                    <li className="nav-item">
                                        <a className="nav-link text-active-primary pb-4 active" data-bs-toggle="tab" href="#tuition_fee">Tuition Fee</a>
                                    </li>

                                    <li className="nav-item">
                                        <a className="nav-link text-active-primary pb-4" data-kt-countup-tabs="true" data-bs-toggle="tab" href="#other_fee_tab">Other Fee</a>
                                    </li>

                                    <li className="nav-item">
                                        <a className="nav-link text-active-primary pb-4" data-bs-toggle="tab" href="#payment_history">Payment History</a>
                                    </li>

                                </ul>
                                <div className="tab-content" id="myTabContent">

                                    <div className="tab-pane fade active show" id="tuition_fee" role="tabpanel">
                                        <div className="" data-kt-customer-table-toolbar="base">
                                            <Table data={tuitionDatatable} pagingTop={false} paging={false} />
                                        </div>
                                    </div>
                                    <div className="tab-pane fade" id="other_fee_tab" role="tabpanel">
                                        <div className="" data-kt-customer-table-toolbar="base">
                                            <Table data={otherFeeDatatable} pagingTop={false} paging={false} />
                                        </div>
                                    </div>
                                    <div className="tab-pane fade " id="payment_history" role="tabpanel">
                                        <div className="" data-kt-customer-table-toolbar="base">
                                            <Table data={paymentHistoryDatatable} pagingTop={false} paging={false} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3" id="payment_content">
                                <div className="alert alert-primary">
                                    <div className="d-flex flex-column text-center">
                                        <span className="h3">Outstanding: <b><del>N</del></b>{showOutStanding}</span>
                                    </div>
                                </div>

                                <div className="form-group mb-4">
                                    <label htmlFor="ItemTotal">Item Total</label>
                                    <input
                                        type="text"
                                        id={"ItemTotal"}
                                        name={"ItemTotal"}
                                        value={totalCheckedItems}
                                        className={"form-control"}
                                        readOnly
                                    />
                                </div>
                                <div className="form-group mb-4">
                                    <label htmlFor="AmountDue">Amount Due</label>
                                    <input
                                        type="text"
                                        id="AmountDue"
                                        name={"AmountDue"}
                                        value={amountDue}
                                        className={"form-control"}
                                        readOnly
                                    />
                                </div>
                                <div id="calculate" style={{ color: 'teal' }}>{showAmountPaid}</div>
                                <div className="form-group mb-4">
                                    <label htmlFor="AmountPaid">Amount Paid</label>
                                    <input
                                        type="number"
                                        id={"AmountPaid"}
                                        name={"AmountPaid"}
                                        onChange={onEdit}
                                        value={formData.AmountPaid}
                                        className={"form-control"}
                                    />
                                </div>
                                <div className="form-group mb-4">
                                    <label htmlFor="PaymentMethod">Payment Method</label>
                                    <select
                                        id={"PaymentMethod"}
                                        name={"PaymentMethod"}
                                        onChange={onEdit}
                                        value={formData.PaymentMethod}
                                        className={"form-control"}
                                    >
                                        <option value="">Select Payment Method</option>
                                        <option value="Bank">Bank</option>
                                        <option value="Bank Draft">Bank Draft</option>
                                        <option value="Transfer">Transfer</option>
                                        <option value="Trimester Credit">Trimester Credit</option>
                                    </select>
                                </div>
                                <div className="form-group mb-4">
                                    <label htmlFor="PaymentID">Payment Reference</label>
                                    <input
                                        type="text"
                                        name={"PaymentRef"}
                                        onChange={onEdit}
                                        value={formData.PaymentRef}
                                        className={"form-control"}
                                    />
                                </div>
                                <div className="form-group pt-4 mb-2">
                                    <button onClick={onTriggerSubmit} className="btn btn-primary w-100">
                                        Post Payment
                                    </button>
                                </div>
                                {
                                    showSuccess ?
                                        <>
                                            <div className="alert alert-success mb-3">
                                                <div className="d-flex flex-column text-center">
                                                    <span >Payment Posted Successfully</span>
                                                </div>
                                            </div>
                                            <div className="mb-2 " style={{ display: 'flex' }}>
                                                <button className="btn btn-primary btn-sm" onClick={onAllowResult}>Allow Result</button>
                                                <button className="btn btn-info btn-sm" onClick={onAllowRegistration}>Allow Registration</button>
                                                <a href={`/human-resources/finance/payment-receipt/${encryptData(paymentRefID)}`} target="_blank" className="btn btn-success btn-sm">Print</a>
                                            </div>
                                        </>
                                        : ""
                                }

                                {
                                    cart.length > 0 ?
                                        (
                                            <table className="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>S/N</th>
                                                        <th>Item</th>
                                                        <th>Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        cart.map((item, index) =>
                                                        {
                                                            return (
                                                                <tr key={index}><td>{index + 1}</td><td>{item.item_name}</td><td>{item.item_amount}</td></tr>
                                                            )
                                                        })
                                                    }
                                                </tbody>
                                            </table>
                                        )
                                        : <></>

                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) =>
{
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(PostPayment);