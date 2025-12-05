import MUIDataTable from "mui-datatables";
import React, {useRef} from "react";
import {formatDateAndTime, projectLogo} from "../../../resources/constants";
import ReactToPrint from "react-to-print";
import IconButton from "@mui/material/IconButton";
import PrintIcon from "@mui/icons-material/Print";
import "./report_table.css";

function ReportTable(props) {
    let componentRef = useRef();

    const options = {
        rowsPerPage: typeof props.row_count !== 'undefined' ? props.row_count : 20,
        rowsPerPageOptions: [5, 10, 20, 50, 100, 200, 500, 1000],
        search: true,
        download: true,
        print: false,
        viewColumns: true,
        fixedHeader: false,
        filter: true,
        selectableRows: 'none',
        filterType: "dropdown",
        responsive: "standard",
        pagination: typeof props.pagination !== 'undefined' ? props.pagination : true,
        tableBodyHeight: typeof props.height !== 'undefined' ? props.height : '400px',
        downloadOptions: {
            filename: `${props.title}-${formatDateAndTime(new Date(), 'date_and_time')}.csv`,
            separator: ','
        },
        draggableColumns: {
            enabled: true,
            transitionTime:300
        },
        searchPlaceholder: 'Search table',
        customToolbar: () => {
            return (
                <ReactToPrint
                    trigger={() => <IconButton ><PrintIcon /></IconButton>}
                    content={() => componentRef}
                />
            );
        }
    };

    return (
        <>
            <div style={{ width: `100%`}} ref={(el) => (componentRef = el)}>
                <div className="text-center bg-secondary print-only">
                    <img src={projectLogo} alt="Project" height="100px"/>
                    <h1>{props.title}</h1>
                    <h4>{formatDateAndTime(new Date(), 'date_and_time')}</h4>
                </div>
                <MUIDataTable
                    title={props.title}
                    data={props.data}
                    columns={props.columns}
                    options={options}
                />
            </div>

        </>
    );
}

export default ReportTable;
