import React, { useRef } from "react";
import { DataTable } from "../form";
import { formatDateAndTime, projectLogo } from "../../../resources/constants";
import IconButton from "@mui/material/IconButton";
import PrintIcon from "@mui/icons-material/Print";
import "./report_table.css";

/**
 * ReportTable Component
 *
 * A specialized data table component for printable reports.
 * Includes custom print header with logo and timestamp.
 *
 * @param {Object} props
 * @param {string} props.title - Table title
 * @param {Array} props.data - Table data (rows)
 * @param {Array} props.columns - Table columns configuration
 * @param {number} props.row_count - Rows per page (default: 20)
 * @param {boolean} props.pagination - Enable pagination (default: true)
 * @param {string} props.height - Table body height (default: '400px')
 */
function ReportTable(props) {
    const componentRef = useRef();

    const handlePrint = () => {
        window.print();
    };

    const customOptions = {
        rowsPerPage: typeof props.row_count !== 'undefined' ? props.row_count : 20,
        rowsPerPageOptions: [5, 10, 20, 50, 100, 200, 500, 1000],
        pagination: typeof props.pagination !== 'undefined' ? props.pagination : true,
        tableBodyHeight: typeof props.height !== 'undefined' ? props.height : '400px',
        downloadOptions: {
            filename: `${props.title}-${formatDateAndTime(new Date(), 'date_and_time')}.csv`,
            separator: ','
        },
        draggableColumns: {
            enabled: true,
            transitionTime: 300
        },
        print: false, // Disable default print, use custom print button
        customToolbar: () => {
            return (
                <IconButton
                    size="large"
                    aria-label="Print table"
                    title="Print table"
                    onClick={handlePrint}
                >
                    <PrintIcon />
                </IconButton>
            );
        }
    };

    console.log(props.data)

    return (
        <div style={{ width: '100%' }} ref={componentRef}>
            <div className="text-center bg-secondary print-only">
                <img src={projectLogo} alt="Project Logo" height="100px" />
                <h1>{props.title}</h1>
                <h4>{formatDateAndTime(new Date(), 'date_and_time')}</h4>
            </div>
            <DataTable
                title={props.title}
                data={props.data}
                columns={props.columns}
                options={customOptions}
                search={true}
                download={true}
                viewColumns={true}
                filter={true}
                selectableRows="none"
            />
        </div>
    );
}

export default ReportTable;
