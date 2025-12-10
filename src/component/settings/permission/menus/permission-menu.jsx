import React, { useEffect, useState } from "react";
import Modal from "../../../common/modal/modal";
import PageHeader from "../../../common/pageheader/pageheader";
import AGTable from "../../../common/table/AGTable";
import axios from "axios";
import { serverLink } from "../../../../resources/url";
import Loader from "../../../common/loader/loader";
import { showAlert } from "../../../common/sweetalert/sweetalert";
import { toast } from "react-toastify";
import { formatDateAndTime } from "../../../../resources/constants";
import { connect } from "react-redux";
import swal from "sweetalert";


function PermissionMenus(props)
{
  const token = props.loginData[0].token;

  const [isLoading, setIsLoading] = useState(true);
  const [mainMenuDatatable, setMainMenuDatatable] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Menu Name",
        field: "menu_name",
      },
      {
        label: "Updated By",
        field: "inserted_by",
      },
      {
        label: "Added On",
        field: "inserted_date",
      },
      {
        label: "Action",
        field: "action",
      },
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
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Menu Name",
        field: "menu_name",
      },
      {
        label: "Sub Menu Name",
        field: "sub_menu_name",
      },
      {
        label: "Updated By",
        field: "inserted_by",
      },
      {
        label: "Updated Date",
        field: "inserted_date",
      },
      {
        label: "Action",
        field: "action",
      },
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
  const getRecords = async () =>
  {
    await axios
      .get(`${serverLink}staff/settings/menu/main/list`, token)
      .then((result) =>
      {
        const data = result.data;
        setMainMenuList(data);
        if (data.length > 0)
        {
          let rows = [];
          data.map((item, index) =>
          {
            rows.push({
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
                    onClick={() =>
                      setCreateMainMenu({
                        menu_name: item.MenuName,
                        entry_id: item.EntryID,
                      })
                    }
                  >
                    <i className="fa fa-pen" />
                  </button>
                  <button
                    className="btn btn-sm btn-danger ms-3"
                    onClick={() =>
                    {
                      swal({
                        title: "Are you sure?",
                        text: "Once deleted, you will not be able to recover it!, All sub-menus and sub-sub-menus would not be mapped any longer",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                      }).then((willDelete) =>
                      {
                        if (willDelete)
                        {
                          deleteMenu(item.MenuName, 'main_menu');
                        }
                      });
                    }}
                  >
                    <i className="fa fa-trash" />
                  </button>
                </ div>
              ),
            });
          });
          setMainMenuDatatable({
            ...mainMenuDatatable,
            columns: mainMenuDatatable.columns,
            rows: rows,
          });
        }
      })
      .catch((err) =>
      {
        console.log("NETWORK NATIONALITY ERROR");
      });

    await axios
      .get(`${serverLink}staff/settings/menu/sub/list`, token)
      .then((result) =>
      {
        const data = result.data;
        if (data.length > 0)
        {
          setMenuList(data);
          let rows = [];
          data.map((item, index) =>
          {
            rows.push({
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
                    onClick={() =>
                    {
                      swal({
                        title: "Are you sure?",
                        text: "Once deleted, you will not be able to recover it!, All sub-sub-menus would not be mapped any longer",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                      }).then((willDelete) =>
                      {
                        if (willDelete)
                        {
                          deleteMenu(item.SubMenuName, 'sub_menu');
                        }
                      });
                    }}
                  >
                    <i className="fa fa-trash" />
                  </button>
                </div>
              ),
            });
          });
          setSubMenuDatatable({
            ...subMenuDatatable,
            columns: subMenuDatatable.columns,
            rows: rows,
          });
        }
      })
      .catch((err) =>
      {
        console.log("NETWORK ERROR STATE");
      });

    await axios
      .get(`${serverLink}staff/settings/menu/sub/sub/list`, token)
      .then((result) =>
      {
        const data = result.data;
        setSubSubMenuList(data);
        if (data.length > 0)
        {
          let rows = [];
          data.map((item, index) =>
          {
            rows.push({
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
                    onClick={() =>
                    {
                      swal({
                        title: "Are you sure?",
                        text: "Once deleted, you will not be able to recover it!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                      }).then((willDelete) =>
                      {
                        if (willDelete)
                        {
                          deleteMenu(item.SubSubMenuName, 'sub_sub_menu');
                        }
                      });
                    }}
                  >
                    <i className="fa fa-trash" />
                  </button>
                </ div>
              ),
            });
          });
          setSubSubMenuDatatable({
            ...subSubMenuDatatable,
            columns: subSubMenuDatatable.columns,
            rows: rows,
          });
        }

        setIsLoading(false);
      })
      .catch((err) =>
      {
        console.log("NETWORK ERROR LGA");
      });
  };


  async function deleteMenu(menu_name, menu_type)
  {
    await axios
      .post(`${serverLink}staff/settings/menu/delete-menu`, { menu_name: menu_name, menu_type: menu_type }, token)
      .then((res) =>
      {
        if (res.data.message === "success")
        {
          toast.success("Deleted Successfully");
          getRecords();
        } else
        {
          toast.error(res.data.whatToShow);
        }
      })
      .catch((err) =>
      {
        console.log(err);
        toast.error("NETWORK ERROR. Please try again!");
      });
  }



  const toggleAddSubMenu = () =>
  {
    setCreateSubMenu({
      sub_menu_name: "",
      main_menu_id: "",
      inserted_by: props.loginData[0].StaffID,
      entry_id: "",
    });
  };
  const toggleUpdateSubMenu = (type) =>
  {
    setCreateSubMenu({
      ...createSubMenu,
      sub_menu_name: type.SubMenuName,
      main_menu_id: type.MainMenuID,
      entry_id: type.EntryID,
    });
  };

  const [subSubMenuDatatable, setSubSubMenuDatatable] = useState({
    columns: [
      {
        label: "S/N",
        field: "sn",
      },
      {
        label: "Menu Name",
        field: "menu_name",
      },
      {
        label: "Sub Menu Name",
        field: "sub_menu_name",
      },
      {
        label: "Sub Sub Menu Name",
        field: "sub_sub_menu_name",
      },
      {
        label: "Menu Link",
        field: "sub_sub_menu_link",
      },
      {
        label: "Visibility",
        field: "visibility",
      },
      {
        label: "Updated By",
        field: "inserted_by",
      },
      {
        label: "Updated Date",
        field: "inserted_date",
      },
      {
        label: "Action",
        field: "action",
      },
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
  const toggleAddSubSubMenu = () =>
  {
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
  const toggleUpdateSubSubMenu = async (type) =>
  {
    if (subSubMenuList.length > 0)
    {
      const main_menu_id = subMenuList.filter(
        (item) => item.EntryID === type.SubMenuID
      )[0]["MainMenuID"];
      setSubMenuSelect(
        subMenuList.filter((item) => item.MainMenuID === main_menu_id)
      );
      setCreateSubSubMenu({
        sub_sub_menu_name: type.SubSubMenuName,
        sub_sub_menu_link: type.SubSubMenuLink,
        sub_menu_id: type.SubMenuID,
        visibility: type.Visibility,
        main_menu_id: main_menu_id,
        inserted_by: props.loginData[0].StaffID,
        entry_id: type.EntryID,
      });
    } else
    {
      await axios
        .get(`${serverLink}staff/settings/menu/sub/list`, token)
        .then((result) =>
        {
          const data = result.data;
          if (data.length > 0)
          {
            setMenuList(data);
            let rows = [];
            data.map((item, index) =>
            {
              rows.push({
                sn: index + 1,
                menu_name: item.MenuName,
                sub_menu_name: item.SubMenuName,
                inserted_by: item.InsertedBy,
                inserted_date: formatDateAndTime(item.InsertedDate, "date"),
                action: (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => toggleUpdateSubMenu(item)}
                  >
                    <i className="fa fa-pen" />
                  </button>
                ),
              });
            });
            setSubMenuDatatable({
              ...subMenuDatatable,
              columns: subMenuDatatable.columns,
              rows: rows,
            });

            const main_menu_id = data.filter(
              (item) => item.EntryID === type.SubMenuID
            )[0]["MainMenuID"];
            setSubMenuSelect(data.filter((item) => item.MainMenuID === main_menu_id));
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
        })
        .catch((err) =>
        {
          console.log("NETWORK ERROR STATE");
        });
    }

  };
  const closeHandler = () =>
  {
    setCreateSubMenu({
      sub_menu_name: "",
      main_menu_id: "",
      entry_id: "",
    });

    setCreateSubSubMenu({
      sub_sub_menu_name: "",
      sub_sub_menu_link: "",
      sub_menu_id: "",
      main_menu_id: "",
      visibility: 1,
      entry_id: "",
    });
  };

  const onMainMenuEdit = (e) =>
  {
    setCreateMainMenu({
      ...createMainMenu,
      [e.target.id]: e.target.value,
    });
  };

  const onSubmitMainMenu = async () =>
  {
    if (createMainMenu.menu_name.trim() === "")
    {
      showAlert("EMPTY FIELD", "Please enter the menu name", "error");
      return false;
    }

    if (createMainMenu.entry_id === "")
    {
      await axios
        .post(`${serverLink}staff/settings/menu/main/add`, createMainMenu, token)
        .then((result) =>
        {
          if (result.data.message === "success")
          {
            toast.success("Main Menu Added Successfully");
            getRecords();
            setCreateMainMenu({
              ...createMainMenu,
              menu_name: "",
              entry_id: "",
            });
          } else if (result.data.message === "exist")
          {
            showAlert("MENU EXIST", "Menu already exist!", "error");
          } else
          {
            showAlert(
              "ERROR",
              "Something went wrong. Please try again!",
              "error"
            );
          }
        })
        .catch((error) =>
        {
          showAlert(
            "NETWORK ERROR",
            "Please check your connection and try again!",
            "error"
          );
        });
    } else
    {
      await axios
        .patch(`${serverLink}staff/settings/menu/main/update`, createMainMenu, token)
        .then((result) =>
        {
          if (result.data.message === "success")
          {
            toast.success("Menu Updated Successfully");
            getRecords();
            setCreateMainMenu({
              ...createMainMenu,
              menu_name: "",
              entry_id: "",
            });
          } else
          {
            showAlert(
              "ERROR",
              "Something went wrong. Please try again!",
              "error"
            );
          }
        })
        .catch((error) =>
        {
          showAlert(
            "NETWORK ERROR",
            "Please check your connection and try again!",
            "error"
          );
        });
    }
  };

  const onSubMenuEdit = (e) =>
  {
    setCreateSubMenu({
      ...createSubMenu,
      [e.target.id]: e.target.value,
    });
  };

  const onSubmitSubMenu = async () =>
  {
    if (createSubMenu.main_menu_id === "")
    {
      showAlert("EMPTY FIELD", "Please select the main menu", "error");
      return false;
    }
    if (createSubMenu.sub_menu_name.trim() === "")
    {
      showAlert("EMPTY FIELD", "Please enter the sub menu name", "error");
      return false;
    }

    if (createSubMenu.entry_id === "")
    {
      await axios
        .post(`${serverLink}staff/settings/menu/sub/add`, createSubMenu, token)
        .then((result) =>
        {
          if (result.data.message === "success")
          {
            toast.success("Sub Menu Added Successfully");
            document.getElementById("closeModalSubMenu").click();
            getRecords();
            setCreateSubMenu({
              ...createSubMenu,
              main_menu_id: "",
              sub_menu_name: "",
              entry_id: "",
            });
            closeHandler();
          } else if (result.data.message === "exist")
          {
            showAlert("SUB MENU EXIST", "Sub Menu already exist!", "error");
          } else
          {
            showAlert(
              "ERROR",
              "Something went wrong. Please try again!",
              "error"
            );
          }
        })
        .catch((error) =>
        {
          console.log(error);
          showAlert(
            "NETWORK ERROR",
            "Please check your connection and try again!",
            "error"
          );
        });
    } else
    {
      await axios
        .patch(`${serverLink}staff/settings/menu/sub/update`, createSubMenu, token)
        .then((result) =>
        {
          if (result.data.message === "success")
          {
            toast.success("Sub Menu Updated Successfully");
            document.getElementById("closeModalSubMenu").click();
            getRecords();
            setCreateSubMenu({
              ...createSubMenu,
              main_menu_id: "",
              sub_menu_name: "",
              entry_id: "",
            });
            closeHandler();
          } else
          {
            showAlert(
              "ERROR",
              "Something went wrong. Please try again!",
              "error"
            );
          }
        })
        .catch((error) =>
        {
          showAlert(
            "NETWORK ERROR",
            "Please check your connection and try again!",
            "error"
          );
        });
    }
  };

  const onSubSubMenuEdit = (e) =>
  {
    if (e.target.id === "main_menu_id")
    {
      if (e.target.value !== "")
      {
        setSubMenuSelect(
          subMenuList.filter(
            (item) => item.MainMenuID === parseInt(e.target.value)
          )
        );
      } else
      {
        setSubMenuSelect([]);
      }
    }

    setCreateSubSubMenu({
      ...createSubSubMenu,
      [e.target.id]: e.target.value,
    });
  };

  const onSubmitSubSubMenu = async () =>
  {
    if (createSubSubMenu.sub_menu_id === "")
    {
      showAlert("EMPTY FIELD", "Please select the sub menu name", "error");
      return false;
    }
    if (createSubSubMenu.sub_sub_menu_name === "")
    {
      showAlert("EMPTY FIELD", "Please enter the sub sub menu name", "error");
      return false;
    }

    if (createSubSubMenu.sub_sub_menu_link === "")
    {
      showAlert("EMPTY FIELD", "Please enter the sub sub menu link", "error");
      return false;
    }

    if (createSubSubMenu.visibility === "")
    {
      showAlert("EMPTY FIELD", "Please select visibility", "error");
      return false;
    }

    if (createSubSubMenu.entry_id === "")
    {
      await axios
        .post(`${serverLink}staff/settings/menu/sub/sub/add`, createSubSubMenu, token)
        .then((result) =>
        {
          if (result.data.message === "success")
          {
            toast.success("Sub Sub Menu Added Successfully");
            document.getElementById("closeModal").click();
            getRecords();
            setCreateSubSubMenu({
              ...createSubSubMenu,
              sub_menu_id: "",
              sub_sub_menu_name: "",
              sub_sub_menu_link: "",
              visibility: 1,
              main_menu_id: "",
              entry_id: "",
            });
            closeHandler();
          } else if (result.data.message === "exist")
          {
            showAlert(
              "SUB SUB MENU EXIST",
              "Sub Sub Menu already exist!",
              "error"
            );
          } else
          {
            showAlert(
              "ERROR",
              "Something went wrong. Please try again!",
              "error"
            );
          }
        })
        .catch((error) =>
        {
          showAlert(
            "NETWORK ERROR",
            "Please check your connection and try again!",
            "error"
          );
        });
    } else
    {
      await axios
        .patch(
          `${serverLink}staff/settings/menu/sub/sub/update`,
          createSubSubMenu, token
        )
        .then((result) =>
        {
          if (result.data.message === "success")
          {
            toast.success("Sub Sub Menu Updated Successfully");
            document.getElementById("closeModal").click();
            getRecords();
            setCreateSubSubMenu({
              ...createSubSubMenu,
              sub_menu_id: "",
              sub_sub_menu_link: "",
              sub_sub_menu_name: "",
              visibility: 1,
              main_menu_id: "",
              entry_id: "",
            });
            closeHandler();
          } else
          {
            showAlert(
              "ERROR",
              "Something went wrong. Please try again!",
              "error"
            );
          }
        })
        .catch((error) =>
        {
          showAlert(
            "NETWORK ERROR",
            "Please check your connection and try again!",
            "error"
          );
        });
    }
  };

  useEffect(() =>
  {
    getRecords();
    // if (isLoading) {
    //     getRecords();
    // }
  }, []);

  return isLoading ? (
    <Loader />
  ) : (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Permission Menus"}
        items={["Settings", "Permission", "Menus"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body p-0">
            <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-8">
              <li className="nav-item">
                <a
                  className="nav-link text-active-primary pb-4 active"
                  data-bs-toggle="tab"
                  href="#main_menu"
                >
                  Main Menu
                </a>
              </li>

              <li className="nav-item">
                <a
                  className="nav-link text-active-primary pb-4"
                  data-kt-countup-tabs="true"
                  data-bs-toggle="tab"
                  href="#sub_menu"
                >
                  Sub Menu
                </a>
              </li>

              <li className="nav-item">
                <a
                  className="nav-link text-active-primary pb-4"
                  data-bs-toggle="tab"
                  href="#sub_sub_menu"
                >
                  Sub Sub Menu
                </a>
              </li>
            </ul>

            <div className="tab-content" id="myTabContent">
              <div
                className="tab-pane fade active show"
                id="main_menu"
                role="tabpanel"
              >
                <div
                  className="d-flex justify-content-end"
                  data-kt-customer-table-toolbar="base"
                >
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#kt_modal_general"
                    onClick={() =>
                      setCreateMainMenu({
                        ...createMainMenu,
                        menu_name: "",
                        entry_id: "",
                      })
                    }
                  >
                    Add Main Menu
                  </button>
                </div>
                <AGTable data={mainMenuDatatable} />
              </div>

              <div className="tab-pane fade" id="sub_menu" role="tabpanel">
                <div
                  className="d-flex justify-content-end"
                  data-kt-customer-table-toolbar="base"
                >
                  <button
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target="#kt_modal_sub_menu"
                    className="btn btn-primary"
                    onClick={toggleAddSubMenu}
                  >
                    Add Sub Menu
                  </button>
                </div>


                <AGTable data={subMenuDatatable} />
              </div>

              <div className="tab-pane fade" id="sub_sub_menu" role="tabpanel">
                <div
                  className="d-flex justify-content-end"
                  data-kt-customer-table-toolbar="base"
                >
                  <button
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target="#kt_modal_sub_sub_menu"
                    className="btn btn-primary"
                    onClick={toggleAddSubSubMenu}
                  >
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
            <input
              type="text"
              id={"menu_name"}
              onChange={onMainMenuEdit}
              value={createMainMenu.menu_name}
              className={"form-control"}
              placeholder={"Enter the Main Menu Name"}
            />
          </div>

          <div className="form-group pt-2">
            <button
              onClick={onSubmitMainMenu}
              className="btn btn-primary w-100"
            >
              Submit
            </button>
          </div>
        </Modal>

        <Modal title={`${createSubMenu.entry_id === "" ? "Add" : "Update"} Sub Menu`} id="kt_modal_sub_menu" close="closeModalSubMenu">
          <div className="form-group">
            <label htmlFor="main_menu_id">Select Main Menu</label>
            <select
              id="main_menu_id"
              className="form-select"
              onChange={onSubMenuEdit}
              value={createSubMenu.main_menu_id}
            >
              <option value="">Select Main Menu</option>
              {mainMenuList.length > 0 &&
                mainMenuList.map((item, index) => (
                  <option key={index} value={item.EntryID}>
                    {item.MenuName}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group pt-3">
            <label htmlFor="sub_menu_name">Sub Menu Name</label>
            <input
              type="text"
              className="form-control"
              id="sub_menu_name"
              value={createSubMenu.sub_menu_name}
              onChange={onSubMenuEdit}
              placeholder="Enter the Sub Menu Name"
            />
          </div>

          <div className="form-group pt-3">
            <button onClick={onSubmitSubMenu} className="btn btn-primary w-100">
              {createSubMenu.entry_id === "" ? "Add" : "Update"} Sub Menu
            </button>
          </div>
        </Modal>

        <Modal title={`${createSubSubMenu.entry_id === "" ? "Add" : "Update"} Sub Sub Menu`} id="kt_modal_sub_sub_menu" large={true} close="closeModalSubSubMenu">
          <div className="form-group">
            <label htmlFor="main_menu_id">Select Main Menu</label>
            <select
              id="main_menu_id"
              className="form-select"
              onChange={onSubSubMenuEdit}
              value={createSubSubMenu.main_menu_id}
            >
              <option value="">Select Main Menu</option>
              {mainMenuList.length > 0 &&
                mainMenuList.map((item, index) => (
                  <option key={index} value={item.EntryID}>
                    {item.MenuName}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group pt-3">
            <label htmlFor="sub_menu_id">Select Sub Menu</label>
            <select
              id="sub_menu_id"
              className="form-select"
              onChange={onSubSubMenuEdit}
              value={createSubSubMenu.sub_menu_id}
            >
              <option value="">Select Sub Menu</option>
              {subMenuSelect.length > 0 &&
                subMenuSelect.map((item, index) => (
                  <option key={index} value={item.EntryID}>
                    {item.SubMenuName}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group pt-3">
            <label htmlFor="sub_sub_menu_name">Sub Sub Menu Name</label>
            <input
              type="text"
              className="form-control"
              id="sub_sub_menu_name"
              value={createSubSubMenu.sub_sub_menu_name}
              onChange={onSubSubMenuEdit}
              placeholder="Enter the Sub Sub Menu Name"
            />
          </div>

          <div className="form-group pt-3">
            <label htmlFor="sub_sub_menu_link">Sub Sub Menu Link</label>
            <input
              type="text"
              className="form-control"
              id="sub_sub_menu_link"
              value={createSubSubMenu.sub_sub_menu_link}
              onChange={onSubSubMenuEdit}
              placeholder="Enter the Sub Sub Menu Link"
            />
          </div>

          <div className="form-group pt-3">
            <label htmlFor="visibility">Select Visibility</label>
            <select
              id="visibility"
              className="form-select"
              onChange={onSubSubMenuEdit}
              value={createSubSubMenu.visibility}
            >
              <option value="1">Show</option>
              <option value="0">Hide</option>
            </select>
          </div>

          <div className="form-group pt-3">
            <button onClick={onSubmitSubSubMenu} className="btn btn-primary w-100">
              {createSubSubMenu.entry_id === "" ? "Add" : "Update"} Sub Sub Menu
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

const mapStateToProps = (state) =>
{
  return {
    loginData: state.LoginDetails,
  };
};

export default connect(mapStateToProps, null)(PermissionMenus);
