import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import
{
  DepartmentListReducer,
  FacultyListReducer,
  LoginDetailsReducer,
  PermissionDetailsReducer,
  currentSemesterReducer, generalDetailsReducer, dashboardDaraReducer
} from "./detailsReducer";
import { shortCode } from "../resources/constants";

const rootReducer = combineReducers({
  LoginDetails: LoginDetailsReducer,
  PermissionDetails: PermissionDetailsReducer,
  FacultyList: FacultyListReducer,
  DepartmentList: DepartmentListReducer,
  currentSemester: currentSemesterReducer,
  generalDetails: generalDetailsReducer,
  DashBoardData: dashboardDaraReducer
});

const persistConfig = {
  key: shortCode.toLowerCase() + "_staff_",
  storage,
};

export default persistReducer(persistConfig, rootReducer);
