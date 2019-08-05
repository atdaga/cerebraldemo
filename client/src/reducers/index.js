import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import history from '../history';
import liveSupportReducer from './liveSupportReducer';

const mainReducer = combineReducers({
  liveSupport: liveSupportReducer,
  router: connectRouter(history),
});

// const initialState = mainReducer({}, {});

// Clear out redux store upon logout.
const rootReducer = (state, action) => {
  // if (action.type === LOGOUT) {
  //   return mainReducer({ ...initialState, router: state.router }, action);
  // }
  return mainReducer(state, action);
};

export default rootReducer;
