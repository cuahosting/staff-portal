import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { api } from "../../../../resources/api";
import { toast } from "react-toastify";
import ReportTable from "../../../common/table/ReportTable";
import { currencyConverter } from "../../../../resources/constants";

function InventoryTrackStockMovementReport(props) {
    let slug = props.value?.slug;
    const [isLoading, setIsLoading] = useState(true);
    const columns = ["S/N", "Item", "Quantity", "Unit Price", "Total Price", "Storage Location", "Received By"];
    const columns2 = ["S/N", "Staff_ID", "Name", "Department", "Location", "Quantity", "Allocated_By"];
    const [tableData, setTableData] = useState([]);
    const [tableData2, setTableData2] = useState([]);


    const fetchData = async () => {
        try {
            const { success, data: res } = await api.get(`staff/inventory/allocation/view/${slug}`);
            if (success && res.message === 'success') {
                let inventoryData = res.Inventory.filter(e => e.action === "received");
                let allocatedData = res.Inventory.filter(e => e.action === "allocated");

                let rowSet = [];
                inventoryData.map((item, index) => {
                    rowSet.push([index + 1, item.item_name, item.quantity, currencyConverter(item.unit_price), currencyConverter(item.unit_price * item.quantity), item.location, item.allocated_by]);
                });
                setTableData(rowSet)

                let dataSet = [];
                allocatedData.map((r, index) => {
                    dataSet.push([index + 1, r.allocated_to_id, r.allocated_to, r.allocated_department, r.location, r.quantity, r.allocated_by]);
                });
                setTableData2(dataSet)

            } else {
                toast.info("Something went wrong. Please try again!")
            }
            setIsLoading(false)
        } catch (e) {
            toast.error("NETWORK ERROR")
        }
    }

    useEffect(() => {
        if (slug) {
            fetchData()
        }
    }, [slug])


    return isLoading ? <div style={{ height: '400px' }}>
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            margin: '-25px 0 0 -25px'
        }}>
            <span className="spinner-border text-primary m-lg-5" role="status" /><br />
            <span className="text-muted fs-6 fw-semibold mt-5">Loading...</span>
        </div>

    </div> :
        (<>
            <div className="card-body pb-0">
                <div className="d-flex overflow-auto h-55px">
                    <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-semibold flex-nowrap">
                        <li className="nav-item">
                            <a className="nav-link text-active-primary me-6 active" data-bs-toggle="tab" href="#kt_ecommerce_add_product_general">Inventory Items</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-active-primary me-6" data-bs-toggle="tab" href="#kt_ecommerce_add_product_advanced">Allocated Items</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="tab-content mt-4">
                <div className="tab-pane fade show active" id="kt_ecommerce_add_product_general" role="tab-panel">
                    <ReportTable title={"Received Item List"} columns={columns} data={tableData} />
                </div>
                <div className="tab-pane fade" id="kt_ecommerce_add_product_advanced" role="tab-panel">
                    <ReportTable id="tbl2" title={"Allocated Items List"} columns={columns2} data={tableData2} />
                </div>
            </div>
        </>)

}

const mapStateToProps = (state) => {
    return {
        loginData: state.LoginDetails,
    };
};

export default connect(mapStateToProps, null)(InventoryTrackStockMovementReport);