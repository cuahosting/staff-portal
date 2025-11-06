import { projectCode } from "../resources/constants";

export const setLoginDetails = (p) => {
  return {
    type: `SET_${projectCode}_LOGIN_DETAILS`,
    payload: p,
  };
};

export const setPermissionDetails = (p) => {
  return {
    type: `SET_${projectCode}_PERMISSION_DETAILS`,
    payload: p,
  };
};

export const setFacultyList = (p)=>{
  return{
    type:'SET_FACULTY_LIST',
    payload:p
  }
}

export const setDepartmentsList = (p) => {
  return {
    type: 'SET_DEPARTMENT_LIST',
    payload: p
  }
}

export const setCurrentSemester = (p)=>{
  return{
    type:'SET_CURRENT_SEMESTER',
    payload:p
  }
}

export const setgeneralDetails = (p) => {
  return {
    type: "SET_GENERALDETAILS_DETAILS",
    payload: p,
  };
};

export const setDashboardData = (p)=>{
  return{
    type: "SET_DASHBOARD_DATA",
    payload: p
  }
}
