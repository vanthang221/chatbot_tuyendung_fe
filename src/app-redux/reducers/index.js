import { combineReducers } from "redux";

// reducers
import profile from "./profile";
import expireToken from "./expireToken";
import themeReducer from "./theme";

const rootReducer = combineReducers({
  profile,
  expireToken,
  themeReducer,
});

export default rootReducer;
