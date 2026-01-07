import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import './DataTable.css';

/**
 * Custom DataTable Component
 * A lightweight, styled data table with pagination, search, sorting, export and copy
 *
 * @param {Object} props
 * @param {Object} props.data - { columns: [{label, field}], rows: [{...}] }
 * @param {boolean} props.paging - Enable pagination (default: true)
 * @param {number} props.pageSize - Initial page size (default: 50)
 */
export default function DataTable({ data, paging = true, pageSize: initialPageSize = 50 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchText, setSearchText] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });

  const columns = data?.columns || [];
  const rows = data?.rows || [];

  // Filter rows by search text - searches through ALL row properties
  const filteredRows = useMemo(() => {
    if (!searchText.trim()) return rows;

    const searchLower = searchText.toLowerCase();
    return rows.filter(row => {
      // Search through all properties in the row, not just columns
      return Object.values(row).some(value => {
        // Skip React elements (like buttons, JSX)
        if (React.isValidElement(value)) return false;
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [rows, searchText]);

  // Sort filtered rows
  const sortedRows = useMemo(() => {
    if (!sortConfig.field) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortConfig.field];
      const bVal = b[sortConfig.field];

      // Handle React elements - don't sort
      if (React.isValidElement(aVal) || React.isValidElement(bVal)) return 0;

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  }, [filteredRows, sortConfig]);

  // Paginate sorted rows
  const paginatedRows = useMemo(() => {
    if (!paging) return sortedRows;
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize, paging]);

  // Total pages
  const totalPages = useMemo(() => {
    if (!paging) return 1;
    return Math.ceil(sortedRows.length / pageSize) || 1;
  }, [sortedRows.length, pageSize, paging]);

  // Reset to page 1 when search or page size changes
  const handleSearchChange = useCallback((e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageSizeChange = useCallback((e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  // Handle column sort
  const handleSort = useCallback((field) => {
    // Don't sort action or sn columns
    if (field === 'action' || field === 'sn') return;

    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Export to Excel (using XLSX format compatible approach)
  const handleExportExcel = useCallback(() => {
    // Create a simple HTML table that Excel can open
    let tableHtml = '<table border="1">';

    // Headers
    tableHtml += '<tr>';
    columns.forEach(col => {
      tableHtml += `<th style="background-color:#4472C4;color:white;font-weight:bold;padding:8px;">${col.label}</th>`;
    });
    tableHtml += '</tr>';

    // Data rows
    sortedRows.forEach(row => {
      tableHtml += '<tr>';
      columns.forEach(col => {
        const val = row[col.field];
        const cellValue = React.isValidElement(val) ? '' : (val ?? '');
        tableHtml += `<td style="padding:6px;">${cellValue}</td>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</table>';

    // Create blob and download
    const blob = new Blob([`
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="utf-8"></head>
        <body>${tableHtml}</body>
      </html>
    `], { type: 'application/vnd.ms-excel' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export-${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Excel file downloaded!');
  }, [columns, sortedRows]);

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    const headers = columns.map(col => col.label).join(',');
    const csvRows = sortedRows.map(row => {
      return columns.map(col => {
        const val = row[col.field];
        if (React.isValidElement(val)) return '';
        if (val == null) return '';
        // Escape quotes and wrap in quotes if contains comma
        const strVal = String(val);
        if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      }).join(',');
    }).join('\n');

    const csv = `${headers}\n${csvRows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV file downloaded!');
  }, [columns, sortedRows]);

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    const headers = columns.map(col => col.label).join('\t');
    const textRows = sortedRows.map(row => {
      return columns.map(col => {
        const val = row[col.field];
        if (React.isValidElement(val)) return '';
        return val ?? '';
      }).join('\t');
    }).join('\n');

    navigator.clipboard.writeText(`${headers}\n${textRows}`);
    toast.success('Copied to clipboard!');
  }, [columns, sortedRows]);

  // Generate pagination numbers
  const getPaginationNumbers = useCallback(() => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  // Calculate showing range
  const showingFrom = sortedRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingTo = Math.min(currentPage * pageSize, sortedRows.length);

  return (
    <div className="data-table-wrapper">
      {/* Toolbar */}
      <div className="data-table-toolbar no-print">
        <div className="data-table-toolbar-left">
          <div className="btn-group">
            <button type="button" onClick={handleExportExcel} className="btn btn-sm btn-light-success" title="Export to Excel">
              <i className="fa fa-file-excel me-1"></i>Excel
            </button>
            <button type="button" onClick={handleExportCSV} className="btn btn-sm btn-light-primary" title="Export to CSV">
              <i className="fa fa-file-csv me-1"></i>CSV
            </button>
            <button type="button" onClick={handleCopy} className="btn btn-sm btn-light" title="Copy to clipboard">
              <i className="fa fa-copy me-1"></i>Copy
            </button>
          </div>
        </div>
        <div className="data-table-toolbar-right">
          <div className="data-table-search">
            <span className="data-table-search-icon">
              <i className="fa fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control form-control-sm form-control-solid"
              placeholder="Search..."
              value={searchText}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="data-table-container">
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col, idx) => {
                  const isSortable = col.field !== 'action' && col.field !== 'sn';
                  const isSorted = sortConfig.field === col.field;

                  return (
                    <th
                      key={idx}
                      className={`${isSortable ? 'sortable' : ''} ${isSorted ? 'sorted' : ''}`}
                      onClick={() => isSortable && handleSort(col.field)}
                    >
                      {col.label}
                      {isSortable && (
                        <span className="sort-icon">
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? (
                              <i className="fa fa-sort-up"></i>
                            ) : (
                              <i className="fa fa-sort-down"></i>
                            )
                          ) : (
                            <i className="fa fa-sort"></i>
                          )}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row, rowIdx) => (
                    <motion.tr
                      key={row.EntryID || row.sn || rowIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: rowIdx * 0.03 }}
                    >
                      {columns.map((col, colIdx) => (
                        <td
                          key={colIdx}
                          className={
                            col.field === 'sn' ? 'sn-cell' :
                              col.field === 'action' ? 'action-cell' : ''
                          }
                        >
                          {row[col.field]}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length}>
                      <div className="data-table-empty">
                        <i className="fa fa-inbox"></i>
                        <p>No data available</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer with pagination */}
      {paging && (
        <div className="data-table-footer">
          <div className="data-table-info">
            Showing {showingFrom} to {showingTo} of {sortedRows.length} entries
            {searchText && rows.length !== sortedRows.length && (
              <span> (filtered from {rows.length} total)</span>
            )}
          </div>

          <div className="data-table-pagination">
            <div className="data-table-page-size">
              <label>Show</label>
              <select value={pageSize} onChange={handlePageSizeChange}>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </div>

            <div className="data-table-pagination-buttons">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="First page"
              >
                <i className="fa fa-angle-double-left"></i>
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Previous page"
              >
                <i className="fa fa-angle-left"></i>
              </button>

              {getPaginationNumbers().map((page, idx) => (
                page === '...' ? (
                  <span key={idx} className="data-table-pagination-ellipsis">...</span>
                ) : (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? 'active' : ''}
                  >
                    {page}
                  </button>
                )
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                title="Next page"
              >
                <i className="fa fa-angle-right"></i>
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                title="Last page"
              >
                <i className="fa fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
