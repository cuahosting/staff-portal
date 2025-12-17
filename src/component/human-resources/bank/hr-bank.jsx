import React, { useEffect, useState } from "react";
import Modal from "../../common/modal/modal";
import PageHeader from "../../common/pageheader/pageheader";
import AGTable from "../../common/table/AGTable";
import { api } from "../../../resources/api";
import Loader from "../../common/loader/loader";
import { showAlert } from "../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { connect } from "react-redux";

function HRBank(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [datatable, setDatatable] = useState({
    columns: [
      { label: "S/N", field: "sn" },
      { label: "Action", field: "action" },
      { label: "Bank Name", field: "name" },
      { label: "Sort Code", field: "sort_code" },
    ],
    rows: [],
  });

  const [createBank, setCreateBank] = useState({
    bank_name: "",
    sort_code: "",
    entry_id: "",
  });

  // Helper function to build table rows from bank data
  const buildBankRows = (banks) => {
    return banks.map((bank, index) => ({
      sn: index + 1,
      name: bank.BankName,
      sort_code: bank.SortCode || "",
      action: (
        <button
          className="btn btn-sm btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#kt_modal_general"
          onClick={() =>
            setCreateBank({
              bank_name: bank.BankName,
              sort_code: bank.SortCode || "",
              entry_id: bank.EntryID,
            })
          }
        >
          <i className="fa fa-pen" />
        </button>
      ),
    }));
  };

  const getBanks = async () => {
    const { success, data } = await api.get("staff/hr/bank/list");

    if (success && data?.length > 0) {
      setDatatable((prev) => ({
        ...prev,
        rows: buildBankRows(data),
      }));
    }
    setIsLoading(false);
  };

  const onEdit = (e) => {
    setCreateBank({
      ...createBank,
      [e.target.id]: e.target.value,
    });
  };

  const resetForm = () => {
    setCreateBank({
      bank_name: "",
      sort_code: "",
      entry_id: "",
    });
  };

  const onSubmit = async () => {
    if (createBank.bank_name.trim() === "") {
      showAlert("EMPTY FIELD", "Please enter the bank name", "error");
      return false;
    }

    if (createBank.entry_id === "") {
      // Add new bank
      const { success, data } = await api.post("staff/hr/bank/add", createBank);

      if (success) {
        if (data?.message === "success") {
          toast.success("Bank Added Successfully");
          document.getElementById("closeModal").click();
          getBanks();
          resetForm();
        } else if (data?.message === "exist") {
          showAlert("BANK EXIST", "Bank already exist!", "error");
        } else {
          showAlert("ERROR", "Something went wrong. Please try again!", "error");
        }
      }
    } else {
      // Update existing bank
      const { success, data } = await api.patch("staff/hr/bank/update", createBank);

      if (success && data?.message === "success") {
        toast.success("Bank Updated Successfully");
        document.getElementById("closeModal").click();
        getBanks();
        resetForm();
      } else if (success) {
        showAlert("ERROR", "Something went wrong. Please try again!", "error");
      }
    }
  };

  useEffect(() => {
    getBanks();
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Banks"}
        items={["Human Resources", "Others", "Banks"]}
        buttons={
          <button
            type="button"
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#kt_modal_general"
            onClick={resetForm}
          >
            <i className="fa fa-plus me-2"></i>
            Add Bank
          </button>
        }
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-5">
            <AGTable data={datatable} />
          </div>
        </div>
        <Modal title={"Bank Form"}>
          <div className="form-group">
            <label htmlFor="bank_name">Bank Name</label>
            <input
              type="text"
              id={"bank_name"}
              onChange={onEdit}
              value={createBank.bank_name}
              className={"form-control"}
              placeholder={"Enter the Bank Name"}
            />
          </div>

          <div className="form-group pt-2">
            <label htmlFor="sort_code">Sort Code</label>
            <input
              type="text"
              id={"sort_code"}
              onChange={onEdit}
              value={createBank.sort_code}
              className={"form-control"}
              placeholder={"Enter the Sort Code"}
            />
          </div>

          <div className="form-group pt-2">
            <button onClick={onSubmit} className="btn btn-primary w-100">
              Submit
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(HRBank);
