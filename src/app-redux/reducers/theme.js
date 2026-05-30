import * as actions from "../../utils/constants/redux-actions";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  return savedTheme || "light";
};

const initState = {
  mode: getInitialTheme(),
};

const themeReducer = (state = initState, action) => {
  switch (action.type) {
    case actions.SET_THEME_MODE:
      localStorage.setItem("theme", action.payload);
      return {
        ...state,
        mode: action.payload,
      };
    default:
      return state;
  }
};

export default themeReducer;
