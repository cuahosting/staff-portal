import React, { useRef, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Configure theme with modern, polished styling
const myTheme = themeQuartz.withParams({
  // Browser and color scheme
  browserColorScheme: "light",
  // Overall spacing and compactness
  spacing: 8,
  // Row dimensions
  rowHeight: 52,
  rowVerticalPaddingScale: 0.8,

  // Cell padding
  cellHorizontalPadding: 12,

  // Enhanced header styling
  headerHeight: 48,
  headerFontSize: 13,
  headerFontWeight: 600,
  headerTextColor: '#1e293b',
  headerBackgroundColor: '#f1f5f9',
  headerCellHoverBackgroundColor: '#e2e8f0',
  headerVerticalPaddingScale: 1.0,

  // Header borders
  headerColumnBorder: true,
  headerColumnBorderColor: '#cbd5e1',
  headerColumnBorderWidth: 1,

  // Typography
  fontSize: 13,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

  // Colors - Modern palette
  accentColor: '#3b82f6',
  backgroundColor: '#ffffff',
  foregroundColor: '#475569',
  
  // Row colors with subtle striping
  oddRowBackgroundColor: '#fafafa',
  rowHoverColor: '#eff6ff',
  
  // Selected row
  selectedRowBackgroundColor: '#dbeafe',

  // Borders - Clean and subtle
  borderColor: '#e2e8f0',
  borderRadius: 0,
  wrapperBorderRadius: 8,
  wrapperBorder: true,
  
  // Column borders
  columnBorder: true,
  
  // Range selection
  rangeSelectionBorderColor: '#3b82f6',
  rangeSelectionBackgroundColor: 'rgba(59, 130, 246, 0.1)',
});

/**
 * AG Grid wrapper component that replaces the existing Table component
 * Maintains compatibility with existing datatable structure
 * @param {Object} data - Object with columns and rows structure
 * @param {boolean} paging - Enable/disable pagination (default: true)
 */
export default function AGTable({ data, paging = true }) {
  const gridRef = useRef();

  // Convert datatable columns to AG Grid column definitions
  const columnDefs = useMemo(() => {
    if (!data || !data.columns) return [];

    // Map columns with proper configuration
    const mappedColumns = data.columns.map((col) => ({
      field: col.field,
      headerName: col.label,
      sortable: true,
      filter: true,
      resizable: true,
      wrapText: false,
      cellStyle: { whiteSpace: 'nowrap', overflow: 'visible', textOverflow: 'clip' },
      // Handle JSX elements (like action buttons)
      cellRenderer: (params) => {
        if (React.isValidElement(params.value)) {
          return params.value;
        }
        return params.value;
      },
      // Special styling for S/N column
      ...(col.field === 'sn' && {
        maxWidth: 80,
        flex: 0,
        cellStyle: { fontWeight: '500', color: '#64748b', whiteSpace: 'nowrap', overflow: 'visible', textOverflow: 'clip' }
      }),
      // Disable sorting/filtering for action columns with increased spacing
      ...(col.field === 'action' && {
        sortable: false,
        filter: false,
        flex: 0,
        minWidth: 100,
        maxWidth: 100,
        wrapText: false,
        autoHeight: false,
        cellStyle: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px'
        }
      }),
    }));

    // Reorder columns: S/N, Action, then everything else
    const snColumn = mappedColumns.find(col => col.field === 'sn');
    const actionColumn = mappedColumns.find(col => col.field === 'action');
    const otherColumns = mappedColumns.filter(col => col.field !== 'sn' && col.field !== 'action');

    const reorderedColumns = [];
    if (snColumn) reorderedColumns.push(snColumn);
    if (actionColumn) reorderedColumns.push(actionColumn);
    reorderedColumns.push(...otherColumns);

    return reorderedColumns;
  }, [data]);

  // Row data
  const rowData = useMemo(() => {
    if (!data || !data.rows) return [];
    return data.rows;
  }, [data]);

  // Export to CSV
  const onExportCSV = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `export-${new Date().toISOString().split('T')[0]}.csv`,
        skipColumnGroupHeaders: true,
        skipRowGroups: true,
      });
    }
  };

  // Copy selected data to clipboard
  const onCopyData = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.selectAll();
      const selectedData = [];
      gridRef.current.api.forEachNodeAfterFilterAndSort((node) => {
        selectedData.push(node.data);
      });

      // Convert to tab-separated format for clipboard
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

  // Auto-size columns to full content width (enables horizontal scroll)
  const onGridReady = useCallback((params) => {
    params.api.autoSizeAllColumns();
  }, []);

  return (
    <div style={{ 
      backgroundColor: '#ffffff',
    }}>
      {/* Export buttons */}
      <div style={{ 
        marginBottom: '16px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }} className="no-print">
        <button
          onClick={onExportCSV}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
          }}
          title="Export to CSV"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          <span>Export CSV</span>
        </button>
        <button
          onClick={onCopyData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffffff',
            color: '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#94a3b8';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          title="Copy to clipboard"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span>Copy Data</span>
        </button>
      </div>

      {/* AG Grid */}
      <div style={{ 
        height: '600px', 
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}>
        <AgGridReact
          ref={gridRef}
          theme={myTheme}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          pagination={paging}
          paginationPageSize={50}
          paginationPageSizeSelector={[50, 100, 200]}
          animateRows={true}
          suppressCellFocus={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          rowSelection="multiple"
        />
      </div>
    </div>
  );
}