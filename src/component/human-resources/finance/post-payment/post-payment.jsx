import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import SearchSelect from "../../../common/select/SearchSelect";
import { api } from "../../../../resources/api";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert, showConfirm } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import AGTable from "../../../common/table/AGTable";
import { currencyConverter, encryptData, projectCode } from "../../../../resources/constants";
import { Link } from "react-router-dom";

function PostPayment(props) {

    const [isLoading, setIsLoading] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState('off');
    const [isStudentLoading, setIsStudentLoading] = useState(false);
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
    const [studentDataLoaded, setStudentDataLoaded] = useState(false);
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
            { label: "S/N", field: "sn" },
            { label: "Description", field: "Description" },
            { label: "Amount", field: "SemesterTuition" }
        ],
        rows: [],
    });

    const [otherFeeDatatable, setOtherFeeDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Description", field: "Title" },
            { label: "Amount", field: "Amount" }
        ],
        rows: [],
    });

    const [paymentHistoryDatatable, setPaymentHistoryDatatable] = useState({
        columns: [
            { label: "S/N", field: "sn" },
            { label: "Payment ID", field: "PaymentID" },
            { label: "Payment Method", field: "PaymentMethod" },
            { label: "Description", field: "Description" },
            { label: "Amount Paid", field: "AmountPaid" },
            { label: "Amount Expected", field: "TotalExpectedAmount" },
            { label: "Outstanding", field: "OutStandingAmount" },
            { label: "Payment Semester", field: "SemesterCode" },
            { label: "Paid On", field: "InsertedDate" },
            { label: "Received By", field: "InsertedBy" },
            { label: "Print", field: "action" },
        ],
        rows: [],
    });

    const getData = async () => {
        try {
            const { success: semesterSuccess, data: semesterData } = await api.get("staff/academics/timetable/semester/list");
            if (semesterSuccess && semesterData.length > 0) {
                setSemesterList(semesterData)
            }
        } catch (err) {
            console.log("NETWORK ERROR");
        }

        try {
            const { success: studentSuccess, data: studentData } = await api.get("staff/student-manager/student/active");
            if (studentSuccess && studentData.length > 0) {
                let rows = [];
                studentData.map((item) => {
                    rows.push({
                        value: item.StudentID,
                        label: `${item.FirstName} ${item.MiddleName} ${item.Surname} (${item.StudentID})`,
                    });
                });
                setStudentSelectList(rows);
                setStudentList(studentData)
            }
        } catch (err) {
            console.log("NETWORK ERROR");
        }

    }

    const getApplicantData = async (id) => {
        setShowOutStanding(0)
        setIsStudentLoading(true);
        setStudentDataLoaded(false);
        try {
            const { success, data: resultData } = await api.get(`staff/finance/applicant/details/${btoa(id)}`);
            if (success) {
                if (resultData.studentData.length > 0) {
                    const data = resultData.studentData[0];
                    const other_fee = resultData.otherFee;
                    const payment_history = resultData.paymentHistory;
                    const studentScholarshipData = resultData.scholarship;
                    const studentOutstanding = resultData.OutStandingAmount;
                    setAmountDue(parseFloat(studentOutstanding))
                    setShowOutStanding(prevState => prevState + parseFloat(studentOutstanding))
                    outStandingAmount += parseFloat(studentOutstanding);

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

                    try {
                        const { success: postSuccess, data: postResult } = await api.post(`staff/finance/tuition/details`, dataSet);
                        if (postSuccess && postResult.length > 0) {
                            const res = postResult[0];
                            let desc, session_desc = '';
                            let amt, session_amt = 0;
                            if (studentScholarshipData.length > 0) {
                                desc = `Semester Tuition (${studentScholarshipData[0].ScholarshipName})`;
                                session_desc = `Session Tuition (${studentScholarshipData[0].ScholarshipName})`;
                                amt = parseFloat(res.SemesterTuition) - (parseFloat(res.SemesterTuition) / 100) * parseFloat(studentScholarshipData[0].TuitionPercentage);
                                session_amt = parseFloat(res.SessionTuition) - (parseFloat(res.SessionTuition) / 100) * parseFloat(studentScholarshipData[0].TuitionPercentage);
                            } else {
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
                                        <input type="radio" id="tuitionCheck" name="tuitionCheck" className="form-check-input" onChange={() => onTuitionSelect(amt, desc)} value={amt} /> <span>{currencyConverter(amt)}</span>
                                    </div>
                                ),
                            }, {
                                sn: '2',
                                Description: session_desc,
                                SemesterTuition: (
                                    <div className="form-group">
                                        <input type="radio" id="tuitionCheck" name="tuitionCheck" className="form-check-input" onChange={() => onTuitionSelect(session_amt, session_desc)} value={session_amt} /> <span>{currencyConverter(session_amt)}</span>
                                    </div>
                                ),
                            }];

                            setTuitionDatatable({ ...tuitionDatatable, columns: tuitionDatatable.columns, rows: rows });
                        }
                    } catch (err) {
                        console.log("NETWORK ERROR");
                    }

                    if (other_fee.length > 0) {
                        let rows = [];
                        other_fee.map((item, index) => {
                            let title = item.Title;
                            let amount = parseFloat(item.Amount);
                            let feeding_discount, hostel_discount = 0;

                            if (title.includes('Feeding')) {
                                if (studentScholarshipData.length > 0) {
                                    feeding_discount = parseFloat(studentScholarshipData[0].FeedingPercentage);
                                    if (feeding_discount > 0) {
                                        title += ` ${studentScholarshipData[0].ScholarshipName}`
                                        amount -= (parseFloat(item.Amount) / 100) * parseFloat(studentScholarshipData[0].FeedingPercentage)
                                    }
                                }
                            }

                            if (title.includes('Hostel')) {
                                if (studentScholarshipData.length > 0) {
                                    hostel_discount = parseFloat(studentScholarshipData[0].HostelPercentage);
                                    if (hostel_discount > 0) {
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
                                        <input type="checkbox" id="checkItem" name="checkItem" className="form-check-input checkItem" data={title} onChange={(e) => onOtherFeeChecked(amount, title, e)} value={amount} /> <span>{currencyConverter(amount)}</span>
                                    </div>
                                ),
                            });
                        });
                        setOtherFeeDatatable({ ...otherFeeDatatable, columns: otherFeeDatatable.columns, rows: rows });
                    }

                    if (payment_history.length > 0) {
                        let rows = [];
                        payment_history.map((item, index) => {
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
                        setPaymentHistoryDatatable({ ...paymentHistoryDatatable, columns: paymentHistoryDatatable.columns, rows: rows });
                    }
                    const PaymentID = formData.SemesterCode + generate_token(6) + data.ApplicationID.slice(-4);
                    setPaymentRefID(PaymentID)
                    setStudentDataLoaded(true);
                }
            }
        } catch (err) {
            console.log("NETWORK ERROR");
        }
        setIsStudentLoading(false);
    }

    const getStudentData = async (id) => {
        setShowOutStanding(0)
        setIsStudentLoading(true);
        setStudentDataLoaded(false);
        try {
            const { success, data: resultData } = await api.get(`staff/finance/student/details/${btoa(id)}`);
            if (success) {
                if (resultData.studentData.length > 0) {
                    const data = resultData.studentData[0];
                    const other_fee = resultData.otherFee;
                    const payment_history = resultData.paymentHistory;
                    const studentScholarshipData = resultData.scholarship;
                    const studentOutstanding = resultData.OutStandingAmount;
                    setAmountDue(parseFloat(studentOutstanding))
                    setShowOutStanding(prevState => prevState + parseFloat(studentOutstanding))
                    outStandingAmount += parseFloat(studentOutstanding);

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

                    try {
                        const { success: postSuccess, data: postResult } = await api.post(`staff/finance/tuition/details`, dataSet);
                        if (postSuccess) {
                            if (postResult.length > 0) {
                                const res = postResult[0];
                                let desc, session_desc = '';
                                let amt, session_amt = 0;
                                if (studentScholarshipData.length > 0) {
                                    desc = `${projectCode === "ALANSAR_UNIVERSITY_STAFF_PORTAL" ? "Tuition" : "Semester Tuition"} (${studentScholarshipData[0].ScholarshipName})`;
                                    session_desc = `Session Tuition (${studentScholarshipData[0].ScholarshipName})`;
                                    amt = parseFloat(res.SemesterTuition) - (parseFloat(res.SemesterTuition) / 100) * parseFloat(studentScholarshipData[0].TuitionPercentage);
                                    session_amt = parseFloat(res.SessionTuition) - (parseFloat(res.SessionTuition) / 100) * parseFloat(studentScholarshipData[0].TuitionPercentage);
                                } else {
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
                                            <input type="radio" id="tuitionCheck" name="tuitionCheck" className="form-check-input" onChange={() => onTuitionSelect(amt, desc)} value={amt} /> <span>{currencyConverter(amt)}</span>
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
                                                <input type="radio" id="tuitionCheck" name="tuitionCheck" className="form-check-input" onChange={() => onTuitionSelect(session_amt, session_desc)} value={session_amt} /> <span>{currencyConverter(session_amt)}</span>
                                            </div>
                                        ),
                                    }
                                ];

                                setTuitionDatatable({ ...tuitionDatatable, columns: tuitionDatatable.columns, rows: rows });
                            } else {
                                setTuitionDatatable({ ...tuitionDatatable, columns: tuitionDatatable.columns, rows: [] });
                            }
                        }
                    } catch (err) {
                        console.log("NETWORK ERROR");
                    }

                    if (other_fee.length > 0) {
                        let rows = [];
                        other_fee.map((item, index) => {
                            let title = item.Title;
                            let amount = parseFloat(item.Amount);
                            let feeding_discount, hostel_discount = 0;

                            if (title.includes('Feeding')) {
                                if (studentScholarshipData.length > 0) {
                                    feeding_discount = parseFloat(studentScholarshipData[0].FeedingPercentage);
                                    if (feeding_discount > 0) {
                                        title += ` ${studentScholarshipData[0].ScholarshipName}`
                                        amount -= (parseFloat(item.Amount) / 100) * parseFloat(studentScholarshipData[0].FeedingPercentage)
                                    }
                                }
                            }

                            if (title.includes('Hostel')) {
                                if (studentScholarshipData.length > 0) {
                                    hostel_discount = parseFloat(studentScholarshipData[0].HostelPercentage);
                                    if (hostel_discount > 0) {
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
                                        <input type="checkbox" id="checkItem" name="checkItem" className="form-check-input checkItem" data={title} onChange={(e) => onOtherFeeChecked(amount, title, e)} value={amount} /> <span>{currencyConverter(amount)}</span>
                                    </div>
                                ),
                            });
                        });
                        setOtherFeeDatatable({ ...otherFeeDatatable, columns: otherFeeDatatable.columns, rows: rows });
                    } else {
                        setOtherFeeDatatable({ ...otherFeeDatatable, columns: otherFeeDatatable.columns, rows: [] });
                    }

                    if (payment_history.length > 0) {
                        let rows = [];
                        payment_history.map((item, index) => {
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
                        setPaymentHistoryDatatable({ ...paymentHistoryDatatable, columns: paymentHistoryDatatable.columns, rows: rows });
                    } else {
                        setPaymentHistoryDatatable({ ...paymentHistoryDatatable, columns: paymentHistoryDatatable.columns, rows: [] });
                    }

                    const PaymentID = formData.SemesterCode + generate_token(6) + data.StudentID.slice(-4);
                    setPaymentRefID(PaymentID)
                    setStudentDataLoaded(true);
                }
            }
        } catch (err) {
            console.log("NETWORK ERROR");
        }
        setIsStudentLoading(false);
    }


    useEffect(() => {
        getData();
    }, [])

    useEffect(() => { setFormData(formData) }, [change])

    const onTuitionSelect = (amount, name) => {
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
        for (let i = 0; i < itemArray.length; i++) {
            itemTotal += itemArray[i].item_amount
        }

        let newAmountDue = outStandingAmount < 1 ? outStandingAmount + itemTotal : itemTotal + outStandingAmount;
        setAmountDue(newAmountDue)
        setTotalCheckedItems(itemTotal)
    }

    const onOtherFeeChecked = (amount, name, e) => {
        setChange('onOtherFeeChecked')
        const item_value = parseFloat(amount);
        const item_name = name;
        let itemTotal = 0;
        if (e.target.checked) {
            const tuitionData = { item_name: item_name, item_amount: item_value }
            itemArray.push(tuitionData)
            for (let i = 0; i < itemArray.length; i++) {
                itemTotal += itemArray[i].item_amount
            }
            setCart(prevState => [...prevState, tuitionData])
        } else {
            const newItem = itemArray.filter((item) => {
                return item.item_name !== item_name
            });
            itemArray.length = 0;
            itemArray.push(...newItem)
            setCart(prevState => [...prevState.filter(e => e.item_name !== item_name)])
            for (let i = 0; i < itemArray.length; i++) {
                itemTotal += itemArray[i].item_amount
            }
        }

        let newAmountDue = outStandingAmount < 1 ? outStandingAmount + itemTotal : itemTotal + outStandingAmount;
        setAmountDue(newAmountDue)
        setTotalCheckedItems(itemTotal)
    }

    const onEdit = (e) => {

        if (e.target.name === 'UserType') {
            setFormData({
                ...formData,
                ApplicationID: "",
                StudentID: "",
                AppID: "",
                UserType: "",
            })
            setStudentDataLoaded(false);
        }

        if (e.target.name === 'AmountPaid') {
            if (e.target.value !== '') {
                let formatter = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'NGN',
                });

                setTimeout(() => {
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

    const handleStudentChange = (e) => {
        setStudentDataLoaded(false);
        if (e.target.value !== '') {
            const filter_student = studentList.filter(
                (i) => i.StudentID === e.target.value
            );
            if (filter_student.length > 0) {
                selectedStudent.StudentID = filter_student[0].StudentID;
                const id = filter_student[0].StudentID;
                getStudentData(id);
                setChange(id)
            }
        }

    };

    const handleApplicantChange = (e) => {
        setStudentDataLoaded(false);
        if (e.target.value !== '') {
            const id = formData.ApplicationID;
            getApplicantData(id);
            setChange(id)
        }
    };

    const generate_token = (length) => {
        let a = "1234567890".split("");
        let b = [];
        for (let i = 0; i < length; i++) {
            let j = (Math.random() * (a.length - 1)).toFixed(0);
            b[i] = a[j];
        }
        return b.join("");
    }

    const onTriggerSubmit = async () => {
        setIsSubmitLoading(true)
        onSubmit();
    }

    const onSubmit = async () => {
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
        setFormData((state) => {
            return state;
        }
        )

        if (formData.SemesterCode.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select the payment semester", "error");
            return false;
        }

        if (formData.AmountPaid.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please enter the amount paid", "error");
            return false;
        }

        if (formData.PaymentMethod.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Please select the payment method", "error");
            return false;
        }

        if (paymentRefID.toString().trim() === "") {
            showAlert("EMPTY FIELD", "Payment reference cannot be empty, please reload the page and try again!", "error");
            return false;
        }

        if (parseFloat(amount_due) < 0)
            outstanding = parseFloat(amount_due) + (-parseFloat(amount_paid));
        else
            outstanding = parseFloat(amount_due) - parseFloat(amount_paid);

        if (parseFloat(amount_paid) > check_outstanding) {
            if (check_outstanding < 0) {
                if (itemArray.length < 1) {
                    let append_data = {
                        item_name: 'Account Credit',
                        item_amount: amount_paid
                    }
                    itemArray.push(append_data);
                    amount_expected = amount_paid;
                }
            }
        }

        if (check_outstanding > 0) {
            let newArray = itemArray.filter(function (item) {
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

        try {
            const { success, data: result } = await api.post(`staff/finance/post-payment`, sendData);
            if (success && result.message === "success") {
                try {
                    const { success: detailSuccess, data: detailResult } = await api.post(`staff/finance/post-payment-details`, sendData);
                    if (detailSuccess && detailResult.message === "success") {
                        toast.success("Payment Posted Successfully");
                        setShowSuccess(true)
                        setChange("UpdateNewData");
                    } else {
                        showAlert("ERROR", "Something went wrong. Please try again!", "error");
                    }
                } catch (err) {
                    console.error('ERROR', err);
                }
            } else {
                showAlert("ERROR", "Something went wrong. Please try again!", "error");
            }
        } catch (error) {
            showAlert("NETWORK ERROR", "Please check your connection and try again!", "error");
        }
        setIsSubmitLoading(false);
    }

    const onAllowResult = async () => {
        let sendData = { StudentID: formData.StudentID, InsertedBy: formData.InsertedBy }
        let studentName = `${formData.FirstName} ${formData.MiddleName} ${formData.Surname}`
        showConfirm(
            "CONFIRM UNBLOCKING",
            `Are you sure you want to unblock ${studentName} for Result?`,
            "warning"
        ).then(async (IsConfirmed) => {
            if (IsConfirmed) {
                try {
                    const { success, data: result } = await api.post(`staff/finance/allow-student-result`, sendData);
                    if (success && result.message === "success") {
                        toast.success("Result Access Granted Successfully");
                    } else {
                        showAlert("ERROR", "Something went wrong. Please try again!", "error");
                    }
                } catch (err) {
                    console.error('ERROR', err);
                }
            }
        });
    }

    const onAllowRegistration = async () => {
        let sendData = { StudentID: formData.StudentID, InsertedBy: formData.InsertedBy };
        let studentName = `${formData.FirstName} ${formData.MiddleName} ${formData.Surname}`
        showConfirm(
            "CONFIRM UNBLOCKING",
            `Are you sure you want to unblock ${studentName} for Registration?`,
            "warning"
        ).then(async (IsConfirmed) => {
            if (IsConfirmed) {
                try {
                    const { success, data: result } = await api.post(`staff/finance/allow-student-registration`, sendData);
                    if (success && result.message === "success") {
                        toast.success("Registration Access Granted Successfully");
                    } else {
                        showAlert("ERROR", "Something went wrong. Please try again!", "error");
                    }
                } catch (err) {
                    console.error('ERROR', err);
                }
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
                    <div className="card-body pt-3">
                        {/* Row 1: Three dropdowns in a row */}
                        <div className="row mb-5">
                            <div className="col-md-4">
                                <SearchSelect
                                    id="SemesterCode"
                                    label="Select Semester"
                                    value={semesterList.map(s => ({ value: s.SemesterCode, label: s.Description })).find(op => op.value === formData.SemesterCode) || null}
                                    options={semesterList.map(s => ({ value: s.SemesterCode, label: s.Description }))}
                                    onChange={(selected) => onEdit({ target: { name: 'SemesterCode', value: selected?.value || '' } })}
                                    placeholder="Select Semester"
                                />
                            </div>
                            <div className="col-md-4">
                                <SearchSelect
                                    id="UserType"
                                    label="Select User Type"
                                    value={formData.UserType ? { value: formData.UserType, label: formData.UserType } : null}
                                    options={[
                                        { value: "Returning Student", label: "Returning Student" },
                                        { value: "New Student", label: "New Student" }
                                    ]}
                                    onChange={(selected) => onEdit({ target: { name: 'UserType', value: selected?.value || '' } })}
                                    placeholder="Select User Type"
                                />
                            </div>
                            <div className="col-md-4">
                                {formData.UserType === 'Returning Student' && (
                                    <SearchSelect
                                        id="StudentID"
                                        label="Select Student"
                                        value={studentSelectList.find(s => s.value === selectedStudent.StudentID) || null}
                                        options={studentSelectList}
                                        onChange={(selected) => handleStudentChange({ target: { value: selected?.value || '' } })}
                                        placeholder="Search Student"
                                    />
                                )}
                                {formData.UserType === 'New Student' && (
                                    <div className="row">
                                        <div className="col-md-7">
                                            <label htmlFor="ApplicationID">Application ID</label>
                                            <input
                                                type="text"
                                                id="ApplicationID"
                                                name="ApplicationID"
                                                onChange={onEdit}
                                                value={formData.ApplicationID}
                                                className="form-control"
                                                placeholder="Enter Application ID"
                                            />
                                        </div>
                                        <div className="col-md-5">
                                            <SearchSelect
                                                id="AdmissionType"
                                                label="Admission Type"
                                                value={formData.AdmissionType ? { value: formData.AdmissionType, label: formData.AdmissionType.charAt(0).toUpperCase() + formData.AdmissionType.slice(1) } : null}
                                                options={[
                                                    { value: "undergraduate", label: "Undergraduate" },
                                                    { value: "postgraduate", label: "Postgraduate" }
                                                ]}
                                                onChange={(selected) => handleApplicantChange({ target: { name: 'AdmissionType', value: selected?.value || '' } })}
                                                placeholder="Type"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Loading spinner */}
                        {isStudentLoading && (
                            <div className="text-center py-10">
                                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted mt-3">Loading student data...</p>
                            </div>
                        )}

                        {/* Student Profile Card + Tabs (shown after data loads) */}
                        {studentDataLoaded && !isStudentLoading && (
                            <>
                                {/* Student Profile Card */}
                                <div className="card bg-light border-0 shadow-sm mb-5">
                                    <div className="card-body py-4">
                                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                                            <div className="d-flex align-items-center">
                                                <div className="symbol symbol-50px symbol-circle me-5">
                                                    <span className="symbol-label bg-primary text-white fs-2 fw-bold">
                                                        {formData.FirstName.charAt(0)}{formData.Surname.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="mb-0 fw-bold">{formData.FirstName} {formData.MiddleName} {formData.Surname}</h4>
                                                    <span className="text-muted fs-7">{formData.AppID}</span>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-6 flex-wrap">
                                                <div className="text-center">
                                                    <span className="text-muted fs-8 d-block">Course</span>
                                                    <span className="fw-bold fs-7">{formData.Course}</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-muted fs-8 d-block">Level</span>
                                                    <span className="fw-bold fs-7">{formData.StudentLevel}</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-muted fs-8 d-block">Semester</span>
                                                    <span className="fw-bold fs-7">{formData.StudentSemester}</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-muted fs-8 d-block">Email</span>
                                                    <span className="fw-bold fs-7">{formData.EmailAddress}</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-muted fs-8 d-block">Outstanding</span>
                                                    <span className={`fw-bold fs-7 ${showOutStanding > 0 ? 'text-danger' : 'text-success'}`}>
                                                        {currencyConverter(showOutStanding)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2 mt-2 mt-md-0">
                                                {formData.UserType === "Returning Student" && formData.StudentID !== "" && (
                                                    <a href={`/registration/student-manager/enrolment/${encryptData(formData.StudentID)}`} target="_blank" className="btn btn-sm btn-light-primary">
                                                        <i className="fa fa-external-link-alt me-1"></i> Dashboard
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs Section - Full Width */}
                                <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-6">
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
                                        <div className="row">
                                            <div className="col-md-8">
                                                <AGTable data={tuitionDatatable} paging={false} />
                                            </div>
                                            <div className="col-md-4">
                                                <div className="card border shadow-sm">
                                                    <div className="card-header bg-light py-3">
                                                        <h5 className="card-title mb-0">Post Payment</h5>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="form-group mb-3">
                                                            <label htmlFor="ItemTotal">Item Total</label>
                                                            <input type="text" id="ItemTotal" name="ItemTotal" value={totalCheckedItems} className="form-control" readOnly />
                                                        </div>
                                                        <div className="form-group mb-3">
                                                            <label htmlFor="AmountDue">Amount Due</label>
                                                            <input type="text" id="AmountDue" name="AmountDue" value={amountDue} className="form-control" readOnly />
                                                        </div>
                                                        <div id="calculate" style={{ color: 'teal' }} className="mb-2">{showAmountPaid}</div>
                                                        <div className="form-group mb-3">
                                                            <label htmlFor="AmountPaid">Amount Paid</label>
                                                            <input type="number" id="AmountPaid" name="AmountPaid" onChange={onEdit} value={formData.AmountPaid} className="form-control" />
                                                        </div>
                                                        <div className="form-group mb-3">
                                                            <SearchSelect
                                                                id="PaymentMethod"
                                                                label="Payment Method"
                                                                value={formData.PaymentMethod ? { value: formData.PaymentMethod, label: formData.PaymentMethod } : null}
                                                                options={[
                                                                    { value: "Bank", label: "Bank" },
                                                                    { value: "Bank Draft", label: "Bank Draft" },
                                                                    { value: "Transfer", label: "Transfer" },
                                                                    { value: "Trimester Credit", label: "Trimester Credit" }
                                                                ]}
                                                                onChange={(selected) => onEdit({ target: { name: 'PaymentMethod', value: selected?.value || '' } })}
                                                                placeholder="Select Payment Method"
                                                            />
                                                        </div>
                                                        <div className="form-group mb-3">
                                                            <label htmlFor="PaymentRef">Payment Reference</label>
                                                            <input type="text" name="PaymentRef" onChange={onEdit} value={formData.PaymentRef} className="form-control" />
                                                        </div>
                                                        <div className="form-group pt-2 mb-2">
                                                            <button onClick={onTriggerSubmit} className="btn btn-primary w-100">
                                                                Post Payment
                                                            </button>
                                                        </div>
                                                        {showSuccess && (
                                                            <>
                                                                <div className="alert alert-success mb-3 text-center">
                                                                    Payment Posted Successfully
                                                                </div>
                                                                <div className="d-flex gap-2 flex-wrap">
                                                                    <button className="btn btn-primary btn-sm flex-fill" onClick={onAllowResult}>Allow Result</button>
                                                                    <button className="btn btn-info btn-sm flex-fill" onClick={onAllowRegistration}>Allow Registration</button>
                                                                    <a href={`/human-resources/finance/payment-receipt/${encryptData(paymentRefID)}`} target="_blank" className="btn btn-success btn-sm flex-fill">Print</a>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {cart.length > 0 && (
                                                    <div className="card border shadow-sm mt-4">
                                                        <div className="card-header bg-light py-3">
                                                            <h6 className="card-title mb-0">Cart Items</h6>
                                                        </div>
                                                        <div className="card-body p-0">
                                                            <table className="table table-striped mb-0">
                                                                <thead>
                                                                    <tr>
                                                                        <th>S/N</th>
                                                                        <th>Item</th>
                                                                        <th>Amount</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {cart.map((item, index) => (
                                                                        <tr key={index}><td>{index + 1}</td><td>{item.item_name}</td><td>{currencyConverter(item.item_amount)}</td></tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tab-pane fade" id="other_fee_tab" role="tabpanel">
                                        <div className="row">
                                            <div className="col-md-8">
                                                <AGTable data={otherFeeDatatable} paging={false} />
                                            </div>
                                            <div className="col-md-4">
                                                <div className="card border shadow-sm">
                                                    <div className="card-header bg-light py-3">
                                                        <h5 className="card-title mb-0">Post Payment</h5>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="form-group mb-3">
                                                            <label htmlFor="ItemTotal2">Item Total</label>
                                                            <input type="text" name="ItemTotal" value={totalCheckedItems} className="form-control" readOnly />
                                                        </div>
                                                        <div className="form-group mb-3">
                                                            <label htmlFor="AmountDue2">Amount Due</label>
                                                            <input type="text" name="AmountDue" value={amountDue} className="form-control" readOnly />
                                                        </div>
                                                        <div style={{ color: 'teal' }} className="mb-2">{showAmountPaid}</div>
                                                        <div className="form-group mb-3">
                                                            <label htmlFor="AmountPaid2">Amount Paid</label>
                                                            <input type="number" name="AmountPaid" onChange={onEdit} value={formData.AmountPaid} className="form-control" />
                                                        </div>
                                                        <div className="form-group mb-3">
                                                            <SearchSelect
                                                                id="PaymentMethod2"
                                                                label="Payment Method"
                                                                value={formData.PaymentMethod ? { value: formData.PaymentMethod, label: formData.PaymentMethod } : null}
                                                                options={[
                                                                    { value: "Bank", label: "Bank" },
                                                                    { value: "Bank Draft", label: "Bank Draft" },
                                                                    { value: "Transfer", label: "Transfer" },
                                                                    { value: "Trimester Credit", label: "Trimester Credit" }
                                                                ]}
                                                                onChange={(selected) => onEdit({ target: { name: 'PaymentMethod', value: selected?.value || '' } })}
                                                                placeholder="Select Payment Method"
                                                            />
                                                        </div>
                                                        <div className="form-group mb-3">
                                                            <label htmlFor="PaymentRef2">Payment Reference</label>
                                                            <input type="text" name="PaymentRef" onChange={onEdit} value={formData.PaymentRef} className="form-control" />
                                                        </div>
                                                        <div className="form-group pt-2 mb-2">
                                                            <button onClick={onTriggerSubmit} className="btn btn-primary w-100">
                                                                Post Payment
                                                            </button>
                                                        </div>
                                                        {showSuccess && (
                                                            <>
                                                                <div className="alert alert-success mb-3 text-center">
                                                                    Payment Posted Successfully
                                                                </div>
                                                                <div className="d-flex gap-2 flex-wrap">
                                                                    <button className="btn btn-primary btn-sm flex-fill" onClick={onAllowResult}>Allow Result</button>
                                                                    <button className="btn btn-info btn-sm flex-fill" onClick={onAllowRegistration}>Allow Registration</button>
                                                                    <a href={`/human-resources/finance/payment-receipt/${encryptData(paymentRefID)}`} target="_blank" className="btn btn-success btn-sm flex-fill">Print</a>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tab-pane fade" id="payment_history" role="tabpanel">
                                        <AGTable data={paymentHistoryDatatable} paging={false} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
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

export default connect(mapStateToProps, null)(PostPayment);
