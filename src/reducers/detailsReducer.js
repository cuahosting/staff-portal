import { projectCode } from "../resources/constants";

export const LoginDetailsReducer = (state = [], action) => {
  switch (action.type) {
    case `SET_${projectCode}_LOGIN_DETAILS`:
      return action.payload;
    default:
      return state;
  }
};

export const PermissionDetailsReducer = (state = [], action) => {
  switch (action.type) {
    case `SET_${projectCode}_PERMISSION_DETAILS`:
      return action.payload;
    default:
      return state;
  }
};

export const FacultyListReducer = (state = [], action) => {
  switch (action.type) {
    case `SET_FACULTY_LIST`:
      return action.payload;
    default:
      return state;
  }
};

export const DepartmentListReducer = (state = [], action) => {
  switch (action.type) {
    case `SET_DEPARTMENT_LIST`:
      return action.payload;
    default:
      return state;
  }
};

export const currentSemesterReducer = (state='', action)=>{
  switch(action.type){
    case 'SET_CURRENT_SEMESTER':
      return action.payload;
      default:
        return state;
  }

}

export const generalDetailsReducer = (state = "", action) => {
  switch (action.type) {
    case "SET_GENERALDETAILS_DETAILS":
      return action.payload;

    default:
      return state;
  }
};


export const dashboardDaraReducer = (state=[], action)=>{
  switch(action.type){
    case "SET_DASHBOARD_DATA":
      return action.payload;
      default:
        return state;
  }
}