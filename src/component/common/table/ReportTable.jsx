/**
 * ReportTable - Now using custom DataTable component
 *
 * This component provides backward compatibility for components using the
 * ReportTable interface while using DataTable under the hood.
 *
 * Props:
 * - title: string - Table title (displayed in header)
 * - columns: string[] - Array of column header strings
 * - data: any[][] - Array of row arrays
 * - row_count: number - Rows per page (optional, default 20)
 * - pagination: boolean - Enable pagination (optional, default true)
 */

import React, { useMemo, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import DataTable from './DataTable';
import { formatDateAndTime, projectLogo } from '../../../resources/constants';

function ReportTable(props) {
    const printRef = useRef();

    // Convert string columns to DataTable format
    const tableColumns = useMemo(() => {
        if (!props.columns || !Array.isArray(props.columns)) return [];

        return props.columns.map((col, idx) => ({
            label: typeof col === 'string' ? col : col.label || col.name || `Column ${idx + 1}`,
            field: `col_${idx}`,
        }));
    }, [props.columns]);

    // Convert array-based rows to object-based rows for DataTable
    const tableRows = useMemo(() => {
        if (!props.data || !Array.isArray(props.data)) return [];

        return props.data.map((row, rowIdx) => {
            const obj = { sn: rowIdx + 1 };
            if (Array.isArray(row)) {
                row.forEach((cell, idx) => {
                    obj[`col_${idx}`] = cell;
                });
            }
            return obj;
        });
    }, [props.data]);

    // Prepare data for DataTable
    const tableData = useMemo(() => {
        // Check if S/N column already exists (case insensitive)
        const hasSnColumn = tableColumns.some(col =>
            col.label && ['s/n', 'sn', 's.n', 'serial number'].includes(col.label.toLowerCase())
        );

        const finalColumns = hasSnColumn
            ? tableColumns
            : [{ label: 'S/N', field: 'sn' }, ...tableColumns];

        return {
            columns: finalColumns,
            rows: tableRows,
        };
    }, [tableColumns, tableRows]);

    return (
        <div ref={printRef} className="report-table-container">
            {/* Toolbar with title and print */}
            <div className="no-print d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">{props.title || ''}</h5>
                <ReactToPrint
                    trigger={() => (
                        <button className="btn btn-sm btn-light-info" title="Print">
                            <i className="fa fa-print me-1"></i> Print
                        </button>
                    )}
                    content={() => printRef.current}
                    documentTitle={props.title}
                />
            </div>

            {/* Print header - only visible when printing */}
            <div className="text-center print-only" style={{ display: 'none', backgroundColor: '#f8f9fa', padding: '20px' }}>
                <img src={projectLogo} alt="Project" height="100px" />
                <h1>{props.title}</h1>
                <h4>{formatDateAndTime(new Date(), 'date_and_time')}</h4>
            </div>

            {/* DataTable */}
            <DataTable
                data={tableData}
                paging={props.pagination !== false}
                pageSize={props.row_count || 20}
            />

            {/* Print styles */}
            <style>{`
        @media print {
          .print-only {
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
}

export default ReportTable;
