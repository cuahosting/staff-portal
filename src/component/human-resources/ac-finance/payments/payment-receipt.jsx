import React, { useEffect, useState, useRef } from "react";
import api from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { currencyConverter, formatDateAndTime } from "../../../../resources/constants";

function PaymentReceipt({ payment, onBack, loginData }) {
    const token = loginData[0]?.token;
    const printRef = useRef();

    const [isLoading, setIsLoading] = useState(true);
    const [receiptData, setReceiptData] = useState(null);
    const [schoolInfo, setSchoolInfo] = useState({
        name: "Cosmopolitan University",
        address: "University Road, City, State",
        phone: "+234 XXX XXX XXXX",
        email: "info@cosmopolitanuniversity.edu.ng",
        logo: "/assets/images/logo.png",
    });

    const getReceiptDetails = async () => {
        const result = await api.get(
            `staff/ac-finance/payments/receipt/${payment.PaymentID}`,
            token
        );

        if (result.success && result.data?.data) {
            setReceiptData(result.data.data);
        } else {
            // Use payment prop as fallback
            setReceiptData(payment);
        }
        setIsLoading(false);
    };

    const getSchoolInfo = async () => {
        const result = await api.get("website/general/school-info", token, null, {}, false);

        if (result.success && result.data) {
            const data = result.data.data || result.data;
            if (data) {
                setSchoolInfo({
                    name: data.SchoolName || schoolInfo.name,
                    address: data.Address || schoolInfo.address,
                    phone: data.Phone || schoolInfo.phone,
                    email: data.Email || schoolInfo.email,
                    logo: data.Logo || schoolInfo.logo,
                });
            }
        }
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getReceiptDetails(), getSchoolInfo()]);
        };
        fetchData();
    }, []);

    if (isLoading) return <Loader />;

    const data = receiptData || payment;

    return (
        <div className="d-flex flex-column flex-row-fluid">
            {/* Header Actions */}
            <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
                <div className="d-flex align-items-center">
                    <button className="btn btn-light-primary me-3" onClick={onBack}>
                        <i className="fa fa-arrow-left"></i>
                    </button>
                    <h4 className="mb-0">Payment Receipt</h4>
                </div>
                <button className="btn btn-primary" onClick={handlePrint}>
                    <i className="fa fa-print me-2"></i>
                    Print Receipt
                </button>
            </div>

            {/* Receipt Content */}
            <div className="card">
                <div className="card-body p-10" ref={printRef}>
                    <div
                        style={{
                            maxWidth: "800px",
                            margin: "0 auto",
                            fontFamily: "Arial, sans-serif",
                        }}
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <img
                                src={schoolInfo.logo}
                                alt="Logo"
                                style={{ height: "80px", marginBottom: "15px" }}
                                onError={(e) => {
                                    e.target.style.display = "none";
                                }}
                            />
                            <h2 style={{ margin: "0 0 5px 0", color: "#333" }}>
                                {schoolInfo.name}
                            </h2>
                            <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                                {schoolInfo.address}
                            </p>
                            <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>
                                {schoolInfo.phone} | {schoolInfo.email}
                            </p>
                        </div>

                        {/* Receipt Title */}
                        <div
                            style={{
                                background: "#f8f9fa",
                                padding: "15px",
                                textAlign: "center",
                                marginBottom: "30px",
                                borderRadius: "5px",
                            }}
                        >
                            <h3 style={{ margin: "0", color: "#28a745" }}>
                                PAYMENT RECEIPT
                            </h3>
                        </div>

                        {/* Receipt Details */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "30px",
                            }}
                        >
                            <div>
                                <p style={{ margin: "0 0 5px 0" }}>
                                    <strong>Receipt No:</strong> {data.PaymentReference}
                                </p>
                                <p style={{ margin: "0 0 5px 0" }}>
                                    <strong>Date:</strong>{" "}
                                    {formatDateAndTime(data.PaymentDate, "datetime")}
                                </p>
                                <p style={{ margin: "0" }}>
                                    <strong>Payment Method:</strong>{" "}
                                    {data.PaymentMethod || "Online Payment"}
                                </p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p style={{ margin: "0 0 5px 0" }}>
                                    <strong>Student ID:</strong> {data.StudentID}
                                </p>
                                <p style={{ margin: "0 0 5px 0" }}>
                                    <strong>Semester:</strong>{" "}
                                    {data.SemesterName || data.SemesterCode || "-"}
                                </p>
                            </div>
                        </div>

                        {/* Student Info */}
                        <div
                            style={{
                                background: "#f8f9fa",
                                padding: "20px",
                                borderRadius: "5px",
                                marginBottom: "30px",
                            }}
                        >
                            <h5 style={{ margin: "0 0 15px 0", borderBottom: "1px solid #dee2e6", paddingBottom: "10px" }}>
                                Student Information
                            </h5>
                            <table style={{ width: "100%" }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "5px 0", width: "30%" }}>
                                            <strong>Full Name:</strong>
                                        </td>
                                        <td style={{ padding: "5px 0" }}>{data.StudentName}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "5px 0" }}>
                                            <strong>Programme:</strong>
                                        </td>
                                        <td style={{ padding: "5px 0" }}>
                                            {data.CourseName || "-"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "5px 0" }}>
                                            <strong>Level:</strong>
                                        </td>
                                        <td style={{ padding: "5px 0" }}>{data.Level || "-"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Payment Details */}
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                marginBottom: "30px",
                            }}
                        >
                            <thead>
                                <tr style={{ background: "#343a40", color: "white" }}>
                                    <th
                                        style={{
                                            padding: "12px 15px",
                                            textAlign: "left",
                                            borderRadius: "5px 0 0 0",
                                        }}
                                    >
                                        Description
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px 15px",
                                            textAlign: "right",
                                            borderRadius: "0 5px 0 0",
                                        }}
                                    >
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td
                                        style={{
                                            padding: "15px",
                                            borderBottom: "1px solid #dee2e6",
                                        }}
                                    >
                                        {data.Description || "School Fees Payment"}
                                    </td>
                                    <td
                                        style={{
                                            padding: "15px",
                                            textAlign: "right",
                                            borderBottom: "1px solid #dee2e6",
                                        }}
                                    >
                                        {currencyConverter(data.Amount)}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#e9ecef" }}>
                                    <td
                                        style={{
                                            padding: "15px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Total Paid
                                    </td>
                                    <td
                                        style={{
                                            padding: "15px",
                                            textAlign: "right",
                                            fontWeight: "bold",
                                            fontSize: "18px",
                                            color: "#28a745",
                                        }}
                                    >
                                        {currencyConverter(data.Amount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* Amount in Words */}
                        <div
                            style={{
                                background: "#d4edda",
                                padding: "15px",
                                borderRadius: "5px",
                                marginBottom: "30px",
                            }}
                        >
                            <p style={{ margin: "0" }}>
                                <strong>Amount in Words:</strong>{" "}
                                {numberToWords(data.Amount)} Naira Only
                            </p>
                        </div>

                        {/* Status */}
                        <div
                            style={{
                                textAlign: "center",
                                marginBottom: "30px",
                            }}
                        >
                            <span
                                style={{
                                    display: "inline-block",
                                    padding: "10px 30px",
                                    background:
                                        data.Status === "Successful" || data.Status === "success"
                                            ? "#28a745"
                                            : "#ffc107",
                                    color:
                                        data.Status === "Successful" || data.Status === "success"
                                            ? "white"
                                            : "#212529",
                                    borderRadius: "25px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                }}
                            >
                                {data.Status === "Successful" || data.Status === "success"
                                    ? "PAYMENT SUCCESSFUL"
                                    : data.Status?.toUpperCase() || "PAYMENT SUCCESSFUL"}
                            </span>
                        </div>

                        {/* Footer */}
                        <div
                            style={{
                                borderTop: "2px solid #dee2e6",
                                paddingTop: "20px",
                                textAlign: "center",
                            }}
                        >
                            <p style={{ margin: "0 0 10px 0", color: "#666", fontSize: "12px" }}>
                                This is a computer-generated receipt. No signature required.
                            </p>
                            <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>
                                For enquiries, please contact the Bursary Department.
                            </p>
                            <p
                                style={{
                                    margin: "15px 0 0 0",
                                    color: "#999",
                                    fontSize: "11px",
                                }}
                            >
                                Printed on: {new Date().toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .d-print-none {
                            display: none !important;
                        }
                        .card {
                            border: none !important;
                            box-shadow: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}

// Helper function to convert number to words
function numberToWords(num) {
    const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
    ];
    const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
    ];

    if (num === 0) return "Zero";

    const numStr = Math.floor(num).toString();

    if (numStr.length > 12) return "Number too large";

    const padded = numStr.padStart(12, "0");
    const billions = parseInt(padded.substring(0, 3));
    const millions = parseInt(padded.substring(3, 6));
    const thousands = parseInt(padded.substring(6, 9));
    const remainder = parseInt(padded.substring(9, 12));

    let result = "";

    const convertHundreds = (n) => {
        let str = "";
        if (n >= 100) {
            str += ones[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n >= 20) {
            str += tens[Math.floor(n / 10)] + " ";
            n %= 10;
        }
        if (n > 0) {
            str += ones[n] + " ";
        }
        return str;
    };

    if (billions > 0) result += convertHundreds(billions) + "Billion ";
    if (millions > 0) result += convertHundreds(millions) + "Million ";
    if (thousands > 0) result += convertHundreds(thousands) + "Thousand ";
    if (remainder > 0) result += convertHundreds(remainder);

    return result.trim();
}

export default PaymentReceipt;
