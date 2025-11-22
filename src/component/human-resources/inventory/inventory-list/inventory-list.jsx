import React, { useEffect, useState } from "react";
import PageHeader from "../../../common/pageheader/pageheader";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { toast } from "react-toastify";
import { connect } from "react-redux";

import ReportTable from "../../../common/table/report_table";
import {currencyConverter, formatDateAndTime} from "../../../../resources/constants";
function InventoryList(props) {
    let token = props.loginData[0].token;
    const [isLoading, setIsLoading] = useState(true);

    const columns = ["S/N", "Item", "Quantity", "Unit Price", "Total Price", "Action", "Storage Location",  "Allocated To","Department", "Action By", "Action Date"];
    const [tableData,setTableData] = useState([]);

    const fetchData = async () => {
        await axios.get(`${serverLink}staff/inventory/inventory/view`, token)
            .then(res => {
                if (res.data.message === 'success') {
                    const row = [];
                    if (res.data.Inventory.length > 0) {
                        res.data.Inventory.map((r, i) => {
                            row.push([i+1, r.item_name, r.quantity, currencyConverter(r.unit_price), currencyConverter((r.unit_price * r.quantity)), r.action === "allocated" ? <span className="text-danger">Allocated</span> :  <span className="text-success">Received</span> , r.location,  r.allocated_to === "No Name" ? "--" : r.allocated_to, r.allocated_department === "No record found" ? "--" :r.allocated_department, r.allocated_by, formatDateAndTime(r.inserted_date, "date")])
                        })
                        setTableData(row)
                    }else{
                        setTableData([])
                    }
                } else {
                    toast.info("Something went wrong. Please try again!")
                }
                setIsLoading(false)
            })
            .catch(e => {
                toast.error(`${e.response.statusText}: ${e.response.data}`)
            })
    }

    useEffect(() => {
        fetchData()
    },[])

    return isLoading ? (
        <Loader />
    ) : (
        <div className="d-flex flex-column flex-row-fluid">
            <PageHeader title={"Inventory List"} items={["Inventory", "Inventory List"]} />
            <div className="flex-column-fluid">
                <div className="card card-no-border">
                    <div className="card-header border-0 pt-6">
                        <div className="card-title" />
                    </div>
                    <div className="card-body p-0">
                        <ReportTable title={"Inventory List"} columns={columns} data={tableData} />
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

export default connect(mapStateToProps, null)(InventoryList);
