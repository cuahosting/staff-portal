/**
 * Table - Now using custom DataTable component
 *
 * This component provides backward compatibility for components using the
 * old MDBDataTableV5-based Table interface while using DataTable under the hood.
 *
 * Props:
 * - data: { columns: [{label, field}], rows: [{...}] }
 * - paging: boolean - Enable pagination (optional, default true)
 */

import DataTable from './DataTable';

// Re-export DataTable as Table for backward compatibility
export default DataTable;
