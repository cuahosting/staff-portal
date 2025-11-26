import React, { useEffect, useState } from "react";
import { Nav, NavDropdown } from "react-bootstrap";
import "./navigation.css";
import { useLocation, useNavigate } from "react-router";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {Audit} from "../../../resources/constants";
function Navigation(props) {
  const navigation = useNavigate();
  const location = useLocation();
  const [mainMenu, setMainMenu] = useState([]);
  const [subMenu, setSubMenu] = useState([]);
  const [currentTab, setCurrentTab] = useState("");
  const permissionList = props.permissionData;
  const header = props.loginData[0].token;

  useEffect(() => {
    if (props.permissionData.length > 0) {
      const menu_list = [
        ...new Set(props.permissionData.map((item) => item.MenuName)),
      ];
      console.log(menu_list)
      setMainMenu(menu_list.sort());
      let sub_menu_array = [];
      if (menu_list.length > 0) {
        menu_list.map((menu) => {
          let menu_item_array = [];
          permissionList
            .filter((i) => i.MenuName === menu)
            .map((perm) => {
              menu_item_array.push(perm);
            });
          sub_menu_array[menu] = [
            ...new Set(
              menu_item_array.map((item) => item.MenuName && item.SubMenuName)
            ),
          ];
        });
      }
      setSubMenu(sub_menu_array);
    }

    // if (location.pathname !== '/')
    //   Audit(props.loginData[0].StaffID, `Access: ${location.pathname}`, header)

  }, []);

  useEffect(() => {
    let current_tab = location.pathname.split("/")[1];
    if (current_tab.replace("-", " ")) setCurrentTab(current_tab);
  }, [location]);

  return (
    <>
      {/*begin::Tabs container*/}
      <div className="container-custom container-xxl d-lg-flex flex-column w-100">
        {/*begin::Header tabs*/}
        <div
          className="header-tabs d-flex align-items-stretch w-100 h-60px h-lg-100px overflow-auto mb-5 mb-lg-0"
          id="kt_header_tabs"
        >
          <ul className="nav nav-stretch flex-nowrap w-100 h-100">
            {mainMenu.length > 0 &&
              mainMenu.map((menu, index) => {
                console.log(menu)
                let is_active =
                  currentTab.toLowerCase() === menu.toLowerCase()
                    ? "active"
                    : "";
                return (
                  <li key={index} className="nav-item flex-equal">
                    <a
                      className={`nav-link d-flex flex-column text-nowrap flex-center w-100 ${is_active}`}
                      data-bs-toggle="tab"
                      href={`#kt_header_navs_tab_${menu
                        .replace(" ", "_")
                        .toLowerCase()}`}
                    >
                      <span className="text-uppercase text-dark fw-bolder fs-6 fs-lg-5">
                        {menu}
                      </span>
                    </a>
                  </li>
                );
              })}
          </ul>
        </div>
        {/*end::Header tabs*/}
      </div>
      {/*end::Tabs container*/}
      {/*begin::Header panel*/}
      <div
        className="d-flex align-items-stretch h-lg-70px"
        data-kt-sticky="true"
        data-kt-sticky-name="header-tabs"
        data-kt-sticky-offset="{default: 'false', lg: '300px'}"
        data-kt-sticky-dependencies="#kt_wrapper"
        data-kt-sticky-class="fixed-top bg-body shadow-sm border-0"
      >
        {/*begin::Panel container*/}
        <div className="container-custom container-xxl d-lg-flex flex-column w-100">
          {/*begin::Header navs*/}
          <div
            className="header-navs d-lg-flex flex-column justify-content-lg-center h-100 w-100"
            id="kt_header_navs_wrapper"
          >
            {/*begin::Header tab content*/}
            <div
              className="tab-content"
              data-kt-scroll="true"
              data-kt-scroll-activate="{default: true, lg: false}"
              data-kt-scroll-height="auto"
              data-kt-scroll-offset="70px"
            >
              {mainMenu.length > 0 &&
                mainMenu.map((menu, index) => {
                  let is_active =
                    currentTab.toLowerCase() === menu.toLowerCase()
                      ? "active show"
                      : "";

                  return (
                    <div
                      key={index}
                      className={`tab-pane fade ${is_active}`}
                      id={`kt_header_navs_tab_${menu
                        .replace(" ", "_")
                        .toLowerCase()}`}
                    >
                      <div className="header-menu d-flex flex-column align-items-start flex-lg-row">
                        {subMenu[menu].length > 0 &&
                          subMenu[menu].map((sub_menu, index) => {
                            return (
                              <Nav key={index}>
                                <NavDropdown
                                  title={
                                    <span className="fw-bold fs-6">
                                      {sub_menu}
                                    </span>
                                  }
                                >
                                    {permissionList.filter(
                                            (item) =>
                                                item.MenuName === menu &&
                                                item.SubMenuName === sub_menu
                                        ).length > 0 &&
                                        permissionList
                                            .filter(
                                                (item) =>
                                                    item.MenuName === menu &&
                                                    item.SubMenuName === sub_menu
                                            )
                                            .map((sub_sub_menu, index) => {
                                              if (sub_sub_menu.Visibility === 1) {
                                                return (
                                                    <NavDropdown.Item
                                                        key={index}
                                                        className="py-3 table-responsive"
                                                        onClick={() =>
                                                            navigation(
                                                                sub_sub_menu.SubSubMenuLink
                                                            )
                                                        }
                                                    >
                                                      {sub_sub_menu.SubSubMenuName}
                                                    </NavDropdown.Item>
                                                );
                                              }
                                            })}
                                </NavDropdown>
                              </Nav>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
const mapStateToProps = (state) => {
  return {
    permissionData: state.PermissionDetails,
    loginData: state.LoginDetails
  };
};
export default connect(mapStateToProps, null)(Navigation);
