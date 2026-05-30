import * as actions from "../../utils/constants/redux-actions";

const initState = {};

const expireToken = (state = initState, action) => {
  switch (action.type) {
    case actions.SET_TOKEN_EXPIRED_EMAIL:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default expireToken;
