import React from "react";
import { DataTable } from "../form";

/**
 * Legacy Table Component (Backward Compatibility Wrapper)
 *
 * This component maintains backward compatibility with the old mdbreact Table component.
 * It now uses the new DataTable component internally.
 *
 * @deprecated Use DataTable component directly for new implementations
 */
export default function Table(props) {
  const { data, paging = true, ...otherProps } = props;

  return (
    <div className="table-responsive">
      <DataTable
        data={data}
        pagination={paging}
        {...otherProps}
      />
    </div>
  );
}
