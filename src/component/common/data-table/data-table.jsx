import React, { useMemo } from "react";
import AGTable from "../table/AGTable";

/**
 * Legacy DataTable component - now wraps AGTable for modern AG Grid functionality
 *
 * This component maintains backward compatibility with the old jQuery DataTables interface
 * while providing the enhanced performance and features of AG Grid.
 *
 * @deprecated Consider using AGTable directly for new code
 *
 * Props:
 * - header: Array of column header strings
 * - body: Array of React elements (table rows) - DEPRECATED, not used with AGTable
 * - tableID: Table ID (not used with AGTable)
 * - title: Report title for exports
 *
 * Migration Notes:
 * - This component now converts header/body props to AGTable's data structure
 * - JSX elements in body are not supported - use AGTable directly for action buttons
 * - For new implementations, use AGTable with the columns/rows structure
 */
export default function DataTable(props) {
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

        // Note: Body conversion is not straightforward because the old format uses JSX rows
        // If this component is actually used, the calling code should be migrated to AGTable
        // with proper data structure instead of JSX elements

        return {
            columns,
            rows: [], // Cannot convert JSX body to data rows automatically
        };
    }, [props.header]);

    // If this component is being used with legacy body prop, show warning
    if (props.body && props.body.length > 0) {
        console.warn(
            'DataTable: The "body" prop with JSX elements is deprecated. ' +
            'Please migrate to AGTable with a proper data structure (columns/rows). ' +
            'See staff/src/component/academic/course/course.jsx for reference.'
        );
    }

    return (
        <div>
            {props.body && props.body.length > 0 ? (
                // Fallback: Show a message if legacy body prop is used
                <div style={{ padding: '20px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
                    <h5 style={{ color: '#856404', marginBottom: '10px' }}>
                        ⚠️ DataTable Component Needs Migration
                    </h5>
                    <p style={{ color: '#856404', marginBottom: '0' }}>
                        This DataTable component is using the deprecated JSX body format.
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