import React, { useEffect, useState } from "react";
import axios from "axios";
import {projectName, serverLink} from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import {
    currencyConverter,
    decryptData,
    formatDateAndTime,
    projectAddress,
    projectLogo
} from "../../../../resources/constants";
import "./payment-receipt.css";
import Logo from '../../../../images/logo.png';
import BarcodeImage from "../../../common/barcode/barcode";
import { connect } from "react-redux";

function PaymentReceipt(props) {
    const token = props.loginData[0].token;

    const url_link = window.location.href;
    const page_id = url_link.split('/');
    const PaymentID = decryptData(page_id[page_id.length -1])
    const [isLoading, setIsLoading] = useState(true);
    const [record, setRecord] = useState({});
    const [itemList, setItemList] = useState([]);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const today = new Date();
    let count = 0;

    const dateNow = `${days[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
    const printNow = () => {
        window.print();
    }

    const loadReceiptItems = async () => {
        await axios.get(`${serverLink}staff/finance/get_payment_data/${PaymentID}`, token)
            .then((result) => {
                if (result.data.paymentHistory.length > 0) {
                    setRecord(result.data.paymentHistory[0])
                    setItemList(result.data.paymentItems)
                    setIsLoading(false)
                }else{
                    window.location.href = '/'
                }
            })
            .catch(error => {
                window.location.href = '/'
            });
    }

    useEffect(()=> {
        loadReceiptItems();
    }, []);

   const currencyConverter = (amount) => {
        const formatter = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        });
        return formatter.format(amount)
    }

    return isLoading ? (
            <Loader />
            ) : (
            <div className="container offset-sm-2" id="MainBody">
                <div className="col-md-7 ">
                    <div className="col-lg-12 bgImg hero-image">
                        <div className="head-main mt-5">
                            <div className="head-item">
                                <img src={projectLogo} alt="Logo" width={70} height={70}  style={{marginRight: '15px'}}/>
                                <span>
                                             <h4 className="m-0 text-left">{projectName}</h4>
                                             <span className="">{projectAddress}</span><br/>
                                             <span>Date: {dateNow}</span>
                                        </span>

                            </div>
                        </div>
                        <br/>
                        <div className="text-center" style={{marginBottom: '0px'}}><b>{record.SemesterCode} Payment Ticket</b></div>
                        <BarcodeImage value={PaymentID} height={60} width={2.0}/>

                        <div className="item-data mt-5 ">
                            <div className="">
                                <table>
                                    <tbody>
                                    <tr>
                                        <th>Student ID: </th>
                                        <td className="fw-bold">{record.StudentID}</td>
                                    </tr>
                                    <tr>
                                        <th>Student Name: </th>
                                        <td className="fw-bold">{record.StudentName}</td>
                                    </tr>
                                    <tr>
                                        <th>Course: </th>
                                        <td className="fw-bold text-capitalize">{record.StudentCourse}</td>
                                    </tr>
                                    <tr>
                                        <th>Level: </th>
                                        <td className="fw-bold text-capitalize">{record.StudentLevel}</td>
                                    </tr>
                                    <tr>
                                        <th>Semester: </th>
                                        <td className="fw-bold"> {record.StudentSemester}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="">
                                <table>
                                    <tbody>
                                    <tr>
                                        <th>Total Due: </th>
                                        <td><b>{currencyConverter(record.TotalExpectedAmount)}</b></td>
                                    </tr>
                                    <tr>
                                        <th>Amount Paid: </th>
                                        <td><b>{currencyConverter(record.AmountPaid)}</b></td>
                                    </tr>
                                    <tr>
                                        <th>Balance: </th>
                                        <td><b> {currencyConverter(parseFloat(record.OutStandingAmount))}</b></td>
                                    </tr>
                                    <tr>
                                        <th>Payment Date: </th>
                                        <td> <b>  {formatDateAndTime(record.InsertedDate, 'date')}</b></td>
                                    </tr>
                                    </tbody>
                                </table>

                            </div>
                        </div>
                        <div className="">
                            <table className="table  table-responsive-sm mt-3">
                                <thead style={{borderBottom: '1px solid grey'}}>
                                <tr>
                                    <th>S/No</th>
                                    <th>Description</th>
                                    <th>Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {itemList&&
                                    itemList.map((item ,key) => {
                                        count++;
                                        return (
                                            <tr key={key}>
                                                <td>{count}</td>
                                                <td>{item.Description}</td>
                                                <td>{currencyConverter(parseFloat(item.Amount))}</td>
                                            </tr>
                                        )
                                    })}
                                <tr>
                                    <td className="fw-bold text-center" colSpan={2} style={{fontWeight: 'bold'}}>TOTAL: </td>
                                    <td  className="fw-bold"  style={{fontWeight: 'bold'}}>{currencyConverter(record.TotalExpectedAmount)}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>

                    <button id="printPageButton" onClick={printNow} className="btn btn-secondary">Print <i className="bi-printer"/></button>
                </div>
            </div>
    )
}
const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(PaymentReceipt);