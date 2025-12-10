/**
 * AGReportTable - Now using custom DataTable component
 *
 * This component provides backward compatibility for components using the
 * AGReportTable interface while using DataTable under the hood.
 *
 * Props:
 * - title: string - Table title (displayed in header)
 * - columns: string[] - Array of column header strings
 * - data: any[][] - Array of row arrays
 * - row_count: number - Rows per page (optional, default 50)
 * - pagination: boolean - Enable pagination (optional, default true)
 */

import React, { useMemo, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import DataTable from './DataTable';
import { projectLogo } from '../../../resources/constants';

export default function AGReportTable({
  title,
  columns,
  data,
  row_count = 50,
  pagination = true,
}) {
  const printRef = useRef();

  // Convert string columns to DataTable format
  const tableColumns = useMemo(() => {
    if (!columns) return [];

    return columns.map((col, idx) => ({
      label: col,
      field: `col${idx}`,
    }));
  }, [columns]);

  // Convert data array of arrays to objects
  const tableRows = useMemo(() => {
    if (!data) return [];

    return data.map((row, rowIdx) => {
      const obj = { sn: rowIdx + 1 };
      row.forEach((cell, idx) => {
        obj[`col${idx}`] = cell;
      });
      return obj;
    });
  }, [data]);

  // Prepare data for DataTable
  const tableData = useMemo(() => ({
    columns: [{ label: 'S/N', field: 'sn' }, ...tableColumns],
    rows: tableRows,
  }), [tableColumns, tableRows]);

  return (
    <div ref={printRef} style={{ width: '100%' }}>
      {/* Print header - only shows when printing */}
      <div className="print-only text-center" style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
        <img src={projectLogo} alt="Project Logo" height="100px" />
        <h2 style={{ marginTop: '10px' }}>{title}</h2>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Generated on: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Title and Print button for screen view */}
      <div className="no-print d-flex justify-content-between align-items-center mb-3">
        {title && <h3 className="mb-0">{title}</h3>}
        <ReactToPrint
          trigger={() => (
            <button className="btn btn-sm btn-light-info" title="Print">
              <i className="fa fa-print me-1"></i> Print
            </button>
          )}
          content={() => printRef.current}
          documentTitle={title}
        />
      </div>

      {/* DataTable */}
      <DataTable data={tableData} paging={pagination} pageSize={row_count} />

      {/* Print-specific CSS */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
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
