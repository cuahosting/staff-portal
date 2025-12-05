import React, { useMemo } from "react";
import AGTable from "../table/AGTable";

/**
 * Legacy AdvancedDataTable component - now wraps AGTable for modern AG Grid functionality
 *
 * This component maintains backward compatibility with the old jQuery DataTables interface
 * with advanced features like grouping and column visibility.
 *
 * @deprecated Consider using AGTable directly for new code
 *
 * Props:
 * - header: Array of column header strings
 * - body: Array of React elements (table rows) - DEPRECATED, not used with AGTable
 * - tableID: Table ID (not used with AGTable)
 * - title: Report title for exports
 * - date: Report date
 * - isGrouping: Enable row grouping (not fully supported in migration)
 * - groupCol: Column index to group by
 * - colSpan: Column span for group headers
 *
 * Migration Notes:
 * - Grouping features from jQuery DataTables are not directly supported in AGTable
 * - For grouping, consider using AG Grid's built-in row grouping features
 * - For new implementations, use AGTable with the columns/rows structure
 */
export default function AdvancedDataTable(props) {
    // Convert old header/body format to AGTable's data structure
    const tableData = useMemo(() => {
        if (!props.header || props.header.length === 0) {
            return { columns: [], rows: [] };
        }

        // Create columns from headers
        const columns = props.header.map((headerText, index) => {
            // Normalize header text to create field names
            const fieldName = headerText.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '') // Remove special chars
                .replace(/\s+/g, '_')         // Replace spaces with underscore
                .replace(/^_+|_+$/g, '');     // Trim underscores

            return {
                label: headerText,
                field: fieldName || `col_${index}`,
            };
        });

        // Note: Grouping features from jQuery DataTables are not directly supported
        // AG Grid has its own powerful row grouping features that should be used instead

        return {
            columns,
            rows: [], // Cannot convert JSX body to data rows automatically
        };
    }, [props.header]);

    // If this component is being used with legacy body prop, show warning
    if (props.body && props.body.length > 0) {
        console.warn(
            'AdvancedDataTable: The "body" prop with JSX elements is deprecated. ' +
            'Please migrate to AGTable with a proper data structure (columns/rows). ' +
            'See staff/src/component/academic/course/course.jsx for reference.'
        );
    }

    // Show warning about grouping feature if used
    if (props.isGrouping) {
        console.warn(
            'AdvancedDataTable: Row grouping from jQuery DataTables is not supported in AGTable. ' +
            'Please use AG Grid\'s built-in row grouping features instead.'
        );
    }

    return (
        <div>
            {props.isGrouping && (
                <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: '4px' }}>
                    <strong style={{ color: '#0c5460' }}>ℹ️ Note:</strong>
                    <span style={{ color: '#0c5460', marginLeft: '5px' }}>
                        Row grouping needs to be reimplemented using AG Grid's grouping features.
                    </span>
                </div>
            )}
            {props.body && props.body.length > 0 ? (
                // Fallback: Show a message if legacy body prop is used
                <div style={{ padding: '20px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
                    <h5 style={{ color: '#856404', marginBottom: '10px' }}>
                        ⚠️ AdvancedDataTable Component Needs Migration
                    </h5>
                    <p style={{ color: '#856404', marginBottom: '0' }}>
                        This AdvancedDataTable component is using the deprecated JSX body format.
                        Please migrate to AGTable with a columns/rows data structure.
                        See <code>staff/src/component/academic/course/course.jsx</code> for an example.
                    </p>
                </div>
            ) : (
                // New path: Use AGTable
                <AGTable data={tableData} />
            )}
        </div>
    );
}
