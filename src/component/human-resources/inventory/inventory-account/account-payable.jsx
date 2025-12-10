import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import ReportTable from "../../../common/table/ReportTable";
import AccountPayableDetails from "./account-payable-details";
import {currencyConverter, InventoryEmailTemplates} from "../../../../resources/constants";
import {showAlert} from "../../../common/sweetalert/sweetalert";
function AccountPayable(props) {
    const login = props.loginData[0];
    const DesignationName = props.loginData[0].DesignationName;
    const staff_name = props.loginData[0].FirstName+" "+props.loginData[0].MiddleName+" "+props.loginData[0].Surname;
    const [isLoading, setIsLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [tableData, setTableData] = useState([]);
    const columns = ["SN", "REQUEST TYPE", "REQUEST FROM", "EXPECTED AMOUNT", "AMOUNT PAID", "BALANCE", "STATUS", "PAYMENT STATUS", "ACTION"];
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetechingRecord, setFetchingRecord] = useState(null)
    const detailsCols = ["SN", "REQ. ID", "ITEM", "QTY REQUESTED", "QTY RECIEVED", "AMOUNT", "TOTAL"]
    const [requestDetails, setRequestDetails] = useState([])
    const [requestItems, setRequestItems] = useState([])
    const [formType, setFormType] = useState(0)
    let items = [];
    const [formData, setFormData] = useState({
        inserted_by: props.loginData[0]?.employee_id,
        request_id: "",
        amount_to_pay: 0
    })


    const getAccountPayables = async () => {
        await axios.get(`${serverLink}staff/inventory/purchase_requests/list`, login?.token)
            .then((res) => {
                const _manufacturer = res.data.Manufacturer; const _vendor = res.data.Vendor;
                if (res.data.Request.length > 0) {
                    let rows = [];
                    res.data.Request.map((x, i) => {
                        rows.push([
                            i + 1,
                            x.request_type,
                            x.vendor_name + ` - (ID : ${x.requested_from})`,
                            currencyConverter(x.amount_expected),
                            currencyConverter(x.amount_paid),
                            currencyConverter(x.balance),
                            x.status,
                            x.payment_status,
                            <div className='d-flex'>
                                <button className='btn btn-sm btn-success me-3'
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={() => {
                                            setFormType(1)
                                            setFormData({
                                                ...formData,
                                                amount_to_pay: 0,
                                                request_id: x.request_id,
                                                request_type: x.request_type,
                                                requested_from: x.requested_from,
                                                amount_expected: x.amount_expected,
                                                amount_paid: x.amount_paid,
                                                balance: x.balance,
                                            })
                                        }} >
                                    <i className='fa fa-check' />&nbsp; PAY
                                </button>
                                <button className='btn btn-sm btn-danger  me-3'
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={async () => {
                                            setFormType(2)
                                            setRequestDetails([])
                                            setFetchingRecord(x.request_id);
                                            setFormData({
                                                ...formData,
                                                request_id: x.request_id,
                                                request_type: x.request_type,
                                                requested_from: x.requested_from,
                                                amount_expected: x.amount_expected,
                                                amount_paid: x.amount_paid,
                                                balance: x.balance,
                                            })
                                            getRequestDetails(x.request_id)
                                        }} >
                                    <i className='fa fa-times' /> Reject
                                </button>
                                <button className='btn btn-sm btn-success me-3'
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={async () => {
                                            setFormType(0)
                                            setRequestDetails([])
                                            setFetchingRecord(x.request_id);
                                            setFormData({
                                                ...formData,
                                                request_id: x.request_id,
                                                request_type: x.request_type,
                                                requested_from: x.requested_from,
                                                amount_expected: x.amount_expected,
                                                amount_paid: x.amount_paid,
                                                balance: x.balance,
                                            })
                                            getRequestDetails(x.request_id)
                                        }} >
                                    <i className='fa fa-eye' />
                                </button>

                                <button className='btn btn-sm btn-primary'
                                        data-bs-toggle="modal"
                                        data-bs-target="#kt_modal_general"
                                        onClick={async () => {
                                            setFormType(3)
                                            setRequestDetails([])
                                            setFetchingRecord(x.request_id);
                                            setFormData({
                                                ...formData,
                                                request_id: x.request_id,
                                                request_type: x.request_type,
                                                requested_from: x.requested_from,
                                                amount_expected: x.amount_expected,
                                                amount_paid: x.amount_paid,
                                                balance: x.balance,
                                            })

                                           await getRequestDetails(x.request_id);
                                            const email =  InventoryEmailTemplates("1", {...formData,  request_id: x.request_id, request_type: x.request_type, amount_expected: x.amount_expected, amount_paid: x.amount_paid, inserted_date: x.inserted_date, staff_name:staff_name, DesignationName: DesignationName,  balance: x.balance, Items: items, Supplier: getItem(_manufacturer, _vendor, x.request_type)});
                                            setFormData({
                                                ...formData,
                                                EmailObject: email,
                                                ResponseType: "request",
                                                Title: "Inventory Purchase Order",
                                                EmailSubject: email.subject,
                                                EmailContentBody: email.body
                                            })
                                        }} >
                                    <i className='fa fa-inbox' /> Notify
                                </button>

                            </div>
                        ])
                    })
                    setTableData(rows)
                }
                setIsLoading(false);
            }).catch((e) => {
                toast.error("error getting departments")
            })
    }

    const getRequestDetails = async (request_id) => {
        await axios.get(`${serverLink}staff/inventory/purchase_requests/details/${request_id}`, login?.token)
            .then((res) => {
                if (res.data.length > 0) {
                    items = res.data
                    let rows = []
                    res.data.map((x, i) => {
                        rows.push([
                            i + 1,
                            x.request_id,
                            x.item_name + ` (${x.item_id})`,
                            x.quantity,
                            x.quantity_received,
                            currencyConverter(x.amount),
                            currencyConverter(x.total)
                        ])
                    })
                    setRequestDetails(rows);
                    setRequestItems(res.data);
                }
                setFetchingRecord(null)
            })
            .catch((e) => {
                toast.error("error fetching details")
            })
    }

    const getItem = (manufacturer = [], vendor = [], type) => {
            if (type === "Manufacturer"){
                let item = manufacturer;
                if (item.length > 0){
                    return [{name: item[0].manufacturer_name, phone: item[0].phone_number, email: item[0].email_address, address: item[0].address }];
                }else{
                    return [];
                }
            }else if (type === "Vendor"){
                let item = vendor;
                if (item.length > 0){
                    return [{name: item[0].vendor_name, phone: item[0].phone_number, email: item[0].email_address, address: item[0].address }];
                }else{
                    return [];
                }
            }
    }

    useEffect(() => {
        getAccountPayables();
    }, [])


    const onChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        })
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        toast.info("please wait...")
        const dt = {
            amount_paid: parseFloat(formData.amount_to_pay) + parseFloat(formData.amount_paid),
            request_id: formData.request_id,
            amount_expected: parseFloat(formData.amount_expected)
        }
        if (parseInt(formData.amount_to_pay) === 0) {
            toast.error("enter a valid amount");
            return false;
        }

        if (dt.amount_paid > parseFloat(formData.amount_expected)) {
            toast.error("amount paid is greater than expected amount");
            return false;
        }

        setIsSubmitting(true);
        await axios.patch(`${serverLink}staff/inventory/purchase_requests/pay`, dt, login?.token).then((res) => {
            if (res.data.message === "success") {
                toast.success("Payment Record Added")
                getAccountPayables();
                document.getElementById("closeModal").click();
            }
            setIsSubmitting(false);
        }).catch((e) => {
            setIsSubmitting(false);
            toast.error("failed to add payment record")
        })
    }

    const onCancel = async (e) => {
        e.preventDefault();
        let send_data = [];
        let request_order = formData;
        for (let i = 0; i < requestItems.length; i++) {
            let request_id = +requestItems[i].request_id;
            let item_id = +requestItems[i].item_id;
            send_data.push({ request_id: request_id, status: "canceled", item_id: item_id})
        }
        let sendData = {
            ...formData,
            data: send_data,
            status: "canceled",
            request_id: request_order?.request_id,
            inserted_by: props.loginData[0].StaffID,
            updated_by: props.loginData[0].StaffID
        }

        setIsSubmitting(true);

        await axios
            .post(`${serverLink}staff/inventory/purchase_request/cancel`, sendData, login?.token)
            .then((result) => {
                if (result.data.message === "success") {
                    toast.success("Purchase Order Rejected Successfully");
                    getAccountPayables();
                    setFormData({
                        ...formData,
                        data: '',
                        status: '',
                    })
                    setIsSubmitting(true);
                    document.getElementById("closeModal").click();
                } else {
                    setIsSubmitting(true);
                    showAlert(
                        "ERROR",
                        "Something went wrong. Please try again!",
                        "error"
                    );
                }
            })
            .catch((error) => {
                setIsSubmitting(true);
                showAlert(
                    "NETWORK ERROR",
                    "Please check your connection and try again!",
                    "error"
                );
            });
    }


    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Inventory Finance"} items={["Inventory", "Inventory Finance"]} />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />

                    </div>
                    <div className="card-body p-0">
                        <ReportTable title={"Inventory Finance"} columns={columns} data={tableData} height={"700px"}  />
                    </div>
                </div>
                <Modal large title={"Inventory Finance"}>
                    <AccountPayableDetails
                        onChange={onChange}
                        onSubmit={onSubmit}
                        onCancel={onCancel}
                        isSubmitting={isSubmitting}
                        fetechingRecord={fetechingRecord}
                        detailsCols={detailsCols}
                        requestDetails={requestDetails}
                        requestItems={requestItems}
                        formType={formType}
                        values={formData}
                        setFormData={setFormData}
                    />
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

export default connect(mapStateToProps, null)(AccountPayable);
