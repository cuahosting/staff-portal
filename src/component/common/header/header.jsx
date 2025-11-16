import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import { BrowserView, MobileView } from "react-device-detect";
import Navigation from "../navigation/navigation";
import { connect } from "react-redux";
import { useIdleTimer } from 'react-idle-timer';
import {
  setDepartmentsList,
  setFacultyList,
  setLoginDetails,
  setPermissionDetails,
  setCurrentSemester
} from "../../../actions/setactiondetails";
import axios from "axios";
import { serverLink } from "../../../resources/url";
import { projectLogo } from "../../../resources/constants";

function Header(props) {
  const token = props.loginData && props.loginData[0] ? props.loginData[0].token : null;
  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  };

  const SESSION_IDLE_MINUTES = 10;
  const handleOnIdle = (event) => {
    console.log('last active', getLastActiveTime())
    signOut();
  }

  const {getLastActiveTime } = useIdleTimer({
    timeout: 1000 * 60 * SESSION_IDLE_MINUTES,
    onIdle: handleOnIdle,
    debounce: 500,
  })

  useEffect(() => {
    getFaculty();
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  const getFaculty = async () => {
    if (!token) return;

    await axios
      .get(`${serverLink}staff/academics/faculty/list`, token)
      .then((result) => {
        if (result.data.length > 0) {
          props.setOnFacultyList(result.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching faculty:", error);
      });

    await axios
      .get(`${serverLink}staff/academics/department/list`, token)
      .then((result) => {
        if (result.data.length > 0) {
          props.setOnDepartmentList(result.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });

    axios.get(`${serverLink}staff/settings/dashboard/current_semester`, token)
      .then((result)=>{
        if (result.data && result.data[0]) {
          let semester = result.data[0].SemesterCode;
          props.setOnCurrentSemester(semester);
        }
      })
      .catch((error) => {
        console.error("Error fetching current semester:", error);
      });
  };

  const isMobile = width <= 768;

  const signOut = () => {
    props.setOnLoginDetails([]);
    props.setOnPermissionDetails([]);
  };

  return (
    <>
      <div id="kt_header" className="header hideSection">
        <div
          className="header-top d-flex align-items-stretch flex-grow-1 h-60px h-lg-100px"
          onClick={toggleDrawer}
          data-kt-sticky="true"
          data-kt-sticky-name="header-topbar"
          data-kt-sticky-offset="{default: '100px', lg: 'false'}"
          data-kt-sticky-dependencies="#kt_wrapper"
          data-kt-sticky-class="fixed-top bg-body shadow-sm border-0"
        >
          <div className="container-custom container-xxl d-flex w-100">
            <div className="d-flex flex-stack align-items-stretch w-100">
              <div className="d-flex align-items-center align-items-lg-stretch me-5">
                <button
                  className={`d-lg-none btn btn-icon btn-color-gray-500 btn-active-color-primary w-35px h-35px ms-n2 me-2`}
                  id="kt_header_navs_toggle"
                >
                  <span className="svg-icon svg-icon-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M21 7H3C2.4 7 2 6.6 2 6V4C2 3.4 2.4 3 3 3H21C21.6 3 22 3.4 22 4V6C22 6.6 21.6 7 21 7Z"
                        fill="currentColor"
                      />
                      <path
                        opacity="0.3"
                        d="M21 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14ZM22 20V18C22 17.4 21.6 17 21 17H3C2.4 17 2 17.4 2 18V20C2 20.6 2.4 21 3 21H21C21.6 21 22 20.6 22 20Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </button>
                <Link to={"/"}>
                  <img
                    alt="Logo"
                    src={projectLogo}
                    className="h-25px h-lg-100px"
                  />
                </Link>
              </div>
              <div className="topbar d-flex align-items-center flex-shrink-0">
                {/*begin::User*/}
                <div
                  className="d-flex align-items-center ms-2"
                  id="kt_header_user_menu_toggle"
                >
                  {/*begin::Menu- wrapper*/}
                  {/*begin::User icon(remove this button to use user avatar as menu toggle)*/}
                  <div
                    className="btn btn-icon btn-custom"
                    data-kt-menu-trigger="click"
                    data-kt-menu-attach="parent"
                    data-kt-menu-placement="bottom-end"
                  >
                    {/*begin::Svg Icon | path: icons/duotune/communication/com013.svg*/}
                    <span
                      className="fa fa-power-off"
                      title={"Sign out"}
                      onClick={signOut}
                    />
                    {/*end::Svg Icon*/}
                  </div>
                  {/*end::User icon*/}
                  {/*begin::User account menu*/}
                  <div
                    className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px"
                    data-kt-menu="true"
                  >
                    {/*begin::Menu item*/}
                    <div className="menu-item px-3">
                      <div className="menu-content d-flex align-items-center px-3">
                        {/*begin::Avatar*/}
                        <div className="symbol symbol-50px me-5">
                          <img
                            alt="Logo"
                            src="/assets/media/avatars/300-1.jpg"
                          />
                        </div>
                        {/*end::Avatar*/}
                      </div>
                    </div>
                  </div>
                  {/*end::User account menu*/}
                  {/*end::Menu wrapper*/}
                </div>
                {/*end::User */}

                {/*begin::Heaeder menu toggle*/}
                {/*end::Heaeder menu toggle*/}
              </div>
              {/*end::Topbar*/}
            </div>
            {/*end::Wrapper*/}
          </div>
          {/*end::Brand container*/}
        </div>

        {!isMobile ? (
          <Navigation />
        ) : (
          <Drawer open={isOpen} onClose={toggleDrawer} direction="left">
            <Navigation />
          </Drawer>
        )}
      </div>
    </>
  );
}
const mapStateToProps = (state) => {
  return {
    loginData: state.LoginDetails,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    setOnLoginDetails: (p) => {
      dispatch(setLoginDetails(p));
    },
    setOnPermissionDetails: (p) => {
      dispatch(setPermissionDetails(p));
    },
    setOnFacultyList: (p) => {
      dispatch(setFacultyList(p));
    },
    setOnDepartmentList: (p) => {
      dispatch(setDepartmentsList(p));
    },
    setOnCurrentSemester:(p)=>{
      dispatch(setCurrentSemester(p));
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Header);
