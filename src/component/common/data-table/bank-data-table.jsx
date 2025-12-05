import React, { useMemo } from "react";
import AGTable from "../table/AGTable";

/**
 * Legacy BankDataTable component - now wraps AGTable for modern AG Grid functionality
 *
 * This component maintains backward compatibility with the old jQuery DataTables interface
 * specialized for bank payment schedules with custom print formatting.
 *
 * @deprecated Consider using AGTable directly for new code
 *
 * Props:
 * - header: Array of column header strings
 * - body: Array of React elements (table rows) - DEPRECATED, not used with AGTable
 * - tableID: Table ID (not used with AGTable)
 * - date: Report date
 * - caption: Total caption text
 * - total_amount: Total amount for payment schedule
 * - signatory: Signatory JSX element for print
 * - isGrouping: Enable row grouping (not fully supported in migration)
 * - groupCol: Column index to group by
 *
 * Migration Notes:
 * - Custom print formatting with signatory is not directly supported in AGTable
 * - Bank-specific features need to be reimplemented in consuming components
 * - For new implementations, use AGTable with the columns/rows structure
 */
export default function BankDataTable(props) {
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

        // Note: Bank-specific features (signatory, custom print format) are not supported
        // These need to be reimplemented in the consuming component

        return {
            columns,
            rows: [], // Cannot convert JSX body to data rows automatically
        };
    }, [props.header]);

    // If this component is being used with legacy body prop, show warning
    if (props.body && props.body.length > 0) {
        console.warn(
            'BankDataTable: The "body" prop with JSX elements is deprecated. ' +
            'Please migrate to AGTable with a proper data structure (columns/rows). ' +
            'See staff/src/component/academic/course/course.jsx for reference.'
        );
    }

    // Show warning about grouping feature if used
    if (props.isGrouping) {
        console.warn(
            'BankDataTable: Row grouping from jQuery DataTables is not supported in AGTable. ' +
            'Please use AG Grid\'s built-in row grouping features instead.'
        );
    }

    // Show warning about bank-specific features
    if (props.signatory || props.total_amount) {
        console.warn(
            'BankDataTable: Bank-specific features (signatory, custom print format) are not supported in AGTable. ' +
            'Please implement these features in your component using AG Grid\'s export customization.'
        );
    }

    return (
        <div>
            {(props.signatory || props.total_amount) && (
                <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: '4px' }}>
                    <strong style={{ color: '#0c5460' }}>ℹ️ Note:</strong>
                    <span style={{ color: '#0c5460', marginLeft: '5px' }}>
                        Bank payment schedule features (signatory, custom print) need to be reimplemented using AG Grid's export customization.
                    </span>
                </div>
            )}
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
                        ⚠️ BankDataTable Component Needs Migration
                    </h5>
                    <p style={{ color: '#856404', marginBottom: '10px' }}>
                        This BankDataTable component is using the deprecated JSX body format.
                        Please migrate to AGTable with a columns/rows data structure.
                        See <code>staff/src/component/academic/course/course.jsx</code> for an example.
                    </p>
                    <p style={{ color: '#856404', marginBottom: '0' }}>
                        <strong>Bank-specific features:</strong> Custom print formatting, signatory section,
                        and payment amount conversion need to be reimplemented in your component.
                    </p>
                </div>
            ) : (
                // New path: Use AGTable
                <AGTable data={tableData} />
            )}
        </div>
    );
}