/**
 * AGTable - Now using custom DataTable component
 *
 * The AG Grid implementation has been replaced with a custom-built
 * DataTable component that matches the Metronic/Bootstrap design system.
 *
 * Previous AG Grid code is preserved below as comments for reference.
 */

import DataTable from './DataTable';

// Re-export DataTable as AGTable for backward compatibility
// All existing imports of AGTable will work without changes
export default DataTable;


/* =============================================================================
 * PRESERVED AG GRID IMPLEMENTATION (COMMENTED OUT)
 * =============================================================================
 *
 * import React, { useRef, useMemo, useCallback, useState } from 'react';
 * import { AgGridReact } from 'ag-grid-react';
 * import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community';
 * import './AGTable.css';
 *
 * // Register AG Grid modules
 * ModuleRegistry.registerModules([AllCommunityModule]);
 *
 * // Clean modern theme based on Quartz
 * const gridTheme = themeQuartz.withParams({
 *   backgroundColor: '#ffffff',
 *   foregroundColor: '#181C32',
 *   browserColorScheme: 'light',
 *
 *   // Typography
 *   fontFamily: 'inherit',
 *   fontSize: 13,
 *
 *   // Row styling
 *   rowHeight: 50,
 *   cellHorizontalPadding: 16,
 *
 *   // Header styling
 *   headerHeight: 46,
 *   headerFontSize: 12,
 *   headerFontWeight: 600,
 *   headerTextColor: '#A1A5B7',
 *   headerBackgroundColor: '#F9F9F9',
 *
 *   // Borders
 *   borderColor: '#EFF2F5',
 *   rowBorder: true,
 *   columnBorder: false,
 *   wrapperBorder: false,
 *
 *   // Colors
 *   oddRowBackgroundColor: '#ffffff',
 *   rowHoverColor: '#F4F6FA',
 *   selectedRowBackgroundColor: '#EEF6FF',
 *
 *   // Accent
 *   accentColor: '#009EF7',
 * });
 *
 * export default function AGTable({ data, paging = true }) {
 *   const gridRef = useRef();
 *   const [searchText, setSearchText] = useState('');
 *
 *   // Convert columns to AG Grid format
 *   const columnDefs = useMemo(() => {
 *     if (!data?.columns) return [];
 *
 *     return data.columns.map((col) => {
 *       const baseConfig = {
 *         field: col.field,
 *         headerName: col.label,
 *         sortable: col.field !== 'action',
 *         filter: col.field !== 'action' && col.field !== 'sn',
 *         resizable: true,
 *         flex: 1,
 *         minWidth: 100,
 *         cellRenderer: (params) => params.value,
 *       };
 *
 *       // S/N column config
 *       if (col.field === 'sn') {
 *         return {
 *           ...baseConfig,
 *           flex: 0,
 *           width: 70,
 *           minWidth: 60,
 *           maxWidth: 80,
 *           cellClass: 'ag-cell-sn',
 *         };
 *       }
 *
 *       // Action column config
 *       if (col.field === 'action') {
 *         return {
 *           ...baseConfig,
 *           flex: 0,
 *           width: 120,
 *           minWidth: 100,
 *           maxWidth: 150,
 *           cellClass: 'ag-cell-action',
 *         };
 *       }
 *
 *       return baseConfig;
 *     });
 *   }, [data]);
 *
 *   const rowData = useMemo(() => data?.rows || [], [data]);
 *
 *   const onExportCSV = useCallback(() => {
 *     gridRef.current?.api?.exportDataAsCsv({
 *       fileName: `export-${new Date().toISOString().split('T')[0]}.csv`,
 *     });
 *   }, []);
 *
 *   const onCopyData = useCallback(() => {
 *     const api = gridRef.current?.api;
 *     if (!api) return;
 *
 *     const allData = [];
 *     api.forEachNodeAfterFilterAndSort((node) => allData.push(node.data));
 *
 *     const headers = columnDefs.map(col => col.headerName).join('\t');
 *     const rows = allData.map(row =>
 *       columnDefs.map(col => {
 *         const val = row[col.field];
 *         return React.isValidElement(val) ? '' : (val ?? '');
 *       }).join('\t')
 *     ).join('\n');
 *
 *     navigator.clipboard.writeText(`${headers}\n${rows}`);
 *   }, [columnDefs]);
 *
 *   const onSearchChange = useCallback((e) => {
 *     const value = e.target.value;
 *     setSearchText(value);
 *     gridRef.current?.api?.setGridOption('quickFilterText', value);
 *   }, []);
 *
 *   const defaultColDef = useMemo(() => ({
 *     sortable: true,
 *     filter: true,
 *     resizable: true,
 *     flex: 1,
 *   }), []);
 *
 *   return (
 *     <div className="ag-grid-wrapper">
 *       <div className="ag-grid-toolbar no-print">
 *         <div className="ag-grid-toolbar-left">
 *           <button type="button" onClick={onExportCSV} className="btn btn-sm btn-light-primary">
 *             <i className="fa fa-file-export me-2"></i>Export
 *           </button>
 *           <button type="button" onClick={onCopyData} className="btn btn-sm btn-light">
 *             <i className="fa fa-copy me-2"></i>Copy
 *           </button>
 *         </div>
 *         <div className="ag-grid-toolbar-right">
 *           <div className="ag-grid-search">
 *             <span className="ag-grid-search-icon">
 *               <i className="fa fa-search"></i>
 *             </span>
 *             <input
 *               type="text"
 *               className="form-control form-control-sm form-control-solid"
 *               placeholder="Search..."
 *               value={searchText}
 *               onChange={onSearchChange}
 *             />
 *           </div>
 *         </div>
 *       </div>
 *
 *       <div className="ag-grid-container">
 *         <AgGridReact
 *           ref={gridRef}
 *           theme={gridTheme}
 *           rowData={rowData}
 *           columnDefs={columnDefs}
 *           defaultColDef={defaultColDef}
 *           pagination={paging}
 *           paginationPageSize={50}
 *           paginationPageSizeSelector={[25, 50, 100, 200, 500]}
 *           animateRows={true}
 *           suppressCellFocus={true}
 *           enableCellTextSelection={true}
 *           ensureDomOrder={true}
 *         />
 *       </div>
 *     </div>
 *   );
 * }
 *
 * =============================================================================
 */
