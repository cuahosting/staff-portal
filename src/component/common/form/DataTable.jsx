import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import MUIDataTable from 'mui-datatables';
import { createTheme, ThemeProvider } from '@mui/material/styles';

/**
 * DataTable Component
 *
 * A comprehensive MUI-based data table with search, filter, pagination, and export capabilities.
 * Supports both legacy mdbreact data format and native MUI DataTables format.
 *
 * @component
 * @example
 * // Simple usage
 * <DataTable
 *   title="Students List"
 *   data={rows}
 *   columns={columns}
 * />
 *
 * @example
 * // With mdbreact format (backward compatible)
 * <DataTable
 *   data={{
 *     columns: [{label: "Name", field: "name"}],
 *     rows: [{name: "John Doe"}]
 *   }}
 * />
 *
 * @example
 * // With custom options
 * <DataTable
 *   title="Course List"
 *   data={rows}
 *   columns={columns}
 *   options={{
 *     selectableRows: 'single',
 *     onRowClick: (rowData) => console.log(rowData)
 *   }}
 * />
 */

// Custom theme for the DataTable
const createDataTableTheme = (customTheme = {}) => createTheme({
  components: {
    MUIDataTable: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          ...customTheme.root,
        },
        paper: {
          boxShadow: 'none',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          ...customTheme.paper,
        },
      },
    },
    MUIDataTableBodyCell: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          padding: '12px 16px',
          ...customTheme.bodyCell,
        },
      },
    },
    MUIDataTableHeadCell: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: '600',
          padding: '12px 16px',
          backgroundColor: '#f9fafb',
          ...customTheme.headCell,
        },
        sortAction: {
          alignItems: 'center',
        },
      },
    },
    MUIDataTableToolbar: {
      styleOverrides: {
        root: {
          padding: '16px',
          minHeight: '64px',
          ...customTheme.toolbar,
        },
      },
    },
    MUIDataTableSearch: {
      styleOverrides: {
        searchIcon: {
          color: '#667eea',
          marginRight: '8px',
        },
        searchText: {
          flex: '1',
        },
      },
    },
    MUIDataTableFilterList: {
      styleOverrides: {
        root: {
          margin: '0 16px',
        },
      },
    },
  },
});

const DataTable = ({
  // Data props
  data,
  columns: columnsProp,
  rows: rowsProp,

  // Display props
  title = '',

  // Feature toggles
  search = true,
  filter = true,
  download = true,
  print = true,
  viewColumns = true,
  pagination = true,
  selectableRows = 'none',

  // Pagination props
  rowsPerPage = 50,
  rowsPerPageOptions = [50, 100, 200],

  // Customization props
  options: customOptions = {},
  theme: customTheme = {},
  className = '',

  // Callbacks
  onRowClick,
  onRowsSelect,
  onRowsDelete,
  onColumnSortChange,
  onFilterChange,
  onSearchChange,
  onChangePage,
  onChangeRowsPerPage,
  onColumnViewChange,

  // Advanced props
  elevation = 0,
  responsive = 'standard',
  tableBodyHeight,
  tableBodyMaxHeight,
  serverSide = false,
  count,
  page,
  loading = false,

  ...props
}) => {
  // Parse data format - support both mdbreact and native MUI format
  const { parsedColumns, parsedRows } = useMemo(() => {
    let cols = columnsProp;
    let rws = rowsProp;

    // Check if data prop contains mdbreact format
    if (data && typeof data === 'object' && (data.columns || data.rows)) {
      const mdbColumns = data.columns || [];
      const mdbRows = data.rows || [];

      // Convert mdbreact columns to MUI format
      cols = mdbColumns.map(col => {
        if (typeof col === 'string') {
          return { name: col, label: col };
        }

        return {
          name: col.field || col.name || '',
          label: col.label || col.field || col.name || '',
          options: {
            filter: true,
            sort: true,
            ...col.options
          }
        };
      });

      // Convert mdbreact rows to array format
      rws = mdbRows.map(row => {
        if (Array.isArray(row)) {
          return row;
        }

        // Convert object to array based on column order
        return cols.map(col => {
          const fieldName = typeof col === 'string' ? col : col.name;
          return row[fieldName] !== undefined ? row[fieldName] : '';
        });
      });
    } else if (columnsProp) {
      // Use provided columns/rows directly
      cols = columnsProp;
      rws = rowsProp || [];
    } else {
      cols = [];
      rws = [];
    }

    return { parsedColumns: cols, parsedRows: rws };
  }, [data, columnsProp, rowsProp]);

  // Build options object
  const options = useMemo(() => ({
    filterType: 'dropdown',
    responsive,
    selectableRows,
    selectableRowsOnClick: false,
    rowsPerPage,
    rowsPerPageOptions,
    download,
    print,
    viewColumns,
    filter,
    search,
    pagination,
    elevation,
    tableBodyHeight,
    tableBodyMaxHeight,
    serverSide,
    count: count || parsedRows.length,
    page: page || 0,
    searchPlaceholder: 'Search...',

    // Text labels for localization
    textLabels: {
      body: {
        noMatch: loading ? 'Loading...' : 'Sorry, no matching records found',
        toolTip: 'Sort',
        columnHeaderTooltip: column => `Sort by ${column.label}`,
      },
      pagination: {
        next: 'Next Page',
        previous: 'Previous Page',
        rowsPerPage: 'Rows per page:',
        displayRows: 'of',
      },
      toolbar: {
        search: 'Search',
        downloadCsv: 'Download CSV',
        print: 'Print',
        viewColumns: 'View Columns',
        filterTable: 'Filter Table',
      },
      filter: {
        all: 'All',
        title: 'FILTERS',
        reset: 'RESET',
      },
      viewColumns: {
        title: 'Show Columns',
        titleAria: 'Show/Hide Table Columns',
      },
      selectedRows: {
        text: 'row(s) selected',
        delete: 'Delete',
        deleteAria: 'Delete Selected Rows',
      },
    },

    // Callbacks
    onRowClick: onRowClick ? (rowData, rowMeta) => onRowClick(rowData, rowMeta) : undefined,
    onRowSelectionChange: onRowsSelect ? (currentRowsSelected, allRowsSelected, rowsSelected) => {
      onRowsSelect(currentRowsSelected, allRowsSelected, rowsSelected);
    } : undefined,
    onRowsDelete: onRowsDelete ? (rowsDeleted) => {
      onRowsDelete(rowsDeleted);
      return false; // Prevent default delete behavior
    } : undefined,
    onColumnSortChange: onColumnSortChange ? (changedColumn, direction) => {
      onColumnSortChange(changedColumn, direction);
    } : undefined,
    onFilterChange: onFilterChange ? (changedColumn, filterList, type) => {
      onFilterChange(changedColumn, filterList, type);
    } : undefined,
    onSearchChange: onSearchChange ? (searchText) => {
      onSearchChange(searchText);
    } : undefined,
    onChangePage: onChangePage ? (currentPage) => {
      onChangePage(currentPage);
    } : undefined,
    onChangeRowsPerPage: onChangeRowsPerPage ? (numberOfRows) => {
      onChangeRowsPerPage(numberOfRows);
    } : undefined,
    onColumnViewChange: onColumnViewChange ? (changedColumn, action) => {
      onColumnViewChange(changedColumn, action);
    } : undefined,

    // Merge with custom options (custom options override defaults)
    ...customOptions,
  }), [
    responsive, selectableRows, rowsPerPage, rowsPerPageOptions, download, print,
    viewColumns, filter, search, pagination, elevation, tableBodyHeight, tableBodyMaxHeight,
    serverSide, count, page, loading, parsedRows.length, onRowClick, onRowsSelect,
    onRowsDelete, onColumnSortChange, onFilterChange, onSearchChange, onChangePage,
    onChangeRowsPerPage, onColumnViewChange, customOptions
  ]);

  const tableTheme = useMemo(() => createDataTableTheme(customTheme), [customTheme]);

  return (
    <div className={`data-table-wrapper ${className}`}>
      <ThemeProvider theme={tableTheme}>
        <MUIDataTable
          title={title}
          data={parsedRows}
          columns={parsedColumns}
          options={options}
          {...props}
        />
      </ThemeProvider>
    </div>
  );
};

DataTable.propTypes = {
  // Data props
  data: PropTypes.shape({
    columns: PropTypes.array,
    rows: PropTypes.array,
  }),
  columns: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string,
        options: PropTypes.object,
      }),
    ])
  ),
  rows: PropTypes.array,

  // Display props
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),

  // Feature toggles
  search: PropTypes.bool,
  filter: PropTypes.bool,
  download: PropTypes.bool,
  print: PropTypes.bool,
  viewColumns: PropTypes.bool,
  pagination: PropTypes.bool,
  selectableRows: PropTypes.oneOf(['none', 'single', 'multiple']),

  // Pagination props
  rowsPerPage: PropTypes.number,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),

  // Customization props
  options: PropTypes.object,
  theme: PropTypes.object,
  className: PropTypes.string,

  // Callbacks
  onRowClick: PropTypes.func,
  onRowsSelect: PropTypes.func,
  onRowsDelete: PropTypes.func,
  onColumnSortChange: PropTypes.func,
  onFilterChange: PropTypes.func,
  onSearchChange: PropTypes.func,
  onChangePage: PropTypes.func,
  onChangeRowsPerPage: PropTypes.func,
  onColumnViewChange: PropTypes.func,

  // Advanced props
  elevation: PropTypes.number,
  responsive: PropTypes.oneOf(['standard', 'vertical', 'simple']),
  tableBodyHeight: PropTypes.string,
  tableBodyMaxHeight: PropTypes.string,
  serverSide: PropTypes.bool,
  count: PropTypes.number,
  page: PropTypes.number,
  loading: PropTypes.bool,
};

export default DataTable;
