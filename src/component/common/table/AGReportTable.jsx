import React, { useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community';
import ReactToPrint from 'react-to-print';
import { projectLogo } from '../../../resources/constants';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Configure theme with enhanced spacing and header styling
const myTheme = themeQuartz.withParams({
  // Browser and color scheme
  browserColorScheme: "light",

  // Overall spacing and compactness
  spacing: 10,

  // Row dimensions (accommodates images)
  rowHeight: 60,
  rowVerticalPaddingScale: 1.0,

  // Cell padding
  cellHorizontalPadding: 12,

  // Enhanced header styling
  headerHeight: 56,
  headerFontSize: 15,
  headerFontWeight: 600,
  headerTextColor: '#1a1a1a',
  headerBackgroundColor: '#f8f9fa',
  headerCellHoverBackgroundColor: '#e9ecef',
  headerVerticalPaddingScale: 1.1,

  // Header borders
  headerColumnBorder: {
    width: 1,
    style: 'solid',
    color: '#dee2e6'
  },

  // Typography
  fontSize: 14,
  fontFamily: 'system-ui, -apple-system, sans-serif',

  // Colors
  accentColor: '#1976d2',
  backgroundColor: '#ffffff',
  foregroundColor: '#212121',

  // Borders
  borderRadius: 4,
  wrapperBorderRadius: 8,
});

/**
 * AG Grid wrapper component that replaces the existing ReportTable component
 * Maintains compatibility with existing array-of-arrays data structure
 * @param {string} title - Table title
 * @param {Array} columns - Array of column names
 * @param {Array} data - Array of arrays (row data)
 * @param {number} row_count - Rows per page (default: 20)
 * @param {boolean} pagination - Enable/disable pagination (default: true)
 * @param {string} height - Table height (default: '600px')
 */
export default function AGReportTable({
  title,
  columns,
  data,
  row_count = 20,
  pagination = true,
  height = '600px'
}) {
  const gridRef = useRef();
  const printRef = useRef();

  // Convert columns array to AG Grid column definitions
  const columnDefs = useMemo(() => {
    if (!columns) return [];

    return columns.map((col, idx) => ({
      field: `col${idx}`,
      headerName: col,
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
      // Handle JSX elements (like action buttons)
      cellRenderer: (params) => {
        if (React.isValidElement(params.value)) {
          return params.value;
        }
        return params.value;
      },
    }));
  }, [columns]);

  // Convert data array of arrays to objects
  const rowData = useMemo(() => {
    if (!data) return [];

    return data.map((row) => {
      const obj = {};
      row.forEach((cell, idx) => {
        obj[`col${idx}`] = cell;
      });
      return obj;
    });
  }, [data]);

  // Export to CSV
  const onExportCSV = () => {
    if (gridRef.current && gridRef.current.api) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      gridRef.current.api.exportDataAsCsv({
        fileName: `${title}-${timestamp}.csv`,
        skipColumnGroupHeaders: true,
        skipRowGroups: true,
      });
    }
  };

  // Copy data to clipboard
  const onCopyData = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.selectAll();
      const selectedData = [];
      gridRef.current.api.forEachNodeAfterFilterAndSort((node) => {
        selectedData.push(node.data);
      });

      // Convert to tab-separated format
      const headers = columnDefs.map(col => col.headerName).join('\t');
      const rows = selectedData.map(row =>
        columnDefs.map(col => {
          const value = row[col.field];
          // Skip JSX elements
          return React.isValidElement(value) ? '' : (value || '');
        }).join('\t')
      ).join('\n');

      const textToCopy = headers + '\n' + rows;

      navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Data copied to clipboard!');
      });

      gridRef.current.api.deselectAll();
    }
  };

  // Default column properties
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

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

      {/* Title for screen view */}
      {title && (
        <div className="no-print">
          <h3 style={{ marginBottom: '15px' }}>{title}</h3>
        </div>
      )}

      {/* Export and Print buttons */}
      <div style={{ marginBottom: '10px', padding: '10px' }} className="no-print">
        <button
          onClick={onExportCSV}
          className="btn btn-sm btn-primary me-2"
          title="Export to CSV"
        >
          <i className="fa fa-download me-1"></i> Export CSV
        </button>
        <button
          onClick={onCopyData}
          className="btn btn-sm btn-secondary me-2"
          title="Copy to clipboard"
        >
          <i className="fa fa-copy me-1"></i> Copy Data
        </button>
        <ReactToPrint
          trigger={() => (
            <button className="btn btn-sm btn-info" title="Print">
              <i className="fa fa-print me-1"></i> Print
            </button>
          )}
          content={() => printRef.current}
          documentTitle={title}
        />
      </div>

      {/* AG Grid */}
      <div style={{ height, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          theme={myTheme}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={pagination}
          paginationPageSize={row_count}
          paginationPageSizeSelector={[5, 10, 20, 50, 100, 200, 500, 1000]}
          animateRows={true}
          suppressCellFocus={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          domLayout="normal"
        />
      </div>

      {/* Print-specific CSS */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .ag-theme-quartz {
            height: auto !important;
          }
          .ag-root-wrapper {
            height: auto !important;
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
