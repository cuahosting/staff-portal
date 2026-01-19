import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import { api } from "../../../../resources/api";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";
import swal from "sweetalert";
import SearchSelect from "../../../common/select/SearchSelect";

function PermissionMenus(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [mainMenuDatatable, setMainMenuDatatable] = useState({
    columns: [
      { label: "S/N", field: "sn" },
      { label: "Menu Name", field: "menu_name" },
      { label: "Updated By", field: "inserted_by" },
      { label: "Added On", field: "inserted_date" },
      { label: "Action", field: "action" },
    ],
    rows: [],
  });
  const [createMainMenu, setCreateMainMenu] = useState({
    menu_name: "",
    inserted_by: props.loginData[0].StaffID,
    entry_id: "",
  });
  const [mainMenuList, setMainMenuList] = useState([]);

  const [subMenuDatatable, setSubMenuDatatable] = useState({
    columns: [
      { label: "S/N", field: "sn" },
      { label: "Menu Name", field: "menu_name" },
      { label: "Sub Menu Name", field: "sub_menu_name" },
      { label: "Updated By", field: "inserted_by" },
      { label: "Updated Date", field: "inserted_date" },
      { label: "Action", field: "action" },
    ],
    rows: [],
  });
  const [createSubMenu, setCreateSubMenu] = useState({
    sub_menu_name: "",
    main_menu_id: "",
    inserted_by: props.loginData[0].StaffID,
    entry_id: "",
  });
  const [subMenuList, setMenuList] = useState([]);
  const [subMenuSelect, setSubMenuSelect] = useState([]);

  const [subSubMenuDatatable, setSubSubMenuDatatable] = useState({
    columns: [
      { label: "S/N", field: "sn" },
      { label: "Menu Name", field: "menu_name" },
      { label: "Sub Menu Name", field: "sub_menu_name" },
      { label: "Sub Sub Menu Name", field: "sub_sub_menu_name" },
      { label: "Menu Link", field: "sub_sub_menu_link" },
      { label: "Visibility", field: "visibility" },
      { label: "Updated By", field: "inserted_by" },
      { label: "Updated Date", field: "inserted_date" },
      { label: "Action", field: "action" },
    ],
    rows: [],
  });
  const [createSubSubMenu, setCreateSubSubMenu] = useState({
    sub_sub_menu_name: "",
    sub_sub_menu_link: "",
    sub_menu_id: "",
    main_menu_id: "",
    visibility: 1,
    inserted_by: props.loginData[0].StaffID,
    entry_id: "",
  });
  const [subSubMenuList, setSubSubMenuList] = useState([]);
  const [submittingSubSubMenu, setSubmittingSubSubMenu] = useState(false);

  const getRecords = async () => {
    const [mainRes, subRes, subSubRes] = await Promise.all([
      api.get("staff/settings/menu/main/list"),
      api.get("staff/settings/menu/sub/list"),
      api.get("staff/settings/menu/sub/sub/list")
    ]);

    if (mainRes.success && mainRes.data) {
      setMainMenuList(mainRes.data);
      if (mainRes.data.length > 0) {
        const rows = mainRes.data.map((item, index) => ({
          sn: index + 1,
          menu_name: item.MenuName,
          inserted_by: item.InsertedBy,
          inserted_date: formatDateAndTime(item.InsertedDate, "date"),
          action: (
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-sm btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#kt_modal_general"
                onClick={() => setCreateMainMenu({ menu_name: item.MenuName, entry_id: item.EntryID })}
              >
                <i className="fa fa-pen" />
              </button>
              <button
                className="btn btn-sm btn-danger ms-3"
                onClick={() => {
                  swal({
                    title: "Are you sure?",
                    text: "Once deleted, you will not be able to recover it!, All sub-menus and sub-sub-menus would not be mapped any longer",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                  }).then((willDelete) => {
                    if (willDelete) deleteMenu(item.MenuName, 'main_menu');
                  });
                }}
              >
                <i className="fa fa-trash" />
              </button>
            </div>
          ),
        }));
        setMainMenuDatatable({ ...mainMenuDatatable, rows });
      }
    }

    if (subRes.success && subRes.data) {
      setMenuList(subRes.data);
      if (subRes.data.length > 0) {
        const rows = subRes.data.map((item, index) => ({
          sn: index + 1,
          menu_name: item.MenuName,
          sub_menu_name: item.SubMenuName,
          inserted_by: item.InsertedBy,
          inserted_date: formatDateAndTime(item.InsertedDate, "date"),
          action: (
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-sm btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#kt_modal_sub_menu"
                onClick={() => toggleUpdateSubMenu(item)}
              >
                <i className="fa fa-pen" />
              </button>
              <button
                className="btn btn-sm btn-danger ms-3"
                onClick={() => {
                  swal({
                    title: "Are you sure?",
                    text: "Once deleted, you will not be able to recover it!, All sub-sub-menus would not be mapped any longer",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                  }).then((willDelete) => {
                    if (willDelete) deleteMenu(item.SubMenuName, 'sub_menu');
                  });
                }}
              >
                <i className="fa fa-trash" />
              </button>
            </div>
          ),
        }));
        setSubMenuDatatable({ ...subMenuDatatable, rows });
      }
    }

    if (subSubRes.success && subSubRes.data) {
      setSubSubMenuList(subSubRes.data);
      if (subSubRes.data.length > 0) {
        const rows = subSubRes.data.map((item, index) => ({
          sn: index + 1,
          menu_name: item.MenuName,
          sub_menu_name: item.SubMenuName,
          sub_sub_menu_name: item.SubSubMenuName,
          sub_sub_menu_link: item.SubSubMenuLink,
          visibility: item.Visibility === 1 ? "show" : "hide",
          inserted_by: item.InsertedBy,
          inserted_date: formatDateAndTime(item.InsertedDate, "date"),
          action: (
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-sm btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#kt_modal_sub_sub_menu"
                onClick={() => toggleUpdateSubSubMenu(item)}
              >
                <i className="fa fa-pen" />
              </button>
              <button
                className="btn btn-sm btn-danger ms-3"
                onClick={() => {
                  swal({
                    title: "Are you sure?",
                    text: "Once deleted, you will not be able to recover it!",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                  }).then((willDelete) => {
                    if (willDelete) deleteMenu(item.SubSubMenuName, 'sub_sub_menu');
                  });
                }}
              >
                <i className="fa fa-trash" />
              </button>
            </div>
          ),
        }));
        setSubSubMenuDatatable({ ...subSubMenuDatatable, rows });
      }
    }

    setIsLoading(false);
  };

  const deleteMenu = async (menu_name, menu_type) => {
    const { success, data } = await api.post("staff/settings/menu/delete-menu", { menu_name, menu_type });
    if (success && data?.message === "success") {
      toast.success("Deleted Successfully");
      getRecords();
    } else if (success) {
      toast.error(data?.whatToShow || "Failed to delete");
    }
  };

  const toggleAddSubMenu = () => {
    setCreateSubMenu({
      sub_menu_name: "",
      main_menu_id: "",
      inserted_by: props.loginData[0].StaffID,
      entry_id: "",
    });
  };

  const toggleUpdateSubMenu = (type) => {
    setCreateSubMenu({
      ...createSubMenu,
      sub_menu_name: type.SubMenuName,
      main_menu_id: type.MainMenuID,
      entry_id: type.EntryID,
    });
  };

  const toggleAddSubSubMenu = () => {
    setCreateSubSubMenu({
      sub_sub_menu_name: "",
      sub_sub_menu_link: "",
      sub_menu_id: "",
      main_menu_id: "",
      visibility: 1,
      inserted_by: props.loginData[0].StaffID,
      entry_id: "",
    });
  };

  const toggleUpdateSubSubMenu = async (type) => {
    if (subMenuList.length > 0) {
      const main_menu_id = subMenuList.filter(item => item.EntryID === type.SubMenuID)[0]?.["MainMenuID"];
      setSubMenuSelect(subMenuList.filter(item => item.MainMenuID === main_menu_id));
      setCreateSubSubMenu({
        sub_sub_menu_name: type.SubSubMenuName,
        sub_sub_menu_link: type.SubSubMenuLink,
        sub_menu_id: type.SubMenuID,
        visibility: type.Visibility,
        main_menu_id: main_menu_id,
        inserted_by: props.loginData[0].StaffID,
        entry_id: type.EntryID,
      });
    } else {
      const { success, data } = await api.get("staff/settings/menu/sub/list");
      if (success && data?.length > 0) {
        setMenuList(data);
        const main_menu_id = data.filter(item => item.EntryID === type.SubMenuID)[0]?.["MainMenuID"];
        setSubMenuSelect(data.filter(item => item.MainMenuID === main_menu_id));
        setCreateSubSubMenu({
          sub_sub_menu_name: type.SubSubMenuName,
          sub_sub_menu_link: type.SubSubMenuLink,
          sub_menu_id: type.SubMenuID,
          visibility: type.Visibility,
          main_menu_id: main_menu_id,
          inserted_by: props.loginData[0].StaffID,
          entry_id: type.EntryID,
        });
      }
    }
  };

  const closeHandler = () => {
    setCreateSubMenu({ sub_menu_name: "", main_menu_id: "", entry_id: "" });
    setCreateSubSubMenu({
      sub_sub_menu_name: "",
      sub_sub_menu_link: "",
      sub_menu_id: "",
      main_menu_id: "",
      visibility: 1,
      entry_id: "",
    });
  };

  const onMainMenuEdit = (e) => {
    setCreateMainMenu({ ...createMainMenu, [e.target.id]: e.target.value });
  };

  const onSubmitMainMenu = async () => {
    if (createMainMenu.menu_name.trim() === "") {
      showAlert("EMPTY FIELD", "Please enter the menu name", "error");
      return false;
    }

    if (createMainMenu.entry_id === "") {
      const { success, data } = await api.post("staff/settings/menu/main/add", createMainMenu);
      if (success && data?.message === "success") {
        toast.success("Main Menu Added Successfully");
        getRecords();
        setCreateMainMenu({ ...createMainMenu, menu_name: "", entry_id: "" });
      } else if (success && data?.message === "exist") {
        showAlert("MENU EXIST", "Menu already exist!", "error");
      } else if (success) {
        showAlert("ERROR", "Something went wrong. Please try again!", "error");
      }
    } else {
      const { success, data } = await api.patch("staff/settings/menu/main/update", createMainMenu);
      if (success && data?.message === "success") {
        toast.success("Menu Updated Successfully");
        getRecords();
        setCreateMainMenu({ ...createMainMenu, menu_name: "", entry_id: "" });
      } else if (success) {
        showAlert("ERROR", "Something went wrong. Please try again!", "error");
      }
    }
  };

  const onSubMenuEdit = (e) => {
    setCreateSubMenu({ ...createSubMenu, [e.target.id]: e.target.value });
  };

  const onSubmitSubMenu = async () => {
    if (createSubMenu.main_menu_id === "") {
      showAlert("EMPTY FIELD", "Please select the main menu", "error");
      return false;
    }
    if (createSubMenu.sub_menu_name.trim() === "") {
      showAlert("EMPTY FIELD", "Please enter the sub menu name", "error");
      return false;
    }

    if (createSubMenu.entry_id === "") {
      const { success, data } = await api.post("staff/settings/menu/sub/add", createSubMenu);
      if (success && data?.message === "success") {
        toast.success("Sub Menu Added Successfully");
        document.getElementById("closeModalSubMenu").click();
        getRecords();
        setCreateSubMenu({ ...createSubMenu, main_menu_id: "", sub_menu_name: "", entry_id: "" });
        closeHandler();
      } else if (success && data?.message === "exist") {
        showAlert("SUB MENU EXIST", "Sub Menu already exist!", "error");
      } else if (success) {
        showAlert("ERROR", "Something went wrong. Please try again!", "error");
      }
    } else {
      const { success, data } = await api.patch("staff/settings/menu/sub/update", createSubMenu);
      if (success && data?.message === "success") {
        toast.success("Sub Menu Updated Successfully");
        document.getElementById("closeModalSubMenu").click();
        getRecords();
        setCreateSubMenu({ ...createSubMenu, main_menu_id: "", sub_menu_name: "", entry_id: "" });
        closeHandler();
      } else if (success) {
        showAlert("ERROR", "Something went wrong. Please try again!", "error");
      }
    }
  };

  const onSubSubMenuEdit = (e) => {
    if (e.target.id === "main_menu_id") {
      if (e.target.value !== "") {
        setSubMenuSelect(subMenuList.filter(item => item.MainMenuID === parseInt(e.target.value)));
      } else {
        setSubMenuSelect([]);
      }
    }
    setCreateSubSubMenu({ ...createSubSubMenu, [e.target.id]: e.target.value });
  };

  const onSubmitSubSubMenu = async () => {
    if (createSubSubMenu.sub_menu_id === "") {
      showAlert("EMPTY FIELD", "Please select the sub menu name", "error");
      return false;
    }
    if (createSubSubMenu.sub_sub_menu_name === "") {
      showAlert("EMPTY FIELD", "Please enter the sub sub menu name", "error");
      return false;
    }
    if (createSubSubMenu.sub_sub_menu_link === "") {
      showAlert("EMPTY FIELD", "Please enter the sub sub menu link", "error");
      return false;
    }
    if (createSubSubMenu.visibility === "") {
      showAlert("EMPTY FIELD", "Please select visibility", "error");
      return false;
    }

    setSubmittingSubSubMenu(true);
    if (createSubSubMenu.entry_id === "") {
      const { success, data } = await api.post("staff/settings/menu/sub/sub/add", createSubSubMenu);
      if (success && data?.message === "success") {
        toast.success("Sub Sub Menu Added Successfully");
        getRecords();
        // Modal stays open, form data preserved - user can add more
      } else if (success && data?.message === "exist") {
        showAlert("SUB SUB MENU EXIST", "Sub Sub Menu already exist!", "error");
      } else if (success) {
        showAlert("ERROR", "Something went wrong. Please try again!", "error");
      }
    } else {
      const { success, data } = await api.patch("staff/settings/menu/sub/sub/update", createSubSubMenu);
      if (success && data?.message === "success") {
        toast.success("Sub Sub Menu Updated Successfully");
        document.getElementById("closeModalSubSubMenu").click();
        getRecords();
      } else if (success) {
        showAlert("ERROR", "Something went wrong. Please try again!", "error");
      }
    }
    setSubmittingSubSubMenu(false);
  };


  useEffect(() => {
    getRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader title={"Permission Menus"} items={["Settings", "Permission", "Menus"]} />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body p-0">
            <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-8">
              <li className="nav-item">
                <a className="nav-link text-active-primary pb-4 active" data-bs-toggle="tab" href="#main_menu">Main Menu</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-active-primary pb-4" data-kt-countup-tabs="true" data-bs-toggle="tab" href="#sub_menu">Sub Menu</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-active-primary pb-4" data-bs-toggle="tab" href="#sub_sub_menu">Sub Sub Menu</a>
              </li>
            </ul>

            <div className="tab-content" id="myTabContent">
              <div className="tab-pane fade active show" id="main_menu" role="tabpanel">
                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#kt_modal_general"
                    onClick={() => setCreateMainMenu({ ...createMainMenu, menu_name: "", entry_id: "" })}
                  >
                    Add Main Menu
                  </button>
                </div>
                <AGTable data={mainMenuDatatable} />
              </div>

              <div className="tab-pane fade" id="sub_menu" role="tabpanel">
                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                  <button type="button" data-bs-toggle="modal" data-bs-target="#kt_modal_sub_menu" className="btn btn-primary" onClick={toggleAddSubMenu}>
                    Add Sub Menu
                  </button>
                </div>
                <AGTable data={subMenuDatatable} />
              </div>

              <div className="tab-pane fade" id="sub_sub_menu" role="tabpanel">
                <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                  <button type="button" data-bs-toggle="modal" data-bs-target="#kt_modal_sub_sub_menu" className="btn btn-primary" onClick={toggleAddSubSubMenu}>
                    Add Sub Sub Menu
                  </button>
                </div>
                <AGTable data={subSubMenuDatatable} />
              </div>
            </div>
          </div>
        </div>

        <Modal title={"Main Menu Form"}>
          <div className="form-group">
            <label htmlFor="menu_name">Menu Name</label>
            <input type="text" id={"menu_name"} onChange={onMainMenuEdit} value={createMainMenu.menu_name} className={"form-control"} placeholder={"Enter the Main Menu Name"} />
          </div>
          <div className="form-group pt-2">
            <button onClick={onSubmitMainMenu} className="btn btn-primary w-100">Submit</button>
          </div>
        </Modal>

        <Modal title={`${createSubMenu.entry_id === "" ? "Add" : "Update"} Sub Menu`} id="kt_modal_sub_menu" close="closeModalSubMenu">
          <div className="form-group">
            <SearchSelect
              label="Select Main Menu"
              options={mainMenuList.map(item => ({ value: item.EntryID, label: item.MenuName }))}
              value={createSubMenu.main_menu_id ? mainMenuList.map(item => ({ value: item.EntryID, label: item.MenuName })).find(opt => opt.value == createSubMenu.main_menu_id) || null : null}
              onChange={(e) => setCreateSubMenu({ ...createSubMenu, main_menu_id: e?.value || "" })}
              placeholder="Select Main Menu"
            />
          </div>
          <div className="form-group pt-3">
            <label htmlFor="sub_menu_name">Sub Menu Name</label>
            <input type="text" className="form-control" id="sub_menu_name" value={createSubMenu.sub_menu_name} onChange={onSubMenuEdit} placeholder="Enter the Sub Menu Name" />
          </div>
          <div className="form-group pt-3">
            <button onClick={onSubmitSubMenu} className="btn btn-primary w-100">{createSubMenu.entry_id === "" ? "Add" : "Update"} Sub Menu</button>
          </div>
        </Modal>

        <Modal title={`${createSubSubMenu.entry_id === "" ? "Add" : "Update"} Sub Sub Menu`} id="kt_modal_sub_sub_menu" large={true} close="closeModalSubSubMenu" onClose={closeHandler}>
          <div className="form-group">
            <SearchSelect
              label="Select Main Menu"
              options={mainMenuList.map(item => ({ value: item.EntryID, label: item.MenuName }))}
              value={createSubSubMenu.main_menu_id ? mainMenuList.map(item => ({ value: item.EntryID, label: item.MenuName })).find(opt => opt.value == createSubSubMenu.main_menu_id) || null : null}
              onChange={(e) => {
                const value = e?.value || "";
                if (value !== "") {
                  setSubMenuSelect(subMenuList.filter(item => item.MainMenuID === parseInt(value)));
                } else {
                  setSubMenuSelect([]);
                }
                setCreateSubSubMenu({ ...createSubSubMenu, main_menu_id: value, sub_menu_id: "" });
              }}
              placeholder="Select Main Menu"
            />
          </div>
          <div className="form-group pt-3">
            <SearchSelect
              label="Select Sub Menu"
              options={subMenuSelect.map(item => ({ value: item.EntryID, label: item.SubMenuName }))}
              value={createSubSubMenu.sub_menu_id ? subMenuSelect.map(item => ({ value: item.EntryID, label: item.SubMenuName })).find(opt => opt.value == createSubSubMenu.sub_menu_id) || null : null}
              onChange={(e) => setCreateSubSubMenu({ ...createSubSubMenu, sub_menu_id: e?.value || "" })}
              placeholder="Select Sub Menu"
            />
          </div>
          <div className="form-group pt-3">
            <label htmlFor="sub_sub_menu_name">Sub Sub Menu Name</label>
            <input type="text" className="form-control" id="sub_sub_menu_name" value={createSubSubMenu.sub_sub_menu_name} onChange={onSubSubMenuEdit} placeholder="Enter the Sub Sub Menu Name" />
          </div>
          <div className="form-group pt-3">
            <label htmlFor="sub_sub_menu_link">Sub Sub Menu Link</label>
            <input type="text" className="form-control" id="sub_sub_menu_link" value={createSubSubMenu.sub_sub_menu_link} onChange={onSubSubMenuEdit} placeholder="Enter the Sub Sub Menu Link" />
          </div>
          <div className="form-group pt-3">
            <SearchSelect
              label="Select Visibility"
              options={[{ value: 1, label: "Show" }, { value: 0, label: "Hide" }]}
              value={{ value: createSubSubMenu.visibility, label: createSubSubMenu.visibility === 1 ? "Show" : "Hide" }}
              onChange={(e) => setCreateSubSubMenu({ ...createSubSubMenu, visibility: e?.value ?? 1 })}
              placeholder="Select Visibility"
            />
          </div>
          <div className="form-group pt-3">
            <button onClick={onSubmitSubSubMenu} className="btn btn-primary w-100" disabled={submittingSubSubMenu}>
              {submittingSubSubMenu ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              {createSubSubMenu.entry_id === "" ? "Add" : "Update"} Sub Sub Menu
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

export default connect(mapStateToProps, null)(PermissionMenus);
