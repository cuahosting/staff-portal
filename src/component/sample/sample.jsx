import React, { useState } from "react";
import Modal from "../common/modal/modal";
import PageHeader from "../common/pageheader/pageheader";
import Table from "../common/table/table";
function Sample() {
  const [datatable, setDatatable] = useState({
    columns: [
      {
        label: "Name",
        field: "name",
      },
      {
        label: "Position",
        field: "position",
      },
      {
        label: "Office",
        field: "office",
      },
      {
        label: "Age",
        field: "age",
      },
      {
        label: "Start date",
        field: "date",
      },
      {
        label: "Salary",
        field: "salary",
      },
    ],
    rows: [
      {
        name: "Tiger Nixon",
        position: "System Architect",
        office: "Edinburgh",
        age: "61",
        date: "2011/04/25",
        salary: "$320",
      },
    ],
  });
  return (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Sample Page"}
        items={["Academics", "Others", "Current Page"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-header border-0 pt-6">
            <div className="card-title" />
            <div className="card-toolbar">
              <div
                className="d-flex justify-content-end"
                data-kt-customer-table-toolbar="base"
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_general"
                >
                  Add Customer
                </button>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <Table data={datatable} />
          </div>
        </div>
        <Modal title={"Add User"}></Modal>
      </div>
    </div>
  );
}

export default Sample;
