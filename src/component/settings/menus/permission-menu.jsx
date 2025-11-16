import React from "react";
import PageHeader from "../../common/pageheader/pageheader";
import { connect } from "react-redux";
import MainMenuTab from "./MainMenuTab";
import SubMenuTab from "./SubMenuTab";
import SubSubMenuTab from "./SubSubMenuTab";

/**
 * PermissionMenus Component
 *
 * Main component that manages the menu permission system using a tabbed interface.
 * Each tab is an independent component handling its own CRUD operations:
 * - Main Menu: Top-level navigation items
 * - Sub Menu: Second-level navigation items
 * - Sub Sub Menu: Third-level navigation items with visibility control
 */
function PermissionMenus(props) {
  const token = props.loginData[0].token;
  const staffID = props.loginData[0].StaffID;

  return (
    <div className="d-flex flex-column flex-row-fluid">
      <PageHeader
        title={"Permission Menus"}
        items={["Settings", "Permission", "Menus"]}
      />
      <div className="flex-column-fluid">
        <div className="card">
          <div className="card-body pt-0">
            <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x border-0 fs-4 fw-bold mb-8">
              <li className="nav-item">
                <a
                  className="nav-link text-active-primary pb-4 active"
                  data-bs-toggle="tab"
                  href="#main_menu"
                >
                  <i className="fa fa-bars me-2" />
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
                  <i className="fa fa-list me-2" />
                  Sub Menu
                </a>
              </li>

              <li className="nav-item">
                <a
                  className="nav-link text-active-primary pb-4"
                  data-bs-toggle="tab"
                  href="#sub_sub_menu"
                >
                  <i className="fa fa-sitemap me-2" />
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
                <MainMenuTab token={token} staffID={staffID} />
              </div>

              <div className="tab-pane fade" id="sub_menu" role="tabpanel">
                <SubMenuTab token={token} staffID={staffID} />
              </div>

              <div className="tab-pane fade" id="sub_sub_menu" role="tabpanel">
                <SubSubMenuTab token={token} staffID={staffID} />
              </div>
            </div>
          </div>
        </div>
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
