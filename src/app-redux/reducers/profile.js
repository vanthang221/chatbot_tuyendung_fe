import * as actions from "../../utils/constants/redux-actions";

const initState = {};

const profile = (state = initState, action) => {
  switch (action.type) {
    case actions.SET_PROFILE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default profile;
